/**
 * Referral Service
 * Handles invite codes and referral rewards
 *
 * v2 (2026-05-25): level-5 gated rewards (500 XP + 30 days premium for both
 * referrer and referee). Backed by `referral_codes` + `referrals` tables.
 * Legacy `users.referral_code` / `users.referred_by` columns are still mirrored
 * server-side for backwards compatibility.
 */

import { supabase } from "./supabase";
import { Platform } from "react-native";
import * as Clipboard from "expo-clipboard";

const REFERRAL_REWARD_HINTS = 1;
const APP_STORE_URL = "https://apps.apple.com/app/bighead-quiz-culture/id6758253365";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.jroma51.bighead";
const SHARE_URL = "https://bighead.app";

export interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  totalHintsEarned: number;
  pendingReferrals: number;
}

export interface ReferralStatsV2 {
  code: string;
  totalInvited: number;
  completed: number;
  pending: number;
}

export type RedeemResult =
  | { success: true; referrerId: string }
  | { success: false; error: "code_not_found" | "self_referral" | "already_redeemed" | "invalid_code" | "not_authenticated" | "unknown" };

/**
 * Generate a unique referral code for a user
 * Uses a combination of username prefix and random characters
 */
export const generateReferralCode = (userId: string, username?: string): string => {
  const prefix = username
    ? username.substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, "")
    : "BH";
  const suffix = userId.substring(0, 6).toUpperCase();
  return `${prefix}${suffix}`;
};

/**
 * Get or create referral code for user
 */
export const getReferralCode = async (userId: string): Promise<string | null> => {
  try {
    // Check if user has a referral code
    const { data, error } = await supabase
      .from("users")
      .select("referral_code, username")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching referral code:", error);
      return null;
    }

    const userData = data as { referral_code: string | null; username: string };

    // If user already has a code, return it
    if (userData.referral_code) {
      return userData.referral_code;
    }

    // Generate a new code
    const newCode = generateReferralCode(userId, userData.username);

    // Save it to the user's profile
    const { error: updateError } = await (supabase
      .from("users") as any)
      .update({ referral_code: newCode })
      .eq("id", userId);

    if (updateError) {
      console.error("Error saving referral code:", updateError);
      // Return the generated code anyway for display
    }

    return newCode;
  } catch (error) {
    console.error("Error in getReferralCode:", error);
    return null;
  }
};

/**
 * Get referral statistics for a user
 */
export const getReferralStats = async (userId: string): Promise<ReferralStats | null> => {
  try {
    const code = await getReferralCode(userId);
    if (!code) return null;

    // Count users who were referred by this user
    const { count, error } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("referred_by", code);

    if (error) {
      console.error("Error fetching referral stats:", error);
    }

    const totalReferrals = count || 0;

    return {
      referralCode: code,
      totalReferrals,
      totalHintsEarned: totalReferrals * REFERRAL_REWARD_HINTS,
      pendingReferrals: 0, // Could track pending invites
    };
  } catch (error) {
    console.error("Error in getReferralStats:", error);
    return null;
  }
};

/**
 * Apply a referral code when a new user signs up
 * Uses RPC function for atomic transaction
 */
export const applyReferralCode = async (
  newUserId: string,
  referralCode: string
): Promise<{ success: boolean; error?: string; reward?: number }> => {
  try {
    const { data, error } = await supabase.rpc("apply_referral", {
      p_user_id: newUserId,
      p_referral_code: referralCode.toUpperCase(),
    } as any);

    if (error) {
      console.error("Error applying referral:", error);
      return { success: false, error: "Failed to apply referral code" };
    }

    // RPC returns JSON with success/error
    const result = data as { success: boolean; error?: string; reward?: number };
    return result;
  } catch (error) {
    console.error("Error applying referral code:", error);
    return { success: false, error: "An error occurred" };
  }
};

/**
 * Get the share message for inviting friends
 */
export const getShareMessage = (referralCode: string, lang: "fr" | "en" | "es" | "de" = "fr"): string => {
  const storeUrl = Platform.OS === "ios" ? APP_STORE_URL : PLAY_STORE_URL;

  if (lang === "en") {
    return `Join me on BIGHEAD - the ultimate trivia quiz! 🧠\n\nUse my code ${referralCode} to get a free hint!\n\nDownload now:\n${storeUrl}`;
  }

  if (lang === "es") {
    return `¡Únete a mí en BIGHEAD - el quiz de cultura general definitivo! 🧠\n\nUsa mi código ${referralCode} para conseguir una pista gratis.\n\nDescárgala aquí:\n${storeUrl}`;
  }

  if (lang === "de") {
    return `Komm zu mir auf BIGHEAD - das ultimative Wissens-Quiz! 🧠\n\nNutz meinen Code ${referralCode} und hol dir einen Gratis-Tipp!\n\nJetzt laden:\n${storeUrl}`;
  }

  return `Rejoins-moi sur BIGHEAD - le quiz culture gé ultime ! 🧠\n\nUtilise mon code ${referralCode} pour obtenir un indice gratuit !\n\nTélécharge ici :\n${storeUrl}`;
};

