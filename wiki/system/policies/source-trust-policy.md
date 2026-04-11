---
title: Source Trust Policy
type: policy
version: "2.0.0"
owner: sofie
created: 2026-04-10
updated: 2026-04-10
applies_to: [all-agents]
---

# Source Trust Policy

Governs how source class, confidence, and verification status contribute to
a trust score used in context ranking and promotion scoring.
Implemented in `lib/agent-runtime/source-trust.mjs`.

---

## Trust Score Formula

```
trust = class_weight × confidence_multiplier × verification_bonus
```

**Class weights** (from sofie.yaml `governance_policy.source_trust_weights`):

| Memory class | Weight |
|-------------|--------|
| `profile` | 1.00 |
| `canonical` | 0.95 |
| `hot` | 0.90 |
| `learned` | 0.80 |
| `session` | 0.50 |
| `working` | 0.40 |
| `bus` | 0.35 |
| `unknown` | 0.30 |

**Confidence multipliers** (from frontmatter `confidence:` field):

| Frontmatter value | Multiplier |
|------------------|------------|
| `high` | 1.00 |
| `medium` | 0.75 |
| `low` | 0.50 |
| `unverified` or missing | 0.30 |

**Verification bonus:**
- `verified: true` in frontmatter → × 1.10 (capped at 1.0)
- `[UNVERIFIED]` tag present → × 0.80

---

## Trust Labels

| Score | Label | Behavior |
|-------|-------|----------|
| ≥ 0.85 | `trusted` | Full weight; eligible for canonical promotion support |
| 0.65–0.84 | `reliable` | Good weight; can support learned promotion |
| 0.40–0.64 | `uncertain` | Reduced weight; flag in context trace |
| < 0.40 | `unverified` | Minimal weight; cannot support promotion alone |

---

## Rules

1. **No single unverified source can drive canonical promotion.** Multiple `trusted` or `reliable` sources are required.
2. **Bus items have low base trust** (0.35) — they are candidates, not confirmed knowledge. A bus item that has been approved elevates to the target class trust on promotion.
3. **Raw QA sessions** with `verified: true` score as `session` class × `verified` bonus. Without the flag they score as `unknown`.
4. **Personal pages** (`wiki/personal/**`) are treated as `learned` class trust — high for context, but subject to the personal preference promotion rules before canonicalization.
