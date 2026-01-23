# Design : Aventure Solo & Mode Famille

**Date** : 23 janvier 2025
**Statut** : Validé

---

## 1. Vue d'ensemble

Deux nouveaux modes de jeu pour BIGHEAD :

| Mode | Description | Monétisation |
|------|-------------|--------------|
| **Aventure Solo** | Progression sur la Montagne de la Connaissance | 2 tentatives/jour (gratuit), illimité (Premium) |
| **Mode Famille** | Quiz à voix haute en groupe | Gratuit |

---

## 2. Aventure Solo - Montagne de la Connaissance

### 2.1 Système de progression

**11 Tiers × 3 Niveaux = 33 étapes**

| Tier | Niveaux | Difficulté |
|------|---------|------------|
| Coton | 1, 2, 3 | Débutant |
| Carton | 1, 2, 3 | Novice |
| Bois | 1, 2, 3 | Amateur |
| Bronze | 1, 2, 3 | Confirmé |
| Argent | 1, 2, 3 | Expérimenté |
| Gold | 1, 2, 3 | Avancé |
| Platinium | 1, 2, 3 | Expert |
| Titane | 1, 2, 3 | Maître |
| Diamant | 1, 2, 3 | Champion |
| Mythique | 1, 2, 3 | Héros |
| Légendaire | 1, 2, 3 | Légende |

### 2.2 Règles de jeu

- **Tirage aléatoire** : Roue qui tourne pour sélectionner une catégorie
- **10 questions** par catégorie avec timer standard
- **Validation** : < 2 erreurs = catégorie complétée
- **Échec** : ≥ 2 erreurs = -1 tentative, recommencer la catégorie
- **Progression** : Compléter les 11 catégories = passage au niveau suivant

### 2.3 Catégories (11)

| Icône | Catégorie |
|-------|-----------|
| 🎯 | Culture Générale |
| 📜 | Histoire |
| 🌍 | Géographie |
| 🔬 | Sciences |
| ⚽ | Sport |
| 🌟 | Pop Culture |
| 🎮 | Jeux Vidéo |
| 🎬 | Cinéma & Séries |
| 🎵 | Musique |
| 💻 | Technologie |
| 🏷️ | Logo |

### 2.4 Monétisation

- **Gratuit** : 2 tentatives par jour (reset à minuit)
- **Premium** : Tentatives illimitées

### 2.5 Visualisation

**Montagne de la Connaissance** :
- Personnage qui grimpe visuellement
- Base → Coton (paysage doux, nuages)
- Milieu → Carton (forêt, rochers)
- Haut → Gold (neige, soleil doré)
- Sommet → Platinium (pic glacé, étoiles)

### 2.6 Animation Roue des Catégories

1. Tap "Lancer la roue"
2. Roue tourne vite (1.5s) puis décélère (2s)
3. Son de roue + "ding" à l'arrêt
4. Catégorie révélée avec effet particules
5. Catégories complétées grisées sur la roue

---

## 3. Mode Famille

### 3.1 Concept

Un narrateur lit les questions à voix haute, les autres joueurs répondent oralement. Pas besoin de téléphone pour les autres joueurs.

### 3.2 Configuration

**Âge minimum des joueurs** :
- 6, 8, 10, 12, 14, 16, 18 ans, Adulte (18+)
- Les questions s'adaptent à l'âge sélectionné

**Nombre de questions** :
- 10 (rapide, ~10 min)
- 20 (standard, ~20 min)
- 30 (long)
- Illimité

**Catégorie** :
- Mix de tout (recommandé)
- Ou sélection d'une catégorie spécifique

### 3.3 Flux de jeu

1. Narrateur lit la question à voix haute
2. Joueurs répondent oralement
3. Narrateur tap pour révéler la réponse
4. Narrateur indique si quelqu'un a trouvé (✅ OUI / ❌ NON)
5. Compteur de bonnes réponses du groupe s'incrémente
6. Question suivante

### 3.4 Monétisation

**Gratuit** - Accessible à tous pour encourager le partage de l'app.

