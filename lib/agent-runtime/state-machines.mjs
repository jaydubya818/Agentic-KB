// State machines for bus items, standards, rewrites.

export const MACHINES = {
  bus: {
    initial: 'draft',
    transitions: {
      draft:        ['open', 'rejected', 'archived'],
      open:         ['acknowledged', 'in_progress', 'resolved', 'promoted', 'rejected', 'archived'],
      acknowledged: ['in_progress', 'resolved', 'promoted', 'rejected', 'archived'],
      in_progress:  ['resolved', 'promoted', 'rejected', 'archived'],
      resolved:     ['promoted', 'archived'],
      promoted:     ['archived'],
      rejected:     ['archived'],
      archived:     [],
    },
  },
  standards: {
    initial: 'draft',
    transitions: {
      draft:      ['proposed', 'archived'],
      proposed:   ['approved', 'rejected', 'archived'],
      approved:   ['active', 'archived'],
      active:     ['superseded', 'archived'],
      superseded: ['archived'],
      rejected:   ['archived'],
      archived:   [],
    },
  },
  rewrite: {
    initial: 'draft',
    transitions: {
      draft:        ['submitted', 'withdrawn'],
      submitted:    ['under_review', 'withdrawn'],
      under_review: ['approved', 'rejected', 'withdrawn'],
      approved:     ['merged', 'withdrawn'],
      merged:       ['archived'],
      rejected:     ['archived'],
      withdrawn:    ['archived'],
      archived:     [],
    },
  },
}

export function canTransition(machine, from, to) {
  const m = MACHINES[machine]
  if (!m) throw new Error(`Unknown state machine: ${machine}`)
  const allowed = m.transitions[from] || []
  return allowed.includes(to)
}

export function transition(machine, currentState, toState, actor) {
  const from = currentState || MACHINES[machine].initial
  if (!canTransition(machine, from, toState)) {
    throw new Error(`Illegal transition in ${machine}: ${from} -> ${toState}`)
  }
  return {
    status: toState,
    status_history_entry: {
      from,
      to: toState,
      actor: actor || 'unknown',
      at: new Date().toISOString(),
    },
  }
}
