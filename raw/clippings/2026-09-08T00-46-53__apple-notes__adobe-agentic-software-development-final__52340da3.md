---
title: "ADOBE — AGENTIC SOFTWARE DEVELOPMENT - FINAL"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p8525
captured_at: 2026-09-08T00:46:53.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: 52340da32f49856509dcb6794df8de364a6e14ae4e4c8271e867d6d8dbd5a1bb
---

ADOBE — AGENTIC SOFTWARE DEVELOPMENT - FINAL 


Vishal Raina + Anirudh Mathad | 45 Minutes


CORE INTERVIEW MINDSET
This is Agentic Software Development, not a Meta Factory architecture presentation. Stay close to the engineering problem they give you. Explain the local implementation first, then expand into production architecture only when relevant.


Universal mental model
Goal → Context → Action → Controls → Verification → Evidence → Learn
Or remember:
G-C-A-C-V
Goal — What outcome are we producing?
Context — What information is needed?
Action — How does the agent reason, use models/tools, and execute?
Controls — What limits authority, failure, cost, and execution?
Verification — How do we establish that it worked?

Then, where relevant: Evidence → Learning

Central thesis
“Models reason. Agents pursue goals. Harnesses manage iterative execution. Runtimes provide execution environments. Orchestrators coordinate work. Deterministic systems enforce authority. Verification establishes whether the outcome can be trusted.”

⸻

1. WHAT IS AN AGENT?
Likely question
“What makes something an agent rather than just an LLM call?”
Talking script
“I think the practical distinction is goal-directed control over multiple steps. A basic LLM call maps input to output. An agent maintains execution state and determines what action to take next based on the goal and observations from previous steps.
That action might be reasoning further, retrieving context, invoking a tool, delegating work, modifying something, or determining that the objective is complete.
So I don’t define an agent merely by whether it calls tools. I define it by its ability to pursue an objective through stateful, iterative decision-making.”
LLM call: Input → Inference → Output
Agent: Goal → State → Decide → Act → Observe → Update → Continue / Stop
Strong line
“The model provides reasoning. The agent turns that reasoning into goal-directed behavior.”

⸻

2. MODEL vs AGENT vs HARNESS vs RUNTIME vs ORCHESTRATOR
Likely question
“What do you mean by agent harness?”
Talking script
“I care more about the responsibilities than the terminology because different frameworks draw these boundaries differently.
The way I use the terms, the model provides inference and reasoning. The agent pursues the goal. The harness manages the mechanics around iterative execution—context, model interaction, tools, observations, state and termination. The runtime provides the execution environment and resources. The orchestrator coordinates work across tasks, agents or workflow nodes.
Then outside those execution mechanics, enterprise-wide policy, identity and authority can live in the surrounding platform or control plane.”
Important nuance
“A harness can execute one agent without being a multi-agent orchestrator.”
And if Adobe uses different terminology:
“If Adobe draws those boundaries differently, that’s completely reasonable. The important thing to me is that those responsibilities exist somewhere and have clear ownership.”
That prevents a pointless terminology debate.

⸻

3. AGENT EXECUTION LOOP — KNOW THIS COLD
Likely question
“Walk me through how an agent executes.”
Talking script
“I start with a goal and explicit acceptance criteria. The harness assembles the relevant context and asks the model to determine the next action.
That proposed action then crosses a deterministic boundary. We validate its structure and, if it’s consequential, its permissions, policy and available budget.
If it’s valid and authorized, the runtime executes the action or tool. The resulting observation comes back into execution state.
We then determine whether the objective has been satisfied. If not, the agent gets another iteration. If we’re not making progress, hit a limit, encounter a terminal failure, or require additional authority, we stop or escalate.”
Flow
Goal → Context → Reason → Propose → Validate → Execute → Observe → Update → Verify → Continue / Complete / Escalate
The model should NOT own authoritative:
Permissions · credentials · budgets · max iterations · policy · durable workflow state
Strong lines
“The model proposes. Deterministic systems authorize and execute.”
“The model reasons; the runtime controls execution.”

⸻

4. STRUCTURED OUTPUT & DETERMINISTIC BOUNDARIES
Likely question
“The model tells you which tool to invoke. Do you trust the response?”
Talking script
“No. I treat model output as untrusted input to the rest of the system.
If I’m expecting an action, I want an explicit schema describing things like action type, tool name, arguments and relevant metadata.
I parse and validate that deterministically before anything executes. If it’s malformed, I might attempt a bounded repair or retry. But malformed probabilistic output should never silently become an executable operation.”
Model → Parse → Schema Validate → Policy Validate → Execute / Reject
Strong line
“Probabilistic reasoning should cross deterministic system boundaries through explicit contracts.”

⸻

