// Shared JSONL audit writer — hash-chained for tamper-evidence.
// Schema stays backwards-compatible (consumers tolerate extra fields).
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const GENESIS = '0'.repeat(16)

function hashEntry(prev, body) {
  return crypto.createHash('sha256').update(prev + '|' + body, 'utf8').digest('hex').slice(0, 16)
}

function lastLine(full) {
  try {
    const buf = fs.readFileSync(full, 'utf8').trimEnd()
    if (!buf) return null
    const idx = buf.lastIndexOf('\n')
    return idx >= 0 ? buf.slice(idx + 1) : buf
  } catch { return null }
}

function lastHash(full) {
  const last = lastLine(full)
  if (!last) return GENESIS
  try {
    const rec = JSON.parse(last)
    return rec.entry_hash || GENESIS
  } catch { return GENESIS }
}

export function appendAudit(kbRoot, entry) {
  try {
    const dir = path.join(kbRoot, 'logs')
    fs.mkdirSync(dir, { recursive: true })
    const full = path.join(dir, 'audit.log')
    const prev = lastHash(full)
    const base = { ts: new Date().toISOString(), ...entry, prev_hash: prev }
    const body = JSON.stringify(base)
    const entry_hash = hashEntry(prev, body)
    fs.appendFileSync(full, JSON.stringify({ ...base, entry_hash }) + '\n')
  } catch (err) {
    console.error('[audit] appendAudit failed:', err && err.message ? err.message : err)
  }
}

export function appendRuntimeTrace(kbRoot, trace) {
  try {
    const dir = path.join(kbRoot, 'logs')
    fs.mkdirSync(dir, { recursive: true })
    const line = JSON.stringify({ ts: new Date().toISOString(), ...trace })
    fs.appendFileSync(path.join(dir, 'agent-runtime.log'), line + '\n')
  } catch (err) {
    console.error('[audit] appendRuntimeTrace failed:', err && err.message ? err.message : err)
  }
}

export function readRuntimeTraces(kbRoot, limit = 50, filter = {}) {
  try {
    const file = path.join(kbRoot, 'logs', 'agent-runtime.log')
    if (!fs.existsSync(file)) return []
    const lines = fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean)
    const parsed = lines.map(l => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean)
    let out = parsed
    if (filter.agent_id) out = out.filter(t => t.agent_id === filter.agent_id)
    if (filter.type) out = out.filter(t => t.type === filter.type)
    return out.slice(-limit).reverse()
  } catch (err) {
    console.error('[audit] readRuntimeTraces failed:', err && err.message ? err.message : err)
    return []
  }
}

export function readRecentAudit(kbRoot, limit = 50, filter = {}) {
  try {
    const file = path.join(kbRoot, 'logs', 'audit.log')
    if (!fs.existsSync(file)) return []
    const lines = fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean)
    const parsed = lines.map(l => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean)
    let out = parsed
    if (filter.agent_id) out = out.filter(e => e.agent_id === filter.agent_id)
    if (filter.op) out = out.filter(e => e.op === filter.op)
    return out.slice(-limit).reverse()
  } catch { return [] }
}

/** Verify audit.log hash chain. Returns { ok, scanned, firstBreakAt?, reason? }. */
export function verifyAuditChain(kbRoot) {
  const file = path.join(kbRoot, 'logs', 'audit.log')
  if (!fs.existsSync(file)) return { ok: true, scanned: 0 }
  const lines = fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean)
  let prev = GENESIS
  for (let i = 0; i < lines.length; i++) {
    let rec
    try { rec = JSON.parse(lines[i]) } catch { return { ok: false, scanned: i, firstBreakAt: i, reason: 'json parse' } }
    if (rec.prev_hash == null) return { ok: false, scanned: i, firstBreakAt: i, reason: 'legacy entry (no prev_hash)' }
    if (rec.prev_hash !== prev) return { ok: false, scanned: i, firstBreakAt: i, reason: 'prev_hash mismatch' }
    const { entry_hash, ...rest } = rec
    const expected = hashEntry(prev, JSON.stringify(rest))
    if (entry_hash !== expected) return { ok: false, scanned: i, firstBreakAt: i, reason: 'entry_hash mismatch' }
    prev = entry_hash
  }
  return { ok: true, scanned: lines.length }
}
