import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { seed, type AdminData, type Announcement, type LearnerStatus, type PublishStatus } from './data'

/** Demo edits are kept in the browser so a reload keeps them; "Reset demo data" clears them. */
const KEY = 'sabpadho-admin-demo-v1'

type AdminStore = {
  data: AdminData
  actor: string
  setLearnerStatus: (id: string, status: LearnerStatus) => void
  setSubjectStatus: (id: string, status: PublishStatus) => void
  setChapterStatus: (subjectId: string, chapterId: string, status: PublishStatus) => void
  setMockStatus: (id: string, status: PublishStatus) => void
  duplicateMock: (id: string) => void
  setQuestionStatus: (ids: string[], status: PublishStatus) => void
  addAnnouncement: (draft: Pick<Announcement, 'title' | 'body' | 'audience'>) => void
  reset: () => void
}

const AdminContext = createContext<AdminStore | null>(null)

function load(): AdminData {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AdminData>
      if (parsed && Array.isArray(parsed.learners) && Array.isArray(parsed.subjects)) {
        return { ...seed(), ...parsed } as AdminData
      }
    }
  } catch {
    /* fall back to the seed below */
  }
  return seed()
}

export function AdminProvider({ actor, children }: { actor: string; children: ReactNode }) {
  const [data, setData] = useState<AdminData>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data))
    } catch {
      /* storage may be full or blocked; the session still works */
    }
  }, [data])

  const log = useCallback(
    (action: string, target: string) => ({
      id: `E-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      actor,
      action,
      target,
      at: new Date().toISOString(),
    }),
    [actor],
  )

  const setLearnerStatus = useCallback((id: string, status: LearnerStatus) => {
    setData(prev => {
      const learner = prev.learners.find(item => item.id === id)
      if (!learner || learner.status === status) return prev
      return {
        ...prev,
        learners: prev.learners.map(item => (item.id === id ? { ...item, status } : item)),
        activity: [log(`${status === 'Suspended' ? 'suspended learner' : 'reactivated learner'}`, learner.name), ...prev.activity].slice(0, 60),
      }
    })
  }, [log])

  const setSubjectStatus = useCallback((id: string, status: PublishStatus) => {
    setData(prev => {
      const subject = prev.subjects.find(item => item.id === id)
      if (!subject || subject.status === status) return prev
      return {
        ...prev,
        subjects: prev.subjects.map(item => (item.id === id ? { ...item, status } : item)),
        activity: [log(`${status === 'Published' ? 'published' : 'moved to draft'}`, subject.name), ...prev.activity].slice(0, 60),
      }
    })
  }, [log])

  const setChapterStatus = useCallback((subjectId: string, chapterId: string, status: PublishStatus) => {
    setData(prev => {
      const subject = prev.subjects.find(item => item.id === subjectId)
      const chapter = subject?.chapters.find(item => item.id === chapterId)
      if (!subject || !chapter || chapter.status === status) return prev
      return {
        ...prev,
        subjects: prev.subjects.map(item =>
          item.id === subjectId
            ? {
                ...item,
                chapters: item.chapters.map(ch => (ch.id === chapterId ? { ...ch, status, updated: new Date().toISOString() } : ch)),
              }
            : item,
        ),
        activity: [log(status === 'Published' ? 'published chapter' : 'moved chapter to draft', `${subject.name} · ${chapter.title}`), ...prev.activity].slice(0, 60),
      }
    })
  }, [log])

  const setMockStatus = useCallback((id: string, status: PublishStatus) => {
    setData(prev => {
      const mock = prev.mocks.find(item => item.id === id)
      if (!mock || mock.status === status) return prev
      return {
        ...prev,
        mocks: prev.mocks.map(item => (item.id === id ? { ...item, status, updated: new Date().toISOString() } : item)),
        activity: [log(status === 'Published' ? 'published' : status === 'Archived' ? 'archived' : 'moved to draft', mock.title), ...prev.activity].slice(0, 60),
      }
    })
  }, [log])

  const duplicateMock = useCallback((id: string) => {
    setData(prev => {
      const mock = prev.mocks.find(item => item.id === id)
      if (!mock) return prev
      const nextId = `M-${String(prev.mocks.length + 1).padStart(2, '0')}-${Math.random().toString(36).slice(2, 5)}`
      const copy = { ...mock, id: nextId, title: `${mock.title} (copy)`, status: 'Draft' as PublishStatus, attempts: 0, avgScore: 0, updated: new Date().toISOString() }
      return {
        ...prev,
        mocks: [copy, ...prev.mocks],
        activity: [log('duplicated', mock.title), ...prev.activity].slice(0, 60),
      }
    })
  }, [log])

  const setQuestionStatus = useCallback((ids: string[], status: PublishStatus) => {
    setData(prev => {
      const selected = prev.questions.filter(item => ids.includes(item.id))
      if (!selected.length) return prev
      return {
        ...prev,
        questions: prev.questions.map(item => (ids.includes(item.id) ? { ...item, status, updated: new Date().toISOString() } : item)),
        activity: [log(`${status.toLowerCase()} ${selected.length} question${selected.length === 1 ? '' : 's'}`, selected.map(item => item.id).join(', ')), ...prev.activity].slice(0, 60),
      }
    })
  }, [log])

  const addAnnouncement = useCallback((draft: Pick<Announcement, 'title' | 'body' | 'audience'>) => {
    setData(prev => {
      const entry: Announcement = {
        ...draft,
        id: `A-${Date.now()}`,
        status: 'Sent',
        sentAt: new Date().toISOString(),
      }
      return {
        ...prev,
        announcements: [entry, ...prev.announcements],
        activity: [log('sent announcement', draft.title), ...prev.activity].slice(0, 60),
      }
    })
  }, [log])

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
    setData(seed())
  }, [])

  const value = useMemo<AdminStore>(
    () => ({ data, actor, setLearnerStatus, setSubjectStatus, setChapterStatus, setMockStatus, duplicateMock, setQuestionStatus, addAnnouncement, reset }),
    [data, actor, setLearnerStatus, setSubjectStatus, setChapterStatus, setMockStatus, duplicateMock, setQuestionStatus, addAnnouncement, reset],
  )

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const value = useContext(AdminContext)
  if (!value) throw new Error('useAdmin must be used inside AdminProvider')
  return value
}
