import { supabase } from "./supabase";
import {
  AdventureProgress,
  DailyAttempts,
  Tier,
  Category,
  CATEGORIES,
  MAX_FREE_ATTEMPTS,
  getNextLevel,
  getCurrentLevelNumber,
} from "../types/adventure";

/**
 * Get user's adventure progress
 */
export async function getAdventureProgress(userId: string): Promise<AdventureProgress | null> {
  const { data, error } = await supabase
    .from("adventure_progress")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No progress yet, return null
      return null;
    }
    throw error;
  }

  return data as AdventureProgress;
}

/**
 * Initialize adventure progress for a new user
 */
export async function initializeAdventureProgress(userId: string): Promise<AdventureProgress> {
  const initialProgress: Omit<AdventureProgress, "id" | "created_at" | "updated_at"> = {
    user_id: userId,
    tier: "coton",
    level: 1,
    completed_categories: [],
  };

  const { data, error } = await supabase
    .from("adventure_progress")
    .insert(initialProgress as any)
    .select()
    .single();

  if (error) throw error;
  return data as AdventureProgress;
}

/**
 * Get or create adventure progress
 */
export async function getOrCreateProgress(userId: string): Promise<AdventureProgress> {
  const existing = await getAdventureProgress(userId);
  if (existing) return existing;
  return initializeAdventureProgress(userId);
}

/**
 * Mark a category as completed
 */
