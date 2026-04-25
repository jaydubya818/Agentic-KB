     1|---
     2|id: 01KNNVX2QC0K6NFMCDPQCFK6MT
     3|title: "Context Management"
     4|type: concept
     5|tags: [context, agents, architecture, orchestration]
     6|created: 2025-01-01
     7|stale_after_days: 730
updated: 2025-01-01
     8|visibility: public
     9|confidence: high
    10|related: [concepts/task-decomposition.md, concepts/multi-agent-systems.md, patterns/pattern-context-manager-agent.md, patterns/pattern-external-memory.md]
    11|---
    12|
    13|# Context Management
    14|
    15|## Definition
    16|
    17|Context management is the practice of deliberately controlling what information is present in an LLM's prompt window at any given moment — including what is included, what is excluded, and in what order content appears. In agentic systems, poor context management is a primary cause of degraded output quality and increased cost.
    18|
    19|## Why It Matters
    20|
    21|LLMs have finite context windows, and performance degrades as prompts grow — both due to the hard token limit and the "lost in the middle" effect where relevant information buried in a long prompt is underweighted. In multi-step or multi-agent pipelines, context accumulates rapidly:
    22|
    23|- Previous task outputs bleed into current task prompts
    24|- Large architecture or specification documents are included wholesale when only a slice is needed
    25|- Test files, unrelated modules, or superseded code pollute the working context
    26|
    27|**Context bloat** is the state where the effective signal-to-noise ratio in the prompt has fallen below the point where the model reliably attends to what matters.
    28|
    29|## Example
    30|
    31|In a coding pipeline, a Code Generation Agent asked to implement one endpoint does not need the authentication module, the test suite, or the logging utilities — even if they are part of the same project. Including them wastes tokens and increases the chance the agent references the wrong patterns.
    32|
    33|The [Context Manager Agent pattern](../patterns/pattern-context-manager-agent.md) addresses this directly: a dedicated agent runs before each execution step and produces a scoped context package — a curated list of files to read, interfaces to inline, and files to explicitly ignore.
    34|
    35|### Practical techniques
    36|
    37|| Technique | Description |
    38||---|---|
    39|| **Selective file loading** | Identify and pass only the files (or functions within files) relevant to the current task |
    40|| **Explicit ignore lists** | Name files that look relevant but aren't — prevents the execution agent from fetching them |
    41|| **Inlined contracts** | Copy-paste the specific function signatures or types needed rather than including entire files |
    42|| **State summaries** | Replace full prior output with a 2–3 sentence summary of what is already done |
    43|| **Token budgets** | Set hard limits on context output (e.g. 400 tokens) as a forcing function for selectivity |
    44|| **Role-scoped prompts** | Remind the agent of its exact scope at the end of every context package |
    45|
    46|## The Primacy-Recency (U-Shaped) Attention Curve
    47|
    48|LLMs do not attend uniformly across a prompt. Recall probability follows a rough U-shape: content near the **beginning** (primacy) and near the **end** (recency) of the context window is reliably attended to; content buried in the **middle** is systematically underweighted. This is the mechanism behind the "lost in the middle" effect.
    49|
    50|**Practical implication**: structure your prompts so that the most critical instructions occupy the first ~100 lines and the immediate task occupies the last section. Supporting material, extended examples, and reference data go in the middle where the model will still use them but where their absence wouldn't break the task.
    51|
    52|This has direct consequences for long instruction files:
    53|- A 1,200-line voice guide where the most distinctive rules are in the middle will produce consistent drift by paragraph four, even if the model started correctly
    54|- The fix is not to shorten the file — it's to **front-load** the critical rules (signature phrases, hard bans, core patterns) in the first 100 lines and push extended examples and edge cases further down
    55|- Token budgets act as a forcing function: if you cap a context package at 400 tokens, the module author is forced to front-load only what actually matters
    56|
    57|Applied to skill files and CLAUDE.md: the routing/priority rules and the hardest constraints go first. Nuance and examples go last. Assume the model will read the beginning reliably, the end reliably, and the middle partially.
    58|
    59|---
    60|
    61|## Common Pitfalls
    62|
    63|- **Assuming more context is safer** — it rarely is; it increases hallucination surface and token cost
    64|- **Including test files by default** — tests define behaviour but are rarely needed when implementing non-test code
    65|- **No explicit ignore list** — without it, the execution agent may independently fetch irrelevant files via tool calls
    66|- **Context creep across milestones** — files from earlier project phases stay in context long after they stop being relevant
    67|- **Critical rules buried in the middle** — the primacy-recency curve means anything important in lines 200-800 of a 1,000-line prompt is at highest risk of being underweighted
    68|
    69|## Counter-arguments & Gaps
    70|
    71|The U-shaped attention curve (Liu et al. "Lost in the Middle" 2023) is the canonical evidence for aggressive context curation — but subsequent work shows the effect is partially an artifact of position-embedding choices in older models. Frontier long-context models (Claude 3+, Gemini 1.5+) exhibit substantially flatter attention curves across 100k+ tokens; the "middle" failure mode may be smaller than the folk advice suggests for current-generation models.
    72|
    73|Summarisation as a context-management strategy is lossy in ways that are hard to audit. The summary is a model-written artefact that the next model step treats as authoritative; errors compound silently. [[anthropic]]'s own research on context compression shows that preserving raw references with targeted retrieval beats summary-based compression on recall tasks.
    74|
    75|Tight context budgets can induce sycophantic shortcutting. When the model's scratchpad is aggressively pruned, it can lose the intermediate reasoning needed to catch errors — the cost-optimization win becomes a quality loss that doesn't show up until production. The right budget is task-dependent and experimental, not a universal rule.
    76|
    77|Open questions: (a) at what context length does primacy-recency stop mattering enough to shape prompt design? (b) Is there a principled way to quantify summarisation information loss before running the pipeline, rather than after the quality regression?
    78|
    79|What would change the verdict on aggressive summarisation: an ablation showing summary-compressed context matches raw-reference context on reasoning-heavy tasks. Current evidence shows a consistent gap in favor of raw references.
    80|
    81|## See Also
    82|
    83|- [Context Manager Agent Pattern](../patterns/pattern-context-manager-agent.md)
    84|- [Task Decomposition](../concepts/task-decomposition.md)
    85|- [External Memory Pattern](../patterns/pattern-external-memory.md)
    86|- [Multi-Agent Systems](../concepts/multi-agent-systems.md)
    87|- [Cost Optimization](../concepts/cost-optimization.md)
    88|