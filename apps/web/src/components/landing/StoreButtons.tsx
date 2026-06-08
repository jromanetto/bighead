import { Apple, Play } from 'lucide-react'

import { useT } from '#/lib/i18n/LangProvider'
import { APP_STORE_URL, PLAY_STORE_URL } from '#/lib/funnel/appLinks'

/**
 * The App Store + Google Play download buttons, styled as the familiar
 * two-line store badges. Used in the hero, the app-funnel section and the
 * footer. Links resolve to the public store URLs from `appLinks`.
 */
export function StoreButtons({ className = '' }: { className?: string }) {
  const t = useT()

  return (
    <div className={`flex flex-col gap-3 sm:flex-row ${className}`}>
      <a
        href={APP_STORE_URL}
        className="group flex items-center gap-3 rounded-xl border border-white/15 bg-fg px-5 py-3 text-bg transition-transform hover:-translate-y-0.5 focus-visible:-translate-y-0.5"
      >
        <Apple className="h-7 w-7 shrink-0" aria-hidden="true" />
        <span className="flex flex-col leading-tight text-left">
          <span className="text-[0.65rem] font-medium opacity-70">
            {t('landing.app.appStore.sub')}
          </span>
          <span className="text-base font-bold">{t('landing.app.appStore')}</span>
        </span>
      </a>

      <a
        href={PLAY_STORE_URL}
        className="group flex items-center gap-3 rounded-xl border border-white/20 bg-surface px-5 py-3 text-fg transition-transform hover:-translate-y-0.5 hover:border-primary/60 focus-visible:-translate-y-0.5"
      >
        <Play className="h-7 w-7 shrink-0 fill-primary text-primary" aria-hidden="true" />
        <span className="flex flex-col leading-tight text-left">
          <span className="text-[0.65rem] font-medium text-fg/60">
            {t('landing.app.googlePlay.sub')}
          </span>
          <span className="text-base font-bold">{t('landing.app.googlePlay')}</span>
        </span>
      </a>
    </div>
  )
}
