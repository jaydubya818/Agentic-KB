// Build a scoped context bundle for an agent based on its context_policy.
//
// Phase 2 upgrades:
//   - include_task_local: true  → loads active working-memory first (highest priority)
//   - required: true            → adds warning to trace if file is missing or excluded
//   - freshness_days: N         → excludes files older than N days (mtime or frontmatter updated)
//   - max_items: N              → limits items resolved from a single include rule
//   - Canonical load order enforced: task-local → profile → hot → project → subscriptions → learned
import fs from 'fs'
import path from 'path'
import { globToRegex, expandVars, matchAny } from './paths.mjs'
import { parseFrontmatter } from './frontmatter.mjs'
import { classFor } from './memory-classes.mjs'
import { appendRuntimeTrace } from './audit.mjs'
import { getActiveTask } from './task-lifecycle.mjs'

const TIER_BUDGETS = { worker: 40960, lead: 81920, orchestrator: 163840 }

// ─── Canonical load order bucket names ───────────────────────────────────────
// Used when context_policy.priority_order is not explicitly set.
const CANONICAL_ORDER = ['task-local', 'profile', 'hot', 'project', 'subscriptions', 'learned', 'standards']

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

// ─── Freshness check ─────────────────────────────────────────────────────────

function isStale(kbRoot, relPath, freshnessThreshold) {
  if (!freshnessThreshold) return false
  const cutoff = Date.now() - freshnessThreshold * 86400000

  // Prefer frontmatter 'updated' field; fall back to mtime
  try {
    const content = fs.readFileSync(path.join(kbRoot, relPath), 'utf8')
    const { data } = parseFrontmatter(content)
    const updated = data.updated || data.created || data.last_checked || null
    if (updated) {
      return new Date(updated).getTime() < cutoff
    }
  } catch {}

  try {
    const mtime = fs.statSync(path.join(kbRoot, relPath)).mtimeMs
    return mtime < cutoff
  } catch {}

  return false
}

// ─── Resolve a single include rule ───────────────────────────────────────────

function resolveIncludeRule(kbRoot, rule, contract, vars) {
  const tier = contract.tier
  const agentId = contract.agent_id
  const results = []

  if (rule.path) {
    const expanded = expandVars(rule.path, vars)
    if (expanded.includes('*')) {
      const re = globToRegex(expanded)
      for (const abs of walkWiki(kbRoot, 'wiki')) {
        const rel = relOf(kbRoot, abs)
        if (re.test(rel)) results.push({ path: rel, reason: `policy path glob ${rule.path}`, priority: rule.priority || 50, rule })
      }
    } else {
      const full = path.join(kbRoot, expanded)
      if (fs.existsSync(full)) {
        results.push({ path: expanded, reason: `policy path ${rule.path}`, priority: rule.priority || 50, rule })
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
            if (rule.status) {
              const fm = readFileMeta(kbRoot, rel)
              const st = fm?.meta?.status || null
              const allowed = Array.isArray(rule.status) ? rule.status : [rule.status]
              if (!allowed.includes(st)) continue
            }
            results.push({ path: rel, reason: `class=${rule.class} scope=${scope}`, priority: rule.priority || 60, rule })
          }
        }
      }
    }
    return results
  }

  return results
}

// ─── Resolve bus subscriptions ────────────────────────────────────────────────

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
      results.push({ path: rel, reason: `bus:${channel}`, priority: 40, rule: sub })
    }
  }
  return results
}

// ─── Bucket ranking for sort ──────────────────────────────────────────────────

function bucketRank(item, priorityOrder) {
  const order = priorityOrder.length > 0 ? priorityOrder : CANONICAL_ORDER

  // task-local working memory always first when include_task_local is on
  if (item.bucket === 'task-local') {
    const i = order.indexOf('task-local')
    return i >= 0 ? i : -1  // before everything else if not in order
  }
  if (item.reason.startsWith('bus:')) {
    const i = order.indexOf('subscriptions')
    return i >= 0 ? i : 999
  }
  const cls = item.class || item.reason.match(/class=(\w+)/)?.[1] || ''
  const nameMap = {
    profile: 'profile',
    hot: 'hot',
    working: 'hot',
    learned: 'learned',
    rewrite: 'learned',
    bus: 'subscriptions',
  }
  const named = nameMap[cls] || cls
  const i = order.indexOf(named)
  if (i >= 0) return i
  if (item.reason.includes('project')) {
    const pi = order.indexOf('project')
    return pi >= 0 ? pi : 999
  }
  if (item.reason.includes('standards')) {
    const si = order.indexOf('standards')
    return si >= 0 ? si : 999
  }
  return 999
}

