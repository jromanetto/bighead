# BIGHEAD Web — P0 Scaffold Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Stand up the `apps/web` TanStack Start app with Tailwind (mobile tokens), Supabase SSR client with silent anonymous auth, generated DB types, base layout/nav, FR/EN i18n, and a deployed `play.bighead-quizz.com` reachable over HTTPS with CI.

**Architecture:** New `apps/web` package inside the existing `bighead` monorepo. TanStack Start (Vite + Nitro) for SSR + file routes + server functions. Auth via `@supabase/ssr` with cookie-based sessions; on first load the server ensures an anonymous Supabase session so users play immediately. The web reuses the prod Supabase backend (project `dqhhpoxqrtlmhosrsdxp`) and calls the same RPCs as mobile. Deployed as a Node process on the existing VPS behind nginx.

**Tech Stack:** TanStack Start, TanStack Query, `@supabase/supabase-js` + `@supabase/ssr`, Tailwind, Framer Motion, Vitest, Playwright. Node 20+, pnpm.

**Working dir:** `/Users/julienromanetto/dev/bighead/.worktrees/web` (branch `web/v1-scaffold`).

**Reference docs:**
- TanStack Start: https://tanstack.com/start/latest
- Supabase + TanStack Start quickstart: https://supabase.com/docs/guides/getting-started/quickstarts/tanstack
- Design doc: `docs/plans/2026-06-08-bighead-web-design.md`

**Prod backend (already exists, do NOT recreate):**
- `SUPABASE_URL = https://dqhhpoxqrtlmhosrsdxp.supabase.co`
- `SUPABASE_PUBLISHABLE_KEY = sb_publishable_qUEpzxNw_Sn8CGk3EiIaXw_lJiio6rt`

**Design tokens (from mobile):** primary `#00c2cc`, bg `#161a1d`, surface `#1E2529`, success `#22c55e`, error `#ef4444`, accent `#d946ef` / `#A16EFF`.

---

## Task 1: Scaffold the TanStack Start app

**Files:**
- Create: `apps/web/` (whole app via CLI)

**Step 1: Scaffold**

Run from `apps/`:
```bash
cd /Users/julienromanetto/dev/bighead/.worktrees/web/apps
npx @tanstack/cli@latest create web --template start --add-ons tailwind,eslint --package-manager pnpm
```
If the CLI is interactive, pick: React, TanStack Start, Tailwind, ESLint, pnpm.

**Step 2: Install & verify dev boot**

```bash
cd web && pnpm install && pnpm dev
```
Expected: dev server boots on `http://localhost:3000` with the starter page. Ctrl-C.

**Step 3: Commit**

```bash
git add apps/web && git commit -m "chore(web): scaffold TanStack Start app"
```

---

## Task 2: Wire env + Supabase config

**Files:**
- Create: `apps/web/.env.example`
- Create: `apps/web/.env` (gitignored)
- Modify: root `.gitignore` (ensure `apps/web/.env` ignored)

