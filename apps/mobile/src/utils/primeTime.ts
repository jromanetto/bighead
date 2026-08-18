/**
 * Prime Time — l'événement quotidien synchronisé (la magie de HQ, sans le coût).
 *
 * Tout le monde reçoit la même question à heure fixe (19h), avec un compteur de
 * participants et un percentile ("tu bats 71%"). On récupère l'effet water-cooler
 * + l'habitude à heure fixe sans streaming live. Toute la logique est pure et
 * prend `now` en paramètre → testable sans horloge réelle.
 *
 * Note : on raisonne en heure LOCALE de l'appareil (le fuseau d'affichage de
 * l'app est Europe/Bruxelles-Paris pour la quasi-totalité des joueurs).
 */

export const PRIME_TIME_HOUR = 19; // 19h locale
export const PRIME_TIME_MINUTE = 0;
export const PRIME_TIME_DURATION_MIN = 15; // fenêtre de jeu "live"

export interface PrimeTimeWindow {
  start: Date;
  end: Date;
}

/** Fenêtre Prime Time du jour de `now` (heure locale). */
export function getPrimeTimeWindow(now: Date): PrimeTimeWindow {
  const start = new Date(now);
  start.setHours(PRIME_TIME_HOUR, PRIME_TIME_MINUTE, 0, 0);
  const end = new Date(start.getTime() + PRIME_TIME_DURATION_MIN * 60_000);
  return { start, end };
}

/** Le Prime Time est-il en cours à l'instant `now` ? */
export function isPrimeTimeLive(now: Date): boolean {
  const { start, end } = getPrimeTimeWindow(now);
  return now.getTime() >= start.getTime() && now.getTime() < end.getTime();
}

/** Millisecondes jusqu'au prochain démarrage (0 si live ; lendemain si déjà passé). */
export function msUntilNextPrimeTime(now: Date): number {
  if (isPrimeTimeLive(now)) return 0;
  const { start } = getPrimeTimeWindow(now);
  if (now.getTime() < start.getTime()) return start.getTime() - now.getTime();
  // déjà passé aujourd'hui → demain
  const tomorrow = new Date(start.getTime() + 24 * 3600_000);
  return tomorrow.getTime() - now.getTime();
}

/** Libellé court "19:00" pour l'UI. */
export function primeTimeLabel(): string {
  const hh = String(PRIME_TIME_HOUR).padStart(2, "0");
  const mm = String(PRIME_TIME_MINUTE).padStart(2, "0");
  return `${hh}:${mm}`;
}

/**
 * Percentile : % de joueurs que tu bats aujourd'hui (0–100).
 * `distribution` = les scores du jour. On compte les scores strictement
 * inférieurs au tien / total. Distribution vide → 0 (pas encore de data).
 */
export function percentile(score: number, distribution: number[]): number {
  if (!distribution || distribution.length === 0) return 0;
  const below = distribution.filter((s) => s < score).length;
  return Math.round((below / distribution.length) * 100);
}

/** "tu bats 71%" / "you beat 71%". */
export function percentileLabel(score: number, distribution: number[], lang: "fr" | "en" = "fr"): string {
  const p = percentile(score, distribution);
  return lang === "fr" ? `Tu bats ${p}% des joueurs` : `You beat ${p}% of players`;
}

/** Compteur de participants formaté avec séparateur de milliers localisé.
 *  FR : espace ASCII (prévisible, pas d'espace fine insécable cachée). */
export function formatParticipants(n: number, lang: "fr" | "en" = "fr"): string {
  const count = Math.max(0, Math.floor(n || 0));
  const sep = lang === "fr" ? " " : ",";
  const grouped = String(count).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  if (lang === "fr") return `${grouped} joueur${count > 1 ? "s" : ""}`;
  return `${grouped} player${count === 1 ? "" : "s"}`;
}