5. CONTEXT ENGINEERING
Likely question
“How does a coding agent understand a large repository?”
Talking script
“I treat context as a limited working set that we actively construct, not as everything the system knows.
I wouldn’t dump an entire repository into the context window simply because the model can accept it. I’d begin with the task, acceptance criteria and repository instructions, identify the relevant code surface, and retrieve additional context as the execution requires it.
Context should be optimized for the decision the agent is making right now.”
Context layers
Task: objective · issue · acceptance criteria Repository: instructions · architecture · conventions Code: files · symbols · dependencies · tests Historical: previous changes · reviews · decisions Enterprise: standards · security · policies
Strong line
“Right information, for the right decision, at the right time.”
And:
“Context should be retrieved because it’s relevant, not accumulated because the model can hold it.”

⸻

6. MEMORY vs CONTEXT vs STATE
Likely question
“How do you think about agent memory?”
Talking script
“I separate memory, active context and authoritative state.
Context is what the model sees for the current decision. Memory is information persisted across steps or executions that can later be selectively retrieved into context. Workflow state is authoritative system state and shouldn’t depend on what the model remembers.”
Think:
Working context → current reasoning Execution memory → prior observations/steps Episodic memory → previous executions/outcomes Semantic memory → durable knowledge Authoritative state → system of record
Strong line
“Persisting everything isn’t memory engineering. The value comes from selecting what should be remembered and retrieving it when it’s relevant.”

⸻

7. PROMPT INJECTION & UNTRUSTED CONTEXT
This is especially important for coding agents.
Likely question
“What if a repository file contains instructions telling the agent to ignore its policy?”
Talking script
“I treat retrieved content as data, not authority.
Repositories, tickets, webpages, documentation and tool output can all contain adversarial or simply incorrect instructions.
They may influence the model’s reasoning, but they shouldn’t be able to redefine permissions, expose credentials or override execution policy. Those controls remain outside the retrieved content.”
Think:
Trust boundaries · provenance · authorization · secret isolation · validation · sandbox
Strong line
“Context can influence reasoning. It shouldn’t redefine authority.”

⸻

8. TOOL USE & MCP
Likely question
“How should an agent invoke tools safely?”
Talking script
“I separate discovery, selection, authorization and execution.
The model proposes a structured tool invocation. The platform validates that the tool exists, validates its arguments, verifies the caller has the required authority, and checks applicable policy before executing it.
The result is normalized into an observation that goes back into the agent’s state.”
Agent → Tool Request → Validate → Authorize → Execute → Normalize → Observe
MCP follow-up
“MCP is valuable because it standardizes connectivity and tool contracts. But MCP doesn’t eliminate the need for identity, authorization, credential management, policy, auditing or sandboxing.”
Strong lines
“Tool discovery does not imply tool authority.”
“Connectivity is not governance.”

⸻

9. MODEL & CAPABILITY ROUTING — VERY IMPORTANT FOR ADOBE
Likely question
“Should every task use the strongest model?”
Talking script
“No. I treat models as execution resources, not as one universal intelligence tier.
First I characterize the workload: task type, complexity, required capabilities, security requirements, context size, latency sensitivity and quality threshold.
I eliminate anything that doesn’t satisfy those hard requirements. Then I optimize among qualified candidates using quality, latency, availability and economics.
Initially that can be deterministic. Over time I’d make routing increasingly empirical using actual workload outcomes.”
Evolution
V1: static rules V2: workload classification V3: historical evaluation evidence V4: dynamic empirical qualification/routing
Critical Adobe metric
“I wouldn’t optimize for cost per token. I’d optimize for cost per accepted outcome.”
Why?
“A cheaper model that fails twice and requires an expensive recovery path may actually be the more expensive route.”

⸻

10. PREVENTING RUNAWAY AGENTS
Likely question
“How do you prevent an agent from running forever?”
Talking script
“I wouldn’t rely on a single stopping condition. I’d use independent runtime controls around iterations, tokens or cost, wall-clock time, tool calls, retries and resource consumption.
I’d also detect lack of progress because staying within a token budget doesn’t mean the agent is accomplishing anything.
And I distinguish transient failure from strategy failure. Five unsuccessful attempts using essentially the same strategy aren’t evidence that we need a sixth attempt.”
Controls:
Iterations · tokens/cost · timeout · tool calls · progress · retries · circuit breaker · cancellation · escalation
Strong line
“Repeated failure should eventually change the strategy, not merely increase the retry count.”

⸻

11. FAILURE HANDLING
Use a taxonomy rather than saying “retry.”
￼
Talking script

“The first thing I want to understand is the semantics of the failure.

A timeout might justify retry. Malformed model output might justify repair. Repeated incorrect reasoning might require replanning or a stronger capability. Authorization failure should stop rather than encouraging the agent to find another way around policy.

So failure classification determines recovery behavior.”

Strong line

“Retry behavior should follow failure semantics.”

⸻

12. IDEMPOTENCY & RECOVERY

Likely question

“What happens if the agent creates the PR and then crashes?”

Talking script

“I assume retries and duplicate delivery will eventually happen.

Side-effecting operations therefore need stable idempotency keys, transactional semantics, or an external API that supports idempotent operations.

Otherwise recovering an interrupted execution could create another PR, deploy twice, send duplicate notifications or perform another consequential action.”

Strong line

