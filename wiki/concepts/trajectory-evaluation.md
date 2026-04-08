---
id: 01KNNVX2QM76NTD72QFAH7JTXJ
title: Trajectory Evaluation
type: concept
tags: [agentic, evaluation, trajectory, step-scoring, offline-eval, datasets]
confidence: medium
sources:
  - "AgentBench: Liu et al. (2023)"
  - "WebArena: Zhou et al. (2023)"
  - "τ-bench: Yao et al. (2024)"
  - "Trajectory evaluation methodology: various (2024-2025)"
created: 2026-04-04
updated: 2026-04-04
related:
  - "[[concepts/llm-as-judge]]"
  - "[[concepts/benchmark-design]]"
  - "[[concepts/observability]]"
  - "[[concepts/agent-loops]]"
status: evolving
---

## TL;DR

Trajectory evaluation scores the entire sequence of agent actions, not just the final answer. This is critical for agentic systems because an agent can reach the correct answer through poor reasoning (which will fail on variants) or fail correctly (stopping when it should, rather than hallucinating a success). Evaluating trajectories enables measuring efficiency, safety, and robustness — not just correctness.

---

## Definition

Trajectory evaluation is the assessment of an agent's complete execution path — including every tool call, reasoning step, and intermediate state — rather than only evaluating the final output. It treats the agent's decision-making process as a first-class evaluation target.

---

## Why Trajectories Matter

**The problem with outcome-only evaluation**:

Two agents complete the same coding task. Agent A takes the correct approach, writes clean code, passes all tests. Agent B hallucinates that it ran the tests (tool call to a nonexistent tool), reports success, and leaves the code in a broken state that looks syntactically correct.

Outcome-only evaluation: both agents "passed."

Trajectory evaluation: Agent A passed; Agent B flagged for hallucinated tool calls and false completion.

**Trajectory evaluation catches**:
- Efficient vs inefficient paths (same answer, 3 steps vs 20 steps)
- Correct path, wrong answer (well-reasoned failure)
- Wrong path, lucky answer (should fail on variants)
- Safety violations mid-trajectory (accessing unauthorized resources, even if caught)
- Loop patterns (repeating the same action before converging)

---

## How It Works

### Step-Level Scoring

Each step in the trajectory receives a score. Aggregate scores form the trajectory score.

```python
@dataclass
class TrajectoryStep:
    step_id: int
    action_type: str  # "tool_call" | "reasoning" | "response"
    action: dict
    observation: Optional[str]
    timestamp: datetime

@dataclass
class StepScore:
    step_id: int
    correctness: float      # 0-1: is this the right action?
    efficiency: float       # 0-1: is this necessary / optimal?
    safety: float           # 0-1: does this respect constraints?
    reasoning_quality: float  # 0-1: is the reasoning sound?

def score_trajectory(trajectory: list[TrajectoryStep], task: Task) -> TrajectoryScore:
    step_scores = [score_step(step, task) for step in trajectory]
    return TrajectoryScore(
        step_scores=step_scores,
        overall_correctness=score_final_outcome(trajectory, task),
        trajectory_efficiency=len(trajectory) / task.expected_steps,
        safety_violations=[s for s in step_scores if s.safety < 0.5],
        hallucination_events=detect_hallucinations(trajectory)
    )
```

### Intermediate Tool Calls as Signals

Tool call patterns are high-signal trajectory features:

- **Unnecessary reads**: Agent reads a file it already has in context → efficiency issue
- **Wrong tool**: Agent uses `list_files` to "find" content that requires `search_files` → capability issue
- **Hallucinated tool**: Agent attempts to call a non-existent tool → hallucination event
- **Backtracking**: Agent undoes a previous action → either self-correction (good) or confusion (bad)
- **Excessive parallelism**: Agent makes 20 simultaneous tool calls → may be trying to cover uncertainty through brute force

```python
def detect_hallucinated_tools(trajectory: list[TrajectoryStep], valid_tools: set[str]) -> list[int]:
    return [
        step.step_id
        for step in trajectory
        if step.action_type == "tool_call"
        and step.action["tool_name"] not in valid_tools
    ]
```

