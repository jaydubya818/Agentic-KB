# LLM Wiki v2 Integration Plan
> Created: 2026-04-12 | Status: Draft — awaiting Jay approval before execution

---

## Source
Social post describing "LLM Wiki v2" — an extension of Karpathy's original LLM Wiki pattern adding confidence scoring, memory tiers, knowledge graphs, hybrid search, automated hooks, forgetting curves, and AI-driven contradiction resolution. Built on lessons from the `agentmemory` library.

---

## Gap Analysis: v2 Features vs. Existing KB Coverage

| v2 Feature | KB Status | Notes |
|---|---|---|
| **Confidence scoring** | ✅ Covered | `source-trust-policy.md` has trust formula (class_weight × confidence_multiplier × verification_bonus). `promotion-rules.md` scores at page level. |
| **Memory tiers** | ✅ Covered | 8 typed classes (profile, canonical, hot, learned, personal, session, working, bus) with half-lives and promotion rules. More sophisticated than v2's 4 tiers. |
| **Forgetting curves** | ✅ Covered | `freshness-policy.md` implements exponential decay with class-specific half-lives and floor scores. Labels: fresh / aging / stale / expired. |
| **Knowledge graph** | ⚠️ Partial | Graphify exists (222 nodes, 299 links). But current graph tracks **wiki links**, not **typed semantic relationships** ("A caused B, confidence 0.9"). Typed relationship schema is missing. |
| **Hybrid search** | ⚠️ Partial | RLM pipeline Stage 2 calls for BM25 + vector + graph + keyword fanout. But **Stages 1–3 are not yet live** (only stages 4–9 are). The retrieval layer (query normalization, multi-retriever fanout, dedup) is planned but unimplemented. |
| **Automated hooks** | ⚠️ Partial | raw-file-watcher exists. But session-end compression, scheduled decay runs, and scheduled lint are not formalized. |
| **AI contradiction resolution** | ⚠️ Gap | `contradiction-policy.md` detects and flags, routes to human review (`wiki/system/bus/review/`). v2 auto-resolves using source recency + authority + evidence. Auto-resolution logic does not exist. |
| **Per-claim confidence** | ❌ Gap | Trust/confidence is tracked at **page level**. v2 tracks it at **claim/fact level** ("this specific assertion has confidence 0.9 from 3 sources"). No per-claim annotation standard exists. |
| **Reciprocal Rank Fusion** | ❌ Gap | RRF is not mentioned in RLM pipeline. It's the specific fusion algorithm v2 uses to merge BM25 + vector + graph results. Worth documenting as a pattern. |

**Summary:** ~40% already covered at production quality. ~30% partially covered with known gaps. ~30% genuinely missing.

---

## What NOT to Do

Do not rebuild what already works. The existing KB's memory system (8 classes, freshness decay, trust scoring, promotion rules) is **already more sophisticated than v2's tier model**. The temptation is to refactor the whole KB around v2's framing — resist this.

---

## Recommended Actions (Prioritized)

### Priority 1 — Document the Gaps as Knowledge (High Value, Low Effort)

These are concepts the KB should know about regardless of whether they're implemented.

**1A. Create summary page for LLM Wiki v2**
- Path: `wiki/summaries/summary-llm-wiki-v2.md`
- Content: Map v2 features, note what's already in KB, note genuine gaps
- Cross-link to: `rlm-pipeline`, `freshness-policy`, `contradiction-policy`, Graphify
- Note: Source is a social post — confidence `medium` until primary source (agentmemory repo) is ingested

**1B. Create pattern: per-claim confidence annotation**
- Path: `wiki/patterns/pattern-per-claim-confidence.md`
- The gap: current confidence is page-level. v2 advocates claim-level annotation ("this sentence confidence: 0.85, sources: 3")
- Implementation sketch: frontmatter `claims` array with `text`, `confidence`, `sources`, `last_verified`
- Tradeoff: significant authoring overhead vs. precision benefit; only worth it for canonical pages with high-stakes claims
- Cross-link to: `source-trust-policy`, `promotion-rules`

**1C. Create pattern: typed knowledge graph relationships**
- Path: `wiki/patterns/pattern-typed-knowledge-graph.md`
- The gap: Graphify tracks link existence, not relationship type or direction semantics
- Schema: `{ from: entity, to: entity, type: "caused|enabled|contradicts|supports|implements", confidence: float, sources: [] }`
- This is what makes graph traversal find connections keyword search misses
- Cross-link to: Graphify skill summary, `vault-architecture`, `rlm-pipeline`

**1D. Create concept: reciprocal rank fusion**
- Path: `wiki/concepts/reciprocal-rank-fusion.md`
- Simple concept: merge ranked lists from multiple retrievers using `score = Σ 1/(k + rank_i)`. Avoids score normalization across incompatible score spaces.
- Why it matters: the correct fusion algorithm for hybrid search (BM25 scores are not comparable to cosine similarity scores)
- Cross-link to: `rlm-pipeline`, `rag-systems`

---

### Priority 2 — Close the Automation Gap (Medium Value, Medium Effort)

**2A. Recipe: Automated KB lifecycle hooks**
- Path: `wiki/recipes/recipe-kb-lifecycle-hooks.md`
- Cover three hook types:
  - **Ingest hook** — on new file in raw/: auto-trigger INGEST workflow
  - **Session-end hook** — on session close: compress working memory → session class, update daily log
  - **Scheduled hooks** — cron: run LINT weekly, run freshness decay scoring monthly, consolidate stale learned→archive
