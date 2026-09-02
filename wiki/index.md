---
id: 01KNNVX2QWD5ABN97BE6A2B2MN
---

# Agentic Engineering KB — Master Index
> Last updated: 2026-08-31 (refinery run) | Maintained by LLM | Never edit manually

## Quick Navigation
- [[wiki/home|Home]] — Visual front door: concept map, top 5 pages, KB roadmap
- [[wiki/hot|Hot Cache]] — Start here for common queries
- [[wiki/recently-added|Recently Added]] — Chronological feed of new pages
- [[wiki/stats|KB Stats]] — Auto-generated: page counts, link density, freshness, orphans
- [[wiki/log|Operation Log]] — Full operation audit trail

### Operational (call-transcript loop)
- [[wiki/action-tracker|Action Tracker]] — Open commitments extracted from calls & sessions
- [[wiki/decisions/README|Decisions Log]] — Durable decisions, one page each
- [[wiki/transcript-ingest|Transcript Ingest SOP]] — How calls become wiki content

## Maps of Content

### Knowledge Domains
- [[mocs/orchestration|Orchestration MoC]] — Multi-agent, frameworks, [[pattern-fan-out-worker]] patterns, recipes
- [[mocs/memory|Memory MoC]] — Memory systems, wiki pattern, RLM pipeline, promotion policies
- [[mocs/tool-use|Tool Use MoC]] — [[mcp-ecosystem]], permissions, tool design, Claude API
- [[mocs/evaluation|Evaluation MoC]] — [[llm-as-judge]], trajectory eval, benchmarks, promotion scoring

### Vault Infrastructure
- [[mocs/vault-foundation|Vault Foundation]] — Folder structure (PARA/[[llm-wiki-pattern]]), MoCs, templates, metadata, attachments
- [[mocs/claude-integration|Claude Integration]] — CLAUDE.md config, Hermes SOUL, [[mcp-ecosystem]] tools, skills, context loading, session memory
- [[mocs/core-plugins|Core Plugins]] — Terminal+[[framework-claude-code]], Dataview, Templater, Periodic Notes, Canvas, Graph View
- [[mocs/automation|Automation]] — Custom skills, auto-tagging, summary generation, daily review, vault maintenance scripts

### Knowledge Production
- [[mocs/knowledge-workflows|Knowledge Workflows]] — Capture→Process→Connect, literature notes, evergreen notes, project mgmt, research
- [[prompt-library/index|Prompt Library]] — Thinking tools, note processing, idea generation, reflection & synthesis, slash commands
- [[daily-systems/index|Daily Systems]] — Daily notes, weekly/monthly reviews, task & priority management

### Advanced & Operations
- [[mocs/advanced-techniques|Advanced Techniques]] — Agentic note-taking, multi-step reasoning, cross-note analysis, custom agents, vault-as-context
- [[mocs/visualization|Visualization]] — Graph view optimization, canvas workspaces, knowledge maps, progress dashboards
- [[mocs/maintenance|Maintenance & Optimization]] — Health checks, dead link cleanup, performance, backup & git, context optimization
- [[mocs/resources|Community & Resources]] — Plugin recommendations, best practices, shared vault templates, learning resources
- [[mocs/evolution|Evolution & Scaling]] — New skill development, multi-vault, team collaboration, long-term evolution, next-level AI

## Research Engine (KB Module)
- [[knowledge-systems/research-engine/command-center|Command Center]] — Active projects, 6-step execution protocol, status tracker
- [[knowledge-systems/research-engine/README|Module Overview]] — Structure, KB integration points, how to use
- **Methodology:** [[knowledge-systems/research-engine/methodology/ontology-lite|Ontology-Lite]] · [[knowledge-systems/research-engine/methodology/provenance-rules|Provenance Rules]] · [[knowledge-systems/research-engine/methodology/research-frameworks|Research Frameworks]] · [[knowledge-systems/research-engine/methodology/source-evaluation|Source Evaluation]] · [[knowledge-systems/research-engine/methodology/synthesis-rules|Synthesis Rules]] · [[knowledge-systems/research-engine/methodology/contradiction-protocol|Contradiction Protocol]]
- **Lenses:** [[knowledge-systems/research-engine/lenses/technical|Technical]] · [[knowledge-systems/research-engine/lenses/economic|Economic]] · [[knowledge-systems/research-engine/lenses/historical|Historical]] · [[knowledge-systems/research-engine/lenses/geopolitical|Geopolitical]] · [[knowledge-systems/research-engine/lenses/contrarian|Contrarian]] · [[knowledge-systems/research-engine/lenses/first-principles|First Principles]]
- **Knowledge:** [[knowledge-systems/research-engine/knowledge/entities|Entities]] · [[knowledge-systems/research-engine/knowledge/relationships|Relationships]] · [[knowledge-systems/research-engine/knowledge/open-questions|Open Questions]] · [[knowledge-systems/research-engine/knowledge/concepts|Concepts]] · [[knowledge-systems/research-engine/knowledge/data-points|Data Points]]
- **Templates:** [[knowledge-systems/research-engine/templates/research-question-intake|Intake Form]] · [[knowledge-systems/research-engine/templates/deep-dive-template|Deep Dive]] · [[knowledge-systems/research-engine/templates/decision-memo-template|Decision Memo]] · [[knowledge-systems/research-engine/templates/executive-summary-template|Executive Summary]] · [[knowledge-systems/research-engine/templates/project-template|Project]] · [[knowledge-systems/research-engine/templates/source-template|Source]]

---

