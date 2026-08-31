---
title: Recently Added
type: meta
---

# Recently Added
> Chronological feed of new and significantly updated wiki pages. Auto-appended during INGEST runs.
> See [[wiki/log|Operation Log]] for full details per ingest.

---

## 2026-08-31 (morning-review-daily)

- [[syntheses/synthesis-worker-tool-scope-ownership|The Worker's Tool Set Belongs to the Permission Layer, Not the Orchestration Topology]] — Bridges the Orchestration × Tool Use MoC gap: `hot.md` scopes worker tools by graph position while [[patterns/pattern-minimal-permissions]] scopes by task type, and [[patterns/pattern-supervisor-worker]] never mentions capability scoping at all. Unreviewed.

---

## 2026-08-30 (promote-to-pages)

- [[concepts/outcome-metrics|Outcome Metrics]] — generated draft from 5 sources (linkedin-com-posts-maryammiradi-forward-deployed-engineering-101-for-share-7491586783273603072-ov8f, linkedin-com-posts-reshmawithai-ai-isnt-failing-in-your-company-your-ai-share-7493986243802738688-w9, lumay-ai, sierra-ai-blog-ai-pilling-our-company-lessons-learned, www-linkedin-com-pulse-copy-netflix-ntech-sre-purpose-built-approach-reliability-scale-ozc). Unreviewed.
- [[concepts/eval-first-rag|Eval First RAG]] — generated draft from 2 sources (opensourceprojects-dev-post-simba, x-twitter-2087607558626582741). Unreviewed.

---

## 2026-08-30 (morning-review-daily)

- [[syntheses/synthesis-forward-message-is-a-permissions-decision|`forward_message` Is a Permissions Decision Wearing an Orchestration Costume]] — bridges the Orchestration MoC's [[patterns/pattern-supervisor-worker]] to the Tool Use MoC's [[patterns/pattern-minimal-permissions]] and [[concepts/tool-design]]: the Telephone Game bypass removes the only step where a worker's raw output is read before reaching the caller, which is a permissions change nobody has scored. Proposes a "forwarded unreviewed" provenance marker and names the trace study that would settle whether supervisor synthesis performs any review function at all.

---

## 2026-08-28 (morning-review-daily)

- [[syntheses/synthesis-proof-of-work-receipts-vs-trajectory-eval|Proof-of-Work Receipts Are Self-Reported Trajectories, and That Is Exactly Their Weakness]] — bridges the Orchestration MoC's [[patterns/pattern-agent-proof-of-work-loop]] to the Evaluation MoC's [[concepts/trajectory-evaluation]] and [[concepts/llm-as-judge]]: both collect the same evidence and differ only in who authors it, so receipts catch omission cheaply but are structurally blind to fabrication (hallucinated tool calls, silent refusals). Proposes a routing rule and one adversarial fixture that would test it.

---

## 2026-08-27 (agentic-kb-editor-run)

- [[syntheses/synthesis-sandbox-safety-is-policy-not-place|A Sandbox Is a Policy Boundary, Not a Place to Run Code]] — bridges OpenSandbox Credential Vault/default-deny egress, DeepAgents remote/managed runtimes, and the Hugging Face agent-intrusion incident. The takeaway: sandbox safety is the policy envelope around credentials, network, approvals, file transfer, and traces — not merely an isolated place to execute code.

---

## 2026-08-27 (morning-review-daily)

- [[syntheses/synthesis-failure-escalation-as-mistake-log-trigger|The Mistake Log Only Records Failures a Human Noticed]] — bridges the Orchestration MoC's GSD escalation rule ("3 failed fix attempts → document and move on") to the Memory MoC's [[patterns/pattern-mistake-log]]: the log's write-trigger is a user correction, so self-detected fix-loop abandonment and silent refusals never reach it. Leaves the sink question (mistake-log vs. [[patterns/pattern-episodic-judgment-log]]) explicitly open.

---

## 2026-08-26 (morning-review-daily)

- [[syntheses/synthesis-promotion-scoring-without-a-judge|Promotion Scoring Measures Everything About a Claim Except Whether It Is True]] — bridges the Evaluation MoC's judge machinery to the Memory MoC's promotion policy: all six terms of the promotion score formula are provenance metadata, so a well-cited wrong claim clears the `≥ 0.75` canonical gate. Proposes a 20-page judge-vs-human calibration study before any formula change.

---

## 2026-08-25 (morning-review-daily)

- [[syntheses/synthesis-harness-self-improvement-as-memory-promotion|Self-Improving Harnesses Are Memory Promotion Under a Different Name]] — bridges the Orchestration MoC's harness layer to the Memory MoC's policy layer: a harness's failure-trace → edit → regression-test loop is structurally identical to `learned → canonical` promotion, but is missing contradiction blocking, an audit trail, and any decay function. Proposes a `harness` memory class with a half-life keyed to model version.
- [[personal/idea-books-as-agents-author-partnerships|Books as Agents — Author Partnerships]] — compiled from `raw/clippings/` by the 2-source gate's incremental compile pass.

---

## 2026-08-24 (morning-review-daily)

- [[syntheses/synthesis-mcp-as-tool-vs-memory-interface|MCP Carries Two Consumption Patterns — Action Execution and Memory Retrieval]] — bridges the Tool Use MoC and the Memory MoC: MCP transports both imperative action calls and retrieval queries over one contract, but the permission vocabulary was built only for the action half. Proposes labelling memory-read servers as a distinct class rather than gating them.

---

## 2026-08-22 (morning-review-daily)

- [[syntheses/synthesis-verifier-as-goal-completion-benchmark|The PEV Verifier Is a Runtime Implementation of Goal-vs-Task Completion]] — bridges the Orchestration MoC's verifier role to the Evaluation MoC's goal-vs-task-completion concept, and proposes harvesting `acceptance_criteria` as Truth/Existence/Wiring benchmark items.

---

## 2026-08-21 (morning-review-daily)

- [[wiki/syntheses/synthesis-telephone-game-per-claim-confidence|The Telephone Game Problem Is a Retrieval-Fidelity Problem]] — argues supervisor paraphrase corruption and lossy memory retrieval are one failure mode, and that per-claim confidence should instrument the orchestration boundary rather than `forward_message` bypassing it

---

## 2026-08-20 (compile — first successful write phase since credits were restored)

- [[wiki/concepts/meta-harness|Meta-Harness]] — a harness that builds or configures other harnesses
- [[wiki/concepts/self-improving-harness|Self-Improving Harness]] — a harness that edits its own scaffolding from its own run history
- [[wiki/frameworks/super-simple-software-factory|Super Simple Software Factory]] — Disler's minimal software-factory harness
- [[wiki/patterns/pattern-code-owns-control-plane|Code Owns the Control Plane]] — keep orchestration in code; let the model own judgement, not control flow
- [[wiki/syntheses/harness-vs-meta-harness-vs-self-improving-harness|Harness vs Meta-Harness vs Self-Improving Harness]] — distinguishes the three layers and what each buys you

Directly relevant to the "software factory vs harness" question in Jay's 2026-08-20 Apple Note, which the same morning's Morning Review flagged for research.

## 2026-08-20 (morning-review-daily apply pass)

- [[wiki/syntheses/synthesis-rrf-proof-of-work-receipts|A Proof-of-Work Receipt Cannot Certify a Fused Ranking, Because RRF Discards the Only Channel a Receipt Could Read]] — the one place in the cluster where the standard `context_fidelity` mitigation fails: RRF's score-blindness is the algorithm's defining property, not a schema oversight, so there is no channel to annotate. Proposes moving retrieval receipts upstream to individual retrievers and having the fusion stage record input handles rather than an independent soundness claim.

## 2026-08-19 (morning-review-daily apply pass)

- [[wiki/syntheses/synthesis-headroom-compression-reciprocal-rank-fusion|Compression Upstream of Reciprocal Rank Fusion Corrupts Rank Order Without Changing the Fused List's Shape]] — extends the compression-vs-adjudication rule from receipts and freshness signals to a *ranking* signal: RRF is score-free, so a degraded retriever has no channel to signal low confidence, and a single shared compressor injects correlated bias that RRF's consensus math amplifies rather than averages away; conditional on an unverified fact about whether Headroom compresses before or after retrieval

## 2026-08-16 (morning-review-daily apply pass)

- [[wiki/syntheses/synthesis-headroom-compression-proof-of-work-receipts|Context Compression Upstream of a Proof-of-Work Receipt Can Certify a Check That Never Really Happened]] — closes the 9th of 10 edges in the 5-node cluster: compression is safe for consumption and unsafe for adjudication, so a receipt that does not record its own `context_fidelity` cannot be audited; strong "verify against the cache" rule deferred pending a two-run comparison

## 2026-08-15 (morning-review-daily apply pass)

- [[wiki/syntheses/synthesis-proof-of-work-receipts-obsidian-wiki-audit-trail|The Proof-of-Work Receipt Is the Audit Trail the Gated Vault Never Specified]] — completes the 5-node cluster graph: the receipt schema supplies the commit record the gated-vault proposal leaves unspecified, collapsing gate → write → receipt → log into one pipeline; defensible form is a batch receipt per nightly gate run, not per write

## 2026-08-14 (morning-review-daily apply pass)

- [[wiki/syntheses/synthesis-proof-of-work-receipts-episodic-judgment-ingestion|Proof-of-Work Receipts as the Episodic Judgment Log's Ingestion Contract]] — the Proof-of-Work Loop's "learning update" step supplies the ingestion contract the episodic log assumes but never specifies; open question is whether agent-emitted entries dilute the log's human-judgment authority

## 2026-08-13 (morning-review-daily apply pass)

- [[wiki/syntheses/synthesis-episodic-judgment-obsidian-wiki-gate|The Episodic Judgment Log Is the Ground-Truth Oracle obsidian-wiki's Gate Is Missing]] — the missing sixth edge of the Headroom/SkillOpt/obsidian-wiki/episodic-log cluster; proposes sourcing vault-gate validation cases from human correction events instead of synthetic fixtures

## 2026-08-12 (morning-review-daily apply pass)

- [[wiki/syntheses/synthesis-skillopt-gate-episodic-judgment-log|SkillOpt's Validation Gate Closes the Episodic Judgment Log's Missing-Gate Gap]] — the gate mechanism transplanted a second time, onto freshness-clock resets; completes the governance story across skills, vault pages, and episodic events

## 2026-08-10 (morning-review-daily apply pass)

- [[wiki/syntheses/synthesis-headroom-compression-episodic-judgment-signal|Headroom Compression Threatens the Episodic Judgment Log's Freshness Authority]] — the silent-corruption risk from the SkillOpt synthesis generalized to the KB's highest-trust freshness signal

## 2026-08-09 (morning-review-daily apply pass)

- [[wiki/syntheses/synthesis-skillopt-gate-obsidian-wiki-governance|SkillOpt's Validation Gate Is the Governance Layer obsidian-wiki Lacks]] — held-out fixture gating as the missing quality gate for agent-writable vaults; closes the third side of the Headroom/SkillOpt/obsidian-wiki triangle
- [[wiki/syntheses/synthesis-headroom-compression-skillopt-signal|Headroom Compression Can Silently Corrupt SkillOpt's Training Signal]] — co-deploying runtime compression and eval-gated skill optimization risks training on degraded evidence

## 2026-08-08 (morning-review-daily apply pass)

- [[wiki/syntheses/synthesis-context-compression-vs-compilation|Context Compression vs. Context Compilation]] — Headroom (compress at use) and obsidian-wiki (compile in advance) are complements, not substitutes, for context cost

## 2026-06-01 (Obsidian living graph alignment)

- [[wiki/personal/decision-defer-smart-connections-2026-06-01|Defer Smart Connections]] — Decision: use Hermes/MCP link suggestions + Sofie writeback instead of in-vault Smart Connections
- [[wiki/prompt-library/graph-maintenance|Graph Maintenance Prompt]] — Daily living-graph scan prompt with Sofie writeback queue format
- `playbooks/graph-maintenance-run.md` — Daily graph maintenance job definition
- `scripts/graph-maintenance-scan.mjs` — Read-only vault scan with receipt verification

---

## 2026-06-10 (agentmemory provenance gap — RESOLVED)
- [[wiki/concepts/reciprocal-rank-fusion|Reciprocal Rank Fusion]] — UPDATED: `[UNVERIFIED PROVENANCE]` replaced with `[PROVENANCE RESOLVED]`; closed via corroboration (Cormack et al. 2009 + siagian roadmap); confidence medium→high.
- [[wiki/patterns/pattern-per-claim-confidence|Per-Claim Confidence]] — UPDATED: provenance loop closed as won't-fix; still single-source, retained at `medium`, not promoted to canonical.
- [[wiki/summaries/summary-llm-wiki-v2|LLM Wiki v2]] — UPDATED: provenance note added; source confirmed unrecoverable; stays `medium`.
- Downstream syntheses (`synthesis-rrf-as-rlm-fusion-stage`, `synthesis-per-claim-confidence-as-rag-precision-layer`) updated to reflect resolution. 0 open contradictions remaining.

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


## 2026-08-18

- [[syntheses/synthesis-headroom-compression-obsidian-wiki-vault|Synthesis: An Agent-Maintained Vault Compiled Through a Compression Layer Inherits Lossy Knowledge It Cannot Later Detect]] — closes the 10th and final pairwise edge of the five-node governance cluster (Headroom × obsidian-wiki); argues CCR reversibility expires at the session boundary while a compile-once vault page is read as settled fact for months, and `obsidian-wiki` documents no validation gate to catch it. Proposes a `context_fidelity` frontmatter field; counter-argument is that the flag becomes ceremony if it is almost always set.
- `wiki/_meta/proposals.md` — new entry `PROP-152 [HEAVY_BACKLOG]` (167 deferred themes vs threshold 50).
- `wiki/_meta/compile-log.md` — 2-source gate run: 30 promote, 167 defer, 0 graduate; 12 raw docs compiled → 11 pages created, 3 updated.
- New pages from the compile gate: `concepts/foundry-capture-pipeline`, `frameworks/remember-cite-forget`, `concepts/agent-memory-architecture`, `summaries/summary-hf-agent-intrusion-technical-timeline`, `concepts/agent-evaluation-gaming`, `patterns/pattern-single-agent-front-door`, `summaries/summary-sierra-ai-pilling-lessons`, `entities/sierra-ai`, `patterns/pattern-embedded-graduation-model`, `entities/leann`, `concepts/local-rag-storage-optimization`, `concepts/managed-agents`, `summaries/summary-hwchase17-managed-agents-thesis`.

## 2026-08-29

- [[syntheses/synthesis-memory-selection-needs-a-benchmark-protocol|Memory-System Selection Rests on a Benchmark With No Re-Verification Protocol]] — the hot cache's Letta-over-Mem0 default rests on a self-flagged-stale LoCoMo number that no page defines a procedure to re-verify.
- [[personal/roofclaim-recovery-business-plan|RoofClaim Recovery — Business Plan Notes]] — compiled from Apple Notes clipping; public-adjusting + AI claim-recovery venture concept.
