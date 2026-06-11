import { useEffect, useRef, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'

import { useLang, useT } from '#/lib/i18n/LangProvider'
import { useSession } from '#/lib/auth/SessionProvider'
import { SessionError } from '#/components/SessionError'
import { recordAnsweredQuestion } from '#/lib/funnel/freePlay'
import { EV, track, trackInstall } from '#/lib/analytics'
import { playCorrect, playWrong } from '#/lib/game/sound'
import { APP_STORE_URL, PLAY_STORE_URL, SITE_URL  } from '#/lib/funnel/appLinks'
import { TIME_PER_QUESTION_MS } from '#/lib/game/scoring'
import { QuizCard } from '#/components/game/QuizCard'
import { TimerRing } from '#/components/game/TimerRing'
import { ShareScore } from '#/components/funnel/ShareScore'
import {
  formatWeeklyQuestion,
  getChallengeById,
  getChallengeQuestions,
  getMyProgress,
  getWeeklyLeaderboard,
  isReplayable,
  startReplay,
  submitReplayAnswer,
  submitWeeklyAnswer,
  themeLabel,
} from '#/lib/game/weekly'

import type {
  WeeklyChallenge,
  WeeklyGameQuestion,
  WeeklyLeaderRow,
  WeeklyProgress,
  WeeklyQuestionRow,
} from '#/lib/game/weekly'

export const Route = createFileRoute('/weekly/$id')({ component: WeeklyScreen })

const TIMER_SECONDS = Math.round(TIME_PER_QUESTION_MS / 1000)
/** Minimum time the learning fact stays before auto-advancing (ms). */
const LEARN_MS = 1500

type Phase = 'loading' | 'notFound' | 'error' | 'playing' | 'complete'

/** Final summary shown in the completed view. */
interface CompleteState {
  correctCount: number
  finalScore: number | null
  total: number
  dayStreak: number
  perfect: boolean
  /** True when this run was a no-XP replay of a past challenge. */
  replay: boolean
  /** The user's original (live) score, when they played the challenge. */
  originalScore: number | null
}

function WeeklyScreen() {
  const t = useT()
  const { lang } = useLang()
  const { id } = Route.useParams()
  const { userId, sessionReady, error: sessionFailed } = useSession()

  const [phase, setPhase] = useState<Phase>('loading')
  const [challenge, setChallenge] = useState<WeeklyChallenge | null>(null)
  const [questions, setQuestions] = useState<WeeklyQuestionRow[]>([])
  const [complete, setComplete] = useState<CompleteState | null>(null)

  // Play state. `index` is the 0-based question index; the 1-based position to
  // submit is always `index + 1` (strict-sequential contract).
  const [index, setIndex] = useState(0)
  const [correctSoFar, setCorrectSoFar] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [remaining, setRemaining] = useState(TIMER_SECONDS)
  const [showFact, setShowFact] = useState(false)

  // The deterministically-shuffled current question (computed in an effect so
  // SSR stays a pure loading state and Math.random never runs on the server).
  const [current, setCurrent] = useState<WeeklyGameQuestion | null>(null)

  // Replay mode (archived/closed challenge): session id + the user's original
  // live score for the side-by-side on the result screen. `null` = live play.
  const [replayId, setReplayId] = useState<string | null>(null)
  const [originalScore, setOriginalScore] = useState<number | null>(null)

  // Positions we've already submitted, to guard against double-submit.
  const submittedRef = useRef<Set<number>>(new Set())
  const advancingRef = useRef(false)

  // ----- Load: challenge meta + questions + progress, then decide resume -----
  useEffect(() => {
    if (!sessionReady || !userId) return
    let cancelled = false
    const isCancelled = () => cancelled
    ;(async () => {
      let meta: WeeklyChallenge | null
      let rows: WeeklyQuestionRow[]
      let progress: WeeklyProgress | null
      try {
        ;[meta, rows, progress] = await Promise.all([
          getChallengeById(id),
          getChallengeQuestions(id),
          getMyProgress(id),
        ])
      } catch (err) {
        console.error('weekly load failed', err)
        if (!isCancelled()) setPhase('error')
        return
      }
      if (isCancelled()) return

      if (!meta || meta.status === 'upcoming') {
        setPhase('notFound')
        return
      }
      if (rows.length === 0) {
        setPhase('error')
        return
      }

      setChallenge(meta)
      setQuestions(rows)

      const total = meta.total_questions || rows.length

      // Past challenge → no-XP replay: open a fresh session and start at Q1.
      if (isReplayable(meta.status)) {
        let session: string
        try {
          session = await startReplay(id)
        } catch (err) {
          console.error('startReplay failed', err)
          if (!isCancelled()) setPhase('error')
          return
        }
        if (isCancelled()) return
        setReplayId(session)
        setOriginalScore(progress?.correct_count ?? null)
        setIndex(0)
        setCorrectSoFar(0)
        setPhase('playing')
        track(EV.gameStarted, { mode: 'weekly_replay' })
        return
      }

      const done = progress?.current_position ?? 0

      if (progress?.completed_at || done >= total) {
        setComplete(buildComplete(progress, total))
        setPhase('complete')
        return
      }

      setIndex(done)
      setCorrectSoFar(progress?.correct_count ?? 0)
      setPhase('playing')
      track(EV.gameStarted, { mode: 'weekly' })
    })()
    return () => {
      cancelled = true
    }
  }, [id, sessionReady, userId])

  // ----- Format the current question whenever the index advances -----
  useEffect(() => {
    if (phase !== 'playing') return
    const row = questions.at(index)
    if (!row) return
    setCurrent(
      formatWeeklyQuestion(row, lang, Math.random, challenge?.target_category),
    )
    setSelectedIndex(null)
    setShowFact(false)
    setRemaining(TIMER_SECONDS)
  }, [phase, index, questions, lang, challenge])

  // ----- Per-question countdown; timeout resolves as a wrong answer -----
  useEffect(() => {
    if (phase !== 'playing') return
    if (selectedIndex !== null) return
    if (!current) return
    const timer = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(timer)
          handleAnswer(-1)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
    // `index`/`current` drive a fresh countdown per question; `handleAnswer`
    // reads fresh state without re-subscribing.
  }, [phase, selectedIndex, index, current])

  function handleAnswer(chosen: number) {
    if (selectedIndex !== null) return
    if (!current) return
    const isCorrect = chosen === current.correctIndex
    if (isCorrect) playCorrect()
    else playWrong()
    setSelectedIndex(chosen)
    setShowFact(true)
    if (isCorrect) setCorrectSoFar((c) => c + 1)
    recordAnsweredQuestion()

    // Submit in strict order: 1-based position = index + 1.
    void submitAndAdvance(index + 1, isCorrect)
  }

  /**
   * Submits the answer for `position` (1-based), then advances. On the strict
   * "expected position N, got M" error, refetch progress and resync so a stale
   * client index self-heals instead of getting stuck. Replays submit to their
   * own session RPC and never resync (a replay session can't be resumed).
   */
  async function submitAndAdvance(position: number, isCorrect: boolean) {
    if (!submittedRef.current.has(position)) {
      submittedRef.current.add(position)
      try {
        if (replayId) {
          await submitReplayAnswer(replayId, position, isCorrect)
        } else {
          await submitWeeklyAnswer(id, position, isCorrect)
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (!replayId && msg.includes('expected position')) {
          // Resync from the server's view of progress.
          submittedRef.current.delete(position)
          await resyncFromProgress()
          return
        }
        console.error('weekly submit failed', err)
        // Non-fatal: keep playing locally so the user isn't blocked.
      }
    }

    const total = challenge?.total_questions || questions.length
    // Give the learning beat a moment, then advance.
    window.setTimeout(() => {
      if (advancingRef.current) return
      advancingRef.current = true
      if (position >= total) {
        finishLocally()
      } else {
        setIndex(position) // next 0-based index === just-submitted 1-based position
      }
      advancingRef.current = false
    }, LEARN_MS)
  }

  /** Reloads progress and either jumps to the right index or shows completion. */
  async function resyncFromProgress() {
    let progress: WeeklyProgress | null
    try {
      progress = await getMyProgress(id)
    } catch {
      return
    }
    const total = challenge?.total_questions || questions.length
    const done = progress?.current_position ?? 0
    if (progress?.completed_at || done >= total) {
      setComplete(buildComplete(progress, total))
      setPhase('complete')
      return
    }
    setCorrectSoFar(progress?.correct_count ?? 0)
    setIndex(done)
  }

  /** Builds the completed view from the freshest progress we can fetch. */
  function finishLocally() {
    const total = challenge?.total_questions || questions.length
    track(EV.gameFinished, {
      mode: replayId ? 'weekly_replay' : 'weekly',
      score: correctSoFar,
    })

    // Replays end on local state: no XP, no streak, original score alongside.
    if (replayId) {
      setComplete({
        correctCount: correctSoFar,
        finalScore: null,
        total,
        dayStreak: 0,
        perfect: total > 0 && correctSoFar >= total,
        replay: true,
        originalScore,
      })
      setPhase('complete')
      return
    }
    ;(async () => {
      let progress: WeeklyProgress | null = null
      try {
        progress = await getMyProgress(id)
      } catch {
        // Fall back to local counts below.
      }
      setComplete(
        progress
          ? buildComplete(progress, total)
          : {
              correctCount: correctSoFar,
              finalScore: null,
              total,
              dayStreak: 0,
              perfect: correctSoFar >= total,
              replay: false,
              originalScore: null,
            },
      )
      setPhase('complete')
    })()
  }

  if (sessionReady && sessionFailed) {
    return <SessionError />
  }

  if (phase === 'loading') {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="animate-pulse text-fg/60">{t('game.loading')}</p>
      </div>
    )
  }

  if (phase === 'notFound') {
    return (
      <CenteredMessage
        title={t('weekly.notFound.title')}
        backLabel={t('weekly.back')}
      />
    )
  }

  if (phase === 'error') {
    return (
      <CenteredMessage
        title={t('game.error.title')}
        subtitle={t('game.error.subtitle')}
        backLabel={t('weekly.back')}
      />
    )
  }

  if (phase === 'complete' && complete) {
    return (
      <WeeklyComplete
        challengeId={id}
        state={complete}
        userId={userId}
        challengeName={challenge ? themeLabel(challenge, lang) : 'BIGHEAD'}
      />
    )
  }

  // phase === 'playing'
  if (!current || !challenge) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="animate-pulse text-fg/60">{t('game.loading')}</p>
      </div>
    )
  }

  const total = challenge.total_questions || questions.length

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/weekly"
          className="text-sm text-fg/50 transition-colors hover:text-fg"
        >
          ← {themeLabel(challenge, lang)}
        </Link>
        <div className="flex items-center gap-2">
          {replayId ? (
            <span className="rounded-full bg-accent2/15 px-2.5 py-0.5 text-[11px] font-semibold text-accent2">
              {t('weekly.replay.badge')}
            </span>
          ) : null}
          <span className="text-sm font-medium text-fg/60">
            {index + 1} / {total}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <TimerRing remaining={remaining} total={TIMER_SECONDS} size={64} />
        <div className="flex flex-col items-end">
          <span className="text-xs uppercase tracking-wide text-fg/50">
            {t('game.score')}
          </span>
          <span className="text-2xl font-bold tabular-nums text-primary">
            {correctSoFar}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <QuizCard
          key={current.id}
          question={current}
          selectedIndex={selectedIndex}
          onAnswer={handleAnswer}
        />
      </AnimatePresence>

      <AnimatePresence>
        {showFact && current.learningFact ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="rounded-2xl border border-accent2/30 bg-accent2/10 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-accent2">
              {t('weekly.learn.title')}
            </p>
            <p className="mt-1 text-sm text-fg/80">{current.learningFact}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

/** Maps a progress row into the completed-view summary. */
function buildComplete(
  progress: WeeklyProgress | null,
  total: number,
): CompleteState {
  const correctCount = progress?.correct_count ?? 0
  return {
    correctCount,
    finalScore: progress?.final_score ?? null,
    total,
    dayStreak: progress?.day_streak ?? 0,
    perfect: total > 0 && correctCount >= total,
    replay: false,
    originalScore: null,
  }
}

/** Fires a one-shot confetti burst. Dynamically imported so it never runs on the server. */
async function fireConfetti(): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    const confetti = (await import('canvas-confetti')).default
    confetti({
      particleCount: 140,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00c2cc', '#d946ef', '#A16EFF', '#22c55e'],
    })
  } catch {
    // Confetti is decorative; ignore failures.
  }
}

