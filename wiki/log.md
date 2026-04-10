---
id: 01KNNVX2QX9QG2KH6FCT2ARV5Y
---

# Wiki Compile Log

## 2026-04-10

[2026-04-10] IMPLEMENTATION | Sofie ↔ Agentic-KB Integration — Full Deploy | Created `config/agents/sofie.yaml` (lead-tier agent contract, domain=business, 7 allowed_write paths, 6-rule context policy with 65KB budget). Scaffolded Sofie memory namespace: `wiki/agents/leads/sofie/profile.md`, `hot.md`, `task-log.md`. Created `raw/qa/` and `raw/transcripts/` ingest directories. Built 3 pipeline scripts: `scripts/sofie-ingest-session.mjs` (CLI to ingest Sofie Q&A into raw/qa/ with --content/--file/--obsidian-session flags, verified flag, dry-run), `scripts/sofie-watch-obsidian.mjs` (30s poll watcher for Obsidian meeting/session/daily-note dirs, mtime-tracked in raw/.obsidian-ingest-log.json), `scripts/sofie-kb-digest.mjs` (weekly digest of KB health + open bus items + recent wiki pages, writes to both KB and Obsidian 07 - Tasks/). Integration test results: loadContract ✅ (lead tier confirmed), loadAgentContext ✅ (19 files, 61779/65536 bytes), sofie-ingest-session ✅ (verified Q&A ingested to raw/qa/), sofie-watch-obsidian ✅ (correct structure, runs on local machine), sofie-kb-digest ✅ (10 recent pages detected, KB copy written). Obsidian digest write requires running scripts locally (not from sandbox). Strategic plan filed to Obsidian Vault: `02 - Projects/Agentic-KB - Sofie Integration Plan.md`.

[2026-04-10] INGEST | agentic-kb GitHub repo-docs (5 files) | Sources: README.md, ENTERPRISE_PLAN.md, docs/RLM_PIPELINE.md, docs/OBSIDIAN_GRAPH.md, docs/OH_MY_MERMAID.md | Summaries created: summaries/agentic-kb-readme, summaries/agentic-kb-enterprise-plan, summaries/agentic-kb-rlm-pipeline, summaries/agentic-kb-obsidian-graph, summaries/agentic-kb-oh-my-mermaid | New concept: concepts/rlm-pipeline (10-stage retrieval pipeline, stages 4-9 live as of Apr 2026) | New pattern: patterns/pattern-compounding-loop (raw/qa/ → compile → wiki → query → save loop with ×1.25 verified boost) | Index updated: Concepts 16→17, Patterns 2→3 | No contradictions found.

[2026-04-10] IMPLEMENTATION | Operational Runtime Memory Layer — Phases 4–5 | Phase 4: `promotion.mjs` rewritten with contract-driven approver tier validation (`TIER_RANK: worker=1, lead=2, orchestrator=3`), duplicate-title detection with self-exclusion fix (source item excluded from its own channel scan), target-path collision guard requiring explicit `supersedes`, `assertPromotable` state gate, `promoteDiscovery` (new primary flow) and backward-compatible `promoteLearning` alias. `mergeRewrite` upgraded: approver tier validation, `supersedes` required when canonical exists, full provenance metadata (`promotion_reason`, `source_task_id`, `supersedes`). Phase 5: `cli/kb.js` — 5 new `agent` subcommands (`start-task`, `active-task`, `append-state`, `abandon-task`, `close-task --dry-run`). `mcp/server.js` — 5 new MCP tools (`agent_start_task`, `agent_active_task`, `agent_append_task_state`, `agent_abandon_task`, `agent_dry_run_close_task`); `merge_rewrite` tool updated with Phase 4 governance params. `retention.mjs` — `archiveCompletedTaskMemory` and `archiveAbandonedTaskMemory` added for task-local working-memory TTL. 12 new tests (41–52) covering all Phase 4–5 surfaces. 52/52 tests passing. Operational Runtime Memory Layer complete.

[2026-04-10] IMPLEMENTATION | Operational Runtime Memory Layer — Phases 1–3 | New module `lib/agent-runtime/task-lifecycle.mjs` (startTask, appendTaskState, getActiveTask, abandonTask, planActiveTaskClose). Refactored `lib/agent-runtime/writeback.mjs`: bus publications now planned and guarded upfront alongside file writes (Phase 3 atomic fix); active task sealed post-commit on successful closeTask; new `dryRunCloseTask` API. Refactored `lib/agent-runtime/context-loader.mjs`: added `include_task_local` flag, `required`/`freshness_days`/`max_items` per-rule fields, canonical load order (task-local → profile → hot → project → subscriptions → learned), namespace RBAC guard. Updated `lib/agent-runtime/memory-classes.mjs` classFor to handle working-memory/ and active-task.md paths. Exported all new APIs from index.mjs. Added 14 new tests covering the full task lifecycle (start, append, abandon, dry-run, atomic rollback, context loader upgrades). 40/40 tests passing. Phases 4–5 (promotion governance, CLI/MCP surface) are follow-on. Updated progress.md.

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
## 2026-04-09 — Feature Implementation Batch

