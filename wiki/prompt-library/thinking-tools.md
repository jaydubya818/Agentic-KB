---
title: Thinking Tools
type: personal
category: pattern
confidence: high
date: 2026-04-13
tags: [prompts, reasoning, thinking-tools, claude-code, slash-commands]
---

# Thinking Tools

Reasoning scaffolds that make Claude's thinking visible, structured, and auditable. Use these when a question needs more than a direct answer — when the process of reasoning is as important as the conclusion.

---

## /trace

**Purpose:** Make the reasoning chain explicit before committing to a conclusion.

```
Trace your reasoning step by step before answering. Show:
1. What you know (facts, context)
2. What you're assuming (and why)
3. What inferences you're drawing
4. Where uncertainty lives
5. Your conclusion, with confidence level

Question: {question}
```

**When to use:** Architecture decisions, debugging non-obvious failures, any question where "it depends" is the honest answer.

---

## /challenge

**Purpose:** Surface the strongest objection to a plan or claim before committing.

```
Generate the strongest possible challenge to the following {plan/claim/decision}. 
Do not soften it. Do not add caveats. Make the best possible case that this is wrong.

{plan or claim}

Then: briefly note what would need to be true for the challenge to be overcome.
```

**When to use:** Before starting a major implementation, after generating a plan, when you suspect you're in an echo chamber.

---

## /steelman

**Purpose:** Find the best version of a position you disagree with.

```
Steelman the following position — articulate it in its strongest possible form, 
as its most thoughtful defender would. Ignore weak versions. 
Find the version that would make you update your priors if you took it seriously.

Position: {position}
```

**When to use:** Framework comparisons, architectural debates, any situation where confirmation bias is a risk.

---

## /assumptions

**Purpose:** Surface hidden assumptions before they become expensive bugs.

```
List every assumption embedded in the following {task/plan/system design}.
For each assumption:
- State it explicitly
- Rate it: Verified / Plausible / Unknown / Risky
- Note what failure looks like if the assumption is wrong

{task or plan}
```

**When to use:** At the start of any complex implementation. Pairs with [[patterns/pattern-structured-assumptions]].

---

## /decompose

**Purpose:** Break a complex task into the minimum viable set of sequential steps.

```
Decompose the following task into the smallest set of steps that:
1. Are individually verifiable
2. Have clear inputs and outputs
3. Can be executed independently or in clear sequence

Do not pad. If a step can be merged without losing clarity, merge it.

Task: {task}
```

**When to use:** Before any multi-step agent execution. See [[patterns/pattern-task-decomposition]].

---

## /compare

**Purpose:** Structured comparison across identical dimensions.

```
Compare the following options across these dimensions: {dimensions}.
Use a table. State a verdict. Defend it in one sentence.

Options: {option A}, {option B}, {option C}
Dimensions: {dim 1}, {dim 2}, {dim 3}
```

**When to use:** Framework selection, architecture decisions, tool evaluations. See [[patterns/pattern-structured-comparison-table]].

---

## /debug

**Purpose:** Scientific debugging — hypothesis-first.

```
Debug the following failure using the scientific method:
1. State the observed behavior (what happened)
2. State the expected behavior (what should have happened)
3. Generate 3 candidate hypotheses (most to least likely)
4. For each hypothesis: what test would confirm or rule it out?
5. Run the most discriminating test first

Failure: {failure description}
```

**When to use:** Any non-obvious failure. Pairs with [[patterns/pattern-scientific-debugging]].

---

## /synthesize

**Purpose:** Combine findings from multiple sources into a single verdict.

```
Synthesize the following {N} sources into a single coherent position.
1. Identify where they agree (the stable ground)
2. Identify where they conflict (the live tension)
3. State your synthesis — what you believe is true given all of them
4. Note what would change your synthesis

Sources:
{source 1 summary}
{source 2 summary}
...
```

**When to use:** After running multiple research lenses, after reading conflicting wiki pages. See [[knowledge-systems/research-engine/methodology/synthesis-rules|Synthesis Rules]].

---

## Related

- [[prompt-library/index|Prompt Library]] ← parent
- [[prompt-library/reflection-synthesis|Reflection & Synthesis]]
- [[patterns/pattern-scientific-debugging]]
- [[patterns/pattern-structured-assumptions]]
- [[knowledge-systems/research-engine/methodology/synthesis-rules|Synthesis Rules]]
