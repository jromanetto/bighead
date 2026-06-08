import { useT } from '#/lib/i18n/LangProvider'

/**
 * Shown when the client could not establish an anonymous session (e.g. Supabase
 * per-IP rate limit). Lets the user retry without crashing the app shell.
 */
export function SessionError() {
  const t = useT()
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
      <h1 className="text-2xl font-bold text-fg">{t('session.error.title')}</h1>
      <p className="text-fg/60">{t('session.error.subtitle')}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-xl bg-primary px-5 py-3 font-bold text-bg transition-opacity hover:opacity-90"
      >
        {t('game.retry')}
      </button>
    </div>
  )
}
