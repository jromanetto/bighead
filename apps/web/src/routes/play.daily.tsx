import { useEffect, useRef, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'

import { useLang, useT } from '#/lib/i18n/LangProvider'
import { useSession } from '#/lib/auth/SessionProvider'
import { getBrowserClient } from '#/lib/supabase/client'
import { getMyStreak } from '#/lib/profile/streak'
import { AccountPrompt } from '#/components/funnel/AccountPrompt'
import { SessionError } from '#/components/SessionError'
import {
  getDailyQuestions,
  hasPlayedToday,
  submitDailyResult,
} from '#/lib/game/daily'
import { awardXp } from '#/lib/game/results'
import { playCorrect, playWrong } from '#/lib/game/sound'
import { recordAnsweredQuestion } from '#/lib/funnel/freePlay'
import { TIME_PER_QUESTION_MS } from '#/lib/game/scoring'
import { QuizCard } from '#/components/game/QuizCard'
import { TimerRing } from '#/components/game/TimerRing'
import { ResultScreen } from '#/components/game/ResultScreen'

import type { GameQuestion } from '#/lib/game/questions'

export const Route = createFileRoute('/play/daily')({ component: DailyScreen })

const TIMER_SECONDS = Math.round(TIME_PER_QUESTION_MS / 1000)
const TOTAL_QUESTIONS = 5
/** Feedback window after an answer (or timeout) before advancing. */
const FEEDBACK_MS = 1000

type Phase = 'loading' | 'played' | 'playing' | 'error' | 'finished'

/** Today's date as a local `YYYY-MM-DD` string, used for the XP dedupe key. */
function todayISO(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function DailyScreen() {
  const t = useT()
  const { lang, ready } = useLang()
  const { userId, sessionReady, error: sessionFailed } = useSession()

  const [phase, setPhase] = useState<Phase>('loading')
  const [previousScore, setPreviousScore] = useState<number | undefined>(
    undefined,
  )
  const [questions, setQuestions] = useState<GameQuestion[]>([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [remaining, setRemaining] = useState(TIMER_SECONDS)

  const startedAtRef = useRef(0)
  const submittedRef = useRef(false)

  // Load: skip if already played today, else fetch the 5 daily questions.
  // Wait for the client language to resolve post-hydration so questions are
  // fetched in the language the UI shows (not the SSR default 'fr'), and for an
  // anonymous session (`userId`) since daily data is user-scoped.
  useEffect(() => {
    if (!ready) return
    if (!sessionReady || !userId) return
    let cancelled = false
    // Read through a function so TS does not narrow `cancelled` across awaits.
    const isCancelled = () => cancelled
    ;(async () => {
      try {
        const { played, score: prev } = await hasPlayedToday()
        if (isCancelled()) return
        if (played) {
          setPreviousScore(prev)
          setPhase('played')
          return
        }
        const qs = await getDailyQuestions(lang)
        if (isCancelled()) return
        if (qs.length === 0) {
          setPhase('error')
          return
        }
        startedAtRef.current = Date.now()
        setQuestions(qs)
        setPhase('playing')
      } catch (err) {
        console.error('daily load failed', err)
        if (!isCancelled()) setPhase('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [ready, sessionReady, userId, lang])

  // Finalize: submit result + award XP exactly once.
  function finish(finalScore: number) {
    if (submittedRef.current) return
    submittedRef.current = true
    setPhase('finished')

    const totalMs = startedAtRef.current
      ? Date.now() - startedAtRef.current
      : 0
    const perfect = finalScore === TOTAL_QUESTIONS

    void submitDailyResult(finalScore, totalMs).catch((err) =>
      console.error('submitDailyResult failed', err),
    )
    void awardXp(
      finalScore * 15 + (perfect ? 100 : 0),
      'daily',
      { correct: finalScore, total: TOTAL_QUESTIONS, perfect },
      'daily_brain_' + todayISO(),
    ).catch((err) => console.error('daily awardXp failed', err))
  }

  // Resolve the current question: update score, then schedule advance.
  function resolve(chosen: number, nextScore: number) {
    setSelectedIndex(chosen)
    setScore(nextScore)
    // Count this resolved question (answer or timeout) for the free-play gate.
    recordAnsweredQuestion()
    window.setTimeout(() => {
      if (index + 1 >= questions.length) {
        finish(nextScore)
      } else {
        setIndex((i) => i + 1)
        setSelectedIndex(null)
        setRemaining(TIMER_SECONDS)
      }
    }, FEEDBACK_MS)
  }

  function handleAnswer(chosen: number) {
    if (selectedIndex !== null) return
    const currentQ = questions.at(index)
    if (!currentQ) return
    const isCorrect = chosen === currentQ.correctIndex
    if (isCorrect) playCorrect()
    else playWrong()
    resolve(chosen, score + (isCorrect ? 1 : 0))
  }

  // Countdown for the current question; timeout counts as wrong.
  useEffect(() => {
    if (phase !== 'playing') return
    if (selectedIndex !== null) return
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(id)
          // Timed out: resolve as wrong (no point), keep current score.
          playWrong()
          resolve(-1, score)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
    // `index` drives a new countdown per question; `resolve`/`score` are
    // intentionally read fresh inside the interval without re-subscribing.
  }, [phase, selectedIndex, index])

  // Session couldn't be established (e.g. rate limit): offer a retry.
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

  if (phase === 'played') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-5 text-center">
        <h1 className="text-2xl font-bold text-fg">
          {t('daily.alreadyPlayed.title')}
        </h1>
        <p className="text-fg/60">{t('daily.alreadyPlayed.subtitle')}</p>
        {previousScore !== undefined ? (
          <div className="rounded-xl border border-white/10 bg-surface p-5">
            <p className="text-xs uppercase tracking-wide text-fg/50">
              {t('daily.yourScore')}
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-primary">
              {previousScore} / {TOTAL_QUESTIONS}
            </p>
          </div>
        ) : null}
        <StreakNudge />
        <Link
          to="/play"
          className="rounded-xl border border-white/15 px-5 py-3 font-medium text-fg/80 transition-colors hover:text-fg"
        >
          {t('daily.back')}
        </Link>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-bold text-fg">{t('game.error.title')}</h1>
        <p className="text-fg/60">{t('game.error.subtitle')}</p>
        <Link
          to="/play"
          className="rounded-xl border border-white/15 px-5 py-3 font-medium text-fg/80 transition-colors hover:text-fg"
        >
          {t('daily.back')}
        </Link>
      </div>
    )
  }

  if (phase === 'finished') {
    return (
      <div className="flex flex-col gap-6">
        <DailyComeBack />
        <ResultScreen
          title={t('daily.title')}
          score={score}
          correct={score}
          total={TOTAL_QUESTIONS}
          perfect={score === TOTAL_QUESTIONS}
        />
      </div>
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
      <div className="flex items-center justify-between gap-4">
        <TimerRing remaining={remaining} total={TIMER_SECONDS} size={72} />
        <span className="text-sm font-medium text-fg/60">
          {t('game.question')} {index + 1} / {TOTAL_QUESTIONS}
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

/** Resolves whether the current session is anonymous (client-only). */
function useIsAnonymous(): boolean | null {
  const [anon, setAnon] = useState<boolean | null>(null)
  useEffect(() => {
    let cancelled = false
    void getBrowserClient()
      .auth.getUser()
      .then(({ data }) => {
        if (!cancelled) setAnon(data.user?.is_anonymous ?? false)
      })
    return () => {
      cancelled = true
    }
  }, [])
  return anon
}

/**
 * "Keep your streak" nudge. Fetches the streak client-side and renders nothing
 * until resolved (SSR/hydration-safe). Shows the active-streak line when > 0,
 * else a gentle prompt to start a streak.
 */
function StreakNudge() {
  const t = useT()
  const { userId, sessionReady } = useSession()
  const { data: streak } = useQuery({
    queryKey: ['streak'],
    queryFn: getMyStreak,
    enabled: sessionReady && Boolean(userId),
  })

  if (streak === undefined) return null
  return (
    <p className="text-sm text-fg/70">
      {streak > 0
        ? `🔥 ${t('streak.daily.active').replace('{n}', String(streak))}`
        : t('streak.daily.empty')}
    </p>
  )
}

/**
 * Come-back hook on the daily completed view: a "come back tomorrow" line, the
 * current streak nudge, and — for anonymous users — a CTA to create an account
 * so their streak isn't lost. The streak query is refetched here so it reflects
 * the just-submitted result. Renders only client-resolved data (no hydration
 * mismatch since this view only ever appears post-mount).
 */
function DailyComeBack() {
  const t = useT()
  const { userId, sessionReady } = useSession()
  const isAnonymous = useIsAnonymous()
  const [promptOpen, setPromptOpen] = useState(false)

  const { data: streak } = useQuery({
    queryKey: ['streak'],
    queryFn: getMyStreak,
    enabled: sessionReady && Boolean(userId),
  })

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-primary/30 bg-primary/5 p-5 text-center">
      {streak !== undefined && streak > 0 ? (
        <p className="text-sm font-medium text-fg">
          🔥 {t('streak.daily.active').replace('{n}', String(streak))}
        </p>
      ) : streak !== undefined ? (
        <p className="text-sm text-fg/70">{t('streak.daily.empty')}</p>
      ) : null}

      <p className="mt-1 text-sm text-fg/70">{t('daily.comeBack')}</p>

      {isAnonymous ? (
        <>
          <button
            type="button"
            onClick={() => setPromptOpen(true)}
            className="mt-3 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-bold text-bg transition-opacity hover:opacity-90"
          >
            {t('daily.comeBack.cta')}
          </button>
          <AccountPrompt open={promptOpen} onClose={() => setPromptOpen(false)} />
        </>
      ) : null}
    </div>
  )
}
