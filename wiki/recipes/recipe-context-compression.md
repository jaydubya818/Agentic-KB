---
title: Context Compression — Rolling Summary for Long Sessions
type: recipe
difficulty: intermediate
time_estimate: 1-2 hours
prerequisites:
  - Working agent with a messages array (recipe-build-tool-agent)
  - Understanding of token counting
tested: false
tags: [context-management, compression, long-sessions, memory, token-optimization]
---

## Goal

Implement rolling summary compression to keep a long agentic session within a context window. When the conversation history grows too large, compress old turns into a dense summary and replace them — preserving the essential state while freeing context for new work.

This prevents the most common production failure mode for long-running agents: running out of context and losing everything, or degrading in quality as the context fills with irrelevant old turns.

See [[frameworks/framework-claude-code]] — Claude Code's `autoCompactThreshold: 0.75` implements exactly this pattern.

---

## Prerequisites

A working agent with a `messages: Anthropic.MessageParam[]` array that grows across turns. From [[recipes/recipe-build-tool-agent]].

Understanding of token counting: `response.usage.input_tokens` tells you how many tokens are in your current context.

---

## When to Trigger Compression

Compression should trigger before you hit the context limit, not after. The right trigger depends on your model:

| Model | Context | Compress Trigger |
|-------|---------|-----------------|
| claude-sonnet-4-6 | 200K tokens | At 150K (75%) |
| claude-haiku-4-5 | 200K tokens | At 150K (75%) |
| gpt-4o | 128K tokens | At 96K (75%) |

75% is the right threshold:
- Above 75%: enough room for the summary generation itself + the next few turns
- Below 60%: you're compressing too aggressively — losing too much context

**What to preserve absolutely**:
1. The original user goal / task description
2. Key decisions made and their rationale
3. Current state of any work in progress (file paths, code written, variables set)
4. Any errors encountered and how they were resolved
5. Tool call results that future steps depend on

**What can be compressed away**:
- Exploratory turns that didn't produce useful results
- Verbose tool outputs that have already been processed
- Back-and-forth clarification that's now resolved
- Repetitive content

---

## Steps

### Step 1 — Add Token Counting to Your Agent

```typescript
// src/agent.ts — modified to track token usage
interface AgentState {
  messages: Anthropic.MessageParam[]
  totalInputTokens: number
  totalOutputTokens: number
  compressionCount: number
  originalGoal: string  // preserve this always
}

// In your agent loop, track tokens from each response:
const response = await client.messages.create({ ... })
state.totalInputTokens += response.usage.input_tokens
state.totalOutputTokens += response.usage.output_tokens

// Check if compression is needed
if (response.usage.input_tokens > COMPRESSION_TRIGGER_TOKENS) {
  state = await compressContext(state, client)
}
```

### Step 2 — Write the Compression Function

```typescript
// src/context-compression.ts
import Anthropic from "@anthropic-ai/sdk"
import type { AgentState } from "./agent.js"

const COMPRESSION_TRIGGER_TOKENS = 150_000   // 75% of 200K
const MIN_MESSAGES_TO_KEEP = 4               // always keep the last N messages

const COMPRESSION_SYSTEM_PROMPT = `You are a context compression specialist. Your job is to compress a conversation history into a dense, structured summary that preserves all information needed for an AI agent to continue its task.

The summary MUST preserve:
1. The original user goal (exact wording if possible)
2. Every decision made and its rationale
3. Current work-in-progress state (files created/modified, code written, variables set)
4. All tool call results that future steps will need
5. Errors encountered and their resolutions
6. What has been completed and what remains

The summary MUST NOT:
- Include exploratory turns that didn't produce results
- Repeat verbose tool outputs verbatim (summarize them)
- Include back-and-forth that's now resolved
- Hallucinate any details not in the conversation

Format your output as:
## COMPRESSED CONTEXT (Compression #{N})

### Original Goal
[exact goal from user]

