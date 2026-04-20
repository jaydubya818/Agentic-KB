// Load agent contracts from config/agents/*.yaml (tiny YAML subset parser, zero deps).
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

export function contractHash(rawText) {
  return crypto.createHash('sha256').update(rawText, 'utf8').digest('hex').slice(0, 16)
}

function parseYamlLite(text) {
  // Minimal YAML: supports nested maps (by indent), lists (`- item`), scalars, inline lists `[a, b]`.
  const lines = text.split('\n').filter(l => !l.match(/^\s*#/) && l.trim() !== '')
  let idx = 0

  function currentIndent(line) {
    return line.match(/^(\s*)/)[1].length
  }

  function parseScalar(s) {
    const t = s.trim()
    if (t === 'true') return true
    if (t === 'false') return false
    if (t === 'null' || t === '~') return null
    if (/^-?\d+$/.test(t)) return parseInt(t, 10)
    if (/^-?\d+\.\d+$/.test(t)) return parseFloat(t)
    if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) return t.slice(1, -1)
    if (t.startsWith('[') && t.endsWith(']')) {
      const inner = t.slice(1, -1).trim()
      if (!inner) return []
      return inner.split(',').map(p => parseScalar(p))
    }
    return t
  }

  function parseBlock(baseIndent) {
    // Decide if this block is a list or map by looking at first non-empty line.
    if (idx >= lines.length) return null
    const first = lines[idx]
    const ind = currentIndent(first)
    if (ind < baseIndent) return null
    if (first.trim().startsWith('- ')) {
      const arr = []
      while (idx < lines.length) {
        const line = lines[idx]
        const li = currentIndent(line)
        if (li < baseIndent) break
        if (li !== baseIndent || !line.trim().startsWith('- ')) break
        const rest = line.trim().slice(2)
        idx++
        if (rest.includes(':') && !rest.startsWith('{')) {
          // Inline map item: `- key: value`. Peek for more indented keys as part of this item.
          const itemMap = {}
          const [k, ...vParts] = rest.split(':')
          const v = vParts.join(':').trim()
          if (v) itemMap[k.trim()] = parseScalar(v)
          else {
            const child = parseBlock(baseIndent + 2)
            if (child && typeof child === 'object') Object.assign(itemMap, child)
          }
          // Continuation lines indented deeper
          while (idx < lines.length) {
            const cont = lines[idx]
            const ci = currentIndent(cont)
            if (ci <= baseIndent) break
            const contTrim = cont.trim()
            const cm = contTrim.match(/^([A-Za-z0-9_]+):\s*(.*)$/)
            if (cm) {
              const ck = cm[1]
              const cv = cm[2]
              idx++
              if (cv === '') {
                itemMap[ck] = parseBlock(ci + 2)
              } else {
                itemMap[ck] = parseScalar(cv)
              }
            } else {
              break
            }
          }
          arr.push(itemMap)
        } else {
          arr.push(parseScalar(rest))
        }
      }
      return arr
    }
    // Map
    const obj = {}
    while (idx < lines.length) {
      const line = lines[idx]
      const li = currentIndent(line)
      if (li < baseIndent) break
      if (li !== baseIndent) break
      const m = line.trim().match(/^([A-Za-z0-9_]+):\s*(.*)$/)
      if (!m) { idx++; continue }
      const key = m[1]
      const val = m[2]
      idx++
      if (val === '') {
        obj[key] = parseBlock(baseIndent + 2)
      } else {
        obj[key] = parseScalar(val)
      }
    }
    return obj
  }

  return parseBlock(0) || {}
}

export function loadContract(kbRoot, agentId) {
  const file = path.join(kbRoot, 'config', 'agents', `${agentId}.yaml`)
  if (!fs.existsSync(file)) return null
  const text = fs.readFileSync(file, 'utf8')
  const contract = parseYamlLite(text)
  contract.agent_id = contract.agent_id || agentId
  contract.contract_hash = contractHash(text)
  contract.contract_source_path = path.relative(kbRoot, file)
  validateContract(contract)
  return contract
}

export function listContracts(kbRoot) {
  const dir = path.join(kbRoot, 'config', 'agents')
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))
    .map(f => {
      const id = f.replace(/\.(yaml|yml)$/, '')
      try { return loadContract(kbRoot, id) } catch { return null }
    })
    .filter(Boolean)
}

