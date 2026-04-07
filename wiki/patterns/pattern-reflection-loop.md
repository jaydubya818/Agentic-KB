---
title: Reflection Loop
type: pattern
category: prompt-engineering
problem: Agent output quality is inconsistent; need self-correction without human review
solution: Agent generates output, a critic reviews it, original agent revises. Loop until passing.
tradeoffs:
  - "Quality improvement vs 2-3× token and latency cost"
  - "Catches real errors vs risk of model sycophancy in self-assessment"
  - "Automated quality gate vs may miss subtle domain errors"
tags: [reflection, critique, revision, self-correction, quality]
confidence: high
sources:
  - "Madaan et al. Self-Refine (2023)"
  - "Shinn et al. Reflexion (2023)"
created: 2026-04-04
updated: 2026-04-04
---

## Problem

LLM output quality is inconsistent — the model produces excellent results on some runs and mediocre ones on others. Human review for every output is impractical. Validation-only approaches (schema check, linter) catch structural errors but miss logical, factual, or completeness errors. You need an automated quality gate that can catch substantive problems.

---

## Solution

After generation, run a focused critic pass that evaluates the output against specific criteria. If the critic finds issues, the original agent revises with the critique as feedback. Repeat until the critic approves or max iterations is reached.

```
Generate → Critique → [APPROVED] → Done
               ↓
           [ISSUES]
               ↓
           Revise → Critique → [APPROVED] → Done
                        ↓
                    [ISSUES]
                        ↓
                    Revise → ... (up to max iterations)
```

---

## Implementation Sketch

```python
from dataclasses import dataclass
from typing import Optional

@dataclass
class CritiqueResult:
    approved: bool
    issues: list[str]
    confidence: str  # HIGH | MEDIUM | LOW
    specific_locations: list[str]  # e.g., ["line 42", "function getUserById"]

CRITIC_PROMPT = """You are a critical reviewer. Your job is to find real problems, not to praise.

Evaluate this {task_type} against these criteria:
{criteria}

Task specification:
{task}

Output to review:
{output}

If all criteria are met, respond: APPROVED

If there are issues, respond with:
ISSUES:
- [ISSUE] <specific problem> at <location>
- [ISSUE] <specific problem> at <location>

Be specific. Vague feedback like "needs improvement" is not acceptable.
State the exact problem and where it is."""

async def reflection_loop(
    task: str,
    task_type: str,
    criteria: list[str],
    generator_system: str,
    max_iterations: int = 3,
) -> tuple[str, int]:
    """
    Returns (final_output, iterations_taken).
    Raises MaxIterationsExceeded if no approval within max_iterations.
    """

    # Initial generation
    output = await generate(task, system=generator_system)

    for iteration in range(max_iterations):
        # Critique
        critique_raw = await llm.call(
            model="claude-sonnet-4-6",  # or different model to reduce self-preference bias
            temperature=0,
            messages=[{
                "role": "user",
                "content": CRITIC_PROMPT.format(
                    task_type=task_type,
                    criteria="\n".join(f"- {c}" for c in criteria),
                    task=task,
                    output=output,
                )
            }]
        )

        critique = parse_critique(critique_raw)

        if critique.approved:
            return output, iteration + 1

        # Revision
        output = await llm.call(
            model=GENERATOR_MODEL,
            messages=[
                {"role": "user", "content": f"Task: {task}"},
                {"role": "assistant", "content": output},
                {"role": "user", "content": f"""Your output has the following issues:

{format_issues(critique.issues)}

Revise your output to fix ALL of these issues. Make targeted changes — don't rewrite everything."""}
            ]
        )

    # Max iterations reached — return best effort with warning
    log_warning(f"Reflection loop hit max iterations for task: {task[:100]}")
    return output, max_iterations

def parse_critique(raw: str) -> CritiqueResult:
    if raw.strip().startswith("APPROVED"):
        return CritiqueResult(approved=True, issues=[], confidence="HIGH", specific_locations=[])

    issues = [
        line.replace("[ISSUE]", "").strip()
        for line in raw.splitlines()
        if line.strip().startswith("[ISSUE]")
    ]
    return CritiqueResult(
        approved=False,
        issues=issues,
        confidence="MEDIUM",
        specific_locations=[]
    )
```

