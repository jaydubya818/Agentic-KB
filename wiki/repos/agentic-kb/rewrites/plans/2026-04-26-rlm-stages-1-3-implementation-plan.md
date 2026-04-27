---
title: RLM Stages 1–3 Implementation Plan (Hybrid Search)
type: repo-plan
repo_name: agentic-kb
owner: planning-agent
status: proposed
created: 2026-04-26
updated: 2026-04-26
tags: [plan, rag-systems, memory, hybrid-search, rlm, bm25, vector, graph]
related:
  - [[recipes/recipe-hybrid-search-llm-wiki]]
  - [[concepts/rlm-pipeline]]
  - [[concepts/reciprocal-rank-fusion]]
  - [[patterns/pattern-typed-knowledge-graph]]
  - [[recipes/recipe-kb-lifecycle-hooks]]
---

# RLM Stages 1–3 Implementation Plan (Hybrid Search)

## What problem this solves

The KB has 68 concepts, 61 patterns, 18 frameworks, 14 recipes, 42 summaries, plus MoCs and personal notes — well past the ~150-page mark where flat `index.md` keyword search starts breaking. Three concrete failures emerge at this scale:

1. **Semantic queries miss.** Searching `"how do I prevent agents from forgetting things"` won't surface `concepts/memory-systems` or `patterns/pattern-mistake-log` because the keywords don't overlap.
2. **Graph relationships aren't searchable.** Pages link to each other via `[[wiki-links]]`, but the index can't traverse "find pages adjacent to `pattern-fan-out-worker`."
3. **Keyword search drowns out signal.** A query for `"orchestration"` returns dozens of pages because the term is everywhere; the user wants the canonical concept page first, not every passing mention.

[[recipes/recipe-hybrid-search-llm-wiki]] (already in the vault, not yet implemented) is the documented fix: BM25 + vector + typed graph retrieval, fused with Reciprocal Rank Fusion. This plan operationalizes that recipe — turning a 4-6h prototype into shippable infrastructure with proper scaffolding, lifecycle hooks, and MCP integration.

The plan defers Stages 4–10 of the full [[concepts/rlm-pipeline]] (re-ranking, generation, eval) to a future plan.

## What we should do

Build in five phases. Phases 1–4 implement the recipe's five steps as separate shippable units. Phase 5 wires the result into the existing MCP server so all KB queries automatically use hybrid search.

### Phase 1: BM25 + Vector indexers (parallelizable, foundation)

**Goal:** Two standalone indexers, each runnable from CLI, each producing an artifact on disk.

**Deliverables**

- `scripts/search/build-bm25-index.mjs` — per Step 1 of the recipe
- `scripts/search/build-vector-index.mjs` — per Step 2 of the recipe
- `package.json` scripts: `search:build:bm25`, `search:build:vector`
- `search/.gitignore` — exclude built indexes from git (binary-ish, regeneratable)
- `search/README.md` — what each artifact is, regen frequency, size expectations

**Files likely touched**

- `scripts/search/build-bm25-index.mjs` (new)
- `scripts/search/build-vector-index.mjs` (new)
- `package.json` (add `flexsearch`, `@xenova/transformers`)
- `.gitignore` (exclude `search/bm25-index.json`, `search/vector-index.json`, model cache)

**Acceptance**

- `npm run search:build:bm25` produces `search/bm25-index.json` covering all `wiki/**/*.md` files; rerunning is idempotent
- `npm run search:build:vector` produces `search/vector-index.json` with one embedding per page; first run downloads the ~90MB MiniLM model; subsequent runs reuse the cache
- Both scripts strip frontmatter and wikilinks before indexing (raw markdown noise hurts both retrievers)
- Total runtime under 20 min on a cold cache for the current vault size

**Why first**

These are the cheapest to implement (pure file I/O + library calls), parallelizable (no dependency between them), and produce verifiable artifacts. Once they exist, the rest of the pipeline has something to retrieve from.

### Phase 2: Graph retriever (depends on existing graphify-out)

**Goal:** A pure function that takes query entities, walks the existing graph, returns ranked neighbors.

**Deliverables**

- `scripts/search/graph-retriever.mjs` — per Step 3 of the recipe
- Adapter that detects whether `graphify-out/typed-edges.json` exists (typed) and uses typed traversal if so, otherwise falls back to the flat `graph.json`
- Configuration: max hops (default 2), top-N output (default 50), traversal type filter (default: all)

**Files likely touched**

- `scripts/search/graph-retriever.mjs` (new)
- `tests/search/graph-retriever.test.mjs` (new) — fixture-based tests against a small graph

