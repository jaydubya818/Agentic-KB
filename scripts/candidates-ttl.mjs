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
const KB_ROOT = process.env.KB_ROOT
  ? path.resolve(process.env.KB_ROOT)
  : path.resolve(__dirname, '..')
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
//
// The slug class has to include `/`. compile-2source-gate.mjs writes each theme
// straight from a wikilink / key_concepts target, and those are routinely
// namespaced — `concepts/llm-wiki`, `patterns/pattern-fan-out-worker`. Without
// the slash the capture stopped at `concepts`, `\(` then had to match `/`, the
// line failed to match and was skipped. Every namespaced candidate was therefore
// invisible to this script: never tracked, never aged, never expired, and not
// counted in the "Candidates: N total" line — a clean-looking run that had
// silently exempted a whole class of candidates from the TTL it exists to apply.
//
// Both the parse below and the rewrite filter at the bottom must use this same
// class: if they disagree, a theme can expire and be archived while its line
// survives the rewrite, and it is resurrected on the next run.
const THEME_SLUG = '[a-z0-9][a-z0-9/-]*'

const themes = []
for (const line of body.split('\n')) {
  const m = line.match(new RegExp(`^-\\s+(${THEME_SLUG})\\s*\\((\\d+)\\s+sources?:\\s*(.+)\\)`))
  if (!m) continue
  themes.push({ name: m[1], count: parseInt(m[2], 10), sources: m[3].trim() })
}

// Load / init tracker.
//
// The tracker is keyed by theme name, and theme names come straight from
// wikilink / key_concepts targets — THEME_SLUG admits `constructor`, which is
// an inherited Object.prototype key. With a plain `{}` tracker that name is
// invisible to every check below: `!tracker['constructor']` is false (it
// resolves to the Object constructor, which is truthy), so the init branch
// never runs and `first_seen` is never recorded; `tracker[name].last_seen = …`
// then writes onto the global Object instead of the tracker; `first_seen`
// reads back `undefined`, and `undefined < cutoff` is false forever. The
// candidate is parsed and counted but never tracked, never aged and never
// expired — the same "silently exempt from the TTL it exists to apply"
// failure as the namespaced-slug bug above, by a different mechanism.
// A null-prototype dictionary removes the whole inherited-key class at once.
let tracker = Object.create(null)
if (fs.existsSync(TRACKER)) {
  try {
    const parsed = JSON.parse(fs.readFileSync(TRACKER, 'utf8'))
    // Own enumerable keys only, onto the null-prototype dict.
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) Object.assign(tracker, parsed)
  } catch { tracker = Object.create(null) }
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
// Atomic tmp+rename so a crash mid-write can't leave a truncated file.
function writeAtomic(target, content) {
  const tmp = `${target}.tmp-${process.pid}`
  fs.writeFileSync(tmp, content)
  fs.renameSync(tmp, target)
}
// Exclusive create with numeric suffixes: a theme that expires, reappears,
// and expires again must not overwrite its earlier archive record.
function writeUniqueArchive(name, content) {
  let target = path.join(ARCHIVE_DIR, `${name}.md`)
  // A namespaced theme (`concepts/llm-wiki`) archives into a matching
  // subdirectory. THEME_SLUG excludes `.`, so a name can never contain `..`
  // and this cannot escape ARCHIVE_DIR.
  fs.mkdirSync(path.dirname(target), { recursive: true })
  for (let i = 2; i < 1000; i++) {
    try {
      fs.writeFileSync(target, content, { encoding: 'utf8', flag: 'wx' })
      return target
    } catch (err) {
      if (err.code !== 'EEXIST') throw err
      target = path.join(ARCHIVE_DIR, `${name}-${i}.md`)
    }
  }
  throw new Error(`could not allocate a unique archive filename for ${name}.md`)
}
for (const e of expired) {
  const content = [
    '---',
    `title: "Expired candidate: ${e.name}"`,
    'type: archive',
    `archived: ${today}`,
    `first_seen: ${e.first_seen}`,
    `last_seen: ${e.last_seen}`,
    `ttl_days: ${TTL_DAYS}`,
    `final_sources: ${JSON.stringify(String(e.sources || ''))}`,
    '---',
    '',
    `# Expired candidate — ${e.name}`,
    '',
    `Held in candidates from ${e.first_seen} to ${e.last_seen}.`,
    `Did not reach 2-source threshold within TTL (${TTL_DAYS}d).`,
    '',
  ].join('\n')
  writeUniqueArchive(e.name, content)
  delete tracker[e.name]
}

// Rewrite candidates.md sans expired
const fmEndIdx = text.indexOf('\n---', 4)
const fmBlock = fmEndIdx > 0 ? text.slice(0, fmEndIdx + 4) : '---\ntitle: Compile Candidates\ntype: meta\n---'
const updatedFm = fmBlock.replace(/updated:\s*[\d-]+/, `updated: ${today}`)
const newBody = body.split('\n').filter(line => {
  const m = line.match(new RegExp(`^-\\s+(${THEME_SLUG})\\s*\\(`))
  return !m || !expired.some(e => e.name === m[1])
}).join('\n')
writeAtomic(CANDIDATES, updatedFm + '\n' + newBody.replace(/^\n+/, '\n'))

writeAtomic(TRACKER, JSON.stringify(tracker, null, 2) + '\n')

console.log(`\n✓ Archived ${expired.length} → wiki/archive/candidates-expired/`)
console.log(`✓ Updated tracker (${Object.keys(tracker).length} active themes)`)
