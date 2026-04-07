---
title: Parallel Sub-Agents — Fan-Out Pattern Implementation
type: recipe
difficulty: advanced
time_estimate: 2-3 hours
prerequisites:
  - Claude Code CLI installed
  - Understanding of the Agent tool (recipe-multi-agent-crew)
  - For TypeScript path: working Anthropic SDK setup
tested: false
tags: [multi-agent, parallelism, fan-out, orchestration, claude-code]
---

## Goal

Implement the fan-out pattern: spawn N agents in parallel for independent tasks, collect all results, handle partial failures gracefully, and merge into a final output. This is the primary mechanism for achieving real speedup in multi-agent systems.

See [[patterns/pattern-fan-out-worker]] for the pattern definition.

Two paths:
1. **Claude Code native** (Agent tool) — simplest, no code needed
2. **TypeScript SDK** — programmatic control for production systems

---

## Prerequisites

For the Claude Code path: just Claude Code with proper permissions. No setup needed.

For the TypeScript path:
```bash
cd your-agent-project
# Already have @anthropic-ai/sdk from recipe-build-tool-agent
```

---

## Path 1: Claude Code Agent Tool (Native Fan-Out)

### Step 1 — Understand the Agent Tool

The key insight: **multiple Agent tool calls in a single Claude Code response execute in parallel**. This is not a sequential loop — they run concurrently.

```
# Sequential (wrong — slower):
Turn 1: Agent call #1 → wait → result #1
Turn 2: Agent call #2 → wait → result #2
Turn 3: Agent call #3 → wait → result #3

# Parallel (right — faster):
Turn 1: Agent calls #1, #2, #3 simultaneously → wait → results #1, #2, #3
```

The orchestrator prompt must explicitly instruct Claude Code to make all Agent calls in a single response.

### Step 2 — Orchestrator Prompt for Fan-Out

```
You are an orchestrator. Your task: [TASK DESCRIPTION]

## Fan-Out Protocol
1. In your FIRST response: make ALL sub-agent calls simultaneously (one response = one parallel batch)
2. DO NOT respond with text before making the Agent calls — go straight to the calls
3. After all agents complete, synthesize their results into a final answer

## Sub-Agents to Spawn
Spawn these three agents SIMULTANEOUSLY in a single response:

Agent 1 (codebase-analyzer):
- Task: Analyze the src/ directory. Count files by type, identify the main entry points, list all external dependencies from package.json.
- Tools: Read, Glob, Bash
- Return format: markdown with sections: File Count, Entry Points, Dependencies

Agent 2 (test-analyzer):
- Task: Analyze the test suite. Find all test files, count test cases, identify coverage gaps (files in src/ with no corresponding test).
- Tools: Glob, Read, Bash
- Return format: markdown with sections: Test Files, Test Count, Coverage Gaps

Agent 3 (dependency-auditor):
- Task: Run npm audit and identify the top 3 most critical vulnerabilities.
- Tools: Bash
- Return format: markdown with sections: Critical Issues, Recommended Actions

## Synthesis
After all three agents complete, produce a final report combining their findings.
Include: Executive Summary, Key Findings (from all agents), Priority Actions.
```

### Step 3 — Handle Partial Failures in the Orchestrator Prompt

Add failure handling instructions:

```
## Failure Handling
If an agent returns an error or insufficient results:
- Note the failure explicitly: "Agent X failed: [reason]"
- Continue with results from the other agents
- In the synthesis, flag what was NOT covered due to the failure
- Suggest a manual follow-up step for the failed agent's task

Never let one agent failure block the synthesis — partial results are better than no results.
```

### Step 4 — Timeout Configuration

The Agent tool's `timeout` parameter controls how long to wait per sub-agent (in seconds). Set it based on task complexity:

```
For agents doing Bash commands (npm install, tests): timeout: 120
For agents doing file reads: timeout: 30
For agents doing web fetches: timeout: 60
Default if not set: 60 seconds
```

In the Agent tool call, add: `timeout: 120` for long-running tasks.

---

## Path 2: TypeScript SDK (Programmatic Fan-Out)

### Step 1 — Define Sub-Agent Configs

```typescript
// src/parallel/types.ts

export interface SubAgentConfig {
  id: string
  systemPrompt: string
  task: string
  tools: string[]         // tool names this agent can use
  timeoutMs: number
  model: string
}

export interface SubAgentResult {
  id: string
  success: boolean
  output: string
  error?: string
  durationMs: number
  inputTokens: number
  outputTokens: number
}
```

### Step 2 — Sub-Agent Runner with Timeout

