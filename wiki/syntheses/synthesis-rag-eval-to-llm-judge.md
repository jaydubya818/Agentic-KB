---
title: "Synthesis: Which RAG Evaluation Metrics Decompose into LLM-as-Judge vs. Deterministic Scorers?"
type: synthesis
sources:
  - "[[concepts/rag-systems]]"
  - "[[concepts/llm-as-judge]]"
question: "Which RAG evaluation metrics decompose naturally into LLM-as-Judge tasks vs. deterministic scorers?"
tags: [evaluation, rag-systems, llm-as-judge, agentic, memory]
created: 2026-05-16
updated: 2026-05-16
reviewed: false
reviewed_date: ""
---

# RAG Eval Metrics: Judge vs. Deterministic

The split is clean: retrieval quality metrics are deterministic; generation quality metrics require a judge. Conflating them produces unreliable eval pipelines.

## Argument

[[concepts/rag-systems]] evaluation spans two stages: retrieval (did the system get the right chunks?) and generation (did the model use them correctly?). These stages have fundamentally different measurement requirements.

**Deterministic scorers — retrieval stage:**

| Metric | What It Measures | Why Deterministic |
|---|---|---|
| `recall@k` | Fraction of relevant docs in top-k results | Requires a relevance label set; the score is a ratio |
| `MRR` (Mean Reciprocal Rank) | How high the first relevant result ranks | Pure rank math |
| `nDCG` | Relevance-weighted ranking quality | Graded relevance × positional discount — pure math |
| `chunk hit rate` | Whether the correct chunk was retrieved at all | Binary label check |

These metrics require a ground-truth relevance set (human-labeled or golden-set synthetic). Given that set, computation is arithmetic — no model needed.

**LLM-as-Judge required — generation stage:**

| Metric | What It Measures | Why Judge Required |
|---|---|---|
| Citation faithfulness | Whether each claim is actually supported by cited chunk | Requires reasoning about semantic support, not string matching |
| Grounded generation quality | Whether the full response is supported by retrieved content | Holistic semantic judgment across the full response |
| Hallucination detection | Whether any claim contradicts or extends beyond retrieved chunks | Requires understanding what the chunks do NOT say |
| Answer relevance | Whether the answer addresses the question given the context | Requires pragmatic understanding of the question-answer pair |

**Why citation verification cannot be string-matched:** A claim like "the study found a 23% reduction in latency" is either supported or not by a chunk that says "we observed a 23.1% decrease in response time." String matching fails this. A judge that reads both the claim and the chunk, then reasons about whether one entails the other, handles it correctly. [[frameworks/framework-inspect-ai]]'s `Scorer` primitive is designed for exactly this pattern — it wraps a judge call into a reusable scorer that can be composed into a pipeline.

The practical pipeline architecture is: run deterministic retrieval metrics first (cheap, fast, requires no model calls) to gate retrieval quality; then run judge scorers on generation (expensive, slow, model calls) as a second layer gated by retrieval passing.

## Evidence

DeepEval's `ContextualRecall` uses string-matching internally for retrieval and a judge for generation — this division is reflected in its billing model (retrieval metrics are cheaper to run). Inspect AI's evaluation framework makes the same distinction explicit: `exact_match`, `includes`, and `regex_match` scorers are deterministic; `model_graded_fact` and `model_graded_qa` use a judge.

The [[concepts/llm-as-judge]] literature (Zheng et al., MT-Bench) shows judge accuracy on factual claim verification tasks exceeds human annotators for specific, narrow claims — exactly the citation faithfulness task. For open-ended quality assessment, judges remain noisy.

## Counter-arguments & Gaps

**Judge latency and cost accumulate.** A RAG pipeline that retrieves 10 chunks and generates a response with 5 citations requires 5 judge calls for citation verification plus 1 for overall faithfulness — 6 model calls per evaluation sample. At scale, this is expensive. Some teams substitute deterministic citation-format checking (did the response include a citation ID at all?) as a proxy — valid for pipelines where hallucinated citations are the risk, not missing citations.

**Deterministic proxies are good enough for many use cases.** If the retrieval quality is high and the model is strong, grounded generation failures are rare. Paying for judge evals on every production sample is overkill for low-stakes RAG. A statistical sampling approach (judge 5% of production traffic) often provides sufficient signal at 20× lower cost.

**Judge self-preference bias distorts faithfulness scores.** When the judge LLM is the same model that generated the response, self-preference bias inflates faithfulness scores. Use a different model as judge, or use cross-judge ensembles.

**Recall@k requires a labeled relevance set that most teams don't have.** Without ground-truth labels, teams substitute proxy metrics (BM25 score, embedding similarity) — which are neither deterministic nor accurate indicators of actual retrieval quality.

## Conclusion

Use deterministic scorers for retrieval quality (recall@k, MRR, nDCG) and LLM-as-Judge for generation quality (citation faithfulness, hallucination detection, grounded generation). The boundary is semantic: anything that requires reasoning about whether one text supports, contradicts, or extends another requires a judge. Implement deterministic checks first to gate the pipeline cheaply, then apply judges selectively to generation outputs — not to every token. Re-evaluate judge cost assumptions when model prices drop by 10×.

## Sources

- [[concepts/rag-systems]] — RAG architecture and eval components
- [[concepts/llm-as-judge]] — judge reliability, bias, and use cases
- [[frameworks/framework-deepeval]] — ContextualRecall, citation scoring
- [[frameworks/framework-inspect-ai]] — Scorer primitive and judge composition
