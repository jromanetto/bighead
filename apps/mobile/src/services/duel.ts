import { supabase } from "./supabase";

export interface Duel {
  id: string;
  code: string;
  host_id: string;
  guest_id: string | null;
  status: "waiting" | "playing" | "finished" | "cancelled" | "pending" | "awaiting_opponent" | "completed" | "expired";
  category: string;
  rounds_total: number;
  current_round: number;
  host_score: number;
  guest_score: number;
  winner_id: string | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  mode?: "async" | "sync";
  expires_at?: string | null;
  questions_payload?: AsyncDuelQuestion[] | null;
  host_played_at?: string | null;
  guest_played_at?: string | null;
}

// =========================================================================
// Async Duel — turn-based 1v1 (Trivia Crack model)
// =========================================================================

export interface AsyncDuelQuestion {
  id: string;
  question_text: string;
  correct_answer: string;
  wrong_answers: string[];
  image_url?: string | null;
  explanation?: string | null;
  player_name?: string | null;
}

export interface AsyncDuelAnswer {
  question_id: string;
  position: number;
  answer_idx: number;
  is_correct: boolean;
  time_ms: number;
}

export interface AsyncDuelInboxItem {
  duel_id: string;
  my_role: "host" | "guest";
  opponent_id: string;
  opponent_username: string | null;
  opponent_avatar: string | null;
  category: string | null;
  status: "pending" | "awaiting_opponent" | "completed" | "expired";
  my_played_at: string | null;
  opponent_played_at: string | null;
  my_score: number | null;
  opponent_score: number | null; // hide client-side until status='completed'
  winner_id: string | null;
  expires_at: string | null;
  created_at: string;
}

export type AsyncDuelBucket = "my_turn" | "waiting" | "finished" | "expired" | "invite_sent";

/**
 * Categorize an inbox item based on who has played.
 */
export const categorizeAsyncDuel = (d: AsyncDuelInboxItem): AsyncDuelBucket => {
  if (d.status === "expired") return "expired";
  if (d.status === "completed") return "finished";
  if (d.my_played_at) return "waiting";
  return "my_turn";
};

/**
 * Create a new async duel. opponentId=null → random opponent (level band ±5).
 * Returns the new duel id.
 */
export const createAsyncDuel = async (
  category: string,
  language: string,
  opponentId?: string | null
): Promise<string> => {
  // @ts-ignore — RPC not typed
  const { data, error } = await supabase.rpc("create_async_duel", {
    p_guest_id: opponentId ?? null,
    p_category: category,
    p_language: language,
  } as any);
  if (error) throw error;
  return data as unknown as string;
};

/**
 * Find a random opponent within level band (no duel created).
 */
export const findRandomOpponent = async (levelBand = 5): Promise<string | null> => {
  // @ts-ignore — RPC not typed
  const { data, error } = await supabase.rpc("find_random_opponent", {
    p_level_band: levelBand,
  } as any);
  if (error) throw error;
  return (data as unknown as string) || null;
};

/**
 * List the current user's async duels (inbox).
 */
export const getMyDuels = async (): Promise<AsyncDuelInboxItem[]> => {
  // @ts-ignore — RPC not typed
  const { data, error } = await supabase.rpc("get_my_duels");
  if (error) throw error;
  return ((data as any[]) || []).map((r: any) => ({
    duel_id: r.duel_id,
    my_role: r.my_role,
    opponent_id: r.opponent_id,
    opponent_username: r.opponent_username,
    opponent_avatar: r.opponent_avatar,
    category: r.category,
    status: r.status,
    my_played_at: r.my_played_at,
    opponent_played_at: r.opponent_played_at,
    my_score: r.my_score,
    opponent_score: r.opponent_score,
    winner_id: r.winner_id,
    expires_at: r.expires_at,
    created_at: r.created_at,
  }));
};

/**
 * Fetch the questions snapshot for a duel (the 10 frozen questions both players play).
 */
export const getAsyncDuelQuestions = async (
  duelId: string
): Promise<{ duel: Duel; questions: AsyncDuelQuestion[] }> => {
  const { data, error } = await (supabase.from("duels") as any)
    .select("*")
    .eq("id", duelId)
    .single();
  if (error) throw error;
  const duel = data as Duel;
  const questions = (duel.questions_payload as AsyncDuelQuestion[]) || [];
  return { duel, questions };
};

export interface AsyncDuelPlayResult {
  status: "pending" | "awaiting_opponent" | "completed" | "expired";
  my_score: number;
  opponent_score: number | null;
  winner_id: string | null;
}

/**
 * Submit the player's 10 answers. Computes server-side score and (if both played)
 * awards XP + sets winner_id.
 */
export const submitAsyncPlay = async (
  duelId: string,
  answers: AsyncDuelAnswer[],
  totalTimeMs: number
): Promise<AsyncDuelPlayResult> => {
  // @ts-ignore — RPC not typed
  const { data, error } = await supabase.rpc("submit_async_duel_play", {
    p_duel_id: duelId,
    p_answers: answers as any,
    p_total_time_ms: totalTimeMs,
  } as any);
  if (error) throw error;
  return data as unknown as AsyncDuelPlayResult;
};

/**
 * Build the public share URL for a duel invite.
 * Format: https://bighead.jrmanagement.org/invite/duel/<duelId>?ref=<referralCode>
 *
 * The marketing site bridge page auto-opens the app via the `bighead://` scheme
 * when installed, otherwise shows install CTAs (App Store / Play Store).
 */
export const DUEL_INVITE_BASE_URL = "https://bighead.jrmanagement.org/invite/duel";

export const buildDuelShareUrl = (duelId: string, referralCode?: string | null): string => {
  const base = `${DUEL_INVITE_BASE_URL}/${duelId}`;
  return referralCode ? `${base}?ref=${encodeURIComponent(referralCode)}` : base;
};

export interface DuelQuestion {
  round_number: number;
  question_id: string;
  question_text: string;
  player_name: string;
  image_url?: string | null;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    correct: string;
  };
}

// =========================================================================
// LEGACY SYNC DUEL — kept for backward compatibility, not used by new UI.
// @deprecated Use createAsyncDuel / submitAsyncPlay / getMyDuels instead.
// =========================================================================

/**
 * @deprecated Use createAsyncDuel.
 */
export const createDuel = async (
  hostId: string,
  category: string = "general",
  rounds: number = 5,
): Promise<{ duelId: string; code: string }> => {
  const { data, error } = await supabase.rpc("create_duel", {
    p_host_id: hostId,
    p_category: category,
    p_rounds: rounds,
  } as any);

  if (error) throw error;
  const result = data as any;
  return {
    duelId: result[0].duel_id,
    code: result[0].duel_code,
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
  } as any);

  if (error) throw error;
  const result = data as any;
  return {
    success: result[0].success,
    duelId: result[0].duel_id,
    message: result[0].message,
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
  } as any);

  if (error) throw error;
  return (data as DuelQuestion[]) || [];
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
  } as any);

  if (error) throw error;
  const result = data as any;
  return {
    success: result[0].success,
    isCorrect: result[0].is_correct,
    correctAnswer: result[0].correct_answer,
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
  } as any);

  if (error) throw error;
  const result = data as any;
  return {
    winnerId: result[0].winner_id,
    hostScore: result[0].host_score,
    guestScore: result[0].guest_score,
  };
};

/**
 * Cancel a duel
 */
export const cancelDuel = async (duelId: string): Promise<void> => {
  const { error } = await (supabase
    .from("duels") as any)
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
