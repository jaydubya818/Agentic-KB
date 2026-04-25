#!/usr/bin/env node
/**
 * clipping-write — write a single quick-capture item into raw/clippings/
 * with proper frontmatter. The /foundry-ingest gate will dedup via sha256
 * and route by type from there.
 *
 * Designed to be called repeatedly by an agent driving the Slack/Notes
 * capture flow: one invocation per message/note.
 *
 * Flags:
 *   --source <name>     Required. e.g. slack, apple-notes, gmail
 *   --text <text>       Required. The message body. Use --text-file for long.
 *   --text-file <path>  Read --text from a file (avoids shell quoting hell).
 *   --author <name>     Optional. Author/sender for provenance.
 *   --ts <iso>          Optional. ISO timestamp; defaults to now.
 *   --title <title>     Optional. Otherwise derived from first line of text.
 *   --type <hint>       Optional. Type hint for the routing layer
 *                       (one of: paper, transcript, thread, doc, note).
 *   --extra-tag <tag>   Optional, repeatable. Extra tags added to frontmatter.
 *   --dry-run           Print the would-be filename + body; don't write.
 *
 * Idempotency: if a file with the same canonical sha256 (source+author+ts+text)
 * already exists in raw/clippings/ OR has been routed to raw/<sub>/ (per
 * raw/.ingest-hashes.json), this is a no-op.
 *
 * Exit codes: 0 on success or duplicate-skip; non-zero on bad input.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const CLIPPINGS = path.join(REPO, 'raw/clippings')
const HASH_FILE = path.join(REPO, 'raw/.ingest-hashes.json')

// ─── arg parsing ─────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const out = { extraTags: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    const next = argv[i + 1]
    switch (a) {
      case '--source':    out.source = next; i++; break
      case '--text':      out.text = next; i++; break
      case '--text-file': out.textFile = next; i++; break
      case '--author':    out.author = next; i++; break
      case '--ts':        out.ts = next; i++; break
      case '--title':     out.title = next; i++; break
      case '--type':      out.type = next; i++; break
      case '--extra-tag': out.extraTags.push(next); i++; break
      case '--dry-run':   out.dryRun = true; break
      default:
        if (a.startsWith('--')) throw new Error(`unknown flag: ${a}`)
    }
  }
  return out
}

// ─── pure helpers (exported for tests) ───────────────────────────────────────

export function slugify(s, maxLen = 60) {
  return s.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLen) || 'untitled'
}

export function deriveTitle(text) {
  const firstLine = text.split('\n')[0].trim()
  return firstLine.length > 80 ? firstLine.slice(0, 77) + '…' : firstLine
}

/** Stable canonical hash over the fields that define identity. */
export function canonicalHash({ source, author = '', ts = '', text }) {
  const canon = `${source}\0${author}\0${ts}\0${text.trim()}`
  return crypto.createHash('sha256').update(canon).digest('hex')
}

export function buildFilename({ ts, source, slug, hash }) {
  const tsPart = ts ? new Date(ts).toISOString().replace(/[:.]/g, '-').slice(0, 19) : 'now'
  return `${tsPart}__${source}__${slug}__${hash.slice(0, 8)}.md`
}

export function buildFrontmatter({ source, author, ts, title, type, extraTags, hash }) {
  const lines = ['---']
  lines.push(`title: ${JSON.stringify(title)}`)
  lines.push(`source: ${source}`)
  if (author) lines.push(`author: ${JSON.stringify(author)}`)
  lines.push(`captured_at: ${ts}`)
  if (type) lines.push(`type_hint: ${type}`)
  const tags = ['quick-capture', `source-${source}`, ...extraTags]
  lines.push(`tags: [${tags.join(', ')}]`)
  lines.push(`canonical_hash: ${hash}`)
  lines.push('---')
  return lines.join('\n')
}

export function buildBody(input) {
  const ts = input.ts || new Date().toISOString()
  const text = (input.text ?? '').trim()
  const title = input.title || deriveTitle(text)
  const hash = canonicalHash({ source: input.source, author: input.author, ts, text })
  const slug = slugify(title)
  const fm = buildFrontmatter({
    source: input.source,
    author: input.author,
    ts,
    title,
    type: input.type,
    extraTags: input.extraTags || [],
    hash,
  })
  const filename = buildFilename({ ts, source: input.source, slug, hash })
  return { filename, body: `${fm}\n\n${text}\n`, hash }
}

// ─── runtime side-effects ────────────────────────────────────────────────────

async function loadIngestedHashes() {
  try { return JSON.parse(await fs.readFile(HASH_FILE, 'utf8')) }
  catch (e) { if (e.code === 'ENOENT') return {}; throw e }
}

async function listClippingHashes() {
  try {
    const files = await fs.readdir(CLIPPINGS)
    const out = new Set()
    for (const f of files) {
      if (!f.endsWith('.md')) continue
      const m = f.match(/__([0-9a-f]{8})\.md$/)
      if (m) out.add(m[1])
    }
    return out
  } catch (e) {
    if (e.code === 'ENOENT') return new Set()
    throw e
  }
}

export async function writeClipping(input) {
  if (!input.source) throw new Error('--source is required')
  if (input.text == null && !input.textFile) throw new Error('--text or --text-file required')
  if (input.textFile) input.text = await fs.readFile(input.textFile, 'utf8')

  const built = buildBody(input)
  // Dedup against currently-staged clippings (filename suffix carries the hash prefix).
  const clippingHashPrefixes = await listClippingHashes()
  if (clippingHashPrefixes.has(built.hash.slice(0, 8))) {
    return { skipped: true, reason: 'duplicate-in-clippings', hash: built.hash, filename: built.filename }
  }
  // Dedup against already-ingested raw/ files (the /foundry-ingest hash registry).
  const ingested = await loadIngestedHashes()
  if (ingested[built.hash]) {
    return { skipped: true, reason: 'duplicate-in-raw', hash: built.hash, prev: ingested[built.hash].path, filename: built.filename }
  }
  if (input.dryRun) {
    return { dryRun: true, hash: built.hash, filename: built.filename, body: built.body }
  }
  await fs.mkdir(CLIPPINGS, { recursive: true })
  await fs.writeFile(path.join(CLIPPINGS, built.filename), built.body)
  return { written: true, hash: built.hash, filename: built.filename, path: `raw/clippings/${built.filename}` }
}

// ─── CLI entry ───────────────────────────────────────────────────────────────

const isMain = (() => {
  try { return import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith(path.basename(process.argv[1] || '')) }
  catch { return false }
})()

if (isMain) {
  const args = parseArgs(process.argv.slice(2))
  writeClipping(args).then((r) => {
    if (r.skipped) console.log(`skip: ${r.filename}  (${r.reason})`)
    else if (r.dryRun) {
      console.log(`would write: raw/clippings/${r.filename}`)
      console.log('---')
      console.log(r.body)
    } else {
      console.log(`wrote: ${r.path}`)
    }
    process.exit(0)
  }).catch((e) => { console.error(`error: ${e.message}`); process.exit(1) })
}