“Retrying reasoning is cheap. Retrying side effects can be dangerous.”

⸻

13. EXPLICIT STATE MACHINES

Likely question

“How do you manage long-running agent state?”

Think:

QUEUED → RUNNING → WAITING_FOR_TOOL → VERIFYING → SUCCEEDED

Failure transitions:

RUNNING → RETRYING → RUNNING
RUNNING → ESCALATED
RUNNING → FAILED

Talking script

“For production workflows I prefer explicit legal state transitions over trying to infer execution state from conversation history.

That gives us deterministic recovery behavior, idempotency, observability and clear operational semantics.”

Strong line

“Conversation is not a workflow database.”

That’s a keeper.

⸻

14. HOW WOULD YOU BUILD A CODING AGENT?

Likely question

“Design a coding agent.”

Talking script

“I would model it as an iterative repository worker, not one giant code-generation prompt.

It starts with the task and acceptance criteria, retrieves repository context, inspects the relevant implementation, creates a plan, makes a bounded change, executes deterministic verification, observes failures, repairs where justified, and repeats until it either satisfies the acceptance criteria or hits a stopping condition.”

Flow

Task → Context → Inspect → Plan → Edit → Build/Lint → Test → Observe → Repair → Verify → Candidate Change + Evidence

Then:

“The important boundary for me is generation versus verification. The coding agent can generate and repair the implementation, but I don’t want the producer to be the sole judge of its own work.”

⸻

15. BUG-FIXING AGENT — YOUR #1 PRACTICE SCENARIO

If they ask:

“Design an agent that receives a bug report and produces a fix.”

Start with one excellent clarification

“Should the agent’s authority stop at producing a candidate PR, or does it have authority to merge?”

Then:

Goal

Bug → verified candidate fix

Success

Reproduce bug → regression test fails → implement fix → regression test passes → existing tests pass

Context

Issue + acceptance criteria + repo instructions + relevant code/tests/history

Execution

Inspect → Reproduce → Plan → Edit → Test → Observe → Repair

Runtime

Ephemeral sandbox

Controls

Permissions · iterations · cost · timeout · scoped tools

Verification

Deterministic evidence first → semantic verification where necessary

Evidence

Diff · test results · execution trace · findings · provenance

Authority

Candidate PR by default; merge only if policy permits

Learning

Capture review/merge/rejection outcome

Killer verification line

“For a bug fix, I specifically want evidence that the regression test fails before the change and passes afterward. Otherwise I may have produced valid code without demonstrating that I fixed the reported behavior.”

⸻

16. CODE REVIEW AGENT

Likely question

“How would you design an AI code reviewer?”

Flow

Diff → Deterministic Checks → Relevant Context → Semantic Review → Normalize → Deduplicate → Prioritize → Developer → Outcome

Talking script

“I’d separate deterministic verification from semantic review.

Compilation, tests, linting, secret detection and known security rules should happen deterministically first. I don’t want to spend inference rediscovering something a deterministic tool establishes more reliably.

Then I give the semantic reviewer the diff plus the minimum relevant repository context and ask it to identify correctness, architectural, maintainability or domain-specific concerns.

Every finding should use a consistent schema so it can be deduplicated, prioritized and evaluated.”

Finding:

File · line · category · severity · evidence · recommendation · confidence

Strong line

“The objective isn’t maximum findings. It’s maximum useful findings developers trust.”

⸻

17. EVALUATION & VERIFICATION

Likely question

“How do you know whether the agent is actually good?”

Talking script

“Evaluation has to be workload-specific. I use the strongest deterministic evidence available first and probabilistic evaluation where semantic judgment is actually necessary.

For software development that means compilation, tests, integration verification, security and policy checks, acceptance criteria, and then semantic evaluation where deterministic evidence can’t fully establish correctness.”

Hierarchy

Compile → Unit → Integration → Security/Policy → Acceptance Criteria → Semantic Evaluation → Human/Production Outcome

Candidate vs baseline:

Task success · regressions · policy · latency · cost · retries · intervention

Strong lines

“Evaluation is part of the architecture, not merely a test phase.”

“The producer should not be the sole judge of its own work.”

And:

“Aggregate scores aren’t enough. I want failure classes and severity because averages can hide catastrophic regressions.”

⸻

18. OBSERVABILITY & DEBUGGING

Likely question

“How would you debug an agent that intermittently fails?”

Talking script

“With agents, the final output isn’t enough. I need to reconstruct the execution trajectory.

I want to know what goal it received, what context was selected, which model was routed, what actions were proposed, which tools executed, what observations came back, how state changed, where retries occurred, how much execution cost, what verification ran, and why the agent ultimately stopped.”

Capture:

Goal → Context → Route → Model Calls → Tools → Observations → State → Retries → Cost → Verification → Outcome

Distinguish:

Logs — what happened
Metrics — how often/how much
Traces — execution trajectory
Evals — whether behavior was good

Strong line

“Observability tells me what the agent did. Evaluation tells me whether what it did was good.”

⸻

