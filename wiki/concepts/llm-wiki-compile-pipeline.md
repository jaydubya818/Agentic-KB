---
id: 01KQ2WXFGJDR7SSGAR8SB19KHP
title: "LLM Wiki Compile Pipeline"
type: concept
tags: [knowledge-base, architecture, agents, workflow, llm]
created: 2024-01-01
updated: 2026-04-08
visibility: public
confidence: high
related: [llm-wiki-pattern, llm-owned-wiki, knowledge-graphs, ingest-pipeline]
---

# LLM Wiki Compile Pipeline

## Definition

The Agentic-KB compile pipeline is a deliberate, auditable process in which Claude transforms raw markdown documents (`raw/`) into structured wiki pages (`wiki/`). This is explicitly **not RAG** — rather than retrieving chunks at query time, the compile step permanently synthesises source material into curated, persistent knowledge.

The pipeline follows the [Karpathy-pattern LLM Wiki](llm-wiki-pattern.md): raw inputs are ingested once, compiled into structured pages, and the resulting wiki becomes the durable knowledge store.

## Why It Matters

- **Auditability**: Every compile action is appended to an immutable `logs/audit.log`, making the provenance of each wiki page traceable.
- **Deliberateness**: Unlike RAG, knowledge is curated at write time, not retrieved opportunistically at query time. This means errors surface earlier and the wiki stays coherent.
- **Persistence**: Compiled pages outlive the raw source context and can be referenced, linked, and updated independently.

## System Architecture

The pipeline is exposed through three client entry points, all routing through a shared API layer:

| Client | Description |
|---|---|
| Web UI (`web/`) | Next.js app on `:3002` for browser-based access |
| CLI (`cli/kb.js`) | Command-line interface for scripting and local use |
| MCP Server (`mcp/server.js`) | Machine-readable interface for agent integrations |
| GitHub Actions | Webhook-triggered automation for CI/CD compile runs |

All clients call the same **API Routes** layer, which reads/writes `raw/` and `wiki/`, reads the knowledge graph (`graphify-out/`), and appends to the audit log.

```
Clients (Web UI, CLI, MCP, GitHub Actions)
        ↓
   API Routes
        ↓
  ┌─────┬──────┬────────┬───────────┐
 raw/  wiki/  graph/  audit.log
```

## Key Features

- **Hybrid search**: Combines keyword scanning with graph traversal over the [knowledge graph](knowledge-graphs.md) built by `graphify`.
- **Namespace-level RBAC**: Access control is enforced at the namespace level, enabling multi-tenant or role-segmented wikis.
- **Temporal decay + hotness ranking**: Pages and entities are scored by recency and access frequency, surfacing the most relevant content.
- **Append-only audit log**: All mutations are logged immutably for governance and debugging.
- **Scheduled lint**: Automated linting keeps the wiki well-formed over time.

## Example

A raw document (`raw/architecture/2026-04-07-omm-overall-architecture.md`) is ingested, analysed for key entities and claims, then compiled by Claude into one or more structured wiki pages under `wiki/concepts/` or `wiki/patterns/`. The compile step checks for existing pages to update before creating new ones.

## See Also

- [LLM Wiki Pattern](llm-wiki-pattern.md)
- [LLM-Owned Wiki](llm-owned-wiki.md)
- [Knowledge Graphs](knowledge-graphs.md)
- [Ingest Pipeline](ingest-pipeline.md)
