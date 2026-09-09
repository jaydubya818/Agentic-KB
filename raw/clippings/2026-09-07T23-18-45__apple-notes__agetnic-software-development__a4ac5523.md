---
title: "Agetnic Software Development"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p8520
captured_at: 2026-09-07T23:18:45.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: a4ac552367c7b83a7452d44f5e9019e39325655f33e65e55159fae5c5f3b344b
---

Agetnic Software Development 

Yes. Since coding itself is not your strength, I would prepare for the Agentic Software Development half very differently. This is actually where you can perform extremely well because it overlaps directly with the systems you already understand: Workbench, Hopper, Agent Factory, Mission Control, routing, harnesses, verification, sandboxes, and software factories.

The key is to answer at the software-development level, not immediately jump to your entire Meta Factory architecture.

ADOBE — AGENTIC SOFTWARE DEVELOPMENT

Vishal Raina + Anirudh Mathad | 45 minutes

1. What you need to demonstrate

They may give you a development scenario such as:

“Design an agent that reviews code.”

“How would you build an agent that fixes bugs?”

“How would you allow an agent to use tools?”

“How would you route different tasks to different models?”

“How would you evaluate whether an agent is improving?”

“What belongs in the agent harness?”

For almost every question, use this mental model:

Goal → Context → Plan → Route → Act → Observe → Verify → Stop/Escalate → Learn

But there is an even more important distinction:

The model provides reasoning. The harness provides disciplined execution. The control plane provides governance.

⸻

2. WHAT IS AN AGENT?

If Vishal asks:

“What makes something an agent rather than just an LLM call?”

Say:

“I think the distinction is the execution loop. A basic model call is input → inference → output. An agent has a goal, state, context, tools, and a loop that allows it to reason about the next action, execute something, observe the result, update its state, and continue until it reaches a stopping condition.”

Then:

LLM

Prompt → Model → Response

Agent

Goal → Reason → Act → Observe → Update → Repeat → Outcome

Strong line:

“The model generates intelligence. The agent turns intelligence into action.”

⸻

3. AGENT vs HARNESS vs RUNTIME vs ORCHESTRATOR

You absolutely need this distinction because you’ve been working through it already.

Your script:

“I treat the boundaries explicitly. The agent reasons about the task. The harness manages its execution loop—context, tool invocation, observations, state and stopping conditions. The runtime provides the actual execution environment. An orchestrator coordinates work across tasks or agents. And the control plane determines what execution is authorized to do.”

Then the line:

“A harness can execute one agent without being a multi-agent orchestrator.”

That’s important.

⸻

4. WALK ME THROUGH AN AGENT EXECUTION LOOP

This is probably the single most important question.

Say:

“I start with a goal and explicit acceptance criteria. The harness assembles the relevant context and asks the model for the next action. The proposed action crosses a deterministic boundary where we validate its schema, permissions, budget and policy. If authorized, the runtime executes the tool or action. The observation comes back into state. Then we determine whether the goal has been satisfied, whether another iteration is justified, or whether execution should stop or escalate.”

Remember:

Goal
→ Context
→ Reason
→ Propose Action
→ Validate
→ Execute
→ Observe
→ Update State
→ Verify
→ Continue / Complete / Escalate

Critical point

The LLM should not own:

permissions · budget · maximum iterations · credentials · policy · authoritative state

Those belong outside it.

“The model proposes. Deterministic systems authorize and execute.”

⸻

5. WHAT IS AN AGENT HARNESS?

Say:

“I think of the harness as the machinery that turns a model into a reliable iterative worker. At minimum it manages the loop, context, tools, observations, state and termination. A production harness usually adds structured output validation, retries, budgets, tracing, checkpoints and escalation.”

Don’t put everything in the harness.

Then say:

“I would keep enterprise-wide identity, policy and promotion authority in the surrounding platform or control plane rather than coupling all of that into every harness.”

Excellent architectural boundary.

⸻

6. CONTEXT ENGINEERING

This is likely important at Adobe.

If they ask:

“How does the agent know enough about the repository?”

Don’t answer “RAG.”

Say:

“I think of context as a limited working set that we actively construct. I wouldn’t dump the repository into the context window. I’d start with the task, repository instructions and changed files, then retrieve increasingly specific context based on what the agent needs.”

