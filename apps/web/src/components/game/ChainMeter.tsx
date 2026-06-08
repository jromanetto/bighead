import { motion } from 'framer-motion'

import { useT } from '#/lib/i18n/LangProvider'

export interface ChainMeterProps {
  /** Current consecutive-correct count. */
  chain: number
  /** Score multiplier derived from the chain. */
  multiplier: number
}

const HIGH_MULTIPLIER = 3

/**
 * Displays the current answer chain and its multiplier. The badge "pops" each
 * time the chain grows; a chain of 0 renders a muted idle state.
 */
export function ChainMeter({ chain, multiplier }: ChainMeterProps) {
  const t = useT()
  const idle = chain <= 0
  const high = multiplier >= HIGH_MULTIPLIER

  return (
    <div
      className="flex items-center gap-2"
      aria-label={`${t('quiz.chain.label')}: ${chain}, x${multiplier}`}
    >
      <span className="text-xs font-medium uppercase tracking-wide text-fg/50">
        {t('quiz.chain.label')}
      </span>

      {/* `key` on the count forces a remount → replays the pop animation. */}
      <motion.span
        key={chain}
        initial={idle ? false : { scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 600, damping: 18 }}
        className={
          idle
            ? 'rounded-md bg-surface px-2 py-1 text-sm font-bold text-fg/40'
            : high
              ? 'rounded-md bg-accent px-2 py-1 text-sm font-bold text-fg'
              : 'rounded-md bg-primary px-2 py-1 text-sm font-bold text-bg'
        }
      >
        {chain}
      </motion.span>

      <span
        className={
          idle
            ? 'text-sm font-bold text-fg/40'
            : high
              ? 'text-sm font-bold text-accent2'
              : 'text-sm font-bold text-primary'
        }
      >
        ×{multiplier}
      </span>
    </div>
  )
}
