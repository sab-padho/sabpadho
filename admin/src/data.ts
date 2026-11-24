/**
 * Demo data for the admin portal. Everything here is fictional and lives in the
 * browser: edits are kept in localStorage (see store.tsx) and never leave the page.
 */

export type PublishStatus = 'Published' | 'Draft' | 'Archived'
export type LearnerStatus = 'Active' | 'Invited' | 'Suspended'
export type Difficulty = 'Easy' | 'Medium' | 'Hard'
export type ExamTarget = 'SSC CGL' | 'SSC CHSL' | 'SSC GD' | 'Railways' | 'Banking'
export const EXAM_TARGETS: ExamTarget[] = ['SSC CGL', 'SSC CHSL', 'SSC GD', 'Railways', 'Banking']

export type Learner = {
  id: string
  name: string
  email: string
  status: LearnerStatus
  target: ExamTarget
  joined: string
  lastActive: string
  attempts: number
  accuracy: number
  streak: number
  saved: number
}

export type Chapter = {
  id: string
  title: string
  questions: number
  status: PublishStatus
  difficulty: Difficulty
  updated: string
  isFree?: boolean
  exams?: ExamTarget[]
}

export type Subject = {
  id: string
  name: string
  code: string
  section: string
  learners: number
  accuracy: number
  status: PublishStatus
  chapters: Chapter[]
}

export type MockTest = {
  id: string
  title: string
  sections: number
  questions: number
  minutes: number
  attempts: number
  avgScore: number
  status: PublishStatus
  updated: string
}

export type Question = {
  id: string
  subject: string
  subjectId?: string
  chapter: string
  chapterId?: string
  prompt: string
  promptHi?: string
  optionsEn?: [string, string, string, string]
  optionsHi?: [string, string, string, string]
  correct?: 0 | 1 | 2 | 3
  explanationEn?: string
  explanationHi?: string
  exams?: ExamTarget[]
  difficulty: Difficulty
  type: 'MCQ' | 'Numeric'
  language: 'EN' | 'EN + HI'
  status: PublishStatus
  accuracy: number
  updated: string
}

export type ChapterNoteRecord = {
  id: string
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
  status: PublishStatus
  sourceFilename?: string
  updated: string
}

export type Announcement = {
  id: string
  title: string
  body: string
  audience: 'All learners' | ExamTarget
  status: 'Sent' | 'Draft'
  sentAt: string
}

export type ActivityEntry = {
  id: string
  actor: string
  action: string
  target: string
  at: string
}

export type DayPoint = { date: string; attempts: number; learners: number }

export type Plan = {
  id: 'free' | 'pro'
  name: string
  price: number
  period: 'forever' | 'year'
  tagline: string
  learners: number
  status: PublishStatus
  featured: boolean
  features: string[]
}

export type CouponStatus = 'Active' | 'Paused' | 'Expired'

export type Coupon = {
  id: string
  code: string
  discount: number
  kind: 'percent' | 'flat'
  plan: 'Free' | 'Pro'
  redemptions: number
  limit: number
  expires: string
  status: CouponStatus
}

/** Static headline figure for the demo: the tables below show a sample of accounts. */
export const TOTAL_LEARNERS = 241

export type AdminData = {
  learners: Learner[]
  subjects: Subject[]
  mocks: MockTest[]
  questions: Question[]
  notes: ChapterNoteRecord[]
  announcements: Announcement[]
  activity: ActivityEntry[]
  daily: DayPoint[]
  plans: Plan[]
  coupons: Coupon[]
}

const iso = (daysAgo: number, hour = 9) => {
  const date = new Date('2026-11-20T00:00:00Z')
  date.setUTCDate(date.getUTCDate() - daysAgo)
  date.setUTCHours(hour, 0, 0, 0)
  return date.toISOString()
}

const daily: DayPoint[] = Array.from({ length: 14 }, (_, index) => {
  const daysAgo = 13 - index
  const wave = Math.sin(index / 2.1) * 90 + Math.cos(index / 1.3) * 40
  const attempts = Math.round(360 + wave + index * 9)
  return { date: iso(daysAgo), attempts, learners: Math.round(attempts / 38) }
})

