---
id: 01KNNVX2QT2NQN58S1RE1R842X
title: Anthropic Claude API
type: framework
vendor: Anthropic
version: "anthropic SDK 0.x; models: claude-opus-4-6, claude-sonnet-4-6, claude-haiku-4-5-20251001"
language: any
license: proprietary
github: "https://github.com/anthropic-ai/anthropic-sdk-python"
tags: [claude-api, anthropic, tool-use, streaming, batch-api, function-calling]
last_checked: 2026-04-04
jay_experience: extensive
---

## Overview

The Anthropic Claude API is the direct REST + SDK interface to Claude models — distinct from Claude Code CLI, which wraps the API with an agentic runtime. Using the API directly gives you full control over the request/response cycle, streaming, tool schemas, system prompts, context construction, and model selection. It is the foundation layer on which Claude Code, OpenClaw, and any custom agent harness are built.

Primary SDKs: `@anthropic-ai/sdk` (TypeScript/Node), `anthropic` (Python). Both are official and maintained by Anthropic. REST API is also directly accessible.

---

## Core Concepts

### Models (April 2026)

| Model | Best For | Context | Cost Tier |
|-------|----------|---------|-----------|
| `claude-opus-4-6` | Complex reasoning, architecture, extended thinking | 200K | High |
| `claude-sonnet-4-6` | Production default — best cost/quality | 200K | Medium |
| `claude-haiku-4-5-20251001` | Leaf tasks, fast Q&A, boilerplate | 200K | Low |

Jay's rule: Opus for complex architecture/security audits, Sonnet for orchestration, Haiku for leaf tasks in sub-agent pipelines.

### Message Structure
The API uses a structured message array format:

```typescript
messages: [
  { role: "user", content: "..." },
  { role: "assistant", content: "..." },  // assistant turn (or prefill)
  { role: "user", content: [             // structured content blocks
    { type: "text", text: "..." },
    { type: "tool_result", tool_use_id: "...", content: "..." }
  ]}
]
```

Three prompt positions with different semantics:
- **System prompt**: Persistent instructions, persona, tool context — never shown in messages array
- **User prompt**: Current turn input; can include tool results, images, documents
- **Assistant prefill**: Pre-populating the assistant turn to steer output format; powerful but use carefully (can bypass safety checks)

### Tool Use / Function Calling
Claude selects tools from a schema you define in the `tools` array. The model returns `tool_use` content blocks; your code executes the tool and returns `tool_result` blocks. The loop continues until the model returns a `text` block with no tool use.

```typescript
const tools: Tool[] = [{
  name: "search_web",
  description: "Search the web for current information",
  input_schema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search query" },
      max_results: { type: "number", description: "Max results to return", default: 5 }
    },
    required: ["query"]
  }
}]
```

Tool selection is driven by:
1. Tool name and description — write these as if briefing a smart junior engineer
2. `input_schema` — precise JSON Schema; Claude respects required/optional
3. Model's understanding of the current task

Key: Claude can call multiple tools in one response (parallel tool calls). Your loop must handle arrays of `tool_use` blocks.

### Extended Thinking (`claude-opus-4-6`)
Opus supports explicit reasoning traces via the `thinking` content block type. Enable by setting `thinking: { type: "enabled", budget_tokens: N }` in the request. The model emits `thinking` blocks (visible to you, not re-read by model) before its response. Use for:
- Complex multi-step reasoning
- Architecture decisions
- Security analysis
- Math and logic problems

Cost: `budget_tokens` burn from your context budget. Cap at 10,000 tokens for most tasks.

### Streaming
Two streaming modes:

**Basic streaming** (`stream: true`): receive text deltas as they're generated. Efficient for user-facing output.

**Event streaming** (SSE): receive structured events including `message_start`, `content_block_start`, `content_block_delta`, `message_stop`. Required for tool use streaming where you need to detect tool calls mid-stream.

```typescript
const stream = await client.messages.stream({
  model: "claude-sonnet-4-6",
  max_tokens: 4096,
  messages: [{ role: "user", content: userInput }]
})

for await (const chunk of stream) {
  if (chunk.type === "content_block_delta") {
    process.stdout.write(chunk.delta.text ?? "")
  }
}
const finalMessage = await stream.finalMessage()
```

### Batch API
The Batch API enables async processing of large request volumes (up to 10,000 requests per batch) at 50% cost reduction. Requests are processed within 24 hours. Ideal for:
- Bulk document processing
- Offline evaluation harnesses
- Dataset generation
- Large-scale classification

```typescript
const batch = await client.messages.batches.create({
  requests: items.map((item, i) => ({
    custom_id: `req-${i}`,
    params: {
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: item.prompt }]
    }
  }))
})
// Poll until batch.processing_status === "ended"
// Then fetch results
```

---

## Architecture

```
Your application
    │
    ├── @anthropic-ai/sdk (or anthropic Python SDK)
    │       └── REST calls to api.anthropic.com
    │
    ├── Request construction:
    │   ├── model selection
    │   ├── system prompt
    │   ├── messages array (user/assistant turns)
    │   ├── tools array (JSON Schema definitions)
    │   ├── max_tokens, temperature, top_p
    │   └── stream: bool
    │
    └── Response handling:
        ├── content blocks: text | tool_use | thinking
        ├── stop_reason: end_turn | tool_use | max_tokens | stop_sequence
        └── usage: { input_tokens, output_tokens, cache_read_tokens }
```

