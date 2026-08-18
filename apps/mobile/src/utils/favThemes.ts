/**
 * Thèmes favoris — choisis à l'onboarding (device d'engagement + perso).
 *
 * Duolingo le prouve : faire choisir ses centres d'intérêt à l'entrée n'est pas
 * de la collecte de data, c'est un ENGAGEMENT (le joueur s'investit) et ça
 * alimente la personnalisation (notif Mia « Question Histoire aujourd'hui — ton
 * point fort »). Les helpers de mapping sont purs → testables.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

export const FAV_THEMES_KEY = "@bighead_fav_themes";

export interface ThemeOption {
  id: string;
  fr: string;
  en: string;
  emoji: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: "culture_generale", fr: "Culture G", en: "General", emoji: "🧠" },
  { id: "histoire", fr: "Histoire", en: "History", emoji: "🏛️" },
  { id: "geographie", fr: "Géographie", en: "Geography", emoji: "🌍" },
  { id: "sciences", fr: "Sciences", en: "Science", emoji: "🔬" },
  { id: "sport", fr: "Sport", en: "Sport", emoji: "⚽" },
  { id: "cinema", fr: "Cinéma", en: "Movies", emoji: "🎬" },
  { id: "musique", fr: "Musique", en: "Music", emoji: "🎵" },
  { id: "art", fr: "Art", en: "Art", emoji: "🎨" },
  { id: "jeux_video", fr: "Jeux vidéo", en: "Gaming", emoji: "🎮" },
  { id: "technologie", fr: "Techno", en: "Tech", emoji: "💻" },
];

/** Libellé localisé d'un thème (pur). */
export function themeLabel(id: string, lang: "fr" | "en" = "fr"): string {
  const opt = THEME_OPTIONS.find((o) => o.id === id);
  if (!opt) return id;
  return lang === "fr" ? opt.fr : opt.en;
}

/** Thème "principal" (le 1er sélectionné) + ses libellés, pour la perso des notifs. */
export function primaryFavTheme(ids: string[]): { id: string; fr: string; en: string } | null {
  const first = (ids || []).find((id) => THEME_OPTIONS.some((o) => o.id === id));
  if (!first) return null;
  const opt = THEME_OPTIONS.find((o) => o.id === first)!;
  return { id: opt.id, fr: opt.fr, en: opt.en };
}

/** Persiste les thèmes favoris (ne casse jamais l'onboarding). */
export async function saveFavThemes(ids: string[]): Promise<void> {
  try {
    const clean = (ids || []).filter((id) => THEME_OPTIONS.some((o) => o.id === id));
    await AsyncStorage.setItem(FAV_THEMES_KEY, JSON.stringify(clean));
  } catch {
    // silencieux
  }
}

/** Charge les thèmes favoris (vide si aucun / erreur). */
export async function loadFavThemes(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(FAV_THEMES_KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
