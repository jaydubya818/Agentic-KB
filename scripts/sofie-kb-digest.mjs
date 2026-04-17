#!/usr/bin/env node
/**
 * sofie-kb-digest.mjs
 *
 * Generates a Sofie-facing weekly digest from the KB:
 *   - KB health summary (from latest lint report)
 *   - New bus items pending triage
 *   - Recently updated wiki pages
 *   - Action item candidates from open discoveries
 *
 * Writes the digest to:
 *   - wiki/agents/leads/sofie/weekly-digest.md (KB side)
 *   - Obsidian Vault/07 - Tasks/KB Digest {date}.md (Obsidian side)
 *
 * Usage:
 *   node scripts/sofie-kb-digest.mjs
 *   node scripts/sofie-kb-digest.mjs --dry-run
 */

import fs from 'fs'
import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const KB_ROOT = path.resolve(__dirname, '..')
const OBSIDIAN_VAULT = process.env.OBSIDIAN_VAULT_ROOT || path.join(os.homedir(), 'Documents', 'Obsidian Vault')

function readFile(relPath) {
  try { return fs.readFileSync(path.join(KB_ROOT, relPath), 'utf8') } catch { return null }
}

function parseFrontmatter(content) {
  const match = content?.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  const meta = {}
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
  }
  return meta
}

function listBusItems(channel, statusFilter = 'open') {
  const dir = path.join(KB_ROOT, 'wiki', 'system', 'bus', channel)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const content = fs.readFileSync(path.join(dir, f), 'utf8')
      const meta = parseFrontmatter(content)
      return { id: path.basename(f, '.md'), ...meta, channel }
    })
    .filter(item => !statusFilter || item.status === statusFilter)
}

function recentWikiPages(days = 7) {
  const cutoff = Date.now() - days * 86400000
  const dirs = ['concepts', 'patterns', 'frameworks', 'summaries', 'recipes']
  const results = []
  for (const dir of dirs) {
    const fullDir = path.join(KB_ROOT, 'wiki', dir)
    if (!fs.existsSync(fullDir)) continue
    for (const f of fs.readdirSync(fullDir)) {
      if (!f.endsWith('.md')) continue
      const full = path.join(fullDir, f)
      const stat = fs.statSync(full)
      if (stat.mtimeMs > cutoff) {
        const content = fs.readFileSync(full, 'utf8')
        const meta = parseFrontmatter(content)
        results.push({ path: `wiki/${dir}/${f}`, title: meta.title || f, mtime: stat.mtime })
      }
    }
  }
  return results.sort((a, b) => b.mtime - a.mtime).slice(0, 10)
}

// ─── Build digest ─────────────────────────────────────────────────────────────

const now = new Date()
const dateStr = now.toISOString().slice(0, 10)

// KB health from lint report
const lintReport = readFile('wiki/lint-report.md') || readFile('wiki/syntheses/lint-2026-04-06.md')
const lintSummary = lintReport
  ? lintReport.split('\n').slice(0, 20).join('\n')
  : '_No lint report found. Run `kb lint` to generate one._'

// Bus items
const discoveries = listBusItems('discovery', 'open')
const escalations = listBusItems('escalation', 'open')
const standards = listBusItems('standards', 'open')

// Recent wiki pages
const recent = recentWikiPages(7)

// ─── Format digest ────────────────────────────────────────────────────────────

const digest = `---
title: "KB Digest — ${dateStr}"
type: sofie-digest
generated_at: ${now.toISOString()}
agent: sofie
tags: [sofie, digest, kb-health]
---

# Agentic-KB Weekly Digest
**Generated:** ${now.toLocaleString()} | **Agent:** Sofie (Chief of Staff)

---

## 🩺 KB Health

${lintSummary}

---

## 📬 Bus Items Pending Triage

### Discoveries (${discoveries.length} open)
${discoveries.length === 0 ? '_None pending._' : discoveries.map(d =>
  `- **${d.id}** — ${(d.body || d.title || 'No body').slice(0, 100)} _(from: ${d.from || 'unknown'})_`
).join('\n')}

### Escalations (${escalations.length} open)
${escalations.length === 0 ? '_None pending._' : escalations.map(e =>
  `- **${e.id}** — ${(e.body || e.title || 'No body').slice(0, 100)} _(to: ${e.to || 'unassigned'})_`
).join('\n')}

### Standards (${standards.length} open)
${standards.length === 0 ? '_None pending._' : standards.map(s =>
  `- **${s.id}** — ${(s.body || s.title || 'No title').slice(0, 100)}`
).join('\n')}

---

## 📄 Recently Updated Wiki Pages (last 7 days)
${recent.length === 0 ? '_No recent updates._' : recent.map(p =>
  `- [[${p.path.replace('.md', '')}|${p.title}]] — ${p.mtime.toISOString().slice(0, 10)}`
).join('\n')}

---

## ✅ Suggested Actions for Sofie

${discoveries.length > 0 ? `- [ ] Review ${discoveries.length} open discovery items — promote valuable ones to standards` : ''}
${escalations.length > 0 ? `- [ ] Triage ${escalations.length} escalations — route to Jay or resolve` : ''}
- [ ] Check recent wiki pages for accuracy against business context
- [ ] Verify any Q&A sessions from this week are ingested (run \`sofie-ingest-session\`)
- [ ] Run \`kb compile\` if new raw/ files have accumulated

---
_Auto-generated by scripts/sofie-kb-digest.mjs_
`

// ─── Write ─────────────────────────────────────────────────────────────────

const dryRun = process.argv.includes('--dry-run')

if (dryRun) {
  console.log('\n📋 DRY RUN — digest preview:\n')
  console.log(digest.slice(0, 1000))
  console.log('\n...(truncated)')
  process.exit(0)
}

// Write to KB
const kbPath = path.join(KB_ROOT, 'wiki', 'agents', 'leads', 'sofie', 'weekly-digest.md')
fs.writeFileSync(kbPath, digest, 'utf8')
console.log(`✅ KB digest: wiki/agents/leads/sofie/weekly-digest.md`)

// Write to Obsidian Tasks
const obsidianPath = path.join(OBSIDIAN_VAULT, '07 - Tasks', `KB Digest ${dateStr}.md`)
try {
  fs.mkdirSync(path.dirname(obsidianPath), { recursive: true })
  fs.writeFileSync(obsidianPath, digest, 'utf8')
  console.log(`✅ Obsidian digest: 07 - Tasks/KB Digest ${dateStr}.md`)
} catch (err) {
  console.warn(`⚠️  Could not write to Obsidian (${err.message}) — KB copy saved`)
}

console.log(`\n📊 Summary:`)
console.log(`   Discoveries pending: ${discoveries.length}`)
console.log(`   Escalations pending: ${escalations.length}`)
console.log(`   Recent wiki pages:   ${recent.length}`)
