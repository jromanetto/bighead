# BIGHEAD Web — P3 Async Duels

> subagent-driven execution.

**Goal:** Async 1v1 duels on web against the shared player pool: quick-duel (random opponent), inbox with buckets, 10-question play reusing the quiz UI, batch submit, result/waiting screen. Mirrors the mobile async-duel backend contract exactly.

**Working dir:** `/Users/julienromanetto/dev/bighead/.worktrees/web/apps/web` (branch `web/p3-duels`).

## Verified backend contract (prod, all SECURITY DEFINER, use `auth.uid()`)
- **Create**: `create_async_duel(p_guest_id uuid|null, p_category text|null, p_language text) → duel_id uuid`. `p_guest_id=null` → **random opponent** (real user within level band ±5, widen ±10; raises 'no opponent available' if none). Snapshots 10 questions into `duels.questions_payload`, expires 48h. Host = `auth.uid()`.
- **Load duel**: `from('duels').select('*').eq('id', duelId).single()` (RLS: participants only). `questions_payload` jsonb = array of `{ id, question_text, correct_answer, wrong_answers: string[], image_url, explanation, player_name }` (10 items). Also has `host_id, guest_id, status, host_score, guest_score, host_played_at, guest_played_at, host_answers, guest_answers, winner_id, category, language, expires_at`.
- **Submit**: `submit_async_duel_play(p_duel_id uuid, p_answers jsonb, p_total_time_ms int) → { status, my_score, opponent_score|null, winner_id|null }`. `p_answers` = array of `{ question_id: string, position: number(0-9), answer_idx: number(0-3, or -1 timeout), is_correct: boolean, time_ms: number }`. Server counts `is_correct` (trusts client). Status after: `awaiting_opponent` (only you played) or `completed` (both). XP server-side: winner 50, draw 30, loser 25.
- **Inbox**: `get_my_duels() → [{ duel_id, my_role:'host'|'guest', opponent_id, opponent_username, opponent_avatar, category, status:'pending'|'awaiting_opponent'|'completed'|'expired', my_played_at, opponent_played_at, my_score, opponent_score, winner_id, expires_at, created_at }]`. opponent_score hidden (null) until completed.
- **Bucket logic** (replicate exactly): `expired→'expired'`; `completed→'finished'`; else `my_played_at ? 'waiting' : 'my_turn'`.
- Constants: 10 rounds, 15s/question, timeout → `answer_idx:-1, is_correct:false`. Score = correct count. Tie-break: lower total_time_ms; equal → draw (winner null).

## Reuse
`#/components/game/QuizCard`, `TimerRing`. Session/lang: `useSession()` (sessionReady, userId), `useLang()`. Anonymous users are valid participants (they have a user id). i18n via strings.ts.

## Tasks

### Task 1 — Duel data layer `src/lib/game/duels.ts`
Types: `DuelQuestion` (payload item), `DuelInboxItem`, `DuelBucket`, `DuelPlayResult`. Functions:
- `createQuickDuel(category: string | null, language): Promise<string>` → rpc `create_async_duel` ({p_guest_id:null, p_category:category, p_language}), return duel_id. Surface a typed error for 'no opponent available'.
- `getDuel(duelId): Promise<DuelRow>` → select * from duels by id (RLS participant). Parse `questions_payload` → `DuelQuestion[]`.
- `submitDuelPlay(duelId, answers: DuelAnswer[], totalMs): Promise<DuelPlayResult>` → rpc.
- `getMyDuels(): Promise<DuelInboxItem[]>` → rpc.
- `categorizeDuel(item): DuelBucket` (pure, unit-tested: expired/completed/my_played_at branches).
- `formatDuelQuestion(payloadItem, rng=Math.random)` → reuse the shuffle→{answers, correctIndex} shape like `formatQuestion` (so QuizCard works). Unit-test it.
TDD on the pure bits (categorizeDuel, formatDuelQuestion).

### Task 2 — `/duels` inbox (`src/routes/duels.tsx`, replace placeholder)
- Gate on `sessionReady`. TanStack Query `getMyDuels()`.
- "Nouveau duel" button → small category chooser (the known categories + "Aléatoire"=null) → `createQuickDuel` → navigate to `/duels/$id`. Handle 'no opponent available' gracefully.
- Buckets sections in order: **À toi de jouer** (my_turn), **En attente** (waiting), **Terminés** (finished); collapse/hide empty; show expired subtly. Each item: opponent name (fallback "Joueur anonyme"), category, status, scores when finished, result (Gagné/Perdu/Nul vs winner_id===userId). Click my_turn → play; click finished → result view.
- Empty state (no duels) with a CTA to start one. Non-blocking app CTA at bottom.
- Loading/error states.

### Task 3 — `/duels/$id` play + result (`src/routes/duels.$id.tsx`)
- Gate on sessionReady. `getDuel(id)`.
- Determine my role (host/guest via userId vs host_id/guest_id) and whether I've already played (host_played_at/guest_played_at for my role) → if already played or status completed → show **result view** (my_score vs opponent_score if completed, else "En attente de l'adversaire" + the duel is awaiting). 
- Else **play**: 10 questions from questions_payload via `formatDuelQuestion`, 15s each (TimerRing), QuizCard feedback, accumulate `DuelAnswer[]` ({question_id, position, answer_idx, is_correct, time_ms}); timeout → answer_idx -1. After Q10 → `submitDuelPlay(id, answers, totalMs)` → result view from the returned {status, my_score, opponent_score, winner_id}. Guard double-submit.
- Result view: scores, Gagné/Perdu/Nul (confetti on win), "Retour aux duels" link, non-blocking app CTA. If awaiting_opponent: "Tu as fait X/10 — en attente de l'adversaire".
- Count answered questions toward the free-play funnel counter (`recordAnsweredQuestion`) like the other modes.

### Verify / DoD
- `pnpm lint && pnpm exec tsc --noEmit && pnpm test && pnpm build` green; existing e2e green (note: anon sign-in rate-limit may affect gameplay e2e locally — that's environmental).
- Manual against prod (browser or careful curl): `/duels` loads (inbox or empty), creating a quick duel works (an opponent is found in the pool), playing 10 + submitting writes to `duels` (verify via SQL: a row with your host_answers + host_played_at), result shows. Guard SSR (no supabase/window in render).
- Deploy: rsync → VPS build → `pm2 restart bighead-web`; verify `/duels` + a created duel live.

## Deferred
- **Friend-invite-by-link** (`/invite/duel/$id` claim): the async backend does random matchmaking or explicit `p_guest_id`; there's no open-duel-claim RPC. Needs a backend RPC (e.g. `claim_open_duel(duel_id, guest_id)`) before web can support "invite a specific friend by link". Flag for backend work. For now the deep-link bridge route can show the duel result/landing if the viewer is a participant, else a "download the app / play a quick duel" funnel page.
- Tournaments, weekly challenge (P4).