Think in layers:

Task context
→ issue / objective / acceptance criteria

Repository context
→ AGENTS.md / conventions / architecture

Code context
→ symbols / dependencies / relevant files

Historical context
→ prior changes / reviews / decisions

Enterprise context
→ standards / security / policies

Then:

“Context should be retrieved for the decision being made, not accumulated because the model can hold it.”

That is a strong answer.

⸻

7. TOOL USE

Question:

“How should an agent invoke tools?”

Your answer:

“The model shouldn’t directly execute arbitrary operations. It proposes a structured tool invocation. The platform validates the tool, arguments, identity, permissions and policy before execution. The result is normalized into an observation and returned to the agent.”

Flow:

Agent → Tool Request → Validate → Authorize → Execute → Normalize → Observe

Then:

“MCP can standardize discovery and invocation contracts, but MCP doesn’t remove the need for authorization, credentials, policy, auditing or sandboxing.”

Strong line:

“Tool availability does not imply tool authority.”

⸻

8. MODEL ROUTING

This one is especially important because of Shibu’s question.

If they ask:

“Should every task use the strongest model?”

Answer:

“No. I would treat models as execution resources. First determine the workload requirements—complexity, required capabilities, security, context, latency and quality. Eliminate models that don’t satisfy the hard requirements. Then optimize among qualified candidates.”

Task
→ Requirements
→ Eligible Models
→ Quality Evidence
→ Cost / Latency
→ Route

Then the evolution:

V1

Static rules.

V2

Task classification + rules.

V3

Historical evaluation data.

V4

Dynamic empirical routing.

And your metric:

“I wouldn’t optimize for cost per token. I’d optimize for cost per accepted outcome.”

That is one of your strongest Adobe lines.

⸻

9. HOW DO YOU PREVENT RUNAWAY AGENTS?

Don’t just say max_iterations.

Say:

“I use several independent controls because no single stopping mechanism is sufficient.”

Iteration budget · token/cost budget · wall-clock timeout · tool-call budget · progress detection · retry limits · circuit breakers · cancellation · human escalation

Then distinguish:

No progress ≠ transient failure

If the agent repeats the same failed strategy five times:

“That’s not evidence that we need a sixth retry. It’s evidence that we need another strategy or escalation.”

Excellent line.

⸻

10. FAILURE HANDLING

Use this framework:

TRANSIENT

Timeout, 429, temporary service failure
→ retry/backoff

CORRECTABLE

Malformed model output
→ repair/re-prompt/bounded retry

STRATEGY FAILURE

Repeated bad solution
→ reroute/replan

POLICY FAILURE

Unauthorized action
→ stop

BUDGET FAILURE

Cost/time exhausted
→ stop/escalate

TERMINAL

Impossible task / invalid plan
→ fail with evidence

Then:

“Retry behavior should follow failure semantics.”

⸻

11. HOW WOULD YOU BUILD A CODING AGENT?

Very likely question.

Start simple.

“I’d model it as an iterative repository worker rather than one giant code-generation prompt.”

Flow:

Task
→ understand requirements
→ retrieve repository context
→ inspect relevant code
→ create plan
→ edit
→ compile/lint
→ test
→ inspect failures
→ repair
→ verify acceptance criteria
→ produce candidate change + evidence

Then say:

“I would separate generation from verification. The coding agent can propose and repair the implementation, but I don’t want the producer to be the sole judge of whether its work is correct.”

That’s directly aligned with your broader thesis without turning the answer into a presentation.

⸻

12. CODE REVIEW AGENT

This could absolutely appear.

Your architecture:

PR/Diff
→ deterministic checks
→ repository context
→ semantic reviewer
→ normalize findings
→ deduplicate
→ confidence/severity threshold
→ developer feedback
→ outcome capture

Explain:

“I would run deterministic verification first. There’s no reason to spend inference detecting what a compiler, linter, security scanner or test can establish more reliably.”

Then semantic review handles:

logic · architecture · maintainability · unintended behavior · missing tests · domain-specific concerns

Every finding:

file · line · category · severity · evidence · recommendation · confidence

And:

