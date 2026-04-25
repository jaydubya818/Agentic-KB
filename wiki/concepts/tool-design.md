---
id: 01KQ2ZJRP9BEFNB878BM248PT1
title: Tool Design for Agents
type: concept
tags: [tools, agents, architecture, mcp, prompting]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [agent-failure-modes, multi-agent-systems, context-management]
---

# Tool Design for Agents

Tools are the primary mechanism through which agents interact with the world. They define the contract between deterministic systems and non-deterministic agents. Unlike traditional software APIs designed for human developers, tool APIs must be designed for language models that reason about intent, infer parameter values, and generate calls from natural language requests.

> Poor tool design creates failure modes that no amount of prompt engineering can fix.

## Definition

A **tool** is a typed, callable interface exposed to an agent that allows it to take actions or retrieve information outside its context window. Tools are not merely functions — they are *prompt engineering artifacts* that shape how agents reason and act. The tool's name, description, parameters, and error messages collectively form the contract the agent must interpret and satisfy.

## Why It Matters

Agents cannot read code or intuit unstated conventions. Every ambiguity in a tool definition becomes a potential failure mode. When tools are poorly designed:

- Agents guess which tool to call
- Parameter values are hallucinated or misformatted
- Errors produce no useful recovery signal
- Tool selection degrades as the tool set grows

Effective tool design eliminates these failure modes at the interface level, before they reach the model.

## Core Principles

### 1. Tools as Contracts

The tool definition is a contract between a deterministic system and a non-deterministic agent. The contract must be:

- **Unambiguous** — one clear interpretation of when and how to use the tool
- **Illustrated** — examples showing expected parameter patterns
- **Recoverable** — error messages that guide the agent toward correction

### 2. Tool Descriptions as Prompts

Tool descriptions are loaded into agent context and directly steer behavior. A good description answers three questions:

1. **What** does this tool do?
2. **When** should it be used (and not used)?
3. **What** does it return?

Poor example: `"Search the database"` with cryptic parameter names.

Optimized example: A description that includes usage context, parameter semantics, output format, and at least one concrete example.

### 3. The Consolidation Principle

> If a human engineer cannot definitively say which tool should be used in a given situation, an agent cannot be expected to do better.

Prefer **single comprehensive tools** over multiple narrow tools. Instead of:
- `list_users`
- `list_events`
- `create_event`

Implement a single `schedule_event` tool that finds availability and schedules internally. The comprehensive tool handles the full workflow, reducing the number of decisions the agent must make.

**Why consolidation works:**
- Agents have limited context and attention — each tool competes for it
- Fewer tools means less ambiguity at selection time
- Internal tool logic can enforce sequencing that agents may get wrong when chaining

### 4. Namespacing and Organization

As tool collections grow, namespacing becomes critical. Group related tools under common prefixes (e.g., `db_`, `web_`, `calendar_`) so agents can route to the correct namespace before selecting a specific tool.

Clear namespaces create functional boundaries. An agent needing database information routes to the `db` namespace; one needing web search routes to `web`. This reduces cross-namespace confusion and speeds selection.

### 5. Response Format Design

Tool responses should balance completeness with token efficiency. Overly verbose responses consume context; overly sparse responses force the agent to make follow-up calls. Design response schemas that return exactly what downstream reasoning requires.

### 6. Error Messages as Recovery Signals

Errors are part of the tool contract. An agent that receives a cryptic error has no path to recovery. Errors should:
- State what went wrong
- State what valid input looks like
- Suggest a corrective action where possible

## Example

**Weak tool definition:**
```json
{
  "name": "query",
  "description": "Query the system.",
  "parameters": { "q": "string" }
}
```

**Strong tool definition:**
```json
{
  "name": "search_knowledge_base",
  "description": "Search the internal knowledge base for articles matching a natural language query. Use this when the user asks about company policies, product documentation, or internal processes. Returns a ranked list of matching article titles and excerpts. Example: query='expense reimbursement policy'",
  "parameters": {
    "query": {
      "type": "string",
      "description": "Natural language search query. Be specific. Avoid one-word queries."
    },
    "max_results": {
      "type": "integer",
      "description": "Number of results to return. Defaults to 5.",
      "default": 5
    }
  }
}
```

## Common Pitfalls

| Pitfall | Consequence |
|---|---|
| Vague descriptions | Agent guesses wrong tool |
| Too many narrow tools | Ambiguous selection, high context cost |
| Cryptic parameter names | Hallucinated or malformed values |
| Silent errors | Agent retries blindly or gives up |
| Inconsistent conventions | Increased cognitive load across tool set |

## See Also

- [Agent Failure Modes](agent-failure-modes.md) — how tool misuse manifests as agent failures
- [Multi-Agent Systems](multi-agent-systems.md) — tool design considerations in orchestrated systems
- [Context Management](context-management.md) — how tool count and descriptions affect context budgets
- [MCP (tag)](../tags/mcp.md) — Model Context Protocol as a standardization layer for tool interfaces
