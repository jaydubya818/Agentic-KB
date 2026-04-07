---
title: Build an Agent Evaluation Harness with LLM-as-Judge
type: recipe
difficulty: advanced
time_estimate: 2-4 hours
prerequisites:
  - A working agent to evaluate (see recipe-build-tool-agent)
  - ANTHROPIC_API_KEY in environment
  - Node.js 18+ or Bun
tested: false
tags: [evaluation, llm-as-judge, testing, quality, observability]
---

## Goal

Build a repeatable evaluation harness for an agent using LLM-as-judge: define test cases, run them through the agent, score each response with a judge model, aggregate results, and produce a report. Result: a scored benchmark you can run before/after any agent change to measure quality regression or improvement.

This is the production-quality version of "did my agent work?" — replacing manual testing with systematic, quantified evaluation.

---

## Prerequisites

Start with a working agent from [[recipes/recipe-build-tool-agent]].

```bash
cd your-agent-project
npm install fs-extra
```

---

## Steps

### Step 1 — Define Your Test Case Format

Test cases need: an input, the expected behavior (not exact output), and the evaluation criteria.

```typescript
// src/eval/types.ts

export interface TestCase {
  id: string                        // unique slug: "tc-math-001"
  name: string                      // human-readable: "Basic arithmetic"
  input: string                     // the user message
  expected_behaviors: string[]      // what the response SHOULD do (not exact text)
  must_not_behaviors: string[]      // what the response MUST NOT do
  requires_tool_use?: string[]      // tool names that MUST be called
  difficulty: "easy" | "medium" | "hard"
  tags: string[]                    // for filtering
}

export interface EvalResult {
  test_case_id: string
  input: string
  agent_output: string
  tool_calls_made: string[]
  scores: {
    criterion: string
    score: number                   // 0-5 scale
    reasoning: string
  }[]
  overall_score: number             // average of criterion scores
  passed: boolean                   // overall_score >= threshold (default: 3.5)
  latency_ms: number
  input_tokens: number
  output_tokens: number
  error?: string
}

export interface EvalReport {
  run_id: string
  timestamp: string
  agent_config: {
    model: string
    system_prompt: string
  }
  test_cases_total: number
  test_cases_passed: number
  pass_rate: number
  avg_score: number
  avg_latency_ms: number
  results: EvalResult[]
}
```

### Step 2 — Write Test Cases

```typescript
// src/eval/test-cases.ts
import type { TestCase } from "./types.js"

export const TEST_CASES: TestCase[] = [
  {
    id: "tc-math-001",
    name: "Basic arithmetic with tool",
    input: "What is 2 to the power of 20?",
    expected_behaviors: [
      "Uses the calculate tool (not mental arithmetic)",
      "Returns the correct answer: 1048576",
      "Shows the calculation clearly"
    ],
    must_not_behaviors: [
      "Returns an incorrect number",
      "Answers without using the calculate tool"
    ],
    requires_tool_use: ["calculate"],
    difficulty: "easy",
    tags: ["math", "tool-use"]
  },
  {
    id: "tc-url-001",
    name: "Fetch and summarize URL",
    input: "Summarize what the Anthropic homepage says about their mission.",
    expected_behaviors: [
      "Fetches https://anthropic.com or similar",
      "Returns a summary grounded in the actual page content",
      "Mentions AI safety or responsible AI (it's on their homepage)"
    ],
    must_not_behaviors: [
      "Makes up information without fetching the page",
      "Claims inability to access URLs"
    ],
    requires_tool_use: ["fetch_url"],
    difficulty: "medium",
    tags: ["web", "summarization"]
  },
  {
    id: "tc-multi-001",
    name: "Multi-step calculation",
    input: "If I invest $10,000 at 7% annual interest compounded monthly, how much will I have after 10 years?",
    expected_behaviors: [
      "Uses the compound interest formula: P(1 + r/n)^(nt)",
      "Uses the calculate tool for the final computation",
      "Result is approximately $20,097",
      "Explains the formula used"
    ],
    must_not_behaviors: [
      "Returns an answer without showing the formula",
      "Returns an incorrect amount (>5% deviation from $20,097)"
    ],
    requires_tool_use: ["calculate"],
    difficulty: "hard",
    tags: ["math", "finance", "multi-step"]
  },
  {
    id: "tc-refusal-001",
    name: "Graceful unknown handling",
    input: "What's the weather like in Tokyo right now?",
    expected_behaviors: [
      "Acknowledges it cannot get real-time weather (no weather tool available)",
      "Suggests alternatives (user could check weather site)",
      "Does not make up weather data"
    ],
    must_not_behaviors: [
      "Invents weather data",
      "Claims to have current weather when no weather tool exists"
    ],
    difficulty: "easy",
    tags: ["edge-case", "graceful-failure"]
  }
]
```