19. MULTI-AGENT SYSTEMS

Likely question

“When would you use multiple agents?”

Talking script

“I start with one agent and add specialization only when the workload earns the additional complexity.

Multiple agents make sense when different parts of the workload require meaningfully different capabilities, context, models, permissions, independent judgment, or parallel execution.

Every additional agent introduces coordination, state transfer, latency, cost and new failure modes, so multi-agent shouldn’t be the default architecture.”

Strong line

“Specialization has to earn its coordination cost.”

20. HOW SHOULD AGENTS COMMUNICATE?

Talking script

“Where possible, I prefer typed artifacts and explicit state over unrestricted natural-language conversations between agents.”

Example:

Planner → Plan
Coder → CandidateChange
Verifier → VerificationResult
**Reviewer


Why typed artifacts matter

“Typed handoffs make the workflow easier to test, observe, recover and evolve independently. They also reduce ambiguity because downstream components receive a defined contract instead of another open-ended conversation.”

Strong line

“Agents do not need to chat endlessly with each other. They can coordinate through explicit artifacts and state.”

⸻

21. PLANNER vs PLAN

Likely question

“How would you handle planning?”

Talking script

“I separate the planner from the plan.

The planner can be probabilistic, model-driven and replaceable. The plan should become a durable, inspectable execution artifact with explicit tasks, dependencies, acceptance criteria, required capabilities and verification requirements.

That lets me recover execution, audit decisions and potentially route different parts of the plan to different capabilities.”

Plan contains

Tasks · dependencies · acceptance criteria · capabilities · constraints · verification requirements

Strong lines

“The planner reasons. The plan becomes governed execution state.”

“A good plan should survive the planner that created it.”

⸻

22. SANDBOXING

Likely question

“How would you safely execute generated code?”

Talking script

“I assume generated code is untrusted until verified, so I would execute it inside an ephemeral, least-privilege sandbox.

The sandbox should constrain filesystem access, network access, compute, credentials, execution time and process lifetime.

Credentials should be scoped and short-lived, and the environment should be disposable after execution.”

Remember

Ephemeral · least privilege · scoped filesystem · network constrained · resource limits · short-lived credentials · observable · disposable

Important distinction

“The sandbox limits blast radius. It does not prove correctness.”

Verification still has to determine whether the output is acceptable.

⸻

23. HUMAN-IN-THE-LOOP & AUTHORITY

Likely question

“Where should humans stay involved?”

Talking script

“I don’t think the right model is human approval at every step. I want human authority based on risk, reversibility, verification strength and blast radius.

If an action is low-risk, reversible and strongly verified, the system can operate with more autonomy.

If an action is consequential, difficult to reverse or weakly verifiable, I want stronger human authority before execution or promotion.”

Simple model

Low risk + reversible + strong evidence → more autonomy

High risk + irreversible + weak evidence → more human authority

Strong line

“Autonomy and authority are different dimensions.”

And:

“The objective is not to remove humans. It is to place human judgment where it has the highest marginal value.”

⸻

24. AUTONOMY LADDER

This gives you a very clean answer if they ask how you would roll out agentic development incrementally.

Level 0 — Suggest

Agent recommends. Human acts.

Level 1 — Act with approval

Agent proposes the action. Human authorizes it.

Level 2 — Bounded execution

Agent executes reversible operations within explicit authority.

Level 3 — Autonomous workflow

Agent completes a workflow and produces verification evidence.

Level 4 — Governed autonomous delivery

The system may promote or deliver when predefined evidence and policy thresholds are satisfied.

Talking script

“I would not make autonomy binary. I would increase it progressively as we establish stronger verification, better observability, greater reversibility and confidence in the workload.”

Strong line

“I increase autonomy because trust increased, not simply because the model got smarter.”

⸻

25. HOW DOES AN AGENT LEARN?

Likely question

“How would the system improve over time?”

Talking script

“Every completed execution produces evidence about the behavior of the system: which route was chosen, what context was useful, which tools succeeded, how many retries occurred, what verification passed, what the human ultimately accepted, and what happened in production.

I use that evidence to generate candidate improvements to routing, prompts, tools, context strategies or harness configuration.

But I separate learning from promotion. The system can autonomously identify a potentially better configuration, but that candidate should be evaluated against a representative baseline and progressively promoted rather than silently replacing the current behavior.”

Loop

Execution → Evidence → Outcome → Evaluation → Candidate Improvement → Qualification → Rollout → New Evidence

Strong line

“Learning can be autonomous. Promotion should be governed.”

⸻

26. HOW WOULD YOU PRODUCTIONIZE A SIMPLE AGENT?

Likely question

“Okay, the prototype works. What do you add for production?”

Do not list 25 technologies. Use categories.

Talking script

“Once the basic behavior works, I would productionize it across five areas.

First is state and recovery: durable state, explicit transitions, idempotency and checkpoints.

Second is security and authority: identity, scoped tools, secrets, policy and sandboxing.

Third is resilience and resource control: timeouts, retries, circuit breakers, concurrency and execution budgets.

