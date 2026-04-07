---
title: Observability
type: concept
tags: [agentic, observability, tracing, logging, monitoring, telemetry]
confidence: high
sources:
  - "OpenTelemetry documentation"
  - "LangSmith tracing documentation"
  - "Anthropic: Agent monitoring best practices (2025)"
  - "Distributed systems observability: Honeycomb, Datadog"
created: 2026-04-04
updated: 2026-04-04
related:
  - "[[concepts/agent-failure-modes]]"
  - "[[concepts/trajectory-evaluation]]"
  - "[[concepts/multi-agent-systems]]"
  - "[[concepts/cost-optimization]]"
  - "[[concepts/state-persistence]]"
status: stable
---

## TL;DR

Agents fail in opaque ways. Without structured observability — distributed traces, correlated span IDs, per-step logging — debugging a multi-agent failure becomes a guessing game. Instrument at agent boundaries (every dispatch and every return). Track: what was called, what was decided, what changed, and how long it took. Build dashboards before you need them.

---

## Definition

Observability for agentic systems is the capability to understand internal agent behavior from external outputs — specifically: the ability to reconstruct what happened, why, and in what sequence, across multi-agent interactions, from structured telemetry data.

---

## How It Works

### The Three Pillars in Agentic Context

**Structured Logging**: Every significant event emits a structured log entry with enough context to reconstruct what happened.

**Distributed Tracing**: A single user request may spawn dozens of agent calls. Tracing connects them via shared IDs so you can see the full execution tree.

**Metrics**: Aggregated signals — success rates, latency percentiles, error rates, cost per task — for dashboards and alerting.

---

## Distributed Tracing for Agents

The core challenge: a request spawns Agent A, which spawns Agents B and C, which each call tools. The root request's trace ID must propagate through all of these.

```python
import opentelemetry.trace as trace

tracer = trace.get_tracer("agent-framework")

class TracedAgent:
    def execute(self, task: str, parent_span_id: Optional[str] = None):
        with tracer.start_as_current_span("agent.execute") as span:
            span.set_attributes({
                "agent.name": self.name,
                "agent.task": task[:200],  # truncate for attribute limits
                "agent.session_id": self.session_id,
                "agent.parent_span_id": parent_span_id or "root",
            })

            for step in self.run(task):
                with tracer.start_as_current_span("agent.step") as step_span:
                    step_span.set_attributes({
                        "step.type": step.type,
                        "step.tool_name": step.tool_name,
                        "step.tokens_used": step.tokens_used,
                    })
                    result = self.execute_step(step)
                    step_span.set_attribute("step.success", result.success)
```

Every agent call gets a span. Every tool call gets a child span. The trace tree maps exactly to the agent execution tree.

**Propagation to sub-agents**:
```python
def spawn_sub_agent(task: str, agent_type: str):
    current_span = trace.get_current_span()
    span_context = current_span.get_span_context()

    return sub_agent.execute(
        task=task,
        # Pass trace context so sub-agent's spans connect to parent
        trace_parent=format_traceparent(span_context.trace_id, span_context.span_id),
    )
```

---

## Structured Logging Schema

Every log entry should be structured (JSON), not free text. Design a schema:

```python
@dataclass
class AgentLogEntry:
    timestamp: str          # ISO 8601
    level: str             # DEBUG | INFO | WARN | ERROR
    event_type: str        # agent.start | tool.call | tool.result | agent.complete | agent.error
    trace_id: str          # root trace ID
    span_id: str           # current span
    agent_name: str
    session_id: str
    task_id: str

    # Event-specific fields
    tool_name: Optional[str]
    tool_args_summary: Optional[str]  # NOT full args — may contain secrets
    tool_result_summary: Optional[str]
    error_type: Optional[str]
    error_message: Optional[str]
    tokens_input: Optional[int]
    tokens_output: Optional[int]
    latency_ms: Optional[int]
    cost_usd: Optional[float]

def log_tool_call(tool_name: str, args: dict, result: str, latency_ms: int):
    log(AgentLogEntry(
        event_type="tool.call",
        tool_name=tool_name,
        # Summarize args — don't log raw args (may contain sensitive data)
        tool_args_summary=summarize_args(args),
        tool_result_summary=result[:500],  # truncate long results
        latency_ms=latency_ms,
        tokens_input=count_tokens(str(args)),
    ))
```

