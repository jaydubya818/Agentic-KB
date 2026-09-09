---
title: "ADOBE: CODING & AGENTIC SOFTWARE DEVELOPMENT"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p8444
captured_at: 2026-09-08T19:12:30.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: a4fe449522cbdd27fb1cac8dc9b16db98c1ffc69ce2f05e4c445af62934e232d
---

ADOBE: CODING & AGENTIC SOFTWARE DEVELOPMENT

Clarify → Decompose → Design → Implement → Test → Explain Tradeoffs → Improve


Vishal Raina + Anirudh Mathad — 45 Minutes

What this round is testing

This is not a test of whether you can manually code faster than an experienced IC.

They are testing whether you can:

Understand an ambiguous engineering problem
Break it into a workable design
Define clean interfaces
Write enough executable code to demonstrate the solution
Explain your thinking as you go
Test the happy path and important edge cases
Make sensible implementation tradeoffs
Recognize production concerns
Mentor through the problem like a senior player-coach

Your default opening:

“Before I start coding, I want to clarify the expected behavior, inputs, constraints, and failure cases. Then I’ll outline the simplest design, get the happy path working and testable, and use the remaining time for edge cases and production improvements.”

Your universal workflow:

Clarify → Interfaces → Simple Design → Implement → Test → Edge Cases → Productionize

⸻

1. HOW TO START ANY CODING QUESTION

QUESTION

“Build X.”

TALKING SCRIPT

“Let me make sure I understand the contract first.

What are the expected inputs and outputs?

What assumptions can I make?

Do we care more about correctness, extensibility, latency, or simplicity for this exercise?

Are failures expected to be surfaced as exceptions, status values, or retries?

I’ll start with the simplest version that demonstrates the behavior clearly, then I’ll add the most important edge cases.”

Do not spend 10 minutes clarifying.

Use 1–2 minutes, then move.

⸻

2. YOUR CODING STRATEGY

You should use a predictable structure in every problem.

STEP 1 — DEFINE THE CONTRACT

Say:

“I’m going to make the inputs and outputs explicit first.”

Example:
Input:
Task {
  id
  type
  complexity
  required_capabilities
  budget
}

Output:
RouteDecision {
  model
  reason
}

This immediately makes you look organized.

⸻

STEP 2 — START WITH THE SIMPLEST DESIGN

Say:

“I’ll avoid overengineering this initially. I want a working baseline first.”

That is important because one common failure in senior-manager coding interviews is trying to architect a platform instead of writing code.

⸻

STEP 3 — WRITE A HAPPY PATH

Do not solve every edge case up front.

Get one working flow.

⸻

STEP 4 — TEST IT

Say:

“Before I expand this, I want to prove the happy path works.”

Then add a test.

⸻

STEP 5 — DISCUSS PRODUCTION CONCERNS

Only after you have something working:

“If I were productionizing this, I’d now think about concurrency, retries, observability, idempotency, authorization, timeouts, and configuration.”

That ordering is critical.

⸻

3. MOST LIKELY PROBLEM TYPES

I would focus practice on these ten.

1. MODEL ROUTER

QUESTION

“Build a function that selects a model for a task.”

WHAT THEY WANT

Can you turn ambiguous routing rules into code?

SIMPLE DESIGN

Task
- complexity
- securityLevel
- latencyRequirement

Model
- name
- qualityScore
- cost
- securityLevel
- latency

Filter eligible models.

Then rank.

TALKING SCRIPT

“I’m going to separate eligibility from ranking.

First I remove models that cannot satisfy hard requirements such as security or latency.

Then I rank the remaining candidates based on quality and cost.

That way a cheap model can’t accidentally win if it violates a hard constraint.”

KEY LINE

“Hard constraints first, optimization second.”

That is a very good implementation principle.

⸻

4. TOOL REGISTRY / DISPATCHER

QUESTION

“Build a system where an agent can invoke registered tools.”

DESIGN

