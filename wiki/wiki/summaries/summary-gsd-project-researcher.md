---
id: 01KQ2XT2FQFD82WBKSCKGJARFM
title: "GSD Project Researcher Agent — Role Definition"
type: summary
tags: [agents, orchestration, research, workflow, patterns]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
source: my-agents/gsd-project-researcher.md
related: [pattern-supervisor-worker, multi-agent-systems, agent-loops, memory-systems]
---

# GSD Project Researcher Agent — Role Definition

The `gsd-project-researcher` is a **spawned sub-agent** in the GSD orchestration system. It is invoked by `/gsd:new-project` or `/gsd:new-milestone` during Phase 6 (Research) to answer the question: *"What does this domain ecosystem look like?"* Its outputs are files consumed directly by the roadmap-creation phase.

## Key Ideas

### 1. File-Based Context Handoff
The agent writes structured research files into `.planning/research/`, each consumed by a specific downstream process:

| File | Consumer Use |
|---|---|
| `SUMMARY.md` | Phase structure and ordering rationale |
| `STACK.md` | Technology decisions |
| `FEATURES.md` | What to build per phase |
| `ARCHITECTURE.md` | System structure and component boundaries |
| `PITFALLS.md` | Flags phases needing deeper research |

This is a clean example of [file-based inter-agent memory](../concepts/memory-systems.md): agents don't share state directly — they write files that the next agent reads as its primary context.

### 2. Epistemics-First Research Philosophy
The agent operates under an explicit **training-data-is-a-hypothesis** discipline:

> Claude's training is 6–18 months stale. Knowledge may be outdated, incomplete, or wrong.

This drives a strict tool priority order:
1. **Context7** — authoritative, version-aware library docs (highest trust)
2. **Official docs via WebFetch** — changelogs, release notes
3. **WebSearch** — ecosystem discovery, community patterns

The agent is instructed to gather evidence first and form conclusions from it — explicitly warned against confirmation bias (finding sources that support an initial guess).

### 3. Three Research Modes

| Mode | Trigger | Output Focus |
|---|---|---|
| **Ecosystem** (default) | "What exists for X?" | Options, popularity, SOTA vs deprecated |
| **Feasibility** | "Can we do X?" | YES/NO/MAYBE, blockers, risks |
| **Comparison** | "Compare A vs B" | Matrix, recommendation, tradeoffs |

The agent is instructed to be **opinionated** — "Use X because Y", not "Options are X, Y, Z."

## Why It Matters

This role definition illustrates several recurring agentic patterns in one place:
- **Spawned worker** in a [multi-agent system](../concepts/multi-agent-systems.md)
- **Mandatory initial read** (context injection via `<files_to_read>` block before any action)
- **Structured file outputs** as inter-agent communication (see [memory systems](../concepts/memory-systems.md))
- **Explicit confidence signalling** (`LOW confidence` flags) as a safety and honesty mechanism
- **Tool hierarchy** as a prompting discipline to counteract stale training data

## See Also
- [Multi-Agent Systems](../concepts/multi-agent-systems.md)
- [Memory Systems](../concepts/memory-systems.md)
- [Agent Loops](../concepts/agent-loops.md)
- [Human-in-the-Loop](../concepts/human-in-the-loop.md)
