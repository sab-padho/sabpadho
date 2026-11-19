import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })

  const update = useCallback(
    (next: T | ((current: T) => T)) => {
      setValue((current) => {
        const resolved = typeof next === 'function' ? (next as (c: T) => T)(current) : next
        try {
          localStorage.setItem(key, JSON.stringify(resolved))
        } catch {
          /* ignore quota errors */
        }
        return resolved
      })
    },
    [key],
  )

  return [value, update] as const
}

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · SabPadho` : 'SabPadho: Sab padho, sab badho.'
  }, [title])
}

export function useScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  )
  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches)
    setMatches(mql.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])
  return matches
}

/** Copy that writes to the clipboard and reports whether it worked. */
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