“The objective isn’t maximum comments. It’s maximum useful findings developers trust.”

⸻

13. EVALUATING AN AGENT

This is critical.

If they ask:

“How do you know the agent is good?”

Don’t answer “LLM-as-a-judge.”

Say:

“Evaluation depends on the workload. I want the strongest deterministic signal available first and probabilistic evaluation only where judgment is actually required.”

Evaluation hierarchy:

Compilation
→ unit tests
→ integration tests
→ security/policy
→ acceptance criteria
→ semantic evaluation
→ human/outcome feedback

For an agent version:

Baseline vs Candidate

Compare:

task success · regressions · security · latency · tokens · cost · retries · human intervention

Then:

“An aggregate score isn’t enough. I want failure categories because a 2% average improvement doesn’t justify introducing a severe security regression.”

Excellent.

⸻

14. MULTI-AGENT SYSTEMS

They could ask:

“When would you use multiple agents?”

Do not say multi-agent is inherently better.

Say:

“I start with one agent and add specialization when the workload demonstrates a reason for it.”

Use multiple agents when you need:

different capabilities · different context · independent verification · parallelizable work · different permissions · different models

Don’t use multiple agents merely because you can.

“Every additional agent creates coordination, context-transfer and failure complexity, so specialization has to earn that complexity.”

Very strong Senior Manager answer.

⸻

15. PLANNER vs PLAN

This is one of your strongest concepts.

If asked about planning:

“I separate the planner from the plan. The planner can be probabilistic and replaceable. The plan becomes an inspectable execution artifact.”

Plan contains:

tasks · dependencies · acceptance criteria · required capabilities · verification requirements · constraints

Then:

“The planner reasons. The plan is governed state.”

This makes recovery and auditability much easier.

⸻

16. STATE

Question:

“Where should agent state live?”

“Transient reasoning context can live inside the execution, but authoritative workflow state should not exist only inside the model’s context window.”

Separate:

Conversation/context state → model working memory

Execution state → current task, attempts, observations

Workflow state → durable system of record

Evidence → immutable/traceable outputs

Then:

“If the process dies, I should be able to reconstruct where execution was without asking the model what it remembers.”

Excellent.

⸻

17. SANDBOXING

Given Adobe’s interest in secure sandboxing, know this cold.

“For autonomous coding, I assume generated code is untrusted until verified. I’d execute it inside an ephemeral sandbox with constrained filesystem, network, compute, credentials and lifetime.”

Think:

Ephemeral
Least privilege
Network constrained
Scoped filesystem
Short-lived credentials
Resource limits
Observable
Disposable

Then:

“The sandbox limits blast radius; it doesn’t establish correctness. Verification still has to determine whether the output is good.”

Very important distinction.

⸻

18. HUMAN-IN-THE-LOOP

Don’t say humans approve everything.

Say:

“I want human authority based on risk rather than inserting humans into every transition.”

Low-risk + reversible + strong verification
→ more autonomy

High-impact + irreversible + weak verification
→ human approval

Then:

“The objective isn’t removing humans. It’s placing human judgment where it has the highest marginal value.”

⸻

19. HOW DOES AN AGENT LEARN?

This is where you can differentiate yourself.

Outcome loop:

Execution
→ evidence
→ outcome
→ evaluation
→ routing/prompt/tool/harness candidate
→ offline qualification
→ controlled rollout
→ production evidence

Then:

“I separate learning from promotion. The system can autonomously discover a potentially better configuration, but it shouldn’t silently promote itself based solely on its own judgment.”

Your line:

“Learning can be autonomous. Promotion should be governed.”

⸻

20. THE SCENARIO I MOST WANT YOU READY FOR

I could easily imagine Vishal saying:

“Design an agent that receives a bug report and produces a code fix.”

Your response should immediately become:

1 — Clarify

“Should the agent stop at a candidate PR, or does it have authority to merge?”

Great question.

2 — Define success

Bug reproduced → fix produced → regression test → verification passes → PR/evidence generated

3 — Architecture

Bug
→ Context
→ Plan
→ Reproduce
→ Edit
→ Test
→ Observe
→ Repair
→ Verify
→ Candidate PR

4 — Controls

bounded iterations · token budget · sandbox · scoped tools · timeout · escalation

