---
id: 01KQ2XHJK3XQ0MZJ7HGGS7K999
title: "Ingest-Tweets Skill (Wikiwise)"
type: pattern
tags: [knowledge-base, retrieval, workflow, mcp, automation]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
source: framework-docs/wikiwise-skills/ingest-tweets-skill.md
related: [source-trust-tiers, ingest-pipeline, llm-wiki-compile-pipeline]
---

# Ingest-Tweets Skill (Wikiwise)

A Wikiwise skill for collecting Twitter/X threads or search results as raw source material, then routing them into the standard [ingest pipeline](../concepts/ingest-pipeline.md).

## When to Use

- Tracking practitioner consensus on emerging patterns before formal literature exists
- Identifying who is doing interesting work in an area (leads to better primary sources)
- Capturing early signals before formal papers or blog posts are published

Tweets are **leads, not facts**. Use this skill to discover what to investigate, not to establish claims.

## Structure

### Tools Required

Requires browser automation via the MCP ecosystem — either:
- `mcp__claude-in-chrome__*`
- `mcp__chrome-devtools__*`

### Protocol

1. Navigate to `x.com/search?q=<query>&f=top` — use the **top** results filter, not latest
2. Scroll to collect relevant threads and posts
3. Write ALL collected content into a **single combined file**: `raw/tweets_<topic>_<date>.md`
4. One file per topic session — do **not** create per-tweet files
5. Run the standard INGEST workflow on the combined file

## Example

### Output file format

```markdown
# Tweets: <topic> — <date>

## @<handle> — <date>
<tweet content>
<thread continuation if any>

---

## @<handle> — <date>
...
```

Example filename: `raw/tweets_agent-memory_2026-04-12.md`

## Trade-offs

| Benefit | Cost |
|---|---|
| Fast signal capture on emerging topics | Tier 5 source trust — lowest confidence tier |
| Surfaces practitioners and leads | `top` filter may miss recent or low-engagement posts |
| Consolidates into standard pipeline | Content quality is highly variable |

All claims derived **solely** from tweets must carry `confidence: low` per the [source trust policy](../concepts/source-trust-tiers.md).

## ⚠️ Contradictions

> ⚠️ **Internal tension**: The skill mandates the `top` results filter (not `latest`), which favours high-engagement, already-amplified content. This may systematically exclude the very recent or low-engagement posts that represent the "early signals before formal papers exist" that the skill's use case emphasises. Consider supplementing with a `latest` pass when recency is the primary goal.

## Related Patterns

- [Ingest Pipeline](../concepts/ingest-pipeline.md) — the downstream workflow triggered after tweet collection
- [LLM-Wiki Compile Pipeline](../concepts/llm-wiki-compile-pipeline.md) — how ingested raw content becomes structured wiki pages
- [Source Trust Tiers](../concepts/source-trust-tiers.md) — governs confidence ratings assigned to tweet-derived claims

## See Also

- [LLM-Owned Wiki](../concepts/llm-owned-wiki.md)
- [Context Management](../concepts/context-management.md)
