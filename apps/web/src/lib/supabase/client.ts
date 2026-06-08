import { createBrowserClient } from '@supabase/ssr'

import type { Database } from '#/lib/database.types'

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined

/**
 * Returns the browser-side Supabase client as a singleton.
 *
 * Uses `createBrowserClient` from `@supabase/ssr` so the auth session is read
 * from / written to cookies, keeping it in sync with the SSR server client.
 */
export function getBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    )
  }

  return browserClient
}
