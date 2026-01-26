import { supabase } from "./supabase";
import type { Question } from "../types/database";

export interface DailyChallenge {
  out_challenge_id: string;
  out_challenge_date: string;
  out_question_id: string;
  out_category: string;
  out_bonus_xp: number;
  out_question_text: string;
  out_player_name: string;
  out_options: {
    A: string;
    B: string;
    C: string;
    D: string;
    correct: string;
  };
}

export interface UserDailyChallengeResult {
  id: string;
  user_id: string;
  challenge_id: string;
  completed_at: string;
  is_correct: boolean;
  answer_time_ms: number;
}

export interface DailyQuestion {
  id: string;
  question: string;
  answers: string[];
  correctIndex: number;
  category: string;
  difficulty: number;
}

/**
 * Get today's daily challenge (legacy - single question)
 */
export const getDailyChallenge = async (): Promise<DailyChallenge | null> => {
  const { data, error } = await supabase
    .rpc("get_daily_challenge");

  if (error) throw error;
  return data?.[0] || null;
};

/**
 * Get questions for daily survival mode
 */
export const getDailySurvivalQuestions = async (
  count: number = 10,
  excludeIds: string[] = [],
  language: string = "fr"
): Promise<DailyQuestion[]> => {
  let query = supabase
    .from("questions")
    .select("*")
    .eq("is_active", true)
    .eq("language", language);

  if (excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`);
  }

  const { data, error } = await query.limit(count * 2);

  if (error) throw error;

  // Shuffle and format questions
  const shuffled = (data || []).sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((q: Question) => {
    const allAnswers = [q.correct_answer, ...q.wrong_answers];
    const shuffledAnswers = allAnswers.sort(() => Math.random() - 0.5);
    const correctIndex = shuffledAnswers.indexOf(q.correct_answer);

    return {
      id: q.id,
      question: q.question_text,
      answers: shuffledAnswers,
      correctIndex,
      category: q.category,
      difficulty: q.difficulty,
    };
  });
};

/**
 * Check if user has completed today's challenge
 */
export const hasCompletedDailyChallenge = async (userId: string): Promise<boolean> => {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("user_daily_challenges")
    .select("id, daily_challenges!inner(challenge_date)")
    .eq("user_id", userId)
    .eq("daily_challenges.challenge_date", today)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return !!data;
};

/**
 * Submit daily challenge answer (legacy - single question)
 */
export const submitDailyChallenge = async (
  userId: string,
  challengeId: string,
  isCorrect: boolean,
  answerTimeMs: number
): Promise<{ xpEarned: number; newStreak: number }> => {
  // Insert the result
  const { error: insertError } = await supabase
    .from("user_daily_challenges")
    .insert({
      user_id: userId,
      challenge_id: challengeId,
      is_correct: isCorrect,
      answer_time_ms: answerTimeMs,
    } as any);

  if (insertError) throw insertError;

  // Get challenge bonus XP
  const { data: challenge } = await supabase
    .from("daily_challenges")
    .select("bonus_xp")
    .eq("id", challengeId)
    .single();

  const bonusXp = isCorrect ? ((challenge as any)?.bonus_xp || 100) : 25;

  // Update user stats
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("daily_streak, last_daily_challenge, total_xp")
    .eq("id", userId)
    .single();

  if (userError) throw userError;

  const userData = user as any;
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  let newStreak = 1;
  if (userData?.last_daily_challenge === yesterday) {
    newStreak = (userData.daily_streak || 0) + 1;
  }

  // Update user
  const { error: updateError } = await (supabase
    .from("users") as any)
    .update({
      daily_streak: newStreak,
      last_daily_challenge: today,
      total_xp: (userData?.total_xp || 0) + bonusXp,
    })
    .eq("id", userId);

  if (updateError) throw updateError;

  return {
    xpEarned: bonusXp,
    newStreak,
  };
};

/**
 * Submit daily survival result
 */
export const submitDailySurvival = async (
  userId: string,
  score: number,
  totalTimeMs: number
): Promise<{ xpEarned: number; newStreak: number; isNewRecord: boolean }> => {
  const today = new Date().toISOString().split("T")[0];

  // Calculate XP based on score (10 XP per correct answer + bonus for high scores)
  let xpEarned = score * 10;
  if (score >= 10) xpEarned += 50; // Bonus for 10+
  if (score >= 20) xpEarned += 100; // Bonus for 20+
  if (score >= 30) xpEarned += 200; // Bonus for 30+

  // Check if this is a new record
  const { data: existingRecord } = await supabase
    .from("daily_survival_results")
    .select("best_score")
    .eq("user_id", userId)
    .order("best_score", { ascending: false })
    .limit(1)
    .single();

  const isNewRecord = !existingRecord || score > (existingRecord as any)?.best_score;

  // Insert today's result
  const { error: insertError } = await supabase
    .from("daily_survival_results")
    .insert({
      user_id: userId,
      date: today,
      score,
      time_ms: totalTimeMs,
    } as any);

  // If table doesn't exist, just continue
  if (insertError && !insertError.message.includes("does not exist")) {
    console.error("Error saving daily survival:", insertError);
  }

  // Update user stats
  const { data: user } = await supabase
    .from("users")
    .select("daily_streak, last_daily_challenge, total_xp")
    .eq("id", userId)
    .single();

  const userData = user as any;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  let newStreak = 1;
  if (userData?.last_daily_challenge === yesterday) {
    newStreak = (userData.daily_streak || 0) + 1;
  }

  // Update user
  await (supabase.from("users") as any)
    .update({
      daily_streak: newStreak,
      last_daily_challenge: today,
      total_xp: (userData?.total_xp || 0) + xpEarned,
    })
    .eq("id", userId);

  return {
    xpEarned,
    newStreak,
    isNewRecord,
  };
};

/**
 * Get user's daily challenge streak
 */
export const getDailyStreak = async (userId: string): Promise<number> => {
  const { data, error } = await supabase
    .from("users")
    .select("daily_streak, last_daily_challenge")
    .eq("id", userId)
    .single();

  if (error) throw error;

  const userData = data as any;
  // Check if streak is still valid (completed yesterday or today)
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (userData?.last_daily_challenge === today || userData?.last_daily_challenge === yesterday) {
    return userData.daily_streak || 0;
  }

  return 0;
};

/**
 * Check if user has already played today's daily survival
 */
export const hasPlayedDailySurvivalToday = async (userId: string): Promise<{ played: boolean; score?: number }> => {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("daily_survival_results")
    .select("score")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found, which is fine
    console.error("Error checking daily survival:", error);
    return { played: false };
  }

  return {
    played: !!data,
    score: (data as any)?.score,
  };
};

/**
 * Get next batch of questions for survival mode (for infinite play)
 */
export const getNextSurvivalQuestion = async (
  excludeIds: string[],
  language: string = "fr"
): Promise<DailyQuestion | null> => {
  let query = supabase
    .from("questions")
    .select("*")
    .eq("is_active", true)
    .eq("language", language);

  if (excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`);
  }

  const { data, error } = await query.limit(10);

  if (error) {
    console.error("Error fetching question:", error);
    return null;
  }

  if (!data || data.length === 0) return null;

  // Pick random question from batch
  const q = data[Math.floor(Math.random() * data.length)] as Question;

  const allAnswers = [q.correct_answer, ...q.wrong_answers];
  const shuffledAnswers = allAnswers.sort(() => Math.random() - 0.5);
  const correctIndex = shuffledAnswers.indexOf(q.correct_answer);

  return {
    id: q.id,
    question: q.question_text,
    answers: shuffledAnswers,
    correctIndex,
    category: q.category,
    difficulty: q.difficulty,
  };
};
