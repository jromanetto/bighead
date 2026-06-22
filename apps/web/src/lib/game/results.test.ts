import { afterEach, describe, expect, it, vi } from 'vitest'

import { awardXp } from './results'

// Mock the Supabase browser client so we can observe whether award_xp is called.
const rpc = vi.fn(async () => ({ error: null }))
const getUser = vi.fn(async () => ({ data: { user: { id: 'u-1' } } }))

vi.mock('#/lib/supabase/client', () => ({
  getBrowserClient: () => ({ auth: { getUser }, rpc }),
}))

afterEach(() => {
  rpc.mockClear()
  getUser.mockClear()
})

describe('awardXp', () => {
  // Regression: a 0/5 Daily Brain awards 0 XP. The hardened server RPC rejects
  // amount <= 0 ('invalid xp amount'), so the client must not call it at all.
  it('skips the RPC entirely when amount is 0', async () => {
    await awardXp(0, 'daily', {}, 'daily_brain_2026-06-22')
    expect(rpc).not.toHaveBeenCalled()
    expect(getUser).not.toHaveBeenCalled()
  })

  it('skips the RPC for negative or non-finite amounts', async () => {
    await awardXp(-10, 'daily', {}, 'k1')
    await awardXp(Number.NaN, 'daily', {}, 'k2')
    expect(rpc).not.toHaveBeenCalled()
  })

  it('calls award_xp for a positive amount', async () => {
    await awardXp(45, 'daily', { correct: 3 }, 'daily_brain_2026-06-22')
    expect(rpc).toHaveBeenCalledOnce()
    expect(rpc).toHaveBeenCalledWith(
      'award_xp',
      expect.objectContaining({ p_amount: 45, p_source: 'daily' }),
    )
  })
})
