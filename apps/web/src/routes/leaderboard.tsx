import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { useT } from '#/lib/i18n/LangProvider'
import { useSession } from '#/lib/auth/SessionProvider'
import { APP_STORE_URL, PLAY_STORE_URL } from '#/lib/funnel/appLinks'
import { msUntilWeeklyReset, formatCountdown } from '#/lib/leaderboard/countdown'
import {
  fetchAllTimeLeaderboard,
  fetchWeeklyLeaderboard,
} from '#/lib/leaderboard/queries'

import type { LeaderboardEntry } from '#/lib/leaderboard/queries'

export const Route = createFileRoute('/leaderboard')({
  head: () => ({ meta: [{ title: 'Classement · BIGHEAD' }] }),
  component: Leaderboard,
})

type Tab = 'weekly' | 'allTime'

function Leaderboard() {
  const t = useT()
  const [tab, setTab] = useState<Tab>('weekly')
  // The board itself is a public read; only the "you" row highlight needs the
  // user id, taken from the centralized session (no extra getUser round-trip).
  const { userId: currentUserId } = useSession()

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

      {tab === 'weekly' ? <WeeklyResetCountdown /> : null}

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
        <>
          <FomoBanner rows={query.data} currentUserId={currentUserId} />
          <LeaderboardList rows={query.data} currentUserId={currentUserId} />
        </>
      )}

      <AppCta />
    </div>
  )
}

/**
 * Rank-gap FOMO banner. If the current user is ranked and not #1, shows how many
 * points separate them from the player directly above. If they're not in the
 * fetched list, nudges them to play more to enter the top 100.
 */
function FomoBanner({
  rows,
  currentUserId,
}: {
  rows: Array<LeaderboardEntry>
  currentUserId: string | null
}) {
  const t = useT()
  if (!currentUserId) return null

  const myIndex = rows.findIndex((r) => r.id === currentUserId)

  if (myIndex === -1) {
    return (
      <p className="rounded-xl border border-accent/30 bg-accent/10 p-4 text-center text-sm font-medium text-fg">
        {t('lb.fomo.notRanked')}
      </p>
    )
  }

  if (myIndex === 0) {
    return (
      <p className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-center text-sm font-medium text-fg">
        {t('lb.fomo.first')}
      </p>
    )
  }

  const me = rows[myIndex]
  const above = rows[myIndex - 1]
  const gap = Math.max(0, above.xp - me.xp)
  const nameAbove =
    above.username && above.username.trim() ? above.username : t('lb.anon')

  return (
    <p className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-center text-sm font-medium text-fg">
      {t('lb.fomo.gap')
        .replace('{rank}', String(me.rank))
        .replace('{gap}', gap.toLocaleString())
        .replace('{name}', nameAbove)}
    </p>
  )
}

/**
 * Weekly reset countdown. SSR-safe: `now` is read from `Date.now()` only after
 * mount (initial `null` renders a stable placeholder height), then refreshed
 * each minute so the "Xj Yh" label stays roughly current without re-rendering
 * every second.
 */
function WeeklyResetCountdown() {
  const t = useT()
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(id)
  }, [])

  // Reserve the row's height before mount to avoid layout shift / mismatch.
  if (now === null) {
    return <div className="h-9" aria-hidden="true" />
  }

  const label = formatCountdown(msUntilWeeklyReset(now))
  return (
    <p className="rounded-xl border border-white/10 bg-surface px-4 py-2 text-center text-xs font-medium text-fg/60">
      {t('lb.weekly.reset').replace('{time}', label)}
    </p>
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
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-fg px-4 py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
        >
          {t('promo.appStore')}
        </a>
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-fg transition-colors hover:bg-white/5"
        >
          {t('promo.googlePlay')}
        </a>
      </div>
    </div>
  )
}
