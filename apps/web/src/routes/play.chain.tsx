import { useEffect, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { AnimatePresence } from 'framer-motion'

import { useChainStore } from '#/lib/game/chainStore'
import { useLang, useT } from '#/lib/i18n/LangProvider'
import { useSession } from '#/lib/auth/SessionProvider'
import { TIME_PER_QUESTION_MS } from '#/lib/game/scoring'
import { QuizCard } from '#/components/game/QuizCard'
import { TimerRing } from '#/components/game/TimerRing'
import { ChainMeter } from '#/components/game/ChainMeter'
import { ResultScreen } from '#/components/game/ResultScreen'
import { SessionError } from '#/components/SessionError'

export const Route = createFileRoute('/play/chain')({ component: ChainScreen })

const TIMER_SECONDS = Math.round(TIME_PER_QUESTION_MS / 1000)
/** How long the answer feedback stays on screen before advancing. */
const FEEDBACK_MS = 900

function ChainScreen() {
  const t = useT()
  const { lang, ready } = useLang()
  const { userId, sessionReady, error: sessionFailed } = useSession()

  const status = useChainStore((s) => s.status)
  const questions = useChainStore((s) => s.questions)
  const index = useChainStore((s) => s.index)
  const score = useChainStore((s) => s.score)
  const chain = useChainStore((s) => s.chain)
  const maxChain = useChainStore((s) => s.maxChain)
  const multiplier = useChainStore((s) => s.multiplier)
  const correctCount = useChainStore((s) => s.correctCount)
  const answered = useChainStore((s) => s.answered)
  const selectedIndex = useChainStore((s) => s.selectedIndex)
  const remaining = useChainStore((s) => s.remaining)

  const start = useChainStore((s) => s.start)
  const answer = useChainStore((s) => s.answer)
  const next = useChainStore((s) => s.next)
  const tick = useChainStore((s) => s.tick)
  const end = useChainStore((s) => s.end)

  // Start a fresh run once both the client language is resolved post-hydration
  // AND an anonymous session exists (questions are user-scoped). Waiting on
  // `userId` avoids `getUnseenQuestions` throwing "no authenticated user".
  // A ref guards against a double-start.
  const startedRef = useRef(false)
  useEffect(() => {
    if (!ready) return
    if (!sessionReady || !userId) return
    if (startedRef.current) return
    startedRef.current = true
    void start(lang)
  }, [ready, sessionReady, userId, lang, start])

  // Countdown: ticks once per second while playing and not in feedback.
  useEffect(() => {
    if (status !== 'playing') return
    if (selectedIndex !== null) return
    const id = window.setInterval(() => tick(), 1000)
    return () => window.clearInterval(id)
  }, [status, selectedIndex, tick])

  // After an answer (or timeout) show feedback briefly, then advance.
  const feedbackTimer = useRef<number | null>(null)
  useEffect(() => {
    if (status !== 'playing') return
    if (selectedIndex === null) return
    feedbackTimer.current = window.setTimeout(() => {
      void next()
    }, FEEDBACK_MS)
    return () => {
      if (feedbackTimer.current !== null) {
        window.clearTimeout(feedbackTimer.current)
        feedbackTimer.current = null
      }
    }
  }, [status, selectedIndex, next])

  if (status === 'finished') {
    return (
      <ResultScreen
        title={t('play.chain.title')}
        score={score}
        correct={correctCount}
        total={answered}
        maxChain={maxChain}
        onReplay={() => void start(lang)}
      />
    )
  }

  if (status === 'error') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-bold text-fg">{t('game.error.title')}</h1>
        <p className="text-fg/60">{t('game.error.subtitle')}</p>
        <button
          type="button"
          onClick={() => void start(lang)}
          className="rounded-xl bg-primary px-5 py-3 font-bold text-bg transition-opacity hover:opacity-90"
        >
          {t('game.retry')}
        </button>
      </div>
    )
  }

  // Session couldn't be established (e.g. rate limit): offer a retry instead of
  // spinning forever or crashing.
  if (sessionReady && sessionFailed) {
    return <SessionError />
  }

  const currentQ = questions.at(index)
  if (status === 'idle' || !currentQ) {
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
        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-wide text-fg/50">
            {t('game.score')}
          </span>
          <span className="text-2xl font-bold tabular-nums text-primary">
            {score}
          </span>
        </div>
        <ChainMeter chain={chain} multiplier={multiplier} />
      </div>

      <AnimatePresence mode="wait">
        <QuizCard
          key={currentQ.id}
          question={currentQ}
          selectedIndex={selectedIndex}
          onAnswer={(i) => answer(i)}
        />
      </AnimatePresence>

      <button
        type="button"
        onClick={() => end()}
        className="mx-auto rounded-xl border border-white/15 px-5 py-2.5 text-sm font-medium text-fg/70 transition-colors hover:text-fg"
      >
        {t('game.finish')}
      </button>
    </div>
  )
}
