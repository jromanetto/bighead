/**
 * Referral Service
 * Handles invite codes and referral rewards
 */

import { supabase } from "./supabase";
import { Platform } from "react-native";
import * as Clipboard from "expo-clipboard";

const REFERRAL_REWARD_COINS = 500;
const APP_STORE_URL = "https://apps.apple.com/app/bighead"; // Update with real URL
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=app.bighead"; // Update with real URL

export interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  totalCoinsEarned: number;
  pendingReferrals: number;
}

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
      totalCoinsEarned: totalReferrals * REFERRAL_REWARD_COINS,
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
export const getShareMessage = (referralCode: string): string => {
  return `Join me on BigHead - the ultimate football quiz game! 🎮⚽

Use my code ${referralCode} to get 500 bonus coins when you sign up!

Download now:
${Platform.OS === "ios" ? APP_STORE_URL : PLAY_STORE_URL}`;
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
