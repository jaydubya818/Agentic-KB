---
id: 01KNNVX2QX9QG2KH6FCT2ARV5Y
---

# Wiki Compile Log

## 2026-04-09

[2026-04-09] INGEST | Derived from article analysis (LinkedIn posts on Karpathy LLM Wiki pattern applied to coding projects) | Created `wiki/recipes/recipe-codebase-memory.md` — new recipe for using the KB as persistent codebase memory across Claude Code sessions. Covers project namespace setup in raw/, component and decision page schemas, CLAUDE.md integration, the "consult first, update after" prompt pattern, and session export workflow. Updated `wiki/index.md` (Recipes count: 8 → 9). No new concept pages needed — llm-wiki-pattern, context-management, and memory-systems cover the adjacent concepts. Inbound link added from recipe-llm-wiki-setup cross-reference in the new page.

## 2026-04-08

### Updated: `entities/mcp-ecosystem.md`
- **Source**: `architecture/2026-04-07-omm-overall-architecture-mcp-server.md`
- **Changes**: Added [[oh-my-mermaid]] [[mcp-ecosystem]] server section documenting the 7 exposed tools (`query_wiki`, `ingest_raw`, `search_wiki`, `list_articles`, `read_article`, `compile_wiki`, `lint_wiki`), the thin-wrapper architecture pattern, and the Mermaid flow diagram showing JSON-RPC → server.js → /api/ routing.
- **Decision**: Updated existing `mcp-ecosystem.md` rather than creating a new page — the content is a component detail of the broader MCP ecosystem entity.

## 2026-04-08 — Compiled `architecture/2026-04-07-omm-overall-architecture-mcp-server.md`

Pages affected: `entities/mcp-ecosystem.md`, `log.md`

[2026-04-08 05:47] INGEST | raw/qa/2026-04-08-what-is-the-best-pattern-for-multi-agent-orchestration-in-cl.md | Created summary page for multi-agent orchestration Q&A; created new pattern page wiki/patterns/pattern-pipeline.md (pipeline pattern was not in index); no new concept pages needed as multi-agent-systems, task-decomposition, and [[pattern-fan-out-worker]]-worker already exist
[2026-04-09 06:16] INGEST | raw/framework-docs/vault-3tier-architecture.md | Created summary page (vault-3tier-architecture.md) covering the full 3-tier vault design, inter-tier message bus, and vault context block structure. Created new pattern page (pattern-tiered-agent-memory.md) capturing the generalizable pattern of tier-scoped memory lifetime and load budgets. No duplicate concepts created — existing memory-systems, multi-agent-systems, and context-management concept pages cover adjacent ground.