ToolRegistry
  register(name, handler)
  execute(name, args)

Need:

Unknown-tool handling
Input validation
Clean dispatch
Possibly permission hook

TALKING SCRIPT

“I want the model-facing tool name separated from the actual implementation.

The registry owns discovery and dispatch.

That gives us one place to validate whether the tool exists and later add authorization, schemas, telemetry, or versioning.”

FOLLOW-UP

“What if the agent invokes a tool it isn’t allowed to use?”

Say:

“I’d keep authorization outside the handler and make the registry or gateway enforce the policy before dispatch.”

This connects beautifully to your architecture story.

⸻

5. BOUNDED AGENT EXECUTION LOOP

This is one I strongly expect.

QUESTION

“Implement a simple agent loop.”

SIMPLE FLOW

while not complete:
    call model
    parse action
    invoke tool
    append result
    increment iterations

Then add:

max iterations

budget

timeout

failure handling

TALKING SCRIPT

“I’ll start with a bounded loop rather than an unbounded while loop.

The model proposes an action, the runtime validates and executes it, the result goes back into state, and the loop continues until success, failure, or budget exhaustion.”

KEY LINE

“The runtime, not the model, owns the stopping condition.”

⸻

6. RETRY WITH EXPONENTIAL BACKOFF

QUESTION

“Implement retry logic for a flaky service.”

EXPECTED

Retry only transient failures.

Do not retry everything.

TALKING SCRIPT

“I want to separate retryable failures from terminal failures.

A timeout or 503 may justify retry.

Authentication failure or invalid input probably shouldn’t.”

PATTERN

attempt = 0

while attempt < maxRetries:
    try request
    if success return
    if nonretryable fail
    sleep(base * 2^attempt)

Then mention jitter.

KEY LINE

“Retries should reduce transient failure, not amplify permanent failure.”

⸻

7. TOKEN / EXECUTION BUDGET

QUESTION

“Build a budget manager for an agent.”

SIMPLE DESIGN

Budget
- maxTokens
- maxCalls
- maxCost

consume(tokens, cost)
canContinue()

TALKING SCRIPT

“I want budget accounting external to the agent so the agent cannot decide to ignore the limit.

Each operation consumes budget, and the runtime checks remaining capacity before another expensive action.”

EDGE CASES

Going over on final call
Negative values
Atomic updates under concurrency

KEY LINE

“Budget is runtime state, not prompt guidance.”

⸻

8. TASK DEPENDENCY GRAPH

QUESTION

“Given tasks and dependencies, execute them in valid order.”

This may test basic algorithms without being LeetCode-ish.

THINK

DAG.

Topological ordering.

TALKING SCRIPT

“This naturally maps to a dependency graph.

I’ll first identify tasks with zero unresolved dependencies, execute those, then release dependent tasks as prerequisites complete.”

If cycles:

“I should detect a cycle and fail rather than deadlock.”

KEY LINE

“A plan is executable only if its dependency graph is valid.”

⸻

9. IDEMPOTENT EVENT HANDLER

QUESTION

“An event may be delivered more than once. Prevent duplicate processing.”

SIMPLE DESIGN

Use:
 
eventId
processedEvents set/store

Before side effect:

if eventId already processed:
    return previous result

TALKING SCRIPT

“I’m assuming at-least-once delivery, so duplicate events are expected rather than exceptional.

I need a stable idempotency key and a durable record of whether the side effect has already been applied.”

FOLLOW-UP

“What if the process crashes after the side effect but before marking complete?”

Great question.

Say:

“Then the marker and side effect need a transaction or an external operation that itself supports idempotency.”

Excellent.

⸻

10. SIMPLE STATE MACHINE

QUESTION

“Implement a workflow with states.”

Example:
QUEUED
RUNNING
SUCCEEDED
FAILED
CANCELLED

TALKING SCRIPT

“I’d explicitly define legal transitions rather than allow arbitrary state mutation.”

For example:

