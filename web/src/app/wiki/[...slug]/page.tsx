import React from 'react'
import { notFound } from 'next/navigation'
import { findArticleBySlug, getBacklinks, type ArticleMeta } from '@/lib/articles'
import WikiLayout from '@/components/WikiLayout'
import ArticleRenderer from '@/components/ArticleRenderer'
import TableOfContents from '@/components/TableOfContents'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface ArticlePageProps {
  params: Promise<{ slug: string[] }>
}

function InfoBox({ meta }: { meta: ArticleMeta | undefined }): React.ReactElement | null {
  if (!meta) return null

  const rows: Array<[string, string]> = []

  const str = (v: unknown): string =>
    v instanceof Date ? v.toISOString().slice(0, 10) : String(v)

  if (meta.type) rows.push(['Type', str(meta.type)])
  if (meta.confidence) rows.push(['Confidence', str(meta.confidence)])
  if (meta.vendor) rows.push(['Vendor', str(meta.vendor)])
  if (meta.version) rows.push(['Version', str(meta.version)])
  if (meta.jay_experience) rows.push(['Jay\'s Experience', str(meta.jay_experience)])
  if (meta.difficulty) rows.push(['Difficulty', str(meta.difficulty)])
  if (meta.time_estimate) rows.push(['Time', str(meta.time_estimate)])
  if (meta.created) rows.push(['Created', str(meta.created)])
  if (meta.updated) rows.push(['Updated', str(meta.updated)])

  if (rows.length === 0 && (!meta.tags || meta.tags.length === 0)) return null

  return (
    <div className="infobox">
      <table>
        <thead>
          <tr>
            <th colSpan={2} style={{ textAlign: 'center' }}>
              {meta.title}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <td className="label">{label}</td>
              <td>
                {label === 'Confidence' ? (
                  <span className={`confidence-${value}`}>{value}</span>
                ) : (
                  value
                )}
              </td>
            </tr>
          ))}
          {meta.tags && meta.tags.length > 0 && (
            <tr>
              <td className="label">Tags</td>
              <td>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.15rem' }}>
                  {meta.tags.map((tag: string) => (
                    <span key={tag} className="tag-badge">{tag}</span>
                  ))}
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default async function ArticlePage({ params }: ArticlePageProps): Promise<React.ReactElement> {
  const { slug: slugParts } = await params
  const slug = slugParts.join('/')

  const article = findArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  const backlinks = getBacklinks(article.meta.slug)

  return (
    <WikiLayout
      toc={<TableOfContents content={article.content} />}
    >
      <article>
        {/* Page header tabs (Wikipedia style) */}
        <div style={{
          display: 'flex',
          gap: 0,
          marginBottom: '-1px',
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{
            padding: '0.3rem 1rem',
            background: '#fff',
            border: '1px solid #a2a9b1',
            borderBottom: '1px solid #fff',
            fontSize: '0.8rem',
            fontFamily: '-apple-system, sans-serif',
            color: '#202122',
            marginRight: '-1px',
          }}>
            Article
          </div>
        </div>

        {/* Article header */}
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
            {article.meta.title}
          </h1>
          <div style={{
            fontSize: '0.75rem',
            color: '#54595d',
            padding: '0.4rem 0',
            fontFamily: '-apple-system, sans-serif',
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
          }}>
            <span>
              <Link href="/wiki" style={{ color: '#0645ad' }}>Agentic KB</Link>
              {' → '}
              <span style={{ textTransform: 'capitalize' }}>{article.meta.type}</span>
            </span>
            {article.meta.created && <span>Created: {article.meta.created instanceof Date ? article.meta.created.toISOString().slice(0, 10) : String(article.meta.created)}</span>}
          </div>
        </div>

        {/* Article body with infobox */}
        <div className="article-body">
          <InfoBox meta={article.meta} />
          <ArticleRenderer content={article.content} className="!border-0 !p-0" />
        </div>

        {/* Backlinks */}
        {backlinks.length > 0 && (
          <div className="backlinks" style={{
            background: '#fff',
            border: '1px solid #a2a9b1',
            borderTop: 'none',
            padding: '0.75rem 1rem',
          }}>
            <div style={{
              fontWeight: 'bold',
              marginBottom: '0.4rem',
              color: '#202122',
              fontFamily: '-apple-system, sans-serif',
            }}>
              Pages that link here ({backlinks.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {backlinks.map((bl) => (
                <Link
                  key={bl.slug}
                  href={`/wiki/${bl.slug}`}
                  style={{
                    display: 'inline-block',
                    background: '#eaecf0',
                    border: '1px solid #a2a9b1',
                    borderRadius: '2px',
                    padding: '0.15rem 0.5rem',
                    fontSize: '0.8rem',
                    color: '#0645ad',
                    textDecoration: 'none',
                    fontFamily: '-apple-system, sans-serif',
                  }}
                >
                  {bl.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #a2a9b1',
          borderTop: 'none',
          padding: '0.4rem 1rem',
          fontSize: '0.75rem',
          color: '#54595d',
          fontFamily: '-apple-system, sans-serif',
        }}>
          <code style={{ fontSize: '0.7rem', background: 'none' }}>
            {article.meta.path}
          </code>
        </div>
      </article>
    </WikiLayout>
  )
}