- The raw-file-watcher already exists; this recipe formalizes all three hook types and documents how to wire them
- Difficulty: intermediate | Time: 2–3h

**2B. Update `contradiction-policy.md` — add auto-resolution section**
- Current policy routes all contradictions to human review
- Add a new section: **Tier 1 Auto-Resolution** — cases where AI can resolve without human:
  - Same claim, newer source wins if `trust_delta > 0.2` and recency is clear
  - Same claim, source with higher canonical class wins
  - Claim vs. claim where one has 3+ independent sources and the other has 1
- Add: Tier 2 (ambiguous) still routes to human review
- This is a policy update, not a new page — edit existing `wiki/system/policies/contradiction-policy.md`

---

### Priority 3 — Complete the RLM Pipeline (High Value, High Effort — Separate Project)

The v2 hybrid search (BM25 + vector + graph + RRF) maps directly to RLM Pipeline Stages 1–3, which are not yet live. This is the biggest real gap — and the biggest effort.

**3A. Update `rlm-pipeline.md` — document Stage 1–3 implementation plan**
- Stage 1 (query normalization): intent detection, entity extraction, query expansion
- Stage 2 (multi-retriever fanout): BM25 keyword, vector embedding, graph traversal — parallel calls, union results
- Stage 3 (dedup + RRF fusion): canonical entity merging, reciprocal rank fusion score
- Add implementation notes: what library handles each (BM25 → fuse.js or lunr.js; vector → local embeddings or Jina; graph → existing graphify-out/graph.json)
- Flag Stages 1–3 as P1 (was P2) given v2 validation

**3B. Create recipe: hybrid search for LLM wiki**
- Path: `wiki/recipes/recipe-hybrid-search-llm-wiki.md`
- Step-by-step implementation of BM25 + vector + RRF on a markdown wiki
- Prerequisites: wiki > 100 pages (index.md starts to break), Node.js, graph.json from Graphify
- Difficulty: advanced | Time: 4–6h
- Note: Only execute when wiki exceeds ~150 pages and search latency becomes noticeable

---

### Priority 4 — Ingest the Primary Source

The post references `agentmemory` — a specific library. Before executing Priority 1C or 3B, ingest the actual source.

**4A. Ingest agentmemory repo**
- Action: Fetch https://github.com/agentmemory (or the correct URL once identified)
- Create: `raw/framework-docs/agentmemory.md`
- Run INGEST workflow
- This may surface additional patterns not in the social post summary

---

## What to Skip

| v2 Claim | Verdict |
|---|---|
| "Memory tiers" as novel | Skip — KB's 8-class system is more complete |
| Forgetting curves | Skip — `freshness-policy.md` already implements this |
| Confidence scoring (page-level) | Skip — `source-trust-policy.md` covers it |
| "Replaces index.md" via hybrid search | Defer to Priority 3 — only needed past ~150 pages |

---

## Execution Order

```
Week 1 (now):
  1A → Create v2 summary page
  1B → per-claim confidence pattern
  1C → typed knowledge graph pattern
  1D → reciprocal rank fusion concept

Week 2:
  4A → Ingest agentmemory repo (primary source)
  2B → Update contradiction-policy.md with auto-resolution tiers
  2A → Recipe: KB lifecycle hooks

When wiki > 150 pages:
  3A → Update rlm-pipeline.md Stages 1-3
  3B → Recipe: hybrid search implementation
```

---

## Files to Create

| File | Type | Priority |
|------|------|----------|
| `wiki/summaries/summary-llm-wiki-v2.md` | summary | P1 |
| `wiki/patterns/pattern-per-claim-confidence.md` | pattern | P1 |
| `wiki/patterns/pattern-typed-knowledge-graph.md` | pattern | P1 |
| `wiki/concepts/reciprocal-rank-fusion.md` | concept | P1 |
| `wiki/recipes/recipe-kb-lifecycle-hooks.md` | recipe | P2 |
| `wiki/recipes/recipe-hybrid-search-llm-wiki.md` | recipe | P3 |
| `raw/framework-docs/agentmemory.md` (after fetch) | raw stub | P1 |

## Files to Update

| File | Change | Priority |
|------|--------|----------|
| `wiki/system/policies/contradiction-policy.md` | Add Tier 1 auto-resolution logic | P2 |
| `wiki/concepts/rlm-pipeline.md` | Promote Stages 1–3 to P1, add implementation notes | P3 |
| `wiki/mocs/memory.md` | Add new patterns | on execution |
| `wiki/index.md` | Add new pages | on execution |
| `wiki/log.md` | Append entries | on execution |

---

## Decision Point for Jay

Before executing, confirm:
1. **Per-claim confidence (1B)** — is the overhead worth it for this KB? Suggested approach: only apply to `canonical` pages with high-stakes factual claims, not all pages.
2. **Typed knowledge graph (1C)** — does the Graphify skill need to be updated to emit typed edges? Or document the schema for future use?
3. **Auto-resolution in contradiction-policy (2B)** — comfortable with AI auto-resolving contradictions where trust_delta > 0.2? Or keep human-in-loop for all?
4. **Primary source** — find the `agentmemory` repo URL before Priority 4 execution.
