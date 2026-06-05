---
title: Recently Added
type: meta
---

# Recently Added
> Chronological feed of new and significantly updated wiki pages. Auto-appended during INGEST runs.
> See [[wiki/log|Operation Log]] for full details per ingest.

---

## 2026-05-30 (Apple Notes Hermes/Obsidian link review)

- [[wiki/patterns/pattern-agent-proof-of-work-loop|Agent Proof-of-Work Loop]] — Pattern extracted from Hermes/Obsidian community posts and Jay's 2026-05-30 manual Apple Notes review: agents must verify outputs, leave receipts, route exceptions to humans, and convert failures into learning updates before claiming completion.

## 2026-05-27 (morning-review-daily apply pass)

- [[wiki/syntheses/synthesis-rrf-as-rlm-fusion-stage|Reciprocal Rank Fusion as the RLM Pipeline's Score-Merging Stage]] — Bridges concepts/rlm-pipeline and concepts/reciprocal-rank-fusion; argues RRF is the score-free fusion primitive the pipeline's stages 4–9 require, with `k=60` as the canonical default; notes inherited [UNVERIFIED PROVENANCE] from the RRF page
- [[wiki/concepts/rlm-pipeline|RLM Pipeline]] — UPDATED: added bidirectional link to synthesis-rrf-as-rlm-fusion-stage in `related` frontmatter
- [[wiki/concepts/reciprocal-rank-fusion|Reciprocal Rank Fusion]] — UPDATED: added bidirectional link to synthesis-rrf-as-rlm-fusion-stage in `related` frontmatter

## 2026-05-23 (morning-review-daily apply pass)

- [[wiki/syntheses/synthesis-react-as-native-trajectory-eval|ReAct as Native Trajectory-Eval Substrate]] — Argues ReAct's loop *is* the eval trace, making trajectory metrics nearly free; recommends ReAct-first when eval-driven iteration is in the loop
- [[wiki/syntheses/synthesis-retrieval-and-tool-permissions-as-co-enforced-boundary|Retrieval Filtering and Tool Permissions as a Co-Enforced Access Boundary]] — Argues metadata filtering and permission modes are one boundary, not two; flags that recipe-production-deployment lacks cross-reference to either
- [[wiki/syntheses/synthesis-episodic-judgment-as-freshness-signal|Episodic Judgment Events as the Highest-Authority Freshness Signal]] — Proposes routing contradiction+correction events from episodic log to freshness engine; minimal-risk scope to avoid rubber-stamp inflation
- [[wiki/concepts/reciprocal-rank-fusion|Reciprocal Rank Fusion]] — UPDATED: added [UNVERIFIED PROVENANCE] block; confidence high→medium pending verifiable primary source
- [[wiki/patterns/pattern-per-claim-confidence|Per-Claim Confidence]] — UPDATED: added [UNVERIFIED PROVENANCE] block flagging single-source provenance gap

## 2026-04-18 (AUTORESEARCH — agent evaluation harnesses, Round 1)

- [[wiki/frameworks/framework-inspect-ai|Inspect AI]] — UK AISI OSS eval framework; three primitives (datasets/solvers/scorers), sandbox defaults, Agent Bridge for 3rd-party agents, [[mcp-ecosystem]] support
- [[wiki/frameworks/framework-promptfoo|promptfoo]] — Declarative YAML eval + red-team CLI; now [[openai]]-owned, MIT; CI/CD native, local-first
- [[wiki/frameworks/framework-deepeval|DeepEval]] — Pytest-native eval with 50+ research-backed metrics including named agent metrics (PlanQuality, ToolCalling, ArgumentCorrectness)
- [[wiki/frameworks/framework-langsmith|LangSmith]] — LangChain's proprietary eval + observability SaaS; unique trace-to-dataset workflow; deep [[framework-langgraph]] integration
- [[wiki/summaries/inspect-ai-framework-docs|Summary: Inspect AI docs]]
- [[wiki/summaries/promptfoo-framework-docs|Summary: promptfoo docs]]
- [[wiki/summaries/deepeval-framework-docs|Summary: DeepEval docs]]
- [[wiki/summaries/langsmith-framework-docs|Summary: LangSmith docs]]

## 2026-04-10 (INGEST)

- [[wiki/concepts/rag-systems|RAG Systems]] — Comprehensive concept page: chunking strategy, hybrid retrieval, re-ranking, HyDE, grounded generation, citation verification, metadata filtering, index freshness, evaluation metrics (recall@k/MRR/nDCG), failure modes table, RAG vs [[llm-wiki]] comparison
- [[wiki/summaries/siagian-agentic-engineer-roadmap-2026|Roadmap: Agentic AI Engineer 2026 (Siagian)]] — 10-section interview Q&A guide; strong on RAG system design, tool safety, production CI/CD; surfaces 6 KB gaps (RAG concept page, hybrid retrieval, grounded generation, CI/CD recipe, production deployment recipe)

## 2026-04-10

- [[wiki/system/policies/promotion-rules|Promotion Rules Policy]] — scoring formula, decision thresholds, 8 governance rules
- [[wiki/system/policies/freshness-policy|Freshness Policy]] — exponential decay formula, half-lives by memory class, freshness labels
- [[wiki/system/policies/source-trust-policy|Source Trust Policy]] — trust scoring, class weights, confidence multipliers
- [[wiki/system/policies/contradiction-policy|Contradiction Policy]] — detection algorithm, statuses, review item format
- [[wiki/mocs/orchestration|Orchestration MoC]] — navigation hub for all orchestration patterns, concepts, frameworks
- [[wiki/mocs/memory|Memory MoC]] — navigation hub for memory systems, patterns, and recipes
- [[wiki/mocs/tool-use|Tool Use MoC]] — navigation hub for tool design, [[mcp-ecosystem]], and permission concepts
- [[wiki/mocs/evaluation|Evaluation MoC]] — navigation hub for evals, benchmarks, and judge patterns
- [[wiki/stats|KB Stats]] — auto-generated stats page: page counts, link density, freshness, orphans
- [[wiki/concepts/rlm-pipeline|RLM Pipeline]] — 10-stage Recursive Layered Memory retrieval pipeline (stages 4–9 live)
- [[wiki/patterns/pattern-compounding-loop|Compounding Loop Pattern]] — raw/qa/ → compile → wiki → query → save with ×1.25 verified boost

## 2026-04-09

- [[wiki/frameworks/framework-rowboat|Rowboat Framework]] — updated: vendor confirmed, open-source, TypeScript, Qdrant-backed; flat wiki vs knowledge graph comparison table added
- [[wiki/frameworks/framework-markitdown|MarkItDown Framework]] — universal file-to-markdown conversion (PDF/DOCX/PPTX/XLSX/audio/YouTube/CSV/ZIP)
- [[wiki/patterns/pattern-two-step-ingest|Two-Step Ingest Pattern]] — split ingest into analysis + generation; 60/20/5/15 context budget formula
- [[wiki/patterns/pattern-episodic-judgment-log|Episodic Judgment Log Pattern]] — storing human judgment as append-only JSONL logs
- [[wiki/recipes/recipe-codebase-memory|Recipe: Codebase Memory]] — using KB as persistent codebase memory across [[framework-claude-code]] sessions
- [[wiki/summaries/2026-04-08-what-is-the-best-pattern-for-multi-agent-orchestration-in-cl|Q&A: Multi-Agent Orchestration Patterns]] — [[pattern-fan-out-worker]] Orchestrator-Worker as default; token economics; Telephone Game failure
- [[wiki/summaries/vault-3tier-architecture|Vault 3-Tier Architecture]] — Jay's production vault: orchestrator/lead/worker memory scoping and inter-tier bus

## 2026-04-08

- [[wiki/entities/mcp-ecosystem|MCP Ecosystem]] — updated: Oh My Mermaid [[mcp-ecosystem]] server added (7 tools, JSON-RPC → server.js architecture)

## 2026-04-04

- [[wiki/concepts/agent-failure-modes|Agent Failure Modes]]
- [[wiki/concepts/agent-loops|Agent Loops]]
- [[wiki/concepts/chain-of-thought|Chain of Thought]]
- [[wiki/concepts/context-management|Context Management]]
- [[wiki/concepts/few-shot-prompting|Few-Shot Prompting]]
- [[wiki/concepts/guardrails|Guardrails]]
- [[wiki/concepts/human-in-the-loop|Human-in-the-Loop]]
- [[wiki/concepts/llm-as-judge|LLM-as-Judge]]
- [[wiki/concepts/memory-systems|Memory Systems]]
- [[wiki/concepts/multi-agent-systems|Multi-Agent Systems]]
- [[wiki/concepts/permission-modes|Permission Modes]]
- [[wiki/concepts/self-critique|Self-Critique]]
- [[wiki/concepts/system-prompt-design|System Prompt Design]]
- [[wiki/concepts/task-decomposition|Task Decomposition]]
- [[wiki/concepts/tool-use|Tool Use]]
- [[wiki/concepts/trajectory-evaluation|Trajectory Evaluation]]
- [[wiki/frameworks/framework-autogen|AutoGen Framework]]
- [[wiki/frameworks/framework-bmad|BMAD Framework]]
- [[wiki/frameworks/framework-claude-api|Claude API Framework]]
- [[wiki/frameworks/framework-claude-code|Claude Code Framework]]
- [[wiki/frameworks/framework-crewai|CrewAI Framework]]
- [[wiki/frameworks/framework-gsd|GSD Framework]]
- [[wiki/frameworks/framework-langgraph|LangGraph Framework]]
- [[wiki/frameworks/framework-mcp|MCP Framework]]
- [[wiki/frameworks/framework-openclaw|OpenClaw Framework]]
- [[wiki/frameworks/framework-superpowers|Superpowers Framework]]
- [[wiki/evaluations/eval-memory-approaches|Eval: Memory Approaches]]
- [[wiki/evaluations/eval-orchestration-frameworks|Eval: Orchestration Frameworks]]
- [[wiki/personal/personal-agent-design-observations|Jay's Agent Design Observations]]
- [[wiki/personal/personal-jays-framework-philosophy|Jay's Framework Philosophy]]
- [[wiki/summaries/summary-gsd-executor|Summary: GSD Executor]]
- [[wiki/summaries/summary-gsd-planner|Summary: GSD Planner]]
- [[wiki/summaries/summary-gsd-verifier|Summary: GSD Verifier]]
- [[wiki/summaries/summary-karpathy-llm-wiki-gist|Summary: Karpathy LLM Wiki Gist]]
- [[wiki/summaries/summary-karpathy-llm-wiki-video|Summary: Karpathy LLM Wiki Video]]
- [[wiki/summaries/summary-nate-herk-llm-wiki|Summary: Nate Herk LLM Wiki]]

## 2026-05-11 — Apple Notes 5-day batch ingest

- [[summaries/garrytan-meta-meta-prompting|Meta-Meta-Prompting (Garry Tan)]] — manifesto for personal-AI-as-OS; drove today's context-graph PRs
- [[summaries/cyrilxbt-obsidian-smart-vault|How to Build an Obsidian Knowledge Vault That Gets Smarter (CyrilXBT)]] — validates Jay's current Agentic-KB architecture; suggests "Stuck on:" CLAUDE.md field
- [[summaries/cyrilxbt-claude-code-solo-founders|Claude Code for Solo Founders (CyrilXBT)]] — 13 reusable prompt templates; templates 1/4/8 apply to SellerFi + MissionControl
- [[summaries/thariq-claude-code-html|The Unreasonable Effectiveness of HTML for Claude Code (Thariq)]] — HTML > markdown for inter-agent payloads; deferred (need 2nd source)
- [[summaries/cyrilxbt-5-employees-agent|5 Employees for $20/month (CyrilXBT)]] — useful only for the role-decomposition exercise; economics overstated

## 2026-05-16 — 9 new wiki pages (3 syntheses + 6 graduating candidates)

- [[syntheses/synthesis-eval-metrics-to-failure-modes|Synthesis: DeepEval Metrics → Failure Modes]] — maps PlanQuality/ToolCalling/ArgumentCorrectness to the agent failure taxonomy; creates a diagnostic feedback loop
- [[syntheses/synthesis-rag-eval-to-llm-judge|Synthesis: RAG Eval → LLM-as-Judge decomposition]] — deterministic metrics for retrieval, judge required for generation; explains why citation verification can't be string-matched
- [[syntheses/synthesis-episodic-judgment-log-to-trace-dataset|Synthesis: Episodic Judgment Log vs. LangSmith trace-to-dataset]] — architecturally equivalent patterns; build/buy decision with vendor lock-in tradeoff
- [[recipes/recipe-agent-cicd|Recipe: Agent CI/CD Pipeline]] — lint → test → Docker → staging → eval gate → production; prompt changes go through the same review gate as code
- [[patterns/pattern-grounded-generation|Pattern: Grounded Generation]] — anchor claims to chunk IDs at generation; verify each citation with LLM judge before returning
- [[concepts/hybrid-retrieval|Concept: Hybrid Retrieval]] — BM25 + vector + optional graph fused via RRF; recovers documents neither approach gets alone
- [[recipes/recipe-production-deployment|Recipe: Production Deployment]] — FastAPI + Redis queue + PostgreSQL + vector store + Prometheus/Grafana production topology
- [[patterns/pattern-react|Pattern: ReAct (Reasoning + Acting)]] — Thought→Action→Observation loop; better for exploratory tasks than Plan-Execute-Verify
- [[concepts/metadata-filtering|Concept: Metadata Filtering]] — filter by tenant/permission in the retrieval layer; never post-retrieval or by model instruction

## 2026-05-16

- [[summaries/summary-llm-wiki-v2-gist-rohitg00|LLM Wiki v2 — Rohitg00's gist (primary source)]] — resolves 2026-04-12 missing-source contradiction; supersedes `summary-llm-wiki-v2.md` (social-post-only); unblocks `pattern-hybrid-search` + `concepts/reciprocal-rank-fusion` graduation.
- `raw/framework-docs/llm-wiki-v2-gist-rohitg00.md` — gist text + comment-thread counter-arguments captured at ingest.


## 2026-05-24

- [[syntheses/synthesis-episodic-judgment-as-contradiction-resolver-training|Synthesis: Episodic Judgment Log → Contradiction Auto-Resolver Training Data]] — the v2 gap "AI contradiction resolution → routes to human review only" is already being filled by the episodic log; the missing piece is a second consumer on the same event bus, not a new data collection problem.
- [[syntheses/synthesis-per-claim-confidence-as-rag-precision-layer|Synthesis: Per-Claim Confidence → RAG Retrieval Metric Precision]] — claim-level confidence scores could weight chunk relevance in nDCG/MRR, replacing binary chunk relevance with continuous claim-quality; integration point is a re-ranking stage after RRF fusion.
- [[syntheses/synthesis-model-tier-eval-framework-matrix|Synthesis: Model Tiering → Eval Framework Selection Matrix]] — proposes a two-dimensional (agent tier × task type) selection matrix for choosing between DeepEval / LangSmith / promptfoo / Inspect AI; flagged as a hypothesis to test, not a recommendation to ship.
- `wiki/_meta/proposals.md` — new entry `PROP-002 [HEAVY_BACKLOG]` (108 deferred themes; >50 threshold).
- `wiki/_meta/compile-log.md` — 2-source gate ledger entries (29 promote, 108 defer queued; compile blocked pending PIN).


## 2026-05-25

- [[syntheses/synthesis-judgment-events-as-confidence-labels|Synthesis: Episodic Judgment Events as Ground-Truth Labels for Per-Claim Confidence]] — bridges `pattern-episodic-judgment-log` and `pattern-per-claim-confidence`; argues that human correction events should calibrate confidence scores, with the heuristic as fallback for unlabeled claims.
- [[syntheses/synthesis-permissions-as-single-compiled-policy|Synthesis: Retrieval Filters + Tool Permissions Compile from a Single Policy]] — extends the co-enforced-boundary synthesis to design-time: a single DSL policy compiles to both vector-store metadata filters and tool allowlists, eliminating drift in multi-tenant systems.
- [[syntheses/synthesis-deepeval-metrics-as-trajectory-vocabulary|Synthesis: DeepEval's Named Agent Metrics as Trajectory Eval Vocabulary]] — names DeepEval's PlanQuality / ToolCalling / ArgumentCorrectness as the missing operational vocabulary that turns the ReAct-as-trace claim into a pytest-native CI gate.
- `wiki/_meta/proposals.md` — 109 new proposals appended (108 stuck candidates + `PROP-111 [HEAVY_BACKLOG]`).
- `wiki/_meta/compile-log.md` — 2-source gate ledger run (29 promote queued, 108 defer, 0 graduate; actual page compile crashed with `Error: undefined` — re-run needed).
