---
id: 01KQ2WTMD4071TTT51BXX81M8Z
title: "Vault Architecture"
type: concept
tags: [knowledge-base, architecture, knowledge-graph]
created: 2026-04-08
updated: 2026-04-08
visibility: public
confidence: high
related: [llm-wiki-compile-pipeline, knowledge-graphs, ingest-pipeline]
source: architecture/2026-04-07-omm-overall-architecture-vault.md
---

# Vault Architecture

## Definition

The **Vault** is the on-disk state of the knowledge base. It is the complete, authoritative filesystem representation of all source material, compiled pages, the knowledge graph, and audit logs. Everything that enters or leaves the KB passes through or is recorded within the Vault.

## Structure

The Vault is organised into four primary components:

| Path | Role |
|---|---|
| `raw/` | Source material (notes, transcripts, webhooks) staged for compilation |
| `wiki/` | Compiled pages produced by Claude via the compile pipeline |
| `graphify-out/graph.json` | The knowledge graph (222 nodes, 299 links, 12 hyperedges) used for semantic search |
| `logs/audit.log` | Append-only JSONL record of every operation performed on the Vault |

### Data Flow

```
raw/ ──compile──▶ wiki/ ──graphify──▶ graphify-out/graph.json
 │                  │
 └──every write──▶  └──every write──▶ logs/audit.log
                    │
                    └──lint report──▶ wiki/lint-report.md
```

## Why It Matters

Understanding the Vault's layout is essential for reasoning about how information moves through the KB:

1. **Raw → Wiki**: Source documents in `raw/` are transformed into structured wiki pages in `wiki/` by the [compile pipeline](llm-wiki-compile-pipeline.md).
2. **Wiki → Graph**: Compiled pages in `wiki/` are processed by `graphify` to produce `graph.json`, which powers [semantic search](knowledge-graphs.md).
3. **Auditability**: Every write to `raw/` or `wiki/` is appended to `logs/audit.log`, providing a tamper-evident JSONL trace of all KB operations.
4. **Lint**: The `wiki/` directory also produces a lint report at `wiki/lint-report.md` to surface schema or quality issues in compiled pages.

## Example

A new transcript dropped into `raw/` by a webhook is:
1. Picked up by the compile pipeline
2. Compiled by Claude into one or more pages under `wiki/`
3. The write to `wiki/` is recorded in `logs/audit.log`
4. `graphify` runs and updates `graphify-out/graph.json` with new nodes and links
5. Semantic search queries can now surface the new content

## See Also

- [LLM Wiki Compile Pipeline](llm-wiki-compile-pipeline.md) — the process that transforms `raw/` into `wiki/`
- [Knowledge Graphs](knowledge-graphs.md) — how `graph.json` enables semantic search
- [Ingest Pipeline](ingest-pipeline.md) — how source material enters `raw/`
- [LLM-Owned Wiki](llm-owned-wiki.md) — broader context on the wiki pattern this Vault implements
