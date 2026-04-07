import React from 'react'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import path from 'path'
import { findArticleBySlug, findArticleInVault, getBacklinks, type ArticleMeta, DEFAULT_KB_ROOT } from '@/lib/articles'
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
  const cookieStore = await cookies()
  const vaultRoot = cookieStore.get('active_vault_path')?.value || DEFAULT_KB_ROOT
  const isDefault = vaultRoot === DEFAULT_KB_ROOT
  const vaultName = path.basename(vaultRoot)
  const article = isDefault ? findArticleBySlug(slug) : findArticleInVault(slug, vaultRoot)

  if (!article) {
    notFound()
  }

  const backlinks = isDefault ? getBacklinks(article.meta.slug) : []
  // Obsidian deep-link: obsidian://open?vault=VaultName&file=relative/path.md
  // meta.path is always relative to vaultRoot (both default and non-default vaults)
  const obsidianRelPath = article.meta.path.replace(/\\/g, '/')
  const obsidianHref = `obsidian://open?vault=${encodeURIComponent(vaultName)}&file=${encodeURIComponent(obsidianRelPath)}`
  // Breadcrumb folder segments from slug (e.g. "folder/sub/article" → ["folder", "sub"])
  const breadcrumbFolders = slug.split('/').slice(0, -1)

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
            alignItems: 'center',
          }}>
            {/* Breadcrumb */}
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
              <Link href="/wiki" style={{ color: '#0645ad' }}>
                {isDefault ? 'Agentic KB' : vaultName}
              </Link>
              {isDefault ? (
                <>
                  {' → '}
                  <span style={{ textTransform: 'capitalize' }}>{article.meta.type}</span>
                </>
              ) : (
                breadcrumbFolders.map((folder, i) => (
                  <React.Fragment key={i}>
                    {' → '}
                    <Link
                      href={`/wiki/${breadcrumbFolders.slice(0, i + 1).join('/')}`}
                      style={{ color: '#0645ad', textTransform: 'capitalize' }}
                    >
                      {folder.replace(/-/g, ' ')}
                    </Link>
                  </React.Fragment>
                ))
              )}
            </span>
            {article.meta.created && <span>Created: {String(article.meta.created)}</span>}
            {article.meta.vault && (
              <span style={{
                background: '#d4af37',
                color: '#fff',
                padding: '0.1rem 0.5rem',
                borderRadius: '2px',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                letterSpacing: '0.03em',
              }}>
                ✦ VAULT
              </span>
            )}
            {article.meta.visibility === 'private' && (
              <span style={{
                background: '#7c3aed',
                color: '#fff',
                padding: '0.1rem 0.5rem',
                borderRadius: '2px',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                letterSpacing: '0.03em',
              }}>
                🔒 PRIVATE
              </span>
            )}
            {/* Open in Obsidian — always visible, especially useful for non-KB vaults */}
            <a
              href={obsidianHref}
              title={`Open in Obsidian: ${obsidianRelPath}`}
              style={{
                marginLeft: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.72rem',
                color: '#7c3aed',
                textDecoration: 'none',
                border: '1px solid #c4b5fd',
                borderRadius: '2px',
                padding: '0.1rem 0.5rem',
                background: '#f5f3ff',
                whiteSpace: 'nowrap',
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#7c3aed">
                <path d="M12.003 0C9.53 0 7.332.968 5.617 2.555c-.36.33-.697.685-1.007 1.061C2.985 5.5 2 7.652 2 10.003c0 2.456 1.07 4.668 2.772 6.22l6.716 7.444a.7.7 0 001.037 0l6.716-7.444C20.931 14.67 22 12.459 22 10.003 22 4.48 17.525 0 12.003 0z"/>
              </svg>
              Open in Obsidian
            </a>
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
