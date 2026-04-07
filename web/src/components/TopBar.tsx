'use client'

import React from 'react'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface TopBarProps {
  onOpenQuery: () => void
}

interface SearchResult {
  meta: {
    slug: string
    title: string
    type: string
    tags: string[]
  }
  snippet: string
  score: number
}

export default function TopBar({ onOpenQuery }: TopBarProps): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  const performSearch = useCallback(async (q: string): Promise<void> => {
    if (!q.trim() || q.length < 2) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    setIsSearching(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=8`)
      const data = await res.json() as { results: SearchResult[] }
      setSearchResults(data.results || [])
      setShowDropdown(true)
    } catch {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const q = e.target.value
    setSearchQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { void performSearch(q) }, 300)
  }, [performSearch])

  const handleSearchSubmit = useCallback((e: React.FormEvent): void => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowDropdown(false)
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }, [searchQuery, router])

  const handleResultClick = useCallback((slug: string): void => {
    setShowDropdown(false)
    setSearchQuery('')
    router.push(`/wiki/${slug}`)
  }, [router])

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

  return (
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
          Agentic Engineering KB
        </span>
      </Link>

      {/* Divider */}
      <span style={{ color: '#a2a9b1', fontSize: '1.2rem' }}>|</span>

      {/* Search */}
      <div ref={searchRef} className="relative flex-1 max-w-md">
        <form onSubmit={handleSearchSubmit} className="flex">
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
              borderRadius: '2px 0 0 2px',
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
                <div style={{ fontSize: '0.875rem', color: '#0645ad', fontWeight: 500 }}>
                  {result.meta.title}
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
              onClick={() => { setShowDropdown(false); router.push(`/search?q=${encodeURIComponent(searchQuery)}`) }}
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
        <Link
          href="/ingest"
          style={{
            color: '#202122',
            fontSize: '0.8rem',
            textDecoration: 'none',
            padding: '0.25rem 0.6rem',
            border: '1px solid #a2a9b1',
            borderRadius: '2px',
            background: '#f8f9fa',
          }}
        >
          + Add Material
        </Link>
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
  )
}
