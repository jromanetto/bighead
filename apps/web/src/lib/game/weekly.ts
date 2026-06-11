import { getBrowserClient } from '#/lib/supabase/client'

import type { GameQuestion } from './questions'
import type { Database } from '#/lib/database.types'
import type { Lang } from '#/lib/i18n/strings'

/** A row from `weekly_challenges` (RLS: active ones are publicly readable). */
export type WeeklyChallenge = Pick<
  Database['public']['Tables']['weekly_challenges']['Row'],
  | 'id'
  | 'theme_slug'
  | 'theme_label_fr'
  | 'theme_label_en'
  | 'description_fr'
  | 'description_en'
  | 'emoji'
  | 'color'
  | 'target_category'
  | 'start_date'
  | 'end_date'
  | 'status'
  | 'total_questions'
  | 'total_players'
  | 'challenge_type'
>

/** A row from `weekly_challenge_questions` (RLS: publicly readable). */
export type WeeklyQuestionRow = Pick<
  Database['public']['Tables']['weekly_challenge_questions']['Row'],
  | 'id'
  | 'challenge_id'
  | 'position'
  | 'difficulty'
  | 'question_fr'
  | 'correct_answer_fr'
  | 'wrong_answers_fr'
  | 'learning_fact_fr'
  | 'question_en'
  | 'correct_answer_en'
  | 'wrong_answers_en'
  | 'learning_fact_en'
  | 'image_url'
  | 'image_credit'
>

/** The current user's progress row for a challenge (RLS: own rows only). */
export type WeeklyProgress = Pick<
  Database['public']['Tables']['weekly_challenge_progress']['Row'],
  | 'current_position'
  | 'correct_count'
  | 'daily_play_counts'
  | 'day_streak'
  | 'completed_at'
  | 'final_score'
  | 'badge_earned'
>

/** One row from `get_weekly_challenge_leaderboard`. */
export type WeeklyLeaderRow =
  Database['public']['Functions']['get_weekly_challenge_leaderboard']['Returns'][number]

/** A UI-ready weekly question with its educational learning fact. */
export type WeeklyGameQuestion = GameQuestion & {
  learningFact: string | null
}

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

/** The challenge's theme label for the given language. */
export function themeLabel(c: WeeklyChallenge, lang: Lang): string {
  return lang === 'fr' ? c.theme_label_fr : c.theme_label_en
}

/** The challenge's description for the given language (may be null). */
export function themeDescription(
  c: WeeklyChallenge,
  lang: Lang,
): string | null {
  return lang === 'fr' ? c.description_fr : c.description_en
}

/**
 * Turns a `weekly_challenge_questions` row into a UI-ready question for the
 * given language: the correct and wrong answers are combined and shuffled, and
 * `correctIndex` tracks where the correct answer landed. The learning fact is
 * carried alongside for the post-answer educational beat. The category is not on
 * the question row (it lives on the challenge), so pass it in for the chip.
 */
export function formatWeeklyQuestion(
  row: WeeklyQuestionRow,
  lang: Lang,
  rng: () => number = Math.random,
  category = '',
): WeeklyGameQuestion {
  const question = lang === 'fr' ? row.question_fr : row.question_en
  const correct = lang === 'fr' ? row.correct_answer_fr : row.correct_answer_en
  const wrong = lang === 'fr' ? row.wrong_answers_fr : row.wrong_answers_en
  const learningFact =
    lang === 'fr' ? row.learning_fact_fr : row.learning_fact_en

  const answers = shuffle([correct, ...wrong], rng)
  return {
    id: row.id,
    category,
    difficulty: row.difficulty,
    question,
    answers,
    correctIndex: answers.indexOf(correct),
    imageUrl: row.image_url,
    learningFact,
  }
}

/**
 * One row from `get_my_challenge_history`: every past (archived/closed)
 * challenge, whether the user played it or not. Progress fields are `null`
 * when the quiz was never played (LEFT JOIN server-side) — the generated
 * Supabase types miss that nullability, hence this local shape.
 */
export interface ChallengeHistoryEntry {
  challenge_id: string
  challenge_type: string
  theme_slug: string
  theme_label_fr: string
  theme_label_en: string
  description_fr: string | null
  description_en: string | null
  emoji: string
  color: string
  start_date: string
  end_date: string
  total_questions: number
  final_score: number | null
  correct_count: number | null
  badge_earned: string | null
  completed_at: string | null
  final_xp_awarded: number | null
  best_replay_score: number | null
}

/** Server state of a replay session after each strict-sequential answer. */
export interface ReplayState {
  current_position: number
  correct_count: number
  completed: boolean
}

/** Whether a challenge can be replayed (the backend enforces the same rule). */
export function isReplayable(status: WeeklyChallenge['status']): boolean {
  return status === 'archived' || status === 'closed'
}

