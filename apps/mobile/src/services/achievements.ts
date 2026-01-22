import { supabase } from "./supabase";

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: "games" | "score" | "streak" | "social" | "special";
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
  is_secret: boolean;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

export interface NewAchievement {
  achievement_code: string;
  achievement_name: string;
  achievement_icon: string;
  xp_reward: number;
}

/**
 * Get all achievements
 */
export const getAllAchievements = async (): Promise<Achievement[]> => {
  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .order("category")
    .order("requirement_value");

  if (error) throw error;
  return data || [];
};

/**
 * Get user's unlocked achievements
 */
export const getUserAchievements = async (userId: string): Promise<UserAchievement[]> => {
  const { data, error } = await supabase
    .from("user_achievements")
    .select(`
      *,
      achievement:achievements(*)
    `)
    .eq("user_id", userId)
    .order("unlocked_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Check and award new achievements
 * Returns newly unlocked achievements
 */
export const checkAchievements = async (userId: string): Promise<NewAchievement[]> => {
  const { data, error } = await supabase
    .rpc("check_achievements", { p_user_id: userId });

  if (error) throw error;
  return (data as NewAchievement[]) || [];
};

/**
 * Get achievement progress for a user
 */
export const getAchievementProgress = async (userId: string): Promise<{
  total: number;
  unlocked: number;
  percentage: number;
}> => {
  const [allAchievements, userAchievements] = await Promise.all([
    getAllAchievements(),
    getUserAchievements(userId),
  ]);

  const total = allAchievements.filter(a => !a.is_secret).length;
  const unlocked = userAchievements.length;

  return {
    total,
    unlocked,
    percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0,
  };
};
