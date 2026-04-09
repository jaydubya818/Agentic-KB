// Unified identity model for humans, agents, services, teams.

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
