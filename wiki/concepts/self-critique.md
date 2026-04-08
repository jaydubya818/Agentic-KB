---
id: 01KNNVX2QJRKRQ55825CAXHACJ
title: Self-Critique
type: concept
tags: [agentic, reflection, self-correction, critique, revision, verification]
confidence: high
sources:
  - "Shinn et al. Reflexion: Language Agents with Verbal Reinforcement Learning (2023)"
  - "Madaan et al. Self-Refine: Iterative Refinement with Self-Feedback (2023)"
  - "Constitutional AI: Bai et al. Anthropic (2022)"
created: 2026-04-04
updated: 2026-04-04
related:
  - "[[concepts/chain-of-thought]]"
  - "[[concepts/agent-loops]]"
  - "[[concepts/llm-as-judge]]"
  - "[[concepts/human-in-the-loop]]"
  - "[[patterns/pattern-reflection-loop]]"
status: stable
---

## TL;DR

Self-critique is the pattern of having an agent evaluate its own output (or having a separate critic agent evaluate it) and then revise based on that critique. It reliably improves output quality on complex tasks at the cost of additional tokens and latency. The key implementation decisions are: who critiques (same model, different model, different temperature), what the critique focuses on, and when to stop.

---

## Definition

Self-critique is a feedback-driven revision pattern where an LLM's output is subjected to structured evaluation — either by the same model in a second pass, by a dedicated critic agent, or by a programmatic checker — and the output is revised based on critique feedback until quality criteria are met.

---

## How It Works

### Basic [[pattern-reflection-loop]]

```
Generate(task) → Critique(output) → Revise(output + critique) → [repeat or accept]
```

The simplest implementation: same model, two sequential calls.

```python
def generate_with_reflection(task: str, max_rounds: int = 3) -> str:
    output = llm.generate(task)

    for _ in range(max_rounds):
        critique = llm.generate(
            f"Review this output for quality, correctness, and completeness:\n\n{output}\n\n"
            f"Identify specific issues. If no issues, respond with 'APPROVED'."
        )
        if "APPROVED" in critique:
            break
        output = llm.generate(
            f"Original task: {task}\n\nPrevious output:\n{output}\n\n"
            f"Critique:\n{critique}\n\nRevise the output to address all critique points."
        )

    return output
```

### Self-Consistency Sampling

Generate N outputs independently (high temperature) and take the majority vote or most representative answer. Effective for tasks with deterministic right answers. Does not require explicit critique — inconsistency across samples signals where the model is uncertain.

```python
def self_consistency(task: str, n: int = 5) -> str:
    outputs = [llm.generate(task, temperature=0.8) for _ in range(n)]
    # For structured outputs: parse and vote
    # For text: cluster by semantic similarity, return centroid of largest cluster
    return majority_vote(outputs)
```

Cost: N × base call cost. Justified when error cost is high (medical, legal, financial).

### Critique-and-Revise (Self-Refine)

Madaan et al.'s Self-Refine uses the same model to generate, critique, and refine iteratively. Key to making this work: the critique prompt must be specific about what to check.

```python
CRITIQUE_PROMPT = """
Review the following code implementation. Check for:
1. Correctness: Does it handle the edge cases (empty input, null values, large inputs)?
2. Type safety: Are all parameters and return types explicitly typed?
3. Error handling: Does it handle and propagate errors properly?
4. Performance: Are there obvious O(n²) operations that could be O(n)?
5. Tests: Are there inline tests or test cases covering the happy path and error cases?

For each issue found, state: [ISSUE] description. If none, state [APPROVED].
"""
```

Generic critiques ("is this good?") produce generic revisions. Specific critiques produce targeted improvements.

### Constitutional AI Self-Critique

[[anthropic]]'s Constitutional AI approach uses a set of principles as the critique framework. The model critiques its own response against each principle, then revises:

```
Critique: Does this response help a potential bad actor? Consider...
Revision: [revised response that addresses the critique]
```

The "constitution" (set of principles) is the system-level specification of what good behavior looks like. This is procedural memory ([[concepts/memory-systems]]) applied to self-evaluation.

### Verification Agents

A dedicated agent focused solely on verification — not generation, not revision, just evaluation. Cleaner separation of concerns than same-model critique.

```python
VERIFIER_AGENT_SYSTEM_PROMPT = """
You are a code reviewer. You do not write or modify code.
Your job: given a specification and an implementation, determine if the implementation meets the spec.

Respond with:
VERDICT: PASS | FAIL
ISSUES: [bulleted list if FAIL, empty if PASS]
CONFIDENCE: HIGH | MEDIUM | LOW
"""
```

Verification agents work best with:
- Clear acceptance criteria (from a spec, test suite, or explicit requirements)
- Tool access to actually run the code, not just read it
- Ability to call external validators (linters, type checkers, test runners)

---

## When Agents Should Challenge Their Own Output

Not always — adding a reflection loop to every output multiplies cost. Use when:

- The task has high stakes (financial decisions, production code, external communications)
- The task involves creative or subjective judgment where first drafts are reliably weak
- The task has checkable properties (code that should run, math that should verify)
- Historical failure rate on this task type justifies the overhead

Skip when:
- Output is format-only (CSV → JSON conversion) — run a linter instead
- Task is lookup with clear ground truth — self-critique can't improve factual accuracy
- Speed matters more than marginal quality improvement
- The model's self-assessment is known to be uncorrelated with actual quality (calibration failure)

---

## Termination Conditions

Bad termination: "loop until the model says it's happy" — models often self-approve too quickly or never approve (oscillating revisions).

Good termination:
1. **Explicit criteria met**: A programmatic check (test suite passes, schema validates)
2. **Critic approves**: Critic outputs "APPROVED" or equivalent
3. **Max iterations reached**: Hard cap (3-5 iterations for most tasks)
4. **Diminishing delta**: The revision changes less than N% from the previous — further iteration won't help

---

## Risks & Pitfalls

- **Self-sycophancy**: The model critiques its own output too leniently because it's "proud" of it. Mitigation: use a separate model instance or higher temperature for the critic.
- **Critique hallucination**: The critic identifies issues that don't exist. Mitigation: require the critic to cite specific locations/lines.
- **Revision regression**: The revision introduces new bugs while fixing old ones. Mitigation: track versions, allow backtracking.
- **Infinite oscillation**: Revisions go back and forth without convergence. Mitigation: hard iteration cap + similarity threshold termination.
- **Cost spiral**: 5 iterations × 3 model calls × 50K tokens = 750K tokens per task. Budget explicitly.

---

## Related Concepts

- [[concepts/llm-as-judge]] — using a separate model as the critic
- [[concepts/agent-loops]] — the loop structure that drives reflection
- [[concepts/chain-of-thought]] — reasoning within each critique pass
- [[patterns/pattern-reflection-loop]] — implementation of critique-revise pattern
- [[concepts/trajectory-evaluation]] — evaluating not just final output but the revision path

---

## Sources

- Shinn et al. "Reflexion: Language Agents with Verbal Reinforcement Learning" (2023)
- Madaan et al. "Self-Refine: Iterative Refinement with Self-Feedback" (2023)
- Bai et al. "Constitutional AI: Harmlessness from AI Feedback" (2022)
