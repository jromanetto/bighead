import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * These run in vitest's default node environment (no `window`/`AudioContext`),
 * which is exactly the SSR-safety contract: every entry point must degrade to a
 * no-op without throwing. Modules are reset per test because the module caches
 * the mute flag in module scope.
 */
async function freshSound() {
  vi.resetModules()
  return import('#/lib/game/sound')
}

afterEach(() => {
  vi.resetModules()
})

describe('sound mute flag (SSR / no window)', () => {
  it('defaults to unmuted', async () => {
    const { isMuted } = await freshSound()
    expect(isMuted()).toBe(false)
  })

  it('setMuted updates the in-memory flag without throwing', async () => {
    const { isMuted, setMuted } = await freshSound()
    setMuted(true)
    expect(isMuted()).toBe(true)
    setMuted(false)
    expect(isMuted()).toBe(false)
  })
})

describe('sound playback (no AudioContext)', () => {
  it('never throws when AudioContext is unavailable', async () => {
    const { playCorrect, playWrong, playFinish } = await freshSound()
    expect(() => {
      playCorrect()
      playWrong()
      playFinish()
    }).not.toThrow()
  })

  it('is a no-op when muted', async () => {
    const { playCorrect, setMuted } = await freshSound()
    setMuted(true)
    expect(() => playCorrect()).not.toThrow()
  })
})