5 — Verification

“I’d specifically want the regression test to fail before the fix and pass afterward so we have evidence that we’re addressing the reported behavior rather than merely producing code that compiles.”

🔥 That’s an excellent answer.

6 — Production evolution

durable state · queue · concurrency · routing · repository qualification · telemetry · evaluation · progressive autonomy

Done.

You don’t need a 20-minute Meta Factory lecture.

⸻

10 QUESTIONS I WOULD EXPECT

￼


THE FOUR DISTINCTIONS TO KNOW COLD

If you remember nothing else:

1. MODEL vs AGENT

Model reasons. Agent pursues a goal through actions.

2. AGENT vs HARNESS

Agent decides what to do. Harness manages how iterative execution occurs.

3. GENERATION vs VERIFICATION

Producing an answer is not evidence that the answer is correct.

4. AUTONOMY vs AUTHORITY

An agent may autonomously perform work without having unrestricted authority over consequential actions.

That fourth distinction is especially strong.

⸻

YOUR ANSWERING FORMULA

When they give you any agentic problem, use:

1. GOAL — What outcome are we trying to produce?

2. CONTRACT — What are the inputs, outputs and acceptance criteria?

3. CONTEXT — What information does the agent need?

4. CAPABILITIES — Models, tools, skills?

5. LOOP — Reason → act → observe → update.

6. CONTROLS — Permissions, budgets, termination.

7. FAILURE — Retry, replan, reroute, stop, escalate.

8. VERIFY — How do we independently establish success?

9. EVIDENCE — What do we preserve?

10. LEARN — What outcome improves future execution?

You don’t necessarily say all ten. It’s your mental checklist.

⸻

60-SECOND CHEAT SHEET

AGENT

Goal → Context → Reason → Act → Observe → Verify → Repeat/Stop

HARNESS

Loop · State · Context · Tools · Validation · Budgets · Retry · Termination

TOOLS

Discover ≠ Authorize

ROUTING

Hard constraints → qualification → quality → cost

CONTEXT

Right information → right decision → right time

FAILURE

Classify → Retry / Repair / Replan / Escalate

SANDBOX

Untrusted execution → bounded blast radius

VERIFICATION

Producer ≠ sole judge

EVALUATION

Baseline → Candidate → Evidence → Outcome

AUTONOMY

Increase with verification + confidence + reversibility

LEARNING

Learn autonomously → qualify → govern promotion

And your central mental model

“Models reason. Agents act. Harnesses control execution. Orchestrators coordinate work. Control planes govern authority. Verification establishes trust.”

This is the part of the round where I want you confident. You may not be a hands-on coder today, but you understand agentic software systems at a much deeper level than merely knowing how to call an LLM API. The trick in this interview is demonstrating that understanding concretely and simply, without turning every question into the full autonomous-software-factory architecture.

————————


￼
1. MAKE ONE IMPORTANT CORRECTION TO “WHAT IS AN AGENT?”

Your current answer:

“I think the distinction is the execution loop.”

That’s useful, but slightly too absolute.

I would change it to:

“I think the practical distinction is goal-directed control over multiple steps. A basic LLM call maps input to output. An agent maintains some execution state and can determine what action to take next—reasoning, using a tool, gathering context, delegating work, or completing—based on observations from previous steps.”

Then:

LLM call:
Input → Inference → Output

Agentic execution:
Goal → State → Decide → Act → Observe → Update → Continue/Stop

Why this is better: an agent doesn’t necessarily need tools, and not every agent implementation literally exposes a textbook while loop.

Your strong line can remain:

“The model provides reasoning; the agent turns that reasoning into goal-directed behavior.”

⸻

2. SLIGHTLY REFINE HARNESS vs RUNTIME

Your distinction is good, but this terminology is not standardized across the industry. If Vishal uses the words differently, don’t fight over vocabulary.

I would say:

“I care more about the responsibilities than the labels because different frameworks draw these boundaries differently. The way I use the terms: the harness manages the agent’s iterative execution mechanics; the runtime provides the execution environment and resources; orchestration coordinates work across nodes or tasks; and the control plane governs authority and policy.”

That’s stronger than implying your taxonomy is universally canonical.

