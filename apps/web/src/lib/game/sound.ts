/**
 * Tiny zero-asset sound layer built on the Web Audio API.
 *
 * Tones are synthesized on the fly, so there are no files to load. Everything is
 * lazy and defensive:
 *  - The `AudioContext` is created on the first call (i.e. the first user
 *    gesture that triggers a sound), satisfying browser autoplay policies.
 *  - Every entry point guards `typeof window` and the presence of an
 *    `AudioContext` constructor, and swallows any error — sound is purely
 *    decorative and must never throw or break game logic.
 *  - A persisted mute flag (`localStorage['bh_muted']`) short-circuits playback.
 */

const STORAGE_KEY = 'bh_muted'

let ctx: AudioContext | null = null
/** `undefined` until first read; then the resolved boolean (default unmuted). */
let muted: boolean | undefined

type AudioContextCtor = typeof AudioContext

function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === 'undefined') return null
  // Read through a loose record so both the standard and webkit-prefixed
  // constructors are treated as possibly-absent (older Safari).
  const w = window as unknown as Record<string, AudioContextCtor | undefined>
  return w.AudioContext ?? w.webkitAudioContext ?? null
}

/** Lazily create (and resume) the shared AudioContext. Returns null if unsupported. */
function getCtx(): AudioContext | null {
  try {
    if (ctx) {
      // Autoplay policy may have suspended it; resume best-effort.
      if (ctx.state === 'suspended') void ctx.resume()
      return ctx
    }
    const Ctor = getAudioContextCtor()
    if (!Ctor) return null
    ctx = new Ctor()
    return ctx
  } catch {
    return null
  }
}

/** Reads the persisted mute flag (defaults to unmuted). SSR-safe. */
export function isMuted(): boolean {
  if (muted !== undefined) return muted
  if (typeof window === 'undefined') return false
  try {
    muted = window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    muted = false
  }
  return muted
}

/** Persists and applies the mute flag. SSR-safe. */
export function setMuted(value: boolean): void {
  muted = value
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? '1' : '0')
  } catch {
    // Ignore storage failures (private mode, quota); in-memory flag still holds.
  }
}

interface ToneSpec {
  freq: number
  /** Start offset from "now", in seconds. */
  start: number
  /** Duration in seconds. */
  duration: number
  type?: OscillatorType
  /** Peak gain (0–1). */
  gain?: number
}

/** Schedules one short tone with a quick attack/decay envelope. */
function playTone(context: AudioContext, spec: ToneSpec): void {
  const now = context.currentTime + spec.start
  const osc = context.createOscillator()
  const gain = context.createGain()
  const peak = spec.gain ?? 0.18

  osc.type = spec.type ?? 'sine'
  osc.frequency.setValueAtTime(spec.freq, now)

  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(peak, now + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + spec.duration)

  osc.connect(gain)
  gain.connect(context.destination)
  osc.start(now)
  osc.stop(now + spec.duration + 0.02)
}

/** Plays a sequence of tones, no-op if muted or unsupported. */
function playSequence(tones: Array<ToneSpec>): void {
  try {
    if (isMuted()) return
    const context = getCtx()
    if (!context) return
    for (const tone of tones) playTone(context, tone)
  } catch {
    // Never let audio break the game.
  }
}

/** Pleasant rising two-note chord on a correct answer. */
export function playCorrect(): void {
  playSequence([
    { freq: 587.33, start: 0, duration: 0.14, type: 'triangle', gain: 0.16 },
    { freq: 880, start: 0.08, duration: 0.16, type: 'triangle', gain: 0.16 },
  ])
}

/** Low buzz on a wrong answer. */
export function playWrong(): void {
  playSequence([
    { freq: 160, start: 0, duration: 0.22, type: 'sawtooth', gain: 0.14 },
    { freq: 120, start: 0.06, duration: 0.22, type: 'sawtooth', gain: 0.14 },
  ])
}

/** Little three-note fanfare when a game finishes. */
export function playFinish(): void {
  playSequence([
    { freq: 523.25, start: 0, duration: 0.16, type: 'triangle', gain: 0.16 },
    { freq: 659.25, start: 0.12, duration: 0.16, type: 'triangle', gain: 0.16 },
    { freq: 783.99, start: 0.24, duration: 0.26, type: 'triangle', gain: 0.18 },
  ])
}
