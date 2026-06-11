import { useEffect, useState } from 'react'
import { Bell, BellOff } from 'lucide-react'

import { useLang, useT } from '#/lib/i18n/LangProvider'
import { EV, track } from '#/lib/analytics'
import {
  getPushStatus,
  subscribeToPush,
  unsubscribeFromPush,
} from '#/lib/push'

import type { PushStatus } from '#/lib/push'

/**
 * Opt-in au rappel quotidien (web push). Rendu nul tant que le statut n'est
 * pas connu, si le navigateur ne supporte pas le push, ou si la permission a
 * été refusée (impossible de re-prompter — inutile d'afficher un bouton mort).
 */
export function PushOptIn() {
  const t = useT()
  const { lang } = useLang()
  const [status, setStatus] = useState<PushStatus | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    getPushStatus()
      .then((s) => {
        if (active) setStatus(s)
      })
      .catch(() => {
        if (active) setStatus('unsupported')
      })
    return () => {
      active = false
    }
  }, [])

  if (status === null || status === 'unsupported' || status === 'denied') {
    return null
  }

  async function toggle() {
    if (busy) return
    setBusy(true)
    try {
      if (status === 'subscribed') {
        setStatus(await unsubscribeFromPush())
        track(EV.pushUnsubscribed)
      } else {
        const next = await subscribeToPush(lang)
        setStatus(next)
        if (next === 'subscribed') track(EV.pushSubscribed)
      }
    } catch (err) {
      console.warn('push toggle failed', err)
    } finally {
      setBusy(false)
    }
  }

  if (status === 'subscribed') {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className="flex items-center gap-2 self-start text-xs text-fg/50 transition-colors hover:text-fg"
      >
        <BellOff className="h-3.5 w-3.5" aria-hidden="true" />
        {t('push.disable')}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-surface p-4 text-left transition-colors hover:border-primary/60 disabled:opacity-60"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Bell className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-sm font-bold text-fg">{t('push.title')}</span>
        <span className="text-xs text-fg/60">{t('push.subtitle')}</span>
      </span>
    </button>
  )
}
