'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'

interface PendingFile {
  path: string
  type: string
  title: string
  size: number
  addedAt: string
  alreadyIngested: boolean
}

interface LogLine {
  type: 'status' | 'wrote' | 'skipped' | 'done' | 'error'
  message?: string
  path?: string
  reason?: string
  summary?: string
  filesCreated?: string[]
  raw?: string
}

interface FileState {
  status: 'idle' | 'processing' | 'done' | 'error'
  log: LogLine[]
}

const TYPE_COLORS: Record<string, string> = {
  transcript: '#0645ad',
  note: '#006400',
  paper: '#8b0000',
  article: '#4a4a00',
  'video-notes': '#5b0087',
  'framework-doc': '#004d6e',
  conversation: '#7a4400',
  'code-example': '#2c2c2c',
}

export default function ProcessPage(): React.ReactElement {
  const [files, setFiles] = useState<PendingFile[]>([])
  const [loading, setLoading] = useState(true)
  const [fileStates, setFileStates] = useState<Record<string, FileState>>({})
  const [processingAll, setProcessingAll] = useState(false)
  const [lastRun, setLastRun] = useState<string | null>(null)
  const abortRef = useRef<boolean>(false)

  const fetchPending = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/process/pending')
      const data = await res.json() as { files: PendingFile[] }
      setFiles(data.files || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchPending() }, [fetchPending])

  const processFile = useCallback(async (filePath: string): Promise<boolean> => {
    setFileStates(prev => ({ ...prev, [filePath]: { status: 'processing', log: [] } }))

    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath }),
      })

      if (!res.body) throw new Error('No response body')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        const lines = text.split('\n').filter(l => l.startsWith('data: '))

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6)) as LogLine
            setFileStates(prev => {
              const current = prev[filePath] || { status: 'processing', log: [] }
              return {
                ...prev,
                [filePath]: {
                  status: data.type === 'done' ? 'done' : data.type === 'error' ? 'error' : 'processing',
                  log: [...current.log, data],
                },
              }
            })
            if (data.type === 'done') return true
            if (data.type === 'error') return false
          } catch { /* skip parse errors */ }
        }
      }
      return true
    } catch (err) {
      setFileStates(prev => ({
        ...prev,
        [filePath]: { status: 'error', log: [{ type: 'error', message: String(err) }] },
      }))
      return false
    }
  }, [])

  const processAll = useCallback(async () => {
    const pending = files.filter(f => !f.alreadyIngested)
    if (pending.length === 0) return
    setProcessingAll(true)
    abortRef.current = false

    for (const file of pending) {
      if (abortRef.current) break
      await processFile(file.path)
    }

    setProcessingAll(false)
    setLastRun(new Date().toLocaleTimeString())
    void fetchPending()
  }, [files, processFile, fetchPending])

  const pendingCount = files.filter(f => !f.alreadyIngested).length

  const pathToWikiHref = (filePath: string): string => {
    // wiki/summaries/foo.md -> /wiki/summaries/foo
    const withoutPrefix = filePath.replace(/^wiki\//, '')
    const withoutMd = withoutPrefix.replace(/\.md$/, '')
    return '/wiki/' + withoutMd
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', fontFamily: '-apple-system, sans-serif' }}>
      {/* Top bar */}
      <header style={{
        background: '#fff',
        borderBottom: '1px solid #a2a9b1',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <Link href="/wiki" style={{ color: '#0645ad', fontSize: '0.875rem' }}>← Wiki</Link>
        <span style={{ color: '#a2a9b1' }}>|</span>
        <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'normal', fontFamily: 'Georgia, serif', color: '#202122' }}>
          Process Raw Materials
        </h1>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {lastRun && (
            <span style={{ fontSize: '0.75rem', color: '#54595d' }}>Last run: {lastRun}</span>
          )}
          <button
            onClick={() => void fetchPending()}
            style={{ padding: '0.3rem 0.75rem', border: '1px solid #a2a9b1', borderRadius: '2px', background: '#f8f9fa', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Refresh
          </button>
          {pendingCount > 0 && (
            <button
              onClick={processingAll ? () => { abortRef.current = true } : () => void processAll()}
              style={{
                padding: '0.3rem 1rem',
                border: 'none',
                borderRadius: '2px',
                background: processingAll ? '#c00' : '#0645ad',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              {processingAll ? '⏹ Stop' : `⚡ Process All (${pendingCount})`}
            </button>
          )}
        </div>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem' }}>

        {/* Nightly cron info */}
        <div style={{
          background: '#fff',
          border: '1px solid #a2a9b1',
          borderLeft: '4px solid #0645ad',
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
          color: '#202122',
        }}>
          <strong>Nightly Auto-Ingest</strong> runs at 2:00 AM via launchd.{' '}
          <code style={{ background: '#f8f9fa', padding: '0 0.3rem', fontSize: '0.8rem' }}>
            ~/Library/LaunchAgents/com.jaywest.agentic-kb-ingest.plist
          </code>
          {' — '}
          <Link href="#cron-setup" style={{ color: '#0645ad' }}>setup instructions below</Link>
        </div>

        {/* Files list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#54595d' }}>Scanning raw/...</div>
        ) : files.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#54595d' }}>
            No raw files found. <Link href="/ingest" style={{ color: '#0645ad' }}>Add some →</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {files.map(file => {
              const state = fileStates[file.path]
              const status = state?.status || (file.alreadyIngested ? 'done' : 'idle')

              return (
                <div
                  key={file.path}
                  style={{
                    background: '#fff',
                    border: '1px solid #a2a9b1',
                    borderLeft: `4px solid ${status === 'done' ? '#006400' : status === 'error' ? '#c00' : status === 'processing' ? '#0645ad' : '#a2a9b1'}`,
                    padding: '0.75rem 1rem',
                  }}
                >
                  {/* File header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: state?.log.length ? '0.5rem' : 0 }}>
                    <span style={{
                      background: TYPE_COLORS[file.type] || '#54595d',
                      color: '#fff',
                      fontSize: '0.7rem',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '2px',
                      flexShrink: 0,
                    }}>
                      {file.type}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#202122', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#54595d', fontFamily: 'monospace' }}>
                        {file.path} · {(file.size / 1024).toFixed(1)}KB · {file.addedAt}
                      </div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      {status === 'idle' && (
                        <button
                          onClick={() => void processFile(file.path)}
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: '#0645ad',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '2px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                          }}
                        >
                          Ingest
                        </button>
                      )}
                      {status === 'processing' && (
                        <span style={{ fontSize: '0.8rem', color: '#0645ad' }}>⟳ Processing...</span>
                      )}
                      {status === 'done' && !state && (
                        <span style={{ fontSize: '0.8rem', color: '#006400' }}>✓ Already ingested</span>
                      )}
                      {status === 'done' && state && (
                        <span style={{ fontSize: '0.8rem', color: '#006400' }}>✓ Done</span>
                      )}
                      {status === 'error' && (
                        <span style={{ fontSize: '0.8rem', color: '#c00' }}>✗ Error</span>
                      )}
                    </div>
                  </div>

                  {/* Progress log */}
                  {state?.log && state.log.length > 0 && (
                    <div style={{
                      background: '#f8f9fa',
                      border: '1px solid #eaecf0',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.8rem',
                      fontFamily: 'monospace',
                      maxHeight: '200px',
                      overflowY: 'auto',
                    }}>
                      {state.log.map((line, i) => (
                        <div key={i} style={{ marginBottom: '0.2rem', color: line.type === 'error' ? '#c00' : line.type === 'wrote' ? '#006400' : line.type === 'done' ? '#004d00' : '#202122' }}>
                          {line.type === 'wrote' && (
                          <span>✓ Created:{' '}
                            <Link href={pathToWikiHref(line.path!)} style={{ color: '#0645ad', textDecoration: 'underline' }}>{line.path}</Link>
                          </span>
                        )}
                          {line.type === 'skipped' && `⊘ Skipped: ${line.path} (${line.reason})`}
                          {line.type === 'status' && `  ${line.message}`}
                          {line.type === 'error' && `✗ Error: ${line.message}`}
                          {line.type === 'done' && (
                            <div>
                              <div style={{ fontWeight: 'bold', color: '#006400' }}>✓ Complete</div>
                              {line.summary && <div style={{ color: '#202122', fontFamily: 'sans-serif', marginTop: '0.25rem' }}>{line.summary}</div>}
                              {line.filesCreated && line.filesCreated.length > 0 && (
                                <div style={{ marginTop: '0.25rem' }}>
                                  {'Files created: '}
                                  {line.filesCreated.map((fp, fi) => (
                                    <span key={fi}>
                                      {fi > 0 && ', '}
                                      <Link href={pathToWikiHref(fp)} style={{ color: '#0645ad', textDecoration: 'underline' }}>{fp}</Link>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Nightly cron setup */}
        <div id="cron-setup" style={{ marginTop: '2rem', background: '#fff', border: '1px solid #a2a9b1', padding: '1rem' }}>
          <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: '#202122', borderBottom: '1px solid #eaecf0', paddingBottom: '0.5rem' }}>
            Nightly Auto-Ingest Setup
          </h2>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', color: '#54595d' }}>
            Run this once to set up automatic 2 AM processing of new raw materials:
          </p>
          <pre style={{
            background: '#f8f9fa',
            border: '1px solid #eaecf0',
            padding: '0.75rem',
            fontSize: '0.8rem',
            overflowX: 'auto',
            margin: '0 0 0.75rem',
          }}>
{`# Install nightly ingest (runs at 2:00 AM)
curl -s http://localhost:3002/api/process/schedule/install | bash

# Check status
launchctl list | grep agentic-kb

# Uninstall
launchctl unload ~/Library/LaunchAgents/com.jaywest.agentic-kb-ingest.plist`}
          </pre>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#54595d' }}>
            Or trigger manually from terminal:{' '}
            <code style={{ background: '#f8f9fa', padding: '0.1rem 0.3rem' }}>
              curl -X POST http://localhost:3002/api/process/run-all
            </code>
          </p>
        </div>

      </div>
    </div>
  )
}
