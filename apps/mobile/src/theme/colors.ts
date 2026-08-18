/**
 * Palette canonique "QuizNext" — source unique de vérité.
 *
 * Avant : chaque écran redéclarait son propre `const COLORS = {…}` (dérive
 * garantie entre écrans, teintes qui divergent). Ce module centralise la
 * palette pour que tout l'app partage exactement les mêmes tokens.
 *
 * Migration progressive : les nouveaux écrans importent `COLORS` d'ici ; les
 * anciens sont migrés au fil de l'eau (`import { COLORS } from "@/theme/colors"`).
 */

export const COLORS = {
  // Fonds
  bg: "#161a1d",
  surface: "#1E2529",
  surfaceActive: "#252e33",

  // Accents
  primary: "#00c2cc",
  primaryDim: "rgba(0, 194, 204, 0.15)",
  coral: "#FF6B6B",
  coralDim: "rgba(255, 107, 107, 0.15)",
  purple: "#A16EFF",
  purpleDim: "rgba(161, 110, 255, 0.15)",
  yellow: "#FFD100",
  yellowDim: "rgba(255, 209, 0, 0.15)",
  gold: "#fbbf24",
  goldDim: "rgba(251, 191, 36, 0.15)",

  // Sémantiques
  success: "#22c55e",
  error: "#ef4444",
  streak: "#f97316",

  // Deep tints (cartes)
  teal: "#134e4a",
  red: "#450a0a",

  // Texte
  text: "#ffffff",
  textMuted: "#9ca3af",
} as const;

export type ColorToken = keyof typeof COLORS;

/** Applique une opacité (0–1) à un token hex #RRGGBB → "rgba(r,g,b,a)". */
export function withAlpha(token: ColorToken, alpha: number): string {
  const hex = COLORS[token];
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
