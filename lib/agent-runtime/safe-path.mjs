import path from 'path'

/**
 * Join user-supplied parts under `root` and verify the resolved path stays
 * inside `root`. Throws on escape, null-byte, or absolute component.
 */
export function safeJoin(root, ...parts) {
  const resolvedRoot = path.resolve(root)
  for (const p of parts) {
    if (typeof p !== 'string') throw new Error('safeJoin: non-string segment')
    if (p.includes('\0')) throw new Error('safeJoin: null byte in segment')
    if (path.isAbsolute(p)) throw new Error('safeJoin: absolute segment')
  }
  const joined = path.resolve(resolvedRoot, ...parts)
  if (joined !== resolvedRoot && !joined.startsWith(resolvedRoot + path.sep)) {
    throw new Error(`safeJoin: path escapes root (${joined} !<= ${resolvedRoot})`)
  }
  return joined
}

/** Validate a repo/slug token: alphanumerics plus . _ - /. Rejects .. and leading non-alnum. */
export function validateSlug(slug, kind = 'slug') {
  if (typeof slug !== 'string' || slug.length === 0 || slug.length > 200) {
    throw new Error(`invalid ${kind}: empty or too long`)
  }
  if (!/^[a-zA-Z0-9][a-zA-Z0-9/_.-]*$/.test(slug)) {
    throw new Error(`invalid ${kind}: must match [a-zA-Z0-9][a-zA-Z0-9/_.-]*`)
  }
  if (slug.includes('..')) throw new Error(`invalid ${kind}: contains ..`)
  return slug
}
