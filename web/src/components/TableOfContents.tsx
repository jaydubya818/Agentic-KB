'use client'

import React from 'react'

import { useEffect, useState } from 'react'
import { extractHeadings, type Heading } from '@/lib/wiki-links'

interface TableOfContentsProps {
  content: string
}

export default function TableOfContents({ content }: TableOfContentsProps): React.ReactElement | null {
  const [activeId, setActiveId] = useState<string>('')
  const headings = extractHeadings(content).filter(h => h.level <= 3)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-10% 0px -80% 0px', threshold: 0 }
    )

    const headingElements = document.querySelectorAll('h1[id], h2[id], h3[id]')
    headingElements.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [content])

  if (headings.length < 2) return null

  const handleClick = (id: string): void => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="toc">
      <div className="toc-title">Contents</div>
      <HeadingList
        headings={headings}
        activeId={activeId}
        onHeadingClick={handleClick}
        parentLevel={1}
      />
    </div>
  )
}

interface HeadingListProps {
  headings: Heading[]
  activeId: string
  onHeadingClick: (id: string) => void
  parentLevel: number
}

function HeadingList({ headings, activeId, onHeadingClick, parentLevel }: HeadingListProps): React.ReactElement {
  const topLevel = Math.min(...headings.map(h => h.level))

  // Group headings into a nested structure
  const renderHeadings = (items: Heading[], level: number): React.ReactElement[] => {
    const result: React.ReactElement[] = []
    let i = 0

    while (i < items.length) {
      const heading = items[i]
      if (heading.level === level) {
        // Find children (headings with higher level numbers)
        const children: Heading[] = []
        let j = i + 1
        while (j < items.length && items[j].level > level) {
          children.push(items[j])
          j++
        }

        result.push(
          <li key={heading.id}>
            <button
              onClick={() => onHeadingClick(heading.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                textAlign: 'left',
                color: activeId === heading.id ? '#0645ad' : '#0645ad',
                fontWeight: activeId === heading.id ? 'bold' : 'normal',
                fontSize: '0.8rem',
                textDecoration: 'none',
              }}
            >
              {heading.text}
            </button>
            {children.length > 0 && (
              <ol style={{ listStyleType: 'decimal', paddingLeft: '1rem', marginTop: '0.2rem' }}>
                {renderHeadings(children, level + 1)}
              </ol>
            )}
          </li>
        )
        i = j
      } else {
        i++
      }
    }

    return result
  }

  return (
    <ol style={{ listStyleType: 'decimal', paddingLeft: '1.25rem', margin: 0 }}>
      {renderHeadings(headings, topLevel)}
    </ol>
  )
}
