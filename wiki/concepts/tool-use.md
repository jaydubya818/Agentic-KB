---
id: 01KNNVX2QMMPN6N0SWA7F2233R
title: Tool Use
type: concept
tags: [agentic, tools, function-calling, json-schema, tool-design]
confidence: high
sources:
  - "Anthropic: Tool use documentation (2025)"
  - "OpenAI: Function calling guide"
  - "Schick et al. Toolformer (2023)"
created: 2026-04-04
updated: 2026-04-04
related:
  - "[[concepts/agent-loops]]"
  - "[[concepts/task-decomposition]]"
  - "[[patterns/pattern-tool-schema]]"
  - "[[patterns/pattern-idempotent-tools]]"
  - "[[patterns/pattern-tool-output-validation]]"
  - "[[patterns/pattern-read-before-write]]"
status: stable
---

## TL;DR

Tool use is the mechanism by which LLMs take actions beyond text generation. The LLM emits a structured tool call; the host executes it; the result is fed back to the LLM. Tool schema design is 80% of reliability — a poorly described tool will be misused by even the best model.

---

## Definition

Tool use (also called function calling) is the capability for an LLM to request execution of a defined external function by emitting a structured JSON payload matching the tool's schema. The host application intercepts this, executes the function, and returns the result as a new context message. The LLM then continues reasoning with the tool output.

---

## How It Works

### Tool Schema (JSON Schema)

Every tool has three components:
1. **Name** — how the model refers to the tool (snake_case, verb_noun pattern)
2. **Description** — why and when to use this tool (the most important field)
3. **Parameters** — JSON Schema defining the inputs

```json
{
  "name": "read_file",
  "description": "Read the contents of a file at the specified path. Use this before modifying any file to understand the current state. Returns the file contents as a string.",
  "input_schema": {
    "type": "object",
    "properties": {
      "path": {
        "type": "string",
        "description": "Absolute path to the file. Must start with /."
      },
      "offset": {
        "type": "integer",
        "description": "Line number to start reading from (1-indexed). Omit to read from the beginning."
      },
      "limit": {
        "type": "integer",
        "description": "Maximum number of lines to read. Omit to read the entire file."
      }
    },
    "required": ["path"]
  }
}
```

### How LLMs Select Tools

The model attends to tool descriptions as part of its context. Selection is based on:
- Semantic match between task and description
- Explicit guidance in the system prompt about when to prefer which tool
- Examples in the system prompt or few-shot demonstrations
- The model's training on tool use patterns

The model does **not** exhaustively reason through every tool — it relies on the description being clear enough to make tool selection obvious. If two tools have similar descriptions, the model will guess. Make descriptions unambiguous.

### Parallel vs Sequential Tool Calls

**Sequential**: The model calls one tool, receives the result, then decides the next tool. Safe, predictable, but slower.

**Parallel**: The model emits multiple tool calls in a single response (Claude supports this). They're executed concurrently by the host.

```python
# Claude emitting parallel tool calls:
# [tool_call: search_web(query="X"), tool_call: search_web(query="Y")]
# Host executes both simultaneously
# LLM receives both results in next turn
```

Parallel calls are powerful but have gotchas:
- The model can't use the result of tool_call_1 to inform tool_call_2 if they're in the same batch
- If tool_call_1 writes state that tool_call_2 needs to read, parallel execution causes a race
- Error handling is more complex — partial success is possible

Use parallel calls for truly independent operations (e.g., multiple reads, multiple web searches). Keep sequential for dependent operations.

### Tool Output Formatting

The model reads tool output as a string. Format matters enormously:

**Bad output** (raw dump):
```
{"status":200,"data":{"user_id":1234,"name":"Jay","email":"jay@example.com","created_at":"2024-01-15T10:00:00Z","preferences":{"theme":"dark","notifications":true},"metadata":{"last_login":"2026-04-03T08:00:00Z"}}}
```

**Good output** (structured for LLM consumption):
```
User found:
- ID: 1234
- Name: Jay
- Email: jay@example.com
- Last login: 2026-04-03

Preferences: dark theme, notifications enabled
```

The model processes output more reliably when it's readable prose or clean structured format, not raw JSON blobs. Format tool outputs in the tool implementation, not by asking the model to parse them.

### Error Handling in Tools

Tool errors must be informative enough for the model to recover:

