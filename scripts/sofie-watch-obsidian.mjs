#!/usr/bin/env node
/**
 * sofie-watch-obsidian.mjs  v2.0
 *
 * Watches Obsidian vault for new/updated notes and stages them into Agentic-KB.
 *
 * Usage:
 *   node scripts/sofie-watch-obsidian.mjs            (real-time watch via chokidar)
 *   node scripts/sofie-watch-obsidian.mjs --once     (scan new files since last run, exit)
 *   node scripts/sofie-watch-obsidian.mjs --full     (scan ALL files regardless of mtime, exit)
 *
 * Watches (recursively):
 *   - Obsidian Vault/05 - Meetings/
 *   - Obsidian Vault/Sessions/        (Sofie Chief of Staff sessions)
 *   - Obsidian Vault/daily-notes/
 *   - Obsidian Vault/09 - Daily Notes/
 *
 * Ingest log:  raw/.obsidian-ingest-log.json
 * Notification inbox: raw/.sofie-inbox.json  (multi-agent: Claude Code, Cursor, Hermes, Pi)
 *
 * Notification env vars (all optional):
 *   SOFIE_TELEGRAM_BOT_TOKEN  + SOFIE_TELEGRAM_CHAT_ID  → Telegram push (Pi)
 *   SOFIE_WEBHOOK_URL                                    → HTTP POST webhook
 *   OBSIDIAN_VAULT_ROOT                                  → override vault path
 */

import fs from 'fs'
import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const KB_ROOT = path.resolve(__dirname, '..')
const OBSIDIAN_VAULT = process.env.OBSIDIAN_VAULT_ROOT || path.join(os.homedir(), 'Documents', 'Obsidian Vault')
const TRANSCRIPTS_DIR = path.join(KB_ROOT, 'raw', 'transcripts')
const LOG_FILE = path.join(KB_ROOT, 'raw', '.obsidian-ingest-log.json')
const INBOX_FILE = path.join(KB_ROOT, 'raw', '.sofie-inbox.json')

const TELEGRAM_BOT_TOKEN = process.env.SOFIE_TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.SOFIE_TELEGRAM_CHAT_ID
const WEBHOOK_URL = process.env.SOFIE_WEBHOOK_URL

const WATCH_DIRS = [
  '05 - Meetings',
  'Sessions',
  'daily-notes',
  '09 - Daily Notes',
].map(d => path.join(OBSIDIAN_VAULT, d))

// ─── Ingest log ───────────────────────────────────────────────────────────────

function loadLog() {
  try {
    return JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'))
  } catch {
    return { ingested: {}, lastScanAt: null }
  }
}

function saveLog(log) {
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2), 'utf8')
}

// ─── Recursive dir walker ─────────────────────────────────────────────────────

function walkDir(dir) {
  const results = []
  if (!fs.existsSync(dir)) return results
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath)
    }
  }
  return results
}

// ─── Type detection ───────────────────────────────────────────────────────────

function detectType(rel) {
  if (rel.includes('Sessions')) return 'sofie-session'
  if (rel.includes('Meetings') || rel.includes('meetings')) return 'meeting-note'
  if (rel.includes('Daily Notes') || rel.includes('daily-notes')) return 'daily-note'
  return 'obsidian-note'
}

// ─── Ingest a single file ─────────────────────────────────────────────────────

