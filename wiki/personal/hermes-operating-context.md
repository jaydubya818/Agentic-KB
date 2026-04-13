---
title: Hermes Operating Context
type: personal
category: pattern
confidence: high
date: 2026-04-12
tags: [orchestration, agentic, personal, hermes, portfolio]
---

# Hermes Operating Context

> Owner: Jay West
> Purpose: live operating context for Hermes so it can prioritize, brief, and route work with real portfolio intelligence rather than static domain awareness.

---

## How Hermes Should Use This File

This file is the live truth layer for prioritization. Hermes should use it to answer:
- what matters most right now
- what Jay should work on today
- what should be deferred
- what is blocked
- what work compounds long-term leverage
- how to rank competing portfolio demands

This file should be updated weekly, not continuously. It is a decision tool, not a diary.

---

## Current Priority Stack

> Update this section at the start of each week or whenever priorities shift. Last updated: 2026-04-12.

### 1) Primary Focus This Week
- **Objective:** [FILL THIS IN — single highest-leverage business outcome for this week]
- **Domain / Repo:** [SellerFi or other active top-priority domain]
- **Why now:** this is the highest-leverage active outcome and should outrank background system work
- **Success this week looks like:** [specific shipped outcome, decision, demo, launch, or unblock]
- **Current status:** [not started / in progress / blocked / close to done]
- **Blockers:** [list concrete blockers or write "none"]
- **Horizon:** This week
- **Priority type:** Business-critical

### 2) Secondary Active Commitment
- **Objective:** Operationalize Hermes / MissionControl / active orchestration workflow
- **Domain / Repo:** MissionControl / Hermes / agent infrastructure
- **Why now:** Hermes now has a strong operating contract, but it still needs live current-state context, daily brief quality, and real prioritization intelligence to become a true operating system
- **Success this week looks like:**
  - current priority stack is filled and live
  - daily brief is usable
  - routing logic is aligned with real priorities
  - Hermes can answer "what should I work on today?" with confidence
- **Current status:** in progress
- **Blockers:**
  - primary weekly objective not yet concretely filled in
  - operating context still partially generic
- **Horizon:** This week
- **Priority type:** Execution infrastructure

### 3) Compounding Systems Investment
- **Objective:** Build the local research engine using Claude Code + Obsidian + skill graph + provenance-aware knowledge structure
- **Domain / Repo:** Agentic-KB / research-engine / knowledge systems
- **Why now:** this compounds across every domain by improving research, synthesis, decision support, and reusable intelligence
- **Success this month looks like:**
  - reusable research methodology files are in place
  - source evaluation and synthesis rules are active
  - project templates exist
  - provenance rules exist
  - ontology-lite structure exists
  - research projects can produce executive summaries, deep dives, data points, and open questions
- **Current status:** concept strong, implementation in progress — being built as KB module
- **Blockers:**
  - needs final KB structure
  - needs provenance model
  - needs project template
  - needs actual usage on live research topics
- **Horizon:** This month
- **Priority type:** Compounding leverage

---

## Current Blockers

### Blocker 1
- **Blocker:** Primary weekly objective is still not explicitly defined
- **Impact:** Hermes can classify and route work, but cannot truly prioritize daily execution
- **Waiting on:** Jay to define the single most important weekly outcome
- **Domain:** global operating context
- **Next unblock move:** fill Priority #1 with a specific objective and success condition

### Blocker 2
- **Blocker:** MissionControl / Hermes operating context is not yet fully grounded in live weekly truth
- **Impact:** daily briefs and "focus today" recommendations remain partially generic
- **Waiting on:** weekly stack completion + validation through actual use
- **Domain:** orchestration infrastructure
- **Next unblock move:** complete this file and test Hermes daily prioritization against real work

