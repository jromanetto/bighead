import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'

import { useT } from '#/lib/i18n/LangProvider'
import { consumePromptIfDue } from '#/lib/funnel/freePlay'
import { APP_STORE_URL, PLAY_STORE_URL } from '#/lib/funnel/appLinks'
import { AccountPrompt } from '#/components/funnel/AccountPrompt'

export interface ResultScreenProps {
  title?: string
  score: number
  correct: number
  total: number
  maxChain?: number
  perfect?: boolean
  onReplay?: () => void
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
    // Confetti is purely decorative; ignore load/runtime failures.
  }
}

/**
 * End-of-game summary. Shows the score breakdown, an optional PERFECT badge with
 * confetti, a non-blocking app-download CTA, and replay / back actions.
 */
export function ResultScreen({
  title,
  score,
  correct,
  total,
  maxChain,
  perfect = false,
  onReplay,
}: ResultScreenProps) {
  const t = useT()
  const firedRef = useRef(false)

  useEffect(() => {
    if (perfect && !firedRef.current) {
      firedRef.current = true
      void fireConfetti()
    }
  }, [perfect])

  // Free-play gate: a finished game is a safe (never mid-question) point to
  // surface the account prompt. Checked once on mount; opens only when a
  // threshold is freshly due. Closing keeps the user playing.
  const [promptOpen, setPromptOpen] = useState(false)
  const checkedRef = useRef(false)
  useEffect(() => {
    if (checkedRef.current) return
    checkedRef.current = true
    if (consumePromptIfDue() !== null) setPromptOpen(true)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center"
    >
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold text-fg">
          {title ?? t('result.title')}
        </h1>
        {perfect ? (
          <motion.span
            initial={{ scale: 0.5, rotate: -6 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 14 }}
            className="rounded-full bg-accent px-4 py-1 text-sm font-extrabold uppercase tracking-wide text-fg"
          >
            {t('result.perfect')}
          </motion.span>
        ) : null}
      </div>

      <div className="grid w-full grid-cols-2 gap-3">
        <Stat label={t('result.score')} value={score} highlight />
        <Stat label={t('result.correct')} value={`${correct} / ${total}`} />
        {maxChain !== undefined ? (
          <Stat
            label={t('result.maxChain')}
            value={maxChain}
            className="col-span-2"
          />
        ) : null}
      </div>

      <div className="flex w-full flex-col gap-3">
        {onReplay ? (
          <button
            type="button"
            onClick={onReplay}
            className="w-full rounded-xl bg-primary px-4 py-3 font-bold text-bg transition-opacity hover:opacity-90"
          >
            {t('result.replay')}
          </button>
        ) : null}
        <Link
          to="/play"
          className="w-full rounded-xl border border-white/15 px-4 py-3 text-center font-medium text-fg/80 transition-colors hover:text-fg"
        >
          {t('result.backToPlay')}
        </Link>
      </div>

      {/* Non-blocking mobile-acquisition funnel. */}
      <div className="mt-2 w-full rounded-2xl border border-white/10 bg-surface p-5">
        <p className="font-bold text-fg">{t('result.cta.title')}</p>
        <p className="mt-1 text-sm text-fg/60">{t('result.cta.subtitle')}</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('result.cta.appStore')}
            className="flex-1 rounded-xl bg-fg px-4 py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
          >
            {t('result.cta.appStore')}
          </a>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('result.cta.googlePlay')}
            className="flex-1 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-fg transition-colors hover:bg-white/5"
          >
            {t('result.cta.googlePlay')}
          </a>
        </div>
      </div>

      <AccountPrompt open={promptOpen} onClose={() => setPromptOpen(false)} />
    </motion.div>
  )
}

function Stat({
  label,
  value,
  highlight = false,
  className = '',
}: {
  label: string
  value: string | number
  highlight?: boolean
  className?: string
}) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-surface p-4 ${className}`}
    >
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
