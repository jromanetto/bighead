/**
 * Friend Challenge Service
 * Create and share quiz challenges with friends
 */

import { supabase } from "./supabase";
import { Share, Platform } from "react-native";
import * as Linking from "expo-linking";

export interface FriendChallenge {
  id: string;
  code: string;
  creator_name: string;
  category: string;
  question_count: number;
  time_per_question: number;
  question_ids: string[];
  status: string;
  attempts_count: number;
  best_score: number | null;
}

export interface ChallengeAttempt {
  id: string;
  challenge_id: string;
  user_id: string | null;
  player_name: string;
  score: number;
  correct_count: number;
  total_time_ms: number | null;
  completed_at: string;
}

/**
 * Create a new friend challenge
 */
export const createFriendChallenge = async (
  creatorId: string,
  category: string = "general",
  questionCount: number = 10,
  timePerQuestion: number = 15,
  language: string = "en"
): Promise<{ challengeId: string; code: string; shareUrl: string } | null> => {
  try {
    const { data, error } = await supabase.rpc("create_friend_challenge", {
      p_creator_id: creatorId,
      p_category: category,
      p_question_count: questionCount,
      p_time_per_question: timePerQuestion,
      p_language: language,
    });

    if (error) throw error;

    if (data && data.length > 0) {
      return {
        challengeId: data[0].challenge_id,
        code: data[0].challenge_code,
        shareUrl: data[0].share_url,
      };
    }

    return null;
  } catch (error) {
    console.error("Error creating friend challenge:", error);
    return null;
  }
};

/**
 * Get challenge by code
 */
export const getFriendChallenge = async (code: string): Promise<FriendChallenge | null> => {
  try {
    const { data, error } = await supabase.rpc("get_friend_challenge", {
      p_code: code.toUpperCase(),
    });

    if (error) throw error;

    if (data && data.length > 0) {
      return data[0] as FriendChallenge;
    }

    return null;
  } catch (error) {
    console.error("Error getting friend challenge:", error);
    return null;
  }
};

/**
 * Submit challenge attempt
 */
export const submitChallengeAttempt = async (
  challengeCode: string,
  userId: string | null,
  playerName: string,
  score: number,
  correctCount: number,
  totalTimeMs: number | null
): Promise<{ success: boolean; rank: number; totalAttempts: number }> => {
  try {
    const { data, error } = await supabase.rpc("submit_friend_challenge_attempt", {
      p_challenge_code: challengeCode.toUpperCase(),
      p_user_id: userId,
      p_player_name: playerName,
      p_score: score,
      p_correct_count: correctCount,
      p_total_time_ms: totalTimeMs,
    });

    if (error) throw error;

    if (data && data.length > 0) {
      return {
        success: data[0].success,
        rank: data[0].rank,
        totalAttempts: data[0].total_attempts,
      };
    }

    return { success: false, rank: 0, totalAttempts: 0 };
  } catch (error) {
    console.error("Error submitting challenge attempt:", error);
    return { success: false, rank: 0, totalAttempts: 0 };
  }
};

/**
 * Get challenge leaderboard
 */
export const getChallengeLeaderboard = async (challengeId: string): Promise<ChallengeAttempt[]> => {
  try {
    const { data, error } = await supabase
      .from("friend_challenge_attempts")
      .select("*")
      .eq("challenge_id", challengeId)
      .order("score", { ascending: false })
      .order("total_time_ms", { ascending: true })
      .limit(50);

    if (error) throw error;

    return (data as ChallengeAttempt[]) || [];
  } catch (error) {
    console.error("Error getting challenge leaderboard:", error);
    return [];
  }
};

/**
 * Share challenge with friends
 */
export const shareChallenge = async (
  code: string,
  category: string,
  creatorName: string
): Promise<boolean> => {
  try {
    const deepLink = Linking.createURL(`challenge/${code}`);
    const webLink = `https://bighead.app/challenge/${code}`;

    const message = `🧠 ${creatorName} challenges you to a quiz!

Category: ${category}
Code: ${code}

Play now: ${Platform.OS === "web" ? webLink : deepLink}

Download BigHead to compete!`;

    const result = await Share.share({
      message,
      title: "BigHead Quiz Challenge",
    });

    return result.action === Share.sharedAction;
  } catch (error) {
    console.error("Error sharing challenge:", error);
    return false;
  }
};

/**
 * Get user's created challenges
 */
export const getUserChallenges = async (userId: string): Promise<FriendChallenge[]> => {
  try {
    const { data, error } = await supabase
      .from("friend_challenges")
      .select(`
        id,
        code,
        category,
        question_count,
        time_per_question,
        status,
        created_at
      `)
      .eq("creator_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    return (data as unknown as FriendChallenge[]) || [];
  } catch (error) {
    console.error("Error getting user challenges:", error);
    return [];
  }
};
