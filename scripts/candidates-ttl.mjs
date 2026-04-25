#!/usr/bin/env node
/**
 * candidates-ttl.mjs
 *
 * Tracks single-source theme age in wiki/candidates.md via a sidecar
 * tracker (wiki/_meta/candidates-tracker.json). Themes that haven't
 * graduated within 90 days are archived to wiki/archive/candidates-expired/
 * with provenance.
 *
 * The visible candidates.md stays human-readable (no date columns).
 * The sidecar tracks first_seen + last_seen per theme.
 *
 * Modes:
 *   (default) Print what WOULD expire. No changes.
 *   --apply   Archive expired themes, rewrite candidates.md, update tracker.
 *
 * Run on a cron, after every /foundry-compile, or manually.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const KB_ROOT = path.resolve(__dirname, '..')
const TTL_DAYS = parseInt(process.env.KB_CANDIDATES_TTL_DAYS || '90', 10)

const CANDIDATES = path.join(KB_ROOT, 'wiki/candidates.md')
const TRACKER = path.join(KB_ROOT, 'wiki/_meta/candidates-tracker.json')
const ARCHIVE_DIR = path.join(KB_ROOT, 'wiki/archive/candidates-expired')

const apply = process.argv.includes('--apply')

if (!fs.existsSync(CANDIDATES)) {
  console.log('No wiki/candidates.md — nothing to do.')
  process.exit(0)
}

const text = fs.readFileSync(CANDIDATES, 'utf8')
const fmEnd = text.indexOf('\n---', 4)
const body = fmEnd > 0 ? text.slice(fmEnd + 4) : text

// Parse: lines like "- theme-slug  (1 source: summary-name)"
const themes = []
for (const line of body.split('\n')) {
  const m = line.match(/^-\s+([a-z0-9][a-z0-9-]*)\s*\((\d+)\s+sources?:\s*(.+)\)/)
  if (!m) continue
  themes.push({ name: m[1], count: parseInt(m[2], 10), sources: m[3].trim() })
}

// Load / init tracker
let tracker = {}
if (fs.existsSync(TRACKER)) {
  try { tracker = JSON.parse(fs.readFileSync(TRACKER, 'utf8')) } catch { tracker = {} }
}
const today = new Date().toISOString().slice(0, 10)
const cutoff = new Date(Date.now() - TTL_DAYS * 86400000).toISOString().slice(0, 10)

const themeNames = new Set(themes.map(t => t.name))
const expired = []
const kept = []

for (const t of themes) {
  if (!tracker[t.name]) tracker[t.name] = { first_seen: today }
  tracker[t.name].last_seen = today
  tracker[t.name].count = t.count
  tracker[t.name].sources = t.sources

  if (tracker[t.name].first_seen < cutoff) {
    expired.push({ name: t.name, ...tracker[t.name] })
  } else {
    kept.push(t)
  }
}

// Drop tracker entries no longer in candidates.md (graduated or pruned)
for (const k of Object.keys(tracker)) {
  if (!themeNames.has(k)) delete tracker[k]
}

console.log(`Candidates: ${themes.length} total · TTL ${TTL_DAYS}d · cutoff ${cutoff}`)
console.log(`Expired (>${TTL_DAYS}d unfilled second source): ${expired.length}`)
for (const e of expired) console.log(`  - ${e.name}  (first_seen ${e.first_seen})`)
if (kept.length > 0 && !apply) console.log(`Kept: ${kept.length}`)

if (!apply) {
  console.log(`\n(dry run; pass --apply to archive expired and rewrite candidates.md)`)
  process.exit(0)
}

// Apply: archive each expired theme + rewrite candidates.md + update tracker
fs.mkdirSync(ARCHIVE_DIR, { recursive: true })
for (const e of expired) {
  const archivePath = path.join(ARCHIVE_DIR, `${e.name}.md`)
  const content = [
    '---',
    `title: "Expired candidate: ${e.name}"`,
    'type: archive',
    `archived: ${today}`,
    `first_seen: ${e.first_seen}`,
    `last_seen: ${e.last_seen}`,
    `ttl_days: ${TTL_DAYS}`,
    `final_sources: "${e.sources || ''}"`,
    '---',
    '',
    `# Expired candidate — ${e.name}`,
    '',
    `Held in candidates from ${e.first_seen} to ${e.last_seen}.`,
    `Did not reach 2-source threshold within TTL (${TTL_DAYS}d).`,
    '',
  ].join('\n')
  fs.writeFileSync(archivePath, content)
  delete tracker[e.name]
}

// Rewrite candidates.md sans expired
const fmEndIdx = text.indexOf('\n---', 4)
const fmBlock = fmEndIdx > 0 ? text.slice(0, fmEndIdx + 4) : '---\ntitle: Compile Candidates\ntype: meta\n---'
const updatedFm = fmBlock.replace(/updated:\s*[\d-]+/, `updated: ${today}`)
const newBody = body.split('\n').filter(line => {
  const m = line.match(/^-\s+([a-z0-9][a-z0-9-]*)\s*\(/)
  return !m || !expired.some(e => e.name === m[1])
}).join('\n')
fs.writeFileSync(CANDIDATES, updatedFm + '\n' + newBody.replace(/^\n+/, '\n'))

fs.writeFileSync(TRACKER, JSON.stringify(tracker, null, 2) + '\n')

console.log(`\n✓ Archived ${expired.length} → wiki/archive/candidates-expired/`)
console.log(`✓ Updated tracker (${Object.keys(tracker).length} active themes)`)