function ingestFile(obsidianPath, log, { forceMtime = false } = {}) {
  const rel = path.relative(OBSIDIAN_VAULT, obsidianPath)
  const stat = fs.statSync(obsidianPath)
  const mtime = stat.mtimeMs

  // Skip if already ingested at this exact mtime (idempotent)
  if (!forceMtime && log.ingested[rel]?.mtime === mtime) return null

  const content = fs.readFileSync(obsidianPath, 'utf8')
  if (!content.trim()) return null

  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10)
  const baseName = path.basename(obsidianPath, '.md')
  const slug = baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)
  const outFile = `obsidian-${dateStr}-${slug}.md`
  const outPath = path.join(TRANSCRIPTS_DIR, outFile)

  const type = detectType(rel)

  // meeting-note and daily-note both get ingest_status: pending — routed differently by INGEST SOP
  const ingestStatusLine = (type === 'meeting-note' || type === 'daily-note')
    ? `ingest_status: pending\n`
    : ''

  const frontmatter = `---
title: "${baseName}"
type: ${type}
source: obsidian-vault
source_path: "${rel}"
verified: false
${ingestStatusLine}date: ${dateStr}
ingested_at: ${now.toISOString()}
tags: [sofie, obsidian, ${type}]
---

`

  fs.mkdirSync(TRANSCRIPTS_DIR, { recursive: true })
  fs.writeFileSync(outPath, frontmatter + content.trim() + '\n', 'utf8')

  log.ingested[rel] = { mtime, outFile, type, ingestedAt: now.toISOString() }
  console.log(`  [+] ${rel} → raw/transcripts/${outFile}  (${type})`)
  return { rel, outFile, type }
}

// ─── Auto-compile ─────────────────────────────────────────────────────────────

async function runCompile() {
  const kbCli = path.join(KB_ROOT, 'cli', 'kb.js')
  console.log('\n[sofie] Running kb compile...')
  try {
    const { stdout, stderr } = await execAsync(`node "${kbCli}" compile`, { cwd: KB_ROOT })
    if (stdout) console.log(stdout.trim())
    if (stderr) console.warn(stderr.trim())
    console.log('[sofie] Compile complete.')
  } catch (err) {
    console.warn(`[sofie] Compile failed: ${err.message}`)
  }
}

// ─── Notifications ────────────────────────────────────────────────────────────

