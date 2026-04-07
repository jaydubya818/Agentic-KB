import React from 'react'
import { cookies } from 'next/headers'
import path from 'path'
import fs from 'fs'
import {
  readIndex, readIndexInVault,
  parseArticle, parseFileInVault,
  listFilesUnder, resolveContentRoot,
  WIKI_ROOT, DEFAULT_KB_ROOT,
} from '@/lib/articles'
import WikiLayout from '@/components/WikiLayout'
import ArticleRenderer from '@/components/ArticleRenderer'
import TableOfContents from '@/components/TableOfContents'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

// ─── Generic vault index (non-Agentic-KB) ───────────────────────────────────

interface FileEntry { slug: string; title: string; relPath: string; size: number; mtime: Date }
interface FolderGroup { name: string; files: FileEntry[] }

function buildGenericIndex(vaultRoot: string): FolderGroup[] {
  const contentRoot = resolveContentRoot(vaultRoot)
  const skip = new Set(['.obsidian', '.git', 'node_modules', '.next'])
  const groups = new Map<string, FileEntry[]>()

  function titleFrom(filePath: string): string {
    try {
      const c = fs.readFileSync(filePath, 'utf8')
      const fm = c.match(/^---[\s\S]*?^title:\s*["']?(.+?)["']?\s*$/m)
      if (fm) return fm[1].trim()
      const h1 = c.match(/^#\s+(.+)$/m)
      if (h1) return h1[1].trim()
    } catch { /* ignore */ }
    return path.basename(filePath, '.md').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }

  function walk(dir: string, depth = 0): void {
    if (!fs.existsSync(dir) || depth > 4) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (skip.has(entry.name)) continue
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full, depth + 1)
      } else if (entry.name.endsWith('.md')) {
        const rel = path.relative(contentRoot, full).replace(/\\/g, '/')
        const folderRel = path.dirname(rel)
        const folderLabel = folderRel === '.' ? '/' : folderRel
        const slug = rel.replace(/\.md$/, '')
        const stat = fs.statSync(full)
        const fe: FileEntry = { slug, title: titleFrom(full), relPath: rel, size: stat.size, mtime: stat.mtime }
        if (!groups.has(folderLabel)) groups.set(folderLabel, [])
        groups.get(folderLabel)!.push(fe)
      }
    }
  }

  walk(contentRoot)

  // Sort each group by mtime desc
  const result: FolderGroup[] = []
  for (const [name, files] of groups) {
    files.sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
    result.push({ name, files })
  }
  // Root first, then alphabetical
  result.sort((a, b) => {
    if (a.name === '/') return -1
    if (b.name === '/') return 1
    return a.name.localeCompare(b.name)
  })
  return result
}

function GenericVaultIndex({ vaultRoot }: { vaultRoot: string }): React.ReactElement {
  const vaultName = path.basename(vaultRoot)
  const groups = buildGenericIndex(vaultRoot)
  const totalFiles = groups.reduce((s, g) => s + g.files.length, 0)

  return (
    <article>
      <div style={{ background: '#fff', border: '1px solid #a2a9b1', borderBottom: 'none', padding: '0.75rem 1rem 0' }}>
        <h1 style={{ fontFamily: "'Linux Libertine', Georgia, serif", fontSize: '2rem', fontWeight: 'normal', margin: 0, paddingBottom: '0.5rem', borderBottom: '1px solid #a2a9b1', color: '#202122' }}>
          {vaultName}
        </h1>
        <div style={{ fontSize: '0.75rem', color: '#54595d', padding: '0.4rem 0', fontFamily: '-apple-system, sans-serif', display: 'flex', gap: '1rem' }}>
          <span>Obsidian Vault</span>
          <span>{totalFiles} notes</span>
          <span style={{ fontFamily: 'monospace' }}>{vaultRoot}</span>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #a2a9b1', borderTop: 'none', padding: '1rem' }}>
        {groups.length === 0 && (
          <p style={{ color: '#54595d', fontFamily: '-apple-system, sans-serif' }}>No markdown files found in this vault.</p>
        )}
        {groups.map(group => (
          <div key={group.name} style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: '-apple-system, sans-serif', fontSize: '0.8rem', fontWeight: 'bold', color: '#54595d', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem', paddingBottom: '0.25rem', borderBottom: '1px solid #eaecf0' }}>
              {group.name === '/' ? 'Root' : group.name}
              <span style={{ fontWeight: 'normal', marginLeft: '0.5rem' }}>({group.files.length})</span>
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {group.files.map(f => (
                <Link key={f.slug} href={`/wiki/${f.slug}`} style={{ color: '#0645ad', fontSize: '0.875rem', textDecoration: 'none', background: '#f8f9fa', border: '1px solid #eaecf0', borderRadius: '2px', padding: '0.2rem 0.5rem', fontFamily: '-apple-system, sans-serif' }}>
                  {f.title}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#f8f9fa', border: '1px solid #a2a9b1', borderTop: 'none', padding: '0.5rem 1rem', fontSize: '0.75rem', color: '#54595d', fontFamily: '-apple-system, sans-serif' }}>
        Browsing vault: <code style={{ fontSize: '0.7rem', background: 'none' }}>{vaultRoot}</code>
      </div>
    </article>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function WikiIndexPage(): Promise<React.ReactElement> {
  const cookieStore = await cookies()
  const vaultRoot = cookieStore.get('active_vault_path')?.value || DEFAULT_KB_ROOT
  const isDefault = vaultRoot === DEFAULT_KB_ROOT

  // Generic vault — show file browser
  if (!isDefault) {
    const groups = buildGenericIndex(vaultRoot)
    const totalFiles = groups.reduce((s, g) => s + g.files.length, 0)
    return (
      <WikiLayout>
        <GenericVaultIndex vaultRoot={vaultRoot} />
      </WikiLayout>
    )
  }

  // Agentic-KB — render structured index.md
  const content = readIndex()
  const indexPath = path.join(WIKI_ROOT, 'index.md')
  const article = parseArticle(indexPath)

  return (
    <WikiLayout toc={<TableOfContents content={content} />}>
      <article>
        <div style={{ background: '#fff', border: '1px solid #a2a9b1', borderBottom: 'none', padding: '0.75rem 1rem 0' }}>
          <h1 style={{ fontFamily: "'Linux Libertine', Georgia, serif", fontSize: '2rem', fontWeight: 'normal', margin: 0, paddingBottom: '0.5rem', borderBottom: '1px solid #a2a9b1', color: '#202122' }}>
            Agentic Engineering Knowledge Base
          </h1>
          <div style={{ fontSize: '0.75rem', color: '#54595d', padding: '0.4rem 0', fontFamily: '-apple-system, sans-serif', display: 'flex', gap: '1rem' }}>
            <span>From the Agentic Engineering Wiki</span>
            {article?.meta.updated && <span>Last updated: {article.meta.updated}</span>}
          </div>
        </div>
        <ArticleRenderer content={content} />
        <div style={{ background: '#f8f9fa', border: '1px solid #a2a9b1', borderTop: 'none', padding: '0.5rem 1rem', fontSize: '0.75rem', color: '#54595d', fontFamily: '-apple-system, sans-serif', display: 'flex', gap: '1.5rem' }}>
          <span>Wiki maintained by LLM agents</span>
          <span>Never edit manually</span>
          <span>Run INGEST workflow to add content</span>
        </div>
      </article>
    </WikiLayout>
  )
}
