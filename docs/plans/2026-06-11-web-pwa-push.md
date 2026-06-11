# Web — PWA installable + Web Push (rétention)

Objectif : transformer play.bighead-quizz.com en app installable avec rappel
quotidien push — le pont vers l'habitude pour les joueurs web qui n'ont pas
(encore) téléchargé l'app mobile.

## Phase A — PWA installable

1. **Icônes réelles** : `apps/mobile/assets/icon.png` (1024², cerveau néon,
   full-bleed) → `public/logo192.png`, `logo512.png`, `apple-touch-icon.png`
   (180²). Les actuelles sont les logos React du scaffold TanStack.
2. **manifest.json réécrit** (l'actuel est le scaffold "Create TanStack App
   Sample", non linké) : name/short_name BIGHEAD, lang fr, display standalone,
   `start_url /play?utm_source=pwa` (attribution Umami), theme `#00c2cc`,
   background `#161a1d`, icons any+maskable.
3. **Service worker `public/sw.js`** (sans dépendance, conservateur) :
   - navigations : network-first, fallback `offline.html`
   - `/assets/*` (hashés, immutables) : cache-first
   - versioned cache + cleanup à `activate`
   - handlers `push`/`notificationclick` (prêts pour la phase B)
4. **`__root.tsx`** : link manifest + apple-touch-icon, meta
   `apple-mobile-web-app-*`, enregistrement SW en `useEffect` (PROD only).

## Phase B — Web push (rappel quotidien)

1. **VAPID keys** (`web-push generate-vapid-keys`) : pub → `.env` VPS
   (`VITE_VAPID_PUBLIC_KEY`), priv → secret edge function.
2. **Migration `web_push_subscriptions`** : user_id, endpoint UNIQUE, p256dh,
   auth, lang, created_at, last_notified_at. RLS own-rows.
3. **Web** : `lib/push.ts` (subscribe/unsubscribe/status, helper base64 testé)
   + toggle 🔔 « Rappel quotidien » sur le hub `/play`. i18n FR/EN.
4. **Sender** : edge function `send-web-push` (service-role intégré côté
   Supabase, lib webpush Deno/npm), gardée par `CRON_SECRET` — même pattern
   que `send-daily-notification`. Cron VPS 19h05 Paris. Purge des
   subscriptions 404/410.

## Risques / garde-fous

- SW : cache versionné + network-first sur le HTML → pas de stale app.
- E2E/CI : registration PROD only pour ne pas polluer dev/e2e.
- Si la lib web-push ne passe pas en edge runtime → fallback script node sur
  le VPS (service-role en .env chmod 600).

## Hypothèses

- L'opt-in notification se fait sur le hub /play (emplacement le plus vu),
  pas de prompt agressif au premier load.
- Message quotidien : « 🧠 Ton défi du jour t'attend ! » → /play/daily.
