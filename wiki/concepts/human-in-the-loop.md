---
id: 01KNNVX2QEX8BTQE804A4H0Q9K
title: Human-in-the-Loop
type: concept
tags: [agentic, hitl, oversight, approval, escalation, interrupts]
confidence: high
sources:
  - "Anthropic: Building Effective Agents (2024)"
  - "OpenAI: Practices for Governing Agentic AI Systems (2025)"
  - "AI Safety literature: CAIS, Anthropic (2024)"
created: 2026-04-04
updated: 2026-04-04
related:
  - "[[concepts/guardrails]]"
  - "[[concepts/permission-modes]]"
  - "[[concepts/agent-failure-modes]]"
  - "[[concepts/state-persistence]]"
  - "[[patterns/pattern-confirm-before-destructive]]"
status: stable
---

## TL;DR

Human-in-the-loop (HITL) is any pattern where agent execution pauses for human review, approval, or correction before continuing. The key design decisions are: when to interrupt, how long to wait, what information to present, and how to resume cleanly. HITL is not just a safety mechanism — it's a trust-building mechanism for deploying agents in high-stakes contexts.

---

## Definition

Human-in-the-loop (HITL) refers to any design pattern where a human is inserted into the agent execution cycle at defined checkpoints. The agent pauses, presents relevant context to the human, waits for input, and then resumes (or aborts) based on that input.

---

## How It Works

### Approval Gates

The most common HITL pattern. Before executing a specific action class, the agent requests explicit approval:

```python
class ApprovalGate:
    def __init__(self, requires_approval_for: set[str], timeout_seconds: int = 300):
        self.requires_approval_for = requires_approval_for
        self.timeout = timeout_seconds

    async def check(self, action: AgentAction) -> ApprovalResult:
        if action.type not in self.requires_approval_for:
            return ApprovalResult(approved=True, auto=True)

        approval_request = self.format_approval_request(action)
        response = await self.send_to_human(approval_request, timeout=self.timeout)

        if response is None:
            return ApprovalResult(approved=False, reason="timeout")
        return ApprovalResult(approved=response.decision == "approve", reason=response.notes)

    def format_approval_request(self, action: AgentAction) -> ApprovalRequest:
        return ApprovalRequest(
            action_type=action.type,
            action_description=action.describe(),
            risk_level=action.risk_level,
            context=action.context_summary,
            alternatives=action.alternatives,
            recommended=action.is_recommended
        )
```

The approval request must include: what will happen, why the agent chose this, what the alternatives are, and what happens if rejected. An approval request that just says "approve?" is useless.

### Interrupt Patterns

Beyond pre-action gates, agents can be interrupted mid-execution:

**Scheduled checkpoints**: Every N steps, pause and summarize progress. Human decides to continue, redirect, or abort.

**Confidence-based interrupts**: When the agent's confidence in the next action is below threshold, interrupt:

```python
if action.confidence < CONFIDENCE_THRESHOLD:
    user_input = await ask_human(
        f"I'm unsure about the next step. I was planning to: {action.describe()}\n"
        f"My uncertainty: {action.uncertainty_reason}\n"
        f"Should I proceed, or would you like to guide me?"
    )
```

**Error-triggered interrupts**: When the agent hits an unexpected error that it can't recover from automatically:

```python
except UnrecoverableError as e:
    checkpoint = save_state()
    await notify_human(
        f"I've hit an error I can't resolve: {str(e)}\n"
        f"State saved at: {checkpoint.path}\n"
        f"Options: retry with modified approach, skip step, or abort."
    )
```

### Escalation Triggers

When to escalate to a human vs when to self-recover:

