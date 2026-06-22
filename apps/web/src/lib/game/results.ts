import { getBrowserClient } from '#/lib/supabase/client'

import type { Json } from '#/lib/database.types'

export interface GameResultInput {
  mode: string
  score: number
  correctCount: number
  totalQuestions: number
  maxChain: number
  durationSeconds: number
}

/** Persists a finished game's result for the current user. */
export async function saveGameResult(r: GameResultInput): Promise<void> {
  const supabase = getBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('saveGameResult: no authenticated user')

  const { error } = await supabase.from('game_results').insert({
    user_id: user.id,
    mode: r.mode,
    score: r.score,
    correct_count: r.correctCount,
    total_questions: r.totalQuestions,
    max_chain: r.maxChain,
    duration_seconds: r.durationSeconds,
  })
  if (error) throw error
}

/**
 * Awards XP to the current user via the `award_xp` RPC. `dedupeKey` lets the
 * backend ignore duplicate awards for the same logical event.
 */
export async function awardXp(
  amount: number,
  source: string,
  metadata: Record<string, unknown>,
  dedupeKey: string,
): Promise<void> {
  // No XP to give (e.g. a 0/5 Daily Brain). The server rejects amount <= 0
  // ('invalid xp amount'), so skip the call entirely instead of erroring.
  if (!Number.isFinite(amount) || amount <= 0) return

  const supabase = getBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('awardXp: no authenticated user')

  const { error } = await supabase.rpc('award_xp', {
    p_user_id: user.id,
    p_amount: amount,
    p_source: source,
    p_metadata: metadata as Json,
    p_dedupe_key: dedupeKey,
  })
  if (error) throw error
}
