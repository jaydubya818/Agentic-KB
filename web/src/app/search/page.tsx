import React from 'react'
import { searchArticles } from '@/lib/articles'
import WikiLayout from '@/components/WikiLayout'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps): Promise<React.ReactElement> {
  const { q = '' } = await searchParams
  const results = q ? searchArticles(q, 30) : []

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
            Search Results
          </h1>
          <div style={{
            fontSize: '0.75rem',
            color: '#54595d',
            padding: '0.4rem 0',
            fontFamily: '-apple-system, sans-serif',
          }}>
            Full-text search across all wiki articles
          </div>
        </div>

        <div className="article-body">
          {/* Search form */}
          <form action="/search" method="get" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Search the wiki..."
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #a2a9b1',
                  borderRadius: '2px',
                  fontSize: '1rem',
                  fontFamily: 'Georgia, serif',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '0.5rem 1.5rem',
                  background: '#0645ad',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontFamily: '-apple-system, sans-serif',
                }}
              >
                Search
              </button>
            </div>
          </form>

          {q && (
            <div style={{
              fontSize: '0.875rem',
              color: '#54595d',
              marginBottom: '1rem',
              fontFamily: '-apple-system, sans-serif',
            }}>
              {results.length === 0
                ? `No results found for "${q}"`
                : `${results.length} result${results.length === 1 ? '' : 's'} for "${q}"`
              }
            </div>
          )}

          {/* Results */}
          {results.map((result, i) => (
            <div
              key={result.meta.slug}
              style={{
                paddingBottom: '1.25rem',
                marginBottom: '1.25rem',
                borderBottom: i < results.length - 1 ? '1px solid #eaecf0' : 'none',
              }}
            >
              <div style={{ marginBottom: '0.25rem' }}>
                <Link
                  href={`/wiki/${result.meta.slug}`}
                  style={{
                    fontSize: '1.1rem',
                    color: '#0645ad',
                    textDecoration: 'none',
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  {result.meta.title}
                </Link>
                <span style={{
                  marginLeft: '0.5rem',
                  background: '#eaecf0',
                  border: '1px solid #a2a9b1',
                  borderRadius: '2px',
                  padding: '0.05rem 0.4rem',
                  fontSize: '0.7rem',
                  color: '#54595d',
                  fontFamily: '-apple-system, sans-serif',
                  verticalAlign: 'middle',
                }}>
                  {result.meta.type}
                </span>
              </div>

              <div style={{
                fontSize: '0.75rem',
                color: '#54595d',
                fontFamily: '-apple-system, sans-serif',
                marginBottom: '0.3rem',
              }}>
                <code style={{ fontSize: '0.7rem' }}>/wiki/{result.meta.slug}</code>
                {result.meta.tags.length > 0 && (
                  <span style={{ marginLeft: '0.75rem' }}>
                    {result.meta.tags.map(tag => (
                      <span key={tag} className="tag-badge">{tag}</span>
                    ))}
                  </span>
                )}
              </div>

              <div style={{
                fontSize: '0.875rem',
                color: '#202122',
                fontFamily: 'Georgia, serif',
                lineHeight: 1.5,
              }}>
                ...{result.snippet}...
              </div>
            </div>
          ))}

          {!q && (
            <div style={{ color: '#54595d', textAlign: 'center', padding: '2rem 0' }}>
              Enter a search term above to search across all wiki articles.
            </div>
          )}
        </div>
      </div>
    </WikiLayout>
  )
}
