# Session Handoff - 26 Janvier 2026

## Dernier commit

```
9ea8a7a Feat: Daily survival mode + 2200 new questions
```

Branche: `main` - synchronized with origin

## Modifications effectuées cette session

### 1. Daily Challenge → Mode Survie
- Une seule tentative par jour
- Questions illimitées (pas de limite)
- Une mauvaise réponse = game over
- Score = nombre de bonnes réponses consécutives

Fichiers modifiés:
- `apps/mobile/src/services/dailyChallenge.ts` - Nouvelles fonctions survie
- `apps/mobile/app/daily.tsx` - UI complète mode survie
- `supabase/migrations/20260126110000_daily_survival_results.sql` - Table scores

### 2. Ajout de 2200 nouvelles questions
- 100 questions par catégorie × 11 catégories × 2 langues (FR + EN)
- Difficultés distribuées de 1 à 5
- Pas de doublons

Catégories:
- Culture Générale, Histoire, Sport, Géographie, Cinéma
- Musique, Sciences, Littérature, Art, Jeux Vidéo, Technologie

Migrations appliquées:
- `20260126120000_add_2200_questions.sql` (Culture Générale + Histoire)
- `20260126120001_add_sport_questions.sql`
- `20260126120002_add_geographie_questions.sql`
- `20260126120003_add_cinema_questions.sql`
- `20260126120004_add_musique_questions.sql`
- `20260126120005_add_sciences_questions.sql`
- `20260126120006_add_litterature_questions.sql`
- `20260126120007_add_art_questions.sql`
- `20260126120008_add_jeux_video_questions.sql`
- `20260126120009_add_technologie_questions.sql`

## Build iOS en cours

**Build #8** - EAS Build
- **Status**: En attente dans la queue Free tier
- **Build ID**: `9fcdbe39-c320-4554-8e66-032d0e4a23f2`
- **URL**: https://expo.dev/accounts/jroma51/projects/bighead/builds/9fcdbe39-c320-4554-8e66-032d0e4a23f2

## Actions à faire

### 1. Vérifier le build
```bash
# Ouvrir l'URL du build pour voir le status
open https://expo.dev/accounts/jroma51/projects/bighead/builds/9fcdbe39-c320-4554-8e66-032d0e4a23f2
```

### 2. Si build réussi → Soumettre à TestFlight
```bash
cd apps/mobile
npx eas-cli submit --platform ios --latest
```

### 3. Si build échoué → Relancer
```bash
cd apps/mobile
npx eas-cli build --profile production --platform ios
```

## Configuration RevenueCat

La clé API RevenueCat est stockée dans **EAS Secrets** (pas dans .env local):
- Secret ID: `682221f3-2cf3-49bf-b70d-8987159edcb3`
- Le fichier `.env` local contient un placeholder
- Les builds utilisent la vraie clé via EAS Secrets

## Commandes utiles

```bash
# Pull les dernières modifications
cd /Users/julienromanetto/Mon\ Drive/script/bighead
git pull origin main

# Lancer en dev
cd apps/mobile && npx expo start

# Build iOS
cd apps/mobile && npx eas-cli build --profile production --platform ios

# Submit TestFlight
cd apps/mobile && npx eas-cli submit --platform ios --latest

# Vérifier TypeScript
cd apps/mobile && npx tsc --noEmit
```

## Notes techniques

- Le chemin contient un espace ("Mon Drive") - utiliser des guillemets ou escape
- TypeScript: certains types Supabase ne sont pas générés, utiliser `as any` si nécessaire
- Les migrations ont toutes été appliquées à Supabase
