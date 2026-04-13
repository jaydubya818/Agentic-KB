---
title: Knowledge Workflows
type: moc
category: structure
tags: [ingest, query, synthesis, literature-notes, evergreen-notes, research, project-management]
created: 2026-04-13
updated: 2026-04-13
---

# Knowledge Workflows

The end-to-end flow for turning raw information into permanent, compounding knowledge. Covers the Capture → Process → Connect pipeline, literature note conventions, evergreen note standards, project management, and research & synthesis.

---

## Capture → Process → Connect

The three-phase knowledge lifecycle used in this vault:

**Phase 1: Capture**
Raw information lands in `raw/`. Never processed here — just captured faithfully:
- Papers → `raw/papers/{slug}.md`
- Transcripts → `raw/transcripts/{slug}.md`
- Framework docs → `raw/framework-docs/{slug}.md`
- Agent/skill definitions → `raw/my-agents/`, `raw/my-skills/`
- Code examples → `raw/code-examples/{slug}.md`
- Conversations → `raw/conversations/{slug}.md`

Rule: `raw/` is immutable. Capture the source, don't improve it.

**Phase 2: Process (INGEST Workflow)**
Run the INGEST workflow on any new raw file:
1. Read the full source
2. Extract: concepts, patterns, frameworks, key claims, code examples, Jay-specific insights
3. Create `wiki/summaries/{source-slug}.md` — the literature note
4. Update or create relevant concept/pattern/framework pages
5. Flag contradictions with existing wiki content
6. Cross-link bidirectionally

**Phase 3: Connect**
After ingesting, make the new knowledge discoverable:
- Update `wiki/index.md` with new/updated entries
- Append to `wiki/log.md`
- Add to `wiki/recently-added.md`
- Update relevant MoC pages
- Verify 2-click reachability from `wiki/home.md`

Full workflow spec in [[CLAUDE.md]].

---

## Literature Notes

Literature notes live in `wiki/summaries/`. One per raw source. They are the processed distillation of what a source says — not yet interpreted or connected.

Current literature notes ({{count}} total): see [[index]] → Summaries section.

Literature note conventions:
- Filename matches the raw source slug
- Frontmatter includes `source_file`, `author`, `date_published`, `date_ingested`
- `key_concepts` array links to the concepts the source touches
- Length: 300–500 words
- Voice: descriptive, not yet opinionated — save synthesis for synthesis pages

High-signal recent summaries:
- [[summaries/karpathy-llm-wiki-video]] — foundational LLM wiki pattern
- [[summaries/summary-research-skill-graph]] — 6-lens research methodology
- [[summaries/summary-layered-agent-memory-obsidian]] — 3-tier vault architecture
- [[summaries/nvidia-gtc-2026-agentic-enterprise]] — enterprise agentic patterns

---

## Evergreen Notes

Evergreen notes are the permanent, opinionated concept and pattern pages — `wiki/concepts/` and `wiki/patterns/`. Unlike summaries (which describe a source), evergreen notes synthesize across sources and state a position.

Evergreen note standards:
- **Atomic** — one concept, one idea. If a page is trying to say two things, split it.
- **Title is a claim** — "Tool Use Requires Explicit Permission Models" beats "Tool Use"
- **Links out aggressively** — every concept mentioned links to its page (first mention only)
- **Confidence is honest** — `high` only if multiple independent sources + Jay has tested
- **Status reflects reality** — `stable` / `evolving` / `deprecated`

High-value evergreen notes:
- [[concepts/rlm-pipeline]] — 10-stage recursive layered memory
- [[concepts/rag-systems]] — hybrid retrieval architecture
- [[concepts/knowledge-graphs]] — typed entities + edges
- [[patterns/pattern-supervisor-worker]] — canonical multi-agent topology
- [[patterns/pattern-hot-cache]] — context optimization pattern
- [[patterns/pattern-fan-out-worker]] — parallel agent execution

---

## Project Management

Active and example projects in `wiki/projects/`. Each project workspace contains:
- `prd.md` — Product/problem requirements
- `implementation-plan.md` — Phased execution plan
- `specs.md` — Technical specifications

Research projects managed by the research engine:
- `knowledge-systems/research-engine/command-center.md` — active projects tracker
- `knowledge-systems/research-engine/templates/project-template.md` — full project structure

For engineering project management (sprint planning, task tracking), see [[mocs/daily-systems|Daily Systems]].

---

## Research & Synthesis

**Research Engine** — the 6-lens structured research module at `knowledge-systems/research-engine/`. Entry point: [[knowledge-systems/research-engine/command-center|Command Center]].

Research process:
1. Fill [[knowledge-systems/research-engine/templates/research-question-intake|Intake Form]] — defines question, scope, lenses, success criteria
2. Run each lens: technical, economic, historical, geopolitical, contrarian, first-principles
3. Synthesize findings in [[knowledge-systems/research-engine/templates/deep-dive-template|Deep Dive]]
4. Distill to [[knowledge-systems/research-engine/templates/executive-summary-template|Executive Summary]] or [[knowledge-systems/research-engine/templates/decision-memo-template|Decision Memo]]
5. Promote durable findings to `wiki/` as concepts, patterns, or syntheses

**Syntheses** — cross-source analysis pages in `wiki/syntheses/`. Use when a question touches 2+ existing summaries and the answer isn't obvious from either alone.

QUERY workflow: for questions against existing KB content, run [[CLAUDE.md#QUERY Workflow]] — reads hot.md, then index.md, then relevant pages, synthesizes with citations.

---

## Related

- [[mocs/vault-foundation|Vault Foundation]] — Folder structure
- [[mocs/automation|Automation]] — INGEST automation and auto-tagging
- [[mocs/advanced-techniques|Advanced Techniques]] — Agentic note-taking and cross-note analysis
- [[knowledge-systems/research-engine/command-center|Research Engine]]
