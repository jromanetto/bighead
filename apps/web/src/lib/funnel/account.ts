import { getBrowserClient } from '#/lib/supabase/client'

/**
 * Shared account helpers for the acquisition funnel.
 *
 * Both upgrade and sign-in return a normalized `{ ok, error }` result so callers
 * (AccountPrompt modal, /auth route) never have to deal with thrown errors and
 * can render a friendly message instead.
 */
export type AccountResult = { ok: true } | { ok: false; error: string }

function messageFrom(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'message' in err) {
    const m = (err as { message?: unknown }).message
    if (typeof m === 'string' && m.length > 0) return m
  }
  return fallback
}

/**
 * Upgrades the current anonymous user into a permanent account by attaching an
 * email + password. The Supabase user id is preserved, so all progress
 * (XP, game results, seen questions) stays attached.
 *
 * Depending on the project's email-confirmation setting, Supabase may send a
 * confirmation email before the email is usable for sign-in.
 */
export async function upgradeAccount(
  email: string,
  password: string,
): Promise<AccountResult> {
  try {
    const supabase = getBrowserClient()
    const { error } = await supabase.auth.updateUser({ email, password })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: messageFrom(err, 'Something went wrong') }
  }
}

/** Signs an existing user in with email + password. */
export async function signIn(
  email: string,
  password: string,
): Promise<AccountResult> {
  try {
    const supabase = getBrowserClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: messageFrom(err, 'Something went wrong') }
  }
}
