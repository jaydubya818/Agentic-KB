---
id: 01KQ2XFMN3X40QB42W1J41ER7M
title: "Cross-linking and Orphan Prevention"
type: concept
tags: [knowledge-base, knowledge-graphs, workflow, obsidian]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
source: framework-docs/wikiwise-skills/ingest-skill.md
related: [wiki-ingest-workflow, contradiction-handling-in-knowledge-bases, llm-wiki, ingest-pipeline]
---

# Cross-linking and Orphan Prevention

## Definition

**Cross-linking** is the practice of ensuring that newly created wiki pages receive incoming links from 2–3 existing pages — not just outgoing links to other pages. An **orphan page** is any page with no incoming links, making it effectively invisible to anyone navigating the wiki.

> "The most common ingest failure is creating a page that nobody links to."
> — Wikiwise Ingest Skill

## Why It Matters

A wiki is a graph, not a folder. Pages that exist but are never linked to are practically lost — they won't appear during natural browsing, they won't surface in "related pages" contexts, and they contribute nothing to link density. Over time, orphan accumulation degrades the navigability and cohesion of the knowledge base.

Cross-linking addresses this structurally:
- **Link density** increases, making the graph richer and more traversable
- **Discoverability** improves — new content is reachable from existing entry points
- **Conceptual relationships** become explicit and machine-readable

## Example

After creating a new summary page for a paper on evaluation frameworks:

1. Find `concepts/benchmark-design.md` — add a link to the new summary in its "See Also" section
2. Find `concepts/llm-as-judge.md` — add a contextual inline link where evaluation methods are discussed
3. Find `concepts/agent-observability.md` — add a reference if the paper touches on observability metrics

Now the new page has three incoming links and is fully integrated into the graph.

## The Rule

Before any ingest is considered complete, verify that **at least 2–3 existing pages link to every newly created page**. This is a hard constraint, not a nice-to-have.

## Common Pitfalls

- **New page links out, but nothing links in** — the most frequent failure mode
- **Only linking from the index** — index links don't count as semantic cross-links
- **Linking from pages with low traffic** — prefer linking from high-centrality pages when possible

## See Also

- [Wiki Ingest Workflow](../patterns/wiki-ingest-workflow.md)
- [Contradiction Handling in Knowledge Bases](../concepts/contradiction-handling-in-knowledge-bases.md)
- [LLM-Owned Wiki](../concepts/llm-owned-wiki.md)
- [Knowledge Graphs](../concepts/knowledge-graphs.md)
