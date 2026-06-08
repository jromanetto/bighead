export type Lang = 'fr' | 'en'

type Entry = { fr: string; en: string }

export const strings = {
  'nav.play': { fr: 'Jouer', en: 'Play' },
  'nav.duels': { fr: 'Duels', en: 'Duels' },
  'nav.leaderboard': { fr: 'Classement', en: 'Leaderboard' },
  'nav.profile': { fr: 'Profil', en: 'Profile' },
  'app.tagline': {
    fr: 'Le quiz qui ne pardonne rien.',
    en: 'The quiz that pulls no punches.',
  },
} satisfies Record<string, Entry>

export type StringKey = keyof typeof strings

/**
 * Returns the localized string for `key` in `lang`.
 * Unknown keys are returned verbatim (acts as a visible fallback).
 */
export function t(key: string, lang: Lang): string {
  const entry = (strings as Record<string, Entry | undefined>)[key]
  if (!entry) return key
  return entry[lang]
}
