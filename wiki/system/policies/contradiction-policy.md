---
title: Contradiction Policy
type: policy
version: "2.1.0"
owner: sofie
created: 2026-04-10
updated: 2026-04-12
applies_to: [all-agents]
claims:
  - text: "Confirmed contradictions block auto-canonical promotion until human or agent review"
    confidence: high
    sources: ["[[summaries/summary-llm-wiki-v2]]"]
    last_verified: 2026-04-12
    contradictions: []
  - text: "Detection uses title/keyword overlap + related_sources links + slug-in-body matching"
    confidence: high
    sources: []
    last_verified: 2026-04-12
    contradictions: []
  - text: "Tier 1 auto-resolution triggers when trust_delta ≥ 0.20, candidate has more sources, conflict is non-canonical, and claim is factual"
    confidence: medium
    sources: ["[[summaries/summary-llm-wiki-v2]]"]
    last_verified: 2026-04-12
    contradictions: ["trust_delta threshold of 0.20 is designed, not empirically validated. May be too permissive or too conservative."]
  - text: "Suspected contradictions reduce promotion score by 0.10"
    confidence: medium
    sources: []
    last_verified: 2026-04-12
    contradictions: ["Penalty value is arbitrary — no empirical basis for 0.10 vs other values."]
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
- Title/keyword overlap with [[pattern-hot-cache]] entries
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

---

## Tier 1: Automated Resolution (v2.1)

For a subset of well-defined contradiction cases, the agent can resolve automatically without human review. Automated resolution applies when **all** of the following hold:

| Condition | Threshold |
|-----------|-----------|
| Trust delta between candidate and conflicting page | ≥ 0.20 |
| Candidate has more independent sources | candidate.sources > conflicting.sources |
| No unresolved canonical conflicts exist | conflicting page is `learned` or below, not `canonical` |
| Contradiction type is factual (not architectural) | claim is a version number, date, measurement, or status |

**Resolution actions (Tier 1 — auto):**

- **Candidate wins:** Set `resolution = supersedes`, promote candidate, demote conflicting page to `learned`. Log: `[AUTO-RESOLVED] candidate supersedes {path} — trust_delta={x}, sources {a}>{b}`
- **Conflicting page wins:** Reject candidate, set `contradiction_status = resolved`, log: `[AUTO-REJECTED] conflicting page {path} has higher trust — trust_delta={x}`

```javascript
function attemptAutoResolution(candidate, conflictingPage) {
  const trustDelta = candidate.trust - conflictingPage.trust;
  const moreIndependentSources = candidate.sources > conflictingPage.sources;
  const conflictingIsNotCanonical = conflictingPage.memoryClass !== 'canonical';
  const isFactualClaim = ['version', 'date', 'status', 'measurement']
    .some(t => candidate.claimType === t);

  if (
    Math.abs(trustDelta) >= 0.20 &&
    moreIndependentSources &&
    conflictingIsNotCanonical &&
    isFactualClaim
  ) {
    return trustDelta > 0
      ? { action: 'supersede', winner: 'candidate' }
      : { action: 'reject', winner: 'existing' };
  }
  return { action: 'human-review' };
}
```

**Tier 2 (human review):** All cases not matching Tier 1 conditions — architectural decisions, conflicting canonical pages, cases where trust delta < 0.20, cases involving `personal/` category content — route to `wiki/system/bus/review/` as before.

**Audit trail:** All Tier 1 auto-resolutions are logged in `wiki/log.md` with `[AUTO-RESOLVED]` prefix. Jay can scan these and override any auto-resolution within 7 days.

> Source: Pattern derived from [[llm-wiki]] v2 contradiction resolution approach. See [[summaries/summary-llm-wiki-v2]].
