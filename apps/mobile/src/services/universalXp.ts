/**
 * Universal XP service — claims for non-gameplay activities.
 *
 * Wraps the server-side RPCs added in 20260526110000_universal_xp.sql:
 *   - claim_daily_login_bonus      (once per UTC day, streak multiplier)
 *   - claim_first_time_milestone   (lifetime-once XP bumps)
 *   - claim_lifeline_use_xp        (+2/use, capped 20 XP/day)
 *
 * All calls are best-effort: failures are swallowed (warn-only) and
 * NEVER throw — XP rewards must not crash the app.
 */

import * as Sentry from "@sentry/react-native";
import { supabase } from "./supabase";

export type MilestoneKey =
  | "onboarding_complete"
  | "profile_complete"
  | "first_friend"
  | "first_share"
  | "first_rating"
  | "first_feedback"
  | "language_change"
  | "tutorial_complete";

export interface XpClaimResult {
  xp_awarded: number;
  new_total?: number;
  reason?: string;
  streak?: number;
  multiplier?: number;
  milestone?: string;
  count_today?: number;
}

const captureWarn = (rpc: string, error: unknown) => {
  try {
    Sentry.addBreadcrumb({
      category: "xp",
      message: `${rpc} failed`,
      level: "warning",
      data: { error: String(error) },
    });
  } catch {
    // observability never crashes
  }
};

/**
 * Claim the daily login bonus. Idempotent per UTC day.
 * Returns `{ xp_awarded: 0 }` if already claimed today.
 */
export async function claimDailyLoginBonus(): Promise<XpClaimResult> {
  try {
    // @ts-ignore — untyped RPC
    const { data, error } = await supabase.rpc("claim_daily_login_bonus");
    if (error) {
      console.warn("[universalXp] claim_daily_login_bonus error", error.message);
      captureWarn("claim_daily_login_bonus", error);
      return { xp_awarded: 0, reason: "rpc_error" };
    }
    return (data as XpClaimResult) ?? { xp_awarded: 0 };
  } catch (e) {
    console.warn("[universalXp] claim_daily_login_bonus threw", e);
    captureWarn("claim_daily_login_bonus", e);
    return { xp_awarded: 0, reason: "exception" };
  }
}

/**
 * Claim a one-time milestone. Idempotent across the user's lifetime.
 * Safe to call defensively from anywhere — server enforces uniqueness.
 */
export async function claimMilestone(milestone: MilestoneKey): Promise<XpClaimResult> {
  try {
    // @ts-ignore — untyped RPC
    const { data, error } = await supabase.rpc("claim_first_time_milestone", {
      p_milestone: milestone,
    });
    if (error) {
      console.warn("[universalXp] claim_first_time_milestone error", error.message);
      captureWarn("claim_first_time_milestone", error);
      return { xp_awarded: 0, reason: "rpc_error" };
    }
    return (data as XpClaimResult) ?? { xp_awarded: 0 };
  } catch (e) {
    console.warn("[universalXp] claim_first_time_milestone threw", e);
    captureWarn("claim_first_time_milestone", e);
    return { xp_awarded: 0, reason: "exception" };
  }
}

/**
 * Reward a single lifeline use. +2 XP, capped 10×/day server-side.
 * Returns `{ xp_awarded: 0 }` past the daily cap.
 */
export async function claimLifelineXp(): Promise<XpClaimResult> {
  try {
    // @ts-ignore — untyped RPC
    const { data, error } = await supabase.rpc("claim_lifeline_use_xp");
    if (error) {
      console.warn("[universalXp] claim_lifeline_use_xp error", error.message);
      captureWarn("claim_lifeline_use_xp", error);
      return { xp_awarded: 0, reason: "rpc_error" };
    }
    return (data as XpClaimResult) ?? { xp_awarded: 0 };
  } catch (e) {
    console.warn("[universalXp] claim_lifeline_use_xp threw", e);
    captureWarn("claim_lifeline_use_xp", e);
    return { xp_awarded: 0, reason: "exception" };
  }
}
