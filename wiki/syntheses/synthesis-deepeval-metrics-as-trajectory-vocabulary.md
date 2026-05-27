---
title: DeepEval's Named Agent Metrics as the Operational Vocabulary for Trajectory Evaluation
type: synthesis
sources:
  - [[frameworks/framework-deepeval]]
  - [[concepts/trajectory-evaluation]]
  - [[syntheses/synthesis-react-as-native-trajectory-eval]]
  - [[summaries/siagian-agentic-engineer-roadmap-2026]]
question: Can DeepEval's named agent metrics (PlanQuality, ToolCalling, ArgumentCorrectness) serve as the missing operational vocabulary that turns trajectory evaluation from an abstract principle into a measurable CI/CD gate?
tags: [evaluation, agentic, trajectory-evaluation, deepeval, react, ci-cd]
created: 2026-05-25
updated: 2026-05-25
reviewed: false
reviewed_date: ""
---

# DeepEval's Named Agent Metrics as the Operational Vocabulary for Trajectory Evaluation

## Question
Can [[frameworks/framework-deepeval|DeepEval]]'s named agent metrics (PlanQuality, ToolCalling, ArgumentCorrectness) serve as the missing operational vocabulary that turns [[concepts/trajectory-evaluation|trajectory evaluation]] from an abstract principle into a measurable CI/CD gate?

## Argument
Yes. Trajectory evaluation is today a concept in search of metrics. The [[syntheses/synthesis-react-as-native-trajectory-eval|ReAct-as-substrate synthesis]] argues that ReAct's structured trace makes trajectory metrics "nearly free" to collect, but presupposes the metrics themselves are well-defined. DeepEval ships three named agent metrics that map cleanly onto the three failure modes of any agentic loop: planning, tool selection, and tool invocation. Adopting DeepEval's vocabulary closes the loop: ReAct emits the trace, DeepEval scores it, the result is a pytest-native CI gate.

## Evidence
[[concepts/trajectory-evaluation]] defines the concept (evaluate the agent's *path*, not just its final answer) but does not enumerate the specific metrics that constitute a trajectory score. The page reads as architectural without giving the engineer a checklist of what to measure.

[[frameworks/framework-deepeval]] ships 50+ research-backed metrics including three explicitly named agent metrics: **PlanQuality** (did the agent decompose the task into the right subgoals?), **ToolCalling** (did the agent select the right tool at each step?), and **ArgumentCorrectness** (were the tool arguments well-formed and faithful to the user intent?). These three map almost exactly onto the failure modes of any ReAct-style loop.

[[syntheses/synthesis-react-as-native-trajectory-eval]] argues ReAct's `Thought → Action → Observation` structure *is* the eval trace. Combined with DeepEval, the pipeline is: ReAct generates the structured trace, DeepEval's pytest assertions score `PlanQuality` on the Thoughts, `ToolCalling` on the Actions, and `ArgumentCorrectness` on the Action payloads. The result is a CI gate that fails the build when an agent's planning quality regresses, even if the final answer happens to still be correct.

[[summaries/siagian-agentic-engineer-roadmap-2026]] explicitly flags CI/CD evaluation discipline as a gap in current agentic deployments. This synthesis closes that gap by naming a concrete tool + metric stack: ReAct for trace shape, DeepEval for metric definitions, pytest for the harness.

## Counter-arguments & Gaps
**Vocabulary lock-in.** Adopting DeepEval's metric names ties trajectory eval to one vendor's taxonomy. If DeepEval renames `ToolCalling` or splits it into sub-metrics next quarter, every downstream eval breaks. The synthesis is more portable as "use this *shape* of metric (named, per-step, semantically distinct)" than as "use these exact three metric names."

**Trace-collection asymmetry.** DeepEval is pytest-native and runs locally; production traces typically live in LangSmith or a vendor observability surface. The natural complement is DeepEval for metric definitions + LangSmith for trace collection — but the synthesis doesn't specify how the trace handoff works (export format, deduplication, sampling rate).

**Non-ReAct agents.** Many production agents are not pure ReAct — Plan-Execute-Verify, hierarchical supervisors, swarm patterns each produce different trace shapes. DeepEval's three named metrics may not cover the planning surface of a [[concepts/multi-agent-systems|multi-agent system]] where planning is distributed across roles. The synthesis is strongest for single-agent ReAct and weakens for multi-agent topologies.

**Context-compression risk.** The high-leverage open question already flagged in the KB — does ReAct's structural evaluability survive context compression? — applies here too. If compression collapses the Thought field, `PlanQuality` becomes unscorable. The synthesis's value depends on trace integrity being preserved end to end.

## Conclusion
Adopt DeepEval's named agent metrics as the starting vocabulary for trajectory evaluation, but treat them as a reference taxonomy rather than a permanent contract — what matters is the *shape* (named, per-step, semantically distinct metrics) more than the specific names. Pair with LangSmith for production trace collection and pytest for the local CI loop. Next step: write a [[recipes/recipe-trajectory-eval-with-deepeval|recipe]] that wires ReAct traces into DeepEval's pytest harness end-to-end and measures the verbosity-vs-evaluability cost.

## Sources
- [[frameworks/framework-deepeval]]
- [[concepts/trajectory-evaluation]]
- [[syntheses/synthesis-react-as-native-trajectory-eval]]
- [[summaries/siagian-agentic-engineer-roadmap-2026]]
