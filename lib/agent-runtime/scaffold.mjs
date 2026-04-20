// Contract + wiki-tree scaffolder. One command replaces ~8 manual file edits.
import fs from 'fs'
import path from 'path'
import { generateTemplate } from './memory-classes.mjs'

function writeIfAbsent(full, content, force, created, skipped, relOut) {
  if (fs.existsSync(full) && !force) { skipped.push(relOut); return }
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content)
  created.push(relOut)
}

const DEFAULT_BUDGET_BY_TIER = {
  worker: 40960,
  lead: 81920,
  orchestrator: 163840,
}

export function scaffoldAgent(kbRoot, { id, tier = 'worker', domain = 'platform', team = null, force = false }) {
  if (!id || !/^[a-z][a-z0-9-]*$/.test(id)) throw new Error(`invalid agent id: ${id}`)
  if (!['orchestrator', 'lead', 'worker'].includes(tier)) throw new Error(`invalid tier: ${tier}`)

  const created = []
  const skipped = []
  const base = `wiki/agents/${tier}s/${id}`

  // ── Contract YAML ────────────────────────────────────────────────────────
  const contractRel = `config/agents/${id}.yaml`
  const budget = DEFAULT_BUDGET_BY_TIER[tier]
  const contractYaml = [
    `agent_id: ${id}`,
    `tier: ${tier}`,
    `domain: ${domain}`,
    team ? `team: ${team}` : null,
    ``,
    `context_policy:`,
    `  budget_bytes: ${budget}`,
    `  include:`,
    `    - class: profile`,
    `      scope: self`,
    `      priority: 100`,
    `    - class: hot`,
    `      scope: self`,
    `      priority: 90`,
    `    - class: learned`,
    `      scope: self`,
    `      priority: 70`,
    tier === 'worker' ? '    - path: wiki/projects/{{project}}/**' : null,
    tier === 'worker' ? '      priority: 50' : null,
    tier !== 'worker' ? `    - path: wiki/domains/${domain}/**` : null,
    tier !== 'worker' ? '      priority: 60' : null,
    `  subscriptions:`,
    `    discovery: ${tier !== 'worker'}`,
    `    escalation: ${tier !== 'worker'}`,
    `    standards: true`,
    ``,
    `allowed_writes:`,
    `  - wiki/agents/${tier}s/${id}/**`,
    tier === 'worker' ? '  - wiki/system/bus/discovery/**' : null,
    tier === 'worker' ? '  - wiki/system/bus/escalation/**' : null,
    tier !== 'worker' ? '  - wiki/system/bus/standards/**' : null,
    tier !== 'worker' ? '  - wiki/system/bus/handoffs/**' : null,
    ``,
    `forbidden_paths:`,
    `  - config/**`,
    `  - wiki/system/schemas/**`,
    tier === 'worker' ? '  - wiki/agents/leads/**' : null,
    tier === 'worker' ? '  - wiki/agents/orchestrators/**' : null,
    tier === 'lead' ? '  - wiki/agents/orchestrators/**' : null,
    ``,
  ].filter(l => l !== null).join('\n')
  writeIfAbsent(path.join(kbRoot, contractRel), contractYaml, force, created, skipped, contractRel)

  // ── Wiki tree ────────────────────────────────────────────────────────────
  const templates = {
    [`${base}/profile.md`]: generateTemplate('profile', { agentId: id, tier, domain }),
    [`${base}/hot.md`]: generateTemplate('hot', { agentId: id }),
    [`${base}/task-log.md`]: generateTemplate('working', { agentId: id }),
    [`${base}/gotchas.md`]: generateTemplate('learned', { agentId: id, domain }),
  }
  for (const [rel, content] of Object.entries(templates)) {
    writeIfAbsent(path.join(kbRoot, rel), content, force, created, skipped, rel)
  }

  return { agent_id: id, tier, domain, contract: contractRel, created, skipped }
}
