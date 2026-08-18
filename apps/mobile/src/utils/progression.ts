/**
 * Progression "qui paie" : les niveaux débloquent un TITRE de rang (au lieu d'un
 * simple nombre sans payoff), et les séries ont des paliers célébrés — alignés
 * sur les récompenses XP serveur (_award_streak_milestone_xp : 3/7/14/30/60/100).
 */

export interface LevelRank {
  minLevel: number;
  fr: string;
  en: string;
}

// Rangs croissants. `minLevel` = niveau à partir duquel le rang s'applique.
export const LEVEL_RANKS: LevelRank[] = [
  { minLevel: 1, fr: "Novice", en: "Novice" },
  { minLevel: 3, fr: "Curieux", en: "Curious" },
  { minLevel: 5, fr: "Connaisseur", en: "Connoisseur" },
  { minLevel: 10, fr: "Érudit", en: "Scholar" },
  { minLevel: 20, fr: "Expert", en: "Expert" },
  { minLevel: 35, fr: "Maître", en: "Master" },
  { minLevel: 50, fr: "Sage", en: "Sage" },
  { minLevel: 75, fr: "Génie", en: "Genius" },
  { minLevel: 100, fr: "Légende", en: "Legend" },
];

/** Rang correspondant à un niveau (le plus haut dont `minLevel <= level`). */
export function getLevelRank(level: number): LevelRank {
  let rank = LEVEL_RANKS[0];
  for (const r of LEVEL_RANKS) {
    if (level >= r.minLevel) rank = r;
    else break;
  }
  return rank;
}

/** Titre de rang localisé pour un niveau. */
export function getLevelTitle(level: number, lang: "fr" | "en" = "fr"): string {
  const rank = getLevelRank(level);
  return lang === "en" ? rank.en : rank.fr;
}

/**
 * Courbe de niveau UNIQUE de l'app.
 *
 * Avant : 3 formules divergentes (Home + Achievements en `100·1.5^(n-1)`,
 * Stats en `xp % 1000`). Ici on canonise la croissance exponentielle et on
 * expose un seul `calculateLevel` que tous les écrans doivent utiliser.
 */
export function getXPForLevel(level: number): number {
  const n = Math.max(1, Math.floor(level));
  return Math.floor(100 * Math.pow(1.5, n - 1));
}

export interface LevelInfo {
  level: number;
  currentXP: number; // XP accumulée dans le niveau courant
  nextLevelXP: number; // XP nécessaire pour finir le niveau courant
  progress: number; // 0–100 (%)
}

/** Niveau + progression à partir de l'XP totale. */
export function calculateLevel(totalXP: number): LevelInfo {
  let level = 1;
  let xpRemaining = Math.max(0, Math.floor(totalXP || 0));

  while (xpRemaining >= getXPForLevel(level)) {
    xpRemaining -= getXPForLevel(level);
    level++;
  }

  const nextLevelXP = getXPForLevel(level);
  const progress = nextLevelXP > 0 ? (xpRemaining / nextLevelXP) * 100 : 0;

  return { level, currentXP: xpRemaining, nextLevelXP, progress };
}

// Paliers de série (mêmes seuils que la récompense XP serveur).
export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100] as const;

/** La série atteint-elle exactement un palier (moment à célébrer) ? */
export function isStreakMilestone(streak: number): boolean {
  return (STREAK_MILESTONES as readonly number[]).includes(streak);
}

/** Prochain palier de série à viser (null si au-delà du dernier). */
export function nextStreakMilestone(streak: number): number | null {
  return (STREAK_MILESTONES as readonly number[]).find((m) => m > streak) ?? null;
}
