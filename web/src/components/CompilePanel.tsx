'use client'
/**
 * CompilePanel — UI for LLM auto-compilation and wiki lint
 * Shows a "Compile KB" and "Lint Wiki" button on the index page.
 * Streams compile progress via SSE.
 */
import React, { useState, useRef } from 'react'

interface LogLine {
  type: string
  message?: string
  file?: string
  path?: string
  op?: string
  docsCompiled?: number
  pagesCreated?: number
  pagesUpdated?: number
}

export default function CompilePanel(): React.ReactElement {
  const [compiling, setCompiling] = useState(false)
  const [linting, setLinting] = useState(false)
  const [log, setLog] = useState<LogLine[]>([])
  const [done, setDone] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  function addLog(line: LogLine) {
    setLog(prev => [...prev.slice(-40), line])
  }

  async function runCompile(mode: 'incremental' | 'full') {
    setCompiling(true)
    setLog([])
    setDone(null)
    setError(null)
    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
        signal: abortRef.current.signal,
      })
      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')
      const decoder = new TextDecoder()
      let buf = ''
      while (true) {
        const { done: streamDone, value } = await reader.read()
        if (streamDone) break
        buf += decoder.decode(value, { stream: true })
        const parts = buf.split('\n\n')
        buf = parts.pop() || ''
        for (const part of parts) {
          if (!part.startsWith('data: ')) continue
          try {
            const data = JSON.parse(part.slice(6)) as LogLine
            addLog(data)
            if (data.type === 'done') setDone(data.message || '✅ Done')
            if (data.type === 'error') setError(data.message || 'Error')
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (err: unknown) {
      if ((err as { name?: string })?.name !== 'AbortError') {
        setError(String(err))
      }
    } finally {
      setCompiling(false)
    }
  }

  async function runLint() {
    setLinting(true)
    setLog([])
    setDone(null)
    setError(null)
    try {
      const res = await fetch('/api/lint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json() as { ok?: boolean; summary?: string; reportPath?: string; error?: string }
      if (data.ok) {
        setDone(`${data.summary} → See wiki/${data.reportPath}`)
      } else {
        setError(data.error || 'Lint failed')
      }
    } catch (err) {
      setError(String(err))
    } finally {
      setLinting(false)
    }
  }

  const busy = compiling || linting

  return (
    <div style={{
      marginTop: '1.5rem',
      border: '1px solid #a2a9b1',
      borderRadius: '2px',
      background: '#f8f9fa',
      padding: '0.85rem 1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#202122', marginBottom: '0.6rem' }}>
        🤖 KB Automation
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => runCompile('incremental')}
          disabled={busy}
          style={btnStyle('#3366cc', busy)}
        >
          {compiling ? '⏳ Compiling…' : '⚙️ Compile New'}
        </button>
        <button
          onClick={() => runCompile('full')}
          disabled={busy}
          style={btnStyle('#6b4fbb', busy)}
        >
          🔄 Recompile All
        </button>
        <button
          onClick={runLint}
          disabled={busy}
          style={btnStyle('#2e7d32', busy)}
        >
          {linting ? '⏳ Linting…' : '🔍 Lint Wiki'}
        </button>
        {compiling && (
          <button
            onClick={() => abortRef.current?.abort()}
            style={btnStyle('#c0392b', false)}
          >
            ✕ Cancel
          </button>
        )}
      </div>

      {/* Log stream */}
      {log.length > 0 && (
        <div style={{
          marginTop: '0.75rem',
          background: '#1e1e2e',
          borderRadius: '3px',
          padding: '0.6rem 0.75rem',
          maxHeight: '180px',
          overflowY: 'auto',
          fontSize: '0.72rem',
          fontFamily: '"SF Mono", "Fira Code", monospace',
          color: '#cdd6f4',
          lineHeight: 1.6,
        }}>
          {log.map((line, i) => (
            <div key={i} style={{ color: lineColor(line.type) }}>
              {formatLine(line)}
            </div>
          ))}
        </div>
      )}

      {/* Result */}
      {done && (
        <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: '#2e7d32', fontWeight: 500 }}>
          {done}
        </div>
      )}
      {error && (
        <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: '#c0392b' }}>
          ❌ {error}
        </div>
      )}

      <div style={{ marginTop: '0.5rem', fontSize: '0.68rem', color: '#72777d' }}>
        <strong>Compile New</strong> processes uncompiled raw/ docs into wiki pages. &nbsp;
        <strong>Lint</strong> checks for contradictions, orphans &amp; gaps.
      </div>
    </div>
  )
}

function btnStyle(color: string, disabled: boolean): React.CSSProperties {
  return {
    background: disabled ? '#ccc' : color,
    color: '#fff',
    border: 'none',
    borderRadius: '3px',
    padding: '0.35rem 0.75rem',
    fontSize: '0.78rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 500,
    transition: 'background 0.15s',
  }
}

function lineColor(type: string): string {
  if (type === 'error') return '#f38ba8'
  if (type === 'done') return '#a6e3a1'
  if (type === 'page') return '#89dceb'
  if (type === 'compiling') return '#f9e2af'
  return '#cdd6f4'
}

function formatLine(line: LogLine): string {
  if (line.type === 'compiling') return `⚙️  Compiling ${line.file}`
  if (line.type === 'page') return `  ${line.op === 'create' ? '✨' : '✏️ '} ${line.path}`
  if (line.type === 'skip') return `  ⏭  Skipped ${line.file} (${line.message})`
  if (line.type === 'progress') return `ℹ️  ${line.message}`
  if (line.type === 'done') return `✅ ${line.message}`
  if (line.type === 'error') return `❌ ${line.message || line.file}`
  return line.message || JSON.stringify(line)
}
