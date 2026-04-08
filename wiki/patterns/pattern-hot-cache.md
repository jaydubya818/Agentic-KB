---
id: 01KNNVX2QZZ9N5QJ97Y8YFZQYZ
title: Hot Cache
type: pattern
category: memory
problem: Frequently-needed context wastes tokens being re-read on every query
solution: Maintain a ≤500-word summary file of most-used context; agent reads it first
tradeoffs:
  - "Eliminates redundant reads vs cache staleness if underlying data changes"
  - "Small fixed token cost vs maintaining cache update discipline"
  - "Fast context loading vs may miss detail not in the summary"
tags: [memory, caching, context, performance, cost]
confidence: high
sources:
  - "Practical agentic system design patterns (2024-2025)"
  - "Anthropic: Prompt caching documentation"
created: 2026-04-04
updated: 2026-04-04
---

## Problem

In long-running agentic sessions or multi-session workflows, agents repeatedly re-read the same reference material: the README, the architecture doc, the API schema, the team's coding standards. Each re-read costs tokens and time. The agent may have read the same file 20 times across 20 sessions — paying 20× the cost for 1× the value.

---

## Solution

Maintain a hot cache file (`context-cache.md` or `.agent-cache.md`) containing a ≤500-word distillation of the most frequently-needed context. The agent is instructed to read the cache file first at the start of every session. The cache is updated only when the underlying information changes.

```
Session start → read context-cache.md → [has needed context] → proceed
                                       → [needs detail] → read specific file
```

---

## Implementation Sketch

### Cache File Structure

```markdown
# Agent Context Cache
_Last updated: 2026-04-04 | Covers: architecture, coding standards, key conventions_

## Project Overview (30 words)
TypeScript/React SaaS app. Backend: Express + Prisma + PostgreSQL. Frontend: Next.js 14 App Router.
Auth: JWT + refresh tokens via httpOnly cookies.

## Key File Locations
- Entry points: `src/app/` (Next), `src/server/` (Express)
- Auth: `src/server/middleware/auth.ts`
- DB: `prisma/schema.prisma` + `src/server/db/`
- Tests: co-located with source (`*.test.ts`)

## Coding Standards (critical)
- All functions: explicit return types
- Error handling: named error classes extending Error
- DB: always parameterized queries; try-catch on every write
- API: validate with Zod at boundary; return `{ error, code, details }` shape
- Prefer pnpm. Never mix package managers.

## Current Sprint Focus
Working on auth overhaul (EPIC-42). Do not modify User model schema (locked).
Active branch: feature/auth-overhaul.

## Recent Decisions
- Switched from bcrypt to argon2 (2026-03-20): better GPU resistance
- Using server-side sessions for admin panel (2026-03-28): compliance requirement

## Do Not Touch (current)
- `src/legacy/` — deprecated, deletion planned Q3
- `prisma/migrations/` — never edit manually
```

### Cache Read Instruction (in system prompt)

```
At the start of every session:
1. Read `.agent-cache.md` in the project root.
2. Use this as your initial understanding of the project.
3. Only read additional files if you need detail beyond what the cache provides.
4. Do NOT re-read files whose content is already in the cache unless you need more detail than the cache entry provides.
```

### Update Triggers

```python
CACHE_UPDATE_TRIGGERS = [
    "architecture changed",          # New module, new pattern adopted
    "new decision made",             # ADR created or updated
    "sprint focus changed",          # End of sprint, new epic started
    "new constraint added",          # "don't touch X" added
    "coding standard changed",       # New linting rule, new convention
    "key file moved/renamed",        # File location entries become stale
]

async def maybe_update_cache(event: SystemEvent, cache_path: str):
    if event.type in CACHE_UPDATE_TRIGGERS:
        await update_cache(event, cache_path)

async def update_cache(event: SystemEvent, cache_path: str):
    current_cache = read_file(cache_path)
    updated = await llm.call(
        model="claude-haiku-4-5",  # Cheap model for cache maintenance
        messages=[{
            "role": "user",
            "content": f"""Update this cache file based on the new event.

Current cache:
{current_cache}

New event: {event.description}
Details: {event.details}

Rules:
- Keep total length ≤ 500 words
- If adding new info pushes over limit, remove the oldest or least relevant entry
- Never remove "Do Not Touch" entries without explicit instruction
- Update "Last updated" timestamp
- Keep all section headers"""
        }]
    )
    write_file(cache_path, updated)
```

---

## What Goes in the Cache

**Include**:
- Project overview (architecture, stack) — rarely changes
- Key file locations — changes only on structural refactors
- Coding standards / conventions — high-value, frequently referenced
- Current sprint focus / active constraints — changes per sprint
- Recent decisions — last 3-5 significant decisions

**Exclude**:
- Detailed implementation code (too large, changes too often)
- Exact API schemas (load from schema file on demand)
- Test results (too volatile)
- Anything > 2 weeks old without ongoing relevance

---

## Eviction Rules

When the cache approaches the 500-word limit, evict in this priority order:

1. Decisions older than 4 weeks with no ongoing impact
2. Sprint focus entries from completed sprints
3. File location entries for stable, rarely-accessed files
4. Details that are inferrable from other cache entries

Never evict:
- Active "Do Not Touch" constraints
- Architecture overview (too costly to regenerate per session)
- Current sprint focus

---

## Tradeoffs

| | Pros | Cons |
|---|------|------|
| Token efficiency | Eliminates N re-reads of the same content | Cache staleness: model has outdated understanding |
| Fast session start | Agent oriented in < 500 tokens | May miss detail not captured in cache entry |
| Low cost to maintain | Update only on change events | Requires discipline to maintain update triggers |
| Consistent context | All agents in a session start from the same base | Cache doesn't help if agents need highly specific detail |

---

## When To Use

- Multi-session projects where context re-loading is a recurring cost
- Multi-agent workflows where multiple agents need the same base context
- Projects with stable architecture documentation that's referenced constantly
- When prompt caching is already in use — the hot cache complements it

## When NOT To Use

- Single-session tasks — loading one file at start is fine without a cache
- Highly dynamic projects where context changes between every agent call
- Small projects where the full README is < 500 words — just include it directly

---

## Real Examples

- `.agent-cache.md` in every project root for Claude Code sessions
- `kb/hot-context.md` in a multi-agent knowledge base system
- `context-snapshot.md` maintained by the GSD session-report workflow

---

## Related Patterns

- [[patterns/pattern-rolling-summary]] — compressing old context (episodic), not just reference context
- [[patterns/pattern-external-memory]] — full external memory system (more complex)
- [[concepts/memory-systems]] — the semantic memory type this pattern implements
- [[concepts/cost-optimization]] — this pattern's primary value driver

---

## Sources

- Practical agentic system design patterns (2024-2025)
- Anthropic Prompt Caching documentation
