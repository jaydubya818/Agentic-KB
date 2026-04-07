'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { replaceWikiLinks } from '@/lib/wiki-links'
import type { Components } from 'react-markdown'

interface ArticleRendererProps {
  content: string
  className?: string
}

export default function ArticleRenderer({ content, className }: ArticleRendererProps): React.ReactElement {
  // Replace [[wiki links]] with standard markdown links before rendering
  const processedContent = replaceWikiLinks(content)

  const components: Components = {
    // Custom link renderer: internal links use Next.js Link
    a({ href, children, ...props }) {
      if (href && (href.startsWith('/wiki/') || href.startsWith('/query') || href.startsWith('/ingest'))) {
        return (
          <Link href={href} {...props}>
            {children}
          </Link>
        )
      }
      // External links
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      )
    },

    // Add IDs to headings for ToC linking
    h1({ children, ...props }) {
      const id = headingToId(String(children))
      return <h1 id={id} {...props}>{children}</h1>
    },
    h2({ children, ...props }) {
      const id = headingToId(String(children))
      return <h2 id={id} {...props}>{children}</h2>
    },
    h3({ children, ...props }) {
      const id = headingToId(String(children))
      return <h3 id={id} {...props}>{children}</h3>
    },
    h4({ children, ...props }) {
      const id = headingToId(String(children))
      return <h4 id={id} {...props}>{children}</h4>
    },

    // Tables already styled via CSS
    table({ children, ...props }) {
      return <table {...props}>{children}</table>
    },

    // Code blocks
    code({ className: codeClass, children, ...props }) {
      const isInline = !codeClass
      if (isInline) {
        return <code {...props}>{children}</code>
      }
      return (
        <code className={codeClass} {...props}>
          {children}
        </code>
      )
    },
  }

  return (
    <div className={`article-body ${className || ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}

function headingToId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
}
