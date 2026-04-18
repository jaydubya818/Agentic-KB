---
title: Advanced Techniques
type: moc
category: structure
tags: [agentic, multi-agent, context-management, vault-as-context, reasoning, cross-note]
created: 2026-04-13
updated: 2026-04-13
---

# Advanced Techniques

High-leverage patterns for operating at the frontier of Claude + Obsidian capability. Covers agentic note-taking, multi-step reasoning patterns, cross-note analysis, custom agent design, and vault-as-context engineering.

---

## Agentic Note-Taking

Notes don't just store knowledge — they act as agent memory, execution context, and coordination substrate. The Agentic-KB treats the vault as a first-class agentic primitive.

Key techniques:

**Write-to-disk before session end.** Anything the next session needs must be written to a file before this session closes. The agent writes; the file persists; the next agent reads. See [[patterns/pattern-external-memory]].

**Per-session task logs.** Each agent run appends to its task log (e.g., `wiki/agents/workers/gsd-executor/task-log.md`). The task log is the agent's episodic memory — not the conversation history. See [[patterns/pattern-episodic-judgment-log]].

**Mistaken reasoning gets documented.** When an agent takes a wrong turn, the lesson goes into the relevant agent's profile or the personal war-story pages in `wiki/personal/`. See [[patterns/pattern-mistake-log]].

**[[pattern-hot-cache]] as agent pre-attention.** The `wiki/hot.md` file is read first every session — it primes Claude's attention on what matters most right now. Keeping it ≤500 words forces prioritization. See [[patterns/pattern-hot-cache]].

---

## Multi-Step Reasoning

Long agentic tasks require explicit reasoning checkpoints. Patterns that enforce this:

- [[patterns/pattern-plan-execute-verify]] — never skip the plan step; verification is mandatory
- [[patterns/pattern-structured-assumptions]] — surface assumptions before acting; they're the most common source of downstream errors
- [[patterns/pattern-scientific-debugging]] — hypothesis → test → conclude cycle for any non-obvious failure
- [[patterns/pattern-adversarial-plan-review]] — before executing a plan, generate the strongest objection to it
- [[patterns/pattern-reflection-loop]] — agent critiques its own output and revises before returning

For research specifically: [[knowledge-systems/research-engine/methodology/synthesis-rules|Synthesis Rules]] — how to combine findings across 6 lenses without false synthesis.

---

## Cross-Note Analysis

Identifying connections the KB doesn't yet make explicit:

**EXPLORE Workflow** (defined in [[CLAUDE.md]]):
1. Read `wiki/index.md` in full
2. Identify 5 most interesting unexplored connections between existing topics
3. For each: explain the insight, the question it answers, what source would confirm it
4. Offer to create a `wiki/syntheses/` page for any worth developing

Run EXPLORE when the KB has grown significantly or when preparing for a synthesis session.

**Cross-note analysis patterns:**
- [[patterns/pattern-structured-comparison-table]] — compare 2-4 options across identical dimensions
- [[patterns/pattern-two-step-ingest]] — first pass extracts facts; second pass synthesizes across facts
- [[knowledge-systems/research-engine/methodology/contradiction-protocol|Contradiction Protocol]] — what to do when two pages disagree

**The BRIEF Workflow** — reads the 5-8 most relevant pages on a topic and outputs a 400-600 word briefing with citations. Saves to `outputs/brief-{topic}-{date}.md`. Promotes to `wiki/syntheses/` when stable.

---

## Custom AI Agents

Jay's agent infrastructure: 34 agents, organized into orchestrators, leads, and workers. Raw definitions in `raw/my-agents/`; wiki profiles in `wiki/agents/`.

**Design principles (from [[personal/personal-agent-design-observations]]):**
- Single-responsibility: each agent does one thing well
- Memory via files: agents write state, not hold it in context
- Typed outputs: agents return structured data, not prose
- Explicit escalation: agents surface blockers rather than guess

**Agent topology patterns:**
- [[patterns/pattern-supervisor-worker]] — orchestrator + specialist workers
- [[patterns/pattern-fan-out-worker]] — parallel execution, merged results
- [[patterns/pattern-librarian-agent]] — KB-specialist agent that other agents query
- [[patterns/pattern-context-manager-agent]] — manages context window across long tasks

Key entity: [[entities/jay-west-agent-stack]] — full inventory of Jay's agent infrastructure.

---

## Vault-as-Context Engineering

The hardest and highest-leverage technique: designing the vault so that any subset of it loaded into Claude's context gives Claude everything it needs to act without asking clarifying questions.

**Principles:**
1. **[[pattern-hot-cache]] first** — 500 words that cover 80% of daily queries
2. **Self-contained pages** — each page answers its question without requiring other pages to be loaded simultaneously
3. **Explicit cross-links** — link aggressively so Claude can follow chains without re-reading index.md
4. **Confidence-weighted loading** — load high-confidence pages first; low-confidence ones add noise
5. **Temporal freshness** — `updated` date tells Claude how much to trust a page; stale pages get lower weight

**Context budget rules:**
- [[pattern-hot-cache]] (500 words) + 1 MoC (300-400 words) + 3 concept pages (~500 words each) = ~2,500 words — well within a tight budget
- For a research session: intake form (100 words) + 6 lens files (~300 words each) = ~1,900 words
- Never load `raw/` files in full if a `wiki/summary/` exists — the summary is the context-optimized version

See [[concepts/context-management]] and [[patterns/pattern-tiered-agent-memory]].

---

## Related

- [[mocs/claude-integration|Claude Integration]] — [[mcp-ecosystem]] tools, session memory
- [[mocs/knowledge-workflows|Knowledge Workflows]] — Capture → Process → Connect
- [[mocs/visualization|Visualization]] — Making connections visible
- [[concepts/context-management]] — Context window mechanics
- [[patterns/pattern-hot-cache]] — [[pattern-hot-cache]] pattern
