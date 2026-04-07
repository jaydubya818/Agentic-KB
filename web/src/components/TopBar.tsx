'use client'

import React from 'react'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePrivateMode, type SearchScope } from '@/lib/private-mode-context'

interface TopBarProps {
  onOpenQuery: () => void
}

interface SearchResult {
  meta: {
    slug: string
    title: string
    type: string
    tags: string[]
    visibility: 'public' | 'private'
    vault: boolean
  }
  snippet: string
  score: number
}

interface Vault {
  id: string
  name: string
  path: string
  fileCount?: number
}

export default function TopBar({ onOpenQuery }: TopBarProps): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [scopeTarget, setScopeTarget] = useState<SearchScope>('public')
  const [vaults, setVaults] = useState<Vault[]>([])
  const [showVaultDropdown, setShowVaultDropdown] = useState(false)
  const [currentVault, setCurrentVault] = useState('Agentic-KB')
  const [currentVaultPath, setCurrentVaultPath] = useState('/Users/jaywest/Agentic-KB')
  const [switchingVault, setSwitchingVault] = useState(false)
  const vaultRef = useRef<HTMLDivElement>(null)
  const isAgenticKB = currentVaultPath === '/Users/jaywest/Agentic-KB'
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  const { isPrivate, pin, scope, setScope, unlock, lock } = usePrivateMode()

  // Fetch vault list and current active vault
  useEffect(() => {
    const fetchVaults = async (): Promise<void> => {
      try {
        const [vaultsRes, activeRes] = await Promise.all([
          fetch('/api/vaults'),
          fetch('/api/switch-vault'),
        ])
        const vaultsData = await vaultsRes.json() as { vaults: Vault[] }
        const activeData = await activeRes.json() as { name: string; path: string }
        setVaults(vaultsData.vaults || [])
        setCurrentVault(activeData.name || 'Agentic-KB')
        setCurrentVaultPath(activeData.path || '/Users/jaywest/Agentic-KB')
      } catch { /* ignore */ }
    }
    void fetchVaults()
  }, [])

  // Close vault dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent): void => {
      if (vaultRef.current && !vaultRef.current.contains(e.target as Node)) {
        setShowVaultDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Poll pending count
  useEffect(() => {
    const fetchCount = async (): Promise<void> => {
      try {
        const res = await fetch('/api/pending-count')
        const data = await res.json() as { count: number }
        setPendingCount(data.count || 0)
      } catch { /* ignore */ }
    }
    void fetchCount()
    const interval = setInterval(() => { void fetchCount() }, 30000)
    return () => clearInterval(interval)
  }, [])

  const performSearch = useCallback(async (q: string, searchScope: SearchScope): Promise<void> => {
    if (!q.trim() || q.length < 2) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    setIsSearching(true)
    try {
      const params = new URLSearchParams({ q, limit: '8', scope: searchScope })
      if (searchScope !== 'public' && pin) params.set('pin', pin)
      const res = await fetch(`/api/search?${params.toString()}`)
      const data = await res.json() as { results: SearchResult[] }
      setSearchResults(data.results || [])
      setShowDropdown(true)
    } catch {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [pin])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const q = e.target.value
    setSearchQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { void performSearch(q, scope) }, 300)
  }, [performSearch, scope])

  const handleSearchSubmit = useCallback((e: React.FormEvent): void => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowDropdown(false)
      const params = new URLSearchParams({ q: searchQuery.trim(), scope })
      if (scope !== 'public' && pin) params.set('pin', pin)
      router.push(`/search?${params.toString()}`)
    }
  }, [searchQuery, router, scope, pin])

  const handleResultClick = useCallback((slug: string): void => {
    setShowDropdown(false)
    setSearchQuery('')
    router.push(`/wiki/${slug}`)
  }, [router])

  // Cycle through scope: public → all → private → public
  const handleScopeToggle = useCallback((): void => {
    if (!isPrivate) {
      // Need to unlock first
      setScopeTarget(scope === 'public' ? 'all' : 'private')
      setPinInput('')
      setPinError('')
      setShowPinModal(true)
      return
    }
    const next: SearchScope = scope === 'public' ? 'all' : scope === 'all' ? 'private' : 'public'
    setScope(next)
    if (searchQuery.trim()) void performSearch(searchQuery, next)
  }, [isPrivate, scope, setScope, searchQuery, performSearch])

  const handlePinSubmit = useCallback(async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setPinError('')
    const ok = await unlock(pinInput)
    if (ok) {
      setShowPinModal(false)
      setScope(scopeTarget)
      if (searchQuery.trim()) void performSearch(searchQuery, scopeTarget)
    } else {
      setPinError('Incorrect PIN')
    }
  }, [pinInput, unlock, scopeTarget, setScope, searchQuery, performSearch])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent): void => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const scopeLabel: Record<SearchScope, string> = {
    public: '🌐',
    private: '🔒',
    all: '🔓',
  }

  const scopeTitle: Record<SearchScope, string> = {
    public: 'Public Wiki',
    private: 'Private Wiki only',
    all: 'Public + Private',
  }

  return (
    <>
      <header className="topbar px-4 py-2 flex items-center gap-4" style={{ height: '52px' }}>
        {/* Site name */}
        <Link
          href="/wiki"
          className="flex items-center gap-2 shrink-0"
          style={{ textDecoration: 'none' }}
        >
          <span style={{
            fontFamily: 'Georgia, serif',
            fontSize: '1.1rem',
            fontWeight: 'normal',
            color: '#202122',
            whiteSpace: 'nowrap',
          }}>
            {isAgenticKB ? 'Agentic Engineering KB' : currentVault}
          </span>
        </Link>

        {/* Divider */}
        <span style={{ color: '#a2a9b1', fontSize: '1.2rem' }}>|</span>

        {/* Search */}
        <div ref={searchRef} className="relative flex-1 max-w-md">
          <form onSubmit={handleSearchSubmit} className="flex">
            {/* Scope toggle button */}
            <button
              type="button"
              onClick={handleScopeToggle}
              title={scopeTitle[scope]}
              style={{
                padding: '0.3rem 0.5rem',
                background: scope !== 'public' ? '#f5f3ff' : '#f8f9fa',
                border: '1px solid #a2a9b1',
                borderRight: 'none',
                borderRadius: '2px 0 0 2px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                color: scope !== 'public' ? '#7c3aed' : '#54595d',
                flexShrink: 0,
              }}
            >
              {scopeLabel[scope]}
            </button>
            <input
              type="search"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
              placeholder="Search the wiki..."
              style={{
                width: '100%',
                padding: '0.3rem 0.6rem',
                border: '1px solid #a2a9b1',
                borderRadius: 0,
                fontSize: '0.875rem',
                outline: 'none',
                backgroundColor: '#fff',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '0.3rem 0.75rem',
                background: '#eaecf0',
                border: '1px solid #a2a9b1',
                borderLeft: 'none',
                borderRadius: '0 2px 2px 0',
                fontSize: '0.875rem',
                cursor: 'pointer',
                color: '#202122',
              }}
            >
              {isSearching ? '...' : 'Go'}
            </button>
          </form>

          {/* Search dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#fff',
              border: '1px solid #a2a9b1',
              borderTop: 'none',
              zIndex: 300,
              maxHeight: '400px',
              overflowY: 'auto',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            }}>
              {searchResults.map((result) => (
                <button
                  key={result.meta.slug}
                  onClick={() => handleResultClick(result.meta.slug)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.5rem 0.75rem',
                    borderBottom: '1px solid #eaecf0',
                    background: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8f9fa')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#0645ad', fontWeight: 500 }}>
                      {result.meta.title}
                    </span>
                    {result.meta.vault && (
                      <span style={{ fontSize: '0.65rem', background: '#d4af37', color: '#fff', padding: '0 0.3rem', borderRadius: '2px' }}>
                        VAULT
                      </span>
                    )}
                    {result.meta.visibility === 'private' && (
                      <span style={{ fontSize: '0.65rem', background: '#7c3aed', color: '#fff', padding: '0 0.3rem', borderRadius: '2px' }}>
                        PRIVATE
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#54595d', marginTop: '0.15rem' }}>
                    <span style={{
                      background: '#eaecf0',
                      padding: '0 0.3rem',
                      borderRadius: '2px',
                      marginRight: '0.5rem',
                    }}>
                      {result.meta.type}
                    </span>
                    {result.snippet.slice(0, 80)}...
                  </div>
                </button>
              ))}
              <button
                onClick={() => {
                  setShowDropdown(false)
                  const params = new URLSearchParams({ q: searchQuery, scope })
                  if (scope !== 'public' && pin) params.set('pin', pin)
                  router.push(`/search?${params.toString()}`)
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'center',
                  padding: '0.4rem',
                  background: '#f8f9fa',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  color: '#0645ad',
                }}
              >
                See all results for &ldquo;{searchQuery}&rdquo;
              </button>
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex items-center gap-3 shrink-0">
          <Link
            href="/wiki"
            style={{ color: '#0645ad', fontSize: '0.875rem', textDecoration: 'none' }}
          >
            Wiki
          </Link>
          {/* Vault switcher */}
          <div ref={vaultRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowVaultDropdown(v => !v)}
              title="Switch Obsidian vault"
              style={{
                color: '#7c3aed',
                fontSize: '0.8rem',
                padding: '0.25rem 0.6rem',
                border: '1px solid #7c3aed',
                borderRadius: '2px',
                background: '#f5f3ff',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                cursor: 'pointer',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#7c3aed">
                <path d="M12.003 0C9.53 0 7.332.968 5.617 2.555c-.36.33-.697.685-1.007 1.061C2.985 5.5 2 7.652 2 10.003c0 2.456 1.07 4.668 2.772 6.22l6.716 7.444a.7.7 0 001.037 0l6.716-7.444C20.931 14.67 22 12.459 22 10.003 22 4.48 17.525 0 12.003 0z"/>
              </svg>
              {switchingVault ? 'Switching…' : currentVault}
              <span style={{ fontSize: '0.6rem', marginLeft: '0.1rem' }}>▾</span>
            </button>
            {showVaultDropdown && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                right: 0,
                background: '#fff',
                border: '1px solid #a2a9b1',
                borderRadius: '2px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                zIndex: 400,
                minWidth: '180px',
                overflow: 'hidden',
              }}>
                <div style={{
                  fontSize: '0.7rem',
                  color: '#54595d',
                  padding: '0.4rem 0.75rem',
                  borderBottom: '1px solid #eaecf0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Open vault in Obsidian
                </div>
                {vaults.length === 0 ? (
                  <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#54595d' }}>
                    Loading vaults...
                  </div>
                ) : (
                  vaults.map(v => (
                    <button
                      key={v.id}
                      disabled={switchingVault || v.name === currentVault}
                      onClick={async () => {
                        if (v.name === currentVault) return
                        setSwitchingVault(true)
                        setShowVaultDropdown(false)
                        try {
                          await fetch('/api/switch-vault', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ vaultPath: v.path }),
                          })
                          setCurrentVault(v.name)
                          setCurrentVaultPath(v.path)
                          window.dispatchEvent(new Event('vault-switched'))
                          window.location.href = '/wiki'
                        } catch { setSwitchingVault(false) }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '0.45rem 0.75rem',
                        fontSize: '0.85rem',
                        color: v.name === currentVault ? '#7c3aed' : '#202122',
                        background: v.name === currentVault ? '#f5f3ff' : 'none',
                        border: 'none',
                        borderBottom: '1px solid #f0f0f0',
                        textAlign: 'left',
                        cursor: v.name === currentVault ? 'default' : 'pointer',
                        gap: '0.5rem',
                      }}
                      onMouseEnter={e => { if (v.name !== currentVault) e.currentTarget.style.background = '#f8f9fa' }}
                      onMouseLeave={e => { if (v.name !== currentVault) e.currentTarget.style.background = v.name === currentVault ? '#f5f3ff' : 'none' }}
                    >
                      <span>{v.name}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {v.fileCount !== undefined && (
                          <span style={{ fontSize: '0.7rem', color: '#888', background: '#eaecf0', padding: '0 0.3rem', borderRadius: '2px' }}>
                            {v.fileCount}
                          </span>
                        )}
                        {v.name === currentVault && (
                          <span style={{ fontSize: '0.7rem', color: '#7c3aed' }}>✓</span>
                        )}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          {isAgenticKB && (
            <Link
              href="/process"
              style={{ color: '#0645ad', fontSize: '0.875rem', textDecoration: 'none', position: 'relative', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              Process
              {pendingCount > 0 && (
                <span style={{ background: '#c00', color: '#fff', fontSize: '0.65rem', fontWeight: 'bold', padding: '0.05rem 0.35rem', borderRadius: '999px', lineHeight: 1.4 }}>
                  {pendingCount}
                </span>
              )}
            </Link>
          )}
          {isAgenticKB && (
            <Link
              href="/ingest"
              style={{ color: '#202122', fontSize: '0.8rem', textDecoration: 'none', padding: '0.25rem 0.6rem', border: '1px solid #a2a9b1', borderRadius: '2px', background: '#f8f9fa' }}
            >
              + Add Material
            </Link>
          )}
          {/* Private mode toggle */}
          <button
            onClick={isPrivate ? lock : () => { setPinInput(''); setPinError(''); setScopeTarget('all'); setShowPinModal(true) }}
            title={isPrivate ? 'Private mode active — click to lock' : 'Unlock private wiki'}
            style={{
              padding: '0.25rem 0.5rem',
              border: `1px solid ${isPrivate ? '#7c3aed' : '#a2a9b1'}`,
              borderRadius: '2px',
              background: isPrivate ? '#f5f3ff' : '#f8f9fa',
              cursor: 'pointer',
              fontSize: '0.85rem',
              color: isPrivate ? '#7c3aed' : '#54595d',
            }}
          >
            {isPrivate ? '🔓' : '🔒'}
          </button>
          <button
            onClick={onOpenQuery}
            style={{
              color: '#fff',
              fontSize: '0.8rem',
              padding: '0.25rem 0.75rem',
              border: 'none',
              borderRadius: '2px',
              background: '#0645ad',
              cursor: 'pointer',
            }}
          >
            Ask AI
          </button>
        </nav>
      </header>

      {/* PIN modal */}
      {showPinModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            border: '1px solid #a2a9b1',
            padding: '1.5rem',
            width: '320px',
            fontFamily: '-apple-system, sans-serif',
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: '#202122' }}>
              🔒 Unlock Private Wiki
            </div>
            <div style={{ fontSize: '0.85rem', color: '#54595d', marginBottom: '1rem' }}>
              Enter your PIN to access private articles and vault content.
            </div>
            <form onSubmit={(e) => { void handlePinSubmit(e) }}>
              <input
                type="password"
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                placeholder="Enter PIN"
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: `1px solid ${pinError ? '#c00' : '#a2a9b1'}`,
                  borderRadius: '2px',
                  fontSize: '0.9rem',
                  marginBottom: '0.5rem',
                  boxSizing: 'border-box',
                }}
              />
              {pinError && (
                <div style={{ color: '#c00', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                  {pinError}
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  style={{
                    padding: '0.4rem 1rem',
                    border: '1px solid #a2a9b1',
                    borderRadius: '2px',
                    background: '#f8f9fa',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.4rem 1rem',
                    border: 'none',
                    borderRadius: '2px',
                    background: '#7c3aed',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
