/**
 * Pure date math for the weekly leaderboard reset.
 *
 * The weekly board resets at the start of the next ISO week: Monday 00:00 UTC.
 * Keeping this UTC-based makes it deterministic and timezone-independent (the
 * server reset is UTC too). `now` is injected so it is trivially testable and
 * SSR-safe — callers pass `Date.now()` from inside an effect.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000

/** Milliseconds from `now` until the next Monday 00:00:00 UTC. */
export function msUntilWeeklyReset(now: number): number {
  const d = new Date(now)
  // getUTCDay: 0=Sun, 1=Mon … 6=Sat. Days until next Monday (1–7, never 0).
  const day = d.getUTCDay()
  const daysUntilMonday = ((8 - day) % 7) || 7

  const next = new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate() + daysUntilMonday,
      0,
      0,
      0,
      0,
    ),
  )
  return next.getTime() - now
}

/** Formats a positive millisecond span as `Xj Yh` (or `Yh Zm` under a day). */
export function formatCountdown(ms: number): string {
  const clamped = Math.max(0, ms)
  const days = Math.floor(clamped / MS_PER_DAY)
  const hours = Math.floor((clamped % MS_PER_DAY) / (60 * 60 * 1000))
  const minutes = Math.floor((clamped % (60 * 60 * 1000)) / (60 * 1000))
  if (days > 0) return `${days}j ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}
