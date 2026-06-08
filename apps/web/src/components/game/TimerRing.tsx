import { motion } from 'framer-motion'

import { useT } from '#/lib/i18n/LangProvider'

const DANGER_THRESHOLD = 0.25

export interface TimerRingProps {
  /** Seconds remaining. */
  remaining: number
  /** Total duration in seconds. */
  total: number
  /** Outer diameter in pixels. */
  size?: number
}

/**
 * Circular SVG countdown. The ring depletes as `remaining` falls and turns to
 * the error color once a quarter of the time (or less) is left.
 */
export function TimerRing({ remaining, total, size = 96 }: TimerRingProps) {
  const t = useT()

  const safeTotal = total > 0 ? total : 1
  const ratio = Math.max(0, Math.min(1, remaining / safeTotal))
  const isDanger = ratio <= DANGER_THRESHOLD

  const strokeWidth = Math.max(4, Math.round(size * 0.08))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  // dashoffset grows as time runs out, "emptying" the ring.
  const offset = circumference * (1 - ratio)

  const seconds = Math.max(0, Math.ceil(remaining))
  const color = isDanger ? 'var(--color-error)' : 'var(--color-primary)'

  return (
    <div
      role="timer"
      aria-label={`${t('quiz.timer.label')}: ${seconds}`}
      aria-live="off"
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-surface)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset: offset, stroke: color }}
          transition={{ strokeDashoffset: { duration: 0.4, ease: 'linear' } }}
        />
      </svg>

      <span
        className="absolute font-bold tabular-nums"
        style={{
          fontSize: size * 0.32,
          color: isDanger ? 'var(--color-error)' : 'var(--color-fg)',
        }}
      >
        {seconds}
      </span>
    </div>
  )
}
