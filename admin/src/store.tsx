import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { isSupabaseConfigured, supabase } from '../../src/lib/supabase'
import { SHARED_NOTES_KEY, SHARED_QUESTIONS_KEY } from '../../src/lib/catalog'
import {
  seed,
  type AdminData,
  type Announcement,
  type Chapter,
  type ChapterNoteRecord,
  type Coupon,
  type CouponStatus,
  type Difficulty,
  type ExamTarget,
  type Learner,
  type LearnerStatus,
  type MockTest,
  type Plan,
  type PublishStatus,
  type Question,
  type Subject,
} from './data'

const KEY = 'sabpadho-admin-demo-v1'

/** Map admin chapter IDs/titles to learner catalog chapter IDs so imported content appears directly in learner sprints/primers */
const ADMIN_TO_LEARNER_CHAPTER_ID: Record<string, string> = {
  'maths-percentages': 'percentages',
  'maths-ratio': 'ratio-proportion',
  'maths-profit-loss': 'profit-loss',
  'maths-time-work': 'time-work',
  'maths-averages': 'si-ci',
  'maths-geometry': 'percentages',
  'reasoning-series': 'number-series',
  'reasoning-syllogisms': 'syllogisms',
  'reasoning-blood': 'blood-relations',
  'reasoning-direction': 'direction-sense',
  'reasoning-coding': 'coding-decoding',
  'english-synonyms': 'synonyms',
  'english-errors': 'error-spotting',
  'english-blanks': 'sentence-improvement',
  'english-idioms': 'idioms-phrases',
  'english-oneword': 'one-word',
  'gk-polity': 'indian-polity',
  'gk-history': 'modern-history',
  'gk-geography': 'geography',
  'gk-science': 'everyday-science',
  'gk-static': 'economy-basics',
  'hindi-sandhi': 'sandhi-samas',
  'hindi-muhavare': 'muhavare',
  'hindi-vyakaran': 'vakya-shuddhi',
}

export function toLearnerChapterId(chapterId: string): string {
  return ADMIN_TO_LEARNER_CHAPTER_ID[chapterId] ?? chapterId
}

export type NewQuestionInput = {
  subjectId: string
  subjectName: string
  chapterId: string
  chapterTitle: string
  promptEn: string
  promptHi: string
  optionsEn: [string, string, string, string]
  optionsHi: [string, string, string, string]
  correct: 0 | 1 | 2 | 3
  explanationEn: string
  explanationHi: string
  difficulty: Difficulty
  exams: ExamTarget[]
  status?: PublishStatus
  sourceFilename?: string
}

export type NewNoteInput = {
  subjectId: string
  chapterId: string
  titleEn: string
  titleHi: string
  contentEn: string
  contentHi: string
  keyPointsEn: string[]
  keyPointsHi: string[]
  formulas: Array<{ label: string; expr: string }>
  isFree: boolean
  exams: ExamTarget[]
  status?: PublishStatus
  sourceFilename?: string
}

type AdminStore = {
  data: AdminData
  actor: string
  source: 'supabase' | 'local'
  syncing: boolean
  refreshFromSupabase: () => Promise<void>
  setLearnerStatus: (id: string, status: LearnerStatus) => void
  setSubjectStatus: (id: string, status: PublishStatus) => void
  setSubjectExams: (id: string, exams: string[]) => void
  setChapterStatus: (subjectId: string, chapterId: string, status: PublishStatus) => void
  setChapterFree: (subjectId: string, chapterId: string, isFree: boolean) => void
  setMockStatus: (id: string, status: PublishStatus) => void
  duplicateMock: (id: string) => void
  setQuestionStatus: (ids: string[], status: PublishStatus) => void
  importQuestions: (items: NewQuestionInput[]) => Promise<number>
  importChapterNote: (note: NewNoteInput) => Promise<void>
  addAnnouncement: (draft: Pick<Announcement, 'title' | 'body' | 'audience'>) => void
  setPlanStatus: (id: Plan['id'], status: PublishStatus) => void
  setCouponStatus: (id: string, status: CouponStatus) => void
  addCoupon: (draft: Pick<Coupon, 'code' | 'discount' | 'kind' | 'limit' | 'expires'>) => void
  reset: () => void
}

