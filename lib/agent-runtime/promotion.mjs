// Promotion workflow: promote bus items upward, merge approved rewrites into canonical docs.
//
// Phase 4 upgrades:
//   - Contract-driven approver tier validation
//   - Duplicate-title detection before writing promoted artifacts
//   - Target-path collision handling (requires explicit supersedes)
//   - Promotion metadata: promotion_reason, source_task_id, reviewed_by, supersedes, duplicate_of
//   - Two clearly separated flows: promoteDiscovery (bus → standards/learned) and mergeRewrite
//   - State preconditions: only promotable statuses can move forward
//
// V2 upgrades:
//   - Promotion scorer runs before any write (score, decision, breakdown)
//   - Contradiction pre-check routes to review bus channel if conflict detected
//   - Score and decision are recorded in the promoted artifact's frontmatter
//   - skipScorer: true bypasses V2 scoring for backward compat

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { parseFrontmatter, serializeFrontmatter, updateFrontmatter } from './frontmatter.mjs'
import { readBusItem, transitionBusItem, listBusItems, publishReviewItem } from './bus.mjs'
import { loadContract } from './contracts.mjs'
import { appendAudit } from './audit.mjs'
import { timestamp } from './ids.mjs'
import { scorePromotion, checkContradictions, DECISIONS } from './promotion-scorer.mjs'

function hash(s) {
  return crypto.createHash('sha256').update(s).digest('hex').slice(0, 16)
}

// ─── Approver validation ──────────────────────────────────────────────────────

const TIER_RANK = { worker: 1, lead: 2, orchestrator: 3 }

/**
 * Validate that the approver meets the minimum tier required to approve this operation.
 * If contract defines promotion_policy.min_approver_tier, enforce it.
 * Falls back to requiring at least 'lead' if no policy is set.
 */
function validateApprover(kbRoot, approver, contract, { requiredTier = 'lead' } = {}) {
  if (!approver) throw new Error('Promotion requires an approver identity')

  // Try to load approver's contract; if not found, allow humans (non-agent approvers)
  let approverTier = null
  try {
    const approverContract = loadContract(kbRoot, approver)
    approverTier = approverContract.tier
  } catch {
    // Not an agent — assume human approver; humans bypass tier checks
    return { kind: 'human', id: approver }
  }

  const minTier = contract?.promotion_policy?.min_approver_tier || requiredTier
  const minRank = TIER_RANK[minTier] || 2
  const approverRank = TIER_RANK[approverTier] || 0

  if (approverRank < minRank) {
    throw new Error(
      `Approver ${approver} (tier: ${approverTier}) does not meet minimum tier requirement: ${minTier}`
    )
  }

  return { kind: 'agent', id: approver, tier: approverTier }
}

// ─── Duplicate detection ──────────────────────────────────────────────────────

/**
 * Scan wiki/system/bus/standards/ and wiki/agents/**\/gotchas.md for matching titles.
 * Returns the first duplicate found, or null.
 */
function findDuplicateTitle(kbRoot, title, channel, excludeId = null) {
  if (!title) return null
  const normalised = title.trim().toLowerCase()

  const dirsToScan = [
    path.join(/* turbopackIgnore: true */ kbRoot, 'wiki', 'system', 'bus', 'standards'),
    path.join(/* turbopackIgnore: true */ kbRoot, 'wiki', 'system', 'bus', channel),
  ]

  for (const dir of dirsToScan) {
    if (!fs.existsSync(/* turbopackIgnore: true */ dir)) continue
    for (const f of fs.readdirSync(/* turbopackIgnore: true */ dir)) {
      if (!f.endsWith('.md')) continue
      // Skip the source item itself to avoid self-match during promotion
      if (excludeId && f === `${excludeId}.md`) continue
      let content
      try {
        content = fs.readFileSync(path.join(/* turbopackIgnore: true */ dir, f), 'utf8')
      } catch (err) {
        // Unreadable (perms, races). Skip without mistaking for a parse issue.
        console.error('[promotion] read failed for', f + ':', err && err.message)
        continue
      }
      try {
        const { data } = parseFrontmatter(content)
        const candidateTitle = (data.title || '').trim().toLowerCase()
        if (candidateTitle && candidateTitle === normalised) {
          return path.join('wiki/system/bus', channel === 'standards' ? 'standards' : channel, f)
        }
      } catch (err) {
        console.error('[promotion] frontmatter parse failed for', f + ':', err && err.message)
      }
    }
  }
  return null
}

