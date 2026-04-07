import React from 'react'
import { cookies } from 'next/headers'
import path from 'path'
import fs from 'fs'
import {
  readIndex,
  parseArticle,
  resolveContentRoot,
  WIKI_ROOT, DEFAULT_KB_ROOT,
} from '@/lib/articles'
import WikiLayout from '@/components/WikiLayout'
import ArticleRenderer from '@/components/ArticleRenderer'
import TableOfContents from '@/components/TableOfContents'
import Link from 'next/link'
import CompilePanel from '@/components/CompilePanel'

export const dynamic = 'force-dynamic'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FileEntry {
  slug: string
  title: string
  relPath: string
  size: number
  mtime: Date
  tags: string[]
  visibility: string
  vault: boolean
}

interface FolderGroup {
  name: string
  label: string
  files: FileEntry[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SKIP = new Set(['.obsidian', '.git', 'node_modules', '.next', '.DS_Store'])

function titleFrom(filePath: string): string {
  try {
    const c = fs.readFileSync(filePath, 'utf8')
    const fm = c.match(/^---[\s\S]*?^title:\s*["']?(.+?)["']?\s*$/m)
    if (fm) return fm[1].trim()
    const h1 = c.match(/^#\s+(.+)$/m)
    if (h1) return h1[1].trim()
  } catch { /* ignore */ }
  return path.basename(filePath, '.md')
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function metaFrom(filePath: string): { tags: string[]; visibility: string; vault: boolean } {
  try {
    const c = fs.readFileSync(filePath, 'utf8')
    const tagsMatch = c.match(/^tags:\s*\[([^\]]*)\]/m) || c.match(/^tags:\s*(.+)$/m)
    const tags = tagsMatch
      ? tagsMatch[1].split(',').map(t => t.trim().replace(/^["'\-\s]+|["'\s]+$/g, '')).filter(Boolean)
      : []
    const visMatch = c.match(/^visibility:\s*(\w+)/m)
    const vaultMatch = c.match(/^vault:\s*(true|false)/m)
    return {
      tags,
      visibility: visMatch ? visMatch[1] : 'public',
      vault: vaultMatch ? vaultMatch[1] === 'true' : false,
    }
  } catch {
    return { tags: [], visibility: 'public', vault: false }
  }
}

function buildVaultIndex(vaultRoot: string): FolderGroup[] {
  const contentRoot = resolveContentRoot(vaultRoot)
  const groups = new Map<string, FileEntry[]>()

  function walk(dir: string, depth = 0): void {
    if (!fs.existsSync(dir) || depth > 5) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (SKIP.has(entry.name)) continue
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full, depth + 1)
      } else if (entry.name.endsWith('.md') && entry.name !== '.DS_Store') {
        const rel = path.relative(contentRoot, full).replace(/\\/g, '/')
        const folder = path.dirname(rel)
        const folderKey = folder === '.' ? '__root__' : folder
        const slug = rel.replace(/\.md$/, '')
        const stat = fs.statSync(full)
        const extra = metaFrom(full)
        const fe: FileEntry = {
          slug,
          title: titleFrom(full),
          relPath: rel,
          size: stat.size,
          mtime: stat.mtime,
          ...extra,
        }
        if (!groups.has(folderKey)) groups.set(folderKey, [])
        groups.get(folderKey)!.push(fe)
      }
    }
  }
  walk(contentRoot)

  const result: FolderGroup[] = []
  for (const [key, files] of groups) {
    files.sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
    const label = key === '__root__' ? 'Notes'
      : key.split('/').map(s => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ')).join(' / ')
    result.push({ name: key, label, files })
  }

  // Sort: root first, then alphabetical by label
  result.sort((a, b) => {
    if (a.name === '__root__') return -1
    if (b.name === '__root__') return 1
    return a.label.localeCompare(b.label)
  })
  return result
}

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 60) return `${mins}m ago`
  if (hrs < 24) return `${hrs}h ago`
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: days > 365 ? 'numeric' : undefined })
}

// ─── Generic Vault Index Component ───────────────────────────────────────────

function GenericVaultIndex({ vaultRoot }: { vaultRoot: string }): React.ReactElement {
  const vaultName = path.basename(vaultRoot)
  const groups = buildVaultIndex(vaultRoot)
  const allFiles = groups.flatMap(g => g.files)
  const totalFiles = allFiles.length
  const folderCount = groups.filter(g => g.name !== '__root__').length

  // Stats
  const recentFiles = [...allFiles]
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
    .slice(0, 10)
  const lastModified = recentFiles[0]?.mtime

  // Tag cloud (top 20 most-used tags)
  const tagCounts = new Map<string, number>()
  for (const f of allFiles) {
    for (const tag of f.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
    }
  }
  const topTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)

  // Private/vault counts
  const privateCount = allFiles.filter(f => f.visibility === 'private').length
  const vaultCount = allFiles.filter(f => f.vault).length

  return (
    <article>
      {/* ── Page header ── */}
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
          {vaultName}
        </h1>
        <div style={{
          fontSize: '0.75rem',
          color: '#54595d',
          padding: '0.4rem 0',
          fontFamily: '-apple-system, sans-serif',
          display: 'flex',
          gap: '1.25rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <span>📦 Obsidian Vault</span>
          <span>📄 {totalFiles} notes</span>
          <span>📁 {folderCount} folder{folderCount !== 1 ? 's' : ''}</span>
          {privateCount > 0 && <span>🔒 {privateCount} private</span>}
          {vaultCount > 0 && <span>✦ {vaultCount} vault</span>}
          {lastModified && <span>🕐 Last modified {relativeTime(lastModified)}</span>}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{
        background: '#fff',
        border: '1px solid #a2a9b1',
        borderTop: 'none',
        padding: '1rem 1.25rem',
      }}>
        {totalFiles === 0 && (
          <p style={{ color: '#54595d', fontFamily: '-apple-system, sans-serif' }}>
            No markdown files found in this vault.
          </p>
        )}

        {/* ── Recently modified ── */}
        {recentFiles.length > 0 && (
          <div style={{
            marginBottom: '1.75rem',
            background: '#f8f9fa',
            border: '1px solid #eaecf0',
            borderRadius: '2px',
            padding: '0.75rem 1rem',
          }}>
            <h2 style={{
              fontFamily: "'Linux Libertine', Georgia, serif",
              fontSize: '1.2rem',
              fontWeight: 'normal',
              color: '#202122',
              margin: '0 0 0.6rem 0',
              paddingBottom: '0.35rem',
              borderBottom: '1px solid #eaecf0',
            }}>
              Recently Modified
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.3rem' }}>
              {recentFiles.map(f => (
                <div key={f.slug} style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', overflow: 'hidden' }}>
                  <Link href={`/wiki/${f.slug}`} style={{
                    color: '#0645ad',
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    fontFamily: '-apple-system, sans-serif',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    flexShrink: 1,
                    minWidth: 0,
                  }}>
                    {f.title}
                  </Link>
                  <span style={{ fontSize: '0.7rem', color: '#72777d', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    {relativeTime(f.mtime)}
                  </span>
                  {f.visibility === 'private' && (
                    <span style={{ fontSize: '0.65rem', color: '#7c3aed', flexShrink: 0 }}>🔒</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Section grid ── */}
        {groups.length > 0 && (
          <div style={{ columns: '2 400px', columnGap: '1.5rem' }}>
            {groups.map(group => (
              <div key={group.name} style={{
                breakInside: 'avoid',
                marginBottom: '1.5rem',
                border: '1px solid #eaecf0',
                borderRadius: '2px',
                overflow: 'hidden',
              }}>
                {/* Section header */}
                <div style={{
                  background: '#eaecf0',
                  padding: '0.35rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                }}>
                  <span style={{
                    fontFamily: '-apple-system, sans-serif',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: '#202122',
                    letterSpacing: '0.02em',
                  }}>
                    {group.label}
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    color: '#54595d',
                    background: '#fff',
                    padding: '0 0.35rem',
                    borderRadius: '999px',
                    border: '1px solid #c8ccd1',
                    lineHeight: 1.6,
                  }}>
                    {group.files.length}
                  </span>
                </div>
                {/* File list */}
                <div style={{ padding: '0.4rem 0.75rem', background: '#fff' }}>
                  {group.files.map(f => (
                    <div key={f.slug} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.15rem 0',
                      borderBottom: '1px dotted #f0f0f0',
                    }}>
                      <Link href={`/wiki/${f.slug}`} style={{
                        color: '#0645ad',
                        fontSize: '0.875rem',
                        textDecoration: 'none',
                        fontFamily: '-apple-system, sans-serif',
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {f.title}
                      </Link>
                      {f.vault && (
                        <span style={{ fontSize: '0.6rem', background: '#d4af37', color: '#fff', padding: '0 0.25rem', borderRadius: '2px', flexShrink: 0 }}>✦</span>
                      )}
                      {f.visibility === 'private' && (
                        <span style={{ fontSize: '0.6rem', color: '#7c3aed', flexShrink: 0 }}>🔒</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tag cloud ── */}
        {topTags.length > 0 && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            background: '#f8f9fa',
            border: '1px solid #eaecf0',
            borderRadius: '2px',
          }}>
            <h3 style={{
              fontFamily: '-apple-system, sans-serif',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#54595d',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              margin: '0 0 0.5rem 0',
            }}>
              Tags
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {topTags.map(([tag, count]) => (
                <span key={tag} style={{
                  background: '#eaecf0',
                  border: '1px solid #c8ccd1',
                  borderRadius: '2px',
                  padding: '0.1rem 0.5rem',
                  fontSize: `${Math.max(0.7, Math.min(1.0, 0.7 + count * 0.05))}rem`,
                  color: '#202122',
                  fontFamily: '-apple-system, sans-serif',
                }}>
                  {tag}
                  {count > 1 && <sup style={{ fontSize: '0.6rem', color: '#72777d', marginLeft: '0.1rem' }}>{count}</sup>}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{
        background: '#f8f9fa',
        border: '1px solid #a2a9b1',
        borderTop: 'none',
        padding: '0.4rem 1rem',
        fontSize: '0.75rem',
        color: '#54595d',
        fontFamily: '-apple-system, sans-serif',
        display: 'flex',
        gap: '1.5rem',
        flexWrap: 'wrap',
      }}>
        <span>Vault: <code style={{ fontSize: '0.7rem', background: 'none' }}>{vaultRoot}</code></span>
        <span>{totalFiles} notes · {folderCount} folders</span>
      </div>
    </article>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function WikiIndexPage(): Promise<React.ReactElement> {
  const cookieStore = await cookies()
  const vaultRoot = cookieStore.get('active_vault_path')?.value || DEFAULT_KB_ROOT
  const isDefault = vaultRoot === DEFAULT_KB_ROOT

  // Non-default vault — show rich generic vault index
  if (!isDefault) {
    return (
      <WikiLayout>
        <GenericVaultIndex vaultRoot={vaultRoot} />
      </WikiLayout>
    )
  }

  // Agentic-KB — render structured index.md as before
  const content = readIndex()
  const indexPath = path.join(WIKI_ROOT, 'index.md')
  const article = parseArticle(indexPath)

  return (
    <WikiLayout toc={<TableOfContents content={content} />}>
      <article>
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
            {article?.meta.updated && <span>Last updated: {article.meta.updated}</span>}
          </div>
        </div>
        <ArticleRenderer content={content} />
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
