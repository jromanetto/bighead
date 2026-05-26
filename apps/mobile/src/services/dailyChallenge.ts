import * as Sentry from "@sentry/react-native";
import { supabase } from "./supabase";
import type { Question } from "../types/database";
import { useFreeze as useStreakFreezeRpc } from "./streakFreeze";

/**
 * Returns YYYY-MM-DD for a date N days before today (UTC-day boundary, same
 * semantics as the existing toISOString().split("T")[0] elsewhere in this
 * service).
 */
const dayOffset = (offset: number): string =>
  new Date(Date.now() + offset * 86400000).toISOString().split("T")[0];

/**
 * If the user has a 1-day gap (last play = 2 days ago, today = first play
 * after the gap) AND auto_use_streak_freeze is enabled AND a freeze is
 * available, consume one freeze and pretend yesterday was played.
 *
 * Returns true if a freeze was consumed (caller should treat the streak as
 * still alive).
 */
const tryAutoConsumeStreakFreeze = async (
  userId: string,
  lastDailyChallenge: string | null
): Promise<boolean> => {
  if (!userId || !lastDailyChallenge) return false;

  const yesterday = dayOffset(-1);
  const twoDaysAgo = dayOffset(-2);

  // Only rescue an exactly 1-day gap. Bigger gaps reset the streak.
  if (lastDailyChallenge !== twoDaysAgo) return false;

  // Respect the user toggle (default true).
  try {
    const { data: settings } = await supabase
      .from("user_settings")
      .select("auto_use_streak_freeze")
      .eq("user_id", userId)
      .maybeSingle();
    const enabled = (settings as any)?.auto_use_streak_freeze;
    if (enabled === false) return false;
  } catch (err) {
    // If user_settings row doesn't exist yet, default to enabled.
    console.warn("[streak-freeze] settings lookup failed, defaulting to enabled", err);
  }

  const consumed = await useStreakFreezeRpc(userId);
  if (!consumed) return false;

  // Mark yesterday as the "last_daily_challenge" so downstream streak math
  // sees the day as played, keeping the streak alive transparently.
  try {
    await (supabase.from("users") as any)
      .update({ last_daily_challenge: yesterday })
      .eq("id", userId);
  } catch (err) {
    console.error("[streak-freeze] failed to bump last_daily_challenge", err);
  }

  return true;
};

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
  image_url?: string;
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
      image_url: q.image_url || undefined,
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

  let userData = user as any;
  const today = dayOffset(0);
  const yesterday = dayOffset(-1);

  // Auto-consume a streak freeze if there was a 1-day gap.
  const rescued = await tryAutoConsumeStreakFreeze(
    userId,
    userData?.last_daily_challenge ?? null
  );
  if (rescued) {
    const { data: refreshed } = await supabase
      .from("users")
      .select("daily_streak, last_daily_challenge, total_xp")
      .eq("id", userId)
      .single();
    userData = refreshed as any;
  }

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

  let userData = user as any;
  const yesterday = dayOffset(-1);

  // Auto-consume a streak freeze if there was a 1-day gap.
  const rescued = await tryAutoConsumeStreakFreeze(
    userId,
    userData?.last_daily_challenge ?? null
  );
  if (rescued) {
    const { data: refreshed } = await supabase
      .from("users")
      .select("daily_streak, last_daily_challenge, total_xp")
      .eq("id", userId)
      .single();
    userData = refreshed as any;
  }

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
 * Get user's daily challenge streak.
 *
 * If "yesterday" was missed BUT the user has a streak_freeze available
 * (and `auto_use_streak_freeze` is on), we transparently consume one freeze
 * to treat yesterday as played — keeping the streak alive.
 */
export const getDailyStreak = async (userId: string): Promise<number> => {
  const { data, error } = await supabase
    .from("users")
    .select("daily_streak, last_daily_challenge")
    .eq("id", userId)
    .single();

  if (error) throw error;

  let userData = data as any;
  const today = dayOffset(0);
  const yesterday = dayOffset(-1);

  // Healthy streak (played today or yesterday) — return as-is.
  if (
    userData?.last_daily_challenge === today ||
    userData?.last_daily_challenge === yesterday
  ) {
    return userData.daily_streak || 0;
  }

  // 1-day gap → try to rescue via a streak freeze.
  const rescued = await tryAutoConsumeStreakFreeze(
    userId,
    userData?.last_daily_challenge ?? null
  );

  if (rescued) {
    // Re-read the row (last_daily_challenge was just bumped to yesterday).
    const { data: refreshed } = await supabase
      .from("users")
      .select("daily_streak, last_daily_challenge")
      .eq("id", userId)
      .single();
    userData = refreshed as any;
    return userData?.daily_streak || 0;
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
    image_url: q.image_url || undefined,
  };
};

interface DailyQuestionRPC {
  id: string;
  date: string;
  question_id: string;
  question_text: string;
  category: string;
  difficulty: number;
  correct_answer: string;
  options: string[];
  image_url?: string;
}

/**
 * Get today's daily question (the one sent in the notification)
 */
