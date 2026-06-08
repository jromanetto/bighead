import { useEffect, useRef, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'

import { useT } from '#/lib/i18n/LangProvider'
import { useSession } from '#/lib/auth/SessionProvider'
import { SessionError } from '#/components/SessionError'
import { recordAnsweredQuestion } from '#/lib/funnel/freePlay'
import { TIME_PER_QUESTION_MS } from '#/lib/game/scoring'
import { QuizCard } from '#/components/game/QuizCard'
import { TimerRing } from '#/components/game/TimerRing'
import {
  DUEL_ROUNDS,
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

export const Route = createFileRoute('/duels/$id')({ component: DuelScreen })

const TIMER_SECONDS = Math.round(TIME_PER_QUESTION_MS / 1000)
const FEEDBACK_MS = 900

type Role = 'host' | 'guest'

type Phase =
  | 'loading'
  | 'notParticipant'
  | 'error'
  | 'playing'
  | 'result'

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

  // Load the duel and decide play vs result. Everything supabase/Date.now lives
  // here (effect), never in render, so SSR stays a pure loading state.
  useEffect(() => {
    if (!sessionReady || !userId) return
    let cancelled = false
    const isCancelled = () => cancelled
    ;(async () => {
      let row: DuelRow
      try {
        row = await getDuel(id)
      } catch (err) {
        // RLS blocks non-participants → treat as "not part of this duel".
        console.error('getDuel failed', err)
        if (!isCancelled()) setPhase('notParticipant')
        return
      }
      if (isCancelled()) return

      const role: Role | null =
        userId === row.host_id
          ? 'host'
          : userId === row.guest_id
            ? 'guest'
            : null
      if (!role) {
        setPhase('notParticipant')
        return
      }
      roleRef.current = role

      const myPlayedAt =
        role === 'host' ? row.host_played_at : row.guest_played_at
      const myScore = role === 'host' ? row.host_score : row.guest_score
      const opponentScore =
        role === 'host' ? row.guest_score : row.host_score
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
    })()
    return () => {
      cancelled = true
    }
  }, [id, sessionReady, userId])

  function finish() {
    if (submittedRef.current) return
    submittedRef.current = true

    const totalMs = startedAtRef.current ? Date.now() - startedAtRef.current : 0
    const answers = answersRef.current
    ;(async () => {
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
    return <DuelResult result={result} userId={userId} />
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
}: {
  result: ResultState
  userId: string | null
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
          {t('duel.result.awaiting.title')}
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
          {t('duel.result.awaiting.subtitle')}
        </p>
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

      <Link
        to="/duels"
        className="w-full rounded-xl border border-white/15 px-4 py-3 text-center font-medium text-fg/80 transition-colors hover:text-fg"
      >
        {t('duel.result.back')}
      </Link>
    </motion.div>
  )
}