## Concepts (100)

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
| [[concepts/hybrid-retrieval]] | concept | memory, rag-systems, context-management, agentic | high | BM25 + vector + optional graph fused via RRF; recovers documents neither approach gets alone |
| [[concepts/metadata-filtering]] | concept | rag-systems, memory, safety, multi-agent | high | Filter by tenant/permission in the retrieval layer before documents reach the model; filtering post-retrieval or by model instruction is a security failure |
| [[concepts/sandboxed-execution]] | concept | agentic, safety, deployment, production, isolation | medium | Isolated execution contexts for agent-generated code, now linked to OpenSandbox Credential Vault and the HF agent-intrusion incident |
| [[concepts/agent-evaluation-gaming]] | concept | agents, safety, evaluation, security | medium | Evaluation agents may pursue shortcut objectives, including escaping the benchmark boundary to obtain answers |
| [[concepts/agent-observability]] | concept | agentic, observability, production, monitoring | medium | Action-level traces, replay, cost, latency, and cross-system correlation for debugging agent behavior |
| [[concepts/deep-agents-harness]] | concept | agents, orchestration, architecture, tools, memory | high | LangChain Deep Agents reusable harness for planning, tool calls, filesystem state, and subagent delegation |
| [[concepts/managed-agents]] | concept | agents, orchestration, architecture, deployment, infrastructure | medium | Agent harnesses on managed infrastructure; builders provide business logic while runtime handles durability, sandboxing, streaming, auth, memory, and eval |
| [[concepts/agent-harness-model-context]] | concept | agents, architecture, context, orchestration, llm | medium | Diagnostic triad: agent failures usually live in harness/context/model fit, not model capability alone |
| [[concepts/agentic-sdlc]] | concept | agents, orchestration, workflow, automation, architecture | medium | End-to-end software delivery lifecycle with specialized agents and human approval gates |
| [[concepts/software-factory]] | concept | agents, orchestration, architecture, automation, workflow | medium | Agents plus code plus human direction assembled into a reusable software-delivery/product-building system |

---

## Patterns (88)

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
| [[patterns/pattern-grounded-generation]] | evaluation | LLM outputs that cite retrieved content often hallucinate citations or make claims not supported by source chunks | high |
| [[patterns/pattern-react]] | orchestration | Agents that reason only from parametric memory hallucinate and cannot update beliefs from new information mid-task | high |
| [[patterns/pattern-navigator-driver-agentic-coding]] | orchestration | Developers use agents as autocomplete or isolated chat assistants, leaving the human to still perform coordination, review, and artifact assembly | medium |
| [[patterns/pattern-agent-as-ui-system-of-record-backend]] | orchestration | Agent systems create duplicate plans, duplicated state, and split-brain workflows when they store work outside the tools where the organization already operates | medium |
| [[patterns/pattern-outcome-metrics-for-agent-adoption]] | evaluation | Agent programs optimize for easy activity metrics without proving that work got faster, better, safer, or less burdensome | medium |
| [[patterns/pattern-embedded-graduation-model]] | deployment | Central expert teams either stay too far from product teams to change behavior or embed permanently and become an unscalable dependency | medium |
| [[patterns/pattern-backend-sandbox-separation]] | orchestration | Agent brains and execution hands become coupled, making local/cloud/chat frontends expensive to reuse safely | medium |
| [[patterns/pattern-credential-gateway]] | safety | Agents need external credentials but raw secrets in prompts, env, or sandbox files create replay and exfiltration risk | medium |
| [[patterns/pattern-software-factory]] | orchestration | Building one AI product by prompting resets to zero; building reusable primitives, promotion, memory, and human loops compounds across products | medium |

---

## Frameworks (44)

| Page | Vendor | Version | Jay's Experience | Last Checked |
|------|--------|---------|-----------------|--------------|
| [[frameworks/framework-autogen]] | Microsoft | 0.4.x | none | 2026-04-04 |
| [[frameworks/framework-headroom]] | Tejas Chopra / contributors | rolling | none | 2026-06-25 |
| [[frameworks/framework-markitdown]] | Microsoft | 0.1.x | none | 2026-04-09 |
| [[frameworks/framework-bmad]] | Jay West | current | extensive | 2026-04-04 |
| [[frameworks/framework-claude-api]] | [[anthropic]] | claude-sonnet-4-6 | extensive | 2026-04-04 |
| [[frameworks/framework-claude-code]] | [[anthropic]] | 1.x | extensive | 2026-04-04 |
| [[frameworks/framework-crewai]] | [[framework-crewai]] | 0.80.x | none | 2026-04-04 |
| [[frameworks/framework-deepeval]] | Confident AI Inc. | rolling | none | 2026-04-18 |
| [[frameworks/framework-gsd]] | Jay West | 1.28.0 | extensive | 2026-04-04 |
| [[frameworks/framework-inspect-ai]] | UK AISI | rolling | none | 2026-04-18 |
| [[frameworks/inspect-ai]] | UK AISI | unknown | none | 2026-04-18 |
| [[frameworks/framework-langgraph]] | LangChain | 0.2.x | limited | 2026-04-04 |
| [[frameworks/framework-langsmith]] | LangChain Inc. | rolling | none | 2026-04-18 |
| [[frameworks/framework-mcp]] | [[anthropic]] | 1.x | moderate | 2026-04-04 |
| [[frameworks/framework-openclaw]] | Unknown | 2026.3.24 | moderate | 2026-04-04 |
| [[frameworks/framework-obsidian-wiki]] | Ar9av / contributors | rolling | limited | 2026-06-25 |
| [[frameworks/framework-promptfoo]] | [[openai]] (acquired) | rolling | none | 2026-04-18 |
| [[frameworks/promptfoo]] | OpenAI / promptfoo | unknown | none | 2026-04-25 |
| [[frameworks/framework-rowboat]] | [[framework-rowboat]] Labs | unknown | limited | 2026-04-09 |
| [[frameworks/framework-skillopt]] | Microsoft | 0.1.0 | none | 2026-06-25 |
| [[frameworks/framework-superpowers]] | Jay West | 5.0.6 | extensive | 2026-04-04 |
| [[frameworks/opensandbox]] | opensandbox-group | rolling | none | 2026-08-27 |
| [[frameworks/lumay-ai]] | LuMay AI | rolling | none | 2026-08-27 |
| [[frameworks/simba]] | GitHamza0206 / Simba contributors | rolling | none | 2026-08-27 |
| [[frameworks/deepseek-harness]] | DeepSeek AI | developer preview | none | 2026-08-27 |
| [[frameworks/framework-managed-deep-agents]] | LangChain | rolling | none | 2026-08-27 |
| [[frameworks/framework-deepagents-code]] | LangChain | rolling | none | 2026-08-27 |
| [[frameworks/agent-orchestrator]] | Untrivial-ai | rolling | none | 2026-08-31 |

