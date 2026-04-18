---
title: Agentic-KB — Agent Instructions
type: repo-claude
repo_name: agentic-kb
tags: [agents, agentic-kb]
created: 2026-04-09
updated: 2026-04-09
---

# Agentic-KB — Agent Instructions

Instructions for agents operating on the Agentic-KB repository.

## Purpose

This KB is the authoritative source of knowledge on agentic AI systems. It serves Jay West's personal learning, project decision-making, and is exposed via CLI, web UI, and [[mcp-ecosystem]] server for use by other agents in the ecosystem (Pi, MissionControl, LLMwiki).

## Owned Workflows

### INGEST
When given new raw source material (papers, transcripts, code examples, framework docs):

1. **Read** the full source file from `raw/`
2. **Extract**: Identify 1-3 core ideas, code patterns, contradictions with existing wiki
3. **Create or Update**: 
   - If idea is novel: create new concept/pattern/framework page with full frontmatter
   - If idea extends existing page: update existing page and note source
4. **Cross-link**: Link the first mention of every related concept
5. **Flag contradictions**: Add blockquote notes inline, log to `wiki/log.md`
6. **Update index**: Add new pages to `wiki/index.md`
7. **Append log**: Record what was created/updated with timestamp

### QUERY
When asked a question about agentic engineering:

1. **Read [[pattern-hot-cache]]** first (`wiki/hot.md` — 500 words of frequently-used patterns)
2. **Scan index** (`wiki/index.md`) for relevant pages
3. **Read relevant pages** (concepts, patterns, frameworks)
4. **Synthesize** answer with citations: `[concept name](../concepts/page-name.md)`
5. **If gaps found**: Do web search, backfill to raw/, run INGEST, then answer
6. **If substantial** (>200 words): Offer to file as new synthesis page

### LINT
Monthly health check. Run if asked or if wiki grows >20 pages since last lint:

1. **Check all pages** in `wiki/index.md` for:
   - Orphan pages (no inbound links)
   - Missing cross-links (concepts mentioned but not linked)
   - Stale framework pages (last_checked >60 days old)
   - Low-confidence claims that need verification
   - Recipes marked `tested: false` older than 30 days
2. **Generate report**: Output to `wiki/syntheses/lint-{YYYY-MM-DD}.md`
3. **Suggest improvements**: Gap candidates, new article ideas, priority fixes

### [[pattern-hot-cache]]
When a pattern is queried 3+ times/week or links received 10+ inbound links:

1. **Summarize** the pattern in ≤100 words
2. **Add to hot.md** with wiki link
3. **Maintain ≤600 words total** — prune least-accessed entries
4. **Update on/off cycle**: Refresh weekly

## Read-Only Constraint

**Never write to `raw/`** — it is the immutable source of truth. All changes flow through `wiki/`. If a raw document needs correction, log the issue and defer to Jay.

## Frontmatter Rules

**Concept pages**:
```yaml
---
title: string
type: concept
tags: [agentic, domain-tags]
confidence: high | medium | low
sources: []
created: YYYY-MM-DD
updated: YYYY-MM-DD
related: []
status: stable | evolving | deprecated
---
```

**Pattern pages**:
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
---
```

**Framework pages**:
```yaml
---
title: string
type: framework
vendor: string
version: string
language: python | typescript | any
license: open-source | proprietary | mixed
github: string URL if open source
tags: []
last_checked: YYYY-MM-DD
jay_experience: none | limited | moderate | extensive
---
```

**Recipe pages**:
```yaml
---
title: string
type: recipe
difficulty: beginner | intermediate | advanced
time_estimate: string
prerequisites: []
tested: true | false
tested_date: YYYY-MM-DD if tested: true
tags: []
---
```

## Required Sections by Type

**Concept pages**: TL;DR | Definition | How It Works | Key Variants | When To Use | Risks & Pitfalls | Related Concepts | Sources

**Pattern pages**: Problem | Solution | Implementation Sketch | Tradeoffs | When To Use | When NOT To Use | Real Examples | Related Patterns

**Framework pages**: Overview | Core Concepts | Architecture | Strengths | Weaknesses | Minimal Working Example | Integration Points | Jay's Experience | Version Notes | Sources

**Recipe pages**: Goal | Prerequisites | Steps (numbered, copy-pasteable) | Verification | Common Failures & Fixes | Next Steps | Related Recipes

## Non-Negotiable Rules

1. Never modify `raw/` — read-only source of truth
2. Always update `wiki/index.md` and `wiki/log.md` after any wiki write
3. No orphan pages — every new page gets ≥1 inbound link before filing
4. Flag contradictions in `wiki/log.md` — never silently overwrite existing claims
5. Mark recipes `tested: false` unless Jay explicitly confirms testing
6. Framework pages must have `last_checked` dates
7. Personal pages stay in `wiki/personal/` — don't dilute with external sources
8. Confidence levels must be honest — default to `medium` when uncertain
9. Never hallucinate sources — mark unverified claims `[UNVERIFIED]`
10. Append to `wiki/log.md`, never overwrite — it is an audit trail

## Integration Points

### CLI Query
Jay runs: `cd /Users/jaywest/My\ LLM\ Wiki && npm run query "your question"`

This hits the KB via the harness [[mcp-ecosystem]] server. Agents can do the same.

### [[mcp-ecosystem]] Server
The KB is exposed as an [[mcp-ecosystem]] server for:
- [[mission-control/home|MissionControl]] agents requesting orchestration patterns
- [[llmwiki/home|LLMwiki]] for CLI/web queries
- [[agentic-pi-harness/home|Pi harness]] agents for edge deployment patterns

### Obsidian Vault
Jay's main vault at `/Users/jaywest/Documents/Obsidian Vault/` is separate. Don't copy content — link via `[entity](file://...`)` if needed.

## Error Handling

**Framework page is stale** (last_checked >60 days):
- Contact Jay or fetch latest from vendor docs
- Update `last_checked` and version fields
- Log what changed in `wiki/log.md`

**Found a contradiction**:
- Add blockquote to newer page: `> ⚠️ **Contradiction**: Claim X in this page. [[other-page]] says Y. Flagged for review.`
- Append to `wiki/log.md`: timestamp, pages involved, description
- Do NOT silently overwrite

**Recipe marked `tested: false` is >30 days old**:
- Ping Jay for testing or mark for deprecation
- If deprecated: move to `wiki/archive/` and update index
- Log the decision in `wiki/log.md`

**Orphan page detected** (no inbound links):
- Check if it should link from index.md or a related page
- If genuinely orphaned: move to `wiki/archive/` and log
- If just needs linking: add the link and update index

## Jay's Preferences

- **Link generously**: First mention of any concept should be linked, even if the page is short
- **Confidence levels matter**: Medium > Low. Only mark high if tested personally or multiple sources agree
- **Sources must exist**: Never cite a source that doesn't have a summary page or clear attribution
- **Frontmatter is metadata**: It's machine-readable — keep it accurate and up-to-date
- **Log everything**: Future agents need to understand what happened and why

## Key Contacts & Escalation

- **Safety patterns**: [[framework-claude-code]] safety team (pending review of draft synthesis)
- **Framework updates**: Subscribe to vendor release notes; escalate if breaking changes
- **Recipe testing**: Coordinate with Jay's active projects (Mission Control, Pi harness)
