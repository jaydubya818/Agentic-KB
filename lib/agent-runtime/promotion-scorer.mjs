/**
 * promotion-scorer.mjs — V2 promotion scoring and contradiction pre-check
 *
 * Replaces the binary pass/fail governance in promotion.mjs with a weighted
 * score that determines where a candidate should land:
 *   reject | working-only | review | learned | canonical
 *
 * Also runs a scoped contradiction pre-check before any wiki write.
 *
 * Used by: promotion.mjs (extended), mcp/server.js, cli/kb.js
 */

import fs from 'fs'
import path from 'path'
import { scoreFreshness, isFreshForCanonical, inferClass } from './freshness.mjs'
import { scoreTrust, resolveConfidence, getContractWeights } from './source-trust.mjs'
import { parseFrontmatter } from './frontmatter.mjs'

// ── Score weights ─────────────────────────────────────────────────────────────
const WEIGHTS = {
  evidence:          0.25,
  confidence:        0.25,
  freshness:         0.20,
  trust:             0.15,
  novelty:           0.10,
  explicit_approval: 0.05,
}

// ── Decision thresholds (overridable via contract governance_policy) ──────────
const DEFAULT_FLOORS = {
  learned:  0.55,
  review:   0.45,
  canonical: 0.75,
}

// ── Promotion decisions ───────────────────────────────────────────────────────
export const DECISIONS = {
  REJECT:       'reject',
  WORKING_ONLY: 'working-only',
  REVIEW:       'review',
  LEARNED:      'learned',
  CANONICAL:    'canonical',
}

// ─────────────────────────────────────────────────────────────────────────────
// Primary scoring API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Score a promotion candidate and return a decision.
 *
 * @param {string} kbRoot
 * @param {object} candidate - The bus item or learning candidate
 * @param {object} opts
 * @param {object} opts.contract - Agent contract (for governance_policy)
 * @param {string} [opts.targetPath] - Proposed wiki target path
 * @param {boolean} [opts.explicitApproval] - Jay explicitly approved this
 * @param {string} [opts.contradictionStatus] - 'none'|'suspected'|'confirmed'
 * @returns {PromotionScoreResult}
 */
