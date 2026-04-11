/**
 * correction-capture.mjs — V2 correction event capture
 *
 * When Jay/Jarrett rewrites, tightens, corrects, or redirects Sofie's output,
 * this module stores a structured correction event so the system can learn
 * from it rather than losing the signal.
 *
 * Corrections live at: wiki/agents/leads/{agent}/corrections/{id}.md
 * They can optionally be promoted as candidates to learned/ or the bus.
 *
 * Correction types:
 *   factual-correction | tone-correction | preference-correction |
 *   workflow-correction | prioritization-correction | architecture-correction
 *
 * Durability classes:
 *   ephemeral | session | learned | canonical
 */

import fs from 'fs'
import path from 'path'
import { timestamp } from './ids.mjs'
import { resolveConfidence } from './source-trust.mjs'

// ── Valid correction types ────────────────────────────────────────────────────
export const CORRECTION_TYPES = [
  'factual-correction',
  'tone-correction',
  'preference-correction',
  'workflow-correction',
  'prioritization-correction',
  'architecture-correction',
]

// ── Valid durability classes ──────────────────────────────────────────────────
export const DURABILITY_CLASSES = ['ephemeral', 'session', 'learned', 'canonical']

// ─────────────────────────────────────────────────────────────────────────────
// captureCorrection
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Record a correction event for an agent.
 *
 * @param {string} kbRoot
 * @param {object} contract - Agent contract
 * @param {object} opts
 * @param {string} opts.type - Correction type (from CORRECTION_TYPES)
 * @param {string} opts.original - Original output/behavior being corrected
 * @param {string} opts.correctedTo - The corrected version
 * @param {string} [opts.taskId] - Active task ID if available
 * @param {string} [opts.context] - Additional context about what triggered the correction
 * @param {string|number} [opts.confidence] - How confident we are this is durable (high/medium/low or 0-1)
 * @param {string} [opts.durability] - ephemeral|session|learned|canonical
 * @param {boolean} [opts.promoteCandidate] - Whether this should enter the bus as a candidate
 * @param {string[]} [opts.sources] - Related wiki pages or raw/ paths
 * @returns {{ correctionId: string, path: string }}
 */
export function captureCorrection(kbRoot, contract, {
  type,
  original,
  correctedTo,
  taskId = null,
  context = '',
  confidence = 'medium',
  durability = null,
  promoteCandidate = false,
  sources = [],
} = {}) {
  if (!CORRECTION_TYPES.includes(type)) {
    throw new Error(`Invalid correction type: '${type}'. Must be one of: ${CORRECTION_TYPES.join(', ')}`)
  }
  if (!original || !correctedTo) {
    throw new Error('captureCorrection requires both original and correctedTo')
  }

  const agentId = contract.agent_id
  const tier = contract.tier
  const correctionId = `correction-${timestamp()}`
  const now = new Date().toISOString()

  // Resolve durability from contract default if not provided
  const defaultDurability = contract.memory_policy?.correction_durability_default || 'session'
  const effectiveDurability = durability || defaultDurability

  const numConf = resolveConfidence(confidence, contract)

  // ── Write correction file ─────────────────────────────────────────────────
  const correctionsDir = path.join(kbRoot, 'wiki', 'agents', tier + 's', agentId, 'corrections')
  fs.mkdirSync(correctionsDir, { recursive: true })

  const correctionPath = path.join(correctionsDir, `${correctionId}.md`)
  const relPath = path.relative(kbRoot, correctionPath)

  const content = [
    '---',
    `correction_id: ${correctionId}`,
    `agent_id: ${agentId}`,
    taskId ? `task_id: ${taskId}` : null,
    `type: ${type}`,
    `durability: ${effectiveDurability}`,
    `confidence: ${typeof confidence === 'string' ? confidence : numConf.toFixed(2)}`,
    `confidence_numeric: ${numConf.toFixed(3)}`,
    `promote_candidate: ${promoteCandidate}`,
    `captured_at: ${now}`,
    sources.length > 0 ? `sources:\n${sources.map(s => `  - ${s}`).join('\n')}` : null,
    '---',
    '',
    `# Correction: ${type}`,
    '',
    `**Captured:** ${now}`,
    `**Agent:** ${agentId} (${tier})`,
    taskId ? `**Task:** ${taskId}` : null,
    `**Durability:** ${effectiveDurability}`,
    `**Confidence:** ${confidence} (${numConf.toFixed(2)})`,
    `**Promote candidate:** ${promoteCandidate}`,
    '',
    '## Original',
    '',
    original.trim(),
    '',
    '## Corrected To',
    '',
    correctedTo.trim(),
    '',
    context ? `## Context\n\n${context.trim()}\n` : null,
    sources.length > 0 ? `## Related Sources\n\n${sources.map(s => `- [[${s}]]`).join('\n')}\n` : null,
    '## Promotion Status',
    '',
    `- promote_candidate: ${promoteCandidate}`,
    '- promotion_state: pending',
    '- review_item: null',
    '',
  ].filter(l => l !== null).join('\n')

  fs.writeFileSync(correctionPath, content, 'utf8')

  return { correctionId, path: relPath }
}

