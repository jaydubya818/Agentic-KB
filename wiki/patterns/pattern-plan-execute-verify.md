---
title: Plan-Execute-Verify
type: pattern
category: orchestration
problem: Complex tasks fail when an agent combines planning and execution in one context
solution: Separate planner agent, executor agent, verifier agent — each with focused context
tradeoffs:
  - "Higher quality execution vs 3× agent overhead vs single context"
  - "Plan-execution alignment vs plan staleness if environment changes mid-execution"
  - "Verifier provides confidence signal vs verifier can be wrong too"
tags: [orchestration, planning, execution, verification, separation-of-concerns]
confidence: high
sources:
  - "Anthropic: Building Effective Agents (2024)"
  - "GSD framework: plan-phase, execute-phase, verify-work workflow"
created: 2026-04-04
updated: 2026-04-04
---

## Problem

When a single agent plans and executes in the same context:
- Planning quality degrades because the agent is distracted by execution details
- Execution quality degrades because the growing context from planning crowds out the plan itself
- Verification is biased — the agent is emotionally invested in the work it just did
- Debugging is hard — which part of the single context caused the failure?

The problem worsens with task complexity. Simple tasks survive the merged context; complex multi-file, multi-step tasks don't.

---

## Solution

Three specialized agents, each with a single job and focused context:

1. **Planner** — receives the task, analyzes requirements, produces a structured plan with acceptance criteria. No execution.
2. **Executor** — receives the plan (not the original task reasoning), executes each step, respects plan constraints. No re-planning.
3. **Verifier** — receives the original task + the plan + evidence of execution, checks acceptance criteria independently. No execution.

```
Task → [Planner] → Plan → [Executor] → Artifacts → [Verifier] → Pass/Fail
                              ↓ on fail
                         [Escalate / Re-plan]
```

---

## Implementation Sketch

### Plan Format Specification

The plan is the contract between Planner and Executor. Make it precise:

```typescript
interface AgentPlan {
  task_id: string;
  goal: string;                           // One sentence, the "why"
  acceptance_criteria: string[];          // Verifier checks these
  constraints: string[];                  // Hard limits Executor must not violate
  steps: PlanStep[];
  estimated_complexity: "low" | "medium" | "high";
  risk_notes: string[];                   // Planner's concerns
}

interface PlanStep {
  step_id: string;
  description: string;
  action_type: "read" | "write" | "execute" | "verify" | "delegate";
  target: string;                         // File, endpoint, agent, etc.
  expected_output: string;               // What done looks like
  depends_on: string[];                  // step_ids this depends on
  rollback_if_fail: string;             // How to undo this step
}
```

### Planner Agent

```python
PLANNER_SYSTEM = """You are a planning specialist. You do not write code or execute commands.
Your job: analyze the task, identify all required steps, and produce a precise plan.

A good plan:
- States acceptance criteria that can be independently verified
- Lists steps with unambiguous expected outputs
- Identifies risks and constraints upfront
- Is specific enough that an executor can follow without asking clarifying questions

Output format: JSON matching the AgentPlan schema."""

async def plan(task: str) -> AgentPlan:
    response = await llm.call(
        model="claude-opus-4-6",  # Planning warrants stronger model
        system=PLANNER_SYSTEM,
        messages=[{"role": "user", "content": task}],
        response_format=AgentPlan,
    )
    return AgentPlan.model_validate(response)
```

### Executor Agent

```python
EXECUTOR_SYSTEM = """You are an execution specialist. Your job is to implement the plan exactly.

Rules:
1. Follow the plan steps in order (respect depends_on).
2. Do NOT modify the plan or acceptance criteria — if the plan is wrong, report it, don't fix it silently.
3. If a step fails, execute the rollback defined in the plan before stopping.
4. Produce evidence for each completed step (file paths, test output, etc.).
5. Stop and report if you encounter anything not anticipated by the plan."""

async def execute(plan: AgentPlan) -> ExecutionResult:
    evidence = []
    for step in topological_sort(plan.steps):
        result = await execute_step(step)
        if not result.success:
            await rollback_step(step)
            return ExecutionResult(
                success=False,
                completed_steps=[s.step_id for s in evidence],
                failed_step=step.step_id,
                failure_reason=result.error,
            )
        evidence.append(StepEvidence(step_id=step.step_id, output=result.output))

    return ExecutionResult(success=True, completed_steps=[e.step_id for e in evidence], evidence=evidence)
```

