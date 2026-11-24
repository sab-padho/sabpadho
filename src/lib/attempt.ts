import type { AttemptSnapshot, MockPaper } from '../data/mocks'
import { questionById } from '../data/questions'
import { isSupabaseConfigured, supabase } from './supabase'

export type AttemptState = {
  paperId: string
  answers: Record<string, number>
  marked: string[]
  startedAt: number
  durationSeconds: number
  sectionIndex: number
  index: number
}

const ATTEMPT_PREFIX = 'sabpadho-attempt-'
const RESULT_PREFIX = 'sabpadho-result-'

export function loadAttempt(paperId: string): AttemptState | null {
  try {
    const raw = sessionStorage.getItem(`${ATTEMPT_PREFIX}${paperId}`)
    return raw ? (JSON.parse(raw) as AttemptState) : null
  } catch {
    return null
  }
}

export function saveAttempt(state: AttemptState) {
  try {
    sessionStorage.setItem(`${ATTEMPT_PREFIX}${state.paperId}`, JSON.stringify(state))
  } catch {
    /* storage may be full or blocked */
  }
}

export function clearAttempt(paperId: string) {
  try {
    sessionStorage.removeItem(`${ATTEMPT_PREFIX}${paperId}`)
  } catch {
    /* ignore */
  }
}

export function loadResult(paperId: string): AttemptSnapshot | null {
  try {
    const raw = localStorage.getItem(`${RESULT_PREFIX}${paperId}`)
    return raw ? (JSON.parse(raw) as AttemptSnapshot) : null
  } catch {
    return null
  }
}

export function saveResult(snapshot: AttemptSnapshot) {
  try {
    localStorage.setItem(`${RESULT_PREFIX}${snapshot.paperId}`, JSON.stringify(snapshot))
  } catch {
    /* ignore */
  }
  if (isSupabaseConfigured && supabase) {
    try {
      const rawAuth = localStorage.getItem('sabpadho-auth-v2')
      const parsed = rawAuth ? (JSON.parse(rawAuth) as { email?: string }) : null
      if (parsed?.email) {
        void supabase.from('mock_attempts').upsert(
          {
            learner_email: parsed.email,
            paper_id: snapshot.paperId,
            answers: snapshot.answers,
            marked: snapshot.marked,
            submitted_at: snapshot.submittedAt,
            time_used_seconds: snapshot.timeUsedSeconds,
          },
          { onConflict: 'learner_email,paper_id' },
        )
      }
    } catch {
      /* ignore */
    }
  }
}

export type ComputedResult = {
  paperId: string
  correct: number
  wrong: number
  unattempted: number
  score: number
  maxScore: number
  accuracy: number
  total: number
  sections: Array<{ name: string; correct: number; total: number }>
}

export function computeResult(
  paper: MockPaper,
  answers: Record<string, number>,
  _timeUsedSeconds?: number,
  lookupQuestion: (id: string) => { correct: number } | undefined = questionById,
): ComputedResult {
  let correct = 0
  let wrong = 0
  let unattempted = 0
  let total = 0

  const sections = paper.sections.map((section) => {
    let sectionCorrect = 0
    for (const questionId of section.questionIds) {
      total += 1
      const question = lookupQuestion(questionId)
      const picked = answers[questionId]
      if (picked === undefined || picked === null) {
        unattempted += 1
      } else if (question && picked === question.correct) {
        correct += 1
        sectionCorrect += 1
      } else {
        wrong += 1
      }
    }
    return { name: section.name, correct: sectionCorrect, total: section.questionIds.length }
  })

  const score = Math.max(0, correct * 2 - wrong * 0.5)
  return {
    paperId: paper.id,
    correct,
    wrong,
    unattempted,
    score,
    maxScore: total * 2,
    accuracy: total ? Math.round((correct / total) * 100) : 0,
    total,
    sections,
  }
}
