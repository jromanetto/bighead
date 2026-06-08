# BIGHEAD Web — P1 Gameplay (Chain Reaction + Daily Brain)

> **For Claude:** REQUIRED SUB-SKILL: superpowers:executing-plans / subagent-driven-development.

**Goal:** Two playable solo modes on web — Chain Reaction (endless) and Daily Brain (5/day) — faithfully replicating the mobile backend contract, with animated quiz UI (Framer Motion), client scoring, and result/XP writes to the shared prod Supabase.

**Working dir:** `/Users/julienromanetto/dev/bighead/.worktrees/web/apps/web` (branch `web/p1-gameplay`).

**Stack:** existing scaffold + add `framer-motion`, `zustand`, `canvas-confetti`. Calls go through the **browser** Supabase client (`getBrowserClient()`) using the anon-authed cookie session, wrapped in TanStack Query where it helps.

## Backend contract (verified against prod `dqhhpoxqrtlmhosrsdxp`, all SECURITY DEFINER)

- `get_unseen_questions(p_user_id uuid, p_category text, p_limit int, p_language text)` → rows: `id, question_text, correct_answer, wrong_answers text[], category, difficulty int, image_url, image_credit`. Web always has an anon user → always pass the user id; `p_category = null`, `p_limit = 10`.
- `mark_question_seen(p_user_id uuid, p_question_id uuid, p_was_correct boolean)` → void. Fire-and-forget per answered question.
- `get_or_create_daily_questions_v2(target_date date, p_language text)` → 5 rows: `out_id, out_position, out_date, out_question_id, out_question_text, out_category, out_difficulty, out_correct_answer, out_options jsonb ([correct, w1, w2, w3]), out_image_url`.
- `award_xp(p_user_id uuid, p_amount int, p_source text, p_metadata jsonb, p_dedupe_key text)` → int new total. 
- Tables: `game_results { user_id, mode, score, correct_count, total_questions, max_chain, duration_seconds }`; `daily_survival_results { user_id, date, score, time_ms }` UNIQUE(user_id, date).

Languages: `fr` / `en` (use current i18n lang). 36k questions exist.

## Scoring (replicate mobile exactly)

```
getBasePoints(difficulty): 1→100, 2→150, 3→200, else 100
getChainMultiplier(chain): chain>=10→10, >=8→8, >=5→5, >=3→3, >=2→2, else 1
timePerQuestion = 15 (s), both modes. Timeout = wrong (chain resets, 0 pts).
Chain points (if correct):
  newChain = chain + 1
  mult = getChainMultiplier(newChain)
  timeBonus = max(0, 1 - answerMs/(15*1000)) * 0.5
  points = round(getBasePoints(difficulty) * mult * (1 + timeBonus))
Daily score: +1 per correct (max 5). perfect = 5/5.
```

XP: chain → `round(score*0.1 + correctCount*10)`, source `'chain_solo'`, dedupe `chain_<endEpochPassedIn>`. daily → `correctCount*15 + (perfect?100:0)`, source `'daily'`, dedupe `daily_brain_<isoDate>`. (Streak bonus deferred — `get_daily_streak` RPC absent.)

> Note: scripts can't use Date.now(); pass timestamps/epoch into pure fns as params. In the app, real `Date.now()`/`performance.now()` are fine (browser runtime, not workflow scripts).

---

## Task 1 — Scoring (pure, TDD)
**Files:** `src/lib/game/scoring.ts` (+ `.test.ts`).
Pure functions: `getBasePoints(difficulty)`, `getChainMultiplier(chain)`, `computeChainPoints({difficulty, chain, answerMs, timePerQuestionMs})` returning `{ points, newChain, multiplier }`. Write tests FIRST covering: each difficulty, each multiplier threshold (1/2/3/5/8/10), timeBonus extremes (instant ≈+50%, at-limit →+0%), wrong answer (0 pts, chain 0), the worked example (diff2, 5s of 15s, chain5 → 875). TDD: red → green → commit.

