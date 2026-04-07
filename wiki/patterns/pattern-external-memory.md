---
title: External Memory
type: pattern
category: memory
problem: Agent needs to remember information across sessions or share state with other agents
solution: Write structured data to files/DB on write; read on demand via targeted queries
tradeoffs:
  - "Persistent cross-session memory vs latency of read/write IO"
  - "Unlimited storage vs requires retrieval strategy to be useful"
  - "Shareable across agents vs requires coordination for concurrent writes"
tags: [memory, persistence, external-storage, cross-session, files]
confidence: high
sources:
  - "Cognitive Architectures for Language Agents (CoALA) (2023)"
  - "Practical agentic memory patterns (2024)"
created: 2026-04-04
updated: 2026-04-04
---

## Problem

In-context memory is ephemeral — it dies with the session. A sub-agent that discovers a critical fact can't share it with a sibling agent or preserve it for tomorrow's session. Rebuilding the same knowledge from scratch in every session wastes tokens, wastes time, and produces inconsistent results if the knowledge is derived (two agents may reach different conclusions from the same data).

---

## Solution

Write structured, reusable knowledge to an external store (files, DB) at write time. At read time, agents retrieve only the relevant subset — via direct path (if they know where to look) or via an index file (if they need to discover it). All agents write to the same store and can read each other's outputs.

```
Agent A discovers → writes → /memory/discoveries/2026-04-04-auth-gap.md
Agent B needs context → reads index → finds relevant file → reads targeted entry
Agent C new session → reads relevant entries → resumes from last state
```

---

## Implementation Sketch

### Memory Directory Structure

```
/memory/
├── index.md                    ← master index; all agents read this first
├── decisions/
│   ├── 2026-03-20-argon2.md   ← decision record (immutable after creation)
│   └── 2026-03-28-sessions.md
├── discoveries/
│   ├── 2026-04-04-auth-gap.md ← findings that may be temporary
│   └── 2026-04-03-schema.md
├── constraints/
│   └── sprint-42.md           ← active constraints; mutable
├── task-states/
│   └── TASK-4821.json         ← checkpoint files (see state-persistence)
└── artifacts/
    └── src-analysis.md        ← generated artifacts for reuse
```

### Index File Format

```markdown
# Memory Index
_Updated: 2026-04-04 | Managed by: all agents_

## How to Use This Index
Read this file first. Find relevant entries by category or keyword.
Load specific files on demand — don't load everything.

## Active Decisions (binding)
- `decisions/2026-03-20-argon2.md` — Use argon2 for password hashing
- `decisions/2026-03-28-sessions.md` — Admin panel uses server-side sessions

## Active Constraints (non-negotiable)
- `constraints/sprint-42.md` — Sprint 42 constraints (User schema locked, etc.)

## Discoveries (may be outdated)
- `discoveries/2026-04-04-auth-gap.md` — Missing refresh token validation (2026-04-04)
- `discoveries/2026-04-03-schema.md` — Prisma schema analysis

## Task States (checkpoints)
- `task-states/TASK-4821.json` — Auth overhaul (in progress, 60% complete)

## Artifacts (reusable outputs)
- `artifacts/src-analysis.md` — Source tree analysis (2026-04-01)
```

### Write Protocol

```python
def write_memory_entry(
    category: str,       # "decisions" | "discoveries" | "constraints" | "artifacts"
    title: str,
    content: str,
    tags: list[str] = [],
    agent_id: str = "unknown",
) -> str:
    """Write a new entry to external memory. Returns the file path."""

    # Generate path
    date_str = datetime.now().strftime("%Y-%m-%d")
    slug = slugify(title)
    path = f"memory/{category}/{date_str}-{slug}.md"

    # Write entry
    entry = f"""---
title: {title}
category: {category}
created: {datetime.now().isoformat()}
created_by: {agent_id}
tags: {tags}
status: active
---

{content}
"""
    write_file(path, entry)

    # Update index (atomic operation to prevent partial updates)
    update_index(category, title, path)

    return path

def update_index(category: str, title: str, path: str):
    """Append new entry to the master index."""
    index_path = "memory/index.md"
    current = read_file(index_path)
    # Append under the correct category section
    updated = append_to_section(current, category, f"- `{path}` — {title}")
    write_file(index_path, updated)
```

