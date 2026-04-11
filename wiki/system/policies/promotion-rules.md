---
title: Memory Promotion Rules
type: policy
version: "2.0.0"
owner: sofie
created: 2026-04-10
updated: 2026-04-10
applies_to: [all-agents]
---

# Memory Promotion Rules

Governs how candidate knowledge moves from ephemeral → session → working → learned → canonical.
These rules are enforced by `lib/agent-runtime/promotion-scorer.mjs` and `promotion.mjs`.

---

## Rule 1: Nothing Skips Provenance

Every candidate item, correction, and promoted artifact MUST carry:
- `created_by` (agent_id)
- `created_at` (ISO timestamp)
- `confidence` (0.0–1.0 or high/medium/low)
- `sources` (list of wiki links or raw/ paths)

Items missing any of these fields are **rejected** at scoring time, regardless of score.

---

## Rule 2: Classify First

Every item must be labeled before promotion can proceed:

| Class | Description | Persists |
|-------|-------------|----------|
| `ephemeral` | In-context only, not written to disk | No |
| `session` | Written to task log, not promoted | Task duration |
| `working` | In working-memory, candidate for learned | Until task closes |
| `learned` | `wiki/agents/<tier>/<id>/learned/` | Indefinitely |
| `canonical` | `wiki/concepts/`, `wiki/patterns/`, etc. | Indefinitely |

---

## Rule 3: Durable Value Only

Promote to `learned` only if at least one of the following is true:
- The insight recurred in 2+ sessions
- It is backed by trusted canonical wiki content
- Jay/Jarrett explicitly approved it
- It materially improves future retrieval or responses

Otherwise, leave it at `working` or `session`.

---

## Rule 4: Canonical Requires Stronger Gates

Canonical promotion (`wiki/concepts/`, `wiki/patterns/`, etc.) requires ALL of:
- `confidence` ≥ 0.80
- `evidence_count` ≥ 2 independent sources
- No unresolved contradictions
- Evidence is fresh (not stale per freshness policy)
- Valid `target_path` (no collision without `supersedes`)
- Approver tier ≥ `min_approver_tier` on the bus item
- Duplicate title check passing (self-excluded)

---

## Rule 5: Personal Preferences Are Special

Insights about Jay/Jarrett's preferences, habits, or working style:
- Must flow `working → learned` first
- Require explicit approval OR recurrence in 3+ sessions before canonical
- Cannot auto-promote to canonical via the scorer alone
- Review is always required (`review_required_for: personal`)

---

## Rule 6: Contradiction Blocks Auto-Promotion

If the contradiction pre-check detects a conflict with existing canonical or learned content:
- Auto-promotion is blocked regardless of score
- A review item is created in `wiki/system/bus/review/`
- Both the candidate and the conflicting page are preserved with cross-references
- The contradiction must be resolved by a lead or orchestrator agent (or Jay) before re-promotion

---

## Rule 7: Freshness Matters

Stale evidence (older than `stale_after_days` per class) may inform context but:
- Does NOT automatically support canonical promotion without revalidation
- Reduces promotion score via freshness weighting
- Triggers forced review for canonical-target items

Stale thresholds (from sofie.yaml `memory_policy.stale_after_days`):

| Class | Stale after |
|-------|-------------|
| `personal` | 90 days |
| `canonical` | 180 days |
| `learned` | 60 days |
| `session` | 7 days |

---

## Rule 8: Promotions Are Additive and Auditable

Never destructively overwrite canonical content. Instead:
- Use `supersedes` to archive the old file
- Use `merged_from` to trace the origin of merged content
- Snapshot working memory before closing
- All moves are logged in `wiki/log.md`
- Archived items move to `wiki/archive/` and remain readable

---

## Promotion Score Formula

```
score = (
  evidence_score  × 0.25  +   # normalized 0-1 from evidence_count
  confidence      × 0.25  +   # 0.0-1.0 numeric
  freshness_score × 0.20  +   # from freshness.mjs decay curve
  trust_score     × 0.15  +   # from source-trust.mjs
  novelty_score   × 0.10  +   # 1.0=new page, 0.5=extending existing
  explicit_approval × 0.05    # 1.0 if Jay approved, else 0
)
```

Score → Decision mapping:

| Score | Decision |
|-------|----------|
| < 0.30 | `reject` |
| 0.30–0.44 | `working-only` |
| 0.45–0.54 | `review` (route to bus/review/) |
| 0.55–0.74 | `learned` (if no contradiction) |
| ≥ 0.75 | `canonical` (if all hard gates pass) |

Hard overrides (always applied after score):
- Missing provenance → `reject`
- Contradiction detected → `review` (never auto-canonical)
- `personal` category → max `review` until explicit approval
- Stale evidence + canonical target → `review`