export async function completeCategory(
  userId: string,
  category: Category
): Promise<{ levelUp: boolean; newTier?: Tier; newLevel?: 1 | 2 | 3 }> {
  const progress = await getOrCreateProgress(userId);

  // Add category to completed list
  const newCompletedCategories = [...progress.completed_categories, category];

  // Check if all categories are completed
  const allCategoriesCompleted = CATEGORIES.every(cat =>
    newCompletedCategories.includes(cat.code)
  );

  let levelUp = false;
  let newTier = progress.tier;
  let newLevel = progress.level;

  if (allCategoriesCompleted) {
    // Level up!
    const nextLevelInfo = getNextLevel(progress.tier, progress.level);
    if (nextLevelInfo) {
      newTier = nextLevelInfo.tier;
      newLevel = nextLevelInfo.level;
      levelUp = true;
    }
    // Reset completed categories for the new level
    const { error } = await (supabase
      .from("adventure_progress") as any)
      .update({
        tier: newTier,
        level: newLevel,
        completed_categories: [],
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) throw error;
  } else {
    // Just update completed categories
    const { error } = await (supabase
      .from("adventure_progress") as any)
      .update({
        completed_categories: newCompletedCategories,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) throw error;
  }

  return { levelUp, newTier, newLevel };
}

/**
 * Get today's attempts for a user
 */
export async function getDailyAttempts(userId: string): Promise<DailyAttempts | null> {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("daily_attempts")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  return data as DailyAttempts;
}

/**
 * Use an attempt (called when player fails a category)
 */
export async function useAttempt(userId: string): Promise<{ attemptsRemaining: number }> {
  const today = new Date().toISOString().split("T")[0];
  const existing = await getDailyAttempts(userId);

  if (existing) {
    const newAttemptsUsed = existing.attempts_used + 1;
    const { error } = await (supabase
      .from("daily_attempts") as any)
      .update({ attempts_used: newAttemptsUsed })
      .eq("user_id", userId)
      .eq("date", today);

    if (error) throw error;
    return { attemptsRemaining: Math.max(0, MAX_FREE_ATTEMPTS - newAttemptsUsed) };
  } else {
    const { error } = await supabase
      .from("daily_attempts")
      .insert({
        user_id: userId,
        date: today,
        attempts_used: 1,
      } as any);

    if (error) throw error;
    return { attemptsRemaining: MAX_FREE_ATTEMPTS - 1 };
  }
}

/**
 * Check if user can play (has attempts remaining or is premium)
 */
export async function canPlay(userId: string, isPremium: boolean): Promise<{
  canPlay: boolean;
  attemptsRemaining: number;
  isPremium: boolean;
}> {
  if (isPremium) {
    return { canPlay: true, attemptsRemaining: Infinity, isPremium: true };
  }

  const attempts = await getDailyAttempts(userId);
  const attemptsUsed = attempts?.attempts_used || 0;
  const attemptsRemaining = Math.max(0, MAX_FREE_ATTEMPTS - attemptsUsed);

  return {
    canPlay: attemptsRemaining > 0,
    attemptsRemaining,
    isPremium: false,
  };
}

/**
 * Get a random category that hasn't been completed yet
 */
export function getRandomUncompletedCategory(completedCategories: Category[]): Category | null {
  const uncompleted = CATEGORIES.filter(cat => !completedCategories.includes(cat.code));
  if (uncompleted.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * uncompleted.length);
  return uncompleted[randomIndex].code;
}

/**
 * Get questions for a category and difficulty tier
 * Uses adaptive difficulty system when available
 */
export async function getAdventureQuestions(
  userId: string,
  category: Category,
  tier: Tier,
  limit: number = 10
): Promise<any[]> {
  // Try adaptive questions first (Elo-based matching)
  try {
    // @ts-ignore - RPC function types not in generated types
    const { data: adaptiveData, error: adaptiveError } = await supabase.rpc("get_adaptive_questions", {
      p_user_id: userId,
      p_category: category,
      p_limit: limit,
      p_language: "fr",
      p_tier: tier,
    });

    if (!adaptiveError && adaptiveData && (adaptiveData as any[]).length > 0) {
      console.log(`Got ${(adaptiveData as any[]).length} adaptive questions for ${category}`);
      return adaptiveData as any[];
    }
  } catch (err) {
    console.log("Adaptive questions not available, using fallback:", err);
  }

  // Fallback: Map tier to difficulty range (11 tiers mapped to difficulty 1-5)
  const difficultyMap: Record<Tier, { min: number; max: number }> = {
    coton: { min: 1, max: 1 },
    carton: { min: 1, max: 2 },
    bois: { min: 1, max: 2 },
    bronze: { min: 2, max: 2 },
    argent: { min: 2, max: 3 },
    gold: { min: 2, max: 3 },
    platinium: { min: 3, max: 3 },
    titane: { min: 3, max: 4 },
    diamant: { min: 3, max: 4 },
    mythique: { min: 4, max: 5 },
    legendaire: { min: 4, max: 5 },
  };

  const { min, max } = difficultyMap[tier];

  // Try to get unseen questions
  // @ts-ignore - RPC function types not in generated types
  const { data, error } = await supabase.rpc("get_unseen_questions", {
    p_user_id: userId,
    p_category: category,
    p_limit: limit,
    p_language: "fr",
  });

  if (error) {
    console.error("Error getting unseen questions:", error);
    // Fallback to regular query
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("questions")
      .select("*")
      .eq("category", category)
      .gte("difficulty", min)
      .lte("difficulty", max)
      .eq("is_active", true)
      .eq("language", "fr")
      .limit(limit);

    if (fallbackError) throw fallbackError;
    return fallbackData || [];
  }

  return data || [];
}

/**
 * Get family mode questions
 * Uses min_age field to filter questions appropriate for the youngest player
 */
export async function getFamilyQuestions(
  category: Category | "mix",
  minAge: number,
  limit: number
): Promise<any[]> {
  // Map age selection to the actual min_age values in database
  // Database has min_age: 6, 8, 12, 14, 16
  const ageToMinAge: Record<number, number> = {
    6: 6,   // Only difficulty 1 questions
    8: 8,   // Difficulty 1-2 questions
    10: 8,  // Same as 8
    12: 12, // Difficulty 1-3 questions
    14: 14, // Difficulty 1-4 questions
    16: 16, // All questions
    18: 16, // All questions (adults)
    99: 16, // Adults (18+)
  };

  const effectiveMinAge = ageToMinAge[minAge] || 16;
  const effectiveLimit = limit === Infinity ? 100 : limit;

  // Try using the RPC function first (more efficient)
  // @ts-ignore - RPC function types not in generated types
  const { data: rpcData, error: rpcError } = await supabase.rpc("get_family_questions", {
    p_min_age: effectiveMinAge,
    p_category: category === "mix" ? null : category,
    p_limit: effectiveLimit,
    p_language: "fr",
  });

  if (!rpcError && rpcData && (rpcData as any[]).length > 0) {
    return rpcData as any[];
  }

  // Fallback to direct query if RPC fails
  console.log("RPC failed, using direct query:", rpcError?.message);

  let query = supabase
    .from("questions")
    .select("id, question_text, correct_answer, category, difficulty, min_age")
    .eq("is_active", true)
    .eq("language", "fr")
    .lte("min_age", effectiveMinAge);

  if (category !== "mix") {
    query = query.eq("category", category);
  }

  query = query.limit(effectiveLimit);

  const { data, error } = await query.order("difficulty", { ascending: true });

  if (error) {
    console.error("Direct query also failed:", error);
    throw error;
  }

  // Shuffle the questions
  return shuffleArray(data || []);
}

/**
 * Shuffle array helper
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Calculate progress percentage for mountain visualization
 */
export function calculateMountainProgress(tier: Tier, level: 1 | 2 | 3, completedCategories: number): number {
  const currentLevelNum = getCurrentLevelNumber(tier, level);
  const totalLevels = 33; // 11 tiers × 3 levels
  const categoryProgress = completedCategories / CATEGORIES.length;

  // Each level is worth 1/33 of total progress
  // Within a level, category completion adds partial progress
  const levelProgress = (currentLevelNum - 1) / totalLevels;
  const withinLevelProgress = (1 / totalLevels) * categoryProgress;

  return Math.min(1, levelProgress + withinLevelProgress);
}