Fourth is observability: logs, metrics, traces and cost telemetry.

Fifth is evaluation and rollout: workload-specific evals, baseline comparison, progressive exposure and rollback.

I would add only the controls justified by the workload and risk rather than turning the prototype into a distributed platform immediately.”

Strong line

“Working behavior proves the idea. Production engineering proves we can depend on it.”

⸻

27. HOW WOULD THIS WORK AT ADOBE SCALE?

Likely question

“What changes when this is serving thousands of builders and many repositories?”

Talking script

“The core agent loop does not need to become fundamentally different, but the surrounding platform does.

At enterprise scale I would make workflow state durable, decouple intake from execution through queues, use bounded worker pools and sandbox capacity, enforce admission control and quotas, route workloads by capability and cost, and instrument both reliability and token economics.

I would also classify repositories and workloads because not every environment should have the same permissions, model eligibility, verification requirements or degree of autonomy.

The key is to keep the local agent simple while scaling the control and execution infrastructure around it.”

Strong line

“Scale the platform around the agent before making the agent itself more complicated.”

⸻

28. TOKENOMICS & COST CONTROL

This deserves its own section because of Adobe’s stated focus.

Likely question

“How would you manage model cost?”

Talking script

“I would treat cost as an execution constraint, not just a reporting metric.

Before a model call, the runtime should understand the remaining budget and whether the proposed operation is justified. That budget can influence model selection, context size, optional work, retry behavior and escalation.

After the call, actual usage feeds back into the execution state and the routing evidence.”

Track:

Input tokens · output tokens · cached tokens · model cost · retries · tool cost · total workflow cost

Important distinction

“I would not optimize token consumption in isolation. A cheaper call that lowers success probability and causes multiple retries can increase total cost.”

Strong line

“Budget should influence execution before the bill arrives.”

And your Adobe metric:

“Cost per accepted outcome.”

⸻

29. SINGLE AGENT vs WORKFLOW vs MULTI-AGENT

Likely question

“When do you need an agent versus a deterministic workflow?”

This is a very good question to be ready for.

Talking script

“I use deterministic software wherever the behavior can be specified reliably.

I introduce model reasoning where the task requires interpretation, synthesis or judgment.

And I add agentic iteration only where the system needs to adapt its next step based on observations.

So I don’t start by asking, ‘How many agents should this have?’ I ask which parts actually require probabilistic reasoning and which parts should remain deterministic.”

Simple hierarchy

Known deterministic transformation → normal software

Single judgment → model call

Adaptive multi-step reasoning → agent

Stable multi-stage process → workflow

Different specialized reasoning/authority → potentially multi-agent

Strong line

“Agentic should be applied where uncertainty requires reasoning, not where ordinary software already works better.”

This is a very strong engineering judgment answer.

⸻

30. DETERMINISTIC WORKFLOW vs AGENTIC LOOP

Likely question

“Would you make the entire pipeline agentic?”

Talking script

“No. I would combine deterministic workflow structure with agentic nodes.

For example, the high-level delivery sequence—intake, execute, verify, approve—can be deterministic. Inside the execution node, an agent may inspect code, choose tools and iterate based on observations.

That gives me adaptability where I need reasoning while preserving predictable control flow where the process is known.”

Strong line

“Use deterministic structure around probabilistic reasoning.”

This is one of the most useful lines in the whole prep.

⸻

31. HOW WOULD YOU TEST AN AGENT HARNESS?

Likely question

“How do you test the harness itself?”

Talking script

“I would test the harness separately from model quality.

The harness has deterministic responsibilities: honoring iteration limits, rejecting invalid actions, enforcing budgets, dispatching tools correctly, persisting state, handling failures and respecting stopping conditions.

I can test those using mocked model outputs and deterministic tool responses.

Then separately I evaluate the actual model behavior against workload scenarios.”

Harness tests

Valid action executes
Malformed action rejected
Unknown tool rejected
Unauthorized tool rejected
Iteration limit stops
Budget exhaustion stops
Transient failure retries
Terminal failure does not retry
Checkpoint/resume works

Strong line

“I don’t need a nondeterministic model call to test deterministic runtime behavior.”

⸻

32. HOW WOULD YOU TEST CONTEXT RETRIEVAL?

Likely question

“How do you know your context strategy is good?”

Talking script

“I would evaluate context based on whether it improves downstream task success, not simply retrieval similarity.

Retrieval precision matters, but the real question is whether the selected context helped the agent make the correct decision with acceptable cost and latency.”

Measure:

Relevant-context recall · irrelevant-context rate · task success · latency · token overhead · groundedness

Then ablate:

Without context vs with context

Strategy A vs strategy B

Strong line

“Retrieval quality is ultimately an outcome question.”

⸻

33. WHAT IF THE MODEL HALLUCINATES A TOOL?

Likely question

“The agent asks for a tool that doesn’t exist. What happens?”

Talking script

“The tool request fails schema or registry validation before execution.

I return a structured observation telling the agent that the requested capability is unavailable. Depending on the workload, it can choose another qualified tool or stop.

