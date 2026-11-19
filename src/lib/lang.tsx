import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useLocalStorage } from './hooks'

export type Lang = 'en' | 'hi'

export type Bilingual = Record<Lang, string>

type LangContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  toggle: () => void
}

const LangContext = createContext<LangContextValue | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useLocalStorage<Lang>('sabpadho-lang', 'en')

  useEffect(() => {
    document.documentElement.lang = lang === 'hi' ? 'hi' : 'en'
  }, [lang])

  const value = useMemo(
    () => ({
      lang,
      setLang,
      toggle: () => setLang(lang === 'en' ? 'hi' : 'en'),
    }),
    [lang, setLang],
  )

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside LangProvider')
  return ctx
}

export function pick(value: Bilingual, lang: Lang) {
  return value[lang]
}
