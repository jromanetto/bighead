import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQueries, useQuery } from '@tanstack/react-query'
import { CalendarDays } from 'lucide-react'

import { useLang, useT } from '#/lib/i18n/LangProvider'
import { useSession } from '#/lib/auth/SessionProvider'
import { SessionError } from '#/components/SessionError'
import { APP_STORE_URL, PLAY_STORE_URL } from '#/lib/funnel/appLinks'
import { trackInstall } from '#/lib/analytics'
import {
  getActiveChallenges,
  getChallengeHistory,
  getMyProgress,
  themeDescription,
  themeLabel,
} from '#/lib/game/weekly'

import type {
  ChallengeHistoryEntry,
  WeeklyChallenge,
} from '#/lib/game/weekly'

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

  // Past challenges (played or not) — the "Plus de quiz hebdo" shelf.
  const historyQuery = useQuery({
    queryKey: ['weekly-history'],
    queryFn: getChallengeHistory,
    enabled: sessionReady && !!userId,
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
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-fg/50">
            {t('weekly.thisWeek.title')}
          </h2>
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
        </section>
      )}

      <HistorySection
        entries={historyQuery.data ?? null}
        ready={sessionReady && !historyQuery.isPending}
        failed={historyQuery.isError}
        lang={lang}
        onSelect={(id) => navigate({ to: '/weekly/$id', params: { id } })}
      />

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
    challenge.challenge_type === 'news'
      ? 'weekly.type.news'
      : 'weekly.type.themed'

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

function HistorySection({
  entries,
  ready,
  failed,
  lang,
  onSelect,
}: {
  entries: ChallengeHistoryEntry[] | null
  ready: boolean
  failed: boolean
  lang: 'fr' | 'en'
  onSelect: (id: string) => void
}) {
  const t = useT()

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-fg/50">
          📚 {t('weekly.history.title')}
        </h2>
        <p className="text-xs text-fg/40">{t('weekly.history.subtitle')}</p>
      </div>

      {!ready ? (
        <WeeklySkeleton />
      ) : failed ? (
        <p
          role="alert"
          className="rounded-xl border border-error/30 bg-error/10 p-4 text-center text-sm text-fg"
        >
          {t('weekly.error')}
        </p>
      ) : !entries || entries.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-surface p-4 text-sm text-fg/60">
          {t('weekly.history.empty')}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {entries.map((e) => (
            <li key={e.challenge_id}>
              <HistoryCard entry={e} lang={lang} onSelect={onSelect} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** "1 – 7 juin" / "Jun 1 – 7" — distinguishes same-label entries (news weeks). */
function formatDateRange(start: string, end: string, lang: 'fr' | 'en'): string {
  const locale = lang === 'fr' ? 'fr-FR' : 'en-US'
  const s = new Date(`${start}T00:00:00Z`)
  const e = new Date(`${end}T00:00:00Z`)
  const opts: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }
  return `${s.toLocaleDateString(locale, opts)} – ${e.toLocaleDateString(locale, opts)}`
}

function HistoryCard({
  entry,
  lang,
  onSelect,
}: {
  entry: ChallengeHistoryEntry
  lang: 'fr' | 'en'
  onSelect: (id: string) => void
}) {
  const t = useT()
  const label = lang === 'fr' ? entry.theme_label_fr : entry.theme_label_en
  // correct_count null = never played (LEFT JOIN server-side).
  const hasPlayed = entry.correct_count !== null
  const cta = hasPlayed ? t('weekly.history.replay') : t('weekly.history.play')

  return (
    <button
      type="button"
      onClick={() => onSelect(entry.challenge_id)}
      className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-surface p-3 text-left transition-colors hover:border-primary/60"
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
        style={{ backgroundColor: `${entry.color}22` }}
        aria-hidden="true"
      >
        {entry.emoji}
      </span>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-bold text-fg">
          {label}
          <span className="ml-2 font-normal text-fg/40">
            {formatDateRange(entry.start_date, entry.end_date, lang)}
          </span>
        </span>
        <span className="mt-0.5 text-xs text-fg/50">
          {hasPlayed ? (
            <>
              {t('weekly.history.yourScore')}:{' '}
              <span className="font-semibold text-fg/80">
                {entry.correct_count}/{entry.total_questions}
              </span>
              {entry.best_replay_score !== null ? (
                <span className="ml-2 text-primary">
                  ↻ {t('weekly.history.bestReplay')}: {entry.best_replay_score}
                  /{entry.total_questions}
                </span>
              ) : null}
            </>
          ) : (
            t('weekly.history.notPlayed')
          )}
        </span>
      </div>

      <span className="shrink-0 rounded-xl border border-white/15 px-3 py-1.5 text-xs font-semibold text-fg/80">
        {hasPlayed ? '↻' : '▶'} {cta}
      </span>
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
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackInstall('ios', 'weekly_cta')}
          className="rounded-xl bg-fg px-4 py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
        >
          {t('promo.appStore')}
        </a>
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackInstall('android', 'weekly_cta')}
          className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-fg transition-colors hover:bg-white/5"
        >
          {t('promo.googlePlay')}
        </a>
      </div>
    </div>
  )
}
