/**
 * Libellés + emoji des catégories de quiz (les traductions i18n sont partielles).
 * Sert à afficher clairement la catégorie d'un défi (ex: "🌍 Géographie").
 */
export interface CatMeta {
  fr: string;
  en: string;
  emoji: string;
}

const CATEGORIES: Record<string, CatMeta> = {
  general: { fr: "Culture générale", en: "General knowledge", emoji: "🧠" },
  history: { fr: "Histoire", en: "History", emoji: "🏛️" },
  geography: { fr: "Géographie", en: "Geography", emoji: "🌍" },
  music: { fr: "Musique", en: "Music", emoji: "🎵" },
  science: { fr: "Sciences", en: "Science", emoji: "🔬" },
  literature: { fr: "Littérature", en: "Literature", emoji: "📚" },
  technology: { fr: "Technologie", en: "Technology", emoji: "💻" },
  animals: { fr: "Animaux", en: "Animals", emoji: "🐾" },
  sport: { fr: "Sport", en: "Sport", emoji: "⚽" },
  cinema: { fr: "Cinéma", en: "Cinema", emoji: "🎬" },
  nature: { fr: "Nature", en: "Nature", emoji: "🌿" },
  "pop-culture": { fr: "Pop culture", en: "Pop culture", emoji: "✨" },
};

export function categoryMeta(slug: string | null | undefined): CatMeta | null {
  return slug ? (CATEGORIES[slug] ?? null) : null;
}

/** Libellé court de la catégorie ("" si inconnue). */
export function categoryLabel(slug: string | null | undefined, lang: string): string {
  const c = categoryMeta(slug);
  if (!c) return "";
  return lang === "fr" ? c.fr : c.en;
}
