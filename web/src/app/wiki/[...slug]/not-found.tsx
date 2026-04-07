import React from 'react'
import Link from 'next/link'
import WikiLayout from '@/components/WikiLayout'

export default function ArticleNotFound(): React.ReactElement {
  return (
    <WikiLayout>
      <div>
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
            Article not found
          </h1>
        </div>
        <div className="article-body">
          <p>
            The wiki article you requested does not exist. It may have been moved, deleted, or never created.
          </p>
          <p>
            You can:
          </p>
          <ul>
            <li><Link href="/wiki">Browse the main index</Link></li>
            <li><Link href="/search">Search the wiki</Link></li>
            <li><Link href="/ingest">Add new material</Link> to eventually create this article</li>
          </ul>
          <p style={{ color: '#54595d', fontSize: '0.875rem' }}>
            Note: Wiki articles are maintained by LLM agents via the INGEST workflow.
            To create a new article, add raw material and run the ingest process.
          </p>
        </div>
      </div>
    </WikiLayout>
  )
}
