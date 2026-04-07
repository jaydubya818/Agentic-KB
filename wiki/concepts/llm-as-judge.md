---
title: LLM-as-Judge
type: concept
tags: [agentic, evaluation, llm-judge, calibration, bias, scoring]
confidence: high
sources:
  - "Zheng et al. Judging LLM-as-a-Judge with MT-Bench (2023)"
  - "Shankar et al. Who Validates the Validators? (2024)"
  - "Anthropic: Model evaluation methodologies (2025)"
created: 2026-04-04
updated: 2026-04-04
related:
  - "[[concepts/self-critique]]"
  - "[[concepts/trajectory-evaluation]]"
  - "[[concepts/benchmark-design]]"
  - "[[concepts/few-shot-prompting]]"
  - "[[patterns/pattern-reflection-loop]]"
status: stable
---

## TL;DR

LLM-as-judge uses one LLM to evaluate another's output. It scales better than human eval and generalizes better than regex/exact-match. The core challenge is bias: judges systematically favor verbose, confident, or self-similar outputs. Mitigate via structured rubrics, multiple judges, and calibration against human labels. Never use the same model to both generate and judge its own output without controls.

---

## Definition

LLM-as-judge is an evaluation methodology where a language model is used as an automated evaluator of other LLM outputs. The judge LLM receives a rubric, the output to evaluate, and optionally a reference answer, and returns a structured assessment (score, pass/fail, or critique).

---

## How It Works

### Basic Judge Pattern

```python
JUDGE_PROMPT = """You are an expert evaluator. Rate the following response on a scale of 1-5.

Rubric:
5 - Fully correct, complete, well-structured, addresses all requirements
4 - Mostly correct, minor gaps or imprecision
3 - Partially correct, significant gaps or errors present
2 - Mostly incorrect, some relevant content
1 - Incorrect or irrelevant

Task: {task}
Response to evaluate: {response}
Reference answer (if available): {reference}

Respond in JSON:
{{"score": int, "reasoning": "...", "specific_issues": ["..."]}}"""

def judge(task: str, response: str, reference: str = "") -> JudgeResult:
    result = llm.generate(
        JUDGE_PROMPT.format(task=task, response=response, reference=reference),
        model="claude-opus-4-6",  # Use strongest available judge
        temperature=0  # Deterministic judging
    )
    return JudgeResult.parse(result)
```

Key implementation choices:
- **Temperature = 0**: Deterministic scoring. Variance in judge output is a calibration problem, not a feature.
- **Strongest available model**: The judge needs to understand quality at a level above the generator.
- **Structured output**: Scores embedded in prose are hard to aggregate. Force JSON.

### Bias Sources

**Self-preference bias**: When the judge and generator are the same model (or same family), the judge rates outputs from that model higher. This is documented across model families. Mitigation: use a different model family as judge, or use cross-judge ensembling.

**Position bias**: In pairwise comparisons, the judge favors whichever response appears first. Mitigation: run each comparison twice with order flipped, average scores.

**Verbosity bias**: Judges favor longer, more elaborate responses even when shorter responses are more accurate. Mitigation: explicit rubric criteria penalizing unnecessary length; calibration examples that reward concise correct answers.

**Confidence bias**: Responses that sound more confident are rated higher regardless of accuracy. Mitigation: include uncertainty criteria in rubric; test judge against known-wrong confident responses.

**Sycophancy in self-critique**: When a model is asked to evaluate its own output, it systematically over-rates it. Never use self-critique as the sole quality signal.

---

## Rubric Design

A rubric is the most important element of LLM-as-judge. Generic rubrics ("is this good?") produce biased, uncalibrated results. Task-specific rubrics produce useful signal.

**Rubric structure**:
```
1. [Criterion name]: [What to evaluate] [Weight]
   - Score 5: [Specific description of excellent performance]
   - Score 3: [Specific description of acceptable performance]
   - Score 1: [Specific description of poor performance]
```

