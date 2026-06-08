import type { ReactNode } from 'react'

/**
 * Subtle fade/lift-in wrapper for landing content.
 *
 * Implemented as a pure CSS animation (`.bh-reveal` in styles.css) that runs on
 * load with `animation-fill-mode: both`, so the content always ends fully
 * visible — it can never get stuck hidden the way a JS/IntersectionObserver
 * animation can (which previously left above-the-fold content at opacity 0).
 * The content is server-rendered and visible without JS; `prefers-reduced-motion`
 * disables the motion.
 */
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <div
      className={`bh-reveal ${className}`}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  )
}
