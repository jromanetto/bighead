import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Swords, UserPlus } from 'lucide-react'

import { useLang, useT } from '#/lib/i18n/LangProvider'
import { useSession } from '#/lib/auth/SessionProvider'
import { SessionError } from '#/components/SessionError'
import { EV, track, trackInstall } from '#/lib/analytics'
import { APP_STORE_URL, PLAY_STORE_URL } from '#/lib/funnel/appLinks'
import {
  DUEL_CATEGORIES,
  NoOpponentError,
  categorizeDuel,
  createOpenDuel,
  createQuickDuel,
  getMyDuels,
} from '#/lib/game/duels'

import type { DuelBucket, DuelInboxItem } from '#/lib/game/duels'
import type { StringKey } from '#/lib/i18n/strings'

export const Route = createFileRoute('/duels/')({ component: Duels })

function categoryLabel(
  t: (k: StringKey) => string,
  category: string | null,
): string {
  if (!category) return t('duels.new.random')
  const key = `category.${category}` as StringKey
  const label = t(key)
  // `t` echoes unknown keys; fall back to the raw value in that case.
  return label === key ? category : label
}

/** Outcome of a finished duel from the current user's perspective. */
function outcomeKey(
  item: DuelInboxItem,
  userId: string | null,
): 'duels.outcome.won' | 'duels.outcome.lost' | 'duels.outcome.draw' {
  if (!item.winner_id) return 'duels.outcome.draw'
  return item.winner_id === userId ? 'duels.outcome.won' : 'duels.outcome.lost'
}

function Duels() {
  const t = useT()
  const { lang } = useLang()
  const { userId, sessionReady, error: sessionFailed } = useSession()
  const navigate = useNavigate()

  // `picking` is null when closed, else the mode being created.
  const [picking, setPicking] = useState<'quick' | 'invite' | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)

  const query = useQuery({
    queryKey: ['my-duels'],
    queryFn: getMyDuels,
    enabled: sessionReady && !!userId,
  })

  const createMutation = useMutation({
    mutationFn: ({
      category,
      mode,
    }: {
      category: string | null
      mode: 'quick' | 'invite'
    }) =>
      mode === 'invite'
        ? createOpenDuel(category, lang)
        : createQuickDuel(category, lang),
    onSuccess: (id, variables) => {
      track(EV.duelCreated, {
        mode: variables.mode,
        category: variables.category ?? 'random',
      })
      setPicking(null)
      void navigate({ to: '/duels/$id', params: { id } })
    },
    onError: (err) => {
      setCreateError(
        err instanceof NoOpponentError
          ? t('duels.noOpponent')
          : t('duels.createError'),
      )
    },
  })

  function startDuel(category: string | null) {
    setCreateError(null)
    createMutation.mutate({ category, mode: picking ?? 'quick' })
  }

  if (sessionReady && sessionFailed) {
    return <SessionError />
  }

  const buckets = groupByBucket(query.data ?? [])

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-fg">{t('duels.title')}</h1>
        <p className="text-fg/60">{t('duels.subtitle')}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            setCreateError(null)
            setPicking('quick')
          }}
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-bg transition-opacity hover:opacity-90"
        >
          <Swords className="h-5 w-5" aria-hidden="true" />
          {t('duels.new')}
        </button>
        <button
          type="button"
          onClick={() => {
            setCreateError(null)
            setPicking('invite')
          }}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-primary/60 px-5 py-3 font-bold text-fg transition-colors hover:bg-primary/10"
        >
          <UserPlus className="h-5 w-5" aria-hidden="true" />
          {t('duels.invite')}
        </button>
      </div>

      {createError ? (
        <p
          role="alert"
          className="rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-fg"
        >
          {createError}
        </p>
      ) : null}

      {!sessionReady || query.isPending ? (
        <DuelsSkeleton />
      ) : query.isError ? (
        <p
          role="alert"
          className="rounded-xl border border-error/30 bg-error/10 p-5 text-center text-sm text-fg"
        >
          {t('duels.error')}
        </p>
      ) : buckets.my_turn.length +
          buckets.waiting.length +
          buckets.finished.length ===
        0 ? (
        <EmptyState onStart={() => setPicking('quick')} />
      ) : (
        <div className="flex flex-col gap-6">
          <Section
            titleKey="duels.section.myTurn"
            items={buckets.my_turn}
            userId={userId}
            onSelect={(id) => navigate({ to: '/duels/$id', params: { id } })}
          />
          <Section
            titleKey="duels.section.waiting"
            items={buckets.waiting}
            userId={userId}
          />
          <Section
            titleKey="duels.section.finished"
            items={buckets.finished}
            userId={userId}
            onSelect={(id) => navigate({ to: '/duels/$id', params: { id } })}
          />
        </div>
      )}

      <AppCta />

      {picking ? (
        <CategoryPicker
          mode={picking}
          pending={createMutation.isPending}
          onPick={startDuel}
          onClose={() => setPicking(null)}
        />
      ) : null}
    </div>
  )
}

