import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * Subtle scroll-reveal wrapper: fades + lifts its children into view once.
 *
 * The content is always present in the (server-rendered) DOM — only the
 * transform/opacity is animated — so the marketing copy stays crawlable.
 * `viewport.once` keeps motion tasteful (no re-trigger on scroll up).
 */
export function Reveal({
  children,
  delay = 0,
  className = '',
  immediate = false,
}: {
  children: ReactNode
  delay?: number
  className?: string
  /**
   * Animate on mount instead of on scroll-into-view. Use for above-the-fold
   * content (e.g. the hero), where `whileInView`'s IntersectionObserver may not
   * fire without a scroll and would leave the content stuck at `opacity: 0`.
   */
  immediate?: boolean
}) {
  const reveal = { opacity: 1, y: 0 }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      {...(immediate
        ? { animate: reveal }
        : { whileInView: reveal, viewport: { once: true, amount: 0.2 } })}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  )
}
