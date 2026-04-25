#!/usr/bin/env node
/**
 * /foundry-propose CLI — surfaces actionable proposals from compile-log,
 * candidates.md, and (eventually) wiki/log.md history.
 *
 * Reactive, not autonomous. Inspired by claude-code-hermit's proposal
 * loop, adapted to fit Foundry's strict gate philosophy: detect → propose
 * → user accepts manually. No auto-act, no auto-edit of wiki pages.
 *
 * Modes:
 *   --plan       Print proposals to stdout. Don't write proposals.md.
 *   --execute    Print AND append new proposals to wiki/_meta/proposals.md.
 *   --stuck-days N    Override the stuck-candidate threshold (default 30).
 *   --backlog N       Override the heavy-backlog threshold (default 50).
 *
 * Idempotent: re-runs dedupe against existing PROP-### entries by subject.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  parseCompileLog,
  parseCandidates,
  parseExistingProposals,
  runDetectors,
  dedupeProposals,
  formatProposal,
  proposalKey,
  DEFAULTS,
} from './lib/foundry-propose-core.mjs'

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const COMPILE_LOG = path.join(REPO, 'wiki/_meta/compile-log.md')
const CANDIDATES = path.join(REPO, 'wiki/candidates.md')
const PROPOSALS = path.join(REPO, 'wiki/_meta/proposals.md')

const argv = process.argv.slice(2)
function arg(name, fallback = null) {
  const i = argv.indexOf(name)
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback
}
function flag(name) { return argv.includes(name) }

const isExecute = flag('--execute')
const stuckDays = Number(arg('--stuck-days', DEFAULTS.STUCK_DAYS_DEFAULT))
const backlogThreshold = Number(arg('--backlog', DEFAULTS.HEAVY_BACKLOG_DEFAULT))

async function readOrEmpty(p) {
  try { return await fs.readFile(p, 'utf8') }
  catch (e) { if (e.code === 'ENOENT') return ''; throw e }
}

async function nextProposalNumber(text) {
  let max = 0
  for (const m of text.matchAll(/^### PROP-(\d+)/gm)) {
    const n = Number(m[1])
    if (n > max) max = n
  }
  return max + 1
}

async function main() {
  const [logText, candText, propText] = await Promise.all([
    readOrEmpty(COMPILE_LOG),
    readOrEmpty(CANDIDATES),
    readOrEmpty(PROPOSALS),
  ])

  const runs = parseCompileLog(logText)
  const candidates = parseCandidates(candText)
  const existing = parseExistingProposals(propText)
  const now = new Date()

  const all = runDetectors({ candidates, runs, now }, { stuckDays, threshold: backlogThreshold })
  const fresh = dedupeProposals(all, existing)

  console.log(`/foundry-propose — ${now.toISOString()}`)
  console.log(`  compile runs scanned: ${runs.length}`)
  console.log(`  current candidates:   ${candidates.length}`)
  console.log(`  existing proposals:   ${existing.size}`)
  console.log(`  detectors fired:      ${all.length} (${fresh.length} new, ${all.length - fresh.length} already proposed)`)
  console.log()

  if (fresh.length === 0) {
    console.log('No new proposals. The KB is in steady state — nothing to act on.')
    return 0
  }

  // Print all fresh proposals (with stable IDs starting at next available).
  let n = await nextProposalNumber(propText)
  const blocks = []
  for (const p of fresh) {
    blocks.push(formatProposal(p, n))
    n++
  }

  for (const b of blocks) console.log(b)

  if (!isExecute) {
    console.log('---')
    console.log('(plan mode — re-run with --execute to append to wiki/_meta/proposals.md)')
    return 0
  }

  // Append-only write. Header on first write, then a dated section.
  let prefix = ''
  if (propText.length === 0) {
    prefix = '---\ntitle: Foundry Proposals\ntype: meta\npurpose: Append-only ledger of actionable proposals surfaced by /foundry-propose. User accepts/rejects manually — no auto-act.\n---\n\n# Foundry Proposals\n\n'
  }
  const section = `\n## ${now.toISOString()}\n\n` + blocks.join('\n')
  await fs.mkdir(path.dirname(PROPOSALS), { recursive: true })
  await fs.appendFile(PROPOSALS, prefix + section + '\n')
  console.log(`---`)
  console.log(`Wrote ${fresh.length} new proposal${fresh.length === 1 ? '' : 's'} to wiki/_meta/proposals.md`)
  return 0
}

main().then((c) => process.exit(c)).catch((e) => { console.error(e); process.exit(1) })
