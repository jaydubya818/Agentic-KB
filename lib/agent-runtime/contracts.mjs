// Load agent contracts from config/agents/*.yaml (tiny YAML subset parser, zero deps).
import fs from 'fs'
import path from 'path'

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
  if (!c.agent_id) throw new Error('Contract missing agent_id')
  if (!c.tier || !['orchestrator', 'lead', 'worker'].includes(c.tier)) {
    throw new Error(`Contract ${c.agent_id} has invalid tier: ${c.tier}`)
  }
  if (!Array.isArray(c.allowed_writes)) c.allowed_writes = []
  if (!Array.isArray(c.forbidden_paths)) c.forbidden_paths = []
  if (!c.context_policy) c.context_policy = { include: [], subscriptions: {}, budget_bytes: 40960 }
  if (!Array.isArray(c.context_policy.include)) c.context_policy.include = []
  if (!c.close_policy) c.close_policy = {}
  if (!Array.isArray(c.close_policy.required_fields)) c.close_policy.required_fields = []
  if (!Array.isArray(c.close_policy.at_least_one_of)) c.close_policy.at_least_one_of = []
  if (typeof c.close_policy.require_active_task !== 'boolean') c.close_policy.require_active_task = false
  return c
}

// Exported for tests
export { parseYamlLite as _parseYamlLite }
