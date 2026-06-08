import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { ensureSession } from '#/lib/auth/ensure-session'
import { AppShell } from '#/components/AppShell'
import { LangProvider } from '#/lib/i18n/LangProvider'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  beforeLoad: async () => {
    const user = await ensureSession()
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
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        <LangProvider>
          <AppShell>{children}</AppShell>
        </LangProvider>
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