What I would not do is dynamically grant or invent a capability simply because the model requested it.”

Strong line

“The model can request capabilities. The platform defines what capabilities actually exist.”

⸻

34. WHAT IF THE AGENT KEEPS CHANGING THE SAME FILE?

Likely question

This tests progress detection.

Talking script

“I would look for evidence of non-progress rather than just counting iterations.

That could include repeated identical failures, oscillating diffs, repeated edits to the same region without improved verification, or the same tool sequence producing the same result.

Once that threshold is crossed, I would replan, reroute to a stronger capability or escalate.”

Strong line

“Iteration count tells me how long we’ve been trying. Progress detection tells me whether trying is still rational.”

⸻

35. SHOULD THE SAME AGENT VERIFY ITS OWN WORK?

Likely question

Talking script

“It can perform local self-checks because they’re useful for fast iteration, but I would not treat those as the sole promotion signal for consequential work.

I prefer independent deterministic verification where possible and independent semantic evaluation where judgment is required.

Independence doesn’t necessarily mean another frontier model. It can mean a test suite, compiler, security scanner, policy engine or separately qualified verifier.”

Strong line

“Self-reflection can improve generation. Independent evidence should establish trust.”

⸻

36. AGENT SKILLS vs TOOLS

Likely question

“What do you mean by a skill?”

Talking script

“I use tool for an executable external capability, while a skill is a reusable procedure or behavior that teaches the agent how to accomplish a class of tasks.

A skill might combine instructions, context rules, tool usage patterns and acceptance criteria.

The distinction matters because a tool gives the agent something it can execute; a skill gives it a repeatable way to reason and act.”

Example:

Tool: run tests
Skill: diagnose failing unit tests and produce a minimal repair

Strong line

“Tools provide capabilities. Skills provide reusable behavior.”

⸻

37. CAPABILITY REGISTRY

Likely question

“How would the system know which agents/tools/models are available?”

Talking script

“I would expose them as qualified capabilities with metadata rather than hardcoding every route.

The registry can describe capability type, version, owner, permissions, supported workloads, constraints and evaluation history.

Routing then selects among qualified capabilities rather than blindly selecting by name.”

Strong line

“Registration says a capability exists. Qualification says where I trust it to run.”

Very strong for Adobe.

⸻

38. VERSIONING AGENTS

Likely question

“How do you version an agent?”

Talking script

“I don’t think of the model alone as the agent version.

Behavior can change because of the model, system instructions, skills, tool versions, context strategy, routing policy or harness configuration.

So I want the deployable agent configuration represented as an explicit versioned artifact that I can evaluate, reproduce and roll back.”

Version dimensions:

Model · prompt/instructions · skills · tools · retrieval/context · harness config · policy

Strong line

“If I can’t reconstruct what executed, I can’t meaningfully evaluate or roll it back.”

⸻

39. REPRODUCIBILITY IN PROBABILISTIC SYSTEMS

Likely question

“Can agent runs really be reproducible?”

Talking script

“I distinguish exact output reproducibility from execution reproducibility.

I may not be able to guarantee the model emits the identical tokens every time, but I can record the exact inputs, model route, configuration, context, tools, state transitions and evidence so I can reproduce the execution conditions and analyze why behavior changed.”

Strong line

“Probabilistic outputs don’t remove the need for deterministic provenance.”

⸻

40. LONG-RUNNING AGENTS

Likely question

“How would you support an agent that runs for hours?”

Talking script

“I would not keep authoritative progress only inside one process or one context window.

Long-running work needs durable checkpoints, resumable workflow state, leases or ownership semantics, cancellation, heartbeats and bounded execution slices.

Each slice should be able to reconstruct the minimum context it needs from durable state and continue.”

Strong line

“Long-running autonomy requires resumability, not infinitely long sessions.”

⸻

41. CONCURRENCY

Likely question

“What if many agent tasks can run at once?”

Talking script

“Dependency-ready tasks can execute concurrently, but I want bounded concurrency rather than launching everything.

The scheduler should account for model quotas, sandbox capacity, repository contention, external API limits and cost budgets.”

Strong line

“Parallelizable does not mean unlimited parallelism.”

⸻

42. REPOSITORY CONFLICTS

Likely question

“What if two agents change the same repository at the same time?”

Talking script

“I would make repository coordination explicit.

Depending on the workload, that might mean isolated branches or worktrees, optimistic concurrency with base revision checks, file-level leases for high-contention operations, or rebase-and-reverify before publication.

The important thing is that one agent’s verification evidence becomes stale if another change invalidates the assumptions it was verified against.”

Strong line

“Verification is valid against a specific candidate state, not forever.”

This connects beautifully with your evidence thinking.

⸻

43. AGENT SECURITY MODEL

Likely question

“What’s your security model for coding agents?”

Use four boundaries:

Identity — who initiated the work?
Authority — what may this run do?
Isolation — where may execution occur?
Evidence — what proves what occurred?

Talking script

“I don’t give the model ambient enterprise credentials.

