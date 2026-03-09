# Growth Engine Design — Increase Downloads

**Date**: 2026-03-09
**Status**: Approved
**Context**: iOS only (Android coming soon), <200EUR/month budget, FR+EN markets, social accounts <500 followers

## Goal

Multiply organic downloads by creating a virtuous growth loop: social content attracts -> ASO converts -> in-app virality multiplies.

## 1. Pipeline Social — Conversion-Optimized

**Problem**: Current videos give the answer — no reason to download the app.

### Changes
- **Cliffhanger format**: Video shows question + 4 choices + countdown but does NOT reveal the answer. Final CTA: "La reponse est dans BIGHEAD — lien en bio"
- **YouTube Shorts**: Add YouTube upload to `upload-post.ts` (same video, zero extra content, massive audience). User creates FR + EN YouTube accounts manually.
- **Link in bio**: Simple page with App Store + Google Play + website links
- **Optimized hashtags**: Trending hashtags per platform, not just #quiz
- **Frequency**: Keep 2x/day, vary categories to reach different audiences

### Files to modify
- `scripts/instagram-pipeline/src/heygen.ts` — Remove answer reveal from video scenes
- `scripts/instagram-pipeline/src/upload-post.ts` — Add YouTube Shorts upload support
- `scripts/instagram-pipeline/src/index.ts` — Update pipeline flow for cliffhanger format
- `scripts/instagram-pipeline/src/generate-question.ts` — Adjust script generation (no answer in video)

## 2. ASO (App Store Optimization)

### Keywords
- **FR**: quiz culture generale, jeu de questions, trivia francais, quiz quotidien, defi cerveau
- **EN**: trivia game, daily quiz, brain challenge, quiz game free, general knowledge

### Subtitle
- FR: "Quiz & Defis de Culture Generale"
- EN: "Daily Trivia & Brain Challenges"

### Screenshots
- Redo with catchy text overlays showing key modes (Daily Brain, 1v1 Duels, Tournaments)

### Description
- Restructure with keywords naturally integrated
- Lead with most viral modes

### Localization
- Add EN-US, EN-GB store localizations alongside FR

### Files to modify
- `docs/APP_STORE_DESCRIPTION.md` — Rewrite keywords, subtitle, description
- `apps/mobile/store/metadata.json` — Update store metadata
- App Store Connect — Manual updates for screenshots and localizations

## 3. In-App Virality

### Daily Challenge Scorecard
- After Daily Brain, generate a styled shareable image (Wordle-style)
- Shows: score, streak count, category of the day, BIGHEAD branding
- "Share to Story" button opens Instagram/Stories directly
- Square format, dark theme matching app aesthetic

### "Beat My Score" Challenge
- After good performance (Chain, Party, etc.), "Challenge a friend" button
- Generates deep link with score to beat
- Recipient opens app directly to the correct game mode

### Referral Simplified
- Referrer: unlocks 1 free hint
- Referred: unlocks 1 free hint
- Push notification to referrer when code is used
- No coins involved

### Contextual "Invite" Pop-up
- Triggers ONLY after positive moments: duel win, new record, streak milestone
- No random pop-ups

### Universal Links
- Configure `bighead.jrmanagement.org/invite/CODE`
- Opens app if installed, redirects to store if not
- Apple App Site Association file on VPS

### Files to modify
- New: `apps/mobile/src/components/ShareScorecard.tsx` — Scorecard image generation + share
- New: `apps/mobile/src/utils/deeplinks.ts` — Deep link generation and handling
- `apps/mobile/src/services/referral.ts` — Simplify rewards (hints instead of coins)
- `apps/mobile/src/services/notifications.ts` — Add referral notification
- `website/` or VPS — Add AASA file + invite redirect page
- `apps/mobile/app.json` — Universal links config
- Various game screens — Add share/invite buttons after positive events
