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

  // Landing — hero
  'landing.hero.subtitle': {
    fr: 'Des milliers de questions, quatre modes de jeu, un seul objectif : prouver que t’as la plus grosse tête. Joue gratuitement dans ton navigateur, puis emporte BIGHEAD partout sur mobile.',
    en: 'Thousands of questions, four game modes, one goal: prove you’ve got the biggest brain. Play free in your browser, then take BIGHEAD anywhere on mobile.',
  },
  'landing.hero.ctaPrimary': { fr: 'Jouer gratuitement', en: 'Play for free' },
  'landing.hero.ctaSecondary': {
    fr: 'Télécharger l’app',
    en: 'Download the app',
  },
  'landing.hero.cardCategory': { fr: 'Culture générale', en: 'General' },
  'landing.hero.cardQuestion': {
    fr: 'Quelle planète du système solaire tourne sur le côté ?',
    en: 'Which planet in the solar system spins on its side?',
  },
  'landing.hero.cardAnswerA': { fr: 'Mars', en: 'Mars' },
  'landing.hero.cardAnswerB': { fr: 'Uranus', en: 'Uranus' },
  'landing.hero.cardAnswerC': { fr: 'Vénus', en: 'Venus' },
  'landing.hero.cardChain': { fr: 'Série ×7', en: 'Chain ×7' },
  'landing.trust.questions': { fr: '36 000+ questions', en: '36,000+ questions' },
  'landing.trust.categories': { fr: '11 catégories', en: '11 categories' },
  'landing.trust.langs': { fr: 'FR & EN', en: 'FR & EN' },

  // Landing — features
  'landing.features.eyebrow': { fr: 'Modes de jeu', en: 'Game modes' },
  'landing.features.title': {
    fr: 'Quatre façons de t’entraîner',
    en: 'Four ways to train your brain',
  },
  'landing.features.subtitle': {
    fr: 'Du rush sans fin au défi de la semaine — choisis ton terrain.',
    en: 'From endless rush to the weekly challenge — pick your battleground.',
  },
  'landing.mode.chain.desc': {
    fr: 'Mode sans fin : enchaîne les bonnes réponses et fais exploser ton multiplicateur de série.',
    en: 'Endless mode: stack correct answers and blow up your chain multiplier.',
  },
  'landing.mode.daily.desc': {
    fr: '5 questions fraîches chaque jour. Vise le sans-faute et tiens ta série.',
    en: '5 fresh questions every day. Go for a perfect run and keep your streak.',
  },
  'landing.mode.duels.desc': {
    fr: 'Affronte un autre joueur en 1 contre 1 asynchrone. Joue quand tu veux.',
    en: 'Take on another player in async 1v1. Play whenever you like.',
  },
  'landing.mode.weekly.desc': {
    fr: 'Un thème par semaine, des questions inédites et de quoi apprendre en jouant.',
    en: 'A new theme each week, fresh questions, and something to learn as you play.',
  },
  'landing.value.free.title': { fr: '100 % gratuit', en: '100% free' },
  'landing.value.free.desc': {
    fr: 'Joue sans compte, sans paiement. Crée un profil quand tu veux garder ta progression.',
    en: 'Play with no account, no payment. Make a profile when you want to keep your progress.',
  },
  'landing.value.bilingual.title': { fr: 'Bilingue', en: 'Bilingual' },
  'landing.value.bilingual.desc': {
    fr: 'Toutes les questions disponibles en français et en anglais, d’un simple clic.',
    en: 'Every question available in French and English, one click away.',
  },
  'landing.value.global.title': {
    fr: 'Classement mondial',
    en: 'Global leaderboard',
  },
  'landing.value.global.desc': {
    fr: 'Compare ton XP et tes séries avec les joueurs du monde entier.',
    en: 'Compare your XP and chains with players from around the world.',
  },

  // Landing — app funnel
  'landing.app.eyebrow': { fr: 'L’app mobile', en: 'The mobile app' },
  'landing.app.title': { fr: 'Va plus loin sur l’app', en: 'Go further on the app' },
  'landing.app.subtitle': {
    fr: 'Joue partout, reçois la question du jour en notification et défie tes amis en duel. La meilleure façon de jouer à BIGHEAD.',
    en: 'Play anywhere, get the daily question as a notification, and challenge your friends to duels. The best way to play BIGHEAD.',
  },
  'landing.app.point.daily': {
    fr: 'La question du jour, droit dans tes notifications',
    en: 'The daily question, straight to your notifications',
  },
  'landing.app.point.offline': {
    fr: 'Joue partout, même hors-ligne',
    en: 'Play anywhere, even offline',
  },
  'landing.app.point.friends': {
    fr: 'Défie tes amis et grimpe les classements',
    en: 'Challenge your friends and climb the leaderboards',
  },
  'landing.app.appStore': { fr: 'App Store', en: 'App Store' },
  'landing.app.appStore.sub': {
    fr: 'Télécharger sur l’',
    en: 'Download on the',
  },
  'landing.app.googlePlay': { fr: 'Google Play', en: 'Google Play' },
  'landing.app.googlePlay.sub': { fr: 'Disponible sur', en: 'Get it on' },

  // Landing — footer
  'landing.footer.play': { fr: 'Jouer', en: 'Play' },
  'landing.footer.leaderboard': { fr: 'Classement', en: 'Leaderboard' },
  'landing.footer.features': { fr: 'Modes de jeu', en: 'Game modes' },
  'landing.footer.rights': {
    fr: 'Tous droits réservés.',
    en: 'All rights reserved.',
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

  // Share score (viral loop) — {score}/{maxChain}/{correct}/{total} interpolated
  'share.cta': { fr: 'Partager mon score', en: 'Share my score' },
  'share.copied': { fr: 'Copié !', en: 'Copied!' },
  'share.whatsapp': { fr: 'WhatsApp', en: 'WhatsApp' },
  'share.x': { fr: 'X', en: 'X' },
  'share.message.chain': {
    fr: 'J’ai scoré {score} points (série max {maxChain}) sur BIGHEAD ⚡ Tu fais mieux ?',
    en: 'I scored {score} points (best chain {maxChain}) on BIGHEAD ⚡ Can you beat me?',
  },
  'share.message.quiz': {
    fr: 'J’ai fait {correct}/{total} au quiz BIGHEAD 🧠 Bats-moi !',
    en: 'I got {correct}/{total} on the BIGHEAD quiz 🧠 Beat me!',
  },
  'share.message.weekly': {
    fr: 'J’ai fait {correct}/{total} au défi « {theme} » sur BIGHEAD 🧠 Tente ta chance !',
    en: 'I got {correct}/{total} on the "{theme}" challenge on BIGHEAD 🧠 Your turn!',
  },
  'share.message.duel.won': {
    fr: 'J’ai gagné mon duel {myScore}-{oppScore} sur BIGHEAD ⚔️ Défie-moi !',
    en: 'I won my duel {myScore}-{oppScore} on BIGHEAD ⚔️ Challenge me!',
  },
  'share.message.duel.lost': {
    fr: 'J’ai perdu mon duel {myScore}-{oppScore} sur BIGHEAD ⚔️ Défie-moi !',
    en: 'I lost my duel {myScore}-{oppScore} on BIGHEAD ⚔️ Challenge me!',
  },
  'share.message.duel.draw': {
    fr: 'Match nul {myScore}-{oppScore} sur BIGHEAD ⚔️ Défie-moi !',
    en: 'Draw {myScore}-{oppScore} on BIGHEAD ⚔️ Challenge me!',
  },

  // Web push (rappel quotidien PWA)
  'push.title': {
    fr: 'Active le rappel quotidien',
    en: 'Turn on the daily reminder',
  },
  'push.subtitle': {
    fr: 'Une notification par jour pour ton défi — garde ta série 🔥',
    en: 'One notification a day for your challenge — keep your streak 🔥',
  },
  'push.disable': {
    fr: '🔔 Rappel quotidien activé — désactiver',
    en: '🔔 Daily reminder on — turn off',
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
  'play.hub.leaderboard.tagline': {
    fr: 'Vois où tu te situes face aux autres.',
    en: 'See where you stand against everyone.',
  },

  // Daily streak + come-back hooks
  'streak.hub.active': {
    fr: 'Série de {n} jours — reviens demain pour la garder',
    en: '{n}-day streak — come back tomorrow to keep it',
  },
  'streak.hub.empty': {
    fr: 'Joue chaque jour pour lancer ta série',
    en: 'Play every day to start your streak',
  },
  'streak.daily.active': {
    fr: 'Série de {n} jours — reviens demain pour la garder',
    en: '{n}-day streak — come back tomorrow to keep it',
  },
  'streak.daily.empty': {
    fr: 'Joue chaque jour pour lancer ta série',
    en: 'Play every day to start your streak',
  },
  'daily.comeBack': {
    fr: 'Reviens demain pour le prochain défi',
    en: 'Come back tomorrow for the next challenge',
  },
  'daily.comeBack.cta': {
    fr: 'Crée un compte pour ne pas perdre ta série',
    en: 'Create an account so you don’t lose your streak',
  },
  'sound.toggle': {
    fr: 'Activer / couper le son',
    en: 'Toggle sound',
  },

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
  'lb.fomo.gap': {
    fr: 'Tu es #{rank} — encore {gap} pts pour dépasser {name}',
    en: 'You’re #{rank} — {gap} pts to pass {name}',
  },
  'lb.fomo.first': {
    fr: 'Tu es #1 — défends ta place !',
    en: 'You’re #1 — defend your spot!',
  },
  'lb.fomo.notRanked': {
    fr: 'Joue plus pour entrer dans le top 100',
    en: 'Play more to break into the top 100',
  },
  'lb.weekly.reset': {
    fr: 'Le classement hebdo se réinitialise dans {time}',
    en: 'The weekly leaderboard resets in {time}',
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

  // Friend-invite duels (open duel + claim + share)
  'duels.invite': { fr: 'Inviter un ami', en: 'Invite a friend' },
  'duel.invite.title': {
    fr: 'Tu as été défié sur {category} !',
    en: 'You’ve been challenged on {category}!',
  },
  'duel.invite.subtitle': {
    fr: 'Réponds à 10 questions et bats ton ami. À toi de jouer !',
    en: 'Answer 10 questions and beat your friend. Game on!',
  },
  'duel.invite.accept': { fr: 'Accepter le défi', en: 'Accept the challenge' },
  'duel.invite.accepting': { fr: 'On prépare ton duel…', en: 'Setting up your duel…' },
  'duel.invite.alreadyTaken': {
    fr: 'Ce duel a déjà été accepté par quelqu’un d’autre.',
    en: 'This duel has already been accepted by someone else.',
  },
  'duel.invite.expired': {
    fr: 'Ce défi a expiré.',
    en: 'This challenge has expired.',
  },
  'duel.invite.notFound': {
    fr: 'Ce duel est introuvable.',
    en: 'This duel could not be found.',
  },
  'duel.invite.error': {
    fr: 'Impossible d’accepter le défi. Réessaie.',
    en: 'Could not accept the challenge. Please try again.',
  },
  'duel.invite.quickCta': {
    fr: 'Lancer un duel rapide',
    en: 'Start a quick duel',
  },
  'duel.invite.installTitle': {
    fr: 'Joue à BIGHEAD partout',
    en: 'Play BIGHEAD anywhere',
  },
  // Host waiting / share
  'duel.share.waiting.title': {
    fr: 'En attente que ton ami accepte',
    en: 'Waiting for your friend to accept',
  },
  'duel.share.waiting.subtitle': {
    fr: 'Partage le lien ci-dessous. Dès que ton ami joue, on compare vos scores.',
    en: 'Share the link below. As soon as your friend plays, we compare your scores.',
  },
  'duel.share.cta': { fr: 'Partager le défi', en: 'Share the challenge' },
  'duel.share.copy': { fr: 'Copier le lien', en: 'Copy link' },
  'duel.share.copied': { fr: 'Lien copié !', en: 'Link copied!' },
  'duel.share.text': {
    fr: 'Je te défie sur BIGHEAD ! Réponds à 10 questions :',
    en: 'I challenge you on BIGHEAD! Answer 10 questions:',
  },
  'duel.share.play': { fr: 'Jouer ma manche', en: 'Play my round' },

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
  'weekly.thisWeek.title': { fr: 'Cette semaine', en: 'This week' },
  'weekly.history.title': {
    fr: 'Plus de quiz hebdo',
    en: 'More weekly quizzes',
  },
  'weekly.history.subtitle': {
    fr: 'Rejoue les défis passés, juste pour le fun (sans XP).',
    en: 'Replay past challenges, just for fun (no XP).',
  },
  'weekly.history.notPlayed': { fr: 'Pas encore joué', en: 'Not played yet' },
  'weekly.history.yourScore': { fr: 'Ton score', en: 'Your score' },
  'weekly.history.bestReplay': { fr: 'Meilleur replay', en: 'Best replay' },
  'weekly.history.play': { fr: 'Jouer', en: 'Play' },
  'weekly.history.replay': { fr: 'Rejouer', en: 'Replay' },
  'weekly.history.empty': {
    fr: 'Aucun défi passé pour le moment.',
    en: 'No past challenges yet.',
  },
  'weekly.replay.badge': { fr: 'Replay · sans XP', en: 'Replay · no XP' },
  'weekly.replay.result.title': {
    fr: 'Replay terminé !',
    en: 'Replay complete!',
  },
  'weekly.replay.original': {
    fr: 'Score d’origine',
    en: 'Original score',
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

  // SEO category landing pages (/quiz/$category)
  'quiz.page.h1': { fr: 'Quiz {cat} — BIGHEAD', en: '{cat} Quiz — BIGHEAD' },
  'quiz.page.title': {
    fr: 'Quiz {cat} en ligne — gratuit | BIGHEAD',
    en: 'Online {cat} Quiz — free | BIGHEAD',
  },
  'quiz.page.cta': { fr: 'Jouer le quiz {cat}', en: 'Play the {cat} quiz' },
  'quiz.page.ctaDuel': {
    fr: 'Défier un ami sur {cat}',
    en: 'Challenge a friend on {cat}',
  },
  'quiz.page.allTitle': { fr: 'Quiz par thème', en: 'Quizzes by theme' },
  'quiz.page.allSubtitle': {
    fr: 'Choisis une catégorie et lance ta série.',
    en: 'Pick a category and start your chain.',
  },
  'quiz.page.modesTitle': { fr: 'Autres façons de jouer', en: 'Other ways to play' },
  'quiz.page.backHome': { fr: 'Retour à l’accueil', en: 'Back to home' },
  'quiz.unknown.title': { fr: 'Catégorie inconnue', en: 'Unknown category' },
  'quiz.unknown.subtitle': {
    fr: 'Cette catégorie n’existe pas. Choisis-en une ci-dessous :',
    en: 'This category doesn’t exist. Pick one below:',
  },

  // SEO descriptions per category (used in body + meta description)
  'quiz.desc.general': {
    fr: 'Teste ta culture générale : des milliers de questions de quiz gratuites, du plus facile au plus retors. Enchaîne les bonnes réponses et grimpe au classement.',
    en: 'Test your general knowledge: thousands of free quiz questions, from easy to fiendish. Chain correct answers and climb the leaderboard.',
  },
  'quiz.desc.history': {
    fr: 'Teste tes connaissances en histoire : de l’Antiquité à nos jours, dates clés, grands personnages et événements marquants. Quiz gratuit, en français et en anglais.',
    en: 'Test your history knowledge: from antiquity to today, key dates, great figures and landmark events. Free quiz, in French and English.',
  },
  'quiz.desc.geography': {
    fr: 'Teste tes connaissances en géographie : capitales, pays, fleuves, montagnes et drapeaux du monde entier. Quiz gratuit pour explorer la planète.',
    en: 'Test your geography knowledge: capitals, countries, rivers, mountains and flags from around the world. Free quiz to explore the planet.',
  },
  'quiz.desc.music': {
    fr: 'Teste tes connaissances en musique : artistes, albums, paroles, genres et grandes époques. Quiz gratuit pour les mélomanes et les curieux.',
    en: 'Test your music knowledge: artists, albums, lyrics, genres and eras. A free quiz for music lovers and the curious.',
  },
  'quiz.desc.science': {
    fr: 'Teste tes connaissances en sciences : physique, chimie, biologie et espace. Des questions claires, de la découverte au défi. Quiz gratuit.',
    en: 'Test your science knowledge: physics, chemistry, biology and space. Clear questions, from discovery to challenge. Free quiz.',
  },
  'quiz.desc.literature': {
    fr: 'Teste tes connaissances en littérature : auteurs, romans cultes, citations et courants littéraires. Quiz gratuit pour les amoureux des livres.',
    en: 'Test your literature knowledge: authors, classic novels, quotes and movements. A free quiz for book lovers.',
  },
  'quiz.desc.technology': {
    fr: 'Teste tes connaissances en technologie : informatique, internet, gadgets et innovations. Quiz gratuit pour les geeks et les curieux du numérique.',
    en: 'Test your technology knowledge: computing, the internet, gadgets and innovations. A free quiz for geeks and the digitally curious.',
  },
  'quiz.desc.animals': {
    fr: 'Teste tes connaissances sur les animaux : espèces, habitats, comportements et records du règne animal. Quiz gratuit pour les passionnés de nature.',
    en: 'Test your animal knowledge: species, habitats, behaviours and record-breakers of the animal kingdom. A free quiz for nature fans.',
  },
  'quiz.desc.sport': {
    fr: 'Teste tes connaissances en sport : football, JO, records et grands champions de toutes les disciplines. Quiz gratuit pour les fans de sport.',
    en: 'Test your sports knowledge: football, the Olympics, records and great champions across every discipline. A free quiz for sports fans.',
  },
  'quiz.desc.cinema': {
    fr: 'Teste tes connaissances en cinéma : films cultes, réalisateurs, acteurs et répliques mythiques. Quiz gratuit pour les cinéphiles.',
    en: 'Test your cinema knowledge: cult films, directors, actors and iconic lines. A free quiz for film buffs.',
  },
  'quiz.desc.nature': {
    fr: 'Teste tes connaissances sur la nature : écosystèmes, climat, plantes et phénomènes naturels. Quiz gratuit pour explorer le vivant.',
    en: 'Test your nature knowledge: ecosystems, climate, plants and natural phenomena. A free quiz to explore the living world.',
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
