# Refonte du Mode Aventure - BigHead

**Date:** 2026-01-26
**Statut:** Validé

## Résumé

Refonte complète du mode aventure avec un nouveau système de progression basé sur des personnages iconiques, une roue de sélection de catégories, et une visualisation de montagne affichant les 11 catégories.

## 1. Structure de Progression

### Tiers (8 niveaux)

| # | Nom | Emoji | Couleur |
|---|-----|-------|---------|
| 1 | Homer Simpson | 🥨 | Jaune |
| 2 | Mario | 🍄 | Rouge |
| 3 | Sherlock Holmes | 🔍 | Marron |
| 4 | Tony Stark | 🤖 | Rouge foncé |
| 5 | Gandalf | 🧙‍♂️ | Gris |
| 6 | Yoda | 🌌 | Vert |
| 7 | Leonardo da Vinci | 🎨 | Or |
| 8 | Albert Einstein | 🧠 | Bleu royal |

### Difficultés (3 par tier)
- Easy (Facile)
- Medium (Moyen)
- Hard (Difficile)

### Catégories (11 par niveau)
Les 11 catégories existantes sont conservées.

### Total
8 tiers × 3 difficultés × 11 catégories = **264 étapes**

## 2. Flux de Jeu

### Démarrage
1. Le joueur arrive sur l'écran aventure
2. La montagne affiche les 11 icônes de catégories
3. Catégories gagnées = colorées, non gagnées = grises
4. L'avatar du joueur se trouve à la dernière catégorie gagnée

### Fonctionnement de la Roue
- Contient uniquement les catégories **non gagnées** du niveau actuel
- Au premier lancement : 11 catégories
- Après chaque victoire : la catégorie est retirée de la roue
- Animation de spin (2-3 secondes)

### Déroulement
1. Appui sur "Jouer" → La roue tourne
2. Arrêt sur une catégorie (ex: "Histoire")
3. Quiz de 10 questions dans cette catégorie
4. Victoire (≥7/10) : catégorie s'allume sur la montagne
5. Défaite : on peut rejouer, catégorie reste dans la roue

### Transitions
- 11 catégories gagnées → difficulté suivante
- 3 difficultés terminées → tier suivant
- Tier 8 Hard terminé → aventure complète !

## 3. Visualisation de la Montagne

### Disposition
- 11 icônes le long d'un chemin sinueux montant
- Chemin en zigzag avec 5-6 niveaux de hauteur
- Drapeau/trophée au sommet

### États des Catégories
| État | Apparence |
|------|-----------|
| Non gagnée | Icône grise, transparente |
| En cours | Icône qui pulse/brille |
| Gagnée | Icône colorée + check ✓ |

### Avatar
- L'avatar du joueur (profil) monte la montagne
- Positionné à la dernière catégorie gagnée
- Animation de marche lors des transitions

### Indicateurs
- Nom du niveau en haut (ex: "Homer Simpson 🥨")
- Compteur "X/11 catégories"
- Couleur de fond selon le tier actuel

## 4. Modèle de Données

### Structure TypeScript
```typescript
interface AdventureProgress {
  odeur: AdventureTier;           // "homer" | "mario" | ...
  difficulty: Difficulty;          // "easy" | "medium" | "hard"
  completedCategories: string[];   // ["histoire", "science", ...]
}

type AdventureTier =
  | "homer"
  | "mario"
  | "sherlock"
  | "tony"
  | "gandalf"
  | "yoda"
  | "leonardo"
  | "einstein";
```

### Calcul de Position
```
position = (tierIndex × 33) + (difficultyIndex × 11) + completedCategories.length
```

### Récompenses
| Événement | Récompense |
|-----------|------------|
| Catégorie gagnée | +10 XP |
| Difficulté terminée | +50 XP + badge |
| Tier terminé | +200 XP + avatar spécial |
| Aventure complète | Titre "Einstein" + récompense exclusive |

## 5. Fichiers à Modifier

### Types
- `src/types/adventure.ts` - Nouveaux tiers et couleurs

### Composants
- `components/MountainProgress.tsx` - 11 icônes de catégories
- `components/CategoryWheel.tsx` - Filtrer catégories non gagnées
- `app/game/adventure/index.tsx` - Écran principal adapté
- `app/game/adventure/play.tsx` - Peu de changements

### Services
- `src/services/adventure.ts` - Nouveau format de progression

### Base de Données
- Migration Supabase pour `adventure_progress`
