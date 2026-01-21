# BIGHEAD MVP — Plan Technique

> Plan de développement MVP en 10 semaines
> Solo dev + Claude + Figma AI
> Document généré: 2026-01-21

---

## Table of Contents

1. [Stack Technique](#1-stack-technique)
2. [Scope MVP](#2-scope-mvp)
3. [Structure du Projet](#3-structure-du-projet)
4. [Database Schema](#4-database-schema)
5. [API / Edge Functions](#5-api--edge-functions)
6. [Structure React Native](#6-structure-react-native)
7. [Workflow Design (Figma MCP)](#7-workflow-design-figma-mcp)
8. [Planning de Développement](#8-planning-de-développement)

---

## 1. Stack Technique

| Layer | Tech | Justification |
|-------|------|---------------|
| Mobile | React Native + Expo | Cross-platform, fast iteration |
| State | Zustand | Simple, léger, TypeScript-friendly |
| Navigation | Expo Router | File-based routing, moderne |
| Backend | Supabase | Auth + DB + Edge Functions intégrés |
| Database | PostgreSQL | Relations complexes, performant |
| Auth | Supabase Auth | Email + Apple + Google inclus |
| AI | OpenAI GPT-4o | Génération questions (batch offline) |
| Design | Figma + MCP | Source de vérité, génération composants |
| Styling | Nativewind (Tailwind) | Rapid styling, design tokens |

---

## 2. Scope MVP

### Inclus dans le MVP

```
WORKFLOW DESIGN → CODE
├─ Figma comme source de vérité design
├─ Figma MCP connecté à Claude
├─ Claude lit les designs et génère les composants
├─ Design tokens extraits (couleurs, typo, spacing)
└─ Composants React Native générés depuis Figma

MODES
├─ Chain Reaction (solo)
├─ Chain Reaction (1v1 async)
└─ Party Mode (2-8 joueurs, 1 téléphone)

QUESTIONS
├─ 5 catégories (Histoire, Géo, Science, Sport, Pop)
├─ 500 questions pré-générées par catégorie
├─ 3 niveaux de difficulté
└─ Cache local (mode hors-ligne basique)

PROGRESSION
├─ Compte utilisateur (email ou Apple/Google)
├─ Score total + historique des parties
├─ Niveau joueur (XP simple)
└─ Stats basiques (% correct par catégorie)

SOCIAL (minimal)
├─ Challenge link après partie
└─ Leaderboard global top 100
```

### Exclus du MVP (Post-MVP)

```
├─ Mode Traitor
├─ Mode Auction Duel
├─ Knowledge Map complet
├─ Questions contextuelles (localisation, live)
├─ Mode Study (upload PDF)
├─ Adversaires IA avec personnalités
├─ Battle Pass
├─ Cosmétiques & Boutique
├─ Tournois
├─ Clans/Équipes
├─ Clips auto-générés
├─ Programme de parrainage
└─ Monétisation (tout gratuit pour MVP)
```

---

## 3. Structure du Projet

```
bighead/
├── apps/
│   └── mobile/                 # App React Native / Expo
│       ├── src/
│       │   ├── components/     # Composants UI (générés depuis Figma)
│       │   ├── screens/        # Écrans de l'app
│       │   ├── hooks/          # Custom hooks
│       │   ├── services/       # API calls, Supabase client
│       │   ├── stores/         # État global (Zustand)
│       │   ├── utils/          # Helpers
│       │   ├── constants/      # Config, design tokens
│       │   └── types/          # TypeScript types
│       ├── assets/             # Images, fonts, sons
│       ├── app.json            # Config Expo
│       └── package.json
│
├── packages/
│   └── shared/                 # Types partagés, logique commune
│       ├── types/
│       └── utils/
│
├── supabase/
│   ├── migrations/             # SQL migrations
│   ├── functions/              # Edge Functions (Deno)
│   └── seed/                   # Données initiales (questions)
│
├── scripts/
│   └── generate-questions/     # Script génération questions via GPT-4o
│
├── docs/
│   └── plans/                  # Documentation (design doc ici)
│
└── figma/
    └── tokens/                 # Design tokens exportés
```

---

## 4. Database Schema

```sql
-- UTILISATEURS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CATÉGORIES
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,           -- "Histoire", "Géographie", etc.
  slug TEXT UNIQUE NOT NULL,    -- "history", "geography", etc.
  icon TEXT,
  color TEXT,                   -- Hex color
  is_active BOOLEAN DEFAULT true
);

-- QUESTIONS
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id),
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 3),
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  wrong_answers TEXT[] NOT NULL, -- Array de 3 mauvaises réponses
  explanation TEXT,              -- Explication après réponse
  times_played INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEX pour performance
CREATE INDEX idx_questions_category ON questions(category_id);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);

-- PARTIES (GAMES)
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  mode TEXT NOT NULL,            -- "chain_solo", "chain_duel", "party"
  score INTEGER NOT NULL,
  max_chain INTEGER,             -- Pour Chain Reaction
  questions_count INTEGER,
  correct_count INTEGER,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RÉPONSES PAR PARTIE
CREATE TABLE game_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id),
  player_name TEXT,              -- Pour Party Mode (pas de user_id)
  is_correct BOOLEAN NOT NULL,
  answer_time_ms INTEGER,        -- Temps de réponse
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CHALLENGES (liens de défi)
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,     -- Code court pour l'URL
  creator_id UUID REFERENCES users(id),
  game_id UUID REFERENCES games(id),
  question_ids UUID[] NOT NULL,  -- Questions du défi
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CHALLENGE ATTEMPTS (tentatives de défi)
CREATE TABLE challenge_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenges(id),
  user_id UUID REFERENCES users(id),
  score INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STATS PAR CATÉGORIE (dénormalisé pour perf)
CREATE TABLE user_category_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  category_id UUID REFERENCES categories(id),
  questions_played INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  UNIQUE(user_id, category_id)
);

-- LEADERBOARD VIEW
CREATE VIEW leaderboard AS
SELECT
  u.id,
  u.username,
  u.avatar_url,
  u.total_xp,
  u.level,
  RANK() OVER (ORDER BY u.total_xp DESC) as rank
FROM users u
WHERE u.total_xp > 0
ORDER BY u.total_xp DESC
LIMIT 100;
```

---

## 5. API / Edge Functions

```
SUPABASE EDGE FUNCTIONS

/functions/
├── get-questions/        GET questions pour une partie
│   → Params: category?, difficulty?, count
│   → Returns: Question[]
│
├── submit-game/          Soumettre résultat partie
│   → Body: { mode, score, answers[], ... }
│   → Updates: games, user_category_stats, user.xp
│
├── create-challenge/     Créer un lien de défi
│   → Body: { game_id }
│   → Returns: { code, url }
│
├── get-challenge/        Récupérer un défi
│   → Params: code
│   → Returns: Challenge + Questions
│
└── submit-challenge/     Soumettre tentative de défi
    → Body: { challenge_id, score, answers[] }
    → Returns: Comparison avec créateur
```

### Accès Direct (Supabase Client)

| Action | Méthode |
|--------|---------|
| Auth (login/signup) | `supabase.auth` |
| Get user profile | `supabase.from('users').select()` |
| Get leaderboard | `supabase.from('leaderboard').select()` |
| Get user stats | `supabase.from('user_category_stats').select()` |
| Get game history | `supabase.from('games').select()` |

---

## 6. Structure React Native

```
src/
├── components/
│   ├── ui/                     # Composants de base
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Text.tsx
│   │   ├── Timer.tsx
│   │   └── ProgressBar.tsx
│   │
│   ├── game/                   # Composants de jeu
│   │   ├── QuestionCard.tsx
│   │   ├── AnswerButton.tsx
│   │   ├── ChainMultiplier.tsx
│   │   ├── ScoreDisplay.tsx
│   │   └── ResultScreen.tsx
│   │
│   └── layout/                 # Layout
│       ├── Header.tsx
│       └── SafeArea.tsx
│
├── screens/
│   ├── HomeScreen.tsx
│   ├── GameModeSelectScreen.tsx
│   ├── ChainGameScreen.tsx
│   ├── PartySetupScreen.tsx
│   ├── PartyGameScreen.tsx
│   ├── ResultScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── LeaderboardScreen.tsx
│   └── SettingsScreen.tsx
│
├── hooks/
│   ├── useGame.ts              # Logique de jeu
│   ├── useTimer.ts             # Timer countdown
│   ├── useQuestions.ts         # Fetch questions
│   ├── useAuth.ts              # Authentication
│   └── useChallenge.ts         # Challenge links
│
├── stores/
│   ├── gameStore.ts            # État de la partie en cours
│   ├── userStore.ts            # User + stats
│   └── settingsStore.ts        # Préférences
│
├── services/
│   ├── supabase.ts             # Client Supabase
│   ├── api.ts                  # Appels Edge Functions
│   └── questions.ts            # Cache local questions
│
├── constants/
│   ├── theme.ts                # Design tokens depuis Figma
│   ├── config.ts               # App config
│   └── gameRules.ts            # Règles Chain Reaction, etc.
│
└── types/
    ├── database.ts             # Types générés par Supabase
    ├── game.ts                 # Types jeu
    └── navigation.ts           # Types navigation
```

---

## 7. Workflow Design (Figma MCP)

```
DESIGN WORKFLOW

FIGMA AI
   │
   ▼
┌──────────────────┐
│  Designs créés   │
│  dans Figma      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Figma MCP      │ ← Claude lit les designs
│   (connecteur)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Claude génère:  │
│  • Design tokens │
│  • Composants RN │
│  • Styles        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Code React     │
│   Native / Expo  │
└──────────────────┘
```

### Écrans à Designer dans Figma

| Écran | Priorité | Complexité |
|-------|----------|------------|
| Splash / Onboarding | P1 | Simple |
| Home (menu principal) | P1 | Moyenne |
| Sélection de mode | P1 | Simple |
| Écran de question | P1 | Moyenne |
| Résultat de réponse | P1 | Simple |
| Fin de partie + score | P1 | Moyenne |
| Party Mode - Setup | P1 | Moyenne |
| Party Mode - Passage de joueur | P1 | Simple |
| Profil + Stats | P2 | Moyenne |
| Leaderboard | P2 | Simple |
| Challenge link (share) | P2 | Simple |
| Settings | P3 | Simple |

---

## 8. Planning de Développement

### Vue d'ensemble (10 semaines)

```
S1───S2───S3───S4───S5───S6───S7───S8───S9───S10
│         │              │              │    │
▼         ▼              ▼              ▼    ▼
SETUP    CORE GAME      PARTY MODE    SOCIAL  POLISH
+ DB     + CHAIN        + LOCAL       + CHALLENGE
+ DESIGN                              + LEADERBOARD
```

---

### Phase 0: Setup (Semaine 1)

**Objectif:** Fondations techniques prêtes, design system en place

**JOUR 1-2: Projet & Infra**
- [ ] Créer repo Git
- [ ] Init Expo project (TypeScript)
- [ ] Configurer Supabase (projet + DB)
- [ ] Setup Figma MCP connection
- [ ] Installer dépendances (Zustand, Nativewind, etc.)

**JOUR 3-4: Database**
- [ ] Créer tables SQL (schema ci-dessus)
- [ ] Configurer Row Level Security (RLS)
- [ ] Générer types TypeScript depuis Supabase
- [ ] Tester connexion depuis l'app

**JOUR 5-7: Design System**
- [ ] Créer designs Figma (écrans P1)
- [ ] Extraire design tokens via MCP
- [ ] Générer composants de base (Button, Card, Text)
- [ ] Setup navigation (Expo Router)

**Livrable:** App qui démarre, navigation, design system

---

### Phase 1: Questions & Core Game (Semaines 2-4)

**SEMAINE 2: Questions**
- [ ] Script génération questions (GPT-4o)
  - 500 questions × 5 catégories = 2500 questions
  - 3 niveaux de difficulté
  - Format: question + 4 réponses + explication
- [ ] Import questions dans Supabase
- [ ] Edge Function: get-questions
- [ ] Hook useQuestions + cache local
- [ ] Test: fetch questions fonctionne

**SEMAINE 3: Chain Reaction UI**
- [ ] Écran sélection de mode
- [ ] Écran de question
  - Affichage question + 4 réponses
  - Timer countdown (15s)
  - Animation sélection réponse
- [ ] Écran résultat réponse
  - Correct/Incorrect + explication
  - Multiplier actuel
- [ ] Composant ChainMultiplier (1x → 10x)

**SEMAINE 4: Chain Reaction Logic**
- [ ] Game store (Zustand)
  - État: questions, currentIndex, score, chain
  - Actions: answer, nextQuestion, endGame
- [ ] Logique multiplier (1x → 2x → 3x → 5x → 8x → 10x)
- [ ] Reset à 1x si erreur
- [ ] Écran fin de partie (score final + stats)
- [ ] Edge Function: submit-game
- [ ] Sauvegarde partie dans DB

**Livrable:** Chain Reaction solo jouable, scores sauvés

---

### Phase 2: Auth & Profil (Semaine 5)

**JOUR 1-2: Authentication**
- [ ] Écran Login/Signup
- [ ] Supabase Auth (email + magic link)
- [ ] Apple Sign In
- [ ] Google Sign In
- [ ] Persister session (SecureStore)

**JOUR 3-4: Profil**
- [ ] Écran Profil
  - Username, avatar, level, XP
  - Stats par catégorie (% correct)
- [ ] Écran historique des parties
- [ ] Calcul XP et level up

**JOUR 5: Polish**
- [ ] Mode invité (jouer sans compte)
- [ ] Prompt "Créer un compte pour sauvegarder"
- [ ] Settings basique (son, notifications)

**Livrable:** Auth complète, profil avec stats

---

### Phase 3: Party Mode (Semaines 6-7)

**SEMAINE 6: Party Mode Setup**
- [ ] Écran Party Setup
  - Nombre de joueurs (2-8)
  - Saisie des prénoms
  - Sélection catégories
  - Nombre de questions (10/20/30)
  - Options (timer, difficulté)
- [ ] Store Party Mode
  - players[], currentPlayerIndex, scores{}
- [ ] Écran "Passe le téléphone à X"

**SEMAINE 7: Party Mode Game**
- [ ] Flow de jeu Party
  - Question → Réponse → Passage → Repeat
- [ ] Affichage "Tour de [Joueur]"
- [ ] Scores en temps réel
- [ ] Écran résultats Party
  - Classement final
  - Stats par joueur
  - MVP du match
- [ ] Mode Survie (variant)
  - 1 vie, éliminé si erreur
- [ ] Bouton "Rejouer" / "Nouvelle partie"

**Livrable:** Party Mode complet, 2-8 joueurs

---

### Phase 4: Social & Challenge (Semaine 8)

**JOUR 1-3: Challenge Links**
- [ ] Edge Function: create-challenge
  - Génère code unique (6 chars)
  - Stocke questions jouées
- [ ] Bouton "Défier un ami" après partie
- [ ] Share sheet natif (WhatsApp, iMessage, etc.)
- [ ] Deep link handling (bighead://challenge/XXXXX)
- [ ] Écran challenge reçu ("Score à battre: 847 pts")
- [ ] Jouer le même quiz
- [ ] Écran comparaison résultats

**JOUR 4-5: Leaderboard**
- [ ] Écran Leaderboard
  - Top 100 global
  - Ta position
- [ ] Tabs par période (Semaine / All-time)
- [ ] Pull-to-refresh

**Livrable:** Partage de défis, classement visible

---

### Phase 5: Polish & Launch (Semaines 9-10)

**SEMAINE 9: Polish**
- [ ] Animations & Feedback
  - Transition entre écrans
  - Animation bonne/mauvaise réponse
  - Haptic feedback
  - Sons (correct, wrong, level up)
- [ ] Loading states
- [ ] Error handling (offline, API errors)
- [ ] Onboarding (3 écrans)
  - Explication du jeu
  - Choix catégories préférées
- [ ] Empty states (pas de parties, etc.)

**SEMAINE 10: Launch Prep**
- [ ] Testing
  - Test sur iOS + Android
  - Test offline mode
  - Test edge cases (timer 0, etc.)
- [ ] Performance
  - Optimiser re-renders
  - Lazy loading écrans
- [ ] App Store prep
  - Screenshots
  - Description
  - Privacy policy
- [ ] TestFlight upload (iOS)
- [ ] Internal testing track (Android)
- [ ] Feedback loop avec premiers testeurs

**Livrable:** MVP prêt pour beta publique

---

## Résumé Timeline

| Semaine | Phase | Livrable |
|---------|-------|----------|
| S1 | Setup | Projet configuré, design system |
| S2 | Questions | 2500 questions générées, API prête |
| S3 | Chain UI | Écrans de jeu |
| S4 | Chain Logic | Chain Reaction jouable |
| S5 | Auth | Login + Profil + Stats |
| S6 | Party Setup | Configuration Party Mode |
| S7 | Party Game | Party Mode complet |
| S8 | Social | Challenges + Leaderboard |
| S9 | Polish | Animations, sons, onboarding |
| S10 | Launch | TestFlight / Beta ready |

---

## Milestones Clés

- **Fin S4:** Première version jouable (Chain solo)
- **Fin S7:** Les 2 modes fonctionnent
- **Fin S10:** MVP complet, prêt pour beta

---

## Checklist Pré-Dev

Avant de commencer le code:

- [ ] Compte Supabase créé
- [ ] Projet Expo initialisé
- [ ] Figma MCP configuré
- [ ] Clé API OpenAI obtenue
- [ ] Compte Apple Developer (pour TestFlight)
- [ ] Compte Google Play Console (pour Android beta)
- [ ] Repo Git créé

---

*Document prêt pour démarrer le développement.*
*Référence: docs/plans/2026-01-21-bighead-design.md pour le design complet.*
