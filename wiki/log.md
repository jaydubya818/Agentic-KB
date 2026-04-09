---
id: 01KNNVX2QX9QG2KH6FCT2ARV5Y
---

# Wiki Compile Log

## 2026-04-09

[2026-04-09] INGEST | rowboatlabs/rowboat GitHub + Karpathy endorsement post | Updated `wiki/frameworks/framework-rowboat.md` — corrected vendor (Unknown → Rowboat Labs), license (proprietary → open-source), github (empty → confirmed URL), language (any → TypeScript). Added confirmed architecture (Qdrant, model-agnostic, MCP layer, live notes). Added "Flat Wiki vs Knowledge Graph" comparison table capturing the core design distinction: explicit typed relationships vs prose links, decision/commitment tracking as first-class entities, mutable live notes vs immutable raw/. Removed [INFERRED] labels on now-confirmed details. Updated index (last_checked: 2026-04-04 → 2026-04-09). No new pages needed — existing page upgraded in place.

[2026-04-09] INGEST | microsoft/markitdown GitHub | Created `wiki/frameworks/framework-markitdown.md` — universal file-to-markdown conversion library (PDF/DOCX/PPTX/XLSX/audio/YouTube/CSV/ZIP → clean Markdown for LLM ingest). Covers stream-based API, LLM image description, plugin system, Azure Document Intelligence integration, and integration points with the existing raw/ ingest pipeline and webhook endpoint. Updated `wiki/index.md` (Frameworks: 11 → 12). The post text itself ("pip install and your AI pipeline stops choking") adds nothing beyond what the GitHub page covers.

[2026-04-09] INGEST | nashsu/llm_wiki post (Two-step ingest, weighted graph, four-stage query) | Created `wiki/patterns/pattern-two-step-ingest.md` — new pattern for splitting ingest into analysis + generation as separate LLM calls, with the intermediate knowledge graph as an explicit artifact. Also documents the 60/20/5/15 context budget allocation formula for query pipelines as a subsection. Updated `wiki/index.md` (Patterns: 1 → 2). Chrome extension, multi-format parsing, cascade deletion, citation panel are UX/desktop concerns not applicable to the KB. Weighted relationship graph is interesting but covered differently by existing graphify + hotness ranking — no contradiction, noted as alternative approach in pattern page.

[2026-04-09] INGEST | Muratcan Koylan "Personal Brain OS" article | Created `wiki/patterns/pattern-episodic-judgment-log.md` — new pattern for storing human judgment (experiences/decisions/failures) as append-only JSONL logs, distinct from factual semantic memory. Updated `concepts/context-management.md` — added primacy-recency (U-shaped) attention curve section with structural front-loading guidance. Updated `wiki/index.md` (Patterns: 0 → 1). Rest of article (tiered loading, append-only, module isolation, format choices) already covered in existing pages. No contradictions with existing content.

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