#!/usr/bin/env node
/**
 * watch-call-transcripts.mjs
 *
 * Watches a transcription-tool output folder (Fathom / Fireflies / Otter / Zoom)
 * for new call transcripts and stages them into raw/transcripts/ with
 * call-transcript frontmatter so INGEST picks them up on the next pass.
 *
 * Default watched folder:
 *   ~/Google Drive/My Drive/Fathom
 * Override with env var:
 *   FATHOM_TRANSCRIPTS_DIR=/path/to/folder node scripts/watch-call-transcripts.mjs
 *
 * Usage:
 *   node scripts/watch-call-transcripts.mjs           # poll loop
 *   node scripts/watch-call-transcripts.mjs --once    # scan once and exit
 *
 * Dedupe: already-ingested files tracked in raw/.call-transcript-ingest-log.json
 * by {relativePath, mtime}. Idempotent — rerunning is safe.
 *
 * This script ONLY stages. The LLM-side INGEST (see wiki/transcript-ingest.md)
 * is what extracts summary/actions/decisions into the wiki.
 */

import fs from 'fs'
import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const KB_ROOT = path.resolve(__dirname, '..')

const WATCH_DIR =
  process.env.FATHOM_TRANSCRIPTS_DIR ||
  path.join(os.homedir(), 'Google Drive', 'My Drive', 'Fathom')

const TRANSCRIPTS_DIR = path.join(KB_ROOT, 'raw', 'transcripts')
const LOG_FILE = path.join(KB_ROOT, 'raw', '.call-transcript-ingest-log.json')
const POLL_INTERVAL_MS = 60_000 // 1 minute

const SUPPORTED_EXT = new Set(['.md', '.txt', '.vtt', '.srt'])

// ─── Ingest log ──────────────────────────────────────────────────────────────

function loadLog() {
  try {
    return JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'))
  } catch {
    return { ingested: {} }
  }
}

function saveLog(log) {
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2), 'utf8')
}

// ─── Stage a single transcript ───────────────────────────────────────────────

function stripVttTimestamps(body) {
  // Strip WEBVTT header and timestamp lines, keep spoken text.
  return body
    .split('\n')
    .filter((line) => {
      const t = line.trim()
      if (!t) return false
      if (t === 'WEBVTT') return false
      if (/^\d+$/.test(t)) return false
      if (/-->/.test(t)) return false
      return true
    })
    .join('\n')
}

function stageFile(srcPath, log) {
  const rel = path.relative(WATCH_DIR, srcPath)
  const stat = fs.statSync(srcPath)
  const mtime = stat.mtimeMs

  if (log.ingested[rel] && log.ingested[rel].mtime === mtime) return false

  const ext = path.extname(srcPath).toLowerCase()
  if (!SUPPORTED_EXT.has(ext)) return false

  let content = fs.readFileSync(srcPath, 'utf8')
  if (!content.trim()) return false

  if (ext === '.vtt' || ext === '.srt') content = stripVttTimestamps(content)

  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10)
  const baseName = path.basename(srcPath, ext)
  const slug = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  const outFile = `call-${dateStr}-${slug}.md`
  const outPath = path.join(TRANSCRIPTS_DIR, outFile)

  const frontmatter = `---
title: "${baseName.replace(/"/g, "'")}"
type: call-transcript
source: ${path.basename(WATCH_DIR)}
source_path: "${rel}"
ingest_status: pending
date: ${dateStr}
ingested_at: ${now.toISOString()}
tags: [call-transcript, auto-staged]
---

`

  fs.mkdirSync(TRANSCRIPTS_DIR, { recursive: true })
  fs.writeFileSync(outPath, frontmatter + content.trim() + '\n', 'utf8')

  log.ingested[rel] = {
    mtime,
    outFile,
    stagedAt: now.toISOString(),
  }
  console.log(`  ✅ ${rel} → raw/transcripts/${outFile}`)
  return true
}

// ─── Scan ────────────────────────────────────────────────────────────────────

function walk(dir) {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else if (entry.isFile()) out.push(full)
  }
  return out
}

function scan() {
  if (!fs.existsSync(WATCH_DIR)) {
    console.warn(`⚠️  Watch dir does not exist: ${WATCH_DIR}`)
    console.warn(`   Set FATHOM_TRANSCRIPTS_DIR or create the folder.`)
    return 0
  }

  const log = loadLog()
  let count = 0

  for (const file of walk(WATCH_DIR)) {
    try {
      if (stageFile(file, log)) count++
    } catch (err) {
      console.warn(`  ⚠️  Failed to stage ${path.basename(file)}: ${err.message}`)
    }
  }

  if (count > 0) {
    saveLog(log)
    console.log(
      `\n📥 Staged ${count} new call transcript(s) → raw/transcripts/`
    )
    console.log(`   Next: run INGEST per wiki/transcript-ingest.md\n`)
  }

  return count
}

// ─── Entry ───────────────────────────────────────────────────────────────────

const once = process.argv.includes('--once')

console.log('📞 watch-call-transcripts starting...')
console.log(`   Watching: ${WATCH_DIR}`)
console.log(`   Output:   raw/transcripts/`)

const n = scan()
if (n === 0) console.log('   (no new transcripts)')

if (!once) {
  console.log(`\n⏱️  Polling every ${POLL_INTERVAL_MS / 1000}s — Ctrl+C to stop\n`)
  setInterval(scan, POLL_INTERVAL_MS)
}
