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
 *   --source-id <id>    Optional but strongly preferred. Stable upstream ID
 *                       (Apple Notes x-coredata:// id, Slack channel+ts, etc).
 *                       When present it alone defines identity — see below.
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
 * Idempotency: if a file with the same canonical sha256 already exists in
 * raw/clippings/ OR has been routed to raw/<sub>/ (per raw/.ingest-hashes.json),
 * this is a no-op. Identity is computed one of two ways:
 *
 *   with --source-id:  sha256(source + sourceId)          [preferred]
 *   without:           sha256(source + author + ts + normalized text)
 *
 * The content-derived fallback is fragile against re-pulls of the *same*
 * upstream item: `raw/clippings/` accumulated 10 copies of one Apple Note
 * because (a) the Notes MCP returns a bare local-time string with no zone, so
 * the same note hashed under both 08:40 and 15:40 depending on whether the
 * caller resolved it as local or UTC, and (b) HTML-to-text conversion drifted
 * the body whitespace between pulls. A stable upstream ID is immune to both,
 * so callers should always pass --source-id when the source exposes one.
 *
 * Exit codes: 0 on success or duplicate-skip; non-zero on bad input.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath, pathToFileURL } from 'node:url'

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
      case '--source-id': out.sourceId = next; i++; break
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

/** Normalize a timestamp string to ISO-UTC; pass through on parse failure
 *  so the hash stays defined for unparseable inputs. */
export function normalizeTs(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return Number.isNaN(d.getTime()) ? String(ts) : d.toISOString()
}

/** Normalize body text for hashing: NFC, drop a leading `<type>:` prefix line
 *  if it matches the declared --type, then trim. The leading-prefix strip
 *  mirrors the type-hint detection that /foundry-capture-notes does upstream;
 *  it makes the hash invariant to whether the caller stripped the prefix or
 *  left it in the body. */
export function normalizeTextForHash(text, { type } = {}) {
  let t = (text ?? '').normalize('NFC')
  if (type) {
    const re = new RegExp(`^\\s*${type}\\s*:\\s*`, 'i')
    const firstNl = t.indexOf('\n')
    const firstLine = firstNl === -1 ? t : t.slice(0, firstNl)
    if (re.test(firstLine)) {
      const stripped = firstLine.replace(re, '')
      t = firstNl === -1 ? stripped : stripped + t.slice(firstNl)
    }
  }
  // Whitespace canonicalization. HTML-to-text conversion upstream is not
  // stable across pulls of the same item: CRLF vs LF, non-breaking spaces from
  // Apple Notes markup, zero-width joiners, trailing spaces on wrapped lines,
  // and a varying number of blank lines between paragraphs all drifted the
  // hash without changing a single visible character. Collapse them so the
  // content-derived fallback matches on content, not on markup accidents.
  return t
    .replace(/[​-‍﻿]/g, '')  // zero-width space/joiner/BOM
    .replace(/ /g, ' ')                 // non-breaking space → space
    .replace(/\r\n?/g, '\n')                 // CRLF / CR → LF
    .replace(/[ \t]+/g, ' ')                 // runs of spaces/tabs → one space
    .replace(/ *\n */g, '\n')                // strip padding around newlines
    .replace(/\n{2,}/g, '\n\n')              // collapse blank-line runs
    .trim()
}

/** Stable canonical hash over the fields that define identity.
 *
 *  When `sourceId` is supplied it is the ONLY identity input besides `source`:
 *  a stable upstream ID already uniquely names the item, so folding in ts or
 *  body text can only introduce false negatives when the upstream re-serializes
 *  either one. Two items cannot legitimately share a (source, sourceId) pair,
 *  so there is no false-positive risk in return. */
export function canonicalHash({ source, sourceId = '', author = '', ts = '', text, type }) {
  const canon = sourceId
    ? `${source}\0id\0${String(sourceId).trim()}`
    : `${source}\0${author}\0${normalizeTs(ts)}\0${normalizeTextForHash(text, { type })}`
  return crypto.createHash('sha256').update(canon).digest('hex')
}

export function buildFilename({ ts, source, slug, hash }) {
  // normalizeTs deliberately passes an unparseable --ts through verbatim so the
  // canonical hash stays defined (see its docstring, and the yamlScalar comment
  // below which states "--ts is not safe by construction"). That value reaches
  // here, and `new Date(<unparseable>).toISOString()` throws RangeError — which
  // aborted the entire capture in buildBody before a single byte was written,
  // reporting only "error: Invalid time value" with no mention of --ts. The raw
  // value survives in `captured_at`, so the filename degrades to a sentinel
  // rather than taking the clipping down with it. Distinct from the absent-ts
  // sentinel: "no timestamp given" and "timestamp given but unreadable" are
  // different facts and the filename is the only place either is visible.
  let tsPart = 'now'
  if (ts) {
    const d = new Date(ts)
    tsPart = Number.isNaN(d.getTime())
      ? 'undated'
      : d.toISOString().replace(/[:.]/g, '-').slice(0, 19)
  }
  // `source` was interpolated raw, and the filename is path.join()ed onto
  // raw/clippings/ — so a `--source` containing `../` escaped the directory.
  // Reproduced: `--source ../../../../../probe/pwned` wrote the clipping
  // outside the repository while writeClipping still returned
  // `{ written: true, path: 'raw/clippings/…' }` — the return value named a
  // location the file was not in. slugify strips every separator and dot run,
  // and leaves the real sources (slack, apple-notes, gmail) byte-identical.
  // Only the *filename* is constrained; frontmatter `source` keeps the
  // caller's exact value, since that is the field provenance is read from and
  // yamlScalar already makes it safe there.
  return `${tsPart}__${slugify(source, 40)}__${slug}__${hash.slice(0, 8)}.md`
}

