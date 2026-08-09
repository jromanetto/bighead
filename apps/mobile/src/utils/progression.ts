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
