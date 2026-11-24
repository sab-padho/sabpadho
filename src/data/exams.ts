import type { SubjectId } from './subjects'

export type ExamId = 'SSC CGL' | 'SSC CHSL' | 'SSC GD' | 'Railways' | 'Banking'

export type ExamConfig = {
  id: ExamId
  label: string
  shortLabel: string
  tagline: string
  taglineHi: string
  targetDisplay: string
  targetDate: string
  daysToExam: number
  subjects: SubjectId[]
  questionsCount: number
  durationMinutes: number
  sectionsCount: number
}

export const EXAM_OPTIONS: ExamConfig[] = [
  {
    id: 'SSC CGL',
    label: 'SSC CGL',
    shortLabel: 'SSC CGL',
    tagline: 'Combined Graduate Level · Quant, Reasoning, English & GA',
    taglineHi: 'कंबाइंड ग्रेजुएट लेवल · गणित, रीज़निंग, अंग्रेज़ी और सामान्य जागरूकता',
    targetDisplay: 'SSC CGL · Tier I',
    targetDate: '11 March 2027',
    daysToExam: 107,
    subjects: ['maths', 'reasoning', 'english', 'gk'],
    questionsCount: 100,
    durationMinutes: 60,
    sectionsCount: 4,
  },
  {
    id: 'SSC CHSL',
    label: 'SSC CHSL',
    shortLabel: 'SSC CHSL',
    tagline: '10+2 Higher Secondary · Quant, Reasoning, English/Hindi & GA',
    taglineHi: '10+2 हायर सेकेंडरी · गणित, रीज़निंग, अंग्रेज़ी/हिंदी और सामान्य जागरूकता',
    targetDisplay: 'SSC CHSL · Tier I',
    targetDate: '18 April 2027',
    daysToExam: 145,
    subjects: ['maths', 'reasoning', 'english', 'gk', 'hindi'],
    questionsCount: 100,
    durationMinutes: 60,
    sectionsCount: 4,
  },
  {
    id: 'SSC GD',
    label: 'SSC GD Constable',
    shortLabel: 'SSC GD',
    tagline: 'Constable GD CBT · Elementary Maths, Reasoning, GK & Hindi/English',
    taglineHi: 'कांस्टेबल GD · प्रारंभिक गणित, रीज़निंग, सामान्य ज्ञान और हिंदी/अंग्रेज़ी',
    targetDisplay: 'SSC GD · CBT',
    targetDate: '24 February 2027',
    daysToExam: 92,
    subjects: ['maths', 'reasoning', 'gk', 'hindi', 'english'],
    questionsCount: 80,
    durationMinutes: 60,
    sectionsCount: 4,
  },
  {
    id: 'Railways',
    label: 'Railways (RRB NTPC / Group D)',
    shortLabel: 'Railways',
    tagline: 'RRB NTPC & Group D · Maths, General Intelligence & General Science/GA',
    taglineHi: 'रेलवे RRB NTPC · गणित, तर्कशक्ति और सामान्य विज्ञान व जागरूकता',
    targetDisplay: 'RRB NTPC · CBT 1',
    targetDate: '09 May 2027',
    daysToExam: 166,
    subjects: ['maths', 'reasoning', 'gk'],
    questionsCount: 100,
    durationMinutes: 90,
    sectionsCount: 3,
  },
  {
    id: 'Banking',
    label: 'Banking (IBPS / SBI PO & Clerk)',
    shortLabel: 'Banking',
    tagline: 'IBPS & SBI Prelims · Quantitative Aptitude, Reasoning & English',
    taglineHi: 'बैंकिंग IBPS / SBI · गणित, रीज़निंग और अंग्रेज़ी भाषा',
    targetDisplay: 'IBPS PO · Prelims',
    targetDate: '28 March 2027',
    daysToExam: 124,
    subjects: ['maths', 'reasoning', 'english', 'gk'],
    questionsCount: 100,
    durationMinutes: 60,
    sectionsCount: 3,
  },
]

export const EXAM_IDS: ExamId[] = EXAM_OPTIONS.map((exam) => exam.id)

export function getExamConfig(examId?: string | null): ExamConfig {
  return EXAM_OPTIONS.find((item) => item.id === examId) ?? EXAM_OPTIONS[0]
}

export function isValidExam(value: unknown): value is ExamId {
  return typeof value === 'string' && EXAM_IDS.includes(value as ExamId)
}
