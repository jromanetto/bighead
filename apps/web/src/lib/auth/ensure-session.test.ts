import { describe, expect, it, vi } from 'vitest'

import { resolveSession } from './ensure-session'

type FakeUser = { id: string; is_anonymous: boolean }

/**
 * Builds a minimal stub matching the slice of the Supabase client that
 * resolveSession touches: `auth.getUser()` and `auth.signInAnonymously()`.
 */
function makeClient(opts: {
  existingUser: FakeUser | null
  anonUser?: FakeUser
}) {
  const signInAnonymously = vi.fn(async () => ({
    data: { user: opts.anonUser ?? null },
    error: null,
  }))
  const getUser = vi.fn(async () => ({
    data: { user: opts.existingUser },
    error: null,
  }))

  return {
    client: { auth: { getUser, signInAnonymously } },
    getUser,
    signInAnonymously,
  }
}

describe('resolveSession', () => {
  it('returns the existing user without signing in anonymously', async () => {
    const existingUser: FakeUser = { id: 'user-123', is_anonymous: false }
    const { client, getUser, signInAnonymously } = makeClient({ existingUser })

    const result = await resolveSession(client as never)

    expect(getUser).toHaveBeenCalledOnce()
    expect(signInAnonymously).not.toHaveBeenCalled()
    expect(result).toEqual({ id: 'user-123', is_anonymous: false })
  })

  it('signs in anonymously when there is no current user', async () => {
    const anonUser: FakeUser = { id: 'anon-999', is_anonymous: true }
    const { client, getUser, signInAnonymously } = makeClient({
      existingUser: null,
      anonUser,
    })

    const result = await resolveSession(client as never)

    expect(getUser).toHaveBeenCalledOnce()
    expect(signInAnonymously).toHaveBeenCalledOnce()
    expect(result).toEqual({ id: 'anon-999', is_anonymous: true })
  })

  it('throws when anonymous sign-in fails', async () => {
    const signInAnonymously = vi.fn(async () => ({
      data: { user: null },
      error: { message: 'Anonymous sign-ins are disabled' },
    }))
    const getUser = vi.fn(async () => ({
      data: { user: null },
      error: null,
    }))
    const client = { auth: { getUser, signInAnonymously } }

    await expect(resolveSession(client as never)).rejects.toThrow(
      /Anonymous sign-ins are disabled/,
    )
  })
})