### Verifier Agent

```python
VERIFIER_SYSTEM = """You are a verification specialist. You do not implement or modify anything.
Your job: check whether the execution actually meets the acceptance criteria.

For each criterion, gather evidence: run commands, read files, check outputs.
Do not assume the execution report is accurate — verify independently.

Output:
VERDICT: PASS | FAIL
CRITERIA_RESULTS:
- [criterion]: PASS | FAIL — [evidence]
ISSUES: [only if FAIL]
"""

async def verify(
    original_task: str,
    plan: AgentPlan,
    execution_result: ExecutionResult
) -> VerificationResult:
    return await llm.call(
        model="claude-sonnet-4-6",
        system=VERIFIER_SYSTEM,
        tools=READ_ONLY_TOOLS,  # Verifier gets read tools but NO write tools
        messages=[{
            "role": "user",
            "content": f"""Task: {original_task}

Acceptance criteria:
{format_criteria(plan.acceptance_criteria)}

Execution report:
{execution_result.model_dump_json(indent=2)}

Verify each acceptance criterion independently."""
        }]
    )
```

### Orchestrator

```python
async def plan_execute_verify(task: str, max_cycles: int = 2) -> FinalResult:
    for cycle in range(max_cycles):
        plan = await plan(task)

        # Optional: human approval of plan before execution
        if REQUIRE_PLAN_APPROVAL:
            approved = await request_plan_approval(plan)
            if not approved:
                return FinalResult(status="plan_rejected")

        execution = await execute(plan)
        if not execution.success:
            log_failure(f"Execution failed at step {execution.failed_step}")
            if cycle < max_cycles - 1:
                # Feed failure info back for re-planning
                task = f"{task}\n\nPrevious attempt failed: {execution.failure_reason}"
                continue
            return FinalResult(status="execution_failed", details=execution)

        verification = await verify(task, plan, execution)
        if verification.verdict == "PASS":
            return FinalResult(status="success", evidence=verification.evidence)

        if cycle < max_cycles - 1:
            task = f"{task}\n\nVerification failed: {format_issues(verification.issues)}"
        else:
            return FinalResult(status="verification_failed", details=verification)

    return FinalResult(status="max_cycles_exceeded")
```

---

## Verifier's Relationship to Plan

The verifier uses the plan's acceptance criteria as its checklist, but verifies independently:
- Reads files to confirm changes were made (doesn't trust executor's report)
- Runs tests to confirm they pass (doesn't trust executor's test output)
- Checks for constraints specified in the plan (no files modified outside scope)

The verifier's job is to be the skeptic — assume the executor may have missed something.

---

## Tradeoffs

| | Pros | Cons |
|---|------|------|
| Separation of concerns | Each agent has focused context; quality is higher | 3× agent calls, 3× potential points of failure |
| Independent verification | Verifier catches errors the executor didn't notice | Verifier can be wrong; not a guarantee |
| Plan as contract | Executor can't drift; plan is the source of truth | Plan may be wrong; executor can't fix it silently |
| Debuggability | Failure localized to planner, executor, or verifier | More logs and traces to maintain |

---

## When To Use

- Multi-file, multi-step tasks where a single context reliably degrades
- High-stakes tasks where independent verification is worth the overhead
- Tasks with well-defined acceptance criteria (makes verification tractable)
- When GSD's plan-phase → execute-phase → verify-work workflow applies

## When NOT To Use

- Simple 1-3 file tasks — single agent is more efficient
- Tasks where the plan cannot be written before seeing intermediate results (exploratory tasks) — use GSD's iterative approach instead
- Very tight latency requirements — 3 agents = 3× minimum latency

---

## Real Examples

- **Feature implementation**: Planner writes spec + steps; Executor implements; Verifier runs tests + checks types
- **Refactoring**: Planner identifies all touch points; Executor makes changes; Verifier confirms no regressions
- **Infrastructure change**: Planner defines IaC changes; Executor applies; Verifier confirms expected state

---

## Related Patterns

- [[patterns/pattern-fan-out-worker]] — parallelize the execution step
- [[patterns/pattern-pipeline]] — when plan stages are sequential with handoffs
- [[patterns/pattern-reflection-loop]] — self-correction within a single phase

---

## Sources

- Anthropic "Building Effective Agents" (2024)
- GSD framework plan-phase / execute-phase / verify-work workflow
