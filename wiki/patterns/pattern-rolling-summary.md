---
id: 01KNNVX2R2RXFB8XKRZ1XKCCNP
title: Rolling Summary
type: pattern
category: memory
problem: Long agentic sessions hit context window limits losing early conversation
solution: Periodically compress old context into a structured summary; slide the window forward
tradeoffs:
  - "Extends effective session length vs information loss in compression"
  - "Preserves task continuity vs summary may miss detail needed later"
  - "Low-cost at compression time vs costly to recover lost information"
tags: [memory, context, compression, summarization, sliding-window]
confidence: high
sources:
  - "LangChain memory: ConversationSummaryBufferMemory"
  - "Practical context management patterns (2024)"
created: 2026-04-04
updated: 2026-04-04
---

## Problem

Agent loops accumulate context. After 15-20 iterations with verbose tool outputs, a 200K context window fills up. The default behavior — dropping the oldest messages — silently removes: the original task description, early constraints, decisions that still affect the current state, and early tool outputs that are still relevant. The agent continues, unaware it has lost critical context. Output quality degrades.

---

## Solution

Before the context overflows, pause and compress: summarize the oldest N messages into a structured snapshot, replace them with the summary, and continue. The "window" slides forward while a record of what happened is preserved in compressed form. Critical information (decisions, constraints, active artifacts) is explicitly preserved in the summary schema.

```
[turn 1][turn 2][turn 3]...[turn 15][turn 16][turn 17][turn 18][turn 19][turn 20]
                         ↑ Compression threshold reached (70% full)
[SUMMARY: turns 1-15][turn 16][turn 17][turn 18][turn 19][turn 20]
```

---

## Implementation Sketch

### Trigger

```python
def should_compress(messages: list[Message], threshold: float = 0.70) -> bool:
    """Trigger compression when context is threshold% full."""
    current_tokens = count_tokens(messages)
    return (current_tokens / MAX_CONTEXT_TOKENS) >= threshold

# In the agent loop:
while not done:
    if should_compress(messages):
        messages = compress_context(messages)
    response = await llm.call(messages=messages)
    messages.append(response)
    # process response...
```

### Compression Function

```python
SUMMARY_SCHEMA = """Produce a structured summary preserving:

## GOAL
[The original task, verbatim if possible]

## COMPLETED STEPS
[Bullet list of what has been done and what artifacts were produced]

## KEY DECISIONS
[Decisions made that still affect remaining work]

## ACTIVE CONSTRAINTS
[Rules or constraints that must continue to be honored]

## CURRENT STATE
[What the world looks like right now — file states, env state, etc.]

## OPEN QUESTIONS
[Unresolved issues or blockers]

## NEXT PLANNED ACTION
[What the agent was about to do when compression triggered]

Keep total length ≤ 800 words. Include all decisions and constraints. Omit: raw tool outputs, intermediate reasoning that led to completed steps."""

def compress_context(messages: list[Message], keep_recent: int = 5) -> list[Message]:
    """Compress all but the most recent messages into a structured summary."""

    # Always keep: system prompt (index 0), last N messages
    system_prompt = messages[0]
    recent = messages[-keep_recent:]
    to_compress = messages[1:-keep_recent]

    if not to_compress:
        return messages  # Nothing to compress yet

    # Generate the summary
    summary_text = llm.call(
        model="claude-haiku-4-5",  # cheap model for compression
        temperature=0,
        messages=[
            {"role": "user", "content": f"Summarize this conversation:\n\n{format_messages(to_compress)}\n\n{SUMMARY_SCHEMA}"}
        ]
    )

    # Build compressed context
    summary_message = {
        "role": "system",
        "content": f"[CONTEXT SUMMARY — replaces earlier messages]\n{summary_text}"
    }

    compressed = [system_prompt, summary_message] + list(recent)

    log_compression_event(
        original_tokens=count_tokens(messages),
        compressed_tokens=count_tokens(compressed),
        turns_compressed=len(to_compress),
    )

    return compressed
```

### Summary Schema Explained

Why each section:

**GOAL** — The original task. In long sessions, the agent can drift from its original purpose. Preserving this verbatim is non-negotiable.

**COMPLETED STEPS** — Prevents the agent from re-doing work it already did. Common issue without this: agent re-reads files it already analyzed.

**KEY DECISIONS** — The most important section. A decision to use approach A over approach B affects all future steps. Losing this causes re-litigation of settled questions.

**ACTIVE CONSTRAINTS** — "Don't modify the User schema," "Only work in the feature/ branch," etc. Constraints must outlast their origin turn.

**CURRENT STATE** — The ground truth about the world. What files were created? What is in the database? What env vars are set? Without this, the agent has no anchor.

**OPEN QUESTIONS** — Prevents the agent from forgetting known blockers and wasting time on them.

**NEXT PLANNED ACTION** — Smooth resumption. Without this, the agent may re-derive the next action from the summary, which costs tokens and may produce a different (wrong) answer.

---

## When to Trigger Compression

| Trigger | Threshold | Rationale |
|---------|-----------|-----------|
| Token percentage | 70% full | Leave room for response + next few iterations |
| Turn count | Every 10-15 turns | Predictable; easy to monitor |
| Explicit milestone | After completing a phase | Semantically clean break point |
| Pre-delegation | Before spawning a sub-agent | Sub-agent gets clean context |

70% threshold is standard. Below 60% wastes compression calls on small contexts. Above 80% risks running out of room during compression (the summary call itself produces tokens).

---

## What to Preserve vs Discard

| Content Type | Preserve | Discard |
|---|---|---|
| Original task | Always | Never |
| Active constraints | Always | Only when explicitly lifted |
| Completed step summaries | Always (as 1-2 sentences) | Raw tool outputs |
| Decisions made | Always | Reasoning that led to decision |
| Intermediate reasoning | No | Yes (after action taken) |
| Error messages | Only if error is unresolved | After error resolved |
| Tool outputs | Summarize; discard raw | Raw outputs after processed |

---

## Multi-Level [[pattern-rolling-summary]]

For very long sessions, compress summaries of summaries:

```
[Raw turns] → [Session summary] → [Epoch summary] → [Project summary]
```

Each level is less detailed but longer-lived. The project summary persists across sessions (episodic memory). The epoch summary covers a phase. The session summary covers one session's work.

---

## Tradeoffs

| | Pros | Cons |
|---|------|------|
| Extends sessions | Agent can work indefinitely without context overflow | Information is lost in compression; no lossless compression |
| Preserves structure | Schema forces preservation of high-value context | Summary quality depends on compression model quality |
| Low latency at trigger | Compression is one extra call, amortized over many turns | Compression adds latency at the trigger point |
| Auditable | Summary is readable and inspectable | May not reflect exactly what happened |

---

## When To Use

- Any agent loop expected to run > 10 iterations
- Sessions with verbose tool outputs (file reads, test outputs, API responses)
- Multi-day tasks where session context can't be maintained

## When NOT To Use

- Short tasks (< 5 iterations) — overhead not worth it
- When all context is equally important (rare) — compression always loses something
- Real-time applications where the added latency of a compression call is unacceptable

---

## Related Patterns

- [[patterns/pattern-hot-cache]] — pre-loading stable context (avoids initial bloat)
- [[patterns/pattern-external-memory]] — writing summaries to files for cross-session persistence
- [[concepts/context-management]] — the full context management toolkit
- [[concepts/memory-systems]] — [[pattern-rolling-summary]] implements episodic memory compression

---

## Sources

- LangChain ConversationSummaryBufferMemory documentation
- Practical context management patterns (2024)