function updateInbox(ingested) {
  let inbox = { pending: [] }
  try { inbox = JSON.parse(fs.readFileSync(INBOX_FILE, 'utf8')) } catch {}

  const meetingCount = ingested.filter(f => f.type === 'meeting-note').length
  const dailyCount = ingested.filter(f => f.type === 'daily-note').length
  const sessionCount = ingested.filter(f => f.type === 'sofie-session').length

  const parts = []
  if (meetingCount) parts.push(`${meetingCount} meeting note${meetingCount > 1 ? 's' : ''}`)
  if (dailyCount) parts.push(`${dailyCount} daily note${dailyCount > 1 ? 's' : ''}`)
  if (sessionCount) parts.push(`${sessionCount} session note${sessionCount > 1 ? 's' : ''}`)

  const summary = `${parts.join(', ')} ingested`
  const hasMeetings = meetingCount > 0

  inbox.pending.push({
    id: `sofie-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'ingest-complete',
    summary,
    files: ingested.map(f => f.outFile),
    action: hasMeetings ? 'run /foundry-ingest to process meeting notes' : null,
  })

  fs.writeFileSync(INBOX_FILE, JSON.stringify(inbox, null, 2), 'utf8')
  console.log(`\n[sofie] Inbox updated: ${summary}`)
}

async function sendTelegram(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    const body = JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'Markdown' })
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
    if (!res.ok) console.warn(`[sofie] Telegram send failed: ${res.status}`)
  } catch (err) {
    console.warn(`[sofie] Telegram error: ${err.message}`)
  }
}

async function sendWebhook(payload) {
  if (!WEBHOOK_URL) return
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) console.warn(`[sofie] Webhook failed: ${res.status}`)
  } catch (err) {
    console.warn(`[sofie] Webhook error: ${err.message}`)
  }
}

async function notify(ingested) {
  if (!ingested.length) return

  updateInbox(ingested)

  const meetingCount = ingested.filter(f => f.type === 'meeting-note').length
  const summary = `Sofie ingested ${ingested.length} file(s) — ${meetingCount} meeting note(s) ready. Run \`/foundry-ingest\` to process.`

  await Promise.all([
    sendTelegram(summary),
    sendWebhook({ source: 'sofie-watch', ingested, summary, timestamp: new Date().toISOString() }),
  ])
}

// ─── Scan ─────────────────────────────────────────────────────────────────────

async function scan({ sinceLastRun = false, full = false } = {}) {
  const log = loadLog()
  const cutoff = sinceLastRun && log.lastScanAt ? new Date(log.lastScanAt).getTime() : null
  const ingested = []

  for (const dir of WATCH_DIRS) {
    for (const fullPath of walkDir(dir)) {
      try {
        // mtime filter: skip files not modified since last run (--once mode)
        if (cutoff && !full) {
          const mtime = fs.statSync(fullPath).mtimeMs
          if (mtime < cutoff && log.ingested[path.relative(OBSIDIAN_VAULT, fullPath)]) continue
        }
        const result = ingestFile(fullPath, log, { forceMtime: full })
        if (result) ingested.push(result)
      } catch (err) {
        console.warn(`  [!] Failed to ingest ${path.basename(fullPath)}: ${err.message}`)
      }
    }
  }

  if (ingested.length > 0) {
    log.lastScanAt = new Date().toISOString()
    saveLog(log)
    console.log(`\n[sofie] Ingested ${ingested.length} file(s) → raw/transcripts/`)
    await notify(ingested)

    // Auto-compile if any meeting notes were ingested
    if (ingested.some(f => f.type === 'meeting-note')) {
      await runCompile()
    }
  } else if (!sinceLastRun) {
    console.log('[sofie] No new files.')
  }

  return ingested
}

// ─── Real-time watch via chokidar ─────────────────────────────────────────────

async function startWatch() {
  const { default: chokidar } = await import('chokidar')

  const existingDirs = WATCH_DIRS.filter(d => fs.existsSync(d))
  if (!existingDirs.length) {
    console.warn('[sofie] No watch dirs exist. Exiting.')
    process.exit(1)
  }

  const watcher = chokidar.watch(existingDirs, {
    ignored: /(^|[/\\])\../,    // ignore dotfiles
    persistent: true,
    ignoreInitial: true,         // don't fire for existing files on startup
    awaitWriteFinish: { stabilityThreshold: 1000, pollInterval: 200 },
    depth: 10,
  })

  console.log(`[sofie] Watching ${existingDirs.length} dir(s) for changes (chokidar)...\n`)

  async function handleFile(filePath) {
    if (!filePath.endsWith('.md')) return
    const log = loadLog()
    try {
      const result = ingestFile(filePath, log)
      if (result) {
        log.lastScanAt = new Date().toISOString()
        saveLog(log)
        await notify([result])
        if (result.type === 'meeting-note') await runCompile()
      }
    } catch (err) {
      console.warn(`  [!] ${path.basename(filePath)}: ${err.message}`)
    }
  }

  watcher.on('add', handleFile).on('change', handleFile)
  watcher.on('error', err => console.warn(`[sofie] Watcher error: ${err.message}`))
}

// ─── Entry point ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const once = args.includes('--once')
const full = args.includes('--full')

console.log('[sofie] sofie-watch-obsidian v2.0')
console.log(`        Vault: ${OBSIDIAN_VAULT}`)
console.log(`        Watching: ${WATCH_DIRS.map(d => path.relative(OBSIDIAN_VAULT, d)).join(', ')}`)
console.log(`        Output: raw/transcripts/`)
if (TELEGRAM_BOT_TOKEN) console.log('        Telegram: enabled')
if (WEBHOOK_URL) console.log(`        Webhook: ${WEBHOOK_URL}`)
console.log()

if (once || full) {
  await scan({ sinceLastRun: once && !full, full })
} else {
  // Do an initial incremental scan, then switch to real-time watch
  await scan({ sinceLastRun: true })
  await startWatch()
}
