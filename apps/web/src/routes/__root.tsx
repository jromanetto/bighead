import { useEffect, useState } from 'react'
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ensureSession } from '#/lib/auth/ensure-session'
import { SessionProvider } from '#/lib/auth/SessionProvider'
import { AppShell } from '#/components/AppShell'
import { LangProvider } from '#/lib/i18n/LangProvider'
import { rootJsonLd } from '#/lib/seo/jsonLd'
import appCss from '../styles.css?url'

/**
 * Umami analytics is opt-in: the script is only injected when `VITE_UMAMI_SRC`
 * is set (e.g. `https://cloud.umami.is/script.js`). The website id falls back to
 * the BIGHEAD prod id when its env var is unset.
 */
const UMAMI_SRC = import.meta.env.VITE_UMAMI_SRC as string | undefined
const UMAMI_WEBSITE_ID =
  (import.meta.env.VITE_UMAMI_WEBSITE_ID as string | undefined) ??
  '5837a06e-06f6-4cd8-b00c-b4777e40cdba'

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
      { name: 'theme-color', content: '#00c2cc' },
      // Open Graph
      { property: 'og:site_name', content: 'BIGHEAD' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://play.bighead-quizz.com' },
      {
        property: 'og:title',
        content: 'BIGHEAD — Le quiz qui défie ton cerveau',
      },
      {
        property: 'og:description',
        content:
          'BIGHEAD : le quiz qui défie ton cerveau. Joue gratuitement, grimpe au classement et défie tes amis. Aussi sur iOS et Android.',
      },
      {
        property: 'og:image',
        content: 'https://play.bighead-quizz.com/og.png',
      },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      // Twitter card
      { name: 'twitter:card', content: 'summary_large_image' },
      {
        name: 'twitter:title',
        content: 'BIGHEAD — Le quiz qui défie ton cerveau',
      },
      {
        name: 'twitter:description',
        content:
          'BIGHEAD : le quiz qui défie ton cerveau. Joue gratuitement, grimpe au classement et défie tes amis. Aussi sur iOS et Android.',
      },
      {
        name: 'twitter:image',
        content: 'https://play.bighead-quizz.com/og.png',
      },
      { property: 'og:locale', content: 'fr_FR' },
      // Safari iOS shows a native App Store banner site-wide — free install
      // funnel with zero UI to maintain.
      { name: 'apple-itunes-app', content: 'app-id=6758253365' },
      // PWA installée depuis l'écran d'accueil iOS (hors App Store funnel).
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-title', content: 'BIGHEAD' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    ],
    // No canonical here on purpose: a single hardcoded homepage canonical would
    // (wrongly) tag every page as the homepage. Each indexable route sets its
    // own canonical (`/` and `/quiz/$category`); app pages self-canonicalize.
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      { rel: 'manifest', href: '/manifest.json' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      // Origines tierces sollicitées dès l'hydratation (auth + analytics).
      { rel: 'preconnect', href: 'https://dqhhpoxqrtlmhosrsdxp.supabase.co' },
      { rel: 'preconnect', href: 'https://cloud.umami.is' },
    ],
    // JSON-LD entité (Organization + WebSite) sur toutes les pages, puis
    // Umami uniquement quand configuré (defer = hors chemin critique).
    scripts: [
      {
        type: 'application/ld+json',
        children: rootJsonLd(),
      },
      ...(UMAMI_SRC
        ? [
            {
              src: UMAMI_SRC,
              defer: true,
              'data-website-id': UMAMI_WEBSITE_ID,
            },
          ]
        : []),
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

  // PWA service worker — prod uniquement (le SW polluerait dev et e2e). Le SW
  // est network-first sur le HTML donc jamais d'app périmée servie du cache.
  useEffect(() => {
    if (!import.meta.env.PROD) return
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('sw registration failed', err)
    })
  }, [])

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
