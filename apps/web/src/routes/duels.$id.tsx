import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Share2 } from 'lucide-react'

import { useLang, useT } from '#/lib/i18n/LangProvider'
import { useSession } from '#/lib/auth/SessionProvider'
import { SessionError } from '#/components/SessionError'
import { recordAnsweredQuestion } from '#/lib/funnel/freePlay'
import { EV, track, trackInstall } from '#/lib/analytics'
import { playCorrect, playWrong } from '#/lib/game/sound'
import { TIME_PER_QUESTION_MS } from '#/lib/game/scoring'
import { QuizCard } from '#/components/game/QuizCard'
import { TimerRing } from '#/components/game/TimerRing'
import { APP_STORE_URL, PLAY_STORE_URL } from '#/lib/funnel/appLinks'
import { ShareScore } from '#/components/funnel/ShareScore'
import {
  DUEL_ROUNDS,
  claimOpenDuel,
  createQuickDuel,
  duelShareUrl,
  formatDuelQuestion,
  getDuel,
  submitDuelPlay,
} from '#/lib/game/duels'

import type {
  DuelAnswer,
  DuelPlayResult,
  DuelRow,
} from '#/lib/game/duels'
import type { GameQuestion } from '#/lib/game/questions'
import type { StringKey } from '#/lib/i18n/strings'

export const Route = createFileRoute('/duels/$id')({ component: DuelScreen })

const TIMER_SECONDS = Math.round(TIME_PER_QUESTION_MS / 1000)
const FEEDBACK_MS = 900

type Role = 'host' | 'guest'

type Phase =
  | 'loading'
  | 'notParticipant'
  | 'inviteAccept'
  | 'error'
  | 'playing'
  | 'result'

/** Whether an open duel is still claimable (pending, no guest, not expired). */
function isOpenClaimable(row: DuelRow): boolean {
  if (row.guest_id) return false
  if (row.status !== 'pending') return false
  if (row.expires_at && new Date(row.expires_at).getTime() <= Date.now()) {
    return false
  }
  return true
}

/** Localised category label, mirroring the inbox helper. */
function categoryLabel(t: (k: StringKey) => string, category: string | null): string {
  if (!category) return t('duels.new.random')
  const key = `category.${category}` as StringKey
  const label = t(key)
  return label === key ? category : label
}

/** Resolved end-state shown in the result view. */
interface ResultState {
  status: DuelPlayResult['status']
  myScore: number
  opponentScore: number | null
  winnerId: string | null
}

