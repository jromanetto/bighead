/**
 * Friend streaks — la série MUTUELLE entre deux amis (Vague 4).
 *
 * Duolingo l'a prouvé : un joueur sans motivation intrinsèque ouvre quand même
 * l'app pour ne pas laisser tomber un ami. Une série mutuelle = nombre de jours
 * consécutifs où LES DEUX ont joué. 100% pur (prend `today` en paramètre).
 */

/** Normalise une date (ISO ou Date) en clé de jour "YYYY-MM-DD" (UTC). */
export function dayKey(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

/** Jour précédent une clé "YYYY-MM-DD". */
function prevDay(key: string): string {
  const d = new Date(key + "T00:00:00.000Z");
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Série mutuelle courante : jours consécutifs (en remontant depuis aujourd'hui,
 * ou hier si l'un des deux n'a pas encore joué aujourd'hui) où LES DEUX ont joué.
 *
 * @param daysA jours joués par le joueur A (dates ISO)
 * @param daysB jours joués par le joueur B
 * @param today jour de référence (ISO)
 */
export function mutualStreak(
  daysA: (string | Date)[],
  daysB: (string | Date)[],
  today: string | Date,
): number {
  const setA = new Set(daysA.map(dayKey).filter(Boolean));
  const setB = new Set(daysB.map(dayKey).filter(Boolean));
  const both = (k: string) => setA.has(k) && setB.has(k);

  const todayKey = dayKey(today);
  if (!todayKey) return 0;

  // Point de départ : aujourd'hui si les deux ont joué, sinon hier (tolérance
  // "pas encore joué aujourd'hui" — on ne casse pas la série avant la fin du jour).
  let cursor = todayKey;
  if (!both(cursor)) {
    cursor = prevDay(cursor);
    if (!both(cursor)) return 0;
  }

  let streak = 0;
  while (both(cursor)) {
    streak++;
    cursor = prevDay(cursor);
  }
  return streak;
}

/** La série mutuelle est-elle en danger (les deux ont joué hier, pas encore aujourd'hui) ? */
export function isMutualStreakAtRisk(
  daysA: (string | Date)[],
  daysB: (string | Date)[],
  today: string | Date,
): boolean {
  const setA = new Set(daysA.map(dayKey).filter(Boolean));
  const setB = new Set(daysB.map(dayKey).filter(Boolean));
  const todayKey = dayKey(today);
  if (!todayKey) return false;
  const yesterday = prevDay(todayKey);
  const bothYesterday = setA.has(yesterday) && setB.has(yesterday);
  const bothToday = setA.has(todayKey) && setB.has(todayKey);
  return bothYesterday && !bothToday;
}
