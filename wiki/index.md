---
id: 01KNNVX2QWD5ABN97BE6A2B2MN
---

# Agentic Engineering KB — Master Index
> Last updated: 2026-04-12 (session 2) | Maintained by LLM | Never edit manually

## Quick Navigation
- [[wiki/home|Home]] — Visual front door: concept map, top 5 pages, KB roadmap
- [[wiki/hot|Hot Cache]] — Start here for common queries
- [[wiki/recently-added|Recently Added]] — Chronological feed of new pages
- [[wiki/stats|KB Stats]] — Auto-generated: page counts, link density, freshness, orphans
- [[wiki/log|Operation Log]] — Full operation audit trail

## Maps of Content (Domain Hubs)
- [[mocs/orchestration|Orchestration MoC]] — Multi-agent, frameworks, fan-out patterns, recipes
- [[mocs/memory|Memory MoC]] — Memory systems, wiki pattern, RLM pipeline, promotion policies
- [[mocs/tool-use|Tool Use MoC]] — MCP, permissions, tool design, Claude API
- [[mocs/evaluation|Evaluation MoC]] — LLM-as-judge, trajectory eval, benchmarks, promotion scoring

## Research Engine (KB Module)
- [[knowledge-systems/research-engine/command-center|Command Center]] — Active projects, 6-step execution protocol, status tracker
- [[knowledge-systems/research-engine/README|Module Overview]] — Structure, KB integration points, how to use
- **Methodology:** [[knowledge-systems/research-engine/methodology/ontology-lite|Ontology-Lite]] · [[knowledge-systems/research-engine/methodology/provenance-rules|Provenance Rules]] · [[knowledge-systems/research-engine/methodology/research-frameworks|Research Frameworks]] · [[knowledge-systems/research-engine/methodology/source-evaluation|Source Evaluation]] · [[knowledge-systems/research-engine/methodology/synthesis-rules|Synthesis Rules]] · [[knowledge-systems/research-engine/methodology/contradiction-protocol|Contradiction Protocol]]
- **Lenses:** [[knowledge-systems/research-engine/lenses/technical|Technical]] · [[knowledge-systems/research-engine/lenses/economic|Economic]] · [[knowledge-systems/research-engine/lenses/historical|Historical]] · [[knowledge-systems/research-engine/lenses/geopolitical|Geopolitical]] · [[knowledge-systems/research-engine/lenses/contrarian|Contrarian]] · [[knowledge-systems/research-engine/lenses/first-principles|First Principles]]
- **Knowledge:** [[knowledge-systems/research-engine/knowledge/entities|Entities]] · [[knowledge-systems/research-engine/knowledge/relationships|Relationships]] · [[knowledge-systems/research-engine/knowledge/open-questions|Open Questions]] · [[knowledge-systems/research-engine/knowledge/concepts|Concepts]] · [[knowledge-systems/research-engine/knowledge/data-points|Data Points]]
- **Templates:** [[knowledge-systems/research-engine/templates/research-question-intake|Intake Form]] · [[knowledge-systems/research-engine/templates/deep-dive-template|Deep Dive]] · [[knowledge-systems/research-engine/templates/decision-memo-template|Decision Memo]] · [[knowledge-systems/research-engine/templates/executive-summary-template|Executive Summary]] · [[knowledge-systems/research-engine/templates/project-template|Project]] · [[knowledge-systems/research-engine/templates/source-template|Source]]

---

## Concepts (20)

