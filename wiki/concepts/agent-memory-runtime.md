---
id: 01KQ2ZTKHG8KTDJ18F9YTF62D2
title: "Agent Memory Runtime"
type: concept
tags: [agents, memory, orchestration, context, architecture]
created: 2026-04-09
updated: 2026-04-25
visibility: public
confidence: high
related: [memory-systems, multi-agent-systems, context-management, agent-loops]
---

# Agent Memory Runtime

## Definition

An **agent memory runtime** is a shared infrastructure layer that gives orchestrator, lead, and worker agents bounded, scoped access to persistent memory — knowing exactly what to read, where to write, and how to propagate learnings up and across the agent hierarchy. It is distinct from a static compiled wiki: it is operational, stateful, and designed for agents acting concurrently across tasks.

In the Agentic-KB context, the runtime extends the existing filesystem-backed `wiki/` tree (with its RBAC, audit log, and search layers) into a live agent brain, without replacing any existing surface.

---

## Why It Matters

As multi-agent systems scale, context chaos becomes the primary failure mode. Without a runtime:
- Agents over-read (burning tokens on irrelevant history) or under-read (missing critical prior decisions)
- Writes collide or go to wrong locations
- Discoveries made by workers never reach orchestrators
- Learnings evaporate at task end

A memory runtime solves this by making memory **tiered**, **scoped**, and **transactional**.

---

## Memory Classes

| Class | Scope | Lifecycle |
|---|---|---|
| `profile` | Per-agent | Permanent — identity, capabilities, trust level |
| `hot` | Per-agent | Rolling window — recent decisions, active context |
| `working` | Per-task | Ephemeral — scratch space for the current task |
| `learned` | Per-agent | Accumulating — distilled lessons, durable knowledge |
| `rewrite` | Per-domain | Versioned — proposed changes to canonical domain docs |
| `bus` | Cross-agent | TTL-based — publish/subscribe for discoveries and escalations |

---

## Directory Layout

```
wiki/system/             -- schemas, templates, routing policies, bus channels
wiki/agents/{tier}/{id}/ -- profile, hot, working, learned, task-log, rewrites/
wiki/domains/{domain}/   -- domain-shared canonical knowledge
wiki/projects/{project}/ -- PRD, specs, plan, decisions, test strategy
wiki/archive/            -- compacted hot snapshots, retired rewrites, expired bus items

config/agents/*.yaml     -- machine-readable agent contracts with context_policy
config/identities.yaml   -- trust registry: humans | agents | services | teams

lib/agent-runtime/       -- shared Node ESM runtime (zero framework deps)
```

---

## Core Runtime Modules

- **`context-loader.ts`** — builds a scoped context bundle from tier + domain + project + subscriptions
- **`writeback.ts`** — transactional end-of-task close: writes hot/working/learned/rewrite atomically
- **`bus.ts`** — publish, list, and transition cross-agent bus items
- **`promotion.ts`** — promote a bus item or learned fact up the hierarchy with provenance tracking
- **`retention.ts`** — hot compaction, bus TTL enforcement, archive moves (never deletes)
- **`state-machines.ts`** — schema-backed status transitions for bus items, rewrites, and standards
- **`observability.ts`** — structured traces for every load and guard decision

---

## Example

A worker agent finishing a task calls `close-task`:
1. `writeback.ts` flushes working-memory to `wiki/agents/workers/{id}/working-memory/task-{id}.md`
2. Distilled learnings are appended to `learned.md`
3. Any domain discovery is published to the `bus` channel for the relevant domain
4. Hot memory is updated with a summary entry; old entries beyond the rolling window are compacted to `archive/`
5. An audit log entry is written via `audit.ts`

An orchestrator polling the bus sees the worker's discovery, promotes it to a domain canonical rewrite via `promotion.ts`, which opens a versioned rewrite under `wiki/domains/{domain}/`.

---

## Integration Surfaces

The runtime is imported directly by:
- **`web/`** — via Next.js API routes under `web/src/app/api/agents/`
- **`mcp/server.js`** — MCP tools call runtime functions without going through HTTP
- **`cli/kb.js`** — new subcommands: `agent list/show/context/close-task`, `bus list`, `promote`

---

## See Also

- [Memory Systems](memory-systems.md)
- [Multi-Agent Systems](multi-agent-systems.md)
- [Context Management](context-management.md)
- [Agent Loops](agent-loops.md)
- [Agent Observability](agent-observability.md)
