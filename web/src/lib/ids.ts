/**
 * ids.ts — Stable document IDs (ULID) for the KB
 *
 * Every wiki page and raw doc gets a stable `id:` in its frontmatter.
 * Paths are semantic and can be renamed/moved by the compiler; IDs are
 * permanent so backlinks, citations, and Q&A references survive file
 * reorganization.
 *
 * Format: Crockford base32 ULID (26 chars) — time-sortable + random.
 *   Example: 01JRK4X2H8M6N3P5QZ7W9T1YBD
 */
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { DEFAULT_KB_ROOT } from '@/lib/articles'

// ── ULID ─────────────────────────────────────────────────────────────────────
// Minimal implementation. 10 chars timestamp (48-bit ms) + 16 chars randomness.
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

function encodeBase32(n: bigint, length: number): string {
  let out = ''
  for (let i = 0; i < length; i++) {
    out = CROCKFORD[Number(n & 31n)] + out
    n >>= 5n
  }
  return out
}

export function ulid(now: number = Date.now()): string {
  const time = encodeBase32(BigInt(now), 10)
  const rand = crypto.randomBytes(10)
  let r = 0n
  for (const b of rand) r = (r << 8n) | BigInt(b)
  const randStr = encodeBase32(r, 16)
  return time + randStr
}

// ── Frontmatter helpers ──────────────────────────────────────────────────────

const FM_RE = /^---\n([\s\S]*?)\n---/

/** Read frontmatter lines as a map (values are raw strings). */
function parseFrontmatter(content: string): { fm: Map<string, string>; raw: string; body: string } | null {
  const m = content.match(FM_RE)
  if (!m) return null
  const fm = new Map<string, string>()
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/)
    if (kv) fm.set(kv[1], kv[2])
  }
  return { fm, raw: m[1], body: content.slice(m[0].length) }
}

/**
 * Ensure a file has an `id:` in its frontmatter. Returns the ID (existing or
 * newly generated). Writes the file only if it had to add one.
 */
export function ensureId(absPath: string): string | null {
  let content: string
  try { content = fs.readFileSync(absPath, 'utf8') } catch { return null }

  const parsed = parseFrontmatter(content)
  if (parsed) {
    const existing = parsed.fm.get('id')
    if (existing) {
      // Strip surrounding quotes if present.
      return existing.replace(/^["']|["']$/g, '')
    }
    // Inject id as the first frontmatter field.
    const id = ulid()
    const newFm = `id: ${id}\n${parsed.raw}`
    const updated = `---\n${newFm}\n---${parsed.body}`
    fs.writeFileSync(absPath, updated, 'utf8')
    return id
  }

  // No frontmatter at all — prepend a minimal block.
  const id = ulid()
  const updated = `---\nid: ${id}\n---\n\n${content}`
  fs.writeFileSync(absPath, updated, 'utf8')
  return id
}

// ── ID index (id → relPath) ─────────────────────────────────────────────────
// Cached for 60s. Rebuilt by scanning wiki/ + raw/ frontmatter.

interface IdIndexCache {
  map: Map<string, string>
  vaultRoot: string
  builtAt: number
}

let _idCache: IdIndexCache | null = null
const ID_TTL_MS = 60 * 1000

function walk(dir: string, out: string[]): void {
  let entries: fs.Dirent[]
  try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch { return }
  for (const ent of entries) {
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      if (ent.name.startsWith('.')) continue
      walk(full, out)
    } else if (ent.isFile() && ent.name.endsWith('.md')) {
      out.push(full)
    }
  }
}

function extractId(absPath: string): string | null {
  try {
    const fd = fs.openSync(absPath, 'r')
    const buf = Buffer.alloc(1024)
    fs.readSync(fd, buf, 0, 1024, 0)
    fs.closeSync(fd)
    const head = buf.toString('utf8')
    const m = head.match(/^---\n([\s\S]*?)\n---/)
    if (!m) return null
    const idLine = m[1].match(/^id:\s*(.+)$/m)
    if (!idLine) return null
    return idLine[1].trim().replace(/^["']|["']$/g, '')
  } catch { return null }
}

export function buildIdIndex(vaultRoot: string = DEFAULT_KB_ROOT): Map<string, string> {
  const map = new Map<string, string>()
  const scanDirs = ['wiki', 'raw']
  for (const d of scanDirs) {
    const base = path.join(vaultRoot, d)
    const files: string[] = []
    walk(base, files)
    for (const abs of files) {
      const id = extractId(abs)
      if (id) map.set(id, path.relative(vaultRoot, abs))
    }
  }
  return map
}

export function getIdIndex(vaultRoot: string = DEFAULT_KB_ROOT): Map<string, string> {
  const now = Date.now()
  if (_idCache && _idCache.vaultRoot === vaultRoot && now - _idCache.builtAt < ID_TTL_MS) {
    return _idCache.map
  }
  const map = buildIdIndex(vaultRoot)
  _idCache = { map, vaultRoot, builtAt: now }
  return map
}

/** Resolve an ID to a relative path. Returns null if not found. */
export function resolveById(id: string, vaultRoot: string = DEFAULT_KB_ROOT): string | null {
  return getIdIndex(vaultRoot).get(id) || null
}

/** Invalidate the cache — call after bulk writes. */
export function invalidateIdIndex(): void {
  _idCache = null
}
