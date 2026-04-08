---
id: 01KNNVX2QJWPX645TKMVM3JX4S
title: State Persistence
type: concept
tags: [agentic, state, checkpointing, recovery, idempotency, resumption]
confidence: high
sources:
  - "Anthropic: Building Effective Agents (2024)"
  - "Distributed systems: checkpoint-restart patterns"
  - "LangGraph state management documentation"
created: 2026-04-04
updated: 2026-04-04
related:
  - "[[concepts/memory-systems]]"
  - "[[concepts/context-management]]"
  - "[[concepts/human-in-the-loop]]"
  - "[[patterns/pattern-external-memory]]"
  - "[[patterns/pattern-idempotent-tools]]"
status: stable
---

## TL;DR

State persistence is the mechanism that lets agents survive failures, hand off to other agents, and resume long-running tasks without starting from scratch. Checkpoint early, checkpoint often, and design state schemas with resumption in mind. The alternative — losing 2 hours of agent work to a context timeout — is not acceptable in production.

---

## Definition

State persistence is the practice of serializing and storing an agent's current state at meaningful points during execution so that: (1) if the agent fails, it can resume from the last checkpoint; (2) if the session ends, a new session can pick up where the previous left off; (3) if a human needs to review, they have a recoverable snapshot.

---

## How It Works

### What Is "Agent State"?

Agent state is everything needed to resume execution faithfully:

```python
@dataclass
class AgentCheckpoint:
    # Identity
    task_id: str
    session_id: str
    checkpoint_id: str
    created_at: datetime

    # Task context
    original_task: str
    goal: str
    constraints: list[str]

    # Progress tracking
    completed_steps: list[CompletedStep]
    current_step: str
    pending_steps: list[PlannedStep]

    # World state (what the agent believes is true)
    artifacts_created: list[Artifact]  # files, records, etc.
    observations: list[Observation]    # tool results
    decisions: list[Decision]          # key decisions made

    # Resumption context
    context_summary: str    # compressed context for new session
    next_action: str        # what to do first on resume
    open_questions: list[str]  # unresolved issues
```

### When to Checkpoint

Checkpoint at every meaningful state transition, not on a timer:

- After completing a discrete subtask
- After any irreversible action (write, send, deploy)
- Before starting a risky operation
- At the end of each major phase
- When context is compressed (so compressed state is preserved)
- Before handing off to a sub-agent

```python
class CheckpointManager:
    def after_step(self, step: CompletedStep, state: AgentState):
        if step.is_milestone or step.is_irreversible:
            self.save(state.to_checkpoint())

    def before_risky_action(self, action: AgentAction, state: AgentState):
        checkpoint = state.to_checkpoint()
        checkpoint.next_action = action.describe()
        checkpoint.rollback_available = True
        self.save(checkpoint)
```

### Crash Recovery

The agent checks for an existing checkpoint before starting:

```python
def start_agent(task_id: str, task: str) -> AgentResult:
    checkpoint = checkpoint_manager.load_latest(task_id)

    if checkpoint:
        print(f"Resuming from checkpoint {checkpoint.checkpoint_id}")
        context = rebuild_context_from_checkpoint(checkpoint)
        return agent.resume(context)
    else:
        return agent.start(task)

def rebuild_context_from_checkpoint(checkpoint: AgentCheckpoint) -> list[Message]:
    return [
        system_message(BASE_SYSTEM_PROMPT),
        system_message(f"[RESUMED FROM CHECKPOINT]\n{checkpoint.context_summary}"),
        user_message(f"Continue the task. Completed steps:\n{format_steps(checkpoint.completed_steps)}\n\nNext action: {checkpoint.next_action}")
    ]
```

### Idempotent Replay

When resuming, the agent must not re-execute actions it already completed. This requires:

1. **Action log**: Every action taken is logged with its outcome
2. **Skip-if-done check**: Before taking any action, check if it's in the completed log
3. **Idempotent tools**: Tools that can safely be re-called produce the same outcome (see [[patterns/pattern-idempotent-tools]])