function groupByBucket(
  items: DuelInboxItem[],
): Record<Exclude<DuelBucket, 'expired'>, DuelInboxItem[]> {
  const result = {
    my_turn: [] as DuelInboxItem[],
    waiting: [] as DuelInboxItem[],
    finished: [] as DuelInboxItem[],
  }
  for (const item of items) {
    const bucket = categorizeDuel(item)
    if (bucket === 'expired') continue
    result[bucket].push(item)
  }
  return result
}

function Section({
  titleKey,
  items,
  userId,
  onSelect,
}: {
  titleKey: StringKey
  items: DuelInboxItem[]
  userId: string | null
  onSelect?: (id: string) => void
}) {
  const t = useT()
  if (items.length === 0) return null
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-fg/50">
        {t(titleKey)}
      </h2>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <DuelRowItem
            key={item.duel_id}
            item={item}
            userId={userId}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </section>
  )
}

function DuelRowItem({
  item,
  userId,
  onSelect,
}: {
  item: DuelInboxItem
  userId: string | null
  onSelect?: (id: string) => void
}) {
  const t = useT()
  const bucket = categorizeDuel(item)
  const name =
    item.opponent_username && item.opponent_username.trim()
      ? item.opponent_username
      : t('duels.opponent.anon')

  const clickable = !!onSelect
  const Wrapper = clickable ? 'button' : 'div'

  return (
    <li>
      <Wrapper
        type={clickable ? 'button' : undefined}
        onClick={clickable ? () => onSelect(item.duel_id) : undefined}
        className={
          'flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-surface px-4 py-3 text-left ' +
          (clickable
            ? 'cursor-pointer transition-colors hover:border-primary/60'
            : '')
        }
      >
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium text-fg">{name}</span>
          <span className="text-xs text-fg/50">
            {categoryLabel(t, item.category)}
          </span>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-0.5">
          {bucket === 'finished' ? (
            <>
              <span className="text-sm font-bold tabular-nums text-fg">
                {item.my_score} – {item.opponent_score ?? 0}
              </span>
              <span
                className={
                  'text-xs font-semibold ' +
                  (outcomeKey(item, userId) === 'duels.outcome.won'
                    ? 'text-success'
                    : outcomeKey(item, userId) === 'duels.outcome.lost'
                      ? 'text-error'
                      : 'text-fg/60')
                }
              >
                {t(outcomeKey(item, userId))}
              </span>
            </>
          ) : (
            <span className="text-xs font-medium text-fg/60">
              {bucket === 'my_turn'
                ? t('duels.status.yourTurn')
                : t('duels.status.awaiting')}
            </span>
          )}
        </div>
      </Wrapper>
    </li>
  )
}

function CategoryPicker({
  mode,
  pending,
  onPick,
  onClose,
}: {
  mode: 'quick' | 'invite'
  pending: boolean
  onPick: (category: string | null) => void
  onClose: () => void
}) {
  const t = useT()
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('duels.new.title')}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-white/10 bg-surface p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-fg">{t('duels.new.title')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-fg/60 transition-colors hover:text-fg"
          >
            {t('duels.new.cancel')}
          </button>
        </div>

        {pending ? (
          <p className="animate-pulse py-6 text-center text-sm text-fg/60">
            {mode === 'invite'
              ? t('duel.invite.accepting')
              : t('duels.new.creating')}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onPick(null)}
              className="col-span-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-bg transition-opacity hover:opacity-90"
            >
              {t('duels.new.random')}
            </button>
            {DUEL_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => onPick(category)}
                className="rounded-xl border border-white/10 bg-bg px-4 py-2.5 text-sm font-medium text-fg transition-colors hover:border-primary/60"
              >
                {categoryLabel(t, category)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ onStart }: { onStart: () => void }) {
  const t = useT()
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-surface p-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        <Swords className="h-7 w-7" aria-hidden="true" />
      </span>
      <div>
        <h2 className="text-lg font-bold text-fg">{t('duels.empty.title')}</h2>
        <p className="mt-1 text-sm text-fg/60">{t('duels.empty.subtitle')}</p>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="rounded-xl bg-primary px-5 py-3 font-bold text-bg transition-opacity hover:opacity-90"
      >
        {t('duels.empty.cta')}
      </button>
    </div>
  )
}

function DuelsSkeleton() {
  return (
    <ul className="flex flex-col gap-2" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <li
          key={i}
          className="h-16 animate-pulse rounded-xl border border-white/10 bg-surface"
        />
      ))}
    </ul>
  )
}

function AppCta() {
  const t = useT()
  return (
    <div className="mt-2 rounded-2xl border border-white/10 bg-surface p-5 text-center">
      <p className="text-sm font-semibold text-fg">{t('duels.cta.title')}</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackInstall('ios', 'duels_cta')}
          className="rounded-xl bg-fg px-4 py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
        >
          {t('promo.appStore')}
        </a>
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackInstall('android', 'duels_cta')}
          className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-fg transition-colors hover:bg-white/5"
        >
          {t('promo.googlePlay')}
        </a>
      </div>
    </div>
  )
}
