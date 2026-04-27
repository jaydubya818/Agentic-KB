# Agentic Engineering Knowledge Base — Schema v1.0
> Owner: Jay West | Domain: Agentic AI Systems & Harness Engineering | Built: 2026-04-04

## Cowork Session Start — Hermes Mode
On every Cowork session start:
1. Read `wiki/personal/hermes-operating-context.md` and `wiki/hot.md`.
2. Stage meeting-derived content: `node scripts/sofie-watch-obsidian.mjs --once` — Obsidian Vault `05 - Meetings/` → `raw/transcripts/` as `type: meeting-note` with `ingest_status: pending`. Silent no-op if the source folder is empty.
3. **Run ambient quick-capture**: invoke `/foundry-capture-notes` to pull anything new from the Apple Notes `KB Inbox` folder into `raw/clippings/`. Silent no-op if the folder is empty or already deduped. Surface the count in the opening status if anything was written and offer to run `/foundry-ingest` next. (Slack capture exists as `/foundry-capture-slack` for personal Slack workspaces, but is intentionally NOT in the bootstrap to avoid mixing corporate workspace data into the personal KB.)
4. Check `raw/transcripts/` for files with `ingest_status: pending` — if any exist, surface the count in the opening status and offer to run the Call Transcript INGEST per `wiki/transcript-ingest.md` before other work. Same for `raw/clippings/` newly-written from step 3.
5. Operate as Hermes for the remainder of the session. Route all requests by work lane, apply the delegation contract, surface escalation triggers, and produce decision-ready artifacts. See `~/.claude/agents/hermes.md` for the full SOUL.

> The bootstrap intentionally STAGES (steps 2-3) but does not auto-INGEST. Staging is read-only on the source surface and write-only into `raw/`; ingest is the gated step that creates wiki pages and is always offered, never forced. This preserves Rule 12 (LLM-authored pages start `reviewed: false`) and Rule 13 (one-way personal vault).

---

## Purpose
A persistent, compounding knowledge base for agentic AI engineering. Covers multi-agent architecture, orchestration patterns, frameworks, prompt engineering, safety, evaluation, production deployment, and Jay's personal validated patterns. The KB itself uses agentic patterns — parallel agents for seeding, fan-out for ingestion, reflection for linting.

---

## Vault Structure

```
Agentic-KB/
├── raw/                    # IMMUTABLE — LLM reads, never writes
│   ├── papers/             # Academic papers (PDF → md)
│   ├── transcripts/        # Video/podcast transcripts
│   ├── framework-docs/     # Framework documentation snippets
│   ├── my-agents/          # Jay's ~/.claude/agents/*.md definitions
│   ├── my-skills/          # Jay's ~/.claude/skills/*/SKILL.md files
│   ├── my-hooks/           # Jay's Claude Code hook configs
│   ├── code-examples/      # Annotated code patterns
│   ├── conversations/      # Notable Claude Code sessions (exported)
│   ├── clippings/          # Obsidian Web Clipper drop zone — INGEST auto-routes to correct raw/ subdir
│   └── changelogs/         # Framework version notes
├── wiki/                   # LLM-OWNED — never edit manually
│   ├── concepts/           # Universal agentic concepts
│   ├── patterns/           # Reusable design patterns
│   ├── frameworks/         # Tool and framework reference pages
│   ├── entities/           # People, companies, models, projects
│   ├── summaries/          # 1:1 per raw source (slug matches raw file)
│   ├── syntheses/          # Cross-source analysis and comparisons
│   ├── recipes/            # Step-by-step implementation guides
│   ├── evaluations/        # Scored benchmark and framework comparisons
│   ├── personal/           # Jay's validated patterns, lessons, war stories
│   ├── hot.md              # Hot cache — ≤500 words of most-used context
│   ├── index.md            # Master catalog (LLM-maintained, always current)
│   └── log.md              # Append-only operation log
└── CLAUDE.md               # This file — schema and workflows
```

---

## File Naming Conventions
- All lowercase, hyphenated: `multi-agent-orchestration.md`
- No dates in filenames (dates go in frontmatter)
- Framework pages: prefix with `framework-` → `framework-langgraph.md`
- Pattern pages: prefix with `pattern-` → `pattern-fan-out-worker.md`
- Recipe pages: prefix with `recipe-` → `recipe-build-tool-agent.md`
- Evaluation pages: prefix with `eval-` → `eval-orchestration-frameworks.md`
- Synthesis pages: prefix with `synthesis-` → `synthesis-memory-approaches.md`

