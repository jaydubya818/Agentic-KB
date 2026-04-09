'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import WikiLayout from '@/components/WikiLayout'

interface DocItem {
  name: string
  size?: number
  path?: string
}

interface BusItem {
  id: string
  title?: string
  status?: string
  created_at?: string
}

interface RepoDetailData {
  repo_name: string
  status?: string
  last_sync_at?: string
  github_url?: string
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

function formatBytes(bytes?: number): string {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIdx = 0
  while (size >= 1024 && unitIdx < units.length - 1) {
    size /= 1024
    unitIdx++
  }
  return `${size.toFixed(1)} ${units[unitIdx]}`
}

function TabButton({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.5rem 1rem',
        border: 'none',
        borderBottom: isActive ? '2px solid #0645ad' : '1px solid #eaecf0',
        background: isActive ? '#f8f9fa' : 'transparent',
        color: isActive ? '#0645ad' : '#54595d',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontFamily: '-apple-system, sans-serif',
        fontWeight: isActive ? 'bold' : 'normal',
      }}
    >
      {label}
    </button>
  )
}

export default function RepoDetailPage(): React.ReactElement {
  const params = useParams()
  const repoName = Array.isArray(params.repo) ? params.repo[0] : params.repo || ''

  const [activeTab, setActiveTab] = useState<'overview' | 'docs' | 'bus' | 'progress' | 'search'>('overview')
  const [repoData, setRepoData] = useState<RepoDetailData | null>(null)
  const [homeContent, setHomeContent] = useState<string>('')
  const [canonicalDocs, setCanonicalDocs] = useState<DocItem[]>([])
  const [busItems, setBusItems] = useState<BusItem[]>([])
  const [progressContent, setProgressContent] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadRepoData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/repos/${repoName}`)
      if (!res.ok) throw new Error(`Failed to load repo: ${res.status}`)
      const data = await res.json() as RepoDetailData
      setRepoData(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load repo'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [repoName])

  const loadHomeContent = useCallback(async () => {
    try {
      const res = await fetch(`/api/repos/${repoName}/home`)
      if (res.ok) {
        const text = await res.text()
        setHomeContent(text)
      }
    } catch {
      // ignore
    }
  }, [repoName])

  const loadCanonicalDocs = useCallback(async () => {
    try {
      const res = await fetch(`/api/repos/${repoName}/docs?section=canonical`)
      if (res.ok) {
        const docs = await res.json() as DocItem[]
        setCanonicalDocs(Array.isArray(docs) ? docs : [])
      }
    } catch {
      setCanonicalDocs([])
    }
  }, [repoName])

  const loadBusItems = useCallback(async () => {
    try {
      const resD = await fetch(`/api/repos/${repoName}/bus/discovery`)
      const resE = await fetch(`/api/repos/${repoName}/bus/escalation`)
      const discovery = resD.ok ? await resD.json() as BusItem[] : []
      const escalation = resE.ok ? await resE.json() as BusItem[] : []
      setBusItems([...discovery, ...escalation].sort((a, b) =>
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      ))
    } catch {
      setBusItems([])
    }
  }, [repoName])

  const loadProgressContent = useCallback(async () => {
    try {
      const res = await fetch(`/api/repos/${repoName}/docs?section=progress`)
      if (res.ok) {
        const text = await res.text()
        setProgressContent(text)
      }
    } catch {
      // ignore
    }
  }, [repoName])

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    try {
      const res = await fetch(`/api/repos/${repoName}/search?q=${encodeURIComponent(searchQuery)}`)
      if (res.ok) {
        const results = await res.json() as any[]
        setSearchResults(Array.isArray(results) ? results : [])
      }
    } catch {
      setSearchResults([])
    }
  }, [repoName, searchQuery])

  useEffect(() => {
    void loadRepoData()
    void loadHomeContent()
    void loadCanonicalDocs()
    void loadBusItems()
    void loadProgressContent()
  }, [repoName, loadRepoData, loadHomeContent, loadCanonicalDocs, loadBusItems, loadProgressContent])

  if (isLoading) {
    return (
      <WikiLayout>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#54595d', fontFamily: '-apple-system, sans-serif' }}>
          Loading repository…
        </div>
      </WikiLayout>
    )
  }

  if (error || !repoData) {
    return (
      <WikiLayout>
        <div style={{
          background: '#fff5f5',
          border: '1px solid #fc8181',
          borderRadius: '3px',
          padding: '1rem',
          color: '#c53030',
          fontFamily: '-apple-system, sans-serif',
        }}>
          <strong>Error:</strong> {error || 'Repository not found'}
        </div>
      </WikiLayout>
    )
  }

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <div>
              <h1 style={{
                fontFamily: "'Linux Libertine', Georgia, serif",
                fontSize: '2rem',
                fontWeight: 'normal',
                margin: 0,
                paddingBottom: '0.5rem',
                borderBottom: '1px solid #a2a9b1',
                color: '#202122',
              }}>
                {repoName}
              </h1>
              <div style={{
                fontSize: '0.75rem',
                color: '#54595d',
                padding: '0.4rem 0',
                fontFamily: '-apple-system, sans-serif',
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}>
                <span>Status: <strong>{repoData.status || 'active'}</strong></span>
                <span>Last synced: <strong>{formatDate(repoData.last_sync_at)}</strong></span>
                {repoData.github_url && (
                  <a href={repoData.github_url} target="_blank" rel="noopener noreferrer" style={{ color: '#0645ad' }}>
                    GitHub →
                  </a>
                )}
              </div>
            </div>
            <Link href="/repos" style={{
              color: '#0645ad',
              textDecoration: 'none',
              fontSize: '0.85rem',
              padding: '0.3rem 0.6rem',
              border: '1px solid #0645ad',
              borderRadius: '2px',
            }}>
              ← Back to repos
            </Link>
          </div>
        </div>

        {/* Tab navigation */}
        <div style={{
          background: '#fff',
          border: '1px solid #a2a9b1',
          borderTop: 'none',
          borderBottom: 'none',
          display: 'flex',
          gap: '0rem',
          paddingBottom: '0rem',
        }}>
          <TabButton label="Overview" isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <TabButton label="Canonical Docs" isActive={activeTab === 'docs'} onClick={() => setActiveTab('docs')} />
          <TabButton label="Bus Items" isActive={activeTab === 'bus'} onClick={() => setActiveTab('bus')} />
          <TabButton label="Progress" isActive={activeTab === 'progress'} onClick={() => setActiveTab('progress')} />
          <TabButton label="Search" isActive={activeTab === 'search'} onClick={() => setActiveTab('search')} />
        </div>

        {/* Content area */}
        <div style={{
          background: '#fff',
          border: '1px solid #a2a9b1',
          borderTop: 'none',
          padding: '1rem 1.25rem',
          minHeight: '400px',
        }}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2>Overview</h2>
              {homeContent ? (
                <pre style={{
                  background: '#f8f9fa',
                  border: '1px solid #eaecf0',
                  borderRadius: '2px',
                  padding: '1rem',
                  overflow: 'auto',
                  fontSize: '0.85rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {homeContent}
                </pre>
              ) : (
                <p style={{ color: '#54595d', fontFamily: '-apple-system, sans-serif' }}>No overview available</p>
              )}
            </div>
          )}

          {/* Canonical Docs Tab */}
          {activeTab === 'docs' && (
            <div>
              <h2>Canonical Documentation</h2>
              {canonicalDocs.length > 0 ? (
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {canonicalDocs.map(doc => (
                    <div key={doc.path} style={{
                      padding: '0.75rem',
                      background: '#f8f9fa',
                      border: '1px solid #eaecf0',
                      borderRadius: '2px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontFamily: '-apple-system, sans-serif',
                    }}>
                      <div>
                        <div style={{ fontWeight: 500, color: '#0645ad' }}>
                          {doc.name}
                        </div>
                        {doc.size && (
                          <div style={{ fontSize: '0.75rem', color: '#54595d' }}>
                            {formatBytes(doc.size)}
                          </div>
                        )}
                      </div>
                      {doc.path && (
                        <Link href={doc.path} style={{
                          color: '#0645ad',
                          textDecoration: 'none',
                          fontSize: '0.8rem',
                          padding: '0.3rem 0.6rem',
                          border: '1px solid #0645ad',
                          borderRadius: '2px',
                        }}>
                          View
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#54595d', fontFamily: '-apple-system, sans-serif' }}>No canonical docs available</p>
              )}
            </div>
          )}

          {/* Bus Items Tab */}
          {activeTab === 'bus' && (
            <div>
              <h2>Bus Items (Discovery & Escalation)</h2>
              {busItems.length > 0 ? (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {busItems.map(item => (
                    <div key={item.id} style={{
                      padding: '0.75rem',
                      background: '#f8f9fa',
                      border: '1px solid #eaecf0',
                      borderRadius: '2px',
                      fontFamily: '-apple-system, sans-serif',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, color: '#0645ad' }}>
                            {item.title || item.id}
                          </div>
                          {item.created_at && (
                            <div style={{ fontSize: '0.75rem', color: '#54595d', marginTop: '0.2rem' }}>
                              {formatDate(item.created_at)}
                            </div>
                          )}
                        </div>
                        {item.status && (
                          <span style={{
                            display: 'inline-block',
                            background: item.status === 'open' ? '#e7f3ff' : '#f0f0f0',
                            color: item.status === 'open' ? '#0645ad' : '#54595d',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '2px',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                          }}>
                            {item.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#54595d', fontFamily: '-apple-system, sans-serif' }}>No bus items available</p>
              )}
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <div>
              <h2>Progress Log</h2>
              {progressContent ? (
                <pre style={{
                  background: '#f8f9fa',
                  border: '1px solid #eaecf0',
                  borderRadius: '2px',
                  padding: '1rem',
                  overflow: 'auto',
                  fontSize: '0.85rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {progressContent}
                </pre>
              ) : (
                <p style={{ color: '#54595d', fontFamily: '-apple-system, sans-serif' }}>No progress log available</p>
              )}
            </div>
          )}

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div>
              <h2>Search Repository</h2>
              <form onSubmit={handleSearch} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search docs, tasks, memories…"
                    style={{
                      flex: 1,
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #a2a9b1',
                      borderRadius: '2px',
                      fontSize: '0.9rem',
                      fontFamily: '-apple-system, sans-serif',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '0.5rem 1.5rem',
                      border: 'none',
                      background: '#0645ad',
                      color: '#fff',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontFamily: '-apple-system, sans-serif',
                    }}
                  >
                    Search
                  </button>
                </div>
              </form>

              {searchResults.length > 0 && (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {searchResults.map((result, idx) => (
                    <div key={idx} style={{
                      padding: '0.75rem',
                      background: '#f8f9fa',
                      border: '1px solid #eaecf0',
                      borderRadius: '2px',
                      fontFamily: '-apple-system, sans-serif',
                    }}>
                      <div style={{ fontWeight: 500, color: '#0645ad' }}>
                        {result.name || result.path || `Result ${idx + 1}`}
                      </div>
                      {result.snippet && (
                        <div style={{ fontSize: '0.85rem', color: '#54595d', marginTop: '0.3rem', fontStyle: 'italic' }}>
                          {result.snippet}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {searchQuery && searchResults.length === 0 && (
                <p style={{ color: '#54595d', fontFamily: '-apple-system, sans-serif' }}>No results found</p>
              )}

              {!searchQuery && (
                <p style={{ color: '#54595d', fontFamily: '-apple-system, sans-serif' }}>Enter a search query to find content</p>
              )}
            </div>
          )}
        </div>
      </div>
    </WikiLayout>
  )
}