| Situation | Action |
|-----------|--------|
| Tool returns unexpected error | Retry up to 3x, then escalate |
| Confidence below threshold | Escalate immediately |
| Destructive action not explicitly authorized | Escalate immediately |
| Agent detects it's in a loop | Escalate after 2 iterations |
| External API timeout | Retry with backoff, then escalate |
| Task scope creep detected | Escalate before expanding scope |
| Contradiction in instructions | Escalate (don't resolve unilaterally) |

### Async vs Sync Checkpoints

**Synchronous**: Agent blocks execution waiting for human response. Simple, but:
- Entire session hangs during human latency (minutes to hours)
- Context may expire if the session has a timeout
- Agent must save enough state to resume

**Asynchronous**: Agent saves state, reports to human, terminates. Human reviews, resumes agent in a new session with checkpoint:

```python
# Async interrupt pattern
async def request_approval_async(action: AgentAction, state: AgentState):
    checkpoint = await state.save()
    ticket = await create_approval_ticket(
        action=action,
        checkpoint_id=checkpoint.id,
        resume_endpoint="/api/agents/resume"
    )
    await notify_human(ticket)
    return SuspendSignal(ticket_id=ticket.id)  # Agent terminates cleanly

# Human approves → webhook fires:
async def resume_agent(ticket_id: str, decision: ApprovalDecision):
    ticket = await get_ticket(ticket_id)
    checkpoint = await load_checkpoint(ticket.checkpoint_id)
    agent = Agent.from_checkpoint(checkpoint)
    if decision.approved:
        await agent.resume(override_action=decision.modified_action)
    else:
        await agent.abort(reason=decision.rejection_reason)
```

Async is the production pattern for long-running agents. See [[concepts/state-persistence]] for checkpoint implementation.

### UX Patterns for Human Oversight

The review interface is as important as the interrupt logic:

**Minimal, actionable presentation**:
- Show what the agent will do, not the raw plan
- Show the one key decision, not the full context
- Provide Approve / Reject / Modify / Pause options
- Include "What happens if I reject this?" and "What are the alternatives?"

**Context compression for reviewers**:
- 3-5 bullet summary of what's happened so far
- The specific action requiring approval
- Risk level (LOW / MEDIUM / HIGH / CRITICAL)
- Recommended action (if agent has a clear preference)

**Audit trail**:
- Log every HITL checkpoint, the information presented, the decision, and the rationale
- Required for regulated domains; useful for debugging everywhere

---

## Auditability

Every HITL checkpoint should be logged in a way that answers:
- What was the agent about to do?
- What information did the human see when deciding?
- What decision was made and by whom?
- What happened after the decision?

```python
@dataclass
class HITLAuditRecord:
    timestamp: datetime
    session_id: str
    checkpoint_id: str
    action_proposed: dict
    context_presented: str
    risk_level: str
    decision: Literal["approved", "rejected", "modified"]
    decided_by: str  # user ID
    modified_action: Optional[dict]
    outcome: Optional[str]  # filled in after execution
```

---

## When to Require Human Review

Non-negotiable HITL triggers:
- First time an agent is deployed in a new environment
- Actions that cannot be undone (email sent, record deleted, money transferred)
- Actions affecting > N users simultaneously
- Actions in regulated domains without established automation approval
- Agent confidence is low and error cost is high

Optional (calibrate to risk tolerance):
- Repeated patterns the agent has handled well → automate
- High-confidence, low-stakes → log and continue

---

## Risks & Pitfalls

- **Approval fatigue**: Too many approvals → humans rubber-stamp without review. Only gate truly risky actions.
- **Context collapse**: Human doesn't have enough context to make a meaningful decision. Approval becomes theater.
- **State corruption during wait**: If the world changes while waiting for approval, the approved action may no longer be correct. Validate world state at resume time.
- **Timeout handling**: What happens when the human doesn't respond? Abort > assume approval.

---

## Related Concepts

- [[concepts/guardrails]] — automated guardrails as HITL complement
- [[concepts/state-persistence]] — enabling clean resume after human review
- [[concepts/agent-failure-modes]] — failure modes that trigger HITL
- [[patterns/pattern-confirm-before-destructive]] — action-level HITL gate

---

## Sources

- [[anthropic]] "Building Effective Agents" (2024)
- [[openai]] "Practices for Governing Agentic AI Systems" (2025)
- AI Safety Institute: Agentic AI oversight frameworks (2025)
