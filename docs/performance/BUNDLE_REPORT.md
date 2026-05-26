# BigHead iOS Bundle Analysis

**Date:** 2026-05-26
**Platform:** iOS (Hermes bytecode, release profile)
**Bundler:** Metro
**Modules bundled:** 4261

## Summary

| Metric | Value |
|--------|-------|
| Bundle file | `_expo/static/js/ios/entry-5b411260cf89822b5f59b88d1911d626.hbc` |
| Bundle size (Hermes bytecode) | **10.7 MB** |
| Module count | 4261 |
| Cold-start JS parse target (estimated) | ~600–900 ms on iPhone 12 |

> Note: Hermes bytecode is ~30–40% denser than minified JS, so the
> equivalent JS source ballpark is ~25–30 MB. That's heavy for a quiz app.

## Top 10 heaviest dependencies (disk size proxy)

Disk size of `node_modules/<pkg>` correlates with bundle contribution.
Numbers in parens estimate the ACTUAL bundled subset after tree-shaking
(many libs ship docs/tests/source maps that don't bundle).

| # | Package | Disk size | Est. bundled | Notes |
|---|---------|-----------|--------------|-------|
| 1 | `@shopify/react-native-skia` | 435 MB (includes canvaskit-wasm) | ~600–900 KB | Used ONLY by `ConfettiEffect.tsx`. Lazy candidate. |
| 2 | `react-native` (core) | 84 MB | ~2.5 MB | Required, ~30% of bundle. |
| 3 | `@expo/*` | 68 MB | ~800 KB | Required by Expo Router. |
| 4 | `@sentry/react-native` | 44 MB | ~400 KB | Already deferred (Task D), but still bundled. |
| 5 | `lucide-react-native` | 35 MB | ~250 KB (tree-shaken) | Only the icons you import. Verify imports are scoped. |
| 6 | `react-native-reanimated` | 8.9 MB | ~450 KB | Heavy but unavoidable — used everywhere. |
| 7 | `react-native-svg` | 8.0 MB | ~300 KB | Used by Skia + lucide. |
| 8 | `react-native-gesture-handler` | 6.6 MB | ~250 KB | Required by bottom-sheet. |
| 9 | `zod` | 6.0 MB | ~80 KB | Schema validation. |
| 10 | `@supabase/supabase-js` | 5.7 MB | ~280 KB | Auth + DB client. |

## Actionable recommendations

### 1. Lazy-load Skia (`@shopify/react-native-skia`)  — est. save: **400–800 KB**
**Where:** `src/components/effects/ConfettiEffect.tsx` already does
`require('@shopify/react-native-skia')` inside a `try`, but it runs at module
load time. Wrap it in a dynamic import the first time confetti actually fires:

```ts
// In ConfettiEffect, only require Skia when trigger becomes true
const [SkiaConfetti, setSkiaConfetti] = useState<any>(null);
useEffect(() => {
  if (!trigger) return;
  import('@shopify/react-native-skia').then((mod) => setSkiaConfetti(mod));
}, [trigger]);
```
This excludes Skia entirely from the cold-start parse graph for users who
never reach a result screen with confetti (e.g. cold launch → settings).

### 2. Audit lucide-react-native imports — est. save: **80–150 KB**
Verify every import uses the leaf path (tree-shakes):
```ts
// GOOD — only imports the icon
import { Trophy } from 'lucide-react-native';
```
vs. bad pattern `import * as Lucide from 'lucide-react-native'` (none expected,
but worth confirming). Run:
```bash
grep -rn 'from "lucide-react-native"' apps/mobile/src apps/mobile/app
```

### 3. Defer Sentry SDK load — est. save: **200–400 KB cold-start parse**
Task D already defers `Sentry.init()`, but the SDK code is still in the
cold-start parse graph. A more aggressive step: lazy-load `@sentry/react-native`
via dynamic import inside the deferred `useEffect` in `app/_layout.tsx`:
```ts
useEffect(() => {
  if (!SENTRY_DSN) return;
  requestAnimationFrame(async () => {
    const Sentry = await import('@sentry/react-native');
    Sentry.init({ ... });
  });
}, []);
```
Caveat: this breaks `Sentry.wrap(RootLayout)` (must remain static). Acceptable
trade-off if cold start matters more than crash boundary on day-one users.

## Out of scope (worth tracking separately)

- `canvaskit-wasm` (24 MB on disk) — pulled by Skia, normally NOT bundled into
  the Hermes bytecode on iOS (native binding). Verify with App Store IPA size.
- `react-devtools-core` (16 MB) — dev-only, should already be excluded in prod.
- Investigate **code-splitting per route** via `expo-router` async routes once
  Expo SDK 55 lands.

## Methodology

1. `npx expo export --platform ios --output-dir /tmp/bighead-bundle-analysis`
2. `du -sh node_modules/*/ | sort -rh` for disk size proxy
3. `strings -a <bundle.hbc> | grep <pkg>` for confirmation (limited — Hermes
   strips most identifiers)
4. Cross-referenced with `package.json` dependencies list
