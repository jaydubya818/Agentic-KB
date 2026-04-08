---
id: 01KNNVX2R4SNNPMY7J0DK3RAVP
title: Tool Output Validation
type: pattern
category: tool-use
problem: Agent acts on malformed or unexpected tool output, causing downstream failures
solution: Validate tool returns against expected schema before passing to LLM
tradeoffs:
  - "Catches bad output early vs validation adds latency and code complexity"
  - "Structured errors help model recover vs may mask underlying tool bugs"
  - "Fail fast vs partial results may be usable"
tags: [tool-use, validation, schema, error-handling, reliability]
confidence: high
sources:
  - "Practical agentic reliability patterns (2024)"
  - "Pydantic validation documentation"
created: 2026-04-04
updated: 2026-04-04
---

## Problem

LLMs act on tool output as if it's authoritative. If a tool returns:
- Malformed JSON when the LLM expected structured data
- A truncated file when the LLM expected the full content
- An error string in a field that should contain a number
- `null` when the LLM expects a non-null value

...the LLM proceeds as if the data is valid. It extracts values from the wrong locations, treats error messages as data, or silently ignores missing fields. The failure propagates downstream — potentially through 5 more tool calls — before producing a visibly wrong output.

Early validation at the tool return boundary catches these failures before they compound.

---

## Solution

Every tool call result passes through a validation layer before being returned to the LLM. The validator checks schema, value ranges, required fields, and structural invariants. On failure, it returns a structured error string that helps the LLM understand what went wrong and how to recover.

---

## Implementation Sketch

### Schema Validation with Pydantic

```python
from pydantic import BaseModel, Field, ValidationError
from typing import Optional

class UserRecord(BaseModel):
    id: str
    email: str = Field(pattern=r'^[^@]+@[^@]+\.[^@]+$')
    name: str = Field(min_length=1, max_length=200)
    role: str = Field(pattern=r'^(admin|user|moderator)$')
    created_at: str  # ISO 8601

def get_user_tool(user_id: str) -> str:
    """Tool wrapper with output validation."""
    try:
        raw_result = db.fetch_user(user_id)
    except DatabaseError as e:
        return f"ERROR [db_error]: Failed to fetch user {user_id}: {str(e)}"

    if raw_result is None:
        return f"ERROR [not_found]: No user found with ID {user_id}"

    try:
        validated = UserRecord.model_validate(raw_result)
        return validated.model_dump_json()
    except ValidationError as e:
        error_details = "; ".join(
            f"{err['loc'][-1]}: {err['msg']}" for err in e.errors()
        )
        return (
            f"ERROR [invalid_data]: User record for {user_id} failed validation. "
            f"Fields with issues: {error_details}. "
            f"This may indicate a database integrity problem."
        )
```

### Validation Envelope Pattern

For tools with variable output types, use an envelope that always has the same structure:

```python
@dataclass
class ToolResult:
    success: bool
    data: Optional[Any]
    error_code: Optional[str]
    error_message: Optional[str]
    error_hint: Optional[str]  # What the LLM should do next

    def to_string(self) -> str:
        if self.success:
            return json.dumps({"status": "success", "data": self.data})
        return (
            f"ERROR [{self.error_code}]: {self.error_message}"
            + (f"\nHint: {self.error_hint}" if self.error_hint else "")
        )

def tool_wrapper(tool_fn: Callable) -> Callable:
    """Wrap any tool function with validation and error handling."""
    def wrapped(*args, **kwargs) -> str:
        try:
            result = tool_fn(*args, **kwargs)

            # Validate result type
            if result is None:
                return ToolResult(
                    success=False,
                    data=None,
                    error_code="null_result",
                    error_message=f"{tool_fn.__name__} returned null unexpectedly.",
                    error_hint="Check if the resource exists before calling this tool.",
                ).to_string()

            return ToolResult(success=True, data=result).to_string()

        except TimeoutError:
            return ToolResult(
                success=False, data=None,
                error_code="timeout",
                error_message=f"{tool_fn.__name__} timed out.",
                error_hint="The service may be slow. Retry once, then report if still timing out.",
            ).to_string()

        except Exception as e:
            return ToolResult(
                success=False, data=None,
                error_code="unexpected_error",
                error_message=f"{type(e).__name__}: {str(e)}",
                error_hint="This is an unexpected error. Do not retry — report this issue.",
            ).to_string()

    return wrapped
```

