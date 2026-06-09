// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'

import { EV, track } from './analytics'

afterEach(() => {
  // Clean any umami stub between tests.
  delete (window as { umami?: unknown }).umami
  vi.restoreAllMocks()
})

describe('track', () => {
  it('forwards event + data to window.umami.track', () => {
    const spy = vi.fn()
    ;(window as { umami?: unknown }).umami = { track: spy }

    track(EV.gameStarted, { mode: 'chain' })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith('game_started', { mode: 'chain' })
  })

  it('is a no-op when umami is absent', () => {
    delete (window as { umami?: unknown }).umami
    expect(() => track(EV.shareClicked, { method: 'copy' })).not.toThrow()
  })

  it('never throws when umami.track throws', () => {
    ;(window as { umami?: unknown }).umami = {
      track: () => {
        throw new Error('boom')
      },
    }
    expect(() => track(EV.installClicked)).not.toThrow()
  })
})

describe('EV', () => {
  it('exposes the funnel event names', () => {
    expect(EV.gameFinished).toBe('game_finished')
    expect(EV.duelCreated).toBe('duel_created')
    expect(EV.accountCreated).toBe('account_created')
  })
})
