# Growth Engine Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Multiply organic app downloads via optimized social content, ASO, and in-app virality.

**Architecture:** Three parallel workstreams: (1) Pipeline videos become cliffhangers that drive downloads instead of revealing answers, with YouTube Shorts added. (2) ASO metadata rewritten for both FR/EN markets. (3) In-app share scorecards, challenge deep links, improved referral, and contextual invite prompts.

**Tech Stack:** TypeScript (pipeline), React Native/Expo (mobile), Supabase (backend), expo-sharing + ViewShot (scorecards), expo-linking (deep links)

---

## Workstream 1: Pipeline Social — Cliffhanger Format + YouTube

### Task 1: Convert video to cliffhanger format — remove answer reveal

**Files:**
- Modify: `scripts/instagram-pipeline/src/heygen.ts:291-329` (scenes 4-6)
- Modify: `scripts/instagram-pipeline/src/heygen.ts:243-247` (answer voice + CTA text)

**Step 1: Edit heygen.ts — Replace scenes 4, 5, 6**

Current flow: Scene 4 (countdown) → Scene 5 (answer reveal) → Scene 6 (outro CTA)
New flow: Scene 4 (countdown + suspense) → Scene 5 (CTA "answer in the app") → Remove scene 6

In `heygen.ts`, replace the `answerVoice` (line 243-245) with:

```typescript
const answerVoice = isFr
  ? `Alors, tu connais la réponse ? Elle est dans BigHead !`
  : `So, do you know the answer? It's in BigHead!`;
```

Replace the `ctaText` (line 247) with:

```typescript
const ctaText = isFr
  ? "👇 Réponse dans BigHead\nLien en bio !"
  : "👇 Answer in BigHead\nLink in bio!";