---

## Frontmatter Schema

### Concept Pages
```yaml
---
title: string
type: concept
tags: [agentic, <domain-tags>]
confidence: high | medium | low
sources: []          # wiki links to summaries
created: YYYY-MM-DD
updated: YYYY-MM-DD
related: []          # wiki links to related concepts/patterns
status: stable | evolving | deprecated
reviewed: false      # true once Jay has human-verified the content
reviewed_date: ""    # YYYY-MM-DD when Jay flipped reviewed to true
---
```

### Pattern Pages
```yaml
---
title: string
type: pattern
category: orchestration | memory | tool-use | safety | evaluation | deployment | prompt-engineering
problem: one-line problem statement
solution: one-line solution
tradeoffs: []
tags: []
confidence: high | medium | low
sources: []
created: YYYY-MM-DD
updated: YYYY-MM-DD
reviewed: false      # true once Jay has human-verified the content
reviewed_date: ""    # YYYY-MM-DD when Jay flipped reviewed to true
---
```

### Framework Pages
```yaml
---
title: string
type: framework
vendor: string
version: string        # latest known version
language: python | typescript | any
license: open-source | proprietary | mixed
github: string         # URL if open source
tags: []
last_checked: YYYY-MM-DD
jay_experience: none | limited | moderate | extensive
reviewed: false        # true once Jay has human-verified the content
reviewed_date: ""      # YYYY-MM-DD when Jay flipped reviewed to true
---
```

### Recipe Pages
```yaml
---
title: string
type: recipe
difficulty: beginner | intermediate | advanced
time_estimate: string
prerequisites: []
tested: true | false
tested_date: YYYY-MM-DD    # only if tested: true
tags: []
reviewed: false            # true once Jay has human-verified the content
reviewed_date: ""          # YYYY-MM-DD when Jay flipped reviewed to true
---
```

### Summary Pages
```yaml
---
title: string
type: summary
source_file: raw/path/to/file.md
source_url: string      # if from web
author: string
date_published: YYYY-MM-DD
date_ingested: YYYY-MM-DD
tags: []
key_concepts: []        # list of concepts this source touches
confidence: high | medium | low
reviewed: false         # true once Jay has human-verified the content
reviewed_date: ""       # YYYY-MM-DD when Jay flipped reviewed to true
---
```

### Synthesis Pages
```yaml
---
title: string
type: synthesis
sources: []             # wiki links to summaries or pages compared
question: string        # the question this synthesis answers
tags: []
created: YYYY-MM-DD
updated: YYYY-MM-DD
reviewed: false         # true once Jay has human-verified the content
reviewed_date: ""       # YYYY-MM-DD when Jay flipped reviewed to true
---
```

### Personal Pages
```yaml
---
title: string
type: personal
category: pattern | lesson | anti-pattern | decision | war-story
confidence: high | medium | low   # how validated is this
date: YYYY-MM-DD
tags: []
reviewed: false                   # personal pages authored by Jay may start true; LLM-drafted ones start false
reviewed_date: ""                 # YYYY-MM-DD when reviewed flipped to true
---
```

---

## Required Sections by Page Type

### Concept Pages (required)
1. **TL;DR** — one sentence definition, no jargon
2. **Definition** — one paragraph explanation
3. **How It Works** — mechanism, step by step
4. **Key Variants** — flavors and configurations
5. **When To Use** — conditions and signals
6. **Risks & Pitfalls** — failure modes, what goes wrong
7. **Counter-arguments & Gaps** — opposing views, what the evidence does NOT show, unresolved questions. Mandatory bias check — never ship a one-sided compilation.
8. **Related Concepts** — `[[wiki links]]`
9. **Sources** — `[[wiki/summaries/...]]` links

### Pattern Pages (required)
1. **Problem** — the recurring design problem
2. **Solution** — the pattern structure
3. **Implementation Sketch** — pseudocode or code outline
4. **Tradeoffs** — pros/cons table
5. **When To Use** — context conditions
6. **When NOT To Use** — counter-indicators
7. **Real Examples** — from Jay's projects or raw sources
8. **Related Patterns** — `[[wiki links]]`

