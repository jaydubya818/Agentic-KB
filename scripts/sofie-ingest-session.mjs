#!/usr/bin/env node
/**
 * sofie-ingest-session.mjs
 *
 * Ingest a Sofie Chief-of-Staff session into Agentic-KB's raw/qa/ directory.
 * After running, trigger `kb compile` to fold the Q&A into the wiki.
 *
 * Usage:
 *   node scripts/sofie-ingest-session.mjs --title "Session title" --content "..." [--verified]
 *   node scripts/sofie-ingest-session.mjs --file /path/to/session.md [--verified]
 *   node scripts/sofie-ingest-session.mjs --obsidian-session "Sessions/2026-04-10.md" [--verified]
 *
 * Options:
 *   --title        Title of the Q&A or session summary
 *   --content      Raw text content (wrap in quotes)
 *   --file         Path to a markdown file to ingest
 *   --obsidian-session  Relative path within the Obsidian vault
 *   --verified     Mark as verified (gets ×1.25 ranking boost in KB search)
 *   --tags         Comma-separated tags (e.g. "agentic,strategy,decisions")
 *   --dry-run      Print what would be written without writing
 */

import fs from 'fs'
import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const KB_ROOT = path.resolve(__dirname, '..')
const OBSIDIAN_VAULT = process.env.OBSIDIAN_VAULT_ROOT || path.join(os.homedir(), 'Documents', 'Obsidian Vault')
const QA_DIR = path.join(KB_ROOT, 'raw', 'qa')

// ─── Parse args ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const get = (flag) => {
  const idx = args.indexOf(flag)
  return idx !== -1 ? args[idx + 1] : null
}
const has = (flag) => args.includes(flag)

const title = get('--title')
const contentArg = get('--content')
const filePath = get('--file')
const obsidianSession = get('--obsidian-session')
const verified = has('--verified')
const tagsArg = get('--tags')
const dryRun = has('--dry-run')

const tags = tagsArg
  ? tagsArg.split(',').map(t => t.trim()).filter(Boolean)
  : ['sofie', 'chief-of-staff', 'session']

// ─── Get content ─────────────────────────────────────────────────────────────

let content = ''
let sourceTitle = title || 'Sofie Session'
let sourcePath = null

if (obsidianSession) {
  const obsPath = path.join(OBSIDIAN_VAULT, obsidianSession)
  if (!fs.existsSync(obsPath)) {
    console.error(`❌ Obsidian file not found: ${obsPath}`)
    process.exit(1)
  }
  content = fs.readFileSync(obsPath, 'utf8')
  sourcePath = obsPath
  sourceTitle = title || path.basename(obsidianSession, '.md')
  console.log(`📖 Reading from Obsidian: ${obsPath}`)
} else if (filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`)
    process.exit(1)
  }
  content = fs.readFileSync(filePath, 'utf8')
  sourcePath = filePath
  sourceTitle = title || path.basename(filePath, '.md')
  console.log(`📖 Reading from file: ${filePath}`)
} else if (contentArg) {
  content = contentArg
} else {
  console.error('❌ Provide --content, --file, or --obsidian-session')
  process.exit(1)
}

if (!content.trim()) {
  console.error('❌ Content is empty')
  process.exit(1)
}

// ─── Build slug ──────────────────────────────────────────────────────────────

const now = new Date()
const dateStr = now.toISOString().slice(0, 10)
const slug = `sofie-session-${dateStr}-${sourceTitle
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')
  .slice(0, 40)}`

const outPath = path.join(QA_DIR, `${slug}.md`)

// ─── Build frontmatter ───────────────────────────────────────────────────────

const wordCount = content.split(/\s+/).filter(Boolean).length
const frontmatter = `---
title: "${sourceTitle}"
type: qa
source: sofie-chief-of-staff
verified: ${verified}
date: ${dateStr}
ingested_at: ${now.toISOString()}
tags: [${tags.join(', ')}]
word_count: ${wordCount}
${sourcePath ? `source_path: "${sourcePath}"` : ''}
---

`

const fullContent = frontmatter + content.trim() + '\n'

// ─── Write ───────────────────────────────────────────────────────────────────

if (dryRun) {
  console.log('\n📋 DRY RUN — would write:')
  console.log(`  Path: ${outPath}`)
  console.log(`  Slug: ${slug}`)
  console.log(`  Verified: ${verified}`)
  console.log(`  Tags: ${tags.join(', ')}`)
  console.log(`  Words: ${wordCount}`)
  console.log('\n--- Content preview (first 300 chars) ---')
  console.log(fullContent.slice(0, 300))
  process.exit(0)
}

fs.mkdirSync(QA_DIR, { recursive: true })
fs.writeFileSync(outPath, fullContent, 'utf8')

console.log(`\n✅ Ingested to raw/qa/${slug}.md`)
console.log(`   Words: ${wordCount} | Verified: ${verified}`)
console.log(`\n   Next: run "node cli/kb.js compile" or "kb compile" to fold into wiki`)
