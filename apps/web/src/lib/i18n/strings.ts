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

  // Quiz gameplay
  'quiz.timer.label': { fr: 'Temps restant', en: 'Time remaining' },
  'quiz.chain.label': { fr: 'Série', en: 'Chain' },
  'quiz.answerPrefix.a': { fr: 'Réponse A', en: 'Answer A' },
  'quiz.answerPrefix.b': { fr: 'Réponse B', en: 'Answer B' },
  'quiz.answerPrefix.c': { fr: 'Réponse C', en: 'Answer C' },
  'quiz.answerPrefix.d': { fr: 'Réponse D', en: 'Answer D' },
  'quiz.difficulty.label': { fr: 'Difficulté', en: 'Difficulty' },

  // Result screen
  'result.title': { fr: 'Partie terminée', en: 'Game over' },
  'result.score': { fr: 'Score', en: 'Score' },
  'result.correct': { fr: 'Bonnes réponses', en: 'Correct answers' },
  'result.maxChain': { fr: 'Meilleure série', en: 'Best chain' },
  'result.perfect': { fr: 'PARFAIT !', en: 'PERFECT!' },
  'result.replay': { fr: 'Rejouer', en: 'Play again' },
  'result.backToPlay': { fr: 'Retour au menu', en: 'Back to menu' },
  'result.cta.title': {
    fr: 'Joue partout avec l’app',
    en: 'Play anywhere with the app',
  },
  'result.cta.subtitle': {
    fr: 'Duels, classements et défis quotidiens sur mobile.',
    en: 'Duels, leaderboards and daily challenges on mobile.',
  },
  'result.cta.appStore': {
    fr: 'Télécharger sur l’App Store',
    en: 'Download on the App Store',
  },
  'result.cta.googlePlay': {
    fr: 'Disponible sur Google Play',
    en: 'Get it on Google Play',
  },

  // Play hub
  'play.hub.title': { fr: 'Choisis ton mode', en: 'Pick your mode' },
  'play.hub.subtitle': {
    fr: 'Teste ton cerveau, monte ta série, grimpe au classement.',
    en: 'Test your brain, build your chain, climb the leaderboard.',
  },
  'play.chain.title': { fr: 'Chain Reaction', en: 'Chain Reaction' },
  'play.chain.tagline': {
    fr: 'Enchaîne les bonnes réponses pour exploser ton multiplicateur.',
    en: 'Stack correct answers to blow up your multiplier.',
  },
  'play.daily.title': { fr: 'Daily Brain', en: 'Daily Brain' },
  'play.daily.tagline': {
    fr: '5 questions par jour. Fais un sans-faute.',
    en: '5 questions a day. Go for a perfect run.',
  },
  'play.daily.playedToday': {
    fr: 'Déjà joué aujourd’hui',
    en: 'Already played today',
  },
  'play.start': { fr: 'Jouer', en: 'Play' },
  'play.soon': { fr: 'Bientôt', en: 'Soon' },

  // Gameplay states
  'game.loading': { fr: 'Chargement…', en: 'Loading…' },
  'game.error.title': { fr: 'Oups, ça a coincé', en: 'Oops, something broke' },
  'game.error.subtitle': {
    fr: 'Impossible de charger les questions.',
    en: 'Could not load the questions.',
  },
  'game.retry': { fr: 'Réessayer', en: 'Retry' },
  'game.score': { fr: 'Score', en: 'Score' },
  'game.finish': { fr: 'Terminer la partie', en: 'End game' },
  'game.question': { fr: 'Question', en: 'Question' },

  // Daily already played
  'daily.alreadyPlayed.title': {
    fr: 'Reviens demain !',
    en: 'Come back tomorrow!',
  },
  'daily.alreadyPlayed.subtitle': {
    fr: 'Tu as déjà fait ton Daily Brain aujourd’hui.',
    en: 'You’ve already done today’s Daily Brain.',
  },
  'daily.yourScore': { fr: 'Ton score', en: 'Your score' },
  'daily.back': { fr: 'Retour au menu', en: 'Back to menu' },
  'daily.title': { fr: 'Daily Brain', en: 'Daily Brain' },
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