---

## Entities (19)

| Page | Category | Description |
|------|----------|-------------|
| [[entities/andrej-karpathy]] | person | Former Tesla AI Director, [[openai]] co-founder, [[llm-wiki]] pattern creator, nanoGPT |
| [[entities/anthropic]] | company | Claude model family, [[framework-claude-code]], [[mcp-ecosystem]], Constitutional AI |
| [[entities/jay-west-agent-stack]] | person | Jay's complete agent stack: 34 agents, 29+ skills, 3 frameworks, 2 runtimes |
| [[entities/key-agentic-researchers]] | ecosystem | [[andrej-karpathy]], Chase, Nakajima, Ng, Weng, Qiu — key contributors to the field |
| [[entities/langchain-ecosystem]] | ecosystem | LangChain, [[framework-langgraph]], LangSmith, LangServe |
| [[entities/mcp-ecosystem]] | ecosystem | [[mcp-ecosystem]] server catalog: Figma, context7, exa, firecrawl, custom servers |
| [[entities/model-landscape]] | ecosystem | Model comparison: Claude, GPT-4o, o3/o4, Gemini, Llama, Mistral, Qwen |
| [[entities/openai]] | company | GPT-4o, o3/o4, Assistants API, DALL-E, Whisper, Realtime API |

---

## Recipes (21)

| Page | Difficulty | Time | Description |
|------|-----------|------|-------------|
| [[recipes/recipe-agent-evaluation]] | advanced | 2-4h | Build an [[llm-as-judge]] evaluation harness for agents |
| [[recipes/recipe-build-tool-agent]] | intermediate | 45-90m | Build a single Claude agent with custom tools from scratch |
| [[recipes/recipe-claude-code-hooks]] | intermediate | 1-2h | Write [[framework-claude-code]] hooks for custom automation |
| [[recipes/recipe-codebase-memory]] | intermediate | 30-60m | Wire the KB as persistent codebase memory for multi-session coding projects |
| [[recipes/recipe-context-compression]] | intermediate | 1-2h | [[pattern-rolling-summary]] compression for long agentic sessions |
| [[recipes/recipe-llm-wiki-setup]] | beginner | 60-90m | Set up a [[andrej-karpathy]]-style LLM knowledge base |
| [[recipes/recipe-mcp-server]] | intermediate | 45-60m | Write and register a custom [[mcp-ecosystem]] server in TypeScript |
| [[recipes/recipe-multi-agent-crew]] | advanced | 2-3h | Wire an orchestrator with 3 specialist sub-agents |
| [[recipes/recipe-parallel-subagents]] | advanced | 2-3h | [[pattern-fan-out-worker]] pattern: spawn N agents in parallel, handle failures |
| [[recipes/recipe-kb-lifecycle-hooks]] | intermediate | 2-3h | Automate ingest, session-end compression, and scheduled decay/lint hooks |
| [[recipes/recipe-hybrid-search-llm-wiki]] | advanced | 4-6h | BM25 + vector + typed graph + RRF hybrid search (RLM Stages 1–3 implementation) |
| [[recipes/recipe-local-research-engine]] | intermediate | 1-2h setup | 6-lens research skill graph ([[framework-claude-code]] + Obsidian): 60% research cost reduction, compound knowledge base |
| [[recipes/recipe-agent-cicd]] | advanced | 4-8h | CI/CD pipeline for agent systems: prompt changes gated like code changes, metric regression blocks merge |
| [[recipes/recipe-production-deployment]] | advanced | 8-16h | FastAPI + Redis queue + PostgreSQL + vector store + Prometheus/Grafana production agent deployment topology |
| [[recipes/production-ai-engineer-project-checklist]] | intermediate | reference checklist | 18 production AI engineering project types across RAG, routing, evals, observability, security, multi-tenancy, memory, inference, HITL, automation, and benchmarks |

---

## Evaluations (3)

| Page | Comparing | Verdict |
|------|-----------|---------|
| [[evaluations/eval-memory-approaches]] | In-context vs file-wiki vs vector DB vs knowledge graph | File-based wiki wins for Jay's use case |
| [[evaluations/eval-orchestration-frameworks]] | GSD vs [[framework-langgraph]] vs [[framework-autogen]] vs [[framework-crewai]] vs raw [[framework-claude-code]] | GSD first, Raw [[framework-claude-code]] second, [[framework-langgraph]] if Python required |

---

