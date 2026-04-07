'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface QueryPanelProps {
  isOpen: boolean
  onClose: () => void
}

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
}

function pathToSlug(filePath: string): string {
  return filePath.replace(/^wiki\//, '').replace(/\.md$/, '')
}

function pathToLabel(filePath: string): string {
  const slug = pathToSlug(filePath)
  const parts = slug.split('/')
  const name = parts[parts.length - 1]
  return name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default function QueryPanel({ isOpen, onClose }: QueryPanelProps): React.ReactElement {
  const [question, setQuestion] = useState('')
  const [state, setState] = useState<QueryState>({
    thinking: [],
    reading: [],
    answer: '',
    sources: [],
    error: null,
    isStreaming: false,
  })
  const abortRef = useRef<AbortController | null>(null)
  const answerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus textarea when panel opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 300)
    }
  }, [isOpen])

  // Auto-scroll answer as it streams
  useEffect(() => {
    if (answerRef.current && state.answer) {
      answerRef.current.scrollTop = answerRef.current.scrollHeight
    }
  }, [state.answer])

  const handleSubmit = useCallback(async (e?: React.FormEvent): Promise<void> => {
    e?.preventDefault()
    if (!question.trim() || state.isStreaming) return

    // Cancel any ongoing request
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    setState({
      thinking: [],
      reading: [],
      answer: '',
      sources: [],
      error: null,
      isStreaming: true,
    })

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
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

  const handleStop = useCallback((): void => {
    if (abortRef.current) {
      abortRef.current.abort()
      setState(prev => ({ ...prev, isStreaming: false }))
    }
  }, [])

  const hasContent = state.thinking.length > 0 || state.reading.length > 0 || state.answer || state.error

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.2)',
            zIndex: 199,
          }}
        />
      )}

      {/* Panel */}
      <div className={`query-panel ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          borderBottom: '1px solid #a2a9b1',
          background: '#f8f9fa',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '0.95rem', fontFamily: 'Georgia, serif' }}>
              AI WikiQuery
            </div>
            <div style={{ fontSize: '0.7rem', color: '#54595d' }}>
              Reads wiki articles — no RAG, pure file navigation
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Link
              href="/query"
              onClick={onClose}
              style={{
                fontSize: '0.75rem',
                color: '#0645ad',
                textDecoration: 'none',
              }}
            >
              Full page →
            </Link>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: '1px solid #a2a9b1',
                borderRadius: '2px',
                padding: '0.2rem 0.5rem',
                cursor: 'pointer',
                fontSize: '0.8rem',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Input area */}
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e8e8e8', flexShrink: 0 }}>
          <form onSubmit={(e) => { void handleSubmit(e) }}>
            <textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about agentic engineering...&#10;&#10;Examples:&#10;• What's the best pattern for multi-agent orchestration?&#10;• How do I manage context across a long session?&#10;• Compare GSD vs LangGraph for a 5-step pipeline"
              rows={4}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #a2a9b1',
                borderRadius: '2px',
                fontSize: '0.85rem',
                fontFamily: '-apple-system, sans-serif',
                resize: 'none',
                outline: 'none',
                lineHeight: 1.5,
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#54595d' }}>
                ⌘+Enter to submit
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {state.isStreaming && (
                  <button
                    type="button"
                    onClick={handleStop}
                    style={{
                      padding: '0.3rem 0.75rem',
                      border: '1px solid #a2a9b1',
                      borderRadius: '2px',
                      background: '#f8f9fa',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                    }}
                  >
                    Stop
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!question.trim() || state.isStreaming}
                  style={{
                    padding: '0.3rem 1rem',
                    border: 'none',
                    borderRadius: '2px',
                    background: question.trim() && !state.isStreaming ? '#0645ad' : '#a2a9b1',
                    color: '#fff',
                    cursor: question.trim() && !state.isStreaming ? 'pointer' : 'default',
                    fontSize: '0.8rem',
                  }}
                >
                  {state.isStreaming ? 'Thinking...' : 'Ask'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Response area */}
        <div
          ref={answerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0.75rem 1rem',
          }}
        >
          {!hasContent && (
            <div style={{ color: '#54595d', fontSize: '0.8rem', textAlign: 'center', marginTop: '2rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📖</div>
              <div>Ask a question to search the knowledge base</div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem' }}>
                The AI will read the wiki index, identify relevant articles, read them, and synthesize an answer.
              </div>
            </div>
          )}

          {/* Thinking steps */}
          {state.thinking.map((thought, i) => (
            <div key={i} className="thinking-step">
              {state.isStreaming && i === state.thinking.length - 1 ? '⟳ ' : '✓ '}
              {thought}
            </div>
          ))}

          {/* Reading files */}
          {state.reading.map((filePath, i) => (
            <div key={i} className="reading-step">
              📄 {filePath}
            </div>
          ))}

          {/* Error */}
          {state.error && (
            <div style={{
              background: '#fff5f5',
              border: '1px solid #fc8181',
              borderRadius: '3px',
              padding: '0.75rem',
              marginTop: '0.5rem',
              fontSize: '0.85rem',
              color: '#c53030',
            }}>
              {state.error}
            </div>
          )}

          {/* Answer */}
          {state.answer && (
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{
                fontSize: '0.7rem',
                color: '#54595d',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Answer
              </div>
              <div style={{
                fontSize: '0.875rem',
                lineHeight: 1.7,
                fontFamily: 'Georgia, serif',
              }}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a({ href, children }) {
                      if (href?.startsWith('/')) {
                        return <a href={href} style={{ color: '#0645ad' }}>{children}</a>
                      }
                      return <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#0645ad' }}>{children}</a>
                    },
                    code({ className, children }) {
                      const isInline = !className
                      if (isInline) {
                        return <code style={{ background: '#f8f8f8', padding: '0.1em 0.3em', border: '1px solid #e0e0e0', borderRadius: '2px', fontSize: '0.85em' }}>{children}</code>
                      }
                      return <pre style={{ background: '#f8f8f8', border: '1px solid #e0e0e0', borderRadius: '3px', padding: '0.75rem', overflowX: 'auto', fontSize: '0.8rem' }}><code>{children}</code></pre>
                    },
                    p({ children }) {
                      return <p style={{ marginBottom: '0.6rem' }}>{children}</p>
                    },
                  }}
                >
                  {state.answer}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Sources */}
          {state.sources.length > 0 && (
            <div style={{
              marginTop: '1rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid #e8e8e8',
            }}>
              <div style={{
                fontSize: '0.7rem',
                color: '#54595d',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.4rem',
              }}>
                Sources Read ({state.sources.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {state.sources.map((src, i) => (
                  <Link
                    key={i}
                    href={`/wiki/${pathToSlug(src)}`}
                    onClick={onClose}
                    style={{
                      display: 'inline-block',
                      background: '#eaecf0',
                      border: '1px solid #a2a9b1',
                      borderRadius: '2px',
                      padding: '0.15rem 0.5rem',
                      fontSize: '0.75rem',
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
      </div>
    </>
  )
}
