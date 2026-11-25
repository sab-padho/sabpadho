/** Public social-proof figure shown on the landing page. Update when the real count changes. */
export const communitySize = 241

export const learner = {
  name: 'Aarav Deshmukh',
  firstName: 'Aarav',
  email: 'aarav.deshmukh@example.com',
  city: 'Mumbai, Maharashtra',
  initials: 'AD',
  target: 'SSC CGL 2027 · Tier I',
  targetDate: '11 March 2027',
  daysToExam: 112,
  plan: 'Free plan',
  joined: 'August 2026',
  streak: 0,
  weeklyGoal: 300,
  questionsThisWeek: 0,
  minutesThisWeek: 0,
} as const

export const weeklyActivity = [
  { label: 'Thu', date: '13 Nov', questions: 0 },
  { label: 'Fri', date: '14 Nov', questions: 0 },
  { label: 'Sat', date: '15 Nov', questions: 0 },
  { label: 'Sun', date: '16 Nov', questions: 0 },
  { label: 'Mon', date: '17 Nov', questions: 0 },
  { label: 'Tue', date: '18 Nov', questions: 0 },
  { label: 'Wed', date: '19 Nov', questions: 0 },
]

export const accuracyTrend = [
  { label: 'Wk 41', value: 0 },
  { label: 'Wk 42', value: 0 },
  { label: 'Wk 43', value: 0 },
  { label: 'Wk 44', value: 0 },
  { label: 'Wk 45', value: 0 },
  { label: 'Wk 46', value: 0 },
]

export type RecentAttempt = {
  id: string
  paper: string
  subjectLabel: string
  date: string
  score: string
  accuracy: number
  href: string
}

export const recentAttempts: RecentAttempt[] = []

export const resumeSprint = {
  subjectSlug: 'maths',
  chapterSlug: 'percentages',
  chapterTitle: 'Percentages',
  subjectTitle: 'Quantitative Aptitude',
  answered: 7,
  total: 10,
  minutesLeft: 5,
}

export const revisionQueue = [
  { questionId: 'qa-pl-2', chapter: 'Profit & loss', subject: 'Maths', lastSeen: '3 days ago', due: 'Today' },
  { questionId: 'gi-syl-2', chapter: 'Syllogisms', subject: 'Reasoning', lastSeen: '2 days ago', due: 'Today' },
  { questionId: 'en-syn-3', chapter: 'Synonyms & antonyms', subject: 'English', lastSeen: '5 days ago', due: 'Today' },
  { questionId: 'ga-polity-1', chapter: 'Indian polity', subject: 'GK', lastSeen: 'Yesterday', due: 'Today' },
  { questionId: 'qa-pct-7', chapter: 'Percentages', subject: 'Maths', lastSeen: '4 days ago', due: 'Today' },
  { questionId: 'hi-muh-1', chapter: 'मुहावरे', subject: 'Hindi', lastSeen: '6 days ago', due: 'Today' },
]

export const revisionWeek = [
  { day: 'Thu', date: '19', due: 6, today: true },
  { day: 'Fri', date: '20', due: 3, today: false },
  { day: 'Sat', date: '21', due: 0, today: false },
  { day: 'Sun', date: '22', due: 4, today: false },
  { day: 'Mon', date: '23', due: 2, today: false },
  { day: 'Tue', date: '24', due: 5, today: false },
]

export const shelfItems = [
  { questionId: 'qa-pct-7', savedOn: '16 Nov 2026', note: 'The percentage-base question I keep missing.' },
  { questionId: 'ga-polity-1', savedOn: '15 Nov 2026', note: 'Article numbers for constitutional bodies.' },
  { questionId: 'en-syn-1', savedOn: '14 Nov 2026', note: '' },
  { questionId: 'gi-series-2', savedOn: '12 Nov 2026', note: 'Second-difference series pattern.' },
  { questionId: 'qa-tw-4', savedOn: '10 Nov 2026', note: 'Work-left-after-days type.' },
  { questionId: 'ga-geo-2', savedOn: '8 Nov 2026', note: '' },
  { questionId: 'en-idiom-2', savedOn: '6 Nov 2026', note: '' },
  { questionId: 'hi-sandhi-1', savedOn: '4 Nov 2026', note: 'गुण संधि के उदाहरण।' },
]

export const chapterPulse = [
  { chapter: 'Percentages', subject: 'Maths', attempts: 5, accuracy: 62, status: 'Practise next' },
  { chapter: 'Profit & loss', subject: 'Maths', attempts: 3, accuracy: 70, status: 'Practise next' },
  { chapter: 'Time & work', subject: 'Maths', attempts: 1, accuracy: null, status: 'Too early to tell' },
  { chapter: 'Ratio & proportion', subject: 'Maths', attempts: 8, accuracy: 81, status: 'Steady' },
  { chapter: 'Syllogisms', subject: 'Reasoning', attempts: 6, accuracy: 83, status: 'Steady' },
  { chapter: 'Coding–decoding', subject: 'Reasoning', attempts: 4, accuracy: 75, status: 'Steady' },
  { chapter: 'Spotting errors', subject: 'English', attempts: 5, accuracy: 66, status: 'Practise next' },
  { chapter: 'Indian polity', subject: 'GK', attempts: 6, accuracy: 78, status: 'Steady' },
]

export const planFeatures = [
  { title: 'Chapter primers', included: true, detail: 'Read any chapter outline without signing in.' },
  { title: 'Topic sprints', included: true, detail: '5, 10 or 15 questions with worked answers.' },
  { title: 'Exam rehearsals', included: true, detail: 'Timed papers with a section-wise score.' },
  { title: 'Recall calendar', included: true, detail: 'Mistakes return on a schedule you can see.' },
]
