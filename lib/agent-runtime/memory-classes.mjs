// Memory class metadata. A memory class defines: retention, append-only, default location.

export const CLASSES = {
  profile:  { appendOnly: false, compact: false, retentionDays: null, description: 'Stable identity + role definition' },
  hot:      { appendOnly: false, compact: true,  retentionDays: null, description: 'Compacted short-term priority cache' },
  working:  { appendOnly: true,  compact: false, retentionDays: null, description: 'Append-only task log / scratch' },
  learned:  { appendOnly: false, compact: false, retentionDays: null, description: 'Gotchas, patterns, durable lessons' },
  rewrite:  { appendOnly: false, compact: false, retentionDays: 180,  description: 'Draft rewrites of PRDs/specs/plans' },
  bus:      { appendOnly: false, compact: false, retentionDays: 30,   description: 'Cross-agent messages' },
}

export function isValidClass(c) {
  return Object.prototype.hasOwnProperty.call(CLASSES, c)
}

export function classFor(relPath) {
  // Infer class from path. Explicit frontmatter overrides this.
  if (/\/profile\.md$/.test(relPath)) return 'profile'
  if (/\/hot\.md$/.test(relPath)) return 'hot'
  if (/\/(task-log|working-memory|scratch|sprint-state)\.md$/.test(relPath)) return 'working'
  if (/\/(gotchas|promoted-learnings|decisions|domain-standards|standards-authored)\.md$/.test(relPath)) return 'learned'
  if (/\/rewrites\//.test(relPath)) return 'rewrite'
  if (/^wiki\/system\/bus\//.test(relPath)) return 'bus'
  return 'learned'
}

export function isAppendOnly(cls) {
  return !!CLASSES[cls]?.appendOnly
}

export function retentionDaysFor(cls) {
  return CLASSES[cls]?.retentionDays ?? null
}

export function defaultLocationFor(agentId, tier, cls, vars = {}) {
  const base = `wiki/agents/${tier}s/${agentId}`
  switch (cls) {
    case 'profile': return `${base}/profile.md`
    case 'hot':     return `${base}/hot.md`
    case 'working': return `${base}/task-log.md`
    case 'learned': return `${base}/gotchas.md`
    case 'rewrite': return `${base}/rewrites/${vars.type || 'notes'}/${vars.project || 'unknown'}-${vars.timestamp || 'ts'}.md`
    case 'bus':     return `wiki/system/bus/${vars.channel || 'discovery'}/${vars.id || 'item'}.md`
  }
  return `${base}/scratch.md`
}
