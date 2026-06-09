/**
 * Thin, SSR-safe wrapper around Umami's `window.umami.track`.
 *
 * The Umami script is injected (env-gated) in `__root.tsx`; when it's absent
 * `window.umami` is undefined and every call here is a silent no-op. Nothing in
 * this module touches the DOM at import time, so it's safe on the server.
 */

/** Allowed value types for custom event properties. */
export type TrackData = Record<string, string | number | boolean>

/** Minimal shape of the global Umami object we rely on. */
interface UmamiGlobal {
  track: (event: string, data?: TrackData) => void
}

declare global {
  interface Window {
    umami?: UmamiGlobal
  }
}

/**
 * Tracks a custom funnel event. No-op on the server or when Umami isn't loaded
 * (analytics disabled / blocked). Never throws.
 */
export function track(event: string, data?: TrackData): void {
  if (typeof window === 'undefined') return
  try {
    window.umami?.track(event, data)
  } catch {
    // Analytics must never break the app.
  }
}

/**
 * Typed event names for the acquisition/engagement funnel. Centralised here so
 * call sites can't typo an event string.
 */
/**
 * Convenience for the app-install funnel: fires `install_clicked` with the store
 * platform and a placement label. Attach to App Store / Google Play anchors'
 * `onClick` (keep the href/target intact).
 */
export function trackInstall(
  platform: 'ios' | 'android',
  placement: string,
): void {
  track('install_clicked', { platform, placement })
}

export const EV = {
  gameStarted: 'game_started',
  gameFinished: 'game_finished',
  shareClicked: 'share_clicked',
  installClicked: 'install_clicked',
  accountCreated: 'account_created',
  duelCreated: 'duel_created',
  duelClaimed: 'duel_claimed',
  dailyPlayed: 'daily_played',
} as const
