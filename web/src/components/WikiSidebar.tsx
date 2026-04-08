'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarLink {
  label: string
  href: string
}

interface SidebarSection {
  title: string
  links: SidebarLink[]
}

interface VaultStructure {
  vaultName: string
  isAgenticKB: boolean
  sections: SidebarSection[]
}

export default function WikiSidebar(): React.ReactElement {
  const pathname = usePathname()
  const [structure, setStructure] = useState<VaultStructure | null>(null)

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        const res = await fetch('/api/vault-structure')
        const data = await res.json() as VaultStructure
        setStructure(data)
      } catch { /* ignore */ }
    }
    void load()
  }, [])

  // Listen for vault switches
  useEffect(() => {
    const handler = (): void => {
      fetch('/api/vault-structure')
        .then(r => r.json())
        .then((data: VaultStructure) => setStructure(data))
        .catch(() => { /* ignore */ })
    }
    window.addEventListener('vault-switched', handler)
    return () => window.removeEventListener('vault-switched', handler)
  }, [])

  if (!structure) {
    return (
      <nav className="wiki-sidebar-nav">
        <div style={{ padding: '1rem', color: '#54595d', fontSize: '0.8rem' }}>
          Loading...
        </div>
      </nav>
    )
  }

  return (
    <nav className="wiki-sidebar-nav">
      {/* Always show these top nav links */}
      <div key="__nav__">
        <h3>Navigation</h3>
        <ul>
          {[
            { label: 'Main Page', href: '/wiki' },
            { label: 'Ask AI', href: '/query' },
            { label: 'Add Material', href: '/ingest' },
          ].map(link => (
            <li key={link.label}>
              <Link href={link.href} className={pathname === link.href ? 'active' : ''}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* External tools — architecture viewer + Obsidian graph */}
      <div key="__tools__">
        <h3>Tools</h3>
        <ul>
          <li>
            <a
              href="http://localhost:4567"
              target="_blank"
              rel="noopener noreferrer"
              title="oh-my-mermaid viewer — interactive architecture diagrams"
            >
              Architecture Diagram ↗
            </a>
          </li>
          <li>
            <a
              href="obsidian://advanced-uri?vault=Agentic-KB&commandid=graph%3Aopen"
              title="Open the Obsidian global graph view directly"
            >
              Knowledge Graph (Obsidian) ↗
            </a>
          </li>
        </ul>
      </div>

      {/* Dynamic vault sections */}
      {structure.sections.map((section) => (
        <div key={section.title}>
          <h3>{section.title}</h3>
          <ul>
            {section.links.map((link, i) => (
              <li key={`${link.href}-${i}`}>
                <Link
                  href={link.href}
                  className={pathname === link.href ? 'active' : ''}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