---

## 4. Structure Technique

### 4.1 Nouveaux fichiers

```
app/
├── game/
│   ├── adventure/
│   │   ├── index.tsx        # Écran montagne + progression
│   │   ├── wheel.tsx        # Animation roue catégories
│   │   └── play.tsx         # Quiz aventure
│   └── family/
│       ├── index.tsx        # Configuration (âge, nb questions)
│       └── play.tsx         # Écran narrateur

src/
├── components/
│   ├── MountainProgress.tsx # Visualisation montagne animée
│   ├── CategoryWheel.tsx    # Roue animée (reanimated)
│   └── FamilyQuizCard.tsx   # Carte question mode famille
├── services/
│   └── adventure.ts         # API progression, tentatives
└── types/
    └── adventure.ts         # Types Tier, Level, Progress
```

### 4.2 Tables Supabase

```sql
-- Progression aventure
CREATE TABLE adventure_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  tier TEXT DEFAULT 'coton' CHECK (tier IN ('coton', 'carton', 'gold', 'platinium')),
  level INT DEFAULT 1 CHECK (level BETWEEN 1 AND 3),
  completed_categories TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tentatives journalières
CREATE TABLE daily_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  attempts_used INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Questions : nouvelles colonnes
ALTER TABLE questions ADD COLUMN min_age INT DEFAULT 18;
ALTER TABLE questions ADD COLUMN difficulty_tier TEXT DEFAULT 'coton';
ALTER TABLE questions ADD COLUMN category TEXT;
```

### 4.3 Types TypeScript

```typescript
type Tier = 'coton' | 'carton' | 'gold' | 'platinium';

type Category =
  | 'culture_generale'
  | 'histoire'
  | 'geographie'
  | 'sciences'
  | 'sport'
  | 'pop_culture'
  | 'jeux_video'
  | 'cinema'
  | 'musique'
  | 'technologie'
  | 'logo';

interface AdventureProgress {
  user_id: string;
  tier: Tier;
  level: 1 | 2 | 3;
  completed_categories: Category[];
}

interface DailyAttempts {
  user_id: string;
  date: string;
  attempts_used: number;
}

interface FamilyGameConfig {
  min_age: 6 | 8 | 10 | 12 | 14 | 16 | 18 | 99;
  question_count: 10 | 20 | 30 | 'unlimited';
  category: Category | 'mix';
}
```

---

## 5. Écrans UI

### 5.1 Écran d'accueil (modifié)

```
┌─────────────────────────────────────────────┐
│              ÉCRAN D'ACCUEIL                │
├─────────────────────────────────────────────┤
│                                             │
│   [🏔️ Aventure Solo]    [👨‍👩‍👧‍👦 Mode Famille]   │
│   "Gravis la Montagne"   "Quiz en groupe"   │
│                                             │
│   [⚡ Solo Run]          [🏆 Daily Challenge]│
│                                             │
└─────────────────────────────────────────────┘
```

### 5.2 Montagne de la Connaissance

```
┌──────────────────────────────────────────────────────────┐
│                 🏔️ MONTAGNE DE LA CONNAISSANCE            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│                        ⭐ SOMMET                          │
│                       /  Platinium 3                     │
│                      /   Platinium 2                     │
│                     /    Platinium 1                     │
│                    ●─────────────────                    │
│                   /      Gold 3                          │
│                  /       Gold 2                          │
│                 /        Gold 1                          │
│                ●─────────────────                        │
│               /        Carton 3                          │
│              /         Carton 2                          │
│             /          Carton 1                          │
│            ●─────────────────                            │
│           /          Coton 3                             │
│          /           Coton 2                             │
│    🧑    /            Coton 1  ← Position actuelle       │
│   ═══════════════════════════════════════                │
│                                                          │
│   Tentatives : 1/2 aujourd'hui    [👑 Passer Illimité]   │
│                                                          │
│   Catégories complétées : 3/11                          │
│   🎯✅ 📜✅ 🌍✅ 🔬 ⚽ 🌟 🎮 🎬 🎵 💻 🏷️               │
│                                                          │
│              [ 🎡 LANCER LA ROUE ]                       │
└──────────────────────────────────────────────────────────┘
```

