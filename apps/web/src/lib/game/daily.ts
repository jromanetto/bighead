import { getBrowserClient } from '#/lib/supabase/client'

import type { GameQuestion } from './questions'
import type { Database } from '#/lib/database.types'

type DailyQuestionRow =
  Database['public']['Functions']['get_or_create_daily_questions_v2']['Returns'][number]

/** Today's date as a local `YYYY-MM-DD` string (no timezone shift). */
function todayLocalISODate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function shuffle<T>(items: ReadonlyArray<T>, rng: () => number): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Turns a `get_or_create_daily_questions_v2` row into a UI-ready question.
 * Per the backend contract, the first element of `out_options` is the correct
 * answer; we shuffle and track its new index.
 */
export function formatDailyQuestion(
  row: Pick<
    DailyQuestionRow,
    | 'out_id'
    | 'out_question_id'
    | 'out_question_text'
    | 'out_category'
    | 'out_difficulty'
    | 'out_options'
    | 'out_image_url'
  >,
  rng: () => number = Math.random,
): GameQuestion {
  const options = row.out_options as string[]
  const correct = options[0]
  const answers = shuffle(options, rng)
  return {
    id: row.out_question_id,
    category: row.out_category,
    difficulty: row.out_difficulty,
    question: row.out_question_text,
    answers,
    correctIndex: answers.indexOf(correct),
    imageUrl: row.out_image_url,
  }
}

/** Fetches (creating if needed) today's 5 daily questions, formatted for play. */
export async function getDailyQuestions(
  language: 'fr' | 'en',
): Promise<GameQuestion[]> {
  const supabase = getBrowserClient()

  const { data, error } = await supabase.rpc(
    'get_or_create_daily_questions_v2',
    {
      target_date: todayLocalISODate(),
      p_language: language,
    },
  )
  if (error) throw error

  return data.map((row) => formatDailyQuestion(row))
}

/**
 * Whether the current user has already submitted today's daily survival run.
 * A missing row is treated as "not played" rather than an error.
 */
export async function hasPlayedToday(): Promise<{
  played: boolean
  score?: number
}> {
  const supabase = getBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { played: false }

  const { data, error } = await supabase
    .from('daily_survival_results')
    .select('score')
    .eq('user_id', user.id)
    .eq('date', todayLocalISODate())
    .maybeSingle()
  if (error) throw error
  if (!data) return { played: false }

  return { played: true, score: data.score }
}

/** Records the current user's daily survival result for today. */
export async function submitDailyResult(
  score: number,
  timeMs: number,
): Promise<void> {
  const supabase = getBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('submitDailyResult: no authenticated user')

  const { error } = await supabase.from('daily_survival_results').insert({
    user_id: user.id,
    date: todayLocalISODate(),
    score,
    time_ms: timeMs,
  })
  if (error) throw error
}