/**
 * Share the referral code via native share sheet
 */
export const shareReferralCode = async (referralCode: string): Promise<boolean> => {
  try {
    const message = getShareMessage(referralCode);
    await Clipboard.setStringAsync(message);
    return true;
  } catch (error) {
    console.error("Error sharing referral code:", error);
    return false;
  }
};

/**
 * Copy referral code to clipboard
 */
export const copyReferralCode = async (code: string): Promise<boolean> => {
  try {
    await Clipboard.setStringAsync(code);
    return true;
  } catch (error) {
    console.error("Error copying to clipboard:", error);
    return false;
  }
};

// =====================================================================
// v2 API — level-5 gated rewards (500 XP + 30 days premium for both)
// =====================================================================

/**
 * Ensure the current user has a referral code (server-generated, format BH-XXXXXX).
 * Idempotent. Returns the code or null on error.
 */
export const ensureReferralCode = async (userId: string): Promise<string | null> => {
  try {
    // @ts-ignore — RPC not in generated types
    const { data, error } = await supabase.rpc("ensure_referral_code", {
      p_user_id: userId,
    });
    if (error) {
      console.error("ensure_referral_code error:", error);
      return null;
    }
    return (data as string) || null;
  } catch (e) {
    console.error("ensureReferralCode failed:", e);
    return null;
  }
};

/**
 * Redeem a referral code as the currently authenticated user.
 * Server-side check enforces no self-referral and no double-redeem.
 */
export const redeemReferralCode = async (code: string): Promise<RedeemResult> => {
  try {
    // @ts-ignore — RPC not in generated types
    const { data, error } = await supabase.rpc("redeem_referral_code", {
      p_code: code,
    });
    if (error) {
      console.error("redeem_referral_code error:", error);
      return { success: false, error: "unknown" };
    }
    const result = data as {
      success: boolean;
      error?: RedeemResult extends { success: false } ? RedeemResult["error"] : string;
      referrer_id?: string;
    };
    if (result?.success && result.referrer_id) {
      return { success: true, referrerId: result.referrer_id };
    }
    return {
      success: false,
      error: (result?.error as any) || "unknown",
    };
  } catch (e) {
    console.error("redeemReferralCode failed:", e);
    return { success: false, error: "unknown" };
  }
};

/**
 * Fetch v2 referral stats for the currently authenticated user.
 */
export const getReferralStatsV2 = async (): Promise<ReferralStatsV2 | null> => {
  try {
    // @ts-ignore — RPC not in generated types
    const { data, error } = await supabase.rpc("get_referral_stats");
    if (error) {
      console.error("get_referral_stats error:", error);
      return null;
    }
    const result = data as {
      success: boolean;
      code?: string;
      total_invited?: number;
      completed?: number;
      pending?: number;
    };
    if (!result?.success || !result.code) return null;
    return {
      code: result.code,
      totalInvited: result.total_invited ?? 0,
      completed: result.completed ?? 0,
      pending: result.pending ?? 0,
    };
  } catch (e) {
    console.error("getReferralStatsV2 failed:", e);
    return null;
  }
};

/**
 * Build the localized share message for v2 (mentions 500 XP + 1 month premium reward).
 */
export const getShareMessageV2 = (code: string, lang: "fr" | "en" | "es" | "de" = "fr"): string => {
  if (lang === "en") {
    return `🎯 Join me on BigHead with my code ${code}! We both get 500 XP + 1 month premium when you reach level 5. Download the app: ${SHARE_URL}`;
  }
  if (lang === "es") {
    return `🎯 ¡Únete a BigHead con mi código ${code}! Cuando llegues al nivel 5, los dos ganamos 500 XP y 1 mes de Premium. Descárgala aquí: ${SHARE_URL}`;
  }
  if (lang === "de") {
    return `🎯 Komm mit meinem Code ${code} zu BigHead! Wenn du Level 5 erreichst, bekommen wir beide 500 XP + 1 Monat Premium. App laden: ${SHARE_URL}`;
  }
  return `🎯 Rejoins-moi sur BigHead avec mon code ${code} ! On gagne 500 XP + 1 mois premium chacun quand t'atteins le niveau 5. Télécharge l'app : ${SHARE_URL}`;
};

/**
 * Check if current user was referred and hasn't claimed reward yet
 */
export const checkPendingReferralReward = async (
  userId: string
): Promise<{ hasPending: boolean; code?: string }> => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("referred_by")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return { hasPending: false };
    }

    const userData = data as { referred_by: string | null };

    if (userData.referred_by) {
      return { hasPending: true, code: userData.referred_by };
    }

    return { hasPending: false };
  } catch (error) {
    console.error("Error checking pending reward:", error);
    return { hasPending: false };
  }
};
