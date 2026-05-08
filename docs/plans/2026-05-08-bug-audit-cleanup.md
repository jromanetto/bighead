# Bug audit & DB cleanup — 2026-05-08

User-reported bugs across BIGHEAD app, root-caused and fixed in a single session. Commit `ba4cee9`.

## Bugs reported

| # | Bug | Status |
|---|-----|--------|
| 1 | Family mode + Geography (and most categories) doesn't work | **fixed** |
| 2 | XP only shown in some game modes — should be everywhere | **fixed** |
| 3 | Some FR questions are actually written in English | **fixed** |
| 4 | Many questions have the correct answer in the question text | **fixed** |
| 5 | Logo questions show the brand name in the question — defeats the purpose | **fixed** |
| 6 | Image bugs in questions | **verified clean** (0 broken on 313 unique URLs) |

## Root causes

### Family mode bug
`apps/mobile/src/types/adventure.ts` declared the `Category` type with French codes
(`geographie`, `histoire`, `sciences`, `pop_culture`, `jeux_video`, `cinema`, `musique`,
`technologie`, `culture_generale`). The `questions.category` column in Supabase uses
English codes (`geography`, `history`, `science`, `pop-culture`, `cinema`, `music`,
`technology`, `general`). The two namespaces never overlapped, so `getFamilyQuestions`
returned 0 rows for every category except `sport`, `cinema`, `logo`.

**Fix:** Added `adventureCategoryToDbCodes(c: Category): string[]` mapping function
and routed `getFamilyQuestions` + `getAdventureQuestions` through it. Used `.in()`
when the FE code maps to multiple DB codes (e.g. `cinema` → `cinema` + `movies`).

### XP partial display
The `game_results` INSERT trigger (`update_user_stats_after_game`) increments
`users.total_xp` by `score / 10`, but the table's mode CHECK only allows
`chain_solo` and `party`. All other modes (duel, tournament, family, adventure,
traitor, auction, daily) had no XP path.

**Fix:** New migration `20260508120000_unified_xp_system.sql` adds:
- `xp_transactions` table (audit log)
- `award_xp(user_id, amount, source, metadata, dedupe_key)` RPC

Frontend uses a single `<XPGainBanner>` component fed by `computeXP({ source, ... })`
from `src/services/xp.ts`. Each result screen calls `awardXP()` with a `dedupeKey`
to prevent double-grant on remount (e.g. `duel:{duelId}`, `tournament:{tournamentId}`).

### Database content issues
Audit (`db_audit.ts`) scanned 16,027 active questions. Findings:
- **126 language mismatches** — declared language ≠ detected language. After
  filtering quoted titles, 75 cases were genuine. Re-tagged to detected language
  rather than disabling (content is still valid, just mistagged).
- **154 exact answer leaks** — `correct_answer` appears verbatim as a word in
  `question_text`. Disabled via `is_active=false`. 77 "major" cases (multi-word
  answers where every word appears) kept for manual review (saved to
  `/tmp/leaks_major.json`).
- **325 logo questions**, 75 with `category=logo`, others scattered. 137 unique
  brand names. Many had no image_url and exposed the brand in the question text.
- **Category chaos:** `sports` (48) duplicate of `sport`, `entertainment` (34),
  `food` (25), `pop-culture` (92), `logo` (75) were orphan codes not in the
  `categories` table.

**Fixes:**
- `sports` → `sport` (48 rows)
- `entertainment` → `cinema` (34 rows)
- `food` → `general` (25 rows)
- `logo` and `pop-culture` added to `categories` table
- Migration `20260508130000_normalize_categories.sql`

### Logos with brand name visible
`fetch_logos.ts` pulls a real PNG from logo.dev for each unique brand answer:
1. Searches `https://api.logo.dev/search?q={brand}` (Bearer SK auth)
2. Picks best candidate (denylist Wikipedia/LinkedIn/etc., prefers `.com`,
   exact-name match score)
3. Downloads `https://img.logo.dev/{domain}?token=PK&format=png&size=512&retina=true`
4. Uploads to `question-images/logos/{slug}.png` Supabase bucket
5. Updates each matching question: sets `image_url`, replaces `question_text`
   with neutral `"Quelle marque est représentée par ce logo ?"` /
   `"Which brand is represented by this logo?"`

API keys are shared with the `sparepart` project at
`/Users/julienromanetto/dev/sparepart/backend/scripts/fetch_brand_logos_logodev.py`.

`revert_bad_logos.ts` undoes updates where the `correct_answer` isn't actually a
brand (article-prefixed, person name, generic concept). Reverted 6 questions:
"Le crocodile", "A horse", "Le rugby", "Football américain", "Erling Haaland",
"But".

Final state: **301 logo questions** with proper image and neutral text, **137
unique logos** in storage.

## Files changed

### Backend (Supabase)
- `supabase/migrations/20260508120000_unified_xp_system.sql`
- `supabase/migrations/20260508130000_normalize_categories.sql`

### Mobile
- `apps/mobile/src/services/xp.ts` (new)
- `apps/mobile/src/components/XPGainBanner.tsx` (new)
- `apps/mobile/src/types/adventure.ts` (added mapping)
- `apps/mobile/src/services/adventure.ts` (uses mapping)
- `apps/mobile/app/{auction/game,duel/result,tournament/result,party/result,traitor/result,game/result,game/family/play}.tsx`

### Maintenance scripts (`scripts/instagram-pipeline/`)
- `db_audit.ts` — full DB audit
- `db_clean.ts` — apply lang/leak/category cleanup
- `fetch_logos.ts` — logo.dev fetcher
- `revert_bad_logos.ts` — revert false positives

## Open work

10,000 new bilingual questions to fill weak categories (separate plan).
