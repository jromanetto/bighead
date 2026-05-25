import { supabase } from "./supabase";

/**
 * Per-user opt-in flags for contextual push notifications.
 * Mirrors public.notification_preferences (one row per user).
 *
 * Defaults to TRUE on the DB side when no row exists, so a user that
 * never opened this screen still receives notifications.
 */
export type NotificationPrefKey =
  | "friend_overtake"
  | "achievement"
  | "streak_warning";

export interface NotificationPreferences {
  friend_overtake: boolean;
  achievement: boolean;
  streak_warning: boolean;
}

const DEFAULT_PREFS: NotificationPreferences = {
  friend_overtake: true,
  achievement: true,
  streak_warning: true,
};

/**
 * Fetch the current user's notification preferences.
 * Returns sensible defaults (all enabled) if no row exists or user is anonymous.
 */
export async function getPrefs(
  userId?: string
): Promise<NotificationPreferences> {
  if (!userId) return DEFAULT_PREFS;

  // @ts-ignore — notification_preferences not in generated types
  const { data, error } = await supabase
    .from("notification_preferences")
    .select("friend_overtake, achievement, streak_warning")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return DEFAULT_PREFS;

  const row = data as any;
  return {
    friend_overtake: row.friend_overtake ?? true,
    achievement: row.achievement ?? true,
    streak_warning: row.streak_warning ?? true,
  };
}

/**
 * Upsert a single preference for the current user.
 * Anonymous users (no userId) are silently no-op'd.
 */
export async function updatePref(
  key: NotificationPrefKey,
  value: boolean,
  userId?: string
): Promise<void> {
  if (!userId) return;

  // @ts-ignore — notification_preferences not in generated types
  const { error } = await supabase
    .from("notification_preferences")
    .upsert(
      {
        user_id: userId,
        [key]: value,
        updated_at: new Date().toISOString(),
      } as any,
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("[notificationPreferences] updatePref error:", error);
    throw error;
  }
}
