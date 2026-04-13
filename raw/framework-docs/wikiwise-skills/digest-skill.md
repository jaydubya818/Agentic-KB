# Wikiwise — digest/SKILL.md

Source: https://github.com/TristanH/wikiwise/blob/main/Sources/Wikiwise/Resources/scaffold/skills/digest/SKILL.md
Retrieved: 2026-04-12

---

## Purpose
Dispatch one subagent per 2-3 sources for parallel ingestion. The main thread handles schema + navigation; subagents handle source extraction.

## Main Thread Protocol
1. Read schema + home.md + index.md first — understand current wiki state before dispatching
2. Dispatch one subagent per 2-3 sources
3. Each subagent receives: the source content, current wiki state summary, CLAUDE.md rules
4. Main thread waits for all subagents, then integrates results

## Subagent Deliverable Format (≤300 words)
- **New pages created**: list with paths
- **Existing pages updated**: list with what changed
- **New links added**: list of new cross-links
- **Contradictions found**: any conflicts with existing content
- **Suggested next**: what would make this ingestion richer

## Rules
- No orphans: every new page must link from ≥1 existing page before subagent returns
- Subagents must not modify home.md or index.md — main thread does that
- If a source has no relevant content for the wiki, subagent returns "no changes" — never creates filler pages