export function scorePromotion(kbRoot, candidate, {
  contract = null,
  targetPath = null,
  explicitApproval = false,
  contradictionStatus = 'none',
} = {}) {
  const gov = contract?.governance_policy || {}
  const floors = {
    learned:   gov.promotion_score_floor?.learned   ?? DEFAULT_FLOORS.learned,
    review:    gov.promotion_score_floor?.review    ?? DEFAULT_FLOORS.review,
    canonical: gov.promotion_score_floor?.canonical ?? DEFAULT_FLOORS.canonical,
  }

  const breakdown = {}
  const reasons = []
  let hardReject = null

  // ── 1. Provenance gate (hard reject) ────────────────────────────────────
  if (!candidate.created_by && !candidate.agent_id) {
    hardReject = 'missing provenance: no created_by or agent_id'
  }
  if (!candidate.created_at) {
    hardReject = hardReject || 'missing provenance: no created_at timestamp'
  }

  // ── 2. Evidence score (normalized) ──────────────────────────────────────
  const evidenceCount = candidate.evidence_count || candidate.sources?.length || 0
  // Asymptotic: 1 source → 0.5, 2 → 0.75, 4 → 0.875, 8 → ~0.94
  breakdown.evidence = 1.0 - Math.pow(0.5, evidenceCount)
  if (evidenceCount === 0) reasons.push('no evidence sources')

  // ── 3. Confidence score ──────────────────────────────────────────────────
  breakdown.confidence = resolveConfidence(candidate.confidence, contract)
  if (breakdown.confidence < 0.50) reasons.push('low confidence')

  // ── 4. Freshness score (use first source if available) ───────────────────
  const sources = candidate.sources || candidate.related_sources || []
  let freshnessScore = 0.70 // default if no source paths
  if (sources.length > 0) {
    const freshScores = sources
      .filter(s => typeof s === 'string' && s.startsWith('wiki/'))
      .map(s => scoreFreshness(kbRoot, s).score)
    if (freshScores.length > 0) {
      freshnessScore = freshScores.reduce((a, b) => a + b, 0) / freshScores.length
    }
  }
  breakdown.freshness = freshnessScore
  if (freshnessScore < 0.40) reasons.push('stale or expired sources')

  // ── 5. Trust score (from candidate source class) ─────────────────────────
  const candidateClass = candidate.memory_class ||
    inferClass(candidate.path || candidate.proposed_target_path || '')
  const contractWeights = getContractWeights(contract)
  const baseClassWeight = contractWeights[candidateClass] ??
    contractWeights.unknown ?? 0.30
  breakdown.trust = Math.min(1.0, baseClassWeight * (breakdown.confidence || 0.5))
  if (breakdown.trust < 0.40) reasons.push('low source trust')

  // ── 6. Novelty score ─────────────────────────────────────────────────────
  let novelty = 0.75 // default: moderately novel
  if (targetPath) {
    const absTarget = path.join(kbRoot, targetPath)
    if (!fs.existsSync(absTarget)) {
      novelty = 1.0 // new page
    } else {
      novelty = 0.5 // extending existing page
    }
  }
  breakdown.novelty = novelty

  // ── 7. Explicit approval bonus ───────────────────────────────────────────
  breakdown.explicit_approval = explicitApproval ? 1.0 : 0.0

  // ── 8. Compute weighted score ────────────────────────────────────────────
  const score = Object.entries(WEIGHTS).reduce((sum, [key, weight]) => {
    return sum + (breakdown[key] ?? 0) * weight
  }, 0)

  // ── 9. Contradiction adjustment ──────────────────────────────────────────
  let effectiveScore = score
  let contradictionNote = null
  if (contradictionStatus === 'suspected') {
    effectiveScore = Math.max(0, score - 0.10)
    contradictionNote = 'score reduced 0.10 for suspected contradiction'
    reasons.push('suspected contradiction with existing content')
  } else if (contradictionStatus === 'confirmed') {
    contradictionNote = 'auto-canonical blocked: confirmed contradiction'
    reasons.push('confirmed contradiction — must resolve before canonical promotion')
  }

  // ── 10. Determine decision ────────────────────────────────────────────────
  let decision
  if (hardReject) {
    decision = DECISIONS.REJECT
    reasons.unshift(hardReject)
  } else if (contradictionStatus === 'confirmed') {
    // Confirmed contradiction — cannot auto-canonical; route to review or learned
    if (effectiveScore >= floors.learned) {
      decision = DECISIONS.REVIEW
    } else {
      decision = DECISIONS.WORKING_ONLY
    }
  } else if (effectiveScore >= floors.canonical) {
    // Check canonical hard gates
    const canonicalGateFailures = checkCanonicalGates(kbRoot, candidate, {
      targetPath, contract, freshnessRequired: gov.freshness_required_for_canonical,
    })
    if (canonicalGateFailures.length > 0) {
      decision = DECISIONS.REVIEW
      reasons.push(...canonicalGateFailures)
    } else {
      decision = DECISIONS.CANONICAL
    }
  } else if (effectiveScore >= floors.learned) {
    // Check if category requires review
    const requiresReview = (gov.review_required_for || [])
      .includes(candidate.category || candidateClass)
    decision = requiresReview ? DECISIONS.REVIEW : DECISIONS.LEARNED
    if (requiresReview) reasons.push(`category '${candidate.category || candidateClass}' requires human review`)
  } else if (effectiveScore >= floors.review) {
    decision = DECISIONS.REVIEW
  } else if (effectiveScore > 0) {
    decision = DECISIONS.WORKING_ONLY
  } else {
    decision = DECISIONS.REJECT
  }

  return {
    score: Math.round(effectiveScore * 1000) / 1000,
    rawScore: Math.round(score * 1000) / 1000,
    decision,
    breakdown,
    reasons,
    contradictionStatus,
    contradictionNote,
    floors,
    weights: WEIGHTS,
  }
}

// ── Canonical hard gates ──────────────────────────────────────────────────────
function checkCanonicalGates(kbRoot, candidate, { targetPath, contract, freshnessRequired }) {
  const failures = []
  const gov = contract?.governance_policy || {}

  const minConf = gov.min_confidence_for_canonical ?? 0.80
  const minEvidence = gov.min_evidence_for_canonical ?? 2
  const numConf = resolveConfidence(candidate.confidence, contract)

  if (numConf < minConf) {
    failures.push(`confidence ${numConf.toFixed(2)} below canonical floor ${minConf}`)
  }

  const evidenceCount = candidate.evidence_count || candidate.sources?.length || 0
  if (evidenceCount < minEvidence) {
    failures.push(`evidence count ${evidenceCount} below canonical minimum ${minEvidence}`)
  }

  if (freshnessRequired && targetPath) {
    const sources = candidate.sources || candidate.related_sources || []
    const stale = sources
      .filter(s => typeof s === 'string' && s.startsWith('wiki/'))
      .some(s => !isFreshForCanonical(kbRoot, s))
    if (stale) {
      failures.push('one or more supporting sources are stale — revalidation required')
    }
  }

  return failures
}

