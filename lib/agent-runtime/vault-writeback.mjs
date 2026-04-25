// Vault-writeback — writes from a sanctioned KB-side agent (Sofie) into the
// Obsidian write-vault. Sanctioned exception to Rule 13 (compile-vault read-only)
// limited to agents with an explicit `vault_writes` contract field.
//
// Safety:
//   - Opt-in per contract (no `vault_writes` = vault writes blocked entirely)
//   - Hardened path checks identical to assertWriteAllowed
//   - Every vault path resolved + verified to live under OBSIDIAN_VAULT root
//   - All vault writes audited
//   - Atomic write (tmp + rename); rollback recreates pre-state
import fs from 'fs'
import path from 'path'
import os from 'os'
import { globToRegex, expandVars } from './paths.mjs'
import { appendAudit } from './audit.mjs'

export function vaultRoot() {
  return process.env.OBSIDIAN_VAULT_ROOT || path.join(os.homedir(), 'Documents', 'Obsidian Vault')
}

const UNSAFE_CHECKS = [
  [p => typeof p !== 'string', 'non-string'],
  [p => p === '', 'empty'],
  [p => p.includes('\0'), 'null byte'],
  [p => /[\r\n]/.test(p), 'newline'],
  [p => p.includes('\\'), 'backslash'],
  [p => /%2e|%2f/i.test(p), 'url-encoded'],
  [p => p.startsWith('/'), 'absolute'],
  [p => /^[A-Za-z]:/.test(p), 'drive letter'],
  [p => p.startsWith('~'), 'home expansion'],
  [p => /^[a-z]+:\/\//i.test(p), 'url scheme'],
  [p => p.includes('//'), 'double slash'],
  [p => p.split('/').some(seg => seg === '..' || seg === '.'), 'dot-segment'],
  [p => p.includes('..'), 'parent traversal'],
]

function unsafe(rel) {
  for (const [fn, reason] of UNSAFE_CHECKS) if (fn(rel)) return reason
  return null
}

export function assertVaultWriteAllowed(relPath, contract, vars = {}) {
  const u = unsafe(relPath)
  if (u) return { allowed: false, reason: `unsafe vault path: ${u}`, rule: null }
  if (!Array.isArray(contract.vault_writes) || contract.vault_writes.length === 0) {
    return { allowed: false, reason: 'no vault_writes configured', rule: null }
  }
  for (const p of contract.vault_writes) {
    const expanded = expandVars(p, vars)
    if (globToRegex(expanded).test(relPath)) return { allowed: true, reason: 'matched vault_writes', rule: p }
  }
  return { allowed: false, reason: 'not in vault_writes', rule: null }
}

function ensureUnderVault(absPath, vault) {
  const a = path.resolve(absPath)
  const v = path.resolve(vault)
  if (a !== v && !a.startsWith(v + path.sep)) throw new Error(`path escapes vault: ${absPath}`)
  return a
}

function atomicWrite(fullPath, content) {
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  const tmp = fullPath + '.tmp-' + process.pid + '-' + Date.now()
  fs.writeFileSync(tmp, content)
  fs.renameSync(tmp, fullPath)
}

/**
 * Plan + commit a single vault write op.
 * op:
 *   { kind: 'create', path, content }       — fail if exists (unless force)
 *   { kind: 'overwrite', path, content }    — replace
 *   { kind: 'append', path, content, sep }  — append after sep
 *
 * Returns { committed: true, rollback: {...} } or throws.
 */
export function commitVaultWrite(op, contract, vars = {}) {
  const guard = assertVaultWriteAllowed(op.path, contract, vars)
  if (!guard.allowed) throw new Error(`vault write blocked: ${guard.reason} (${op.path})`)

  const vault = vaultRoot()
  if (!fs.existsSync(vault)) throw new Error(`vault root missing: ${vault}`)
  const full = ensureUnderVault(path.join(vault, op.path), vault)
  const existed = fs.existsSync(full)
  const previousContent = existed ? fs.readFileSync(full, 'utf8') : null

  if (op.kind === 'create') {
    if (existed && !op.force) throw new Error(`vault file exists: ${op.path}`)
    atomicWrite(full, op.content)
  } else if (op.kind === 'overwrite') {
    atomicWrite(full, op.content)
  } else if (op.kind === 'append') {
    const sep = op.sep ?? '\n'
    const merged = existed
      ? (previousContent.endsWith('\n') ? previousContent + sep + op.content + '\n' : previousContent + '\n' + sep + op.content + '\n')
      : op.content + (op.content.endsWith('\n') ? '' : '\n')
    atomicWrite(full, merged)
  } else {
    throw new Error(`unknown vault op kind: ${op.kind}`)
  }

  return {
    committed: true,
    rollback: { path: op.path, full, existed, previousContent },
  }
}

export function rollbackVaultWrite(rb) {
  try {
    if (rb.existed) fs.writeFileSync(rb.full, rb.previousContent ?? '')
    else if (fs.existsSync(rb.full)) fs.unlinkSync(rb.full)
    return true
  } catch { return false }
}

// ─── Sofie automation rules ───────────────────────────────────────────────────
// Map closeTask payload extras to vault writes. Returns array of vault ops
// (NOT yet committed — caller plans + guards + commits in transaction).
export function planSofieVaultOps(payload) {
  const ops = []
  const today = new Date().toISOString().slice(0, 10)

  for (const d of payload.decisions || []) {
    if (!d || !d.title) continue
    const slug = String(d.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'decision'
    const body = [
      '---',
      `date: ${today}`,
      `decided_by: ${d.decided_by || 'sofie'}`,
      d.related ? `related: ${d.related}` : null,
      '---',
      '',
      `# ${d.title}`,
      '',
      '## Decision',
      d.body || d.summary || '',
      d.rationale ? `\n## Rationale\n\n${d.rationale}` : '',
      '',
    ].filter(l => l !== null).join('\n')
    ops.push({ kind: 'create', path: `06 - Decisions/${today} - ${slug}.md`, content: body, force: false })
  }

  for (const a of payload.actions || []) {
    if (!a || !a.task) continue
    const line = `- [ ] ${a.task}${a.owner ? ` — owner: ${a.owner}` : ''}${a.deadline ? ` — due: ${a.deadline}` : ''}${a.source ? ` — src: ${a.source}` : ''}`
    ops.push({ kind: 'append', path: `07 - Tasks/Action Tracker.md`, content: line, sep: '' })
  }

  if (payload.sessionSummary && payload.sessionSummary.body) {
    const ss = payload.sessionSummary
    const slug = (ss.title || 'session').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
    const body = [
      '---',
      `date: ${today}`,
      `type: session`,
      ss.tags ? `tags: [${ss.tags.join(', ')}]` : null,
      '---',
      '',
      `# ${ss.title || 'Session'} — ${today}`,
      '',
      ss.body,
      '',
    ].filter(l => l !== null).join('\n')
    ops.push({ kind: 'create', path: `04 - Sessions/${today}-${slug}.md`, content: body, force: false })
  }

  for (const cu of payload.clientUpdates || []) {
    if (!cu || !cu.client || !cu.body) continue
    const safeClient = String(cu.client).replace(/[^A-Za-z0-9 _-]/g, '_')
    ops.push({
      kind: 'append',
      path: `01 - Clients/${safeClient}.md`,
      content: `\n## ${today}\n\n${cu.body}\n`,
      sep: '',
    })
  }

  return ops
}

/**
 * Run Sofie's vault fan-out as a transaction. All-or-nothing.
 * Returns { ok, committed, rolled_back, ops }.
 */
export function runSofieVaultFanout(kbRoot, contract, payload) {
  const ops = planSofieVaultOps(payload)
  if (ops.length === 0) return { ok: true, committed: 0, ops: [] }

  // Guard all first
  for (const op of ops) {
    const g = assertVaultWriteAllowed(op.path, contract)
    if (!g.allowed) return { ok: false, error: `blocked: ${op.path} — ${g.reason}`, ops }
  }

  // Commit + rollback on first failure
  const rollbacks = []
  try {
    for (const op of ops) {
      const r = commitVaultWrite(op, contract)
      rollbacks.push(r.rollback)
      appendAudit(kbRoot, {
        op: 'vault-write',
        agent_id: contract.agent_id,
        contract_hash: contract.contract_hash || null,
        kind: op.kind,
        vault_path: op.path,
      })
    }
    return { ok: true, committed: rollbacks.length, ops }
  } catch (err) {
    let undone = 0
    for (let i = rollbacks.length - 1; i >= 0; i--) {
      if (rollbackVaultWrite(rollbacks[i])) undone++
    }
    appendAudit(kbRoot, {
      op: 'vault-write-rollback',
      agent_id: contract.agent_id,
      error: err.message,
      rolled_back: undone,
    })
    return { ok: false, error: err.message, committed: 0, rolled_back: undone, ops }
  }
}