### Step 3 — Implement the Judge

The judge is a separate LLM call that scores the agent's output against each criterion:

```typescript
// src/eval/judge.ts
import Anthropic from "@anthropic-ai/sdk"
import type { TestCase } from "./types.js"

const client = new Anthropic()

const JUDGE_SYSTEM_PROMPT = `You are an expert AI evaluator. Your job is to assess AI agent responses against specific criteria.

Scoring scale:
- 5: Fully meets the criterion — exemplary
- 4: Mostly meets the criterion — minor gaps
- 3: Partially meets the criterion — notable gaps but some success
- 2: Mostly fails the criterion — significant problems
- 1: Completely fails the criterion
- 0: Response is harmful, dangerous, or completely off-topic

Be critical. A score of 5 should be genuinely excellent.
A score of 3 means "it kind of did the thing but there are real problems".

Always provide specific reasoning for your score — quote the relevant parts of the response.`

interface CriterionScore {
  criterion: string
  score: number
  reasoning: string
}

export async function judgeResponse(
  testCase: TestCase,
  agentOutput: string,
  toolCallsMade: string[]
): Promise<CriterionScore[]> {
  const allCriteria = [
    ...testCase.expected_behaviors.map(b => ({ type: "must", text: b })),
    ...testCase.must_not_behaviors.map(b => ({ type: "must_not", text: b }))
  ]

  const judgePrompt = `## Task Given to Agent
${testCase.input}

## Agent's Response
${agentOutput}

## Tools Actually Called
${toolCallsMade.length > 0 ? toolCallsMade.join(", ") : "None"}

${testCase.requires_tool_use ? `## Required Tool Calls\nThese tools MUST have been called: ${testCase.requires_tool_use.join(", ")}\nIf they weren't called, score any related criterion as 0.` : ""}

## Evaluation Criteria

Please evaluate the agent's response against each criterion below. For each, provide a score (0-5) and reasoning.

${allCriteria.map((c, i) => `### Criterion ${i + 1}: ${c.type === "must" ? "SHOULD DO" : "MUST NOT DO"}
"${c.text}"
Score (0-5): [provide score]
Reasoning: [provide reasoning quoting the response]`).join("\n\n")}

Format your response as JSON:
{
  "evaluations": [
    {"criterion": "criterion text", "score": N, "reasoning": "..."},
    ...
  ]
}`

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",  // use a capable model for judging
    max_tokens: 2048,
    system: JUDGE_SYSTEM_PROMPT,
    messages: [{ role: "user", content: judgePrompt }]
  })

  const text = response.content
    .filter(b => b.type === "text")
    .map(b => b.text)
    .join("")

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*"evaluations"[\s\S]*\}/)
  if (!jsonMatch) throw new Error(`Judge response not parseable: ${text.slice(0, 200)}`)

  const parsed = JSON.parse(jsonMatch[0]) as {
    evaluations: { criterion: string; score: number; reasoning: string }[]
  }

  // Invert scores for "must_not" criteria
  return parsed.evaluations.map((e, i) => ({
    criterion: e.criterion,
    score: allCriteria[i]?.type === "must_not" ? (5 - e.score) : e.score,
    reasoning: e.reasoning
  }))
}
```

### Step 4 — Build the Eval Runner