function DuelScreen() {
  const t = useT()
  const { id } = Route.useParams()
  const { userId, sessionReady, error: sessionFailed } = useSession()

  const [phase, setPhase] = useState<Phase>('loading')
  const [questions, setQuestions] = useState<GameQuestion[]>([])
  const [result, setResult] = useState<ResultState | null>(null)
  // Category shown on the invite-accept screen (outsider, open duel).
  const [inviteCategory, setInviteCategory] = useState<string | null>(null)
  // Set when the host has an open duel nobody has claimed yet → show share UI.
  const [hostShareOpen, setHostShareOpen] = useState(false)

  // Play state
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [remaining, setRemaining] = useState(TIMER_SECONDS)

  const roleRef = useRef<Role | null>(null)
  const answersRef = useRef<DuelAnswer[]>([])
  const startedAtRef = useRef(0)
  const questionStartRef = useRef(0)
  const submittedRef = useRef(false)

  // Loads the duel and decides which phase to show. Returns nothing; sets state.
  // Everything supabase/Date.now lives here (never in render) so SSR stays a
  // pure loading state. `cancelledRef` lets the unmount/refetch abort stale work.
  const cancelledRef = useRef(false)
  const load = useCallback(async () => {
    let row: DuelRow
    try {
      row = await getDuel(id)
    } catch (err) {
      // RLS blocks non-participants. But an OPEN duel (guest null) is readable
      // by anyone, so this only fires for genuinely private duels we can't see.
      console.error('getDuel failed', err)
      if (!cancelledRef.current) setPhase('notParticipant')
      return
    }
    if (cancelledRef.current) return

    const role: Role | null =
      userId === row.host_id
        ? 'host'
        : userId === row.guest_id
          ? 'guest'
          : null

    // Outsider on an open, claimable duel → show the invite-accept screen.
    if (!role) {
      if (isOpenClaimable(row)) {
        setInviteCategory(row.category)
        setPhase('inviteAccept')
      } else {
        setPhase('notParticipant')
      }
      return
    }
    roleRef.current = role

    // Host whose open duel hasn't been claimed yet → enable the share UI.
    setHostShareOpen(role === 'host' && isOpenClaimable(row))

    const myPlayedAt =
      role === 'host' ? row.host_played_at : row.guest_played_at
    const myScore = role === 'host' ? row.host_score : row.guest_score
    const opponentScore = role === 'host' ? row.guest_score : row.host_score
    const alreadyPlayed =
      !!myPlayedAt ||
      row.status === 'completed' ||
      row.status === 'awaiting_opponent' ||
      row.status === 'expired'

    if (alreadyPlayed) {
      setResult({
        status:
          row.status === 'completed'
            ? 'completed'
            : row.status === 'expired'
              ? 'expired'
              : 'awaiting_opponent',
        myScore,
        opponentScore: row.status === 'completed' ? opponentScore : null,
        winnerId: row.winner_id,
      })
      setPhase('result')
      return
    }

    const payload = row.questions_payload ?? []
    if (payload.length === 0) {
      setPhase('error')
      return
    }
    const formatted = payload.map((q) => formatDuelQuestion(q))
    startedAtRef.current = Date.now()
    questionStartRef.current = Date.now()
    setQuestions(formatted)
    setPhase('playing')
    track(EV.gameStarted, { mode: 'duel' })
  }, [id, userId])

  useEffect(() => {
    if (!sessionReady || !userId) return
    cancelledRef.current = false
    void load()
    return () => {
      cancelledRef.current = true
    }
  }, [load, sessionReady, userId])

  function finish() {
    if (submittedRef.current) return
    submittedRef.current = true

    const totalMs = startedAtRef.current ? Date.now() - startedAtRef.current : 0
    const answers = answersRef.current
    ;(async () => {
      const localScoreForEvent = answers.filter((a) => a.is_correct).length
      track(EV.gameFinished, { mode: 'duel', score: localScoreForEvent })
      try {
        const res = await submitDuelPlay(id, answers, totalMs)
        setResult({
          status: res.status,
          myScore: res.my_score,
          opponentScore: res.opponent_score,
          winnerId: res.winner_id,
        })
      } catch (err) {
        console.error('submitDuelPlay failed', err)
        // Fall back to a local-only summary so the player still sees their score.
        const localScore = answers.filter((a) => a.is_correct).length
        setResult({
          status: 'awaiting_opponent',
          myScore: localScore,
          opponentScore: null,
          winnerId: null,
        })
      } finally {
        setPhase('result')
      }
    })()
  }

  function resolve(chosen: number, currentQ: GameQuestion, nextScore: number) {
    const isCorrect = chosen === currentQ.correctIndex
    if (isCorrect) playCorrect()
    else playWrong()
    answersRef.current.push({
      question_id: currentQ.id,
      position: index,
      answer_idx: chosen,
      is_correct: isCorrect,
      time_ms: questionStartRef.current
        ? Date.now() - questionStartRef.current
        : 0,
    })
    setSelectedIndex(chosen)
    setScore(nextScore)
    recordAnsweredQuestion()

    window.setTimeout(() => {
      if (index + 1 >= questions.length) {
        finish()
      } else {
        setIndex((i) => i + 1)
        setSelectedIndex(null)
        setRemaining(TIMER_SECONDS)
        questionStartRef.current = Date.now()
      }
    }, FEEDBACK_MS)
  }

  function handleAnswer(chosen: number) {
    if (selectedIndex !== null) return
    const currentQ = questions.at(index)
    if (!currentQ) return
    const isCorrect = chosen === currentQ.correctIndex
    resolve(chosen, currentQ, score + (isCorrect ? 1 : 0))
  }

  // Per-question countdown; timeout resolves as a wrong answer (answer_idx -1).
  useEffect(() => {
    if (phase !== 'playing') return
    if (selectedIndex !== null) return
    const id2 = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(id2)
          const currentQ = questions.at(index)
          if (currentQ) resolve(-1, currentQ, score)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => window.clearInterval(id2)
    // `index` drives a fresh countdown per question; `resolve`/`score`/`questions`
    // are read fresh inside the interval without re-subscribing.
  }, [phase, selectedIndex, index])

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

  if (phase === 'notParticipant') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-bold text-fg">
          {t('duel.notParticipant.title')}
        </h1>
        <Link
          to="/duels"
          className="rounded-xl border border-white/15 px-5 py-3 font-medium text-fg/80 transition-colors hover:text-fg"
        >
          {t('duel.notParticipant.back')}
        </Link>
      </div>
    )
  }

  if (phase === 'inviteAccept') {
    return (
      <InviteAccept
        duelId={id}
        category={inviteCategory}
        onClaimed={() => {
          // Reload as the (now) guest, then fall into the play flow.
          setPhase('loading')
          void load()
        }}
      />
    )
  }

  if (phase === 'error') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-bold text-fg">{t('game.error.title')}</h1>
        <p className="text-fg/60">{t('game.error.subtitle')}</p>
        <Link
          to="/duels"
          className="rounded-xl border border-white/15 px-5 py-3 font-medium text-fg/80 transition-colors hover:text-fg"
        >
          {t('duel.result.back')}
        </Link>
      </div>
    )
  }

  if (phase === 'result' && result) {
    return (
      <DuelResult
        result={result}
        userId={userId}
        duelId={id}
        // Host whose open duel is still unclaimed → make sharing prominent even
        // after they've played their round (awaiting a friend, not a stranger).
        share={hostShareOpen ? <SharePanel duelId={id} /> : null}
      />
    )
  }

  // phase === 'playing'
  const currentQ = questions.at(index)
  if (!currentQ) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="animate-pulse text-fg/60">{t('game.loading')}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      {hostShareOpen ? <SharePanel duelId={id} /> : null}
      <div className="flex items-center justify-between gap-4">
        <TimerRing remaining={remaining} total={TIMER_SECONDS} size={72} />
        <span className="text-sm font-medium text-fg/60">
          {t('game.question')} {index + 1} / {DUEL_ROUNDS}
        </span>
        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-wide text-fg/50">
            {t('game.score')}
          </span>
          <span className="text-2xl font-bold tabular-nums text-primary">
            {score}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <QuizCard
          key={currentQ.id}
          question={currentQ}
          selectedIndex={selectedIndex}
          onAnswer={handleAnswer}
        />
      </AnimatePresence>
    </div>
  )
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

