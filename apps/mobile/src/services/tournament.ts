import { supabase } from "./supabase";

export interface Tournament {
  tournament_id: string;
  tournament_name: string;
  tournament_description: string | null;
  tournament_category: string;
  tournament_status: "upcoming" | "active" | "finished";
  questions_count: number;
  time_limit_seconds: number;
  start_date: string;
  end_date: string;
  prize_xp: number;
  participants_count: number;
  user_participated: boolean;
  user_rank: number | null;
  user_score: number | null;
}

export interface TournamentQuestion {
  question_order: number;
  question_id: string;
  question_text: string;
  player_name: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    correct: string;
  };
}

export interface TournamentLeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_url: string | null;
  score: number;
  correct_answers: number;
  total_time_ms: number;
}

/**
 * Get current or upcoming tournament
 */
export const getCurrentTournament = async (): Promise<Tournament | null> => {
  const { data, error } = await supabase.rpc("get_current_tournament");

  if (error) throw error;
  return data?.[0] || null;
};

/**
 * Join a tournament
 */
export const joinTournament = async (
  tournamentId: string
): Promise<{ success: boolean; message: string }> => {
  const { data, error } = await supabase.rpc("join_tournament", {
    p_tournament_id: tournamentId,
  });

  if (error) throw error;
  return {
    success: data[0].success,
    message: data[0].message,
  };
};

/**
 * Get tournament questions
 */
export const getTournamentQuestions = async (
  tournamentId: string
): Promise<TournamentQuestion[]> => {
  const { data, error } = await supabase.rpc("get_tournament_questions", {
    p_tournament_id: tournamentId,
  });

  if (error) throw error;
  return data || [];
};

/**
 * Submit tournament result
 */
export const submitTournamentResult = async (
  tournamentId: string,
  score: number,
  correctAnswers: number,
  totalTimeMs: number
): Promise<{ success: boolean; rank: number; totalParticipants: number }> => {
  const { data, error } = await supabase.rpc("submit_tournament_result", {
    p_tournament_id: tournamentId,
    p_score: score,
    p_correct_answers: correctAnswers,
    p_total_time_ms: totalTimeMs,
  });

  if (error) throw error;
  return {
    success: data[0].success,
    rank: data[0].final_rank,
    totalParticipants: data[0].total_participants,
  };
};

/**
 * Get tournament leaderboard
 */
export const getTournamentLeaderboard = async (
  tournamentId: string,
  limit: number = 50
): Promise<TournamentLeaderboardEntry[]> => {
  const { data, error } = await supabase.rpc("get_tournament_leaderboard", {
    p_tournament_id: tournamentId,
    p_limit: limit,
  });

  if (error) throw error;
  return data || [];
};