const learners: Learner[] = [
  { id: 'L-1041', name: 'Aarav Sharma', email: 'aarav.sharma@example.com', status: 'Active', target: 'SSC CGL', joined: iso(96), lastActive: iso(0, 7), attempts: 1842, accuracy: 78, streak: 12, saved: 34 },
  { id: 'L-1042', name: 'Meera Patil', email: 'meera.patil@example.com', status: 'Active', target: 'SSC CHSL', joined: iso(74), lastActive: iso(0, 11), attempts: 1210, accuracy: 71, streak: 6, saved: 21 },
  { id: 'L-1043', name: 'Riya Shah', email: 'riya.shah@example.com', status: 'Invited', target: 'SSC CGL', joined: iso(1), lastActive: iso(1), attempts: 0, accuracy: 0, streak: 0, saved: 0 },
  { id: 'L-1044', name: 'Kabir Nair', email: 'kabir.nair@example.com', status: 'Active', target: 'SSC CGL', joined: iso(58), lastActive: iso(2), attempts: 964, accuracy: 64, streak: 3, saved: 12 },
  { id: 'L-1045', name: 'Ananya Deshmukh', email: 'ananya.deshmukh@example.com', status: 'Active', target: 'SSC CHSL', joined: iso(41), lastActive: iso(0, 9), attempts: 745, accuracy: 83, streak: 21, saved: 27 },
  { id: 'L-1046', name: 'Vihaan Iyer', email: 'vihaan.iyer@example.com', status: 'Suspended', target: 'SSC CGL', joined: iso(122), lastActive: iso(19), attempts: 330, accuracy: 48, streak: 0, saved: 4 },
  { id: 'L-1047', name: 'Sara Khan', email: 'sara.khan@example.com', status: 'Active', target: 'SSC CGL', joined: iso(33), lastActive: iso(1), attempts: 512, accuracy: 69, streak: 4, saved: 9 },
  { id: 'L-1048', name: 'Dhruv Mehta', email: 'dhruv.mehta@example.com', status: 'Active', target: 'SSC CHSL', joined: iso(19), lastActive: iso(0, 6), attempts: 288, accuracy: 61, streak: 2, saved: 7 },
  { id: 'L-1049', name: 'Ishita Rao', email: 'ishita.rao@example.com', status: 'Invited', target: 'SSC CGL', joined: iso(3), lastActive: iso(3), attempts: 0, accuracy: 0, streak: 0, saved: 0 },
  { id: 'L-1050', name: 'Aditya Kulkarni', email: 'aditya.kulkarni@example.com', status: 'Active', target: 'SSC CGL', joined: iso(64), lastActive: iso(4), attempts: 1103, accuracy: 74, streak: 9, saved: 18 },
  { id: 'L-1051', name: 'Neha Verma', email: 'neha.verma@example.com', status: 'Active', target: 'SSC CHSL', joined: iso(12), lastActive: iso(0, 8), attempts: 176, accuracy: 57, streak: 5, saved: 3 },
  { id: 'L-1052', name: 'Rohan Gupta', email: 'rohan.gupta@example.com', status: 'Active', target: 'SSC CGL', joined: iso(87), lastActive: iso(6), attempts: 1462, accuracy: 81, streak: 1, saved: 41 },
]

const chapter = (id: string, title: string, questions: number, status: PublishStatus, difficulty: Difficulty, daysAgo: number, isFree = false): Chapter => ({
  id, title, questions, status, difficulty, updated: iso(daysAgo), isFree,
})

