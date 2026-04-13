---
id: 01KNNVX2QX9QG2KH6FCT2ARV5Y
---

# Wiki Compile Log

## 2026-04-12 (Hermes Agent Formalization)

[2026-04-12] NEW FILE | ~/.claude/agents/hermes.md — Full Hermes orchestrator agent definition. Includes: session-start memory load protocol (reads wiki/hot.md + wiki/personal/hermes-operating-context.md on every start), complete SOUL (identity, mission, scope, responsibilities, delegation contract, decision rights, escalation triggers, priority framework, output contract, memory rules KB-wired, hard constraints), full Repo Awareness appendix (10 work lanes, routing heuristics, multi-lane task handling, repo clustering), Specialist Invocation Contract. Model: claude-sonnet-4-6.

[2026-04-12] NEW PAGE | wiki/personal/hermes-operating-context.md — Hermes session-start memory file. Contains: active portfolio domains + priority levels, current priority stack (template for Jay to fill), agent infrastructure summary (34 agents, 29+ skills, 3 frameworks), routing defaults (validated patterns), recurring rhythms, decision patterns (TypeScript-first, framework selection, KB-as-source-of-truth), open blockers, durable lessons append-only log.

[2026-04-12] UPDATED | wiki/index.md — Personal section: added hermes-operating-context entry.

## 2026-04-12 (Lint Pass + Per-Claim Confidence Annotations)

[2026-04-12] LINT | wiki/syntheses/lint-2026-04-12.md — Full lint pass on 251 files. Results: 64 orphans (mostly expected agent profile files + repo docs); 2-click rule PASS; 2 stale framework pages FIXED (last_checked added to framework-gsd, framework-langgraph); untested recipes PASS (all <30 days); 1 inbound-link violation FIXED (summary-wikiwise-skills.md now 2 inbound links); agentmemory primary source NOT FOUND (Twitter-only, no public repo).

[2026-04-12] FIXED | wiki/frameworks/framework-gsd.md, framework-langgraph.md — Added last_checked: 2026-04-12 to both. Next stale check: 2026-06-12.

[2026-04-12] FIXED | wiki/mocs/memory.md — Added second inbound link to summary-wikiwise-skills.md.

[2026-04-12] ANNOTATED | wiki/concepts/rlm-pipeline.md — Added 5-claim per-claim confidence block to frontmatter. High confidence: stages 4-9 live, RRF k=60 default. Medium confidence: temporal decay half-life (designed not validated), flexsearch/transformers.js choice (plan only).

[2026-04-12] ANNOTATED | wiki/evaluations/eval-orchestration-frameworks.md — Added 5-claim per-claim confidence block. High confidence: GSD top, raw Claude Code second, familiarity weight. Medium confidence: LangGraph state management score (docs-only, no Jay experience), AutoGen/CrewAI penalty (familiarity-dominated).

[2026-04-12] ANNOTATED | wiki/system/policies/contradiction-policy.md — Added 4-claim per-claim confidence block. High confidence: confirmed-contradictions block promotion, detection mechanism. Medium confidence: trust_delta 0.20 threshold (designed), 0.10 promotion penalty (arbitrary).

[2026-04-12] UPDATED | wiki/index.md — Syntheses 1→2 (lint-2026-04-12 added).

[2026-04-12] BLOCKED | agentmemory ingest — github.com/agentmemory org has only an academic survey (Huaman-Agent-Memory), not the LLM Wiki v2 library. Source was Twitter-only. summary-llm-wiki-v2.md source_url updated to reflect this.

## 2026-04-12 (Wikiwise Improvements — home.md, style guide, skill ingest)

[2026-04-12] NEW PAGE | wiki/home.md — Visual narrative front door. Contains: inline SVG concept map (4 domains: Orchestration/Memory/Tool Use/Evaluation with live stats bar), start-here navigation matrix, top 5 most-referenced pages, KB roadmap narrative (RLM Stages 1-3, typed KG, research skill graph, per-claim confidence). Written in opinionated/direct voice per Wikiwise style guidance. Cross-linked from index.md Quick Navigation.

