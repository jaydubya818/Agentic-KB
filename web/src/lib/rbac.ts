/**
 * rbac.ts — Namespace-level access control
 *
 * Borrowed from archivist-oss pattern: every read/write is scoped to a
 * namespace. One KB, many tenants (teams, projects, agents).
 *
 * Resolution order:
 *   1. X-KB-Namespace header (explicit)
 *   2. Bearer token → namespaces.json lookup
 *   3. "default" (back-compat — existing behavior)
 *
 * Config: <KB_ROOT>/namespaces.json
 *   {
 *     "tokens": { "sk-abc123": "engineering", "sk-xyz": "product" },
 *     "namespaces": {
 *       "engineering": { "read": ["*"], "write": ["engineering", "shared"] },
 *       "product":     { "read": ["product", "shared"], "write": ["product"] },
 *       "default":     { "read": ["*"], "write": ["*"] }
 *     }
 *   }
 */
import fs from 'fs'
import path from 'path'
import type { NextRequest } from 'next/server'
import { DEFAULT_KB_ROOT } from '@/lib/articles'

export interface NamespaceACL {
  read: string[]   // namespace globs or "*"
  write: string[]
}

export interface RBACConfig {
  tokens: Record<string, string>
  namespaces: Record<string, NamespaceACL>
}

const DEFAULT_CONFIG: RBACConfig = {
  tokens: {},
  namespaces: {
    default: { read: ['*'], write: ['*'] },
  },
}

let _cfgCache: RBACConfig | null = null
let _cfgMtime = 0

function configPath(): string {
  return path.join(DEFAULT_KB_ROOT, 'namespaces.json')
}

function loadConfig(): RBACConfig {
  try {
    const p = configPath()
    const stat = fs.statSync(p)
    if (_cfgCache && stat.mtimeMs === _cfgMtime) return _cfgCache
    const raw = fs.readFileSync(p, 'utf8')
    _cfgCache = JSON.parse(raw) as RBACConfig
    _cfgMtime = stat.mtimeMs
    // Ensure default namespace always exists
    if (!_cfgCache.namespaces.default) {
      _cfgCache.namespaces.default = DEFAULT_CONFIG.namespaces.default
    }
    return _cfgCache
  } catch {
    return DEFAULT_CONFIG
  }
}

export interface ResolvedIdentity {
  namespace: string
  acl: NamespaceACL
  token?: string
  source: 'header' | 'token' | 'default'
}

/** Resolve caller's namespace + ACL from an incoming request */
export function resolveIdentity(request: NextRequest): ResolvedIdentity {
  const cfg = loadConfig()

  // 1. Explicit header
  const headerNs = request.headers.get('x-kb-namespace')
  if (headerNs && cfg.namespaces[headerNs]) {
    return { namespace: headerNs, acl: cfg.namespaces[headerNs], source: 'header' }
  }

  // 2. Bearer token lookup
  const auth = request.headers.get('authorization') || ''
  const m = auth.match(/^Bearer\s+(.+)$/i)
  if (m) {
    const token = m[1]
    const ns = cfg.tokens[token]
    if (ns && cfg.namespaces[ns]) {
      return { namespace: ns, acl: cfg.namespaces[ns], token, source: 'token' }
    }
  }

  // 3. Default (back-compat)
  return { namespace: 'default', acl: cfg.namespaces.default, source: 'default' }
}

/** Check whether an ACL rule list matches a target namespace */
function aclMatches(rules: string[], target: string): boolean {
  return rules.some(r => r === '*' || r === target)
}

export function canRead(acl: NamespaceACL, targetNs: string): boolean {
  return aclMatches(acl.read, targetNs)
}

export function canWrite(acl: NamespaceACL, targetNs: string): boolean {
  return aclMatches(acl.write, targetNs)
}

/**
 * Given an absolute file path inside the vault, infer its namespace by
 * looking at the first path segment under raw/ or wiki/.
 * Examples:
 *   raw/engineering/notes.md  → "engineering"
 *   raw/notes.md              → "default"
 *   wiki/product/launch.md    → "product"
 */
export function namespaceForFile(relPath: string): string {
  const parts = relPath.split(path.sep).filter(Boolean)
  if (parts.length < 3) return 'default'
  const [top, maybeNs] = parts
  if (top !== 'raw' && top !== 'wiki') return 'default'
  // Exclude known non-namespace subdirs
  const reserved = new Set(['webhooks', 'transcripts', 'twitter', 'architecture', 'syntheses', 'log.md', 'schema.md', 'lint-report.md'])
  if (reserved.has(maybeNs)) return 'default'
  return maybeNs
}

/** Filter a list of relative paths by read permission */
export function filterReadable(paths: string[], acl: NamespaceACL): string[] {
  return paths.filter(p => canRead(acl, namespaceForFile(p)))
}
