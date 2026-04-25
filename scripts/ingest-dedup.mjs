#!/usr/bin/env node
/**
 * Hash-based ingest dedup + routing for /foundry-ingest.
 *
 * Walks raw/clippings/, computes sha256 per file, skips files already in
 * raw/.ingest-hashes.json, routes the rest to the correct raw/<subdir>/
 * based on simple type detection (suffix, frontmatter, content sniff),
 * and shells out to `kb ingest-file` for each.
 *
 * Idempotent: re-running with no new files is a no-op.
 *
 * Flags:
 *   --inbox <dir>     Inbox dir (default: raw/clippings)
 *   --route           Move files to detected subdirs after hashing
 *   --dry-run         Print plan; don't move or shell out
 *   --no-ingest       Route only; skip the kb ingest-file call (useful for tests)
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const HASH_FILE = path.join(REPO, 'raw/.ingest-hashes.json')

const args = process.argv.slice(2)
function flag(name, fallback = false) { return args.includes(name) ? true : fallback }
function arg(name, fallback = null) { const i = args.indexOf(name); return i >= 0 && args[i + 1] ? args[i + 1] : fallback }

const INBOX = path.resolve(REPO, arg('--inbox', 'raw/clippings'))
const DRY = flag('--dry-run')
const ROUTE = flag('--route')
const NO_INGEST = flag('--no-ingest')

/** sha256 of a file's bytes. */
async function hashFile(p) {
  const buf = await fs.readFile(p)
  return crypto.createHash('sha256').update(buf).digest('hex')
}

async function loadHashes() {
  try { return JSON.parse(await fs.readFile(HASH_FILE, 'utf8')) }
  catch (e) { if (e.code === 'ENOENT') return {}; throw e }
}

async function saveHashes(map) {
  await fs.mkdir(path.dirname(HASH_FILE), { recursive: true })
  await fs.writeFile(HASH_FILE, JSON.stringify(map, null, 2) + '\n')
}

/** Cheap content-aware type detection — returns one of the raw/ subdirs. */
async function detectType(filename, fullPath) {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.pdf')) return 'papers'
  if (/(transcript|granola|otter)/.test(lower)) return 'transcripts'
  if (/(youtube|youtu\.be|\.srt|\.vtt)/.test(lower)) return 'transcripts'
  if (/(twitter|x\.com|thread)/.test(lower)) return 'conversations'
  if (/(spec|api|reference|docs?)/.test(lower)) return 'framework-docs'
  if (lower.endsWith('.md') || lower.endsWith('.txt') || lower.endsWith('.html')) {
    try {
      const head = (await fs.readFile(fullPath, 'utf8')).slice(0, 500).toLowerCase()
      if (head.includes('type: meeting-note') || head.includes('granola')) return 'transcripts'
      if (head.includes('type: paper') || head.includes('arxiv')) return 'papers'
    } catch { /* ignore */ }
    return 'articles'
  }
  return 'articles'
}

async function listInbox() {
  try {
    return (await fs.readdir(INBOX, { withFileTypes: true }))
      .filter((d) => d.isFile() && !d.name.startsWith('.'))
      .map((d) => path.join(INBOX, d.name))
  } catch (e) {
    if (e.code === 'ENOENT') return []
    throw e
  }
}

async function ensureRawSubdir(sub) {
  const dir = path.join(REPO, 'raw', sub)
  await fs.mkdir(dir, { recursive: true })
  return dir
}

async function main() {
  const files = await listInbox()
  if (files.length === 0) {
    console.log('Inbox is empty.')
    return 0
  }
  const hashes = await loadHashes()
  const ingested = []
  const skipped = []
  for (const file of files) {
    const name = path.basename(file)
    const hash = await hashFile(file)
    if (hashes[hash]) { skipped.push({ name, prev: hashes[hash].path }); continue }
    const sub = await detectType(name, file)
    const target = path.join(await ensureRawSubdir(sub), name)
    if (DRY) { ingested.push({ name, sub, target, hash }); continue }
    if (ROUTE) await fs.rename(file, target)
    hashes[hash] = { path: path.relative(REPO, target), at: new Date().toISOString() }
    ingested.push({ name, sub, target, hash })
    if (!NO_INGEST && ROUTE) {
      const r = spawnSync('node', ['cli/kb.js', 'ingest-file', target], { cwd: REPO, stdio: 'inherit' })
      if (r.status !== 0) console.warn(`(kb ingest-file failed for ${name}, continuing)`)
    }
  }
  if (!DRY) await saveHashes(hashes)

  console.log(`Ingested ${ingested.length}:`)
  for (const i of ingested) console.log(`  - ${i.sub.padEnd(14)}  ${i.name}  →  raw/${i.sub}/`)
  if (skipped.length) {
    console.log(`\nSkipped ${skipped.length} (already ingested via hash match):`)
    for (const s of skipped) console.log(`  - ${s.name}  (prev: ${s.prev})`)
  }
  return 0
}

main().then((c) => process.exit(c)).catch((e) => { console.error(e); process.exit(1) })
