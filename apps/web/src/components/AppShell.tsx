import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Volume2, VolumeX } from 'lucide-react'
import type { ReactNode } from 'react'

import { useLang, useT } from '#/lib/i18n/LangProvider'
import { useSession } from '#/lib/auth/SessionProvider'
import { getMyStreak } from '#/lib/profile/streak'
import { isMuted, setMuted } from '#/lib/game/sound'
import { AppPromoBanner } from '#/components/funnel/AppPromoBanner'
import type { StringKey } from '#/lib/i18n/strings'

const NAV_ITEMS: Array<{ to: string; key: StringKey }> = [
  { to: '/play', key: 'nav.play' },
  { to: '/duels', key: 'nav.duels' },
  { to: '/weekly', key: 'nav.weekly' },
  { to: '/leaderboard', key: 'nav.leaderboard' },
  { to: '/profile', key: 'nav.profile' },
]

/**
 * Streak badge in the nav. SSR-safe: the streak is fetched client-side via
 * TanStack Query once a session exists, and the badge renders nothing until a
 * positive streak is loaded — so the server and first client render match.
 */
function StreakBadge() {
  const { userId, sessionReady } = useSession()
  const { data: streak } = useQuery({
    queryKey: ['streak'],
    queryFn: getMyStreak,
    enabled: sessionReady && Boolean(userId),
  })

  if (!streak || streak <= 0) return null
  return (
    <span
      className="flex items-center gap-1 rounded-full bg-accent/15 px-2 py-1 text-xs font-semibold text-accent2"
      title={`${streak}`}
    >
      <span aria-hidden="true">🔥</span>
      {streak} j
    </span>
  )
}

/**
 * Mute toggle. SSR-safe: reads `localStorage` only after mount (`mounted`
 * gate), rendering a neutral placeholder on the server / first client render to
 * avoid a hydration mismatch.
 */
function MuteToggle({ label }: { label: string }) {
  const [mounted, setMounted] = useState(false)
  const [muted, setMutedState] = useState(false)

  useEffect(() => {
    setMounted(true)
    setMutedState(isMuted())
  }, [])

  function toggle() {
    const next = !muted
    setMuted(next)
    setMutedState(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={mounted ? muted : undefined}
      aria-label={label}
      title={label}
      className="rounded p-1.5 text-fg/60 transition-colors hover:text-fg"
    >
      {mounted && muted ? (
        <VolumeX className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Volume2 className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  )
}

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

          <div className="ml-auto flex items-center gap-2 text-xs">
            <StreakBadge />
            <MuteToggle label={t('sound.toggle')} />
            <div className="flex items-center gap-1">
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
          </div>
        </nav>
      </header>

      <AppPromoBanner />

      <main className="mx-auto w-full max-w-5xl flex-1 bg-bg px-4 py-8">
        {children}
      </main>
      <TrustFooter />
    </div>
  )
}

/**
 * Footer minimal de confiance (E-E-A-T) : mentions légales, confidentialité
 * et contact vivent sur le domaine marketing — on les rend visibles partout.
 */
function TrustFooter() {
  const t = useT()
  return (
    <footer className="mx-auto w-full max-w-5xl border-t border-white/5 px-4 py-5">
      <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-fg/40">
        <span>© {new Date().getFullYear()} BIGHEAD</span>
        <a
          href="https://bighead-quizz.com/privacy.html"
          className="transition-colors hover:text-fg/70"
        >
          {t('footer.privacy')}
        </a>
        <a
          href="https://bighead-quizz.com/terms.html"
          className="transition-colors hover:text-fg/70"
        >
          {t('footer.terms')}
        </a>
        <a
          href="mailto:support@bighead-app.com"
          className="transition-colors hover:text-fg/70"
        >
          {t('footer.contact')}
        </a>
      </nav>
    </footer>
  )
}
