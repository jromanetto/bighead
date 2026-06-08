# BIGHEAD Web — P4 Weekly Challenge

> subagent-driven. **Working dir:** `/Users/julienromanetto/dev/bighead/.worktrees/web/apps/web` (branch `web/p4-weekly`).

**Goal:** Weekly Challenge mode on web: list active weekly challenges, play through their questions sequentially with resume, show learning facts, completion + leaderboard. Mirrors the mobile backend exactly. (Tournaments DEFERRED — the only active tournament is date-expired and `join_tournament` rejects it; revisit when the cron creates a fresh one.)

## Verified backend (prod)
- `weekly_challenges` (rows): `id, theme_slug, theme_label_fr, theme_label_en, description_fr, description_en, emoji, color, target_category, start_date, end_date, status, total_questions, total_players, challenge_type ('news'|'themed')`. **Currently active (08–14 June)**: "This Week in News" (news, 15 Q, id `68062079-277b-4c16-90d2-52bc20243b17`) and "Belgium" (themed, 30 Q, id `115de93e-2dd0-43ea-8d6b-110d447de685`). Query active: `from('weekly_challenges').select('*').eq('status','active')` (RLS readable).
- `weekly_challenge_questions` (RLS SELECT public): `id, challenge_id, position (1-based), difficulty, question_fr, correct_answer_fr, wrong_answers_fr (text[]), learning_fact_fr, question_en, correct_answer_en, wrong_answers_en, learning_fact_en, image_url, image_credit`. Use the `_fr`/`_en` columns per current lang. `from('weekly_challenge_questions').select('*').eq('challenge_id',id).order('position')`.
- `weekly_challenge_progress` (RLS own insert/select/update): `current_position (starts 0), correct_count, daily_play_counts (jsonb), day_streak, completed_at, final_score, final_xp_awarded, badge_earned`. Read own: `.select('*').eq('challenge_id',id).eq('user_id',uid).maybeSingle()`.
- `submit_weekly_answer(p_challenge_id uuid, p_position int, p_is_correct bool) → jsonb`. **STRICT SEQUENTIAL**: requires `p_position === current_position + 1` (raises 'expected position X' otherwise). Auto-creates the progress row on first call. Updates current_position, correct_count, streak. Call it once per answered question, in order.
- `get_weekly_challenge_leaderboard(p_challenge_id uuid, p_limit int)` → verify return columns from `database.types.ts` (likely id/username/avatar/score/rank). 

## Reuse
`#/components/game/QuizCard`, `TimerRing`. `useSession()` (sessionReady, userId), `useLang()` (lang). `recordAnsweredQuestion()` per answered question. i18n strings.ts. canvas-confetti (SSR-safe pattern in ResultScreen). TanStack Query.

## Tasks

### Task 1 — Data layer `src/lib/game/weekly.ts` (+ TDD on pure bits)
- Types: `WeeklyChallenge`, `WeeklyQuestionRow`, `WeeklyProgress`, `WeeklyLeaderRow`.
- `getActiveChallenges(): Promise<WeeklyChallenge[]>`.
- `getChallengeQuestions(challengeId): Promise<WeeklyQuestionRow[]>` (ordered by position).
- `getMyProgress(challengeId): Promise<WeeklyProgress | null>`.
- `submitWeeklyAnswer(challengeId, position, isCorrect): Promise<unknown>` (rpc).
- `getWeeklyLeaderboard(challengeId, limit=100)`.
- `formatWeeklyQuestion(row, lang, rng=Math.random): GameQuestion & { learningFact: string|null }` — pick `_fr`/`_en` columns by lang, combine [correct, ...wrong], shuffle, correctIndex. Unit-test (set equality + answers[correctIndex]===correct, lang selection).
- `themeLabel(c, lang)` / `themeDescription(c, lang)` helpers.

### Task 2 — `/weekly` list (`src/routes/weekly.tsx` → layout `<Outlet/>` + `weekly.index.tsx`)
- Gate sessionReady. `useQuery(getActiveChallenges)`.
- Cards per active challenge: emoji + theme label (lang) + description + type badge (Actu/Thème) + total_questions + (if progress) "X/total". Click → `/weekly/$id`.
- Empty/loading/error. App CTA at bottom.

### Task 3 — `/weekly/$id` play + complete (`src/routes/weekly.$id.tsx`)
- Gate sessionReady+userId. Load challenge meta (from active list or a direct fetch), questions, my progress.
- **Resume**: start at `current_position` (0-based count of done) → next position to play is `current_position + 1` (1-based). If `current_position >= total_questions` or `completed_at` → **completed view** (final score / correct_count, leaderboard link, replay not needed).
- Play one question at a time (15s TimerRing, QuizCard via formatWeeklyQuestion). On answer: compute isCorrect, show feedback + **learning fact** (the `learning_fact` for that Q — nice educational beat), then `submitWeeklyAnswer(id, position(1-based), isCorrect)` (in strict order; on the 'expected position' error, refetch progress and resync — defensive). `recordAnsweredQuestion()`. Advance to next position. When all positions done → completed view.
- A small progress indicator (position / total). Guard against double-submit per position.
- Completed view: score, "Voir le classement" → leaderboard for this challenge (inline tab or link to `/leaderboard`?). Simplest: show top via `getWeeklyChallengeLeaderboard` inline. Confetti if perfect. App CTA.
- SSR-safe (no supabase/window in render).

### Verify / DoD
- `pnpm lint && pnpm exec tsc --noEmit && pnpm test && pnpm build` green; existing e2e green (anon rate-limit may affect gameplay e2e locally — environmental).
- Manual against prod (browser): `/weekly` lists News + Belgium; play a few questions of "This Week in News" → verify `weekly_challenge_progress` row advances (current_position increments) via SQL.
- Deploy: rsync → VPS build → `pm2 restart bighead-web`; verify `/weekly` live.

## Deferred
- **Tournaments** (no joinable active tournament currently). When a fresh one exists: `get_current_tournament`, `get_tournament_questions`, `join_tournament`, `submit_tournament_result`, `get_tournament_leaderboard`.
- Per-day play caps (weekly tracks daily_play_counts; if a hard cap surfaces as an error, handle gracefully).
- Duel friend-invite backend RPC.
