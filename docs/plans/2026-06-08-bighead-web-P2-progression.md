# BIGHEAD Web — P2 Progression + Acquisition Funnel

> **For Claude:** subagent-driven execution.

**Goal:** Turn the playable games into a funnel + progression: free-play gate (soft account prompt), persistent app-promo banner, account upgrade (anon→permanent), leaderboard, profile/XP page. Plus fix the question-language i18n.

**Working dir:** `/Users/julienromanetto/dev/bighead/.worktrees/web/apps/web` (branch `web/p2-progression`).

**Primary objective reminder:** the web app's #1 job is to drive **mobile app installs**. Everything stays fully playable on web (no feature locked behind install); the funnel is via non-blocking CTAs at dopamine moments.

## Verified backend (prod `dqhhpoxqrtlmhosrsdxp`)
- `users` (public SELECT "Public profiles viewable by everyone"; own INSERT/UPDATE): `id, email, username, avatar_url, total_xp, level, games_played, games_won, best_chain, daily_streak, perfect_games, is_premium, referral_code, ...`. **Every anon user already has a `users` row** (auto-created). Defaults 0.
- Leaderboard RPCs: `get_weekly_leaderboard(limit_count int)` → `(id, username, avatar_url, weekly_xp bigint, weekly_games bigint, best_chain int, rank bigint)`; `get_daily_survival_leaderboard(p_limit int)` → `(rank, user_id, username, avatar_url, score, time_ms)`.
- `user_achievements` (own INSERT, view all SELECT) + `achievements` (definitions).
- Auth: anon session via cookies (already). Upgrade anon→permanent: `supabase.auth.updateUser({ email, password })` (Supabase converts the anonymous user; email confirmation may apply per project settings). Username set via `users` UPDATE.

## Tasks

### Task 1 — i18n question language fix
The question language must follow the **currently selected** lang. Today chain/daily call `get*Questions(lang)` where `lang` comes from `useLang()`, but SSR default ('fr') vs client toggle can mismatch and questions don't refetch on toggle. Fix: ensure the games fetch using the resolved client language, and if the user changes language mid-hub it's respected on game start. Keep it simple — at minimum guarantee chain & daily use the same `lang` the UI shows. Add/adjust a small test if practical.

### Task 2 — Free-play gate + AccountPrompt + AppPromoBanner (the funnel)
- **Counter**: a small module `src/lib/funnel/freePlay.ts` — `recordAnsweredQuestion()` increments a localStorage counter (`bh_answered`), `getAnsweredCount()`, and `shouldPrompt()` returns true when count crosses 20 then 50 (track which thresholds already shown via localStorage `bh_prompted`). SSR-safe (guard window). Pure-ish; unit-test the threshold logic with an injected storage.
- Call `recordAnsweredQuestion()` once per answered question in `chainStore.answer` and `play.daily.tsx` handleAnswer (only on real answers, incl. timeouts? count only actual answers — your call, document it).
- **`AccountPrompt.tsx`** (modal, dismissable): headline "Sauvegarde ta progression", two paths — (a) **Create account** (email+password form → `supabase.auth.updateUser({email,password})`; on success show confirmation, keep same user id; handle/ display errors); (b) **Download the app** (the mobile CTA, highlighted). Closing = keep playing. Trigger it from the game/result screens when `shouldPrompt()` (non-blocking; never mid-question — show at ResultScreen or between questions).
- **`AppPromoBanner.tsx`**: slim persistent top-or-bottom banner ("Joue partout — télécharge l'app") with App Store / Play Store buttons + dismiss (persist dismissed in localStorage). Mount in `AppShell` so it's app-wide but not on every render after dismiss. Non-blocking.
- Store links: use constants in `src/lib/funnel/appLinks.ts` (`APP_STORE_URL`, `PLAY_STORE_URL`) — placeholders `#` for now with a TODO; the iOS app exists (App Store Connect id 6758253365) but confirm public URL before hardcoding — leave `#` + TODO if unsure.

### Task 3 — `/auth` route (minimal)
A simple page with email+password to **upgrade the current anon account** (and a note that progress is kept). Reuse the AccountPrompt's create-account logic. Also a "already have an account? sign in" → `signInWithPassword` (replaces the anon session). Keep minimal, tokens-styled, i18n.

### Task 4 — `/leaderboard`
- Tabs: **Weekly** (`get_weekly_leaderboard(100)`) and **All-time** (select from `users` order by `total_xp desc limit 100`, public read). Show rank, username (fallback "Joueur anonyme" when null/empty), XP, best chain. Highlight the current user's row if present. TanStack Query for fetching. Loading/empty/error states. Non-blocking app CTA at the bottom ("vois ton vrai classement dans l'app").

### Task 5 — `/profile`
- Read current user's `users` row (own SELECT) → level, total_xp, games_played, games_won, best_chain, daily_streak, perfect_games. Show an XP/level bar.
- `user_achievements` joined with `achievements` (unlocked list) — show unlocked; optionally count locked.
- Recent `game_results` (own, last ~10).
- If the user is anonymous (`supabase.auth.getUser()` → `is_anonymous`), show a prominent "Crée un compte pour sauvegarder" CTA (opens AccountPrompt / links /auth). Allow setting **username** (users UPDATE) — small inline form.

### Verify / DoD
- `pnpm lint && pnpm exec tsc --noEmit && pnpm test && pnpm build` green; existing e2e green; add an e2e that the AppPromoBanner renders and the leaderboard page loads rows.
- Manual against prod: load `/leaderboard` (rows render), `/profile` (own stats), trigger AccountPrompt by setting the counter; verify no SSR 500s (all supabase/window calls in effects/handlers, not render).
- Deploy: rsync → VPS build → `pm2 restart bighead-web`; verify the new routes live over HTTPS.

## Deferred to P3+
Real duels, tournaments, weekly challenge, real store URLs / Smart App Banner meta, streak bonus, avatar upload, OAuth sign-in.
