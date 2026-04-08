---
id: 01KNNVX2R35NEA0F573T64BY5F
title: Structured Comparison Table Pattern
type: pattern
tags: [patterns, agents, orchestration, workflow, prompting]
created: 2026-04-07
updated: 2026-04-07
visibility: public
confidence: high
related: [pattern-fan-out-worker, concepts/task-decomposition, frameworks/framework-gsd, concepts/human-in-the-loop]
---

# Structured Comparison Table Pattern

A pattern for agent sub-tasks that produce **structured, conditional option comparisons** rather than single-answer recommendations. Used when a decision has multiple viable approaches and the final choice depends on project-specific context the sub-agent cannot fully know.

## When to Use

- A decision has 2–5 genuinely viable options with meaningfully different trade-offs
- The optimal choice is conditional on factors the researcher agent doesn't have full visibility into (team skill, scale, existing stack)
- Output will be synthesised by an orchestrator or reviewed by a human before action is taken
- You want to avoid premature lock-in to a single approach

## Structure

The sub-agent produces a **5-column markdown table** plus a short rationale paragraph:

```markdown
## {Decision Area}

| Option | Pros | Cons | Complexity | Recommendation |
|--------|------|------|------------|----------------|
| {name} | {advantages} | {disadvantages} | {impact surface + risk} | {conditional rec} |

**Rationale:** {1–2 paragraphs grounding the recommendation in project context}
```

### Column Definitions

| Column | What to Put Here | What to Avoid |
|---|---|---|
| **Option** | Tool or approach name | Vague categories |
| **Pros** | Key advantages, comma-separated | Marketing language |
| **Cons** | Key disadvantages, comma-separated | Dismissive framing |
| **Complexity** | Impact surface + risk (e.g., "3 files, new dep — Risk: memory leaks") | Time estimates |
| **Recommendation** | Conditional ("Rec if mobile-first", "Rec if SEO matters") | Single winner ranking |

## Example

```markdown
## State Management Approach

| Option | Pros | Cons | Complexity | Recommendation |
|--------|------|------|------------|----------------|
| Zustand | Minimal boilerplate, tiny bundle | Less structure for large teams | 2 files, new dep — Risk: prop drilling at scale | Rec if small team, rapid iteration |
| Redux Toolkit | Predictable, great devtools, ecosystem | Verbose, steeper learning curve | 5 files, new dep — Risk: over-engineering | Rec if team knows Redux, app is complex |
| React Context | Zero deps, built-in | Re-render performance at scale | 1 file — Risk: context hell with many slices | Rec if state is simple and localised |

**Rationale:** Given the project is a mid-sized SPA with a small team, Zustand offers the best balance of simplicity and power. Redux Toolkit is worth considering if the codebase grows significantly or if DevTools visibility becomes critical.
```

## Trade-offs

**Advantages:**
- Forces honest enumeration of real alternatives — no premature optimisation
- Conditional recommendations preserve human agency in the final decision
- Consistent structure makes it easy for orchestrators to parse and synthesise across multiple gray areas
- Complexity column surfaces hidden costs (deps, risk) without false precision from time estimates

**Disadvantages:**
- Requires discipline not to pad tables with weak options
- Conditional framing can frustrate users who want a direct answer
- Only works well when there are genuinely 2+ viable options; forced comparison with one real option is misleading

## Calibration Variants

The pattern can be tuned to context:

- **Full maturity**: 3–5 options, include maturity signals (star counts, project age), conditional recs
- **Standard**: 2–4 options, conditional recs, standard rationale
- **Minimal decisive**: Max 2 options, single recommendation, brief rationale

See [GSD Framework](../frameworks/framework-gsd.md) for an implementation of calibration tiers.

## Related Patterns

- [Fan-Out Worker Pattern](../patterns/pattern-fan-out-worker.md) — spawning multiple researcher agents in parallel, one per gray area
- [Clarification Task Pattern](../patterns/pattern-clarification-task.md) — when ambiguity should be resolved by asking the user rather than comparing options
- [Adversarial Plan Review](../patterns/pattern-adversarial-plan-review.md) — a complementary pattern that stress-tests a chosen option

## See Also

- [Task Decomposition](../concepts/task-decomposition.md)
- [Human in the Loop](../concepts/human-in-the-loop.md)
- [GSD Framework](../frameworks/framework-gsd.md)
