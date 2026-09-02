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
  if (/\/(task-log|scratch|sprint-state)\.md$/.test(relPath)) return 'working'
  if (/\/working-memory\//.test(relPath)) return 'working'
  if (/\/active-task\.md$/.test(relPath)) return 'working'
  if (/\/(gotchas|promoted-learnings|decisions|domain-standards|standards-authored)\.md$/.test(relPath)) return 'learned'
  if (/\/rewrites\//.test(relPath)) return 'rewrite'
  if (/^wiki\/system\/bus\//.test(relPath)) return 'bus'
  // Repo-scoped bus items live at wiki/repos/<repo>/bus/<channel>/<id>.md
  // (lib/repo-runtime/paths.mjs repoBusRoot). Anchored at exactly one repo
  // segment so a synced repo doc that merely contains "bus/" deeper in its
  // path keeps falling through to 'learned'.
  if (/^wiki\/repos\/[^/]+\/bus\//.test(relPath)) return 'bus'
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

/**
 * Generate a blank frontmatter + body template for a given memory class.
 * Returns a string ready to write to disk.
 *
 * @param {string} cls - One of the 6 memory classes
 * @param {object} vars - { agentId, tier, domain, project, type, timestamp }
 */
// Frontmatter values are single-line YAML scalars. A value containing a
// newline would terminate the value early and inject arbitrary frontmatter
// keys into the generated page (e.g. a crafted domain/agentId elevating
// tier or allowed_writes). Collapse to one line, same guard as adr-emitter.
function oneLine(s) {
  return String(s).replace(/[\r\n]+/g, ' ').trim()
}

export function generateTemplate(cls, vars = {}) {
  const raw = vars || {}
  const agentId = oneLine(raw.agentId ?? 'unknown')
  const tier = oneLine(raw.tier ?? 'worker')
  const domain = oneLine(raw.domain ?? '')
  const project = oneLine(raw.project ?? '')
  const type = oneLine(raw.type ?? 'general')
  const ts = oneLine(raw.timestamp ?? new Date().toISOString())
  const today = ts.slice(0, 10)

  switch (cls) {
    case 'profile':
      return [
        '---',
        `memory_class: profile`,
        `agent_id: ${agentId}`,
        `tier: ${tier}`,
        `domain: ${domain}`,
        `created: ${today}`,
        `updated: ${today}`,
        '---',
        '',
        `# ${agentId} — Agent Profile`,
        '',
        '## Role',
        `${agentId} is a ${tier}-tier agent responsible for ...`,
        '',
        '## Capabilities',
        '- ...',
        '',
        '## Constraints',
        '- ...',
        '',
        '## Escalation Path',
        '- ...',
        '',
      ].join('\n')

    case 'hot':
      return [
        '---',
        `memory_class: hot`,
        `agent_id: ${agentId}`,
        `updated: ${today}`,
        `needs_compaction: false`,
        '---',
        '',
        `# ${agentId} — Hot Cache`,
        '',
        '> Short-term priority context. Compacted automatically when >500 words.',
        '',
        '## Current Focus',
        '- ...',
        '',
        '## Recent Decisions',
        '- ...',
        '',
        '## Active Gotchas',
        '- ...',
        '',
      ].join('\n')

    case 'working':
      return [
        '---',
        `memory_class: working`,
        `agent_id: ${agentId}`,
        `created: ${today}`,
        '---',
        '',
        `# ${agentId} — Task Log`,
        '',
        '> Append-only. Never manually edited.',
        '',
      ].join('\n')

    case 'learned':
      return [
        '---',
        `memory_class: learned`,
        `agent_id: ${agentId}`,
        `domain: ${domain}`,
        `updated: ${today}`,
        '---',
        '',
        `# ${agentId} — Gotchas & Learned Patterns`,
        '',
        '> Durable lessons. Update via close-task gotcha field.',
        '',
        '## Gotchas',
        '- ...',
        '',
        '## Validated Patterns',
        '- ...',
        '',
        '## Anti-patterns',
        '- ...',
        '',
      ].join('\n')

    case 'rewrite':
      return [
        '---',
        `memory_class: rewrite`,
        `rewrite_type: ${type}`,
        `project: ${project}`,
        `author: ${agentId}`,
        `status: draft`,
        `created: ${ts}`,
        '---',
        '',
        `# Rewrite: ${type} / ${project}`,
        '',
        '> Draft rewrite artifact. Requires approval before merge.',
        '',
        '## Proposed Changes',
        '',
        '...',
        '',
        '## Rationale',
        '',
        '...',
        '',
      ].join('\n')

    case 'bus':
      return [
        '---',
        `memory_class: bus`,
        `from: ${agentId}`,
        `status: open`,
        `created_at: ${ts}`,
        '---',
        '',
        '...',
        '',
      ].join('\n')

    default:
      return [
        '---',
        `memory_class: ${cls}`,
        `agent_id: ${agentId}`,
        `created: ${today}`,
        '---',
        '',
      ].join('\n')
  }
}