```python
def read_file(path: str) -> str:
    try:
        with open(path) as f:
            return f.read()
    except FileNotFoundError:
        return f"ERROR: File not found at '{path}'. Check the path is correct and the file exists."
    except PermissionError:
        return f"ERROR: Permission denied reading '{path}'. This file requires elevated access."
    except Exception as e:
        return f"ERROR: Unexpected error reading '{path}': {type(e).__name__}: {str(e)}"
```

Never raise exceptions from tools — return error strings. The model needs to see the error in context to handle it. An uncaught exception breaks the loop.

### Idempotency

Tools that mutate state should be idempotent — safe to call multiple times with the same arguments without compounding effects. Critical because:
- Agent retries on error will re-call the tool
- Parallel duplicate calls are possible
- Network timeouts may cause ambiguity about whether the call completed

See [[patterns/pattern-idempotent-tools]] for implementation details.

### Tool Composition

Tools can call other tools (if the host allows nested calls). Useful for building higher-order tools:

```python
def update_config(key: str, value: str) -> str:
    """Reads current config, updates the key, writes back."""
    current = read_file("/app/config.json")  # nested tool call
    config = json.loads(current)
    config[key] = value
    write_file("/app/config.json", json.dumps(config, indent=2))
    return f"Updated {key} to {value}"
```

But composition reduces composability — the LLM can't see inside the composed tool and can't mix and match steps. Prefer atomic tools and let the LLM compose them in its reasoning.

---

## Key Variants

| Tool Type | Examples | Key Risk |
|-----------|----------|----------|
| Read-only | file read, web search, DB query | Latency, stale data |
| Write | file write, DB insert, API POST | Irreversibility, duplication |
| Compute | code execution, math | Security (sandbox required) |
| Control flow | spawn agent, wait, signal | Loop complexity |
| Destructive | file delete, API DELETE | Irreversibility — needs gates |

---

## When To Use

- Any agent action that touches external state (files, APIs, databases)
- When the model needs information it doesn't have in context
- When you want the model's actions to be inspectable and auditable

## Risks & Pitfalls

- **Tool hallucination**: Model calls a tool that doesn't exist, or calls with parameters that don't match the schema. Robust schema validation catches this.
- **Overuse**: Model calls tools for information it should already know from context. Check if the context already contains the answer before calling.
- **Schema drift**: Tool implementation changes but schema doesn't. The model's mental model breaks silently.
- **Unbounded tool outputs**: A tool returns 50K tokens of output, blowing up the context. Always cap tool output length.

---

## Counter-arguments & Gaps

Tool-use reliability is substantially worse than headline numbers suggest. Berkeley's Function-Calling Leaderboard (Yan et al. 2024, ongoing) shows that frontier models fail tool selection, parameter synthesis, or sequencing 10–25% of the time on realistic multi-step tasks — far higher than the 1–3% error rates implied by marketing materials. Production systems that treat tool-use as "works now" without aggressive validation accumulate silent failures.

The argument "tool use is safer than native code generation" is weaker than it appears. Schema validation catches structural errors but not semantic ones — a model can call the correct tool with correctly-typed parameters that mean the wrong thing. Tool safety is a function of tool design (idempotency, dry-run modes, permission gates), not of the tool-use abstraction itself.

[[mcp-ecosystem]] standardisation helps reduce integration cost but doesn't improve model reliability at choosing tools. The fragility shifts from "did the tool call parse" to "did the model pick the right tool." Teams adopting [[mcp-ecosystem]] often report improved DX but no measurable gain in agent end-task correctness.

Open questions: (a) how much of observed tool-use error is the model vs. bad tool descriptions? [[anthropic]]'s own guidance suggests most reliability wins come from rewriting tool descriptions, not from model changes. (b) At what tool-catalogue size does selection reliability collapse? Evidence suggests the floor is around 20–40 tools before reliability drops noticeably, but this is under-characterised.

What would change the verdict on tool-use-as-capable: controlled evaluations showing <5% tool error rates on multi-step production-representative tasks. Current numbers on any benchmark of realistic complexity are materially higher.

---

## Related Concepts

- [[concepts/agent-loops]] — the control structure that drives tool calls
- [[patterns/pattern-tool-schema]] — designing tool schemas that LLMs use correctly
- [[patterns/pattern-idempotent-tools]] — making tools safe to retry
- [[patterns/pattern-tool-output-validation]] — validating what tools return
- [[patterns/pattern-read-before-write]] — the discipline of reading state before mutating it

---

## Sources

- [[anthropic]] Tool Use documentation (2025)
- Schick et al. "Toolformer: Language Models Can Teach Themselves to Use Tools" (2023)
- [[openai]] Function Calling documentation
