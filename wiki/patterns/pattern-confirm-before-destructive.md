---
id: 01KNNVX2QYTJTQH22B09MZ1E48
title: Confirm Before Destructive
type: pattern
category: safety
problem: Agent takes irreversible actions (deletes, sends, deploys) without sufficient verification
solution: Gate destructive actions on explicit confirmation — human or high-confidence programmatic check
tradeoffs:
  - "Prevents catastrophic mistakes vs adds latency/friction to legitimate operations"
  - "Human approval is reliable vs human approval is slow and doesn't scale"
  - "Programmatic checks are fast vs may miss edge cases human would catch"
tags: [safety, confirmation, destructive, human-in-the-loop, guardrails]
confidence: high
sources:
  - "Anthropic: Building Effective Agents (2024)"
  - "Agentic safety patterns (2024-2025)"
created: 2026-04-04
updated: 2026-04-04
---

## Problem

Agents take actions. Some actions are irreversible: a deleted file is gone (unless backed up), a sent email has been read, a payment has been charged, a deployed service is live. An agent that makes the wrong call on any of these — due to hallucination, misunderstanding, or bug — causes real harm. The default agent execution model (take action immediately) is not appropriate for irreversible operations.

---

## Solution

Before executing any destructive action, gate on explicit confirmation. Confirmation can be:
- **Human approval** — the agent pauses, presents the proposed action, waits for explicit approval
- **Programmatic high-confidence check** — automated verification that the action is correct (running tests, diff review, schema validation)
- **Self-consistency check** — the agent reasons about the action from multiple angles and only proceeds if all reasoning paths agree

Irreversible actions that fail the confirmation gate are aborted, not retried.

---

## Implementation Sketch

### Defining "Destructive"

```python
DESTRUCTIVE_ACTION_TYPES = {
    # File system
    "delete_file",
    "delete_directory",
    "overwrite_file",  # context-dependent — overwriting prod configs is destructive

    # External communications
    "send_email",
    "send_notification",
    "post_to_slack",
    "create_github_issue",  # semi-destructive; visible externally

    # Deployments
    "deploy_to_production",
    "update_dns",
    "rotate_api_keys",

    # Database
    "delete_record",
    "drop_table",
    "run_migration",  # in production

    # Payments
    "charge_payment",
    "issue_refund",

    # Infrastructure
    "terminate_instance",
    "scale_down_service",
}

def is_destructive(tool_name: str, args: dict) -> bool:
    if tool_name in DESTRUCTIVE_ACTION_TYPES:
        return True
    # Context-specific: file write is destructive for production files
    if tool_name == "write_file" and is_production_path(args.get("path", "")):
        return True
    return False
```

### Human Confirmation Gate

```python
async def execute_with_confirmation(
    tool_name: str,
    args: dict,
    mode: Literal["auto", "human", "programmatic"] = "auto"
) -> str:
    if not is_destructive(tool_name, args):
        return await execute_tool(tool_name, args)

    # Select confirmation method
    if mode == "human" or requires_human(tool_name):
        return await human_confirmation_gate(tool_name, args)
    elif mode == "programmatic":
        return await programmatic_confirmation_gate(tool_name, args)
    else:
        # Auto: use risk level to decide
        risk = assess_risk(tool_name, args)
        if risk == "critical":
            return await human_confirmation_gate(tool_name, args)
        elif risk == "high":
            return await programmatic_confirmation_gate(tool_name, args)
        else:
            return await self_consistency_gate(tool_name, args)

async def human_confirmation_gate(tool_name: str, args: dict) -> str:
    """Pause execution and request human approval."""
    confirmation_request = format_confirmation_request(tool_name, args)
    print("\n" + "="*60)
    print("CONFIRMATION REQUIRED")
    print("="*60)
    print(confirmation_request)
    print("\nOptions: [A]pprove / [R]eject / [M]odify args")

    response = input("> ").strip().upper()

    if response.startswith("A"):
        result = await execute_tool(tool_name, args)
        audit_log("confirmed", tool_name, args, result)
        return result
    elif response.startswith("M"):
        modified_args = await collect_modified_args(args)
        return await human_confirmation_gate(tool_name, modified_args)
    else:
        audit_log("rejected", tool_name, args, None)
        return f"ACTION REJECTED: {tool_name} was not executed. Reason: user rejected."

def format_confirmation_request(tool_name: str, args: dict) -> str:
    """Format a confirmation request that gives the human enough context."""
    impact = assess_impact(tool_name, args)
    reversibility = assess_reversibility(tool_name, args)
    alternatives = suggest_alternatives(tool_name, args)

    return f"""Action: {tool_name}
Arguments:
{json.dumps(args, indent=2)}

Impact: {impact}
Reversibility: {reversibility}
Risk level: {assess_risk(tool_name, args).upper()}
{f"Alternatives: {alternatives}" if alternatives else ""}

What will happen if approved:
{describe_action(tool_name, args)}"""
```

