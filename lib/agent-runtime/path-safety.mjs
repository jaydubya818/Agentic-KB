// Single source of truth for adversarial path rejection.
// Used by both KB write-guard (paths.mjs) and vault write-guard (vault-writeback.mjs).
// Fuzzer covers both call sites with one test sweep.

export const UNSAFE_CHECKS = [
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

/**
 * Returns reason string if path is unsafe, null if clean.
 * Use as: const u = checkUnsafePath(p); if (u) return { allowed: false, reason: u }
 */
export function checkUnsafePath(relPath) {
  for (const [fn, reason] of UNSAFE_CHECKS) {
    if (fn(relPath)) return reason
  }
  return null
}
