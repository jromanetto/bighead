import { getBrowserClient } from '#/lib/supabase/client'

import type { Database } from '#/lib/database.types'

export type ProfileUser = Pick<
  Database['public']['Tables']['users']['Row'],
  | 'id'
  | 'username'
  | 'avatar_url'
  | 'total_xp'
  | 'level'
  | 'games_played'
  | 'games_won'
  | 'best_chain'
  | 'daily_streak'
  | 'perfect_games'
  | 'is_premium'
>

export interface UnlockedAchievement {
  id: string
  name: string
  description: string
  icon: string
  xpReward: number
  unlockedAt: string | null
}

export interface RecentGame {
  id: string
  mode: string
  score: number
  correctCount: number
  totalQuestions: number
  maxChain: number
  createdAt: string | null
}

/** Returns the current authenticated user's id, or throws if none. */
async function requireUserId(): Promise<string> {
  const supabase = getBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

/** Fetches the current user's profile row. */
export async function fetchProfile(): Promise<ProfileUser> {
  const supabase = getBrowserClient()
  const uid = await requireUserId()
  const { data, error } = await supabase
    .from('users')
    .select(
      'id,username,avatar_url,total_xp,level,games_played,games_won,best_chain,daily_streak,perfect_games,is_premium',
    )
    .eq('id', uid)
    .single()
  if (error) throw error
  return data
}

/**
 * Fetches the current user's unlocked achievements, embedding the achievement
 * definition via the `user_achievements_achievement_id_fkey` relationship.
 */
export async function fetchAchievements(): Promise<Array<UnlockedAchievement>> {
  const supabase = getBrowserClient()
  const uid = await requireUserId()
  const { data, error } = await supabase
    .from('user_achievements')
    .select('unlocked_at, achievements(id, name, description, icon, xp_reward)')
    .eq('user_id', uid)
    .order('unlocked_at', { ascending: false })
  if (error) throw error

  return data.map((row) => {
    const a = row.achievements
    return {
      id: a.id,
      name: a.name,
      description: a.description,
      icon: a.icon,
      xpReward: a.xp_reward,
      unlockedAt: row.unlocked_at,
    }
  })
}

/** Fetches the current user's most recent game results. */
export async function fetchRecentGames(limit = 10): Promise<Array<RecentGame>> {
  const supabase = getBrowserClient()
  const uid = await requireUserId()
  const { data, error } = await supabase
    .from('game_results')
    .select(
      'id, mode, score, correct_count, total_questions, max_chain, created_at',
    )
    .eq('user_id', uid)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error

  return data.map((row) => ({
    id: row.id,
    mode: row.mode,
    score: row.score,
    correctCount: row.correct_count,
    totalQuestions: row.total_questions,
    maxChain: row.max_chain,
    createdAt: row.created_at,
  }))
}

/** Updates the current user's username. Returns the trimmed value on success. */
export async function updateUsername(username: string): Promise<string> {
  const supabase = getBrowserClient()
  const uid = await requireUserId()
  const trimmed = username.trim()
  if (!trimmed) throw new Error('empty')
  const { error } = await supabase
    .from('users')
    .update({ username: trimmed })
    .eq('id', uid)
  if (error) throw error
  return trimmed
}
