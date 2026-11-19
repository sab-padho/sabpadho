import type { Bilingual } from '../lib/lang'
import type { SubjectId } from './subjects'

export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export type Question = {
  id: string
  subjectId: SubjectId
  chapterId: string
  difficulty: Difficulty
  prompt: Bilingual
  options: { en: string[]; hi: string[] }
  correct: number
  explanation: Bilingual
}
