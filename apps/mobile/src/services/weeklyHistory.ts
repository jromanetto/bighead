import { supabase } from "./supabase";
import type { WeeklyQuestion } from "./weeklyChallenge";

export interface HistoryEntry {
  challenge_id: string;
  challenge_type: "themed" | "news";
  theme_slug: string;
  theme_label_fr: string;
  theme_label_en: string;
  description_fr: string | null;
  description_en: string | null;
  emoji: string;
  color: string;
  target_category: string | null;
  target_difficulty: number | null;
  start_date: string;
  end_date: string;
  total_questions: number;
  // Progress en LEFT JOIN côté RPC : null si le quiz n'a jamais été joué.
  final_score: number | null;
  correct_count: number | null;
  badge_earned: string | null;
  completed_at: string | null;
  final_xp_awarded: number | null;
  best_replay_score: number | null;
}

export interface ReplaySession {
  current_position: number;
  correct_count: number;
  completed: boolean;
}

export async function getMyChallengeHistory(): Promise<HistoryEntry[]> {
  // @ts-ignore not in generated types
  const { data, error } = await supabase.rpc("get_my_challenge_history");
  if (error) {
    console.warn("[weeklyHistory] history fetch:", error.message);
    return [];
  }
  return (data as HistoryEntry[]) ?? [];
}

export async function startReplay(challengeId: string): Promise<string | null> {
  // @ts-ignore not in generated types
  const { data, error } = await supabase.rpc("start_weekly_replay", {
    p_challenge_id: challengeId,
  });
  if (error) {
    console.warn("[weeklyHistory] startReplay:", error.message);
    return null;
  }
  return (data as string) ?? null;
}

export async function getReplayQuestion(
  challengeId: string,
  position: number,
  language: "fr" | "en",
): Promise<WeeklyQuestion | null> {
  const { data, error } = await (supabase as any)
    .from("weekly_challenge_questions")
    .select(
      `id, position, difficulty,
       question_fr, correct_answer_fr, wrong_answers_fr, learning_fact_fr,
       question_en, correct_answer_en, wrong_answers_en, learning_fact_en,
       image_url`,
    )
    .eq("challenge_id", challengeId)
    .eq("position", position)
    .maybeSingle();
  if (error || !data) {
    if (error) console.warn("[weeklyHistory] replay question fetch:", error.message);
    return null;
  }
  return {
    id: data.id,
    position: data.position,
    difficulty: data.difficulty,
    question_text: language === "fr" ? data.question_fr : data.question_en,
    correct_answer: language === "fr" ? data.correct_answer_fr : data.correct_answer_en,
    wrong_answers: language === "fr" ? data.wrong_answers_fr : data.wrong_answers_en,
    learning_fact: language === "fr" ? data.learning_fact_fr : data.learning_fact_en,
    image_url: data.image_url,
  };
}

export async function submitReplayAnswer(
  replayId: string,
  position: number,
  isCorrect: boolean,
): Promise<ReplaySession | null> {
  // @ts-ignore not in generated types
  const { data, error } = await supabase.rpc("submit_replay_answer", {
    p_replay_id: replayId,
    p_position: position,
    p_is_correct: isCorrect,
  });
  if (error) {
    console.warn("[weeklyHistory] submitReplayAnswer:", error.message);
    return null;
  }
  return data as ReplaySession;
}

/**
 * Fetch a single challenge by id, regardless of status.
 * Used by the replay screen to render theme metadata for archived challenges.
 */
export async function getChallengeById(challengeId: string) {
  const { data, error } = await (supabase as any)
    .from("weekly_challenges")
    .select("*")
    .eq("id", challengeId)
    .maybeSingle();
  if (error) {
    console.warn("[weeklyHistory] challenge fetch:", error.message);
    return null;
  }
  return data;
}
