'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import WikiLayout from '@/components/WikiLayout'

interface StreamEvent {
  type: 'thinking' | 'reading' | 'answer' | 'sources' | 'done' | 'error'
  content?: string
  path?: string
  paths?: string[]
}

interface QueryState {
  thinking: string[]
  reading: string[]
  answer: string
  sources: string[]
  error: string | null
  isStreaming: boolean
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  savedPath: string | null
  autoCompile: boolean
}

const EXAMPLE_QUESTIONS = [
  'What is the best pattern for multi-agent orchestration in Claude Code?',
  'How do I manage context across a long agentic session without losing state?',
  'Compare GSD vs LangGraph for a 5-step research pipeline',
  "What are Jay's validated patterns for tool design?",
  'What memory architecture does Karpathy recommend for LLM wikis?',
  'How does the fan-out worker pattern work and when should I use it?',
  'What are the main failure modes of agentic systems?',
  'How do I build an LLM-as-judge evaluation harness?',
]

function pathToSlug(filePath: string): string {
  return filePath.replace(/^wiki\//, '').replace(/\.md$/, '')
}

function pathToLabel(filePath: string): string {
  const slug = pathToSlug(filePath)
  const parts = slug.split('/')
  const name = parts[parts.length - 1]
  return name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default function QueryPage(): React.ReactElement {
  const [question, setQuestion] = useState('')
  const [state, setState] = useState<QueryState>({
    thinking: [],
    reading: [],
    answer: '',
    sources: [],
    error: null,
    isStreaming: false,
    saveStatus: 'idle',
    savedPath: null,
    autoCompile: false,
  })
  const abortRef = useRef<AbortController | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const answerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (answerRef.current && state.answer) {
      answerRef.current.scrollTop = answerRef.current.scrollHeight
    }
  }, [state.answer])

  const handleSubmit = useCallback(async (q?: string): Promise<void> => {
    const queryText = (q || question).trim()
    if (!queryText || state.isStreaming) return

    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    setState(prev => ({
      thinking: [],
      reading: [],
      answer: '',
      sources: [],
      error: null,
      isStreaming: true,
      saveStatus: 'idle',
      savedPath: null,
      autoCompile: prev.autoCompile,
    }))

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: queryText }),
        signal: abortRef.current.signal,
      })

      if (!response.ok || !response.body) {
        throw new Error(`Request failed: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6)) as StreamEvent
            setState(prev => {
              switch (event.type) {
                case 'thinking':
                  return { ...prev, thinking: [...prev.thinking, event.content || ''] }
                case 'reading':
                  return { ...prev, reading: [...prev.reading, event.path || ''] }
                case 'answer':
                  return { ...prev, answer: prev.answer + (event.content || '') }
                case 'sources':
                  return { ...prev, sources: event.paths || [] }
                case 'error':
                  return { ...prev, error: event.content || 'Unknown error', isStreaming: false }
                case 'done':
                  return { ...prev, isStreaming: false }
                default:
                  return prev
              }
            })
          } catch {
            // Skip malformed events
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      const message = err instanceof Error ? err.message : 'Request failed'
      setState(prev => ({ ...prev, error: message, isStreaming: false }))
    }
  }, [question, state.isStreaming])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      void handleSubmit()
    }
  }, [handleSubmit])

  const handleExampleClick = useCallback((q: string): void => {
    setQuestion(q)
    void handleSubmit(q)
    textareaRef.current?.focus()
  }, [handleSubmit])

  const handleSaveToKB = useCallback(async (verified: boolean): Promise<void> => {
    if (!state.answer || state.isStreaming) return
    setState(prev => ({ ...prev, saveStatus: 'saving' }))
    try {
      const res = await fetch('/api/query/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          answer: state.answer,
          sources: state.sources,
          verified,
          autoCompile: state.autoCompile,
        }),
      })
      const data = await res.json() as { ok?: boolean; path?: string; error?: string }
      if (!res.ok || !data.ok) {
        setState(prev => ({ ...prev, saveStatus: 'error', error: data.error || 'Save failed' }))
        return
      }
      setState(prev => ({ ...prev, saveStatus: 'saved', savedPath: data.path || null }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Save failed'
      setState(prev => ({ ...prev, saveStatus: 'error', error: message }))
    }
  }, [question, state.answer, state.sources, state.isStreaming, state.autoCompile])

  const hasResponse = state.thinking.length > 0 || state.answer || state.error

  return (
    <WikiLayout>
      <div>
        {/* Page header */}
        <div style={{
          background: '#fff',
          border: '1px solid #a2a9b1',
          borderBottom: 'none',
          padding: '0.75rem 1rem 0',
        }}>
          <h1 style={{
            fontFamily: "'Linux Libertine', Georgia, serif",
            fontSize: '2rem',
            fontWeight: 'normal',
            margin: 0,
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #a2a9b1',
            color: '#202122',
          }}>
            AI WikiQuery
          </h1>
          <div style={{
            fontSize: '0.75rem',
            color: '#54595d',
            padding: '0.4rem 0',
            fontFamily: '-apple-system, sans-serif',
          }}>
            Navigates the wiki to answer your questions — reads files directly, no RAG or vector embeddings
          </div>
        </div>

        <div className="article-body">
          {/* How it works */}
          <div style={{
            float: 'right',
            background: '#f8f9fa',
            border: '1px solid #a2a9b1',
            padding: '0.75rem 1rem',
            margin: '0 0 1.5rem 2rem',
            maxWidth: '280px',
            fontSize: '0.8rem',
            fontFamily: '-apple-system, sans-serif',
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#202122' }}>
              How WikiQuery works
            </div>
            <ol style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: 1.8 }}>
              <li>Read <code>wiki/index.md</code></li>
              <li>Identify 3–5 relevant articles</li>
              <li>Read those article files</li>
              <li>Synthesize answer with citations</li>
            </ol>
            <div style={{ marginTop: '0.75rem', color: '#54595d', fontSize: '0.75rem' }}>
              Model: <strong>claude-sonnet-4-6</strong><br />
              No embeddings · No vector DB · Pure file navigation
            </div>
          </div>

          {/* Question input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.95rem' }}>
              Ask a question
            </div>
            <textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What would you like to know about agentic engineering?"
              rows={4}
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                border: '1px solid #a2a9b1',
                borderRadius: '2px',
                fontSize: '0.9rem',
                fontFamily: 'Georgia, serif',
                lineHeight: 1.6,
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#54595d', fontFamily: '-apple-system, sans-serif' }}>
                ⌘+Enter to submit
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {state.isStreaming && (
                  <button
                    onClick={() => { abortRef.current?.abort(); setState(p => ({ ...p, isStreaming: false })) }}
                    style={{
                      padding: '0.4rem 1rem',
                      border: '1px solid #a2a9b1',
                      borderRadius: '2px',
                      background: '#f8f9fa',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontFamily: '-apple-system, sans-serif',
                    }}
                  >
                    Stop
                  </button>
                )}
                <button
                  onClick={() => { void handleSubmit() }}
                  disabled={!question.trim() || state.isStreaming}
                  style={{
                    padding: '0.4rem 1.5rem',
                    border: 'none',
                    borderRadius: '2px',
                    background: question.trim() && !state.isStreaming ? '#0645ad' : '#a2a9b1',
                    color: '#fff',
                    cursor: question.trim() && !state.isStreaming ? 'pointer' : 'default',
                    fontSize: '0.875rem',
                    fontFamily: '-apple-system, sans-serif',
                  }}
                >
                  {state.isStreaming ? 'Searching wiki...' : 'Ask WikiQuery'}
                </button>
              </div>
            </div>
          </div>

          {/* Response area */}
          {hasResponse && (
            <div ref={answerRef}>
              <hr />

              {/* Process log */}
              {(state.thinking.length > 0 || state.reading.length > 0) && (
                <div style={{
                  background: '#f8f9fa',
                  border: '1px solid #a2a9b1',
                  borderRadius: '2px',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  fontFamily: '-apple-system, sans-serif',
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '0.4rem', color: '#54595d' }}>
                    Query trace
                  </div>
                  {state.thinking.map((thought, i) => (
                    <div key={`t-${i}`} className="thinking-step">
                      {state.isStreaming && i === state.thinking.length - 1 && state.reading.length === 0 ? '⟳' : '✓'} {thought}
                    </div>
                  ))}
                  {state.reading.map((filePath, i) => (
                    <div key={`r-${i}`} className="reading-step">
                      📄{' '}
                      <Link
                        href={`/wiki/${pathToSlug(filePath)}`}
                        style={{ color: '#0645ad', textDecoration: 'none' }}
                      >
                        {filePath}
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              {/* Error */}
              {state.error && (
                <div style={{
                  background: '#fff5f5',
                  border: '1px solid #fc8181',
                  borderRadius: '3px',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  color: '#c53030',
                  fontFamily: '-apple-system, sans-serif',
                }}>
                  <strong>Error:</strong> {state.error}
                </div>
              )}

              {/* Answer */}
              {state.answer && (
                <div style={{ marginBottom: '1rem' }}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a({ href, children }) {
                        if (href?.startsWith('/')) {
                          return <Link href={href} style={{ color: '#0645ad' }}>{children}</Link>
                        }
                        return <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#0645ad' }}>{children}</a>
                      },
                    }}
                  >
                    {state.answer}
                  </ReactMarkdown>
                  {state.isStreaming && (
                    <span style={{
                      display: 'inline-block',
                      width: '2px',
                      height: '1em',
                      background: '#202122',
                      animation: 'blink 1s step-end infinite',
                      verticalAlign: 'middle',
                      marginLeft: '2px',
                    }} />
                  )}
                </div>
              )}

              {/* Compounding Loop — save Q&A back to KB */}
              {state.answer && !state.isStreaming && (
                <div style={{
                  margin: '1rem 0',
                  padding: '0.75rem 1rem',
                  background: '#f1f8ff',
                  border: '1px solid #c8e1ff',
                  borderRadius: '3px',
                  fontFamily: '-apple-system, sans-serif',
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.35rem', color: '#24292e', fontSize: '0.85rem' }}>
                    🔄 Compounding Loop
                  </div>
                  <div style={{ color: '#586069', marginBottom: '0.6rem', fontSize: '0.8rem' }}>
                    Save this Q&amp;A to the KB so the next compile folds it into the wiki. Every question makes the next answer better.
                  </div>
                  {state.saveStatus === 'saved' ? (
                    <div style={{ color: '#22863a', fontWeight: 500, fontSize: '0.8rem' }}>
                      ✓ Saved to <code style={{ fontSize: '0.75rem' }}>{state.savedPath}</code>
                      {state.autoCompile ? ' — compile triggered.' : ' — run Compile to fold in.'}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button
                        type="button"
                        disabled={state.saveStatus === 'saving'}
                        onClick={() => { void handleSaveToKB(false) }}
                        style={{
                          padding: '0.3rem 0.8rem',
                          border: '1px solid #0645ad',
                          borderRadius: '2px',
                          background: '#fff',
                          color: '#0645ad',
                          cursor: state.saveStatus === 'saving' ? 'default' : 'pointer',
                          fontSize: '0.8rem',
                        }}
                      >
                        {state.saveStatus === 'saving' ? 'Saving…' : 'Save to KB'}
                      </button>
                      <button
                        type="button"
                        disabled={state.saveStatus === 'saving'}
                        onClick={() => { void handleSaveToKB(true) }}
                        title="Mark as verified — higher weight during compile & ranking"
                        style={{
                          padding: '0.3rem 0.8rem',
                          border: '1px solid #22863a',
                          borderRadius: '2px',
                          background: '#22863a',
                          color: '#fff',
                          cursor: state.saveStatus === 'saving' ? 'default' : 'pointer',
                          fontSize: '0.8rem',
                        }}
                      >
                        ✓ Save as Verified
                      </button>
                      <label style={{ fontSize: '0.75rem', color: '#586069', marginLeft: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={state.autoCompile}
                          onChange={e => setState(prev => ({ ...prev, autoCompile: e.target.checked }))}
                          style={{ marginRight: '0.3rem' }}
                        />
                        Auto-compile after save
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Sources */}
              {state.sources.length > 0 && (
                <div style={{
                  borderTop: '1px solid #a2a9b1',
                  paddingTop: '0.75rem',
                  fontFamily: '-apple-system, sans-serif',
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#54595d', marginBottom: '0.4rem' }}>
                    Articles read ({state.sources.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {state.sources.map((src, i) => (
                      <Link
                        key={src + ':' + i}
                        href={`/wiki/${pathToSlug(src)}`}
                        style={{
                          display: 'inline-block',
                          background: '#eaecf0',
                          border: '1px solid #a2a9b1',
                          borderRadius: '2px',
                          padding: '0.2rem 0.6rem',
                          fontSize: '0.8rem',
                          color: '#0645ad',
                          textDecoration: 'none',
                        }}
                      >
                        {pathToLabel(src)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Example questions */}
          {!hasResponse && (
            <div>
              <h2>Example questions</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {EXAMPLE_QUESTIONS.map((q, i) => (
                  <button
                    key={q + ':' + i}
                    onClick={() => handleExampleClick(q)}
                    style={{
                      textAlign: 'left',
                      padding: '0.6rem 0.75rem',
                      background: '#f8f9fa',
                      border: '1px solid #a2a9b1',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      color: '#0645ad',
                      fontFamily: 'Georgia, serif',
                      lineHeight: 1.4,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#eaecf0' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#f8f9fa' }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </WikiLayout>
  )
}
