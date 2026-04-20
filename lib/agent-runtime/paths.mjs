// Glob matching + path safety. Zero deps.
import path from 'path'

// Convert a glob pattern to a RegExp. Supports **, *, ?.
export function globToRegex(glob) {
  let re = ''
  let i = 0
  while (i < glob.length) {
    const c = glob[i]
    if (c === '*') {
      if (glob[i + 1] === '*') {
        re += '.*'
        i += 2
        if (glob[i] === '/') i++
      } else {
        re += '[^/]*'
        i++
      }
    } else if (c === '?') {
      re += '[^/]'
      i++
    } else if ('.+^$()|{}[]\\'.includes(c)) {
      re += '\\' + c
      i++
    } else {
      re += c
      i++
    }
  }
  return new RegExp('^' + re + '$')
}

export function matchAny(relPath, patterns, vars = {}) {
  if (!patterns) return false
  for (const p of patterns) {
    const expanded = expandVars(p, vars)
    if (globToRegex(expanded).test(relPath)) return true
  }
  return false
}

export function expandVars(str, vars) {
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`)
}

export function safeRel(kbRoot, absPath) {
  const rel = path.relative(kbRoot, absPath).replace(/\\/g, '/')
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`Path escapes KB root: ${absPath}`)
  }
  return rel
}

// Unsafe path patterns (checked before any glob match).
// Order of checks matters — first match wins so error reason stays specific.
const UNSAFE_CHECKS = [
  [p => typeof p !== 'string', 'non-string path'],
  [p => p === '', 'empty path'],
  [p => p.includes('\0'), 'null byte in path'],
  [p => /[\r\n]/.test(p), 'newline in path'],
  [p => p.includes('\\'), 'backslash in path'],
  [p => /%2e|%2f/i.test(p), 'url-encoded traversal characters'],
  [p => p.startsWith('/'), 'absolute path (leading slash)'],
  [p => /^[A-Za-z]:/.test(p), 'windows drive letter'],
  [p => p.startsWith('~'), 'home-directory expansion'],
  [p => /^[a-z]+:\/\//i.test(p), 'url scheme'],
  [p => p.includes('//'), 'double slash'],
  [p => p.split('/').some(seg => seg === '..' || seg === '.'), 'dot-segment traversal'],
  [p => p.includes('..'), 'parent-traversal substring'],
]

function checkUnsafe(relPath) {
  for (const [fn, reason] of UNSAFE_CHECKS) {
    if (fn(relPath)) return reason
  }
  return null
}

export function assertWriteAllowed(relPath, contract, vars = {}) {
  const unsafe = checkUnsafe(relPath)
  if (unsafe) {
    return { allowed: false, reason: `unsafe path: ${unsafe}`, rule: null }
  }
  if (matchAny(relPath, contract.forbidden_paths, vars)) {
    return { allowed: false, reason: 'forbidden_paths match', rule: null }
  }
  if (!contract.allowed_writes || contract.allowed_writes.length === 0) {
    return { allowed: false, reason: 'no allowed_writes configured', rule: null }
  }
  for (const p of contract.allowed_writes) {
    const expanded = expandVars(p, vars)
    if (globToRegex(expanded).test(relPath)) {
      return { allowed: true, reason: 'matched allowed_writes', rule: p }
    }
  }
  return { allowed: false, reason: 'not in allowed_writes', rule: null }
}

export function assertReadAllowed(relPath, contract, vars = {}) {
  if (matchAny(relPath, contract.forbidden_paths, vars)) {
    return { allowed: false, reason: 'forbidden_paths match' }
  }
  // Reads are evaluated by context_policy in context-loader.mjs;
  // this function is only used for direct-read operations.
  if (contract.allowed_reads && contract.allowed_reads.length > 0) {
    return { allowed: matchAny(relPath, contract.allowed_reads, vars), reason: 'allowed_reads check' }
  }
  return { allowed: true, reason: 'no explicit read restrictions' }
}