```typescript
// src/parallel/sub-agent.ts
import Anthropic from "@anthropic-ai/sdk"
import { TOOLS } from "../tools.js"
import { executeTool } from "../tool-executor.js"
import type { SubAgentConfig, SubAgentResult } from "./types.js"

const client = new Anthropic()

export async function runSubAgent(config: SubAgentConfig): Promise<SubAgentResult> {
  const start = Date.now()
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Agent "${config.id}" timed out after ${config.timeoutMs}ms`)), config.timeoutMs)
  )

  try {
    const result = await Promise.race([
      executeAgent(config),
      timeoutPromise
    ])
    return { ...result, durationMs: Date.now() - start }
  } catch (error) {
    return {
      id: config.id,
      success: false,
      output: "",
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - start,
      inputTokens: 0,
      outputTokens: 0
    }
  }
}

async function executeAgent(config: SubAgentConfig): Promise<Omit<SubAgentResult, "durationMs">> {
  // Filter available tools to those allowed for this agent
  const allowedTools = TOOLS.filter(t => config.tools.includes(t.name))

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: config.task }
  ]

  let totalInputTokens = 0
  let totalOutputTokens = 0
  let turnCount = 0
  const maxTurns = 10

  while (turnCount < maxTurns) {
    turnCount++

    const response = await client.messages.create({
      model: config.model,
      max_tokens: 4096,
      system: config.systemPrompt,
      tools: allowedTools.length > 0 ? allowedTools : undefined,
      messages
    })

    totalInputTokens += response.usage.input_tokens
    totalOutputTokens += response.usage.output_tokens
    messages.push({ role: "assistant", content: response.content })

    if (response.stop_reason === "end_turn") {
      const output = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map(b => b.text)
        .join("\n")
      return {
        id: config.id,
        success: true,
        output,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens
      }
    }

    if (response.stop_reason === "tool_use") {
      const toolBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
      )
      const toolResults = await Promise.all(
        toolBlocks.map(async b => {
          const result = await executeTool(b.name, b.input as Record<string, unknown>)
          return {
            type: "tool_result" as const,
            tool_use_id: b.id,
            content: result.content,
            is_error: result.isError
          }
        })
      )
      messages.push({ role: "user", content: toolResults })
    }
  }

  return {
    id: config.id,
    success: false,
    output: "",
    error: `Exceeded max turns (${maxTurns})`,
    inputTokens: totalInputTokens,
    outputTokens: totalOutputTokens
  }
}
```

### Step 3 — Fan-Out Orchestrator

```typescript
// src/parallel/fan-out.ts
import { runSubAgent } from "./sub-agent.js"
import type { SubAgentConfig, SubAgentResult } from "./types.js"

interface FanOutOptions {
  maxConcurrency?: number         // default: all in parallel; set <N for rate limiting
  partialFailureThreshold?: number  // fail if fewer than N succeed; default: 1 (any success = continue)
}

export async function fanOut(
  configs: SubAgentConfig[],
  options: FanOutOptions = {}
): Promise<SubAgentResult[]> {
  const {
    maxConcurrency = configs.length,  // fully parallel by default
    partialFailureThreshold = 1
  } = options

  console.log(`[FanOut] Spawning ${configs.length} agents (concurrency: ${maxConcurrency})`)
  const startTime = Date.now()

  let results: SubAgentResult[]

  if (maxConcurrency >= configs.length) {
    // Full parallel
    results = await Promise.all(configs.map(runSubAgent))
  } else {
    // Controlled concurrency — process in batches
    results = []
    for (let i = 0; i < configs.length; i += maxConcurrency) {
      const batch = configs.slice(i, i + maxConcurrency)
      const batchResults = await Promise.all(batch.map(runSubAgent))
      results.push(...batchResults)
    }
  }

  const totalDuration = Date.now() - startTime
  const successes = results.filter(r => r.success)
  const failures = results.filter(r => !r.success)

  console.log(`[FanOut] Complete in ${totalDuration}ms`)
  console.log(`  Successes: ${successes.length}/${results.length}`)
  if (failures.length > 0) {
    console.log(`  Failures:`)
    failures.forEach(f => console.log(`    - ${f.id}: ${f.error}`))
  }

  if (successes.length < partialFailureThreshold) {
    throw new Error(
      `Fan-out failed: only ${successes.length}/${configs.length} agents succeeded (threshold: ${partialFailureThreshold}). Failures: ${failures.map(f => `${f.id}: ${f.error}`).join("; ")}`
    )
  }

  return results
}

// Result merger — takes results from parallel agents and combines into one context
export function mergeResults(results: SubAgentResult[]): string {
  const successes = results.filter(r => r.success)
  const failures = results.filter(r => !r.success)

  let merged = ""

  if (successes.length > 0) {
    merged += successes.map(r => `## ${r.id} Results\n${r.output}`).join("\n\n")
  }

  if (failures.length > 0) {
    merged += `\n\n## Failed Agents (${failures.length})\n`
    merged += failures.map(f => `- **${f.id}**: ${f.error}`).join("\n")
    merged += "\nNote: These agents failed; their tasks may need manual follow-up."
  }

  return merged
}
```

### Step 4 — End-to-End Example

```typescript
// src/parallel/example.ts
import Anthropic from "@anthropic-ai/sdk"
import { fanOut, mergeResults } from "./fan-out.js"
import type { SubAgentConfig } from "./types.js"

