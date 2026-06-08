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

  // App promo banner (app-wide, dismissable)
  'promo.banner.text': {
    fr: 'Joue partout — télécharge l’app',
    en: 'Play anywhere — download the app',
  },
  'promo.banner.dismiss': { fr: 'Fermer', en: 'Dismiss' },
  'promo.appStore': { fr: 'App Store', en: 'App Store' },
  'promo.googlePlay': { fr: 'Google Play', en: 'Google Play' },

  // Account prompt modal (free-play gate)
  'prompt.title': {
    fr: 'Sauvegarde ta progression',
    en: 'Save your progress',
  },
  'prompt.subtitle': {
    fr: 'Crée un compte pour garder ton XP, tes scores et tes séries — sur tous tes appareils.',
    en: 'Create an account to keep your XP, scores and chains — across all your devices.',
  },
  'prompt.close': { fr: 'Fermer', en: 'Close' },
  'prompt.email': { fr: 'Adresse e-mail', en: 'Email address' },
  'prompt.password': { fr: 'Mot de passe', en: 'Password' },
  'prompt.create': { fr: 'Créer mon compte', en: 'Create my account' },
  'prompt.creating': { fr: 'Création…', en: 'Creating…' },
  'prompt.success': {
    fr: 'Compte créé ! Vérifie tes e-mails pour confirmer ton adresse.',
    en: 'Account created! Check your email to confirm your address.',
  },
  'prompt.error': {
    fr: 'Impossible de créer le compte. Réessaie.',
    en: 'Could not create the account. Please try again.',
  },
  'prompt.download.title': { fr: 'Ou télécharge l’app', en: 'Or get the app' },

  // Auth route
  'auth.title': { fr: 'Ton compte BIGHEAD', en: 'Your BIGHEAD account' },
  'auth.create.title': {
    fr: 'Créer un compte',
    en: 'Create an account',
  },
  'auth.create.subtitle': {
    fr: 'Ta progression actuelle est conservée.',
    en: 'Your current progress is kept.',
  },
  'auth.signin.title': { fr: 'Déjà un compte ?', en: 'Already have an account?' },
  'auth.signin.cta': { fr: 'Se connecter', en: 'Sign in' },
  'auth.signin.success': {
    fr: 'Connecté ! Bon retour.',
    en: 'Signed in! Welcome back.',
  },
  'auth.signin.loading': { fr: 'Connexion…', en: 'Signing in…' },
  'auth.error': {
    fr: 'Une erreur est survenue. Réessaie.',
    en: 'Something went wrong. Please try again.',
  },
  'auth.backToPlay': { fr: 'Retour au jeu', en: 'Back to the game' },
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