**Example (code review judge)**:
```
Criteria:
1. CORRECTNESS (weight: 40%): Does the code correctly implement the specification?
   5: All requirements implemented correctly, edge cases handled
   3: Core requirements met, 1-2 edge cases missing
   1: Core requirement missing or logically incorrect

2. TYPE_SAFETY (weight: 20%): Are types explicit and correct?
   5: All parameters, returns, and variables explicitly typed; no any
   3: Main paths typed; some gaps
   1: Untyped or incorrect types

3. ERROR_HANDLING (weight: 20%): Are errors properly handled?
   5: All error paths handled with specific error types
   3: Happy path handled; some error paths missing
   1: No error handling

4. TESTS (weight: 20%): Is the implementation testable and tested?
   5: Unit tests cover happy path + key error cases
   3: Tests present but incomplete coverage
   1: No tests
```

---

## Multi-Judge Ensembling

Using multiple judges and aggregating reduces individual judge bias:

```python
def ensemble_judge(task: str, response: str, judges: list[JudgeConfig]) -> float:
    scores = []
    for judge_config in judges:
        result = judge(task, response, model=judge_config.model, temperature=0)
        scores.append(result.score * judge_config.weight)
    return sum(scores) / sum(j.weight for j in judges)

# Example: 3-judge ensemble
judges = [
    JudgeConfig(model="claude-opus-4-6", weight=1.0),
    JudgeConfig(model="gpt-4o", weight=1.0),
    JudgeConfig(model="gemini-1.5-pro", weight=0.8),
]
```

Ensemble cost: N × single judge cost. Use when: the evaluation has high stakes, single judge variance is observable, or you need confidence intervals on scores.

---

## Calibration Against Human Labels

LLM judge scores are only useful if they correlate with human judgment on your specific task. Calibration process:

1. Sample 100-200 representative outputs from your system
2. Have domain experts score them on your rubric
3. Run your LLM judge on the same set
4. Compute Pearson/Spearman correlation + Cohen's kappa
5. Identify systematic biases (judge always scores 0.5 higher? Adjust offset)
6. Re-evaluate on held-out set

Acceptable calibration: Spearman ρ > 0.7 with human scores on your task.

If calibration is below threshold, either: refine the rubric, switch judge models, or add few-shot examples to the judge prompt.

---

## When LLM-as-Judge Beats Human Eval

- **Scale**: 10,000 outputs per day — human eval is infeasible; LLM judge runs in minutes
- **Consistency**: Human raters have 15-20% disagreement on most tasks. LLM judge at temperature=0 is deterministic.
- **Speed**: Eval results in seconds vs days for human annotation
- **Coverage**: Can evaluate every output, not just a sample
- **Regression testing**: Detect quality regressions across releases automatically

**Where human eval still wins**:
- Novel task types with no calibration data
- Subjective quality judgments (creativity, tone, cultural sensitivity)
- Safety evaluations where false negatives are catastrophic
- Cases where the judge doesn't understand the domain (rare but real)

---

## When To Use

- Evaluating outputs at scale (>100/day)
- Regression testing after model or prompt changes
- Automated quality gates in agent pipelines (verifier role)
- A/B testing between prompts or models
- Building labeled datasets for fine-tuning

---

## Risks & Pitfalls

- **Judge gaming**: If your agent is trained/optimized against a judge, it will learn to produce outputs that score well on judge criteria but not on actual quality
- **Cascade failure**: Using a weak judge to evaluate a strong generator; the judge can't recognize quality above its own level
- **False calibration**: Calibrating on a small, non-representative sample; judge appears calibrated but fails on real distribution
- **Rubric drift**: Rubric becomes stale as task requirements evolve; judge scores no longer mean what you think they do

---

## Related Concepts

- [[concepts/self-critique]] — using judge pattern within a generation loop
- [[concepts/trajectory-evaluation]] — judging agent paths, not just final outputs
- [[concepts/benchmark-design]] — judge-based evaluation as part of benchmark construction
- [[patterns/pattern-reflection-loop]] — embedding a judge in the revision cycle

---

## Sources

- Zheng et al. "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena" (2023)
- Shankar et al. "Who Validates the Validators?" (2024)
- Wang et al. "Large Language Models are not Fair Evaluators" (2023)
