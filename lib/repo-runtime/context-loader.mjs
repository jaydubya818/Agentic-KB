// Repo-aware context loading. Extends agent-runtime context pattern for repo scope.
import fs from 'fs'
import path from 'path'
import { globToRegex, expandVars, matchAny } from '../agent-runtime/paths.mjs'
import { parseFrontmatter } from '../agent-runtime/frontmatter.mjs'
import { classFor } from '../agent-runtime/memory-classes.mjs'
import { appendRuntimeTrace } from '../agent-runtime/audit.mjs'
import { loadContract } from '../agent-runtime/contracts.mjs'
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

function normalizeContextArgs(kbRoot, contractOrOpts = {}) {
  if (contractOrOpts && typeof contractOrOpts === 'object' && contractOrOpts.tier) {
    return { contract: contractOrOpts, opts: {} }
  }

  const opts = contractOrOpts || {}
  const agentId = opts.agent_id || opts.agentId || null
  const contract = agentId
    ? loadContract(kbRoot, agentId)
    : {
        agent_id: 'repo-viewer',
        tier: 'worker',
        domain: null,
        context_policy: { include: [] },
      }

  if (!contract) throw new Error(`Agent not found: ${agentId}`)
  return { contract, opts }
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
      const repoBase = path.join(kbRoot, repoWikiRoot(repoName))
      if (fs.existsSync(repoBase)) {
        const re = globToRegex(expanded)
        // .md and .mdx: syncRepo's INCLUDED_PATTERNS import *.mdx and
        // importedDocPath preserves the extension, and walkDir above already
        // accepts both. Only this glob branch was .md-only, so a path-glob
        // include rule silently matched none of a repo's .mdx docs while a
        // class-based rule matched them fine.
        function walkForGlob(dir, prefix = '') {
          for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name)
            const rel = prefix ? `${prefix}/${entry.name}` : entry.name
            const fullRel = `${repoWikiRoot(repoName)}/${rel}`
            if (entry.isDirectory()) {
              walkForGlob(full, rel)
            } else if (/\.mdx?$/.test(entry.name) && re.test(fullRel)) {
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
        basePaths = [repoAgentMemoryRoot(repoName, tier, agentId)]
      } else if (typeof scope === 'string' && scope.includes(':')) {
        const [scopeTier, scopeId] = scope.split(':')
        basePaths = [repoAgentMemoryRoot(repoName, scopeTier, scopeId)]
      } else if (scope === 'repo') {
        basePaths = [repoWikiRoot(repoName)]
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
  const normalized = normalizeContextArgs(kbRoot, contract)
  const repoContract = normalized.contract
  const options = normalized.opts
  const mergedVars = { ...options, ...vars }
  const trace = {
    type: 'load-context-repo',
    agent_id: repoContract.agent_id,
    repo_name: repoName,
    files: [],
  }

  const files = []
  const budget = Number(mergedVars.budget_bytes || mergedVars.budgetBytes || repoContract.context_policy?.budget_bytes || TIER_BUDGETS[repoContract.tier] || 40960)
  let usedBytes = 0

  // Every budget check below is a lossy channel: the bundle this function
  // returns is what a downstream agent reasons over, and a dropped file is
  // invisible in `files` alone. `budget_remaining` is not a substitute — a
  // non-zero remainder is the *normal* result of dropping a file that was
  // larger than what was left, so a truncated bundle and a complete one were
  // indistinguishable to the consumer. Record what was dropped and why, the
  // same way loadAgentContext already does.
  const excluded = []
  const drop = (p, reason, bytes = null) => excluded.push({ path: p, reason, bytes })

  // Two sources can resolve the same file — a `class`/`path` include rule and
  // the bus sweep in step 5, or two overlapping path globs. loadAgentContext
  // guards this with its own `seen` set; this loader did not, so a doubly
  // matched file was pushed twice AND charged against `budget` twice, evicting
  // files that would otherwise have fit. An already-admitted path is a
  // duplicate, not a loss, so it is skipped without a `drop` record.
  const seen = new Set()

  // Returns true when `meta` cannot be admitted, recording a drop unless the
  // reason is that the path is already in the bundle.
  function skipFile(p, meta) {
    if (seen.has(p)) return true
    if (!meta) { drop(p, 'unreadable'); return true }
    if (usedBytes + meta.bytes > budget) { drop(p, 'budget', meta.bytes); return true }
    return false
  }

  function pushFile(entry) {
    seen.add(entry.path)
    files.push(entry)
    usedBytes += entry.bytes
  }

  // 1. Canonical docs (priority 10)
  const canonRoot = path.join(kbRoot, repoCanonicalRoot(repoName))
  if (fs.existsSync(canonRoot)) {
    const rels = walkDir(canonRoot)
    for (const rel of rels) {
      const fullRel = `${repoCanonicalRoot(repoName)}/${rel}`
      const meta = readFileMeta(kbRoot, fullRel)
      // Skip, don't break: every other budget check in this function is
      // skip-and-continue. A single canonical doc larger than the remaining
      // budget aborted the whole loop, so alphabetically later docs
      // (PRD.md, TECH_STACK.md, …) vanished from the bundle even though
      // they would have fit — and which ones vanished depended on the name
      // of the oversized file.
      if (skipFile(fullRel, meta)) continue
      pushFile({ path: fullRel, priority: 10, reason: 'repo canonical', bytes: meta.bytes })
    }
  }

  // 2. Progress.md (priority 15)
  const progressPath = `${repoWikiRoot(repoName)}/progress.md`
  const progressMeta = readFileMeta(kbRoot, progressPath)
  // A repo with no progress.md is the normal case, not a dropped file — only
  // report a loss once the file is known to exist.
  if (progressMeta && !skipFile(progressPath, progressMeta)) {
    pushFile({ path: progressPath, priority: 15, reason: 'repo progress', bytes: progressMeta.bytes })
  }

  // 3. Agent's own memory (priority 20)
  if (repoContract.context_policy?.include) {
    for (const rule of repoContract.context_policy.include) {
      const resolved = resolveRepoIncludeRule(kbRoot, repoName, rule, repoContract, mergedVars)
      for (const r of resolved) {
        const meta = readFileMeta(kbRoot, r.path)
        if (skipFile(r.path, meta)) continue
        pushFile({ path: r.path, priority: r.priority || 20, reason: r.reason, bytes: meta.bytes })
      }
    }
  }

  // 4. Relevant imported repo-docs (priority 40)
  const sourceFiles = mergedVars.sourceFiles || mergedVars.source_files
  if (sourceFiles && Array.isArray(sourceFiles)) {
    for (const sourcePath of sourceFiles) {
      // Same untrusted-input rule as importedDocPath: a traversal segment here
      // would let a caller pull files from outside repo-docs/ (or outside the
      // KB entirely) into the returned context bundle.
      const normalized = String(sourcePath).replace(/\\/g, '/')
      if (
        normalized.length === 0 ||
        normalized.includes('\0') ||
        normalized.startsWith('/') ||
        normalized.split('/').some(seg => seg === '' || seg === '.' || seg === '..')
      ) {
        // The caller asked for this file by name. Rejecting it silently left
        // them unable to tell "not in the bundle because unsafe" from
        // "not in the bundle because it does not exist".
        drop(String(sourcePath).slice(0, 200), 'unsafe source path')
        continue
      }
      const docPath = `${repoDocsRoot(repoName)}/${normalized}`
      const meta = readFileMeta(kbRoot, docPath)
      if (skipFile(docPath, meta)) continue
      pushFile({ path: docPath, priority: 40, reason: 'repo source doc', bytes: meta.bytes })
    }
  }

  // 5. Bus items addressed to this agent, plus broadcasts (priority 30)
  //
  // publishRepoBusItem stores `to: to || null`, so broadcast is the default
  // and most discoveries have no addressee. An unconditional
  // `meta.to === agent_id` filtered every one of them out of every agent's
  // bundle: the repo discovery channel delivered nothing unless a recipient
  // was named. Deliver broadcasts too — and skip items that have reached a
  // terminal state, which would otherwise sit in every bundle forever.
  const TERMINAL_BUS_STATES = new Set(['resolved', 'promoted', 'rejected', 'archived'])
  const busBase = `${repoWikiRoot(repoName)}/bus`
  for (const channel of ['discovery', 'escalation', 'standards', 'handoffs']) {
    const busDir = path.join(kbRoot, busBase, channel)
    if (fs.existsSync(busDir)) {
      for (const f of fs.readdirSync(busDir)) {
        if (!f.endsWith('.md')) continue
        const busPath = `${busBase}/${channel}/${f}`
        const meta = readFileMeta(kbRoot, busPath)
        if (!meta) continue
        const to = meta.meta.to
        const addressed = to == null || to === repoContract.agent_id
        if (!addressed) continue
        if (TERMINAL_BUS_STATES.has(meta.meta.status)) continue
        if (skipFile(busPath, meta)) continue
        pushFile({ path: busPath, priority: 30, reason: 'repo bus item', bytes: meta.bytes })
      }
    }
  }

  // Sort by priority (lower = earlier) then by path
  files.sort((a, b) => {
    const prio = a.priority - b.priority
    return prio !== 0 ? prio : a.path.localeCompare(b.path)
  })

  trace.files = files.map(f => ({ path: f.path, priority: f.priority, bytes: f.bytes }))
  trace.budget_bytes = budget
  trace.bytes_used = usedBytes
  trace.budget_remaining = budget - usedBytes
  // The loss report. `truncated` is the one field a consumer has to check to
  // know the bundle is not the whole picture; `excluded` says which files and
  // why. Both are always present so their absence can never be mistaken for
  // "nothing was dropped".
  trace.excluded = excluded
  trace.dropped_count = excluded.length
  trace.truncated = excluded.some(e => e.reason === 'budget')

  appendRuntimeTrace(kbRoot, trace)
  return { files, trace }
}
