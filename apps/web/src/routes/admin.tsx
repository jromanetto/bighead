import { useEffect, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { getBrowserClient } from '#/lib/supabase/client'
import { getAdminOverview } from '#/lib/admin/overview'

import type { SignupPoint, TopXpEntry } from '#/lib/admin/overview'

export const Route = createFileRoute('/admin')({ component: AdminScreen })

/** The only email allowed to view the dashboard. The RPC re-checks server-side. */
const ADMIN_EMAIL = 'julien@romanetto.com'

/** Resolves the signed-in email client-side; `null` until resolved. */
function useAuthEmail(): { email: string | null; ready: boolean } {
  const [email, setEmail] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let cancelled = false
    void getBrowserClient()
      .auth.getUser()
      .then(({ data }) => {
        if (cancelled) return
        setEmail(data.user?.email ?? null)
        setReady(true)
      })
      .catch(() => {
        if (!cancelled) setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [])
  return { email, ready }
}

function AdminScreen() {
  const { email, ready } = useAuthEmail()
  const isAdmin = ready && email === ADMIN_EMAIL

  // SSR / pre-auth: render a neutral loading state (no data fetched yet).
  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="animate-pulse text-fg/60">Chargement…</p>
      </div>
    )
  }

  if (!isAdmin) {
    return <Forbidden />
  }

  return <Dashboard />
}

function Forbidden() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
      <h1 className="text-2xl font-bold text-fg">Accès réservé</h1>
      <p className="text-fg/60">
        Cette page est réservée à l’administrateur. Connecte-toi avec le compte
        autorisé pour y accéder.
      </p>
      <Link
        to="/auth"
        className="rounded-xl bg-primary px-5 py-3 font-bold text-bg transition-opacity hover:opacity-90"
      >
        Se connecter
      </Link>
    </div>
  )
}

function Dashboard() {
  const query = useQuery({
    queryKey: ['admin-overview'],
    queryFn: getAdminOverview,
    // Always re-check on refetch; this is a low-traffic internal view.
    staleTime: 0,
  })

  if (query.isPending) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl border border-white/10 bg-surface"
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    )
  }

  if (query.isError) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-bold text-fg">Erreur</h1>
        <p className="text-fg/60">
          Impossible de charger les statistiques. Réessaie.
        </p>
        <button
          type="button"
          onClick={() => void query.refetch()}
          className="rounded-xl bg-primary px-5 py-3 font-bold text-bg transition-opacity hover:opacity-90"
        >
          Réessayer
        </button>
      </div>
    )
  }

  const data = query.data

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-fg">Admin</h1>
          <p className="text-sm text-fg/50">
            généré à {formatDate(data.generated_at)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void query.refetch()}
          disabled={query.isFetching}
          className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-fg/80 transition-colors hover:border-primary/60 hover:text-fg disabled:opacity-60"
        >
          {query.isFetching ? 'Actualisation…' : 'Actualiser'}
        </button>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-fg/50">
          Utilisateurs
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <Kpi label="Total" value={data.users_total} highlight />
          <Kpi label="Inscrits" value={data.users_registered} />
          <Kpi label="Anonymes" value={data.users_anon} />
          <Kpi label="Nouveaux 24h" value={data.new_users_24h} />
          <Kpi label="Nouveaux 7j" value={data.new_users_7d} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-fg/50">
          Jeu
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <Kpi label="Parties total" value={data.games_total} highlight />
          <Kpi label="Parties 24h" value={data.games_24h} />
          <Kpi label="Daily total" value={data.daily_plays_total} />
          <Kpi label="Daily aujourd’hui" value={data.daily_plays_today} />
          <Kpi label="Weekly joueurs" value={data.weekly_players} />
          <Kpi
            label="Weekly actifs"
            value={data.weekly_active_challenges}
          />
          <Kpi label="Questions" value={data.questions_total} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-fg/50">
          Duels
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <Kpi label="Total" value={data.duels_total} highlight />
          <Kpi label="24h" value={data.duels_24h} />
          <Kpi label="Terminés" value={data.duels_completed} />
          <Kpi label="Ouverts en attente" value={data.duels_open_pending} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <SignupsChart points={data.signups_14d} />
        <TopXp entries={data.top_xp} />
      </section>
    </div>
  )
}

function Kpi({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: number
  highlight?: boolean
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface p-4">
      <p className="text-xs uppercase tracking-wide text-fg/50">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold tabular-nums ${
          highlight ? 'text-primary' : 'text-fg'
        }`}
      >
        {formatNumber(value)}
      </p>
    </div>
  )
}

/** Pure-CSS bar chart of the 14-day signups series. */
function SignupsChart({ points }: { points: SignupPoint[] }) {
  const max = points.reduce((m, p) => Math.max(m, p.n), 0)

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-surface p-5">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-fg/50">
        Inscriptions (14 jours)
      </h2>
      {points.length === 0 ? (
        <p className="py-8 text-center text-sm text-fg/50">Aucune donnée</p>
      ) : (
        <div className="flex h-40 items-end gap-1.5">
          {points.map((p) => {
            const pct = max > 0 ? Math.round((p.n / max) * 100) : 0
            return (
              <div
                key={p.d}
                className="flex min-w-0 flex-1 flex-col items-center gap-1"
                title={`${p.d}: ${p.n}`}
              >
                <span className="text-[10px] tabular-nums text-fg/60">
                  {p.n}
                </span>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t bg-primary/70"
                    style={{ height: `${Math.max(pct, p.n > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <span className="text-[9px] tabular-nums text-fg/40">
                  {dayLabel(p.d)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TopXp({ entries }: { entries: TopXpEntry[] }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-surface p-5">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-fg/50">
        Top XP
      </h2>
      {entries.length === 0 ? (
        <p className="py-8 text-center text-sm text-fg/50">Aucune donnée</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {entries.map((e, i) => (
            <li
              key={`${e.username}-${i}`}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-bg px-3 py-2 text-sm"
            >
              <span className="w-6 shrink-0 text-center font-bold tabular-nums text-fg/60">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium text-fg">
                {e.username || 'anon'}
              </span>
              <span className="shrink-0 font-bold tabular-nums text-primary">
                {formatNumber(e.xp)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Formats a number with thin spaces for thousands (fr-friendly). */
function formatNumber(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n)
}

/** Formats an ISO timestamp; falls back to the raw string on parse failure. */
function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('fr-FR')
}

/** Short DD/MM label for a YYYY-MM-DD day key. */
function dayLabel(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}