// ─────────────────────────────────────────────────────────────────────────────
// Contradiction pre-check
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Run a scoped contradiction pre-check before promotion.
 *
 * Checks:
 *   1. wiki/hot.md for matching terms
 *   2. Pages in same subdirectory as targetPath with overlapping tags
 *   3. related_sources pages (first 15 lines each)
 *
 * Returns contradiction status and any conflicting page paths.
 *
 * @param {string} kbRoot
 * @param {object} candidate - bus item or candidate learning
 * @param {object} opts
 * @param {string} [opts.targetPath]
 * @returns {{ status: string, conflictingPages: string[] }}
 */
export function checkContradictions(kbRoot, candidate, { targetPath } = {}) {
  const title = (candidate.title || '').toLowerCase()
  const tags = candidate.tags || []
  const body = candidate.body || candidate.summary || ''
  const conflictingPages = []

  // ── Check 1: hot cache ───────────────────────────────────────────────────
  const hotPath = path.join(kbRoot, 'wiki', 'hot.md')
  if (fs.existsSync(hotPath)) {
    const hotContent = fs.readFileSync(hotPath, 'utf8').toLowerCase()
    if (_hasConflict(title, tags, body, hotContent)) {
      conflictingPages.push('wiki/hot.md')
    }
  }

  // ── Check 2: pages in same target subdirectory ───────────────────────────
  if (targetPath) {
    const targetDir = path.join(kbRoot, path.dirname(targetPath))
    if (fs.existsSync(targetDir)) {
      const siblings = fs.readdirSync(targetDir)
        .filter(f => f.endsWith('.md'))
        .slice(0, 20) // cap scan
      for (const sibling of siblings) {
        const sibPath = path.join(targetDir, sibling)
        try {
          const content = fs.readFileSync(sibPath, 'utf8')
          const fm = parseFrontmatter(content.slice(0, 512))
          const sibTags = fm.tags || []
          const overlap = tags.filter(t => sibTags.includes(t))
          if (overlap.length >= 2 && _hasConflict(title, tags, body, content.slice(0, 800).toLowerCase())) {
            const rel = path.relative(kbRoot, sibPath)
            conflictingPages.push(rel)
          }
        } catch (_) { /* skip unreadable */ }
      }
    }
  }

  // ── Check 3: related_sources ─────────────────────────────────────────────
  const sources = candidate.related_sources || candidate.sources || []
  for (const src of sources.filter(s => typeof s === 'string' && s.startsWith('wiki/'))) {
    const absPath = path.join(kbRoot, src)
    if (fs.existsSync(absPath)) {
      try {
        const content = fs.readFileSync(absPath, 'utf8').slice(0, 1000).toLowerCase()
        if (_hasConflict(title, tags, body, content)) {
          conflictingPages.push(src)
        }
      } catch (_) { /* skip */ }
    }
  }

  // ── Determine status ──────────────────────────────────────────────────────
  const unique = [...new Set(conflictingPages)]
  let status = 'none'
  if (unique.length >= 2) status = 'suspected'
  if (unique.length >= 1 && _hasStrongConflict(body)) status = 'confirmed'
  if (unique.length > 0 && status === 'none') status = 'suspected'

  return { status, conflictingPages: unique }
}

// ── Heuristic conflict detection ─────────────────────────────────────────────
// Not semantic — uses negation patterns and opposing key terms.
const NEGATION_PATTERNS = [
  /\bnot\b/, /\bnever\b/, /\bno\b/, /\bdon't\b/, /\bdon't\b/,
  /\bavoid\b/, /\bagainst\b/, /\bwrong\b/, /\bincorrect\b/, /\bfalse\b/,
]
const OPPOSING_PAIRS = [
  ['always', 'never'], ['yes', 'no'], ['true', 'false'],
  ['preferred', 'avoid'], ['recommended', 'deprecated'],
  ['use', "don't use"], ['enable', 'disable'],
]

function _hasConflict(title, tags, body, existingContent) {
  const titleWords = title.split(/\s+/).filter(w => w.length > 4)
  const matches = titleWords.filter(w => existingContent.includes(w))
  return matches.length >= Math.max(1, Math.floor(titleWords.length * 0.4))
}

function _hasStrongConflict(body) {
  const lower = body.toLowerCase()
  return NEGATION_PATTERNS.some(re => re.test(lower)) &&
    OPPOSING_PAIRS.some(([a, b]) => lower.includes(a) && lower.includes(b))
}

// ── @typedef ─────────────────────────────────────────────────────────────────
/**
 * @typedef {object} PromotionScoreResult
 * @property {number} score - Effective score after adjustments (0.0–1.0)
 * @property {number} rawScore - Score before contradiction adjustment
 * @property {string} decision - One of DECISIONS.*
 * @property {object} breakdown - Per-dimension scores
 * @property {string[]} reasons - Explanation strings
 * @property {string} contradictionStatus - 'none'|'suspected'|'confirmed'
 * @property {string|null} contradictionNote
 * @property {object} floors - Threshold values used
 * @property {object} weights - Weight map used
 */
