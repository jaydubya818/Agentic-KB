// Retention & compaction: hot compaction, bus TTL, task log rotation. Archive never delete.
import fs from 'fs'
import path from 'path'
import { updateFrontmatter } from './frontmatter.mjs'
import { listBusItems, transitionBusItem } from './bus.mjs'
import { appendAudit } from './audit.mjs'
import { timestamp } from './ids.mjs'

const DAY_MS = 86400000

export function archiveMove(kbRoot, relPath, archiveRel) {
  const src = path.join(kbRoot, relPath)
  const dst = path.join(kbRoot, archiveRel)
  fs.mkdirSync(path.dirname(dst), { recursive: true })
  fs.copyFileSync(src, dst)
  fs.unlinkSync(src)
  appendAudit(kbRoot, { op: 'archive-move', from: relPath, to: archiveRel })
  return archiveRel
}

// Bus TTL: archive items older than N days unless pinned / promoted / in_progress.
export function runBusTTL(kbRoot, { ttlDays = 30, channels = ['discovery'] } = {}) {
  const archived = []
  const now = Date.now()
  for (const channel of channels) {
    const items = listBusItems(kbRoot, channel, { limit: 1000 })
    for (const item of items) {
      if (item.meta.pinned) continue
      if (['promoted', 'in_progress', 'archived'].includes(item.meta.status)) continue
      const createdAt = Date.parse(item.meta.created_at || 0)
      if (!createdAt) continue
      if (now - createdAt < ttlDays * DAY_MS) continue
      const year = new Date(createdAt).getFullYear()
      const archiveRel = `wiki/archive/bus/${channel}/${year}/${item.meta.id}.md`
      // transition first, then move
      try { transitionBusItem(kbRoot, channel, item.meta.id, 'archived', 'retention') } catch {}
      archiveMove(kbRoot, item.path, archiveRel)
      archived.push(archiveRel)
    }
  }
  return { archived }
}

// Hot memory compaction: snapshot current hot, truncate to header.
// Actual Claude-based compaction is a follow-up; this v1 snapshots and flags for review.
export function compactHotMemory(kbRoot, agentId, tier) {
  const rel = `wiki/agents/${tier}s/${agentId}/hot.md`
  const full = path.join(kbRoot, rel)
  if (!fs.existsSync(full)) return { skipped: true }
  const content = fs.readFileSync(full, 'utf8')
  const words = content.split(/\s+/).length
  if (words < 500) return { skipped: true, words }
  const snapshotRel = `wiki/archive/hot-snapshots/${agentId}/${timestamp()}.md`
  const snapshotFull = path.join(kbRoot, snapshotRel)
  fs.mkdirSync(path.dirname(snapshotFull), { recursive: true })
  fs.writeFileSync(snapshotFull, content)
  // Leave a marker for Claude-side compaction to re-populate
  const stub = updateFrontmatter(content, { needs_compaction: true, last_snapshot: snapshotRel })
  fs.writeFileSync(full, stub)
  appendAudit(kbRoot, { op: 'hot-compact', agent_id: agentId, snapshot: snapshotRel, words })
  return { snapshot: snapshotRel, words }
}

// ─── Task-local working-memory retention ─────────────────────────────────────

/**
 * Archive completed working-memory files older than olderThanDays.
 * Files with status: completed are safe to archive once the task is closed.
 * Files with status: active are never touched.
 * Returns { archived: string[], skipped: number }
 */
