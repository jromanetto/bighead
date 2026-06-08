import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

type SessionContextValue = {
  /** The current user's id, or `null` until a session is established (or if sign-in failed). */
  userId: string | null
  /**
   * `true` once the client has resolved the session: either an existing session
   * was found, an anonymous sign-in completed, OR sign-in failed. Consumers that
   * fetch user-scoped data should wait for this (mirrors LangProvider's `ready`).
   * It does NOT imply success — check `userId`/`error` for that.
   */
  sessionReady: boolean
  /** `true` when establishing the session failed (e.g. rate limit). UI can offer a retry. */
  error: boolean
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    // Read through a function so TS does not narrow `cancelled` across awaits.
    const isCancelled = () => cancelled

    void (async () => {
      try {
        // Import lazily so the Supabase browser client never runs at module
        // top-level during SSR.
        const { getBrowserClient } = await import('#/lib/supabase/client')
        const supabase = getBrowserClient()

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          if (!isCancelled()) setUserId(session.user.id)
          return
        }

        // No session: sign in anonymously from the USER's IP. @supabase/ssr
        // persists the session to cookies, so subsequent SSR requests have it.
        const { data, error: signInError } =
          await supabase.auth.signInAnonymously()

        if (isCancelled()) return

        if (signInError || !data.user) {
          setError(true)
        } else {
          setUserId(data.user.id)
        }
      } catch (err) {
        console.error('SessionProvider: failed to establish session', err)
        if (!isCancelled()) setError(true)
      } finally {
        if (!isCancelled()) setSessionReady(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <SessionContext.Provider value={{ userId, sessionReady, error }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within a SessionProvider')
  return ctx
}
