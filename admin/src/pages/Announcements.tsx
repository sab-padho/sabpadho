import { useState, type FormEvent } from 'react'
import { Megaphone, Send } from 'lucide-react'
import type { Announcement } from '../data'
import { useAdmin } from '../store'
import { Badge, PageHeader, Select, formatDate, relativeTime, statusTone, useToast } from '../ui'

const audiences: Announcement['audience'][] = ['All learners', 'SSC CGL', 'SSC CHSL', 'SSC GD', 'Railways', 'Banking']

export function Announcements() {
  const { data, addAnnouncement } = useAdmin()
  const notify = useToast()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [audience, setAudience] = useState<Announcement['audience']>('All learners')
  const [error, setError] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim() || !body.trim()) {
      setError('Add a title and a message before sending.')
      return
    }
    addAnnouncement({ title: title.trim(), body: body.trim(), audience })
    notify(`Announcement sent to ${audience.toLowerCase()}`)
    setTitle('')
    setBody('')
    setError('')
  }

  return (
    <>
      <PageHeader
        eyebrow="ADMIN PORTAL"
        title="Announcements"
        description={`${data.announcements.filter(item => item.status === 'Sent').length} sent · ${data.announcements.filter(item => item.status === 'Draft').length} draft`}
      />

      <div className="announce-grid">
        <section className="panel composer">
          <header>
            <span className="icon-tile"><Megaphone size={20} /></span>
            <div>
              <h2>New announcement</h2>
              <p>Goes out to the selected audience immediately.</p>
            </div>
          </header>
          <form onSubmit={submit}>
            <div className="field-group">
              <label htmlFor="announcement-title">Title</label>
              <input
                id="announcement-title"
                value={title}
                onChange={event => { setTitle(event.target.value); setError('') }}
                placeholder="Mock series 02 is live"
                maxLength={80}
              />
            </div>
            <div className="field-group">
              <label htmlFor="announcement-body">Message</label>
              <textarea
                id="announcement-body"
                value={body}
                onChange={event => { setBody(event.target.value); setError('') }}
                placeholder="Two new full-length papers are available from Monday."
                rows={5}
                maxLength={320}
              />
              <small className="field-note">{body.length}/320 characters</small>
            </div>
            <Select value={audience} onChange={setAudience} options={audiences} label="Audience" />
            {error && <p className="notice" role="alert">{error}</p>}
            <button className="button primary" type="submit"><Send size={16} />Send announcement</button>
          </form>
        </section>

        <section className="panel list-card">
          <header>
            <div>
              <h2>History</h2>
              <p>Most recent first</p>
            </div>
          </header>
          <ul className="announce-list">
            {data.announcements.map(item => (
              <li key={item.id}>
                <div className="announce-head">
                  <strong>{item.title}</strong>
                  <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                </div>
                <p>{item.body}</p>
                <div className="announce-meta">
                  <span>{item.audience}</span>
                  <span>{item.status === 'Sent' ? relativeTime(item.sentAt) : 'not sent'}</span>
                  <span>{formatDate(item.sentAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  )
}
