import { useEffect, useRef, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { AnimatePresence } from 'framer-motion'

import { useLang, useT } from '#/lib/i18n/LangProvider'
import {
  getDailyQuestions,
  hasPlayedToday,
  submitDailyResult,
} from '#/lib/game/daily'
import { awardXp } from '#/lib/game/results'
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
  const { lang } = useLang()

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
  useEffect(() => {
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
  }, [lang])

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
      <ResultScreen
        title={t('daily.title')}
        score={score}
        correct={score}
        total={TOTAL_QUESTIONS}
        perfect={score === TOTAL_QUESTIONS}
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
