---
id: 01KNNVX2QC0K6NFMCDPQCFK6MT
title: "Context Management"
type: concept
tags: [context, agents, architecture, orchestration]
created: 2025-01-01
updated: 2025-01-01
visibility: public
confidence: high
related: [concepts/task-decomposition.md, concepts/multi-agent-systems.md, patterns/pattern-context-manager-agent.md, patterns/pattern-external-memory.md]
---

# Context Management

## Definition

Context management is the practice of deliberately controlling what information is present in an LLM's prompt window at any given moment — including what is included, what is excluded, and in what order content appears. In agentic systems, poor context management is a primary cause of degraded output quality and increased cost.

## Why It Matters

LLMs have finite context windows, and performance degrades as prompts grow — both due to the hard token limit and the "lost in the middle" effect where relevant information buried in a long prompt is underweighted. In multi-step or multi-agent pipelines, context accumulates rapidly:

- Previous task outputs bleed into current task prompts
- Large architecture or specification documents are included wholesale when only a slice is needed
- Test files, unrelated modules, or superseded code pollute the working context

**Context bloat** is the state where the effective signal-to-noise ratio in the prompt has fallen below the point where the model reliably attends to what matters.

## Example

In a coding pipeline, a Code Generation Agent asked to implement one endpoint does not need the authentication module, the test suite, or the logging utilities — even if they are part of the same project. Including them wastes tokens and increases the chance the agent references the wrong patterns.

The [Context Manager Agent pattern](../patterns/pattern-context-manager-agent.md) addresses this directly: a dedicated agent runs before each execution step and produces a scoped context package — a curated list of files to read, interfaces to inline, and files to explicitly ignore.

### Practical techniques

| Technique | Description |
|---|---|
| **Selective file loading** | Identify and pass only the files (or functions within files) relevant to the current task |
| **Explicit ignore lists** | Name files that look relevant but aren't — prevents the execution agent from fetching them |
| **Inlined contracts** | Copy-paste the specific function signatures or types needed rather than including entire files |
| **State summaries** | Replace full prior output with a 2–3 sentence summary of what is already done |
| **Token budgets** | Set hard limits on context output (e.g. 400 tokens) as a forcing function for selectivity |
| **Role-scoped prompts** | Remind the agent of its exact scope at the end of every context package |

## The Primacy-Recency (U-Shaped) Attention Curve

LLMs do not attend uniformly across a prompt. Recall probability follows a rough U-shape: content near the **beginning** (primacy) and near the **end** (recency) of the context window is reliably attended to; content buried in the **middle** is systematically underweighted. This is the mechanism behind the "lost in the middle" effect.

**Practical implication**: structure your prompts so that the most critical instructions occupy the first ~100 lines and the immediate task occupies the last section. Supporting material, extended examples, and reference data go in the middle where the model will still use them but where their absence wouldn't break the task.

This has direct consequences for long instruction files:
- A 1,200-line voice guide where the most distinctive rules are in the middle will produce consistent drift by paragraph four, even if the model started correctly
- The fix is not to shorten the file — it's to **front-load** the critical rules (signature phrases, hard bans, core patterns) in the first 100 lines and push extended examples and edge cases further down
- Token budgets act as a forcing function: if you cap a context package at 400 tokens, the module author is forced to front-load only what actually matters

Applied to skill files and CLAUDE.md: the routing/priority rules and the hardest constraints go first. Nuance and examples go last. Assume the model will read the beginning reliably, the end reliably, and the middle partially.

---

## Common Pitfalls

- **Assuming more context is safer** — it rarely is; it increases hallucination surface and token cost
- **Including test files by default** — tests define behaviour but are rarely needed when implementing non-test code
- **No explicit ignore list** — without it, the execution agent may independently fetch irrelevant files via tool calls
- **Context creep across milestones** — files from earlier project phases stay in context long after they stop being relevant
- **Critical rules buried in the middle** — the primacy-recency curve means anything important in lines 200-800 of a 1,000-line prompt is at highest risk of being underweighted

## Counter-arguments & Gaps

The U-shaped attention curve (Liu et al. "Lost in the Middle" 2023) is the canonical evidence for aggressive context curation — but subsequent work shows the effect is partially an artifact of position-embedding choices in older models. Frontier long-context models (Claude 3+, Gemini 1.5+) exhibit substantially flatter attention curves across 100k+ tokens; the "middle" failure mode may be smaller than the folk advice suggests for current-generation models.

Summarisation as a context-management strategy is lossy in ways that are hard to audit. The summary is a model-written artefact that the next model step treats as authoritative; errors compound silently. Anthropic's own research on context compression shows that preserving raw references with targeted retrieval beats summary-based compression on recall tasks.

Tight context budgets can induce sycophantic shortcutting. When the model's scratchpad is aggressively pruned, it can lose the intermediate reasoning needed to catch errors — the cost-optimization win becomes a quality loss that doesn't show up until production. The right budget is task-dependent and experimental, not a universal rule.

Open questions: (a) at what context length does primacy-recency stop mattering enough to shape prompt design? (b) Is there a principled way to quantify summarisation information loss before running the pipeline, rather than after the quality regression?

What would change the verdict on aggressive summarisation: an ablation showing summary-compressed context matches raw-reference context on reasoning-heavy tasks. Current evidence shows a consistent gap in favor of raw references.

## See Also

- [Context Manager Agent Pattern](../patterns/pattern-context-manager-agent.md)
- [Task Decomposition](../concepts/task-decomposition.md)
- [External Memory Pattern](../patterns/pattern-external-memory.md)
- [Multi-Agent Systems](../concepts/multi-agent-systems.md)
- [Cost Optimization](../concepts/cost-optimization.md)
