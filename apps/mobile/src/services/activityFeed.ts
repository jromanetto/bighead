import { supabase } from "./supabase";

export type ActivityEventType =
  | "level_up"
  | "achievement_unlocked"
  | "weekly_completed"
  | "high_score"
  | "streak_milestone"
  | "referral_completed"
  | "badge_earned";

export interface ActivityEvent {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  event_type: ActivityEventType;
  payload: Record<string, any>;
  created_at: string;
}

/**
 * Fetch recent activity events from all users (paginated).
 * Backed by the `get_activity_feed` RPC, which caps p_limit at 100.
 */
export async function getActivityFeed(
  limit = 30,
  offset = 0,
): Promise<ActivityEvent[]> {
  // @ts-ignore RPC not in generated types
  const { data, error } = await supabase.rpc("get_activity_feed", {
    p_limit: limit,
    p_offset: offset,
  });
  if (error) {
    console.warn("[activityFeed] fetch error:", error.message);
    return [];
  }
  return (data as ActivityEvent[]) ?? [];
}
