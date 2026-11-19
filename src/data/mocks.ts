import type { SubjectId } from './subjects'

export type MockKind = 'Full length' | 'Sectional' | 'Mini'
export type MockStatus = 'available' | 'scheduled' | 'completed'

export type MockSection = {
  id: string
  name: string
  subjectIds: SubjectId[]
  questionIds: string[]
  /** Pattern count for papers kept as results rather than live sets. */
  patternQuestions?: number
}

export type MockPaper = {
  id: string
  title: string
  exam: 'SSC CGL' | 'SSC CHSL'
  kind: MockKind
  status: MockStatus
  durationMinutes: number
  sections: MockSection[]
  description: string
  opensOn?: string
  submittedOn?: string
  scoreLabel?: string
  /** Paper-level pattern counts for papers kept as results, not playable sets. */
  pattern?: { questions: number; marks: number }
}

const section = (
  id: string,
  name: string,
  subjectIds: SubjectId[],
  questionIds: string[],
  patternQuestions?: number,
): MockSection => ({ id, name, subjectIds, questionIds, patternQuestions })

export const mockPapers: MockPaper[] = [
  {
    id: 'mock-03',
    title: 'CGL Tier I · Mock 03',
    exam: 'SSC CGL',
    kind: 'Full length',
    status: 'completed',
    durationMinutes: 60,
    description:
      'The full Tier-I pattern: 100 questions across four sections, with 2 marks for a correct answer and 0.5 deducted for a wrong one.',
    submittedOn: '15 Nov 2026',
    scoreLabel: '133.5 / 200',
    pattern: { questions: 100, marks: 200 },
    sections: [
      section('reasoning', 'General Intelligence & Reasoning', ['reasoning'], [], 25),
      section('quant', 'Quantitative Aptitude', ['maths'], [], 25),
      section('english', 'English Comprehension', ['english'], [], 25),
      section('gk', 'General Awareness', ['gk'], [], 25),
    ],
  },
  {
    id: 'mock-04',
    title: 'CGL Tier I · Mock 04',
    exam: 'SSC CGL',
    kind: 'Full length',
    status: 'scheduled',
    durationMinutes: 60,
    description:
      'The next paper in the Sunday series. It follows the current Tier-I pattern and opens for a 24-hour window.',
    opensOn: 'Sun, 22 Nov · 6:00 pm',
    pattern: { questions: 100, marks: 200 },
    sections: [
      section('reasoning', 'General Intelligence & Reasoning', ['reasoning'], [], 25),
      section('quant', 'Quantitative Aptitude', ['maths'], [], 25),
      section('english', 'English Comprehension', ['english'], [], 25),
      section('gk', 'General Awareness', ['gk'], [], 25),
    ],
  },
  {
    id: 'mini-06',
    title: 'CGL Tier I · Mini mock 06',
    exam: 'SSC CGL',
    kind: 'Mini',
    status: 'available',
    durationMinutes: 15,
    description:
      'Twelve questions in the same four-section order as the real paper. A good pacing check when you have fifteen minutes.',
    sections: [
      section('reasoning', 'General Intelligence & Reasoning', ['reasoning'], [
        'gi-syl-1',
        'gi-code-1',
        'gi-series-1',
      ]),
      section('quant', 'Quantitative Aptitude', ['maths'], ['qa-pct-2', 'qa-pl-2', 'qa-tw-1']),
      section('english', 'English Comprehension', ['english'], ['en-syn-1', 'en-idiom-1', 'en-fill-1']),
      section('gk', 'General Awareness', ['gk'], ['ga-polity-1', 'ga-geo-2', 'ga-science-1']),
    ],
  },
  {
    id: 'quant-sec-07',
    title: 'Quant · Sectional 07',
    exam: 'SSC CGL',
    kind: 'Sectional',
    status: 'available',
    durationMinutes: 10,
    description:
      'Eight quantitative questions from the chapters you have practised this week. Answers are graded when you submit.',
    sections: [
      section('quant', 'Quantitative Aptitude', ['maths'], [
        'qa-pct-1',
        'qa-pct-3',
        'qa-pct-5',
        'qa-pl-1',
        'qa-pl-3',
        'qa-tw-2',
        'qa-tw-3',
        'qa-ratio-1',
      ]),
    ],
  },
  {
    id: 'reasoning-sec-06',
    title: 'Reasoning · Sectional 06',
    exam: 'SSC CGL',
    kind: 'Sectional',
    status: 'available',
    durationMinutes: 9,
    description:
      'Syllogisms, coding and series in one short paper — the three patterns that carry the reasoning section.',
    sections: [
      section('reasoning', 'General Intelligence & Reasoning', ['reasoning'], [
        'gi-syl-1',
        'gi-syl-2',
        'gi-syl-3',
        'gi-code-1',
        'gi-code-2',
        'gi-series-1',
        'gi-series-2',
      ]),
    ],
  },
  {
    id: 'english-sec-07',
    title: 'English · Sectional 07',
    exam: 'SSC CGL',
    kind: 'Sectional',
    status: 'available',
    durationMinutes: 8,
    description:
      'Six vocabulary and grammar questions. Keep an eye on the clock — Tier-I English gives you about 36 seconds a question.',
    sections: [
      section('english', 'English Comprehension', ['english'], [
        'en-syn-1',
        'en-syn-2',
        'en-syn-3',
        'en-idiom-1',
        'en-idiom-2',
        'en-error-1',
      ]),
    ],
  },
]

