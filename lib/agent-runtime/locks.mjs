// Per-agent file lock — prevents concurrent closeTask/compaction interleaving.
// Uses fs.openSync with O_EXCL; stale locks (PID dead or older than maxAgeMs) auto-cleared.
import fs from 'fs'
import path from 'path'

const DEFAULT_MAX_AGE_MS = 60_000
const LOCK_DIR = '.locks'

function lockPath(kbRoot, key) {
  const safe = String(key).replace(/[^a-zA-Z0-9._-]/g, '_')
  return path.join(kbRoot, LOCK_DIR, `${safe}.lock`)
}

function pidAlive(pid) {
  try { process.kill(pid, 0); return true } catch (e) { return e.code === 'EPERM' }
}

function tryClearStale(full, maxAgeMs) {
  try {
    const raw = fs.readFileSync(full, 'utf8')
    const rec = JSON.parse(raw)
    const age = Date.now() - (rec.ts || 0)
    if (age > maxAgeMs) { fs.unlinkSync(full); return true }
    if (rec.pid && !pidAlive(rec.pid)) { fs.unlinkSync(full); return true }
  } catch {
    try { fs.unlinkSync(full) } catch {}
    return true
  }
  return false
}

/**
 * Acquire an exclusive lock for `key` (typically agent_id).
 * Returns a handle with .release(). Throws if busy after retries.
 */
export function acquireLock(kbRoot, key, { maxAgeMs = DEFAULT_MAX_AGE_MS, retries = 10, retryDelayMs = 50, waitMs = 0 } = {}) {
  const full = lockPath(kbRoot, key)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  const payload = JSON.stringify({ pid: process.pid, ts: Date.now(), key })

  const deadline = Date.now() + Math.max(waitMs, retries * retryDelayMs)
  let attempt = 0
  while (true) {
    try {
      const fd = fs.openSync(full, 'wx')
      fs.writeSync(fd, payload)
      fs.closeSync(fd)
      return {
        key,
        path: full,
        release() { try { fs.unlinkSync(full) } catch {} },
      }
    } catch (err) {
      if (err.code !== 'EEXIST') throw err
      if (tryClearStale(full, maxAgeMs)) continue
      attempt++
      if (Date.now() >= deadline) {
        throw new Error(`lock busy: ${key} (held by another process)`)
      }
      // busy-wait a tick
      const end = Date.now() + retryDelayMs
      while (Date.now() < end) { /* spin */ }
    }
  }
}

/** Run `fn` under exclusive lock on `key`; always releases. */
export function withLock(kbRoot, key, fn, opts) {
  const lock = acquireLock(kbRoot, key, opts)
  try { return fn() } finally { lock.release() }
}
