// Repo-aware context loading. Extends agent-runtime context pattern for repo scope.
import fs from 'fs'
import path from 'path'
import { globToRegex, expandVars, matchAny } from '../agent-runtime/paths.mjs'
import { parseFrontmatter } from '../agent-runtime/frontmatter.mjs'
import { classFor } from '../agent-runtime/memory-classes.mjs'
import { appendRuntimeTrace } from '../agent-runtime/audit.mjs'
import { repoWikiRoot, repoCanonicalRoot, repoDocsRoot, repoAgentMemoryRoot, isOperationalDoc } from './paths.mjs'

const TIER_BUDGETS = { worker: 40960, lead: 81920, orchestrator: 163840 }

function walkDir(dir, relPrefix = '') {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    const rel = relPrefix ? `${relPrefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      out.push(...walkDir(full, rel))
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
      out.push(rel)
    }
  }
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

// Resolve a single include rule in repo context
function resolveRepoIncludeRule(kbRoot, repoName, rule, contract, vars) {
  const tier = contract.tier
  const agentId = contract.agent_id
  const results = []

  if (rule.path) {
    const expanded = expandVars(rule.path, { ...vars, repo: repoName })
    if (expanded.includes('*')) {
      // glob expansion against repo tree
      const repoBase = path.join(kbRoot, repoWikiRoot(kbRoot, repoName))
      if (fs.existsSync(repoBase)) {
        const re = globToRegex(expanded)
        function walkForGlob(dir, prefix = '') {
          for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name)
            const rel = prefix ? `${prefix}/${entry.name}` : entry.name
            const fullRel = `${repoWikiRoot(kbRoot, repoName)}/${rel}`
            if (entry.isDirectory()) {
              walkForGlob(full, rel)
            } else if (entry.name.endsWith('.md') && re.test(fullRel)) {
              results.push({ path: fullRel, reason: `repo policy path glob ${rule.path}`, priority: rule.priority || 50 })
            }
          }
        }
        walkForGlob(repoBase)
      }
    } else {
      const full = path.join(kbRoot, expanded)
      if (fs.existsSync(full)) {
        results.push({ path: expanded, reason: `repo policy path ${rule.path}`, priority: rule.priority || 50 })
      }
    }
    return results
  }

  if (rule.class) {
    const scopes = Array.isArray(rule.scope) ? rule.scope : [rule.scope || 'self']
    for (const scope of scopes) {
      let basePaths = []
      if (scope === 'self') {
        basePaths = [repoAgentMemoryRoot(kbRoot, repoName, tier, agentId)]
      } else if (typeof scope === 'string' && scope.includes(':')) {
        const [scopeTier, scopeId] = scope.split(':')
        basePaths = [repoAgentMemoryRoot(kbRoot, repoName, scopeTier, scopeId)]
      } else if (scope === 'repo') {
        basePaths = [repoWikiRoot(kbRoot, repoName)]
      }
      for (const base of basePaths) {
        const baseDir = path.join(kbRoot, base)
        if (!fs.existsSync(baseDir)) continue
        const rels = walkDir(baseDir)
        for (const rel of rels) {
          const fullRel = `${base}/${rel}`
          const cls = classFor(fullRel)
          if (cls === rule.class) {
            if (rule.status) {
              const fm = readFileMeta(kbRoot, fullRel)
              const st = fm?.meta?.status || null
              const allowed = Array.isArray(rule.status) ? rule.status : [rule.status]
              if (!allowed.includes(st)) continue
            }
            results.push({ path: fullRel, reason: `repo class=${rule.class} scope=${scope}`, priority: rule.priority || 60 })
          }
        }
      }
    }
    return results
  }

  return results
}

export function loadRepoContext(kbRoot, repoName, contract, vars = {}) {
  const trace = {
    type: 'load-context-repo',
    agent_id: contract.agent_id,
    repo_name: repoName,
    files: [],
  }

  const files = []
  const budget = TIER_BUDGETS[contract.tier] || 40960
  let usedBytes = 0

  // 1. Canonical docs (priority 10)
  const canonRoot = path.join(kbRoot, repoCanonicalRoot(kbRoot, repoName))
  if (fs.existsSync(canonRoot)) {
    const rels = walkDir(canonRoot)
    for (const rel of rels) {
      const fullRel = `${repoCanonicalRoot(kbRoot, repoName)}/${rel}`
      const meta = readFileMeta(kbRoot, fullRel)
      if (meta) {
        if (usedBytes + meta.bytes > budget) break
        files.push({ path: fullRel, priority: 10, reason: 'repo canonical', bytes: meta.bytes })
        usedBytes += meta.bytes
      }
    }
  }

  // 2. Progress.md (priority 15)
  const progressPath = `${repoWikiRoot(kbRoot, repoName)}/progress.md`
  const progressMeta = readFileMeta(kbRoot, progressPath)
  if (progressMeta && usedBytes + progressMeta.bytes <= budget) {
    files.push({ path: progressPath, priority: 15, reason: 'repo progress', bytes: progressMeta.bytes })
    usedBytes += progressMeta.bytes
  }

  // 3. Agent's own memory (priority 20)
  if (contract.context_policy?.include) {
    for (const rule of contract.context_policy.include) {
      const resolved = resolveRepoIncludeRule(kbRoot, repoName, rule, contract, vars)
      for (const r of resolved) {
        const meta = readFileMeta(kbRoot, r.path)
        if (meta && usedBytes + meta.bytes <= budget) {
          files.push({ path: r.path, priority: r.priority || 20, reason: r.reason, bytes: meta.bytes })
          usedBytes += meta.bytes
        }
      }
    }
  }

  // 4. Relevant imported repo-docs (priority 40)
  if (vars.sourceFiles && Array.isArray(vars.sourceFiles)) {
    for (const sourcePath of vars.sourceFiles) {
      const docPath = `${repoDocsRoot(kbRoot, repoName)}/${sourcePath}`
      const meta = readFileMeta(kbRoot, docPath)
      if (meta && usedBytes + meta.bytes <= budget) {
        files.push({ path: docPath, priority: 40, reason: 'repo source doc', bytes: meta.bytes })
        usedBytes += meta.bytes
      }
    }
  }

  // 5. Bus items addressed to this agent (priority 30)
  const busBase = `${repoWikiRoot(kbRoot, repoName)}/bus`
  for (const channel of ['discovery', 'escalation', 'standards', 'handoffs']) {
    const busDir = path.join(kbRoot, busBase, channel)
    if (fs.existsSync(busDir)) {
      for (const f of fs.readdirSync(busDir)) {
        if (!f.endsWith('.md')) continue
        const busPath = `${busBase}/${channel}/${f.replace(/\.md$/, '')}`
        const meta = readFileMeta(kbRoot, busPath)
        if (meta && meta.meta.to === contract.agent_id && usedBytes + meta.bytes <= budget) {
          files.push({ path: busPath, priority: 30, reason: 'repo bus item', bytes: meta.bytes })
          usedBytes += meta.bytes
        }
      }
    }
  }

  // Sort by priority (lower = earlier) then by path
  files.sort((a, b) => {
    const prio = a.priority - b.priority
    return prio !== 0 ? prio : a.path.localeCompare(b.path)
  })

  trace.files = files.map(f => ({ path: f.path, priority: f.priority, bytes: f.bytes }))
  trace.bytes_used = usedBytes
  trace.budget_remaining = budget - usedBytes

  appendRuntimeTrace(kbRoot, trace)
  return { files, trace }
}
