#!/usr/bin/env node
/**
 * sofie-watch-obsidian.mjs
 *
 * Watches the Obsidian vault's meeting notes and session summaries for new files.
 * When a new .md file appears, auto-ingests it into Agentic-KB's raw/transcripts/.
 *
 * Usage:
 *   node scripts/sofie-watch-obsidian.mjs
 *   node scripts/sofie-watch-obsidian.mjs --once   (scan now, no watch loop)
 *
 * Watches:
 *   - Obsidian Vault/05 - Meetings/
 *   - Obsidian Vault/Sessions/        (if it exists — Sofie's Chief of Staff sessions)
 *   - Obsidian Vault/daily-notes/
 *   - Obsidian Vault/09 - Daily Notes/
 *
 * Already-ingested files are tracked in raw/.obsidian-ingest-log.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const KB_ROOT = path.resolve(__dirname, '..')
const OBSIDIAN_VAULT = '/Users/jaywest/Documents/Obsidian Vault'
const TRANSCRIPTS_DIR = path.join(KB_ROOT, 'raw', 'transcripts')
const LOG_FILE = path.join(KB_ROOT, 'raw', '.obsidian-ingest-log.json')
const POLL_INTERVAL_MS = 30_000 // check every 30s

const WATCH_DIRS = [
  '05 - Meetings',
  'Sessions',
  'daily-notes',
  '09 - Daily Notes',
].map(d => path.join(OBSIDIAN_VAULT, d))

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

// ─── Ingest a single file ────────────────────────────────────────────────────

function ingestFile(obsidianPath, log) {
  const rel = path.relative(OBSIDIAN_VAULT, obsidianPath)
  const stat = fs.statSync(obsidianPath)
  const mtime = stat.mtimeMs

  // Skip if already ingested at this mtime
  if (log.ingested[rel] && log.ingested[rel].mtime === mtime) return false

  const content = fs.readFileSync(obsidianPath, 'utf8')
  if (!content.trim()) return false

  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10)
  const baseName = path.basename(obsidianPath, '.md')
  const slug = baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)
  const outFile = `obsidian-${dateStr}-${slug}.md`
  const outPath = path.join(TRANSCRIPTS_DIR, outFile)

  // Detect type from path
  const isDaily = rel.includes('Daily Notes') || rel.includes('daily-notes')
  const isMeeting = rel.includes('Meetings') || rel.includes('meetings')
  const isSession = rel.includes('Sessions')
  const type = isSession ? 'sofie-session' : isMeeting ? 'meeting-note' : isDaily ? 'daily-note' : 'obsidian-note'

  const frontmatter = `---
title: "${baseName}"
type: ${type}
source: obsidian-vault
source_path: "${rel}"
verified: false
date: ${dateStr}
ingested_at: ${now.toISOString()}
tags: [sofie, obsidian, ${type}]
---

`

  fs.mkdirSync(TRANSCRIPTS_DIR, { recursive: true })
  fs.writeFileSync(outPath, frontmatter + content.trim() + '\n', 'utf8')

  log.ingested[rel] = { mtime, outFile, ingestedAt: now.toISOString() }
  console.log(`  ✅ ${rel} → raw/transcripts/${outFile}`)
  return true
}

// ─── Scan loop ───────────────────────────────────────────────────────────────

function scan() {
  const log = loadLog()
  let count = 0

  for (const dir of WATCH_DIRS) {
    if (!fs.existsSync(dir)) continue
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md') && !f.startsWith('.'))
    for (const file of files) {
      const fullPath = path.join(dir, file)
      try {
        if (ingestFile(fullPath, log)) count++
      } catch (err) {
        console.warn(`  ⚠️  Failed to ingest ${file}: ${err.message}`)
      }
    }
  }

  if (count > 0) {
    saveLog(log)
    console.log(`\n📥 Ingested ${count} new/updated Obsidian file(s) → raw/transcripts/`)
    console.log(`   Run "node cli/kb.js compile" to fold into wiki.\n`)
  }

  return count
}

// ─── Entry point ─────────────────────────────────────────────────────────────

const once = process.argv.includes('--once')

console.log('🔍 sofie-watch-obsidian starting...')
console.log(`   Vault: ${OBSIDIAN_VAULT}`)
console.log(`   Watching: ${WATCH_DIRS.filter(d => fs.existsSync(d)).map(d => path.relative(OBSIDIAN_VAULT, d)).join(', ')}`)
console.log(`   Output: raw/transcripts/\n`)

scan()

if (!once) {
  console.log(`⏱️  Polling every ${POLL_INTERVAL_MS / 1000}s — Ctrl+C to stop\n`)
  setInterval(scan, POLL_INTERVAL_MS)
}
