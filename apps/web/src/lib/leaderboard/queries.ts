import { getBrowserClient } from '#/lib/supabase/client'

/** A single leaderboard row, normalized across the weekly RPC and all-time query. */
export interface LeaderboardEntry {
  id: string
  rank: number
  username: string | null
  avatarUrl: string | null
  xp: number
  bestChain: number
}

/**
 * Weekly leaderboard via the `get_weekly_leaderboard` RPC.
 * Returns up to `limit` rows already ranked by the backend.
 */
export async function fetchWeeklyLeaderboard(
  limit = 100,
): Promise<Array<LeaderboardEntry>> {
  const supabase = getBrowserClient()
  const { data, error } = await supabase.rpc('get_weekly_leaderboard', {
    limit_count: limit,
  })
  if (error) throw error

  return data.map((row) => ({
    id: row.id,
    rank: row.rank,
    username: row.username,
    avatarUrl: row.avatar_url,
    xp: row.weekly_xp,
    bestChain: row.best_chain,
  }))
}

/**
 * All-time leaderboard: top users ordered by `total_xp`.
 * Rank is derived client-side from the ordered result.
 */
export async function fetchAllTimeLeaderboard(
  limit = 100,
): Promise<Array<LeaderboardEntry>> {
  const supabase = getBrowserClient()
  const { data, error } = await supabase
    .from('users')
    .select('id,username,avatar_url,total_xp,best_chain')
    .order('total_xp', { ascending: false })
    .limit(limit)
  if (error) throw error

  return data.map((row, i) => ({
    id: row.id,
    rank: i + 1,
    username: row.username,
    avatarUrl: row.avatar_url,
    xp: row.total_xp ?? 0,
    bestChain: row.best_chain ?? 0,
  }))
}
