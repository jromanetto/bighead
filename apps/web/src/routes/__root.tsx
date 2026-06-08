import { useState } from 'react'
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ensureSession } from '#/lib/auth/ensure-session'
import { SessionProvider } from '#/lib/auth/SessionProvider'
import { AppShell } from '#/components/AppShell'
import { LangProvider } from '#/lib/i18n/LangProvider'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  beforeLoad: async () => {
    // Reads the existing cookie session for SSR personalization. Never signs in
    // and never throws (anonymous sign-in is client-side via SessionProvider),
    // so SSR can't crash into the root error boundary under rate limits.
    const { user } = await ensureSession()
    return { user }
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'BIGHEAD — Le quiz qui défie ton cerveau',
      },
      {
        name: 'description',
        content:
          'BIGHEAD : le quiz qui défie ton cerveau. Joue gratuitement, grimpe au classement et défie tes amis. Aussi sur iOS et Android.',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  // One QueryClient per app instance. `useState` keeps it stable across
  // re-renders and gives the server its own instance per request (SSR-safe).
  // Data is fetched client-side only, so SSR renders the loading state.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <LangProvider>
            <SessionProvider>
              <AppShell>{children}</AppShell>
            </SessionProvider>
          </LangProvider>
        </QueryClientProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
