---
id: 01KNNVX2R4EW4AF184CVZTANCT
title: Tool Schema Design
type: pattern
category: tool-use
problem: Poorly designed tool schemas cause LLMs to misuse or misunderstand tools
solution: Write tool descriptions as if explaining to a smart junior developer; constrain inputs with JSON Schema
tradeoffs:
  - "Verbose descriptions improve usage vs add tokens to every prompt"
  - "Strict JSON Schema catches misuse vs overly strict schemas reject valid inputs"
  - "Clear naming reduces ambiguity vs verbose names are awkward to read in traces"
tags: [tool-use, schema, json-schema, naming, reliability]
confidence: high
sources:
  - "Anthropic: Tool use best practices (2025)"
  - "OpenAI: Function calling documentation"
  - "Empirical tool use studies (2024)"
created: 2026-04-04
updated: 2026-04-04
---

## Problem

LLMs select and invoke tools based primarily on the tool description. A vague, ambiguous, or incomplete description causes the model to:
- Call the wrong tool for the task
- Call the right tool with wrong parameters
- Hallucinate parameter values not available in context
- Miss tools that would help because the description doesn't match the task's language
- Use tools in ways the developer didn't intend

A well-designed schema eliminates most of these failure modes without changing the model.

---

## Solution

Design tool schemas with the same care as a public API. The description is the contract. Constraints in JSON Schema enforce the contract mechanically. Error responses teach the model how to recover.

---

## Implementation Sketch

### Naming Conventions

```
Pattern: {verb}_{noun}  (snake_case)
Good:  read_file, write_file, search_web, create_record, delete_user
Bad:   file, getFile, fileRead, rf, readF
```

**Verbs by action type**:
- Read-only: `read_`, `get_`, `search_`, `list_`, `fetch_`, `check_`
- Write: `write_`, `create_`, `update_`, `set_`, `append_`
- Execute: `run_`, `execute_`, `invoke_`, `call_`
- Destructive: `delete_`, `remove_`, `drop_` (clear signal to add caution)

The verb signals intent to the model, which affects when the model will use the tool. `search_files` vs `read_file` are clearly different actions.

### Description Structure

Every description should answer:
1. **What does this tool do?** (one sentence, active voice)
2. **When should I use it?** (what task context triggers this tool)
3. **When should I NOT use it?** (disambiguate from similar tools)
4. **What does it return?** (format and content of output)

```json
{
  "name": "search_files",
  "description": "Search for files matching a pattern or containing specific text. Use when you need to find files without knowing their exact paths. Do NOT use if you already know the exact file path — use read_file instead. Returns a list of matching file paths with optional line numbers for content matches.",
  "input_schema": {
    "type": "object",
    "properties": {
      "pattern": {
        "type": "string",
        "description": "Glob pattern (e.g., '**/*.ts') or text to search for. Use glob for file name matching, text for content search."
      },
      "search_type": {
        "type": "string",
        "enum": ["filename", "content"],
        "description": "Whether to match by filename pattern or file content. Default: filename."
      },
      "directory": {
        "type": "string",
        "description": "Directory to search in. Defaults to current working directory. Use absolute paths."
      },
      "max_results": {
        "type": "integer",
        "minimum": 1,
        "maximum": 100,
        "default": 20,
        "description": "Maximum number of results to return. Use lower values for exploratory searches."
      }
    },
    "required": ["pattern"]
  }
}
```

### Parameter Description Guidelines

Each parameter description should specify:
- **Type hint in plain language** (even if type is in the schema — repetition helps)
- **Format if non-obvious** (`"absolute paths only"`, `"ISO 8601 format"`)
- **Valid values if constrained** (use `enum` in schema; describe in text too)
- **Default behavior** if optional (`"Defaults to current working directory"`)
- **Disambiguation** when similar to another parameter (`"Use glob for file name matching, text for content search"`)

```json
{
  "name": "date",
  "type": "string",
  "description": "Date in ISO 8601 format (YYYY-MM-DD). Example: 2026-04-04. Do NOT include time — use date_time for datetime values."
}
```

### Enum Usage

Use `enum` whenever the set of valid values is finite and known. Avoid open strings when enums apply:

```json
{
  "name": "log_level",
  "type": "string",
  "enum": ["debug", "info", "warn", "error"],
  "description": "Severity level for the log entry. Use 'error' for exceptions, 'warn' for recoverable issues, 'info' for normal events, 'debug' for diagnostic detail."
}
```

Enums are enforced by the API — the model can't pass an invalid value even if it tries.

### Error Response Format

When a tool call fails, the error message the model receives determines whether it recovers correctly:

```python
def read_file(path: str, offset: int = 0, limit: int = 0) -> str:
    """Returns file contents or a structured error string."""

    if not path.startswith("/"):
        return (
            f"ERROR [invalid_path]: Path must be absolute (start with /). "
            f"Received: '{path}'. "
            f"Hint: use the current working directory prefix if you know it, "
            f"or use search_files to find the correct path."
        )

    if not os.path.exists(path):
        return (
            f"ERROR [file_not_found]: No file at '{path}'. "
            f"Verify the path is correct. Use search_files to find files if unsure of the path."
        )

    if not os.access(path, os.R_OK):
        return (
            f"ERROR [permission_denied]: Cannot read '{path}'. "
            f"This file requires elevated permissions."
        )

    # ... actual read logic
```

Error format:
- `ERROR [error_code]:` — machine-parseable prefix
- Plain-language description — model understands what happened
- Actionable hint — model knows what to do next

### Description Length

| Tool Complexity | Description Length |
|----------------|-------------------|
| Simple, obvious | 1-2 sentences (30-60 words) |
| Moderate (3-5 params) | 3-5 sentences (60-120 words) |
| Complex (many params, edge cases) | Up to 200 words |

Don't over-describe simple tools — it dilutes attention from the important parts. Don't under-describe complex tools — the model will guess.

---

## Anti-Patterns

**Anti-pattern: generic description**
```json
{"name": "file_op", "description": "Performs file operations."}
```
When does the model use this? Nobody knows, including the model.

**Anti-pattern: parameter names without descriptions**
```json
{"name": "mode", "type": "string"}
```
What is `mode`? The model guesses.

**Anti-pattern: overlapping tool descriptions**
```json
{"name": "get_user", "description": "Gets user information."}
{"name": "fetch_user", "description": "Fetches user data."}
```
The model flips a coin.

**Anti-pattern: required parameters without examples**
```json
{"name": "query", "type": "string", "description": "The query to run."}
```
What's the query syntax? The model guesses.

---

## Tradeoffs

| | Pros | Cons |
|---|------|------|
| Verbose descriptions | Model uses tools correctly | Adds tokens to every request; increases cost |
| Strict JSON Schema | Prevents invalid calls at API level | Overly strict schemas reject valid inputs; maintenance burden |
| Enum constraints | Eliminates invalid values | May need to extend as requirements grow |
| Structured errors | Model recovers from failures | More implementation effort per tool |

---

## When To Use

This pattern applies to every tool in any agentic system. There is no scenario where a poorly described tool is acceptable.

## When NOT To Use

N/A — always design tool schemas carefully.

---

## Related Patterns

- [[patterns/pattern-idempotent-tools]] — safe retry behavior
- [[patterns/pattern-tool-output-validation]] — validating what tools return
- [[patterns/pattern-read-before-write]] — disciplined tool usage pattern
- [[concepts/tool-use]] — the underlying concept

---

## Sources

- Anthropic Tool Use best practices (2025)
- OpenAI Function Calling documentation
- Empirical studies on LLM tool use reliability (2024)