### Trajectory Datasets

Building a trajectory evaluation dataset requires:

1. **Task collection**: Diverse tasks with known difficulty levels
2. **Ground truth trajectories**: Expert-annotated optimal paths (or programmatically determined)
3. **Trajectory recording**: Instrument agent execution to capture every step
4. **Annotation schema**: What properties to score at each step
5. **Aggregation rules**: How step scores combine into trajectory scores

**Challenge**: Ground truth trajectories are expensive to collect. An expert might solve a task in 5 steps; there are often multiple valid 5-step paths. The annotation task is "is this a valid step toward the goal?" not "is this the exact step the expert took?"

### Offline vs Online Evaluation

**Offline**: Record trajectories during agent execution, evaluate afterward. Fast iteration on evaluation methodology. No impact on production latency.

```python
# Recording (in agent execution)
with TrajectoryRecorder(session_id=session_id) as recorder:
    result = agent.execute(task)

# Evaluation (batch job, runs independently)
trajectories = load_trajectories(session_id)
scores = [score_trajectory(t, get_task(t.task_id)) for t in trajectories]
```

**Online**: Evaluate each step in real-time during execution. Enables:
- Early termination when the trajectory degrades
- Real-time HITL alerts when trajectory violates safety criteria
- Adaptive behavior based on trajectory quality signals

Online evaluation adds latency (one judge call per step). Reserve for safety-critical applications.

---

## Partial Credit

Trajectory evaluation naturally supports partial credit — essential for tasks that an agent partially completed:

```python
def partial_credit_score(trajectory: list[TrajectoryStep], task: Task) -> float:
    completed_requirements = check_requirements(trajectory, task.requirements)
    return len(completed_requirements) / len(task.requirements)
```

Partial credit is important for:
- Distinguishing "completed 80% correctly" from "failed entirely"
- Tracking progress trends across model versions
- Providing meaningful training signal for fine-tuning

---

## Key Metrics

| Metric | What It Measures |
|--------|-----------------|
| Task success rate | Binary: did the agent complete the task? |
| Trajectory efficiency | Steps taken / minimum steps needed |
| Hallucination rate | % of steps with hallucinated actions |
| Safety violation rate | % of trajectories with safety events |
| Backtracking rate | % of steps that undo prior actions |
| Mean time to completion | Wall-clock duration |
| Partial completion rate | % of sub-goals achieved on failed tasks |

---

## When To Use

- When evaluating agentic systems where path quality matters, not just outcome
- When comparing agents on efficiency (not just correctness)
- When building fine-tuning datasets from agent execution traces
- When debugging why an agent fails on specific task types
- When safety auditing agent behavior on sensitive task categories

---

## Risks & Pitfalls

- **Trajectory annotation cost**: Expert annotation per step is 5-10× more expensive than outcome annotation. Use [[llm-as-judge]] for step scoring with human calibration.
- **Ground truth plurality**: Many valid trajectories for any task. Anchoring to one canonical path will unfairly penalize valid alternatives.
- **Trajectory length bias**: Longer trajectories aren't always worse (some tasks genuinely require more steps). Normalize by task complexity.
- **Offline/online discrepancy**: Agents behave differently when they know they're being evaluated (if evaluation affects context). Blind evaluation is preferred.

---

## Related Concepts

- [[concepts/llm-as-judge]] — step-level scoring using an LLM judge
- [[concepts/benchmark-design]] — integrating trajectory eval into benchmarks
- [[concepts/observability]] — the instrumentation that makes trajectory recording possible
- [[concepts/agent-failure-modes]] — trajectories reveal failure modes invisble in outcomes

---

## Sources

- Liu et al. "AgentBench: Evaluating LLMs as Agents" (2023)
- Zhou et al. "WebArena: A Realistic Web Environment for Building Autonomous Agents" (2023)
- Yao et al. "τ-bench: A Benchmark for Tool-Agent-User Interaction" (2024)
