import { useEffect, useState } from 'react'

import { useT } from '#/lib/i18n/LangProvider'
import { APP_STORE_URL, PLAY_STORE_URL } from '#/lib/funnel/appLinks'

/** localStorage key persisting the dismissed state. */
const DISMISSED_KEY = 'bh_banner_dismissed'

/**
 * Slim, app-wide, dismissable promo banner.
 *
 * Renders nothing until mounted (mounted-flag pattern) so the server-rendered
 * markup always matches the first client render — avoiding a hydration mismatch
 * caused by reading localStorage during render.
 */
export function AppPromoBanner() {
  const t = useT()
  const [mounted, setMounted] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      setDismissed(window.localStorage.getItem(DISMISSED_KEY) === '1')
    } catch {
      // localStorage unavailable (private mode); keep the banner visible.
    }
  }, [])

  function dismiss() {
    setDismissed(true)
    try {
      window.localStorage.setItem(DISMISSED_KEY, '1')
    } catch {
      // Ignore persistence failures.
    }
  }

  if (!mounted || dismissed) return null

  return (
    <div className="border-b border-white/10 bg-primary/10">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2 text-sm">
        <p className="flex-1 font-medium text-fg">{t('promo.banner.text')}</p>
        <a
          href={APP_STORE_URL}
          className="rounded-lg bg-fg px-3 py-1.5 text-xs font-semibold text-bg transition-opacity hover:opacity-90"
        >
          {t('promo.appStore')}
        </a>
        <a
          href={PLAY_STORE_URL}
          className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-fg transition-colors hover:bg-white/5"
        >
          {t('promo.googlePlay')}
        </a>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t('promo.banner.dismiss')}
          className="ml-1 text-fg/50 transition-colors hover:text-fg"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
