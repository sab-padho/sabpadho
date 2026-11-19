import { shelfItems } from '../data/learner'
import { useLocalStorage } from './hooks'

export type ShelfEntry = {
  questionId: string
  savedOn: string
  note?: string
}

const STORAGE_KEY = 'sabpadho-shelf'

export function formatSavedOn(date = new Date()) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function useShelf() {
  const [entries, setEntries] = useLocalStorage<ShelfEntry[]>(STORAGE_KEY, shelfItems)

  return {
    entries,
    has: (questionId: string) => entries.some((entry) => entry.questionId === questionId),
    add: (questionId: string) =>
      setEntries((current) =>
        current.some((entry) => entry.questionId === questionId)
          ? current
          : [{ questionId, savedOn: formatSavedOn() }, ...current],
      ),
    remove: (questionId: string) =>
      setEntries((current) => current.filter((entry) => entry.questionId !== questionId)),
    toggle: (questionId: string) =>
      setEntries((current) =>
        current.some((entry) => entry.questionId === questionId)
          ? current.filter((entry) => entry.questionId !== questionId)
          : [{ questionId, savedOn: formatSavedOn() }, ...current],
      ),
  }
}

const REVISION_KEY = 'sabpadho-revision-done'

export function useRevisionDone() {
  const [done, setDone] = useLocalStorage<string[]>(REVISION_KEY, [])
  return {
    done,
    markDone: (questionId: string) =>
      setDone((current) => (current.includes(questionId) ? current : [...current, questionId])),
    reset: () => setDone([]),
  }
}

const EXTRA_REVISION_KEY = 'sabpadho-extra-revision'

export function useExtraRevision() {
  const [ids, setIds] = useLocalStorage<string[]>(EXTRA_REVISION_KEY, [])
  return {
    ids,
    addMany: (questionIds: string[]) =>
      setIds((current) => Array.from(new Set([...current, ...questionIds]))),
    reset: () => setIds([]),
  }
}
