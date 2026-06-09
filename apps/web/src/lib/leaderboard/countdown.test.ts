import { describe, expect, it } from 'vitest'

import { formatCountdown, msUntilWeeklyReset } from '#/lib/leaderboard/countdown'

const MS_PER_DAY = 24 * 60 * 60 * 1000
const MS_PER_HOUR = 60 * 60 * 1000

describe('msUntilWeeklyReset', () => {
  it('returns a full week (never 0) when already Monday 00:00 UTC', () => {
    // 2024-01-01 is a Monday.
    const monday = Date.UTC(2024, 0, 1, 0, 0, 0, 0)
    expect(msUntilWeeklyReset(monday)).toBe(7 * MS_PER_DAY)
  })

  it('counts down to the next Monday from mid-week', () => {
    // Wednesday 2024-01-03 12:00 UTC → next Monday is 2024-01-08 00:00 UTC.
    const wednesdayNoon = Date.UTC(2024, 0, 3, 12, 0, 0, 0)
    const expected = Date.UTC(2024, 0, 8, 0, 0, 0, 0) - wednesdayNoon
    expect(msUntilWeeklyReset(wednesdayNoon)).toBe(expected)
  })

  it('handles Sunday (1 day left) crossing into next week', () => {
    // Sunday 2024-01-07 23:00 UTC → Monday 2024-01-08 00:00 UTC = 1h.
    const sundayLate = Date.UTC(2024, 0, 7, 23, 0, 0, 0)
    expect(msUntilWeeklyReset(sundayLate)).toBe(MS_PER_HOUR)
  })

  it('always returns a strictly positive span', () => {
    for (let day = 0; day < 7; day++) {
      const t = Date.UTC(2024, 0, 1 + day, 5, 30, 0, 0)
      expect(msUntilWeeklyReset(t)).toBeGreaterThan(0)
    }
  })
})

describe('formatCountdown', () => {
  it('formats spans over a day as "Xj Yh"', () => {
    expect(formatCountdown(2 * MS_PER_DAY + 3 * MS_PER_HOUR)).toBe('2j 3h')
  })

  it('formats sub-day spans as "Yh Zm"', () => {
    expect(formatCountdown(5 * MS_PER_HOUR + 20 * 60 * 1000)).toBe('5h 20m')
  })

  it('formats sub-hour spans as minutes', () => {
    expect(formatCountdown(12 * 60 * 1000)).toBe('12m')
  })

  it('clamps negative input to 0m', () => {
    expect(formatCountdown(-1000)).toBe('0m')
  })
})
