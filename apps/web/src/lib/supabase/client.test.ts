import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The browser client reads Vite env vars at module load via createBrowserClient.
// Stub them before importing the module under test.
beforeEach(() => {
  vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co')
  vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test')
  vi.resetModules()
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('getBrowserClient', () => {
  it('returns a Supabase client with auth and a from() function', async () => {
    const { getBrowserClient } = await import('./client')
    const client = getBrowserClient()

    expect(client).toBeDefined()
    expect(client.auth).toBeDefined()
    expect(typeof client.from).toBe('function')
  })

  it('returns the same singleton instance across calls', async () => {
    const { getBrowserClient } = await import('./client')
    expect(getBrowserClient()).toBe(getBrowserClient())
  })
})
