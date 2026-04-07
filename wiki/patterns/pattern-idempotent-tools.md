---
title: Idempotent Tools
type: pattern
category: tool-use
problem: Agent retries cause duplicate operations (double-sending, double-creating)
solution: Design tools to be safe to call multiple times with same input
tradeoffs:
  - "Retry safety vs added complexity in tool implementation"
  - "Predictable behavior vs overhead of deduplication logic"
  - "Reliability vs slower tools due to existence checks"
tags: [tool-use, idempotency, reliability, retries, safety]
confidence: high
sources:
  - "REST API idempotency patterns"
  - "Anthropic: Tool reliability best practices"
  - "Stripe idempotency key documentation"
created: 2026-04-04
updated: 2026-04-04
---

## Problem

In agentic loops, tools are called and retried. Retries happen because:
- Network timeouts (did the call complete? the agent doesn't know)
- Agent doesn't recognize the call succeeded (poor error message)
- Deliberate retry logic after a perceived failure
- Loop bugs where the same action is taken twice

Non-idempotent tools compound errors on retry:
- `send_email` called twice → user receives two emails
- `create_record` called twice → two identical records in the database
- `charge_payment` called twice → user is double-charged
- `deploy_service` called twice → race condition in deployment

The agent usually doesn't know it's calling a tool for the second time with the same intent.

---

## Solution

Design tools so that calling them N times with the same arguments produces the same result as calling them once. The world state after N calls equals the world state after 1 call.

Mathematical definition: `f(f(x)) = f(x)`

---

## Implementation Sketch

### Idempotency Keys

The most reliable pattern: require callers to provide an idempotency key. The tool stores completed operations and returns the prior result on duplicate key.

```python
import hashlib
from datetime import datetime, timedelta

class IdempotencyStore:
    def __init__(self, ttl_hours: int = 24):
        self.store: dict[str, dict] = {}
        self.ttl = timedelta(hours=ttl_hours)

    def get(self, key: str) -> Optional[dict]:
        entry = self.store.get(key)
        if entry and datetime.now() - entry["created_at"] < self.ttl:
            return entry["result"]
        return None

    def set(self, key: str, result: dict):
        self.store[key] = {"result": result, "created_at": datetime.now()}

idempotency_store = IdempotencyStore()

def send_email(
    to: str,
    subject: str,
    body: str,
    idempotency_key: str,  # Required — usually: hash(to + subject + session_id)
) -> str:
    """
    Send an email. Safe to retry — duplicate calls with same idempotency_key
    return the same result without re-sending.

    idempotency_key: A unique string for this send operation. Use the same key
    if retrying after a timeout. Generate a new key for a genuinely new send.
    """
    # Check for prior completion
    prior = idempotency_store.get(idempotency_key)
    if prior:
        return f"SUCCESS (deduplicated): Email was already sent. Message ID: {prior['message_id']}"

    # Send the email
    message_id = email_client.send(to=to, subject=subject, body=body)

    # Store the result
    result = {"message_id": message_id, "sent_at": datetime.now().isoformat()}
    idempotency_store.set(idempotency_key, result)

    return f"SUCCESS: Email sent. Message ID: {message_id}"
```

### Auto-Generated Idempotency Keys

Let the agent specify the key, but also provide a sensible default:

```python
def generate_idempotency_key(tool_name: str, args: dict) -> str:
    """Generate a deterministic key from tool name + args."""
    canonical = json.dumps({"tool": tool_name, "args": args}, sort_keys=True)
    return hashlib.sha256(canonical.encode()).hexdigest()[:16]
```

This generates the same key for the same tool call, making retry detection automatic without requiring the agent to manage keys explicitly.

### Database Upsert

For record creation, use upsert (insert or update) instead of insert:

```python
def create_or_update_user(email: str, name: str, role: str) -> str:
    """
    Create a user or update if one with this email already exists.
    Safe to call multiple times — always results in exactly one user with this email.
    """
    existing = db.query("SELECT id FROM users WHERE email = $1", [email])

    if existing:
        db.execute(
            "UPDATE users SET name = $1, role = $2, updated_at = NOW() WHERE email = $3",
            [name, role, email]
        )
        return f"SUCCESS: Updated existing user (ID: {existing.id})"
    else:
        new_id = db.execute(
            "INSERT INTO users (email, name, role, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id",
            [email, name, role]
        )
        return f"SUCCESS: Created new user (ID: {new_id})"
```

### File Write Idempotency

File writes are naturally idempotent if content is deterministic:

```python
def write_config_value(key: str, value: str, config_path: str) -> str:
    """Update a config key. Idempotent — calling twice with same args has same result."""
    config = read_json(config_path)

    if config.get(key) == value:
        return f"No-op: {key} is already set to {value}"

    config[key] = value
    write_json(config_path, config)
    return f"SUCCESS: Set {key} = {value}"
```

If the value is already set to the target, return success without writing. This also handles the case where the write succeeded but the agent didn't see the success response.

### Deduplication Logic

When natural idempotency isn't possible (e.g., some operations are inherently state-changing), use deduplication:

```python
class OperationLog:
    """Append-only log of completed operations for deduplication."""

    def __init__(self, log_path: str):
        self.log_path = log_path

    def is_completed(self, operation_id: str) -> bool:
        log = self.load()
        return any(entry["id"] == operation_id for entry in log)

    def mark_completed(self, operation_id: str, result: dict):
        log = self.load()
        log.append({"id": operation_id, "result": result, "at": utcnow()})
        self.save(log)

op_log = OperationLog("memory/operation-log.jsonl")

def deploy_service(service_name: str, version: str, deploy_id: str) -> str:
    """Deploy a service. Idempotent via deploy_id."""
    if op_log.is_completed(deploy_id):
        return f"No-op: Deploy {deploy_id} already completed."

    result = k8s_client.deploy(service=service_name, version=version)
    op_log.mark_completed(deploy_id, result)
    return f"SUCCESS: Deployed {service_name}:{version}"
```

---

## Why This Matters for Reliability

In a 20-step agent loop with 95% per-step success rate:
- P(no retries needed) = 0.95^20 ≈ 36%
- Meaning: in 64% of sessions, at least one step is retried

Without idempotent tools, that 64% has compounding effects. With idempotent tools, retries are free.

---

## Tradeoffs

| | Pros | Cons |
|---|------|------|
| Retry safety | Retries are always safe | Deduplication logic adds implementation complexity |
| Predictable behavior | Same input = same world state | May mask bugs where duplicate calls signal a problem |
| Reliability at scale | Essential for production agents | Idempotency store must be persisted; adds infra |
| Audit trail | Operation log is an audit record | Log must be maintained and pruned |

---

## When To Use

- Any tool that creates records, sends messages, or triggers external effects
- Any tool called in a retry loop
- Any tool in a multi-agent system where duplicate calls are possible
- All payment, email, notification, and deployment operations (non-negotiable)

## When NOT To Use

- Pure read operations (already idempotent by definition)
- Operations where duplicate-detection is harmful (e.g., you genuinely want to allow sending the same email twice — add explicit `force: bool` parameter instead)

---

## Real Examples

- Stripe payment API: idempotency keys on charge creation
- AWS API: idempotent token on CloudFormation stack creation
- GitHub API: Create-or-update endpoints for PR comments
- Any agent file write: check current content matches target before overwriting

---

## Related Patterns

- [[patterns/pattern-read-before-write]] — check state before mutating
- [[patterns/pattern-confirm-before-destructive]] — gate on non-retryable actions
- [[patterns/pattern-tool-schema]] — description that communicates idempotency contract
- [[concepts/tool-use]] — tool design context

---

## Sources

- REST API idempotency patterns (Stripe, AWS documentation)
- Anthropic Tool Use reliability best practices
- Richardson & Ruby "RESTful Web Services"