const subjects: Subject[] = [
  {
    id: 'maths', name: 'Quantitative Aptitude', code: 'QA', section: 'Section I', learners: 1240, accuracy: 72, status: 'Published',
    chapters: [
      chapter('maths-percentages', 'Percentages', 84, 'Published', 'Easy', 3, true),
      chapter('maths-ratio', 'Ratio & proportion', 66, 'Published', 'Medium', 8),
      chapter('maths-profit-loss', 'Profit & loss', 58, 'Published', 'Medium', 12),
      chapter('maths-time-work', 'Time & work', 49, 'Draft', 'Hard', 1),
      chapter('maths-averages', 'Averages', 37, 'Published', 'Easy', 21),
      chapter('maths-geometry', 'Geometry', 72, 'Draft', 'Hard', 0),
    ],
  },
  {
    id: 'reasoning', name: 'General Intelligence & Reasoning', code: 'GI', section: 'Section II', learners: 1188, accuracy: 69, status: 'Published',
    chapters: [
      chapter('reasoning-series', 'Number series', 61, 'Published', 'Medium', 5),
      chapter('reasoning-syllogisms', 'Syllogisms', 44, 'Published', 'Medium', 9, true),
      chapter('reasoning-blood', 'Blood relations', 32, 'Published', 'Easy', 15),
      chapter('reasoning-direction', 'Direction & distance', 28, 'Published', 'Easy', 18),
      chapter('reasoning-coding', 'Coding & decoding', 51, 'Draft', 'Medium', 2),
    ],
  },
  {
    id: 'english', name: 'English Language', code: 'EN', section: 'Section III', learners: 1092, accuracy: 66, status: 'Published',
    chapters: [
      chapter('english-synonyms', 'Synonyms & antonyms', 96, 'Published', 'Medium', 4, true),
      chapter('english-errors', 'Spotting errors', 78, 'Published', 'Hard', 7),
      chapter('english-blanks', 'Fill in the blanks', 64, 'Published', 'Easy', 11),
      chapter('english-idioms', 'Idioms & phrases', 57, 'Published', 'Medium', 14),
      chapter('english-oneword', 'One-word substitution', 43, 'Draft', 'Medium', 3),
    ],
  },
  {
    id: 'gk', name: 'General Awareness', code: 'GA', section: 'Section IV', learners: 986, accuracy: 61, status: 'Published',
    chapters: [
      chapter('gk-polity', 'Indian polity', 88, 'Published', 'Medium', 6, true),
      chapter('gk-history', 'Modern history', 74, 'Published', 'Hard', 10),
      chapter('gk-geography', 'Geography', 69, 'Published', 'Medium', 13),
      chapter('gk-science', 'General science', 82, 'Draft', 'Hard', 2),
      chapter('gk-static', 'Static GK', 55, 'Published', 'Easy', 20),
    ],
  },
  {
    id: 'hindi', name: 'Hindi Language', code: 'HI', section: 'Section III (CHSL & GD)', learners: 431, accuracy: 74, status: 'Published',
    chapters: [
      chapter('hindi-sandhi', 'Sandhi', 38, 'Published', 'Medium', 4),
      chapter('hindi-muhavare', 'Muhavare', 46, 'Published', 'Medium', 6, true),
      chapter('hindi-vyakaran', 'Vyakaran', 52, 'Draft', 'Hard', 8),
    ],
  },
]

const mocks: MockTest[] = [
  { id: 'M-01', title: 'Foundation Mock 01', sections: 4, questions: 100, minutes: 60, attempts: 842, avgScore: 126.4, status: 'Published', updated: iso(2) },
  { id: 'M-02', title: 'Foundation Mock 02', sections: 4, questions: 100, minutes: 60, attempts: 611, avgScore: 118.9, status: 'Published', updated: iso(5) },
  { id: 'M-03', title: 'Quantitative Aptitude Sprint', sections: 1, questions: 25, minutes: 20, attempts: 1904, avgScore: 16.8, status: 'Published', updated: iso(1) },
  { id: 'M-04', title: 'Reasoning Booster', sections: 1, questions: 25, minutes: 20, attempts: 733, avgScore: 17.9, status: 'Published', updated: iso(9) },
  { id: 'M-05', title: 'GA Weekly 03', sections: 1, questions: 20, minutes: 15, attempts: 288, avgScore: 11.2, status: 'Draft', updated: iso(0, 8) },
  { id: 'M-06', title: 'Full-Length Practice 01', sections: 4, questions: 100, minutes: 60, attempts: 407, avgScore: 131.7, status: 'Published', updated: iso(12) },
  { id: 'M-07', title: 'English Sectional 02', sections: 1, questions: 25, minutes: 20, attempts: 0, avgScore: 0, status: 'Draft', updated: iso(3) },
  { id: 'M-08', title: 'CHSL Prelims 01', sections: 4, questions: 100, minutes: 60, attempts: 96, avgScore: 108.3, status: 'Archived', updated: iso(44) },
]