/**
 * Parses the `submit_replay_answer` jsonb payload into a typed state.
 * Throws on malformed payloads so callers fail loudly instead of advancing
 * on garbage.
 */
export function parseReplayState(payload: unknown): ReplayState {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('malformed replay state')
  }
  const p = payload as Record<string, unknown>
  if (
    typeof p.current_position !== 'number' ||
    typeof p.correct_count !== 'number' ||
    typeof p.completed !== 'boolean'
  ) {
    throw new Error('malformed replay state')
  }
  return {
    current_position: p.current_position,
    correct_count: p.correct_count,
    completed: p.completed,
  }
}

/** Lists the currently active weekly challenges (RLS-readable). */
export async function getActiveChallenges(): Promise<WeeklyChallenge[]> {
  const supabase = getBrowserClient()

  const { data, error } = await supabase
    .from('weekly_challenges')
    .select('*')
    .eq('status', 'active')

  if (error) throw error
  return data
}

/**
 * Loads a single challenge by id whatever its status (RLS exposes
 * active/closed/archived). Returns `null` when missing or still upcoming.
 */
export async function getChallengeById(
  challengeId: string,
): Promise<WeeklyChallenge | null> {
  const supabase = getBrowserClient()

  const { data, error } = await supabase
    .from('weekly_challenges')
    .select('*')
    .eq('id', challengeId)
    .maybeSingle()

  if (error) throw error
  return data
}

/**
 * Every past (archived/closed) challenge with the user's progress when it
 * exists. Sorted by `end_date` DESC server-side — feeds "Plus de quiz hebdo".
 */
export async function getChallengeHistory(): Promise<ChallengeHistoryEntry[]> {
  const supabase = getBrowserClient()

  const { data, error } = await supabase.rpc('get_my_challenge_history')

  if (error) throw error
  // NB: the generated RPC types miss the LEFT JOIN nullability — the local
  // `ChallengeHistoryEntry` (wider, nullable) is the truthful shape.
  return data
}

/**
 * Opens a replay session for an archived/closed challenge and returns its id.
 * Replays never award XP; the backend rejects non-replayable statuses.
 */
export async function startReplay(challengeId: string): Promise<string> {
  const supabase = getBrowserClient()

  const { data, error } = await supabase.rpc('start_weekly_replay', {
    p_challenge_id: challengeId,
  })

  if (error) throw error
  return data
}

/**
 * Submits one replay answer. Same strict-sequential contract as the live
 * challenge: `position` is 1-based and must equal `current_position + 1`.
 */
export async function submitReplayAnswer(
  replayId: string,
  position: number,
  isCorrect: boolean,
): Promise<ReplayState> {
  const supabase = getBrowserClient()

  const { data, error } = await supabase.rpc('submit_replay_answer', {
    p_replay_id: replayId,
    p_position: position,
    p_is_correct: isCorrect,
  })

  if (error) throw error
  return parseReplayState(data)
}

/** Loads a challenge's questions ordered by 1-based position. */
export async function getChallengeQuestions(
  challengeId: string,
): Promise<WeeklyQuestionRow[]> {
  const supabase = getBrowserClient()

  const { data, error } = await supabase
    .from('weekly_challenge_questions')
    .select('*')
    .eq('challenge_id', challengeId)
    .order('position')

  if (error) throw error
  return data
}

/**
 * Loads the current user's progress for a challenge, or `null` if they haven't
 * started yet (a missing row is not an error).
 */
export async function getMyProgress(
  challengeId: string,
): Promise<WeeklyProgress | null> {
  const supabase = getBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('weekly_challenge_progress')
    .select('*')
    .eq('challenge_id', challengeId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) throw error
  return data
}

/**
 * Submits a single answer to the strict-sequential RPC. `position` is 1-based
 * and MUST equal `current_position + 1`, or the backend raises
 * `'expected position N, got M'`. Auto-creates the progress row on first call.
 */
export async function submitWeeklyAnswer(
  challengeId: string,
  position: number,
  isCorrect: boolean,
): Promise<unknown> {
  const supabase = getBrowserClient()

  const { data, error } = await supabase.rpc('submit_weekly_answer', {
    p_challenge_id: challengeId,
    p_position: position,
    p_is_correct: isCorrect,
  })

  if (error) throw error
  return data
}

/** Fetches a challenge's leaderboard (public read via RPC). */
export async function getWeeklyLeaderboard(
  challengeId: string,
  limit = 100,
): Promise<WeeklyLeaderRow[]> {
  const supabase = getBrowserClient()

  const { data, error } = await supabase.rpc(
    'get_weekly_challenge_leaderboard',
    { p_challenge_id: challengeId, p_limit: limit },
  )

  if (error) throw error
  return data
}
