import { Share } from "react-native";
import { supabase } from "./supabase";

export interface WeeklyChallenge {
  id: string;
  theme_slug: string;
  theme_label_fr: string;
  theme_label_en: string;
  description_fr: string | null;
  description_en: string | null;
  emoji: string;
  color: string;
  target_category: string;
  target_difficulty: number | null;
  challenge_type: "themed" | "news";
  start_date: string;
  end_date: string;
  status: "active" | "closed" | "archived" | "upcoming";
  total_questions: number;
  total_players: number;
}

export type WeeklyChallengeType = "themed" | "news";

export interface WeeklyQuestion {
  id: string;
  position: number;
  difficulty: number;
  question_text: string;
  correct_answer: string;
  wrong_answers: string[];
  learning_fact: string | null;
  image_url: string | null;
}

export interface WeeklyProgress {
  id: string;
  challenge_id: string;
  current_position: number;
  correct_count: number;
  day_streak: number;
  best_day_streak: number;
  daily_play_counts: Record<string, number>;
  completed_at: string | null;
  final_score: number | null;
  final_xp_awarded: number;
  badge_earned: string | null;
  last_played_at: string;
}

export interface WeeklyLeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url: string | null;
  correct_count: number;
  current_position: number;
  day_streak: number;
  completed_at: string | null;
  rank: number;
}

// Weekly challenge: all 30 questions unlocked from day 1. No daily cap.

export async function getActiveWeeklyChallenge(
  type: WeeklyChallengeType = "themed",
): Promise<WeeklyChallenge | null> {
  const { data, error } = await (supabase as any)
    .from("weekly_challenges")
    .select("*")
    .eq("status", "active")
    .eq("challenge_type", type)
    .order("start_date", { ascending: false })
    // Deterministic tiebreak: si deux défis du même type partagent la même
    // start_date (ne devrait pas arriver, mais c'est arrivé), on prend le plus
    // récemment créé — sinon Postgres renvoie une ligne arbitraire et différents
    // appels peuvent résoudre des défis différents (questions croisées en plein jeu).
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.warn("[weekly] active fetch:", error.message);
    return null;
  }
  return (data as WeeklyChallenge) ?? null;
}

export async function getWeeklyChallengeById(
  id: string,
): Promise<WeeklyChallenge | null> {
  const { data, error } = await (supabase as any)
    .from("weekly_challenges")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.warn("[weekly] byId fetch:", error.message);
    return null;
  }
  return (data as WeeklyChallenge) ?? null;
}

/**
 * Résout le défi pour les écrans de jeu. On privilégie l'id explicite (la
 * carte réellement cliquée) et on retombe sur "l'actif par type" pour les
 * points d'entrée legacy. Indispensable quand plusieurs défis du même type
 * sont actifs la même semaine (sinon tous ouvrent le même quiz).
 */
export async function resolveWeeklyChallenge(opts: {
  id?: string | null;
  type?: WeeklyChallengeType;
}): Promise<WeeklyChallenge | null> {
  if (opts.id) {
    const byId = await getWeeklyChallengeById(opts.id);
    if (byId) return byId;
  }
  return getActiveWeeklyChallenge(opts.type ?? "themed");
}

/**
 * Sélection de la home : la dernière actu de la semaine (news) + les 3
 * derniers quiz thématiques (le plus récent chasse le plus vieux).
 * Tout le reste vit dans l'écran "Plus de quiz hebdo" (historique).
 */