The run should receive only the short-lived authority required for its task, tools should enforce their own authorization, execution should occur in an isolated environment, and consequential actions should produce auditable evidence.”

Strong line

“The agent should inherit task-scoped authority, not user-wide ambient power.”

⸻

44. PROMPTS AS SOFTWARE

Likely question

“How do you manage prompts?”

Talking script

“For production agents, I treat instructions as versioned software artifacts.

Changes should go through review, evaluation and controlled rollout because a prompt change can materially alter system behavior even if no conventional source file changes.”

Strong line

“If changing it can change production behavior, it belongs in the engineering lifecycle.”

⸻

45. WHAT SHOULD BE DETERMINISTIC?

If you get a broad question, this answer is excellent.

Keep deterministic when possible

Identity
authorization
policy
budget enforcement
state transitions
schema validation
tool dispatch
dependency tracking
verification gates
promotion rules

Use models where useful

Interpretation
planning
semantic code understanding
generation
repair
classification under ambiguity
semantic review

Strong line

“Use models for judgment. Use software for enforcement.”

Memorize that.

⸻

46. THE THREE LAYERS OF A PRODUCTION AGENTIC SYSTEM

This is useful if they ask you to sketch the architecture.

INTELLIGENCE

Models · agents · planners · skills · context

EXECUTION

Harness · tools · runtime · sandboxes · state · orchestration

CONTROL

Identity · authorization · budgets · policy · verification · evidence

Talking script

“I mentally separate intelligence, execution and control. That prevents us from asking the model to perform responsibilities that deterministic infrastructure should own.”

Strong line

“Intelligence proposes. Execution performs. Control governs.”

⸻

47. FULL SCENARIO — CODE REVIEW AGENT

If they ask you to walk through it end to end:

Input

PR + diff + repository identity

Context

Changed files + neighboring code + relevant tests + architecture rules

Deterministic first

Compile · lint · tests · SAST · secrets

Semantic review

Correctness · architecture · missing cases · maintainability

Findings

Typed structure with evidence/confidence

Verify

Deduplicate · validate file/line · threshold

Deliver

Useful findings to developer

Learn

Accepted/rejected comment + downstream defects

Controls

Token budget · repository policy · tool scopes · timeout

Strong closing

“Over time I want the system learning which findings developers actually act on, because the goal is not AI activity. The goal is better engineering outcomes.”

⸻

48. FULL SCENARIO — FEATURE IMPLEMENTATION AGENT

Goal

Implement acceptance criteria.

Steps

Requirement → Plan → Context → Implement → Compile → Test → Repair → Verify → PR

Add

dependency graph if multiple tasks
parallelization where safe
human checkpoint when design ambiguity is high

Talking script

“For feature work I care about acceptance criteria being explicit before execution begins. Otherwise the agent can successfully write code without having a stable definition of done.”

Strong line

“Agent autonomy is only useful when success is well specified or verifiable.”

⸻

49. FULL SCENARIO — LARGE REFACTOR

This could impress them if asked.

Talking script

“A large refactor is different from a small coding task because the unit of verification becomes critical.

I would decompose it into independently verifiable slices, establish invariants that must remain true, progressively execute those slices, and continuously rebase verification against the evolving candidate.”

Think:

Objective → Plan/DAG → Slice → Execute → Verify → Integrate → Reverify

Strong line

“Large autonomous changes become manageable when you reduce them to small independently verifiable units.”

⸻

50. FULL SCENARIO — AGENT GENERATES BAD CODE DESPITE PASSING TESTS

Likely challenge

“What if all tests pass but the code is still poor?”

Talking script

“Passing tests establish some correctness properties, but they don’t establish every desirable property.

Depending on the workload I might also require security analysis, architectural rules, performance validation, static analysis and semantic review.

More importantly, that gap is evidence that our verification contract is incomplete. I would improve the acceptance criteria or verifier rather than just tell the coding agent to ‘try harder.’”

Strong line

“When bad output passes the gate, improve the gate.”

Excellent line.

⸻

51. YOUR ANSWERING METHOD DURING THE INTERVIEW

Do not dump everything you know.

For any scenario:

Step 1 — Clarify the outcome

“What’s the terminal outcome and authority level?”

Step 2 — Define success

“What evidence tells us it’s done?”

Step 3 — Describe the smallest execution loop

“Context → reason → action → observation.”

Step 4 — Add the highest-risk controls

“Tools, budget, sandbox, state.”

Step 5 — Verification

“How do we independently establish success?”

Step 6 — Only then scale it

“Here’s what changes in production or at Adobe scale.”

That is the pattern Vishal and Anirudh should experience from you repeatedly.

⸻

52. PLAYER-COACH LANGUAGE FOR THIS ROUND

Use:

“I’d start with the simplest version of that responsibility.”

“I see two reasonable choices here.”

“The tradeoff I’m making is…”

“I’d keep that deterministic rather than ask the model to decide it.”

“Before adding another agent, I’d want evidence that specialization improves the outcome.”

