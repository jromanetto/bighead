import { supabase } from "./supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCAL_RESULTS_KEY = "bighead_local_results";

export interface GameResult {
  userId: string;
  mode: "chain_solo" | "party";
  score: number;
  correctCount: number;
  totalQuestions: number;
  maxChain: number;
  durationSeconds?: number;
}

/**
 * Save game result to Supabase
 */
export async function saveGameResult(result: GameResult): Promise<void> {
  const { error } = await supabase.from("game_results").insert({
    user_id: result.userId,
    mode: result.mode,
    score: result.score,
    correct_count: result.correctCount,
    total_questions: result.totalQuestions,
    max_chain: result.maxChain,
    duration_seconds: result.durationSeconds,
  } as any);

  if (error) {
    console.error("Error saving game result:", error);
    // If save fails, store locally for later sync
    await saveResultLocally(result);
    throw error;
  }
}

/**
 * Save result locally (for offline or anonymous users)
 */
export async function saveResultLocally(result: GameResult): Promise<void> {
  try {
    const existingData = await AsyncStorage.getItem(LOCAL_RESULTS_KEY);
    const results: GameResult[] = existingData ? JSON.parse(existingData) : [];
    results.push({
      ...result,
      // @ts-ignore - add timestamp for sync later
      savedAt: new Date().toISOString(),
    });
    await AsyncStorage.setItem(LOCAL_RESULTS_KEY, JSON.stringify(results));
  } catch (error) {
    console.error("Error saving result locally:", error);
  }
}

/**
 * Get locally stored results
 */
export async function getLocalResults(): Promise<GameResult[]> {
  try {
    const data = await AsyncStorage.getItem(LOCAL_RESULTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting local results:", error);
    return [];
  }
}

/**
 * Sync local results to Supabase (call after user creates account)
 */
export async function syncLocalResults(userId: string): Promise<number> {
  const localResults = await getLocalResults();

  if (localResults.length === 0) return 0;

  let syncedCount = 0;

  for (const result of localResults) {
    try {
      await saveGameResult({
        ...result,
        userId, // Use the new user ID
      });
      syncedCount++;
    } catch (error) {
      console.error("Error syncing result:", error);
    }
  }

  // Clear local results after sync
  if (syncedCount > 0) {
    await AsyncStorage.removeItem(LOCAL_RESULTS_KEY);
  }

  return syncedCount;
}

/**
 * Get user's game history
 */
export async function getUserGameHistory(
  userId: string,
  limit: number = 20
): Promise<any[]> {
  const { data, error } = await supabase
    .from("game_results")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching game history:", error);
    return [];
  }

  return data || [];
}

/**
 * Get leaderboard (top scores)
 */
export async function getLeaderboard(
  mode: "chain_solo" | "party" = "chain_solo",
  limit: number = 50
): Promise<any[]> {
  const { data, error } = await supabase
    .from("game_results")
    .select(`
      id,
      score,
      max_chain,
      created_at,
      user_id,
      users!inner(username, avatar_url)
    `)
    .eq("mode", mode)
    .order("score", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }

  return data || [];
}

/**
 * Get user stats summary
 */
export async function getUserStats(userId: string): Promise<{
  totalGames: number;
  totalScore: number;
  bestScore: number;
  bestChain: number;
  averageAccuracy: number;
}> {
  const { data, error } = await supabase
    .from("game_results")
    .select("score, correct_count, total_questions, max_chain")
    .eq("user_id", userId);

  if (error || !data || data.length === 0) {
    return {
      totalGames: 0,
      totalScore: 0,
      bestScore: 0,
      bestChain: 0,
      averageAccuracy: 0,
    };
  }

  const results = data as any[];
  const totalGames = results.length;
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const bestScore = Math.max(...results.map((r) => r.score));
  const bestChain = Math.max(...results.map((r) => r.max_chain));
  const totalCorrect = results.reduce((sum, r) => sum + r.correct_count, 0);
  const totalQuestions = results.reduce((sum, r) => sum + r.total_questions, 0);
  const averageAccuracy =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return {
    totalGames,
    totalScore,
    bestScore,
    bestChain,
    averageAccuracy,
  };
}
