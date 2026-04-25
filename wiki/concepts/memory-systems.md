---
id: 01KQ2ZTKHJMDC46DVPNBJN1BSH
title: "Memory Systems"
type: concept
tags: [memory, agents, context, architecture, knowledge-base]
updated: 2026-04-25
visibility: public
confidence: high
related: [agent-memory-runtime, context-management, multi-agent-systems, agent-loops]
---

# Memory Systems

## Definition

Memory systems in agentic AI refer to the mechanisms by which agents store, retrieve, and manage information across time — within a single task, across tasks, and across the lifetime of an agent or system.

Memory can be **in-context** (within the active context window), **external** (retrieved from a store on demand), or **compiled** (baked into a static knowledge artifact like a wiki page).

---

## Why It Matters

Without structured memory, agents are stateless within each invocation. They repeat work, lose prior decisions, and cannot accumulate expertise. The quality of an agent's memory architecture is often the primary determinant of its long-term usefulness.

---

## Memory Taxonomy

### By Duration
| Type | Scope | Example |
|---|---|---|
| Working / ephemeral | Single task | Scratch notes during a research pass |
| Hot / session | Rolling recent window | Last N decisions, active context |
| Long-term / learned | Lifetime of agent | Distilled lessons, durable preferences |
| Canonical / compiled | System-wide | Wiki pages, domain docs |

### By Access Pattern
| Type | How retrieved |
|---|---|
| In-context | Always present in the prompt |
| Retrieved | Fetched via search/lookup on demand |
| Injected | Pre-loaded by a context-loader at task start |

---

## Memory Classes (Agent Runtime)

In a full agent memory runtime, memory is further decomposed into **named classes** with defined lifecycle and write policies:

| Class | Purpose |
|---|---|
| `profile` | Permanent agent identity and capabilities |
| `hot` | Rolling recent context, compacted over time |
| `working` | Ephemeral per-task scratch space |
| `learned` | Accumulated distilled knowledge |
| `rewrite` | Versioned proposed changes to canonical docs |
| `bus` | TTL-bounded cross-agent publish/subscribe |

See [Agent Memory Runtime](agent-memory-runtime.md) for the full operational model.

---

## Example

A planning agent begins a new task:
1. **Profile** is loaded once (permanent, cheap)
2. **Hot** memory provides recent decisions and open questions
3. **Domain** knowledge is injected from canonical wiki pages
4. **Working** memory is created fresh for this task
5. At task end, learnings are distilled into **learned**, discoveries go to the **bus**

---

## Common Pitfalls

- **Context stuffing**: loading all memory into context burns tokens and degrades reasoning quality
- **Write collisions**: multiple agents writing to the same memory file without locking
- **Evaporation**: working memory discarded at task end with no distillation step
- **Stale hot**: hot memory that's never compacted grows indefinitely and loses signal

---

## See Also

- [Agent Memory Runtime](agent-memory-runtime.md)
- [Context Management](context-management.md)
- [Multi-Agent Systems](multi-agent-systems.md)
- [Agent Loops](agent-loops.md)