### Blocker 3
- **Blocker:** Research engine is conceptually strong but not fully instantiated in KB
- **Impact:** knowledge work remains partly ad hoc instead of reusable and compounding
- **Waiting on:** folder structure, templates, provenance rules, ontology-lite conventions
- **Domain:** Agentic-KB / knowledge systems
- **Next unblock move:** create research-engine module and run 1–2 live research projects through it

---

## Deprioritized / Not This Week

- Low-consequence exploration that does not unlock business, execution, or system leverage
- Cosmetic refinements without clear payoff
- Optional experiments that compete with the top weekly objective
- New system ideas that are interesting but not yet tied to a near-term decision or outcome

**Revisit triggers:** once the primary weekly objective is shipped, blockers prevent progress on it, a compounding system investment becomes the highest-leverage move, or a new external constraint changes the ranking materially.

---

## Daily Focus Rule

When deciding what Jay should work on **today**, Hermes should prioritize in this order:
1. Anything directly advancing the Primary Focus This Week
2. Anything blocking the Primary Focus This Week
3. Already-active commitments with meaningful downside if dropped
4. Compounding infrastructure work with strong leverage
5. Optional exploration only after the above are handled

Hermes should not confuse visible activity with importance. Hermes should not let background system work outrank the actual business objective unless the system work is the blocker.

---

## Priority Interpretation Rules

### Rule 1: Objectives beat domains
"SellerFi" is not a priority. A concrete outcome inside SellerFi is a priority.
- Good: ship lender qualification flow, finalize underwriting intake, close architecture decision for launch path
- Weak: work on SellerFi, touch MissionControl, improve the KB

### Rule 2: Weekly truth beats static importance
A normally important domain does not automatically outrank the current weekly objective.

### Rule 3: Blockers deserve elevation
If a blocker prevents progress on the primary weekly objective, resolving the blocker may become the top daily task.

### Rule 4: Compounding work matters, but not at the expense of the active top outcome
Hermes should protect leverage-building work, but not let it quietly replace the primary outcome.

### Rule 5: Externally visible and irreversible work gets stricter handling
If a task affects customers, money, production systems, public messaging, or trust, Hermes should raise the bar for certainty and review.

---

## Current Working Assumptions

These assumptions should be treated as true unless replaced by newer information:
- SellerFi is often a top-priority business domain, but not the universal mission of the entire system
- Hermes / MissionControl infrastructure is an active and important execution layer
- Agentic-KB and the local research engine are compounding leverage investments
- Daily prioritization should reflect both immediate business pressure and long-term systems leverage
- Jay values speed, leverage, evidence, and outputs that ship
- Jay dislikes repeated context setup, low-leverage discussion, unnecessary questions, and fluff without action

If any of these become inaccurate, update this file.

---

## Active Portfolio Domains (as of 2026-04-12)

| Domain | Priority | Status |
|--------|----------|--------|
| SellerFi | High | Active — fintech, primary business |
| Agentic-KB / LLM Wiki | High | Active — this system |
| MissionControl / Hermes harness | High | Active — agent infrastructure |
| Twinz / LifeOS | Medium | Active — personal systems |
| AI_CEO / Agentic-Pi-Harness | Medium | Active — digital workforce |
| comicogs / collector-media | Medium | Active |
| AssuranceAgents | Low-Medium | Experimental |
| OpenClaw-related systems | Medium | Active |

---

## Jay's Agent Infrastructure (as of 2026-04-12)

- **34 agents** across orchestrator / lead / worker tiers
- **29+ skills** in `~/.claude/skills/`
- **Primary frameworks**: GSD (TypeScript, extensive), Superpowers (TypeScript, extensive), BMAD (extensive)
- **Runtimes**: Claude Code (primary), Cowork (secondary)
- **KB**: `/Users/jaywest/Agentic-KB/` — markdown wiki, GitHub: jaydubya818/Agentic-KB
- **Agent definitions**: `~/.claude/agents/`
- **Main Obsidian vault**: `/Users/jaywest/Documents/Obsidian Vault/`

---

## Routing Defaults (validated patterns)

