import { useEffect, useId, useRef, useState } from 'react'
import { motion } from 'framer-motion'

import { useT } from '#/lib/i18n/LangProvider'
import { upgradeAccount } from '#/lib/funnel/account'
import { APP_STORE_URL, PLAY_STORE_URL } from '#/lib/funnel/appLinks'
import { trackInstall } from '#/lib/analytics'

export interface AccountPromptProps {
  open: boolean
  onClose: () => void
}

type Status = 'idle' | 'loading' | 'success' | 'error'

/**
 * Dismissable account-creation modal shown by the free-play gate.
 *
 * Non-blocking: backdrop click, the close button and Esc all call `onClose`,
 * keeping the user in the game. Converting the anonymous user keeps their id and
 * therefore their progress.
 */
export function AccountPrompt({ open, onClose }: AccountPromptProps) {
  const t = useT()
  const titleId = useId()
  const descId = useId()
  const emailRef = useRef<HTMLInputElement>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Focus the first field and wire an Esc handler while open; clean both up on
  // close so we never leak a listener.
  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)

    const focusTimer = window.setTimeout(() => emailRef.current?.focus(), 0)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.clearTimeout(focusTimer)
    }
  }, [open, onClose])

  // Reset transient form state each time the modal opens.
  useEffect(() => {
    if (open) {
      setStatus('idle')
      setErrorMsg('')
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'loading') return
    setStatus('loading')
    setErrorMsg('')

    const result = await upgradeAccount(email, password)
    if (result.ok) {
      setStatus('success')
    } else {
      setStatus('error')
      setErrorMsg(result.error || t('prompt.error'))
    }
  }

  if (!open) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label={t('prompt.close')}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-surface p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('prompt.close')}
          className="absolute right-4 top-4 text-fg/50 transition-colors hover:text-fg"
        >
          ✕
        </button>

        <h2 id={titleId} className="pr-6 text-xl font-bold text-fg">
          {t('prompt.title')}
        </h2>
        <p id={descId} className="mt-1 text-sm text-fg/60">
          {t('prompt.subtitle')}
        </p>

        {status === 'success' ? (
          <p
            role="status"
            className="mt-5 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm font-medium text-fg"
          >
            {t('prompt.success')}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm text-fg/70">
              {t('prompt.email')}
              <input
                ref={emailRef}
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
                autoComplete="new-password"
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
              {status === 'loading' ? t('prompt.creating') : t('prompt.create')}
            </button>
          </form>
        )}

        {/* Download-the-app block */}
        <div className="mt-6 rounded-xl border border-white/10 bg-bg/60 p-4">
          <p className="text-sm font-semibold text-fg">
            {t('prompt.download.title')}
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackInstall('ios', 'account_prompt')}
              className="flex-1 rounded-xl bg-fg px-4 py-2.5 text-center text-sm font-semibold text-bg transition-opacity hover:opacity-90"
            >
              {t('promo.appStore')}
            </a>
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackInstall('android', 'account_prompt')}
              className="flex-1 rounded-xl border border-white/20 px-4 py-2.5 text-center text-sm font-semibold text-fg transition-colors hover:bg-white/5"
            >
              {t('promo.googlePlay')}
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
