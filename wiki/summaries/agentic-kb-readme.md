---
title: "Agentic-KB — Project README"
type: summary
source_file: wiki/repos/agentic-kb/repo-docs/README.md
source_url: https://raw.githubusercontent.com/jaydubya818/Agentic-KB/main/README.md
author: Jay West
date_published: 2026-04-09
date_ingested: 2026-04-10
tags: [agentic, knowledge-management, claude-code, mcp, llm-wiki, deployment, observability]
key_concepts: [llm-wiki-pattern, rlm-pipeline, compile-pipeline, ingest-pipeline, hot-cache]
confidence: high
---

## TL;DR

The Agentic-KB README describes a 87+ article personal knowledge base for agentic AI engineering, queryable via web UI, CLI, and MCP server. It documents the compile pipeline (Karpathy LLM-Wiki pattern), enterprise features added in April 2026, and the 10-stage RLM retrieval pipeline.

## Key Claims

- The KB is **not RAG** — raw sources are compiled by Claude into a persistent, cross-referenced wiki with auditable, incremental state tracked in `raw/.compiled-log.json`
- `/api/compile` now runs a **two-step pipeline**: Call 1 (Analysis) extracts a structured knowledge graph (entities, relationships, contradictions), Call 2 (Generation) writes the wiki page. Analysis failure is non-fatal.
- **RLM pipeline stages 4–9 are now live** as of April 9, 2026: confidence weighting (×1.10/1.00/0.85), contradiction filtering, token-budget packing (24,000 char cap with proportional allocation), and proportional bucket allocation (direct 60%, graph 20%, hot 5%, citation 15%)
- **Auto-reindex** runs after every compile to keep `index.md` section counts current
- **Graph-based semantic search** uses hybrid keyword + graph traversal over a graphify `graph.json` (222 nodes, 299 links, 12 hyperedges)
- **Raw file watcher** (`vault-watch/route.ts`) monitors `raw/` and emits SSE `{type:'raw_pending'}` events when new files appear
- CLI `kb ingest-file <path>` converts any file (PDF, DOCX, PPTX, XLSX, audio, YouTube URLs) via markitdown and writes to `raw/` with frontmatter
- `kb ingest-youtube <url>` (yt-dlp + SRT parsing) and `kb ingest-twitter <archive.zip>` available
- **Namespace RBAC** via `X-KB-Namespace` header, per-namespace read/write ACLs, audit log with identity
- **Temporal decay + hotness ranking**: `baseScore × decay(mtime) × hotness(audit hits)`, 180-day half-life, 30-day hotness window
- Daily wiki lint at 07:00 via scheduled task → `wiki/lint-report.md`

## New Concepts Introduced

- [[concepts/rlm-pipeline]] — 10-stage Recursive Layered Memory retrieval pipeline
- [[patterns/pattern-two-step-compile]] — Analysis then generation for wiki compilation
- [[patterns/pattern-compounding-loop]] — raw/qa/ → compile → wiki → query → save back loop

## Related Pages

- [[concepts/llm-wiki-compile-pipeline]]
- [[concepts/ingest-pipeline]]
- [[patterns/pattern-llm-wiki]]
- [[entities/oh-my-mermaid]]
- [[entities/andrej-karpathy]]
