import { supabase } from "./supabase";

export interface Duel {
  id: string;
  code: string;
  host_id: string;
  guest_id: string | null;
  status: "waiting" | "playing" | "finished" | "cancelled";
  category: string;
  rounds_total: number;
  current_round: number;
  host_score: number;
  guest_score: number;
  winner_id: string | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
}

export interface DuelQuestion {
  round_number: number;
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

/**
 * Create a new duel
 */
export const createDuel = async (
  hostId: string,
  category: string = "general",
  rounds: number = 5
): Promise<{ duelId: string; code: string }> => {
  const { data, error } = await supabase.rpc("create_duel", {
    p_host_id: hostId,
    p_category: category,
    p_rounds: rounds,
  });

  if (error) throw error;
  return {
    duelId: data[0].duel_id,
    code: data[0].duel_code,
  };
};

/**
 * Join a duel by code
 */
export const joinDuel = async (
  code: string,
  guestId: string
): Promise<{ success: boolean; duelId: string | null; message: string }> => {
  const { data, error } = await supabase.rpc("join_duel", {
    p_code: code.toUpperCase(),
    p_guest_id: guestId,
  });

  if (error) throw error;
  return {
    success: data[0].success,
    duelId: data[0].duel_id,
    message: data[0].message,
  };
};

/**
 * Get duel by ID
 */
export const getDuel = async (duelId: string): Promise<Duel | null> => {
  const { data, error } = await supabase
    .from("duels")
    .select("*")
    .eq("id", duelId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get duel by code
 */
export const getDuelByCode = async (code: string): Promise<Duel | null> => {
  const { data, error } = await supabase
    .from("duels")
    .select("*")
    .eq("code", code.toUpperCase())
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
};

/**
 * Get questions for a duel
 */
export const getDuelQuestions = async (
  duelId: string
): Promise<DuelQuestion[]> => {
  const { data, error } = await supabase.rpc("get_duel_questions", {
    p_duel_id: duelId,
  });

  if (error) throw error;
  return data || [];
};

/**
 * Submit an answer in a duel
 */
export const submitDuelAnswer = async (
  duelId: string,
  userId: string,
  roundNumber: number,
  answer: string,
  answerTimeMs: number
): Promise<{ success: boolean; isCorrect: boolean; correctAnswer: string }> => {
  const { data, error } = await supabase.rpc("submit_duel_answer", {
    p_duel_id: duelId,
    p_user_id: userId,
    p_round_number: roundNumber,
    p_answer: answer,
    p_answer_time_ms: answerTimeMs,
  });

  if (error) throw error;
  return {
    success: data[0].success,
    isCorrect: data[0].is_correct,
    correctAnswer: data[0].correct_answer,
  };
};

/**
 * Finish a duel
 */
export const finishDuel = async (
  duelId: string
): Promise<{ winnerId: string | null; hostScore: number; guestScore: number }> => {
  const { data, error } = await supabase.rpc("finish_duel", {
    p_duel_id: duelId,
  });

  if (error) throw error;
  return {
    winnerId: data[0].winner_id,
    hostScore: data[0].host_score,
    guestScore: data[0].guest_score,
  };
};

/**
 * Cancel a duel
 */
export const cancelDuel = async (duelId: string): Promise<void> => {
  const { error } = await supabase
    .from("duels")
    .update({ status: "cancelled" })
    .eq("id", duelId);

  if (error) throw error;
};

/**
 * Subscribe to duel updates
 */
export const subscribeToDuel = (
  duelId: string,
  onUpdate: (duel: Duel) => void
) => {
  return supabase
    .channel(`duel:${duelId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "duels",
        filter: `id=eq.${duelId}`,
      },
      (payload) => {
        onUpdate(payload.new as Duel);
      }
    )
    .subscribe();
};

/**
 * Get user's duel history
 */
export const getDuelHistory = async (userId: string): Promise<Duel[]> => {
  const { data, error } = await supabase
    .from("duels")
    .select("*")
    .or(`host_id.eq.${userId},guest_id.eq.${userId}`)
    .eq("status", "finished")
    .order("finished_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return data || [];
};