export async function getHomeChallenges(): Promise<WeeklyChallenge[]> {
  const { data, error } = await (supabase as any)
    .from("weekly_challenges")
    .select("*")
    .in("status", ["active", "closed", "archived"])
    .eq("generation_status", "ready")
    .order("start_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(12);
  if (error) {
    console.warn("[weekly] home fetch:", error.message);
    return [];
  }
  const list = (data as WeeklyChallenge[]) ?? [];
  const news = list.find((c) => c.challenge_type === "news");
  const themed = list.filter((c) => c.challenge_type === "themed").slice(0, 3);
  return [...(news ? [news] : []), ...themed];
}

export async function getMyWeeklyProgress(challengeId: string): Promise<WeeklyProgress | null> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return null;
  const { data, error } = await (supabase as any)
    .from("weekly_challenge_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("challenge_id", challengeId)
    .maybeSingle();
  if (error) {
    console.warn("[weekly] progress fetch:", error.message);
    return null;
  }
  return (data as WeeklyProgress) ?? null;
}

export async function getNextWeeklyQuestion(
  challengeId: string,
  language: "fr" | "en",
  position: number,
): Promise<WeeklyQuestion | null> {
  const { data, error } = await (supabase as any)
    .from("weekly_challenge_questions")
    .select(
      `id, position, difficulty,
       question_fr, correct_answer_fr, wrong_answers_fr, learning_fact_fr,
       question_en, correct_answer_en, wrong_answers_en, learning_fact_en,
       image_url`,
    )
    .eq("challenge_id", challengeId)
    .eq("position", position)
    .maybeSingle();
  if (error || !data) {
    if (error) console.warn("[weekly] question fetch:", error.message);
    return null;
  }
  return {
    id: data.id,
    position: data.position,
    difficulty: data.difficulty,
    question_text: language === "fr" ? data.question_fr : data.question_en,
    correct_answer: language === "fr" ? data.correct_answer_fr : data.correct_answer_en,
    wrong_answers: language === "fr" ? data.wrong_answers_fr : data.wrong_answers_en,
    learning_fact: language === "fr" ? data.learning_fact_fr : data.learning_fact_en,
    image_url: data.image_url,
  };
}

export async function submitWeeklyAnswer(
  challengeId: string,
  position: number,
  isCorrect: boolean,
): Promise<{
  current_position: number;
  correct_count: number;
  day_streak: number;
  completed: boolean;
  today_count: number;
} | null> {
  // @ts-ignore not in generated types
  const { data, error } = await supabase.rpc("submit_weekly_answer", {
    p_challenge_id: challengeId,
    p_position: position,
    p_is_correct: isCorrect,
  });
  if (error) {
    console.warn("[weekly] submit error:", error.message);
    return null;
  }
  return data as any;
}

export async function getWeeklyLeaderboard(
  challengeId: string,
  limit = 50,
): Promise<WeeklyLeaderboardEntry[]> {
  // @ts-ignore
  const { data, error } = await supabase.rpc("get_weekly_challenge_leaderboard", {
    p_challenge_id: challengeId,
    p_limit: limit,
  });
  if (error) {
    console.warn("[weekly] leaderboard error:", error.message);
    return [];
  }
  return (data as WeeklyLeaderboardEntry[]) ?? [];
}

export function daysIntoChallenge(c: Pick<WeeklyChallenge, "start_date">): number {
  const start = new Date(c.start_date + "T00:00:00Z");
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export function dayQuotaRemaining(
  _challenge: Pick<WeeklyChallenge, "start_date">,
  _progress: WeeklyProgress | null,
): { remaining: number; unlimited: boolean } {
  // All 30 questions unlocked from day 1. Kept for signature compatibility.
  return { remaining: Infinity, unlimited: true };
}

export function timeUntilEnd(c: Pick<WeeklyChallenge, "end_date">): {
  days: number;
  hours: number;
  totalMs: number;
} {
  const end = new Date(c.end_date + "T23:59:59Z");
  const ms = end.getTime() - Date.now();
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    totalMs: Math.max(0, ms),
  };
}

// Lien de partage d'un défi : pointe vers la bridge page du site dédié, qui
// ouvre l'app (bighead://weekly?id=...) si installée, sinon propose le store.
// Même mécanique que les invitations de duel (/invite/duel).
const QUIZ_INVITE_BASE_URL = "https://bighead-quizz.com/invite/quiz";

export function buildQuizShareUrl(
  challengeId: string,
  type: WeeklyChallengeType = "themed",
): string {
  return `${QUIZ_INVITE_BASE_URL}/${challengeId}?t=${type}`;
}

/**
 * Ouvre la feuille de partage native (WhatsApp, iMessage, etc.) avec un message
 * localisé + le lien du défi. Le lien renvoie vers le store si l'app n'est pas
 * installée. Renvoie false si l'utilisateur annule ou en cas d'erreur.
 */
export async function shareWeeklyChallenge(
  challenge: Pick<
    WeeklyChallenge,
    "id" | "theme_label_fr" | "theme_label_en" | "emoji" | "challenge_type"
  >,
  language: string,
): Promise<boolean> {
  const url = buildQuizShareUrl(challenge.id, challenge.challenge_type);
  const label = language === "fr" ? challenge.theme_label_fr : challenge.theme_label_en;
  const emoji = challenge.emoji || "🧠";
  const message =
    language === "fr"
      ? `${emoji} Je te défie sur le quiz « ${label} » de BIGHEAD ! Tu arrives à me battre ? 🧠\n\n👉 ${url}`
      : `${emoji} I challenge you on the "${label}" quiz on BIGHEAD! Can you beat me? 🧠\n\n👉 ${url}`;
  try {
    // message porte le lien (Android/WhatsApp), url enrichit la fiche iOS.
    const res = await Share.share({ message, url }, { dialogTitle: label });
    return res.action === Share.sharedAction;
  } catch (e) {
    console.warn("[weekly] share failed:", e);
    return false;
  }
}

export function shuffleAnswers(question: WeeklyQuestion): string[] {
  const arr = [question.correct_answer, ...question.wrong_answers];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
