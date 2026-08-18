/**
 * Teams / Clubs (Vague 4) — la mécanique de plus haut ROI du benchmark : une
 * obligation SOCIALE ("mon club a besoin de mes points cette semaine") qui
 * retient là où streak et XP plafonnent. À ~8 joueurs, un club de 8 ressemble à
 * une communauté ; un board global à un désert.
 *
 * Les helpers de calcul sont PURS (testables) ; les fonctions réseau parlent aux
 * RPC de la migration `teams` (types non générés → @ts-ignore).
 */
import { supabase } from "./supabase";

export const TEAM_MEMBER_CAP = 20;
export const TEAM_MIN_TO_COUNT = 1;

export interface Team {
  id: string;
  name: string;
  emoji: string;
  join_code: string;
  member_count: number;
  weekly_xp: number;
}

export interface TeamMember {
  user_id: string;
  username: string | null;
  weekly_xp: number;
}

// ---------- Helpers PURS (testables sans réseau) ----------

/** Total d'XP hebdo d'un club = somme des XP hebdo de ses membres. */
export function computeTeamWeeklyTotal(memberWeeklyXps: number[]): number {
  return (memberWeeklyXps || []).reduce((sum, x) => sum + (Number(x) || 0), 0);
}

/** Peut-on encore rejoindre (sous le plafond) ? */
export function canJoinTeam(memberCount: number, cap: number = TEAM_MEMBER_CAP): boolean {
  return (memberCount || 0) < cap;
}

/** Progression vers l'objectif hebdo du club (0–100). */
export function teamProgressToGoal(total: number, goal: number): number {
  if (!goal || goal <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((total / goal) * 100)));
}

/** Classe des clubs par XP hebdo décroissante (déterministe sur égalité). */
export function rankTeams<T extends { weekly_xp: number; name: string }>(teams: T[]): T[] {
  return [...(teams || [])].sort(
    (a, b) => (b.weekly_xp || 0) - (a.weekly_xp || 0) || a.name.localeCompare(b.name),
  );
}

/** Objectif hebdo suggéré selon la taille du club (barème doux, atteignable). */
export function suggestedWeeklyGoal(memberCount: number): number {
  const n = Math.max(1, memberCount || 1);
  return n * 500; // ~500 XP/membre/semaine
}

// ---------- Réseau (RPC de la migration `teams`) ----------

export const createTeam = async (name: string, emoji: string): Promise<Team | null> => {
  // @ts-ignore - RPC non typée
  const { data, error } = await supabase.rpc("create_team", { p_name: name, p_emoji: emoji });
  if (error) {
    console.error("[teams] createTeam", error);
    return null;
  }
  const row = Array.isArray(data) ? data[0] : data;
  return (row as Team) ?? null;
};

export const joinTeam = async (joinCode: string): Promise<boolean> => {
  // @ts-ignore - RPC non typée
  const { data, error } = await supabase.rpc("join_team", { p_join_code: joinCode.toUpperCase() });
  if (error) {
    console.error("[teams] joinTeam", error);
    return false;
  }
  return data === true;
};

export const getMyTeam = async (): Promise<Team | null> => {
  // @ts-ignore - RPC non typée
  const { data, error } = await supabase.rpc("get_my_team");
  if (error) {
    console.error("[teams] getMyTeam", error);
    return null;
  }
  const row = Array.isArray(data) ? data[0] : data;
  return (row as Team) ?? null;
};

export const getTeamLeaderboard = async (limit = 30): Promise<Team[]> => {
  // @ts-ignore - RPC non typée
  const { data, error } = await supabase.rpc("get_team_leaderboard", { p_limit: limit });
  if (error) {
    console.error("[teams] getTeamLeaderboard", error);
    return [];
  }
  return (data as Team[]) ?? [];
};