| Page | Type | Tags | Confidence | Description |
|------|------|------|------------|-------------|
| [[concepts/agent-failure-modes]] | concept | agentic, safety, error-handling | — | Common ways agents fail in production |
| [[concepts/agent-loops]] | concept | agentic, orchestration | — | Looping and iteration patterns in agent execution |
| [[concepts/chain-of-thought]] | concept | prompt-engineering, reasoning | — | Eliciting step-by-step reasoning from LLMs |
| [[concepts/context-management]] | concept | context-management | — | Managing the finite context window effectively |
| [[concepts/few-shot-prompting]] | concept | prompt-engineering | — | In-context learning via examples |
| [[concepts/guardrails]] | concept | safety, agentic | — | Hard and soft constraints on agent behavior |
| [[concepts/human-in-the-loop]] | concept | human-in-the-loop, safety | — | When and how humans intervene in agent workflows |
| [[concepts/llm-as-judge]] | concept | evaluation | — | Using LLMs to evaluate other LLM outputs |
| [[concepts/memory-systems]] | concept | memory, agentic | — | Persistence and retrieval of knowledge across sessions |
| [[concepts/multi-agent-systems]] | concept | multi-agent, orchestration | — | Coordinating multiple LLM agents |
| [[concepts/permission-modes]] | concept | agentic, safety, claude-code | — | Tool and action permissions for agents |
| [[concepts/self-critique]] | concept | evaluation, reflection | — | Agents reviewing and improving their own outputs |
| [[concepts/system-prompt-design]] | concept | prompt-engineering | — | Designing effective system prompts for agents |
| [[concepts/task-decomposition]] | concept | orchestration, agentic | — | Breaking complex tasks into agent-executable steps |
| [[concepts/tool-use]] | concept | tool-use, agentic | — | How agents select and call tools |
| [[concepts/rag-systems]] | concept | memory, tool-use, context-management, evaluation | high | RAG architecture: chunking, hybrid retrieval, re-ranking, grounded generation, metadata filtering, eval metrics |
| [[concepts/rlm-pipeline]] | concept | context-management, memory, observability | high | 10-stage Recursive Layered Memory retrieval pipeline |
| [[concepts/trajectory-evaluation]] | concept | evaluation | — | Evaluating the full sequence of agent decisions |
| [[concepts/reciprocal-rank-fusion]] | concept | memory, rag-systems, evaluation | high | Score-free algorithm for merging BM25 + vector + graph ranked lists via 1/(k+rank) |
| [[concepts/knowledge-graphs]] | concept | knowledge-graph, memory, rag-systems, agentic | high | Entities + typed directed edges + triples + ontology + inference; multi-hop reasoning that relational DBs and vector search can't perform |

---

## Patterns (8)

| Page | Category | Problem | Confidence |
|------|----------|---------|------------|
| [[patterns/pattern-compounding-loop]] | memory | LLM answers are ephemeral — each query rediscovers knowledge with no memory of past answers | high |
| [[patterns/pattern-episodic-judgment-log]] | memory | Agents have your files but not your judgment — they give generic advice on decisions you've already thought through | medium |
| [[patterns/pattern-two-step-ingest]] | prompt-engineering | Single-call compilation conflates analysis with generation, producing lower-quality wiki pages with weak cross-links | medium |
| [[patterns/pattern-layered-injection-hierarchy]] | memory | Not all memory should be injected at the same frequency — always-present context inflates every prompt, while on-demand context is forgotten between sessions | medium |
| [[patterns/pattern-shared-agent-workspace]] | memory | Multiple agents duplicate context, drift out of sync, and can't hand off work without manual re-briefing | medium |
| [[patterns/pattern-mistake-log]] | memory | Agents repeat the same errors across sessions because corrections live only in the current conversation | medium |
| [[patterns/pattern-per-claim-confidence]] | memory | Page-level confidence is too coarse — a page can mix high-confidence decisions with low-confidence speculation, all weighted equally | medium |
| [[patterns/pattern-typed-knowledge-graph]] | memory | Wiki link graphs track connection existence but not semantics — can't distinguish "A caused B" from "A implements B" | medium |

---

## Frameworks (12)

