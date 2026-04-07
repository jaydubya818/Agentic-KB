---
title: Wire a Multi-Agent Crew with an Orchestrator
type: recipe
difficulty: advanced
time_estimate: 2-3 hours
prerequisites:
  - Completed recipe-build-tool-agent or equivalent
  - Claude Code CLI installed
  - Understanding of the Agent tool in Claude Code
tested: false
tags: [multi-agent, orchestration, fan-out, claude-code, sub-agents]
---

## Goal

Wire an orchestrator agent that spawns and coordinates three specialist sub-agents: a Researcher, an Analyst, and a Writer. The orchestrator fans out work, each specialist executes independently with its own tool set, and results are aggregated into a final output.

This recipe covers two implementation paths:
1. **Claude Code Agent tool** (recommended for Jay's stack) — zero-boilerplate sub-agent spawning
2. **TypeScript SDK** — manual sub-agent orchestration for programmatic control

---

## Prerequisites

For Path 1 (Claude Code):
- Claude Code installed and authenticated
- A CLAUDE.md with your agent definitions, or use inline prompts

For Path 2 (TypeScript SDK):
- Completed [[recipes/recipe-build-tool-agent]] codebase
- Node.js 18+ or Bun
- `@anthropic-ai/sdk` installed

---

## Path 1: Claude Code Agent Tool (Recommended)

### Step 1 — Define Specialist Agent System Prompts

Create `~/.claude/agents/researcher.md`:
```markdown
---
name: researcher
description: Research agent. Given a topic, searches for relevant information and returns structured findings with sources.
---

You are a specialized research agent. Your sole job is to research a given topic thoroughly.

ALWAYS:
- Use fetch_url or WebFetch for current information
- Return findings as a structured markdown document with clear sections
- Include sources for every major claim
- Note what you could NOT find (gaps)

NEVER:
- Write opinions or recommendations (that's the analyst's job)
- Generate code (that's not your role)
- Summarize without sources
```

Create `~/.claude/agents/analyst.md`:
```markdown
---
name: analyst
description: Analysis agent. Given research findings, produces structured analysis with recommendations.
---

You are a specialized analyst agent. Your job is to analyze research and produce insights.

ALWAYS:
- Structure output as: Key Findings → Patterns → Risks → Recommendations
- Support every recommendation with evidence from the research provided
- Flag uncertainty explicitly ("Evidence suggests..." vs "It is certain that...")
- Quantify where possible

NEVER:
- Conduct new research (use only what's provided)
- Make claims without evidence
```

Create `~/.claude/agents/writer.md`:
```markdown
---
name: writer
description: Writing agent. Given analysis and research, produces a polished final document.
---

You are a specialized writing agent. Your job is to produce clear, well-structured documents.

ALWAYS:
- Write for the intended audience specified in your task
- Follow any format specified (blog post, report, memo, etc.)
- Edit for clarity — remove redundancy
- Preserve all technical accuracy from the source material

NEVER:
- Introduce new claims not in the source material
- Change the substance of findings
```

### Step 2 — Write the Orchestrator Prompt

This is the prompt you give to the main Claude Code session (or put in a skill):

```markdown
You are an orchestrator managing three specialist agents. Your job is to:
1. Decompose the user's task into three parallel workstreams
2. Spawn the three specialists simultaneously via three Agent tool calls
3. Wait for all three to complete
4. Synthesize their outputs into a final deliverable

## Specialist Agents
- **researcher**: searches for information, returns structured findings with sources
- **analyst**: analyzes research findings, returns insights and recommendations
- **writer**: produces the final polished document from analysis + research

## Workflow

For the task: "{USER_TASK}"

Step 1 — Parallel dispatch: Make THREE Agent tool calls in a single response:
  - researcher: "Research [specific aspect of task]. Return structured findings with sources."
  - analyst: "Analyze [specific aspect]. Return: Key Findings, Patterns, Risks, Recommendations."
  - writer: (often dispatched AFTER researcher+analyst complete with their results as context)

Step 2 — Once researcher and analyst return, dispatch writer with their combined output.

Step 3 — Return the writer's output as the final answer.

## Key Rules
- ALWAYS spawn researcher and analyst in parallel (not sequential)
- ALWAYS wait for BOTH before dispatching writer
- If a specialist fails or returns insufficient results, spawn it again with a more specific prompt
- Do not attempt the research/analysis/writing yourself — that's the specialists' job

IMPORTANT: Make all parallel Agent calls in a SINGLE response message. Multiple responses = sequential, not parallel.
```

### Step 3 — Run the Orchestrator

In Claude Code:
```
You are an orchestrator... [paste the orchestrator prompt above]

User task: "Analyze the tradeoffs between LangGraph and raw Claude Code agents for a production multi-agent system. Include current community adoption, technical tradeoffs, and a recommendation for a TypeScript-first team."
```

When Claude Code receives this, it should immediately make two Agent tool calls (researcher + analyst) in the same response turn, then once those complete, dispatch the writer.

### Step 4 — Tool Restriction (Important)

Use the `tools` parameter on Agent calls to restrict what each specialist can do:

```
Agent tool call for researcher:
{
  "prompt": "Research LangGraph vs Claude Code agents...",
  "tools": ["WebFetch", "WebSearch", "Read", "Glob"],  // no Write, no Bash
  "model": "claude-haiku-4-5-20251001"  // use Haiku for leaf tasks
}

Agent tool call for analyst:
{
  "prompt": "Analyze the following research findings...\n\n[researcher output]",
  "tools": [],  // no tools needed — pure reasoning
  "model": "claude-sonnet-4-6"
}
```

Restricting tools: prevents specialists from going off-script (a researcher that can Write might create files you didn't ask for), reduces cost (fewer tools = shorter tool list in prompt = fewer input tokens), and improves focus.

---

## Path 2: TypeScript SDK (Programmatic)

### Step 1 — Specialist Agent Function

```typescript
// src/specialists.ts
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic()

interface SpecialistConfig {
  name: string
  systemPrompt: string
  tools: Anthropic.Tool[]
  model: string
}

export async function runSpecialist(
  config: SpecialistConfig,
  task: string
): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: task }
  ]

  let turnCount = 0
  const maxTurns = 8

  while (turnCount < maxTurns) {
    turnCount++
    const response = await client.messages.create({
      model: config.model,
      max_tokens: 8192,
      system: config.systemPrompt,
      tools: config.tools.length > 0 ? config.tools : undefined,
      messages
    })

    messages.push({ role: "assistant", content: response.content })

    if (response.stop_reason === "end_turn") {
      return response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map(b => b.text)
        .join("\n")
    }

    // Handle tool calls (same as recipe-build-tool-agent)
    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    )

    const toolResults = await Promise.all(
      toolUseBlocks.map(async (block) => {
        // Import your executeTool from recipe-build-tool-agent
        const result = await executeTool(block.name, block.input as Record<string, unknown>)
        return {
          type: "tool_result" as const,
          tool_use_id: block.id,
          content: result.content,
          is_error: result.isError
        }
      })
    )

    messages.push({ role: "user", content: toolResults })
  }

  throw new Error(`${config.name} exceeded max turns`)
}
```

### Step 2 — Orchestrator

```typescript
// src/orchestrator.ts
import { runSpecialist } from "./specialists.js"
import { TOOLS } from "./tools.js"

const RESEARCHER: SpecialistConfig = {
  name: "researcher",
  model: "claude-haiku-4-5-20251001",  // cheap for research
  systemPrompt: `You are a research specialist. Given a topic, search for current information and return structured findings.
Return format:
## Summary
## Key Findings (with sources)
## Gaps (what you couldn't find)`,
  tools: [TOOLS.find(t => t.name === "fetch_url")!]  // only web access
}

const ANALYST: SpecialistConfig = {
  name: "analyst",
  model: "claude-sonnet-4-6",  // needs reasoning ability
  systemPrompt: `You are an analysis specialist. Given research, produce insights.
Return format:
## Patterns Observed
## Key Tradeoffs
## Risks
## Recommendations`,
  tools: []  // no tools — pure reasoning from provided context
}

const WRITER: SpecialistConfig = {
  name: "writer",
  model: "claude-sonnet-4-6",
  systemPrompt: "You are a writing specialist. Transform research and analysis into polished documents.",
  tools: []
}

export async function runOrchestrator(
  topic: string,
  outputFormat: string = "blog post"
): Promise<string> {
  console.log(`[Orchestrator] Starting: "${topic}"`)

  // PHASE 1: Fan-out — researcher and analyst run in PARALLEL
  console.log("[Orchestrator] Dispatching researcher and analyst in parallel...")
  const [researchResults, initialAnalysis] = await Promise.all([
    runSpecialist(RESEARCHER, `Research this topic thoroughly: ${topic}`),
    runSpecialist(ANALYST, `Prepare an initial analysis framework for this topic: ${topic}. List the key dimensions to evaluate.`)
  ])
  console.log("[Orchestrator] Phase 1 complete")

  // PHASE 2: Deep analysis with research context
  console.log("[Orchestrator] Dispatching analyst with research context...")
  const fullAnalysis = await runSpecialist(
    ANALYST,
    `Here is research on "${topic}":\n\n${researchResults}\n\n---\n\nInitial framework:\n${initialAnalysis}\n\n---\n\nNow produce a full analysis.`
  )
  console.log("[Orchestrator] Phase 2 complete")

  // PHASE 3: Write final output
  console.log("[Orchestrator] Dispatching writer...")
  const finalOutput = await runSpecialist(
    WRITER,
    `Write a ${outputFormat} about "${topic}".

Research findings:
${researchResults}

Analysis:
${fullAnalysis}

Requirements:
- Technical but accessible
- 600-800 words
- Include a "Bottom Line" section at the end`
  )

  console.log("[Orchestrator] Complete")
  return finalOutput
}
```

### Step 3 — Entry Point

```typescript
// src/index.ts
import { runOrchestrator } from "./orchestrator.js"

const topic = process.argv.slice(2).join(" ")
const result = await runOrchestrator(topic, "technical blog post")
console.log(result)
```

---

## Verification

Test the crew with:
```
npm run start "LangGraph vs Claude Code agents for production multi-agent systems"
```

Expected: three phases of execution, each logged, followed by a structured final document.

Verify parallelism: Phase 1 should complete in roughly the time of the slower of the two specialists (not their sum). Log timestamps to confirm.

Verify tool restriction: researcher should make web requests; analyst and writer should not make any external calls.

Verify failure handling: disconnect the internet and run. Researcher should return an error message; orchestrator should either retry or ask writer to work from available context — not crash.

---

## Common Failures & Fixes

### Failure: Orchestrator tries to do the work itself instead of delegating
Cause: orchestrator system prompt isn't strong enough. Fix: add explicit `NEVER do X yourself` rules; add "Your only job is to orchestrate, not execute".

### Failure: Sub-agents produce inconsistent output formats
Cause: specialists aren't following format instructions. Fix: add explicit format examples in the system prompt; use `expected_output` framing; add a format verification step.

### Failure: Writer produces wrong output because it doesn't have enough context
Cause: research and analysis are being passed as strings but writer doesn't understand the provenance. Fix: structure the writer prompt with clear sections (`Research:`, `Analysis:`, `Task:`); add a "Based on the research and analysis above" framing.

### Failure: One specialist fails and the whole pipeline dies
Cause: no error recovery. Fix: wrap each specialist call in try-catch; on failure, either retry with more specific prompt or pass an "I could not complete X because Y" message to the next specialist so it can adapt.

---

## Next Steps

1. **Add result validation**: after each specialist, run a lightweight check (haiku model) to verify output quality before passing to the next stage
2. **Add memory**: persist research results so the crew doesn't re-research the same topic
3. **Add parallel writer variants**: spawn 3 writers with different formats (blog, memo, executive summary) in parallel — pick the best
4. **Extend to N specialists**: the pattern scales; add a `code-generator` specialist, a `fact-checker`, etc.

---

## Related Recipes

- [[recipes/recipe-build-tool-agent]] — prerequisite; build a single tool-using agent first
- [[recipes/recipe-parallel-subagents]] — fan-out pattern in detail; handle partial failures
- [[recipes/recipe-claude-code-hooks]] — add hooks to monitor specialist execution
