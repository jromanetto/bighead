import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'

import { useT } from '#/lib/i18n/LangProvider'
import { signIn, upgradeAccount } from '#/lib/funnel/account'

export const Route = createFileRoute('/auth')({ component: AuthScreen })

type Status = 'idle' | 'loading' | 'success' | 'error'

function AuthScreen() {
  const t = useT()

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-bold text-fg">{t('auth.title')}</h1>
      </div>

      <AccountForm
        title={t('auth.create.title')}
        subtitle={t('auth.create.subtitle')}
        cta={t('auth.create.title')}
        loadingLabel={t('prompt.creating')}
        successLabel={t('prompt.success')}
        autoComplete="new-password"
        action={upgradeAccount}
      />

      <AccountForm
        title={t('auth.signin.title')}
        cta={t('auth.signin.cta')}
        loadingLabel={t('auth.signin.loading')}
        successLabel={t('auth.signin.success')}
        autoComplete="current-password"
        action={signIn}
      />

      <Link
        to="/play"
        className="text-center text-sm font-medium text-fg/60 transition-colors hover:text-fg"
      >
        {t('auth.backToPlay')}
      </Link>
    </div>
  )
}

function AccountForm({
  title,
  subtitle,
  cta,
  loadingLabel,
  successLabel,
  autoComplete,
  action,
}: {
  title: string
  subtitle?: string
  cta: string
  loadingLabel: string
  successLabel: string
  autoComplete: 'new-password' | 'current-password'
  action: (
    email: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>
}) {
  const t = useT()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'loading') return
    setStatus('loading')
    setErrorMsg('')

    const result = await action(email, password)
    if (result.ok) {
      setStatus('success')
    } else {
      setStatus('error')
      setErrorMsg(result.error || t('auth.error'))
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-surface p-6">
      <h2 className="text-lg font-bold text-fg">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-fg/60">{subtitle}</p> : null}

      {status === 'success' ? (
        <p
          role="status"
          className="mt-4 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm font-medium text-fg"
        >
          {successLabel}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-fg/70">
            {t('prompt.email')}
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-white/15 bg-bg px-3 py-2.5 text-fg outline-none focus:border-primary"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-fg/70">
            {t('prompt.password')}
            <input
              type="password"
              required
              minLength={6}
              autoComplete={autoComplete}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-white/15 bg-bg px-3 py-2.5 text-fg outline-none focus:border-primary"
            />
          </label>

          {status === 'error' ? (
            <p role="alert" className="text-sm text-red-400">
              {errorMsg}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="mt-1 w-full rounded-xl bg-primary px-4 py-3 font-bold text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {status === 'loading' ? loadingLabel : cta}
          </button>
        </form>
      )}
    </section>
  )
}