QUEUED -> RUNNING
RUNNING -> SUCCEEDED
RUNNING -> FAILED
RUNNING -> CANCELLED

KEY LINE

“State transitions are part of the contract.”

11. CONCURRENCY LIMITER

QUESTION

“Run at most N jobs concurrently.”

Likely language patterns:

Semaphore
Worker pool
Promise pool
Queue

TALKING SCRIPT

“I want bounded concurrency rather than spawning everything.

This protects the downstream service and gives predictable resource behavior.”

FOLLOW-UP

“How would you prioritize jobs?”

“I’d separate concurrency control from scheduling policy. The limiter governs capacity; the queue can later implement priority.”

Good design distinction.

⸻

12. OUTPUT VALIDATOR

QUESTION

“An LLM produces structured output. Validate it.”

SIMPLE APPROACH

Parse JSON
Required keys
Type checks
Allowed values
Fail cleanly

TALKING SCRIPT

“I don’t want downstream systems trusting free-form model output.

I’ll validate at the boundary and convert the probabilistic result into a deterministic contract before execution continues.”

KEY LINE

“Probabilistic output should cross into the system through a deterministic schema boundary.”

⸻

13. SIMPLE EVALUATION RUNNER

QUESTION

“Run evaluation cases against a candidate implementation.”

DESIGN

EvaluationCase
- input
- expected

Evaluator.run(candidate)
-> results
-> score

TALKING SCRIPT

“I’ll separate the test case from the candidate implementation so the same corpus can evaluate multiple versions.”

Then:

“In production I’d also record failure categories, not just pass/fail, because aggregate scores hide regressions.”

This aligns directly with your Meta Factory thinking.

⸻

14. CODE REVIEW PIPELINE

QUESTION

“Build a simple code-review pipeline.”

FLOW

Diff
 ↓
Rules
 ↓
Reviewers
 ↓
Findings
 ↓
Deduplicate
 ↓
Prioritize
 ↓
Result

TALKING SCRIPT

“I’d separate deterministic checks from model-based review.

There’s no reason to spend LLM inference detecting something a linter already handles reliably.”

Excellent.

Then:

“For semantic findings, I’d normalize everything into a common finding structure.”

Example:

Finding {
  file
  line
  severity
  category
  message
}

15. YOUR ERROR-HANDLING STYLE

They may watch this closely.

Do not silently swallow exceptions.

Say:

“I want failure behavior explicit.”

Good pattern:

Success(value)
Failure(reason)

or exceptions depending language.

Then:

“For the interview I’ll keep the error model simple, but in production I’d classify retryable vs terminal errors.”

⸻

16. YOUR TESTING STRATEGY

Every solution should ideally get:

TEST 1 — HAPPY PATH

Expected behavior.

TEST 2 — EDGE CASE

Boundary condition.

TEST 3 — FAILURE CASE

Invalid input or dependency failure.

You don’t need 15 tests.

TALKING SCRIPT

“I want one happy-path test and one failure test before I optimize further.”

That signals discipline.

⸻

17. IF YOU GET STUCK

This matters a lot given your background.

Do not go silent.

Say:

“I know the behavior I want here. Let me simplify the implementation.”

Or:

“I’m getting too clever with this. I’m going to reset to the simplest version.”

Or:

“I don’t remember the exact library syntax, so I’ll implement the behavior directly.”

That is much better than apologizing repeatedly.

⸻

18. IF YOU FORGET SYNTAX

Very likely.

This is okay.

Say:

“I’m not certain of the exact method name, so I’ll use pseudocode for this line and keep the control flow correct.”

But don’t turn the whole answer into pseudocode unless they permit it.

If using Python, choose basic constructs you know well.

⸻

19. WHICH LANGUAGE SHOULD YOU USE?

Given your situation, I would choose Python unless Adobe has required something else.

Why:

Minimal syntax
Fast to express ideas
Easy dictionaries/classes
Easy tests
Good for agent problems
Less boilerplate
Easier under pressure

