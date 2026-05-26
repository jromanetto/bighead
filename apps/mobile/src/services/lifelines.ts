import { supabase } from "./supabase";
import { claimLifelineXp } from "./universalXp";

export type LifelineType = "fifty_fifty" | "skip" | "plus_5s" | "double_xp";

export interface Lifelines {
  user_id: string;
  fifty_fifty: number;
  skip: number;
  plus_5s: number;
  double_xp: number;
  last_granted_at: string | null;
  created_at: string;
}

/**
 * Fetch current lifeline counts for the authenticated user.
 * Ensures the row exists (RPC auto-creates if missing).
 */
export async function fetchLifelines(): Promise<Lifelines | null> {
  // @ts-ignore - untyped RPC
  const { data, error } = await supabase.rpc("get_my_lifelines");
  if (error) {
    console.warn("[lifelines] fetchLifelines error", error.message);
    return null;
  }
  return (data as any) ?? null;
}

/**
 * Use a lifeline. Decrements the counter and returns the new count.
 * Throws if the user has 0 lifelines of that type.
 */
export async function useLifeline(type: LifelineType): Promise<number | null> {
  // @ts-ignore - untyped RPC
  const { data, error } = await supabase.rpc("use_lifeline", { p_type: type });
  if (error) {
    console.warn("[lifelines] useLifeline error", error.message);
    return null;
  }
  // Reward +2 XP per use (capped 10×/day server-side). Fire-and-forget.
  claimLifelineXp().catch(() => {});
  return typeof data === "number" ? data : null;
}

/**
 * Grant the daily lifelines bundle (idempotent per day).
 * Free user: +2 of each, capped at 5
 * Premium: +5 of each, capped at 10
 * Call lazily on app open.
 */
export async function grantDaily(): Promise<Lifelines | null> {
  // @ts-ignore - untyped RPC
  const { data, error } = await supabase.rpc("grant_daily_lifelines");
  if (error) {
    console.warn("[lifelines] grantDaily error", error.message);
    return null;
  }
  return (data as any) ?? null;
}

/** Helper: how many of a given type does the user have? */
export function lifelineCount(l: Lifelines | null, type: LifelineType): number {
  if (!l) return 0;
  return (l as any)[type] ?? 0;
}
