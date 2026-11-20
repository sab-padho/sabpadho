export const sections = {
  Learners: {
    description: 'Review learner accounts and enrollment activity.',
    columns: ['Learner', 'Email', 'Status'],
    rows: [['Aarav Sharma', 'aarav@example.com', 'Active'], ['Meera Patil', 'meera@example.com', 'Active'], ['Riya Shah', 'riya@example.com', 'Pending']],
  },
  Subjects: {
    description: 'Review the subject and chapter catalog.',
    columns: ['Subject', 'Chapters', 'Status'],
    rows: [['Quantitative Aptitude', '12 chapters', 'Published'], ['Logical Reasoning', '9 chapters', 'Published'], ['General Awareness', '7 chapters', 'Draft']],
  },
  'Mock tests': {
    description: 'Review mock tests available in the practice catalog.',
    columns: ['Mock test', 'Questions', 'Status'],
    rows: [['Foundation Mock 01', '30 questions', 'Published'], ['Quantitative Aptitude Sprint', '20 questions', 'Draft'], ['Full-Length Practice 01', '100 questions', 'Published']],
  },
}
export type Section = keyof typeof sections
