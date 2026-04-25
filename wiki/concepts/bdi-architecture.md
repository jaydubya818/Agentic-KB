---
id: 01KQ2YBW3ECNWEGZCYYBGXNAFZ
title: "BDI Architecture (Belief-Desire-Intention)"
type: concept
tags: [agents, architecture, knowledge-graphs, orchestration, research]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [multi-agent-systems, knowledge-graphs, memory-systems, agent-loops]
source: my-skills/bdi-mental-states-skill.md
---

# BDI Architecture (Belief-Desire-Intention)

## Definition

BDI (Belief-Desire-Intention) is a formal cognitive architecture for rational agents. It models an agent's mental life as three distinct state types:

- **Belief**: What the agent holds to be true about the world (its epistemic state)
- **Desire**: What the agent wishes to bring about (its motivational state)
- **Intention**: What the agent has committed to achieving and is actively pursuing (its deliberative state)

These states are complemented by **mental processes** — events that transition between state types:

| Process | Role |
|---|---|
| `BeliefProcess` | Forms or updates beliefs from perception |
| `DesireProcess` | Generates desires from current beliefs |
| `IntentionProcess` | Commits to a desire as an actionable intention |

BDI originates in philosophical work on practical reasoning (Bratman, 1987) and is widely implemented in agent frameworks such as JADE, JADEX, and SEMAS.

## Why It Matters

BDI gives agents **explainable, traceable reasoning chains**. Rather than opaque input→output mappings, each action can be traced back to an intention, which can be traced to a desire, which can be traced to a grounding belief. This supports:

- **Explainability**: Auditors can inspect why an agent acted
- **Deliberative planning**: Agents weigh competing desires before committing
- **Semantic interoperability**: Mental states expressed in RDF/OWL can be shared across multi-agent platforms
- **Temporal tracking**: How beliefs, desires, and intentions evolve over time can be logged

## Cognitive Chain Pattern

The canonical BDI chain flows: `Belief → Desire → Intention → Plan → Action`

```turtle
:Belief_store_open a bdi:Belief ;
    rdfs:comment "Store is open" ;
    bdi:motivates :Desire_buy_groceries .

:Desire_buy_groceries a bdi:Desire ;
    rdfs:comment "I desire to buy groceries" ;
    bdi:isMotivatedBy :Belief_store_open .

:Intention_go_shopping a bdi:Intention ;
    rdfs:comment "I will buy groceries" ;
    bdi:fulfils :Desire_buy_groceries ;
    bdi:isSupportedBy :Belief_store_open ;
    bdi:specifies :Plan_shopping .
```

## World State Grounding

Beliefs are not free-floating — they reference structured **WorldState** objects that represent configurations of the environment at a point in time:

```turtle
:Agent_A a bdi:Agent ;
    bdi:perceives :WorldState_WS1 ;
    bdi:hasMentalState :Belief_B1 .

:WorldState_WS1 a bdi:WorldState ;
    rdfs:comment "Meeting scheduled at 10am in Room 5" ;
    bdi:atTime :TimeInstant_10am .
```

This grounding is what makes BDI amenable to integration with [knowledge graphs](../concepts/knowledge-graphs.md).

## T2B2T: Triples-to-Beliefs-to-Triples

T2B2T is a bidirectional paradigm for connecting RDF knowledge graphs to agent mental states:

**Phase 1 — Triples-to-Beliefs**: External RDF data (e.g. a push notification, a sensor reading) triggers a `BeliefProcess` that generates internal beliefs.

**Phase 2 — Beliefs-to-Triples**: After deliberation, the agent's intentions and plan executions produce *new* RDF triples representing changes to the world state.

This creates a closed loop between the agent's knowledge graph and its cognitive state — a form of **Logic Augmented Generation (LAG)** when applied to LLMs augmented with formal cognitive structures.

## BDI and Multi-Agent Systems

In [multi-agent systems](../concepts/multi-agent-systems.md), BDI enables:

- **Shared world models**: Agents exchange beliefs via RDF, maintaining semantic consistency
- **Coordinated intentions**: Intentions can be linked across agents (joint intentions)
- **Delegation**: An orchestrator agent can assign intentions to worker agents with full provenance

Frameworks that natively support BDI include JADE, JADEX, and SEMAS.

## Example

An agent receives a push notification: "Payment request $250."

1. The notification is represented as a `WorldState` triple
2. A `BeliefProcess` generates `Belief_payment_request`
3. A `DesireProcess` generates `Desire_evaluate_payment`
4. After deliberation, `Intention_pay` commits to `Plan_payment`
5. `PlanExecution_PE1` runs the plan and brings about `WorldState_payment_complete`
6. The new world state is written back to the knowledge graph as RDF triples

## Common Pitfalls

- **Belief staleness**: Beliefs grounded in world states can become stale; agents need belief revision mechanisms
- **Intention reconsideration**: Overly committed agents fail to drop intentions when beliefs change — balance commitment with reactivity
- **Complexity overhead**: Full BDI ontologies add modelling overhead; only warranted when explainability or interoperability is a hard requirement
- **LLM integration friction**: LLMs reason implicitly; mapping their outputs to formal BDI structures requires careful prompt engineering or post-processing

## See Also

- [Knowledge Graphs](../concepts/knowledge-graphs.md)
- [Multi-Agent Systems](../concepts/multi-agent-systems.md)
- [Memory Systems](../concepts/memory-systems.md)
- [Agent Loops](../concepts/agent-loops.md)
