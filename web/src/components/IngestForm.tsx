'use client'

import React from 'react'

import { useState, useCallback } from 'react'

const CONTENT_TYPES = [
  { value: 'transcript', label: 'Transcript (video/podcast)' },
  { value: 'article', label: 'Article / Blog Post' },
  { value: 'paper', label: 'Research Paper' },
  { value: 'note', label: 'Note / Idea' },
  { value: 'video-notes', label: 'Video Notes' },
  { value: 'framework-doc', label: 'Framework Documentation' },
  { value: 'conversation', label: 'Claude Conversation Export' },
  { value: 'code-example', label: 'Code Example / Snippet' },
]

interface IngestResult {
  success: boolean
  path: string
  message: string
  nextSteps: string[]
}

export default function IngestForm(): React.ReactElement {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('transcript')
  const [content, setContent] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<IngestResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || isSubmitting) return

    setIsSubmitting(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          type,
          content: content.trim(),
          sourceUrl: sourceUrl.trim() || undefined,
        }),
      })

      const data = await response.json() as IngestResult & { error?: string }

      if (!response.ok) {
        setError(data.error || `Error: ${response.status}`)
        return
      }

      setResult(data)
      // Clear form on success
      setTitle('')
      setContent('')
      setSourceUrl('')
      setType('transcript')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }, [title, type, content, sourceUrl, isSubmitting])

  const charCount = content.length
  const wordCount = content.split(/\s+/).filter(Boolean).length

  return (
    <div>
      {/* Success result */}
      {result && (
        <div style={{
          background: '#f0fff4',
          border: '1px solid #68d391',
          borderRadius: '3px',
          padding: '1rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ fontWeight: 'bold', color: '#276749', marginBottom: '0.5rem' }}>
            Material saved successfully
          </div>
          <div style={{
            fontFamily: 'monospace',
            background: '#e6ffed',
            padding: '0.4rem 0.75rem',
            borderRadius: '2px',
            fontSize: '0.875rem',
            color: '#276749',
            marginBottom: '0.75rem',
          }}>
            {result.path}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#276749', marginBottom: '0.75rem' }}>
            {result.message}
          </div>
          <div style={{ fontSize: '0.875rem' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.4rem', color: '#202122' }}>
              Next steps to process this into the wiki:
            </div>
            <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
              {result.nextSteps.map((step, i) => (
                <li key={i} style={{ marginBottom: '0.25rem', color: '#202122' }}>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div style={{
            marginTop: '0.75rem',
            padding: '0.5rem 0.75rem',
            background: '#fff',
            border: '1px solid #a2a9b1',
            borderRadius: '2px',
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            color: '#202122',
          }}>
            <div style={{ color: '#54595d', marginBottom: '0.25rem', fontFamily: 'sans-serif', fontSize: '0.75rem' }}>
              Claude Code command:
            </div>
            cd /Users/jaywest/Agentic-KB && claude &quot;Ingest {result.path}&quot;
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background: '#fff5f5',
          border: '1px solid #fc8181',
          borderRadius: '3px',
          padding: '0.75rem',
          marginBottom: '1rem',
          fontSize: '0.875rem',
          color: '#c53030',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={(e) => { void handleSubmit(e) }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
          <tbody>
            {/* Title */}
            <tr>
              <td style={{ width: '120px', paddingBottom: '0.75rem', verticalAlign: 'top', paddingTop: '0.3rem' }}>
                <label style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                  Title <span style={{ color: '#ba0000' }}>*</span>
                </label>
              </td>
              <td style={{ paddingBottom: '0.75rem' }}>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Descriptive title for this material"
                  required
                  style={{
                    width: '100%',
                    padding: '0.4rem 0.6rem',
                    border: '1px solid #a2a9b1',
                    borderRadius: '2px',
                    fontSize: '0.875rem',
                    fontFamily: '-apple-system, sans-serif',
                    outline: 'none',
                  }}
                />
              </td>
            </tr>

            {/* Type */}
            <tr>
              <td style={{ paddingBottom: '0.75rem', verticalAlign: 'top', paddingTop: '0.3rem' }}>
                <label style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                  Type <span style={{ color: '#ba0000' }}>*</span>
                </label>
              </td>
              <td style={{ paddingBottom: '0.75rem' }}>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  style={{
                    padding: '0.4rem 0.6rem',
                    border: '1px solid #a2a9b1',
                    borderRadius: '2px',
                    fontSize: '0.875rem',
                    background: '#fff',
                    outline: 'none',
                    minWidth: '220px',
                  }}
                >
                  {CONTENT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <div style={{ fontSize: '0.75rem', color: '#54595d', marginTop: '0.25rem' }}>
                  Determines which raw/ subdirectory this is saved to
                </div>
              </td>
            </tr>

            {/* Source URL */}
            <tr>
              <td style={{ paddingBottom: '0.75rem', verticalAlign: 'top', paddingTop: '0.3rem' }}>
                <label style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                  Source URL
                </label>
              </td>
              <td style={{ paddingBottom: '0.75rem' }}>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://... (optional)"
                  style={{
                    width: '100%',
                    padding: '0.4rem 0.6rem',
                    border: '1px solid #a2a9b1',
                    borderRadius: '2px',
                    fontSize: '0.875rem',
                    fontFamily: '-apple-system, sans-serif',
                    outline: 'none',
                  }}
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* Content */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <label style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
              Content <span style={{ color: '#ba0000' }}>*</span>
            </label>
            <span style={{ fontSize: '0.75rem', color: '#54595d' }}>
              {wordCount.toLocaleString()} words · {charCount.toLocaleString()} chars
            </span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste transcript, article text, paper content, notes, or any raw material here...

The content will be saved to raw/{type}/ with proper frontmatter. After saving, run the INGEST workflow to process it into the wiki."
            rows={16}
            required
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem',
              border: '1px solid #a2a9b1',
              borderRadius: '2px',
              fontSize: '0.85rem',
              fontFamily: 'Georgia, serif',
              lineHeight: 1.6,
              resize: 'vertical',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="submit"
            disabled={!title.trim() || !content.trim() || isSubmitting}
            style={{
              padding: '0.5rem 1.5rem',
              background: title.trim() && content.trim() && !isSubmitting ? '#0645ad' : '#a2a9b1',
              color: '#fff',
              border: 'none',
              borderRadius: '2px',
              cursor: title.trim() && content.trim() && !isSubmitting ? 'pointer' : 'default',
              fontSize: '0.875rem',
            }}
          >
            {isSubmitting ? 'Saving...' : 'Save to raw/'}
          </button>

          <span style={{ fontSize: '0.8rem', color: '#54595d' }}>
            Saved to <code style={{ background: '#f8f9fa', padding: '0.1em 0.3em', border: '1px solid #e0e0e0' }}>
              raw/{type}/
            </code> — not yet processed into the wiki
          </span>
        </div>
      </form>
    </div>
  )
}