const AdminContext = createContext<AdminStore | null>(null)

function load(): AdminData {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AdminData>
      if (parsed && Array.isArray(parsed.learners) && Array.isArray(parsed.subjects)) {
        return { ...seed(), ...parsed, notes: parsed.notes ?? [] } as AdminData
      }
    }
  } catch {
    /* fall back to seed */
  }
  return seed()
}

function mirrorSharedLearnerCatalog(questions: Question[], notes: ChapterNoteRecord[]) {
  try {
    const publishedQuestions = questions
      .filter((q) => q.status === 'Published' && q.optionsEn && q.chapterId)
      .map((q) => ({
        id: q.id,
        chapterId: toLearnerChapterId(q.chapterId ?? ''),
        difficulty: q.difficulty,
        year: 'AI Import',
        exams: q.exams ?? ['SSC CGL', 'SSC CHSL', 'SSC GD', 'Railways', 'Banking'],
        prompt: { en: q.prompt, hi: q.promptHi || q.prompt },
        options: {
          en: q.optionsEn!,
          hi: q.optionsHi ?? q.optionsEn!,
        },
        correct: q.correct ?? 0,
        explanation: {
          en: q.explanationEn || 'Verified explanation.',
          hi: q.explanationHi || q.explanationEn || 'सत्यापित व्याख्या।',
        },
      }))
    localStorage.setItem(SHARED_QUESTIONS_KEY, JSON.stringify(publishedQuestions))

    const publishedNotes = notes
      .filter((n) => n.status === 'Published')
      .map((n) => ({
        id: n.id,
        chapterId: toLearnerChapterId(n.chapterId),
        subjectId: n.subjectId,
        title: { en: n.titleEn, hi: n.titleHi || n.titleEn },
        content: { en: n.contentEn, hi: n.contentHi || n.contentEn },
        keyPoints: { en: n.keyPointsEn, hi: n.keyPointsHi },
        formulas: n.formulas,
        isFree: n.isFree,
        exams: n.exams,
        status: n.status,
      }))
    localStorage.setItem(SHARED_NOTES_KEY, JSON.stringify(publishedNotes))
  } catch {
    /* ignore */
  }
}

