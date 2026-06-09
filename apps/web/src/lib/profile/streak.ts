import { getBrowserClient } from '#/lib/supabase/client'

/**
 * Reads the current user's `daily_streak` (own row SELECT).
 *
 * Resolves to `0` when there is no authenticated user, the row is missing, or
 * any error occurs — callers only need a non-negative number to drive a badge,
 * so failures degrade gracefully rather than throwing.
 */
export async function getMyStreak(): Promise<number> {
  try {
    const supabase = getBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return 0

    const { data, error } = await supabase
      .from('users')
      .select('daily_streak')
      .eq('id', user.id)
      .single()
    if (error) return 0

    return data.daily_streak ?? 0
  } catch {
    return 0
  }
}