---

## Latency Tracking

LLM calls have high and variable latency. Track:

- **Time-to-first-token**: How long before the model starts responding
- **Total response latency**: Full round-trip including model generation
- **Tool execution latency**: How long tool calls take (separates model slowness from tool slowness)
- **End-to-end task latency**: From task submission to completion

```python
async def timed_llm_call(messages: list) -> tuple[Response, LatencyMetrics]:
    start = time.monotonic()
    first_token_time = None

    async with llm.stream(messages) as stream:
        async for chunk in stream:
            if first_token_time is None:
                first_token_time = time.monotonic() - start
            full_response = chunk

    total_time = time.monotonic() - start
    return full_response, LatencyMetrics(
        ttft_ms=int(first_token_time * 1000),
        total_ms=int(total_time * 1000)
    )
```

---

## What to Instrument

**Always instrument**:
- Every agent invocation (start, end, outcome)
- Every LLM API call (model, tokens in/out, latency, cost)
- Every tool call (name, summary of args, success/fail, latency)
- Every sub-agent spawn (parent-child relationship, task passed)
- Every error (type, message, context)

**Usually instrument**:
- Decision points (when agent chooses between options, log which and why)
- Context size at each step (detect context growth problems early)
- Checkpoint events (when state is saved and restored)

**Avoid**:
- Raw LLM input/output in logs (cost + potential PII/secrets leak)
- Full tool output in logs (truncate to summary)
- Logging inside tight loops (instrument the loop boundary, not each iteration)

---

## Error Rate Dashboards

The key panels for an agent monitoring dashboard:

1. **Task success rate** by task type, over time
2. **Tool error rate** by tool name (which tools fail most?)
3. **Agent timeout rate** (sessions that exceed time/iteration limits)
4. **Context overflow events** (sessions that hit context limits)
5. **Cost by task type** (which tasks are expensive?)
6. **P50/P95/P99 latency** by task type
7. **Hallucination events** (if you instrument them)

---

## Correlation Between Agent Steps

The hardest debugging challenge: understanding why Agent C behaved strangely — when the root cause is something Agent A passed to Agent B 20 steps ago. Effective correlation requires:

1. **Consistent trace IDs**: Every log entry has the root trace ID
2. **Step sequence numbers**: Monotonically increasing step counter within a trace
3. **Agent lineage**: For sub-agent calls, log both parent agent ID and child agent ID
4. **State diffs**: At each checkpoint, log what changed (not just what the state is)

```python
def log_state_diff(before: AgentState, after: AgentState, step_id: str):
    diff = compute_diff(before, after)
    log({
        "event_type": "state.diff",
        "step_id": step_id,
        "added_artifacts": diff.added,
        "removed_artifacts": diff.removed,
        "modified_fields": diff.modified,
        "decisions_made": diff.new_decisions,
    })
```

---

## When To Use

- Any agent deployed in production (non-negotiable)
- Any multi-agent system where failures are hard to reproduce
- Any agent that costs more than $1/task — visibility into cost distribution is required
- Any agent operating in regulated domains (compliance requires audit logs)

---

## Risks & Pitfalls

- **Log volume explosion**: Verbose logging in tight loops can generate GB/hour. Log at boundaries, not inside loops.
- **Sensitive data in logs**: Tool args/results can contain PII, credentials, or proprietary data. Always summarize, never log raw.
- **Trace orphans**: Sub-agents that don't receive or propagate trace context create disconnected traces. Enforce trace propagation at the framework level.
- **Observability as an afterthought**: Adding instrumentation after deployment is 5× harder than building it in. Instrument from day one.

---

## Related Concepts

- [[concepts/agent-failure-modes]] — observability is how you detect failures
- [[concepts/trajectory-evaluation]] — structured logs enable offline trajectory evaluation
- [[concepts/multi-agent-systems]] — distributed tracing across agent boundaries
- [[concepts/cost-optimization]] — per-call cost tracking feeds into cost optimization
- [[concepts/state-persistence]] — checkpoint events are observability events

---

## Sources

- OpenTelemetry documentation (2024)
- LangSmith tracing documentation (2024)
- Honeycomb "Observability Engineering" (book, 2022)
- Anthropic agent monitoring guidance (2025)
