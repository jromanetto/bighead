/**
 * Free-play gate: tracks how many questions an (anonymous) user has answered on
 * the web and decides when to surface an account-creation prompt.
 *
 * All functions are SSR-safe (no-op without a `window`) and accept an injectable
 * `Storage` so they stay pure and unit-testable.
 */

/** localStorage key holding the lifetime answered-question count. */
export const ANSWERED_KEY = 'bh_answered'
/** localStorage key holding which prompt thresholds have already fired. */
export const PROMPTED_KEY = 'bh_prompted'

/** Answered-count thresholds that trigger each prompt. */
const FIRST_THRESHOLD = 20
const SECOND_THRESHOLD = 50

export type PromptKind = 'first' | 'second'

/**
 * Resolves the storage to use: the injected one, else `window.localStorage`,
 * else `null` (SSR / unavailable). Reads are wrapped so a throwing localStorage
 * (private mode) degrades gracefully.
 */
function resolveStorage(storage?: Storage): Storage | null {
  if (storage) return storage
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function readInt(storage: Storage, key: string): number {
  try {
    const raw = storage.getItem(key)
    const n = raw === null ? 0 : Number.parseInt(raw, 10)
    return Number.isFinite(n) && n >= 0 ? n : 0
  } catch {
    return 0
  }
}

/** Reads the set of prompt kinds already shown. */
function readPrompted(storage: Storage): Set<PromptKind> {
  try {
    const raw = storage.getItem(PROMPTED_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((v): v is PromptKind => v === 'first' || v === 'second'))
    }
    return new Set()
  } catch {
    return new Set()
  }
}

function writePrompted(storage: Storage, shown: Set<PromptKind>): void {
  try {
    storage.setItem(PROMPTED_KEY, JSON.stringify([...shown]))
  } catch {
    // Ignore persistence failures.
  }
}

/** Increments the answered-question counter by one. No-op without storage. */
export function recordAnsweredQuestion(storage?: Storage): void {
  const s = resolveStorage(storage)
  if (!s) return
  const next = readInt(s, ANSWERED_KEY) + 1
  try {
    s.setItem(ANSWERED_KEY, String(next))
  } catch {
    // Ignore persistence failures.
  }
}

/** Returns the current answered-question count (0 without storage). */
export function getAnsweredCount(storage?: Storage): number {
  const s = resolveStorage(storage)
  if (!s) return 0
  return readInt(s, ANSWERED_KEY)
}

/**
 * Returns which account prompt (if any) is due, marking it as shown so it never
 * fires twice.
 *
 * - `'first'` the first time the count reaches {@link FIRST_THRESHOLD}.
 * - `'second'` the first time the count reaches {@link SECOND_THRESHOLD}.
 * - `null` otherwise (below the first threshold, or all due prompts shown).
 *
 * The second prompt is preferred when both are eligible but neither has fired
 * yet (e.g. the count jumped past both), so a returning user isn't double-nagged.
 */
export function consumePromptIfDue(storage?: Storage): PromptKind | null {
  const s = resolveStorage(storage)
  if (!s) return null

  const count = readInt(s, ANSWERED_KEY)
  const shown = readPrompted(s)

  if (count >= SECOND_THRESHOLD && !shown.has('second')) {
    shown.add('second')
    // Reaching the second threshold implies the first was passed; mark it too so
    // it can't fire retroactively after the bigger milestone.
    shown.add('first')
    writePrompted(s, shown)
    return 'second'
  }

  if (count >= FIRST_THRESHOLD && !shown.has('first')) {
    shown.add('first')
    writePrompted(s, shown)
    return 'first'
  }

  return null
}
