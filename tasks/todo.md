# Growth batch — Activation & Rétention (OTA)

Branche: `growth/activation-retention-batch`
Contexte: mobile réel = 30 installs, 8 MAU, 3 WAU, 0 streak≥3. Funnel install→partie→J7 cassé + zéro analytics.

## Fixes (tous OTA sauf PostHog)
- [ ] #1 Streak visible aux users anonymes — `app/(tabs)/index.tsx:103` (retirer `!isAnonymous`)
- [ ] #2 Brancher l'écran invite — CTA dans `app/(tabs)/profile.tsx` → `/invite`
- [ ] #3 Notif : (a) plus de demande de permission à froid au lancement (`NotificationContext`),
      (b) programmer le rappel local 19h quand on active depuis settings,
      (c) soft-prompt à la 2e session depuis Home
- [ ] #4 Réactiver l'onboarding — gate dans `app/(tabs)/_layout.tsx` (username + code parrain)
- [ ] #5 Vrai compte à rebours daily — `index.tsx:78` (remplacer "12m" hardcodé)
- [ ] #6 Funnel logging — policy RLS insert `activity_events` + `src/services/analytics.ts`
      events: app_open, onboarding_completed, referral_shared, notif_permission_{granted,denied}
- [ ] #7 PostHog propre — NÉCESSITE rebuild EAS (fast-follow, pas dans cette OTA)

## Vérif avant OTA
- [ ] `npm test` vert (+ test util countdown)
- [ ] `npx tsc --noEmit` vert
- [ ] diff relu par Julien