export function archiveCompletedTaskMemory(kbRoot, agentId, tier, { olderThanDays = 7 } = {}) {
  const wmDir = path.join(kbRoot, `wiki/agents/${tier}s/${agentId}/working-memory`)
  if (!fs.existsSync(wmDir)) return { archived: [], skipped: 0 }

  const cutoff = Date.now() - olderThanDays * DAY_MS
  const archived = []
  let skipped = 0

  for (const f of fs.readdirSync(wmDir)) {
    if (!f.endsWith('.md')) continue
    const full = path.join(wmDir, f)
    try {
      const content = fs.readFileSync(full, 'utf8')
      const { data } = updateFrontmatter ? { data: {} } : { data: {} }
      const fm = parseFrontmatterLocal(content)
      if (fm.status !== 'completed') { skipped++; continue }
      const completedAt = Date.parse(fm.completed_at || fm.updated || fm.created || 0)
      if (completedAt && Date.now() - completedAt < olderThanDays * DAY_MS) { skipped++; continue }
      const rel = `wiki/agents/${tier}s/${agentId}/working-memory/${f}`
      const archiveRel = `wiki/archive/task-memory/${agentId}/${f}`
      archiveMove(kbRoot, rel, archiveRel)
      archived.push(archiveRel)
    } catch { skipped++ }
  }

  appendAudit(kbRoot, { op: 'task-memory-archive', agent_id: agentId, archived: archived.length, skipped })
  return { archived, skipped }
}

/**
 * Archive abandoned working-memory files older than olderThanDays.
 * Returns { archived: string[], skipped: number }
 */
export function archiveAbandonedTaskMemory(kbRoot, agentId, tier, { olderThanDays = 3 } = {}) {
  const wmDir = path.join(kbRoot, `wiki/agents/${tier}s/${agentId}/working-memory`)
  if (!fs.existsSync(wmDir)) return { archived: [], skipped: 0 }

  const archived = []
  let skipped = 0

  for (const f of fs.readdirSync(wmDir)) {
    if (!f.endsWith('.md')) continue
    const full = path.join(wmDir, f)
    try {
      const content = fs.readFileSync(full, 'utf8')
      const fm = parseFrontmatterLocal(content)
      if (fm.status !== 'abandoned') { skipped++; continue }
      const abandonedAt = Date.parse(fm.abandoned_at || fm.updated || 0)
      if (abandonedAt && Date.now() - abandonedAt < olderThanDays * DAY_MS) { skipped++; continue }
      const rel = `wiki/agents/${tier}s/${agentId}/working-memory/${f}`
      const archiveRel = `wiki/archive/task-memory/abandoned/${agentId}/${f}`
      archiveMove(kbRoot, rel, archiveRel)
      archived.push(archiveRel)
    } catch { skipped++ }
  }

  appendAudit(kbRoot, { op: 'task-memory-abandoned-archive', agent_id: agentId, archived: archived.length, skipped })
  return { archived, skipped }
}

// Minimal frontmatter reader to avoid circular dep with frontmatter.mjs
function parseFrontmatterLocal(content) {
  if (!content.startsWith('---\n')) return {}
  const end = content.indexOf('\n---', 4)
  if (end === -1) return {}
  const header = content.slice(4, end)
  const data = {}
  for (const line of header.split('\n')) {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/)
    if (!m) continue
    data[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
  }
  return data
}

// Task log rotation at 10k lines
export function rotateTaskLog(kbRoot, agentId, tier, threshold = 10000) {
  const rel = `wiki/agents/${tier}s/${agentId}/task-log.md`
  const full = path.join(kbRoot, rel)
  if (!fs.existsSync(full)) return { skipped: true }
  const content = fs.readFileSync(full, 'utf8')
  const lines = content.split('\n').length
  if (lines < threshold) return { skipped: true, lines }
  const snapshotRel = `wiki/archive/hot-snapshots/${agentId}/task-log-${timestamp()}.md`
  const snapshotFull = path.join(kbRoot, snapshotRel)
  fs.mkdirSync(path.dirname(snapshotFull), { recursive: true })
  fs.writeFileSync(snapshotFull, content)
  fs.writeFileSync(full, `---\nmemory_class: working\nagent: ${agentId}\nrotated_at: ${new Date().toISOString()}\n---\n\n`)
  appendAudit(kbRoot, { op: 'task-log-rotate', agent_id: agentId, snapshot: snapshotRel, lines })
  return { snapshot: snapshotRel, lines }
}
