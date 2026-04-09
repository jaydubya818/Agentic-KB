'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import WikiLayout from '@/components/WikiLayout'

interface RepoRecord {
  repo_name: string
  github_url?: string
  description?: string
  status?: string
  last_sync_at?: string
  markdown_file_count?: number
}

function formatDate(isoString?: string): string {
  if (!isoString) return 'Never'
  try {
    const date = new Date(isoString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const mins = Math.floor(diff / 60000)
    const hrs = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 60) return `${mins}m ago`
    if (hrs < 24) return `${hrs}h ago`
    if (days < 30) return `${days}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: days > 365 ? 'numeric' : undefined })
  } catch {
    return isoString
  }
}

function StatusBadge({ status }: { status?: string }) {
  const colors = {
    active: '#22863a',
    pending: '#f9ca24',
    archived: '#999999',
  }
  const bgColor = colors[status as keyof typeof colors] || colors.pending
  return (
    <span style={{
      display: 'inline-block',
      background: bgColor,
      color: '#fff',
      padding: '0.2rem 0.5rem',
      borderRadius: '2px',
      fontSize: '0.7rem',
      fontWeight: 'bold',
      textTransform: 'uppercase',
    }}>
      {status || 'pending'}
    </span>
  )
}

function SyncButton({ repoName, onSuccess }: { repoName: string; onSuccess: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSync = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/repos/${repoName}/sync`, { method: 'POST' })
      if (!res.ok) throw new Error(`Sync failed: ${res.status}`)
      onSuccess()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sync failed'
      setError(msg)
      setTimeout(() => setError(null), 3000)
    } finally {
      setIsLoading(false)
    }
  }, [repoName, onSuccess])

  return (
    <>
      <button
        onClick={handleSync}
        disabled={isLoading}
        style={{
          padding: '0.3rem 0.8rem',
          border: '1px solid #0645ad',
          background: '#fff',
          color: '#0645ad',
          borderRadius: '2px',
          cursor: isLoading ? 'default' : 'pointer',
          fontSize: '0.8rem',
          fontFamily: '-apple-system, sans-serif',
        }}
      >
        {isLoading ? 'Syncing…' : 'Sync'}
      </button>
      {error && (
        <div style={{ color: '#c53030', fontSize: '0.7rem', marginTop: '0.2rem' }}>
          {error}
        </div>
      )}
    </>
  )
}

export default function ReposPage(): React.ReactElement {
  const [repos, setRepos] = useState<RepoRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadRepos = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/repos')
      if (!res.ok) throw new Error(`Failed to load repos: ${res.status}`)
      const data = await res.json() as RepoRecord[]
      setRepos(Array.isArray(data) ? data : [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load repos'
      setError(msg)
      setRepos([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadRepos()
  }, [loadRepos])

  const handleSyncSuccess = useCallback(() => {
    void loadRepos()
  }, [loadRepos])

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
            Tracked Repositories
          </h1>
          <div style={{
            fontSize: '0.75rem',
            color: '#54595d',
            padding: '0.4rem 0',
            fontFamily: '-apple-system, sans-serif',
          }}>
            Manage and monitor repositories tracked in the knowledge base
          </div>
        </div>

        <div style={{
          background: '#fff',
          border: '1px solid #a2a9b1',
          borderTop: 'none',
          padding: '1rem 1.25rem',
        }}>
          {isLoading && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#54595d', fontFamily: '-apple-system, sans-serif' }}>
              Loading repositories…
            </div>
          )}

          {error && (
            <div style={{
              background: '#fff5f5',
              border: '1px solid #fc8181',
              borderRadius: '3px',
              padding: '0.75rem',
              color: '#c53030',
              marginBottom: '1rem',
              fontFamily: '-apple-system, sans-serif',
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {!isLoading && repos.length === 0 && (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              color: '#54595d',
              fontFamily: '-apple-system, sans-serif',
              background: '#f8f9fa',
              borderRadius: '2px',
            }}>
              <p style={{ margin: '0.5rem 0' }}>No repositories tracked yet</p>
              <p style={{ fontSize: '0.85rem', margin: '0.5rem 0' }}>Start by adding a new repo to the registry</p>
            </div>
          )}

          {!isLoading && repos.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: '-apple-system, sans-serif',
                fontSize: '0.9rem',
              }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #a2a9b1' }}>
                    <th style={{ textAlign: 'left', padding: '0.5rem', fontWeight: 'bold', color: '#202122' }}>Repo</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem', fontWeight: 'bold', color: '#202122' }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem', fontWeight: 'bold', color: '#202122' }}>Docs</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem', fontWeight: 'bold', color: '#202122' }}>Last Synced</th>
                    <th style={{ textAlign: 'center', padding: '0.5rem', fontWeight: 'bold', color: '#202122' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {repos.map(repo => (
                    <tr key={repo.repo_name} style={{ borderBottom: '1px solid #eaecf0' }}>
                      <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'top' }}>
                        <Link
                          href={`/repos/${repo.repo_name}`}
                          style={{
                            color: '#0645ad',
                            textDecoration: 'none',
                            fontWeight: 500,
                          }}
                        >
                          {repo.repo_name}
                        </Link>
                        {repo.description && (
                          <div style={{ fontSize: '0.8rem', color: '#54595d', marginTop: '0.2rem' }}>
                            {repo.description}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'top' }}>
                        <StatusBadge status={repo.status} />
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'top', textAlign: 'center', color: '#54595d' }}>
                        {repo.markdown_file_count ?? 0}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'top', color: '#54595d', fontSize: '0.85rem' }}>
                        {formatDate(repo.last_sync_at)}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'top', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>
                          <Link
                            href={`/repos/${repo.repo_name}`}
                            style={{
                              padding: '0.3rem 0.8rem',
                              background: '#0645ad',
                              color: '#fff',
                              borderRadius: '2px',
                              fontSize: '0.8rem',
                              textDecoration: 'none',
                              fontFamily: '-apple-system, sans-serif',
                              cursor: 'pointer',
                            }}
                          >
                            View
                          </Link>
                          <SyncButton repoName={repo.repo_name} onSuccess={handleSyncSuccess} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </WikiLayout>
  )
}