| Page | Vendor | Version | Jay's Experience | Last Checked |
|------|--------|---------|-----------------|--------------|
| [[frameworks/framework-autogen]] | Microsoft | 0.4.x | none | 2026-04-04 |
| [[frameworks/framework-markitdown]] | Microsoft | 0.1.x | none | 2026-04-09 |
| [[frameworks/framework-bmad]] | Jay West | current | extensive | 2026-04-04 |
| [[frameworks/framework-claude-api]] | [[anthropic]] | claude-sonnet-4-6 | extensive | 2026-04-04 |
| [[frameworks/framework-claude-code]] | Anthropic | 1.x | extensive | 2026-04-04 |
| [[frameworks/framework-crewai]] | [[framework-crewai]] | 0.80.x | none | 2026-04-04 |
| [[frameworks/framework-gsd]] | Jay West | 1.28.0 | extensive | 2026-04-04 |
| [[frameworks/framework-langgraph]] | LangChain | 0.2.x | limited | 2026-04-04 |
| [[frameworks/framework-mcp]] | Anthropic | 1.x | moderate | 2026-04-04 |
| [[frameworks/framework-openclaw]] | Unknown | 2026.3.24 | moderate | 2026-04-04 |
| [[frameworks/framework-rowboat]] | Rowboat Labs | unknown | limited | 2026-04-09 |
| [[frameworks/framework-superpowers]] | Jay West | 5.0.6 | extensive | 2026-04-04 |

---

## Entities (8)

| Page | Category | Description |
|------|----------|-------------|
| [[entities/andrej-karpathy]] | person | Former Tesla AI Director, [[openai]] co-founder, [[llm-wiki]] pattern creator, nanoGPT |
| [[entities/anthropic]] | company | Claude model family, [[framework-claude-code]], [[mcp-ecosystem]], Constitutional AI |
| [[entities/jay-west-agent-stack]] | person | Jay's complete agent stack: 34 agents, 29+ skills, 3 frameworks, 2 runtimes |
| [[entities/key-agentic-researchers]] | ecosystem | [[andrej-karpathy]], Chase, Nakajima, Ng, Weng, Qiu — key contributors to the field |
| [[entities/langchain-ecosystem]] | ecosystem | LangChain, [[framework-langgraph]], LangSmith, LangServe |
| [[entities/mcp-ecosystem]] | ecosystem | MCP server catalog: Figma, context7, exa, firecrawl, custom servers |
| [[entities/model-landscape]] | ecosystem | Model comparison: Claude, GPT-4o, o3/o4, Gemini, Llama, Mistral, Qwen |
| [[entities/openai]] | company | GPT-4o, o3/o4, Assistants API, DALL-E, Whisper, Realtime API |

---

## Recipes (12)

| Page | Difficulty | Time | Description |
|------|-----------|------|-------------|
| [[recipes/recipe-agent-evaluation]] | advanced | 2-4h | Build an [[llm-as-judge]] evaluation harness for agents |
| [[recipes/recipe-build-tool-agent]] | intermediate | 45-90m | Build a single Claude agent with custom tools from scratch |
| [[recipes/recipe-claude-code-hooks]] | intermediate | 1-2h | Write Claude Code hooks for custom automation |
| [[recipes/recipe-codebase-memory]] | intermediate | 30-60m | Wire the KB as persistent codebase memory for multi-session coding projects |
| [[recipes/recipe-context-compression]] | intermediate | 1-2h | [[pattern-rolling-summary]] compression for long agentic sessions |
| [[recipes/recipe-llm-wiki-setup]] | beginner | 60-90m | Set up a Karpathy-style LLM knowledge base |
| [[recipes/recipe-mcp-server]] | intermediate | 45-60m | Write and register a custom MCP server in TypeScript |
| [[recipes/recipe-multi-agent-crew]] | advanced | 2-3h | Wire an orchestrator with 3 specialist sub-agents |
| [[recipes/recipe-parallel-subagents]] | advanced | 2-3h | [[pattern-fan-out-worker]] pattern: spawn N agents in parallel, handle failures |
| [[recipes/recipe-kb-lifecycle-hooks]] | intermediate | 2-3h | Automate ingest, session-end compression, and scheduled decay/lint hooks |
| [[recipes/recipe-hybrid-search-llm-wiki]] | advanced | 4-6h | BM25 + vector + typed graph + RRF hybrid search (RLM Stages 1–3 implementation) |
| [[recipes/recipe-local-research-engine]] | intermediate | 1-2h setup | 6-lens research skill graph (Claude Code + Obsidian): 60% research cost reduction, compound knowledge base |

---

## Evaluations (2)