### Framework Pages (required)
1. **Overview** — what it is, who built it, why it exists
2. **Core Concepts** — framework-specific vocabulary
3. **Architecture** — how it's structured internally
4. **Strengths** — what it genuinely excels at
5. **Weaknesses** — honest limitations, failure cases
6. **Minimal Working Example** — 10-20 lines, runnable
7. **Integration Points** — how it connects to other tools in the stack
8. **Jay's Experience** — (fill in when applicable; mark `N/A` if none)
9. **Version Notes** — notable changes across versions
10. **Sources** — `[[wiki links]]`

### Recipe Pages (required)
1. **Goal** — what you're building and why
2. **Prerequisites** — tools, knowledge, setup needed
3. **Steps** — numbered, copy-pasteable, no hand-waving
4. **Verification** — how to confirm success
5. **Common Failures & Fixes** — top 3 failure modes
6. **Next Steps** — what to extend or build after
7. **Related Recipes** — `[[wiki links]]`

### Evaluation Pages (required)
1. **What's Being Compared** — the candidates
2. **Evaluation Criteria** — dimensions with rationale
3. **Methodology** — how scores were derived
4. **Scorecard** — table with scores per dimension
5. **Summary Verdict** — one paragraph recommendation
6. **When to Re-evaluate** — what would change this verdict
7. **Sources** — `[[wiki links]]`

### Synthesis Pages (required)
1. **Question** — the question this synthesis answers, stated plainly
2. **Argument** — the synthesised position, one declarative paragraph
3. **Evidence** — sources with key quotes or data
4. **Counter-arguments & Gaps** — opposing views, missing evidence, unresolved questions. Mandatory bias check — never ship a one-sided synthesis.
5. **Conclusion** — resolved position, remaining uncertainty, or open question for next round
6. **Sources** — `[[wiki links]]`

---

## Linking Conventions
- Use Obsidian wiki links: `[[concepts/tool-use]]` or `[[concepts/tool-use|Tool Use]]`
- Always link the **first mention** of any concept on a page
- No orphan pages — every new page needs ≥1 inbound link from an existing page
- Summary pages always link to their corresponding raw source
- **2-click rule:** every concept, pattern, framework, and recipe must be reachable from `wiki/home.md` in ≤2 clicks. Home → MoC → Page is the standard path. If a page isn't reachable this way, add it to the relevant MoC. Run a reachability check after every ingestion session.
- Pattern pages link to the concept pages they rely on
- Recipe pages link to the patterns and concepts they implement
- When creating a new page, immediately add a link from index.md and from ≥1 relevant existing page

---

## Tagging Taxonomy

### Domain Tags
`agentic` `orchestration` `memory` `tool-use` `safety` `evaluation`
`deployment` `prompt-engineering` `context-management` `multi-agent`
`single-agent` `human-in-the-loop` `cost-optimization` `observability`
`state-management` `parallelization` `error-handling` `reflection`

### Framework Tags
`claude-code` `claude-api` `langgraph` `autogen` `crewai` `openai`
`mcp` `anthropic` `openclaw` `rowboat` `gsd` `superpowers` `bmad`
`langchain` `llamaindex` `dspy`

### Pattern Category Tags
`pattern-orchestration` `pattern-memory` `pattern-safety`
`pattern-evaluation` `pattern-deployment` `pattern-tool-design`
`pattern-prompt-engineering` `pattern-context`

### Confidence Levels
- `high` — Multiple independent sources confirm; Jay has personally tested
- `medium` — Single source; or untested by Jay; or inferred from first principles
- `low` — Speculative; based on limited evidence; or from a single low-authority source

---

## Workflows