## Task 2 — Data access layer
**Files:** `src/lib/game/questions.ts`, `daily.ts`, `results.ts` (+ light tests for the pure `formatQuestion`/`formatDaily` shufflers).
- `formatQuestion(row)`: `[correct, ...wrong_answers]` shuffled → `{ id, category, difficulty, question, answers[4], correctIndex, imageUrl }`. (Same for daily via `out_options` jsonb.)
- `getUnseenQuestions(limit, language)`: `getBrowserClient().rpc('get_unseen_questions', { p_user_id, p_category: null, p_limit: limit, p_language })` (read user id from `auth.getUser()`), map via formatQuestion.
- `markQuestionSeen(questionId, wasCorrect)`: rpc fire-and-forget.
- `getDailyQuestions(language)`, `hasPlayedToday()` (select from daily_survival_results by user+today), `submitDailyResult(score, timeMs)` (insert), in `daily.ts`.
- `saveGameResult({mode,score,correctCount,totalQuestions,maxChain,durationSeconds})` insert; `awardXp(amount, source, metadata, dedupeKey)` rpc — in `results.ts`.
- TDD only on the pure formatters (shuffle determinism via injected RNG or assert set-equality + correctIndex correctness). Network wrappers: thin, typed, no test needed beyond type-check.
**Deps:** `pnpm add zustand` (chain round state).

## Task 3 — Quiz UI components (Framer Motion)
**Files:** `src/components/game/QuizCard.tsx`, `TimerRing.tsx`, `ChainMeter.tsx`, `ResultScreen.tsx`. `pnpm add framer-motion canvas-confetti` (+ `@types/canvas-confetti` -D).
- `QuizCard`: question text (+ optional image), 4 answer buttons A–D; props `onAnswer(index)`, disabled after pick; animate selected (correct→green, wrong→red) + reveal correct; Framer Motion enter/exit.
- `TimerRing`: SVG circular countdown, props `seconds`, `total`, animated stroke; turns error color near 0.
- `ChainMeter`: current chain + multiplier, pop animation on increase.
- `ResultScreen`: score / correct / total / maxChain / perfect badge; `canvas-confetti` on perfect; **non-blocking install CTA** (App Store + Play Store buttons placeholder links) + "Rejouer" + back to `/play`. Tokens-styled.
No network here; pure presentational. Light render test optional.

## Task 4 — Chain Reaction screen
**Files:** `src/routes/play.chain.tsx`, `src/lib/game/chainStore.ts` (zustand).
- Store: questions[], index, chain, maxChain, score, correctCount, status, timer; actions `start`, `answer(index)` (uses scoring + mark_question_seen), `tick`, `next`, prefetch more when running low (<3 left, call getUnseenQuestions again, append, dedupe by id).
- Screen: 15s `TimerRing`, `QuizCard`, `ChainMeter`, live score. On answer: feedback 800–1200ms then advance. Endless until timeout/wrong? — Mobile chain is endless; ends when the player chooses to stop OR per mobile it continues; for web v1: endless run, a "Terminer" button to end; on end → write `game_results` (mode `chain_solo`) + `awardXp` + show `ResultScreen`. (If mobile ends on first wrong, mirror that — but extraction shows wrong just resets chain and continues; keep endless with explicit end + also end after a wrong answer? Default: continue on wrong, reset chain. Provide a "Terminer la partie" CTA.)
- Verify against real prod (anon session) that questions load and results persist.

## Task 5 — Daily Brain screen
**Files:** `src/routes/play.daily.tsx`.
- On load: `hasPlayedToday()` → if played, show "déjà joué aujourd'hui" + previous score + back. Else `getDailyQuestions(lang)` (5).
- Play 5 Q, 15s each, +1/correct, feedback 1200ms. On finish: `submitDailyResult(score, totalMs)` + `awardXp(correct*15 + perfect?100:0, 'daily', {...}, 'daily_brain_<iso>')` + `ResultScreen` (perfect confetti).
- Guard double-submit.

## Task 6 — Hub wiring + polish
**Files:** `src/routes/play.tsx` (or `play.index`).
- `/play` hub: cards linking Chain Reaction + Daily Brain (with today's status), tokens-styled, brief copy. Keep Duels/Leaderboard as "bientôt".
- Update i18n strings used.

## Verify / DoD
- `pnpm lint && pnpm exec tsc --noEmit && pnpm test && pnpm build` all green; Playwright smoke still green (add 1 e2e: load `/play/chain`, answer a question, score increments).
- Manual against prod: play a Chain round + a Daily run as the anon user; confirm `game_results` / `daily_survival_results` rows appear (verify via SQL) and XP increments.
- Deploy: rsync → VPS build → `pm2 restart bighead-web`; verify on `https://play.bighead-quizz.com/play/chain` and `/play/daily`.

## Deferred to P2
Free-play gate (20 Q) + AccountPrompt + AppPromoBanner everywhere, leaderboard, profile/XP page, streak bonus, real store links/Smart App Banner.