### Read Protocol

```python
async def read_memory(query: str, agent_context: str) -> list[MemoryEntry]:
    """Load relevant memory entries for an agent's current context."""

    # Step 1: Always read the index first
    index = read_file("memory/index.md")

    # Step 2: Ask an LLM (cheap model) to identify relevant entries
    relevant_paths = await llm.call(
        model="claude-haiku-4-5",  # cheap for index navigation
        messages=[{
            "role": "user",
            "content": f"""Given this agent context and query, identify which memory entries to load.

Agent context: {agent_context}
Query: {query}

Memory index:
{index}

List the file paths to load (max 5, only the most relevant):"""
        }]
    )

    # Step 3: Load the identified entries
    paths = parse_file_list(relevant_paths)
    entries = [read_file(p) for p in paths if file_exists(p)]
    return [parse_entry(e) for e in entries]
```

### Read-Before-Write

Before writing a new memory entry, check if one already exists for this topic:

```python
async def write_with_dedup(category: str, title: str, content: str) -> str:
    # Check for existing entry on this topic
    index = read_file("memory/index.md")
    existing = find_similar_entry(index, category, title)

    if existing:
        # Update the existing entry rather than creating a duplicate
        return update_entry(existing.path, content, append=True)
    else:
        return write_memory_entry(category, title, content)
```

See [[patterns/pattern-read-before-write]] for the underlying principle.

---

## File Format Choices

| Format | Use Case | Tradeoffs |
|--------|----------|-----------|
| Markdown | Human-readable notes, decisions | Easy to read/write; hard to query programmatically |
| JSON | Structured data, checkpoints | Machine-queryable; harder for humans to edit |
| JSONL | Append-only logs, event streams | Easy appends; sequential read required |
| YAML | Configuration, metadata-heavy | Human-friendly; slightly more complex to parse |

For most agent memory: Markdown with YAML frontmatter. It's readable by humans AND by agents, and it's git-trackable.

---

## Concurrent Write Safety

When multiple agents write simultaneously:

```python
import fcntl

def safe_write(path: str, content: str):
    """File-locked write to prevent concurrent corruption."""
    lock_path = path + ".lock"
    with open(lock_path, "w") as lock_file:
        fcntl.flock(lock_file, fcntl.LOCK_EX)  # exclusive lock
        try:
            write_file(path, content)
        finally:
            fcntl.flock(lock_file, fcntl.LOCK_UN)
    os.remove(lock_path)
```

For distributed systems: use DB transactions or optimistic locking rather than file locks.

---

## Tradeoffs

| | Pros | Cons |
|---|------|------|
| Cross-session | Memory survives session end, context compression | Read latency (file IO or DB query) |
| Cross-agent | All agents access the same memory store | Concurrent writes require coordination |
| Unlimited capacity | Not bounded by context window | Retrieval requires strategy; load everything = defeat the purpose |
| Inspectable | Files are readable by humans | Maintenance burden (stale entries accumulate) |

---

## When To Use

- Multi-session projects where agents need to remember prior work
- Multi-agent systems where agents need to share state
- Any knowledge that should outlive the current session
- Checkpointing long-running tasks

## When NOT To Use

- Single-session tasks where in-context memory is sufficient
- Very frequent writes (per-iteration) — high IO overhead; use in-context state instead, checkpoint at milestones
- When all agents are read-only (no need to write to external memory)

---

## Real Examples

- GSD PROGRESS.md as episodic memory for session state
- `~/.claude/CLAUDE.md` and skill files as procedural memory
- This Agentic KB as semantic memory for Jay's agents
- Task checkpoint files in `memory/task-states/`

---

## Related Patterns

- [[patterns/pattern-hot-cache]] — pre-loading high-frequency memory
- [[patterns/pattern-rolling-summary]] — compressing in-context memory into external form
- [[patterns/pattern-read-before-write]] — always read before writing to avoid overwrites
- [[concepts/memory-systems]] — the four-type taxonomy this pattern implements

---

## Sources

- Cognitive Architectures for Language Agents (CoALA) — Sumers et al. (2023)
- Practical agentic memory patterns (2024)