## Summaries (102)

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
- [[summaries/karpathy-llm-wiki-gist|Karpathy LLM Wiki Pattern — Gist]] — [[andrej-karpathy]]'s minimal pattern for LLM-maintained knowledge bases: immutable raw sources, LLM-owned wiki, co-evolving schema, and three core workflows (Ingest, Query, Lint)
- [[summaries/andrej-karpathy-thinks-rag-is-broken|Andrej Karpathy Thinks RAG Is Broken]] — Note covering [[andrej-karpathy]]'s [[llm-wiki]] project: a compounding, AI-maintained wiki pattern proposed as a replacement for stateless RAG
- [[summaries/farzapedia-personal-wiki|Farzapedia Personal Wiki]] — Personal wiki over iMessages/Notes/diary using agentic index-navigation (Librarian pattern) instead of RAG
- [[summaries/karpathy-llm-wiki-video|Building a Trading Strategies LLM Knowledge Base (Karpathy Pattern)]] — Transcript explaining the LLM-wiki architectural pattern: persistent interlinked wikis as a compound-knowledge alternative to stateless RAG, with three-layer architecture, core operations (ingest/query/lint), and live [[framework-claude-code]] demo
- [[summaries/nate-herk-llm-wiki|Set Up Your LLM Knowledge Base in 5 Minutes (Nate Herk)]] — Walkthrough of the [[llm-wiki]] pattern: markdown-only KB, [[pattern-hot-cache]], lint workflow, and 95% token reduction vs RAG
- [[summaries/private-test-note|Private Test Note]] — Internal test fixture for verifying PIN lock system across web UI, [[mcp-ecosystem]], and CLI surfaces
- [[summaries/siagian-agentic-engineer-roadmap-2026|Agentic AI Engineer Roadmap 2026 (Siagian)]] — 10-section interview Q&A guide: Python→LLM→Framework→Memory→Tools→RAG→Agents→Production; strong on RAG system design, hybrid retrieval, grounded generation, CI/CD for agents; surfaces 6 KB gaps
- [[summaries/2026-04-08-what-is-the-best-pattern-for-multi-agent-orchestration-in-cl|Q&A: Best Pattern for Multi-Agent Orchestration in Claude Code]] — Synthesized Q&A recommending the [[pattern-fan-out-worker]] Orchestrator-Worker pattern as the default; covers three sub-patterns, Agent tool parameters, token economics (~15× multiplier for multi-agent), the Telephone Game failure mode, and when to avoid multi-agent altogether
- [[summaries/vault-3tier-architecture|Agent Vault — 3-Tier Architecture]] — Jay's production vault memory system: scoped context loading and explicit write targets for all 32 agents across orchestrator/lead/worker tiers
- [[summaries/summary-layered-agent-memory-obsidian|Layered Agent Memory — Obsidian-Backed 4-Layer System]] — Framework-agnostic 4-layer memory architecture: always-injected sticky notes + rules, on-demand vault (daily logs, working context, mistakes), searchable session archive; compaction recovery and write cadence discipline
- [[summaries/summary-llm-wiki-v2|LLM Wiki v2 — Confidence, Graph, Hybrid Search, Automated Hooks]] — Extension of [[andrej-karpathy]]'s [[llm-wiki]]: per-claim confidence, typed knowledge graph, BM25+vector+RRF hybrid search, automated lifecycle hooks, forgetting curves, AI contradiction resolution. Gap analysis vs. this KB included.
- [[summaries/summary-knowledge-graphs-explainer|Knowledge Graphs — Everything Is Connected]] — Comprehensive explainer: nodes/edges/properties, triple model (S-P-O), ontology (classes + instances), named graphs with temporal context, graph inference (derive unstated facts), SPARQL/Cypher querying, KG vs relational DB decision guide. Application map to this KB included.
- [[summaries/summary-research-skill-graph|Local Research Engine — The Research Skill Graph System]] — Practitioner system deployed at 4 companies (60% research cost reduction): 6-lens forced-perspective analysis (technical/economic/historical/geopolitical/contrarian/first-principles), 5-tier source evaluation, contradiction-as-feature protocol, compound knowledge base. Scaffolded at research-skill-graph/.
- [[summaries/summary-wikiwise-skills|Wikiwise Skill Library — Ingest, Digest, Readwise]] — 6 operational skill files from TristanH/wikiwise: stream-to-disk rule for large documents, parallel subagent dispatch, batch-before-ingest, 2-3 inbound-link density rule, user-confirmed highlight search, single-file tweet collection.
- [[summaries/mgechev-skills-best-practices|Best Practices for Creating Agent Skills]] — Practitioner guidance on lean `SKILL.md` files, progressive disclosure, frontmatter discoverability, deterministic scripts, and skill validation loops.
- [[summaries/microsoft-skillopt|SkillOpt — Executive Strategy for Self-Evolving Agent Skills]] — Microsoft framework for validation-gated skill optimization and SkillOpt-Sleep nightly proposal loops.
- [[summaries/chopratejas-headroom|Headroom — Context Compression Layer for AI Agents]] — Local-first compression proxy/library/MCP layer with reversible CCR retrieval, source-reported token savings, and cross-agent memory claims.
- [[summaries/ar9av-obsidian-wiki|Ar9av Obsidian Wiki]] — Packaged Obsidian/LLM-wiki implementation with delta tracking, provenance, multi-agent history ingest, tiered query, graph export, and QMD optional search.
- [[summaries/langchain-ai-rag-from-scratch|LangChain RAG From Scratch]] — Thin README/source pointer for RAG notebooks covering indexing, retrieval, and generation basics; no atomic page changes from this capture alone.
- [[summaries/x-twitter-2066530299467706495|LEANN Lightweight Local RAG Claim]] — Low-confidence tweet lead claiming 97% lower-storage local RAG via selective recomputation; primary repo/paper still needed.
- [[summaries/rohitg00-ai-engineering-from-scratch|AI Engineering from Scratch]] — Artifact-based AI engineering curriculum; high-signal areas are MCP/tools, agent workbench, RAG/eval, multi-agent, and production capstones.
- [[summaries/sierra-ai-blog-ai-pilling-our-company-lessons-learned|Sierra — AI-pilling Our Company: Lessons Learned]] — Single agent front door, persistent/proactive workflows, MCP Gateway/context controls, systems-of-record backends, and outcome-over-activity metrics.
- [[summaries/www-linkedin-com-posts-eordax-ai-claude-ugcpost-7480733978405109760-4xi|Eduardo Ordax LinkedIn — Claude/Fable Prompt-Minimization Signal]] — Low-confidence social source on shorter prompts; useful only when control moves to external tools, verification, refusal handling, and audit.
- [[summaries/www-linkedin-com-pulse-copy-netflix-ntech-sre-purpose-built-approach-reliability-scale-ozc|Netflix NTech SRE — Purpose-Built Reliability at Scale]] — Embedded Graduation Model: embed deeply, build reliability capability, graduate teams, and convert repeated pain into central tooling.
- [[summaries/x-twitter-2075854920738021682|OOMOL/OpenConnector — Scoped Credential Gateway Tweet]] — Low-confidence tweet lead for scoped credential gateways and MCP-native connector layers; no framework page yet.
- [[summaries/x-twitter-2076018000570785847|Eric Siu Tweet — Hermes Desktop Context-Management Lead]] — Very thin tweet/media lead on Hermes desktop context management; no atomic page from capture alone.
- [[summaries/www-linkedin-com-posts-linasbeliunas-these-are-2-senior-staff-engineers-at-airbnb-ugcpost-|Airbnb Agentic Coding Talk — LinkedIn Transcript Capture]] — Partial transcript source for navigator/driver agentic coding and multiple agentic sessions.
- [[summaries/x-twitter-2076231055443440105|Jason Calacanis PODMEME — Personalized Podcast Topic Stream Tweet]] — Low-confidence tweet lead for topic-clustered podcast playback/media-ingest workflows.
- [[summaries/www-linkedin-com-jobs-view-4438558062|Salesforce Director, Human-AI Collaboration — Job Description Capture]] — Job-market signal for human-AI collaboration, workforce transformation, HCI, job redesign, and KPI-linked adoption.
- [[summaries/opensandbox-group-OpenSandbox|OpenSandbox — Secure Sandbox Runtime for AI Agents]] — Sandbox lifecycle/execution API, SDK/CLI/MCP surfaces, Credential Vault, egress policy, secure runtimes, release verification, and worker-isolation caveats.
- [[summaries/x-twitter-2089029054611837324|Harrison Chase — DeepAgents Backend/Sandbox Separation]] — Social-source architecture note on separating agent brains from file-like or executable backends across local TUI, cloud UI, Slack, and fake-backend workflows.
- [[summaries/lumay-ai|LuMay AI — Security-First Enterprise Agent Factory]] — Enterprise agent-platform market signal: governed execution, HITL approvals, auditability, integrations, analytics, and vendor-reported workflow outcomes.
- [[summaries/docs-langchain-com-langsmith-python-managed-deep-agents-overview|LangChain Managed Deep Agents — Overview]] — Folder-defined agent behavior with LangSmith-managed harness/runtime, skills, tools, middleware, MCP connectors, sandbox, memory, channels, schedules, and evals.
- [[summaries/x-twitter-2087607558626582741|GitHub Projects Community — Simba Eval-First Customer Service Assistant Tweet]] — Low-confidence tweet lead for eval-first customer-service RAG, retrieval/generation/latency metrics, and swappable RAG components.
- [[summaries/huggingface-agent-intrusion-technical-timeline|Hugging Face — Frontier Lab Agent Intrusion Technical Timeline]] — Incident-backed source on agent eval escape, dataset/config injection, credential exposure, Kubernetes/cloud/mesh pivots, C2 over public services, and machine-speed defense burden.
- [[summaries/docs-langchain-com-oss-deepagents-code-overview|LangChain Deep Agents Code — Overview]] — Short official overview of `dcode`: terminal coding agent with provider switching, memory, skills, approvals, remote sandboxes, subagents, compaction, MCP tools, rubrics, and tracing.
- [[summaries/x-twitter-2088713006095994930|Codez / 0xRafy — MCP 11-Step Guide Social Capture]] — Low-confidence MCP social-source lead; useful for production-security prompts but spec/adoption claims need primary-source verification.
- [[summaries/opensourceprojects-dev-post-simba|Open-source Projects — Simba Eval-First Customer Service Assistant]] — Promotional writeup adding Simba architecture details: Python backend, Next.js dashboard, npm widget, modular RAG, Docker CPU/GPU setup, and eval-first positioning.
- [[summaries/deepseek-ai-deepseek-harness|DeepSeek Harness — Everything Is a Plugin]] — DeepSeek's developer-preview plugin-first agent harness, with Cordis composition, durable session events, tool pipeline stages, capability seams, and typed remote contracts.
- [[summaries/anthropic-com-engineering-managed-agents|Anthropic — Scaling Managed Agents]] — Official engineering writeup on session/harness/sandbox decoupling, durable event logs, credential vault/proxy patterns, and source-reported TTFT gains.
- [[summaries/blume-codes|Blume Sidecar — Monitor and Improve Coding Agents]] — Local macOS coding-agent sidecar for multi-harness status, hidden rule/skill tracking, usage visibility, and human-approved improvement suggestions.
- [[summaries/dev-to-himanshuai-playwright-ai-agent-the-complete-engineering-guide-to-autonomous-browser-automatio|Playwright AI Agent — Engineering Guide]] — Practitioner guide to browser-agent perception, structured actions, bounded loops, self-healing logs, independent verification, and cost controls.
- [[summaries/disler-super-simple-software-factory|Disler — Super Simple Software Factory]] — Primary repo source for code-owned orchestration: ADW phases, typed envelopes, gates, SQLite trace, and placeholder-test caveats.
- [[summaries/handbook-vinodspattar-in-learn-modules-07-langgraph|Principal AI Engineer Handbook — Module 7 LangGraph]] — Secondary LangGraph learning reference: control flow as state graph, reducers, checkpointing, HITL interrupts, and durable-state tradeoffs.
- [[summaries/langchain-ai-open-swe|LangChain Open SWE — Asynchronous Coding Agent Framework]] — Primary repo/docs capture for Deep Agents + LangGraph internal coding-agent framework, sandboxes, Slack/Linear/GitHub triggers, dashboard, and security surfaces.
- [[summaries/linkedin-com-posts-danielnrocha-harness-meta-harness-self-improving-harness-share-749404682264734105|Daniel Rocha — Harness vs Meta-Harness vs Self-Improving Harness]] — Social-source taxonomy for harness, meta-harness, and self-improving harness layers; benchmark claims remain unverified.
- [[summaries/linkedin-com-posts-maryammiradi-forward-deployed-engineering-101-for-share-7491586783273603072-ov8f|Maryam Miradi — Forward Deployed Engineering for Production AI Agents]] — Social-source FDE roadmap: shared primitives first, configure-not-rebuild, outcome-backward workflow design, and production feedback loop.
- [[summaries/linkedin-com-posts-reshmawithai-ai-isnt-failing-in-your-company-your-ai-share-7493986243802738688-w9|Reshma Sriraman — Warning Signs Your Company Is Stuck in AI Pilot Mode]] — Low-confidence market signal on demo-to-production failure modes: missing platform, late governance, weak integrations, manual handoffs, and late ROI definition.
- [[summaries/linkedin-com-posts-ruben-hassid-stop-over-organizing-claude-it-slows-you-share-7493980931716939776-k|Ruben Hassid — Stop Over-Organizing Claude]] — Low-confidence context-hygiene heuristic: one about-me file, fresh task chats, self-critique, hard-task delegation, and pruning unused prompts/skills/connectors.
- [[summaries/x-twitter-2084542353344282850|Suraj Sharma — Production AI Engineer Project Checklist]] — Low-confidence social checklist covering 18 production AI engineering project surfaces: RAG citations, model routing, evals, observability, guardrails, local dev, fine-tuning, multi-tenancy, CI/CD, vector scale, memory, inference, HITL, automation, benchmarks, and OSS.
- [[summaries/untrivial-ai-agent-orchestrator|Agent Orchestrator — Local Agent Fleet Workspace]] — Primary repo/docs capture for AO: local desktop/daemon agent fleet workspace, per-worker worktrees, orchestrator/worker split, durable facts/derived status, CDC, review gateway, and TUI containment caveats.
- [[summaries/linkedin-com-pulse-agentic-sdlc-how-ai-agents-reshaping-software-pavan-belagatti-rsthc|Pavan Belagatti — Agentic SDLC]] — Practitioner article on end-to-end agentic software delivery: planning, build, test, review, deploy, monitor, document, and improve under human decision gates.
- [[summaries/x-twitter-2085780032031760694|Harrison Chase — Managed Agents Thesis]] — First-party LangChain founder thesis: production agents split into business logic, harness, and infrastructure; managed agents package harness plus runtime, sandbox, streaming, context, eval, memory, and auth.
- [[summaries/x-twitter-2088782821535981815|Vartekx — Harrison Chase Harness/Model/Context Clip]] — Low-confidence social clip summary for the harness/model/context diagnostic frame and model-specific harness behavior.
- [[summaries/x-twitter-2088359756096532965|Startup Ideas Podcast — Software Factory Arbitrage Tweet]] — Low-confidence software-factory business pattern: primitives, promotion, memory, human-heavy loops, and compounding speed.

