import React from 'react'
import { readIndex, parseArticle, WIKI_ROOT } from '@/lib/articles'
import path from 'path'
import WikiLayout from '@/components/WikiLayout'
import ArticleRenderer from '@/components/ArticleRenderer'
import TableOfContents from '@/components/TableOfContents'

export const dynamic = 'force-dynamic'

export default function WikiIndexPage(): React.ReactElement {
  const content = readIndex()
  const indexPath = path.join(WIKI_ROOT, 'index.md')
  const article = parseArticle(indexPath)

  return (
    <WikiLayout
      toc={<TableOfContents content={content} />}
    >
      <article>
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
            Agentic Engineering Knowledge Base
          </h1>
          <div style={{
            fontSize: '0.75rem',
            color: '#54595d',
            padding: '0.4rem 0',
            fontFamily: '-apple-system, sans-serif',
            display: 'flex',
            gap: '1rem',
          }}>
            <span>From the Agentic Engineering Wiki</span>
            {article?.meta.updated && (
              <span>Last updated: {article.meta.updated}</span>
            )}
          </div>
        </div>

        {/* Article content */}
        <ArticleRenderer content={content} />

        {/* Stats bar */}
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #a2a9b1',
          borderTop: 'none',
          padding: '0.5rem 1rem',
          fontSize: '0.75rem',
          color: '#54595d',
          fontFamily: '-apple-system, sans-serif',
          display: 'flex',
          gap: '1.5rem',
        }}>
          <span>Wiki maintained by LLM agents</span>
          <span>Never edit manually</span>
          <span>Run INGEST workflow to add content</span>
        </div>
      </article>
    </WikiLayout>
  )
}
