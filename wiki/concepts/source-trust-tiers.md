---
id: 01KQ2XHJK4NA6WMC0F9JAZQHNW
title: "Source Trust Tiers"
type: concept
tags: [knowledge-base, evaluation, retrieval, agents]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: medium
source: framework-docs/wikiwise-skills/ingest-tweets-skill.md
related: [pattern-ingest-tweets-skill, ingest-pipeline, llm-wiki-compile-pipeline]
---

# Source Trust Tiers

## Definition

Wikiwise assigns every ingested source a **trust tier** that governs the `confidence` rating applied to any claim extracted from that source. Tiers run from highest-trust primary sources down to anecdotal social content.

The tier system ensures that downstream wiki pages accurately reflect the epistemic weight of the evidence behind each claim, preventing social chatter from being treated with the same authority as peer-reviewed research.

### Known Tiers

| Tier | Label | Example Sources | Confidence Floor |
|---|---|---|---|
| 1 | Primary / Peer-reviewed | Academic papers, official specs | high |
| … | … | … | … |
| 5 | Social / Anecdotal | Tweets, social posts | low |

> **Note:** Only Tier 5 is explicitly documented in the current source. The full tier table is referenced as a separate governing document (`source trust policy`) not yet compiled into this KB.

## Why It Matters

- **Prevents false confidence**: A claim heard only on Twitter should not appear in a wiki page with the same weight as one from a verified benchmark paper.
- **Guides curation effort**: Low-tier signals are useful as *leads* — they point toward better sources to find and ingest at a higher tier.
- **Automates confidence tagging**: Compile pipelines can apply `confidence: low` mechanically when the source tier is 5, reducing curatorial judgment needed per claim.

## Example

A tweet thread discussing a new prompting technique is ingested via the [ingest-tweets skill](../patterns/pattern-ingest-tweets-skill.md). The extracted claim:

```yaml
claim: "Chain-of-thought prompting improves accuracy by 40% on GSM8K"
confidence: low
source: tweets_prompting_2026-04-12.md
tier: 5
```

The low confidence rating signals a researcher to locate the original paper before promoting the claim to a permanent wiki page.

## Operational Rules (Tier 5)

- Claims from tweets alone → `confidence: low`, no exceptions
- Use tweet content to surface leads and practitioners, not to assert facts
- Once a higher-tier source is found that corroborates the claim, re-ingest that source and update confidence accordingly

## See Also

- [Ingest-Tweets Skill](../patterns/pattern-ingest-tweets-skill.md) — the skill that produces Tier 5 raw files
- [Ingest Pipeline](../concepts/ingest-pipeline.md) — how source trust is applied during processing
- [LLM-Wiki Compile Pipeline](../concepts/llm-wiki-compile-pipeline.md) — downstream compilation that uses confidence ratings
- [Benchmark Design](../concepts/benchmark-design.md) — for understanding what constitutes high-tier evidence