### Programmatic Confirmation Gate

For high-risk operations where you want automated verification without human latency:

```python
async def programmatic_confirmation_gate(tool_name: str, args: dict) -> str:
    """Run automated checks before executing a destructive action."""
    checks = get_confirmation_checks(tool_name, args)
    results = await asyncio.gather(*[check() for check in checks])

    failed_checks = [r for r in results if not r.passed]
    if failed_checks:
        failures = "\n".join(f"- {r.check_name}: {r.reason}" for r in failed_checks)
        audit_log("blocked_programmatic", tool_name, args, failures)
        return (
            f"ACTION BLOCKED: {tool_name} did not pass automated checks.\n"
            f"Failed checks:\n{failures}\n"
            f"Resolve these issues before proceeding."
        )

    result = await execute_tool(tool_name, args)
    audit_log("approved_programmatic", tool_name, args, result)
    return result

def get_confirmation_checks(tool_name: str, args: dict) -> list[Callable]:
    """Return the checks to run before this specific action."""
    if tool_name == "deploy_to_production":
        return [
            lambda: check_test_suite_passes(),
            lambda: check_no_pending_migrations(),
            lambda: check_staging_is_healthy(),
            lambda: check_no_active_incidents(),
        ]
    if tool_name == "delete_file":
        return [
            lambda: check_file_is_backed_up(args["path"]),
            lambda: check_no_other_files_depend_on(args["path"]),
        ]
    return []
```

### Audit Logging

Every gate decision must be logged — whether approved, rejected, or modified:

```python
@dataclass
class GateAuditRecord:
    timestamp: str
    action: str
    tool_name: str
    args_hash: str  # hash, not raw args (may contain sensitive data)
    decision: Literal["approved_human", "approved_programmatic", "rejected", "modified"]
    decided_by: str
    risk_level: str
    outcome: Optional[str]  # filled in after execution

def audit_log(decision: str, tool_name: str, args: dict, outcome: Optional[str]):
    record = GateAuditRecord(
        timestamp=utcnow(),
        action=f"{tool_name}({summarize_args(args)})",
        tool_name=tool_name,
        args_hash=hash_args(args),
        decision=decision,
        decided_by="human" if "human" in decision else "automated",
        risk_level=assess_risk(tool_name, args),
        outcome=outcome,
    )
    append_to_audit_log(record)
```

---

## What Counts as Destructive

**Clearly destructive** (always gate):
- Deletions of any kind
- External communications (email, Slack, notifications)
- Production deployments
- Payment operations
- Schema migrations in production
- Credential rotation

**Context-dependent** (gate based on context):
- File overwrites (production config = destructive; test file = probably not)
- API calls to external services (POST/PUT/DELETE = likely destructive)
- Database writes (production = gate; test DB = probably not)

**Not destructive** (no gate needed):
- File reads
- Database reads
- Internal calculations
- Writes to temp/scratch files

---

## Tradeoffs

| | Pros | Cons |
|---|------|------|
| Human approval | High reliability, accounts for context | Latency, doesn't scale, approval fatigue |
| Programmatic checks | Fast, scalable, consistent | Can't catch what checks don't cover |
| Audit logging | Accountability, debugging, compliance | Adds complexity, log storage overhead |
| Blocking by default | Prevents mistakes before they happen | May frustrate legitimate use in trusted contexts |

---

## When To Use

- Any tool that can take an irreversible action
- Any deployment to production
- Any operation affecting external parties (users, vendors, partners)
- Any operation in regulated domains

## When NOT To Use

- Read-only operations
- Writes to isolated test environments (no external effects)
- When the operation is explicitly designed to be automatic (e.g., scheduled cleanup jobs with well-defined, tested criteria)

---

## Real Examples

- [[framework-claude-code]] default mode: prompts before file writes and bash commands
- GSD verify-work: human reviews before shipping
- [[framework-superpowers]] "verification before completion": tests pass before claiming done
- CI/CD: staging deployment auto-approved; production requires manual approval

---

## Related Patterns

- [[concepts/human-in-the-loop]] — the broader HITL pattern
- [[concepts/guardrails]] — complementary automated safety measures
- [[patterns/pattern-minimal-permissions]] — reducing blast radius so gates matter less
- [[concepts/permission-modes]] — [[framework-claude-code]]'s built-in confirmation system

---

## Sources

- [[anthropic]] "Building Effective Agents" (2024)
- Agentic safety engineering patterns (2024-2025)
