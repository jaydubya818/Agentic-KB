---
title: Idea Generation Prompts
type: personal
category: pattern
confidence: medium
date: 2026-04-13
tags: [prompts, brainstorming, divergent-thinking, ideation, creativity]
---

# Idea Generation Prompts

Prompts for expanding possibility space before converging on a solution. Used for architecture brainstorming, feature ideation, approach exploration, and problem reframing.

---

## Diverge First

**Use for:** Generating options before evaluating any of them.

```
Generate {N} distinct approaches to the following problem. 
No evaluation yet — just diverge.
Make each approach genuinely different in mechanism, not just in surface features.
Include at least one approach that feels uncomfortable or counterintuitive.

Problem: {problem}
```

**When to use:** Before architecture decisions, when the obvious solution feels wrong, when you're stuck.

---

## Constraint Removal

**Use for:** Finding solutions by temporarily removing a key constraint.

```
The following problem has a constraint that may be limiting our solution space.
Temporarily remove the constraint and describe what becomes possible.
Then: how much of that possibility survives if we add the constraint back at the end?

Problem: {problem}
Constraint to remove: {constraint — e.g., "it must be synchronous", "it must use Claude Code"}

1. Solutions without the constraint:
2. What survives when constraint returns:
3. Insight: what does this reveal about the constraint's real cost?
```

---

## Analogical Reasoning

**Use for:** Finding solutions by mapping from a different domain.

```
The following problem has a structural analog in {domain}.
Describe how {domain} solves a similar problem.
Then map that solution back to our domain — what's the equivalent mechanism?

Our problem: {problem}
Analog domain: {domain — e.g., "biology", "supply chain logistics", "distributed systems"}
```

---

## Pre-Mortem Ideation

**Use for:** Generating ideas by imagining failure and working backward.

```
It is {6 months from now}. The following project has failed catastrophically.
Describe the most likely failure modes — be specific and realistic.

For each failure mode: what would have prevented it?
That prevention mechanism is an idea worth exploring.

Project: {project description}
```

**When to use:** Before starting a new KB module, agent design, or major architectural decision. Pairs with [[patterns/pattern-adversarial-plan-review]].

---

## SCAMPER for Engineering

**Use for:** Systematic variation of an existing solution.

```
Apply SCAMPER to the following {system/design/pattern}:
S — Substitute: What component could be replaced with something different?
C — Combine: What could be merged with something else?
A — Adapt: What from another domain could be adapted here?
M — Modify/Magnify: What could be scaled up, emphasized, or exaggerated?
P — Put to other use: What existing component could serve a second purpose?
E — Eliminate: What could be removed entirely?
R — Rearrange/Reverse: What order could be changed? What could be inverted?

System: {description}
```

---

## 10x Thinking

**Use for:** Breaking out of incremental improvement thinking.

```
The current approach achieves {current metric}. 
What would need to be true to achieve 10x {current metric}?
Do NOT incrementally improve the current approach. 
The 10x answer almost always requires a fundamentally different mechanism.

Current approach: {description}
Current metric: {e.g., "processes 100 notes per session", "takes 5 minutes to INGEST"}
```

---

## KB Gap Ideation

**Use for:** Identifying what to build next in the Agentic-KB.

```
Review the following KB index and identify:
1. The 5 most valuable concept pages that don't exist yet
2. The 3 most valuable pattern pages that don't exist yet
3. The 2 most valuable recipe pages that don't exist yet

Value = (how often this concept is referenced without a page) × (how useful having the page would be)

KB index:
{paste wiki/index.md}
```

---

## Related

- [[prompt-library/index|Prompt Library]] ← parent
- [[prompt-library/thinking-tools|Thinking Tools]] — /steelman, /challenge
- [[prompt-library/reflection-synthesis|Reflection & Synthesis]]
- [[patterns/pattern-adversarial-plan-review]]
