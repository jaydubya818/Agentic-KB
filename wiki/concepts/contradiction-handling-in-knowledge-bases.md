---
id: 01KQ2XFMN4CA6MEQCP3GKTQW32
title: "Contradiction Handling in Knowledge Bases"
type: concept
tags: [knowledge-base, knowledge-graphs, workflow, agents]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
source: framework-docs/wikiwise-skills/ingest-skill.md
related: [wiki-ingest-workflow, cross-linking-and-orphan-prevention, llm-wiki-compile-pipeline, agent-failure-modes]
---

# Contradiction Handling in Knowledge Bases

## Definition

Contradiction handling is the protocol for surfacing conflicts between newly ingested content and existing wiki claims — **without silently overwriting** either side. It treats disagreement as signal worth preserving, not noise to be resolved by whichever write came last.

## Why It Matters

Knowledge bases accumulate content from many sources over time. Sources disagree. Models update. Experiments contradict prior assumptions. If newer content silently overwrites older claims, the KB loses its audit trail and the tension between sources — which is often the most intellectually valuable part — disappears.

Surface the contradiction instead. Future readers (and agents) can then make an informed judgment.

## Protocol

When new content contradicts an existing wiki page:

1. **Inline warning** — Add a blockquote at the point of conflict in the relevant page:
   ```
   > ⚠️ **Contradiction**: [Source A] claims X. [Source B] claims Y. Flagged for review.
   ```
2. **Log entry** — Append a record to `log.md` under a contradictions section:
   - Timestamp
   - Source that introduced the conflict
   - Pages affected
   - Nature of the disagreement
3. **Do not overwrite** — Both claims coexist until a human or deliberate editorial process resolves them.

## Example

A new paper claims that chain-of-thought prompting degrades performance on simple arithmetic tasks. The existing `concepts/chain-of-thought.md` page says CoT consistently improves performance.

Correct handling:
```markdown
> ⚠️ **Contradiction**: "Evaluating CoT at Scale" (2025) reports CoT degrades performance
> on simple arithmetic. [chain-of-thought.md](../concepts/chain-of-thought.md) currently 
> states CoT consistently improves performance. Flagged for review.
```
And a corresponding entry in `log.md`.

## When Contradiction Handling Is Triggered

Contradiction handling may be triggered during **claim propagation** (Step 3 of the [Wiki Ingest Workflow](../patterns/wiki-ingest-workflow.md)) — when updating existing concept, pattern, or framework pages with new information reveals a conflict with existing claims.

## Relationship to Confidence Levels

After flagging a contradiction, consider lowering the `confidence` frontmatter field on the affected page to `low` or `speculative` until the conflict is resolved. This signals downstream readers and agents that the claim is contested.

## See Also

- [Wiki Ingest Workflow](../patterns/wiki-ingest-workflow.md)
- [Cross-linking and Orphan Prevention](../concepts/cross-linking-and-orphan-prevention.md)
- [Agent Failure Modes](../concepts/agent-failure-modes.md)
- [LLM Wiki Compile Pipeline](../concepts/llm-wiki-compile-pipeline.md)