**Acceptance**

- Function `graphRetrieve(["[[pattern-fan-out-worker]]"], 2, 50)` returns at least the immediate neighbors of `pattern-fan-out-worker` from the live `graphify-out/graph.json`
- Per-node score decreases monotonically with hop distance
- Unit test: inject a fake adjacency list, assert correct ranking
- Optional: when typed edges exist, restrict to `implements | supports | requires` types only — verified via test fixture

**Why second**

Depends on `graphify-out/graph.json` already existing (it does — Graphify skill has been run per the related summaries). No infrastructure to build, just retrieval logic. Sized for ~1h.

### Phase 3: RRF fusion + query entrypoint

**Goal:** A single function `hybridSearch(queryText, topN)` that fuses all three retrievers and returns ranked results.

**Deliverables**

- `scripts/search/rrf.mjs` — per Step 4 of the recipe
- `scripts/search/query.mjs` — per Step 5 of the recipe (the integration point)
- CLI wrapper: `node scripts/search/query.mjs "<query>"` prints top 20 results with provenance (which retriever ranked it where)

**Files likely touched**

- `scripts/search/rrf.mjs` (new)
- `scripts/search/query.mjs` (new)
- `tests/search/rrf.test.mjs` (new)
- `tests/search/query.test.mjs` (new) — end-to-end test against the real indexes

**Acceptance**

- All three of the recipe's verification queries pass:
  - `"multi-agent orchestration patterns"` → top results are pattern pages, not just keyword-rich pages
  - `"how do I prevent agents from forgetting things"` → memory-related pages surface despite no keyword overlap
  - `"[[pattern-fan-out-worker]] risks"` → returns the pattern AND its graph neighbors (failure modes, context isolation)