```python
async def execute_action(action: PlannedAction, checkpoint: AgentCheckpoint):
    if action.id in checkpoint.completed_action_ids:
        return checkpoint.get_result(action.id)  # return prior result

    result = await execute(action)
    checkpoint.record_completion(action.id, result)
    checkpoint_manager.save(checkpoint)
    return result
```

---

## Where to Store State

| Storage | Use Case | Pros | Cons |
|---------|----------|------|------|
| Local files (JSON) | Single-machine, dev | Simple, git-trackable | Not distributed |
| SQLite | Single-machine, production | Transactions, queryable | Not distributed |
| PostgreSQL / DynamoDB | Multi-machine, production | Distributed, reliable | Infra overhead |
| Redis | Fast ephemeral state | Low latency | Data loss on restart |
| S3/object storage | Large artifacts | Cheap, durable | Not queryable |

For Claude Code agents: local JSON files work for most cases. For production multi-agent systems: a proper DB with transaction support.

### File Format for Local State

```json
{
  "format_version": "1.2",
  "task_id": "TASK-4821",
  "checkpoint_id": "chk_20260404_103045",
  "created_at": "2026-04-04T10:30:45Z",
  "status": "in_progress",
  "goal": "Refactor auth module to support OAuth2",
  "completed_steps": [
    {
      "id": "step_1",
      "description": "Read existing auth module",
      "completed_at": "2026-04-04T10:15:00Z",
      "artifacts": ["src/auth/index.ts analyzed"],
      "outcome": "Identified 3 functions needing refactor"
    }
  ],
  "current_step": "Implement OAuth2 token refresh",
  "context_summary": "Auth module uses JWT with 1hr expiry. No refresh logic. Need to add refresh token endpoint and update token validation middleware.",
  "artifacts_created": [],
  "next_action": "Write failing test for refresh token endpoint"
}
```

### State Schema Design

- **Version the schema** (`format_version` field): checkpoint format will evolve; older checkpoints must remain readable
- **Separate concerns**: world state (what exists) vs progress state (what's been done) vs context (what agent needs to resume)
- **Self-describing**: A human reading the checkpoint should understand the agent's situation without other context
- **Append-only for completed steps**: Never modify a completed step record; append new entries

---

## Resumption Patterns

**Warm resume**: Load checkpoint, inject as context, continue execution. Works when the context window is fresh.

**Cold resume**: Load checkpoint, start a new session, reconstruct minimal context from checkpoint summary. Required when the original session expired or context is too stale.

**Cross-agent handoff**: One agent's checkpoint becomes another agent's starting context. Requires explicit handoff packet format (see [[concepts/context-management]]).

---

## Risks & Pitfalls

- **Checkpoint staleness**: Agent resumes from a 3-hour-old checkpoint; the world has changed (someone else edited the file). Validate world state at resume time.
- **Partial checkpoint**: Checkpoint write fails midway; checkpoint is corrupt. Use atomic writes (write to temp, then rename).
- **Action re-execution on resume**: Agent doesn't check if action was already completed; executes it twice. Use idempotent tools and action logs.
- **Checkpoint bloat**: Storing full tool outputs in every checkpoint; checkpoint files grow to MB after 10 steps. Store references to artifacts, not the artifacts themselves.
- **Missing rollback**: Agent took an irreversible action, then failed. Checkpoint shows the action completed; resume skips it; but it was actually partially applied. Design rollback plans for irreversible actions before executing them.

---

## Related Concepts

- [[concepts/memory-systems]] — persistent memory as a complement to checkpointing
- [[concepts/context-management]] — compressing context before checkpointing
- [[concepts/human-in-the-loop]] — HITL checkpoints as a special case of state persistence
- [[patterns/pattern-idempotent-tools]] — making replay safe
- [[patterns/pattern-external-memory]] — file-based external memory for agent state

---

## Sources

- Anthropic "Building Effective Agents" (2024)
- Distributed systems checkpoint-restart literature
- LangGraph state management documentation