const questions: Question[] = [
  { id: 'Q-201', subject: 'Quantitative Aptitude', chapter: 'Percentages', prompt: 'If 40% of a number is 96, what is 15% of the same number?', difficulty: 'Easy', type: 'MCQ', language: 'EN + HI', status: 'Published', accuracy: 82, updated: iso(2) },
  { id: 'Q-202', subject: 'Quantitative Aptitude', chapter: 'Ratio & proportion', prompt: 'A sum of ₹1,800 is divided between A and B in the ratio 4 : 5. How much does B receive?', difficulty: 'Easy', type: 'MCQ', language: 'EN + HI', status: 'Published', accuracy: 76, updated: iso(4) },
  { id: 'Q-203', subject: 'Quantitative Aptitude', chapter: 'Profit & loss', prompt: 'A shopkeeper marks an article 25% above cost and allows a 12% discount. His profit percentage is:', difficulty: 'Medium', type: 'MCQ', language: 'EN', status: 'Published', accuracy: 58, updated: iso(6) },
  { id: 'Q-204', subject: 'Quantitative Aptitude', chapter: 'Time & work', prompt: 'A alone finishes a job in 12 days, B in 18. Working together, how many days do they take?', difficulty: 'Hard', type: 'Numeric', language: 'EN + HI', status: 'Draft', accuracy: 44, updated: iso(1) },
  { id: 'Q-205', subject: 'Quantitative Aptitude', chapter: 'Averages', prompt: 'The average of five numbers is 27. If one number 45 is removed, the new average is:', difficulty: 'Medium', type: 'MCQ', language: 'EN', status: 'Published', accuracy: 69, updated: iso(8) },
  { id: 'Q-206', subject: 'General Intelligence & Reasoning', chapter: 'Number series', prompt: 'Find the next term: 3, 7, 16, 35, 74, ?', difficulty: 'Medium', type: 'MCQ', language: 'EN + HI', status: 'Published', accuracy: 63, updated: iso(3) },
  { id: 'Q-207', subject: 'General Intelligence & Reasoning', chapter: 'Syllogisms', prompt: 'All pens are books. Some books are tables. Which conclusion follows?', difficulty: 'Hard', type: 'MCQ', language: 'EN', status: 'Published', accuracy: 51, updated: iso(5) },
  { id: 'Q-208', subject: 'General Intelligence & Reasoning', chapter: 'Blood relations', prompt: 'P is Q\'s brother. R is Q\'s mother. S is R\'s father. How is P related to S?', difficulty: 'Easy', type: 'MCQ', language: 'EN + HI', status: 'Published', accuracy: 88, updated: iso(7) },
  { id: 'Q-209', subject: 'General Intelligence & Reasoning', chapter: 'Direction & distance', prompt: 'A man walks 5 km north, turns right and walks 3 km. How far is he from the start?', difficulty: 'Easy', type: 'Numeric', language: 'EN', status: 'Published', accuracy: 74, updated: iso(11) },
  { id: 'Q-210', subject: 'English Language', chapter: 'Spotting errors', prompt: 'Identify the segment that contains the grammatical error.', difficulty: 'Hard', type: 'MCQ', language: 'EN', status: 'Published', accuracy: 47, updated: iso(2) },
  { id: 'Q-211', subject: 'English Language', chapter: 'Synonyms & antonyms', prompt: 'Choose the word most nearly opposite in meaning to "benevolent".', difficulty: 'Medium', type: 'MCQ', language: 'EN', status: 'Published', accuracy: 71, updated: iso(9) },
  { id: 'Q-212', subject: 'English Language', chapter: 'Idioms & phrases', prompt: 'What does "to let the cat out of the bag" mean?', difficulty: 'Easy', type: 'MCQ', language: 'EN', status: 'Published', accuracy: 79, updated: iso(13) },
  { id: 'Q-213', subject: 'English Language', chapter: 'One-word substitution', prompt: 'One word for "a person who speaks many languages":', difficulty: 'Medium', type: 'MCQ', language: 'EN + HI', status: 'Draft', accuracy: 66, updated: iso(0, 10) },
  { id: 'Q-214', subject: 'General Awareness', chapter: 'Indian polity', prompt: 'Which article of the Constitution deals with the Right to Education?', difficulty: 'Medium', type: 'MCQ', language: 'EN + HI', status: 'Published', accuracy: 61, updated: iso(4) },
  { id: 'Q-215', subject: 'General Awareness', chapter: 'Modern history', prompt: 'The Quit India Movement was launched in which year?', difficulty: 'Easy', type: 'MCQ', language: 'EN', status: 'Published', accuracy: 84, updated: iso(10) },
  { id: 'Q-216', subject: 'General Awareness', chapter: 'Geography', prompt: 'Which river is known as the "Sorrow of Bihar"?', difficulty: 'Medium', type: 'MCQ', language: 'EN', status: 'Published', accuracy: 68, updated: iso(12) },
  { id: 'Q-217', subject: 'General Awareness', chapter: 'General science', prompt: 'Which vitamin is produced when skin is exposed to sunlight?', difficulty: 'Easy', type: 'MCQ', language: 'EN + HI', status: 'Draft', accuracy: 73, updated: iso(1) },
  { id: 'Q-218', subject: 'General Awareness', chapter: 'Static GK', prompt: 'The headquarters of the Reserve Bank of India is located in:', difficulty: 'Easy', type: 'MCQ', language: 'EN', status: 'Archived', accuracy: 91, updated: iso(38) },
]