| Page | Comparing | Verdict |
|------|-----------|---------|
| [[evaluations/eval-memory-approaches]] | In-context vs file-wiki vs vector DB vs knowledge graph | File-based wiki wins for Jay's use case |
| [[evaluations/eval-orchestration-frameworks]] | GSD vs LangGraph vs [[framework-autogen]] vs CrewAI vs raw Claude Code | GSD first, Raw Claude Code second, LangGraph if Python required |

---

## Summaries (22 raw sources ingested)

| Page | Source | Date Ingested | Key Concepts |
|------|--------|--------------|-------------|
| [[summaries/summary-gsd-executor]] | `raw/my-agents/gsd-executor.md` | 2026-04-04 | deviation-rules, checkpoint-protocol, atomic-commits, tdd-execution |
| [[summaries/summary-gsd-planner]] | `raw/my-agents/gsd-planner.md` | 2026-04-04 | context-budget, goal-backward, user-decision-fidelity, discovery-levels |
| [[summaries/summary-gsd-verifier]] | `raw/my-agents/gsd-verifier.md` | 2026-04-04 | four-level-artifact-check, stub-detection, data-flow-trace, re-verification |
| [[summaries/summary-gsd-debugger]] | `raw/my-agents/gsd-debugger.md` | 2026-04-04 | scientific-debugging, hypothesis-falsifiability, cognitive-bias-avoidance |
| [[summaries/summary-gsd-codebase-mapper]] | `raw/my-agents/gsd-codebase-mapper.md` | 2026-04-04 | write-and-return, four-focus-areas, prescriptive-documentation |
| [[summaries/summary-gsd-framework-skills]] | Multiple GSD agents | 2026-04-04 | [[pattern-plan-execute-verify]], wave-execution, state-machine, checkpoint-protocol |
| [[summaries/summary-architect-agent]] | `raw/my-agents/architect.md` | 2026-04-04 | adr-format, 18-month-horizon, boring-technology, trade-off-analysis |
| [[summaries/summary-code-reviewer-agent]] | `raw/my-agents/code-reviewer.md` + superpowers | 2026-04-04 | severity-levels, six-dimensions, plan-alignment, structured-feedback |
| [[summaries/summary-security-reviewer-agent]] | `raw/my-agents/security-reviewer.md` | 2026-04-04 | threat-model, owasp-top-10, attacker-mindset, security-controls |
| [[summaries/summary-task-breakdown-agent]] | `raw/my-agents/04-task-breakdown-agent.md` | 2026-04-04 | atomic-tasks, numbered-pipeline, acceptance-criteria, scope-boundary |
| [[summaries/summary-superpowers-framework]] | `raw/my-agents/superpowers-code-reviewer.md` | 2026-04-04 | iron-laws, tdd-first, verification-before-completion, two-stage-review |
| [[summaries/summary-graphify-skill]] | `raw/my-skills/graphify-skill.md` | 2026-04-04 | knowledge-graph, parallel-subagents, extraction-cache, community-detection |
| [[summaries/summary-multi-agent-patterns-skill]] | `raw/my-skills/multi-agent-patterns-skill.md` | 2026-04-04 | [[pattern-supervisor-worker]], context-isolation, telephone-game, consensus-mechanisms |
| [[summaries/summary-karpathy-llm-wiki-gist]] | `raw/framework-docs/karpathy-llm-wiki-gist.md` | 2026-04-04 | three-layer-architecture, ingest-query-lint, index-md, log-md |
| [[summaries/summary-karpathy-llm-wiki-video]] | `raw/transcripts/karpathy-llm-wiki-video.md` | 2026-04-04 | compounding-knowledge, wiki-vs-rag, division-of-labor, four-principles |
| [[summaries/summary-nate-herk-llm-wiki]] | `raw/transcripts/nate-herk-llm-wiki.md` | 2026-04-04 | hot-cache, token-efficiency-95pct, linting, scale-limits |

---