```typescript
// src/eval/runner.ts
import { randomUUID } from "crypto"
import type { TestCase, EvalResult, EvalReport } from "./types.js"
import { judgeResponse } from "./judge.js"
import { runAgent } from "../agent.js"  // your agent from recipe-build-tool-agent

const PASS_THRESHOLD = 3.5  // avg score >= 3.5 = pass

export async function runSingleEval(testCase: TestCase): Promise<EvalResult> {
  const start = Date.now()
  const toolCallsMade: string[] = []

  try {
    // Run agent with tool call tracking
    const { output, toolCalls, inputTokens, outputTokens } = await runAgentWithTracking(testCase.input)
    const latency = Date.now() - start

    // Judge the output
    const scores = await judgeResponse(testCase, output, toolCalls)
    const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length

    return {
      test_case_id: testCase.id,
      input: testCase.input,
      agent_output: output,
      tool_calls_made: toolCalls,
      scores,
      overall_score: avgScore,
      passed: avgScore >= PASS_THRESHOLD,
      latency_ms: latency,
      input_tokens: inputTokens,
      output_tokens: outputTokens
    }
  } catch (error) {
    return {
      test_case_id: testCase.id,
      input: testCase.input,
      agent_output: "",
      tool_calls_made: [],
      scores: [],
      overall_score: 0,
      passed: false,
      latency_ms: Date.now() - start,
      input_tokens: 0,
      output_tokens: 0,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

// Wrapper around runAgent that also tracks tool calls and token usage
async function runAgentWithTracking(input: string) {
  // Modify your runAgent to return tool_calls and token counts
  // For now, simplified version:
  const output = await runAgent(input, { verbose: false })
  return { output, toolCalls: [], inputTokens: 0, outputTokens: 0 }
}

export async function runEvalSuite(
  testCases: TestCase[],
  agentModel: string = "claude-sonnet-4-6",
  concurrency: number = 3
): Promise<EvalReport> {
  const runId = randomUUID().slice(0, 8)
  console.log(`\n[Eval] Run ${runId} — ${testCases.length} test cases, concurrency: ${concurrency}`)

  const results: EvalResult[] = []

  // Process in batches for controlled concurrency
  for (let i = 0; i < testCases.length; i += concurrency) {
    const batch = testCases.slice(i, i + concurrency)
    console.log(`[Eval] Batch ${Math.floor(i / concurrency) + 1}: ${batch.map(t => t.id).join(", ")}`)
    const batchResults = await Promise.all(batch.map(runSingleEval))
    results.push(...batchResults)
    batchResults.forEach(r => {
      const status = r.passed ? "✓ PASS" : "✗ FAIL"
      console.log(`  ${status} ${r.test_case_id} (score: ${r.overall_score.toFixed(1)}, ${r.latency_ms}ms)`)
    })
  }

  const passed = results.filter(r => r.passed).length
  const avgScore = results.reduce((sum, r) => sum + r.overall_score, 0) / results.length
  const avgLatency = results.reduce((sum, r) => sum + r.latency_ms, 0) / results.length

  return {
    run_id: runId,
    timestamp: new Date().toISOString(),
    agent_config: { model: agentModel, system_prompt: "see agent.ts" },
    test_cases_total: testCases.length,
    test_cases_passed: passed,
    pass_rate: passed / testCases.length,
    avg_score: avgScore,
    avg_latency_ms: avgLatency,
    results
  }
}
```

### Step 5 — Add Reporting

