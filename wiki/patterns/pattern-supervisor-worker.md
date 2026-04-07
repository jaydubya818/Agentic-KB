---
title: Supervisor-Worker
type: pattern
category: orchestration
problem: A complex task requires specialized agents with different capabilities
solution: Supervisor maintains task state and delegates to specialists based on task type
tradeoffs:
  - "Specialization quality vs coordination cost"
  - "Clear routing logic vs brittleness when task types don't fit neat categories"
  - "Supervisor as single point of failure"
tags: [orchestration, supervisor, specialization, routing, multi-agent]
confidence: high
sources:
  - "Anthropic: Building Effective Agents (2024)"
  - "LangGraph multi-agent patterns"
created: 2026-04-04
updated: 2026-04-04
---

## Problem

A high-level task requires genuinely different capabilities at different stages — e.g., some steps need deep code knowledge, others need web research, others need database expertise. A single generalist agent handles all of these poorly. But separate specialized agents need coordination — who decides which specialist handles each step? How are results synthesized?

---

## Solution

A supervisor agent owns the task state and plan. It never executes work directly — it routes subtasks to the appropriate specialist worker. Each worker is specialized (different system prompt, tool set, or model) for its domain. The supervisor receives results, validates them, updates the plan, and routes the next step.

```
User Task
    ↓
[Supervisor] ← owns plan, state, routing decisions
    ├── CodeAgent (implements features, refactors)
    ├── ResearchAgent (web search, document analysis)
    ├── DatabaseAgent (schema changes, query optimization)
    └── TestAgent (writes and runs tests)
    ↓
Synthesized Result
```

---

## Implementation Sketch

```python
@dataclass
class WorkerCapability:
    agent_name: str
    specialties: list[str]
    system_prompt: str
    tools: list[str]
    model: str

WORKERS = {
    "code": WorkerCapability(
        agent_name="CodeAgent",
        specialties=["implement", "refactor", "debug", "review"],
        system_prompt=CODE_AGENT_SYSTEM_PROMPT,
        tools=["read_file", "write_file", "bash"],
        model="claude-sonnet-4-6",
    ),
    "research": WorkerCapability(
        agent_name="ResearchAgent",
        specialties=["search", "analyze", "summarize", "compare"],
        system_prompt=RESEARCH_AGENT_SYSTEM_PROMPT,
        tools=["web_search", "read_url", "read_file"],
        model="claude-sonnet-4-6",
    ),
    "database": WorkerCapability(
        agent_name="DatabaseAgent",
        specialties=["schema", "migration", "query", "optimize"],
        system_prompt=DATABASE_AGENT_SYSTEM_PROMPT,
        tools=["read_file", "write_file", "bash", "db_query"],
        model="claude-opus-4-6",  # DB work warrants stronger model
    ),
    "test": WorkerCapability(
        agent_name="TestAgent",
        specialties=["unit_test", "integration_test", "e2e", "coverage"],
        system_prompt=TEST_AGENT_SYSTEM_PROMPT,
        tools=["read_file", "write_file", "bash"],
        model="claude-sonnet-4-6",
    ),
}

class Supervisor:
    def __init__(self):
        self.plan: list[PlannedStep] = []
        self.completed: list[CompletedStep] = []
        self.state: dict = {}

    async def run(self, task: str) -> str:
        # Phase 1: Planning
        self.plan = await self.create_plan(task)

        # Phase 2: Execute plan by routing each step
        for step in self.plan:
            worker_key = self.route(step)
            worker = WORKERS[worker_key]

            result = await self.delegate(step, worker)

            if not result.success:
                result = await self.handle_worker_failure(step, worker, result)

            self.completed.append(CompletedStep(step=step, result=result))
            self.state.update(result.state_updates)

        # Phase 3: Synthesize
        return await self.synthesize(task, self.completed)

    def route(self, step: PlannedStep) -> str:
        """Route a step to the most appropriate worker."""
        # Option 1: LLM-based routing (flexible but adds latency)
        routing_decision = llm.call(
            model="claude-haiku-4-5",  # cheap model for routing
            messages=[{
                "role": "user",
                "content": f"""Route this step to the correct worker.

Step: {step.description}
Step type: {step.type}

Workers available:
{format_workers(WORKERS)}

Respond with just the worker key: code | research | database | test"""
            }]
        )
        return routing_decision.strip()

        # Option 2: Rule-based routing (faster, more predictable)
        # if step.type in ["implement", "refactor", "debug"]: return "code"
        # if step.type in ["schema", "migration", "query"]: return "database"
        # ...

    async def delegate(self, step: PlannedStep, worker: WorkerCapability) -> WorkerResult:
        """Send a step to a worker and get the result."""
        context = self.build_worker_context(step)
        return await worker_agent(
            system_prompt=worker.system_prompt,
            tools=worker.tools,
            model=worker.model,
            task=step.description,
            context=context,
        )

    def build_worker_context(self, step: PlannedStep) -> str:
        """Give worker the minimal context it needs — not the full plan."""
        relevant_completed = [c for c in self.completed if step.depends_on(c.step.id)]
        return f"""Prior completed steps relevant to your task:
{format_completed(relevant_completed)}

Current world state:
{format_state(self.state)}"""

    async def handle_worker_failure(
        self, step: PlannedStep, worker: WorkerCapability, result: WorkerResult
    ) -> WorkerResult:
        """Try to recover from a worker failure."""
        # Option 1: Retry same worker
        retry = await self.delegate(step, worker)
        if retry.success:
            return retry

        # Option 2: Route to a different worker
        alt_worker_key = self.find_alternative_worker(step, exclude=worker.agent_name)
        if alt_worker_key:
            return await self.delegate(step, WORKERS[alt_worker_key])

        # Option 3: Escalate to human
        return await self.request_human_intervention(step, result)
```

