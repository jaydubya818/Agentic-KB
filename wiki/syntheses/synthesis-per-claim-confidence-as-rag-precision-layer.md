---
title: "Synthesis: Per-Claim Confidence Is the Missing Precision Layer for RAG Retrieval Metrics"
type: synthesis
sources:
  - "[[patterns/pattern-per-claim-confidence]]"
  - "[[concepts/rag-systems]]"
  - "[[summaries/summary-llm-wiki-v2]]"
question: "Why do document-level RAG metrics (recall@k, MRR, nDCG) systematically over-credit retrievers, and what would fix it?"
tags: [evaluation, memory, rag-systems, context-management, agentic]
created: 2026-05-24
updated: 2026-05-24
reviewed: false
reviewed_date: ""
---

# Per-Claim Confidence Is the Missing Precision Layer for RAG Retrieval Metrics

## Question

Why do document-level RAG metrics (recall@k, MRR, nDCG) systematically over-credit retrievers, and what would fix it?

## Argument

Standard RAG evaluation operates at the chunk or document level: a chunk is either "relevant" (counts toward recall@k) or not. This treats a passage containing one high-confidence canonical claim and four speculative asides identically to a passage with four canonical claims and one aside, as long as both are judged "relevant." The `[[patterns/pattern-per-claim-confidence]]` already produces the missing dimension — sentence-level confidence scores — but currently consumes them only at synthesis time. Routing those scores back into the retrieval-scoring layer would weight chunks by the density and quality of claims they contain, replacing binary relevance with a continuous claim-quality signal.

The integration point is clean. `[[concepts/rag-systems]]` lists RRF (reciprocal rank fusion) and re-ranking as composable scoring stages. A per-claim weighted re-ranker fits between the dense+sparse fusion and the LLM input slot — `final_score(chunk) = base_relevance × sum(claim_confidence_i)`. No new infrastructure; just a different ranking function over data the KB is already collecting.

## Evidence

- `[[concepts/rag-systems]]` documents the standard evaluation suite (recall@k, precision@k, MRR, nDCG) operating at chunk granularity.
- `[[patterns/pattern-per-claim-confidence]]` (added 2026-04-12; provenance resolved 2026-06-10 as won't-fix — still single-source, retained at `medium`, not promoted to canonical) produces sentence-level confidence annotations on pages where the pattern is applied.
- `[[summaries/summary-llm-wiki-v2]]` describes the RLM Pipeline using RRF fusion with no claim-quality weighting — meaning the integration point exists but is currently a pass-through.
- The synthesis already on file `[[syntheses/synthesis-rag-eval-to-llm-judge]]` argues that LLM-judge evaluation is the next step beyond classical IR metrics; per-claim weighting is a complementary, cheaper intermediate.

## Counter-arguments & Gaps

The pattern's provenance gap was resolved 2026-06-10 as won't-fix — it remains single-source (`medium`, not canonical), so the caution stands: building eval weight on top of a single-source pattern compounds the trust debt. Before promoting this synthesis to canonical, the underlying pattern still needs an independent corroborating source, or the integration needs to be sketched in a way that degrades gracefully when claim confidence is missing.

Per-claim confidence is also expensive to produce at scale. `[[patterns/pattern-per-claim-confidence]]` itself notes that it's "high-effort, selective application required" — most pages won't carry these annotations. Any retrieval weighting must handle pages without per-claim scores without silently down-ranking them; otherwise the eval system becomes a tax on un-annotated content rather than a precision improvement.

A third gap: claim-level relevance and claim-level *confidence* are not the same thing. A claim can be high-confidence and irrelevant to the query, or low-confidence and exactly the answer. Weighting by confidence alone may improve precision on canonical questions but hurt recall on edge cases where the answer lives in a hedge.

Finally, the work `[[syntheses/synthesis-eval-metrics-to-failure-modes]]` argues that the right next step for RAG eval is *failure-mode coverage* (specific bug classes) rather than metric refinement. If failure-mode eval is the higher-leverage move, per-claim weighting is incremental polish on a soon-to-be-deprecated layer.

## Conclusion

The cleanest first move is a sketch, not an implementation: write a small evaluation harness that compares standard nDCG to claim-weighted nDCG on a fixed query set, where the test corpus has hand-annotated claim confidence. If claim-weighting moves nDCG meaningfully on questions where confidence varies within retrieved chunks, this is worth productionizing. If the deltas are noise, the failure-mode synthesis is the better next investment.

Open question: is there a cheaper claim-confidence signal (e.g., LLM-judge over each sentence at index time, cached) that avoids the high-effort manual annotation `[[patterns/pattern-per-claim-confidence]]` currently requires? That would change the cost calculus entirely.

## Sources

- `[[patterns/pattern-per-claim-confidence]]`
- `[[concepts/rag-systems]]`
- `[[summaries/summary-llm-wiki-v2]]`
- `[[syntheses/synthesis-rag-eval-to-llm-judge]]` (adjacent — argues LLM judge is the next eval step)
- `[[syntheses/synthesis-eval-metrics-to-failure-modes]]` (competing direction)