[2026-04-12] UPDATED | CLAUDE.md — Two additions: (1) 2-click reachability rule in Linking Conventions: every page reachable from home.md in ≤2 clicks via MoC hubs; (2) Writing Style Guide section: 4-part structure (TL;DR → argument → specifics → connections), voice rules (opinionated/declarative/direct), length targets by page type, anti-patterns table. Sourced from Wikiwise skill patterns.

[2026-04-12] INGEST | raw/framework-docs/wikiwise-skills/ (6 files) — Full content of Wikiwise skill library: digest, import-readwise, fetch-readwise-document, fetch-readwise-highlights, ingest, ingest-tweets. Retrieved from TristanH/wikiwise GitHub scaffold.

[2026-04-12] NEW PAGE | wiki/summaries/summary-wikiwise-skills.md — Summary of 6 Wikiwise skill files. Key patterns: stream-to-disk rule (pipe document body via jq, never load into context), parallel subagent dispatch with ≤300-word structured deliverable, batch-before-ingest (3-5 sources), 2-3 inbound-link density rule, user-confirmed highlight queries, single-file tweet collection (Tier 5 source trust). Includes applicability table mapping each skill to KB equivalent + gaps.

[2026-04-12] UPDATED | wiki/index.md — Quick Navigation added home.md entry; Summaries 21→22; Wikiwise skills summary added.

[2026-04-12] NO CONTRADICTIONS — All additions are operational improvements and new raw source content. The tighter inbound-link rule (2-3 vs ≥1) in summary-wikiwise-skills.md is a recommended upgrade, not a contradiction.

## 2026-04-12 (Knowledge Graphs + Research Skill Graph Ingests)

[2026-04-12] INGEST | summaries/summary-knowledge-graphs-explainer.md — Long-form explainer on knowledge graph fundamentals. Source: @techwith_ram. Key concepts extracted: triple model (S-P-O), ontology (classes/instances), named graphs with temporal context (valid_from/valid_to/asserted_by), graph inference (derive unstated facts from rules), SPARQL/Cypher querying, KG vs relational DB decision matrix.

[2026-04-12] NEW PAGE | wiki/concepts/knowledge-graphs.md — Comprehensive concept page. Covers: triple model, node/edge/property structure, ontology + class vs instance distinction, named graphs for temporal/provenance context, graph inference mechanism + biomedical example, querying (SQL JOIN vs graph path), key variants (property graph, RDF, hypergraph, LPG), when to use KG vs relational DB vs vector/RAG. Includes application map to this KB showing existing coverage + named-graph temporal context gap. Cross-linked to: rlm-pipeline, rag-systems, pattern-typed-knowledge-graph, contradiction-policy, freshness-policy.

[2026-04-12] UPDATED | wiki/patterns/pattern-typed-knowledge-graph.md — Added triple model section (S-P-O foundation), full edge schema with temporal fields (valid_from, valid_to, asserted_by), ontology class-level rules for valid relationship types. Updated sources to include summary-knowledge-graphs-explainer.

[2026-04-12] INGEST | summaries/summary-research-skill-graph.md — Practitioner article: 6-lens research system deployed at 4 companies, 60% research cost reduction, replaces junior researcher roles. Key concepts: 6-lens forced-perspective analysis, 5-tier source evaluation, contradiction-as-feature protocol, compound knowledge accumulation. Mapped to existing KB policies (source-trust-policy, contradiction-policy).

[2026-04-12] NEW PAGE | wiki/recipes/recipe-local-research-engine.md — Full setup recipe for Claude Code + Obsidian + skill graph research engine. Includes folder structure, CLAUDE.md for research graph, how it feeds into Agentic-KB via INGEST, verification steps, compound effect mechanics.

[2026-04-12] SCAFFOLDED | research-skill-graph/ (21 files) — Actual working folder structure created at /Users/jaywest/Agentic-KB/research-skill-graph/. Files: CLAUDE.md, index.md, research-log.md, methodology/{research-frameworks,source-evaluation,synthesis-rules,contradiction-protocol}.md, lenses/{technical,economic,historical,geopolitical,contrarian,first-principles}.md, sources/source-template.md, knowledge/{concepts,data-points}.md. Ready to use immediately in Obsidian or Claude Code.

