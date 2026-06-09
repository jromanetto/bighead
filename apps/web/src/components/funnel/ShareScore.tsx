import { useEffect, useRef, useState } from 'react'
import { Check, Share2 } from 'lucide-react'

import { useT } from '#/lib/i18n/LangProvider'
import { SITE_URL } from '#/lib/funnel/appLinks'
import { EV, track } from '#/lib/analytics'

export interface ShareScoreProps {
  /** Pre-built, localized share message (no hardcoded copy passed from callers). */
  message: string
  /** Landing URL for recipients. Defaults to the play hub. */
  url?: string
}

const DEFAULT_URL = `${SITE_URL}/play`

/**
 * Viral share affordance for results. Uses the Web Share API when available
 * (mobile/most browsers); otherwise copies "{message} {url}" to the clipboard
 * and flashes a "Copié !" toast. Also offers WhatsApp / X fallback links.
 *
 * SSR-safe: every navigator/clipboard access lives inside event handlers and
 * guards `typeof navigator`, so nothing touches browser APIs during render.
 */
export function ShareScore({ message, url = DEFAULT_URL }: ShareScoreProps) {
  const t = useT()
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    },
    [],
  )

  const clipboardText = `${message} ${url}`
  const encoded = encodeURIComponent(clipboardText)
  const whatsappUrl = `https://wa.me/?text=${encoded}`
  const xUrl = `https://twitter.com/intent/tweet?text=${encoded}`

  function flashCopied() {
    setCopied(true)
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setCopied(false), 2000)
  }

  async function copy() {
    if (typeof navigator === 'undefined') return
    try {
      // Clipboard may be undefined on insecure contexts; the try/catch covers it.
      await navigator.clipboard.writeText(clipboardText)
      track(EV.shareClicked, { method: 'copy' })
      flashCopied()
    } catch {
      // Clipboard can be blocked (permissions / insecure context); ignore.
    }
  }

  async function share() {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ text: message, url })
        track(EV.shareClicked, { method: 'native' })
        return
      } catch {
        // User dismissed or share failed → fall back to copy.
      }
    }
    void copy()
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <button
        type="button"
        onClick={share}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-bg transition-opacity hover:opacity-90"
      >
        {copied ? (
          <Check className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Share2 className="h-5 w-5" aria-hidden="true" />
        )}
        {copied ? t('share.copied') : t('share.cta')}
      </button>
      <div className="flex gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track(EV.shareClicked, { method: 'whatsapp' })}
          className="flex-1 rounded-xl border border-white/15 px-4 py-2 text-center text-sm font-semibold text-fg/80 transition-colors hover:border-primary/60 hover:text-fg"
        >
          {t('share.whatsapp')}
        </a>
        <a
          href={xUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track(EV.shareClicked, { method: 'x' })}
          className="flex-1 rounded-xl border border-white/15 px-4 py-2 text-center text-sm font-semibold text-fg/80 transition-colors hover:border-primary/60 hover:text-fg"
        >
          {t('share.x')}
        </a>
      </div>
    </div>
  )
}
