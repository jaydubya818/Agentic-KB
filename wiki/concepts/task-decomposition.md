---
title: Task Decomposition
type: concept
tags: [agentic, planning, decomposition, parallelism, subtasks, dag]
confidence: high
sources:
  - "Anthropic: Building Effective Agents (2024)"
  - "HuggingGPT / TaskMatrix research (2023)"
  - "Tree of Thoughts: Yao et al. (2023)"
created: 2026-04-04
updated: 2026-04-04
related:
  - "[[concepts/multi-agent-systems]]"
  - "[[concepts/agent-loops]]"
  - "[[patterns/pattern-plan-execute-verify]]"
  - "[[patterns/pattern-fan-out-worker]]"
  - "[[patterns/pattern-supervisor-worker]]"
status: stable
---

## TL;DR

Task decomposition is the process of breaking a complex goal into subtasks that are individually solvable, assignable, and verifiable. The decomposition strategy determines whether you can parallelize, how you handle partial failures, and how reliably a plan can be executed. Bad decomposition is the most common reason agent plans fail silently.

---

## Definition

Task decomposition is the systematic process of breaking a high-level goal into a dependency-ordered set of subtasks, where each subtask has: a clear definition of done, bounded scope, defined inputs and outputs, and an identifiable owner (agent or human).

---

## How It Works

### Dependency Graphs

Subtasks have dependencies. Representing them as a directed acyclic graph (DAG) reveals which tasks can run in parallel and which must wait.

```
Goal: Deploy new feature to production

Subtasks:
A: Write tests             → no deps
B: Implement feature       → no deps (can run with A)
C: Run test suite          → depends on A, B
D: Build Docker image      → depends on B
E: Run security scan       → depends on D
F: Deploy to staging       → depends on C, D
G: Run smoke tests         → depends on F
H: Deploy to production    → depends on E, G
```

Parallelizable at start: A and B simultaneously.
Critical path: B → D → E → F → G → H (6 steps, can't compress further).

Building this graph explicitly before execution tells you: minimum wall-clock time, where to parallelize, and which failures block everything downstream.

### Parallelization Detection

A subtask is parallelizable if:
- It has no dependency on any other subtask in the current wave
- It doesn't write to shared state that another parallel task reads
- Its failure doesn't invalidate the parallel task's work

Simple test: can you swap the execution order without changing the result? If yes, they can be parallelized.

### Task Granularity

**Too coarse**: "Refactor the authentication module" — no clear completion criteria, too many unknowns, can't assign to a focused agent.

**Too fine**: "Change variable name `uid` to `userId` on line 42" — trivial, doesn't need agent planning overhead.

**Right size** (atomic): A task that:
- Can be completed in one focused agent context session
- Has unambiguous success criteria
- Produces a verifiable artifact
- Has bounded scope (a file, a function, a feature)

Rule of thumb: if you can't describe what "done" looks like in one sentence, decompose further.

### Atomic vs Composite Tasks

**Atomic**: Single-step, single-agent, single-output. No internal decision branches.
```
"Write a unit test for the getUserById function in src/users/repository.ts"
```

**Composite**: Contains multiple steps, requires internal decision-making, spans multiple concerns.
```
"Implement user authentication"
```

The planner's job is to decompose composites into atomics. Executives (sub-agents) should never be handed composite tasks — they'll make implicit decomposition decisions the orchestrator can't see or verify.

### When Decomposition Adds Value

- Task exceeds one context window
- Subtasks have genuine parallelism (saves wall-clock time)
- Subtasks require different capabilities or system prompts
- Independent verifiability: you can check each subtask without running all of them
- Partial completion is useful: if step 3 of 8 fails, steps 1-2 results are preserved

### When Decomposition Removes Value

- The task is truly atomic — decomposition adds orchestration overhead without benefit
- The subtasks are so tightly coupled that they need shared context to make good decisions
- The decomposition plan itself requires more intelligence than executing the task
- Latency matters: decomposition adds round-trips; sometimes one smart agent call beats five optimized ones

---

## Decomposition Patterns

### Top-Down
Start with the goal, identify the 2-5 major phases, then recursively decompose each phase. Matches BMAD's approach — full plan before any execution.

**Risk**: Early decomposition may be wrong; discovering this late is costly.

### Bottom-Up
Identify atomic actions first, then compose them into higher-order tasks. More common in code generation scenarios.

**Risk**: May not converge on the right structure if atomic tasks don't compose cleanly.

### Iterative Decomposition
Decompose one level, execute, observe, re-decompose based on what you learned. GSD's approach — plan phase by phase rather than all upfront.

**Risk**: Less predictable timeline; some backtracking required.

### Dynamic Re-Decomposition

Allow agents to request re-decomposition of their assigned subtask if they discover it was underspecified. Requires a mechanism to signal back to the planner:

```python
class SubtaskResult:
    status: Literal["completed", "failed", "needs_decomposition"]
    output: Any
    decomposition_request: Optional[list[Subtask]]  # agent's suggested sub-subtasks
```

---

## Verification of Decomposition Quality

Before executing, verify the decomposition:
1. **Completeness**: Do the subtasks together cover the entire goal? What's missing?
2. **No circular deps**: Is the DAG actually acyclic?
3. **Unambiguous boundaries**: Does each subtask have a clear "done" state?
4. **Failure handling**: What happens if subtask 3 fails? Can we continue? Rollback?
5. **Correct granularity**: Could any composite task be further decomposed?

The GSD `gsd-assumptions-analyzer` agent performs adversarial verification of decompositions before execution.

---

## Risks & Pitfalls

- **Implicit coupling**: Two tasks appear independent but both write to the same file. The plan breaks at execution. Solution: explicit dependency on shared artifacts.
- **Underspecified atomic tasks**: "Write tests" — which tests? For what? To what coverage level? Underspecification causes executor agents to make assumptions that may contradict the overall plan.
- **Decomposition depth mismatch**: Orchestrator hands a composite task to a worker that expects atomics. Worker improvises, makes unexpected decisions.
- **Serial disguised as parallel**: Tasks labeled as parallel but one actually depends on a side effect of the other (writes to a shared config, sets an environment variable).

---

## Related Concepts

- [[concepts/multi-agent-systems]] — who executes each subtask
- [[concepts/agent-loops]] — how each subtask is executed
- [[patterns/pattern-plan-execute-verify]] — the pattern that structures decomposition formally
- [[patterns/pattern-fan-out-worker]] — parallel execution of independent subtasks
- [[patterns/pattern-supervisor-worker]] — routing subtasks to specialized agents

---

## Sources

- Anthropic "Building Effective Agents" (2024)
- Yao et al. "Tree of Thoughts" (2023)
- HuggingGPT / TaskMatrix: Shen et al. (2023)
