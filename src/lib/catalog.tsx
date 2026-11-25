import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { isSupabaseConfigured, supabase } from './supabase'
import {
  subjects as seedSubjects,
  type Chapter,
  type Subject,
  type SubjectId,
} from '../data/subjects'
import { questionBank as seedQuestions } from '../data/questions'
import type { Question, Difficulty } from '../data/question-types'
import { mockPapers as seedMocks, type MockPaper, type MockKind, type MockStatus } from '../data/mocks'
import { isValidExam, type ExamId } from '../data/exams'

export type ChapterNote = {
  id: string
  subjectId: SubjectId
  chapterId: string
  exams: ExamId[]
  title: string
  summary: string
  keyPoints: string[]
  sourceFile?: string
}

/**
 * Shared localStorage bridge so questions/notes added in the Admin Portal on the
 * same browser immediately appear in the Learner App even when Supabase env vars
 * are not configured. When Supabase IS configured, real Supabase rows take priority.
 */
export const SHARED_QUESTIONS_KEY = 'sabpadho-shared-questions-v1'
export const SHARED_NOTES_KEY = 'sabpadho-shared-notes-v1'

type CatalogValue = {
  subjects: Subject[]
  allChapters: Chapter[]
  questions: Question[]
  mockPapers: MockPaper[]
  chapterNotes: ChapterNote[]
  loading: boolean
  liveFromSupabase: boolean
  refresh: () => Promise<void>
  findSubject: (slug: string) => Subject | undefined
  findChapter: (subjectSlug: string, chapterSlug: string) => { subject: Subject; chapter: Chapter } | undefined
  chapterById: (id: string) => Chapter | undefined
  subjectById: Record<SubjectId, Subject>
  questionsForChapter: (chapterId: string) => Question[]
  questionsForSubject: (subjectId: SubjectId) => Question[]
  questionById: (id: string) => Question | undefined
  notesForChapter: (chapterId: string) => ChapterNote[]
  getMock: (id: string) => MockPaper | undefined
  isPlayableMock: (id: string) => boolean
  isChapterFree: (chapter: Chapter) => boolean
  partitionSubjectsByExam: (exam: ExamId) => { preferred: Subject[]; others: Subject[] }
  partitionMocksByExam: (exam: ExamId) => { preferred: MockPaper[]; others: MockPaper[] }
}

const CatalogContext = createContext<CatalogValue | null>(null)

function readSharedQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(SHARED_QUESTIONS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Question[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function readSharedNotes(): ChapterNote[] {
  try {
    const raw = localStorage.getItem(SHARED_NOTES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ChapterNote[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function normalizeSubjectId(id: string): SubjectId {
  if (id === 'maths' || id === 'reasoning' || id === 'english' || id === 'gk' || id === 'hindi') {
    return id
  }
  return 'maths'
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>(seedSubjects)
  const [questions, setQuestions] = useState<Question[]>(() => {
    const shared = readSharedQuestions()
    const existingIds = new Set(shared.map((item) => item.id))
    return [...shared, ...seedQuestions.filter((item) => !existingIds.has(item.id))]
  })
  const [mockPapers, setMockPapers] = useState<MockPaper[]>(seedMocks)
  const [chapterNotes, setChapterNotes] = useState<ChapterNote[]>(readSharedNotes)
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured)
  const [liveFromSupabase, setLiveFromSupabase] = useState<boolean>(false)

  const refresh = useCallback(async () => {
    const sharedQs = readSharedQuestions()
    const sharedNotes = readSharedNotes()

    if (!supabase) {
      const existingIds = new Set(sharedQs.map((item) => item.id))
      setQuestions([...sharedQs, ...seedQuestions.filter((item) => !existingIds.has(item.id))])
      setChapterNotes(sharedNotes)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const [subRes, chRes, qRes, mockRes, noteRes] = await Promise.all([
        supabase.from('subjects').select('*').eq('status', 'Published').order('sort_order', { ascending: true }),
        supabase.from('chapters').select('*').eq('status', 'Published').order('sort_order', { ascending: true }),
        supabase.from('questions').select('*').eq('status', 'Published').order('created_at', { ascending: false }),
        supabase.from('mock_tests').select('*').eq('status', 'Published').order('updated_at', { ascending: false }),
        supabase.from('chapter_notes').select('*').eq('status', 'Published').order('created_at', { ascending: false }),
      ])

      if (!subRes.error && subRes.data && subRes.data.length > 0 && !chRes.error && chRes.data) {
        const chaptersBySub = new Map<string, Chapter[]>()
        for (const row of chRes.data) {
          const subjectId = normalizeSubjectId(row.subject_id)
          const ch: Chapter = {
            id: row.id,
            subjectId,
            slug: row.slug,
            title: { en: row.title_en, hi: row.title_hi || row.title_en },
            blurb: row.blurb || '',
            outline: Array.isArray(row.outline) ? row.outline : [],
            attempts: row.attempts ?? null,
            accuracy: row.accuracy ?? null,
            minutes: row.minutes ?? 10,
            isFree: Boolean(row.is_free),
            exams: Array.isArray(row.exams) ? row.exams.filter(isValidExam) : undefined,
            notesMarkdown: row.notes_markdown || undefined,
          }
          const list = chaptersBySub.get(subjectId) ?? []
          list.push(ch)
          chaptersBySub.set(subjectId, list)
        }

        const mappedSubjects: Subject[] = subRes.data.map((row) => {
          const id = normalizeSubjectId(row.id)
          const fallback = seedSubjects.find((s) => s.id === id)
          return {
            id,
            slug: row.slug,
            name: { en: row.name_en, hi: row.name_hi || row.name_en },
            short: row.short,
            code: row.code,
            tint: (row.tint as Subject['tint']) || fallback?.tint || 'violet',
            tagline: row.tagline || fallback?.tagline || '',
            description: row.description || fallback?.description || '',
            chapters: chaptersBySub.get(id) ?? fallback?.chapters ?? [],
            accuracy: row.accuracy ?? fallback?.accuracy ?? 70,
            paperSection: row.paper_section || fallback?.paperSection || row.name_en,
            exams: Array.isArray(row.exams) ? row.exams.filter(isValidExam) : fallback?.exams,
          }
        })
        setSubjects(mappedSubjects)
        setLiveFromSupabase(true)
      }

      if (!qRes.error && qRes.data && qRes.data.length > 0) {
        const dbQuestions: Question[] = qRes.data.map((row) => {
          const optsEn = Array.isArray(row.options_en) ? row.options_en.map(String) : []
          const optsHi = Array.isArray(row.options_hi) && row.options_hi.length === optsEn.length
            ? row.options_hi.map(String)
            : optsEn
          return {
            id: row.id,
            subjectId: normalizeSubjectId(row.subject_id),
            chapterId: row.chapter_id,
            difficulty: (row.difficulty as Difficulty) || 'Medium',
            prompt: { en: row.prompt_en, hi: row.prompt_hi || row.prompt_en },
            options: { en: optsEn, hi: optsHi },
            correct: Number(row.correct_index) || 0,
            explanation: {
              en: row.explanation_en || '',
              hi: row.explanation_hi || row.explanation_en || '',
            },
            exams: Array.isArray(row.exams) ? row.exams.filter(isValidExam) : undefined,
          }
        })
        const dbIds = new Set(dbQuestions.map((q) => q.id))
        // Merge DB questions with remaining built-in chapter questions so no chapter is empty
        setQuestions([...dbQuestions, ...seedQuestions.filter((q) => !dbIds.has(q.id))])
        setLiveFromSupabase(true)
      } else if (sharedQs.length > 0) {
        const existingIds = new Set(sharedQs.map((item) => item.id))
        setQuestions([...sharedQs, ...seedQuestions.filter((item) => !existingIds.has(item.id))])
      }

      if (!mockRes.error && mockRes.data && mockRes.data.length > 0) {
        const dbMocks: MockPaper[] = mockRes.data.map((row) => ({
          id: row.id,
          title: row.title,
          exam: isValidExam(row.exam) ? row.exam : 'SSC CGL',
          kind: (row.kind as MockKind) || 'Mini',
          status: (row.learner_status as MockStatus) || 'available',
          durationMinutes: row.duration_minutes ?? 60,
          sections: Array.isArray(row.sections) ? row.sections : [],
          description: row.description_en || '',
          descriptionHi: row.description_hi || row.description_en || '',
          opensOn: row.opens_on ?? undefined,
          submittedOn: row.submitted_on ?? undefined,
          scoreLabel: row.score_label ?? undefined,
          pattern:
            row.total_questions && (!Array.isArray(row.sections) || row.sections.every((s: { questionIds?: string[] }) => !s.questionIds?.length))
              ? { questions: row.total_questions, marks: row.total_marks || row.total_questions * 2 }
              : undefined,
        }))
        const dbIds = new Set(dbMocks.map((m) => m.id))
        setMockPapers([...dbMocks, ...seedMocks.filter((m) => !dbIds.has(m.id))])
        setLiveFromSupabase(true)
      }

      if (!noteRes.error && noteRes.data) {
        const dbNotes: ChapterNote[] = noteRes.data.map((row) => ({
          id: row.id,
          subjectId: normalizeSubjectId(row.subject_id),
          chapterId: row.chapter_id,
          exams: Array.isArray(row.exams) ? row.exams.filter(isValidExam) : ['SSC CGL'],
          title: row.title,
          summary: row.summary || '',
          keyPoints: Array.isArray(row.key_points) ? row.key_points.map(String) : [],
          sourceFile: row.source_file ?? undefined,
        }))
        setChapterNotes([...dbNotes, ...sharedNotes])
      } else {
        setChapterNotes(sharedNotes)
      }
    } catch {
      /* Graceful fallback to local/seed data if tables aren't migrated yet */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    const onStorage = (event: StorageEvent) => {
      if (event.key === SHARED_QUESTIONS_KEY || event.key === SHARED_NOTES_KEY) {
        void refresh()
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [refresh])

  const allChapters = useMemo(() => subjects.flatMap((s) => s.chapters), [subjects])

  const subjectById = useMemo(() => {
    const base = Object.fromEntries(seedSubjects.map((s) => [s.id, s])) as Record<SubjectId, Subject>
    for (const s of subjects) base[s.id] = s
    return base
  }, [subjects])

  const findSubject = useCallback(
    (slug: string) => subjects.find((s) => s.slug === slug),
    [subjects],
  )

  const findChapter = useCallback(
    (subjectSlug: string, chapterSlug: string) => {
      const subject = subjects.find((s) => s.slug === subjectSlug)
      const chapter = subject?.chapters.find((c) => c.slug === chapterSlug)
      return subject && chapter ? { subject, chapter } : undefined
    },
    [subjects],
  )

  const chapterById = useCallback(
    (id: string) => allChapters.find((c) => c.id === id),
    [allChapters],
  )

  const questionsForChapter = useCallback(
    (chapterId: string) => questions.filter((q) => q.chapterId === chapterId),
    [questions],
  )

  const questionsForSubject = useCallback(
    (subjectId: SubjectId) => questions.filter((q) => q.subjectId === subjectId),
    [questions],
  )

  const questionById = useCallback(
    (id: string) => questions.find((q) => q.id === id),
    [questions],
  )

  const notesForChapter = useCallback(
    (chapterId: string) => chapterNotes.filter((n) => n.chapterId === chapterId),
    [chapterNotes],
  )

  const getMock = useCallback(
    (id: string) => mockPapers.find((m) => m.id === id),
    [mockPapers],
  )

  const isPlayableMock = useCallback(
    (id: string) => {
      const paper = mockPapers.find((m) => m.id === id)
      return Boolean(
        paper &&
          paper.status === 'available' &&
          paper.sections.some((part) => part.questionIds.length > 0),
      )
    },
    [mockPapers],
  )

  const isChapterFree = useCallback((chapter: Chapter) => {
    if (typeof chapter.isFree === 'boolean') return chapter.isFree
    const subj = subjects.find((s) => s.id === chapter.subjectId)
    return subj?.chapters[0]?.id === chapter.id
  }, [subjects])

  const partitionSubjectsByExam = useCallback(
    (exam: ExamId) => {
      const preferred: Subject[] = []
      const others: Subject[] = []

      for (const subj of subjects) {
        const subjectMatches = !subj.exams || subj.exams.includes(exam)
        if (!subjectMatches) {
          others.push(subj)
          continue
        }

        const prefChapters = subj.chapters.filter((ch) => !ch.exams || ch.exams.includes(exam))
        const otherChapters = subj.chapters.filter((ch) => ch.exams && !ch.exams.includes(exam))

        if (prefChapters.length > 0) {
          preferred.push({ ...subj, chapters: prefChapters })
        }
        if (otherChapters.length > 0) {
          others.push({ ...subj, chapters: otherChapters })
        }
      }

      return { preferred, others }
    },
    [subjects],
  )

  const partitionMocksByExam = useCallback(
    (exam: ExamId) => {
      const preferred = mockPapers.filter((paper) => paper.exam === exam)
      const others = mockPapers.filter((paper) => paper.exam !== exam)
      return { preferred, others }
    },
    [mockPapers],
  )

  const value = useMemo<CatalogValue>(
    () => ({
      subjects,
      allChapters,
      questions,
      mockPapers,
      chapterNotes,
      loading,
      liveFromSupabase,
      refresh,
      findSubject,
      findChapter,
      chapterById,
      subjectById,
      questionsForChapter,
      questionsForSubject,
      questionById,
      notesForChapter,
      getMock,
      isPlayableMock,
      isChapterFree,
      partitionSubjectsByExam,
      partitionMocksByExam,
    }),
    [
      subjects,
      allChapters,
      questions,
      mockPapers,
      chapterNotes,
      loading,
      liveFromSupabase,
      refresh,
      findSubject,
      findChapter,
      chapterById,
      subjectById,
      questionsForChapter,
      questionsForSubject,
      questionById,
      notesForChapter,
      getMock,
      isPlayableMock,
      isChapterFree,
      partitionSubjectsByExam,
      partitionMocksByExam,
    ],
  )

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error('useCatalog must be used inside CatalogProvider')
  return ctx
}