// ─── Target path collision check ─────────────────────────────────────────────

function checkTargetCollision(kbRoot, targetPath, { supersedes } = {}) {
  const full = path.join(/* turbopackIgnore: true */ kbRoot, targetPath)
  if (!fs.existsSync(/* turbopackIgnore: true */ full)) return  // no collision

  if (!supersedes) {
    throw new Error(
      `Target path already exists: ${targetPath}. Provide supersedes: '<existing-path>' to explicitly replace it.`
    )
  }
  // supersedes is set — archive the existing file before overwriting
  const archiveRel = `wiki/archive/superseded/${targetPath.replace(/\//g, '__')}-${timestamp()}.md`
  const archiveFull = path.join(/* turbopackIgnore: true */ kbRoot, archiveRel)
  fs.mkdirSync(/* turbopackIgnore: true */ path.dirname(archiveFull), { recursive: true })
  fs.copyFileSync(/* turbopackIgnore: true */ full, /* turbopackIgnore: true */ archiveFull)
  appendAudit(kbRoot, { op: 'supersede-archive', original: targetPath, archive: archiveRel, supersedes })
}

// ─── Promotable status check ──────────────────────────────────────────────────

const PROMOTABLE_STATUSES = new Set(['open', 'acknowledged', 'in_progress', 'resolved'])

function assertPromotable(status, id) {
  if (!PROMOTABLE_STATUSES.has(status)) {
    throw new Error(`Cannot promote item ${id} in state: ${status}. Must be one of: ${[...PROMOTABLE_STATUSES].join(', ')}`)
  }
}

// ─── promoteDiscovery ─────────────────────────────────────────────────────────

/**
 * Flow 1: Discovery/escalation bus item → standards/learned artifact.
 *
 * @param {string} kbRoot
 * @param {object} opts
 *   - channel: 'discovery' | 'escalation' | 'standards'
 *   - id: bus item id
 *   - approver: agent_id or human name
 *   - targetPath?: explicit target path (auto-generated if omitted)
 *   - promotionReason?: why this is being promoted
 *   - sourceTaskId?: task that produced this discovery
 *   - supersedes?: existing path this promotion replaces
 *   - duplicateOf?: if set, marks this as a known duplicate and skips
 * @returns {{ source, target, id, approver, duplicate?: boolean }}
 */
