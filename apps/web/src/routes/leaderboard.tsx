import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { useT } from '#/lib/i18n/LangProvider'
import { getBrowserClient } from '#/lib/supabase/client'
import { APP_STORE_URL, PLAY_STORE_URL } from '#/lib/funnel/appLinks'
import {
  fetchAllTimeLeaderboard,
  fetchWeeklyLeaderboard,
} from '#/lib/leaderboard/queries'

import type { LeaderboardEntry } from '#/lib/leaderboard/queries'

export const Route = createFileRoute('/leaderboard')({ component: Leaderboard })

type Tab = 'weekly' | 'allTime'

/** Resolves the current user's id once on the client (for row highlighting). */
function useCurrentUserId(): string | null {
  const [uid, setUid] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    void getBrowserClient()
      .auth.getUser()
      .then(({ data }) => {
        if (!cancelled) setUid(data.user?.id ?? null)
      })
    return () => {
      cancelled = true
    }
  }, [])
  return uid
}

function Leaderboard() {
  const t = useT()
  const [tab, setTab] = useState<Tab>('weekly')
  const currentUserId = useCurrentUserId()

  const query = useQuery({
    queryKey: ['leaderboard', tab],
    queryFn: () =>
      tab === 'weekly'
        ? fetchWeeklyLeaderboard(100)
        : fetchAllTimeLeaderboard(100),
  })

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h1 className="text-3xl font-bold text-fg">{t('lb.title')}</h1>

      {/* Tabs */}
      <div
        role="tablist"
        className="flex gap-1 rounded-xl border border-white/10 bg-surface p-1"
      >
        {(['weekly', 'allTime'] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={
              tab === value
                ? 'flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-bg'
                : 'flex-1 rounded-lg px-4 py-2 text-sm font-medium text-fg/60 transition-colors hover:text-fg'
            }
          >
            {value === 'weekly' ? t('lb.tab.weekly') : t('lb.tab.allTime')}
          </button>
        ))}
      </div>

      {query.isPending ? (
        <LeaderboardSkeleton />
      ) : query.isError ? (
        <p
          role="alert"
          className="rounded-xl border border-error/30 bg-error/10 p-5 text-center text-sm text-fg"
        >
          {t('lb.error')}
        </p>
      ) : query.data.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-surface p-6 text-center text-sm text-fg/60">
          {t('lb.empty')}
        </p>
      ) : (
        <LeaderboardList rows={query.data} currentUserId={currentUserId} />
      )}

      <AppCta />
    </div>
  )
}

function LeaderboardList({
  rows,
  currentUserId,
}: {
  rows: Array<LeaderboardEntry>
  currentUserId: string | null
}) {
  const t = useT()
  return (
    <ul className="flex flex-col gap-1.5">
      {/* Header */}
      <li className="grid grid-cols-[2.5rem_1fr_4rem_3rem] items-center gap-2 px-3 text-xs uppercase tracking-wide text-fg/40 sm:grid-cols-[3rem_1fr_5rem_4rem]">
        <span>{t('lb.col.rank')}</span>
        <span>{t('lb.col.player')}</span>
        <span className="text-right">{t('lb.col.xp')}</span>
        <span className="text-right">{t('lb.col.chain')}</span>
      </li>

      {rows.map((row) => {
        const isMe = currentUserId !== null && row.id === currentUserId
        const name =
          row.username && row.username.trim() ? row.username : t('lb.anon')
        return (
          <li
            key={row.id}
            className={
              'grid grid-cols-[2.5rem_1fr_4rem_3rem] items-center gap-2 rounded-xl border px-3 py-2.5 sm:grid-cols-[3rem_1fr_5rem_4rem] ' +
              (isMe
                ? 'border-primary/50 bg-primary/10'
                : 'border-white/10 bg-surface')
            }
          >
            <span className="flex items-center text-lg font-bold tabular-nums">
              <RankBadge rank={row.rank} />
            </span>
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate font-medium text-fg">{name}</span>
              {isMe ? (
                <span className="shrink-0 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase text-bg">
                  {t('lb.you')}
                </span>
              ) : null}
            </span>
            <span className="text-right font-semibold tabular-nums text-primary">
              {row.xp.toLocaleString()}
            </span>
            <span className="text-right tabular-nums text-fg/70">
              {row.bestChain}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

/** Medal accent for the top 3, plain number otherwise. */
function RankBadge({ rank }: { rank: number }) {
  const medal =
    rank === 1
      ? 'text-yellow-400'
      : rank === 2
        ? 'text-zinc-300'
        : rank === 3
          ? 'text-amber-600'
          : 'text-fg/50'
  return <span className={medal}>{rank}</span>
}

function LeaderboardSkeleton() {
  return (
    <ul className="flex flex-col gap-1.5" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <li
          key={i}
          className="h-12 animate-pulse rounded-xl border border-white/10 bg-surface"
        />
      ))}
    </ul>
  )
}

function AppCta() {
  const t = useT()
  return (
    <div className="mt-2 rounded-2xl border border-white/10 bg-surface p-5 text-center">
      <p className="text-sm font-semibold text-fg">{t('lb.cta.title')}</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <a
          href={APP_STORE_URL}
          className="rounded-xl bg-fg px-4 py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
        >
          {t('promo.appStore')}
        </a>
        <a
          href={PLAY_STORE_URL}
          className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-fg transition-colors hover:bg-white/5"
        >
          {t('promo.googlePlay')}
        </a>
      </div>
    </div>
  )
}
