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
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  )
}
