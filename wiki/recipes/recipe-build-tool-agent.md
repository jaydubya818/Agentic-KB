---
title: Build a Tool-Using Agent from Scratch
type: recipe
difficulty: intermediate
time_estimate: 45-90 minutes
prerequisites:
  - Node.js 18+ or Bun
  - ANTHROPIC_API_KEY in environment
  - "@anthropic-ai/sdk" installed
tested: false
tags: [tool-use, agent, typescript, anthropic, sdk]
---

## Goal

Build a single Claude agent with custom tools from scratch using the Anthropic TypeScript SDK. The agent will have a tool loop, multiple tools, and proper termination handling. Result: a working CLI agent that can use tools to answer questions that require real-world data or computation.

This is the foundational building block for all more complex multi-agent systems. Master this before attempting [[recipes/recipe-multi-agent-crew]].

---

## Prerequisites

```bash
mkdir tool-agent && cd tool-agent
npm init -y
npm install @anthropic-ai/sdk
npm install -D typescript @types/node tsx
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "outDir": "./dist"
  }
}
```

Verify API key:
```bash
echo $ANTHROPIC_API_KEY  # should output sk-ant-...
```

---

## Steps

### Step 1 — Define Your Tools

Tools are JSON Schema objects. Write them as if briefing a smart engineer — the description drives model behavior more than the schema.

```typescript
// src/tools.ts
import type Anthropic from "@anthropic-ai/sdk"

export const TOOLS: Anthropic.Tool[] = [
  {
    name: "fetch_url",
    description: `Fetch the text content of a URL. Returns the page text, stripped of HTML.
Use for: getting current information, reading documentation, checking websites.
Do NOT use for: URLs that require authentication, very large pages (>100KB).`,
    input_schema: {
      type: "object" as const,
      properties: {
        url: {
          type: "string",
          description: "The full URL to fetch, including https://"
        },
        max_chars: {
          type: "number",
          description: "Maximum characters to return. Default: 8000. Max: 20000."
        }
      },
      required: ["url"]
    }
  },
  {
    name: "calculate",
    description: `Evaluate a mathematical expression. Returns the numeric result.
Supports: +, -, *, /, **, Math.*, parentheses, constants (Math.PI, Math.E).
Examples: "2 ** 32", "Math.sqrt(144)", "1000 * 0.07 * 12".
Do NOT use for: string operations, date math, anything not purely numeric.`,
    input_schema: {
      type: "object" as const,
      properties: {
        expression: {
          type: "string",
          description: "A valid JavaScript math expression"
        }
      },
      required: ["expression"]
    }
  },
  {
    name: "read_file",
    description: `Read the contents of a local file.
Use for: reading config files, source code, data files.
Returns: file contents as a string, or an error message if the file doesn't exist.`,
    input_schema: {
      type: "object" as const,
      properties: {
        path: {
          type: "string",
          description: "Absolute or relative file path"
        }
      },
      required: ["path"]
    }
  }
]
```

### Step 2 — Implement Tool Execution

```typescript
// src/tool-executor.ts
import { readFileSync } from "fs"

interface ToolResult {
  content: string
  isError?: boolean
}

export async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  try {
    switch (name) {
      case "fetch_url": {
        const url = args.url as string
        const maxChars = (args.max_chars as number) ?? 8000
        const response = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; ToolAgent/1.0)" },
          signal: AbortSignal.timeout(10000)  // 10s timeout
        })
        if (!response.ok) {
          return { content: `HTTP ${response.status}: ${response.statusText}`, isError: true }
        }
        const html = await response.text()
        // Strip HTML tags and collapse whitespace
        const text = html
          .replace(/<script[\s\S]*?<\/script>/gi, "")
          .replace(/<style[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, maxChars)
        return { content: text }
      }

      case "calculate": {
        const expression = args.expression as string
        // Safety: only allow math operations
        if (/[^0-9+\-*/().%,\s\w]/.test(expression.replace(/Math\.\w+/g, ""))) {
          return { content: "Error: expression contains unsafe characters", isError: true }
        }
        // eslint-disable-next-line no-eval
        const result = eval(expression) as number
        if (typeof result !== "number" || isNaN(result)) {
          return { content: "Error: expression did not produce a number", isError: true }
        }
        return { content: String(result) }
      }

      case "read_file": {
        const path = args.path as string
        const content = readFileSync(path, "utf-8")
        return { content }
      }

      default:
        return { content: `Unknown tool: ${name}`, isError: true }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { content: `Tool execution failed: ${message}`, isError: true }
  }
}
```

### Step 3 — Build the Agent Loop

```typescript
// src/agent.ts
import Anthropic from "@anthropic-ai/sdk"
import { TOOLS } from "./tools.js"
import { executeTool } from "./tool-executor.js"

const client = new Anthropic()

interface AgentOptions {
  systemPrompt?: string
  maxTurns?: number
  model?: string
  verbose?: boolean
}