const client = new Anthropic()

const agents: SubAgentConfig[] = [
  {
    id: "researcher-a",
    model: "claude-haiku-4-5-20251001",  // cheap for research
    systemPrompt: "You are a research specialist. Search for information and return structured findings.",
    task: "Research the top 3 use cases for fan-out patterns in multi-agent AI systems. Include specific examples.",
    tools: ["fetch_url"],
    timeoutMs: 30_000
  },
  {
    id: "researcher-b",
    model: "claude-haiku-4-5-20251001",
    systemPrompt: "You are a research specialist. Search for information and return structured findings.",
    task: "Research the top 3 failure modes of fan-out patterns in multi-agent AI systems. Include how to prevent them.",
    tools: ["fetch_url"],
    timeoutMs: 30_000
  },
  {
    id: "example-builder",
    model: "claude-sonnet-4-6",
    systemPrompt: "You are a code example specialist. Write clear, working code examples.",
    task: "Write a minimal TypeScript example of a fan-out pattern using Promise.all. Include error handling for partial failures.",
    tools: [],  // no tools — pure code generation
    timeoutMs: 20_000
  }
]

// Run all agents in parallel
const results = await fanOut(agents, { partialFailureThreshold: 2 })  // need at least 2 successes

// Merge results
const combinedContext = mergeResults(results)

// Synthesize with a final call
const synthesis = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 2048,
  system: "You are a technical writer. Synthesize research into a coherent, well-structured document.",
  messages: [{
    role: "user",
    content: `Based on the following research from multiple agents, write a comprehensive guide to the fan-out pattern:\n\n${combinedContext}`
  }]
})

const finalText = synthesis.content
  .filter(b => b.type === "text")
  .map(b => b.text)
  .join("\n")

console.log(finalText)
```

---

## Verification

1. **Confirm parallelism**: run the TypeScript example. Total wall-clock time should be close to the slowest agent (not the sum). Log each agent's start and end time to verify overlap.

2. **Confirm partial failure handling**: set one agent's task to something impossible (`task: "read /nonexistent/file/path.txt"`). The fan-out should succeed with 2/3 agents; the failure should appear in the merged output with a helpful message.

3. **Confirm timeout**: set one agent's `timeoutMs: 1000` (1 second) on a task that takes 5 seconds. It should time out and return an error — not hang.

4. **Confirm concurrency control**: set `maxConcurrency: 1` and verify that agents run sequentially (timestamps don't overlap).

---

## Common Failures & Fixes

### Failure: All agents run sequentially despite Promise.all
Cause: you're awaiting each agent inside a loop before starting the next. Fix: collect all Promises first, then `Promise.all([p1, p2, p3])` — not `await p1; await p2; await p3`.

### Failure: Fan-out uses too many API rate limit tokens
Cause: N agents × large context = N × token cost, all at once. Fix: (1) use Haiku for leaf agents, (2) `maxConcurrency: 3` to batch and rate-limit, (3) reduce context per agent by scoping tasks more tightly.

### Failure: One slow agent blocks the entire fan-out
Cause: `Promise.all` waits for the slowest. Fix: use `Promise.allSettled` instead of `Promise.all` to never block on a single failure, combined with per-agent timeouts. Or use `Promise.race` if you want the first N results and don't need all of them.

### Failure: Merged results are too long for synthesis
Cause: each agent returns 2,000+ words, and 5 agents × 2,000 words = 10,000+ words of context. Fix: (1) instruct agents to return summaries with a word limit, (2) run a compression pass before synthesis, (3) use a larger context model (Opus) for the synthesis step.

---

## Next Steps

1. **Add result validation**: after fan-out, run a lightweight validator agent on each result before merging — catch low-quality outputs before they pollute the synthesis
2. **Add streaming fan-out**: report each agent's result as it completes rather than waiting for all
3. **Add retry logic**: on agent failure, retry with a modified prompt up to 2 times before marking as failure
4. **Extend to dynamic fan-out**: the orchestrator decides how many agents to spawn based on the task complexity, not a fixed N

---

## Related Recipes

- [[recipes/recipe-multi-agent-crew]] — orchestrator with 3 specialists using fan-out
- [[recipes/recipe-build-tool-agent]] — prerequisite: single tool-using agent
- [[recipes/recipe-agent-evaluation]] — evaluate the quality of fan-out results
- [[frameworks/framework-claude-code]] — Agent tool documentation
