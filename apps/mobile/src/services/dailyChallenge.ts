import { supabase } from "./supabase";

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

/**
 * Get today's daily challenge
 */
export const getDailyChallenge = async (): Promise<DailyChallenge | null> => {
  const { data, error } = await supabase
    .rpc("get_daily_challenge");

  if (error) throw error;
  return data?.[0] || null;
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
 * Submit daily challenge answer
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
