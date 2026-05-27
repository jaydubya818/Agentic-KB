---
title: "Synthesis: Model Tiering Should Govern Eval Framework Selection — A Selection Matrix"
type: synthesis
sources:
  - "[[hot]]"
  - "[[frameworks/framework-deepeval]]"
  - "[[frameworks/framework-langsmith]]"
  - "[[frameworks/framework-promptfoo]]"
  - "[[frameworks/framework-inspect-ai]]"
question: "Which eval framework should you use at which model tier, and why is indiscriminate use of any one of them as wasteful as using Opus for boilerplate?"
tags: [evaluation, cost-optimization, agentic, deepeval, langsmith, promptfoo, inspect-ai]
created: 2026-05-24
updated: 2026-05-24
reviewed: false
reviewed_date: ""
---

# Model Tiering Should Govern Eval Framework Selection — A Selection Matrix

## Question

Which eval framework should you use at which model tier, and why is indiscriminate use of any one of them as wasteful as using Opus for boilerplate?

## Argument

The model tiering codified in `[[hot]]` — haiku for leaf tasks, sonnet for orchestration, opus for structural artifacts — is a first-class operational discipline because LLM cost scales sharply across tiers. The same logic applies to evaluation frameworks, and currently does not. `[[frameworks/framework-deepeval]]`, `[[frameworks/framework-langsmith]]`, `[[frameworks/framework-promptfoo]]`, and `[[frameworks/framework-inspect-ai]]` all have analogous cost/capability profiles that map cleanly onto agent tiers, but no page in the KB tells you which to reach for first. The result is teams either (a) defaulting to one framework everywhere and paying the over-spec'd cost on simple cases, or (b) hand-rolling per-project setups and losing the compounding benefits a shared eval surface provides.

The selection matrix is two-dimensional: agent tier (haiku/sonnet/opus) × task type (leaf/orchestration/structural). DeepEval's research-backed metrics (PlanQuality, ToolCalling, ArgumentCorrectness) carry per-evaluation LLM costs that are appropriate at the opus tier and wasteful at the haiku tier. LangSmith's trace-to-dataset workflow has observability overhead that pays off for sonnet-tier orchestration but is overkill on leaf tasks. Promptfoo's local-first, CI-native design is the natural fit for haiku-tier regression. Inspect AI's research-style task harness sits at the structural/opus tier where you're auditing whole agent behaviors.

## Evidence

- `[[hot]]` codifies model tiering as a continuously-updated operational rule (haiku→leaf, sonnet→orchestration, opus→structural).
- `[[frameworks/framework-deepeval]]` documents 50+ metrics with per-evaluation LLM cost (each metric makes 1+ judge calls).
- `[[frameworks/framework-langsmith]]` documents the trace-to-dataset workflow and the observability overhead (every run produces a structured trace).
- `[[frameworks/framework-promptfoo]]` documents local-first execution, CI/CD-native config, and no required backend.
- `[[frameworks/framework-inspect-ai]]` documents the research-style task abstraction — designed for whole-agent audits, not per-call assertions.
- `[[mocs/evaluation]]` (added 2026-04-10) exists as a navigation hub but currently lacks any cross-cutting selection guidance.

## Counter-arguments & Gaps

The strongest objection: framework selection isn't actually one-dimensional with model tier. The right framework depends more on *what you're measuring* (output quality, tool correctness, trajectory shape, regression vs. exploration) than on which model is producing the output. A leaf-tier haiku task running a high-stakes classification still benefits from DeepEval's research-backed metrics; a structural opus task doing exploratory research probably doesn't need them. The proposed matrix may encode a correlation that's actually two independent variables.

Second, the cost argument may be weaker than it appears. Eval costs are dominated by judge LLM calls at the *evaluator* tier, not the agent tier. Running DeepEval on a haiku-tier agent with sonnet judges costs roughly the same as running it on a sonnet-tier agent with sonnet judges. The "wasteful" framing assumes the judge tier scales with the agent tier, which is a separate design choice.

Third, multiple frameworks composing on the same agent is normal, not waste. Promptfoo for regression + LangSmith for trace capture + DeepEval for metric-level scoring is a common production setup. The matrix as framed implies a one-to-one mapping that doesn't match how teams actually use these tools.

Finally, three of the four frameworks (`framework-deepeval`, `framework-langsmith`, `framework-promptfoo`) were added together on 2026-04-18 from a single ingest pass. They have not been independently evaluated against each other on real workloads in this KB. Building a selection matrix on top of unvalidated framework pages compounds the trust gap.

## Conclusion

Treat this as a hypothesis worth testing, not a recommendation worth shipping. The cleanest first step is to pick one real evaluation problem (say, regression-testing a leaf-tier classifier), set up the same eval in two frameworks (promptfoo + DeepEval), and compare cost, setup time, and signal quality. If the predicted asymmetry shows up — promptfoo wins on cost and setup, DeepEval wins on signal — the matrix has empirical legs and can graduate to a `[[concepts/eval-framework-selection]]` page. If the deltas are noise, the matrix is a story that pattern-matches well but doesn't predict outcomes, and the right next step is `[[mocs/evaluation]]` getting a comparison table rather than a selection rule.

Open question: what is the right *judge-tier* default? The matrix as written assumes a sonnet-tier judge throughout. Whether judge tier should track agent tier, evaluator framework, or task stakes is the higher-order question and the one this synthesis sidesteps.

## Sources

- `[[hot]]`
- `[[frameworks/framework-deepeval]]`
- `[[frameworks/framework-langsmith]]`
- `[[frameworks/framework-promptfoo]]`
- `[[frameworks/framework-inspect-ai]]`
- `[[mocs/evaluation]]`