**Step 1:** Write `apps/web/.env.example`:
```
VITE_SUPABASE_URL=https://dqhhpoxqrtlmhosrsdxp.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

**Step 2:** Copy to `.env` with the real publishable key (value from design doc). Confirm `apps/web/.env` is gitignored (`git status` must NOT list it).

**Step 3: Commit**
```bash
git add apps/web/.env.example .gitignore && git commit -m "chore(web): env config for Supabase"
```

---

## Task 3: Generate Supabase types (shared)

**Files:**
- Create: `apps/web/src/lib/database.types.ts`

**Step 1:** Generate from prod project:
```bash
cd /Users/julienromanetto/dev/bighead/.worktrees/web
npx supabase gen types typescript --project-id dqhhpoxqrtlmhosrsdxp > apps/web/src/lib/database.types.ts
```
(If auth needed, `npx supabase login` first.) Expected: a `Database` type exported, non-empty file.

**Step 2:** `cd apps/web && pnpm exec tsc --noEmit` → no errors from the types file.

**Step 3: Commit**
```bash
git add apps/web/src/lib/database.types.ts && git commit -m "chore(web): generate Supabase DB types"
```

---

## Task 4: Supabase server + browser clients (cookie SSR)

**Files:**
- Create: `apps/web/src/lib/supabase/server.ts`
- Create: `apps/web/src/lib/supabase/client.ts`
- Test: `apps/web/src/lib/supabase/client.test.ts`

**Step 1: Write failing test** (`client.test.ts`): assert `createBrowserClient` factory returns an object with `.auth` and `.from`.
```ts
import { describe, it, expect } from 'vitest'
import { getBrowserClient } from './client'
describe('browser supabase client', () => {
  it('exposes auth and from', () => {
    const c = getBrowserClient()
    expect(c.auth).toBeDefined()
    expect(typeof c.from).toBe('function')
  })
})
```

**Step 2:** Run `pnpm exec vitest run src/lib/supabase/client.test.ts` → FAIL (module not found).

**Step 3:** Implement `client.ts` using `createBrowserClient` from `@supabase/ssr` (singleton, reads `import.meta.env.VITE_SUPABASE_URL` + publishable key). Implement `server.ts` using `createServerClient` reading/writing cookies from the TanStack Start request (per Supabase TanStack quickstart). Install deps: `pnpm add @supabase/supabase-js @supabase/ssr`.

**Step 4:** Run the test → PASS.

**Step 5: Commit**
```bash
git add apps/web/src/lib/supabase package.json pnpm-lock.yaml && git commit -m "feat(web): Supabase SSR server + browser clients"
```

---

## Task 5: Silent anonymous auth on first load

**Files:**
- Create: `apps/web/src/lib/auth/ensure-session.ts` (server fn)
- Modify: `apps/web/src/routes/__root.tsx` (call ensureSession in root loader/beforeLoad)
- Test: `apps/web/src/lib/auth/ensure-session.test.ts`

**Step 1: Write failing test:** mock the server supabase client; assert `ensureSession` calls `auth.getUser()` and, when no user, `auth.signInAnonymously()`; when a user exists, does NOT sign in again.

**Step 2:** Run vitest → FAIL.

**Step 3:** Implement `ensureSession` as a `createServerFn`: get cookie session → if no user, `signInAnonymously()` (cookies written by server client) → return the user. Call it from `__root.tsx` `beforeLoad` so every page has a session.

**Step 4:** Run test → PASS.

**Step 5: Manual check:** `pnpm dev`, open `localhost:3000`, in devtools confirm a Supabase auth cookie is set and `auth.getUser()` returns an anonymous user (`is_anonymous: true`).

**Step 6: Commit**
```bash
git add apps/web/src/lib/auth apps/web/src/routes/__root.tsx && git commit -m "feat(web): silent anonymous auth on first load"
```

---

## Task 6: Tailwind tokens + base theme

**Files:**
- Modify: `apps/web/tailwind.config.{js,ts}` (or `@theme` in CSS for Tailwind v4)
- Modify: `apps/web/src/styles.css`

**Step 1:** Add the mobile color tokens as Tailwind theme colors (`primary`, `bg`, `surface`, `success`, `error`, `accent`, `accent2`). Set dark background `#161a1d` + light text as the default body style.

**Step 2: Manual check:** add a temporary `<div className="bg-primary text-bg p-4">` to the index route, `pnpm dev`, verify cyan `#00c2cc` renders. Remove the temp div.

**Step 3: Commit**
```bash
git add apps/web/tailwind.config.* apps/web/src/styles.css && git commit -m "feat(web): Tailwind theme with BIGHEAD tokens"
```

---

## Task 7: Base layout + nav + i18n provider

**Files:**
- Create: `apps/web/src/components/AppShell.tsx`
- Create: `apps/web/src/lib/i18n/LangProvider.tsx`
- Create: `apps/web/src/lib/i18n/strings.ts` (minimal FR/EN keys for nav/shell; full reuse of mobile `translations.ts` deferred to feature phases)
- Modify: `apps/web/src/routes/__root.tsx` (wrap in providers + shell)
- Test: `apps/web/src/lib/i18n/i18n.test.ts`

**Step 1: Write failing test:** `t('nav.play', 'fr')` returns French string, `t('nav.play', 'en')` returns English; unknown key returns the key.

**Step 2:** vitest → FAIL.

**Step 3:** Implement minimal `strings.ts` (`{ 'nav.play': { fr, en }, ... }`), `t(key, lang)` helper, `LangProvider` (detects `navigator.language`, defaults `fr`, persists choice). Build `AppShell` with top nav (Play / Duels / Leaderboard / Profile placeholders) using tokens. Wrap root.

**Step 4:** vitest → PASS.

**Step 5: Commit**
```bash
git add apps/web/src/components/AppShell.tsx apps/web/src/lib/i18n apps/web/src/routes/__root.tsx && git commit -m "feat(web): app shell, nav, i18n provider"
```

---

## Task 8: Smoke test infra (Vitest + Playwright)

**Files:**
- Modify: `apps/web/package.json` (scripts: `test`, `test:e2e`)
- Create: `apps/web/playwright.config.ts`
- Create: `apps/web/e2e/smoke.spec.ts`

**Step 1: Write failing E2E:** `smoke.spec.ts` — load `/`, expect the page title / a nav element to be visible, and assert an anonymous Supabase cookie exists after load.

