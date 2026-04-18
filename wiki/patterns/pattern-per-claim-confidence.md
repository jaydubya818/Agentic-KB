---
title: Per-Claim Confidence
type: pattern
category: memory
problem: Page-level confidence scoring is too coarse — a single page can contain high-confidence architectural decisions alongside low-confidence speculation, but all claims are weighted equally.
solution: Annotate individual claims within a page with their own confidence score, source count, and last-verified date. High-stakes canonical pages get claim-level granularity; routine pages stay page-level.
tradeoffs:
  - pro: LLM synthesis can weight individual claims correctly rather than trusting entire pages
  - pro: Contradictions can be detected at claim level, not just page level
  - pro: Specific claims can decay or be verified independently of the whole page
  - con: Significant authoring and maintenance overhead
  - con: Not worth it for most pages — high-effort, selective application required
tags: [memory, evaluation, context-management, agentic, prompt-engineering]
confidence: medium
sources:
  - [[summaries/summary-llm-wiki-v2]]
created: 2026-04-12
updated: 2026-04-12
related:
  - [[system/policies/source-trust-policy]]
  - [[system/policies/promotion-rules]]
  - [[system/policies/freshness-policy]]
  - [[concepts/rlm-pipeline]]
---

# Pattern: Per-Claim Confidence

## Problem
Page-level confidence scoring assigns a single trust score to all content on a page. This breaks when a page contains:
- High-confidence architectural decisions validated by Jay + multiple sources
- Medium-confidence framework comparisons based on a single blog post
- Low-confidence speculation included for completeness

The LLM query pipeline treats all claims on a `confidence: high` page equally — leading to over-trust of weak claims embedded in otherwise strong pages.

The v2 extension of [[llm-wiki]] identified this as a key gap: "every **fact** carries a score" rather than every *page*.

## Solution
Annotate individual claims in a page frontmatter with a `claims` array. Each entry has:
- `text` — the claim (quoted or paraphrased)
- `confidence` — `high | medium | low`
- `sources` — count of independent supporting sources
- `last_verified` — ISO date
- `contradictions` — count of known contradictions (0 = clean)

```yaml
---
title: LangGraph vs GSD Comparison
type: synthesis
# ... standard frontmatter ...
claims:
  - text: "GSD outperforms LangGraph for single-model orchestration in Claude Code"
    confidence: high
    sources: 3
    last_verified: 2026-03-15
    contradictions: 0
  - text: "LangGraph supports parallel branch execution natively since v0.2"
    confidence: medium
    sources: 1
    last_verified: 2026-02-01
    contradictions: 0
  - text: "LangGraph's overhead is ~40% vs raw Claude Code for simple pipelines"
    confidence: low
    sources: 1
    last_verified: 2026-01-10
    contradictions: 1
---
```

During LLM synthesis (RLM Stage 10), the prompt instructs the model to cite claim-level confidence when drawing on annotated pages:

```
When referencing claims from pages with per-claim annotations,
note the claim's confidence in your response:
  [high confidence, 3 sources] → cite directly
  [medium confidence, 1 source] → note "one source reports..."
  [low confidence] → note "unverified: ..."
```

## When to Apply

**Do apply to:**
- `canonical` pages with high-stakes decisions (architecture, framework selection, production patterns)
- Synthesis pages that mix claims from multiple sources of varying quality
- Any page whose claims you've had to correct or qualify more than once

**Do NOT apply to:**
- Routine summary pages, recipe pages, or concept overview pages
- Pages where all claims share the same confidence level
- First-draft pages — add claim annotations only after a page stabilizes

## Implementation Sketch

### Frontmatter Extension (minimal)
```yaml
claims:
  - text: string       # quoted claim or paraphrase
    confidence: high | medium | low
    sources: int       # count of independent sources
    last_verified: YYYY-MM-DD
    contradictions: int  # 0 = clean
```

### Synthesis Prompt Injection
```
Per-claim confidence annotations found on {n} pages in context.
Weight claims accordingly: high/3+ sources → state directly;
medium/1 source → hedge; low/contradictions present → flag explicitly.
```

### Lint Check Addition
Add to LINT workflow: flag any `canonical` page older than 90 days that lacks `claims` annotations on its key assertions.

## Tradeoffs

| | Pros | Cons |
|--|------|------|
| **Precision** | LLM weighs claims correctly | Authoring overhead per claim |
| **Contradiction detection** | Claim-level conflict flagging | Maintenance burden on page updates |
| **Decay** | Individual claims can be re-verified | Increases frontmatter size |
| **Selectivity** | Only apply to high-stakes pages | Inconsistent coverage across wiki |

## Relationship to Existing Policies
This pattern extends [[system/policies/source-trust-policy]] (which scores at page level) and [[system/policies/promotion-rules]] (which require `confidence` frontmatter at page level). Per-claim confidence is additive — it doesn't replace page-level scoring; it supplements it for high-stakes content.

## Related Patterns
- [[system/policies/source-trust-policy]] — Page-level trust formula this extends
- [[system/policies/freshness-policy]] — Per-claim `last_verified` feeds into freshness scoring
- [[patterns/pattern-episodic-judgment-log]] — Human judgment capture; complements per-claim annotation
- [[concepts/rlm-pipeline]] — Stage 6 (confidence weighting) can use per-claim scores if present
