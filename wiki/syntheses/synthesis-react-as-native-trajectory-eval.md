---
title: ReAct as Native Trajectory-Eval Substrate
type: synthesis
sources:
  - [[patterns/pattern-react]]
  - [[concepts/trajectory-evaluation]]
  - [[frameworks/framework-deepeval]]
  - [[syntheses/synthesis-eval-metrics-to-failure-modes]]
  - [[summaries/chopratejas-headroom]]
question: Why is ReAct uniquely cheap to evaluate compared to other agentic patterns, and what does that mean for pattern selection when evaluation is a first-order concern?
tags: [agentic, evaluation, react, trajectory-evaluation, observability]
created: 2026-05-23
updated: 2026-06-25
reviewed: false
reviewed_date: ""
---

# ReAct as Native Trajectory-Eval Substrate

## Question
Why is ReAct uniquely cheap to evaluate compared to other agentic patterns, and what does that mean for pattern selection when evaluation is a first-order concern?

## Argument
ReAct's `Thought → Action → Observation` loop emits exactly the artifact that trajectory evaluation consumes — a step-by-step record of reasoning, tool calls, and grounding observations — without any instrumentation overhead. Every other major pattern (Plan-Execute-Verify, Fan-Out-Worker, Supervisor-Worker) either compresses these steps into opaque sub-routines or distributes them across processes, forcing teams to reconstruct the trace after the fact. ReAct is the single agentic pattern where the production loop and the evaluation record are the same data structure, which makes it the default choice whenever evaluation-driven iteration is part of the development cycle.

## Evidence
[[concepts/trajectory-evaluation]] defines the practice as scoring an agent's intermediate steps — planning quality, tool selection, argument correctness, observation grounding — rather than only its final answer. The page explicitly enumerates four step-level metrics that map cleanly onto ReAct's three loop components: `PlanQuality` and `TaskCompletion` score the *Thought*; `ToolCalling` and `ArgumentCorrectness` score the *Action*; the *Observation* is the ground-truth check that determines whether the next Thought is well-founded.

[[patterns/pattern-react]] describes the loop as "verbalized reasoning that produces a Thought, then an Action against a tool, then an Observation back into the context." The loop's natural log format is structurally identical to what [[frameworks/framework-deepeval]] expects as input for its agent-evaluation metrics — the framework requires no adapter to score a ReAct trace, only a regex over `Thought:`, `Action:`, `Observation:` markers.

[[syntheses/synthesis-eval-metrics-to-failure-modes]] connects DeepEval's metric set to a taxonomy of agentic failures (hallucinated tool calls, planning regressions, ungrounded answers) but stops short of identifying *which architectural pattern minimizes the cost of collecting those metrics*. That gap is the contribution of this synthesis: when the loop is the trace, the metrics are nearly free.

For contrast: a Plan-Execute-Verify pipeline executes the plan as discrete subprocesses; the planner's reasoning, the executor's tool calls, and the verifier's checks live in separate logs, often in separate processes. Reconstructing the per-step trace for trajectory evaluation requires correlating timestamps across systems. Fan-Out-Worker is worse — parallel branches must be re-serialized into a coherent sequence before they can be scored as a trajectory at all.

## Counter-arguments & Gaps
The free-evaluation claim weakens at scale. ReAct's verbose context grows linearly with loop iterations; production deployments often truncate or summarize earlier turns, which silently destroys the trajectory record that this synthesis claims is free. A team that adopts ReAct *for evaluability* and then turns on context compression to control costs has paid the verbosity tax without keeping the benefit.

[[summaries/chopratejas-headroom]] makes the compression tradeoff sharper: reversible compression with a local retrieval cache is safer than one-way truncation, but it still must preserve an uncompressed trace or citation/eval log outside the compressed prompt. Otherwise the agent may be able to retrieve details during execution while the eval harness loses the exact evidence needed to score tool choice, argument correctness, and observation grounding.

ReAct also underperforms on tasks with long-horizon planning, where Plan-Execute-Verify's separate planning phase produces measurably better plans (per the GSD framework's results in [[summaries/summary-gsd-framework-skills]]). Choosing ReAct purely for evaluability would be a regression on planning-heavy tasks. The honest framing is: *when planning depth is similar across candidate patterns, ReAct's eval-cheapness is a deciding factor; when it isn't, planning quality dominates.*

The synthesis assumes DeepEval-style step metrics are the right evaluation target. If the actual evaluation harness is end-to-end (final-answer-only, e.g., a benchmark with a held-out answer key), ReAct's per-step record is irrelevant — any pattern is equally cheap to evaluate. The synthesis applies specifically to *trajectory* evaluation, not all evaluation.

What would change the verdict: a deployment story where Plan-Execute-Verify ships with a structured-trace emitter that produces ReAct-equivalent traces with comparable token cost. The GSD framework's checkpoint protocol is moving in this direction; if it standardizes a per-step event log, the eval-cheapness argument transfers to PEV and ReAct loses this differentiator.

## Conclusion
ReAct is the default agentic pattern for any workflow where iterative evaluation drives development — not because it produces better answers, but because the loop *is* the eval trace and metrics collection is structurally free. The recommendation is to pick ReAct first when evaluation is in the iteration loop and switch to Plan-Execute-Verify only when planning depth or context cost forces it. The open question worth tracking is whether structured-trace emitters in PEV frameworks (notably GSD's checkpoint protocol) will close the evaluability gap; if they do, ReAct's evaluation advantage shrinks to "marginally simpler to wire up" rather than "structurally cheaper."

## Sources
- [[patterns/pattern-react]]
- [[concepts/trajectory-evaluation]]
- [[frameworks/framework-deepeval]]
- [[syntheses/synthesis-eval-metrics-to-failure-modes]]
- [[summaries/summary-gsd-framework-skills]]
- [[summaries/chopratejas-headroom]] — raw source: `raw/framework-docs/chopratejas-headroom.md`