The tool use loop:
```
Send request with tools
→ model returns tool_use blocks
→ execute each tool
→ append tool_result blocks to messages
→ send again
→ repeat until stop_reason === "end_turn" with no tool_use
```

---

## Strengths

- **Full control**: every parameter exposed — temperature, top_p, stop sequences, prefill, thinking budget
- **Parallel tool calls**: model naturally returns multiple tool_use blocks in one response; execute them in parallel
- **Prompt caching**: `cache_control: { type: "ephemeral" }` on system prompt blocks reduces repeated costs by 90%+ for long system prompts
- **Batch API**: 50% cost reduction for offline workloads
- **Extended thinking**: uniquely available on Opus; no competitor has this
- **200K context**: fits most codebases in a single context window
- **Streaming maturity**: SSE streaming is stable and predictable

---

## Weaknesses

- **No built-in state**: you manage conversation history, tool loop, and error recovery yourself
- **Rate limits**: tokens per minute and requests per minute limits require exponential backoff — not handled by SDK by default
- **Cost at scale**: Opus at 200K tokens per request is expensive; architectural discipline required
- **No native persistence**: sessions have no server-side memory; context reconstruction is your problem
- **Tool call errors not automatically retried**: if your tool throws, you must handle the error and send `tool_result` with `is_error: true`

---

## Minimal Working Example

```typescript
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic() // uses ANTHROPIC_API_KEY env var

// Simple tool-use agent loop
async function runAgent(userInput: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userInput }
  ]

  const tools: Anthropic.Tool[] = [{
    name: "get_current_time",
    description: "Returns the current UTC time as an ISO string",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: []
    }
  }, {
    name: "calculate",
    description: "Evaluate a mathematical expression. Input must be a valid JS expression.",
    input_schema: {
      type: "object" as const,
      properties: {
        expression: { type: "string" }
      },
      required: ["expression"]
    }
  }]

  while (true) {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: "You are a helpful assistant. Use tools when appropriate.",
      messages,
      tools
    })

    // Append assistant's response to history
    messages.push({ role: "assistant", content: response.content })

    if (response.stop_reason === "end_turn") {
      const textBlock = response.content.find(b => b.type === "text")
      return textBlock?.text ?? ""
    }

    // Execute tool calls and collect results
    const toolResults: Anthropic.ToolResultBlockParam[] = []
    for (const block of response.content) {
      if (block.type !== "tool_use") continue

      let result: string
      try {
        if (block.name === "get_current_time") {
          result = new Date().toISOString()
        } else if (block.name === "calculate") {
          result = String(eval((block.input as { expression: string }).expression))
        } else {
          result = `Unknown tool: ${block.name}`
        }
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result })
      } catch (e) {
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: String(e), is_error: true })
      }
    }

    messages.push({ role: "user", content: toolResults })
  }
}

// Usage
const answer = await runAgent("What time is it, and what is 2^32?")
console.log(answer)
```

---

## Integration Points

- **[[frameworks/framework-claude-code]]**: Claude Code wraps this API; understanding the API directly helps debug unexpected model behavior
- **[[frameworks/framework-mcp]]**: MCP servers provide tools that can be registered in Claude Code; same tool-use format applies
- **[[entities/anthropic]]**: Model selection, pricing, and rate limits documented at console.anthropic.com
- **[[entities/model-landscape]]**: Comparative model selection guide
- **Prompt caching**: use `cache_control` on system prompts longer than ~1,000 tokens to reduce costs in production agents
- **LangGraph**: LangGraph's `ChatAnthropic` node wraps this API; understanding the raw format helps debug chain behavior

---

## Jay's Experience

Jay uses the raw API for:
1. **Custom agent harnesses** where Claude Code's runtime is too opinionated (e.g., OpenClaw uses the API directly)
2. **Batch evaluation runs** — Batch API for testing 100+ prompt variations overnight
3. **Cost optimization** — routing tasks by complexity to the right model tier; Haiku for classification, Sonnet for reasoning, Opus for architecture review
4. **Tool design** — writing precise tool descriptions is an art; Jay's rule is to write descriptions as if briefing a smart junior engineer who has never seen your codebase

Key lesson: parallel tool execution matters. When the model returns 3 tool_use blocks in one response, execute them concurrently with `Promise.all()`. Naive sequential execution throws away the model's natural parallelism.

Prompt caching insight: for agents with long system prompts (>2,000 tokens), adding `cache_control: { type: "ephemeral" }` to the system block reduces per-turn cost by 80-90%. Essential for production agents.

---

## Version Notes

- **2025-10**: `claude-haiku-4-5-20251001` model release — full 200K context
- **2026.x**: Extended thinking on Opus stable and production-ready
- **2026.x**: Batch API GA — 50% cost reduction, 24h processing SLA
- **2026.x**: Prompt caching GA — supports system prompt and user turn caching
- Tool use format: `input_schema` uses JSON Schema draft-7; `anyOf`, `$defs` supported

---

## Sources

- Jay's `~/.claude/CLAUDE.md` (model selection heuristics)
- [[entities/anthropic]]
- [[entities/model-landscape]]
- Anthropic API documentation [UNVERIFIED — knowledge cutoff]