function DuelResult({
  result,
  userId,
  duelId,
  share,
}: {
  result: ResultState
  userId: string | null
  duelId: string
  /** Optional share panel rendered on the awaiting view (host open-duel case). */
  share?: React.ReactNode
}) {
  const t = useT()
  const firedRef = useRef(false)

  const completed = result.status === 'completed' || result.status === 'expired'
  const won = completed && !!result.winnerId && result.winnerId === userId
  const draw = completed && !result.winnerId
  const outcomeKey = won
    ? 'duels.outcome.won'
    : draw
      ? 'duels.outcome.draw'
      : 'duels.outcome.lost'

  // Outcome-aware viral share for the completed view.
  const shareMessageKey = won
    ? 'share.message.duel.won'
    : draw
      ? 'share.message.duel.draw'
      : 'share.message.duel.lost'
  const shareMessage = t(shareMessageKey)
    .replace('{myScore}', String(result.myScore))
    .replace('{oppScore}', String(result.opponentScore ?? 0))

  useEffect(() => {
    if (won && !firedRef.current) {
      firedRef.current = true
      void fireConfetti()
    }
  }, [won])

  if (!completed) {
    // awaiting_opponent / pending: I played, opponent hasn't.
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center"
      >
        <h1 className="text-2xl font-bold text-fg">
          {share
            ? t('duel.share.waiting.title')
            : t('duel.result.awaiting.title')}
        </h1>
        <div className="rounded-xl border border-white/10 bg-surface px-6 py-5">
          <p className="text-xs uppercase tracking-wide text-fg/50">
            {t('duel.result.you')}
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-primary">
            {result.myScore} / {DUEL_ROUNDS}
          </p>
        </div>
        <p className="text-sm text-fg/60">
          {share
            ? t('duel.share.waiting.subtitle')
            : t('duel.result.awaiting.subtitle')}
        </p>
        {share ? <div className="w-full">{share}</div> : null}
        <Link
          to="/duels"
          className="rounded-xl border border-white/15 px-5 py-3 font-medium text-fg/80 transition-colors hover:text-fg"
        >
          {t('duel.result.back')}
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center"
    >
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold text-fg">{t('duel.result.title')}</h1>
        <span
          className={
            'rounded-full px-4 py-1 text-sm font-extrabold uppercase tracking-wide ' +
            (won
              ? 'bg-success/20 text-success'
              : draw
                ? 'bg-white/10 text-fg'
                : 'bg-error/20 text-error')
          }
        >
          {t(outcomeKey)}
        </span>
      </div>

      <div className="grid w-full grid-cols-2 gap-3">
        <div className="rounded-xl border border-primary/40 bg-primary/10 p-4">
          <p className="text-xs uppercase tracking-wide text-fg/50">
            {t('duel.result.you')}
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-primary">
            {result.myScore}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-surface p-4">
          <p className="text-xs uppercase tracking-wide text-fg/50">
            {t('duel.result.opponent')}
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-fg">
            {result.opponentScore ?? 0}
          </p>
        </div>
      </div>

      <ShareScore message={shareMessage} url={duelShareUrl(duelId)} />

      <Link
        to="/duels"
        className="w-full rounded-xl border border-white/15 px-4 py-3 text-center font-medium text-fg/80 transition-colors hover:text-fg"
      >
        {t('duel.result.back')}
      </Link>
    </motion.div>
  )
}

