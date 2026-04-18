---
title: Automation
type: moc
category: structure
tags: [automation, skills, hooks, claude-code, auto-tagging, maintenance, scripts]
created: 2026-04-13
updated: 2026-04-13
---

# Automation

The automation layer that makes the KB compound without manual overhead. Covers custom Claude skills, auto-tagging and linking, summary generation, daily review automation, and vault maintenance scripts.

---

## Custom Claude Skills

Skills are modular prompt packages in `~/.claude/skills/` that extend Claude's capabilities. They are invoked via the Skill tool and follow the SKILL.md convention. Jay's current skill library (raw source: `raw/my-skills/`):

**GSD Framework Skills:**
- `gsd-executor` — full task execution orchestrator
- `gsd-planner` — milestone planning and task decomposition
- `gsd-verifier` — output verification and QA
- `gsd-debugger` — structured debugging
- `gsd-codebase-mapper` — codebase analysis and documentation

**KB-Specific Skills:**
- `graphify` — generates knowledge graph HTML from wiki index
- `multi-agent-patterns` — pattern selection assistant

**Agent Definition Skills:**
- `architect-agent` — software architecture
- `code-reviewer-agent` — code review automation
- `security-reviewer-agent` — security analysis
- `task-breakdown-agent` — task decomposition

**Wikiwise Skills** (Readwise integration):
- `ingest` — full Readwise vault ingest
- `fetch-readwise-document` — single document pull
- `fetch-readwise-highlights` — highlights extraction
- `import-readwise` — batch Readwise import
- `digest` — daily highlight digest

Summaries: [[summaries/summary-gsd-executor]] · [[summaries/summary-gsd-framework-skills]] · [[summaries/summary-wikiwise-skills]]

---

## Auto-Tagging & Linking

The INGEST workflow handles auto-tagging and cross-linking as part of its standard execution:

**Auto-tagging rules:**
- Tags are assigned from the taxonomy in [[CLAUDE.md]] — no ad hoc tags
- Every concept mentioned in body text gets tagged in frontmatter
- Framework pages get the framework's tag (e.g., `claude-code`, `langgraph`)
- Pattern pages get a `pattern-{category}` tag

**Auto-linking rules:**
- First mention of any proper noun (concept, pattern, framework, person) gets a `[[wiki link]]`
- Repeat mentions on the same page: no duplicate links
- New pages immediately get ≥1 inbound link from an existing page
- Summary pages link to their raw source path

**Planned: automated link verification**
A hook that runs after every wiki write to check for:
- Mentions of known concept/pattern names that lack wiki links
- Links pointing to non-existent pages (dead links)

See recipe: [[recipes/recipe-kb-lifecycle-hooks]]

---

## Summary Generation

The INGEST workflow generates `wiki/summaries/{slug}.md` automatically for any file in `raw/`. The LLM extracts key claims, code examples, concepts, and Jay-specific insights. Summaries are 300–500 words and follow strict frontmatter schema.

For batch ingestion (e.g., after a research session that produces multiple raw files), [[pattern-fan-out-worker]] pattern applies — see [[patterns/pattern-fan-out-worker]].

Planned enhancement: a scheduled task that detects new files in `raw/` and auto-triggers INGEST. See [[mocs/core-plugins|Core Plugins]] → Periodic Notes for scheduling.

---

## Daily Review Automation

The daily review is triggered by Periodic Notes (see [[mocs/core-plugins]]) and runs a lightweight KB health snapshot:

**Daily (in daily note template):**
- Pull today's priority from [[personal/hermes-operating-context]] (Hermes reads this on session start)
- Log completed sessions to `wiki/log.md`
- Note any new raw sources queued for INGEST

**Weekly:**
- Run LINT workflow (quick version — check orphans, stale frameworks, untested recipes)
- Update [[hot]] if any pattern was referenced 3+ times this week
- Review `knowledge-systems/research-engine/knowledge/open-questions.md` — pick 1 to close

**Monthly:**
- Full LINT workflow → output to `wiki/syntheses/lint-{YYYY-MM-DD}.md`
- Check wiki growth (pages added, links added, orphan count)
- Prune `wiki/hot.md` if over 500 words

See [[mocs/maintenance|Maintenance MoC]] for the full health check protocol.

---

## Vault Maintenance Scripts

**LINT Workflow** (defined in [[CLAUDE.md]]):
1. Read `wiki/index.md` for all page paths
2. Check orphan pages (no inbound links)
3. Check missing cross-links (concept mentioned but not linked)
4. Check stale framework pages (`last_checked` > 60 days)
5. Check low-confidence claims for web verification
6. Check untested recipes older than 30 days
7. Identify gap candidates (concepts referenced but no concept page)
8. Output report to `wiki/syntheses/lint-{date}.md`

**Graphify:** invoked after major ingestion runs. Produces `wiki/syntheses/knowledge-graph-{date}.html` — interactive knowledge graph. See [[summaries/summary-graphify-skill]].

**KB CLI (`My LLM Wiki`):**
```bash
cd /Users/jaywest/My\ LLM\ Wiki && npm run query "your question"
```
Packages: CLI (`packages/cli`), [[mcp-ecosystem]] server (`packages/mcp`), core logic (`packages/core`).

---

## Related

- [[mocs/claude-integration|Claude Integration]] — Skill invocation, hooks
- [[mocs/core-plugins|Core Plugins]] — Templater automation
- [[mocs/maintenance|Maintenance & Optimization]] — Health check protocols
- [[recipes/recipe-claude-code-hooks]] — Hook implementation
- [[recipes/recipe-kb-lifecycle-hooks]] — KB-specific hook patterns
