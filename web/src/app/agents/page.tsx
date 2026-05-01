'use client'

import { useEffect, useState } from 'react'

type Contract = {
  agent_id: string
  tier: string
  domain?: string
  team?: string
  contract_hash?: string
  context_policy?: { budget_bytes?: number; include?: unknown[] }
}

type ContextFile = { path: string; class: string; bytes: number; reason?: string }
type ContextBundle = {
  agent_id: string
  tier: string
  files: ContextFile[]
  trace: {
    budget_used: number
    budget_bytes: number
    truncated: boolean
    excluded?: { path: string; reason: string }[]
  }
}

type AuditEntry = {
  ts: string
  op: string
  agent_id?: string
  path?: string
  kind?: string
  status?: string
  reason?: string
  contract_hash?: string
  entry_hash?: string
}

type Tab = 'context' | 'audit' | 'trace'

type RuntimeTrace = {
  ts: string
  type?: string
  agent_id?: string
  project?: string
  writes_committed?: unknown[]
  writes_rejected?: unknown[]
  bus_items?: unknown[]
  budget_used?: number
  budget_bytes?: number
  truncated?: boolean
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Contract[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [project, setProject] = useState('example-project')
  const [tab, setTab] = useState<Tab>('context')
  const [bundle, setBundle] = useState<ContextBundle | null>(null)
  const [audit, setAudit] = useState<AuditEntry[]>([])
  const [traces, setTraces] = useState<RuntimeTrace[]>([])
  const [chain, setChain] = useState<{ ok: boolean; scanned: number; reason?: string } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/agents/list')
      .then(r => r.json())
      .then(d => {
        const list: Contract[] = d.agents || []
        setAgents(list)
        // Pre-select first agent so the panel renders something useful on
        // first load instead of an empty "Select an agent." placeholder.
        if (list.length > 0) {
          setSelected(prev => prev ?? list[0].agent_id)
        }
      })
    fetch('/api/agents/verify-audit').then(r => r.json()).then(setChain).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selected) return
    setLoading(true)
    const p = encodeURIComponent(project || '')
    Promise.all([
      fetch(`/api/agents/${selected}/context?project=${p}`).then(r => r.json()),
      fetch(`/api/agents/${selected}/audit?limit=40`).then(r => r.json()),
      fetch(`/api/agents/${selected}/trace?limit=20`).then(r => r.json()),
    ]).then(([c, a, t]) => {
      setBundle(c)
      setAudit(a.entries || [])
      setTraces(t.traces || [])
    }).finally(() => setLoading(false))
  }, [selected, project])

  const current = agents.find(a => a.agent_id === selected)

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 13 }}>
      <aside style={{ width: 280, borderRight: '1px solid #ddd', padding: 16, overflow: 'auto' }}>
        <h2 style={{ margin: '0 0 12px' }}>Agents</h2>
        <div style={{ marginBottom: 12, padding: 8, background: chain?.ok ? '#e6ffed' : '#ffeef0', border: '1px solid #ccc', borderRadius: 4 }}>
          <strong>Audit chain:</strong>{' '}
          {chain ? (chain.ok ? `OK (${chain.scanned} entries)` : `BROKEN: ${chain.reason}`) : 'checking…'}
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {agents.map(a => (
            <li key={a.agent_id}>
              <button
                onClick={() => setSelected(a.agent_id)}
                style={{
                  width: '100%', textAlign: 'left', padding: '6px 8px', margin: '2px 0',
                  background: selected === a.agent_id ? '#0366d6' : 'transparent',
                  color: selected === a.agent_id ? 'white' : 'inherit',
                  border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12,
                }}
              >
                <div><strong>{a.agent_id}</strong></div>
                <div style={{ opacity: 0.8 }}>[{a.tier}] {a.domain || '—'}</div>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main style={{ flex: 1, padding: 20, overflow: 'auto' }}>
        {!selected && <p>Select an agent.</p>}
        {selected && current && (
          <>
            <header style={{ borderBottom: '1px solid #ddd', paddingBottom: 12, marginBottom: 16 }}>
              <h1 style={{ margin: 0 }}>{current.agent_id}</h1>
              <div style={{ opacity: 0.7, marginTop: 4 }}>
                tier: <strong>{current.tier}</strong> · domain: {current.domain || '—'} · budget: {current.context_policy?.budget_bytes ?? '—'} ·{' '}
                <code>hash: {current.contract_hash || 'none'}</code>
              </div>
              <div style={{ marginTop: 8 }}>
                <label>project: </label>
                <input value={project} onChange={e => setProject(e.target.value)} style={{ fontFamily: 'inherit', padding: '2px 6px', border: '1px solid #ccc', borderRadius: 3 }} />
              </div>
              <div style={{ marginTop: 12 }}>
                {(['context', 'audit', 'trace'] as Tab[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      padding: '4px 12px', marginRight: 4,
                      background: tab === t ? '#0366d6' : '#f6f8fa',
                      color: tab === t ? 'white' : 'inherit',
                      border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer',
                    }}
                  >{t}</button>
                ))}
              </div>
            </header>

            {loading && <p>loading…</p>}

            {tab === 'context' && bundle && (
              <section>
                <p>
                  Budget: <strong>{bundle.trace.budget_used}</strong> / {bundle.trace.budget_bytes} bytes
                  {bundle.trace.truncated && <span style={{ color: '#d73a49' }}> · TRUNCATED</span>}
                </p>
                <h3>Included ({bundle.files.length})</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>
                      <th style={{ padding: 4 }}>class</th>
                      <th style={{ padding: 4 }}>path</th>
                      <th style={{ padding: 4 }}>bytes</th>
                      <th style={{ padding: 4 }}>reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bundle.files.map(f => (
                      <tr key={f.path} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: 4 }}>{f.class}</td>
                        <td style={{ padding: 4 }}><code>{f.path}</code></td>
                        <td style={{ padding: 4 }}>{f.bytes}</td>
                        <td style={{ padding: 4, opacity: 0.7 }}>{f.reason || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {bundle.trace.excluded && bundle.trace.excluded.length > 0 && (
                  <>
                    <h3 style={{ marginTop: 20 }}>Excluded ({bundle.trace.excluded.length})</h3>
                    <ul>
                      {bundle.trace.excluded.map((e, i) => (
                        <li key={i}><code>{e.path}</code> — <span style={{ opacity: 0.7 }}>{e.reason}</span></li>
                      ))}
                    </ul>
                  </>
                )}
              </section>
            )}

            {tab === 'audit' && (
              <section>
                <h3>Recent audit entries ({audit.length})</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>
                      <th style={{ padding: 4 }}>ts</th>
                      <th style={{ padding: 4 }}>op</th>
                      <th style={{ padding: 4 }}>status</th>
                      <th style={{ padding: 4 }}>path</th>
                      <th style={{ padding: 4 }}>contract</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audit.map((e, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: 4 }}>{e.ts?.slice(11, 19)}</td>
                        <td style={{ padding: 4 }}><strong>{e.op}</strong></td>
                        <td style={{ padding: 4, color: e.status === 'rejected' ? '#d73a49' : undefined }}>{e.status || '—'}</td>
                        <td style={{ padding: 4 }}><code>{e.path || e.reason || ''}</code></td>
                        <td style={{ padding: 4, opacity: 0.6 }}>{e.contract_hash || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {tab === 'trace' && (
              <section>
                <h3>Runtime traces ({traces.length})</h3>
                {traces.map((t, i) => (
                  <pre key={i} style={{ background: '#f6f8fa', padding: 8, borderRadius: 4, fontSize: 11, overflow: 'auto' }}>
                    {JSON.stringify(t, null, 2)}
                  </pre>
                ))}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}
