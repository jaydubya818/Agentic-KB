// Hot → Learned summarization hook.
// Runs after every successful closeTask that touched hot.md.
// Writes a dated learned snapshot to wiki/agents/{tier}s/{agent}/learned/hot-digest/.
// Summarizer is pluggable; default is heading/bullet extraction (zero dep, no LLM).
import fs from 'fs'
import path from 'path'
import { parseFrontmatter, serializeFrontmatter } from './frontmatter.mjs'
import { timestamp } from './ids.mjs'

let SUMMARIZER = defaultSummarizer

export function registerHotLearnedSummarizer(fn) {
  if (typeof fn === 'function') SUMMARIZER = fn
}

export function resetHotLearnedSummarizer() { SUMMARIZER = defaultSummarizer }

// Extract headings + first-line-of-bullet as digest. Deterministic, zero-dep.
function defaultSummarizer({ content }) {
  const { content: body } = parseFrontmatter(content)
  const lines = (body || content).split('\n')
  const out = []
  for (const raw of lines) {
    const l = raw.trim()
    if (!l) continue
    if (/^#{1,6}\s+/.test(l)) out.push(l)
    else if (/^[-*+]\s+/.test(l)) out.push(l)
  }
  // Cap to 60 lines to keep digests small.
  return out.slice(0, 60).join('\n')
}

export function summarizeHotToLearned(kbRoot, contract, { minWords = 40 } = {}) {
  const tier = contract.tier
  const agentId = contract.agent_id
  const hotRel = `wiki/agents/${tier}s/${agentId}/hot.md`
  const hotFull = path.join(kbRoot, hotRel)
  if (!fs.existsSync(hotFull)) return { skipped: true, reason: 'no hot.md' }
  const content = fs.readFileSync(hotFull, 'utf8')
  const words = content.split(/\s+/).filter(Boolean).length
  if (words < minWords) return { skipped: true, reason: 'below minWords', words }

  const summary = SUMMARIZER({ content, agent_id: agentId, tier, kbRoot })
  if (!summary || !summary.trim()) return { skipped: true, reason: 'empty summary' }

  const ts = timestamp()
  const learnedRel = `wiki/agents/${tier}s/${agentId}/learned/hot-digest/${ts}.md`
  const learnedFull = path.join(kbRoot, learnedRel)
  fs.mkdirSync(path.dirname(learnedFull), { recursive: true })
  const fm = {
    memory_class: 'learned',
    agent_id: agentId,
    source: hotRel,
    generated_at: new Date().toISOString(),
    contract_hash: contract.contract_hash || null,
    summarizer: SUMMARIZER === defaultSummarizer ? 'default-heading-bullet' : 'custom',
  }
  fs.writeFileSync(learnedFull, serializeFrontmatter(fm, '\n# Hot digest — ' + ts + '\n\n' + summary + '\n'))
  return { learnedPath: learnedRel, words, summarizer: fm.summarizer }
}
