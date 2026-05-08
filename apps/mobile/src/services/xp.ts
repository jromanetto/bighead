import { supabase } from "./supabase";

export type XPSource =
  | "chain_solo"
  | "party"
  | "duel"
  | "tournament"
  | "family"
  | "adventure"
  | "traitor"
  | "auction"
  | "challenge"
  | "daily"
  | "achievement"
  | "referral";

export interface XPGain {
  base: number;
  bonus: number;
  total: number;
  breakdown: Array<{ label: string; amount: number }>;
}

/**
 * Compute XP gain for a game mode based on score + accuracy.
 * Used both for display (immediate, optimistic) and to inform award_xp call.
 */
export function computeXP(opts: {
  source: XPSource;
  score?: number;
  correctCount?: number;
  totalQuestions?: number;
  won?: boolean; // for duel/tournament
  rank?: number; // for tournament/party (1-based)
  totalPlayers?: number;
  isPerfect?: boolean;
  streakDays?: number; // for daily
  multiplier?: number;
}): XPGain {
  const {
    source,
    score = 0,
    correctCount = 0,
    totalQuestions = 0,
    won = false,
    rank = 0,
    totalPlayers = 0,
    isPerfect = false,
    streakDays = 0,
    multiplier = 1,
  } = opts;

  const breakdown: Array<{ label: string; amount: number }> = [];
  let base = 0;
  let bonus = 0;

  switch (source) {
    case "chain_solo":
    case "party":
      base = Math.round(score * 0.1);
      bonus = correctCount * 10;
      breakdown.push({ label: "score", amount: base });
      breakdown.push({ label: "correct", amount: bonus });
      break;
    case "duel":
      base = Math.round(score * 0.15);
      bonus = won ? 50 : 10;
      breakdown.push({ label: "performance", amount: base });
      breakdown.push({ label: won ? "victory" : "participation", amount: bonus });
      break;
    case "tournament":
      base = Math.round(score * 0.2);
      if (rank === 1) bonus = 200;
      else if (rank === 2) bonus = 100;
      else if (rank === 3) bonus = 50;
      else if (rank > 0 && totalPlayers > 0 && rank <= Math.ceil(totalPlayers / 2)) bonus = 25;
      else bonus = 10;
      breakdown.push({ label: "score", amount: base });
      if (bonus > 0) breakdown.push({ label: rank > 0 ? `rank ${rank}` : "participation", amount: bonus });
      break;
    case "family":
    case "adventure":
      base = correctCount * 8;
      bonus = isPerfect ? 50 : 0;
      breakdown.push({ label: "correct", amount: base });
      if (bonus) breakdown.push({ label: "perfect", amount: bonus });
      break;
    case "traitor":
      base = Math.round(score * 0.1);
      bonus = won ? 75 : 25;
      breakdown.push({ label: "score", amount: base });
      breakdown.push({ label: won ? "victory" : "round", amount: bonus });
      break;
    case "auction":
      base = correctCount * 12;
      bonus = won ? 100 : 0;
      breakdown.push({ label: "correct", amount: base });
      if (bonus) breakdown.push({ label: "auction win", amount: bonus });
      break;
    case "challenge":
      base = Math.round(score * 0.1);
      bonus = won ? 60 : 0;
      breakdown.push({ label: "score", amount: base });
      if (bonus) breakdown.push({ label: "beat opponent", amount: bonus });
      break;
    case "daily":
      base = correctCount * 15;
      bonus = isPerfect ? 100 : 0;
      const streakBonus = Math.min(streakDays, 30) * 5;
      breakdown.push({ label: "correct", amount: base });
      if (bonus) breakdown.push({ label: "perfect", amount: bonus });
      if (streakBonus) {
        breakdown.push({ label: `${streakDays}-day streak`, amount: streakBonus });
        bonus += streakBonus;
      }
      break;
    case "achievement":
    case "referral":
      base = score; // score field is reused as raw amount
      breakdown.push({ label: source, amount: base });
      break;
  }

  const subtotal = base + bonus;
  const total = Math.round(subtotal * multiplier);
  if (multiplier !== 1) {
    breakdown.push({ label: `×${multiplier} bonus`, amount: total - subtotal });
  }
  return { base, bonus, total, breakdown };
}

/**
 * Award XP via the unified RPC. Returns new total_xp or null on failure.
 * `dedupeKey` prevents double-awarding the same event (e.g. duel id, daily date).
 */
export async function awardXP(
  userId: string,
  amount: number,
  source: XPSource,
  metadata?: Record<string, unknown>,
  dedupeKey?: string
): Promise<number | null> {
  if (!userId || amount <= 0) return null;
  try {
    // @ts-ignore - RPC types not generated
    const { data, error } = await supabase.rpc("award_xp", {
      p_user_id: userId,
      p_amount: amount,
      p_source: source,
      p_metadata: metadata || null,
      p_dedupe_key: dedupeKey || null,
    });
    if (error) {
      console.warn("[xp] award_xp error:", error.message);
      return null;
    }
    return data as number;
  } catch (e) {
    console.warn("[xp] award_xp threw:", e);
    return null;
  }
}
