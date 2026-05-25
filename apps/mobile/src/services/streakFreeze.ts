import { supabase } from "./supabase";

export type StreakFreezeSource = "weekly_free" | "daily_premium";

export interface StreakFreeze {
  id: string;
  user_id: string;
  granted_at: string;
  used_at: string | null;
  expires_at: string;
  source: StreakFreezeSource;
}

/**
 * Get the number of currently-available (unused, not expired) streak freezes
 * for the authenticated user.
 */
export const fetchAvailable = async (): Promise<number> => {
  // @ts-ignore - RPC not in generated types
  const { data, error } = await supabase.rpc("available_streak_freezes");
  if (error) {
    console.error("[streakFreeze] fetchAvailable error", error);
    return 0;
  }
  return typeof data === "number" ? data : Number(data) || 0;
};

/**
 * Atomically consume one streak freeze (oldest first).
 * Returns true if a freeze was consumed.
 */
export const useFreeze = async (userId: string): Promise<boolean> => {
  // @ts-ignore - RPC not in generated types
  const { data, error } = await supabase.rpc("use_streak_freeze", {
    p_user_id: userId,
  });
  if (error) {
    console.error("[streakFreeze] useFreeze error", error);
    return false;
  }
  return data === true;
};

/**
 * Get this user's recent streak freezes (granted + used).
 * Newest first.
 */
export const history = async (
  userId: string,
  limit = 20
): Promise<StreakFreeze[]> => {
  const { data, error } = await supabase
    .from("streak_freezes" as any)
    .select("*")
    .eq("user_id", userId)
    .order("granted_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[streakFreeze] history error", error);
    return [];
  }
  return (data as StreakFreeze[] | null) ?? [];
};

/**
 * Check whether the user has a streak freeze that was used within the last
 * 36 hours — used by the home screen to surface the "streak rescued" modal.
 */
export const wasStreakRescuedRecently = async (
  userId: string
): Promise<StreakFreeze | null> => {
  const since = new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("streak_freezes" as any)
    .select("*")
    .eq("user_id", userId)
    .not("used_at", "is", null)
    .gte("used_at", since)
    .order("used_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[streakFreeze] wasStreakRescuedRecently error", error);
    return null;
  }
  return (data as StreakFreeze | null) ?? null;
};
