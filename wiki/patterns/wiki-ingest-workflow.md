---
id: 01KQ2XFMN2G3ZD22CWB8EJ2XEE
title: "Wiki Ingest Workflow"
type: pattern
tags: [knowledge-base, workflow, patterns, obsidian, knowledge-graphs]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
source: framework-docs/wikiwise-skills/ingest-skill.md
related: [cross-linking-and-orphan-prevention, contradiction-handling-in-knowledge-bases, ingest-pipeline, llm-owned-wiki]
---

# Wiki Ingest Workflow

A structured, ordered workflow for integrating a single raw source into a wiki knowledge base. Each step serves a distinct integration function: preservation, summarisation, propagation, linking, indexing, navigation, and auditing.

## When to Use

Apply this workflow every time a new raw source (article, paper, talk, document) is ingested into the wiki. It ensures the new content is fully integrated — not just saved, but connected, indexed, and auditable.

## Structure

The workflow consists of seven ordered steps:

1. **Save raw** — Write source content to `raw/` with an appropriate subdirectory and slug filename. This preserves the original for future reference.
2. **Create source summary** — Write `wiki/summaries/<slug>.md` with full frontmatter. Captures the 3–5 key ideas from the source.
3. **Propagate claims** — Update or create concept, pattern, and framework pages with new information drawn from the source. This is where knowledge actually enters the graph.
4. **Cross-link aggressively** — Ensure 2–3 existing pages link *to* the new page (not just the new page linking outward). See [Cross-linking and Orphan Prevention](../concepts/cross-linking-and-orphan-prevention.md).
5. **Update index.md** — Register every newly created page in the master index.
6. **Update home.md** — Only if the content is significant enough to surface in top-level navigation (see trigger conditions below).
7. **Append log.md** — Record a timestamped entry with: source, pages created/updated, and any contradictions discovered.

## Example

Ingesting a paper on multi-agent orchestration:
1. Save PDF/text to `raw/papers/multi-agent-orchestration-2024.md`
2. Write `wiki/summaries/summary-multi-agent-orchestration-2024.md`
3. Update `concepts/multi-agent-systems.md` and `patterns/pattern-supervisor-worker.md` with new claims
4. Add a link to the new summary from `concepts/multi-agent-systems.md` and `concepts/agent-loops.md`
5. Add entry to `index.md`
6. Skip `home.md` (not top-5 referenced yet)
7. Append to `log.md`: date, source title, pages touched, no contradictions

## home.md Update Triggers

Update `home.md` only when:
- The new page belongs in a domain hub (add to Map of Content)
- A new pattern or concept is among the top 5 most-referenced in the KB
- The ingest reveals the "Where the KB is heading" section needs updating

## Trade-offs

| Benefit | Cost |
|---|---|
| Full integration — no orphan pages | Takes longer than a simple file dump |
| Contradiction surfacing prevents silent drift | Requires familiarity with existing pages |
| Audit trail via log.md | Adds maintenance overhead |
| Increases link density over time | Step 4 requires scanning existing content |

## Related Patterns

- [Cross-linking and Orphan Prevention](../concepts/cross-linking-and-orphan-prevention.md)
- [Contradiction Handling in Knowledge Bases](../concepts/contradiction-handling-in-knowledge-bases.md)
- [Ingest Pipeline](../concepts/ingest-pipeline.md)
- [LLM-Owned Wiki](../concepts/llm-owned-wiki.md)

## See Also

- [LLM Wiki Compile Pipeline](../concepts/llm-wiki-compile-pipeline.md)
- [LLM Wiki Pattern](../concepts/llm-wiki-pattern.md)
- [Context Management](../concepts/context-management.md)