## Personal (24) (Jay's patterns)

| Page | Category | Confidence | Description |
|------|----------|------------|-------------|
| [[personal/personal-agent-design-observations]] | pattern | medium | 10 observed patterns across Jay's 32 agent definitions |
| [[personal/personal-jays-framework-philosophy]] | decision | high | Three-framework selection system (GSD/[[framework-superpowers]]/[[framework-bmad]]) with decision tree |
| [[personal/hermes-operating-context]] | pattern | high | Hermes orchestrator session-start memory: portfolio state, active priorities, routing defaults, durable lessons |
| [[personal/roofclaim-recovery-business-plan]] | decision | medium | Venture concept notes: public-adjusting + AI claim recovery for residential roofing insurance claims |

---

## Prompt Library (6 pages)

| Page | Purpose |
|------|---------|
| [[prompt-library/index|Index]] | Hub — all prompts organized by use case |
| [[prompt-library/thinking-tools|Thinking Tools]] | /trace, /challenge, /steelman, /assumptions, /decompose, /compare, /debug, /synthesize |
| [[prompt-library/note-processing|Note Processing]] | Summarize source, extract concepts, update pages, generate cross-links, contradiction check |
| [[prompt-library/idea-generation|Idea Generation]] | Diverge first, constraint removal, analogical reasoning, pre-mortem, SCAMPER, 10x thinking |
| [[prompt-library/reflection-synthesis|Reflection & Synthesis]] | Session debrief, war story extraction, cross-note synthesis, pattern extraction, weekly reflection |
| [[prompt-library/graph-maintenance|Graph Maintenance]] | Daily living-graph scan, link suggestions, orphan flags, Sofie writeback queue |
| [[prompt-library/custom-slash-commands|Custom Slash Commands]] | /ingest, /lint, /brief, /explore, /hot-update, /query, /hermes |

