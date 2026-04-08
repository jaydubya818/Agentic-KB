---
id: 01KNNVX2QC85MCZ8D77YSPZPKS
title: Chain of Thought
type: concept
tags: [agentic, reasoning, cot, extended-thinking, scratchpad, prompting]
confidence: high
sources:
  - "Wei et al. Chain-of-Thought Prompting Elicits Reasoning in Large Language Models (2022)"
  - "Kojima et al. Large Language Models are Zero-Shot Reasoners (2022)"
  - "Anthropic: Extended Thinking documentation (2025)"
created: 2026-04-04
updated: 2026-04-04
related:
  - "[[concepts/few-shot-prompting]]"
  - "[[concepts/agent-loops]]"
  - "[[concepts/self-critique]]"
  - "[[concepts/system-prompt-design]]"
status: stable
---

## TL;DR

Chain-of-thought prompting elicits step-by-step reasoning from LLMs before producing final answers. It consistently improves accuracy on multi-step reasoning tasks. The tradeoff is token cost and latency. Extended thinking (Claude's native CoT) runs reasoning in a separate block invisible to users but available to the model. Use CoT when reasoning steps matter; skip it for lookup or simple generation tasks.

---

## Definition

Chain-of-thought (CoT) is a prompting technique that encourages an LLM to produce intermediate reasoning steps before arriving at a final answer. Rather than jumping directly to output, the model "thinks out loud," which both improves accuracy and makes reasoning inspectable.

---

## How It Works

### Zero-Shot CoT

Append "Let's think step by step." (or equivalent) to the prompt. Discovered by Kojima et al. (2022). Requires no examples — the phrase alone triggers structured reasoning in capable models.

```python
prompt = f"""{question}

Let's think step by step."""
```

Effective for: arithmetic, logical reasoning, multi-step planning.
Less effective for: factual lookup, simple classification, formatting tasks.

### Few-Shot CoT

Provide 2-8 demonstrations of (question + reasoning trace + answer) before the target question. The model follows the demonstrated pattern.

```
Q: If a train leaves Chicago at 9am going 60mph toward Denver (1000 miles),
   and another leaves Denver at 10am going 80mph toward Chicago, when do they meet?

A: Let's work through this:
   - Train 1 travels at 60mph, Train 2 at 80mph, combined closing speed = 140mph
   - At 10am (when Train 2 starts), Train 1 has been traveling 1hr → covered 60 miles
   - Remaining gap at 10am: 1000 - 60 = 940 miles
   - Time to close 940 miles at 140mph: 940/140 ≈ 6.71 hours
   - Meeting time: 10am + 6.71 hours ≈ 4:43pm

Answer: They meet at approximately 4:43pm.

Q: [target question]
A: Let's work through this:
```

Few-shot CoT outperforms zero-shot CoT for complex, domain-specific problems where the reasoning pattern isn't obvious. The demonstrations show the model what "good reasoning" looks like in this domain.

### Extended Thinking (Claude)

Claude's native implementation of internal CoT. The model reasons in a separate `thinking` block before producing its response. Key properties:

- Thinking tokens are not billed at the same rate as output (currently cheaper)
- Thinking content is returned in the API response (`thinking` block type) but can be hidden from users
- The model can use its thinking to plan, explore dead ends, and self-correct before committing
- Configurable thinking budget: `thinking: { type: "enabled", budget_tokens: 10000 }`

```python
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=16000,
    thinking={
        "type": "enabled",
        "budget_tokens": 10000  # max tokens for reasoning
    },
    messages=[{"role": "user", "content": "Design the data model for a multi-tenant SaaS..."}]
)

# Response includes:
# response.content[0].type == "thinking" → reasoning trace
# response.content[1].type == "text" → final answer
```

Extended thinking is particularly valuable for: complex architectural decisions, debugging subtle logical errors, mathematical proofs, and adversarial problem analysis.

### Scratchpads

An explicit reasoning workspace — the model is given permission (and often instruction) to write notes before answering:

```
Before answering, use a <scratchpad> block to:
1. Identify what information you have
2. Identify what information you need
3. Work through the problem step by step
4. Check your answer

Then provide your final answer outside the scratchpad.
```

Scratchpads serve double duty: they improve reasoning quality and provide an audit trail. In agentic systems, writing to an external scratchpad file (rather than inline) allows the reasoning to outlive the context window.

### Structured CoT Formats

For consistent, parseable reasoning:

```
## Analysis
[Problem breakdown]

## Options Considered
1. Option A: [pros/cons]
2. Option B: [pros/cons]

## Decision
[Chosen approach with rationale]

## Implementation Plan
[Steps]
```

Structured CoT enables automated parsing of reasoning steps, not just the final answer. Useful in evaluation pipelines and for generating reasoning traces for fine-tuning.

---

## When CoT Helps vs Hurts

### Helps

- Multi-step arithmetic and logic
- Complex planning and sequencing
- Tasks with multiple competing constraints
- Problems requiring exploration of alternatives
- When you need to audit the reasoning (regulatory, safety)

### Hurts (or adds no value)

- Simple factual lookup ("What is the capital of France?") — CoT adds tokens, no accuracy gain
- Direct format conversion (CSV → JSON) — the reasoning is trivial; just output the answer
- Creative generation — enforcing a reasoning chain can constrain creative flow
- High-throughput, latency-sensitive applications — every CoT token costs time and money
- Tasks where the reasoning trace itself can mislead the model (rare but documented)

### Cost and Latency Impact

CoT tokens are output tokens — they're expensive and slow. A 5x improvement in reasoning accuracy might come with 5x the tokens. Budget accordingly:

```python
# Simple task: skip CoT
simple_response = client.messages.create(
    model="claude-haiku-4-5",  # fast + cheap
    max_tokens=500,
    messages=[...]
)

# Complex architectural decision: use extended thinking
complex_response = client.messages.create(
    model="claude-opus-4-6",  # most capable
    max_tokens=16000,
    thinking={"type": "enabled", "budget_tokens": 8000},
    messages=[...]
)
```

---

## Key Variants

| Variant | Mechanism | Best For |
|---------|-----------|----------|
| Zero-shot CoT | "Think step by step" | General reasoning, no examples available |
| Few-shot CoT | Demonstrations + target | Domain-specific reasoning |
| Extended thinking | Native thinking block | Complex decisions, self-correction |
| Scratchpad | Explicit workspace | Long reasoning, auditable traces |
| Tree of Thoughts | Branch + prune reasoning | Search-like problems, optimization |
| Self-consistency | Sample N CoTs, majority vote | Reducing variance on high-stakes decisions |

---

## Risks & Pitfalls

- **Confident wrong reasoning**: The model produces a plausible-sounding but incorrect reasoning chain and then a wrong answer. CoT doesn't guarantee correctness; it just makes errors visible.
- **Reasoning-answer mismatch**: The model writes correct reasoning but then gives an answer inconsistent with it. Rare but happens on very long chains. Check both reasoning and answer.
- **Token budget blow-out**: Uncapped extended thinking can consume the entire context budget on a single turn. Set explicit budgets.
- **Sycophantic reasoning**: If few-shot examples always reach a particular conclusion, the model may bend its reasoning toward that conclusion. Vary examples.

---

## Related Concepts

- [[concepts/few-shot-prompting]] — providing examples to guide CoT
- [[concepts/agent-loops]] — CoT within the reasoning step of each loop iteration
- [[concepts/self-critique]] — using CoT to critique and revise output
- [[concepts/cost-optimization]] — balancing CoT quality gain against token cost

---

## Sources

- Wei et al. "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models" (2022)
- Kojima et al. "Large Language Models are Zero-Shot Reasoners" (2022)
- Anthropic Extended Thinking documentation (2025)
- Yao et al. "Tree of Thoughts" (2023)