// Plain-safe YAML scalars: start alphanumeric, no whitespace (so no ': '
// sequence can form), no quote/comma/bracket/brace. Everything matching this
// is emitted bare, exactly as before.
const PLAIN_SAFE = /^[A-Za-z0-9][A-Za-z0-9._@+/:-]*$/

/** Emit a value as a one-line YAML scalar, quoting only when it needs it.
 *  title and author were already JSON-escaped; source, type_hint, captured_at
 *  and tags were interpolated raw. A --source, --type, --ts or --extra-tag
 *  carrying ': ', a quote, a ']' or a newline therefore broke the clipping's
 *  frontmatter — or injected sibling keys that the /foundry-ingest routing
 *  layer then read as real metadata. (--ts is not safe by construction:
 *  normalizeTs passes unparseable input straight through.) Same escaping rule
 *  as the ingest-youtube and sofie-ingest frontmatter fixes. */
export function yamlScalar(value) {
  const s = String(value)
  return PLAIN_SAFE.test(s) ? s : JSON.stringify(s.replace(/[\r\n]+/g, ' '))
}

export function buildFrontmatter({ source, sourceId, author, ts, title, type, extraTags, hash }) {
  const lines = ['---']
  lines.push(`title: ${JSON.stringify(title)}`)
  lines.push(`source: ${yamlScalar(source)}`)
  if (sourceId) lines.push(`source_id: ${yamlScalar(sourceId)}`)
  if (author) lines.push(`author: ${JSON.stringify(author)}`)
  lines.push(`captured_at: ${yamlScalar(ts)}`)
  if (type) lines.push(`type_hint: ${yamlScalar(type)}`)
  const tags = ['quick-capture', `source-${source}`, ...extraTags]
  lines.push(`tags: [${tags.map(yamlScalar).join(', ')}]`)
  lines.push(`canonical_hash: ${yamlScalar(hash)}`)
  lines.push('---')
  return lines.join('\n')
}

export function buildBody(input) {
  // Normalize ts ONCE so filename and hash both derive from the same canonical
  // value. Without this, a Z-suffixed `--ts` and a local-time `--ts` of the
  // same instant produced different hashes AND different filenames — the
  // dedup-by-filename-suffix check then missed real duplicates.
  const ts = normalizeTs(input.ts || new Date().toISOString())
  const text = (input.text ?? '').trim()
  const title = input.title || deriveTitle(text)
  const hash = canonicalHash({ source: input.source, sourceId: input.sourceId, author: input.author, ts, text, type: input.type })
  const slug = slugify(title)
  const fm = buildFrontmatter({
    source: input.source,
    sourceId: input.sourceId,
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
  // The filename is assembled from caller-supplied parts (source, title-derived
  // slug, ts). Each has its own sanitiser, but the invariant that actually
  // matters is "one path segment, inside CLIPPINGS" — state it once, here,
  // rather than trusting every component's sanitiser to stay correct. Without
  // it a traversing component wrote outside the repo *and* this function still
  // returned a `raw/clippings/…` path, so the caller could not tell.
  const dest = path.join(CLIPPINGS, built.filename)
  if (dest !== path.join(CLIPPINGS, path.basename(built.filename))) {
    throw new Error(`refusing to write outside raw/clippings/: ${built.filename}`)
  }
  await fs.mkdir(CLIPPINGS, { recursive: true })
  await fs.writeFile(dest, built.body)
  return { written: true, hash: built.hash, filename: built.filename, path: `raw/clippings/${built.filename}` }
}

// ─── CLI entry ───────────────────────────────────────────────────────────────

// Compare resolved file URLs. The old check had two holes:
//   - `file://${process.argv[1]}` is not a correctly encoded file URL (spaces,
//     '#', non-ASCII), so a valid direct invocation could miss.
//   - the endsWith fallback used path.basename(process.argv[1] || ''), and
//     ''.endsWith('') is true — so with no argv[1] at all (node -e, --eval,
//     the REPL, some loader/worker contexts) isMain was true. Merely
//     *importing* this module then ran the CLI with empty args, printed
//     "error: --source is required", and called process.exit(1) on its host.
const isMain = (() => {
  try {
    const entry = process.argv[1]
    if (!entry) return false
    return import.meta.url === pathToFileURL(entry).href
  } catch { return false }
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