export function validateContract(c) {
  const errs = []
  if (!c.agent_id) errs.push('missing agent_id')
  else if (typeof c.agent_id !== 'string') errs.push('agent_id must be string')
  if (!c.tier) errs.push('missing tier')
  else if (!['orchestrator', 'lead', 'worker'].includes(c.tier)) errs.push(`invalid tier: ${c.tier}`)

  if (c.allowed_writes != null && !Array.isArray(c.allowed_writes)) errs.push('allowed_writes must be array')
  if (c.forbidden_paths != null && !Array.isArray(c.forbidden_paths)) errs.push('forbidden_paths must be array')
  if (c.read_denylist != null && !Array.isArray(c.read_denylist)) errs.push('read_denylist must be array')

  if (!Array.isArray(c.allowed_writes)) c.allowed_writes = []
  if (!Array.isArray(c.forbidden_paths)) c.forbidden_paths = []
  if (!c.context_policy) c.context_policy = { include: [], subscriptions: {}, budget_bytes: 40960 }

  const cp = c.context_policy
  if (typeof cp !== 'object' || cp == null) errs.push('context_policy must be object')
  else {
    if (cp.include != null && !Array.isArray(cp.include)) errs.push('context_policy.include must be array')
    if (!Array.isArray(cp.include)) cp.include = []
    if (cp.subscriptions != null && typeof cp.subscriptions !== 'object') errs.push('context_policy.subscriptions must be object')
    if (cp.budget_bytes != null && (typeof cp.budget_bytes !== 'number' || cp.budget_bytes <= 0)) errs.push('context_policy.budget_bytes must be positive number')

    for (let i = 0; i < cp.include.length; i++) {
      const r = cp.include[i]
      if (typeof r !== 'object' || r == null) { errs.push(`include[${i}] must be object`); continue }
      if (r.path == null && r.class == null) errs.push(`include[${i}] needs path or class`)
      if (r.priority != null && typeof r.priority !== 'number') errs.push(`include[${i}].priority must be number`)
    }
  }

  for (const p of c.allowed_writes) {
    if (typeof p !== 'string') { errs.push(`allowed_writes entry not string: ${p}`); continue }
    if (p.startsWith('/') || p.includes('..')) errs.push(`allowed_writes unsafe pattern: ${p}`)
  }
  for (const p of c.forbidden_paths) {
    if (typeof p !== 'string') errs.push(`forbidden_paths entry not string: ${p}`)
  }

  if (errs.length) {
    const e = new Error(`Invalid contract ${c.agent_id || '(unknown)'}: ${errs.join('; ')}`)
    e.errors = errs
    throw e
  }

  c.close_policy = normalizeClosePolicy(c)
  return c
}

function deriveClosePolicy(contract) {
  const taskEndActions = Array.isArray(contract.task_end_actions) ? contract.task_end_actions : []
  const requiredFields = new Set()

  for (const action of taskEndActions) {
    if (action === 'append_task_log' || action === 'append_sprint_state' || action === 'append_decisions') {
      requiredFields.add('taskLogEntry')
    }
  }

  return {
    required_fields: [...requiredFields],
    at_least_one_of: [],
    require_active_task: taskEndActions.length > 0,
  }
}

export function normalizeClosePolicy(contract) {
  const explicit = contract.close_policy && typeof contract.close_policy === 'object'
    ? contract.close_policy
    : {}
  const derived = deriveClosePolicy(contract)

  return {
    required_fields: Array.isArray(explicit.required_fields) ? explicit.required_fields : derived.required_fields,
    at_least_one_of: Array.isArray(explicit.at_least_one_of) ? explicit.at_least_one_of : derived.at_least_one_of,
    require_active_task: typeof explicit.require_active_task === 'boolean'
      ? explicit.require_active_task
      : derived.require_active_task,
  }
}

// Exported for tests
export { parseYamlLite as _parseYamlLite }
