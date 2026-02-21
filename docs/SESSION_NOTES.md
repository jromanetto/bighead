# Session Notes - 3 Février 2026

## Résumé de la session

### Travail effectué

#### 1. Système XP et Niveau
- **Formule de niveau** : `XP = 100 * 1.5^(level-1)` (croissance exponentielle)
- Niveau calculé dynamiquement côté client à partir du `total_xp` du profil
- Ajouté sur la homepage (badge doré cliquable) et page achievements (hero card)

#### 2. Refonte page Achievements (`app/achievements.tsx`)
- Hero card avec badge niveau doré et barre de progression XP
- Stats row : badges débloqués, XP des achievements, % complété
- Catégories avec icônes et couleurs (All, Games, Score, Streaks, Special)
- Achievement cards avec effet glow pour les débloqués

#### 3. Amélioration Homepage (`app/(tabs)/index.tsx`)
- Badge niveau doré dans le header (remplace les "coins")
- Card Level & Achievements avec progression XP
- Tous les textes traduits EN/FR

#### 4. Traductions i18n complètes
**Fichiers mis à jour :**
- `src/i18n/translations.ts` - ~40 nouvelles clés
- `app/(tabs)/index.tsx` - Homepage
- `app/achievements.tsx` - Achievements
- `app/party/setup.tsx` - Party mode
- `app/invite.tsx` - Invite friends

**Clés ajoutées (EN/FR) :**
- Homepage : featured, new, dailyBrain, hard, done, left, adventure, climbMountain, infiniteMode, family, familyQuiz, versus, pvpLive, localMultiplayer, gameModes, viewAchievementsBadges, stats, yourProgress, ranking, topPlayers, getPremiumAccess, unlockFeaturesRemoveAds, upgrade
- Achievements : xp, totalXP, totalExperienceEarned, progressToLevel, unlocked, xpFromBadges, completed, all, games, streaks, special, noAchievementsFound, tryDifferentCategory, locked
- Party : partyMode, onePhoneMultiplePlayers, numberOfPlayers, playerNames, player, numberOfQuestions, questionsPerPlayer, howToPlay, howToPlayDescription, startGame
- Invite : playWithFriends, inviteDescription, shareApp

#### 5. Commits de la session
```
d93901f Feat: Add i18n translations to main screens (EN/FR)
2f0d80b Feat: Replace Themes with Party, redesign Party page
f89a64f Fix: Remove Challenge button, replace Shop with Premium banner
3035c8d Fix: Remove Invite button from homepage
f148b1d Fix: Remove unused features list from invite page
4d12cb8 Refactor: Move marketing website to /website folder
```

### État actuel
- Branch : `main`
- 10 commits en avance sur `origin/main` (non pushés)
- TypeScript : compile sans erreur
- App : fonctionne dans le simulateur iOS

### À faire potentiellement
- [ ] Push les commits vers origin
- [ ] Tester le changement de langue dans l'app (Settings > Language)
- [ ] Vérifier que les autres screens utilisent aussi i18n si nécessaire
- [ ] Ajouter les traductions pour les pages de jeu (game/, daily.tsx, etc.)

### Architecture i18n
```
src/i18n/translations.ts     - Définitions des traductions
src/contexts/LanguageContext.tsx - Provider et hooks
```

**Usage :**
```typescript
import { useTranslation } from "../src/contexts/LanguageContext";

const { t } = useTranslation();
<Text>{t("keyName")}</Text>
```

### Design System (couleurs principales)
```typescript
const COLORS = {
  bg: "#161a1d",
  surface: "#1E2529",
  primary: "#00c2cc",
  gold: "#fbbf24",
  purple: "#a855f7",
  text: "#ffffff",
  textMuted: "#9ca3af",
};
```
