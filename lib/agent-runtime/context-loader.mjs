// Build a scoped context bundle for an agent based on its context_policy.
import fs from 'fs'
import path from 'path'
import { globToRegex, expandVars, matchAny } from './paths.mjs'
import { parseFrontmatter } from './frontmatter.mjs'
import { classFor } from './memory-classes.mjs'
import { appendRuntimeTrace } from './audit.mjs'

const TIER_BUDGETS = { worker: 40960, lead: 81920, orchestrator: 163840 }

function walkWiki(kbRoot, subdir) {
  const root = path.join(kbRoot, subdir)
  const out = []
  function walk(d) {
    if (!fs.existsSync(d)) return
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith('.md')) out.push(full)
    }
  }
  walk(root)
  return out
}

function relOf(kbRoot, abs) {
  return path.relative(kbRoot, abs).replace(/\\/g, '/')
}

function readFileMeta(kbRoot, relPath) {
  try {
    const content = fs.readFileSync(path.join(kbRoot, relPath), 'utf8')
    const { data } = parseFrontmatter(content)
    return { content, meta: data, bytes: Buffer.byteLength(content, 'utf8') }
  } catch {
    return null
  }
}

// Resolve a single `include` rule into a list of relative paths with reasons.
function resolveIncludeRule(kbRoot, rule, contract, vars) {
  const tier = contract.tier
  const agentId = contract.agent_id
  const results = []

  if (rule.path) {
    const expanded = expandVars(rule.path, vars)
    if (expanded.includes('*')) {
      // glob expansion against wiki tree
      const re = globToRegex(expanded)
      for (const abs of walkWiki(kbRoot, 'wiki')) {
        const rel = relOf(kbRoot, abs)
        if (re.test(rel)) results.push({ path: rel, reason: `policy path glob ${rule.path}`, priority: rule.priority || 50 })
      }
    } else {
      const full = path.join(kbRoot, expanded)
      if (fs.existsSync(full)) {
        results.push({ path: expanded, reason: `policy path ${rule.path}`, priority: rule.priority || 50 })
      }
    }
    return results
  }

  if (rule.class) {
    const scopes = Array.isArray(rule.scope) ? rule.scope : [rule.scope || 'self']
    for (const scope of scopes) {
      let basePaths = []
      if (scope === 'self') {
        basePaths = [`wiki/agents/${tier}s/${agentId}`]
      } else if (typeof scope === 'string' && scope.includes(':')) {
        // e.g. "lead:planning-agent"
        const [scopeTier, scopeId] = scope.split(':')
        basePaths = [`wiki/agents/${scopeTier}s/${scopeId}`]
      } else if (scope === 'all') {
        basePaths = ['wiki/agents']
      }
      for (const base of basePaths) {
        for (const abs of walkWiki(kbRoot, base)) {
          const rel = relOf(kbRoot, abs)
          const cls = classFor(rel)
          if (cls === rule.class) {
            // Optional status filter (e.g. for rewrites)
            if (rule.status) {
              const fm = readFileMeta(kbRoot, rel)
              const st = fm?.meta?.status || null
              const allowed = Array.isArray(rule.status) ? rule.status : [rule.status]
              if (!allowed.includes(st)) continue
            }
            results.push({ path: rel, reason: `class=${rule.class} scope=${scope}`, priority: rule.priority || 60 })
          }
        }
      }
    }
    return results
  }

  return results
}

function resolveSubscriptions(kbRoot, contract) {
  const subs = contract.context_policy?.subscriptions?.bus
  const results = []
  if (!Array.isArray(subs)) return results
  for (const sub of subs) {
    const channel = sub.channel
    if (!channel) continue
    const dir = `wiki/system/bus/${channel}`
    for (const abs of walkWiki(kbRoot, dir)) {
      const rel = relOf(kbRoot, abs)
      const fm = readFileMeta(kbRoot, rel)
      if (!fm) continue
      if (sub.status) {
        const statuses = Array.isArray(sub.status) ? sub.status : [sub.status]
        if (!statuses.includes(fm.meta.status)) continue
      }
      if (sub.to === 'self' && fm.meta.to !== contract.agent_id) continue
      if (sub.from_tier) {
        const tiers = Array.isArray(sub.from_tier) ? sub.from_tier : [sub.from_tier]
        if (!tiers.includes(fm.meta.from_tier)) continue
      }
      results.push({ path: rel, reason: `bus:${channel}`, priority: 40 })
    }
  }
  return results
}

export function loadAgentContext(kbRoot, contract, vars = {}) {
  const start = Date.now()
  const tier = contract.tier
  const budget = contract.context_policy?.budget_bytes || TIER_BUDGETS[tier] || 40960
  const rules = contract.context_policy?.include || []

  const candidates = []
  const seen = new Set()

  function push(item) {
    if (seen.has(item.path)) return
    // forbidden_paths gates WRITES, not reads. Reads are gated by context_policy.
    // We still mark as excluded if path is in an explicit read_denylist.
    if (matchAny(item.path, contract.read_denylist, vars)) {
      excluded.push({ path: item.path, reason: 'read_denylist' })
      return
    }
    seen.add(item.path)
    candidates.push(item)
  }

  const excluded = []

  for (const rule of rules) {
    const resolved = resolveIncludeRule(kbRoot, rule, contract, vars)
    for (const r of resolved) push(r)
  }
  for (const sub of resolveSubscriptions(kbRoot, contract)) push(sub)

  // Sort by priority (lower = higher priority)
  candidates.sort((a, b) => a.priority - b.priority)

  const included = []
  let used = 0
  let truncated = false

  for (const c of candidates) {
    const fm = readFileMeta(kbRoot, c.path)
    if (!fm) {
      excluded.push({ path: c.path, reason: 'unreadable' })
      continue
    }
    if (used + fm.bytes > budget) {
      excluded.push({ path: c.path, reason: 'budget' })
      truncated = true
      continue
    }
    included.push({
      path: c.path,
      class: classFor(c.path),
      reason: c.reason,
      priority: c.priority,
      bytes: fm.bytes,
      content: fm.content,
    })
    used += fm.bytes
  }

  const trace = {
    type: 'context-load',
    agent_id: contract.agent_id,
    tier,
    project: vars.project || null,
    budget_bytes: budget,
    budget_used: used,
    budget_remaining: budget - used,
    truncated,
    included: included.map(({ content, ...rest }) => rest),
    excluded,
    duration_ms: Date.now() - start,
  }
  appendRuntimeTrace(kbRoot, trace)

  return {
    files: included,
    trace,
  }
}