### INGEST Workflow
When told to ingest a file from raw/:
0. **If the file is in `raw/clippings/`**: inspect the source URL / file type and move it to the correct raw/ subdir first (papers → `papers/`, transcripts → `transcripts/`, docs → `framework-docs/`, tweets/threads → `conversations/` or a new `raw/social/`). Never ingest out of `clippings/` — it is a staging zone only.
1. Read the full source file
2. Extract: concepts, patterns, frameworks mentioned, key claims, code examples, Jay-specific insights
3. Create `wiki/summaries/{source-slug}.md` with full frontmatter and key points
4. Update or create relevant concept/pattern/framework pages — integrate new info into existing knowledge
5. Flag contradictions with existing wiki content — add contradiction note inline AND to log.md
6. Cross-link everything bidirectionally — new page links out, existing pages get backlinks
7. **Auto-wire canonical entities**: run `python scripts/autolink.py --vault . --entity-map scripts/entity-map.json --folder wiki --write` to insert `[[canonical]]` wikilinks for every known entity, framework, person, and model referenced in plain text. The `--folder wiki` scope keeps the sweep out of root docs, `raw/`, and `.claude/`; the script also protects frontmatter, code fences, and existing wikilinks. This is the GBrain-style self-wiring pass — do NOT hand-link what the autolinker already handles.
8. Update `wiki/index.md` with new/updated entries
9. Append to `wiki/log.md` with timestamp, source name, pages created/updated, contradictions found
10. Append new pages to `wiki/recently-added.md` under today's date heading — format: `- [[path/to/page|Title]] — one-line description`
11. Update relevant MoC pages in `wiki/mocs/` if the new content fits an existing domain (orchestration, memory, tool-use, evaluation)

### Meeting Note INGEST (sub-workflow)
When a file in `raw/transcripts/` has frontmatter `type: meeting-note` AND `ingest_status: pending`, follow the SOP in `wiki/transcript-ingest.md`. In short: run passes for **summary** (`wiki/summaries/`), **actions** (append to `wiki/action-tracker.md`), and **decisions** (new page per decision in `wiki/decisions/`), then fall through to steps 4-11 of the standard INGEST above. Flip frontmatter `ingest_status: ingested` when done.

Auto-staging: `scripts/sofie-watch-obsidian.mjs` watches `~/Documents/Obsidian Vault/05 - Meetings/` and stages meetings as `type: meeting-note` with `ingest_status: pending`.

### QUERY Workflow
When asked a question against the KB:
1. Read `wiki/hot.md` first (frequently-used patterns, ≤500 words)
2. Read `wiki/index.md` to find relevant pages
3. Read the relevant concept/pattern/framework pages
4. Synthesize answer with specific citations (`[[page-name]]`)
5. **If the question touches gaps**: do a web search, then backfill the wiki before answering
6. **If the answer is substantial** (>200 words of synthesis): offer to file as `wiki/syntheses/synthesis-{slug}.md`
7. **Offer to update hot.md** if the query is likely to recur frequently

### LINT Workflow
When asked to lint the wiki:
1. Read `wiki/index.md` to get all page paths
2. Check for **orphan pages** (no inbound links) — list them
3. Check for **missing cross-links** (concept mentioned in body but not linked)
4. Check for **stale framework pages** (`last_checked` > 60 days ago)
5. Check for **low-confidence claims** that could be verified with a web search
6. Check for **recipe pages** with `tested: false` older than 30 days — flag for testing
7. Check for **unreviewed pages** (`reviewed: false`) with file mtime > 30 days — list for Jay's review queue
8. Check for **review drift** — pages where `reviewed: true` but file mtime > `reviewed_date` (content changed after human review) — flag for re-review
9. Check for **concept/synthesis pages missing `Counter-arguments & Gaps` section** — bias-check violation
10. Identify **gap candidates** — concepts referenced but no concept page exists
11. Suggest **new article candidates** based on gap analysis
12. Output lint report to `wiki/syntheses/lint-{YYYY-MM-DD}.md`

### HOT CACHE Rules
`wiki/hot.md` holds ≤500 words. Update when:
- A pattern/concept is referenced in 3+ query responses
- Jay explicitly requests something be cached
- A lint pass reveals a page with 10+ inbound links
Structure: brief summaries with `[[wiki links]]`, not full explanations.
Never let hot.md exceed 600 words — prune least-accessed entries.

### BACKFILL Workflow
When a query reveals a gap not in the wiki:
1. Do a web search for the missing information
2. Create a raw source stub in `raw/framework-docs/{topic}.md` with the found content
3. Run the INGEST workflow on that stub
4. Answer the query using the newly ingested information
5. Log the backfill in `wiki/log.md`

---