**Step 2:** `pnpm add -D @playwright/test && pnpm exec playwright install chromium`. Run `pnpm test:e2e` → FAIL if anything broken; iterate until PASS against `pnpm dev`/preview server (configure `webServer` in playwright config to run `pnpm build && pnpm preview` or `pnpm dev`).

**Step 3:** Ensure `pnpm test` (vitest) and `pnpm test:e2e` both green. `pnpm build` succeeds.

**Step 4: Commit**
```bash
git add apps/web/package.json apps/web/playwright.config.ts apps/web/e2e && git commit -m "test(web): vitest + playwright smoke infra"
```

---

## Task 9: Deploy infra — DNS, nginx, systemd, HTTPS

> Infra task (no TDD). Verify each step's output before moving on.

**Step 1: DNS A record** for `play.bighead-quizz.com` → VPS:
```bash
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/044376fb05f97c3113312885ce648966/dns_records" \
 -H "Authorization: Bearer $CF_DNS_TOKEN" \   # cfut_ token from ~/.claude/CLAUDE.md (do NOT commit the literal token)
 -H "Content-Type: application/json" \
 --data '{"type":"A","name":"play","content":"77.87.110.100","ttl":1,"proxied":false}'
```
Expected: `"success": true`. Verify: `dig +short play.bighead-quizz.com @1.1.1.1` → `77.87.110.100`.

**Step 2: Deploy build to VPS.** Build locally (`pnpm build` → `.output/`), rsync to `/home/script/bighead-web/` on `cursor@77.87.110.100`. (CI will automate this in Task 10; do it manually once to validate.)

**Step 3: systemd service** on VPS running the Nitro server on `127.0.0.1:3000` with env `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` (or Nitro's `node .output/server/index.mjs`). Enable + start. Verify `curl -s localhost:3000` on the VPS returns HTML.

**Step 4: nginx vhost** `/etc/nginx/sites-available/play.bighead-quizz.com`: `server_name play.bighead-quizz.com;` reverse-proxy `location / { proxy_pass http://127.0.0.1:3000; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; proxy_set_header X-Forwarded-Proto $scheme; }`. Symlink to sites-enabled, `sudo nginx -t && sudo systemctl reload nginx`.

**Step 5: HTTPS** `sudo certbot --nginx -d play.bighead-quizz.com --non-interactive --agree-tos -m julien@p.studio --redirect`.

**Step 6: Verify:**
```bash
curl -s -o /dev/null -w "HTTP %{http_code} ssl:%{ssl_verify_result}\n" https://play.bighead-quizz.com/
```
Expected: `HTTP 200 ssl:0`. Open in browser: starter/shell page renders, anonymous cookie set.

---

## Task 10: CI — GitHub Actions (lint, test, build, deploy)

**Files:**
- Create: `.github/workflows/web.yml`

**Step 1:** Workflow triggered on push to `web/**` and PRs touching `apps/web/**`: setup pnpm + Node 20, `pnpm install`, `pnpm -C apps/web lint`, `pnpm -C apps/web test`, `pnpm -C apps/web build`. (E2E optional gate; can run on PR.)

**Step 2:** Deploy job (on merge to main only): rsync `.output/` to VPS via SSH deploy key (secret `VPS_SSH_KEY`), then `systemctl restart bighead-web` over SSH. Supabase URL/key injected as Actions secrets.

**Step 3:** Push branch, open PR, confirm CI is green. Verify deploy job logic (can be dry-run / manual approval first).

**Step 4: Commit**
```bash
git add .github/workflows/web.yml && git commit -m "ci(web): lint, test, build, deploy pipeline"
```

---

## Definition of Done (P0)

- [ ] `apps/web` boots locally (`pnpm dev`) and builds (`pnpm build`)
- [ ] Anonymous Supabase session auto-created on first load (cookie verified)
- [ ] Generated DB types compile; `tsc --noEmit` clean
- [ ] Tailwind tokens render (cyan primary, dark bg)
- [ ] App shell + nav + FR/EN i18n in place
- [ ] Vitest unit tests + Playwright smoke green; lint clean
- [ ] `https://play.bighead-quizz.com` live (HTTP 200, valid SSL, redirect 80→443)
- [ ] CI pipeline green (lint/test/build) + deploy job wired
- [ ] Design doc + this plan committed

## Next (P1, separate plan)

Chain Reaction + Daily Brain gameplay (QuizCard, TimerRing, ChainMeter, ResultScreen), wiring the real RPCs (`get_adaptive_questions`, `get_daily_challenge`, `record_answer_and_update_ratings`, `check_achievements`) — mirroring `apps/mobile/src/services/`.
