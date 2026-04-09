---
repo_name: "Agentic-KB"
repo_visibility: public
source_type: github
branch: main
commit_sha: a7d8ad0fa13c26cd8b0666fe354f6ee89d890d6a
source_path: docs/RLM_PIPELINE.md
imported_at: "2026-04-09T18:58:37.368Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/Agentic-KB/main/docs/RLM_PIPELINE.md"
---

# RLM: Recursive Layered Memory Pipeline

A 10-stage reference retrieval pipeline inspired by [archivist-oss](https://github.com/NetworkBuild3r/archivist-oss). Not yet fully implemented — this doc maps each stage to **current state** and **P2 target** so we know exactly what to build next.

## Design Principles

1. **Pure similarity is not ranking.** Final score blends relevance, recency, popularity, and confidence.
2. **Every stage is observable.** Each produces a log line with inputs, outputs, and timing.
3. **Budget-aware.** Token budget for the final LLM synthesis is enforced *before* Claude is called, not after.
4. **Fail open.** Any stage can be bypassed; the pipeline degrades gracefully to keyword+graph.

## The 10 Stages

| # | Stage | Current | P2 Target |
|---|---|---|---|
| 1 | **Query normalization** | Raw query → Claude | Lowercase, stem, expand synonyms, detect intent (factual/exploratory/navigational) |
| 2 | **Multi-retriever fanout** | Keyword + graph (hybrid) | Keyword + graph + BM25 + vector (optional) in parallel |
| 3 | **Candidate union** | Dedupe by filePath | Weighted merge: keyword 0.4, graph 0.4, vector 0.2 |
| 4 | **Temporal decay** | ✅ `ranking.ts` — 180d half-life, floor 0.5 | — |
| 5 | **Hotness boost** | ✅ `ranking.ts` — audit.log query hits, 30d window | — |
| 6 | **Confidence weighting** | Partial (graph edge confidence used) | Add frontmatter `confidence: high/med/low` weighting |
| 7 | **Contradiction filter** | Lint runs async | Inline filter: drop pages flagged in `lint-report.md` as contradictory |
| 8 | **Reranking** | Single-pass sort | Cross-encoder rerank of top 50 → top 10 (optional, off by default) |
| 9 | **Token-budget packing** | Naive concat | Pack highest-score pages until `MAX_CONTEXT_TOKENS`, keep headers + first paragraph if budget tight |
| 10 | **LLM synthesis** | ✅ Claude with citations | Add two-model validation (Claude writes, GPT-4o/Gemini validates) |

## Pipeline Diagram

```
┌─────────────────┐
│ 1. Normalize    │  lowercase, stem, detect intent
└────────┬────────┘
         ▼
┌─────────────────┐
│ 2. Fanout       │  keyword ∥ graph ∥ bm25 ∥ vector
└────────┬────────┘
         ▼
┌─────────────────┐
│ 3. Union        │  weighted merge → dedupe by filePath
└────────┬────────┘
         ▼
┌─────────────────┐
│ 4. Decay        │  score × decayFactor(mtime)
└────────┬────────┘
         ▼
┌─────────────────┐
│ 5. Hotness      │  score × hotnessBoost(audit)
└────────┬────────┘
         ▼
┌─────────────────┐
│ 6. Confidence   │  score × frontmatter.confidence
└────────┬────────┘
         ▼
┌─────────────────┐
│ 7. Contradict   │  drop flagged pages
└────────┬────────┘
         ▼
┌─────────────────┐
│ 8. Rerank       │  (optional) cross-encoder top50 → top10
└────────┬────────┘
         ▼
┌─────────────────┐
│ 9. Pack         │  token-budget aware context assembly
└────────┬────────┘
         ▼
┌─────────────────┐
│ 10. Synthesize  │  Claude → (optional) validator model
└─────────────────┘
```

## Implementation Checklist (P2)

- [ ] `web/src/lib/rlm/normalize.ts` — query intent classifier (small Haiku call or regex heuristics)
- [ ] `web/src/lib/rlm/fanout.ts` — runs keyword + graph + (optional) vector in `Promise.all`
- [ ] `web/src/lib/rlm/merge.ts` — weighted union by filePath
- [ ] `web/src/lib/rlm/confidence.ts` — reads frontmatter `confidence` field
- [ ] `web/src/lib/rlm/contradict.ts` — parses `wiki/lint-report.md` for blocklist
- [ ] `web/src/lib/rlm/pack.ts` — token budget packer using tiktoken
- [ ] `web/src/lib/rlm/pipeline.ts` — orchestrator with per-stage timing in audit log
- [ ] `/api/query/route.ts` — swap inline logic for `runPipeline(query, identity)`

## Already in place

- ✅ Stage 4 — `web/src/lib/ranking.ts:decayFactor`
- ✅ Stage 5 — `web/src/lib/ranking.ts:hotnessBoost`
- ✅ Stage 2 (partial) — `graph-search.ts` + keyword scanner in `/api/search`
- ✅ Stage 10 — Claude synthesis in `/api/query`
- ✅ Observability — `audit.ts` append-only JSONL

## Observability contract

Every stage logs one JSON line to `logs/pipeline.log`:

```json
{
  "ts": "2026-04-07T14:22:03Z",
  "traceId": "q_abc123",
  "stage": "fanout",
  "durationMs": 42,
  "inputCount": 1,
  "outputCount": 37,
  "meta": { "keywordHits": 12, "graphHits": 28 }
}
```

One query = ten log lines + one `op: query` audit entry. Makes perf regressions obvious.
