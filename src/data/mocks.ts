import type { SubjectId } from './subjects'
import type { ExamId } from './exams'

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
  exam: ExamId
  kind: MockKind
  status: MockStatus
  durationMinutes: number
  sections: MockSection[]
  description: string
  descriptionHi: string
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
    descriptionHi:
      'पूरा Tier-I पैटर्न: चार सेक्शनों में 100 प्रश्न, सही उत्तर पर 2 अंक और गलत पर 0.5 कटौती।',
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
    descriptionHi:
      'रविवार सीरीज़ का अगला पेपर। मौजूदा Tier-I पैटर्न पर, 24 घंटे के लिए खुलेगा।',
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
    descriptionHi:
      'असली पेपर जैसे चार-सेक्शन क्रम में बारह प्रश्न। पंद्रह मिनट में गति जाँचने का अच्छा तरीका।',
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
    descriptionHi:
      'इस हफ्ते अभ्यास किए अध्यायों से आठ मात्रात्मक प्रश्न। जमा करते ही उत्तर जाँचे जाते हैं।',
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
      'Syllogisms, coding and series in one short paper, the three patterns that carry the reasoning section.',
    descriptionHi:
      'एक छोटे पेपर में न्यायवाक्य, कोडिंग और शृंखला, रीज़निंग सेक्शन के तीन अहम पैटर्न।',
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
      'Six vocabulary and grammar questions. Keep an eye on the clock, Tier-I English gives you about 36 seconds a question.',
    descriptionHi:
      'शब्दावली और व्याकरण के छह प्रश्न। घड़ी पर नज़र रखें, Tier-I अंग्रेज़ी में प्रति प्रश्न लगभग 36 सेकंड मिलते हैं।',
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
  {
    id: 'chsl-mini-01',
    title: 'CHSL Tier I · Mini mock 01',
    exam: 'SSC CHSL',
    kind: 'Mini',
    status: 'available',
    durationMinutes: 12,
    description:
      'Ten questions in the CHSL Tier-I pattern across Reasoning, Quant, Language (Hindi/English) and General Awareness.',
    descriptionHi:
      'CHSL Tier-I पैटर्न में दस प्रश्न: रीज़निंग, गणित, भाषा (हिंदी/अंग्रेज़ी) और सामान्य जागरूकता।',
    sections: [
      section('reasoning', 'General Intelligence & Reasoning', ['reasoning'], ['gi-syl-1', 'gi-code-1']),
      section('quant', 'Quantitative Aptitude', ['maths'], ['qa-pct-1', 'qa-ratio-1', 'qa-pl-1']),
      section('hindi', 'Hindi / English Language', ['hindi', 'english'], ['hi-muh-1', 'hi-paryay-1', 'en-syn-1']),
      section('gk', 'General Awareness', ['gk'], ['ga-polity-1', 'ga-science-1']),
    ],
  },
  {
    id: 'gd-mini-01',
    title: 'SSC GD Constable · Speed Set 01',
    exam: 'SSC GD',
    kind: 'Mini',
    status: 'available',
    durationMinutes: 12,
    description:
      'Eight questions tailored to the SSC GD Constable CBT pattern: Elementary Maths, Reasoning, General Knowledge and Hindi.',
    descriptionHi:
      'SSC GD कांस्टेबल पैटर्न पर आधारित आठ प्रश्नों का त्वरित अभ्यास सेट।',
    sections: [
      section('reasoning', 'General Intelligence & Reasoning', ['reasoning'], ['gi-code-1', 'gi-series-1']),
      section('quant', 'Elementary Mathematics', ['maths'], ['qa-pct-1', 'qa-tw-1']),
      section('hindi', 'Hindi Language', ['hindi'], ['hi-muh-1', 'hi-vakya-1']),
      section('gk', 'General Knowledge', ['gk'], ['ga-polity-1', 'ga-geo-2']),
    ],
  },
  {
    id: 'rrb-ntpc-01',
    title: 'Railways RRB NTPC · CBT-1 Mini 01',
    exam: 'Railways',
    kind: 'Mini',
    status: 'available',
    durationMinutes: 14,
    description:
      'Nine questions on the RRB NTPC Stage-I scheme with higher weight on General Science, Static GK, Maths and Reasoning.',
    descriptionHi:
      'रेलवे RRB NTPC CBT-1 पैटर्न पर आधारित नौ प्रश्न: सामान्य विज्ञान, जागरूकता, गणित और तर्कशक्ति।',
    sections: [
      section('maths', 'Mathematics', ['maths'], ['qa-pct-1', 'qa-tw-1', 'qa-ratio-1']),
      section('reasoning', 'General Intelligence & Reasoning', ['reasoning'], ['gi-syl-1', 'gi-series-1', 'gi-code-1']),
      section('gk', 'General Awareness & Science', ['gk'], ['ga-polity-1', 'ga-geo-2', 'ga-science-1']),
    ],
  },
  {
    id: 'ibps-po-01',
    title: 'Banking IBPS PO · Prelims Mini 01',
    exam: 'Banking',
    kind: 'Mini',
    status: 'available',
    durationMinutes: 12,
    description:
      'Three-section IBPS PO Prelims speed rehearsal covering English Language, Quantitative Aptitude and Reasoning Ability.',
    descriptionHi:
      'बैंकिंग IBPS PO प्रारंभिक परीक्षा के तीन सेक्शनों का गति अभ्यास: अंग्रेज़ी, गणित और रीज़निंग।',
    sections: [
      section('english', 'English Language', ['english'], ['en-syn-1', 'en-error-1', 'en-fill-1']),
      section('quant', 'Quantitative Aptitude', ['maths'], ['qa-pct-1', 'qa-pl-2', 'qa-ratio-1']),
      section('reasoning', 'Reasoning Ability', ['reasoning'], ['gi-syl-1', 'gi-code-1', 'gi-series-1']),
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
