# Game Center Integration Plan

Apple Game Center est un boost significatif pour la découvrabilité d'une app Trivia : les apps GC-enabled sont privilégiées dans les recommandations "Games" du store, et un user qui voit l'icône GC sur le profil d'un ami a un signal social fort.

## Effort estimé : 1 journée de dev

- ~3h : config natif iOS (capability + Info.plist + entitlements)
- ~2h : intégration React Native (module bridge)
- ~2h : créer leaderboard + achievements dans App Store Connect
- ~1h : tests sur device réel

---

## Phase 1 — Config natif (à inclure dans le prochain build EAS)

### apps/mobile/app.json

Ajouter dans la section `ios.entitlements` :

```json
"ios": {
  "bundleIdentifier": "com.jroma51.bighead",
  "associatedDomains": ["applinks:bighead.jrmanagement.org"],
  "entitlements": {
    "com.apple.developer.game-center": true
  },
  "infoPlist": {
    "UIBackgroundModes": ["remote-notification"],
    "ITSAppUsesNonExemptEncryption": false,
    "GKGameCenterBundleIdentifier": "com.jroma51.bighead"
  }
}
```

### Capability à activer dans Apple Developer Portal

1. **developer.apple.com → Certificates, Identifiers & Profiles → Identifiers**
2. Sélectionner `com.jroma51.bighead`
3. Cocher **Game Center**
4. Save → régénérer les provisioning profiles
5. EAS Build se chargera de la suite (auto-credentials)

---

## Phase 2 — Module RN bridge (option A : community lib)

Option la plus simple : `react-native-game-kit` ou `expo-game-center` (community).

```bash
cd apps/mobile && npx expo install expo-game-center
```

> ⚠️ Vérifier que la lib supporte Expo SDK 54 + new architecture. Sinon écrire un module natif minimal Swift (~50 lignes).

### Service `apps/mobile/src/services/gameCenter.ts`

```typescript
import { Platform } from "react-native";
// import GameKit from "expo-game-center"; // once installed

export const authenticateGameCenter = async (): Promise<boolean> => {
  if (Platform.OS !== "ios") return false;
  try {
    // const player = await GameKit.authenticate();
    // return !!player;
    return false;
  } catch {
    return false;
  }
};

export const submitScore = async (
  leaderboardId: string,
  score: number
): Promise<void> => {
  if (Platform.OS !== "ios") return;
  try {
    // await GameKit.submitScore(leaderboardId, score);
  } catch (e) {
    console.warn("[GameCenter] submitScore failed:", e);
  }
};

export const unlockAchievement = async (
  achievementId: string,
  percentComplete = 100
): Promise<void> => {
  if (Platform.OS !== "ios") return;
  try {
    // await GameKit.unlockAchievement(achievementId, percentComplete);
  } catch (e) {
    console.warn("[GameCenter] unlockAchievement failed:", e);
  }
};

export const showLeaderboard = async (leaderboardId?: string) => {
  if (Platform.OS !== "ios") return;
  try {
    // await GameKit.showLeaderboards(leaderboardId);
  } catch (e) {
    console.warn("[GameCenter] showLeaderboards failed:", e);
  }
};
```

### Hook dans les points clés

- **Login** : appeler `authenticateGameCenter()` au mount du AuthContext
- **End of game** : appeler `submitScore("weekly_xp", weeklyXp)` après chaque game completion
- **Achievement unlocked** : appeler `unlockAchievement(achievementId)` depuis `awardXP` quand un achievement est débloqué
- **Leaderboard screen** : ajouter un bouton "Voir dans Game Center" qui appelle `showLeaderboard()`

---

## Phase 3 — Leaderboards à créer dans App Store Connect

**App Store Connect → My Apps → BIGHEAD → Distribution → Game Center**

### Leaderboards (priorité)

| ID | Nom | Type | Score sort | Refresh |
|---|---|---|---|---|
| `weekly_xp` | XP de la semaine | Recurring | Higher | Weekly |
| `alltime_xp` | XP total | Recurring | Higher | Never |
| `duel_wins` | Victoires en duel | Recurring | Higher | Never |
| `streak_days` | Streak actuel | Recurring | Higher | Weekly |
| `chain_best` | Meilleure chaîne | Recurring | Higher | Never |

### Achievements (sélection)

| ID | Nom | Points | Description |
|---|---|---|---|
| `first_duel_win` | Première victoire | 10 | Gagne ton premier duel |
| `streak_7` | Une semaine | 20 | Réponds 7 jours d'affilée |
| `streak_30` | Un mois | 50 | Réponds 30 jours d'affilée |
| `perfect_quiz` | Sans faute | 30 | 10/10 sur un quiz hebdo |
| `social_butterfly` | Sociable | 25 | Invite 3 amis |
| `genius` | Génie | 100 | Atteins le niveau 50 |

---

## Phase 4 — Migration leaderboard local → Game Center

Backfill via une edge function qui parcourt `xp_transactions` et soumet les top scores à Game Center.
À faire après que la première version GC soit live.

---

## ROI attendu

- **Algo Apple** : +20-30% impressions store (les apps GC-enabled remontent dans "Games > Trivia")
- **Conversion** : marginale individuellement, mais ajoute un signal de qualité
- **Featured chance** : significativement augmenté (Game Center est un critère explicite mentionné dans les guidelines Apple Featuring)
- **Effort vs impact** : Excellent — 1 journée pour activer un canal d'acquisition organique permanent

---

## Risques / pitfalls

1. **Login obligatoire iOS** : Game Center peut afficher une popup intrusive au lancement → désactiver auto-prompt + ne déclencher qu'au besoin
2. **Anonymous users** : les users non-loggés Apple ID ne peuvent pas écrire de score (silent fail OK)
3. **Sandbox vs Prod** : Game Center a un environnement Sandbox séparé en dev ; les scores Prod ne s'affichent qu'après publication App Store
4. **Android** : zéro impact (Google Play Games Services est l'équivalent mais hors scope ici)