const announcements: Announcement[] = [
  { id: 'A-11', title: 'New full-length mock series', body: 'Six new full-length papers are live, modelled on the latest SSC pattern. Attempts unlock on Monday.', audience: 'All learners', status: 'Sent', sentAt: iso(4, 10) },
  { id: 'A-10', title: 'CGL prelims schedule change', body: 'The CGL prelims date has moved to 14 December. Timetables and the revision calendar have been updated.', audience: 'SSC CGL', status: 'Sent', sentAt: iso(9, 15) },
  { id: 'A-09', title: 'Hindi section now available', body: 'Hindi Language chapters and bilingual questions are being rolled out to CHSL learners this fortnight.', audience: 'SSC CHSL', status: 'Sent', sentAt: iso(16, 9) },
  { id: 'A-12', title: 'Weekly leaderboard', body: 'Top 20 learners by weekly practice accuracy will be shown on the dashboard.', audience: 'All learners', status: 'Draft', sentAt: iso(0, 12) },
]

const activity: ActivityEntry[] = [
  { id: 'E-1', actor: 'admin', action: 'published', target: 'Quantitative Aptitude Sprint', at: iso(1) },
  { id: 'E-2', actor: 'admin', action: 'archived', target: 'CHSL Prelims 01', at: iso(2) },
  { id: 'E-3', actor: 'aditya', action: 'updated', target: 'Time & work · 4 questions', at: iso(3) },
  { id: 'E-4', actor: 'vallabh', action: 'sent announcement', target: 'New full-length mock series', at: iso(4, 10) },
  { id: 'E-5', actor: 'aniket', action: 'suspended learner', target: 'Vihaan Iyer', at: iso(19) },
  { id: 'E-6', actor: 'admin', action: 'created', target: 'GA Weekly 03', at: iso(0, 8) },
]

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    tagline: 'Chapter primers, sprints and the recall calendar.',
    learners: 198,
    status: 'Published',
    featured: false,
    features: [
      'Chapter primers and outlines',
      '5-question topic sprints',
      'Recall calendar and revision queue',
      'Progress overview',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 51,
    period: 'year',
    tagline: 'Unlimited practice, full-length mocks and analytics — one payment a year.',
    learners: 43,
    status: 'Published',
    featured: true,
    features: [
      'Everything in Free',
      'Unlimited sprints, 10 and 15 question sets',
      'All full-length mock papers with section analytics',
      'Bilingual explanations for every question',
      'Saved question shelf and exports',
    ],
  },
]

const coupons: Coupon[] = [
  { id: 'C-01', code: 'WELCOME50', discount: 50, kind: 'percent', plan: 'Pro', redemptions: 62, limit: 200, expires: iso(-24), status: 'Active' },
  { id: 'C-02', code: 'PROLAUNCH', discount: 25, kind: 'percent', plan: 'Pro', redemptions: 12, limit: 100, expires: iso(-40), status: 'Active' },
  { id: 'C-03', code: 'EXAMPREP40', discount: 40, kind: 'percent', plan: 'Pro', redemptions: 88, limit: 100, expires: iso(-9), status: 'Active' },
  { id: 'C-04', code: 'CHSL20', discount: 20, kind: 'percent', plan: 'Pro', redemptions: 5, limit: 50, expires: iso(-18), status: 'Paused' },
  { id: 'C-05', code: 'SUMMER100', discount: 100, kind: 'flat', plan: 'Pro', redemptions: 200, limit: 200, expires: iso(12), status: 'Expired' },
  { id: 'C-06', code: 'FIRSTPRO', discount: 51, kind: 'flat', plan: 'Pro', redemptions: 17, limit: 120, expires: iso(-3), status: 'Active' },
]

export const seed = (): AdminData => ({
  learners,
  subjects,
  mocks,
  questions,
  notes: [],
  announcements,
  activity,
  daily,
  plans,
  coupons,
})

export const navigationPages = ['Overview', 'Learners', 'Subjects', 'Questions', 'Mock tests', 'Plans', 'Coupons', 'Announcements', 'Activity'] as const
export type Page = (typeof navigationPages)[number]