```typescript
// src/eval/report.ts
import { writeFileSync } from "fs"
import type { EvalReport } from "./types.js"

export function printReport(report: EvalReport): void {
  console.log(`\n${"=".repeat(60)}`)
  console.log(`EVAL REPORT — Run ${report.run_id}`)
  console.log(`${"=".repeat(60)}`)
  console.log(`Pass rate: ${(report.pass_rate * 100).toFixed(1)}% (${report.test_cases_passed}/${report.test_cases_total})`)
  console.log(`Avg score: ${report.avg_score.toFixed(2)}/5.0`)
  console.log(`Avg latency: ${Math.round(report.avg_latency_ms)}ms`)
  console.log()

  // Failures first
  const failures = report.results.filter(r => !r.passed)
  if (failures.length > 0) {
    console.log("FAILURES:")
    failures.forEach(r => {
      console.log(`  ✗ ${r.test_case_id} (score: ${r.overall_score.toFixed(1)})`)
      if (r.error) console.log(`    Error: ${r.error}`)
      r.scores.filter(s => s.score < 3).forEach(s => {
        console.log(`    Low score (${s.score}): ${s.criterion}`)
        console.log(`      ${s.reasoning.slice(0, 100)}...`)
      })
    })
  }

  console.log()
  console.log("PASSED:")
  report.results.filter(r => r.passed).forEach(r => {
    console.log(`  ✓ ${r.test_case_id} (score: ${r.overall_score.toFixed(1)}, ${r.latency_ms}ms)`)
  })
}

export function saveReport(report: EvalReport, path: string): void {
  writeFileSync(path, JSON.stringify(report, null, 2), "utf-8")
  console.log(`\nReport saved: ${path}`)
}
```

### Step 6 — Entry Point

```typescript
// src/eval/index.ts
import { TEST_CASES } from "./test-cases.js"
import { runEvalSuite } from "./runner.js"
import { printReport, saveReport } from "./report.js"

const filter = process.argv[2]  // optional tag filter: "npm run eval -- math"
const cases = filter
  ? TEST_CASES.filter(tc => tc.tags.includes(filter))
  : TEST_CASES

const report = await runEvalSuite(cases)
printReport(report)
saveReport(report, `eval-results-${report.run_id}.json`)

// Exit with error code if pass rate < 80%
if (report.pass_rate < 0.8) process.exit(1)
```

Add to `package.json`:
```json
{ "scripts": { "eval": "tsx src/eval/index.ts" } }
```

---

## Verification

```bash
npm run eval
# Should produce output like:
# [Eval] Run abc12345 — 4 test cases, concurrency: 3
# [Eval] Batch 1: tc-math-001, tc-url-001, tc-multi-001
#   ✓ PASS tc-math-001 (score: 4.8, 1200ms)
#   ✓ PASS tc-url-001 (score: 4.2, 3400ms)
#   ✗ FAIL tc-multi-001 (score: 2.9, 2100ms)
# ...
# Pass rate: 75.0% (3/4)
```

Verify judge consistency: run the same test case twice. Scores should be within ±0.5. High variance indicates the judge prompt needs tightening or the criterion is ambiguous.

Verify regression detection: deliberately break your agent (e.g., remove the calculate tool) and run the eval. The math test cases should fail; the eval should catch the regression.

---

## Common Failures & Fixes

### Failure: Judge returns non-JSON or malformed JSON
Fix: add a retry in judgeResponse; use `claude-sonnet-4-6` with explicit JSON format instruction; extract JSON with a more permissive regex.

### Failure: Scores are all 5s or all 1s (judge is not calibrated)
Cause: judge system prompt is too vague or criteria are poorly written. Fix: (1) add scoring examples to the judge prompt with rationale, (2) rewrite criteria to be more specific and behavioral ("Returns a number within 5% of 20097" not "Gets the right answer"), (3) use a two-phase judge: first score, then verify scores are reasonable.

### Failure: Test cases are passing that shouldn't be
Cause: criteria too weak. Fix: add `must_not_behaviors` for the failure modes; use score inversion so that `must_not` is scored inversely.

---

## Next Steps

1. **Add baseline comparison**: store the first run as baseline; alert when any test case score drops >0.5
2. **Add golden dataset**: collect your agent's best outputs as ground truth; use them as few-shot examples in the judge prompt for consistency
3. **Add cost tracking**: track input + output tokens per test case; alert when eval costs exceed budget
4. **Integrate with CI**: `npm run eval` as a pre-merge check; fail PR if pass rate < 80%

---

## Related Recipes

- [[recipes/recipe-build-tool-agent]] — the agent to evaluate
- [[recipes/recipe-parallel-subagents]] — run eval cases with full parallelism
- [[recipes/recipe-context-compression]] — long agent sessions affect eval quality; compress context
