import path from 'path'

export const DEFAULT_STALE_AFTER_DAYS = 30

const ORPHAN_EXCLUDE_PATTERNS = [
  /^index\.md$/,
  /(?:^|\/)log\.md$/,
  /(?:^|\/)lint-report\.md$/,
  /^archive\//,
  /^system\/bus\//,
  /^agents\/[^/]+\/[^/]+\/active-task\.md$/,
  /^agents\/[^/]+\/[^/]+\/profile\.md$/,
  /^agents\/[^/]+\/[^/]+\/gotchas\.md$/,
  /^agents\/[^/]+\/[^/]+\/task-log\.md$/,
  /^agents\/[^/]+\/[^/]+\/working-memory\//,
  /^agents\/[^/]+\/[^/]+\/rewrites\//,
  /^repos\/[^/]+\/progress\.md$/,
  /^repos\/[^/]+\/repo-docs\//,
  /^repos\/[^/]+\/rewrites\//,
]

export function normalizeLinkTarget(link) {
  if (!link) return ''

  let target = String(link).trim()
  if (target.startsWith('[[') && target.endsWith(']]')) {
    target = target.slice(2, -2)
  }

  target = target.split('|')[0]
  target = target.split('#')[0]
  target = target.replace(/^\.\//, '').replace(/^\//, '')

  while (target.startsWith('../')) {
    target = target.slice(3)
  }

  target = path.posix.normalize(target)
  target = target.replace(/^\.\//, '').replace(/^\//, '')
  target = target.replace(/^wiki\//, '')
  target = target.replace(/\.(md|mdx)$/i, '')

  return target === '.' ? '' : target
}

function pageKeys(relPath) {
  const normalized = normalizeLinkTarget(relPath)
  const keys = new Set()
  if (!normalized) return keys

  keys.add(normalized)
  const base = path.posix.basename(normalized)
  if (base) keys.add(base)

  if (base === 'index') {
    const parent = path.posix.dirname(normalized)
    if (parent && parent !== '.') keys.add(parent)
  }

  return keys
}

export function buildInboundLinkMap(pages) {
  const inbound = new Map()
  const keyToPaths = new Map()

  for (const page of pages) {
    inbound.set(page.relPath, [])
    for (const key of pageKeys(page.relPath)) {
      if (!keyToPaths.has(key)) keyToPaths.set(key, [])
      keyToPaths.get(key).push(page.relPath)
    }
  }

  for (const page of pages) {
    for (const rawLink of page.links || []) {
      const normalized = normalizeLinkTarget(rawLink)
      if (!normalized) continue

      const matches = new Set(keyToPaths.get(normalized) || [])
      if (matches.size === 0) {
        for (const [key, relPaths] of keyToPaths.entries()) {
          if (normalized.endsWith(`/${key}`) || key.endsWith(`/${normalized}`)) {
            for (const relPath of relPaths) matches.add(relPath)
          }
        }
      }

      for (const relPath of matches) {
        if (relPath === page.relPath) continue
        const refs = inbound.get(relPath)
        if (refs && !refs.includes(page.relPath)) refs.push(page.relPath)
      }
    }
  }

  return inbound
}

export function isOrphanCandidate(relPath) {
  return !ORPHAN_EXCLUDE_PATTERNS.some(pattern => pattern.test(relPath))
}

export function isStalePage(page, now = Date.now()) {
  if (!page?.updated) return false
  if (!isOrphanCandidate(page.relPath) && /^system\/bus\//.test(page.relPath)) return false

  const staleAfterDays = Number(page.staleAfterDays ?? page.reviewCadenceDays ?? DEFAULT_STALE_AFTER_DAYS)
  if (!Number.isFinite(staleAfterDays) || staleAfterDays <= 0) return false

  const updatedAt = new Date(page.updated)
  if (Number.isNaN(updatedAt.getTime())) return false

  const cutoff = now - staleAfterDays * 24 * 60 * 60 * 1000
  return updatedAt.getTime() < cutoff
}
