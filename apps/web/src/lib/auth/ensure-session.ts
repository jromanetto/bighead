import { createServerFn } from '@tanstack/react-start'

import { getServerClient } from '#/lib/supabase/server'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '#/lib/database.types'

export type SessionUser = {
  id: string
  is_anonymous: boolean
}

/**
 * Core, testable session-resolution logic.
 *
 * - If the client already has an authenticated user, returns it as-is and does
 *   NOT create an anonymous session.
 * - Otherwise signs in anonymously and returns the newly created user.
 *
 * Throws if anonymous sign-in fails (e.g. anonymous sign-ins disabled on the
 * Supabase project) so the caller can surface the real error instead of
 * silently running session-less.
 */
export async function resolveSession(
  client: SupabaseClient<Database>,
): Promise<SessionUser> {
  const {
    data: { user },
  } = await client.auth.getUser()

  if (user) {
    return { id: user.id, is_anonymous: user.is_anonymous ?? false }
  }

  const { data, error } = await client.auth.signInAnonymously()

  if (error || !data.user) {
    throw new Error(
      error?.message ?? 'Anonymous sign-in failed: no user returned',
    )
  }

  return { id: data.user.id, is_anonymous: data.user.is_anonymous ?? true }
}

/**
 * Server function that guarantees a Supabase session exists for the current
 * request. Uses the SSR server client so the (possibly newly created)
 * anonymous session is persisted to cookies via Set-Cookie.
 */
export const ensureSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const client = getServerClient()
    return resolveSession(client)
  },
)