### 5.3 Roue des Catégories

```
┌──────────────────────────────────────────────┐
│           🎡 TIRAGE DE CATÉGORIE             │
├──────────────────────────────────────────────┤
│                                              │
│              ▼ (indicateur)                  │
│         ┌─────────────┐                      │
│         │   🎮        │                      │
│      🎵 │ Jeux Vidéo  │ 🎬                   │
│         │             │                      │
│         └─────────────┘                      │
│      💻        │        🌟                   │
│            🏷️  🔬  📜                        │
│                                              │
│   La roue tourne... puis ralentit...        │
│                                              │
│         ✨ JEUX VIDÉO ✨                     │
│         [10 questions]                       │
│                                              │
│            [ JOUER ! ]                       │
└──────────────────────────────────────────────┘
```

### 5.4 Mode Famille - Configuration

```
┌──────────────────────────────────────────────┐
│           👨‍👩‍👧‍👦 MODE FAMILLE                   │
├──────────────────────────────────────────────┤
│                                              │
│   Âge minimum des joueurs :                  │
│   ┌────┬────┬────┬────┬────┬────┬────┬─────┐ │
│   │ 6  │ 8  │ 10 │ 12 │ 14 │ 16 │ 18 │ 18+ │ │
│   └────┴────┴────┴────┴────┴────┴────┴─────┘ │
│                                              │
│   Nombre de questions :                      │
│   ┌────┬────┬────┬─────────┐                 │
│   │ 10 │ 20 │ 30 │ Illimité│                 │
│   └────┴────┴────┴─────────┘                 │
│                                              │
│   Catégorie :                                │
│   ┌─────────────────────────────────┐        │
│   │  🎲 Mix de tout (recommandé)    │        │
│   └─────────────────────────────────┘        │
│                                              │
│            [ 🎉 C'EST PARTI ! ]              │
└──────────────────────────────────────────────┘
```

### 5.5 Mode Famille - Jeu

```
┌──────────────────────────────────────────────┐
│    Question 3/20          ✅ Score: 2        │
├──────────────────────────────────────────────┤
│                                              │
│   📜 HISTOIRE                                │
│                                              │
│   "En quelle année Napoléon                  │
│    est-il devenu Empereur ?"                 │
│                                              │
│                                              │
│         👆 TAP POUR RÉVÉLER                  │
│                                              │
└──────────────────────────────────────────────┘

         ↓ Après tap ↓

┌──────────────────────────────────────────────┐
│   ✨ RÉPONSE : 1804 ✨                       │
│                                              │
│   Quelqu'un a trouvé ?                       │
│                                              │
│     [ ✅ OUI +1 ]    [ ❌ NON ]              │
│                                              │
│          [ ➡️ Question suivante ]            │
└──────────────────────────────────────────────┘
```

---

## 6. Priorité d'implémentation

### Phase 1 : Fondations
1. Tables Supabase + migrations
2. Types TypeScript
3. Service `adventure.ts`

### Phase 2 : Aventure Solo
4. Écran Montagne (`adventure/index.tsx`)
5. Composant `MountainProgress.tsx`
6. Animation Roue (`CategoryWheel.tsx`)
7. Écran de jeu (`adventure/play.tsx`)

### Phase 3 : Mode Famille
8. Écran configuration (`family/index.tsx`)
9. Écran narrateur (`family/play.tsx`)
10. Composant `FamilyQuizCard.tsx`

### Phase 4 : Intégration
11. Modifier écran d'accueil
12. Questions par catégorie/âge/difficulté
13. Tests et polish

---

## 7. Questions ouvertes (pour plus tard)

- [ ] Récompenses visuelles au sommet de chaque tier ?
- [ ] Partage social des accomplissements ?
- [ ] Avatars/skins débloquables par progression ?
- [ ] Mode multijoueur compétitif sur la montagne ?