## Rules (Non-Negotiable)
1. **Never modify raw/** — read-only, source of truth
2. **Always update index.md and log.md** after any wiki write
3. **No orphan pages** — every new page gets ≥1 inbound link before being filed
4. **Flag contradictions in log.md** — never silently overwrite existing claims
5. **Recipe pages must be marked `tested: false`** unless Jay explicitly confirms testing
6. **Framework pages must have `last_checked` dates** — frameworks evolve fast
7. **Personal/ pages are Jay's perspective** — don't dilute with external sources; mark clearly
8. **Confidence levels must be honest** — default to `medium` when uncertain
9. **Never hallucinate sources** — if a claim has no source, mark it `[UNVERIFIED]`
10. **Append to log.md, never overwrite** — it is an audit trail
11. **Counter-arguments are mandatory** — every concept and synthesis page must include a `Counter-arguments & Gaps` section. Never ship a one-sided compilation; if ten sources agree, the page must still name what the evidence does NOT show and what would change the verdict.
12. **Reviewed flag starts false** — every LLM-authored page is born `reviewed: false`. Only Jay flips to `true` and stamps `reviewed_date`. Automation (INGEST, /autoresearch, BACKFILL) must never set `reviewed: true`.
13. **One-way rule (personal vault is read-only)** — the agent compile-vault (`Agentic-KB/`) may READ from the personal write-vault (`/Users/jaywest/Documents/Obsidian Vault/`) but must NEVER write, edit, rename, or delete anything inside it. Personal notes flow IN via `raw/clippings/` or the Sofie watcher; nothing flows back out. The optional `scripts/install-personal-vault-guard.sh` pre-commit hook enforces this at git layer.
14. **2-source rule for compile** — `/foundry-compile` only promotes a theme to a wiki/concepts/, wiki/patterns/, or wiki/frameworks/ page after ≥2 summaries cite it. Single-source themes are deferred to `wiki/candidates.md` and re-evaluated each compile. The `--force` flag bypasses the gate but is logged as `[FORCED]` in `wiki/_meta/compile-log.md`.

---

## Foundry Slash Commands

UX layer over the existing `kb` CLI. Each command is a thin shell that documents intent, calls the appropriate script, and enforces a refuse list. Source: `.claude/commands/foundry-*.md`.

- **`/foundry-ingest`** — sha256-dedup new files in `raw/clippings/` and route to the correct `raw/<subdir>/` (papers, transcripts, framework-docs, conversations, articles). Idempotent — re-runs are no-ops. Calls `scripts/ingest-dedup.mjs`.
- **`/foundry-compile`** — run the 2-source gate. PROMOTE themes with ≥2 sources (new pages or updates), DEFER single-source themes to `wiki/candidates.md`, GRADUATE themes that crossed the threshold since last run. Logs every run to `wiki/_meta/compile-log.md`. Calls `scripts/compile-2source-gate.mjs`.
- **`/foundry-ask "<question>"`** — query the wiki with citation enforcement. Returns answer + ≥2 `[[wiki/...]]` citations or surfaces a "no-source warning" header. Wraps `kb query`.
- **`/foundry-lint`** — run `kb lint` plus Foundry extras: candidate-health (which deferred themes are now ready to graduate) and keyword drift (any tag down >70% in the last 30 days vs. 90).
- **`/foundry-propose`** — surface actionable proposals from the KB's own history (stuck candidates >30d, repeat-graduates a.k.a. flapping themes, heavy backlog >50 deferred). Reactive — user accepts/rejects manually. No auto-act. Append-only ledger at `wiki/_meta/proposals.md` with stable PROP-### IDs. Calls `scripts/foundry-propose.mjs`.
- **`/foundry-capture-slack`** — pull messages from a dedicated Slack channel (default `#kb-inbox`) via Hermes MCP, write each to `raw/clippings/` with provenance frontmatter. sha256-deduped via `scripts/lib/clipping-write.mjs`. Source surface stays read-only.
- **`/foundry-capture-notes`** — pull notes from a dedicated Apple Notes folder (default `KB Inbox`), write each to `raw/clippings/`. Same dedup + provenance shape as the Slack capture.
- **`/foundry-capture`** — umbrella: runs the enabled capture sources (currently Apple Notes only — Slack capture is intentionally NOT in this umbrella; see `.claude/commands/foundry-capture.md` for why), then recommends `/foundry-ingest`.

---

## Integration with Jay's Infrastructure

### Obsidian Vault Cross-Links
Main vault: `/Users/jaywest/Documents/Obsidian Vault/`
- Can reference Jay's main vault with full paths for context
- Don't copy content from main vault — link instead
- Jay's main vault entity map: `scripts/entity-map.json`

### My LLM Wiki Harness
Harness: `/Users/jaywest/My LLM Wiki/`
- `packages/cli` — CLI for querying this KB from terminal
- `packages/mcp` — MCP server exposing KB as agent tool
- `packages/core` — Core ingestion/query logic
- Run queries via: `cd /Users/jaywest/My\ LLM\ Wiki && npm run query "your question"`

### Claude Code Infrastructure
- Agent definitions in: `/Users/jaywest/.claude/agents/`
- Skill definitions in: `/Users/jaywest/.claude/skills/`
- Use `gsd-executor` for complex wiki builds
- Use parallel Agent tool calls for fan-out ingestion

### Graphify
- After major ingestion runs, invoke `/graphify` on the wiki index
- Output goes to `wiki/syntheses/knowledge-graph-{date}.html`
- Use graph view to identify orphan clusters and under-linked concepts

---

## Writing Style Guide

All wiki pages — concept, pattern, recipe, framework — follow these rules:

**Structure (4-part):**
1. **TL;DR / Lead** — one declarative sentence stating the verdict or definition, no hedging
2. **The argument** — 2–4 paragraphs explaining the mechanism, tradeoffs, and evidence
3. **Specifics** — code sketches, tables, numbered steps — whatever makes the argument concrete
4. **Connections** — Related concepts, related patterns, sources (wiki links only)

**Voice:**
- Opinionated and direct. State a position. "X is better than Y for Z" not "X may be preferred in some scenarios."
- Declarative sentences. Avoid "can be", "might", "could potentially."
- First mention of any proper noun (framework, pattern name, person) gets a wiki link — never again on the same page.
- No filler intros. Start with the content.

**Length:**
- Concept pages: 400–800 words
- Pattern pages: 500–900 words
- Recipe pages: as long as the steps require; no length limit, but no padding
- Framework pages: 600–1000 words
- Summaries: 300–500 words

**Anti-patterns (never do these):**
- "This is a complex topic with many facets." → Delete. Start with the facet that matters.
- Bullet-point lists masquerading as prose. Bullets for 3+ parallel items; prose otherwise.
- Passive voice in TL;DRs. "X is used to..." → "X does..."
- Hedged verdicts without evidence. If you're uncertain, say `[UNVERIFIED]` and note what would resolve it.

---

## Query Examples

```
"What's the best pattern for a supervisor-worker multi-agent system in Claude Code?"
"How do I manage context across a long agentic session without losing state?"
"Compare LangGraph and GSD for orchestrating a 5-step research pipeline"
"What are Jay's validated patterns for tool design?"
"Find gaps in the KB — what topics need articles?"
"Which frameworks support parallel agent execution natively?"
"What does the hot cache pattern look like in code?"
```

---

## Lint Schedule
Run lint monthly or when the wiki grows by >20 pages.
Always run lint before a major query session on a topic you haven't touched in 30+ days.

### EXPLORE Workflow
When asked to explore the knowledge base for connections:
1. Read `wiki/index.md` in full
2. Identify the 5 most interesting **unexplored connections** between existing topics — pairs or clusters that haven't been synthesised yet
3. For each: explain what insight it might reveal, what question it answers, and what source would help confirm it
4. Offer to create a new `wiki/syntheses/` page for any connection the user wants to develop
5. Suggest 3 raw sources or web articles that would enrich the weakest areas

### BRIEF Workflow
When asked for an executive briefing:
1. Read `wiki/index.md` to identify all relevant pages
2. Read the top 5-8 relevant pages in full
3. Write a 400-600 word structured briefing: **Current State → Key Tensions → Open Questions → Recommended Next Steps**
4. Every claim cites its wiki page: `[Source: wiki/concepts/page-name]`
5. Write directly to `wiki/syntheses/synthesis-brief-{topic}-{YYYY-MM-DD}.md` with frontmatter `status: draft`
6. Promote `status: stable` once cross-linked from ≥1 other wiki page

> **`outputs/` deprecated** (2026-04-25, ADR pending): drafts now land directly
> in `wiki/syntheses/` with `status: draft`. Removes a staging surface and a
> manual promotion step. Existing `outputs/` content can be migrated lazily.