- CLI output shows per-result source signal (BM25 rank #N, Vector rank #M, Graph score X) for debuggability
- All three retrievers capped at the same N=50 before fusion to prevent BM25 drowning out smaller graph/vector signals

**Why third**

This is the integration layer. Phases 1–2 produce three independent ranked lists; this phase merges them into one ranked output. The complexity is the fusion algorithm (well-defined per [[concepts/reciprocal-rank-fusion]]) plus integration plumbing.

### Phase 4: Lifecycle hooks (keep indexes fresh)

**Goal:** Indexes don't go stale. When wiki files change, the relevant index updates without a full rebuild.

**Deliverables**

- Per [[recipes/recipe-kb-lifecycle-hooks]] — extend the existing lifecycle infrastructure
- Trigger on file write/delete in `wiki/**/*.md`: rebuild BM25 (cheap, <5s), schedule vector rebuild for nightly cron (expensive)
- Optional: incremental vector update — embed only the changed file, update `vector-index.json` in-place
- Documentation on regen cadence and triggers

**Files likely touched**

- `scripts/search/index-watcher.mjs` (new) or extend existing watcher
- `scripts/search/incremental-vector.mjs` (optional, if scoping permits)
- `wiki/recipes/recipe-kb-lifecycle-hooks.md` (cross-link the new hook)

**Acceptance**

- Editing `wiki/concepts/agent-loops.md` triggers a BM25 rebuild within 10s
- Vector rebuild documented as nightly cron, not real-time
- Index staleness check: `query.mjs` warns if `bm25-index.json` mtime is older than the most recent `wiki/**/*.md` mtime

**Why fourth**

Without this, the indexes ship as a one-time snapshot that decays. The recipe leaves freshness as an exercise; this phase closes that gap. Sized for ~1h once Phases 1–3 are stable.

### Phase 5: MCP integration

**Goal:** All KB queries via MCP automatically use hybrid search. No CLI bypass.

**Deliverables**

- New MCP tool: `mcp__agentic-kb__hybrid_search` (or replace existing `search_wiki` to call hybrid by default)
- Update tool descriptions so agents know to use it for fuzzy/semantic queries
- Optional: add `search_mode` parameter (`bm25` | `vector` | `graph` | `hybrid`) for debugging — default `hybrid`
- Update `wiki/repos/agentic-kb/repo-docs/README.md` with the new tool

**Files likely touched**

- `mcp/server.js` (new tool registration or wire existing tool to hybrid query)
- `wiki/repos/agentic-kb/repo-docs/README.md`
- `wiki/recipes/recipe-hybrid-search-llm-wiki.md` (mark `tested: true` in frontmatter, link to this plan)

**Acceptance**

- Calling `mcp__agentic-kb__search_wiki` (or new tool) returns hybrid-ranked results, not flat index.md grep
- Result payload includes provenance fields (which retriever contributed each result)
- Recipe's `tested: false` frontmatter flips to `true`

**Why fifth**

Most agents (Hermes, planning-agent, gsd-executor) reach the KB through MCP, not the CLI. This phase makes hybrid the default for everyone. Done last because it depends on Phases 1–4 being stable.

## Why this approach

The recipe already specifies an end-to-end implementation. This plan adds:

1. **Shippable units.** Each phase produces a verifiable artifact. You can stop after Phase 1 and have a usable BM25 index, or after Phase 3 and have hybrid search via CLI.
2. **Test coverage.** The recipe is prototype-grade (`tested: false` in frontmatter). Each phase here lists explicit acceptance tests.
3. **Lifecycle.** The recipe doesn't address index staleness; Phase 4 closes that gap.
4. **Integration.** The recipe ends at a CLI query entrypoint; Phase 5 wires it into the MCP path so all agents benefit, not just CLI users.

The plan deliberately defers RLM Stages 4–10 (re-ranking, generation, eval). That's a future plan once Stages 1–3 are stable and we have query telemetry to learn from.

## Tradeoffs and risks

- **Vector index rebuild cost.** ~5–15 min full rebuild. Phase 4 mitigates with incremental updates and cron scheduling, but the first-run cost is unavoidable.
- **Model download** (~90MB for MiniLM-L6-v2). One-time per machine; cache reuse handles repeat runs. If this is a problem for CI, swap for a hosted embeddings API (Jina, Voyage) — listed in the recipe's "Next Steps."
- **Graph retriever quality depends on `graphify-out/graph.json` quality.** If the graph has gaps, neighbors won't surface. Mitigation: the BM25 + vector retrievers don't depend on graph quality, so partial degradation only.
- **RRF fusion can drown small signals.** Phase 3 caps each retriever at N=50 before fusion specifically to prevent this. If results still look BM25-dominated, lower the cap or add weights to RRF (per the [[concepts/reciprocal-rank-fusion]] page).
- **No re-ranker.** Stages 4–10 of the RLM pipeline include a re-ranker that improves precision. Without it, hybrid output is "broadly relevant" but not "precisely ranked." Acceptable for V1; flag if Stage 4 becomes the actual bottleneck.

## Acceptance criteria

We should consider RLM Stages 1–3 done when all of the following are true:

1. `npm run search:build:bm25` and `npm run search:build:vector` both produce valid indexes from the current wiki
2. `node scripts/search/query.mjs "<query>"` returns ranked results with per-retriever provenance, passing the three verification queries from the recipe
3. The MCP tool `mcp__agentic-kb__search_wiki` (or its successor) uses hybrid search by default
4. `wiki/recipes/recipe-hybrid-search-llm-wiki.md` frontmatter `tested: true`
5. Lifecycle hook keeps BM25 fresh on every file change; vector rebuild scheduled
6. Tests cover: BM25 index roundtrip, vector cosine similarity, graph traversal, RRF fusion ordering, end-to-end hybrid query

## Recommended rollout

**Day 1 (~3h):** Phase 1 (both indexers in parallel) + Phase 2 (graph retriever)
**Day 2 (~3h):** Phase 3 (RRF + query entrypoint) — stop here for usable CLI hybrid search
**Day 3 (~2h):** Phase 4 (lifecycle hooks) + Phase 5 (MCP integration)

Total: ~8h work across 3 sessions. The recipe's 4-6h estimate covers Phases 1–3 only; this plan adds Phases 4–5 for production-readiness.

## Next step

Start Phase 1 by running `npm install flexsearch @xenova/transformers --save` and creating `scripts/search/build-bm25-index.mjs` per Step 1 of the recipe. Validate against the vault before moving to Phase 2.

Reason: BM25 is the cheapest, fastest-to-validate retriever. Confirms the toolchain works (Node, FlexSearch, file walking) before committing to the heavier vector pipeline.

## Open questions for Jay

1. **Hosted vs local embeddings?** Local (MiniLM via @xenova/transformers, ~90MB download, free) vs hosted (Jina/Voyage API, faster builds, monthly cost). Default in this plan: local. Flip to hosted if the rebuild cost becomes a problem.
2. **Replace `search_wiki` or add a new tool?** Default in this plan: replace, so all callers benefit by default. Alternative: add `hybrid_search` and leave the old tool for back-compat.
3. **Stop after Phase 3?** Phases 4–5 are valuable but optional. CLI hybrid search is usable as soon as Phase 3 ships.
