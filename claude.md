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

## EAS Update (OTA - Over The Air)

**Pour les bug fixes rapides sans rebuild complet :**

```bash
# Fix le bug dans le code, puis :
eas update --channel production
# 30 secondes plus tard, relancer l'app → le fix est live
```

**Ce qu'on peut updater instantanément :**
- Bug fixes en JavaScript
- Tweaks UI et styling
- Changements de logique
- Updates d'endpoints API

**Ce qui nécessite toujours un build complet :**
- Changements de dépendances natives
- Modifications de code natif

**Installation (si pas déjà fait) :**
```bash
npx expo install expo-updates
```

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

# EAS Update (OTA rapide)
cd apps/mobile && eas update --channel production

# EAS Build complet
cd apps/mobile && eas build --profile production --platform ios

# Soumettre à TestFlight
cd apps/mobile && eas submit --platform ios --latest
```

## VPS - Site Marketing & Notifications

**Connexion:**
```bash
ssh cursor@77.87.110.100
```

**Répertoire de travail:** `/home/script/bighead/`

### Site Marketing

**URL:** https://bighead.jrmanagement.org

| Page | URL |
|------|-----|
| Landing | https://bighead.jrmanagement.org/ |
| Privacy Policy | https://bighead.jrmanagement.org/privacy.html |
| Terms of Service | https://bighead.jrmanagement.org/terms.html |

**Fichiers sur le VPS:**
```
/home/script/bighead/
├── index.html                    # Landing page
├── privacy.html                  # Politique de confidentialité
├── terms.html                    # Conditions d'utilisation
└── send-daily-notification.sh    # Script cron notifications
```

**Config Nginx:** `/etc/nginx/sites-enabled/bighead.jrmanagement.org`

### Notifications Push (Cron)

**Cron configuré:** `0 19 * * *` (tous les jours à 19h Paris)

**Script:** `/home/script/bighead/send-daily-notification.sh`

**Prérequis:**
1. Déployer l'Edge Function:
   ```bash
   supabase functions deploy send-daily-notification
   ```

2. Configurer le secret sur le VPS:
   ```bash
   ssh cursor@77.87.110.100
   echo 'export BIGHEAD_CRON_SECRET="<secret>"' >> ~/.bashrc
   source ~/.bashrc
   ```

3. Ajouter `CRON_SECRET` dans Supabase Dashboard → Edge Functions → Secrets

### Edge Functions disponibles

| Fonction | Description |
|----------|-------------|
| `send-daily-notification` | Envoie la question du jour à tous les users avec push token |
| `send-push` | Fonction générique pour envoyer des push (duels, tournois, etc.) |

**Templates send-push:** `duel_invite`, `duel_accepted`, `tournament_start`, `achievement`, `level_up`, `streak_reminder`

### Commandes VPS utiles

```bash
# Se connecter
ssh cursor@77.87.110.100

# Voir les crons
crontab -l

# Voir les logs notifications
tail -f /home/script/bighead/notifications.log

# Tester le script manuellement
BIGHEAD_CRON_SECRET="xxx" /home/script/bighead/send-daily-notification.sh

# Recharger nginx après modif
sudo nginx -t && sudo systemctl reload nginx
```
