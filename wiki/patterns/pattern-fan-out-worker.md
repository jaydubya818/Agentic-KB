---
id: 01KNNVX2QZHPFN6S4TBYKZYAD7
title: Fan-Out Worker
type: pattern
category: orchestration
problem: A task has N independent subtasks that can run in parallel
solution: Orchestrator spawns N worker agents simultaneously, collects results, aggregates
tradeoffs:
  - "Speed gain from parallelism vs coordination overhead"
  - "Independent blast radius per worker vs complexity of partial failure handling"
  - "Simple implementation vs managing N concurrent contexts"
tags: [orchestration, parallelism, fan-out, workers, multi-agent]
confidence: high
sources:
  - "Anthropic: Building Effective Agents (2024)"
  - "Claude Code Agent tool documentation"
created: 2026-04-04
updated: 2026-04-04
---

## Problem

A high-level task decomposes into N subtasks that are:
- Independent of each other (no data dependency between subtasks)
- Each takes non-trivial time (making serial execution inefficient)
- Each requires full LLM reasoning (not just a lookup or computation)

Running subtasks sequentially wastes the parallelism ceiling. A 10-subtask job taking 30s each runs in 300s serially but ~35s with proper fan-out (accounting for overhead).

---

## Solution

An orchestrator agent dispatches all N subtasks simultaneously via parallel tool calls (Claude Code's Agent tool supports this). Each worker agent receives a focused task with its own context. The orchestrator collects all results, validates them, and aggregates into a final output.

```
Orchestrator → [Worker 1 | Worker 2 | Worker 3 | ... | Worker N] → Aggregation
```

---

## Implementation Sketch

### Python (using async Agent calls)

```python
import asyncio
from dataclasses import dataclass
from typing import Any

@dataclass
class WorkerTask:
    task_id: str
    description: str
    context: dict

@dataclass
class WorkerResult:
    task_id: str
    success: bool
    output: Any
    error: Optional[str] = None

async def worker_agent(task: WorkerTask) -> WorkerResult:
    """Invoke a worker agent for a single subtask."""
    try:
        result = await llm.call(
            model="claude-sonnet-4-6",
            system=WORKER_SYSTEM_PROMPT,
            messages=[{
                "role": "user",
                "content": f"Task ID: {task.task_id}\n\n{task.description}\n\nContext: {json.dumps(task.context)}"
            }],
            tools=WORKER_TOOLS,
        )
        return WorkerResult(task_id=task.task_id, success=True, output=parse_output(result))
    except Exception as e:
        return WorkerResult(task_id=task.task_id, success=False, error=str(e))

async def fan_out_orchestrator(goal: str, tasks: list[WorkerTask]) -> dict:
    """Spawn all workers simultaneously and collect results."""

    # Fan out — all workers start simultaneously
    worker_futures = [worker_agent(task) for task in tasks]
    results = await asyncio.gather(*worker_futures, return_exceptions=False)

    # Partition results
    successful = [r for r in results if r.success]
    failed = [r for r in results if not r.success]

    if failed:
        # Decide: retry failed, partial aggregate, or fail entirely
        retry_results = await retry_failed_workers(failed, tasks)
        successful.extend(r for r in retry_results if r.success)
        still_failed = [r for r in retry_results if not r.success]

        if still_failed:
            # Log partial failure; aggregate what we have
            log_partial_failure(still_failed)

    return aggregate_results(goal, successful)

def aggregate_results(goal: str, results: list[WorkerResult]) -> dict:
    """Synthesize worker outputs into a coherent final result."""
    # Use another LLM call for synthesis if results require judgment
    return llm.call(
        model="claude-sonnet-4-6",
        messages=[{
            "role": "user",
            "content": f"Goal: {goal}\n\nWorker results:\n{format_results(results)}\n\nSynthesize into a final answer."
        }]
    )
```

### Claude Code Native (using parallel Agent tool calls)

In Claude Code, the model itself can fan out via parallel tool calls in a single response:

```
[Model emits simultaneously]
tool_call: Agent(task="Analyze module A's dependencies", ...)
tool_call: Agent(task="Analyze module B's dependencies", ...)
tool_call: Agent(task="Analyze module C's dependencies", ...)
```

The host executes all three Agent calls in parallel and returns all three results before the model continues. This is the natural Claude Code fan-out mechanism.

---

## Aggregation Strategies

| Strategy | When to Use | Implementation |
|----------|-------------|----------------|
| Concatenate | Results are non-overlapping sections | Join with delimiters |
| Merge | Results are dicts/objects that complement each other | Deep merge with conflict resolution |
| Vote | Results are independent answers to the same question | Majority vote or ensemble |
| Synthesize | Results require judgment to combine | Another LLM call |
| Best-of | One result is clearly best per defined criteria | Score each, return highest |

---

## Partial Failure Handling

Don't fail the entire job when one worker fails. Options by strategy:

1. **Retry the failed worker** — best if the failure is transient (timeout, rate limit)
2. **Skip the failed subtask** — if the subtask's output is optional to the final result
3. **Fill with degraded output** — substitute a placeholder and flag for human review
4. **Fail the whole task** — only if the failed subtask is a hard dependency

```python
async def retry_failed_workers(
    failed: list[WorkerResult],
    original_tasks: list[WorkerTask],
    max_retries: int = 2
) -> list[WorkerResult]:
    task_map = {t.task_id: t for t in original_tasks}
    retry_tasks = [task_map[r.task_id] for r in failed]

    results = []
    for attempt in range(max_retries):
        retry_results = await asyncio.gather(*[worker_agent(t) for t in retry_tasks])
        still_failing = []
        for result in retry_results:
            if result.success:
                results.append(result)
            else:
                still_failing.append(result)
        retry_tasks = [task_map[r.task_id] for r in still_failing]
        if not retry_tasks:
            break

    return results + [WorkerResult(task_id=r.task_id, success=False, error=r.error) for r in still_failing]
```

---

## Tradeoffs

| | Pros | Cons |
|---|------|------|
| Parallelism | Wall-clock time = max(subtask times), not sum | Requires truly independent subtasks |
| Failure isolation | One worker failing doesn't kill others | Partial results require aggregation logic |
| Focused context | Each worker has only its subtask in context | Orchestrator can't easily share context with workers |
| Scalability | N workers adds no orchestrator complexity | API rate limits can throttle parallelism |

---

## When To Use

- N ≥ 3 independent subtasks where each takes > 10 seconds
- Tasks that can be fully specified upfront (each worker needs only its own task description)
- When partial success is acceptable (aggregate what you can)
- File processing, multi-document analysis, parallel code reviews

## When NOT To Use

- Subtasks depend on each other's outputs — use [[patterns/pattern-pipeline]] instead
- N = 2 or 3 with short tasks (< 5 seconds each) — serial execution is fine, fan-out overhead not worth it
- Subtasks all write to the same shared mutable resource — coordinate or serialize
- Rate limits make parallel API calls infeasible at this scale

---

## Real Examples

- **Multi-file code review**: Spawn one reviewer per file, aggregate findings
- **Parallel web research**: Spawn one searcher per query, synthesize results
- **Test suite generation**: Spawn one test writer per function, collect all tests
- **Codebase analysis**: Spawn one analyzer per module, merge dependency maps

---

## Related Patterns

- [[patterns/pattern-supervisor-worker]] — when workers need different specializations
- [[patterns/pattern-pipeline]] — when subtasks have sequential dependencies
- [[patterns/pattern-plan-execute-verify]] — when you need a formal planning step before fan-out

---

## Sources

- Anthropic "Building Effective Agents" (2024)
- Claude Code Agent tool documentation
