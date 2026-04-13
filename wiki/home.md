---
title: Agentic KB — Home
type: home
updated: 2026-04-13
---

# Agentic Engineering KB

> A compounding knowledge base for building, deploying, and maintaining AI agent systems. Every query makes it denser. Every session adds a layer it never had before.

---

<svg viewBox="0 0 700 340" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px;font-family:monospace">
  <!-- Background -->
  <rect width="700" height="340" rx="8" fill="#0d1117"/>

  <!-- Center node -->
  <circle cx="350" cy="170" r="38" fill="#1f6feb" opacity="0.9"/>
  <text x="350" y="165" text-anchor="middle" fill="white" font-size="11" font-weight="bold">Agentic</text>
  <text x="350" y="179" text-anchor="middle" fill="white" font-size="11" font-weight="bold">KB</text>

  <!-- Domain nodes -->
  <!-- Orchestration (top-left) -->
  <circle cx="165" cy="90" r="46" fill="#388bfd" opacity="0.15" stroke="#388bfd" stroke-width="1.5"/>
  <text x="165" y="83" text-anchor="middle" fill="#79c0ff" font-size="12" font-weight="bold">Orchestration</text>
  <text x="165" y="98" text-anchor="middle" fill="#8b949e" font-size="9">12 frameworks</text>
  <text x="165" y="111" text-anchor="middle" fill="#8b949e" font-size="9">fan-out · supervisor</text>

  <!-- Memory (top-right) -->
  <circle cx="535" cy="90" r="46" fill="#3fb950" opacity="0.15" stroke="#3fb950" stroke-width="1.5"/>
  <text x="535" y="83" text-anchor="middle" fill="#7ee787" font-size="12" font-weight="bold">Memory</text>
  <text x="535" y="98" text-anchor="middle" fill="#8b949e" font-size="9">RLM · hot-cache</text>
  <text x="535" y="111" text-anchor="middle" fill="#8b949e" font-size="9">typed KG · RRF</text>

  <!-- Tool Use (bottom-left) -->
  <circle cx="165" cy="255" r="46" fill="#d2a8ff" opacity="0.15" stroke="#d2a8ff" stroke-width="1.5"/>
  <text x="165" y="248" text-anchor="middle" fill="#d2a8ff" font-size="12" font-weight="bold">Tool Use</text>
  <text x="165" y="263" text-anchor="middle" fill="#8b949e" font-size="9">MCP · permissions</text>
  <text x="165" y="276" text-anchor="middle" fill="#8b949e" font-size="9">tool design</text>

  <!-- Evaluation (bottom-right) -->
  <circle cx="535" cy="255" r="46" fill="#f78166" opacity="0.15" stroke="#f78166" stroke-width="1.5"/>
  <text x="535" y="248" text-anchor="middle" fill="#f78166" font-size="12" font-weight="bold">Evaluation</text>
  <text x="535" y="263" text-anchor="middle" fill="#8b949e" font-size="9">LLM-as-judge</text>
  <text x="535" y="276" text-anchor="middle" fill="#8b949e" font-size="9">trajectory eval</text>

  <!-- Edges center → domains -->
  <line x1="315" y1="150" x2="205" y2="116" stroke="#388bfd" stroke-width="1.2" opacity="0.6"/>
  <line x1="385" y1="150" x2="495" y2="116" stroke="#3fb950" stroke-width="1.2" opacity="0.6"/>
  <line x1="315" y1="190" x2="205" y2="228" stroke="#d2a8ff" stroke-width="1.2" opacity="0.6"/>
  <line x1="385" y1="190" x2="495" y2="228" stroke="#f78166" stroke-width="1.2" opacity="0.6"/>

  <!-- Cross edges -->
  <line x1="210" y1="107" x2="490" y2="107" stroke="#58a6ff" stroke-width="0.8" opacity="0.3" stroke-dasharray="4,3"/>
  <line x1="210" y1="238" x2="490" y2="238" stroke="#58a6ff" stroke-width="0.8" opacity="0.3" stroke-dasharray="4,3"/>
  <line x1="165" y1="136" x2="165" y2="208" stroke="#58a6ff" stroke-width="0.8" opacity="0.3" stroke-dasharray="4,3"/>
  <line x1="535" y1="136" x2="535" y2="208" stroke="#58a6ff" stroke-width="0.8" opacity="0.3" stroke-dasharray="4,3"/>

  <!-- Stats bar -->
  <rect x="20" y="310" width="660" height="22" rx="4" fill="#161b22"/>
  <text x="40" y="325" fill="#388bfd" font-size="10">20 concepts</text>
  <text x="140" y="325" fill="#3fb950" font-size="10">8 patterns</text>
  <text x="230" y="325" fill="#d2a8ff" font-size="10">12 frameworks</text>
  <text x="350" y="325" fill="#f78166" font-size="10">12 recipes</text>
  <text x="440" y="325" fill="#e3b341" font-size="10">21 summaries</text>
  <text x="560" y="325" fill="#8b949e" font-size="10">2 evaluations</text>
</svg>

---

## What this KB is for

