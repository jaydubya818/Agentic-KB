---
title: Provenance Rules
type: methodology
created: 2026-04-12
---

# Provenance Rules

Every important claim must know where it came from, when it was captured, how confident we are, and what scope it applies to. Without provenance, the knowledge base becomes untrustworthy over time — you can't tell the difference between a verified fact and a half-remembered assumption.

## Required Provenance Fields

Every `finding`, `metric`, and high-stakes `concept` node must include:

```yaml
source: [[wiki/summaries/source-slug]]   # or URL if external
source_tier: 1                           # 1–5, per source-evaluation.md
date_captured: 2026-04-12
date_published: YYYY-MM-DD               # date of original source
confidence: high                         # high | medium | low
scope: global                            # global | project-name | domain-name
last_verified: YYYY-MM-DD
```

## Confidence Calibration

| Level | Meaning | Apply when |
|-------|---------|-----------|
| `high` | Multiple independent Tier-1/2 sources confirm; or Jay has directly validated | Multiple corroborating sources, or personal verification |
| `medium` | Single Tier-1/2 source; or solid reasoning with unvalidated assumptions | One good source, or logical inference from known facts |
| `low` | Tier 3–5 source; speculative; or inferred without direct evidence | Social media, single anecdote, first principles only |

## Scope Annotation

- `global` — applies across all projects and domains
- `[project-name]` — scoped to a specific research project; may not generalize
- `[domain-name]` — scoped to a specific domain (e.g., "fintech", "agentic-systems")

## Temporal Provenance

For claims about market conditions, technology state, or competitive landscape, also add:
```yaml
valid_from: YYYY-MM-DD
valid_to: YYYY-MM-DD     # omit if still believed current
```

This enables finding stale claims during lint passes.

## Inline Provenance for Prose

In prose sections, tag inline claims:
```
RRF with k=60 is the standard default [confidence: high, source: [[concepts/reciprocal-rank-fusion]], 2026-04-12]
```

For low-confidence claims: add `[UNVERIFIED — needs: description of what would verify it]`

## Provenance Decay Rule

A finding's confidence degrades when:
- The source is >180 days old and covers a fast-moving domain
- A newer source contradicts it without resolution
- The scope was project-specific but is being applied globally

Flag decayed provenance with `status: stale` in frontmatter.

## Non-Negotiable

Never assert a claim as `confidence: high` without a Tier-1 or Tier-2 source and a capture date. If you can't source it, mark it `[UNVERIFIED]` and note what would resolve it.
