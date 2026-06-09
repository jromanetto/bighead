import { getBrowserClient } from '#/lib/supabase/client'

/** One entry of the top-XP leaderboard. */
export interface TopXpEntry {
  username: string
  xp: number
}

/** One day in the 14-day signups series. */
export interface SignupPoint {
  /** ISO date (YYYY-MM-DD). */
  d: string
  /** Number of signups that day. */
  n: number
}

/**
 * Shape of the `admin_overview()` RPC payload. Mirrors the jsonb returned by the
 * SECURITY DEFINER function (which enforces the email gate server-side).
 */
export interface AdminOverview {
  users_total: number
  users_registered: number
  users_anon: number
  new_users_24h: number
  new_users_7d: number
  games_total: number
  games_24h: number
  daily_plays_total: number
  daily_plays_today: number
  duels_total: number
  duels_24h: number
  duels_completed: number
  duels_open_pending: number
  weekly_players: number
  weekly_active_challenges: number
  questions_total: number
  top_xp: TopXpEntry[]
  signups_14d: SignupPoint[]
  generated_at: string
}

/** Thrown when the server-side email gate rejects the caller. */
export class AdminForbiddenError extends Error {
  readonly code = 'forbidden' as const
  constructor() {
    super('forbidden')
    this.name = 'AdminForbiddenError'
  }
}

/**
 * Fetches the superadmin overview via the `admin_overview` RPC.
 *
 * The RPC is the security boundary: it only returns data for the allowed admin
 * email and otherwise raises a `forbidden` error, which we surface as
 * {@link AdminForbiddenError}. The client-side gate in the route is purely UX.
 */
export async function getAdminOverview(): Promise<AdminOverview> {
  const supabase = getBrowserClient()

  const { data, error } = await supabase.rpc('admin_overview')

  if (error) {
    if (error.message.toLowerCase().includes('forbidden')) {
      throw new AdminForbiddenError()
    }
    throw error
  }

  return data as unknown as AdminOverview
}
