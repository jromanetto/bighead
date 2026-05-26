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
  adventureCategoryToDbCodes,
} from "../types/adventure";
import { getTodayIsoDate } from "../utils/dates";

/**
 * Local shape for adventure question rows returned by RPCs / fallback queries.
 * Kept minimal so we can drop most `as any[]` casts without lying about types.
 */
interface AdventureQuestionRow {
  id: string;
  question_text: string;
  correct_answer: string;
  wrong_answers: string[];
  category: string;
  difficulty: number;
  min_age?: number;
  image_url?: string | null;
  image_credit?: string | null;
  [key: string]: unknown;
}

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
    tier: "homer",
    level: 1,
    completed_categories: [],
  };

  // untyped: adventure_progress.tier enum in generated Database type is stale
  // (DB has homer/mario/.../einstein, types still list coton/carton/...).
  const { data, error } = await (supabase
    .from("adventure_progress") as any)
    .insert(initialProgress)
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

  // untyped: adventure_progress.tier enum in generated Database type is stale.
  const adventureTable = supabase.from("adventure_progress") as any;

  if (allCategoriesCompleted) {
    // Level up!
    const nextLevelInfo = getNextLevel(progress.tier, progress.level);
    if (nextLevelInfo) {
      newTier = nextLevelInfo.tier;
      newLevel = nextLevelInfo.level;
      levelUp = true;
    }
    // Reset completed categories for the new level
    const { error } = await adventureTable
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
    const { error } = await adventureTable
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
  const today = getTodayIsoDate();

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
  const today = getTodayIsoDate();
  const existing = await getDailyAttempts(userId);
  // untyped: supabase-js v2.91 strict typing surfaces daily_attempts row as
  // `never` despite the table being declared in Database type.
  const dailyAttempts = supabase.from("daily_attempts") as any;

  if (existing) {
    const newAttemptsUsed = existing.attempts_used + 1;
    const { error } = await dailyAttempts
      .update({ attempts_used: newAttemptsUsed })
      .eq("user_id", userId)
      .eq("date", today);

    if (error) throw error;
    return { attemptsRemaining: Math.max(0, MAX_FREE_ATTEMPTS - newAttemptsUsed) };
  } else {
    const { error } = await dailyAttempts.insert({
      user_id: userId,
      date: today,
      attempts_used: 1,
    });

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
  const dbCodes = adventureCategoryToDbCodes(category);

  // Try adaptive questions first (Elo-based matching) — try each DB code
  for (const dbCat of dbCodes) {
    try {
      // @ts-ignore - RPC function not in generated types
      const { data, error } = await supabase.rpc("get_adaptive_questions", {
        p_user_id: userId,
        p_category: dbCat,
        p_limit: limit,
        p_language: "fr",
        p_tier: tier,
      });
      const adaptiveData = data as AdventureQuestionRow[] | null;
      if (!error && adaptiveData && adaptiveData.length > 0) {
        return adaptiveData;
      }
    } catch (err) {
      // Adaptive RPC not deployed yet — silently fall through to fallback.
    }
  }

  // Fallback: Map tier to difficulty range (8 character-based tiers mapped to difficulty 1-5)
  const difficultyMap: Record<Tier, { min: number; max: number }> = {
    homer: { min: 1, max: 1 },
    mario: { min: 1, max: 2 },
    sherlock: { min: 2, max: 2 },
    tony: { min: 2, max: 3 },
    gandalf: { min: 3, max: 3 },
    yoda: { min: 3, max: 4 },
    leonardo: { min: 4, max: 4 },
    einstein: { min: 4, max: 5 },
  };

  const { min, max } = difficultyMap[tier];

  // Try unseen questions on each DB code
  for (const dbCat of dbCodes) {
    // @ts-ignore - RPC function not in generated types
    const { data, error } = await supabase.rpc("get_unseen_questions", {
      p_user_id: userId,
      p_category: dbCat,
      p_limit: limit,
      p_language: "fr",
    });
    const rows = data as AdventureQuestionRow[] | null;
    if (!error && rows && rows.length > 0) return rows;
  }

  // Last fallback: direct query across all matching codes
  const { data: fallbackData, error: fallbackError } = await supabase
    .from("questions")
    .select("*")
    .in("category", dbCodes)
    .gte("difficulty", min)
    .lte("difficulty", max)
    .eq("is_active", true)
    .eq("language", "fr")
    .limit(limit);

  if (fallbackError) throw fallbackError;
  return fallbackData || [];
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

  // Resolve adventure FE category code → DB codes (one FE code can map to several DB codes)
  const dbCodes = category === "mix" ? null : adventureCategoryToDbCodes(category);

  // Try RPC first per DB code (RPC only accepts one category at a time)
  if (dbCodes) {
    let collected: AdventureQuestionRow[] = [];
    for (const dbCat of dbCodes) {
      // @ts-ignore - RPC function not in generated types
      const { data, error: rpcError } = await supabase.rpc("get_family_questions", {
        p_min_age: effectiveMinAge,
        p_category: dbCat,
        p_limit: effectiveLimit,
        p_language: "fr",
      });
      const rpcData = data as AdventureQuestionRow[] | null;
      if (!rpcError && rpcData && rpcData.length > 0) {
        collected = collected.concat(rpcData);
      }
    }
    if (collected.length > 0) {
      return shuffleArray(collected).slice(0, effectiveLimit);
    }
  } else {
    // mix mode — call RPC with NULL category
    // @ts-ignore - RPC function not in generated types
    const { data, error: rpcError } = await supabase.rpc("get_family_questions", {
      p_min_age: effectiveMinAge,
      p_category: null,
      p_limit: effectiveLimit,
      p_language: "fr",
    });
    const rpcData = data as AdventureQuestionRow[] | null;
    if (!rpcError && rpcData && rpcData.length > 0) return rpcData;
  }

  // Direct-query fallback (handles both mix and category modes)
  let query = supabase
    .from("questions")
    .select("id, question_text, correct_answer, wrong_answers, category, difficulty, min_age, image_url, image_credit")
    .eq("is_active", true)
    .eq("language", "fr")
    .lte("min_age", effectiveMinAge);

  if (dbCodes) query = query.in("category", dbCodes);

  query = query.limit(effectiveLimit * 3); // over-fetch then shuffle/cut

  const { data, error } = await query.order("difficulty", { ascending: true });

  if (error) {
    console.error("Family questions direct query failed:", error);
    throw error;
  }

  return shuffleArray(data || []).slice(0, effectiveLimit);
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
  const totalLevels = 24; // 8 tiers × 3 levels
  const categoryProgress = completedCategories / CATEGORIES.length;

  // Each level is worth 1/33 of total progress
  // Within a level, category completion adds partial progress
  const levelProgress = (currentLevelNum - 1) / totalLevels;
  const withinLevelProgress = (1 / totalLevels) * categoryProgress;

  return Math.min(1, levelProgress + withinLevelProgress);
}
