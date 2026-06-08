import { getBrowserClient } from '#/lib/supabase/client'

import type { GameQuestion } from './questions'
import type { Database } from '#/lib/database.types'

/** One question inside a duel's `questions_payload` jsonb array. */
export interface DuelPayloadQuestion {
  id: string
  question_text: string
  correct_answer: string
  wrong_answers: string[]
  image_url: string | null
  explanation: string | null
  player_name: string | null
}

/** A single answered round, as expected by `submit_async_duel_play`. */
export interface DuelAnswer {
  question_id: string
  /** 0-based round index (0–9). */
  position: number
  /** Chosen answer index (0–3), or -1 on timeout. */
  answer_idx: number
  is_correct: boolean
  time_ms: number
}

/** A row from the `duels` table, with `questions_payload` typed. */
export type DuelRow = Omit<
  Database['public']['Tables']['duels']['Row'],
  'questions_payload'
> & {
  questions_payload: DuelPayloadQuestion[] | null
}

/** One entry from `get_my_duels`, with `my_role` narrowed. */
export interface DuelInboxItem {
  duel_id: string
  my_role: 'host' | 'guest'
  opponent_id: string | null
  opponent_username: string | null
  opponent_avatar: string | null
  category: string | null
  status: string
  my_played_at: string | null
  opponent_played_at: string | null
  my_score: number
  opponent_score: number | null
  winner_id: string | null
  expires_at: string | null
  created_at: string | null
}

/** UI bucket a duel belongs to in the inbox. */
export type DuelBucket = 'my_turn' | 'waiting' | 'finished' | 'expired'

/** Result returned by `submit_async_duel_play`. */
export interface DuelPlayResult {
  status: 'awaiting_opponent' | 'completed' | 'expired' | 'pending'
  my_score: number
  opponent_score: number | null
  winner_id: string | null
}

/** Thrown by `createQuickDuel` when the backend has no eligible opponent. */
export class NoOpponentError extends Error {
  readonly code = 'no_opponent' as const
  constructor() {
    super('no opponent available')
    this.name = 'NoOpponentError'
  }
}

/** Number of rounds in an async duel. */
export const DUEL_ROUNDS = 10

/** Selectable duel categories (matches the backend's allowed values). */
export const DUEL_CATEGORIES = [
  'general',
  'history',
  'geography',
  'music',
  'science',
  'literature',
  'technology',
  'animals',
  'sport',
  'cinema',
  'nature',
] as const

/**
 * Fisher-Yates shuffle returning a new array. The randomness source is
 * injectable so callers (and tests) can make the result deterministic.
 */
function shuffle<T>(items: ReadonlyArray<T>, rng: () => number): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Turns a duel payload question into a UI-ready {@link GameQuestion}: the correct
 * and wrong answers are combined and shuffled, and `correctIndex` tracks where
 * the correct answer landed. The payload carries no difficulty, so it defaults
 * to 1. Mirrors `formatQuestion`.
 */
export function formatDuelQuestion(
  item: DuelPayloadQuestion,
  rng: () => number = Math.random,
): GameQuestion {
  const answers = shuffle([item.correct_answer, ...item.wrong_answers], rng)
  return {
    id: item.id,
    category: '',
    difficulty: 1,
    question: item.question_text,
    answers,
    correctIndex: answers.indexOf(item.correct_answer),
    imageUrl: item.image_url,
  }
}

/** Buckets a duel for the inbox. */
export function categorizeDuel(item: DuelInboxItem): DuelBucket {
  if (item.status === 'expired') return 'expired'
  if (item.status === 'completed') return 'finished'
  return item.my_played_at ? 'waiting' : 'my_turn'
}

/**
 * Creates a quick async duel. Pass `category: null` for any category and rely on
 * the backend to pick a random, level-banded opponent. Throws {@link
 * NoOpponentError} when none is available so the UI can show a friendly message.
 */
export async function createQuickDuel(
  category: string | null,
  language: string,
): Promise<string> {
  const supabase = getBrowserClient()

  // The generated Args type marks p_category/p_guest_id as non-null strings, but
  // the SECURITY DEFINER function accepts null for "any category / random
  // opponent". Cast the args to pass null without loosening the types globally.
  const { data, error } = await supabase.rpc('create_async_duel', {
    p_guest_id: null,
    p_category: category,
    p_language: language,
  } as unknown as Database['public']['Functions']['create_async_duel']['Args'])

  if (error) {
    if (error.message.toLowerCase().includes('no opponent available')) {
      throw new NoOpponentError()
    }
    throw error
  }

  return data
}

/** Loads a single duel by id (RLS restricts this to participants). */
export async function getDuel(duelId: string): Promise<DuelRow> {
  const supabase = getBrowserClient()

  const { data, error } = await supabase
    .from('duels')
    .select('*')
    .eq('id', duelId)
    .single()

  if (error) throw error
  return data as DuelRow
}

/** Submits the current player's answers for a duel. */
export async function submitDuelPlay(
  duelId: string,
  answers: DuelAnswer[],
  totalMs: number,
): Promise<DuelPlayResult> {
  const supabase = getBrowserClient()

  const { data, error } = await supabase.rpc('submit_async_duel_play', {
    p_duel_id: duelId,
    // The jsonb param is typed `Json`; our structured answers serialize cleanly.
    p_answers: answers as unknown as Database['public']['Tables']['duels']['Row']['host_answers'],
    p_total_time_ms: totalMs,
  })

  if (error) throw error
  return data as unknown as DuelPlayResult
}

/** Lists the current user's duels (RPC reads `auth.uid()`). */
export async function getMyDuels(): Promise<DuelInboxItem[]> {
  const supabase = getBrowserClient()

  const { data, error } = await supabase.rpc('get_my_duels')
  if (error) throw error
  return data as unknown as DuelInboxItem[]
}