---

## Critic Prompt Design

The critic prompt is the most important element. Bad critics:
- Approve everything ("looks good!")
- Reject everything ("could be improved")
- Give vague feedback ("this isn't quite right")

Good critics:
- Have specific, checkable criteria
- Cite exact locations (file, line, function)
- Distinguish blocking issues from minor suggestions
- Have explicit approval syntax (easy to parse)

**Criteria examples by task type**:

For code review:
```
1. All function parameters have explicit TypeScript types
2. All error paths are handled (no unhandled Promise rejections)
3. No hardcoded values that should be constants or config
4. The implementation handles the edge cases specified in the task
5. Tests cover the happy path and at least 2 error cases
```

For written content:
```
1. All claims are supported by evidence or marked as assumptions
2. No jargon used without definition
3. The conclusion directly answers the original question
4. Length is appropriate — no padding, no omissions
```

---

## Termination Conditions

| Condition | Action |
|-----------|--------|
| Critic says APPROVED | Accept output, return |
| Max iterations reached | Return last output with warning flag |
| Output unchanged between iterations (revision stalled) | Break early, return with stall warning |
| Critic confidence = LOW | Consider escalating to human review |
| Cost budget exceeded | Return best output with budget warning |

```python
def detect_stall(prev_output: str, new_output: str) -> bool:
    similarity = calculate_similarity(prev_output, new_output)
    return similarity > 0.95  # >95% similarity = stalled revision
```

---

## Cross-Model Critic

To reduce self-preference bias, use a different model family as critic:

```python
# Generator: Claude
output = await claude.generate(task)

# Critic: GPT-4o (different model family → less self-preference bias)
critique = await gpt4o.critique(output, task, criteria)
```

This adds API complexity but measurably reduces the "model approves its own mediocre output" failure mode.

---

## Tradeoffs

| | Pros | Cons |
|---|------|------|
| Quality improvement | Reliably catches surface-level errors | 2-3× token cost vs single pass |
| Automated | No human review required | Can't catch deep domain errors model doesn't understand |
| Specific feedback | Critique guides targeted revision | Bad critic prompt = bad feedback loop |
| Iteration visibility | Revision history shows improvement | Revision can regress (introduce new errors) |

---

## When To Use

- Complex generation tasks where first-draft quality is inconsistent (code generation, technical writing)
- When the task has checkable criteria (not pure creativity)
- When the cost of a bad output exceeds the cost of 2-3 LLM calls
- When you have a clear definition of "good" that can be encoded in the critic prompt

## When NOT To Use

- Simple tasks where output is reliable on the first pass — overhead not justified
- Pure creativity tasks where there's no "correct" output to critique toward
- Latency-sensitive paths — 3× latency is often unacceptable
- When the model's self-assessment is known to be uncorrelated with quality

---

## Real Examples

- **Code generation**: Generate implementation → review for types, errors, tests → revise
- **Prompt engineering**: Write prompt → review against evaluation criteria → revise
- **Technical documentation**: Write docs → review for accuracy, completeness, clarity → revise
- **API response generation**: Generate JSON response → schema validate + semantic review → revise

---

## Related Patterns

- [[patterns/pattern-plan-execute-verify]] — verify at a higher level (entire task completion)
- [[patterns/pattern-supervisor-worker]] — supervisor as a critic of worker output
- [[concepts/self-critique]] — the underlying concept
- [[concepts/llm-as-judge]] — using an LLM judge as the critic

---

## Sources

- Madaan et al. "Self-Refine: Iterative Refinement with Self-Feedback" (2023)
- Shinn et al. "Reflexion: Language Agents with Verbal Reinforcement Learning" (2023)