export function promoteDiscovery(kbRoot, opts = {}) {
  const {
    channel,
    id,
    approver,
    targetPath,
    promotionReason = '',
    sourceTaskId = null,
    supersedes = null,
    duplicateOf = null,
    contract = null,
    // V2 options
    skipScorer = false,          // bypass scoring for backward compat
    explicitApproval = false,    // Jay explicitly approved
  } = opts

  const item = readBusItem(kbRoot, channel, id)
  if (!item) throw new Error(`Bus item not found: ${channel}/${id}`)

  assertPromotable(item.meta.status, id)

  // Validate approver tier
  validateApprover(kbRoot, approver, contract, { requiredTier: 'lead' })

  // Duplicate detection (exclude the source item itself from the scan)
  const itemTitle = item.meta.title || ''
  if (!duplicateOf) {
    const dup = findDuplicateTitle(kbRoot, itemTitle, channel, id)
    if (dup) {
      throw new Error(
        `Duplicate title detected: "${itemTitle}" already exists at ${dup}. ` +
        `Provide duplicateOf: '${dup}' to explicitly acknowledge the duplicate, or change the title.`
      )
    }
  }

  const target = targetPath || `wiki/system/bus/standards/promoted-${id}.md`

  // Target collision check
  checkTargetCollision(kbRoot, target, { supersedes })

  // ── V2: Contradiction pre-check + promotion scoring ─────────────────────
  // Scorer requires a contract for governance thresholds; skip if none provided
  let scoreResult = null
  let contradictionResult = { status: 'none', conflictingPages: [] }

  if (!skipScorer && contract) {
    // 1. Contradiction pre-check
    contradictionResult = checkContradictions(kbRoot, {
      title: itemTitle,
      tags: item.meta.tags || [],
      body: item.body || '',
      related_sources: item.meta.related_sources || [],
    }, { targetPath: target })

    // 2. Score the promotion
    const candidate = {
      ...item.meta,
      body: item.body,
      created_by: item.meta.from || item.meta.created_by,
      created_at: item.meta.created_at,
      confidence: item.meta.confidence || 'medium',
      sources: item.meta.related_sources || [],
      evidence_count: item.meta.evidence_count || 0,
      memory_class: 'bus',
    }
    scoreResult = scorePromotion(kbRoot, candidate, {
      contract,
      targetPath: target,
      explicitApproval,
      contradictionStatus: contradictionResult.status,
    })

    // 3. Route to review channel if scorer says so
    if (scoreResult.decision === DECISIONS.REVIEW || scoreResult.decision === DECISIONS.REJECT) {
      const reviewItem = publishReviewItem(kbRoot, {
        from: approver || 'system',
        candidatePath: item.path,
        conflictingPages: contradictionResult.conflictingPages,
        contradictionStatus: contradictionResult.status,
        title: `[review] ${itemTitle}`,
        body: [
          `**Promotion blocked — routed to review**`,
          `Decision: ${scoreResult.decision}`,
          `Score: ${scoreResult.score}`,
          `Reasons: ${scoreResult.reasons.join('; ')}`,
          '',
          `Original item: [[${item.path}]]`,
          contradictionResult.conflictingPages.length > 0
            ? `Conflicts with: ${contradictionResult.conflictingPages.map(p => `[[${p}]]`).join(', ')}`
            : '',
        ].filter(Boolean).join('\n'),
        confidence: item.meta.confidence,
        proposedTargetPath: target,
        scoreResult,
      })

      appendAudit(kbRoot, {
        op: 'promote-blocked',
        channel,
        id,
        reason: scoreResult.decision,
        score: scoreResult.score,
        reviewPath: reviewItem.path,
      })

      return {
        blocked: true,
        decision: scoreResult.decision,
        score: scoreResult.score,
        reasons: scoreResult.reasons,
        reviewPath: reviewItem.path,
        contradictionStatus: contradictionResult.status,
        conflictingPages: contradictionResult.conflictingPages,
      }
    }
  }
  // ── end V2 scoring ────────────────────────────────────────────────────────

  const now = new Date().toISOString()
  const targetFull = path.join(/* turbopackIgnore: true */ kbRoot, target)
  fs.mkdirSync(/* turbopackIgnore: true */ path.dirname(targetFull), { recursive: true })

  const promoted = serializeFrontmatter({
    memory_class: scoreResult?.decision === DECISIONS.CANONICAL ? 'canonical' : 'learned',
    promoted_from: id,
    promoted_by: approver,
    promoted_at: now,
    source_channel: channel,
    source_path: item.path,
    source_task_id: sourceTaskId || null,
    promotion_reason: promotionReason || null,
    duplicate_of: duplicateOf || null,
    supersedes: supersedes || null,
    status: 'active',
    title: itemTitle || `Promoted ${id}`,
    // V2 provenance
    promotion_score: scoreResult?.score ?? null,
    promotion_decision: scoreResult?.decision ?? null,
    contradiction_status: contradictionResult.status,
    explicit_approval: explicitApproval || false,
  }, '\n' + (item.body || '').trim() + '\n\n---\n> Promoted from [[' + id + ']] by ' + approver + ' on ' + now.slice(0, 10) + '\n')

  fs.writeFileSync(/* turbopackIgnore: true */ targetFull, promoted)

  // Transition source to promoted and record target
  transitionBusItem(kbRoot, channel, id, 'promoted', approver)
  const srcContent = fs.readFileSync(path.join(/* turbopackIgnore: true */ kbRoot, item.path), 'utf8')
  fs.writeFileSync(
    path.join(/* turbopackIgnore: true */ kbRoot, item.path),
    updateFrontmatter(srcContent, {
      promoted_to: target,
      reviewed_by: approver,
      promotion_reason: promotionReason || null,
    })
  )

  appendAudit(kbRoot, {
    op: 'agent-promote',
    channel,
    id,
    target,
    approver,
    promotion_reason: promotionReason || null,
    source_task_id: sourceTaskId || null,
  })

  return { source: item.path, target, id, approver }
}

// ─── Backward-compatible alias ────────────────────────────────────────────────
// promoteLearning remains for existing callers; delegates to promoteDiscovery.

export function promoteLearning(kbRoot, { channel, id, targetPath, approver }) {
  return promoteDiscovery(kbRoot, { channel, id, targetPath, approver })
}

// ─── mergeRewrite ─────────────────────────────────────────────────────────────

