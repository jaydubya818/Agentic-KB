// Shared JSONL audit writer — compatible with logs/audit.log schema used by web/src/lib/audit.ts.
import fs from 'fs'
import path from 'path'

export function appendAudit(kbRoot, entry) {
  try {
    const dir = path.join(kbRoot, 'logs')
    fs.mkdirSync(dir, { recursive: true })
    const line = JSON.stringify({ ts: new Date().toISOString(), ...entry })
    fs.appendFileSync(path.join(dir, 'audit.log'), line + '\n')
  } catch {
    // Never let audit break the flow
  }
}

export function appendRuntimeTrace(kbRoot, trace) {
  try {
    const dir = path.join(kbRoot, 'logs')
    fs.mkdirSync(dir, { recursive: true })
    const line = JSON.stringify({ ts: new Date().toISOString(), ...trace })
    fs.appendFileSync(path.join(dir, 'agent-runtime.log'), line + '\n')
  } catch {}
}

export function readRuntimeTraces(kbRoot, limit = 50, filter = {}) {
  try {
    const file = path.join(kbRoot, 'logs', 'agent-runtime.log')
    if (!fs.existsSync(file)) return []
    const lines = fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean)
    const parsed = lines.map(l => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean)
    let out = parsed
    if (filter.agent_id) out = out.filter(t => t.agent_id === filter.agent_id)
    if (filter.type) out = out.filter(t => t.type === filter.type)
    return out.slice(-limit).reverse()
  } catch {
    return []
  }
}