### Structural Validators for Common Output Types

```python
def validate_json_output(raw: str, expected_schema: dict) -> str:
    """Validate and format JSON tool output."""
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as e:
        return (
            f"ERROR [invalid_json]: Tool returned malformed JSON. "
            f"Parse error at position {e.pos}: {e.msg}. "
            f"Raw output (first 200 chars): {raw[:200]}"
        )

    try:
        jsonschema.validate(parsed, expected_schema)
        return json.dumps(parsed)  # Return clean, normalized JSON
    except jsonschema.ValidationError as e:
        return (
            f"ERROR [schema_mismatch]: Tool output doesn't match expected schema. "
            f"Violation at '{'.'.join(str(p) for p in e.path)}': {e.message}. "
            f"Expected: {e.schema.get('type', 'unknown type')}"
        )

def validate_file_content(content: str, path: str, min_length: int = 10) -> str:
    """Validate file read output."""
    if content.startswith("ERROR"):
        return content  # Pass through error messages unchanged

    if len(content) < min_length:
        return (
            f"WARNING [possibly_empty]: File at '{path}' is very short ({len(content)} chars). "
            f"Verify this is the correct file and it contains expected content."
        )

    return content
```

### Error Messages That Help the LLM Recover

The error message the LLM receives determines whether it can recover. Design error messages to answer:

1. **What happened?** — Type of failure
2. **Why?** — Root cause if known
3. **What should I do?** — Specific next action

| Bad Error | Good Error |
|-----------|-----------|
| "Error" | "ERROR [not_found]: No record with ID 'usr_999' exists in the database. Verify the ID is correct, or use list_users to find valid IDs." |
| "Invalid input" | "ERROR [invalid_param]: 'date' must be in ISO 8601 format (YYYY-MM-DD). Received: '04/04/2026'. Correct format: '2026-04-04'." |
| "Failed" | "ERROR [timeout]: The payment processor timed out after 30s. Do not retry — the charge status is unknown. Call check_payment_status with the payment_id to determine if the charge completed." |

---

## Validation Depth

Not every tool needs deep validation. Match validation depth to risk level:

| Risk Level | Tool Type | Validation |
|-----------|-----------|------------|
| Critical | Payment, auth, destructive | Full schema + semantic validation |
| High | DB writes, external APIs | Schema validation + null checks |
| Medium | File writes, config changes | Type check + basic structure |
| Low | Read-only, informational | Null check + error passthrough |

---

## Tradeoffs

| | Pros | Cons |
|---|------|------|
| Early failure | Catches issues before LLM acts on bad data | Validation adds latency (small, but real) |
| Structured errors | LLM can recover intelligently | Requires writing good error messages for each failure mode |
| Schema enforcement | Guarantees output structure | Schema drift: tool changes but validator doesn't |
| Audit trail | Validation failures are logged | False positives on valid edge cases if schema is too strict |

---

## When To Use

- Any tool that returns data the LLM will use to make decisions
- Any tool connecting to an external system (API, DB, file system)
- Any tool whose output could be partially valid (e.g., a search that returns 0 results)
- Any tool in a multi-agent pipeline where bad output will propagate

## When NOT To Use

- Pure no-op or fire-and-forget tools (no output to validate)
- Tools where any string output is valid (e.g., free-form text retrieval)

---

## Related Patterns

- [[patterns/pattern-tool-schema]] — designing inputs; this pattern covers outputs
- [[patterns/pattern-idempotent-tools]] — retry safety; this pattern makes retries informative
- [[patterns/pattern-read-before-write]] — validating state before writing
- [[concepts/guardrails]] — validation as a guardrail layer

---

## Sources

- Practical agentic reliability patterns (2024)
- Pydantic V2 documentation
- JSON Schema specification