export function getMock(id: string) {
  return mockPapers.find((paper) => paper.id === id)
}

export function isPlayableMock(id: string) {
  const paper = getMock(id)
  return Boolean(
    paper && paper.status === 'available' && paper.sections.some((part) => part.questionIds.length > 0),
  )
}

export function sectionQuestionCount(section: MockSection) {
  return section.questionIds.length || section.patternQuestions || 0
}

export function paperQuestionCount(paper: MockPaper) {
  const playable = paper.sections.reduce((total, part) => total + part.questionIds.length, 0)
  return playable || paper.pattern?.questions || 0
}

export function paperMarks(paper: MockPaper) {
  if (paper.pattern) return paper.pattern.marks
  return paperQuestionCount(paper) * 2
}

/** A submitted full mock kept in the demo so the result screen has real depth. */
export const completedMockResult = {
  paperId: 'mock-03',
  submittedOn: '15 Nov 2026',
  score: 133.5,
  maxScore: 200,
  correct: 73,
  wrong: 25,
  unattempted: 2,
  accuracy: 73,
  timeUsed: '54:20',
  sections: [
    { name: 'Reasoning', correct: 21, total: 25 },
    { name: 'Quantitative Aptitude', correct: 15, total: 25 },
    { name: 'English Comprehension', correct: 19, total: 25 },
    { name: 'General Awareness', correct: 18, total: 25 },
  ],
  pulse: [
    { chapter: 'Percentages', attempts: 5, accuracy: 62, status: 'Practise next' },
    { chapter: 'Time & work', attempts: 2, accuracy: null, status: 'Too early to tell' },
    { chapter: 'Syllogisms', attempts: 6, accuracy: 83, status: 'Steady' },
  ],
  review: [
    { questionId: 'qa-pct-7', picked: 1, status: 'Incorrect' as const },
    { questionId: 'gi-syl-2', picked: 1, status: 'Incorrect' as const },
    { questionId: 'en-error-1', picked: 0, status: 'Incorrect' as const },
    { questionId: 'ga-geo-2', picked: 3, status: 'Incorrect' as const },
  ],
}

export type AttemptSnapshot = {
  paperId: string
  answers: Record<string, number>
  marked: string[]
  timeUsedSeconds: number
  submittedAt: string
}
