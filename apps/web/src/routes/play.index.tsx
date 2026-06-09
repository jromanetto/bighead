import { useEffect, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Brain, Trophy, Zap } from 'lucide-react'

import { useT } from '#/lib/i18n/LangProvider'
import { useSession } from '#/lib/auth/SessionProvider'
import { hasPlayedToday } from '#/lib/game/daily'
import { getMyStreak } from '#/lib/profile/streak'

import type { StringKey } from '#/lib/i18n/strings'
import type { ReactNode } from 'react'

export const Route = createFileRoute('/play/')({ component: PlayHub })

function PlayHub() {
  const t = useT()
  const { userId, sessionReady } = useSession()

  // Daily streak: user-scoped, fetched client-side only once a session exists.
  const { data: streak } = useQuery({
    queryKey: ['streak'],
    queryFn: getMyStreak,
    enabled: sessionReady && Boolean(userId),
  })

  // Today's daily status is a nice-to-have; fetched client-side only.
  const [dailyPlayed, setDailyPlayed] = useState<boolean | null>(null)

  useEffect(() => {
    let active = true
    hasPlayedToday()
      .then(({ played }) => {
        if (active) setDailyPlayed(played)
      })
      .catch(() => {
        if (active) setDailyPlayed(null)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-fg">{t('play.hub.title')}</h1>
        <p className="text-fg/60">{t('play.hub.subtitle')}</p>
      </div>

      <ModeCard
        to="/play/chain"
        icon={<Zap className="h-7 w-7" aria-hidden="true" />}
        title={t('play.chain.title')}
        tagline={t('play.chain.tagline')}
        ctaKey="play.start"
        primary
      />

      <StreakLine streak={streak} />

      <div className="grid gap-4 sm:grid-cols-2">
        <ModeCard
          to="/play/daily"
          icon={<Brain className="h-6 w-6" aria-hidden="true" />}
          title={t('play.daily.title')}
          tagline={t('play.daily.tagline')}
          ctaKey="play.start"
          badge={
            dailyPlayed ? t('play.daily.playedToday') : undefined
          }
        />
        <Link
          to="/leaderboard"
          className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-surface p-6 transition-colors hover:border-primary/60"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent2">
            <Trophy className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-fg">
              {t('nav.leaderboard')}
            </h2>
            <p className="mt-1 text-sm text-fg/60">
              {t('play.hub.leaderboard.tagline')}
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}

/**
 * Streak line on the hub. Renders nothing until the streak query resolves
 * (avoids a hydration-mismatch flash); then shows a "keep your streak" nudge
 * when > 0, or a gentle "start your streak" prompt at 0.
 */
function StreakLine({ streak }: { streak: number | undefined }) {
  const t = useT()
  if (streak === undefined) return null
  return (
    <p className="flex items-center gap-2 rounded-xl border border-white/10 bg-surface/60 px-4 py-2.5 text-sm text-fg/80">
      {streak > 0 ? (
        <>
          <span aria-hidden="true">🔥</span>
          {t('streak.hub.active').replace('{n}', String(streak))}
        </>
      ) : (
        t('streak.hub.empty')
      )}
    </p>
  )
}

function ModeCard({
  to,
  icon,
  title,
  tagline,
  ctaKey,
  badge,
  primary = false,
}: {
  to: string
  icon: ReactNode
  title: string
  tagline: string
  ctaKey: StringKey
  badge?: string
  primary?: boolean
}) {
  const t = useT()
  return (
    <Link
      to={to}
      className={
        'group flex flex-col gap-3 rounded-2xl border p-6 transition-colors ' +
        (primary
          ? 'border-primary/40 bg-gradient-to-br from-primary/15 via-surface to-surface shadow-lg shadow-primary/10 hover:border-primary'
          : 'border-white/10 bg-surface hover:border-primary/60')
      }
    >
      <div className="flex items-center justify-between">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
          {icon}
        </span>
        {badge ? (
          <span className="rounded-full bg-accent/20 px-2.5 py-1 text-xs font-medium text-accent2">
            {badge}
          </span>
        ) : null}
      </div>
      <div>
        <h2 className={primary ? 'text-2xl font-bold text-fg' : 'text-xl font-bold text-fg'}>
          {title}
        </h2>
        <p className="mt-1 text-sm text-fg/60">{tagline}</p>
      </div>
      <span className="mt-1 inline-flex w-fit rounded-lg bg-primary px-4 py-2 text-sm font-bold text-bg transition-opacity group-hover:opacity-90">
        {t(ctaKey)}
      </span>
    </Link>
  )
}
