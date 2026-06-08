import { getBrowserClient } from '#/lib/supabase/client'

import type { Database } from '#/lib/database.types'

type UnseenQuestionRow =
  Database['public']['Functions']['get_unseen_questions']['Returns'][number]

export interface GameQuestion {
  id: string
  category: string
  difficulty: number
  question: string
  answers: string[]
  correctIndex: number
  imageUrl: string | null
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

/**
 * Turns a `get_unseen_questions` row into a UI-ready question: the correct and
 * wrong answers are combined and shuffled, and `correctIndex` tracks where the
 * correct answer landed.
 */
export function formatQuestion(
  row: Pick<
    UnseenQuestionRow,
    | 'id'
    | 'question_text'
    | 'correct_answer'
    | 'wrong_answers'
    | 'category'
    | 'difficulty'
    | 'image_url'
  >,
  rng: () => number = Math.random,
): GameQuestion {
  const answers = shuffle([row.correct_answer, ...row.wrong_answers], rng)
  return {
    id: row.id,
    category: row.category,
    difficulty: row.difficulty,
    question: row.question_text,
    answers,
    correctIndex: answers.indexOf(row.correct_answer),
    imageUrl: row.image_url,
  }
}

/**
 * Fetches questions the current user has not yet seen and formats them for play.
 * Throws if there is no authenticated user.
 */
export async function getUnseenQuestions(
  limit: number,
  language: 'fr' | 'en',
): Promise<GameQuestion[]> {
  const supabase = getBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('getUnseenQuestions: no authenticated user')
  }

  // Omit p_category so the RPC's `p_category IS NULL` branch returns every
  // category. Passing '' would filter to questions whose category equals the
  // empty string (none), yielding zero results.
  const { data, error } = await supabase.rpc('get_unseen_questions', {
    p_user_id: user.id,
    p_limit: limit,
    p_language: language,
  })
  if (error) throw error

  return data.map((row) => formatQuestion(row))
}

/**
 * Records that the current user has seen a question (fire-and-forget). Failures
 * are swallowed so they never block gameplay.
 */
export function markQuestionSeen(questionId: string, wasCorrect: boolean): void {
  const supabase = getBrowserClient()

  void supabase.auth
    .getUser()
    .then(({ data: { user } }) => {
      if (!user) return
      return supabase.rpc('mark_question_seen', {
        p_user_id: user.id,
        p_question_id: questionId,
        p_was_correct: wasCorrect,
      })
    })
    .then(() => undefined)
    .catch(() => undefined)
}