[2026-04-12] UPDATED | wiki/index.md — Concepts 19→20, Recipes 11→12, Summaries 19→21.
[2026-04-12] UPDATED | wiki/mocs/memory.md — Added knowledge-graphs concept entry.
[2026-04-12] NO CONTRADICTIONS — knowledge-graphs concept is additive; complements and theoretically grounds the existing typed-knowledge-graph pattern and Graphify skill.

## 2026-04-12 (LLM Wiki v2 Integration — Phases 1–3)

[2026-04-12] INGEST | summaries/summary-llm-wiki-v2.md — Social post describing LLM Wiki v2 (5k stars in 48h). Source is secondary (social post); primary source (agentmemory repo) not yet ingested — marked TODO. Includes full gap analysis: KB already covers memory tiers, forgetting curves, page-level confidence. Genuine gaps: per-claim confidence, typed graph edges, RRF fusion algorithm, AI auto-resolution.

[2026-04-12] NEW PAGE | wiki/concepts/reciprocal-rank-fusion.md — Score-free rank aggregation algorithm for merging incompatible retrieval score spaces (BM25 + cosine + graph). Formula: Σ 1/(k+rank_i), k=60. Includes 20-line JS implementation. Cross-linked to rlm-pipeline, rag-systems, pattern-typed-knowledge-graph.

[2026-04-12] NEW PAGE | wiki/patterns/pattern-per-claim-confidence.md — Claim-level confidence annotation via frontmatter `claims` array (text, confidence, sources, last_verified, contradictions). Selective application: only canonical/high-stakes pages. Extends source-trust-policy from page to claim granularity.

[2026-04-12] NEW PAGE | wiki/patterns/pattern-typed-knowledge-graph.md — Typed directional edge schema (implements|extends|contradicts|supersedes|caused|supports|requires|related) with confidence float and source count. LLM extraction prompt included. Extends Graphify to emit typed-edges.json alongside graph.json. Feeds into RLM Stage 2 (retrieval fanout) and Stage 7 (contradiction filter via contradicts edges).

[2026-04-12] NEW PAGE | wiki/recipes/recipe-kb-lifecycle-hooks.md — Three automation hooks: (1) ingest-watcher.mjs on raw/ new files → bus item; (2) session-end protocol → wiki/system/sessions/; (3) scheduled maintenance (weekly lint, monthly decay). References existing sofie-watch-obsidian.mjs as pattern. tested: false.

[2026-04-12] UPDATED | wiki/system/policies/contradiction-policy.md v2.0.0 → v2.1.0 — Added Tier 1 automated resolution for unambiguous contradictions: auto-resolves when trust_delta ≥ 0.20, candidate has more independent sources, conflicting page is not canonical, and claim is factual (version/date/status/measurement). Tier 2 still routes to human review. All auto-resolutions logged with [AUTO-RESOLVED] prefix for 7-day override window.

[2026-04-12] UPDATED | wiki/concepts/rlm-pipeline.md — Promoted Stages 1–3 from P2 to P1. Added detailed implementation plan for Stage 1 (query normalization: intent detection, entity extraction, query expansion), Stage 2 (parallel fanout: flexsearch BM25 + transformers.js vector + typed graph), Stage 3 (RRF candidate union replacing current "weighted merge"). Cross-linked to reciprocal-rank-fusion.

[2026-04-12] NEW PAGE | wiki/recipes/recipe-hybrid-search-llm-wiki.md — Full BM25+vector+graph+RRF implementation in 5 steps: BM25 index (flexsearch), vector index (Xenova/all-MiniLM-L6-v2), graph traversal, RRF fusion, query entrypoint. Trigger: wiki > 150 pages. tested: false.

[2026-04-12] UPDATED | wiki/index.md — Concepts 18→19, Patterns 6→8, Recipes 9→11, Summaries 18→19.
[2026-04-12] UPDATED | wiki/mocs/memory.md — Added 2 patterns, 1 concept section, 1 summary.
[2026-04-12] NO CONTRADICTIONS — All new content is additive. RRF concept and typed graph pattern are net-new. Contradiction-policy v2.1 auto-resolution is explicitly additive (Tier 2 human review unchanged).

