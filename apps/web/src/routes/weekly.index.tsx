import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQueries, useQuery } from '@tanstack/react-query'
import { CalendarDays } from 'lucide-react'

import { useLang, useT } from '#/lib/i18n/LangProvider'
import { useSession } from '#/lib/auth/SessionProvider'
import { SessionError } from '#/components/SessionError'
import { APP_STORE_URL, PLAY_STORE_URL } from '#/lib/funnel/appLinks'
import {
  getActiveChallenges,
  getMyProgress,
  themeDescription,
  themeLabel,
} from '#/lib/game/weekly'

import type { WeeklyChallenge } from '#/lib/game/weekly'

export const Route = createFileRoute('/weekly/')({ component: WeeklyList })

function WeeklyList() {
  const t = useT()
  const { lang } = useLang()
  const { userId, sessionReady, error: sessionFailed } = useSession()
  const navigate = useNavigate()

  const challengesQuery = useQuery({
    queryKey: ['weekly-challenges'],
    queryFn: getActiveChallenges,
    enabled: sessionReady && !!userId,
  })

  const challenges = challengesQuery.data ?? []

  // One progress query per challenge; lets each card show "X/total".
  const progressQueries = useQueries({
    queries: challenges.map((c) => ({
      queryKey: ['weekly-progress', c.id],
      queryFn: () => getMyProgress(c.id),
      enabled: sessionReady && !!userId,
    })),
  })

  if (sessionReady && sessionFailed) {
    return <SessionError />
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-fg">{t('weekly.title')}</h1>
        <p className="text-fg/60">{t('weekly.subtitle')}</p>
      </div>

      {!sessionReady || challengesQuery.isPending ? (
        <WeeklySkeleton />
      ) : challengesQuery.isError ? (
        <p
          role="alert"
          className="rounded-xl border border-error/30 bg-error/10 p-5 text-center text-sm text-fg"
        >
          {t('weekly.error')}
        </p>
      ) : challenges.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="flex flex-col gap-3">
          {challenges.map((c, i) => {
            const progress = progressQueries[i]?.data ?? null
            return (
              <li key={c.id}>
                <ChallengeCard
                  challenge={c}
                  lang={lang}
                  done={progress?.current_position ?? 0}
                  completed={!!progress?.completed_at}
                  onSelect={() =>
                    navigate({ to: '/weekly/$id', params: { id: c.id } })
                  }
                />
              </li>
            )
          })}
        </ul>
      )}

      <AppCta />
    </div>
  )
}

function ChallengeCard({
  challenge,
  lang,
  done,
  completed,
  onSelect,
}: {
  challenge: WeeklyChallenge
  lang: 'fr' | 'en'
  done: number
  completed: boolean
  onSelect: () => void
}) {
  const t = useT()
  const total = challenge.total_questions
  const isDone = completed || (total > 0 && done >= total)
  const description = themeDescription(challenge, lang)
  const typeKey =
    challenge.challenge_type === 'news' ? 'weekly.type.news' : 'weekly.type.themed'

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-start gap-4 rounded-2xl border border-white/10 bg-surface p-4 text-left transition-colors hover:border-primary/60"
    >
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
        style={{ backgroundColor: `${challenge.color}22` }}
        aria-hidden="true"
      >
        {challenge.emoji}
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 className="truncate font-bold text-fg">
            {themeLabel(challenge, lang)}
          </h2>
          <span className="shrink-0 rounded-full bg-accent2/15 px-2 py-0.5 text-[11px] font-semibold text-accent2">
            {t(typeKey)}
          </span>
        </div>

        {description ? (
          <p className="line-clamp-2 text-sm text-fg/60">{description}</p>
        ) : null}

        <div className="mt-1 flex items-center gap-3 text-xs text-fg/50">
          <span>
            {total} {t('weekly.questions')}
          </span>
          {isDone ? (
            <span className="font-semibold text-success">
              {t('weekly.completed.badge')}
            </span>
          ) : done > 0 ? (
            <span className="font-medium text-primary">
              {done}/{total}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  )
}

function EmptyState() {
  const t = useT()
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-surface p-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        <CalendarDays className="h-7 w-7" aria-hidden="true" />
      </span>
      <div>
        <h2 className="text-lg font-bold text-fg">{t('weekly.empty.title')}</h2>
        <p className="mt-1 text-sm text-fg/60">{t('weekly.empty.subtitle')}</p>
      </div>
    </div>
  )
}

function WeeklySkeleton() {
  return (
    <ul className="flex flex-col gap-3" aria-hidden="true">
      {Array.from({ length: 2 }).map((_, i) => (
        <li
          key={i}
          className="h-24 animate-pulse rounded-2xl border border-white/10 bg-surface"
        />
      ))}
    </ul>
  )
}

function AppCta() {
  const t = useT()
  return (
    <div className="mt-2 rounded-2xl border border-white/10 bg-surface p-5 text-center">
      <p className="text-sm font-semibold text-fg">{t('weekly.cta.title')}</p>
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
