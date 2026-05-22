---
title: "Pattern: Grounded Generation"
type: pattern
category: evaluation
problem: "LLM outputs that cite retrieved content often hallucinate citations or make claims not supported by the source chunks."
solution: "Anchor every factual claim to a chunk ID at generation time; run a post-generation verification pass that checks each citation using an LLM judge."
tradeoffs:
  - "Adds latency: verification pass runs after generation, typically 500ms-2s per response"
  - "Adds cost: judge calls for each claimed citation"
  - "Requires chunk ID tracking in the retrieval layer"
  - "Catches hallucinated citations that string-matching cannot detect"
tags: [rag-systems, evaluation, tool-use, memory, grounded-generation]
confidence: high
sources:
  - "[[summaries/siagian-agentic-engineer-roadmap-2026]]"
  - "[[syntheses/synthesis-rag-eval-to-llm-judge]]"
created: 2026-05-16
updated: 2026-05-16
reviewed: false
reviewed_date: ""
---

# Pattern: Grounded Generation

Every factual claim must be anchored to a retrieved chunk at generation time and verified by a judge before the response is returned. Without this, LLMs reliably hallucinate citations and fabricate supporting content.

## Problem

[[concepts/rag-systems]] pipelines retrieve relevant chunks and inject them into the model's context, expecting the model to cite them accurately. In practice, models do three things wrong: (1) cite a chunk that doesn't support the claim; (2) make a claim not present in any retrieved chunk; (3) paraphrase a chunk's content in a way that changes its meaning. String-matching cannot detect any of these failures — a citation format check (`[source_1]` is present in the output) proves nothing about whether `source_1` actually supports the claim.

## Solution

Anchor claims to chunk IDs at generation time, then run a post-generation verification pass using an [[concepts/llm-as-judge]] to check each citation.

**Phase 1 — Retrieval with ID injection:**

```python
def retrieve_with_ids(query: str, k: int = 5) -> list[dict]:
    results = vector_store.search(query, k=k)
    return [
        {"chunk_id": r.id, "content": r.text, "source": r.metadata["source"]}
        for r in results
    ]

# Context injection format:
# [CHUNK_001] Retrieved text content here...
# [CHUNK_002] Another retrieved chunk...
```

**Phase 2 — Constrained generation prompt:**

```
System: You are a research assistant. Answer using ONLY the retrieved chunks provided.
For every factual claim, cite the chunk ID inline: "The study found X [CHUNK_001]."
If no retrieved chunk supports a claim, write: "No source available for this claim."
Never cite a chunk ID that does not appear in the context.

Context:
{chunks_with_ids}

Question: {user_query}
```

**Phase 3 — Post-generation verification:**

```python
def verify_citations(
    response: str, 
    chunks: list[dict], 
    judge_model: str = "claude-sonnet-4-5"
) -> VerificationResult:
    cited = extract_citation_ids(response)  # regex: \[CHUNK_\d+\]
    chunk_map = {c["chunk_id"]: c["content"] for c in chunks}
    
    violations = []
    for claim, chunk_id in pair_claims_to_citations(response):
        if chunk_id not in chunk_map:
            violations.append(CitationViolation(type="nonexistent", claim=claim, chunk_id=chunk_id))
            continue
        
        judgment = judge_model.complete(f"""
Does the following chunk support this claim? Answer YES or NO with one sentence of reasoning.

Claim: {claim}
Chunk: {chunk_map[chunk_id]}
""")
        if "NO" in judgment:
            violations.append(CitationViolation(type="unsupported", claim=claim, chunk_id=chunk_id))
    
    return VerificationResult(violations=violations, passed=len(violations) == 0)
```

**Phase 4 — Handle verification failure:**

On verification failure: (a) return the response with flagged claims marked `[UNVERIFIED]`; or (b) regenerate with an explicit constraint listing which chunk IDs may not be cited; or (c) return a refusal with explanation. Choice depends on latency budget and risk tolerance.

## Tradeoffs

| Dimension | Value |
|---|---|
| Hallucination detection | Catches semantic citation failures that string-matching misses |
| Latency | +500ms-2s (one judge call per citation, parallelizable) |
| Cost | +$0.002-0.01 per response (varies by judge model and citation count) |
| Implementation complexity | Moderate: requires chunk ID tracking, citation extraction regex, judge integration |
| Completeness | Catches citation hallucinations; does not catch omissions (claims that should have been cited but weren't) |

## When To Use

- RAG pipelines where incorrect citations have real consequences (legal, medical, financial)
- Any system where users may act on cited sources — the citation must be verifiable by a human
- Enterprise RAG where compliance requires source attribution
- High-stakes agentic tools that report research findings to downstream agents

## When NOT To Use

- Low-stakes generation where hallucination cost is low (e.g., brainstorming, draft generation)
- Real-time systems where verification latency (500ms-2s) is unacceptable — chatbots with <200ms SLOs cannot absorb a verification pass on the critical path
- Systems where all retrieved content is trusted enough that any answer citing retrieved chunks is acceptable
- High-volume pipelines where judge cost exceeds hallucination risk cost

## Real Examples

The [[concepts/rag-systems]] evaluation section describes citation faithfulness as a named eval metric. [[frameworks/framework-deepeval]]'s `FaithfulnessMetric` implements this as a judge-scored metric post-generation — it checks each claim in the response against the retrieved context. This is the same pattern operationalized as an eval metric rather than an inline verification gate.

[[frameworks/framework-inspect-ai]]'s `model_graded_fact` scorer implements the verification judge pattern: it takes a claim and a set of source texts, then returns a score indicating whether the sources support the claim.

## Related Patterns

- [[patterns/pattern-tool-output-validation]] — same verification-after-generation principle applied to tool outputs
- [[patterns/pattern-reflection-loop]] — broader pattern; grounded-generation verification is a specialized reflection step
- [[concepts/hybrid-retrieval]] — retrieval quality directly affects which chunks are available for citation
- [[concepts/metadata-filtering]] — filters what chunks reach the context at all; upstream dependency of grounded generation
