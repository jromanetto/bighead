import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import {   t as translate } from './strings'
import type {Lang, StringKey} from './strings';

const STORAGE_KEY = 'bighead.lang'

type LangContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: StringKey) => string
  /**
   * `true` once the client preference has been resolved post-hydration.
   * During SSR / the first client render this is `false` and `lang` is still
   * the placeholder default ('fr'). Consumers that fetch language-dependent
   * data (e.g. game questions) should wait for `ready` so they don't fetch in
   * the wrong language.
   */
  ready: boolean
}

const LangContext = createContext<LangContextValue | null>(null)

/** Detects the initial language: stored choice > browser locale > 'fr'. */
function detectInitialLang(): Lang {
  if (typeof window === 'undefined') return 'fr'

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'fr' || stored === 'en') return stored
  } catch {
    // localStorage may be unavailable (private mode); fall through.
  }

  const nav = window.navigator.language
  return nav.toLowerCase().startsWith('fr') ? 'fr' : 'en'
}

export function LangProvider({ children }: { children: ReactNode }) {
  // SSR-safe default; the effect below syncs to the real client preference.
  const [lang, setLangState] = useState<Lang>('fr')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setLangState(detectInitialLang())
    setReady(true)
  }, [])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Ignore persistence failures.
    }
  }, [])

  const t = useCallback((key: StringKey) => translate(key, lang), [lang])

  return (
    <LangContext.Provider value={{ lang, setLang, t, ready }}>
      {children}
    </LangContext.Provider>
  )
}

function useLangContext(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within a LangProvider')
  return ctx
}

export function useLang(): LangContextValue {
  return useLangContext()
}

/** Convenience hook returning just the translate function. */
export function useT(): (key: StringKey) => string {
  return useLangContext().t
}
