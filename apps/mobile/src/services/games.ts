import { supabase } from "./supabase";

// Game types (these tables may not be in generated types yet)
interface Game {
  id: string;
  user_id?: string;
  mode: string;
  score: number;
  max_chain: number;
  questions_count: number;
  correct_count: number;
  duration_seconds: number;
  created_at?: string;
}

interface GameAnswer {
  id: string;
  game_id: string;
  question_id: string;
  player_name?: string;
  is_correct: boolean;
  answer_time_ms: number;
  chain_multiplier: number;
  points_earned: number;
}

/**
 * Create a new game
 */
export const createGame = async (
  game: Omit<Game, "id" | "created_at">
): Promise<Game> => {
  const { data, error } = await supabase
    .from("games" as any)
    .insert(game as any)
    .select()
    .single();

  if (error) throw error;
  return data as Game;
};

/**
 * Save game answers
 */
export const saveGameAnswers = async (
  answers: Omit<GameAnswer, "id">[]
): Promise<GameAnswer[]> => {
  const { data, error } = await supabase
    .from("game_answers" as any)
    .insert(answers as any)
    .select();

  if (error) throw error;
  return (data as GameAnswer[]) || [];
};

/**
 * Get user's recent games
 */
export const getUserGames = async (
  userId: string,
  limit: number = 10
): Promise<Game[]> => {
  const { data, error } = await supabase
    .from("games" as any)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as Game[]) || [];
};

/**
 * Get leaderboard
 */
export interface LeaderboardEntry {
  id: string;
  username: string;
  avatar_url: string | null;
  total_xp: number;
  level: number;
  games_played: number;
  best_chain: number;
  rank: number;
}

export interface WeeklyLeaderboardEntry {
  id: string;
  username: string;
  avatar_url: string | null;
  weekly_xp: number;
  weekly_games: number;
  best_chain: number;
  rank: number;
}

/**
 * Get all-time leaderboard from the view
 */
export const getLeaderboard = async (
  limit: number = 50
): Promise<LeaderboardEntry[]> => {
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .limit(limit);

  if (error) throw error;
  return (data as LeaderboardEntry[]) || [];
};

/**
 * Get weekly leaderboard using the RPC function
 */
export const getWeeklyLeaderboard = async (
  limit: number = 50
): Promise<LeaderboardEntry[]> => {
  const { data, error } = await supabase
    .rpc("get_weekly_leaderboard", { limit_count: limit } as any);

  if (error) throw error;

  // Map weekly data to LeaderboardEntry format
  return ((data as WeeklyLeaderboardEntry[]) || []).map((entry) => ({
    id: entry.id,
    username: entry.username,
    avatar_url: entry.avatar_url,
    total_xp: entry.weekly_xp,
    level: 1, // Not relevant for weekly
    games_played: entry.weekly_games,
    best_chain: entry.best_chain,
    rank: entry.rank,
  }));
};

/**
 * Get current user's rank
 */
export const getUserRank = async (userId: string): Promise<{
  rank: number;
  total_xp: number;
} | null> => {
  const { data, error } = await supabase
    .from("leaderboard")
    .select("rank, total_xp")
    .eq("id", userId)
    .single();

  if (error) {
    // User might not be in leaderboard yet
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data;
};

/**
 * Submit a complete game with all answers
 */
export interface GameSubmission {
  userId?: string;
  mode: "chain_solo" | "chain_duel" | "party";
  score: number;
  maxChain: number;
  questionsCount: number;
  correctCount: number;
  durationSeconds: number;
  answers: {
    questionId: string;
    playerName?: string;
    isCorrect: boolean;
    answerTimeMs: number;
    chainMultiplier: number;
    pointsEarned: number;
  }[];
}

export const submitGame = async (submission: GameSubmission): Promise<Game> => {
  // Create the game
  const game = await createGame({
    user_id: submission.userId,
    mode: submission.mode,
    score: submission.score,
    max_chain: submission.maxChain,
    questions_count: submission.questionsCount,
    correct_count: submission.correctCount,
    duration_seconds: submission.durationSeconds,
  });

  // Save the answers
  if (submission.answers.length > 0) {
    await saveGameAnswers(
      submission.answers.map((answer) => ({
        game_id: game.id,
        question_id: answer.questionId,
        player_name: answer.playerName,
        is_correct: answer.isCorrect,
        answer_time_ms: answer.answerTimeMs,
        chain_multiplier: answer.chainMultiplier,
        points_earned: answer.pointsEarned,
      }))
    );
  }

  return game;
};
