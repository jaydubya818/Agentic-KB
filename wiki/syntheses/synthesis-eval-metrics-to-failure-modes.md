---
title: "Synthesis: Do DeepEval Agent Metrics Directly Operationalize the Agent Failure Modes Taxonomy?"
type: synthesis
sources:
  - "[[frameworks/framework-deepeval]]"
  - "[[concepts/agent-failure-modes]]"
question: "Do modern agent eval framework metrics directly operationalize the agent failure modes taxonomy?"
tags: [evaluation, agentic, safety, error-handling, agent-failure-modes, deepeval]
created: 2026-05-16
updated: 2026-05-16
reviewed: false
reviewed_date: ""
---

# Do DeepEval Agent Metrics Operationalize the Failure Modes Taxonomy?

Yes — and the mapping is close enough to use as a diagnostic feedback loop, with caveats about coverage.

## Argument

[[frameworks/framework-deepeval]] ships three named agent-specific metrics: `AgentTaskAccuracy`, `PlanQuality`, `ToolCalling`, and `ArgumentCorrectness`. The [[concepts/agent-failure-modes]] taxonomy organizes production agent failures into classes: task-decomposition failures, tool-selection errors, tool-argument hallucinations, goal drift, and safety violations. The overlap is not accidental — DeepEval's metric design mirrors the failure taxonomy's top three categories.

The correspondence:

| DeepEval Metric | Failure Mode Class | What It Catches |
|---|---|---|
| `PlanQuality` | Task-decomposition failure | Agent breaks a goal into wrong or missing subtasks; plan has logical gaps or redundant steps |
| `ToolCalling` | Tool-selection error | Agent calls the wrong tool, calls no tool when one is needed, or calls tools in the wrong order |
| `ArgumentCorrectness` | Tool-argument hallucination | Agent passes syntactically valid but semantically wrong parameters — a hallucination that string-matching can't detect |
| `AgentTaskAccuracy` | Goal drift / task completion failure | Agent terminates with the wrong output or partial completion |

This creates a closed diagnostic loop: run DeepEval on a production trace → metric failure points at a failure mode class → failure mode class has a known remediation pattern (e.g., `PlanQuality` failure → improve task decomposition prompt or add Plan-Execute-Verify structure). Without this mapping, metric failures are data without diagnosis.

`ArgumentCorrectness` is the most important metric in this set. It catches the class of failure that is invisible to deterministic scorers: an agent calls `search(query="latest filings", date_range="2020-2025")` when the correct range is 2024-2026. The tool was called; the schema was valid; the string match would pass. A judge that reasons about semantic correctness catches it.

## Evidence

DeepEval's documentation explicitly frames `PlanQuality` as measuring whether "the agent's plan is logically coherent and complete relative to the stated goal" — which is the operational definition of the task-decomposition failure class. `ToolCalling` is scored by whether the tool invoked matches the task context, matching the tool-selection failure class directly.

The [[concepts/agent-failure-modes]] taxonomy (from production postmortem data) identifies argument hallucination as a top-3 failure mode by frequency — and `ArgumentCorrectness` is the only named metric in any major eval framework that targets it as a first-class concern.

## Counter-arguments & Gaps

**The mapping is not 1:1.** Failure modes can manifest across multiple metrics simultaneously. A goal-drift failure often presents as both a `PlanQuality` drop (bad plan) and an `AgentTaskAccuracy` drop (wrong output). A single metric failure doesn't isolate a single failure mode — it narrows the search space but doesn't eliminate ambiguity.

**Eval frameworks evolve faster than failure taxonomies.** DeepEval adds and renames metrics on a rolling release. `ToolCalling` was a separate metric from `ArgumentCorrectness` only as of 2024; before that both were rolled into a single score. Failure taxonomies published before 2024 may not distinguish between them.

**Coverage gaps remain.** The [[concepts/agent-failure-modes]] taxonomy includes safety-boundary violations (agent takes actions outside its authorized scope) and context-length failure modes (agent drops relevant state as context grows). No named DeepEval metric targets these directly. Safety violations require [[frameworks/framework-promptfoo]]'s red-team harness or custom judge tasks. Context failure requires trajectory-level analysis not provided by per-step metrics.

**LLM-judge reliability applies here too.** `PlanQuality` and `ArgumentCorrectness` are judge-scored — subject to the same position bias and self-preference issues documented in [[concepts/llm-as-judge]].

## Conclusion

DeepEval's named agent metrics operationalize the top three failure mode classes with enough fidelity to build a diagnostic feedback loop. The mapping is a working tool, not a complete theory: use it to triage which failure class to investigate, then apply class-specific remediation. Treat coverage gaps (safety violations, context failures) as integration points for complementary harnesses — [[frameworks/framework-promptfoo]] for red-teaming, custom trajectory scorers for context drift. Re-verify the mapping after any DeepEval major version update.

## Sources

- [[frameworks/framework-deepeval]] — metric definitions: PlanQuality, ToolCalling, ArgumentCorrectness, AgentTaskAccuracy
- [[concepts/agent-failure-modes]] — production failure taxonomy
- [[concepts/llm-as-judge]] — judge reliability caveats
