import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useLang, useT } from '#/lib/i18n/LangProvider'
import { getBrowserClient } from '#/lib/supabase/client'
import { useSession } from '#/lib/auth/SessionProvider'
import { SessionError } from '#/components/SessionError'
import { AccountPrompt } from '#/components/funnel/AccountPrompt'
import {
  fetchAchievements,
  fetchProfile,
  fetchRecentGames,
  updateUsername,
} from '#/lib/profile/queries'

import type { StringKey } from '#/lib/i18n/strings'
import type { ProfileUser, RecentGame } from '#/lib/profile/queries'

export const Route = createFileRoute('/profile')({
  head: () => ({
    meta: [
      { title: 'Profil · BIGHEAD' },
      // Page user-specific : aucune valeur en SERP, on évite la dilution.
      { name: 'robots', content: 'noindex, follow' },
    ],
  }),
  component: Profile,
})

/** Resolves whether the current session is anonymous (client-only). */
function useIsAnonymous(): boolean | null {
  const [anon, setAnon] = useState<boolean | null>(null)
  useEffect(() => {
    let cancelled = false
    void getBrowserClient()
      .auth.getUser()
      .then(({ data }) => {
        if (!cancelled) setAnon(data.user?.is_anonymous ?? false)
      })
    return () => {
      cancelled = true
    }
  }, [])
  return anon
}

function Profile() {
  const t = useT()
  const isAnonymous = useIsAnonymous()
  const { userId, sessionReady, error: sessionFailed } = useSession()
  const [promptOpen, setPromptOpen] = useState(false)

  // Profile data is user-scoped: only fetch once a session exists.
  const profile = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    enabled: Boolean(userId),
  })

  // Session couldn't be established (e.g. rate limit): offer a retry.
  if (sessionReady && sessionFailed) {
    return <SessionError />
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h1 className="text-3xl font-bold text-fg">{t('profile.title')}</h1>

      {isAnonymous ? (
        <AnonBanner onOpen={() => setPromptOpen(true)} />
      ) : null}

      {profile.isPending ? (
        <div className="h-32 animate-pulse rounded-2xl border border-white/10 bg-surface" />
      ) : profile.isError ? (
        <p
          role="alert"
          className="rounded-xl border border-error/30 bg-error/10 p-5 text-center text-sm text-fg"
        >
          {t('profile.error')}
        </p>
      ) : (
        <>
          <ProgressCard user={profile.data} />
          <UsernameForm initial={profile.data.username} />
          <StatsGrid user={profile.data} />
          <AchievementsSection />
          <RecentGamesSection />
        </>
      )}

      <AccountPrompt open={promptOpen} onClose={() => setPromptOpen(false)} />
    </div>
  )
}

function AnonBanner({ onOpen }: { onOpen: () => void }) {
  const t = useT()
  return (
    <div className="rounded-2xl border border-primary/40 bg-primary/10 p-5">
      <p className="text-base font-bold text-fg">{t('profile.anon.title')}</p>
      <p className="mt-1 text-sm text-fg/70">{t('profile.anon.subtitle')}</p>
      <button
        type="button"
        onClick={onOpen}
        className="mt-4 rounded-xl bg-primary px-5 py-2.5 font-bold text-bg transition-opacity hover:opacity-90"
      >
        {t('profile.anon.cta')}
      </button>
    </div>
  )
}

