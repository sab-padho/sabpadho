import * as pdfjsLib from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { Difficulty, ExamTarget } from './data'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

const OPENAI_KEY_STORAGE = 'sabpadho-openai-api-key'

export function getOpenAIApiKey(): string {
  const envKey = (import.meta.env.VITE_OPENAI_API_KEY as string | undefined)?.trim()
  if (envKey) return envKey
  try {
    return localStorage.getItem(OPENAI_KEY_STORAGE)?.trim() ?? ''
  } catch {
    return ''
  }
}

export function setOpenAIApiKey(key: string) {
  try {
    if (key.trim()) {
      localStorage.setItem(OPENAI_KEY_STORAGE, key.trim())
    } else {
      localStorage.removeItem(OPENAI_KEY_STORAGE)
    }
  } catch {
    /* ignore */
  }
}

export type ExtractedQuestion = {
  promptEn: string
  promptHi: string
  optionsEn: [string, string, string, string]
  optionsHi: [string, string, string, string]
  correct: 0 | 1 | 2 | 3
  explanationEn: string
  explanationHi: string
  difficulty: Difficulty
}

export type ExtractedNotes = {
  titleEn: string
  titleHi: string
  contentEn: string
  contentHi: string
  keyPointsEn: string[]
  keyPointsHi: string[]
  formulas: Array<{ label: string; expr: string }>
}

export type ExtractionPayload = {
  questions: ExtractedQuestion[]
  notes?: ExtractedNotes
}

type PreparedDocument = {
  filename: string
  text: string
  images: string[] // data URLs (image/png or image/jpeg)
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read uploaded file.'))
    reader.readAsDataURL(file)
  })
}

async function preparePdf(file: File): Promise<PreparedDocument> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const maxPages = Math.min(pdf.numPages, 12)
  const textChunks: string[] = []
  const renderedImages: string[] = []

  for (let pageNum = 1; pageNum <= maxPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (pageText) {
      textChunks.push(`--- Page ${pageNum} ---\n${pageText}`)
    }

    // If a page has very little selectable text (scanned PDF / math image), render to canvas for Vision
    if (pageText.length < 120 && renderedImages.length < 4) {
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = document.createElement('canvas')
      canvas.width = Math.floor(viewport.width)
      canvas.height = Math.floor(viewport.height)
      const ctx = canvas.getContext('2d')
      if (ctx) {
        await page.render({ canvasContext: ctx, canvas, viewport }).promise
        renderedImages.push(canvas.toDataURL('image/jpeg', 0.85))
      }
    }
  }

  return {
    filename: file.name,
    text: textChunks.join('\n\n'),
    images: renderedImages,
  }
}

export async function prepareUploadFile(file: File): Promise<PreparedDocument> {
  const lower = file.name.toLowerCase()
  if (file.type === 'application/pdf' || lower.endsWith('.pdf')) {
    return preparePdf(file)
  }
  if (file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(lower)) {
    const dataUrl = await fileToDataUrl(file)
    return {
      filename: file.name,
      text: '',
      images: [dataUrl],
    }
  }
  throw new Error('Unsupported file format. Upload a PDF, PNG, JPG, or WEBP file.')
}

function normalizeOptions(raw: unknown, fallbackPrefix = 'Option'): [string, string, string, string] {
  const arr = Array.isArray(raw) ? raw.map((x) => String(x ?? '').trim()).filter(Boolean) : []
  while (arr.length < 4) {
    arr.push(`${fallbackPrefix} ${arr.length + 1}`)
  }
  return [arr[0], arr[1], arr[2], arr[3]]
}