[2026-04-12] INGEST | summaries/summary-layered-agent-memory-obsidian.md — Transcript: Alex Finn's Obsidian-backed 4-layer agent memory system. Framework-agnostic patterns extracted; no OpenClaw-specific implementation applied per Jay's instruction.

[2026-04-12] NEW PAGE | wiki/patterns/pattern-layered-injection-hierarchy.md — Organizes memory by injection frequency (Layer 1: sticky notes always-injected ~2k chars; Layer 2: rules always-injected; Layer 3: vault on-demand at session start; Layer 4: archive query-only). Includes compaction recovery protocol and write cadence discipline (every 3–5 tool calls). Cross-linked to pattern-tiered-agent-memory, pattern-hot-cache, pattern-shared-agent-workspace, pattern-mistake-log.

[2026-04-12] NEW PAGE | wiki/patterns/pattern-shared-agent-workspace.md — Filesystem directory shared across all agents (Agent-Shared/ + per-agent private zones). Enables zero-re-briefing cross-agent handoffs via project-state.md, user-profile.md, decisions-log.md. Lateral sharing complement to pattern-tiered-agent-memory (vertical promotion). Cross-linked to multi-agent-systems, memory-systems.

[2026-04-12] NEW PAGE | wiki/patterns/pattern-mistake-log.md — Append-only mistakes.md per agent; read on every session start; written immediately on user correction. Narrower than pattern-episodic-judgment-log (errors only, not decisions). Cross-linked to episodic-judgment-log, reflection-loop, layered-injection-hierarchy.

[2026-04-12] UPDATED | wiki/index.md — Patterns count 3→6; Summaries count 17→18.
[2026-04-12] UPDATED | wiki/mocs/memory.md — Added 3 new pattern entries.
[2026-04-12] NO CONTRADICTIONS — New patterns orthogonal to existing tiered-agent-memory (injection-frequency axis vs agent-tier-hierarchy axis).

## 2026-04-10

[2026-04-10] NEW PAGE | wiki/concepts/rag-systems.md — Comprehensive RAG concept page: chunking (300–800 tokens, 10–20% overlap, semantic chunking), hybrid retrieval (dense+sparse+re-ranking+HyDE+multi-hop), context budgeting (60/20/5/15 allocation), grounded generation + citation verification, metadata filtering (security requirement), index freshness strategies, evaluation metrics (recall@k, precision@k, MRR, nDCG, factuality, citation correctness), failure modes table (8 modes + fixes), RAG vs LLM wiki comparison table. Cross-linked to memory, tool-use, evaluation MoCs; added to index (Concepts: 17→18) and recently-added.

[2026-04-10] INGEST | raw/papers/siagian-agentic-engineer-roadmap-2026.md | "Complete Roadmap to Become an Agentic AI Engineer in 2026" by Lamhot Siagian (Jan 19, 2026). 23-page PDF, 10 sections × 10 interview Q&As. Created: summaries/siagian-agentic-engineer-roadmap-2026.md. Updated: index.md (Summaries: 16→17), recently-added.md, mocs/orchestration.md, mocs/memory.md, mocs/tool-use.md, mocs/evaluation.md. No contradictions with existing content — framework ranking (LangGraph for Python stack) is complementary to Jay's Claude Code-first stack. Gaps surfaced: no RAG concept page, no hybrid retrieval coverage, no grounded generation pattern, no CI/CD for agents recipe, no production deployment recipe — all candidates for future ingestion.

[2026-04-10] ENHANCEMENT | KB Infrastructure — Stats, MoCs, Changelog | Built: scripts/generate-stats.mjs (auto-generates wiki/stats.md: page counts, link density, freshness, bus items, orphans). Created: wiki/recently-added.md (chronological changelog, auto-appended on INGEST). Created 4 MoC pages: wiki/mocs/orchestration.md (25 links), wiki/mocs/memory.md (28 links), wiki/mocs/tool-use.md (19 links), wiki/mocs/evaluation.md (18 links). Updated CLAUDE.md INGEST workflow (steps 9–10: append to recently-added, update MoCs). Updated wiki/index.md (Quick Navigation now shows MoCs, recently-added, stats). First stats run: 161 pages, 120K words, 1,137 links, 32 orphans.

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
