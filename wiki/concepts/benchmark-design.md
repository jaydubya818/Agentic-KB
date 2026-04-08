---
id: 01KNNVX2QBAQ0ZBE0MK3Y8KJCC
title: Benchmark Design
type: concept
tags: [agentic, evaluation, benchmarks, testing, ground-truth, contamination]
confidence: high
sources:
  - "Raji et al. AI and the Everything in the Whole Wide World Benchmark (2021)"
  - "Kiela et al. Dynabench (2021)"
  - "SWE-bench: Jimenez et al. (2023)"
  - "AgentBench: Liu et al. (2023)"
created: 2026-04-04
updated: 2026-04-04
related:
  - "[[concepts/llm-as-judge]]"
  - "[[concepts/trajectory-evaluation]]"
  - "[[concepts/self-critique]]"
status: evolving
---

## TL;DR

A good agent benchmark is hard to saturate, grounded in real-world tasks, has unambiguous ground truth, is contamination-resistant, and measures both capability and reliability. Most published benchmarks fail at least two of these criteria. Design your own task-specific evals before trusting leaderboard numbers for production decisions.

---

## Definition

A benchmark is a curated set of tasks with defined evaluation methodology used to measure and compare agent capabilities. Good benchmarks are predictive of real-world performance; bad ones are predictive of leaderboard performance only.

---

## How It Works

### What Makes a Good Agent Benchmark

**1. Task Difficulty Distribution**

Benchmarks need tasks across the full difficulty spectrum:
- Easy (solvable by most models, confirm baseline capability)
- Medium (differentiates capable from strong models)
- Hard (solvable by few or no current models — tests ceiling)
- Extremely hard (aspirational, measures frontier progress)

A benchmark where the best model scores 98% is no longer useful — it can't distinguish between models. A benchmark where the best model scores 15% can't tell you which model is actually usable.

Target: top model achieves 50-80% at benchmark launch. Expect saturation in 12-24 months.

**2. Ground Truth Construction**

Ground truth must be:
- **Unambiguous**: One correct answer (or a defined set of correct answers), not "it depends"
- **Verifiable**: Checkable programmatically or by a specified human rater process
- **Correct**: Ground truth errors corrupt the entire benchmark

For agentic tasks, ground truth options:
- **Execution-based**: Run the code/command; check the observable state of the world
- **Exact match**: The output must exactly match a reference (brittle for text)
- **Model-graded**: LLM judge with calibrated rubric (flexible but introduces judge bias)
- **Human-graded**: Ground truth from expert annotators (expensive, high quality)

Execution-based is the gold standard for software tasks (SWE-bench uses this). The agent's code either passes the test suite or it doesn't.

**3. Contamination Risks**

Training data contamination: the benchmark tasks appeared in model training data. The model "memorizes" the answers rather than demonstrating capability.

Mitigation strategies:
- **Dynamic benchmarks**: Generate new instances at evaluation time (Dynabench approach)
- **Private test sets**: Never publish the test set; only publish the training/dev split
- **Perturbed versions**: Create variants that test the same capability with different surface forms
- **Temporal cutoff**: Use tasks created after the model's training cutoff

Contamination is hard to detect and easy to miss. Assume leaderboard numbers overestimate real-world performance by 5-20% due to contamination.

---

## Capability vs Reliability Benchmarks

**Capability benchmarks**: Can the model do X at all?
- Binary pass/fail per task
- Measures peak performance
- Useful for: new capability exploration, comparing frontiers

**Reliability benchmarks**: Does the model do X consistently?
- Multiple trials per task (N=10, N=50)
- Measures variance, not just mean
- Useful for: production deployment decisions

A model that solves a coding task 40% of the time on first attempt is capability-proven but not production-reliable. Reliability benchmarks surface this distinction.

```python
def reliability_eval(task: Task, agent: Agent, n_trials: int = 10) -> ReliabilityResult:
    results = [agent.solve(task) for _ in range(n_trials)]
    return ReliabilityResult(
        success_rate=sum(r.success for r in results) / n_trials,
        mean_steps=mean(r.steps for r in results),
        variance=variance(r.success for r in results),
        p1_success=any(r.success for r in results),  # solved at all?
        p10_success=sum(r.success for r in results) == n_trials  # always?
    )
```

---

## Holistic vs Targeted Benchmarks

**Targeted**: Measures one specific capability (coding, math, tool use). High signal for that capability; doesn't predict general performance.

**Holistic**: Measures across a wide range of capabilities. Better for deployment decisions; harder to construct well; harder to interpret ("what exactly is it measuring?").

For production agent evaluation, run both:
- Targeted benchmarks for the core capabilities your use case requires
- A holistic benchmark to catch unexpected blind spots

---

## Agentic-Specific Considerations

Standard NLP benchmarks (MMLU, HumanEval) measure single-turn capabilities. Agentic benchmarks must additionally measure:

- **Multi-step correctness**: Is the agent correct across a sequence of decisions?
- **Tool use accuracy**: Does the agent select and use tools correctly?
- **Error recovery**: Does the agent recover from errors or compound them?
- **Context coherence**: Does behavior remain consistent across a long session?
- **Instruction following under pressure**: Does the agent maintain constraints when they create friction?

Benchmarks: SWE-bench (software engineering), WebArena (web tasks), AgentBench (multi-domain agentic), τ-bench (tool-use + conversation).

---

## Building Task-Specific Evals

For production systems, published benchmarks are insufficient. Build task-specific evals:

1. **Sample 50-100 representative production tasks** (real tasks from your users)
2. **Create reference solutions** (expert annotations or execution-verified)
3. **Define a scoring rubric** (what counts as correct, partial credit rules)
4. **Automate execution** (so you can run the eval in < 30 minutes)
5. **Add to CI/CD** (run on every prompt or model change)
6. **Track over time** (detect regressions before users do)

---

## When To Use

- Before deploying a new model to production (capability check)
- When changing prompts, tools, or agent architecture (regression check)
- When comparing two models for a specific use case
- When tracking progress of fine-tuning

## Risks & Pitfalls

- **Benchmark overfitting**: Optimizing agent prompts for benchmark tasks rather than real tasks; benchmark score improves while production performance doesn't
- **Metric gaming**: Agent learns benchmark-specific heuristics that don't generalize
- **Single-benchmark trust**: Any single benchmark has blind spots; always use multiple
- **Static benchmarks**: A static benchmark gets stale as capabilities advance; models get trained on it, and it stops discriminating

---

## Related Concepts

- [[concepts/llm-as-judge]] — judge-based grading within benchmarks
- [[concepts/trajectory-evaluation]] — trajectory-level benchmarks
- [[concepts/self-critique]] — using reflection to improve on benchmark tasks

---

## Sources

- Raji et al. "AI and the Everything in the Whole Wide World Benchmark" (2021)
- Jimenez et al. "SWE-bench: Can Language Models Resolve Real-World GitHub Issues?" (2023)
- Liu et al. "AgentBench: Evaluating LLMs as Agents" (2023)
- Kiela et al. "Dynabench: Rethinking Benchmarking in NLP" (2021)