The goal is reasoning, not showcasing language sophistication.

I would not choose TypeScript purely because Mission Control uses it if you are materially less comfortable manually typing it.

⸻

20. YOUR DEFAULT CODE STRUCTURE

For nearly every problem:

class Input:
    ...

class Result:
    ...

class Service:
    def execute(self, input):
        ...

or just:

def solve(input):
    ...

Keep it simple.

Don’t build factories for your factory interview. 😄

⸻

21. LIKELY QUESTION: “HOW WOULD YOU PRODUCTIONIZE THIS?”

You should have a repeatable answer.

Say:

“For this exercise I optimized for clarity and correctness.

To productionize it, I’d next look at:

validation, authorization, persistence, idempotency, concurrency, retries, timeouts, observability, configuration, testing, and failure recovery.

I’d only add the mechanisms the workload actually requires.”

Don’t redesign your entire answer.

⸻

22. LIKELY QUESTION: “WHAT TRADEOFF DID YOU MAKE?”

Answer explicitly.

Example:

“I chose a simple in-memory structure because it makes the behavior clear in 45 minutes.

The tradeoff is that it isn’t durable across process restarts.

In production I’d put the authoritative state in a transactional store.”

This is exactly the kind of judgment they want.

⸻

23. PLAYER-COACH BEHAVIOR

Marissa literally described this as analogous to pair programming as a mentor.

That means narrate like you’re working beside an engineer:

“I think we have two reasonable options here.”

“I’m choosing this one because…”

“The risk with this approach is…”

“Let’s get the contract right first.”

“Before optimizing, let’s make sure the failure behavior is correct.”

You don’t want to sound like you’re taking an exam.

You want to sound like you’re building something with them.

⸻

24. THE BIGGEST MISTAKES TO AVOID

Avoid:

Overarchitecting

Do not turn a 40-line problem into distributed Meta Factory.

Talking for 15 minutes before coding

They want implementation.

Trying to hide uncertainty

Just state what you know.

No tests

Even one or two tests matter.

Premature optimization

Simple first.

No edge-case discussion

Show production judgment.

Constantly saying “I don’t code anymore.”

You’ve already told the recruiter.

Do not bring it into the room as an excuse.

⸻

25. YOUR BEST OPENING FOR THIS ROUND

When they begin:

“I understand this round is more about how I reason and build than algorithmic speed, so I’ll narrate my approach as I go.

For each problem I’ll clarify the expected behavior, choose the simplest workable design, get something testable running, and then use the remaining time to improve the important edge cases and discuss production considerations.”

That’s confident without being defensive.

⸻

26. YOUR 45-MINUTE TIME MANAGEMENT

Aim roughly:

0–5 min: Understand problem + clarify

5–10 min: Define contract + approach

10–28 min: Implement happy path

28–35 min: Test + debug

35–40 min: Edge case / second test

40–45 min: Production considerations + tradeoffs

If you are behind at minute 20:

simplify immediately.

⸻

27. YOUR ONE-PAGE MEMORY SCREEN

CODING ROUND

OPEN

Clarify behavior and constraints.

↓

DESIGN

Define input/output contract.

↓

BUILD

Simplest working implementation.

↓

TEST

Happy path + failure path.

↓

IMPROVE

Important edge cases.

↓

PRODUCTIONIZE

Authorization • persistence • idempotency • concurrency • retries • timeouts • observability

⸻

28. FIVE LINES TO MEMORIZE

“I’ll start with the simplest working version and make the contract explicit.”

“Hard constraints first, optimization second.”

“The runtime, not the model, owns the stopping condition.”

“Probabilistic output should cross into the system through a deterministic boundary.”

“For production, I’d add only the complexity the workload actually requires.”

The highest-value next step is to rehearse this exactly like the real interview: one problem at a time, no AI assistance while you solve it, then critique your reasoning, code structure, testing, and communication afterward.
