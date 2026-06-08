import { createServerClient } from '@supabase/ssr'
import { getCookies, setCookie } from '@tanstack/react-start/server'

import type { Database } from '#/lib/database.types'

/**
 * Returns a request-scoped Supabase client for use during SSR / server functions.
 *
 * Wires `@supabase/ssr` to TanStack Start's request cookie helpers
 * (`getCookies` / `setCookie` from `@tanstack/react-start/server`, verified
 * against @tanstack/react-start 1.168.25) so the auth session is read from the
 * incoming request cookies and any refreshed session is written back to the
 * response via Set-Cookie.
 */
export function getServerClient() {
  return createServerClient<Database>(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return Object.entries(getCookies()).map(([name, value]) => ({
            name,
            value,
          }))
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Force `secure` in production (served over HTTPS behind nginx).
            // In dev (http://localhost) it must stay unset or the cookie is dropped.
            setCookie(name, value, {
              ...options,
              secure: import.meta.env.PROD ? true : options?.secure,
            })
          })
        },
      },
    },
  )
}
