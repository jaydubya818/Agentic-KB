---
id: 01KQ2X70W9Q2ZP4X06CJPHZKDA
title: "Memory Systems"
type: concept
tags: [memory, agents, architecture, context, knowledge-base]
updated: 2026-04-25
visibility: public
related: [agent-vault, context-management, multi-agent-systems, llm-wiki]
---

# Memory Systems

> **Note (2026-04-25)**: Added cross-reference to the [Agent Vault](agent-vault.md) as a concrete production implementation of tiered, role-scoped persistent memory in Jay's agentic stack.

## Definition

Memory systems in agentic AI define how agents store, retrieve, and share information across tasks, sessions, and agent boundaries. Without explicit memory architecture, every agent session starts cold — no history, no learned preferences, no institutional context.

## Why It Matters

Memory is what turns a capable but amnesiac LLM into a compound-learning system. The design of memory systems determines:
- What agents can *know* at task start
- What they can *learn and retain* at task end
- How knowledge *propagates* across agents and tiers

## Memory Taxonomy

| Type | Scope | Example |
|---|---|---|
| **In-context** | Single session | System prompt, conversation history |
| **External / file-based** | Persistent, shared | Vault `hot.md`, `sprint-state.md` |
| **Vector / semantic** | Retrieval-augmented | Embedding stores, RAG pipelines |
| **Episodic** | Task-level logs | `task-log.md`, worker output archives |
| **Semantic / canonical** | Validated, curated | Agentic-KB wiki pages |

## Memory Lifetime

Different roles warrant different retention policies:
- **Orchestrators**: permanent — they hold the institutional record
- **Leads**: sprint/phase-scoped — summarized at phase end, archived at project close
- **Workers**: task-scoped — notable findings bubble up via discovery bus

## Example

In Jay's [Agent Vault](agent-vault.md), memory is structured by tier. An orchestrator writes architectural rulings to permanent ADR files. A lead synthesizes worker patterns into `known-patterns.md` at phase end. A worker writes a one-time gotcha that a lead later promotes to the KB.

## Common Pitfalls

- **No write discipline**: memory only compounds if agents commit outputs at task end
- **Flat, unscoped memory**: mixing orchestrator and worker memory creates noise and access-control problems
- **No promotion pipeline**: raw task logs accumulate without a mechanism to distill them into validated knowledge

## See Also

- [Agent Vault](agent-vault.md) — production implementation of tiered memory for Jay's stack
- [Context Management](context-management.md) — managing what fits in the active context window
- [Multi-Agent Systems](multi-agent-systems.md) — how memory propagates across agent boundaries
- [LLM-Owned Wiki](llm-wiki.md) — canonical knowledge layer above working memory