// ─── Namespace guard ──────────────────────────────────────────────────────────

function namespaceAllowed(relPath, contract) {
  const ns = contract.namespace
  if (!ns) return true  // no namespace constraint
  // The contract's namespace must match the agent's own tier tree, system, and projects dirs.
  // Reads from other agent namespaces are allowed only via explicit include rules;
  // we don't block reads here (context_policy already controls that) but we DO
  // block reads of paths that belong to a different namespace's private prefix.
  // Convention: wiki/ns/{namespace}/** is private to that namespace.
  const nsPrefix = `wiki/ns/`
  if (!relPath.startsWith(nsPrefix)) return true  // not a namespaced path
  const pathNs = relPath.slice(nsPrefix.length).split('/')[0]
  return pathNs === ns
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function loadAgentContext(kbRoot, contract, vars = {}) {
  const start = Date.now()
  const tier = contract.tier
  const budget = contract.context_policy?.budget_bytes || TIER_BUDGETS[tier] || 40960
  const rules = contract.context_policy?.include || []
  const includeTaskLocal = contract.context_policy?.include_task_local === true
  const priorityOrder = contract.context_policy?.priority_order || []

  const candidates = []
  const seen = new Set()
  const excluded = []
  const warnings = []

  function push(item) {
    if (seen.has(item.path)) return
    if (!namespaceAllowed(item.path, contract)) {
      excluded.push({ path: item.path, reason: 'namespace isolation' })
      return
    }
    if (matchAny(item.path, contract.read_denylist, vars)) {
      excluded.push({ path: item.path, reason: 'read_denylist' })
      return
    }
    seen.add(item.path)
    candidates.push(item)
  }

  // ── 0. Active task-local state (always first when include_task_local: true) ─
  if (includeTaskLocal) {
    const active = getActiveTask(kbRoot, contract)
    if (active?.workingMemoryPath) {
      push({
        path: active.workingMemoryPath,
        reason: 'task-local working memory',
        priority: -100,   // guaranteed first
        bucket: 'task-local',
        rule: null,
      })
    }
  }

  // ── 1–N. Policy include rules ─────────────────────────────────────────────
  for (const rule of rules) {
    const resolved = resolveIncludeRule(kbRoot, rule, contract, vars)

    // max_items cap per rule
    const limited = rule.max_items ? resolved.slice(0, rule.max_items) : resolved

    // required rule with no results → warning
    if (rule.required === true && limited.length === 0) {
      warnings.push({ rule, message: `required rule resolved no files: ${JSON.stringify(rule)}` })
    }

    for (const r of limited) push(r)
  }

  // ── Bus subscriptions ─────────────────────────────────────────────────────
  for (const sub of resolveSubscriptions(kbRoot, contract)) push(sub)

  // ── Sort by canonical order then numeric priority ─────────────────────────
  candidates.sort((a, b) => {
    const ra = bucketRank(a, priorityOrder)
    const rb = bucketRank(b, priorityOrder)
    if (ra !== rb) return ra - rb
    return (a.priority || 50) - (b.priority || 50)
  })

  // ── Budget pass: include files in order until budget exhausted ────────────
  const included = []
  let used = 0
  let truncated = false

  for (const c of candidates) {
    const fm = readFileMeta(kbRoot, c.path)
    if (!fm) {
      excluded.push({ path: c.path, reason: 'unreadable' })
      if (c.rule?.required) warnings.push({ rule: c.rule, message: `required file unreadable: ${c.path}` })
      continue
    }

    // Freshness check
    if (c.rule?.freshness_days && isStale(kbRoot, c.path, c.rule.freshness_days)) {
      excluded.push({ path: c.path, reason: `stale (freshness_days: ${c.rule.freshness_days})` })
      if (c.rule?.required) warnings.push({ rule: c.rule, message: `required file excluded as stale: ${c.path}` })
      continue
    }

    if (used + fm.bytes > budget) {
      excluded.push({ path: c.path, reason: 'budget' })
      if (c.rule?.required) warnings.push({ rule: c.rule, message: `required file excluded by budget: ${c.path}` })
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
    include_task_local: includeTaskLocal,
    included: included.map(({ content, ...rest }) => rest),
    excluded,
    warnings: warnings.length > 0 ? warnings : undefined,
    duration_ms: Date.now() - start,
  }
  appendRuntimeTrace(kbRoot, trace)

  return { files: included, trace }
}
