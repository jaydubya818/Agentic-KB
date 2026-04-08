---
id: 01KNNVX2QM35SV0NPBRTC4H227
title: "Vault Architecture"
type: concept
tags: [knowledge-base, architecture, obsidian, workflow]
created: 2026-04-08
updated: 2026-04-08
visibility: public
confidence: high
related: [llm-owned-wiki, llm-wiki-pattern, state-persistence, agent-observability]
source: architecture/2026-04-07-omm-overall-architecture-vault.md
---

# Vault Architecture

## Definition

The **Vault** is the on-disk state of a compiled knowledge base (KB). It is the canonical, persistent representation of all source material, compiled wiki pages, semantic graph data, and audit logs. In the [[oh-my-mermaid]] ([[oh-my-mermaid]]) system, the vault is organised into four primary directories, each serving a distinct role in the compile pipeline.

## Structure

| Directory | Purpose |
|---|---|
| `raw/` | Source material staged for compilation — notes, transcripts, webhooks, raw documents |
| `wiki/` | Compiled pages produced by Claude via the compile pipeline |
| `graphify-out/graph.json` | Knowledge graph (222 nodes, 299 links, 12 hyperedges) used for semantic search |
| `logs/audit.log` | Append-only JSONL record of every operation performed on the vault |

A lint report (`wiki/lint-report.md`) is also generated from wiki content to surface structural issues.

## Data Flow

```mermaid
flowchart LR
    raw[(raw/<br/>source docs)] -->|compile| wiki[(wiki/<br/>compiled pages)]
    wiki -->|graphify| graph[(graphify-out/<br/>graph.json)]
    raw -->|every write| audit[(logs/audit.log)]
    wiki -->|every write| audit
    wiki -->|lint report| lint-report[(wiki/lint-report.md)]
```

1. **raw/ → wiki/**: The compile pipeline (Claude-driven) transforms raw source documents into structured wiki pages.
2. **wiki/ → graphify-out/**: The graphify step builds a semantic knowledge graph from compiled pages.
3. **raw/ and wiki/ → audit.log**: Every write operation to either directory is appended to the audit log, providing a full history.
4. **wiki/ → lint-report.md**: A linting pass generates a quality report on wiki content.

## Why It Matters

- **Separation of concerns**: Raw source material is kept separate from compiled output, making the pipeline reproducible — raw docs can be recompiled at any time.
- **Auditability**: The append-only audit log (`logs/audit.log`) provides a tamper-evident record of all changes, supporting [agent observability](../concepts/agent-observability.md) and governance.
- **Semantic search**: The knowledge graph derived from compiled pages enables richer retrieval than plain text search.
- **Linting**: The lint report closes the feedback loop, allowing the system to self-assess the quality of its compiled output.

## Example

A webhook fires, depositing a new transcript into `raw/`. The compile pipeline reads it, produces a structured wiki page in `wiki/concepts/`, appends a record to `logs/audit.log`, and schedules a graphify run to update `graph.json`.

## See Also

- [LLM-Owned Wiki](../concepts/llm-owned-wiki.md) — the broader pattern of an LLM maintaining a wiki
- [LLM Wiki Pattern](../concepts/llm-wiki-pattern.md) — design patterns for LLM-maintained knowledge bases
- [State Persistence](../concepts/state-persistence.md) — how agent state is stored across sessions
- [Agent Observability](../concepts/agent-observability.md) — audit logs and tracing in agentic systems
