#!/usr/bin/env node
/**
 * generate-stats.mjs
 * Scans the Agentic-KB wiki and outputs wiki/stats.md
 * Usage: node scripts/generate-stats.mjs [--kb-root /path/to/Agentic-KB]
 */

import fs from 'fs'
import path from 'path'

// ── Config ────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const rootArg = args.indexOf('--kb-root')
const KB_ROOT = rootArg !== -1 ? args[rootArg + 1] : path.resolve(import.meta.dirname, '..')
const WIKI = path.join(KB_ROOT, 'wiki')
const OUT  = path.join(WIKI, 'stats.md')

const SECTIONS = [
  'concepts', 'patterns', 'frameworks', 'entities',
  'recipes', 'evaluations', 'summaries', 'syntheses', 'personal',
  'mocs', 'system/policies',
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function walk(dir, results = []) {
  if (!fs.existsSync(dir)) return results
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, results)
    else if (entry.name.endsWith('.md')) results.push(full)
  }
  return results
}

function parseFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---/)
  if (!m) return {}
  const data = {}
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w[\w_-]*):\s*(.+)$/)
    if (kv) data[kv[1].trim()] = kv[2].trim().replace(/^["']|["']$/g, '')
  }
  return data
}

function countLinks(content) {
  const wikiLinks = (content.match(/\[\[/g) || []).length
  return wikiLinks
}

function wordCount(content) {
  // Strip frontmatter, count words
  const stripped = content.replace(/^---[\s\S]*?---\n/, '')
  return (stripped.match(/\S+/g) || []).length
}

function ageDays(filePath) {
  try {
    const stat = fs.statSync(filePath)
    return Math.floor((Date.now() - stat.mtimeMs) / 86400000)
  } catch { return 0 }
}

function relPath(absPath) {
  return path.relative(WIKI, absPath)
}

// ── Scan ──────────────────────────────────────────────────────────────────────

const allWikiFiles = walk(WIKI).filter(f => {
  const rel = relPath(f)
  return !rel.startsWith('agents/') && !rel.startsWith('repos/') &&
         !rel.startsWith('system/bus/') && f !== OUT &&
         !path.basename(f).startsWith('lint') &&
         path.basename(f) !== 'log.md' &&
         path.basename(f) !== 'recently-added.md' &&
         path.basename(f) !== 'stats.md'
})

// Section counts
const sectionCounts = {}
for (const sec of SECTIONS) {
  const dir = path.join(WIKI, sec)
  sectionCounts[sec] = fs.existsSync(dir)
    ? walk(dir).filter(f => f.endsWith('.md')).length
    : 0
}

// Per-file metrics
let totalWords = 0
let totalLinks = 0
let typeCounts = {}
let confidenceCounts = { high: 0, medium: 0, low: 0, unset: 0 }
let staleCounts = { fresh: 0, aging: 0, stale: 0 }
let orphans = []
let highLinkPages = []
let oldestAge = 0
let newestAge = Infinity

const linkTargets = new Set()
const pageLinks = {}   // relPath → outbound link count

for (const f of allWikiFiles) {
  const content = fs.readFileSync(f, 'utf8')
  const fm = parseFrontmatter(content)
  const rel = relPath(f)
  const words = wordCount(content)
  const links = countLinks(content)
  const age = ageDays(f)

  totalWords += words
  totalLinks += links
  pageLinks[rel] = links

  // Type counts
  const type = fm.type || 'untyped'
  typeCounts[type] = (typeCounts[type] || 0) + 1

  // Confidence
  const conf = fm.confidence || 'unset'
  if (conf in confidenceCounts) confidenceCounts[conf]++
  else confidenceCounts.unset++

  // Age / freshness (rough: >90 days = stale, 30-90 = aging, <30 = fresh)
  if (age > 90) staleCounts.stale++
  else if (age > 30) staleCounts.aging++
  else staleCounts.fresh++

  if (age > oldestAge) oldestAge = age
  if (age < newestAge) newestAge = age

  // Collect link targets for orphan detection
  const targets = content.match(/\[\[([^\]|#]+)/g) || []
  for (const t of targets) linkTargets.add(t.replace('[[', '').trim().toLowerCase())

  // High-link pages
  if (links >= 10) highLinkPages.push({ rel, links })
}

// Orphan detection: pages with no inbound links from other pages
const allPageNames = allWikiFiles.map(f =>
  path.basename(f, '.md').toLowerCase()
)
for (const f of allWikiFiles) {
  const name = path.basename(f, '.md').toLowerCase()
  const rel = relPath(f)
  // skip index, hot, log
  if (['index', 'hot', 'log', 'stats', 'recently-added', 'schema'].includes(name)) continue
  if (!linkTargets.has(name) && !linkTargets.has(rel.replace('.md','').toLowerCase())) {
    orphans.push(rel)
  }
}

highLinkPages.sort((a, b) => b.links - a.links)

// Bus items
const busDir = path.join(WIKI, 'system/bus')
const busCounts = {}
if (fs.existsSync(busDir)) {
  for (const ch of fs.readdirSync(busDir)) {
    const chDir = path.join(busDir, ch)
    if (fs.statSync(chDir).isDirectory()) {
      busCounts[ch] = fs.readdirSync(chDir).filter(f => f.endsWith('.md')).length
    }
  }
}

// Agents
const agentsDir = path.join(WIKI, 'agents')
const agentCounts = { orchestrators: 0, leads: 0, workers: 0 }
for (const tier of Object.keys(agentCounts)) {
  const d = path.join(agentsDir, tier)
  if (fs.existsSync(d)) {
    agentCounts[tier] = fs.readdirSync(d).filter(e =>
      fs.statSync(path.join(d, e)).isDirectory()
    ).length
  }
}

const totalPages = allWikiFiles.length
const avgLinks = totalPages > 0 ? (totalLinks / totalPages).toFixed(1) : 0
const avgWords = totalPages > 0 ? Math.round(totalWords / totalPages) : 0
const readingTimeMin = Math.round(totalWords / 200)
const now = new Date().toISOString().slice(0, 16).replace('T', ' ')

// ── Build output ──────────────────────────────────────────────────────────────

const lines = []

lines.push(`---`)
lines.push(`title: Agentic-KB Stats`)
lines.push(`type: meta`)
lines.push(`generated: "${now}"`)
lines.push(`---`)
lines.push(``)
lines.push(`# Agentic-KB — Knowledge Base Stats`)
lines.push(`> Generated: ${now} | Run \`node scripts/generate-stats.mjs\` to refresh`)
lines.push(``)
lines.push(`---`)
lines.push(``)
lines.push(`## Overall Metrics`)
lines.push(``)
lines.push(`| Metric | Value |`)
lines.push(`|--------|-------|`)
lines.push(`| Total wiki pages | **${totalPages}** |`)
lines.push(`| Total words | ${totalWords.toLocaleString()} |`)
lines.push(`| Estimated reading time | ${readingTimeMin} min |`)
lines.push(`| Total internal links | ${totalLinks.toLocaleString()} |`)
lines.push(`| Avg links per page | ${avgLinks} |`)
lines.push(`| Avg words per page | ${avgWords} |`)
lines.push(`| Orphan pages | ${orphans.length} |`)
lines.push(``)
lines.push(`---`)
lines.push(``)
lines.push(`## Pages by Section`)
lines.push(``)
lines.push(`| Section | Pages |`)
lines.push(`|---------|-------|`)
for (const [sec, count] of Object.entries(sectionCounts)) {
  if (count > 0) lines.push(`| ${sec} | ${count} |`)
}
lines.push(``)
lines.push(`---`)
lines.push(``)
lines.push(`## Pages by Type`)
lines.push(``)
lines.push(`| Type | Count |`)
lines.push(`|------|-------|`)
for (const [type, count] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) {
  lines.push(`| ${type} | ${count} |`)
}
lines.push(``)
lines.push(`---`)
lines.push(``)
lines.push(`## Confidence Distribution`)
lines.push(``)
lines.push(`| Level | Count |`)
lines.push(`|-------|-------|`)
lines.push(`| high | ${confidenceCounts.high} |`)
lines.push(`| medium | ${confidenceCounts.medium} |`)
lines.push(`| low | ${confidenceCounts.low} |`)
lines.push(`| unset | ${confidenceCounts.unset} |`)
lines.push(``)
lines.push(`---`)
lines.push(``)
lines.push(`## Freshness (by file mtime)`)
lines.push(``)
lines.push(`| Status | Count | Threshold |`)
lines.push(`|--------|-------|-----------|`)
lines.push(`| Fresh | ${staleCounts.fresh} | < 30 days |`)
lines.push(`| Aging | ${staleCounts.aging} | 30–90 days |`)
lines.push(`| Stale | ${staleCounts.stale} | > 90 days |`)
lines.push(``)
lines.push(`---`)
lines.push(``)
lines.push(`## Bus Items`)
lines.push(``)
lines.push(`| Channel | Items |`)
lines.push(`|---------|-------|`)
for (const [ch, count] of Object.entries(busCounts)) {
  lines.push(`| ${ch} | ${count} |`)
}
if (Object.keys(busCounts).length === 0) lines.push(`| — | no items |`)
lines.push(``)
lines.push(`---`)
lines.push(``)
lines.push(`## Agent Namespaces`)
lines.push(``)
lines.push(`| Tier | Agents |`)
lines.push(`|------|--------|`)
lines.push(`| orchestrators | ${agentCounts.orchestrators} |`)
lines.push(`| leads | ${agentCounts.leads} |`)
lines.push(`| workers | ${agentCounts.workers} |`)
lines.push(``)
lines.push(`---`)
lines.push(``)
lines.push(`## Most Linked Pages`)
lines.push(``)
lines.push(`| Page | Outbound Links |`)
lines.push(`|------|---------------|`)
for (const { rel, links } of highLinkPages.slice(0, 10)) {
  lines.push(`| [[${rel.replace('.md', '')}]] | ${links} |`)
}
if (highLinkPages.length === 0) lines.push(`| — | no pages with 10+ links |`)
lines.push(``)
lines.push(`---`)
lines.push(``)
lines.push(`## Orphan Pages`)
lines.push(`> Pages with no detected inbound links. Add them to a MoC or index entry.`)
lines.push(``)
if (orphans.length === 0) {
  lines.push(`✅ No orphans detected.`)
} else {
  for (const o of orphans.slice(0, 30)) {
    lines.push(`- [[${o.replace('.md', '')}]]`)
  }
  if (orphans.length > 30) lines.push(`- *(+${orphans.length - 30} more — run lint for full list)*`)
}
lines.push(``)
lines.push(`---`)
lines.push(``)
lines.push(`## How to Refresh`)
lines.push(`\`\`\`bash`)
lines.push(`node scripts/generate-stats.mjs`)
lines.push(`# Or with explicit root:`)
lines.push(`node scripts/generate-stats.mjs --kb-root /path/to/Agentic-KB`)
lines.push(`\`\`\``)

fs.writeFileSync(OUT, lines.join('\n') + '\n', 'utf8')
console.log(`✅ Stats written → ${path.relative(KB_ROOT, OUT)}`)
console.log(`   ${totalPages} pages | ${totalWords.toLocaleString()} words | ${totalLinks.toLocaleString()} links | ${orphans.length} orphans`)
