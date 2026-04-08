---
id: 01KNNVX2QD2X0CM9HQE1VGFQ3C
title: Few-Shot Prompting
type: concept
tags: [agentic, prompting, few-shot, in-context-learning, demonstrations]
confidence: high
sources:
  - "Brown et al. GPT-3: Language Models are Few-Shot Learners (2020)"
  - "Min et al. Rethinking the Role of Demonstrations for ICL (2022)"
  - "Lu et al. Fantastically Ordered Prompts (2022)"
created: 2026-04-04
updated: 2026-04-04
related:
  - "[[concepts/chain-of-thought]]"
  - "[[concepts/system-prompt-design]]"
  - "[[concepts/self-critique]]"
status: stable
---

## TL;DR

Few-shot prompting provides 2-8 input/output demonstrations before the target task. The model learns the pattern, format, and expected behavior from examples without weight updates. Selection quality (which examples, in what order) matters more than quantity. Beyond ~8 examples, returns diminish and context cost rises.

---

## Definition

Few-shot prompting is an in-context learning technique where a small number of task demonstrations are embedded in the prompt before the target input. The model infers the task pattern from the examples and applies it to the new input without any gradient updates or fine-tuning.

---

## How It Works

### In-Context Learning Mechanism

The model doesn't "learn" in the weight-update sense. Instead, demonstrations shift the probability distribution over outputs by:
1. Establishing the expected output format
2. Demonstrating the reasoning style
3. Narrowing the interpretation of an ambiguous task
4. Showing the acceptable quality bar

Min et al. (2022) showed that the *format* and *output space* of demonstrations matter more than the semantic correctness of the input-output mapping. The model is pattern-matching on structure as much as on content.

### Basic Structure

```
Input: [example 1 input]
Output: [example 1 output]

Input: [example 2 input]
Output: [example 2 output]

Input: [target input]
Output:
```

For chain-of-thought few-shot, include the reasoning:
```
Input: [example 1 input]
Reasoning: [step by step]
Output: [example 1 output]
```

### Demonstration Selection

This is where most practitioners underinvest. Demonstration quality has a larger effect than quantity.

**Similarity-based selection**: Choose examples most semantically similar to the target input. Retrieve from a pool using vector similarity. This is "dynamic few-shot" — the example set changes per query.

```python
def select_demonstrations(query: str, pool: list[Example], k: int = 4) -> list[Example]:
    query_embedding = embed(query)
    pool_embeddings = [embed(ex.input) for ex in pool]
    similarities = cosine_similarity(query_embedding, pool_embeddings)
    top_k_indices = sorted(range(len(pool)), key=lambda i: similarities[i], reverse=True)[:k]
    return [pool[i] for i in top_k_indices]
```

**Diversity-based selection**: Choose examples that cover different aspects of the task space. Prevents the model from over-indexing on one pattern.

**Difficulty-based selection**: Include at least one hard example with complex reasoning. Prevents the model from underestimating task complexity.

**Coverage-based selection**: Ensure examples cover the full range of expected outputs (e.g., if output can be positive/negative/neutral, include examples of each).

### How Many Examples

| Task Type | Recommended | Rationale |
|-----------|-------------|-----------|
| Simple format task | 1-2 | Model gets the format quickly |
| Moderate reasoning | 3-5 | Enough to establish pattern |
| Complex domain task | 5-8 | Need coverage of edge cases |
| Very long examples | 2-3 | Context budget constraint |
| > 8 examples | Rarely justified | Diminishing returns; consider fine-tuning |

### Ordering Effects

Lu et al. (2022) demonstrated that example ordering significantly affects accuracy (up to 30% variance on some tasks). Empirical findings:
- Place the most representative example last (recency effect — it's freshest in attention)
- Avoid placing all hard examples at the beginning
- Don't order by difficulty (easy → hard) — model may learn "these get harder" pattern

For high-stakes applications, test multiple orderings and use majority vote or select the most reliable ordering empirically.

### Format Consistency

Every demonstration must use identical format. Format inconsistency teaches the model that format is flexible — the opposite of what you want:

**Bad (inconsistent)**:
```
Input: text
Answer: result

Question: text
Response: result

input: text
output: result
```

**Good (consistent)**:
```
INPUT: text
OUTPUT: result

INPUT: text
OUTPUT: result
```

---

## When to Use vs Fine-Tuning

| Factor | Few-Shot | Fine-Tuning |
|--------|----------|-------------|
| Data available | < 50 examples | > 100 examples |
| Task frequency | Occasional | High-frequency production |
| Latency requirement | Flexible | Strict (fine-tuning is faster at inference) |
| Task variation | High | Low/stable |
| Cost constraint | Low volume | High volume (fine-tuning amortizes) |
| Time to deploy | Minutes | Days-weeks |

Few-shot is the right default for most agentic tasks. Fine-tuning pays off when: (1) the few-shot context window cost is prohibitive at scale, (2) the task is highly specialized and stable, or (3) latency requires eliminating example tokens from the prompt.

---

## Key Variants

**Static few-shot**: Same examples for every query. Simple, predictable, may not generalize.

**Dynamic few-shot**: Examples retrieved per query from a pool. Better generalization, adds retrieval latency.

**Calibration few-shot**: Examples selected to de-bias the model toward a more balanced output distribution.

**Adversarial few-shot**: Include at least one example where the obvious/lazy answer is wrong. Forces careful reasoning.

---

## When To Use

- Task has a non-obvious format that zero-shot produces inconsistently
- Domain is specialized enough that zero-shot examples may be off-pattern
- [[chain-of-thought]] examples are needed to establish the expected reasoning style
- Output format must be highly controlled (parsing-dependent downstream)

## Risks & Pitfalls

- **Anchoring on examples**: Model copies details from examples (e.g., uses example variable names in target output). Ensure examples don't "leak" domain-specific details into target.
- **Example staleness**: Examples embed assumptions about the world that become outdated. Audit examples periodically.
- **Context budget pressure**: 8 examples × 500 tokens each = 4000 tokens per request. For high-throughput agents, this accumulates.
- **False confidence**: Few-shot examples can give the model false confidence about tasks outside the demonstrated distribution. It generalizes, but generalizes incorrectly.

---

## Related Concepts

- [[concepts/chain-of-thought]] — extending demonstrations with reasoning traces
- [[concepts/system-prompt-design]] — where to place few-shot examples in the prompt
- [[concepts/llm-as-judge]] — using few-shot to calibrate judge behavior

---

## Sources

- Brown et al. "Language Models are Few-Shot Learners" (GPT-3) (2020)
- Min et al. "Rethinking the Role of Demonstrations for In-Context Learning" (2022)
- Lu et al. "Fantastically Ordered Prompts and Where to Find Them" (2022)