/**
 * Invite-accept screen for an outsider visiting an open duel. Claims the duel on
 * tap; on success the parent reloads as the (now) guest and play begins. New
 * visitors also get a subtle app-install CTA to prime the funnel.
 */
function InviteAccept({
  duelId,
  category,
  onClaimed,
}: {
  duelId: string
  category: string | null
  onClaimed: () => void
}) {
  const t = useT()
  const navigate = useNavigate()
  const { lang } = useLang()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [taken, setTaken] = useState(false)

  const title = t('duel.invite.title').replace(
    '{category}',
    categoryLabel(t, category),
  )

  async function accept() {
    if (pending) return
    setPending(true)
    setError(null)
    try {
      const res = await claimOpenDuel(duelId)
      if (res.success) {
        track(EV.duelClaimed, { category: category ?? 'random' })
        onClaimed()
        return
      }
      if (res.message === 'already_taken') {
        setTaken(true)
        setError(t('duel.invite.alreadyTaken'))
      } else if (res.message === 'expired') {
        setError(t('duel.invite.expired'))
      } else if (res.message === 'not_found') {
        setError(t('duel.invite.notFound'))
      } else {
        setError(t('duel.invite.error'))
      }
    } catch (err) {
      console.error('claimOpenDuel failed', err)
      setError(t('duel.invite.error'))
    } finally {
      setPending(false)
    }
  }

  async function startQuick() {
    if (pending) return
    setPending(true)
    setError(null)
    try {
      const id = await createQuickDuel(category, lang)
      void navigate({ to: '/duels/$id', params: { id } })
    } catch (err) {
      console.error('createQuickDuel failed', err)
      setError(t('duels.createError'))
      setPending(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center"
    >
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold text-fg">{title}</h1>
        <p className="text-sm text-fg/60">{t('duel.invite.subtitle')}</p>
      </div>

      {error ? (
        <p
          role="alert"
          className="w-full rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-fg"
        >
          {error}
        </p>
      ) : null}

      {taken ? (
        <button
          type="button"
          onClick={startQuick}
          disabled={pending}
          className="w-full rounded-xl bg-primary px-5 py-3 font-bold text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {t('duel.invite.quickCta')}
        </button>
      ) : (
        <button
          type="button"
          onClick={accept}
          disabled={pending}
          className="w-full rounded-xl bg-primary px-5 py-3 font-bold text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? t('duel.invite.accepting') : t('duel.invite.accept')}
        </button>
      )}

      <InstallCta />
    </motion.div>
  )
}

/**
 * Prominent share affordance for the host's open duel: Web Share API when
 * available, otherwise a copy-link button with a "copied" confirmation. All
 * clipboard/navigator access is inside handlers, so this is SSR-safe.
 */
function SharePanel({ duelId }: { duelId: string }) {
  const t = useT()
  const url = duelShareUrl(duelId)
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    },
    [],
  )

  function flashCopied() {
    setCopied(true)
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setCopied(false), 2000)
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      flashCopied()
    } catch {
      // Clipboard can be blocked (permissions / insecure context); ignore.
    }
  }

  async function share() {
    // Guard: navigator.share is undefined on desktop / SSR.
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ text: t('duel.share.text'), url })
        return
      } catch {
        // User dismissed or share failed → fall back to copy.
      }
    }
    void copy()
  }

  return (
    <div className="flex w-full flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-bg px-3 py-2">
        <span className="min-w-0 flex-1 truncate text-left text-sm text-fg/70">
          {url}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-fg transition-colors hover:border-primary/60"
        >
          {copied ? (
            <Check className="h-4 w-4 text-success" aria-hidden="true" />
          ) : null}
          {copied ? t('duel.share.copied') : t('duel.share.copy')}
        </button>
      </div>
      <button
        type="button"
        onClick={share}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-bg transition-opacity hover:opacity-90"
      >
        <Share2 className="h-5 w-5" aria-hidden="true" />
        {t('duel.share.cta')}
      </button>
    </div>
  )
}

/** Subtle app-install CTA shown to new visitors landing on an invite. */
function InstallCta() {
  const t = useT()
  return (
    <div className="mt-2 w-full rounded-2xl border border-white/10 bg-surface p-5 text-center">
      <p className="text-sm font-semibold text-fg">
        {t('duel.invite.installTitle')}
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackInstall('ios', 'duel_invite')}
          className="rounded-xl bg-fg px-4 py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
        >
          {t('promo.appStore')}
        </a>
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackInstall('android', 'duel_invite')}
          className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-fg transition-colors hover:bg-white/5"
        >
          {t('promo.googlePlay')}
        </a>
      </div>
    </div>
  )
}
