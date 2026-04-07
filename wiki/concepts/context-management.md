---
title: Context Management
type: concept
tags: [agentic, context, memory, compression, handoff, checkpointing]
confidence: high
sources:
  - "Anthropic: Claude context window documentation"
  - "Anthropic: Building Effective Agents (2024)"
  - "LangChain memory documentation"
created: 2026-04-04
updated: 2026-04-04
related:
  - "[[concepts/memory-systems]]"
  - "[[concepts/agent-loops]]"
  - "[[concepts/state-persistence]]"
  - "[[patterns/pattern-rolling-summary]]"
  - "[[patterns/pattern-hot-cache]]"
  - "[[concepts/cost-optimization]]"
status: stable
---

## TL;DR

Context windows are finite. In long agentic sessions, they fill up — usually at the worst possible moment. Proactive context management (compression, checkpointing, handoff protocols) is the difference between a session that completes and one that silently degrades or crashes.

---

## Definition

Context management is the set of techniques for controlling what information lives in the active context window at any given moment, how information is compressed or offloaded when limits approach, and how state is preserved and restored across context boundaries.

---

## How It Works

### Context Window Limits

Claude's context window (as of early 2026) is 200K tokens. That sounds large until you're 40 iterations into an agent loop with verbose tool outputs. Real limits you'll hit:

- **Effective attention degradation**: Even before hard truncation, models lose track of early context. Empirically, instructions given at token 0 are less reliable than instructions at token N-3000.
- **Hard truncation**: The host/API will reject requests exceeding the limit. Unlike RAM overflows, you don't always get a graceful error — some frameworks silently drop the oldest messages.
- **Cost cliff**: Each input token costs money. A 150K-token context on every iteration of a 20-step loop is a 3M-token bill before a single output token.

### What Happens When You Hit the Limit

Without proactive management:
1. Framework drops oldest messages (usually) — your system prompt and early context disappears
2. Model continues without its original instructions — behavior degrades unpredictably
3. Model may not realize instructions are gone — it proceeds confidently on degraded context
4. Output quality drops, but the agent doesn't signal failure

This is a **silent failure** — see [[concepts/agent-failure-modes]].

---

## Compression Strategies

### Summarization Before Continuation

When approaching the context limit (e.g., >70% full), pause the agent loop and call a compression step:

```python
def compress_context(messages: list[Message], threshold: float = 0.7) -> list[Message]:
    token_count = count_tokens(messages)
    if token_count / MAX_TOKENS < threshold:
        return messages

    # Keep system prompt + last N messages verbatim
    keep_recent = messages[-5:]
    to_compress = messages[1:-5]  # everything except system prompt and recent

    summary = llm.summarize(to_compress, prompt=COMPRESSION_PROMPT)
    return [messages[0], Message(role="system", content=f"[CONTEXT SUMMARY]\n{summary}"), *keep_recent]
```

The `COMPRESSION_PROMPT` should instruct the model to preserve: decisions made, actions taken, current state, open questions, and active constraints. Discard: raw tool outputs, intermediate reasoning that led to completed steps, verbose error messages.

### Sliding Window

Maintain a fixed window of the N most recent messages. Simple to implement, but risks losing critical early context (the system prompt, user goal, constraints established early on).

Mitigation: pin essential messages (system prompt, goal statement, active constraints) and slide only the intermediate messages.

```python
PINNED_COUNT = 3  # system prompt + goal + constraints
WINDOW_SIZE = 20

def sliding_window(messages):
    pinned = messages[:PINNED_COUNT]
    sliding = messages[PINNED_COUNT:]
    return pinned + sliding[-WINDOW_SIZE:]
```

### Selective Retention

Not all context is equally important. Classify messages by type and apply different retention policies:
- **Decisions**: Keep permanently (they affect future actions)
- **Tool outputs**: Compress to 1-2 sentence summary after processing
- **Reasoning traces**: Discard after the action they informed is complete
- **Error messages**: Keep until the error is resolved, then discard

### External Compression

Write context to external storage and load only what's needed:
- Completed task summaries → file or DB
- Tool output archives → indexed files, query on demand
- Decision log → append-only file, always included verbatim

---

## Handoff Protocols

When one agent hands off to another (multi-agent systems, or context reset between sessions):

**Minimum viable handoff packet:**
```yaml
goal: "the original task statement, verbatim"
status: "what has been completed"
current_state: "what the current state of the world is"
next_action: "what the next agent should do first"
constraints: "active constraints that must be preserved"
artifacts: ["list of files/resources created"]
open_questions: ["blockers that need resolution"]
```

This packet should be 200-400 tokens — enough for the next agent to orient without re-reading the entire prior context.

---

## Checkpointing Mid-Task

For long tasks, checkpoint state at meaningful milestones (not just on timer):
- After completing a discrete subtask
- Before a risky operation
- When handing off to a sub-agent

Checkpoint format (write to file):
```json
{
  "task_id": "...",
  "checkpoint_at": "2026-04-04T10:30:00Z",
  "completed_steps": [...],
  "current_step": "...",
  "state": {...},
  "artifacts": [...],
  "next_actions": [...]
}
```

On resumption, the agent reads the checkpoint and reconstructs its understanding of the world rather than replaying the entire conversation.

---

## Context Budget Accounting

Track context usage explicitly:

```python
def context_budget_remaining(messages, reserved_for_output=2000):
    used = count_tokens(messages)
    available = MAX_CONTEXT_TOKENS - reserved_for_output
    return available - used

# In the loop:
if context_budget_remaining(messages) < MIN_SAFE_REMAINING:
    compress_context(messages)
```

Reserve tokens for output — running out of context mid-response produces truncated, incoherent output.

---

## When To Use

- Any agent loop expected to run more than 5-10 iterations
- Multi-agent systems where context carries across agents
- Long-horizon tasks (code refactors, research, document generation)
- When tool outputs are verbose (API responses, file contents, test output)

---

## Risks & Pitfalls

- **Over-compression**: Discarding information that was needed 10 steps later. Err toward preserving decisions and state over reasoning.
- **Summary hallucination**: The compressing LLM misremembers what was in the context. Use structured compression schemas to constrain what can be invented.
- **Pinned context bloat**: Pinned messages grow over time as constraints accumulate. Audit and prune actively.
- **Cross-agent context mismatch**: Agent A compresses and hands off; Agent B's compressed context misses something Agent A considered obvious. Explicit handoff packets mitigate this.

---

## Related Concepts

- [[concepts/memory-systems]] — persistent memory as an alternative to long contexts
- [[concepts/state-persistence]] — checkpointing and crash recovery
- [[concepts/agent-loops]] — the loops that generate context growth
- [[patterns/pattern-rolling-summary]] — implementation of rolling compression
- [[patterns/pattern-hot-cache]] — caching frequently-needed context externally

---

## Sources

- Anthropic Claude context window documentation
- Anthropic "Building Effective Agents" (2024)
- Greg Kamradt's "Lost in the Middle" analysis (2023)
