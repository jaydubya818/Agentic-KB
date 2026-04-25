---
id: 01KQ2YF60ECJ1FQVMPC3K499GR
title: Anchored Iterative Summarization
type: pattern
tags: [context, memory, patterns, agents, optimization]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [context-management, memory-systems, agent-loops]
---

# Anchored Iterative Summarization

A context compression pattern that maintains a persistent structured summary as an "anchor," merging newly-compressed spans into it incrementally rather than regenerating from scratch on each compression event.

## When to Use

- Long-running agent sessions (coding assistants, research agents, multi-step workflows)
- Tasks where artifact tracking is critical (which files changed, which decisions were made)
- When you need human-readable compression output that can be audited or debugged
- When repeated compression cycles are expected over a single session
- When the cost of re-fetching lost context is high relative to compression savings

## Structure

```
┌─────────────────────────────────┐
│        Persistent Anchor        │
│  (Structured summary: always    │
│   present at context start)     │
└────────────────┬────────────────┘
                 │
         Compression trigger
                 │
                 ▼
┌─────────────────────────────────┐
│   Summarize truncated span      │
│   (new content only)            │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│   Merge into existing anchor    │
│   (section-by-section update)   │
└─────────────────────────────────┘
```

The anchor is a markdown document with fixed sections. Each compression event summarizes only the *newly-truncated* span and merges it into the relevant sections of the anchor — it does not regenerate the anchor from scratch.

## Example

**Anchor structure:**

```markdown
## Session Intent
Refactor authentication module to use Redis session storage.

## Files Modified
- auth.controller.ts: Fixed JWT token generation logic
- config/redis.ts: Added connection pooling (pool size: 10)
- tests/auth.test.ts: Added mock setup for Redis client

## Decisions Made
- Redis connection pool (not per-request) to avoid connection exhaustion
- Exponential backoff retry for transient Redis failures (max 3 retries)
- JWT expiry set to 24h for session tokens

## Current State
- 14/16 tests passing
- Failing: mock setup for session service tests

## Next Steps
1. Fix session service test mocks
2. Run full integration test suite
3. Update API documentation
```

When context fills again, the agent summarizes the latest conversation turn and merges new file edits into `## Files Modified`, new choices into `## Decisions Made`, and so on.

## Trade-offs

| Dimension | Assessment |
|---|---|
| Compression ratio | Moderate — lower than opaque compression |
| Information fidelity | High — structure forces preservation |
| Artifact tracking | Best of the three approaches, but still ~2.5/5.0 |
| Interpretability | High — anchor is human-readable |
| Compounding loss risk | Low — incremental merges don't regenerate history |
| Implementation complexity | Medium — requires structured prompt + merge logic |

**Key insight**: Dedicated sections act as checklists the summarizer *must* populate. You cannot skip `## Files Modified` without noticing. This structure prevents silent information drift that plagues free-form summarization.

**Limitation**: Artifact trail integrity remains the hardest problem (~2.5/5.0). For systems where complete file-change tracking is critical, consider supplementing with a **separate artifact index** maintained by agent scaffolding outside the summarization loop.

## Related Patterns

- **Opaque Compression** — alternative when compression ratio matters more than interpretability
- **Regenerative Full Summary** — simpler but risks compounding loss across cycles
- **Artifact Index** — specialized external tracking to complement any summarization strategy

## See Also

- [Context Management](../concepts/context-management.md)
- [Memory Systems](../concepts/memory-systems.md)
- [Agent Loops](../concepts/agent-loops.md)
- [Cost Optimization](../concepts/cost-optimization.md)