export async function runAgent(
  userMessage: string,
  options: AgentOptions = {}
): Promise<string> {
  const {
    systemPrompt = "You are a helpful assistant. Use tools when you need real-world data or calculations. Always verify your answers with tools when possible.",
    maxTurns = 10,
    model = "claude-sonnet-4-6",
    verbose = false
  } = options

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userMessage }
  ]

  let turnCount = 0

  while (turnCount < maxTurns) {
    turnCount++
    if (verbose) console.log(`\n[Turn ${turnCount}]`)

    const response = await client.messages.create({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      tools: TOOLS,
      messages
    })

    if (verbose) {
      console.log(`Stop reason: ${response.stop_reason}`)
      console.log(`Usage: ${response.usage.input_tokens} in, ${response.usage.output_tokens} out`)
    }

    // Add assistant turn to history
    messages.push({ role: "assistant", content: response.content })

    // Terminal condition: no more tool calls
    if (response.stop_reason === "end_turn") {
      const textBlocks = response.content.filter(b => b.type === "text")
      const finalText = textBlocks.map(b => (b as Anthropic.TextBlock).text).join("\n")
      return finalText
    }

    if (response.stop_reason !== "tool_use") {
      // Unexpected stop reason (e.g., max_tokens)
      throw new Error(`Unexpected stop reason: ${response.stop_reason}`)
    }

    // Execute all tool calls (could be parallel in production)
    const toolUseBlocks = response.content.filter(b => b.type === "tool_use") as Anthropic.ToolUseBlock[]

    if (verbose) console.log(`Executing ${toolUseBlocks.length} tool(s): ${toolUseBlocks.map(b => b.name).join(", ")}`)

    // Execute tools in parallel
    const toolResults = await Promise.all(
      toolUseBlocks.map(async (block) => {
        const result = await executeTool(block.name, block.input as Record<string, unknown>)
        if (verbose) console.log(`  ${block.name}: ${result.content.slice(0, 100)}...`)
        return {
          type: "tool_result" as const,
          tool_use_id: block.id,
          content: result.content,
          is_error: result.isError
        }
      })
    )

    // Add tool results to history
    messages.push({ role: "user", content: toolResults })
  }

  throw new Error(`Agent exceeded max turns (${maxTurns})`)
}
```

### Step 4 — Wire the CLI Entry Point

```typescript
// src/index.ts
import { runAgent } from "./agent.js"

const userInput = process.argv.slice(2).join(" ")
if (!userInput) {
  console.error("Usage: npx tsx src/index.ts <your question>")
  process.exit(1)
}

console.log(`\nQuestion: ${userInput}\n`)
console.log("Running agent...")

const answer = await runAgent(userInput, { verbose: true })

console.log("\n--- ANSWER ---")
console.log(answer)
```

### Step 5 — Add to package.json

```json
{
  "scripts": {
    "agent": "tsx src/index.ts"
  }
}
```

### Step 6 — Run It

```bash
npm run agent "What is the square root of 2 to the power of 32? Also, what does the README at https://raw.githubusercontent.com/anthropics/anthropic-sdk-python/main/README.md say about installation?"
```

---

## Verification

Expected behavior:
1. Agent receives question
2. Agent decides to call `calculate` for the math part
3. Agent decides to call `fetch_url` for the README
4. Both tools execute (in parallel)
5. Agent synthesizes results into a final answer
6. Stops with `stop_reason: "end_turn"`

Verify tool parallelism: in verbose mode, you should see `Executing 2 tool(s)` in a single turn (not two separate turns).

Verify error handling: ask for a URL that doesn't exist. Agent should receive the error and tell you it couldn't fetch the page, not crash.

Verify max turns protection: ask something that requires many tool calls in a loop. Agent should stop at maxTurns and throw, not loop forever.

---

## Common Failures & Fixes

### Failure: "Tool execution failed: Expression contains unsafe characters"
The expression guard in `calculate` is rejecting valid math. Fix: loosen the regex to allow more math operators, or add specific operators to the allowlist.

### Failure: Agent loops forever calling tools
Cause: the agent isn't reaching `end_turn` — it keeps calling tools thinking it needs more information. Fix: (1) increase `maxTurns` as a safety valve, (2) improve the system prompt to tell the agent when it has enough information to answer, (3) ensure tool results are complete enough that the agent doesn't need to retry.

### Failure: "fetch: connection refused" or timeout
Cause: URL is unreachable or the 10s timeout is too short. Fix: increase timeout; add retry logic in `executeTool`; return a useful error message the agent can reason about.

### Failure: TypeScript type errors on `response.content` blocks
Fix: narrow the type explicitly before accessing type-specific properties:
```typescript
response.content.filter(b => b.type === "text") as Anthropic.TextBlock[]
```

---

## Next Steps

1. **Add streaming**: replace `client.messages.create` with `client.messages.stream` to show token-by-token output for long responses
2. **Add tool result caching**: cache `fetch_url` results by URL to avoid re-fetching the same page multiple times in a session
3. **Add conversation history**: persist `messages` across calls for multi-turn conversations
4. **Add observability**: log tool calls, token counts, and timing to a JSON file for later analysis
5. **Scale to multi-agent**: use this agent as a sub-agent in [[recipes/recipe-multi-agent-crew]]

---

## Related Recipes

- [[recipes/recipe-multi-agent-crew]] — wire this agent as a sub-agent in an orchestrated system
- [[recipes/recipe-parallel-subagents]] — fan out multiple of these agents in parallel
- [[recipes/recipe-agent-evaluation]] — build an evaluation harness for this agent
- [[recipes/recipe-context-compression]] — handle long conversations without losing context
