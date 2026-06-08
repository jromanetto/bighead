import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { useLang } from '#/lib/i18n/LangProvider'
import type { StringKey } from '#/lib/i18n/strings'

const NAV_ITEMS: Array<{ to: string; key: StringKey }> = [
  { to: '/play', key: 'nav.play' },
  { to: '/duels', key: 'nav.duels' },
  { to: '/leaderboard', key: 'nav.leaderboard' },
  { to: '/profile', key: 'nav.profile' },
]

export function AppShell({ children }: { children: ReactNode }) {
  const { lang, setLang, t } = useLang()

  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <header className="border-b border-white/10 bg-surface">
        <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
          <Link to="/" className="text-xl font-bold text-primary">
            BIGHEAD
          </Link>

          <ul className="flex items-center gap-4 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-fg/70 transition-colors hover:text-fg"
                  activeProps={{ className: 'text-primary font-medium' }}
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-1 text-xs">
            {(['fr', 'en'] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                aria-pressed={lang === code}
                className={
                  lang === code
                    ? 'rounded bg-primary px-2 py-1 font-medium text-bg'
                    : 'rounded px-2 py-1 text-fg/60 hover:text-fg'
                }
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 bg-bg px-4 py-8">
        {children}
      </main>
    </div>
  )
}