You're building agents. Not demos — production systems that need to maintain state, recover from failures, parallelize work, and compound knowledge over time. This KB captures what actually works: patterns validated in Jay's stack, frameworks compared honestly, recipes that are copy-pasteable and tested.

The organizing principle: **every concept earns its place by solving a real problem.** No survey-style coverage, no "it depends" hedging without a verdict.

---

## Start here

The fastest path in depends on what you're solving:

- **Building a new agent?** → [[recipes/recipe-build-tool-agent]] → [[concepts/tool-use]] → [[concepts/task-decomposition]]
- **Memory across sessions?** → [[wiki/hot|Hot Cache]] → [[concepts/memory-systems]] → [[patterns/pattern-compounding-loop]]
- **Multi-agent coordination?** → [[mocs/orchestration|Orchestration MoC]] → [[concepts/multi-agent-systems]] → [[evaluations/eval-orchestration-frameworks]]
- **Hybrid search / retrieval?** → [[concepts/rlm-pipeline]] → [[concepts/reciprocal-rank-fusion]] → [[recipes/recipe-hybrid-search-llm-wiki]]
- **Picking a framework?** → [[evaluations/eval-orchestration-frameworks]] → [[frameworks/framework-gsd]] → [[frameworks/framework-claude-code]]

---

## Top 5 pages

These get referenced across the most other pages:

1. **[[concepts/rlm-pipeline]]** — The 10-stage retrieval pipeline powering this KB's query layer. Stages 4–9 live; 1–3 implementation-ready.
2. **[[patterns/pattern-compounding-loop]]** — The core flywheel: ingest → wiki → query → save. The reason this KB gets better every session.
3. **[[evaluations/eval-orchestration-frameworks]]** — GSD vs LangGraph vs AutoGen vs CrewAI vs raw Claude Code. Verdicts with rationale.
4. **[[recipes/recipe-hybrid-search-llm-wiki]]** — BM25 + vector + typed graph + RRF. The full implementation path for RLM Stages 1–3.
5. **[[concepts/knowledge-graphs]]** — Why typed KGs outperform flat notes and vector search for multi-hop reasoning.

---

## Where the KB is heading

**RLM Stages 1–3 are P1.** The pipeline runs stages 4–9 but query quality is bottlenecked on BM25 fulltext (Stage 1), parallel vector+graph fanout (Stage 2), and RRF merging (Stage 3). Implementation plan is in [[concepts/rlm-pipeline]].

**Typed knowledge graph is partially implemented.** The edge schema and ontology are defined in [[patterns/pattern-typed-knowledge-graph]]. Tooling for graph traversal in Stage 2 is next.

**Research Skill Graph is now wired.** Six-lens forced-perspective research system lives at `research-skill-graph/`. Findings feed into this KB via INGEST. See [[summaries/summary-research-skill-graph]].

**Next gap:** per-claim confidence annotation on canonical pages. [[patterns/pattern-per-claim-confidence]] has the schema; applying it to the 3 highest-stakes pages is the next manual step.

---

## Vault Navigation

### Knowledge Domains
- [[mocs/orchestration|Orchestration]] — frameworks, fan-out, supervisor-worker, evaluation
- [[mocs/memory|Memory]] — memory classes, RLM pipeline, hot cache, promotion policies
- [[mocs/tool-use|Tool Use]] — MCP ecosystem, permissions, tool design
- [[mocs/evaluation|Evaluation]] — LLM-as-judge, trajectory eval, benchmarks

### Vault Infrastructure
- [[mocs/vault-foundation|Vault Foundation]] — folder structure, MoCs, templates, metadata, attachments
- [[mocs/claude-integration|Claude Integration]] — CLAUDE.md, Hermes, MCP tools, skills, context loading, session memory
- [[mocs/core-plugins|Core Plugins]] — Terminal, Dataview, Templater, Periodic Notes, Canvas, Graph View
- [[mocs/automation|Automation]] — skills, hooks, auto-tagging, summary generation, vault maintenance

### Knowledge Production
- [[mocs/knowledge-workflows|Knowledge Workflows]] — capture → process → connect, literature notes, evergreen notes, research
- [[prompt-library/index|Prompt Library]] — thinking tools, note processing, idea generation, reflection, slash commands
- [[daily-systems/index|Daily Systems]] — daily notes, weekly/monthly reviews, task & priority management

### Advanced & Operations
- [[mocs/advanced-techniques|Advanced Techniques]] — agentic note-taking, multi-step reasoning, cross-note analysis, vault-as-context
- [[mocs/visualization|Visualization]] — graph view, canvas workspaces, knowledge maps, dashboards
- [[mocs/maintenance|Maintenance & Optimization]] — health checks, dead link cleanup, backup, context optimization
- [[mocs/resources|Community & Resources]] — plugin recommendations, best practices, learning resources
- [[mocs/evolution|Evolution & Scaling]] — new skills, multi-vault, team collaboration, next-level AI integration

### Research Engine
- [[knowledge-systems/research-engine/command-center|Command Center]] — active projects, 6-step execution protocol
- [[knowledge-systems/research-engine/README|Module Overview]]

---

*Updated automatically on each INGEST run. Do not edit manually.*
