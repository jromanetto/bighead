import { useEffect, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Brain, Swords, Trophy, Zap } from 'lucide-react'

import { useT } from '#/lib/i18n/LangProvider'
import { hasPlayedToday } from '#/lib/game/daily'

import type { StringKey } from '#/lib/i18n/strings'
import type { ReactNode } from 'react'

export const Route = createFileRoute('/play/')({ component: PlayHub })

function PlayHub() {
  const t = useT()

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

      <div className="grid gap-4 sm:grid-cols-2">
        <ModeCard
          to="/play/chain"
          icon={<Zap className="h-6 w-6" aria-hidden="true" />}
          title={t('play.chain.title')}
          tagline={t('play.chain.tagline')}
          ctaKey="play.start"
        />
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SoonCard
          icon={<Swords className="h-6 w-6" aria-hidden="true" />}
          title={t('nav.duels')}
          soonLabel={t('play.soon')}
        />
        <SoonCard
          icon={<Trophy className="h-6 w-6" aria-hidden="true" />}
          title={t('nav.leaderboard')}
          soonLabel={t('play.soon')}
        />
      </div>
    </div>
  )
}

function ModeCard({
  to,
  icon,
  title,
  tagline,
  ctaKey,
  badge,
}: {
  to: string
  icon: ReactNode
  title: string
  tagline: string
  ctaKey: StringKey
  badge?: string
}) {
  const t = useT()
  return (
    <Link
      to={to}
      className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-surface p-6 transition-colors hover:border-primary/60"
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
        <h2 className="text-xl font-bold text-fg">{title}</h2>
        <p className="mt-1 text-sm text-fg/60">{tagline}</p>
      </div>
      <span className="mt-1 inline-flex w-fit rounded-lg bg-primary px-4 py-2 text-sm font-bold text-bg transition-opacity group-hover:opacity-90">
        {t(ctaKey)}
      </span>
    </Link>
  )
}

function SoonCard({
  icon,
  title,
  soonLabel,
}: {
  icon: ReactNode
  title: string
  soonLabel: string
}) {
  return (
    <div
      aria-disabled="true"
      className="flex items-center gap-3 rounded-2xl border border-white/5 bg-surface/40 p-5 opacity-60"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-fg/40">
        {icon}
      </span>
      <div className="flex flex-1 items-center justify-between">
        <h3 className="font-bold text-fg/60">{title}</h3>
        <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-fg/40">
          {soonLabel}
        </span>
      </div>
    </div>
  )
}
