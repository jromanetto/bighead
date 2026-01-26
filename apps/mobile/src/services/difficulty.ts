/**
 * Adaptive Difficulty Service
 *
 * Implements an Elo-like rating system for:
 * - Player skill per category
 * - Question difficulty ratings
 *
 * The system automatically adjusts question difficulty based on
 * aggregate player performance, ensuring questions are appropriately
 * challenging for each skill level.
 */

import { supabase } from "./supabase";
import { Category } from "../types/adventure";

// ============================================
// TYPES
// ============================================

export interface PlayerSkill {
  category: string;
  skill_rating: number;
  skill_level: string;
  games_played: number;
  accuracy_percent: number;
  best_streak: number;
}

export interface AdaptiveQuestion {
  id: string;
  question_text: string;
  correct_answer: string;
  wrong_answers: string[];
  category: string;
  difficulty: number;
  image_url?: string;
  image_credit?: string;
  difficulty_rating: number;
  match_quality: number;
}

export interface AnswerResult {
  new_player_skill: number;
  new_question_difficulty: number;
  skill_change: number;
}

export interface SkillLevel {
  name: string;
  minRating: number;
  color: string;
  icon: string;
}

// Skill level definitions
export const SKILL_LEVELS: SkillLevel[] = [
  { name: "Expert", minRating: 1800, color: "#FFD700", icon: "👑" },
  { name: "Avancé", minRating: 1500, color: "#A16EFF", icon: "⭐" },
  { name: "Intermédiaire", minRating: 1200, color: "#00c2cc", icon: "📊" },
  { name: "Débutant", minRating: 900, color: "#22c55e", icon: "🌱" },
  { name: "Novice", minRating: 0, color: "#9ca3af", icon: "🎯" },
];

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Record an answer and update both player and question ratings
 * This is the main function called after each answer
 */
export async function recordAnswer(
  userId: string,
  questionId: string,
  wasCorrect: boolean,
  timeMs?: number,
  tier?: string
): Promise<AnswerResult | null> {
  try {
    // @ts-ignore - RPC function types not in generated types
    const { data, error } = await supabase.rpc("record_answer_and_update_ratings", {
      p_user_id: userId,
      p_question_id: questionId,
      p_was_correct: wasCorrect,
      p_time_ms: timeMs || null,
      p_tier: tier || null,
    });

    if (error) {
      console.error("Error recording answer:", error);
      return null;
    }

    // The RPC returns a table, get first row
    if (data && (data as any[]).length > 0) {
      return (data as any[])[0] as AnswerResult;
    }

    return null;
  } catch (err) {
    console.error("Exception recording answer:", err);
    return null;
  }
}

/**
 * Get questions adapted to player's skill level
 * Uses Elo-based matching for optimal challenge
 */
export async function getAdaptiveQuestions(
  userId: string,
  category: Category,
  limit: number = 10,
  language: string = "fr",
  tier?: string
): Promise<AdaptiveQuestion[]> {
  try {
    // @ts-ignore - RPC function types not in generated types
    const { data, error } = await supabase.rpc("get_adaptive_questions", {
      p_user_id: userId,
      p_category: category,
      p_limit: limit,
      p_language: language,
      p_tier: tier || null,
    });

    if (error) {
      console.error("Error getting adaptive questions:", error);
      return [];
    }

    return (data as AdaptiveQuestion[]) || [];
  } catch (err) {
    console.error("Exception getting adaptive questions:", err);
    return [];
  }
}

/**
 * Get player's skill summary across all categories
 */
export async function getPlayerSkillSummary(userId: string): Promise<PlayerSkill[]> {
  try {
    // @ts-ignore - RPC function types not in generated types
    const { data, error } = await supabase.rpc("get_player_skill_summary", {
      p_user_id: userId,
    });

    if (error) {
      console.error("Error getting player skill summary:", error);
      return [];
    }

    return (data as PlayerSkill[]) || [];
  } catch (err) {
    console.error("Exception getting player skill summary:", err);
    return [];
  }
}

/**
 * Get player's skill for a specific category
 */