export function AdminProvider({ actor, children }: { actor: string; children: ReactNode }) {
  const [data, setData] = useState<AdminData>(load)
  const [source, setSource] = useState<'supabase' | 'local'>('local')
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data))
      mirrorSharedLearnerCatalog(data.questions, data.notes)
    } catch {
      /* ignore */
    }
  }, [data])

  const writeActivityToSupabase = useCallback(
    (action: string, target: string) => {
      if (!isSupabaseConfigured || !supabase) return
      void supabase.from('activity_logs').insert({
        id: `E-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        actor,
        action,
        target,
        created_at: new Date().toISOString(),
      })
    },
    [actor],
  )

  const log = useCallback(
    (action: string, target: string) => {
      writeActivityToSupabase(action, target)
      return {
        id: `E-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        actor,
        action,
        target,
        at: new Date().toISOString(),
      }
    },
    [actor, writeActivityToSupabase],
  )

  const refreshFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return
    setSyncing(true)
    try {
      const [
        subjectsRes,
        chaptersRes,
        questionsRes,
        notesRes,
        mocksRes,
        learnersRes,
        plansRes,
        couponsRes,
        annRes,
        actRes,
        dailyRes,
      ] = await Promise.all([
        supabase.from('subjects').select('*').order('sort_order', { ascending: true }),
        supabase.from('chapters').select('*').order('chapter_order', { ascending: true }),
        supabase.from('questions').select('*').order('updated_at', { ascending: false }),
        supabase.from('chapter_notes').select('*').order('updated_at', { ascending: false }),
        supabase.from('mock_tests').select('*').order('updated_at', { ascending: false }),
        supabase.from('learners').select('*').order('joined_at', { ascending: false }),
        supabase.from('plans').select('*'),
        supabase.from('coupons').select('*'),
        supabase.from('announcements').select('*').order('sent_at', { ascending: false }),
        supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(60),
        supabase.from('daily_metrics').select('*').order('metric_date', { ascending: true }).limit(14),
      ])

      if (subjectsRes.error || !subjectsRes.data?.length) {
        return
      }

      const chapterRows = chaptersRes.data ?? []
      const questionRows = questionsRes.data ?? []

      const mappedSubjects: Subject[] = subjectsRes.data.map((s) => {
        const sChapters: Chapter[] = chapterRows
          .filter((c) => c.subject_id === s.id)
          .map((c) => ({
            id: c.id as string,
            title: c.name_en as string,
            questions: questionRows.filter((q) => q.chapter_id === c.id).length || 12,
            status: (c.status as PublishStatus) ?? 'Published',
            difficulty: (c.difficulty as Difficulty) ?? 'Medium',
            updated: (c.updated_at as string) ?? new Date().toISOString(),
            isFree: Boolean(c.is_free),
            exams: (c.exams as ExamTarget[] | null) ?? ['SSC CGL', 'SSC CHSL'],
          }))
        return {
          id: s.id as string,
          name: s.name_en as string,
          code: s.code as string,
          section: (s.section_label as string) ?? 'Section I',
          learners: Number(s.learners_count ?? 800),
          accuracy: Number(s.accuracy_pct ?? 70),
          status: (s.status as PublishStatus) ?? 'Published',
          chapters: sChapters,
        }
      })

      const subjNameById = Object.fromEntries(mappedSubjects.map((s) => [s.id, s.name]))
      const chapTitleById = Object.fromEntries(
        mappedSubjects.flatMap((s) => s.chapters.map((c) => [c.id, c.title])),
      )

      const mappedQuestions: Question[] = questionRows.map((q) => ({
        id: q.id as string,
        subjectId: q.subject_id as string,
        subject: subjNameById[q.subject_id as string] ?? (q.subject_id as string),
        chapterId: q.chapter_id as string,
        chapter: chapTitleById[q.chapter_id as string] ?? (q.chapter_id as string),
        prompt: q.prompt_en as string,
        promptHi: (q.prompt_hi as string) ?? '',
        optionsEn: Array.isArray(q.options_en) && q.options_en.length === 4
          ? (q.options_en as [string, string, string, string])
          : undefined,
        optionsHi: Array.isArray(q.options_hi) && q.options_hi.length === 4
          ? (q.options_hi as [string, string, string, string])
          : undefined,
        correct: (Number(q.correct_index ?? 0) as 0 | 1 | 2 | 3),
        explanationEn: (q.explanation_en as string) ?? '',
        explanationHi: (q.explanation_hi as string) ?? '',
        exams: (q.exams as ExamTarget[] | null) ?? ['SSC CGL'],
        difficulty: (q.difficulty as Difficulty) ?? 'Medium',
        type: ((q.question_type as 'MCQ' | 'Numeric') ?? 'MCQ'),
        language: q.prompt_hi ? 'EN + HI' : 'EN',
        status: (q.status as PublishStatus) ?? 'Published',
        accuracy: Number(q.accuracy_pct ?? 70),
        updated: (q.updated_at as string) ?? new Date().toISOString(),
      }))

      const mappedNotes: ChapterNoteRecord[] = (notesRes.data ?? []).map((n) => ({
        id: n.id as string,
        subjectId: n.subject_id as string,
        chapterId: n.chapter_id as string,
        titleEn: n.title_en as string,
        titleHi: (n.title_hi as string) ?? '',
        contentEn: n.content_en as string,
        contentHi: (n.content_hi as string) ?? '',
        keyPointsEn: (n.key_points_en as string[] | null) ?? [],
        keyPointsHi: (n.key_points_hi as string[] | null) ?? [],
        formulas: (n.formulas as Array<{ label: string; expr: string }> | null) ?? [],
        isFree: Boolean(n.is_free),
        exams: (n.exams as ExamTarget[] | null) ?? ['SSC CGL'],
        status: (n.status as PublishStatus) ?? 'Published',
        sourceFilename: (n.source_filename as string | null) ?? undefined,
        updated: (n.updated_at as string) ?? new Date().toISOString(),
      }))

      const mappedMocks: MockTest[] = (mocksRes.data ?? []).map((m) => {
        const secs = Array.isArray(m.sections) ? m.sections : []
        const qCount = secs.reduce(
          (sum: number, sec: { questionIds?: string[] }) => sum + (sec.questionIds?.length ?? 0),
          0,
        )
        return {
          id: m.id as string,
          title: m.title as string,
          sections: secs.length || 1,
          questions: qCount || Number(m.total_marks ?? 50) / 2,
          minutes: Number(m.duration_minutes ?? 60),
          attempts: Number(m.attempts_count ?? 0),
          avgScore: Number(m.avg_score ?? 0),
          status: (m.publish_status as PublishStatus) ?? 'Published',
          updated: (m.updated_at as string) ?? new Date().toISOString(),
        }
      })

      const mappedLearners: Learner[] = (learnersRes.data ?? []).map((l) => ({
        id: l.id as string,
        name: l.name as string,
        email: l.email as string,
        status: (l.status as LearnerStatus) ?? 'Active',
        target: ((l.preferred_exam as ExamTarget) ?? 'SSC CGL'),
        joined: (l.joined_at as string) ?? new Date().toISOString(),
        lastActive: (l.last_active_at as string) ?? new Date().toISOString(),
        attempts: Number(l.attempts_count ?? 0),
        accuracy: Number(l.accuracy_pct ?? 0),
        streak: Number(l.streak_days ?? 0),
        saved: Number(l.saved_count ?? 0),
      }))

      setData((prev) => ({
        ...prev,
        subjects: mappedSubjects.length ? mappedSubjects : prev.subjects,
        questions: mappedQuestions.length ? mappedQuestions : prev.questions,
        notes: mappedNotes,
        mocks: mappedMocks.length ? mappedMocks : prev.mocks,
        learners: mappedLearners.length ? mappedLearners : prev.learners,
        plans:
          plansRes.data && plansRes.data.length
            ? plansRes.data.map((p) => ({
                id: p.id as 'free' | 'pro',
                name: p.name as string,
                price: Number(p.price ?? 0),
                period: (p.period as 'forever' | 'year') ?? 'year',
                tagline: (p.tagline as string) ?? '',
                learners: Number(p.learners_count ?? 0),
                status: (p.status as PublishStatus) ?? 'Published',
                featured: Boolean(p.featured),
                features: (p.features as string[] | null) ?? [],
              }))
            : prev.plans,
        coupons:
          couponsRes.data && couponsRes.data.length
            ? couponsRes.data.map((c) => ({
                id: c.id as string,
                code: c.code as string,
                discount: Number(c.discount ?? 0),
                kind: (c.kind as 'percent' | 'flat') ?? 'percent',
                plan: (c.plan_name as 'Free' | 'Pro') ?? 'Pro',
                redemptions: Number(c.redemptions ?? 0),
                limit: Number(c.redemption_limit ?? 100),
                expires: (c.expires_at as string) ?? new Date().toISOString(),
                status: (c.status as CouponStatus) ?? 'Active',
              }))
            : prev.coupons,
        announcements:
          annRes.data && annRes.data.length
            ? annRes.data.map((a) => ({
                id: a.id as string,
                title: a.title as string,
                body: a.body as string,
                audience: (a.audience as Announcement['audience']) ?? 'All learners',
                status: (a.status as 'Sent' | 'Draft') ?? 'Sent',
                sentAt: (a.sent_at as string) ?? new Date().toISOString(),
              }))
            : prev.announcements,
        activity:
          actRes.data && actRes.data.length
            ? actRes.data.map((e) => ({
                id: e.id as string,
                actor: e.actor as string,
                action: e.action as string,
                target: e.target as string,
                at: (e.created_at as string) ?? new Date().toISOString(),
              }))
            : prev.activity,
        daily:
          dailyRes.data && dailyRes.data.length
            ? dailyRes.data.map((d) => ({
                date: new Date(d.metric_date as string).toISOString(),
                attempts: Number(d.attempts ?? 0),
                learners: Number(d.learners ?? 0),
              }))
            : prev.daily,
      }))
      setSource('supabase')
    } finally {
      setSyncing(false)
    }
  }, [])

  useEffect(() => {
    void refreshFromSupabase()
  }, [refreshFromSupabase])

  const setLearnerStatus = useCallback(
    (id: string, status: LearnerStatus) => {
      if (isSupabaseConfigured && supabase) {
        void supabase.from('learners').update({ status }).eq('id', id)
      }
      setData((prev) => {
        const learner = prev.learners.find((item) => item.id === id)
        if (!learner || learner.status === status) return prev
        return {
          ...prev,
          learners: prev.learners.map((item) => (item.id === id ? { ...item, status } : item)),
          activity: [
            log(
              `${status === 'Suspended' ? 'suspended learner' : 'reactivated learner'}`,
              learner.name,
            ),
            ...prev.activity,
          ].slice(0, 60),
        }
      })
    },
    [log],
  )

  const setSubjectExams = useCallback(
    (id: string, exams: string[]) => {
      if (isSupabaseConfigured && supabase) {
        void supabase
          .from('subjects')
          .update({ exams, updated_at: new Date().toISOString() })
          .eq('id', id)
      }
      setData((prev) => {
        const subject = prev.subjects.find((item) => item.id === id)
        if (!subject) return prev
        return {
          ...prev,
          subjects: prev.subjects.map((item) => (item.id === id ? { ...item, exams } : item)),
          activity: [
            log('updated exams for', `${subject.name} (${exams.join(', ') || 'None'})`),
            ...prev.activity,
          ],
        }
      })
    },
    [],
  )

  const setSubjectStatus = useCallback(
    (id: string, status: PublishStatus) => {
      if (isSupabaseConfigured && supabase) {
        void supabase
          .from('subjects')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id)
      }
      setData((prev) => {
        const subject = prev.subjects.find((item) => item.id === id)
        if (!subject || subject.status === status) return prev
        return {
          ...prev,
          subjects: prev.subjects.map((item) => (item.id === id ? { ...item, status } : item)),
          activity: [
            log(`${status === 'Published' ? 'published' : 'moved to draft'}`, subject.name),
            ...prev.activity,
          ].slice(0, 60),
        }
      })
    },
    [log],
  )

  const setChapterStatus = useCallback(
    (subjectId: string, chapterId: string, status: PublishStatus) => {
      const dbChapterId = toLearnerChapterId(chapterId)
      if (isSupabaseConfigured && supabase) {
        void supabase
          .from('chapters')
          .update({ status, updated_at: new Date().toISOString() })
          .in('id', [chapterId, dbChapterId])
      }
      setData((prev) => {
        const subject = prev.subjects.find((item) => item.id === subjectId)
        const chapter = subject?.chapters.find((item) => item.id === chapterId)
        if (!subject || !chapter || chapter.status === status) return prev
        return {
          ...prev,
          subjects: prev.subjects.map((item) =>
            item.id === subjectId
              ? {
                  ...item,
                  chapters: item.chapters.map((ch) =>
                    ch.id === chapterId ? { ...ch, status, updated: new Date().toISOString() } : ch,
                  ),
                }
              : item,
          ),
          activity: [
            log(
              status === 'Published' ? 'published chapter' : 'moved chapter to draft',
              `${subject.name} · ${chapter.title}`,
            ),
            ...prev.activity,
          ].slice(0, 60),
        }
      })
    },
    [log],
  )

  const setChapterFree = useCallback(
    (subjectId: string, chapterId: string, isFree: boolean) => {
      const dbChapterId = toLearnerChapterId(chapterId)
      if (isSupabaseConfigured && supabase) {
        void supabase
          .from('chapters')
          .update({ is_free: isFree, updated_at: new Date().toISOString() })
          .in('id', [chapterId, dbChapterId])
      }
      setData((prev) => {
        const subject = prev.subjects.find((item) => item.id === subjectId)
        const chapter = subject?.chapters.find((item) => item.id === chapterId)
        if (!subject || !chapter) return prev
        return {
          ...prev,
          subjects: prev.subjects.map((item) =>
            item.id === subjectId
              ? {
                  ...item,
                  chapters: item.chapters.map((ch) =>
                    ch.id === chapterId ? { ...ch, isFree, updated: new Date().toISOString() } : ch,
                  ),
                }
              : item,
          ),
          activity: [
            log(
              isFree ? 'marked free visitor sample' : 'restricted chapter to signed-up learners',
              `${subject.name} · ${chapter.title}`,
            ),
            ...prev.activity,
          ].slice(0, 60),
        }
      })
    },
    [log],
  )

  const setMockStatus = useCallback(
    (id: string, status: PublishStatus) => {
      if (isSupabaseConfigured && supabase) {
        void supabase
          .from('mock_tests')
          .update({ publish_status: status, updated_at: new Date().toISOString() })
          .eq('id', id)
      }
      setData((prev) => {
        const mock = prev.mocks.find((item) => item.id === id)
        if (!mock || mock.status === status) return prev
        return {
          ...prev,
          mocks: prev.mocks.map((item) =>
            item.id === id ? { ...item, status, updated: new Date().toISOString() } : item,
          ),
          activity: [
            log(
              status === 'Published'
                ? 'published'
                : status === 'Archived'
                  ? 'archived'
                  : 'moved to draft',
              mock.title,
            ),
            ...prev.activity,
          ].slice(0, 60),
        }
      })
    },
    [log],
  )

  const duplicateMock = useCallback(
    (id: string) => {
      setData((prev) => {
        const mock = prev.mocks.find((item) => item.id === id)
        if (!mock) return prev
        const nextId = `M-${String(prev.mocks.length + 1).padStart(2, '0')}-${Math.random()
          .toString(36)
          .slice(2, 5)}`
        const copy = {
          ...mock,
          id: nextId,
          title: `${mock.title} (copy)`,
          status: 'Draft' as PublishStatus,
          attempts: 0,
          avgScore: 0,
          updated: new Date().toISOString(),
        }
        return {
          ...prev,
          mocks: [copy, ...prev.mocks],
          activity: [log('duplicated', mock.title), ...prev.activity].slice(0, 60),
        }
      })
    },
    [log],
  )

  const setQuestionStatus = useCallback(
    (ids: string[], status: PublishStatus) => {
      if (isSupabaseConfigured && supabase && ids.length) {
        void supabase
          .from('questions')
          .update({ status, updated_at: new Date().toISOString() })
          .in('id', ids)
      }
      setData((prev) => {
        const selected = prev.questions.filter((item) => ids.includes(item.id))
        if (!selected.length) return prev
        return {
          ...prev,
          questions: prev.questions.map((item) =>
            ids.includes(item.id) ? { ...item, status, updated: new Date().toISOString() } : item,
          ),
          activity: [
            log(
              `${status.toLowerCase()} ${selected.length} question${selected.length === 1 ? '' : 's'}`,
              selected.map((item) => item.id).join(', '),
            ),
            ...prev.activity,
          ].slice(0, 60),
        }
      })
    },
    [log],
  )

  const importQuestions = useCallback(
    async (items: NewQuestionInput[]): Promise<number> => {
      if (!items.length) return 0
      const now = new Date().toISOString()
      const created: Question[] = items.map((item, idx) => {
        const id = `Q-AI-${Date.now().toString(36).toUpperCase()}-${idx + 1}`
        return {
          id,
          subjectId: item.subjectId,
          subject: item.subjectName,
          chapterId: toLearnerChapterId(item.chapterId),
          chapter: item.chapterTitle,
          prompt: item.promptEn,
          promptHi: item.promptHi,
          optionsEn: item.optionsEn,
          optionsHi: item.optionsHi,
          correct: item.correct,
          explanationEn: item.explanationEn,
          explanationHi: item.explanationHi,
          exams: item.exams,
          difficulty: item.difficulty,
          type: 'MCQ',
          language: item.promptHi ? 'EN + HI' : 'EN',
          status: item.status ?? 'Published',
          accuracy: 75,
          updated: now,
        }
      })

      if (isSupabaseConfigured && supabase) {
        const dbRows = created.map((q, idx) => ({
          id: q.id,
          chapter_id: toLearnerChapterId(items[idx].chapterId),
          subject_id: items[idx].subjectId,
          difficulty: q.difficulty,
          question_type: 'MCQ',
          year_tag: 'AI Import',
          exams: items[idx].exams,
          prompt_en: q.prompt,
          prompt_hi: q.promptHi ?? q.prompt,
          options_en: q.optionsEn ?? ['', '', '', ''],
          options_hi: q.optionsHi ?? q.optionsEn ?? ['', '', '', ''],
          correct_index: q.correct ?? 0,
          explanation_en: q.explanationEn ?? '',
          explanation_hi: q.explanationHi ?? '',
          status: q.status,
          accuracy_pct: 75,
          source_filename: items[idx].sourceFilename ?? null,
          updated_at: now,
        }))
        const { error } = await supabase.from('questions').upsert(dbRows)
        if (error) {
          console.warn('Supabase questions upsert warning:', error.message)
        }
      }

      setData((prev) => ({
        ...prev,
        questions: [...created, ...prev.questions],
        subjects: prev.subjects.map((subj) =>
          subj.id === items[0].subjectId
            ? {
                ...subj,
                chapters: subj.chapters.map((ch) =>
                  ch.id === items[0].chapterId || toLearnerChapterId(ch.id) === toLearnerChapterId(items[0].chapterId)
                    ? { ...ch, questions: ch.questions + created.length, updated: now }
                    : ch,
                ),
              }
            : subj,
        ),
        activity: [
          log(
            `imported ${created.length} AI question${created.length === 1 ? '' : 's'}`,
            `${items[0].subjectName} · ${items[0].chapterTitle}`,
          ),
          ...prev.activity,
        ].slice(0, 60),
      }))

      return created.length
    },
    [log],
  )

  const importChapterNote = useCallback(
    async (note: NewNoteInput) => {
      const now = new Date().toISOString()
      const id = `NOTE-${Date.now().toString(36).toUpperCase()}`
      const targetChapterId = toLearnerChapterId(note.chapterId)

      const record: ChapterNoteRecord = {
        id,
        subjectId: note.subjectId,
        chapterId: targetChapterId,
        titleEn: note.titleEn,
        titleHi: note.titleHi,
        contentEn: note.contentEn,
        contentHi: note.contentHi,
        keyPointsEn: note.keyPointsEn,
        keyPointsHi: note.keyPointsHi,
        formulas: note.formulas,
        isFree: note.isFree,
        exams: note.exams,
        status: note.status ?? 'Published',
        sourceFilename: note.sourceFilename,
        updated: now,
      }

      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('chapter_notes').upsert({
          id: record.id,
          chapter_id: record.chapterId,
          subject_id: record.subjectId,
          title_en: record.titleEn,
          title_hi: record.titleHi,
          content_en: record.contentEn,
          content_hi: record.contentHi,
          key_points_en: record.keyPointsEn,
          key_points_hi: record.keyPointsHi,
          formulas: record.formulas,
          is_free: record.isFree,
          exams: record.exams,
          status: record.status,
          source_filename: record.sourceFilename ?? null,
          updated_at: now,
        })
        if (error) {
          console.warn('Supabase chapter_notes upsert warning:', error.message)
        }
      }

      setData((prev) => ({
        ...prev,
        notes: [record, ...prev.notes],
        activity: [
          log('saved AI chapter notes', `${note.titleEn} (${targetChapterId})`),
          ...prev.activity,
        ].slice(0, 60),
      }))
    },
    [log],
  )

  const addAnnouncement = useCallback(
    (draft: Pick<Announcement, 'title' | 'body' | 'audience'>) => {
      const entry: Announcement = {
        ...draft,
        id: `A-${Date.now()}`,
        status: 'Sent',
        sentAt: new Date().toISOString(),
      }
      if (isSupabaseConfigured && supabase) {
        void supabase.from('announcements').insert({
          id: entry.id,
          title: entry.title,
          body: entry.body,
          audience: entry.audience,
          status: entry.status,
          sent_at: entry.sentAt,
        })
      }
      setData((prev) => ({
        ...prev,
        announcements: [entry, ...prev.announcements],
        activity: [log('sent announcement', draft.title), ...prev.activity].slice(0, 60),
      }))
    },
    [log],
  )

  const setPlanStatus = useCallback(
    (id: Plan['id'], status: PublishStatus) => {
      if (isSupabaseConfigured && supabase) {
        void supabase.from('plans').update({ status }).eq('id', id)
      }
      setData((prev) => {
        const plan = prev.plans.find((item) => item.id === id)
        if (!plan || plan.status === status) return prev
        return {
          ...prev,
          plans: prev.plans.map((item) => (item.id === id ? { ...item, status } : item)),
          activity: [
            log(status === 'Published' ? 'published plan' : 'took plan offline', `${plan.name} plan`),
            ...prev.activity,
          ].slice(0, 60),
        }
      })
    },
    [log],
  )

  const setCouponStatus = useCallback(
    (id: string, status: CouponStatus) => {
      if (isSupabaseConfigured && supabase) {
        void supabase.from('coupons').update({ status }).eq('id', id)
      }
      setData((prev) => {
        const coupon = prev.coupons.find((item) => item.id === id)
        if (!coupon || coupon.status === status) return prev
        return {
          ...prev,
          coupons: prev.coupons.map((item) => (item.id === id ? { ...item, status } : item)),
          activity: [
            log(status === 'Active' ? 'resumed coupon' : 'paused coupon', coupon.code),
            ...prev.activity,
          ].slice(0, 60),
        }
      })
    },
    [log],
  )

  const addCoupon = useCallback(
    (draft: Pick<Coupon, 'code' | 'discount' | 'kind' | 'limit' | 'expires'>) => {
      const entry: Coupon = {
        ...draft,
        id: `C-${Date.now()}`,
        code: draft.code.trim().toUpperCase(),
        plan: 'Pro',
        redemptions: 0,
        status: 'Active',
      }
      if (isSupabaseConfigured && supabase) {
        void supabase.from('coupons').insert({
          id: entry.id,
          code: entry.code,
          discount: entry.discount,
          kind: entry.kind,
          plan_name: entry.plan,
          redemptions: 0,
          redemption_limit: entry.limit,
          expires_at: entry.expires,
          status: entry.status,
        })
      }
      setData((prev) => ({
        ...prev,
        coupons: [entry, ...prev.coupons],
        activity: [log('created coupon', entry.code), ...prev.activity].slice(0, 60),
      }))
    },
    [log],
  )

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
    setData(seed())
    void refreshFromSupabase()
  }, [refreshFromSupabase])

  const value = useMemo<AdminStore>(
    () => ({
      data,
      actor,
      source,
      syncing,
      refreshFromSupabase,
      setLearnerStatus,
      setSubjectStatus,
      setSubjectExams,
      setChapterStatus,
      setChapterFree,
      setMockStatus,
      duplicateMock,
      setQuestionStatus,
      importQuestions,
      importChapterNote,
      addAnnouncement,
      setPlanStatus,
      setCouponStatus,
      addCoupon,
      reset,
    }),
    [
      data,
      actor,
      source,
      syncing,
      refreshFromSupabase,
      setLearnerStatus,
      setSubjectStatus,
      setSubjectExams,
      setChapterStatus,
      setChapterFree,
      setMockStatus,
      duplicateMock,
      setQuestionStatus,
      importQuestions,
      importChapterNote,
      addAnnouncement,
      setPlanStatus,
      setCouponStatus,
      addCoupon,
      reset,
    ],
  )

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const value = useContext(AdminContext)
  if (!value) throw new Error('useAdmin must be used inside AdminProvider')
  return value
}
