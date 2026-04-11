---
title: Contradiction Policy
type: policy
version: "2.0.0"
owner: sofie
created: 2026-04-10
updated: 2026-04-10
applies_to: [all-agents]
---

# Contradiction Policy

Governs how contradictions between candidate knowledge and existing content are
detected, handled, and resolved. Implemented in `lib/agent-runtime/promotion-scorer.mjs`
(contradiction pre-check) and surfaced via the `wiki/system/bus/review/` channel.

---

## What Counts as a Contradiction

A contradiction is detected when a candidate item's key claims conflict with:
1. Existing canonical pages that share concepts or slug-adjacent topics
2. Existing `learned` memory for the same agent
3. Another recently promoted bus item in the same channel
4. A correction event that establishes an opposing norm

**Detection scope** (pragmatic — no embeddings required):
- Title/keyword overlap with hot cache entries
- Direct `related_sources` links on the candidate item
- Pages whose slug appears in the candidate item's body text
- Pages in the same `wiki/` subdirectory with overlapping tags

---

## Contradiction Statuses

| Status | Meaning |
|--------|---------|
| `none` | No contradiction detected |
| `suspected` | Overlap found but ambiguous — human review recommended |
| `confirmed` | Clear conflict with existing content — auto-promotion blocked |
| `resolved` | Previously flagged; resolved by human or supersedes |

---

## Handling Rules

1. **`none`** — proceed with normal promotion scoring.
2. **`suspected`** — promotion score is reduced by 0.10. Item routes to `review` unless score is already below the review floor (then `working-only`).
3. **`confirmed`** — auto-canonical promotion is **blocked**. A review item is created at `wiki/system/bus/review/{id}.md` with both the candidate and the conflicting page referenced. The item stays at `working` or `learned` (not `canonical`) until resolved.
4. **Resolving** — a lead or orchestrator agent (or Jay) can mark the review item as resolved by either: (a) approving the candidate with `supersedes`, (b) rejecting it, or (c) merging both into a new synthesis page.

---

## Contradiction Pre-Check Algorithm

```
1. Extract title and top-5 concept tags from candidate
2. Check wiki/hot.md for matching terms
3. Check wiki/index.md for pages in same subdirectory with overlapping tags
4. For each page listed in candidate.related_sources, read first 10 lines
5. Compare key claims (heuristic: opposite verbs, negations, contradicting numbers)
6. If any match → contradiction_status = 'suspected'
7. If clear semantic inversion found → contradiction_status = 'confirmed'
8. Return { status, conflicting_pages[] }
```

---

## Review Item Format

Review items in `wiki/system/bus/review/` follow the bus item schema plus:

```yaml
---
bus_id: review-{ulid}
channel: review
contradiction_status: confirmed | suspected
candidate_path: wiki/system/bus/discovery/{id}.md
conflicting_pages:
  - wiki/concepts/some-page.md
resolution: null  # set on resolution
resolved_at: null
resolved_by: null
---
```