// ─────────────────────────────────────────────────────────────────────────────
// listCorrections
// ─────────────────────────────────────────────────────────────────────────────

/**
 * List corrections for an agent, optionally filtered.
 *
 * @param {string} kbRoot
 * @param {object} contract
 * @param {object} [opts]
 * @param {string} [opts.type] - Filter by correction type
 * @param {string} [opts.durability] - Filter by durability class
 * @param {boolean} [opts.promoteCandidatesOnly] - Only return promote_candidate: true
 * @param {number} [opts.since] - Only corrections after this timestamp (ms)
 * @returns {Array<CorrectionMeta>}
 */
export function listCorrections(kbRoot, contract, {
  type = null,
  durability = null,
  promoteCandidatesOnly = false,
  since = null,
} = {}) {
  const { agentId, tier } = { agentId: contract.agent_id, tier: contract.tier }
  const correctionsDir = path.join(kbRoot, 'wiki', 'agents', tier + 's', agentId, 'corrections')

  if (!fs.existsSync(correctionsDir)) return []

  const files = fs.readdirSync(correctionsDir)
    .filter(f => f.startsWith('correction-') && f.endsWith('.md'))
    .sort()

  const results = []
  for (const file of files) {
    const absPath = path.join(correctionsDir, file)
    try {
      const raw = fs.readFileSync(absPath, 'utf8').slice(0, 1024)
      const fm = parseFrontmatterSimple(raw)
      if (type && fm.type !== type) continue
      if (durability && fm.durability !== durability) continue
      if (promoteCandidatesOnly && fm.promote_candidate !== true && fm.promote_candidate !== 'true') continue
      if (since && fm.captured_at) {
        const ts = new Date(fm.captured_at).getTime()
        if (ts < since) continue
      }
      results.push({
        correctionId: fm.correction_id,
        agentId: fm.agent_id,
        taskId: fm.task_id || null,
        type: fm.type,
        durability: fm.durability,
        confidence: fm.confidence,
        confidenceNumeric: parseFloat(fm.confidence_numeric || '0.5'),
        promoteCandidate: fm.promote_candidate === true || fm.promote_candidate === 'true',
        capturedAt: fm.captured_at,
        path: path.relative(kbRoot, absPath),
      })
    } catch (_) { /* skip unreadable */ }
  }

  return results
}

/**
 * Read a single correction by ID.
 *
 * @param {string} kbRoot
 * @param {object} contract
 * @param {string} correctionId
 * @returns {{ meta: CorrectionMeta, content: string } | null}
 */
export function getCorrection(kbRoot, contract, correctionId) {
  const { agentId, tier } = { agentId: contract.agent_id, tier: contract.tier }
  const correctionPath = path.join(
    kbRoot, 'wiki', 'agents', tier + 's', agentId, 'corrections', `${correctionId}.md`
  )
  if (!fs.existsSync(correctionPath)) return null

  const content = fs.readFileSync(correctionPath, 'utf8')
  const fm = parseFrontmatterSimple(content.slice(0, 1024))
  return {
    meta: {
      correctionId: fm.correction_id,
      agentId: fm.agent_id,
      taskId: fm.task_id || null,
      type: fm.type,
      durability: fm.durability,
      confidence: fm.confidence,
      promoteCandidate: fm.promote_candidate === true || fm.promote_candidate === 'true',
      capturedAt: fm.captured_at,
      path: path.relative(kbRoot, correctionPath),
    },
    content,
  }
}

// ── Simple frontmatter parser for corrections (avoids circular import) ────────
function parseFrontmatterSimple(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  const result = {}
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':')
    if (colon === -1) continue
    const key = line.slice(0, colon).trim()
    const val = line.slice(colon + 1).trim()
    if (val === 'true') result[key] = true
    else if (val === 'false') result[key] = false
    else result[key] = val
  }
  return result
}

/**
 * @typedef {object} CorrectionMeta
 * @property {string} correctionId
 * @property {string} agentId
 * @property {string|null} taskId
 * @property {string} type
 * @property {string} durability
 * @property {string} confidence
 * @property {number} confidenceNumeric
 * @property {boolean} promoteCandidate
 * @property {string} capturedAt
 * @property {string} path
 */
