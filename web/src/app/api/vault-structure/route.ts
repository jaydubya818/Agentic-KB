import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const VAULT_COOKIE = 'active_vault_path'
const DEFAULT_VAULT = '/Users/jaywest/Agentic-KB'
const SKIP_DIRS = new Set(['.obsidian', '.git', 'node_modules', '.next', '.DS_Store'])
const MAX_LINKS_PER_SECTION = 40  // cap to keep sidebar usable

interface SidebarLink { label: string; href: string }
interface SidebarSection { title: string; links: SidebarLink[] }

function titleFromFile(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const fm = content.match(/^---[\s\S]*?^title:\s*["']?(.+?)["']?\s*$/m)
    if (fm) return fm[1].trim()
    const h1 = content.match(/^#\s+(.+)$/m)
    if (h1) return h1[1].trim()
  } catch { /* ignore */ }
  return path.basename(filePath, '.md')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function buildSections(contentRoot: string): SidebarSection[] {
  if (!fs.existsSync(contentRoot)) return []

  const sections: SidebarSection[] = []

  // Top-level .md files → "Pages" section
  const topFiles = fs.readdirSync(contentRoot)
    .filter(f => f.endsWith('.md') && f !== '.DS_Store')
    .map(f => path.join(contentRoot, f))

  if (topFiles.length > 0) {
    sections.push({
      title: 'Pages',
      links: topFiles.slice(0, MAX_LINKS_PER_SECTION).map(f => ({
        label: titleFromFile(f),
        href: `/wiki/${path.relative(contentRoot, f).replace(/\\/g, '/').replace(/\.md$/, '')}`,
      })),
    })
  }

  // Walk subdirectories — collect all .md files recursively per top-level dir
  const topDirs = fs.readdirSync(contentRoot, { withFileTypes: true })
    .filter(d => d.isDirectory() && !SKIP_DIRS.has(d.name))
    .sort((a, b) => a.name.localeCompare(b.name))

  for (const dir of topDirs) {
    const dirPath = path.join(contentRoot, dir.name)
    const links: SidebarLink[] = []

    // Recursively collect all .md files under this top-level dir
    function walkDir(current: string, depth = 0): void {
      if (depth > 5) return
      try {
        const entries = fs.readdirSync(current, { withFileTypes: true })
        for (const entry of entries) {
          if (SKIP_DIRS.has(entry.name)) continue
          const full = path.join(current, entry.name)
          if (entry.isDirectory()) {
            walkDir(full, depth + 1)
          } else if (entry.name.endsWith('.md')) {
            const slug = path.relative(contentRoot, full).replace(/\\/g, '/').replace(/\.md$/, '')
            links.push({ label: titleFromFile(full), href: `/wiki/${slug}` })
          }
        }
      } catch { /* skip unreadable dirs */ }
    }

    walkDir(dirPath)

    if (links.length === 0) continue

    // Sort: files in root of this dir first, then nested, then alpha
    links.sort((a, b) => {
      const aDepth = a.href.split('/').length
      const bDepth = b.href.split('/').length
      if (aDepth !== bDepth) return aDepth - bDepth
      return a.label.localeCompare(b.label)
    })

    sections.push({
      title: dir.name.charAt(0).toUpperCase() + dir.name.slice(1),
      links: links.slice(0, MAX_LINKS_PER_SECTION),
    })
  }

  return sections
}

function countFiles(root: string): number {
  let count = 0
  function walk(dir: string, depth = 0): void {
    if (depth > 6 || !fs.existsSync(dir)) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (SKIP_DIRS.has(entry.name)) continue
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full, depth + 1)
      else if (entry.name.endsWith('.md')) count++
    }
  }
  walk(root)
  return count
}

export async function GET(request: NextRequest) {
  const vaultPath = request.cookies.get(VAULT_COOKIE)?.value || DEFAULT_VAULT
  const wikiDir = path.join(vaultPath, 'wiki')
  const contentRoot = fs.existsSync(wikiDir) ? wikiDir : vaultPath
  const sections = buildSections(contentRoot)
  const vaultName = path.basename(vaultPath)
  const isAgenticKB = vaultPath === DEFAULT_VAULT
  const totalFiles = countFiles(contentRoot)

  return NextResponse.json({ vaultName, vaultPath, contentRoot, isAgenticKB, sections, totalFiles })
}
