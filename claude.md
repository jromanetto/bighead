# BIGHEAD - Instructions pour Claude

## IMPORTANT - Avant de commencer

**TOUJOURS vérifier que l'on travaille sur la dernière version disponible sur Git avant de commencer tout travail :**

```bash
cd /Users/julienromanetto/Mon\ Drive/script/bighead
git fetch origin
git status
git pull origin main
```

Si des modifications locales non commitées existent, les stash ou les commit avant de pull.

## Notes TypeScript

Les types Supabase générés ne contiennent pas toutes les tables et fonctions RPC. Utiliser :
- `@ts-ignore` avant les appels RPC non typés
- `as any` pour caster les résultats de `.from()` vers des tables non typées
- Type assertions `(data as any[])` pour accéder aux propriétés des retours RPC

## Structure du projet

- **apps/mobile/** - Application React Native/Expo principale
- **supabase/** - Backend (migrations, edge functions)
- **docs/** - Documentation et plans

## Problème connu - Chemin avec espaces

Le chemin du projet contient un espace ("Mon Drive"). Pour les builds iOS natifs, il faut :
1. Créer une copie dans `/tmp/bighead-copy/` pour le build
2. Ou utiliser un symlink sans espaces

## Commandes utiles

```bash
# Lancer sur iOS
cd apps/mobile && npx expo run:ios

# Lancer sur Android
cd apps/mobile && npx expo run:android

# Vérifier TypeScript
cd apps/mobile && npx tsc --noEmit

# Mettre à jour les types Supabase
npx supabase gen types typescript
```