[2026-04-09] FEATURE | confidence-weighting | Added `confidenceBoost(absPath)` to `web/src/lib/ranking.ts`. Reads frontmatter `confidence` field via 512-byte head read. Multipliers: high→1.10, medium→1.00, low→0.85. Added `_confidenceCache` Map (mtime-keyed). Updated `rankMultiplier()` and `rankBreakdown()` to include confidence factor. RLM stage 6 now live.

[2026-04-09] FEATURE | contradiction-filter | Added `loadContradictedPaths(vaultRoot)` to `web/src/app/api/query/route.ts`. Parses `wiki/lint-report.md` Contradictions section, returns Set of flagged paths. Contradicted pages separated from clean articles and appended last in synthesis order. `sources` SSE response now includes `contradicted[]` array for UI display. RLM stage 7 now live.

[2026-04-09] FEATURE | token-budget-packing | Added `MAX_CONTEXT_CHARS = 24_000`, `extractArticleSummary()`, and `packArticles()` to `web/src/app/api/query/route.ts`. Keeps frontmatter + first 3 paragraphs when article exceeds per-article budget. Distributes budget proportionally across all articles. RLM stage 9 now live.

[2026-04-09] FEATURE | proportional-budget-allocation | Added `BUDGET_ALLOC = {direct:0.60, graph:0.20, hot:0.05, citation:0.15}` and `applyBudgetAllocation()` to `web/src/lib/graph-search.ts`. Tagged all search results with bucket (direct/graph/hot/citation) during passes. Applied allocation as final step in `searchGraph()`. Prevents graph traversal from drowning direct keyword matches.

[2026-04-09] FEATURE | raw-file-watcher | Upgraded `web/src/app/api/vault-watch/route.ts`. Added `_seenRawFiles` Set seeded at connect time. Separate `rawWatcher` on raw/ directory detects new .md files and emits `{type:'raw_pending', filename, message}` SSE event. Main wiki watcher now filters raw/ changes. Both watchers cleaned up on disconnect.

[2026-04-09] FEATURE | two-step-compile | Upgraded `web/src/app/api/compile/route.ts` to two-step ingest pipeline. Call 1 (Analysis): model-as-analyst extracts KnowledgeAnalysis JSON — entities, relationships, key_claims, candidate_pages, contradictions, tags. Analysis failure is non-fatal (falls through with empty analysis). Call 2 (Generation): model-as-curator uses analysis JSON + existing pages list to write complete wiki page ops. Contradictions from analysis surfaced as `⚠️ Contradictions` sections in generated pages. SSE now emits `{type:'analysis', entities, candidates, contradictions, tags}` progress event per doc.

[2026-04-09] FEATURE | auto-reindex | Added `reindexWiki(wikiRoot)` to `web/src/app/api/compile/route.ts`. Walks 9 wiki sections (concepts/patterns/frameworks/entities/recipes/evaluations/summaries/syntheses/personal), counts .md files, updates `## Section (N)` headers in index.md. Called automatically after each compile run completes. Emits `{type:'reindex'}` SSE event. Also added `reindexLocal()` and `ingestFile()` to `cli/kb.js` with `ingest-file` and `reindex` commands.

[2026-04-09] NEW PAGE | wiki/recipes/recipe-codebase-memory.md — Recipe for using KB as persistent codebase memory for coding projects.

[2026-04-09] NEW PAGE | wiki/patterns/pattern-episodic-judgment-log.md — Pattern for storing human judgment as append-only JSONL logs (experiences/decisions/failures).

[2026-04-09] NEW PAGE | wiki/patterns/pattern-two-step-ingest.md — Pattern documenting the analyze→generate split and 60/20/5/15 proportional context budget allocation.

[2026-04-09] NEW PAGE | wiki/frameworks/framework-markitdown.md — Microsoft markitdown library reference (PDF/DOCX/PPTX/XLSX/audio/YouTube→markdown).

[2026-04-09] UPDATED | wiki/frameworks/framework-rowboat.md — Corrected metadata, confirmed architecture, added flat-wiki vs knowledge-graph comparison table.

[2026-04-09] UPDATED | wiki/concepts/context-management.md — Added primacy-recency U-shaped attention curve section with front-loading guidance.

## 2026-04-10

[2026-04-10] PLAN | operational-runtime-memory-layer | Created `wiki/repos/agentic-kb/rewrites/plans/2026-04-10-operational-runtime-memory-layer-plan.md` to scope the next hardening pass for the shared agent runtime. Plan focuses on first-class task-local state for active agents, stronger scoped context loading semantics, truly atomic close-task behavior across file writes and bus publications, contract-driven promotion rules, and lifecycle parity across CLI, MCP, and web. Added inbound links from `wiki/repos/agentic-kb/progress.md` and `wiki/repos/agentic-kb/home.md`. Updated `wiki/index.md` to include the new repo plan entry. No contradictions recorded; plan is aligned with the existing runtime direction documented in README and repo-docs.