```

Replace Scene 5 (lines 304-316) — remove answer reveal, replace with teaser:

```typescript
// Scene 5: CTA — answer is in the app (4-5s)
{
  character: buildCharacter(avatarId, "Excited pointing down toward the link, big smile, inviting gesture"),
  voice: buildVoice(answerVoice, lang, "Excited"),
  background: bg,
  text: buildText(ctaText, {
    fontSize: 64,
    fontWeight: "bold",
    color: "#FACC15",
    position: { x: 0.05, y: 0.40 },
    width: 980,
  }),
},
```

Remove Scene 6 entirely (lines 317-329) — the CTA is now in scene 5.

Update the console.log on line 335:

```typescript
console.log(`  v2 API — 5 scenes [${lang.toUpperCase()}]:`);
```

**Step 2: Update outro_script prompt to match cliffhanger**

In `generate-question.ts`, update the `SYSTEM_PROMPT` (line 40) outro instructions:

```
- Varie les outros avec CTA fort : "Tu connais la réponse ? C'est dans BigHead, lien en bio !", "La réponse est dans BigHead ! Lien en bio, fonce !", "Pour la réponse, télécharge BigHead, lien en bio !"
```

And the `USER_PROMPT` (line 85):

```
"outro_script": "max 12 mots, CTA teaser (ex: Tu connais la réponse ? Elle est dans BigHead !)",
```

Also update the `TRANSLATE_SYSTEM` (lines 140-141):

```
- Vary outros with teaser CTA: "Think you know? The answer's in BigHead, link in bio!", "Answer's in BigHead! Go check, link in bio!"
```

**Step 3: Test locally**

Run: `cd scripts/instagram-pipeline && npx tsc --noEmit`
Expected: No TypeScript errors

Run: `cd scripts/instagram-pipeline && node dist/index.js --dry-run`
Expected: Generated question with teaser outro (no answer reveal in script)

**Step 4: Commit**

```bash
git add scripts/instagram-pipeline/src/heygen.ts scripts/instagram-pipeline/src/generate-question.ts
git commit -m "feat(pipeline): cliffhanger format — hide answer, CTA to download app"
```

---

### Task 2: Add YouTube Shorts to upload-post.ts

**Files:**
- Modify: `scripts/instagram-pipeline/src/upload-post.ts`
- Modify: `scripts/instagram-pipeline/src/index.ts:20-21` (platform env vars)

**Step 1: Verify Upload-Post supports YouTube**

Upload-Post API accepts `platform[]` values. YouTube Shorts is posted as a regular YouTube video (short format auto-detected by YouTube when vertical + <60s). The platform name in Upload-Post is `"youtube"`.

No code changes needed in `upload-post.ts` — it already passes platforms dynamically.

**Step 2: Update env var documentation in index.ts**

Add a comment at lines 20-21:

```typescript
// Platforms: "instagram", "tiktok", "youtube" (comma-separated)
const FR_PLATFORMS = (process.env.FR_PLATFORMS || "instagram").split(",").map(s => s.trim());
const EN_PLATFORMS = (process.env.EN_PLATFORMS || "instagram").split(",").map(s => s.trim());
```

**Step 3: Update caption format for YouTube**

In `index.ts` `processLang()`, update the caption (lines 61-70) to include YouTube-friendly description:

```typescript
const caption = [
  question.caption,
  "",
  question.hashtags.join(" "),
  "",
  isFr
    ? "📲 Télécharge BigHead sur l'App Store pour découvrir la réponse !"
    : "📲 Download BigHead on the App Store to find the answer!",
  isFr
    ? "🔗 Lien en bio | #quiz #bighead #shorts"
    : "🔗 Link in bio | #quiz #bighead #shorts",
].join("\n");
```

**Step 4: Test**

Run: `cd scripts/instagram-pipeline && npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add scripts/instagram-pipeline/src/index.ts
git commit -m "feat(pipeline): add YouTube Shorts support via platform env var"
```

**Step 6: Deploy to VPS and configure YouTube**

```bash
scp scripts/instagram-pipeline/src/*.ts cursor@77.87.110.100:/home/script/bighead/instagram-pipeline/src/
ssh cursor@77.87.110.100 "cd /home/script/bighead/instagram-pipeline && npx tsc"
```

Then on VPS, update `.env` to add youtube to platforms:
```
FR_PLATFORMS=instagram,tiktok,youtube
EN_PLATFORMS=instagram,tiktok,youtube
```

User must configure YouTube accounts in Upload-Post dashboard for `bighead-fr` and `bighead-en` profiles.

---

## Workstream 2: ASO — App Store Optimization

### Task 3: Rewrite ASO metadata for FR market

**Files:**
- Modify: `docs/APP_STORE_DESCRIPTION.md`

**Step 1: Rewrite keywords, subtitle, description**

Replace the full content of `docs/APP_STORE_DESCRIPTION.md`:

```markdown
# BIGHEAD - App Store Description

## App Name (30 caractères max)
BIGHEAD - Quiz Culture Gé

## Subtitle (30 caractères max)
Quiz & Défis de Culture Gé

## Keywords (100 caractères max, séparés par virgules)
quiz,culture générale,trivia,questions,cerveau,défi quotidien,jeu quiz,qcm,test,blind test,duel

## Promotional Text (170 caractères max)
Nouveau : Défie tes amis en duel 1v1 ! Plus de 10 000 questions dans 11 catégories. Daily Brain : 1 erreur = game over. Tu tiens combien ?

## Description (4000 caractères max)

BIGHEAD, c'est LE quiz culture gé qui rend accro !

Plus de 10 000 questions dans 11 catégories : science, histoire, cinéma, sport, musique, géo, nature, techno, art, animaux et culture générale.

DAILY BRAIN — Le défi quotidien
Chaque jour, une nouvelle série de questions en mode survie. 1 erreur = game over. Enchaîne les bonnes réponses et compare ton score. Tu tiens combien de jours d'affilée ?

DUEL 1v1 — Affronte tes amis
Défie n'importe qui en temps réel. 5 questions, le plus rapide gagne. Prouve que t'as la plus grosse tête !

TOURNOIS — Compétitions hebdomadaires
Rejoins les tournois chaque semaine et grimpe le classement mondial.

MODE AVENTURE — Du Curieux au Génie
Progresse à travers 5 niveaux de difficulté. Débloque de nouveaux défis à chaque palier.

MODE PARTY — Jouez ensemble
Passez-vous le téléphone et jouez à plusieurs. Parfait pour les soirées !

FONCTIONNALITÉS
• 10 000+ questions de culture générale
• 11 catégories variées
• Daily Brain : défi quotidien en mode survie
• Duels 1v1 en temps réel
• Tournois hebdomadaires
• Mode Aventure avec progression
• Mode Party multijoueur local
• Classements et statistiques détaillées
• Notifications quotidiennes

Télécharge BIGHEAD et prouve que t'as la plus grosse tête !

Contact : support@bighead-app.com
```

**Step 2: Commit**

```bash
git add docs/APP_STORE_DESCRIPTION.md
git commit -m "feat(aso): rewrite FR App Store description with optimized keywords"
```

---

### Task 4: Update store metadata.json — fix outdated football focus + add EN

**Files:**
- Modify: `apps/mobile/store/metadata.json`

**Step 1: Rewrite metadata.json**

Replace the full content:

```json
{
  "name": "BIGHEAD - Quiz Culture",
  "subtitle": "Quiz & Défis de Culture Gé",
  "description": "BIGHEAD, c'est LE quiz culture gé qui rend accro ! Plus de 10 000 questions dans 11 catégories. Daily Brain, Duels 1v1, Tournois, Mode Aventure et Party. Télécharge et prouve que t'as la plus grosse tête !",
  "keywords": [
    "quiz",
    "culture générale",
    "trivia",
    "questions",
    "cerveau",
    "défi quotidien",
    "jeu quiz",
    "qcm",
    "test",
    "blind test",
    "duel"
  ],
  "locales": {
    "en-US": {
      "name": "BIGHEAD - Trivia Quiz",
      "subtitle": "Daily Trivia & Brain Challenges",
      "description": "BIGHEAD is THE trivia quiz that gets you hooked! 10,000+ questions across 11 categories. Daily Brain survival mode, 1v1 Duels, Tournaments, Adventure Mode and Party Mode. Download and prove you're the biggest brain!",
      "keywords": [
        "trivia",
        "quiz game",
        "brain challenge",
        "daily quiz",
        "general knowledge",
        "trivia game free",
        "quiz",
        "brain teaser",
        "duel quiz",
        "fun quiz"
      ]
    }
  },
  "categories": {
    "ios": {
      "primary": "Games",
      "secondary": "Trivia"
    },
    "android": {
      "primary": "GAME_TRIVIA"
    }
  },
  "contentRating": {
    "ios": "4+",
    "android": "Everyone"
  },
  "privacyPolicyUrl": "https://bighead.jrmanagement.org/privacy.html",
  "supportUrl": "https://bighead.jrmanagement.org",
  "marketingUrl": "https://bighead.jrmanagement.org"
}
```

**Step 2: Commit**

```bash
git add apps/mobile/store/metadata.json
git commit -m "feat(aso): update store metadata — general culture focus + EN localization"
```

---

### Task 5: Manual — Update App Store Connect (user action)

This is a manual task for the user:
1. Log into App Store Connect
2. Update Keywords, Subtitle, Description from the new `APP_STORE_DESCRIPTION.md`
3. Add EN-US localization from `metadata.json` locales
4. Update Promotional Text
5. Update screenshots (can be done later)
6. Fix URLs to `bighead.jrmanagement.org`

---

## Workstream 3: In-App Virality

### Task 6: Create shareable Daily Challenge scorecard

**Files:**
- Create: `apps/mobile/src/components/ShareScorecard.tsx`
- Modify: `apps/mobile/src/utils/share.ts` — add `shareScorecardImage()`

**Step 1: Install dependencies**

```bash
cd apps/mobile && npx expo install react-native-view-shot expo-sharing
```

**Step 2: Create ShareScorecard component**

Create `apps/mobile/src/components/ShareScorecard.tsx`:

```tsx
import React, { useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";

interface ShareScorecardProps {
  score: number;
  streak: number;
  category: string;
  questionsAnswered: number;
  lang?: "fr" | "en";
}

export const ShareScorecard: React.FC<ShareScorecardProps> = ({
  score,
  streak,
  category,
  questionsAnswered,
  lang = "fr",
}) => {
  const viewShotRef = useRef<ViewShot>(null);

  const handleShare = async () => {
    try {
      const uri = await viewShotRef.current?.capture?.();
      if (!uri) return;

      const available = await Sharing.isAvailableAsync();
      if (!available) return;

      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: lang === "fr" ? "Partager mon score" : "Share my score",
      });
    } catch (error) {
      console.error("Error sharing scorecard:", error);
    }
  };

  const isFr = lang === "fr";

  return (
    <View>
      <ViewShot
        ref={viewShotRef}
        options={{ format: "png", quality: 1 }}
        style={{
          width: 350,
          padding: 24,
          backgroundColor: "#111827",
          borderRadius: 20,
          borderWidth: 2,
          borderColor: "#0ea5e9",
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: "#0ea5e9",
            textAlign: "center",
            marginBottom: 4,
          }}
        >
          BIGHEAD
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#9ca3af",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          {isFr ? "Daily Brain" : "Daily Brain"}
        </Text>

        <Text
          style={{
            fontSize: 48,
            fontWeight: "bold",
            color: "#FACC15",
            textAlign: "center",
          }}
        >
          {questionsAnswered}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#9ca3af",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          {isFr ? "bonnes réponses" : "correct answers"}
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginBottom: 16,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#fff" }}>
              🔥 {streak}
            </Text>
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>
              {isFr ? "jours" : "days"}
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#fff" }}>
              {score.toLocaleString()}
            </Text>
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>
              pts
            </Text>
          </View>
        </View>

        <Text
          style={{
            fontSize: 12,
            color: "#6b7280",
            textAlign: "center",
          }}
        >
          {isFr ? "Télécharge BIGHEAD sur l'App Store" : "Download BIGHEAD on the App Store"}
        </Text>
      </ViewShot>

      <TouchableOpacity
        onPress={handleShare}
        style={{
          marginTop: 12,
          backgroundColor: "#0ea5e9",
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
          {isFr ? "📤 Partager" : "📤 Share"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
```

**Step 3: Commit**

```bash
git add apps/mobile/src/components/ShareScorecard.tsx
git commit -m "feat: add shareable Daily Brain scorecard component"
```

---

### Task 7: Integrate scorecard into Daily Brain result screen

**Files:**
- Modify: The Daily Brain result/game-over screen (find the exact file with `grep -r "daily" apps/mobile/app/`)

**Step 1: Find the Daily Brain result screen**

Run: `grep -rn "streak\|gameOver\|daily.*result" apps/mobile/app/ --include="*.tsx" -l`

**Step 2: Import and add ShareScorecard**

Add the `<ShareScorecard />` component to the game-over/result view of the Daily Brain mode, passing score, streak, category, and questionsAnswered props.

**Step 3: Test on simulator**

Run: `cd apps/mobile && npx expo run:ios`
Play a Daily Brain game, verify scorecard appears on result screen and share button works.

**Step 4: Commit**

```bash
git add apps/mobile/app/<daily-result-screen>.tsx
git commit -m "feat: integrate scorecard sharing into Daily Brain results"
```

---

### Task 8: Update referral system — hints instead of coins

**Files:**
- Modify: `apps/mobile/src/services/referral.ts`

**Step 1: Replace coin reward with hint reward**

In `referral.ts`, replace line 10:

```typescript
const REFERRAL_REWARD_HINTS = 1;
```

Update `getShareMessage()` (lines 141-148):

```typescript
export const getShareMessage = (referralCode: string, lang: "fr" | "en" = "fr"): string => {
  const storeUrl = Platform.OS === "ios" ? APP_STORE_URL : PLAY_STORE_URL;

  if (lang === "en") {
    return `Join me on BIGHEAD - the ultimate trivia quiz! 🧠\n\nUse my code ${referralCode} to get a free hint!\n\nDownload now:\n${storeUrl}`;
  }

  return `Rejoins-moi sur BIGHEAD - le quiz culture gé ultime ! 🧠\n\nUtilise mon code ${referralCode} pour obtenir un indice gratuit !\n\nTélécharge ici :\n${storeUrl}`;
};
```

Update `ReferralStats` interface — remove `totalCoinsEarned`, add `totalHintsEarned`:

```typescript
export interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  totalHintsEarned: number;
  pendingReferrals: number;
}
```

Update `getReferralStats()` (line 101):

```typescript
totalHintsEarned: totalReferrals * REFERRAL_REWARD_HINTS,
```

Also update store URLs (lines 11-12):

```typescript
const APP_STORE_URL = "https://apps.apple.com/app/bighead-quiz-culture/id6758253365";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.jroma51.bighead";
```

**Step 2: Update share.ts — fix "football" references**

In `apps/mobile/src/utils/share.ts`, update all messages to say "culture gé" / "trivia" instead of "football":

- Line 22: `🧠 BIGHEAD - Quiz Culture Gé\n\n` (was "Quiz Football")
- Line 54: `Rejoins-moi sur le quiz le plus addictif !` (remove "football")
- Line 77: same
- Line 121-123: `🧠 BIGHEAD - Le quiz culture gé ultime !\n\nPlus de 10 000 questions dans 11 catégories !\n\nRejoins-moi sur BIGHEAD !`

**Step 3: Commit**

```bash
git add apps/mobile/src/services/referral.ts apps/mobile/src/utils/share.ts
git commit -m "feat: referral rewards as hints, fix outdated football references in share messages"
```

---

### Task 9: Add contextual invite popup after positive events

**Files:**
- Create: `apps/mobile/src/services/invite-prompt.ts`

**Step 1: Create invite prompt service**

Following the same pattern as `rating.ts` (AsyncStorage-based state tracking):

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";

const INVITE_KEY = "bighead_invite_prompt";
const FIRST_MILESTONE = 5; // Show after 5 wins
const MILESTONE_INCREMENT = 15; // Then every 15 wins after dismiss

interface InviteState {
  winsCount: number;
  nextMilestone: number;
  lastShown: string | null;
  dismissed: boolean;
}

const defaultState: InviteState = {
  winsCount: 0,
  nextMilestone: FIRST_MILESTONE,
  lastShown: null,
  dismissed: false,
};

export const getInviteState = async (): Promise<InviteState> => {
  const raw = await AsyncStorage.getItem(INVITE_KEY);
  return raw ? JSON.parse(raw) : defaultState;
};

const saveInviteState = async (state: InviteState) => {
  await AsyncStorage.setItem(INVITE_KEY, JSON.stringify(state));
};

export const incrementWins = async () => {
  const state = await getInviteState();
  state.winsCount++;
  await saveInviteState(state);
};

export const shouldShowInvitePrompt = async (): Promise<boolean> => {
  const state = await getInviteState();
  if (state.winsCount < state.nextMilestone) return false;

  // Don't show more than once per day
  if (state.lastShown) {
    const lastDate = new Date(state.lastShown).toDateString();
    const today = new Date().toDateString();
    if (lastDate === today) return false;
  }

  return true;
};

export const markInviteShown = async () => {
  const state = await getInviteState();
  state.lastShown = new Date().toISOString();
  await saveInviteState(state);
};

export const markInviteDismissed = async () => {
  const state = await getInviteState();
  state.dismissed = false; // Reset for next milestone
  state.nextMilestone = state.winsCount + MILESTONE_INCREMENT;
  state.lastShown = new Date().toISOString();
  await saveInviteState(state);
};
```

**Step 2: Commit**

```bash
git add apps/mobile/src/services/invite-prompt.ts
git commit -m "feat: add contextual invite prompt service with milestone tracking"
```

---

### Task 10: Integrate invite prompt into game result screens

**Files:**
- Modify: Game result screens (duel, chain, daily brain)

**Step 1: Find result screens**

Run: `grep -rn "result\|gameOver\|game-over" apps/mobile/app/ --include="*.tsx" -l`

**Step 2: Add invite prompt logic**

In each result screen where the player wins/does well:
1. Call `incrementWins()` on positive outcome
2. Check `shouldShowInvitePrompt()`
3. If true, show a small banner/modal with "Invite a friend" + share button
4. On dismiss, call `markInviteDismissed()`
5. On share, call `inviteFriends()` from share.ts + `markInviteShown()`

**Step 3: Test on simulator**

**Step 4: Commit**

```bash
git add apps/mobile/app/<result-screens>.tsx
git commit -m "feat: contextual invite prompt after wins in game results"
```

---

### Task 11: Configure Universal Links for invite deep links

**Files:**
- Create: VPS file `apple-app-site-association` (AASA)
- Create: VPS file `invite/index.html` (redirect page)
- Modify: `apps/mobile/app.json` — add `associatedDomains`

**Step 1: Add associatedDomains to app.json**

In `apps/mobile/app.json`, add to `ios` section (after line 30):

```json
"associatedDomains": ["applinks:bighead.jrmanagement.org"]
```

**Step 2: Create AASA file on VPS**

SSH to VPS and create `/.well-known/apple-app-site-association`:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appIDs": ["P42GJWD55N.com.jroma51.bighead"],
        "paths": ["/invite/*"]
      }
    ]
  }
}
```

Configure nginx to serve it with `Content-Type: application/json`.

**Step 3: Create invite redirect page**

Create `/home/script/bighead/invite/index.html` on VPS — a simple page that:
- On iOS: attempts to open `bighead://invite/{code}` via JS, falls back to App Store link after 2s
- On Android: attempts intent link, falls back to Play Store
- Desktop: shows "Download BIGHEAD" with store links

**Step 4: This requires a native rebuild (associatedDomains)**

```bash
cd apps/mobile && eas build --profile production --platform ios
```

**Step 5: Commit**

```bash
git add apps/mobile/app.json
git commit -m "feat: configure universal links for invite deep links"
```

---

### Task 12: Deploy pipeline changes to VPS

**Step 1: Deploy updated pipeline code**

```bash
scp scripts/instagram-pipeline/src/*.ts cursor@77.87.110.100:/home/script/bighead/instagram-pipeline/src/
scp scripts/instagram-pipeline/package.json scripts/instagram-pipeline/tsconfig.json cursor@77.87.110.100:/home/script/bighead/instagram-pipeline/
ssh cursor@77.87.110.100 "cd /home/script/bighead/instagram-pipeline && npm install && npx tsc"
```

**Step 2: Test with dry-run**

```bash
ssh cursor@77.87.110.100 "cd /home/script/bighead/instagram-pipeline && node dist/index.js --dry-run"
```

Expected: Question generated with cliffhanger outro (no answer reveal).

**Step 3: Update env on VPS**

Add YouTube to platforms:
```
FR_PLATFORMS=instagram,tiktok,youtube
EN_PLATFORMS=instagram,tiktok,youtube
```

User must configure YouTube channel connections in Upload-Post dashboard.

---

## Summary — Execution Order

| # | Task | Workstream | Dependencies |
|---|------|-----------|-------------|
| 1 | Cliffhanger video format | Pipeline | None |
| 2 | YouTube Shorts support | Pipeline | Task 1 |
| 3 | Rewrite FR ASO metadata | ASO | None |
| 4 | Update store metadata.json + EN | ASO | None |
| 5 | Manual: Update App Store Connect | ASO | Tasks 3-4 |
| 6 | Shareable scorecard component | In-app | None |
| 7 | Integrate scorecard in Daily Brain | In-app | Task 6 |
| 8 | Fix referral (hints, not coins) | In-app | None |
| 9 | Invite prompt service | In-app | None |
| 10 | Integrate invite prompt | In-app | Task 9 |
| 11 | Universal Links setup | In-app | None |
| 12 | Deploy pipeline to VPS | Pipeline | Tasks 1-2 |

**Parallel tracks:** Tasks 1-2, Tasks 3-4, Tasks 6-11 can all run in parallel.