export async function getPlayerCategorySkill(
  userId: string,
  category: Category
): Promise<PlayerSkill | null> {
  try {
    // @ts-ignore - player_skill table not in generated types
    const { data, error }: { data: any; error: any } = await supabase
      .from("player_skill")
      .select("*")
      .eq("user_id", userId)
      .eq("category", category)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No skill record yet, return default
        return {
          category,
          skill_rating: 1200,
          skill_level: "Intermédiaire",
          games_played: 0,
          accuracy_percent: 0,
          best_streak: 0,
        };
      }
      console.error("Error getting category skill:", error);
      return null;
    }

    const accuracy = data.total_answers > 0
      ? Math.round((data.correct_answers / data.total_answers) * 100 * 10) / 10
      : 0;

    return {
      category: data.category,
      skill_rating: data.skill_rating,
      skill_level: getSkillLevelName(data.skill_rating),
      games_played: data.games_played,
      accuracy_percent: accuracy,
      best_streak: data.best_streak,
    };
  } catch (err) {
    console.error("Exception getting category skill:", err);
    return null;
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get skill level name from rating
 */
export function getSkillLevelName(rating: number): string {
  for (const level of SKILL_LEVELS) {
    if (rating >= level.minRating) {
      return level.name;
    }
  }
  return "Novice";
}

/**
 * Get skill level details from rating
 */
export function getSkillLevel(rating: number): SkillLevel {
  for (const level of SKILL_LEVELS) {
    if (rating >= level.minRating) {
      return level;
    }
  }
  return SKILL_LEVELS[SKILL_LEVELS.length - 1];
}

/**
 * Calculate expected score (probability of correct answer)
 * Used for displaying match quality to users
 */
export function calculateExpectedScore(
  playerRating: number,
  questionRating: number
): number {
  return 1.0 / (1.0 + Math.pow(10, (questionRating - playerRating) / 400));
}

/**
 * Format skill rating for display
 */
export function formatSkillRating(rating: number): string {
  return Math.round(rating).toString();
}

/**
 * Calculate rating change preview
 * Shows expected rating change before answering
 */
export function previewRatingChange(
  playerRating: number,
  questionRating: number,
  kFactor: number = 32
): { ifCorrect: number; ifWrong: number } {
  const expected = calculateExpectedScore(playerRating, questionRating);

  return {
    ifCorrect: Math.round(kFactor * (1 - expected)),
    ifWrong: Math.round(kFactor * (0 - expected)),
  };
}

/**
 * Get color for rating change display
 */
export function getRatingChangeColor(change: number): string {
  if (change > 0) return "#22c55e"; // Green for gain
  if (change < 0) return "#ef4444"; // Red for loss
  return "#9ca3af"; // Gray for no change
}

/**
 * Calculate match quality percentage
 * 100% = perfect match, lower = harder/easier than ideal
 */
export function calculateMatchQuality(
  playerRating: number,
  questionRating: number
): number {
  const diff = Math.abs(playerRating - questionRating);
  // Perfect match = 100%, 400 points diff = ~50%, 800+ = very low
  return Math.round(100 * Math.exp(-diff / 400));
}

// ============================================
// BATCH OPERATIONS (for admin/maintenance)
// ============================================

/**
 * Trigger recalculation of all question difficulties
 * Should be called periodically (e.g., daily cron job)
 */
export async function recalculateAllDifficulties(): Promise<number> {
  try {
    // @ts-ignore - RPC function types not in generated types
    const { data, error } = await supabase.rpc("recalculate_all_question_difficulties");

    if (error) {
      console.error("Error recalculating difficulties:", error);
      return 0;
    }

    return data as number;
  } catch (err) {
    console.error("Exception recalculating difficulties:", err);
    return 0;
  }
}

// ============================================
// LOCAL TRACKING (for guest users)
// ============================================

import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCAL_SKILL_KEY = "local_player_skill";

interface LocalSkillData {
  [category: string]: {
    rating: number;
    gamesPlayed: number;
    correctAnswers: number;
    totalAnswers: number;
  };
}

/**
 * Update local skill for guest users
 */
export async function updateLocalSkill(
  category: string,
  wasCorrect: boolean,
  questionRating: number = 1200
): Promise<number> {
  try {
    const stored = await AsyncStorage.getItem(LOCAL_SKILL_KEY);
    const skillData: LocalSkillData = stored ? JSON.parse(stored) : {};

    // Get or create category skill
    const categorySkill = skillData[category] || {
      rating: 1200,
      gamesPlayed: 0,
      correctAnswers: 0,
      totalAnswers: 0,
    };

    // Calculate new rating using Elo
    const expected = calculateExpectedScore(categorySkill.rating, questionRating);
    const actual = wasCorrect ? 1 : 0;
    const kFactor = Math.max(16, Math.min(48, 32 * (1 - categorySkill.gamesPlayed / 100)));

    const newRating = categorySkill.rating + kFactor * (actual - expected);

    // Update stats
    skillData[category] = {
      rating: newRating,
      gamesPlayed: categorySkill.gamesPlayed + 1,
      correctAnswers: categorySkill.correctAnswers + (wasCorrect ? 1 : 0),
      totalAnswers: categorySkill.totalAnswers + 1,
    };

    await AsyncStorage.setItem(LOCAL_SKILL_KEY, JSON.stringify(skillData));

    return newRating;
  } catch (err) {
    console.error("Error updating local skill:", err);
    return 1200;
  }
}

/**
 * Get local skill for guest users
 */
export async function getLocalSkill(category: string): Promise<number> {
  try {
    const stored = await AsyncStorage.getItem(LOCAL_SKILL_KEY);
    if (!stored) return 1200;

    const skillData: LocalSkillData = JSON.parse(stored);
    return skillData[category]?.rating || 1200;
  } catch (err) {
    console.error("Error getting local skill:", err);
    return 1200;
  }
}

/**
 * Reset local skill data
 */
export async function resetLocalSkill(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LOCAL_SKILL_KEY);
  } catch (err) {
    console.error("Error resetting local skill:", err);
  }
}
