// Unified identity model for humans, agents, services, teams.
// All four identity types produce the same shape so the audit log and guard
// logic never need to special-case who is calling.

export const IDENTITY_KINDS = ['human', 'agent', 'service', 'team']

export function agentIdentity(contract) {
  return {
    id: contract.agent_id,
    kind: 'agent',
    namespace: contract.namespace || contract.domain || 'default',
    tier: contract.tier,
    contractId: contract.agent_id,
    team: contract.team || null,
    source: 'agent-contract',
  }
}

export function humanIdentity(userId, team) {
  return {
    id: userId,
    kind: 'human',
    namespace: team || 'default',
    team: team || null,
    source: 'header',
  }
}

export function serviceIdentity(serviceId, namespace) {
  return {
    id: serviceId,
    kind: 'service',
    namespace: namespace || 'default',
    source: 'token',
  }
}

export function teamIdentity(teamId) {
  return {
    id: teamId,
    kind: 'team',
    namespace: teamId,
    team: teamId,
    source: 'header',
  }
}

/**
 * Resolve caller identity from an HTTP request object or a plain headers dict.
 * Resolution order:
 *   1. X-Identity-Kind + X-Identity-Id + optional X-Identity-Team  (explicit)
 *   2. X-Agent-Id  (agent shorthand)
 *   3. Authorization Bearer token  (service token — caller is responsible for token→id lookup)
 *   4. anonymous fallback
 *
 * `headers` can be a Headers instance, a plain { get(k) } duck-type, or a plain object.
 */
export function resolveIdentity(headers) {
  const get = (k) => {
    if (typeof headers.get === 'function') return headers.get(k)
    // plain object
    const lower = k.toLowerCase()
    for (const [key, val] of Object.entries(headers)) {
      if (key.toLowerCase() === lower) return val
    }
    return null
  }

  const kind = get('x-identity-kind') || null
  const id = get('x-identity-id') || null
  const team = get('x-identity-team') || null

  if (kind && id) {
    if (kind === 'human') return humanIdentity(id, team)
    if (kind === 'agent') return { id, kind: 'agent', namespace: team || 'default', team, source: 'header' }
    if (kind === 'service') return serviceIdentity(id, team || 'default')
    if (kind === 'team') return teamIdentity(id)
  }

  const agentId = get('x-agent-id')
  if (agentId) return { id: agentId, kind: 'agent', namespace: 'default', team: null, source: 'x-agent-id' }

  const auth = get('authorization') || ''
  if (auth.startsWith('Bearer ')) {
    const token = auth.slice(7).trim()
    return serviceIdentity(`token:${token.slice(0, 8)}`, 'default')
  }

  return { id: 'anonymous', kind: 'human', namespace: 'default', team: null, source: 'anonymous' }
}