---

## Routing Logic

Two approaches:

**Rule-based routing** — Fast, deterministic, debuggable. Breaks when task types don't fit neat categories.
```python
ROUTING_RULES = {
    "implement": "code",
    "refactor": "code",
    "debug": "code",
    "search": "research",
    "schema": "database",
    "test": "test",
}
```

**LLM-based routing** — Flexible, handles edge cases, but adds latency and a potential point of failure. Use a cheap/fast model (Haiku) for routing decisions. Cache routing decisions for similar step types.

**Hybrid** — Rule-based first; fall through to LLM routing for unrecognized types.

---

## Result Synthesis

The supervisor synthesizes results from all workers into a coherent final output. This is often another LLM call:

```python
async def synthesize(self, original_task: str, completed: list[CompletedStep]) -> str:
    return await llm.call(
        model="claude-sonnet-4-6",
        messages=[{
            "role": "user",
            "content": f"""Original task: {original_task}

Completed subtasks and results:
{format_completed_steps(completed)}

Synthesize a final summary of what was accomplished."""
        }]
    )
```

---

## Tradeoffs

| | Pros | Cons |
|---|------|------|
| Specialization | Each agent excels at its domain | More agents = more prompts to maintain |
| Separation of concerns | Supervisor doesn't need to know how to code/search/etc. | Supervisor is a single point of failure |
| Flexible routing | Can add new workers without changing supervisor logic | Routing errors send work to wrong specialist |
| Result synthesis | Clean separation between doing and synthesizing | Synthesis adds latency and cost |

---

## When To Use

- Tasks span multiple genuine capability domains (coding + research + DB + testing)
- Domain specialists would outperform a generalist agent on individual steps
- You want to independently upgrade/tune individual specialists
- Task types are stable enough to define routing rules

## When NOT To Use

- Tasks are homogeneous — a single capable agent is simpler and faster
- Routing is ambiguous — unclear which specialist handles a step
- The "coordination overhead" exceeds the "specialization benefit" (few steps, simple domains)
- You need sub-agents to share context heavily — use [[patterns/pattern-fan-out-worker]] with shared state instead

---

## Real Examples

- **Full-stack feature implementation**: Supervisor routes to DB agent (schema), code agent (backend), code agent (frontend), test agent (tests)
- **Research + implementation**: Supervisor routes to research agent (gather info), code agent (implement), test agent (verify)
- **Security audit**: Supervisor routes to code agent (read code), security specialist (analyze), code agent (apply fixes)

---

## Related Patterns

- [[patterns/pattern-fan-out-worker]] — when subtasks are independent and homogeneous
- [[patterns/pattern-pipeline]] — when subtasks are sequential, not routed
- [[patterns/pattern-plan-execute-verify]] — formal plan before routing

---

## Sources

- Anthropic "Building Effective Agents" (2024)
- LangGraph multi-agent supervisor pattern documentation