export const getTodaysDailyQuestion = async (language: string = "en"): Promise<DailyQuestion | null> => {
  const today = new Date().toISOString().split("T")[0];

  // @ts-ignore - RPC function not in generated types
  const { data, error } = await supabase.rpc("get_or_create_daily_question", {
    target_date: today,
    p_language: language,
  });

  if (error) {
    console.error("Error fetching daily question:", error);
    return null;
  }

  const results = data as DailyQuestionRPC[] | null;
  if (!results || results.length === 0) return null;

  const q = results[0];

  // Options is a JSONB array with correct answer first, then wrong answers
  const options = q.options as string[];
  const shuffledAnswers = [...options].sort(() => Math.random() - 0.5);
  const correctIndex = shuffledAnswers.indexOf(q.correct_answer);

  return {
    id: q.question_id,
    question: q.question_text,
    answers: shuffledAnswers,
    correctIndex,
    category: q.category,
    difficulty: q.difficulty,
    image_url: q.image_url || undefined,
  };
};

/**
 * Number of questions in a single Daily Brain session
 */
export const DAILY_BRAIN_QUESTION_COUNT = 5;

interface DailyQuestionsV2RPC {
  out_id: string;
  out_position: number;
  out_date: string;
  out_question_id: string;
  out_question_text: string;
  out_category: string;
  out_difficulty: number;
  out_correct_answer: string;
  out_options: string[];
  out_image_url?: string;
}

/**
 * Get today's full Daily Brain set (5 questions, ordered by position).
 * Mix 2 easy / 2 medium / 1 hard, decided server-side.
 */
export const getTodaysDailyQuestions = async (
  language: string = "en"
): Promise<DailyQuestion[]> => {
  const today = new Date().toISOString().split("T")[0];

  // @ts-ignore - RPC function not in generated types
  const { data, error } = await supabase.rpc("get_or_create_daily_questions_v2", {
    target_date: today,
    p_language: language,
  });

  if (error) {
    console.error("Error fetching daily questions:", error);
    return [];
  }

  const results = data as DailyQuestionsV2RPC[] | null;
  if (!results || results.length === 0) return [];

  return results.map((q) => {
    const options = q.out_options as string[];
    const shuffledAnswers = [...options].sort(() => Math.random() - 0.5);
    const correctIndex = shuffledAnswers.indexOf(q.out_correct_answer);
    return {
      id: q.out_question_id,
      question: q.out_question_text,
      answers: shuffledAnswers,
      correctIndex,
      category: q.out_category,
      difficulty: q.out_difficulty,
      image_url: q.out_image_url || undefined,
    };
  });
};

/**
 * Submit Daily Brain (5 questions) result.
 * Scoring: 10 XP per correct + 25 XP bonus for a perfect 5/5.
 * Auto-consumes a streak_freeze on 1-day gap if available.
 */
export const submitDailyBrain = async (
  userId: string,
  correctCount: number,
  totalTimeMs: number
): Promise<{ xpEarned: number; newStreak: number; isNewRecord: boolean; perfect: boolean }> => {
  Sentry.addBreadcrumb({
    category: "daily-brain",
    message: "submitDailyBrain start",
    level: "info",
    data: { userId, correctCount, totalTimeMs },
  });
  const today = dayOffset(0);
  const yesterday = dayOffset(-1);
  const perfect = correctCount >= DAILY_BRAIN_QUESTION_COUNT;

  let xpEarned = correctCount * 10;
  if (perfect) xpEarned += 25;

  const { data: existingRecord } = await supabase
    .from("daily_survival_results")
    .select("best_score")
    .eq("user_id", userId)
    .order("best_score", { ascending: false })
    .limit(1)
    .single();

  const isNewRecord = !existingRecord || correctCount > ((existingRecord as any)?.best_score ?? 0);

  const { error: insertError } = await (supabase
    .from("daily_survival_results") as any)
    .insert({
      user_id: userId,
      date: today,
      score: correctCount,
      time_ms: totalTimeMs,
    });

  if (insertError && !insertError.message.includes("does not exist")) {
    console.error("Error saving daily brain:", insertError);
    Sentry.captureException(insertError, {
      tags: { feature: "daily-brain", step: "insert" },
      extra: { userId, correctCount, totalTimeMs },
    });
  }

  const { data: user } = await supabase
    .from("users")
    .select("daily_streak, last_daily_challenge")
    .eq("id", userId)
    .single();

  let userData = user as any;
  if (correctCount > 0) {
    const rescued = await tryAutoConsumeStreakFreeze(
      userId,
      userData?.last_daily_challenge ?? null
    );
    if (rescued) {
      const { data: refreshed } = await supabase
        .from("users")
        .select("daily_streak, last_daily_challenge")
        .eq("id", userId)
        .single();
      userData = refreshed as any;
    }
  }

  let newStreak = userData?.daily_streak || 0;
  if (correctCount > 0) {
    if (userData?.last_daily_challenge === yesterday) {
      newStreak = (userData.daily_streak || 0) + 1;
    } else if (userData?.last_daily_challenge !== today) {
      newStreak = 1;
    }
  }

  await (supabase.from("users") as any)
    .update({ daily_streak: newStreak, last_daily_challenge: today })
    .eq("id", userId);

  if (xpEarned > 0) {
    // @ts-ignore - RPC not in generated types
    await supabase.rpc("award_xp", {
      p_user_id: userId,
      p_amount: xpEarned,
      p_source: "daily",
      p_metadata: { correct: correctCount, total: DAILY_BRAIN_QUESTION_COUNT, perfect },
      p_dedupe_key: `daily_brain_${today}`,
    });
  }

  return { xpEarned, newStreak, isNewRecord, perfect };
};
