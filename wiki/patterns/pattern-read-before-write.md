---
id: 01KNNVX2R132SMXJSVTDW168F2
title: Read Before Write
type: pattern
category: tool-use
problem: Agents mutate state without reading current state first, causing overwrites and conflicts
solution: Every write operation is preceded by a read of the current state
tradeoffs:
  - "Safety via awareness vs extra read call cost"
  - "Prevents overwrites vs adds latency to every write"
  - "Required for correctness vs may feel redundant on new files"
tags: [tool-use, safety, idempotency, state, files, databases]
confidence: high
sources:
  - "Anthropic: Tool use best practices (2025)"
  - "Practical agentic system reliability patterns"
created: 2026-04-04
updated: 2026-04-04
---

## Problem

LLMs generate writes based on their model of the world, not the actual current state of the world. Their model of the world is based on what they've seen in context — which may be stale. If the agent writes without reading first:
- It may overwrite changes made by another agent, a human, or a previous step
- It may write to a file that already contains the content (duplicate)
- It may miss a conflict that should have caused a planning revision
- For databases: it may create a duplicate record or overwrite a record with stale values

The agent doesn't know it's doing this — it's confident in its (incorrect) model of the world.

---

## Solution

Before any write operation, the agent reads the current state of what it's about to write. This grounds the write in reality rather than the agent's prior model.

```
Intent to write file X
    → read file X (current state)
    → compare with intended write
    → if conflicts: resolve, adapt
    → if no conflict: write
```

---

## Implementation Sketch

### In Tool Design (Enforcement at the Tool Level)

The most robust approach: make [[pattern-read-before-write]] a property of the write tool itself, not a discipline the agent must remember.

```python
def write_file(path: str, content: str, mode: Literal["overwrite", "append", "create_only"] = "overwrite") -> str:
    """
    Write content to a file.

    IMPORTANT: Before calling this tool, read the file with read_file if it may already exist.
    This tool does NOT do the read for you — it writes exactly what you provide.

    mode:
    - overwrite: Replace entire file content (default). Safe only if you've read the current content.
    - append: Add content to end of file. Safe without reading (but read first if ordering matters).
    - create_only: Fail if file already exists. Safe for new file creation.
    """
    if mode == "create_only" and os.path.exists(path):
        return f"ERROR [file_exists]: File already exists at '{path}'. Use mode='overwrite' to replace, or choose a different path."

    # Write
    with open(path, "a" if mode == "append" else "w") as f:
        f.write(content)

    return f"SUCCESS: Written {len(content)} chars to '{path}'"
```

The `mode` parameter makes the agent declare its intent. `overwrite` without a prior read should be a code smell in your traces. `create_only` is safe without reading.

### In System Prompt (Instruction-Level)

```
File writing discipline:
1. Before writing to any existing file, ALWAYS read it first with read_file.
2. Before creating a new file, ALWAYS check if the file already exists with check_file_exists.
3. When modifying a file, only change the sections that need changing — preserve existing content.
4. After writing, verify by reading the file back and confirming the change is present.
```

### Enforcement via Tool Composition

```python
class SafeFileWriter:
    """Write tool that enforces read-before-write."""

    def __init__(self, file_reader: Callable[[str], str]):
        self.read = file_reader
        self._read_cache: dict[str, str] = {}

    def write(self, path: str, new_content: str) -> str:
        # Check if we've read this file in this session
        if path not in self._read_cache:
            current = self.read(path)
            if not current.startswith("ERROR"):
                self._read_cache[path] = current

        if path in self._read_cache:
            current = self._read_cache[path]
            # Check for conflicts
            if self._has_conflict(current, new_content):
                return (
                    f"CONFLICT: The current file content differs from what you may expect. "
                    f"Current content:\n{current[:500]}\n\nPlease incorporate the current content "
                    f"into your write rather than overwriting."
                )

        write_to_disk(path, new_content)
        self._read_cache[path] = new_content  # Update cache
        return f"SUCCESS: Written to '{path}'"

    def _has_conflict(self, current: str, new_content: str) -> bool:
        # Simple check: if the new content doesn't contain anything from current,
        # it's likely an accidental overwrite
        current_lines = set(current.splitlines())
        new_lines = set(new_content.splitlines())
        overlap = len(current_lines & new_lines) / max(len(current_lines), 1)
        return overlap < 0.1 and len(current) > 100  # < 10% overlap on substantial files
```

### Why LLMs Skip This

LLMs skip reads before writes because:
1. They're optimizing for task completion and a read is "overhead"
2. They believe their in-context model of the file is current (it often isn't)
3. The task description didn't emphasize it
4. Short-circuiting is rewarded during RLHF training (fewer steps = "more efficient")

Combat this via:
- Explicit system prompt instruction (above)
- Tool descriptions that remind of the requirement
- Automatic enforcement in the tool implementation
- Post-write verification (read back and confirm)

### Idempotency Relationship

[[pattern-read-before-write]] and idempotency are complementary. Idempotency makes retries safe; [[pattern-read-before-write]] makes writes correct. Both are needed:

| Scenario | [[pattern-read-before-write]] | Idempotency |
|----------|:-:|:-:|
| Agent retries on error | Not sufficient alone | Required |
| Agent writes stale content | Required | Not sufficient |
| Concurrent agent writes | Required (detect conflict) | Helpful (avoid duplicates) |

---

## Database Writes

The same principle applies to database operations:

```python
def update_user_email(user_id: str, new_email: str) -> str:
    # ALWAYS: read current state before update
    current = db.query("SELECT * FROM users WHERE id = $1", [user_id])
    if not current:
        return f"ERROR: No user found with ID {user_id}"

    if current.email == new_email:
        return f"No-op: email is already {new_email}"

    if current.email != expected_current_email:
        return f"CONFLICT: Current email is {current.email}, not {expected_current_email}. Aborting to prevent overwrite."

    db.execute("UPDATE users SET email = $1 WHERE id = $2", [new_email, user_id])
    return f"SUCCESS: Updated email to {new_email}"
```

This is the database equivalent of optimistic locking — check before write, abort on conflict.

---

## Tradeoffs

| | Pros | Cons |
|---|------|------|
| Correctness | Prevents silent overwrites | Extra read call cost and latency |
| Conflict detection | Catches concurrent modification | More complex conflict resolution logic |
| Audit trail | The read reveals current state in logs | If reads are expensive (large files), adds cost |
| Trust | Grounded in actual world state, not model beliefs | Model may still interpret current state incorrectly |

---

## When To Use

- Any write to a file that may already have content
- Any database update where the current state matters
- Any configuration change where partial application would be harmful
- Any multi-agent scenario where concurrent writes are possible

## When NOT To Use

- Creating a new file in a directory known to be empty (`create_only` mode is safer)
- Appending to a log file where ordering is irrelevant and conflicts are impossible
- When the tool is write-only by design and reads are handled elsewhere

---

## Related Patterns

- [[patterns/pattern-idempotent-tools]] — safe retry behavior
- [[patterns/pattern-tool-output-validation]] — validating what reads return
- [[patterns/pattern-confirm-before-destructive]] — extending this to destructive operations
- [[concepts/tool-use]] — tool design context

---

## Sources

- [[anthropic]] Tool Use best practices (2025)
- Practical agentic reliability engineering patterns
