import { useEffect } from 'react'
import { shelfItems } from '../data/learner'
import { useAuth } from './auth'
import { useLocalStorage } from './hooks'
import { isSupabaseConfigured, supabase } from './supabase'

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
  const { email } = useAuth()
  const scopedKey = email ? `${STORAGE_KEY}-${email}` : STORAGE_KEY
  const [entries, setEntries] = useLocalStorage<ShelfEntry[]>(scopedKey, shelfItems)

  useEffect(() => {
    if (!email || !isSupabaseConfigured || !supabase) return
    let cancelled = false
    supabase
      .from('saved_questions')
      .select('question_id, saved_on, note')
      .eq('learner_email', email)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled || error || !data) return
        if (data.length > 0) {
          setEntries(
            data.map((row) => ({
              questionId: row.question_id as string,
              savedOn: row.saved_on as string,
              note: (row.note as string | null) ?? undefined,
            })),
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [email, setEntries])

  function syncAdd(questionId: string, savedOn: string) {
    if (!email || !isSupabaseConfigured || !supabase) return
    void supabase.from('saved_questions').upsert(
      {
        learner_email: email,
        question_id: questionId,
        saved_on: savedOn,
      },
      { onConflict: 'learner_email,question_id' },
    )
  }

  function syncRemove(questionId: string) {
    if (!email || !isSupabaseConfigured || !supabase) return
    void supabase
      .from('saved_questions')
      .delete()
      .eq('learner_email', email)
      .eq('question_id', questionId)
  }

  return {
    entries,
    has: (questionId: string) => entries.some((entry) => entry.questionId === questionId),
    add: (questionId: string) => {
      const savedOn = formatSavedOn()
      setEntries((current) => {
        if (current.some((entry) => entry.questionId === questionId)) return current
        syncAdd(questionId, savedOn)
        return [{ questionId, savedOn }, ...current]
      })
    },
    remove: (questionId: string) => {
      syncRemove(questionId)
      setEntries((current) => current.filter((entry) => entry.questionId !== questionId))
    },
    toggle: (questionId: string) => {
      const savedOn = formatSavedOn()
      setEntries((current) => {
        if (current.some((entry) => entry.questionId === questionId)) {
          syncRemove(questionId)
          return current.filter((entry) => entry.questionId !== questionId)
        }
        syncAdd(questionId, savedOn)
        return [{ questionId, savedOn }, ...current]
      })
    },
  }
}

const REVISION_KEY = 'sabpadho-revision-done'

export function useRevisionDone() {
  const { email } = useAuth()
  const scopedKey = email ? `${REVISION_KEY}-${email}` : REVISION_KEY
  const [done, setDone] = useLocalStorage<string[]>(scopedKey, [])

  useEffect(() => {
    if (!email || !isSupabaseConfigured || !supabase) return
    let cancelled = false
    supabase
      .from('revision_queue')
      .select('question_id')
      .eq('learner_email', email)
      .eq('status', 'done')
      .then(({ data, error }) => {
        if (cancelled || error || !data) return
        if (data.length > 0) {
          setDone(data.map((row) => row.question_id as string))
        }
      })
    return () => {
      cancelled = true
    }
  }, [email, setDone])

  return {
    done,
    markDone: (questionId: string) => {
      setDone((current) => (current.includes(questionId) ? current : [...current, questionId]))
      if (email && isSupabaseConfigured && supabase) {
        void supabase.from('revision_queue').upsert(
          {
            learner_email: email,
            question_id: questionId,
            status: 'done',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'learner_email,question_id' },
        )
      }
    },
    reset: () => {
      setDone([])
      if (email && isSupabaseConfigured && supabase) {
        void supabase
          .from('revision_queue')
          .update({ status: 'due', updated_at: new Date().toISOString() })
          .eq('learner_email', email)
      }
    },
  }
}

const EXTRA_REVISION_KEY = 'sabpadho-extra-revision'

export function useExtraRevision() {
  const { email } = useAuth()
  const scopedKey = email ? `${EXTRA_REVISION_KEY}-${email}` : EXTRA_REVISION_KEY
  const [ids, setIds] = useLocalStorage<string[]>(scopedKey, [])

  useEffect(() => {
    if (!email || !isSupabaseConfigured || !supabase) return
    let cancelled = false
    supabase
      .from('revision_queue')
      .select('question_id')
      .eq('learner_email', email)
      .eq('status', 'due')
      .then(({ data, error }) => {
        if (cancelled || error || !data) return
        if (data.length > 0) {
          setIds((current) =>
            Array.from(new Set([...current, ...data.map((r) => r.question_id as string)])),
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [email, setIds])

  return {
    ids,
    addMany: (questionIds: string[]) => {
      setIds((current) => Array.from(new Set([...current, ...questionIds])))
      if (email && isSupabaseConfigured && supabase && questionIds.length > 0) {
        void supabase.from('revision_queue').upsert(
          questionIds.map((questionId) => ({
            learner_email: email,
            question_id: questionId,
            status: 'due',
            source: 'Practice sprint',
            updated_at: new Date().toISOString(),
          })),
          { onConflict: 'learner_email,question_id' },
        )
      }
    },
    reset: () => setIds([]),
  }
}
