---
title: Freshness Policy
type: policy
version: "2.0.0"
owner: sofie
created: 2026-04-10
updated: 2026-04-10
applies_to: [all-agents]
---

# Freshness Policy

Governs how age of knowledge affects context loading scores and promotion eligibility.
Implemented in `lib/agent-runtime/freshness.mjs`.

---

## Freshness Scoring

Freshness decays exponentially from 1.0 (just written) toward a floor based on class.

```
score = floor + (1.0 - floor) × exp(-ln(2) × age_days / half_life_days)
```

| Class | Half-life | Floor | Stale threshold |
|-------|-----------|-------|-----------------|
| `canonical` | 180 days | 0.40 | 180 days |
| `personal` | 90 days | 0.50 | 90 days |
| `learned` | 60 days | 0.40 | 60 days |
| `session` | 7 days | 0.10 | 7 days |
| `working` | 1 day | 0.00 | 1 day |

**Age** is measured from the `updated` frontmatter field, falling back to file mtime.

---

## Freshness Labels

| Score | Label | Behavior |
|-------|-------|----------|
| ≥ 0.85 | `fresh` | Full weight in promotion scoring |
| 0.65–0.84 | `aging` | Slight reduction; warn in trace |
| 0.40–0.64 | `stale` | Significant score reduction; flag in context trace |
| < 0.40 | `expired` | Excluded from context unless explicitly required; blocks canonical promotion |

---

## Rules

1. **Stale sources are flagged**, not silently included. The context trace records each source's freshness label.
2. **Expired sources do not auto-support canonical promotion.** They require revalidation (a new confirmed source or Jay's explicit approval) before the item can re-enter the promotion queue.
3. **[[pattern-hot-cache]] is exempt.** `wiki/agents/<tier>/<id>/hot.md` is always included regardless of age — it's maintained by the agent, not compiled.
4. **Profile is exempt.** `profile.md` is always loaded as identity; freshness does not apply.
5. **Freshness is recalculated at load time**, not cached. Mtime is checked on every context load.