Then:

“If Adobe draws those boundaries differently, that’s fine—the architectural responsibilities still need to exist somewhere.”

Excellent interview answer.

⸻

3. ADD STRUCTURED OUTPUT / DETERMINISTIC BOUNDARIES

This is missing as a dedicated topic and I would absolutely add it.

STRUCTURED OUTPUT & VALIDATION

If they ask:

“The model tells you which tool to invoke. Do you trust its response?”

Say:

“No. Model output is untrusted input to the rest of the system. If I’m expecting an action, I want a defined schema—action type, tool name, arguments and relevant metadata. I validate that structure deterministically before anything executes.”

Flow:

Model Output → Parse → Schema Validate → Policy Validate → Execute / Reject

If malformed:

repair → bounded retry → fail/escalate

Strong line:

“Probabilistic reasoning should cross deterministic system boundaries through explicit contracts.”

You already use this idea in the coding notes. It belongs in these notes too.

⸻

4. ADD PROMPT INJECTION / UNTRUSTED CONTEXT

This is especially relevant for coding agents reading repositories, tickets, documentation and external content.

If asked:

“What if repository content tells the agent to ignore its instructions?”

Say:

“I treat retrieved content as data, not authority. Repository files, tickets, webpages and tool output may contain adversarial instructions. System policy and execution authority should remain outside that content.”

Then mention:

Trust boundaries · source provenance · tool authorization · secret isolation · output validation · sandboxing

Strong line:

“Context can influence reasoning; it shouldn’t redefine authority.”

That is an excellent Adobe answer.

⸻

5. ADD OBSERVABILITY / TRACING

You mention it throughout, but it deserves its own study section.

HOW DO YOU DEBUG AN AGENT?

Likely question.

Say:

“Agent debugging requires reconstructing the execution trajectory, not merely looking at the final response.”

I would capture:

goal → model route → context selected → model calls → tool requests → tool results → state transitions → retries → tokens/cost → verification → final outcome

Then distinguish:

Logs — what happened
Metrics — how often/how much
Traces — how one execution progressed
Evals — whether behavior was good

Strong line:

“Observability tells me what the agent did. Evaluation tells me whether what it did was good.”

That is worth memorizing.

⸻

6. ADD MEMORY — AND DON’T CONFUSE IT WITH CONTEXT

Someone may ask about agent memory.

Answer:

“I separate memory from the active context window. Context is what the model sees for the current decision. Memory is information persisted across steps or executions that can later be selectively retrieved into context.”

Think:

Working memory → current execution state
Episodic memory → previous runs/outcomes
Semantic memory → durable knowledge
Authoritative state → system of record, not model memory

Important:

“Persisting everything an agent ever saw isn’t memory engineering. Retrieval and relevance matter.”

⸻

7. ADD IDEMPOTENCY

For autonomous systems, this matters a lot.

If they ask:

“What happens if the worker crashes after creating the PR?”

Say:

“I assume retries and duplicate delivery can happen. Side-effecting operations need stable idempotency keys or transactional semantics so recovering execution doesn’t create another PR, deploy twice, or send the same notification repeatedly.”

Strong line:

“Retrying reasoning is cheap. Retrying side effects can be dangerous.”

This is a very software-engineering answer.

⸻

8. YOUR MULTI-AGENT SECTION IS EXCELLENT — ADD COMMUNICATION

If they push:

“How do agents communicate?”

Don’t say agents should conversationally chat forever.

Say:

“I prefer explicit typed artifacts over unrestricted agent-to-agent conversation wherever possible.”

For example:

Planner produces:

Plan

Coder produces:

CandidateChange

Verifier produces:

VerificationResult

Reviewer produces:

Findings

Why?

“Typed handoffs make the workflow observable, testable, recoverable and independently evolvable.”

🔥 Very strong answer.

Then:

“Agents can communicate through state and artifacts rather than requiring every interaction to be another natural-language conversation.”

⸻

9. ADD THE MOST IMPORTANT DEVELOPMENT CONCEPT: STATE MACHINES

This is probably the largest missing implementation concept.

Agentic systems are easier to reason about when execution states are explicit.

Example:

QUEUED → RUNNING → WAITING_FOR_TOOL → VERIFYING → SUCCEEDED

