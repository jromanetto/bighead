import type { StringKey } from '#/lib/i18n/strings'

/**
 * A playable quiz category. `slug` is the value stored in `questions.category`
 * and accepted by the RPCs (`p_category`). The label/description keys resolve
 * via {@link import('#/lib/i18n/strings').t} for FR/EN copy.
 */
export interface Category {
  /** DB value — also the URL slug for `/quiz/$category`. */
  slug: string
  emoji: string
  /** i18n key for the short display name (reuses the existing `category.*`). */
  labelKey: StringKey
  /** i18n key for the SEO landing description. */
  descKey: StringKey
}

/**
 * The 11 categories, in display order. Mirrors `DUEL_CATEGORIES` in `duels.ts`
 * (kept as a separate, richer model so SEO pages own their copy without
 * coupling to the duel flow).
 */
export const CATEGORIES: readonly Category[] = [
  { slug: 'general', emoji: '🧠', labelKey: 'category.general', descKey: 'quiz.desc.general' },
  { slug: 'history', emoji: '🏛️', labelKey: 'category.history', descKey: 'quiz.desc.history' },
  { slug: 'geography', emoji: '🌍', labelKey: 'category.geography', descKey: 'quiz.desc.geography' },
  { slug: 'music', emoji: '🎵', labelKey: 'category.music', descKey: 'quiz.desc.music' },
  { slug: 'science', emoji: '🔬', labelKey: 'category.science', descKey: 'quiz.desc.science' },
  { slug: 'literature', emoji: '📚', labelKey: 'category.literature', descKey: 'quiz.desc.literature' },
  { slug: 'technology', emoji: '💻', labelKey: 'category.technology', descKey: 'quiz.desc.technology' },
  { slug: 'animals', emoji: '🐾', labelKey: 'category.animals', descKey: 'quiz.desc.animals' },
  { slug: 'sport', emoji: '⚽', labelKey: 'category.sport', descKey: 'quiz.desc.sport' },
  { slug: 'cinema', emoji: '🎬', labelKey: 'category.cinema', descKey: 'quiz.desc.cinema' },
  { slug: 'nature', emoji: '🌿', labelKey: 'category.nature', descKey: 'quiz.desc.nature' },
] as const

/** Returns the {@link Category} for a slug, or `undefined` for unknown slugs. */
export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug)
}
