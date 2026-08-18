/**
 * Niveaux par thème — l'identité "je suis un expert de X" (l'idée de QuizUp),
 * bâtie sur la MÊME courbe de niveau que le reste de l'app (progression.ts).
 *
 * Au lieu d'un unique XP global, chaque thème (Histoire, Cinéma, Sport…) a son
 * propre niveau : ça transforme un but unique en collection de buts, et donne au
 * joueur un autoportrait de son savoir. Pur → testable.
 */
import { calculateLevel, getLevelTitle, type LevelInfo } from "./progression";

export interface ThemeProgress extends LevelInfo {
  theme: string;
  xp: number;
  title: string;
}

/** Progression d'un thème donné à partir de son XP cumulée. */
export function themeProgress(theme: string, xp: number, lang: "fr" | "en" = "fr"): ThemeProgress {
  const info = calculateLevel(xp);
  return {
    theme,
    xp: Math.max(0, Math.floor(xp || 0)),
    title: getLevelTitle(info.level, lang),
    ...info,
  };
}

/**
 * Classe les thèmes d'un joueur du plus maîtrisé au moins maîtrisé.
 * `xpByTheme` = { histoire: 1200, cinema: 300, … }.
 */
export function rankThemes(
  xpByTheme: Record<string, number>,
  lang: "fr" | "en" = "fr",
): ThemeProgress[] {
  return Object.entries(xpByTheme || {})
    .map(([theme, xp]) => themeProgress(theme, xp, lang))
    .sort((a, b) => b.xp - a.xp || a.theme.localeCompare(b.theme));
}

/** Le thème "signature" du joueur (le plus maîtrisé), ou null si aucun XP. */
export function signatureTheme(
  xpByTheme: Record<string, number>,
  lang: "fr" | "en" = "fr",
): ThemeProgress | null {
  const ranked = rankThemes(xpByTheme, lang);
  const top = ranked[0];
  return top && top.xp > 0 ? top : null;
}
