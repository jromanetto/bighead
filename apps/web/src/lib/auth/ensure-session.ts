import { createServerFn } from '@tanstack/react-start'

import { getServerClient } from '#/lib/supabase/server'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '#/lib/database.types'

export type SessionUser = {
  id: string
  is_anonymous: boolean
}

/**
 * Core, testable session-resolution logic for the SERVER (SSR).
 *
 * Reads ONLY the existing session from the request cookies. It never signs in
 * anonymously and never throws:
 *
 * - Anonymous sign-in must happen on the CLIENT (each user's own IP), otherwise
 *   every cookieless request signs in from the server's (VPS) IP and trips
 *   Supabase's per-IP anonymous-signup rate limit, throttling all users.
 * - Returning `null` instead of throwing keeps SSR resilient: a rate-limited or
 *   error state can never crash `beforeLoad` into the root error boundary.
 *
 * @returns the existing user, or `null` when there's no session / on any auth error.
 */
export async function resolveSession(
  client: SupabaseClient<Database>,
): Promise<SessionUser | null> {
  try {
    const {
      data: { user },
      error,
    } = await client.auth.getUser()

    if (error || !user) return null

    return { id: user.id, is_anonymous: user.is_anonymous ?? false }
  } catch {
    // Network/transport errors must never bubble up during SSR.
    return null
  }
}

/**
 * Server function exposing the current SSR session for personalization.
 *
 * Reads the existing cookie session only; returns `{ user }` or `{ user: null }`
 * and never throws. Anonymous sign-in is performed client-side by SessionProvider.
 */
export const ensureSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const client = getServerClient()
    const user = await resolveSession(client)
    return { user }
  },
)
