import { describe, expect, it, vi } from 'vitest'

import { resolveSession } from './ensure-session'

type FakeUser = { id: string; is_anonymous: boolean }

/**
 * Builds a minimal stub matching the slice of the Supabase client that
 * resolveSession touches on the server: `auth.getUser()`.
 *
 * The server resolver must NEVER sign in anonymously (that happens client-side),
 * so `signInAnonymously` is stubbed only to assert it is never called.
 */
function makeClient(opts: {
  existingUser: FakeUser | null
  getUserError?: { message: string }
}) {
  const signInAnonymously = vi.fn(async () => ({
    data: { user: null },
    error: null,
  }))
  const getUser = vi.fn(async () => ({
    data: { user: opts.existingUser },
    error: opts.getUserError ?? null,
  }))

  return {
    client: { auth: { getUser, signInAnonymously } },
    getUser,
    signInAnonymously,
  }
}

describe('resolveSession (server)', () => {
  it('returns the existing user without signing in anonymously', async () => {
    const existingUser: FakeUser = { id: 'user-123', is_anonymous: false }
    const { client, getUser, signInAnonymously } = makeClient({ existingUser })

    const result = await resolveSession(client as never)

    expect(getUser).toHaveBeenCalledOnce()
    expect(signInAnonymously).not.toHaveBeenCalled()
    expect(result).toEqual({ id: 'user-123', is_anonymous: false })
  })

  it('returns null when there is no current user (never signs in)', async () => {
    const { client, getUser, signInAnonymously } = makeClient({
      existingUser: null,
    })

    const result = await resolveSession(client as never)

    expect(getUser).toHaveBeenCalledOnce()
    expect(signInAnonymously).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })

  it('returns null on an auth error instead of throwing', async () => {
    const { client, signInAnonymously } = makeClient({
      existingUser: null,
      getUserError: { message: 'Request rate limit reached' },
    })

    const result = await resolveSession(client as never)

    expect(signInAnonymously).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })

  it('returns null when getUser throws instead of propagating', async () => {
    const getUser = vi.fn(async () => {
      throw new Error('network down')
    })
    const client = { auth: { getUser } }

    await expect(resolveSession(client as never)).resolves.toBeNull()
  })
})
