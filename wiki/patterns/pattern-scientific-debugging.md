---
title: "Pattern: Scientific Debugging"
type: pattern
tags: [agents, patterns, workflow, automation]
created: 2026-04-07
updated: 2026-04-07
visibility: public
confidence: high
related: [concepts/agent-failure-modes, concepts/chain-of-thought, concepts/human-in-the-loop, frameworks/framework-gsd]
---

# Pattern: Scientific Debugging

A structured approach to bug investigation in which an agent applies the scientific method — forming falsifiable hypotheses, designing experiments, and drawing conclusions from evidence — rather than making ad-hoc or intuition-driven changes.

## When to Use

- Investigating non-obvious bugs where the root cause is unknown
- Multi-step debugging sessions that may span context resets
- Situations where previous fix attempts have failed (mental-model error likely)
- Any agent that debugs code it also wrote (meta-debugging risk)

## Structure

### Phase 1 — Evidence Gathering

Collect observable facts only. Distinguish between:
- **Known facts:** What can be directly observed (error messages, output values, reproduction steps)
- **Assumptions:** Beliefs about how the system should work that have not been verified

Read entire functions, not just "relevant" lines. Read imports, config, and tests.

### Phase 2 — Hypothesis Formation

Generate **3 or more independent hypotheses** before investigating any single one. Each hypothesis must be:
- **Specific:** Names a concrete mechanism, not a vague area
- **Falsifiable:** Specifies what evidence would disprove it

**Bad:** "State management is broken"  
**Good:** "User state is reset because the component remounts on route change"

### Phase 3 — Experimental Design

For each hypothesis, define before running:
1. **Prediction** — if true, I will observe X
2. **Test** — exact steps to run
3. **Measurement** — what is being recorded
4. **Success/failure criteria** — explicit thresholds

### Phase 4 — Execution

- Change **one variable** per experiment
- Record actual outcome vs. predicted outcome
- Conclude: supports, refutes, or inconclusive

### Phase 5 — Restart Decision

If after 2+ hours or 3+ failed fixes there is no progress, execute the restart protocol:
1. Write down what is known for certain
2. Write down what has been ruled out
3. Generate new hypotheses (different from previous ones)
4. Return to Phase 1

## Example

A user reports: "Clicking the button increments the counter by 2 instead of 1."

**Hypothesis A:** `handleClick` is bound to two event listeners (double-registration).  
*Prediction:* Removing one listener reduces increment to 1.  
*Test:* Add a console log at the top of `handleClick`; count log calls per click.  
*Result:* Log fires twice → supports A.

**Hypothesis B:** State update batching is disabled, causing two re-renders.  
*Prediction:* Wrapping in `unstable_batchedUpdates` reduces increment to 1.  
*Test:* Wrap and rerun.  
*Result:* No change → refutes B.

Conclusion: Root cause is double event listener registration.

## Trade-offs

| Pro | Con |
|---|---|
| Prevents tunnel vision and confirmation bias | Slower than "just try the obvious fix" for simple bugs |
| Creates a reusable audit trail | Requires discipline to avoid multi-variable changes |
| Forces falsifiability, reducing wasted effort | Restart protocol can feel costly when sunk-cost bias is strong |
| Separates user experience (symptoms) from technical cause | Initial hypothesis generation adds upfront overhead |

## Cognitive Biases Addressed

| Bias | Mitigation |
|---|---|
| **Confirmation bias** | Actively design experiments to disprove each hypothesis |
| **Anchoring** | Require 3+ hypotheses before investigation begins |
| **Availability** | Treat each bug as novel regardless of recent similar bugs |
| **Sunk cost** | Enforce restart protocol at explicit time/attempt thresholds |

## Related Patterns

- [Pattern: Clarification Task](pattern-clarification-task.md) — gathering user-side symptoms without asking for diagnosis
- [Pattern: Confirm Before Destructive](pattern-confirm-before-destructive.md) — checkpointing before applying fixes
- [Pattern: Architecture First](pattern-architecture-first.md) — analogous structured approach applied to design

## See Also

- [Agent Failure Modes](../concepts/agent-failure-modes.md)
- [Chain of Thought](../concepts/chain-of-thought.md)
- [Human-in-the-Loop](../concepts/human-in-the-loop.md)
- [GSD Framework](../frameworks/framework-gsd.md)
