import { supabase } from "./supabase";

/**
 * Audio Quiz service — wraps RPC calls for the music/sound mode.
 *
 * NOTE: Content (real audio URLs) is seeded later. The DB currently
 * holds placeholder rows pointing at a public-domain piano sample so
 * the mode is end-to-end playable for QA.
 * TODO: populate audio_questions with real, licensed content.
 */

export interface AudioQuestion {
  id: string;
  audio_url: string;
  audio_duration_seconds: number;
  audio_credit: string | null;
  category: string;
  subcategory: string | null;
  question: string; // already localised by RPC
  correct_answer: string;
  wrong_answers: string[];
  difficulty: number;
}

export interface FormattedAudioQuestion {
  id: string;
  audioUrl: string;
  audioDurationSeconds: number;
  audioCredit: string | null;
  category: string;
  subcategory: string | null;
  question: string;
  answers: string[];
  correctIndex: number;
  difficulty: number;
}

/**
 * Fetch N random audio questions for a quiz round.
 */
export async function getRandomAudioQuestions(
  count: number = 10,
  language: string = "en",
  category?: string
): Promise<AudioQuestion[]> {
  // @ts-ignore - RPC types not generated
  const { data, error } = await supabase.rpc("get_random_audio_questions", {
    p_count: count,
    p_language: language,
    p_category: category || null,
  });

  if (error) {
    console.error("[audioQuiz] get_random_audio_questions error:", error.message);
    return [];
  }

  return (data as AudioQuestion[]) || [];
}

/**
 * Shuffle answers and surface the new correct index.
 */
export function formatAudioQuestion(q: AudioQuestion): FormattedAudioQuestion {
  const all = [q.correct_answer, ...q.wrong_answers];
  const shuffled = all.sort(() => Math.random() - 0.5);
  const correctIndex = shuffled.indexOf(q.correct_answer);
  return {
    id: q.id,
    audioUrl: q.audio_url,
    audioDurationSeconds: q.audio_duration_seconds,
    audioCredit: q.audio_credit,
    category: q.category,
    subcategory: q.subcategory,
    question: q.question,
    answers: shuffled,
    correctIndex,
    difficulty: q.difficulty,
  };
}

export function formatAudioQuestions(questions: AudioQuestion[]): FormattedAudioQuestion[] {
  return questions.map(formatAudioQuestion);
}

/**
 * Record play stats. Best-effort; failures are logged but never thrown.
 */
export async function recordAudioQuestionResult(
  questionId: string,
  wasCorrect: boolean
): Promise<void> {
  try {
    // @ts-ignore - RPC types not generated
    const { error } = await supabase.rpc("record_audio_question_result", {
      p_question_id: questionId,
      p_was_correct: wasCorrect,
    });
    if (error) console.warn("[audioQuiz] record result error:", error.message);
  } catch (e) {
    console.warn("[audioQuiz] record result threw:", e);
  }
}

/**
 * Compute XP for an audio quiz round.
 * 10 XP per correct + 50 XP bonus for a perfect 10/10.
 */
export function computeAudioQuizXP(correctCount: number, totalQuestions: number): {
  base: number;
  bonus: number;
  total: number;
  isPerfect: boolean;
} {
  const base = correctCount * 10;
  const isPerfect = totalQuestions > 0 && correctCount === totalQuestions;
  const bonus = isPerfect ? 50 : 0;
  return { base, bonus, total: base + bonus, isPerfect };
}
