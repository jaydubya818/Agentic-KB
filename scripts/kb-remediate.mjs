#!/usr/bin/env node
// Safe, deterministic remediation. Dry-run by default.
//
//   node scripts/kb-remediate.mjs                 # print the plan
//   node scripts/kb-remediate.mjs --apply         # apply, print JSON summary
//   node scripts/kb-remediate.mjs --rollback f.json  # undo a prior --apply
//
// Only changes that need no interpretation are made automatically:
//   1. rebuild generated hubs (CI reports, escalations)
//   2. file curated page placements into MoCs (scripts/data/moc-placements.json)
//   3. repair a broken [[wikilink]] when exactly one page matches its name
// Anything needing judgment (duplicates, contradictions, missing project
// coverage, malformed front matter) is reported by kb-quality.mjs, never edited.
// It never touches `updated` or `last_verified`, and never edits generated files.
import fs from 'fs'
import path from 'path'
import { execFileSync } from 'child_process'
import { fileURLToPath } from 'url'
import { scanVault, brokenLinks } from './lib/kb-scan.mjs'
import { normalizeLinkTarget } from '../lib/wiki-lint.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(process.env.KB_REPO || path.join(here, '..'))
const wiki = path.join(root, 'wiki')
const args = process.argv.slice(2)
const apply = args.includes('--apply')
const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8' })

if (args.includes('--rollback')) {
  const rec = JSON.parse(fs.readFileSync(args[args.indexOf('--rollback') + 1], 'utf8'))
  for (const f of rec.modified) git('checkout', '--', f)
  for (const f of rec.created) fs.rmSync(path.join(root, f), { force: true })
  console.log(`rolled back ${rec.modified.length} modified, ${rec.created.length} created`)
  process.exit(0)
}

const dirty = new Set(git('status', '--porcelain').split('\n').filter(Boolean).map(l => l.slice(3)))
const modified = new Set(), created = new Set(), notes = []
const GENERATED = /(^|\/)(_meta\/|index\.md$|lint-report|repos\/[^/]+\/repo-docs\/|_private\/|archive\/|_quarantine\/)/

function write(rel, next) {
  const abs = path.join(wiki, rel)
  const repoRel = path.join('wiki', rel)
  const existed = fs.existsSync(abs)
  if (existed && dirty.has(repoRel)) { notes.push(`skip (uncommitted changes): ${repoRel}`); return false }
  if (existed && fs.readFileSync(abs, 'utf8') === next) return false
  if (apply) { fs.mkdirSync(path.dirname(abs), { recursive: true }); fs.writeFileSync(abs, next) }
  ;(existed ? modified : created).add(repoRel)
  return true
}

// 1. Hubs
let hubs = ''
try {
  hubs = execFileSync('node', [path.join(here, 'rebuild-orphan-hubs.mjs'), ...(apply ? [] : ['--check'])],
    { cwd: root, encoding: 'utf8', env: { ...process.env, KB_REPO: root } })
} catch (e) { hubs = String(e.stdout || '') }
for (const m of hubs.matchAll(/(?:wrote|out of date): (mocs\/\S+)/g)) {
  const f = path.join('wiki', m[1])
  ;(git('ls-files', '--', f).trim() ? modified : created).add(f)
}

// 2. Curated placements
const placements = JSON.parse(fs.readFileSync(path.join(here, 'data/moc-placements.json'), 'utf8'))
let placed = 0
for (const [moc, rows] of Object.entries(placements)) {
  if (moc.startsWith('_')) continue
  const rel = `${moc}.md`
  const abs = path.join(wiki, rel)
  if (!fs.existsSync(abs)) { notes.push(`missing MoC: ${rel}`); continue }
  let text = fs.readFileSync(abs, 'utf8')
  const add = []
  for (const [page, note] of rows) {
    if (!fs.existsSync(path.join(wiki, `${page}.md`))) { notes.push(`placement target missing: ${page}`); continue }
    const linked = new RegExp(`\\[\\[(?:wiki/)?${page.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\||\\]\\])`).test(text)
    if (!linked) add.push(`- [[${page}]] — ${note}`)
  }
  if (!add.length) continue
  const heading = '## Additional pages'
  text = text.includes(heading)
    ? text.replace(/\s*$/, '\n') + add.join('\n') + '\n'
    : text.replace(/\s*$/, '\n\n') + `${heading}\n\n` + add.join('\n') + '\n'
  if (write(rel, text)) placed += add.length
}

// 3. Unambiguous broken-wikilink repair
const { pages } = scanVault(root)
const byBase = new Map()
for (const p of pages) {
  const b = path.posix.basename(p.relPath, '.md').toLowerCase()
  if (!byBase.has(b)) byBase.set(b, [])
  byBase.get(b).push(p.relPath.replace(/\.md$/, ''))
}
const pending = new Map()
let repaired = 0
for (const { page, link } of brokenLinks(pages, root)) {
  if (GENERATED.test(page) || /\.md$/.test(link) || link.includes('](')) continue
  const base = path.posix.basename(normalizeLinkTarget(link)).toLowerCase().replace(/\s+/g, '-')
  const hits = byBase.get(base)
  if (!hits || hits.length !== 1) continue
  const [target] = hits
  const tail = link.slice(link.search(/[|#]/) >= 0 ? link.search(/[|#]/) : link.length)
  if (!pending.has(page)) pending.set(page, [])
  pending.get(page).push([`[[${link}]]`, `[[${target}${tail}]]`])
}
for (const [page, subs] of pending) {
  let text = fs.readFileSync(path.join(wiki, page), 'utf8')
  for (const [from, to] of subs) if (text.includes(from)) { text = text.split(from).join(to); repaired++ }
  write(page, text)
}

const summary = {
  apply, hubs: hubs.trim().split('\n').filter(Boolean), placed, repaired,
  modified: [...modified], created: [...created], notes,
}
console.log(JSON.stringify(summary, null, 2))
