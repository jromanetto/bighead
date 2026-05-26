import { supabase } from "./supabase";
import { getTodayIsoDate } from "../utils/dates";

export interface WeeklyChallenge {
  id: string;
  theme_slug: string;
  theme_label_fr: string;
  theme_label_en: string;
  description_fr: string | null;
  description_en: string | null;
  emoji: string;
  color: string;
  target_category: string;
  start_date: string;
  end_date: string;
  status: "active" | "closed" | "archived" | "upcoming";
  total_questions: number;
  total_players: number;
}

export interface WeeklyQuestion {
  id: string;
  position: number;
  difficulty: number;
  question_text: string;
  correct_answer: string;
  wrong_answers: string[];
  learning_fact: string | null;
  image_url: string | null;
}

export interface WeeklyProgress {
  id: string;
  challenge_id: string;
  current_position: number;
  correct_count: number;
  day_streak: number;
  best_day_streak: number;
  daily_play_counts: Record<string, number>;
  completed_at: string | null;
  final_score: number | null;
  final_xp_awarded: number;
  badge_earned: string | null;
  last_played_at: string;
}

export interface WeeklyLeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url: string | null;
  correct_count: number;
  current_position: number;
  day_streak: number;
  completed_at: string | null;
  rank: number;
}

const DAILY_LIMIT_BEFORE_UNLOCK = 5;
const FREE_PLAY_FROM_DAY = 4;

export async function getActiveWeeklyChallenge(): Promise<WeeklyChallenge | null> {
  const { data, error } = await (supabase as any)
    .from("weekly_challenges")
    .select("*")
    .eq("status", "active")
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.warn("[weekly] active fetch:", error.message);
    return null;
  }
  return (data as WeeklyChallenge) ?? null;
}

export async function getMyWeeklyProgress(challengeId: string): Promise<WeeklyProgress | null> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return null;
  const { data, error } = await (supabase as any)
    .from("weekly_challenge_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("challenge_id", challengeId)
    .maybeSingle();
  if (error) {
    console.warn("[weekly] progress fetch:", error.message);
    return null;
  }
  return (data as WeeklyProgress) ?? null;
}

export async function getNextWeeklyQuestion(
  challengeId: string,
  language: "fr" | "en",
  position: number,
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
    if (error) console.warn("[weekly] question fetch:", error.message);
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

export async function submitWeeklyAnswer(
  challengeId: string,
  position: number,
  isCorrect: boolean,
): Promise<{
  current_position: number;
  correct_count: number;
  day_streak: number;
  completed: boolean;
  today_count: number;
} | null> {
  // @ts-ignore not in generated types
  const { data, error } = await supabase.rpc("submit_weekly_answer", {
    p_challenge_id: challengeId,
    p_position: position,
    p_is_correct: isCorrect,
  });
  if (error) {
    console.warn("[weekly] submit error:", error.message);
    return null;
  }
  return data as any;
}

export async function getWeeklyLeaderboard(
  challengeId: string,
  limit = 50,
): Promise<WeeklyLeaderboardEntry[]> {
  // @ts-ignore
  const { data, error } = await supabase.rpc("get_weekly_challenge_leaderboard", {
    p_challenge_id: challengeId,
    p_limit: limit,
  });
  if (error) {
    console.warn("[weekly] leaderboard error:", error.message);
    return [];
  }
  return (data as WeeklyLeaderboardEntry[]) ?? [];
}

export function daysIntoChallenge(c: Pick<WeeklyChallenge, "start_date">): number {
  const start = new Date(c.start_date + "T00:00:00Z");
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export function dayQuotaRemaining(
  challenge: Pick<WeeklyChallenge, "start_date">,
  progress: WeeklyProgress | null,
): { remaining: number; unlimited: boolean } {
  const dayIdx = daysIntoChallenge(challenge);
  if (dayIdx >= FREE_PLAY_FROM_DAY) return { remaining: Infinity, unlimited: true };
  const today = getTodayIsoDate();
  const played = progress?.daily_play_counts?.[today] ?? 0;
  return { remaining: Math.max(0, DAILY_LIMIT_BEFORE_UNLOCK - played), unlimited: false };
}

export function timeUntilEnd(c: Pick<WeeklyChallenge, "end_date">): {
  days: number;
  hours: number;
  totalMs: number;
} {
  const end = new Date(c.end_date + "T23:59:59Z");
  const ms = end.getTime() - Date.now();
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    totalMs: Math.max(0, ms),
  };
}

export function shuffleAnswers(question: WeeklyQuestion): string[] {
  const arr = [question.correct_answer, ...question.wrong_answers];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