function ProgressCard({ user }: { user: ProfileUser }) {
  const t = useT()
  const level = user.level ?? 1
  const totalXp = user.total_xp ?? 0
  return (
    <div className="rounded-2xl border border-white/10 bg-surface p-5">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-fg/50">
            {t('profile.level')}
          </p>
          <p className="text-4xl font-bold tabular-nums text-primary">
            {level}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-fg/50">
            {t('profile.xp')}
          </p>
          <p className="text-2xl font-bold tabular-nums text-fg">
            {totalXp.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}

const STAT_ITEMS: Array<{ key: keyof ProfileUser; label: StringKey }> = [
  { key: 'games_played', label: 'profile.stat.gamesPlayed' },
  { key: 'games_won', label: 'profile.stat.gamesWon' },
  { key: 'best_chain', label: 'profile.stat.bestChain' },
  { key: 'daily_streak', label: 'profile.stat.dailyStreak' },
  { key: 'perfect_games', label: 'profile.stat.perfectGames' },
]

function StatsGrid({ user }: { user: ProfileUser }) {
  const t = useT()
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {STAT_ITEMS.map((item) => (
        <div
          key={item.key}
          className="rounded-xl border border-white/10 bg-surface p-4"
        >
          <p className="text-xs uppercase tracking-wide text-fg/50">
            {t(item.label)}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-fg">
            {Number(user[item.key] ?? 0)}
          </p>
        </div>
      ))}
    </div>
  )
}

function UsernameForm({ initial }: { initial: string }) {
  const t = useT()
  const queryClient = useQueryClient()
  const [value, setValue] = useState(initial)
  const [emptyError, setEmptyError] = useState(false)

  const mutation = useMutation({
    mutationFn: (name: string) => updateUsername(name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEmptyError(false)
    if (!value.trim()) {
      setEmptyError(true)
      return
    }
    mutation.mutate(value)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-surface p-5"
    >
      <label className="flex flex-col gap-1 text-sm text-fg/70">
        {t('profile.username.label')}
        <div className="mt-1 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t('profile.username.placeholder')}
            className="flex-1 rounded-xl border border-white/15 bg-bg px-3 py-2.5 text-fg outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-xl bg-primary px-5 py-2.5 font-bold text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {mutation.isPending
              ? t('profile.username.saving')
              : t('profile.username.save')}
          </button>
        </div>
      </label>

      {emptyError ? (
        <p role="alert" className="mt-2 text-sm text-error">
          {t('profile.username.errorEmpty')}
        </p>
      ) : null}
      {mutation.isError ? (
        <p role="alert" className="mt-2 text-sm text-error">
          {t('profile.username.error')}
        </p>
      ) : null}
      {mutation.isSuccess ? (
        <p role="status" className="mt-2 text-sm text-success">
          {t('profile.username.success')}
        </p>
      ) : null}
    </form>
  )
}

function AchievementsSection() {
  const t = useT()
  const { userId } = useSession()
  const query = useQuery({
    queryKey: ['achievements'],
    queryFn: fetchAchievements,
    enabled: Boolean(userId),
  })

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-bold text-fg">
          {t('profile.achievements.title')}
        </h2>
        {query.data ? (
          <span className="text-sm text-fg/60">
            {query.data.length} {t('profile.achievements.count')}
          </span>
        ) : null}
      </div>

      {query.isPending ? (
        <div className="h-20 animate-pulse rounded-2xl border border-white/10 bg-surface" />
      ) : query.isError ? (
        <p role="alert" className="text-sm text-error">
          {t('profile.error')}
        </p>
      ) : query.data.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-surface p-5 text-center text-sm text-fg/60">
          {t('profile.achievements.empty')}
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {query.data.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-surface p-3"
            >
              <span className="text-2xl" aria-hidden="true">
                {a.icon}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium text-fg">{a.name}</p>
                <p className="truncate text-xs text-fg/50">{a.description}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function RecentGamesSection() {
  const t = useT()
  const { userId } = useSession()
  const query = useQuery({
    queryKey: ['recentGames'],
    queryFn: () => fetchRecentGames(10),
    enabled: Boolean(userId),
  })

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-bold text-fg">{t('profile.recent.title')}</h2>

      {query.isPending ? (
        <div className="h-20 animate-pulse rounded-2xl border border-white/10 bg-surface" />
      ) : query.isError ? (
        <p role="alert" className="text-sm text-error">
          {t('profile.error')}
        </p>
      ) : query.data.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-surface p-5 text-center text-sm text-fg/60">
          {t('profile.recent.empty')}
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {query.data.map((g) => (
            <RecentGameRow key={g.id} game={g} />
          ))}
        </ul>
      )}
    </section>
  )
}

function RecentGameRow({ game }: { game: RecentGame }) {
  const { lang } = useLang()
  const date = game.createdAt
    ? new Date(game.createdAt).toLocaleDateString(
        lang === 'fr' ? 'fr-FR' : 'en-US',
        { day: 'numeric', month: 'short' },
      )
    : ''
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-surface px-4 py-3">
      <span className="font-medium capitalize text-fg">{game.mode}</span>
      <span className="flex items-center gap-4 text-sm">
        <span className="font-semibold tabular-nums text-primary">
          {game.score.toLocaleString()}
        </span>
        <span className="tabular-nums text-fg/50">{date}</span>
      </span>
    </li>
  )
}