function WeeklyComplete({
  challengeId,
  state,
  userId,
  challengeName,
}: {
  challengeId: string
  state: CompleteState
  userId: string | null
  challengeName: string
}) {
  const t = useT()
  const firedRef = useRef(false)

  const shareMessage = t('share.message.weekly')
    .replace('{correct}', String(state.correctCount))
    .replace('{total}', String(state.total))
    .replace('{theme}', challengeName)

  const [board, setBoard] = useState<WeeklyLeaderRow[] | null>(null)
  const [boardError, setBoardError] = useState(false)

  useEffect(() => {
    if (state.perfect && !firedRef.current) {
      firedRef.current = true
      void fireConfetti()
    }
  }, [state.perfect])

  useEffect(() => {
    let cancelled = false
    const isCancelled = () => cancelled
    ;(async () => {
      try {
        const rows = await getWeeklyLeaderboard(challengeId, 100)
        if (!isCancelled()) setBoard(rows)
      } catch (err) {
        console.error('getWeeklyLeaderboard failed', err)
        if (!isCancelled()) setBoardError(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [challengeId])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center"
    >
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold text-fg">
          {state.replay ? t('weekly.replay.result.title') : t('weekly.result.title')}
        </h1>
        {state.replay ? (
          <span className="rounded-full bg-accent2/15 px-3 py-0.5 text-xs font-semibold text-accent2">
            {t('weekly.replay.badge')}
          </span>
        ) : null}
        {state.perfect ? (
          <motion.span
            initial={{ scale: 0.5, rotate: -6 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 14 }}
            className="rounded-full bg-accent px-4 py-1 text-sm font-extrabold uppercase tracking-wide text-fg"
          >
            {t('weekly.result.perfect')}
          </motion.span>
        ) : null}
      </div>

      <div className="grid w-full grid-cols-2 gap-3">
        <Stat
          label={t('weekly.result.correct')}
          value={`${state.correctCount} / ${state.total}`}
          highlight
        />
        {state.replay ? (
          <Stat
            label={t('weekly.replay.original')}
            value={
              state.originalScore !== null
                ? `${state.originalScore} / ${state.total}`
                : '—'
            }
          />
        ) : state.finalScore !== null ? (
          <Stat label={t('weekly.result.score')} value={state.finalScore} />
        ) : (
          <Stat label={t('weekly.result.streak')} value={state.dayStreak} />
        )}
      </div>

      <ShareScore
        message={shareMessage}
        url={`${SITE_URL}/weekly/${challengeId}`}
      />

      <Leaderboard board={board} error={boardError} userId={userId} />

      <div className="mt-2 w-full rounded-2xl border border-white/10 bg-surface p-5">
        <p className="font-bold text-fg">{t('weekly.cta.title')}</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackInstall('ios', 'weekly_result')}
            className="flex-1 rounded-xl bg-fg px-4 py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
          >
            {t('promo.appStore')}
          </a>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackInstall('android', 'weekly_result')}
            className="flex-1 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-fg transition-colors hover:bg-white/5"
          >
            {t('promo.googlePlay')}
          </a>
        </div>
      </div>

      <Link
        to="/weekly"
        className="w-full rounded-xl border border-white/15 px-4 py-3 text-center font-medium text-fg/80 transition-colors hover:text-fg"
      >
        {t('weekly.back')}
      </Link>
    </motion.div>
  )
}

function Leaderboard({
  board,
  error,
  userId,
}: {
  board: WeeklyLeaderRow[] | null
  error: boolean
  userId: string | null
}) {
  const t = useT()

  return (
    <section className="w-full">
      <h2 className="mb-2 text-left text-xs font-semibold uppercase tracking-wide text-fg/50">
        {t('weekly.leaderboard.title')}
      </h2>
      {error ? (
        <p className="rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-fg">
          {t('lb.error')}
        </p>
      ) : board === null ? (
        <div
          className="h-24 animate-pulse rounded-xl border border-white/10 bg-surface"
          aria-hidden="true"
        />
      ) : board.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-surface p-4 text-sm text-fg/60">
          {t('weekly.leaderboard.empty')}
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {board.slice(0, 10).map((row) => {
            const isYou = !!userId && row.user_id === userId
            const name = row.username.trim()
              ? row.username
              : t('weekly.leaderboard.anon')
            return (
              <li
                key={row.user_id}
                className={
                  'flex items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm ' +
                  (isYou
                    ? 'border-primary/50 bg-primary/10'
                    : 'border-white/10 bg-surface')
                }
              >
                <span className="w-6 shrink-0 text-center font-bold tabular-nums text-fg/60">
                  {row.rank}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium text-fg">
                  {isYou ? t('weekly.leaderboard.you') : name}
                </span>
                <span className="shrink-0 font-bold tabular-nums text-primary">
                  {row.correct_count}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string | number
  highlight?: boolean
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface p-4">
      <p className="text-xs uppercase tracking-wide text-fg/50">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold tabular-nums ${
          highlight ? 'text-primary' : 'text-fg'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function CenteredMessage({
  title,
  subtitle,
  backLabel,
}: {
  title: string
  subtitle?: string
  backLabel: string
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
      <h1 className="text-2xl font-bold text-fg">{title}</h1>
      {subtitle ? <p className="text-fg/60">{subtitle}</p> : null}
      <Link
        to="/weekly"
        className="rounded-xl border border-white/15 px-5 py-3 font-medium text-fg/80 transition-colors hover:text-fg"
      >
        {backLabel}
      </Link>
    </div>
  )
}