/**
 * Flow 2: Approved rewrite artifact → canonical project document.
 *
 * Enhancements over v1:
 *   - Approver tier validation via contract promotion_policy
 *   - Explicit supersedes required if canonical already exists (unless force: true)
 *   - Promotion metadata in merged canonical (merged_from, merged_by, source_task_id, supersedes)
 *   - Merge precondition: rewrite must be in 'approved' state
 *
 * @returns {{ canonical, rewrite, beforeHash, afterHash, approver }}
 */
export function mergeRewrite(kbRoot, {
  rewritePath,
  canonicalPath,
  approver,
  promotionReason = '',
  sourceTaskId = null,
  supersedes = null,
  force = false,
  contract = null,
}) {
  const rwFull = path.join(/* turbopackIgnore: true */ kbRoot, rewritePath)
  if (!fs.existsSync(/* turbopackIgnore: true */ rwFull)) throw new Error(`Rewrite not found: ${rewritePath}`)

  const rwContent = fs.readFileSync(/* turbopackIgnore: true */ rwFull, 'utf8')
  const { data: rwMeta, content: rwBody } = parseFrontmatter(rwContent)

  if (rwMeta.status !== 'approved') {
    throw new Error(`Cannot merge rewrite in state: ${rwMeta.status}`)
  }

  // Validate approver tier (merges require at least lead)
  validateApprover(kbRoot, approver, contract, { requiredTier: 'lead' })

  const canFull = path.join(/* turbopackIgnore: true */ kbRoot, canonicalPath)
  let canonicalBefore = ''
  let canonicalMeta = {}

  if (fs.existsSync(/* turbopackIgnore: true */ canFull)) {
    canonicalBefore = fs.readFileSync(/* turbopackIgnore: true */ canFull, 'utf8')
    canonicalMeta = parseFrontmatter(canonicalBefore).data

    // Require explicit supersedes unless force is set
    if (!supersedes && !force) {
      throw new Error(
        `Canonical path already exists: ${canonicalPath}. ` +
        `Provide supersedes: '${canonicalPath}' to confirm the replacement, or use force: true.`
      )
    }
  }

  const beforeHash = hash(canonicalBefore)
  const now = new Date().toISOString()

  // Snapshot previous canonical to archive
  if (canonicalBefore) {
    const archiveRel = `wiki/archive/merges/${canonicalPath.replace(/\//g, '__')}-${timestamp()}.md`
    const archiveFull = path.join(/* turbopackIgnore: true */ kbRoot, archiveRel)
    fs.mkdirSync(/* turbopackIgnore: true */ path.dirname(archiveFull), { recursive: true })
    fs.writeFileSync(/* turbopackIgnore: true */ archiveFull, canonicalBefore)
    appendAudit(kbRoot, { op: 'canonical-snapshot', canonical: canonicalPath, archive: archiveRel })
  }

  // Write new canonical with full provenance metadata
  const newMeta = {
    ...canonicalMeta,
    merged_from: rewritePath,
    merged_by: approver,
    merged_at: now,
    source_task_id: sourceTaskId || null,
    promotion_reason: promotionReason || null,
    supersedes: supersedes || null,
    updated: now,
  }
  const provenance = `\n\n---\n> Merged from \`${rewritePath}\` by ${approver} on ${now.slice(0, 10)}${promotionReason ? ' — ' + promotionReason : ''}\n`
  const newContent = serializeFrontmatter(newMeta, '\n' + rwBody.trim() + provenance)
  fs.mkdirSync(/* turbopackIgnore: true */ path.dirname(canFull), { recursive: true })
  fs.writeFileSync(/* turbopackIgnore: true */ canFull, newContent)
  const afterHash = hash(newContent)

  // Seal rewrite as merged with back-reference
  fs.writeFileSync(/* turbopackIgnore: true */ rwFull, updateFrontmatter(rwContent, {
    status: 'merged',
    merged_to: canonicalPath,
    merged_by: approver,
    merged_at: now,
    promotion_reason: promotionReason || null,
  }))

  appendAudit(kbRoot, {
    op: 'rewrite-merge',
    rewrite: rewritePath,
    canonical: canonicalPath,
    approver,
    source_task_id: sourceTaskId || null,
    promotion_reason: promotionReason || null,
    before_hash: beforeHash,
    after_hash: afterHash,
  })

  return { canonical: canonicalPath, rewrite: rewritePath, beforeHash, afterHash, approver }
}
