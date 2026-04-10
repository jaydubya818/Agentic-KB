---
id: 01KNNVX2QWD5ABN97BE6A2B2MN
---

# Agentic Engineering KB — Master Index
> Last updated: 2026-04-10 | Maintained by LLM | Never edit manually

## Quick Navigation
- [[wiki/hot|Hot Cache]] — Start here for common queries
- [[wiki/log|Operation Log]] — What's changed and when

---

## Concepts (16)

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
| [[concepts/trajectory-evaluation]] | concept | evaluation | — | Evaluating the full sequence of agent decisions |

---

## Patterns (2)

| Page | Category | Problem | Confidence |
|------|----------|---------|------------|
| [[patterns/pattern-episodic-judgment-log]] | memory | Agents have your files but not your judgment — they give generic advice on decisions you've already thought through | medium |
| [[patterns/pattern-two-step-ingest]] | prompt-engineering | Single-call compilation conflates analysis with generation, producing lower-quality wiki pages with weak cross-links | medium |

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

## Recipes (9)

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

---

## Evaluations (2)

| Page | Comparing | Verdict |
|------|-----------|---------|
| [[evaluations/eval-memory-approaches]] | In-context vs file-wiki vs vector DB vs knowledge graph | File-based wiki wins for Jay's use case |
| [[evaluations/eval-orchestration-frameworks]] | GSD vs LangGraph vs [[framework-autogen]] vs CrewAI vs raw Claude Code | GSD first, Raw Claude Code second, LangGraph if Python required |

---

## Summaries (16 raw sources ingested)

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
- [[summaries/2026-04-08-what-is-the-best-pattern-for-multi-agent-orchestration-in-cl|Q&A: Best Pattern for Multi-Agent Orchestration in Claude Code]] — Synthesized Q&A recommending the Fan-Out Orchestrator-Worker pattern as the default; covers three sub-patterns, Agent tool parameters, token economics (~15× multiplier for multi-agent), the Telephone Game failure mode, and when to avoid multi-agent altogether
- [[summaries/vault-3tier-architecture|Agent Vault — 3-Tier Architecture]] — Jay's production vault memory system: scoped context loading and explicit write targets for all 32 agents across orchestrator/lead/worker tiers
## Personal (Jay's patterns)

| Page | Category | Confidence | Description |
|------|----------|------------|-------------|
| [[personal/personal-agent-design-observations]] | pattern | medium | 10 observed patterns across Jay's 32 agent definitions |
| [[personal/personal-jays-framework-philosophy]] | decision | high | Three-framework selection system (GSD/[[framework-superpowers]]/[[framework-bmad]]) with decision tree |

---

## Syntheses (1)

| Page | Question | Created |
|------|----------|---------|
| [[syntheses/lint-2026-04-06]] | What structural issues, gaps, and maintenance needs exist in the wiki as of 2026-04-06? | 2026-04-06 |

---

## Repo Plans

- [[repos/agentic-kb/rewrites/plans/2026-04-10-operational-runtime-memory-layer-plan|Operational Runtime Memory Layer Plan]] — phased repo plan to add first-class task-local state, tighter scoped loading, contract-driven promotions, and truly atomic writeback for active agents
