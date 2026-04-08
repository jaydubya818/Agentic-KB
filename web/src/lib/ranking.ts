/**
 * ranking.ts — Temporal decay + hotness scoring
 *
 * Archivist-oss pattern: pure relevance isn't enough. A page that was
 * last touched 2 days ago and queried 50 times this week should outrank
 * a page last touched 2 years ago that's never been accessed, even if
 * their text-similarity scores are identical.
 *
 * Final score = baseScore * decay(mtime) * hotness(filePath)
 *
 *   decay(mtime)  — exponential decay with 180-day half-life, floor 0.5
 *   hotness(path) — log-scaled query hit count from audit.log, capped at +0.5
 */
import fs from 'fs'
import path from 'path'
import { DEFAULT_KB_ROOT } from '@/lib/articles'

const HALF_LIFE_DAYS = 180
const DECAY_FLOOR = 0.5
const HOTNESS_CAP = 0.5
const HOTNESS_WINDOW_DAYS = 30

// ── Temporal decay ────────────────────────────────────────────────────────────

export function decayFactor(mtimeMs: number, now: number = Date.now()): number {
  const ageDays = Math.max(0, (now - mtimeMs) / (1000 * 60 * 60 * 24))
  const decayed = Math.pow(0.5, ageDays / HALF_LIFE_DAYS)
  return Math.max(DECAY_FLOOR, decayed)
}

export function decayForFile(absPath: string): number {
  try {
    const stat = fs.statSync(absPath)
    return decayFactor(stat.mtimeMs)
  } catch {
    return DECAY_FLOOR
  }
}

// ── Hotness from audit log ───────────────────────────────────────────────────
// Counts recent query hits per file. Cached for 60s to avoid re-parsing
// audit.log on every search request.

interface HotnessCache {
  map: Map<string, number>
  builtAt: number
}

let _hotnessCache: HotnessCache | null = null
const HOTNESS_TTL_MS = 60 * 1000

function buildHotnessMap(): Map<string, number> {
  const map = new Map<string, number>()
  const auditPath = path.join(DEFAULT_KB_ROOT, 'logs', 'audit.log')
  if (!fs.existsSync(auditPath)) return map

  const cutoff = Date.now() - HOTNESS_WINDOW_DAYS * 24 * 60 * 60 * 1000
  try {
    const content = fs.readFileSync(auditPath, 'utf8')
    const lines = content.trim().split('\n').filter(Boolean)
    for (const line of lines) {
      try {
        const entry = JSON.parse(line) as { ts: string; op: string; files?: string[] }
        if (entry.op !== 'query') continue
        if (new Date(entry.ts).getTime() < cutoff) continue
        for (const f of entry.files || []) {
          map.set(f, (map.get(f) || 0) + 1)
        }
      } catch { /* skip malformed line */ }
    }
  } catch { /* ignore */ }
  return map
}

function getHotnessMap(): Map<string, number> {
  const now = Date.now()
  if (_hotnessCache && now - _hotnessCache.builtAt < HOTNESS_TTL_MS) {
    return _hotnessCache.map
  }
  const map = buildHotnessMap()
  _hotnessCache = { map, builtAt: now }
  return map
}

/** Hotness multiplier for a relative file path. Returns 1.0 + [0, HOTNESS_CAP]. */
export function hotnessBoost(relPath: string): number {
  const map = getHotnessMap()
  const hits = map.get(relPath) || 0
  if (hits === 0) return 1.0
  // Logarithmic: 1 hit → +0.1, 10 → +0.33, 100 → +0.5 (capped)
  const boost = Math.min(HOTNESS_CAP, Math.log10(1 + hits) / 2)
  return 1.0 + boost
}

// ── Verified boost ───────────────────────────────────────────────────────────
// Docs saved via /api/query/save with verified:true in frontmatter get a
// ranking multiplier so human-validated Q&A outranks raw source material.

const VERIFIED_BOOST = 1.25
interface VerifiedCacheEntry { verified: boolean; mtimeMs: number }
const _verifiedCache = new Map<string, VerifiedCacheEntry>()

export function verifiedBoost(absPath: string): number {
  try {
    const stat = fs.statSync(absPath)
    const cached = _verifiedCache.get(absPath)
    if (cached && cached.mtimeMs === stat.mtimeMs) {
      return cached.verified ? VERIFIED_BOOST : 1.0
    }
    // Read only the frontmatter region (first ~1KB is plenty)
    const fd = fs.openSync(absPath, 'r')
    const buf = Buffer.alloc(1024)
    fs.readSync(fd, buf, 0, 1024, 0)
    fs.closeSync(fd)
    const head = buf.toString('utf8')
    const fmMatch = head.match(/^---\n([\s\S]*?)\n---/)
    const verified = fmMatch ? /^verified:\s*true\s*$/m.test(fmMatch[1]) : false
    _verifiedCache.set(absPath, { verified, mtimeMs: stat.mtimeMs })
    return verified ? VERIFIED_BOOST : 1.0
  } catch {
    return 1.0
  }
}

/** Combined decay + hotness + verified multiplier */
export function rankMultiplier(absPath: string, relPath: string): number {
  return decayForFile(absPath) * hotnessBoost(relPath) * verifiedBoost(absPath)
}

/** Explain the components for debugging/UI */
export function rankBreakdown(absPath: string, relPath: string) {
  const decay = decayForFile(absPath)
  const hotness = hotnessBoost(relPath)
  const verified = verifiedBoost(absPath)
  return { decay, hotness, verified, multiplier: decay * hotness * verified }
}
