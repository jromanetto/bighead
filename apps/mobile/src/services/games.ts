import { supabase } from "./supabase";
import type { Game, GameAnswer, InsertTables } from "../types/database";

/**
 * Create a new game
 */
export const createGame = async (
  game: InsertTables<"games">
): Promise<Game> => {
  const { data, error } = await supabase
    .from("games")
    .insert(game)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Save game answers
 */
export const saveGameAnswers = async (
  answers: InsertTables<"game_answers">[]
): Promise<GameAnswer[]> => {
  const { data, error } = await supabase
    .from("game_answers")
    .insert(answers)
    .select();

  if (error) throw error;
  return data || [];
};

/**
 * Get user's recent games
 */
export const getUserGames = async (
  userId: string,
  limit: number = 10
): Promise<Game[]> => {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
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
  rank: number;
}

export const getLeaderboard = async (
  limit: number = 100
): Promise<LeaderboardEntry[]> => {
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .limit(limit);

  if (error) throw error;
  return (data as LeaderboardEntry[]) || [];
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