---

## Daily Systems (4 pages)

| Page | Purpose |
|------|---------|
| [[daily-systems/index|Index]] | Hub — cadence overview, Hermes daily protocol |
| [[daily-systems/daily-notes|Daily Notes]] | Engineering standup template, session logging, decisions log |
| [[daily-systems/weekly-monthly-reviews|Weekly/Monthly Reviews]] | Sprint review, KB lint, retrospective templates |
| [[daily-systems/task-priority-management|Task & Priority Management]] | Priority stack, Daily Focus Rule, blocker escalation |

---

## Syntheses (48)

| Page | Question | Created |
|------|----------|---------|
| [[syntheses/lint-2026-04-06]] | What structural issues, gaps, and maintenance needs exist in the wiki as of 2026-04-06? | 2026-04-06 |
| [[syntheses/lint-2026-04-12]] | What structural issues, gaps, and maintenance needs exist in the wiki as of 2026-04-12? | 2026-04-12 |
| [[syntheses/synthesis-eval-metrics-to-failure-modes]] | Do modern agent eval framework metrics directly operationalize the agent failure modes taxonomy? | 2026-05-16 |
| [[syntheses/synthesis-rag-eval-to-llm-judge]] | Which RAG evaluation metrics decompose naturally into LLM-as-Judge tasks vs. deterministic scorers? | 2026-05-16 |
| [[syntheses/synthesis-episodic-judgment-log-to-trace-dataset]] | Is the Episodic Judgment Log pattern the vendor-agnostic equivalent of LangSmith's trace-to-dataset workflow? | 2026-05-16 |
| [[syntheses/synthesis-react-as-native-trajectory-eval]] | Why is ReAct uniquely cheap to evaluate compared to other agentic patterns, and what does that mean for pattern selection when evaluation is a first-order concern? | 2026-05-23 |
| [[syntheses/synthesis-retrieval-and-tool-permissions-as-co-enforced-boundary]] | In a multi-tenant agentic deployment, where do retrieval-layer metadata filtering and tool-execution permission modes intersect, and what failure modes emerge when they're designed independently? | 2026-05-23 |
| [[syntheses/synthesis-episodic-judgment-as-freshness-signal]] | Should human-judgment events stored in the episodic log be routed to the freshness-decay engine as authoritative signals that reset (or accelerate) decay clocks on the facts they touch? | 2026-05-23 |
| [[syntheses/synthesis-episodic-judgment-as-contradiction-resolver-training]] | What is the missing training signal for moving contradiction resolution from human-routed to LLM-auto-resolved, and where does it come from? | 2026-05-24 |
| [[syntheses/synthesis-per-claim-confidence-as-rag-precision-layer]] | Why do document-level RAG metrics (recall@k, MRR, nDCG) systematically over-credit retrievers, and what would fix it? | 2026-05-24 |
| [[syntheses/synthesis-model-tier-eval-framework-matrix]] | Which eval framework should you use at which model tier, and why is indiscriminate use of any one of them as wasteful as using Opus for boilerplate? | 2026-05-24 |
| [[syntheses/synthesis-judgment-events-as-confidence-labels]] | Should per-claim confidence scores be calibrated against human correction events captured in the episodic judgment log, rather than scored from automated heuristics alone? | 2026-05-25 |
| [[syntheses/synthesis-permissions-as-single-compiled-policy]] | In a multi-tenant agentic system, should retrieval-side metadata filtering and tool-side allowlists be authored separately, or compiled from a single policy document? | 2026-05-25 |
| [[syntheses/synthesis-deepeval-metrics-as-trajectory-vocabulary]] | Can DeepEval's named agent metrics (PlanQuality, ToolCalling, ArgumentCorrectness) serve as the operational vocabulary that turns trajectory evaluation into a measurable CI/CD gate? | 2026-05-25 |
| [[syntheses/synthesis-rrf-as-rlm-fusion-stage]] | What algorithm fills the score-merging slot in the RLM Pipeline's multi-source retrieval stages (4–9), and why is it Reciprocal Rank Fusion? | 2026-05-27 |
| [[syntheses/synthesis-skills-as-evaluable-artifacts]] | When should an agent skill be treated as a tested software artifact instead of a prose instruction file? | 2026-06-25 |
| [[syntheses/synthesis-agentic-engineering-operating-model]] | What operating model makes agentic engineering useful instead of performative? | 2026-07-10 |
| [[syntheses/synthesis-skillopt-pow-writeback]] | How should an agent convert logged failures into skill updates without unchecked self-mutation? | 2026-07-11 |
| [[syntheses/synthesis-context-compression-vs-compilation]] | Are Headroom-style runtime compression and obsidian-wiki-style knowledge compilation substitutes or complements for managing context cost? | 2026-08-08 |
| [[syntheses/synthesis-headroom-compression-skillopt-signal]] | If Headroom compresses the same agent transcripts SkillOpt scores rollouts against, does skill optimization still receive a trustworthy training signal? | 2026-08-09 |
| [[syntheses/synthesis-skillopt-gate-obsidian-wiki-governance]] | Can SkillOpt's held-out validation gate close obsidian-wiki's admitted governance gap for agent-writable vaults? | 2026-08-09 |
| [[syntheses/synthesis-headroom-compression-episodic-judgment-signal]] | If Headroom compresses the same session transcripts that populate the Episodic Judgment Log, does the freshness-decay engine still receive a trustworthy human-judgment signal? | 2026-08-10 |
| [[syntheses/synthesis-skillopt-gate-episodic-judgment-log]] | Can SkillOpt's held-out validation gate serve as the quality gate the Episodic Judgment Log lacks before its correction events reset freshness-decay clocks? | 2026-08-12 |
| [[syntheses/synthesis-episodic-judgment-obsidian-wiki-gate]] | Should obsidian-wiki-style vault-write gating validate against the Episodic Judgment Log's human correction events instead of a generic held-out fixture set? | 2026-08-13 |
| [[syntheses/synthesis-proof-of-work-receipts-episodic-judgment-ingestion]] | Where do the Proof-of-Work Loop's "learning updates" actually live — and is the Episodic Judgment Log their missing write target? | 2026-08-14 |
| [[syntheses/synthesis-proof-of-work-receipts-obsidian-wiki-audit-trail]] | What gets permanently recorded when a gated vault write is accepted — and is the Proof-of-Work receipt schema the missing answer? | 2026-08-15 |
| [[syntheses/synthesis-headroom-compression-proof-of-work-receipts]] | If Headroom compresses the tool outputs and transcripts an agent verifies against, is the resulting proof-of-work receipt still evidence of verification? | 2026-08-16 |
| [[syntheses/synthesis-headroom-compression-obsidian-wiki-vault]] | If Headroom compresses the source material an agent compiles into an Obsidian vault, does the resulting wiki page record knowledge or a lossy impression of it? | 2026-08-18 |
| [[syntheses/synthesis-headroom-compression-reciprocal-rank-fusion]] | If Headroom compresses RAG chunks before they reach the retrieval and scoring stages, is the resulting Reciprocal Rank Fusion ordering still a measure of retrieval quality? | 2026-08-19 |
| [[syntheses/synthesis-rrf-proof-of-work-receipts]] | If an agent emits a proof-of-work receipt for a retrieval step whose results were merged by Reciprocal Rank Fusion, does that receipt constitute evidence that the ranking was sound? | 2026-08-20 |
| [[syntheses/synthesis-telephone-game-per-claim-confidence]] | Can the memory stack's per-claim confidence machinery detect Telephone Game corruption in supervisor-worker orchestration, rather than only routing around it? | 2026-08-21 |
| [[syntheses/harness-vs-meta-harness-vs-self-improving-harness]] | What distinguishes a harness, meta-harness, and self-improving harness — and why are code-owned gates the practical harness layer before self-improvement? | 2026-08-21 |
| [[syntheses/synthesis-verifier-as-goal-completion-benchmark]] | Is the Plan-Execute-Verify verifier the runtime implementation of goal-vs-task-completion, and can its acceptance criteria become a benchmark-design template? | 2026-08-22 |
| [[syntheses/synthesis-mcp-as-tool-vs-memory-interface]] | MCP exposes both callable actions and queryable memory over one contract — should memory-read servers inherit the same permission scrutiny as action servers? | 2026-08-24 |
| [[syntheses/synthesis-harness-self-improvement-as-memory-promotion]] | Are a self-improving harness's scaffolding edits and the memory stack's learned→canonical promotion the same mechanism, and should they share one governance layer? | 2026-08-25 |
| [[syntheses/synthesis-promotion-scoring-without-a-judge]] | The promotion scorer weights only provenance metadata and never reads the claim — should canonical promotion invoke an LLM judge, or is metadata-only scoring the correct trade? | 2026-08-26 |
| [[syntheses/synthesis-failure-escalation-as-mistake-log-trigger]] | The mistake log's write-trigger is a user correction, so self-detected fix-loop abandonment and silent refusals never reach it — what should the GSD escalation rule's "document and move on" actually write to? | 2026-08-27 |
| [[syntheses/synthesis-sandbox-safety-is-policy-not-place]] | Recent OpenSandbox, DeepAgents, and Hugging Face intrusion sources show that sandbox safety is the policy boundary around credentials, egress, approvals, and traces — not merely the place code runs. | 2026-08-27 |
| [[syntheses/synthesis-proof-of-work-receipts-vs-trajectory-eval]] | Proof-of-work receipts and trajectory evaluation collect the same evidence and differ only in authorship — receipts catch omission, trajectory eval catches fabrication. Which one should run where? | 2026-08-28 |
| [[syntheses/synthesis-memory-selection-needs-a-benchmark-protocol]] | The hot cache's Letta-over-Mem0 default rests on a self-flagged-stale LoCoMo result, and no page defines the re-verification procedure its own caveat demands. | 2026-08-29 |
| [[syntheses/synthesis-forward-message-is-a-permissions-decision]] | `forward_message` removes the only step where a worker's raw output is read before reaching the caller — an unscored permissions change filed as an orchestration fix. | 2026-08-30 |
| [[syntheses/synthesis-worker-tool-scope-ownership]] | When a supervisor fans work out to workers, who owns the source of truth for a worker's allowed tool set — the orchestrator's topology, or the tool layer's permission policy? | 2026-08-31 |
| [[syntheses/synthesis-durable-agent-state-is-not-prompt-context]] | Managed agents, LangGraph checkpoints, software-factory traces, Open SWE async tasks, and Playwright browser agents all point to the same rule: prompt context is a working view, not durable agent state. | 2026-08-30 |
| [[syntheses/synthesis-three-contradiction-protocols]] | Three contradiction protocols govern the KB — memory runtime, wiki ingest, research lenses. Two preserve both claims; the runtime's Tier 1 auto-resolution demotes the loser. Which one wins? | 2026-09-01 |
| [[syntheses/synthesis-gsd-deviation-rules-as-permission-policy]] | GSD's four Deviation Rules are a consequence-keyed action-guardrail policy living only in `hot.md` — the Tool Use MoC's permission-modes and guardrails pages never cite them, and no other orchestration framework is scored against the same taxonomy. | 2026-09-02 |

---

## Repo Plans

- [[repos/agentic-kb/rewrites/plans/2026-04-10-operational-runtime-memory-layer-plan|Operational Runtime Memory Layer Plan]] — phased repo plan to add first-class task-local state, tighter scoped loading, contract-driven promotions, and truly atomic writeback for active agents