Failure:

RUNNING → RETRYING → RUNNING

or:

RUNNING → ESCALATED

or:

RUNNING → FAILED

Say:

“For production workflows, I prefer explicit state transitions over inferring workflow state from conversation history. That makes recovery, idempotency and operational reasoning much easier.”

Strong line:

“Conversation is not a workflow database.”

Memorize that one. 😄

⸻

10. ADD AN AUTONOMY LADDER

This could be useful because Adobe is building for enterprise developers.

Instead of “agent/autonomous” being binary:

Level 0 — Suggest
Agent recommends.

Level 1 — Act with approval
Human approves actions.

Level 2 — Act within bounded authority
Agent executes reversible operations.

Level 3 — Autonomous workflow
Agent completes workflow with verification.

Level 4 — Governed autonomous delivery
Agent can promote when policy/evidence permits.

Then say:

“I would increase autonomy based on verification strength, reversibility, confidence and blast radius—not because the underlying model became more impressive.”

That’s a great connection to your thesis.

⸻

11. TURN YOUR “CODING AGENT” INTO THE MAIN PRACTICE SCENARIO

Your bug-fixing example should probably be the centerpiece of these notes because it brings virtually everything together.

If they say:

“Build/design an autonomous bug-fixing agent.”

Your full mental sequence should be:

1. Goal
Fix bug and produce candidate PR.

2. Acceptance criteria
Bug reproduced; regression test proves failure; fix makes test pass; existing tests don’t regress.

3. Context
Issue + repository instructions + relevant code + dependencies + history.

4. Plan
Explicit tasks and verification requirements.

5. Execution
Inspect → reproduce → edit → test → repair.

6. Tooling
Repository, search, shell, compiler, tests.

7. Runtime
Ephemeral sandbox.

8. Controls
Permissions, timeout, iterations, tokens/cost.

9. Verification
Deterministic tests first; independent semantic verification if necessary.

10. Evidence
Diff + test results + logs + findings + provenance.

11. Authority
Open PR; don’t automatically merge unless policy permits.

12. Learning
Capture outcome after review/merge/rejection.

That’s essentially your entire agentic knowledge compressed into one concrete engineering example.

⸻

12. ONE AREA TO REMOVE OR DE-EMPHASIZE

You currently mention control plane frequently.

Keep the concept, but don’t inject it into every answer.

If they ask:

“How does a coding agent decide which file to edit?”

Don’t answer with:

“The control plane…”

Just answer the development question.

Use the control plane when discussing:

identity · policy · budgets · authority · governance · enterprise routing

Otherwise stay local.

This is the same danger we identified with your Meta Factory knowledge: don’t turn every component into the entire platform.

⸻

13. YOUR ANSWERING FORMULA IS GOOD — I WOULD SHORTEN IT

Your current ten-item formula is conceptually excellent but difficult to recall under pressure.

Use:

G-C-A-C-V

Goal — What outcome?

Context — What does it need to know?

Action — Models/tools/loop.

Controls — Authority/budget/failure/state.

Verification — How do we know it worked?

Then, if appropriate:

Evidence → Learn

Much easier.

Think:

Goal → Context → Action → Controls → Verification

If you answer those five dimensions, you’ll answer most agent-system questions well.

⸻

14. THE QUESTIONS I WOULD STUDY HARDEST

If you only have limited preparation time, I would prioritize these:

￼

FINAL VERSION OF YOUR MEMORY MAP

I would replace the bottom of your current notes with this:

FINAL VERSION OF YOUR MEMORY MAP

I would replace the bottom of your current notes with this:

￼

And then memorize this:

“Models reason. Agents pursue goals. Harnesses manage iterative execution. Runtimes provide execution environments. Orchestrators coordinate work. Deterministic systems enforce authority. Verification establishes whether the outcome can be trusted.”

Bottom line

Your existing notes are already very good. I would not add another 30 pages. I would incorporate structured outputs, prompt-injection boundaries, memory, observability, idempotency, explicit state machines, and typed multi-agent handoffs, tighten a couple of definitions, and then practice answering scenarios verbally.

At that point, these become 9.5/10 interview notes rather than just a really good architecture reference.
