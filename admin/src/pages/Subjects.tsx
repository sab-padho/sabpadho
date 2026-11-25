import { useState } from 'react'
import { ChevronRight, Download, ListChecks, Sparkles } from 'lucide-react'
import { AiUploadDrawer } from '../AiUploadDrawer'
import type { Subject } from '../data'
import { toLearnerChapterId, useAdmin } from '../store'
import { Badge, Drawer, PageHeader, Progress, Toggle, downloadCsv, formatDate, number, relativeTime, statusTone, useToast } from '../ui'
import { Questions } from './Questions'

export function Subjects() {
  const { data, setSubjectStatus, setChapterStatus, setChapterFree } = useAdmin()
  const notify = useToast()
  const [view, setView] = useState<'subjects' | 'questions'>('subjects')
  const [open, setOpen] = useState<string | null>(null)
  const [uploadTarget, setUploadTarget] = useState<{
    subjectId: string
    chapterId?: string
  } | null>(null)
  const subject = data.subjects.find(item => item.id === open) ?? null
  const chapters = data.subjects.reduce((sum, item) => sum + item.chapters.length, 0)
  const drafts = data.subjects.reduce((sum, item) => sum + item.chapters.filter(chapter => chapter.status === 'Draft').length, 0)

  function exportCsv() {
    downloadCsv('sabpadho-subjects.csv', [
      ['Subject', 'Code', 'Section', 'Status', 'Chapters', 'Published chapters', 'Questions', 'Learners', 'Accuracy %'],
      ...data.subjects.map(item => [
        item.name, item.code, item.section, item.status, item.chapters.length,
        item.chapters.filter(chapter => chapter.status === 'Published').length,
        item.chapters.reduce((sum, chapter) => sum + chapter.questions, 0),
        item.learners, item.accuracy,
      ]),
    ])
    notify('Exported the subject catalogue')
  }

  function toggleChapter(current: Subject, chapterId: string, next: boolean) {
    const title = current.chapters.find(chapter => chapter.id === chapterId)?.title ?? ''
    setChapterStatus(current.id, chapterId, next ? 'Published' : 'Draft')
    notify(next ? `${title} published` : `${title} moved to draft`)
  }

  return (
    <>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`button ${view === 'subjects' ? 'primary' : 'secondary'}`}
          onClick={() => setView('subjects')}
        >
          Subjects &amp; Chapters ({data.subjects.length})
        </button>
        <button
          type="button"
          className={`button ${view === 'questions' ? 'primary' : 'secondary'}`}
          onClick={() => setView('questions')}
        >
          <ListChecks size={16} />
          Questions Bank ({number(data.questions.length)})
        </button>
      </div>

      {view === 'questions' ? (
        <Questions />
      ) : (
        <>
      <PageHeader
        eyebrow="ADMIN PORTAL"
        title="Subjects & Notes"
        description={`${data.subjects.length} subjects · ${chapters} chapters · ${data.notes.length} AI note sets · ${drafts} chapters in draft`}
        actions={
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className="button primary"
              onClick={() => setUploadTarget({ subjectId: data.subjects[0]?.id ?? 'maths' })}
            >
              <Sparkles size={16} />
              Upload PDF / Image Notes
            </button>
            <button className="button secondary" onClick={exportCsv}>
              <Download size={16} />
              Export CSV
            </button>
          </div>
        }
      />

      <section className="panel table-panel">
        <div className="table-scroll">
          <table aria-label="Subjects">
            <thead>
              <tr>
                <th scope="col">Subject</th>
                <th scope="col">Chapters</th>
                <th scope="col">Questions</th>
                <th scope="col">Accuracy</th>
                <th scope="col">Status</th>
                <th scope="col">Live</th>
                <th scope="col"><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody>
              {data.subjects.map(item => {
                const published = item.chapters.filter(chapter => chapter.status === 'Published').length
                return (
                  <tr key={item.id} className="clickable" onClick={() => setOpen(item.id)}>
                    <td data-label="Subject">
                      <button className="cell-button" onClick={() => setOpen(item.id)}>
                        <strong>{item.name}</strong>
                        <small className="cell-sub">{item.code} · {item.section}</small>
                      </button>
                    </td>
                    <td data-label="Chapters">{published}/{item.chapters.length} published</td>
                    <td data-label="Questions">{number(item.chapters.reduce((sum, chapter) => sum + chapter.questions, 0))}</td>
                    <td data-label="Accuracy">
                      <div className="cell-meter">
                        <Progress value={item.accuracy} tone={item.accuracy >= 70 ? 'positive' : item.accuracy >= 60 ? 'brand' : 'warning'} />
                        <span>{item.accuracy}%</span>
                      </div>
                    </td>
                    <td data-label="Status"><Badge tone={statusTone(item.status)}>{item.status}</Badge></td>
                    <td data-label="Live" onClick={event => event.stopPropagation()}>
                      <Toggle
                        checked={item.status === 'Published'}
                        label={`${item.status === 'Published' ? 'Unpublish' : 'Publish'} ${item.name}`}
                        onChange={next => {
                          setSubjectStatus(item.id, next ? 'Published' : 'Draft')
                          notify(next ? `${item.name} published` : `${item.name} moved to draft`)
                        }}
                      />
                    </td>
                    <td className="chev-cell" data-label=""><ChevronRight size={16} className="row-chevron" /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <footer className="table-foot">Toggle a subject to publish or unpublish it; open a row to manage its chapters.</footer>
      </section>

      {subject && (
        <Drawer title={subject.name} subtitle={`${subject.code} · ${subject.section} · ${number(subject.learners ?? 0)} learners`} onClose={() => setOpen(null)}>
          <div className="drawer-row">
            <Badge tone={statusTone(subject.status)}>{subject.status}</Badge>
            <Badge tone="brand">{(subject.chapters ?? []).length} chapters</Badge>
            <Badge tone="neutral">{subject.accuracy ?? 0}% accuracy</Badge>
          </div>

          <div className="drawer-block">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Chapters</h3>
              <button
                type="button"
                className="button small primary"
                onClick={() => setUploadTarget({ subjectId: subject.id })}
              >
                <Sparkles size={13} /> Upload Notes / MCQs
              </button>
            </div>
            <ul className="chapter-list">
              {(subject.chapters ?? []).map(chapter => {
                const noteCount = (data.notes ?? []).filter(
                  n => n.chapterId === toLearnerChapterId(chapter.id) || n.chapterId === chapter.id,
                ).length
                return (
                <li key={chapter.id}>
                  <div>
                    <strong>{chapter.title}</strong>
                    <small>
                      {chapter.questions ?? 0} questions
                      {noteCount > 0 ? ` · ${noteCount} note${noteCount === 1 ? '' : 's'}` : ''}
                      {chapter.isFree ? ' · Free visitor sample' : ' · Signup required'}
                      {chapter.updated ? ` · edited ${relativeTime(chapter.updated)}` : ''}
                    </small>
                  </div>
                  <div className="chapter-actions">
                    <button
                      type="button"
                      className="button small secondary"
                      onClick={() => {
                        const nextFree = !chapter.isFree
                        setChapterFree(subject.id, chapter.id, nextFree)
                        notify(
                          nextFree
                            ? `${chapter.title} marked as free visitor primer`
                            : `${chapter.title} restricted to signed-up learners`,
                        )
                      }}
                    >
                      {chapter.isFree ? 'Free primer' : 'Locked'}
                    </button>
                    <Badge tone={statusTone(chapter.status)}>{chapter.status}</Badge>
                    <Toggle
                      checked={chapter.status === 'Published'}
                      label={`${chapter.status === 'Published' ? 'Unpublish' : 'Publish'} ${chapter.title}`}
                      onChange={next => toggleChapter(subject, chapter.id, next)}
                    />
                  </div>
                </li>
                )
              })}
            </ul>
          </div>

          <div className="drawer-block">
            <h3>Details</h3>
            <ul className="key-values">
              <li>
                <span>Last catalogue change</span>
                <span>
                  {subject.chapters.length > 0
                    ? relativeTime(
                        subject.chapters.reduce(
                          (latest, chapter) => (chapter.updated > latest ? chapter.updated : latest),
                          subject.chapters[0].updated,
                        ),
                      )
                    : '—'}
                </span>
              </li>
              <li><span>Questions in subject</span><span>{number(subject.chapters.reduce((sum, chapter) => sum + chapter.questions, 0))}</span></li>
              <li>
                <span>Created</span>
                <span>{subject.chapters.length > 0 ? formatDate(subject.chapters[0].updated) : '—'}</span>
              </li>
            </ul>
          </div>
          <p className="drawer-note">Changes sync to Supabase tables (`subjects`, `chapters`, `chapter_notes`, `questions`) and update the learner portal.</p>
        </Drawer>
      )}

      {uploadTarget && (
        <AiUploadDrawer
          defaultMode="notes"
          defaultSubjectId={uploadTarget.subjectId}
          defaultChapterId={uploadTarget.chapterId}
          onClose={() => setUploadTarget(null)}
        />
      )}
        </>
      )}
    </>
  )
}