export async function convertFileWithOpenAI(options: {
  file: File
  mode: 'questions' | 'notes' | 'both'
  subjectName: string
  chapterTitle: string
  exams: ExamTarget[]
  apiKey?: string
}): Promise<ExtractionPayload> {
  const key = (options.apiKey ?? getOpenAIApiKey()).trim()
  if (!key) {
    throw new Error(
      'OpenAI API key is required. Set VITE_OPENAI_API_KEY in .env or paste your OpenAI key in the importer.',
    )
  }

  const prepared = await prepareUploadFile(options.file)
  if (!prepared.text && prepared.images.length === 0) {
    throw new Error('Could not extract readable text or page images from this file.')
  }

  const systemPrompt = `You are an expert Indian competitive exam curriculum editor for SabPadho (${options.exams.join(', ')}).
Subject: ${options.subjectName}
Chapter: ${options.chapterTitle}
Extraction mode: ${options.mode}

Convert the supplied PDF text and/or page images into clean, accurate, bilingual (English + Hindi Devanagari) structured study data.
Return STRICT JSON matching this exact shape:
{
  "questions": [
    {
      "promptEn": "Clear MCQ question stem in English",
      "promptHi": "Accurate Hindi translation of the question stem",
      "optionsEn": ["Option A", "Option B", "Option C", "Option D"],
      "optionsHi": ["विकल्प A", "विकल्प B", "विकल्प C", "विकल्प D"],
      "correct": 0,
      "explanationEn": "Concise step-by-step solution in English",
      "explanationHi": "संक्षिप्त हिंदी व्याख्या",
      "difficulty": "Easy"
    }
  ],
  "notes": {
    "titleEn": "Concise study note title in English",
    "titleHi": "अध्याय नोट शीर्षक (हिंदी)",
    "contentEn": "Well-structured study summary in English",
    "contentHi": "सुव्यवस्थित अध्ययन सारांश (हिंदी)",
    "keyPointsEn": ["Bullet point 1", "Bullet point 2"],
    "keyPointsHi": ["मुख्य बिंदु 1", "मुख्य बिंदु 2"],
    "formulas": [{ "label": "Formula / Rule name", "expr": "Expression or rule" }]
  }
}

Rules:
- If mode is "questions", focus on extracting/converting all MCQs into "questions" (at least 1 if any content is present) and omit "notes" or leave empty.
- If mode is "notes", focus on generating comprehensive chapter notes, key points, and formulas in "notes", and return "questions": [].
- If mode is "both", populate BOTH "questions" and "notes".
- "correct" MUST be an integer 0, 1, 2, or 3 corresponding to the right option index.
- "difficulty" MUST be one of "Easy", "Medium", or "Hard".
- If the source document is only in English or only in Hindi, translate accurately so BOTH English and Hindi fields are complete.`

  type ContentPart =
    | { type: 'text'; text: string }
    | { type: 'image_url'; image_url: { url: string; detail?: 'high' | 'auto' } }

  const userContent: ContentPart[] = [
    {
      type: 'text',
      text: prepared.text
        ? `Source file: ${prepared.filename}\n\nExtracted text:\n${prepared.text.slice(0, 28000)}`
        : `Source file: ${prepared.filename}\nExtract content from the attached image(s).`,
    },
    ...prepared.images.map(
      (url): ContentPart => ({
        type: 'image_url',
        image_url: { url, detail: 'high' },
      }),
    ),
  ]

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
    }),
  })

  if (!response.ok) {
    let detail = `HTTP ${response.status}`
    try {
      const errBody = (await response.json()) as { error?: { message?: string } }
      if (errBody?.error?.message) detail = errBody.error.message
    } catch {
      /* ignore */
    }
    throw new Error(`OpenAI API error: ${detail}`)
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const rawJson = payload.choices?.[0]?.message?.content
  if (!rawJson) {
    throw new Error('OpenAI returned an empty response.')
  }

  const parsed = JSON.parse(rawJson) as {
    questions?: Array<Record<string, unknown>>
    notes?: Record<string, unknown>
  }

  const questions: ExtractedQuestion[] = Array.isArray(parsed.questions)
    ? parsed.questions
        .map((q) => {
          const promptEn = String(q.promptEn ?? q.prompt ?? '').trim()
          if (!promptEn) return null
          const promptHi = String(q.promptHi ?? promptEn).trim()
          const optionsEn = normalizeOptions(q.optionsEn, 'Option')
          const optionsHi = normalizeOptions(q.optionsHi ?? q.optionsEn, 'विकल्प')
          const rawCorrect = Number(q.correct ?? 0)
          const correct = (
            rawCorrect >= 0 && rawCorrect <= 3 ? Math.round(rawCorrect) : 0
          ) as 0 | 1 | 2 | 3
          const rawDiff = String(q.difficulty ?? 'Medium')
          const difficulty: Difficulty =
            rawDiff === 'Easy' || rawDiff === 'Medium' || rawDiff === 'Hard'
              ? rawDiff
              : 'Medium'
          return {
            promptEn,
            promptHi,
            optionsEn,
            optionsHi,
            correct,
            explanationEn: String(q.explanationEn ?? '').trim() || 'Solution derived from chapter rule.',
            explanationHi:
              String(q.explanationHi ?? q.explanationEn ?? '').trim() ||
              'अध्याय नियम पर आधारित हल।',
            difficulty,
          }
        })
        .filter((item): item is ExtractedQuestion => Boolean(item))
    : []

  let notes: ExtractedNotes | undefined
  if (parsed.notes && typeof parsed.notes === 'object' && options.mode !== 'questions') {
    const n = parsed.notes
    const titleEn = String(n.titleEn ?? '').trim()
    const contentEn = String(n.contentEn ?? '').trim()
    if (titleEn || contentEn) {
      notes = {
        titleEn: titleEn || `${options.chapterTitle} — Study Notes`,
        titleHi: String(n.titleHi ?? titleEn ?? options.chapterTitle).trim(),
        contentEn,
        contentHi: String(n.contentHi ?? contentEn).trim(),
        keyPointsEn: Array.isArray(n.keyPointsEn)
          ? n.keyPointsEn.map((x) => String(x).trim()).filter(Boolean)
          : [],
        keyPointsHi: Array.isArray(n.keyPointsHi)
          ? n.keyPointsHi.map((x) => String(x).trim()).filter(Boolean)
          : [],
        formulas: Array.isArray(n.formulas)
          ? n.formulas
              .map((f) => {
                if (!f || typeof f !== 'object') return null
                const rec = f as Record<string, unknown>
                const label = String(rec.label ?? '').trim()
                const expr = String(rec.expr ?? '').trim()
                return label && expr ? { label, expr } : null
              })
              .filter((f): f is { label: string; expr: string } => Boolean(f))
          : [],
      }
    }
  }

  return { questions, notes }
}
