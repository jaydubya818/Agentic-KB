---
id: 01KQ2Z133JMG35BETKPMCXZ3P4
title: Hosted Agent Infrastructure Pattern
type: pattern
tags: [agents, architecture, deployment, workflow, automation, patterns]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [agent-sandboxing, multi-agent-systems, agent-loops]
source: my-skills/hosted-agents-skill.md
---

# Hosted Agent Infrastructure Pattern

A three-layer architecture for running coding agents in remote sandboxed environments with multiplayer support, near-instant session starts, and unlimited concurrency.

## When to Use

- Building background coding agents that run independently of user devices
- Supporting multiple concurrent agent sessions beyond what a local machine allows
- Enabling multiplayer / collaborative agent sessions with shared state
- Serving agent functionality across multiple client surfaces (Slack, web app, CLI, Chrome extension)
- Allowing agents to spawn sub-agents for parallel workloads
- Requiring reproducible, consistent execution environments across every run

## Structure

The pattern has three layers:

```
┌─────────────────────────────────────────┐
│           Client Interfaces             │
│  (Slack, Web UI, CLI, Chrome Extension) │
├─────────────────────────────────────────┤
│              API Layer                  │
│   (State management, client coord,      │
│    event streaming, auth)               │
├─────────────────────────────────────────┤
│         Sandbox Infrastructure          │
│  (Isolated VMs, image registry,         │
│   warm pool, snapshot/restore)          │
└─────────────────────────────────────────┘
```

### Layer 1 — Sandbox Infrastructure

| Component | Purpose |
|---|---|
| Image registry | Pre-built environment images rebuilt on a cadence (e.g. every 30 min) |
| Warm pool | Pre-warmed sandboxes ready before users arrive |
| Snapshot/restore | Filesystem checkpoints for fast follow-up prompts |
| Git identity management | Per-user commit attribution via GitHub App tokens |

### Layer 2 — API Layer

A **server-first agent framework** that exposes the agent as an API server. The agent runs once; all clients connect to it. Responsibilities:
- Session lifecycle (create, pause, resume, destroy)
- State persistence between turns
- Real-time event streaming to connected clients
- Plugin/extension registration

### Layer 3 — Client Interfaces

Thin clients that consume the API layer. Because agent logic lives in Layer 2, each new client surface requires only a UI adapter — no duplication of agent behaviour.

## Example

```
User opens web UI
  → UI triggers predictive sandbox warm-up (user is typing)
  → API layer resolves freshest image, attaches warm sandbox
  → Sandbox already has repo cloned + deps installed
  → Agent starts; TTFT is the only latency user experiences

User submits follow-up prompt
  → API layer restores session snapshot
  → Agent continues from prior state instantly
  → Commit pushed with user's git identity (not app identity)
```

## Trade-offs

| Pro | Con |
|---|---|
| Unlimited concurrency | Higher infrastructure cost than local execution |
| Reproducible environments | Warm pool wastes resources when sessions don't materialize |
| Multiplayer / multi-client support | More operational complexity (image builds, pool management) |
| Near-instant session starts (with warm pool) | Image staleness window (up to cadence interval, e.g. 30 min) |
| Snapshot/restore enables cheap follow-ups | Snapshot storage adds cost at scale |

## Related Patterns

- [Agent Sandboxing](../concepts/agent-sandboxing.md) — foundational concept underlying this pattern
- [Multi-Agent Systems](../concepts/multi-agent-systems.md) — sub-agent spawning within hosted sandboxes
- [Agent Loops](../concepts/agent-loops.md) — execution loop that runs inside the sandbox
- [Human-in-the-Loop](../concepts/human-in-the-loop.md) — approval gates that pause sandboxed agents

## See Also

- [Agent Observability](../concepts/agent-observability.md)
- [Cost Optimization](../concepts/cost-optimization.md)
- [Agent Failure Modes](../concepts/agent-failure-modes.md)
