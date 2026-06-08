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
  'session.error.title': {
    fr: 'Connexion impossible',
    en: 'Could not start session',
  },
  'session.error.subtitle': {
    fr: 'Impossible de démarrer ta session. Réessaie dans un instant.',
    en: 'We could not start your session. Please try again in a moment.',
  },
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

  // Leaderboard route
  'lb.title': { fr: 'Classement', en: 'Leaderboard' },
  'lb.tab.weekly': { fr: 'Cette semaine', en: 'This week' },
  'lb.tab.allTime': { fr: 'Tous les temps', en: 'All-time' },
  'lb.col.rank': { fr: 'Rang', en: 'Rank' },
  'lb.col.player': { fr: 'Joueur', en: 'Player' },
  'lb.col.xp': { fr: 'XP', en: 'XP' },
  'lb.col.chain': { fr: 'Série', en: 'Chain' },
  'lb.you': { fr: 'Toi', en: 'You' },
  'lb.anon': { fr: 'Joueur anonyme', en: 'Anonymous player' },
  'lb.empty': {
    fr: 'Aucun joueur pour l’instant. Sois le premier !',
    en: 'No players yet. Be the first!',
  },
  'lb.error': {
    fr: 'Impossible de charger le classement.',
    en: 'Could not load the leaderboard.',
  },
  'lb.cta.title': {
    fr: 'Vois le classement complet + défie tes amis dans l’app',
    en: 'See the full leaderboard + challenge your friends in the app',
  },

  // Profile route
  'profile.title': { fr: 'Profil', en: 'Profile' },
  'profile.error': {
    fr: 'Impossible de charger ton profil.',
    en: 'Could not load your profile.',
  },
  'profile.level': { fr: 'Niveau', en: 'Level' },
  'profile.xp': { fr: 'XP total', en: 'Total XP' },
  'profile.stat.gamesPlayed': { fr: 'Parties jouées', en: 'Games played' },
  'profile.stat.gamesWon': { fr: 'Parties gagnées', en: 'Games won' },
  'profile.stat.bestChain': { fr: 'Meilleure série', en: 'Best chain' },
  'profile.stat.dailyStreak': { fr: 'Série quotidienne', en: 'Daily streak' },
  'profile.stat.perfectGames': { fr: 'Parties parfaites', en: 'Perfect games' },
  'profile.achievements.title': { fr: 'Succès', en: 'Achievements' },
  'profile.achievements.count': { fr: 'débloqués', en: 'unlocked' },
  'profile.achievements.empty': {
    fr: 'Aucun succès débloqué pour l’instant.',
    en: 'No achievements unlocked yet.',
  },
  'profile.recent.title': { fr: 'Parties récentes', en: 'Recent games' },
  'profile.recent.empty': {
    fr: 'Aucune partie pour l’instant.',
    en: 'No games yet.',
  },
  'profile.username.label': { fr: 'Nom d’utilisateur', en: 'Username' },
  'profile.username.placeholder': {
    fr: 'Choisis un pseudo',
    en: 'Pick a name',
  },
  'profile.username.save': { fr: 'Enregistrer', en: 'Save' },
  'profile.username.saving': { fr: 'Enregistrement…', en: 'Saving…' },
  'profile.username.success': {
    fr: 'Pseudo mis à jour !',
    en: 'Username updated!',
  },
  'profile.username.errorEmpty': {
    fr: 'Le pseudo ne peut pas être vide.',
    en: 'Username cannot be empty.',
  },
  'profile.username.error': {
    fr: 'Impossible de mettre à jour le pseudo.',
    en: 'Could not update the username.',
  },
  'profile.anon.title': {
    fr: 'Crée un compte pour sauvegarder ta progression',
    en: 'Create an account to save your progress',
  },
  'profile.anon.subtitle': {
    fr: 'Garde ton XP, tes succès et tes séries sur tous tes appareils.',
    en: 'Keep your XP, achievements and chains across all your devices.',
  },
  'profile.anon.cta': { fr: 'Créer mon compte', en: 'Create my account' },

  // Duels route
  'duels.title': { fr: 'Duels', en: 'Duels' },
  'duels.subtitle': {
    fr: 'Défie un joueur en 10 questions. À toi de jouer quand tu veux.',
    en: 'Challenge a player over 10 questions. Play whenever you like.',
  },
  'duels.new': { fr: 'Nouveau duel', en: 'New duel' },
  'duels.new.title': { fr: 'Choisis une catégorie', en: 'Pick a category' },
  'duels.new.cancel': { fr: 'Annuler', en: 'Cancel' },
  'duels.new.creating': { fr: 'Recherche d’un adversaire…', en: 'Finding an opponent…' },
  'duels.new.random': { fr: 'Aléatoire', en: 'Random' },
  'duels.noOpponent': {
    fr: 'Aucun adversaire disponible pour l’instant. Réessaie plus tard.',
    en: 'No opponent available right now. Try again later.',
  },
  'duels.createError': {
    fr: 'Impossible de créer le duel. Réessaie.',
    en: 'Could not create the duel. Please try again.',
  },
  'duels.section.myTurn': { fr: 'À toi de jouer', en: 'Your turn' },
  'duels.section.waiting': { fr: 'En attente', en: 'Waiting' },
  'duels.section.finished': { fr: 'Terminés', en: 'Finished' },
  'duels.error': {
    fr: 'Impossible de charger tes duels.',
    en: 'Could not load your duels.',
  },
  'duels.empty.title': { fr: 'Aucun duel pour l’instant', en: 'No duels yet' },
  'duels.empty.subtitle': {
    fr: 'Lance un duel et affronte un autre joueur.',
    en: 'Start a duel and take on another player.',
  },
  'duels.empty.cta': { fr: 'Lancer un duel', en: 'Start a duel' },
  'duels.opponent.anon': { fr: 'Joueur anonyme', en: 'Anonymous player' },
  'duels.status.awaiting': {
    fr: 'En attente de l’adversaire',
    en: 'Waiting for opponent',
  },
  'duels.status.yourTurn': { fr: 'À toi de jouer', en: 'Your turn' },
  'duels.outcome.won': { fr: 'Gagné', en: 'Won' },
  'duels.outcome.lost': { fr: 'Perdu', en: 'Lost' },
  'duels.outcome.draw': { fr: 'Nul', en: 'Draw' },
  'duels.cta.title': {
    fr: 'Duels en temps réel + tournois dans l’app',
    en: 'Live duels + tournaments in the app',
  },

  // Duel play / result
  'duel.notParticipant.title': {
    fr: 'Tu ne participes pas à ce duel',
    en: 'You are not part of this duel',
  },
  'duel.notParticipant.back': { fr: 'Retour aux duels', en: 'Back to duels' },
  'duel.result.title': { fr: 'Duel terminé', en: 'Duel over' },
  'duel.result.you': { fr: 'Toi', en: 'You' },
  'duel.result.opponent': { fr: 'Adversaire', en: 'Opponent' },
  'duel.result.awaiting.title': {
    fr: 'En attente de l’adversaire',
    en: 'Waiting for your opponent',
  },
  'duel.result.awaiting.subtitle': {
    fr: 'Tu as joué ta manche. On te préviendra quand l’adversaire aura répondu.',
    en: 'You’ve played your round. We’ll let you know when your opponent answers.',
  },
  'duel.result.back': { fr: 'Retour aux duels', en: 'Back to duels' },

  // Weekly Challenge route
  'nav.weekly': { fr: 'Défi', en: 'Challenge' },
  'weekly.title': { fr: 'Défi de la semaine', en: 'Weekly Challenge' },
  'weekly.subtitle': {
    fr: 'Un thème par semaine. Réponds dans l’ordre et apprends en jouant.',
    en: 'A fresh theme each week. Answer in order and learn as you play.',
  },
  'weekly.type.news': { fr: 'Actu', en: 'News' },
  'weekly.type.themed': { fr: 'Thème', en: 'Theme' },
  'weekly.questions': { fr: 'questions', en: 'questions' },
  'weekly.progress': { fr: 'Progression', en: 'Progress' },
  'weekly.notStarted': { fr: 'Commencer', en: 'Start' },
  'weekly.continue': { fr: 'Continuer', en: 'Continue' },
  'weekly.completed.badge': { fr: 'Terminé', en: 'Completed' },
  'weekly.empty.title': {
    fr: 'Aucun défi actif',
    en: 'No active challenge',
  },
  'weekly.empty.subtitle': {
    fr: 'Reviens bientôt pour un nouveau défi hebdomadaire.',
    en: 'Check back soon for a new weekly challenge.',
  },
  'weekly.error': {
    fr: 'Impossible de charger les défis.',
    en: 'Could not load the challenges.',
  },
  'weekly.cta.title': {
    fr: 'Nouveaux défis chaque semaine + badges dans l’app',
    en: 'New challenges every week + badges in the app',
  },
  'weekly.back': { fr: 'Retour aux défis', en: 'Back to challenges' },
  'weekly.notFound.title': {
    fr: 'Défi introuvable',
    en: 'Challenge not found',
  },
  'weekly.learn.title': { fr: 'Le savais-tu ?', en: 'Did you know?' },
  'weekly.next': { fr: 'Suivant', en: 'Next' },
  'weekly.result.title': { fr: 'Défi terminé !', en: 'Challenge complete!' },
  'weekly.result.score': { fr: 'Score', en: 'Score' },
  'weekly.result.correct': { fr: 'Bonnes réponses', en: 'Correct answers' },
  'weekly.result.perfect': { fr: 'SANS-FAUTE !', en: 'FLAWLESS!' },
  'weekly.result.streak': { fr: 'Série de jours', en: 'Day streak' },
  'weekly.leaderboard.title': {
    fr: 'Classement du défi',
    en: 'Challenge leaderboard',
  },
  'weekly.leaderboard.empty': {
    fr: 'Sois le premier à terminer ce défi !',
    en: 'Be the first to finish this challenge!',
  },
  'weekly.leaderboard.you': { fr: 'Toi', en: 'You' },
  'weekly.leaderboard.anon': { fr: 'Joueur anonyme', en: 'Anonymous player' },

  // Categories
  'category.general': { fr: 'Culture générale', en: 'General' },
  'category.history': { fr: 'Histoire', en: 'History' },
  'category.geography': { fr: 'Géographie', en: 'Geography' },
  'category.music': { fr: 'Musique', en: 'Music' },
  'category.science': { fr: 'Sciences', en: 'Science' },
  'category.literature': { fr: 'Littérature', en: 'Literature' },
  'category.technology': { fr: 'Technologie', en: 'Technology' },
  'category.animals': { fr: 'Animaux', en: 'Animals' },
  'category.sport': { fr: 'Sport', en: 'Sport' },
  'category.cinema': { fr: 'Cinéma', en: 'Cinema' },
  'category.nature': { fr: 'Nature', en: 'Nature' },
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