### Completed Steps
[bulleted list of what's been done]

### Current State
[exact state of the work: files, variables, decisions]

### Key Findings
[tool results and information discovered that will be needed]

### Remaining Work
[what still needs to be done to complete the goal]

### Critical Context
[anything else the agent MUST know to continue correctly]`

export async function compressContext(
  state: AgentState,
  client: Anthropic.Anthropic
): Promise<AgentState> {
  console.log(`\n[Context] Compressing (${state.messages.length} messages → summary)...`)

  // Split messages: keep recent ones fresh, compress the rest
  const keepCount = MIN_MESSAGES_TO_KEEP
  const toCompress = state.messages.slice(0, -keepCount)
  const toKeep = state.messages.slice(-keepCount)

  if (toCompress.length === 0) {
    console.log("[Context] Nothing to compress yet")
    return state
  }

  // Convert messages to text for summarization
  const conversationText = toCompress
    .map(msg => {
      if (typeof msg.content === "string") {
        return `${msg.role.toUpperCase()}: ${msg.content}`
      }
      if (Array.isArray(msg.content)) {
        const parts = msg.content.map(block => {
          if (block.type === "text") return block.text
          if (block.type === "tool_use") return `[Tool call: ${block.name}(${JSON.stringify(block.input).slice(0, 200)})]`
          if (block.type === "tool_result") {
            const content = Array.isArray(block.content)
              ? block.content.map(c => c.type === "text" ? c.text : "").join("")
              : block.content ?? ""
            return `[Tool result: ${content.slice(0, 500)}]`
          }
          return ""
        }).join(" ")
        return `${msg.role.toUpperCase()}: ${parts}`
      }
      return ""
    })
    .filter(Boolean)
    .join("\n\n")

  // Generate the summary
  const compressionNumber = state.compressionCount + 1
  const summaryResponse = await client.messages.create({
    model: "claude-sonnet-4-6",  // use a capable model; this is critical
    max_tokens: 4096,
    system: COMPRESSION_SYSTEM_PROMPT.replace("{N}", String(compressionNumber)),
    messages: [{
      role: "user",
      content: `Here is the conversation history to compress. Original goal: "${state.originalGoal}"\n\n${conversationText}`
    }]
  })

  const summary = summaryResponse.content
    .filter(b => b.type === "text")
    .map(b => b.text)
    .join("")

  // Build new message array: summary injection + recent messages
  const summaryMessage: Anthropic.MessageParam = {
    role: "user",
    content: `[CONTEXT SUMMARY — Previous conversation compressed]\n\n${summary}\n\n[END CONTEXT SUMMARY — Conversation continues normally from here]`
  }

  // Add a brief acknowledgment from the assistant
  const ackMessage: Anthropic.MessageParam = {
    role: "assistant",
    content: `Understood. I have the compressed context. Continuing with the task: ${state.originalGoal}`
  }

  const newMessages = [summaryMessage, ackMessage, ...toKeep]

  console.log(`[Context] Compressed ${toCompress.length} messages → 2 summary messages`)
  console.log(`[Context] Total messages: ${state.messages.length} → ${newMessages.length}`)

  return {
    ...state,
    messages: newMessages,
    compressionCount: compressionNumber
  }
}
```

### Step 3 — Integrate into Your Agent Loop

```typescript
// src/agent.ts — full integration
import Anthropic from "@anthropic-ai/sdk"
import { TOOLS } from "./tools.js"
import { executeTool } from "./tool-executor.js"
import { compressContext } from "./context-compression.js"

const COMPRESSION_TRIGGER_TOKENS = 150_000
const client = new Anthropic()

interface AgentState {
  messages: Anthropic.MessageParam[]
  totalInputTokens: number
  totalOutputTokens: number
  compressionCount: number
  originalGoal: string
}

export async function runAgentWithCompression(
  userMessage: string,
  maxTurns: number = 50
): Promise<string> {
  let state: AgentState = {
    messages: [{ role: "user", content: userMessage }],
    totalInputTokens: 0,
    totalOutputTokens: 0,
    compressionCount: 0,
    originalGoal: userMessage
  }

  for (let turn = 0; turn < maxTurns; turn++) {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: `You are a helpful agent. Original goal: ${state.originalGoal}`,
      tools: TOOLS,
      messages: state.messages
    })

    // Track tokens
    state.totalInputTokens += response.usage.input_tokens
    state.totalOutputTokens += response.usage.output_tokens

    // Add assistant response to history
    state.messages.push({ role: "assistant", content: response.content })

    // Check for completion
    if (response.stop_reason === "end_turn") {
      const finalText = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map(b => b.text)
        .join("\n")
      console.log(`[Agent] Complete. Total tokens: ${state.totalInputTokens}in + ${state.totalOutputTokens}out. Compressions: ${state.compressionCount}`)
      return finalText
    }

    // Handle tool calls
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
      state.messages.push({ role: "user", content: toolResults })
    }

    // Check if compression needed (AFTER adding this turn's messages)
    if (response.usage.input_tokens > COMPRESSION_TRIGGER_TOKENS) {
      state = await compressContext(state, client)
    }
  }

  throw new Error(`Agent exceeded max turns (${maxTurns})`)
}
```

### Step 4 — Add a Sliding Window Alternative (Simpler)

If you don't need full semantic compression, a simpler approach is a sliding window — just drop old messages:

```typescript
function applySlideWindow(
  messages: Anthropic.MessageParam[],
  maxMessages: number = 20
): Anthropic.MessageParam[] {
  if (messages.length <= maxMessages) return messages

  // Always keep the first message (original goal)
  const first = messages[0]
  const recent = messages.slice(-maxMessages + 1)

  console.log(`[Context] Sliding window: keeping first + last ${maxMessages - 1} messages`)
  return [first, ...recent]
}
```

**When to use sliding window vs compression**:
- Sliding window: when the task is stateless per turn (each turn is independent)
- Compression: when state accumulates across turns (code being built, decisions being made)

---

## Verification

1. Create a test that fills context by making many tool calls:
```typescript
const longTask = "Count from 1 to 50 by calling the calculate tool each time to compute i * i for each i."
const result = await runAgentWithCompression(longTask, 100)
```

2. Monitor token counts: compression should trigger when input tokens exceed your threshold. After compression, token count should drop significantly.

3. Verify continuity: after compression, the agent should continue the task correctly — it should "remember" where it left off.

4. Check the summary: log the summary message content. It should contain: the original goal, what's been done, and what remains. Any critical tool results should be present.

---

## Common Failures & Fixes

### Failure: Agent forgets what it was doing after compression
Cause: summary didn't preserve critical state. Fix: (1) make the compression prompt more specific about what must be preserved, (2) add a "before compressing, write a state checkpoint" step before the compression call, (3) increase `MIN_MESSAGES_TO_KEEP`.

### Failure: Compression loop — every turn triggers compression
Cause: threshold is too low, or the summary itself is so long it fills the context. Fix: increase `COMPRESSION_TRIGGER_TOKENS` or truncate tool results before summarizing.

### Failure: Compressed context has hallucinated details
Cause: the summarizer model invented information. Fix: (1) use a more capable model for compression (Sonnet not Haiku), (2) add "MUST NOT invent any details not in the conversation" to the system prompt, (3) add a verification step that checks the summary against the original.

---

## Next Steps

1. **Add checkpoint markers**: before triggering compression, have the agent write an explicit `## CHECKPOINT:` marker summarizing its current state — more reliable than post-hoc summary
2. **Add compression to Claude Code sessions**: Claude Code's `autoCompactThreshold` does this automatically; for custom harnesses, this recipe is the manual equivalent
3. **Persist summaries**: save each compression summary to disk — creates an audit trail of long sessions

---

## Related Recipes

- [[recipes/recipe-build-tool-agent]] — the base agent this integrates with
- [[recipes/recipe-multi-agent-crew]] — multi-agent systems need compression too; apply per-agent
- [[frameworks/framework-claude-code]] — `autoCompactThreshold` is this pattern built-in