- [[summaries/nvidia-gtc-2026-agentic-enterprise|Enterprise AI Agent Workforce Architecture — NVIDIA GTC 2026]] — LinkedIn practitioner post covering NVIDIA's GTC 2026 Agent Toolkit launch, 17 enterprise platform partners, OpenShell runtime governance, and a 20-item enterprise AI compliance checklist
- [[summaries/19-oss-agent-repos-curated|19 OSS Agent Repos — Curated List]] — Practitioner map of 19 free GitHub repos covering the full agentic stack: orchestration, coding agents, memory, and production tooling
- [[summaries/langchain-deepagents-production|LangChain Deep Agents — Going to Production]] — Official LangChain production guide covering LangSmith deployment, multi-tenancy auth, durable checkpointing, scoped memory, sandboxed execution, and middleware guardrails
- [[summaries/karpathy-llm-wiki-gist|Karpathy LLM Wiki Pattern — Gist]] — Karpathy's minimal pattern for LLM-maintained knowledge bases: immutable raw sources, LLM-owned wiki, co-evolving schema, and three core workflows (Ingest, Query, Lint)
- [[summaries/andrej-karpathy-thinks-rag-is-broken|Andrej Karpathy Thinks RAG Is Broken]] — Note covering Karpathy's LLM Wiki project: a compounding, AI-maintained wiki pattern proposed as a replacement for stateless RAG
- [[summaries/farzapedia-personal-wiki|Farzapedia Personal Wiki]] — Personal wiki over iMessages/Notes/diary using agentic index-navigation (Librarian pattern) instead of RAG
- [[summaries/karpathy-llm-wiki-video|Building a Trading Strategies LLM Knowledge Base (Karpathy Pattern)]] — Transcript explaining the LLM-wiki architectural pattern: persistent interlinked wikis as a compound-knowledge alternative to stateless RAG, with three-layer architecture, core operations (ingest/query/lint), and live Claude Code demo
- [[summaries/nate-herk-llm-wiki|Set Up Your LLM Knowledge Base in 5 Minutes (Nate Herk)]] — Walkthrough of the LLM wiki pattern: markdown-only KB, [[pattern-hot-cache]], lint workflow, and 95% token reduction vs RAG
- [[summaries/19-oss-agent-repos-curated|19 OSS Agent Repos — Curated List]] — Curated overview of 19 open-source GitHub repos spanning multi-agent orchestration, autonomous coding agents, memory/reasoning, and production tooling
- [[summaries/nvidia-gtc-2026-agentic-enterprise|Enterprise AI Agent Workforce Architecture — NVIDIA GTC 2026]] — NVIDIA GTC 2026 launch recap (via [[agentlayer]] LinkedIn post): OpenShell runtime, enterprise agent adoption stats, and a 20-requirement compliance checklist for enterprise AI governance
- [[summaries/karpathy-llm-wiki-gist|Karpathy LLM Wiki Pattern — Gist]] — Karpathy's minimal spec for an LLM-maintained knowledge base: immutable raw sources, LLM-owned wiki, and a co-evolving schema file
- [[summaries/langchain-deepagents-production|LangChain Deep Agents — Going to Production]] — LangSmith/LangGraph production stack: durable checkpointing, scoped memory, sandbox execution, middleware guardrails, and multi-tenancy patterns
- [[summaries/andrej-karpathy-thinks-rag-is-broken|Andrej Karpathy Thinks RAG Is Broken]] — Note summarizing Karpathy's LLM Wiki project: a persistent, compounding knowledge base pattern proposed as a replacement for RAG
- [[summaries/private-test-note|Private Test Note]] — Internal test fixture for verifying PIN lock system across web UI, MCP, and CLI surfaces
- [[summaries/farzapedia-personal-wiki|Farzapedia Personal Wiki]] — Personal wiki over iMessages/Notes/diary using agentic Librarian navigation (no RAG); inspired by Karpathy LLM wiki pattern
- [[summaries/karpathy-llm-wiki-video|Building a Trading Strategies LLM Knowledge Base (Karpathy Pattern)]] — Transcript explaining the LLM wiki pattern: three-layer architecture (raw/wiki/schema), INGEST/QUERY/LINT operations, and division of labor between human curator and LLM maintainer
- [[summaries/nate-herk-llm-wiki|Set Up Your LLM Knowledge Base in 5 Minutes (Nate Herk)]] — Walkthrough of Karpathy's LLM wiki pattern: markdown-only KB, hot cache, lint cycle, and LLM wiki vs RAG tradeoffs; one user cut token usage 95%
- [[summaries/siagian-agentic-engineer-roadmap-2026|Agentic AI Engineer Roadmap 2026 (Siagian)]] — 10-section interview Q&A guide: Python→LLM→Framework→Memory→Tools→RAG→Agents→Production; strong on RAG system design, hybrid retrieval, grounded generation, CI/CD for agents; surfaces 6 KB gaps
- [[summaries/2026-04-08-what-is-the-best-pattern-for-multi-agent-orchestration-in-cl|Q&A: Best Pattern for Multi-Agent Orchestration in Claude Code]] — Synthesized Q&A recommending the Fan-Out Orchestrator-Worker pattern as the default; covers three sub-patterns, Agent tool parameters, token economics (~15× multiplier for multi-agent), the Telephone Game failure mode, and when to avoid multi-agent altogether
- [[summaries/vault-3tier-architecture|Agent Vault — 3-Tier Architecture]] — Jay's production vault memory system: scoped context loading and explicit write targets for all 32 agents across orchestrator/lead/worker tiers
- [[summaries/summary-layered-agent-memory-obsidian|Layered Agent Memory — Obsidian-Backed 4-Layer System]] — Framework-agnostic 4-layer memory architecture: always-injected sticky notes + rules, on-demand vault (daily logs, working context, mistakes), searchable session archive; compaction recovery and write cadence discipline
- [[summaries/summary-llm-wiki-v2|LLM Wiki v2 — Confidence, Graph, Hybrid Search, Automated Hooks]] — Extension of Karpathy's LLM Wiki: per-claim confidence, typed knowledge graph, BM25+vector+RRF hybrid search, automated lifecycle hooks, forgetting curves, AI contradiction resolution. Gap analysis vs. this KB included.
- [[summaries/summary-knowledge-graphs-explainer|Knowledge Graphs — Everything Is Connected]] — Comprehensive explainer: nodes/edges/properties, triple model (S-P-O), ontology (classes + instances), named graphs with temporal context, graph inference (derive unstated facts), SPARQL/Cypher querying, KG vs relational DB decision guide. Application map to this KB included.
- [[summaries/summary-research-skill-graph|Local Research Engine — The Research Skill Graph System]] — Practitioner system deployed at 4 companies (60% research cost reduction): 6-lens forced-perspective analysis (technical/economic/historical/geopolitical/contrarian/first-principles), 5-tier source evaluation, contradiction-as-feature protocol, compound knowledge base. Scaffolded at research-skill-graph/.
- [[summaries/summary-wikiwise-skills|Wikiwise Skill Library — Ingest, Digest, Readwise]] — 6 operational skill files from TristanH/wikiwise: stream-to-disk rule for large documents, parallel subagent dispatch, batch-before-ingest, 2-3 inbound-link density rule, user-confirmed highlight search, single-file tweet collection.

## Personal (Jay's patterns)

| Page | Category | Confidence | Description |
|------|----------|------------|-------------|
| [[personal/personal-agent-design-observations]] | pattern | medium | 10 observed patterns across Jay's 32 agent definitions |
| [[personal/personal-jays-framework-philosophy]] | decision | high | Three-framework selection system (GSD/[[framework-superpowers]]/[[framework-bmad]]) with decision tree |
| [[personal/hermes-operating-context]] | pattern | high | Hermes orchestrator session-start memory: portfolio state, active priorities, routing defaults, durable lessons |

---

## Syntheses (2)

| Page | Question | Created |
|------|----------|---------|
| [[syntheses/lint-2026-04-06]] | What structural issues, gaps, and maintenance needs exist in the wiki as of 2026-04-06? | 2026-04-06 |
| [[syntheses/lint-2026-04-12]] | What structural issues, gaps, and maintenance needs exist in the wiki as of 2026-04-12? | 2026-04-12 |

---

## Repo Plans

- [[repos/agentic-kb/rewrites/plans/2026-04-10-operational-runtime-memory-layer-plan|Operational Runtime Memory Layer Plan]] — phased repo plan to add first-class task-local state, tighter scoped loading, contract-driven promotions, and truly atomic writeback for active agents
