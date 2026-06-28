/**
 * Libellé + couleur de la difficulté d'un défi (1=Facile, 2=Moyen, 3=Difficile).
 * Couleur pour un badge bien visible : vert / ambre / rouge.
 */
export interface DiffMeta {
  fr: string;
  en: string;
  color: string;
  dot: string;
}

const DIFFS: Record<number, DiffMeta> = {
  1: { fr: "Facile", en: "Easy", color: "#22c55e", dot: "🟢" },
  2: { fr: "Moyen", en: "Medium", color: "#f59e0b", dot: "🟡" },
  3: { fr: "Difficile", en: "Hard", color: "#ef4444", dot: "🔴" },
};

export function difficultyMeta(level: number | null | undefined): DiffMeta | null {
  return level ? (DIFFS[level] ?? null) : null;
}

export function difficultyLabel(level: number | null | undefined, lang: string): string {
  const d = difficultyMeta(level);
  if (!d) return "";
  return lang === "fr" ? d.fr : d.en;
}