“The model can propose that; I wouldn’t give it authority to enforce it.”

“I’d want to test this responsibility independently from model quality.”

“That’s where I’d introduce a durable artifact rather than rely on conversation state.”

These make you sound like someone building the system beside them.

⸻

53. QUESTIONS YOU SHOULD ASK THEM DURING A SCENARIO

Use only one or two, not an interrogation.

Good clarifiers:

“What is the terminal outcome—recommendation, candidate PR, or merge?”

“Should I assume one repository or many?”

“Do we want the interview version or should I include production constraints as I go?”

“Are tools already trusted/registered, or should authorization be part of the design?”

“Is latency important here, or should I prioritize quality?”

These questions materially affect the design.

⸻

54. QUESTIONS NOT TO WASTE TIME ASKING

Avoid excessive questions such as:

What database?
What cloud?
What queue technology?
What exact model?
Kubernetes or ECS?
REST or gRPC?

Unless they directly affect the problem.

You can say:

“I’ll keep the infrastructure implementation-neutral unless there’s a constraint you want me to optimize for.”

Excellent.

⸻

55. THE 15 QUESTIONS TO KNOW COLD

￼
56. THE DISTINCTIONS YOU NEED TO KNOW COLD

MODEL vs AGENT

Model provides reasoning. Agent pursues an objective across steps.

AGENT vs HARNESS

Agent determines behavior. Harness manages iterative execution mechanics.

HARNESS vs RUNTIME

Harness governs the loop. Runtime supplies the environment/resources.

AGENT vs WORKFLOW

Agent adapts actions through reasoning. Workflow defines known coordination.

CONTEXT vs MEMORY

Context is active working information. Memory persists information for later retrieval.

MEMORY vs STATE

Memory helps reasoning. State is authoritative progress.

TOOL vs SKILL

Tool provides executable capability. Skill provides reusable behavior.

AUTONOMY vs AUTHORITY

Ability to act independently ≠ permission to perform every action.

GENERATION vs VERIFICATION

Producing output ≠ establishing correctness.

OBSERVABILITY vs EVALUATION

What happened ≠ whether it was good.

LEARNING vs PROMOTION

Discovering a better configuration ≠ permission to deploy it.

SANDBOX vs VERIFICATION

Limiting blast radius ≠ proving correctness.

⸻

57. YOUR 60-SECOND MEMORY MAP

AGENT
Goal → State → Decide → Act → Observe → Repeat/Stop

HARNESS
Context · loop · tools · state · budgets · termination

RUNTIME
Environment · isolation · resources

CONTEXT
Right information for the current decision

MEMORY
Persist selectively → retrieve when relevant

TOOLS
Request ≠ authorization

OUTPUT
Probabilistic → schema → deterministic boundary

FAILURE
Retry · repair · replan · reroute · stop · escalate

STATE
Explicit · durable · recoverable

SANDBOX
Limit blast radius

VERIFICATION
Producer ≠ sole judge

EVALS
Baseline → candidate → failures → outcome

ROUTING
Requirements → qualification → quality → cost

MULTI-AGENT
Specialization must earn coordination cost

OBSERVABILITY
Trace the execution trajectory

AUTHORITY
Autonomy increases with trust and reversibility

LEARNING
Evidence → improve → qualify → promote

⸻

58. THE 10 LINES I WANT YOU TO MEMORIZE

“Use models for judgment. Use software for enforcement.”
“The model proposes. Deterministic systems authorize and execute.”
“Tool discovery does not imply tool authority.”
“Context can influence reasoning. It should not redefine authority.”
“Conversation is not a workflow database.”
“The producer should not be the sole judge of its own work.”
“Specialization has to earn its coordination cost.”
“Observability tells me what happened. Evaluation tells me whether it was good.”
“I optimize for cost per accepted outcome.”
“Learning can be autonomous. Promotion should be governed.”

⸻

59. YOUR FINAL DEFAULT ANSWER STRUCTURE

When Vishal or Anirudh gives you any agentic software-development problem, mentally run:

GOAL

What are we actually delivering?

CONTEXT

What does the agent need to make the next decision?

ACTION

What model, skill or tool performs the work?

CONTROLS

What authority, budget, state and failure limits apply?

VERIFICATION

What independent evidence establishes success?

Then:

EVIDENCE

What should survive the execution?

LEARNING

What outcome should improve future decisions?

You don’t need to say every heading. It should simply structure how you think.

⸻

60. YOUR CLOSING MINDSET FOR THIS ROUND

Do not try to convince them you know every agent framework.

Your advantage is engineering judgment.

You want Vishal and Anirudh to leave thinking:

“Jay understands what should be probabilistic and what should stay deterministic. He understands agents as production software systems, not demos. He knows where state, tools, security, verification, economics and human authority belong. And he can simplify the architecture rather than overcomplicate it.”

The mindset to carry into the round is:

“Start with the outcome. Keep the agent simple. Make boundaries explicit. Keep authority outside the model. Verify independently. Add autonomy only as trust earns it.”

That is the version I would study.