- **Agentic-KB questions** → Knowledge Ingestion lane, not Orchestration
- **GSD framework questions** → Engineering Execution, Jay has extensive experience, don't over-research
- **SellerFi product questions** → Product Strategy first, then Engineering
- **"What should I work on"** → Founder Ops, check this file's Priority Stack first
- **Agent system design** → Orchestration Architecture, reference `wiki/evaluations/eval-orchestration-frameworks.md`
- **Multi-agent implementation** → GSD or Raw Claude Code (eval verdict), not LangGraph unless Python is required

---

## Research Engine Priority Context

The research engine is not just a note-taking project. It is a reusable intelligence layer that improves: research quality, synthesis quality, decision support, artifact production, long-term knowledge compounding, and cross-project leverage.

### Intended Stack

**Layer 1 — Markdown Skill Graph:** reusable methodology brain (research frameworks, source evaluation, synthesis rules, contradiction protocol, lens files, output templates)

**Layer 2 — Project Research Workspaces:** per-topic research folders (question, scope, sources, executive summary, deep dive, open questions, extracted data points, linked concepts and entities)

**Layer 3 — Ontology-Lite Knowledge Graph:** graph-aware markdown first (wikilinks, frontmatter, typed notes, relationship conventions, provenance fields, entity and concept nodes). Not a graph database until the markdown system hits a ceiling.

### Recommended Build Order

1. Finalize this operating-context file and live weekly priority stack
2. Create `/knowledge-systems/research-engine/` with methodology, lenses, templates, knowledge
3. Add provenance model and ontology-lite conventions
4. Run 1–2 real research questions through the engine; refine based on weak spots
5. Only then: consider graph database if markdown multi-hop traversal proves insufficient

---

## Ontology-Lite Starter Conventions

**Node types:** concept, entity, source, project, finding, metric, question

**Relationship types:** relates_to, supports, contradicts, derived_from, impacts, depends_on

**Frontmatter template for typed notes:**
```yaml
---
type: concept          # concept | entity | source | finding | metric | question
domain: [domain]
status: active         # active | deprecated | uncertain
confidence: medium     # high | medium | low
source: [wiki link or URL]
date_captured: YYYY-MM-DD
scope: [project or global]
related:
  - [[related-concept]]
  - [[related-entity]]
---
```

---

## Recurring Rhythms

| Rhythm | Frequency | Description |
|--------|-----------|-------------|
| Priority stack update | Weekly | Replace current stack, review blockers, update deprioritized list |
| KB lint | Monthly | Run lint workflow, output to wiki/syntheses/lint-YYYY-MM-DD.md |
| KB ingest | As-needed | When new sources arrive — follow INGEST workflow in CLAUDE.md |
| Hermes operating context review | Weekly | Verify working assumptions are still accurate |

---

## Open Blockers / Known Constraints (append-only)

- [2026-04-12] RLM Stages 1–3 not yet implemented. Recipe at `wiki/recipes/recipe-hybrid-search-llm-wiki.md`. P1 priority.
- [2026-04-12] `wiki/mocs/repos.md` not yet created. Repo canonical docs not 2-click reachable from home.md.
- [2026-04-12] Priority 1 SellerFi objective undefined — Hermes cannot fully prioritize daily work.

---

## Durable Lessons (append-only)

- [2026-04-12] Hermes agent formalized. Session-start reads this file + wiki/hot.md. Update this file when portfolio state changes.
- [2026-04-12] Writing style guide and 2-click rule added to KB CLAUDE.md. All new wiki pages must follow these.
- [2026-04-12] Wikiwise ingest: stream large docs to disk before loading into context. Pipe via `jq -r '.content' > file`.
- [2026-04-12] Priority stack structure finalized. Weekly update ritual: replace stack rows, review blockers, update deprioritized list. Takes 3 minutes.
- [2026-04-12] Research engine: build as KB module not separate system. Markdown-first, graph-aware. Add ontology-lite before graph DB.
