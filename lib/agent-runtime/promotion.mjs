// Promotion workflow: promote bus items upward, merge approved rewrites into canonical docs.
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { parseFrontmatter, serializeFrontmatter, updateFrontmatter } from './frontmatter.mjs'
import { readBusItem, transitionBusItem } from './bus.mjs'
import { appendAudit } from './audit.mjs'
import { timestamp } from './ids.mjs'

function hash(s) {
  return crypto.createHash('sha256').update(s).digest('hex').slice(0, 16)
}

export function promoteLearning(kbRoot, { channel, id, targetPath, approver }) {
  const item = readBusItem(kbRoot, channel, id)
  if (!item) throw new Error(`Bus item not found: ${channel}/${id}`)
  if (item.meta.status === 'promoted' || item.meta.status === 'archived') {
    throw new Error(`Cannot promote item in state: ${item.meta.status}`)
  }

  const target = targetPath || `wiki/system/bus/standards/promoted-${id}.md`
  const targetFull = path.join(kbRoot, target)
  fs.mkdirSync(path.dirname(targetFull), { recursive: true })

  const promoted = serializeFrontmatter({
    memory_class: 'learned',
    promoted_from: id,
    promoted_by: approver || 'unknown',
    promoted_at: new Date().toISOString(),
    source_channel: channel,
    source_path: item.path,
    status: 'active',
    title: item.meta.title || `Promoted ${id}`,
  }, '\n' + (item.body || '').trim() + '\n\n---\n> Promoted from [[' + id + ']] on ' + new Date().toISOString().slice(0, 10) + '\n')

  fs.writeFileSync(targetFull, promoted)

  // Update source item to mark as promoted
  transitionBusItem(kbRoot, channel, id, 'promoted', approver || 'system')
  const srcContent = fs.readFileSync(path.join(kbRoot, item.path), 'utf8')
  const patched = updateFrontmatter(srcContent, { promoted_to: target })
  fs.writeFileSync(path.join(kbRoot, item.path), patched)

  appendAudit(kbRoot, { op: 'agent-promote', channel, id, target, approver })
  return { source: item.path, target, id }
}

// Merge an approved rewrite artifact into the canonical project document.
export function mergeRewrite(kbRoot, { rewritePath, canonicalPath, approver }) {
  const rwFull = path.join(kbRoot, rewritePath)
  if (!fs.existsSync(rwFull)) throw new Error(`Rewrite not found: ${rewritePath}`)
  const rwContent = fs.readFileSync(rwFull, 'utf8')
  const { data: rwMeta, content: rwBody } = parseFrontmatter(rwContent)

  if (rwMeta.status !== 'approved') {
    throw new Error(`Cannot merge rewrite in state: ${rwMeta.status}`)
  }

  const canFull = path.join(kbRoot, canonicalPath)
  let canonicalBefore = ''
  let canonicalMeta = {}
  if (fs.existsSync(canFull)) {
    canonicalBefore = fs.readFileSync(canFull, 'utf8')
    canonicalMeta = parseFrontmatter(canonicalBefore).data
  }

  const beforeHash = hash(canonicalBefore)

  // Snapshot previous canonical
  if (canonicalBefore) {
    const archiveRel = `wiki/archive/merges/${canonicalPath.replace(/\//g, '__')}-${timestamp()}.md`
    const archiveFull = path.join(kbRoot, archiveRel)
    fs.mkdirSync(path.dirname(archiveFull), { recursive: true })
    fs.writeFileSync(archiveFull, canonicalBefore)
  }

  // Write new canonical with provenance
  const newMeta = {
    ...canonicalMeta,
    merged_from: rewritePath,
    merged_by: approver || 'unknown',
    merged_at: new Date().toISOString(),
    updated: new Date().toISOString(),
  }
  const provenance = `\n\n---\n> Merged from \`${rewritePath}\` by ${approver || 'unknown'} on ${new Date().toISOString().slice(0, 10)}\n`
  const newContent = serializeFrontmatter(newMeta, '\n' + rwBody.trim() + provenance)
  fs.mkdirSync(path.dirname(canFull), { recursive: true })
  fs.writeFileSync(canFull, newContent)
  const afterHash = hash(newContent)

  // Mark rewrite as merged
  const rwPatched = updateFrontmatter(rwContent, {
    status: 'merged',
    merged_to: canonicalPath,
    merged_at: new Date().toISOString(),
  })
  fs.writeFileSync(rwFull, rwPatched)

  appendAudit(kbRoot, {
    op: 'rewrite-merge',
    rewrite: rewritePath,
    canonical: canonicalPath,
    approver,
    before_hash: beforeHash,
    after_hash: afterHash,
  })

  return { canonical: canonicalPath, rewrite: rewritePath, beforeHash, afterHash }
}
