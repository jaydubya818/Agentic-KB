---
title: Open Questions
type: knowledge
updated: 2026-04-12
---

# Open Questions

> Unresolved questions that emerged from research. Feed these into the weekly brief, future research topics, architecture decisions, and product strategy. The compounding value of the research engine lives here.

## Format

```
| Question | Importance | Domain | Source project | Next move |
```

Importance: `high` | `medium` | `low`

---

## Open Questions

| Question | Importance | Domain | Source project | Next move |
|----------|-----------|--------|---------------|-----------|
| What is the empirically optimal RRF k value for this KB? | medium | knowledge systems | KB lint 2026-04-12 | Run ablation when RLM Stages 1–3 are live |
| What is the optimal temporal decay half-life for this KB's use patterns? | medium | knowledge systems | rlm-pipeline annotation | Validate empirically after 3 months of use |
| What does the trust_delta 0.20 threshold actually produce in practice? | medium | knowledge systems | contradiction-policy annotation | Review after first 10 auto-resolutions |
| Is RLM Stage 2 graph traversal worth the implementation cost before the KB has >200 pages? | high | knowledge systems | rlm-pipeline | Decide before starting Stage 2 implementation |
| Which Wikiwise patterns are directly applicable to this KB without Readwise access? | low | knowledge systems | Wikiwise ingest | Review during next ingest session |
