---
title: "ADOBE META FACTORY — ARCHITECTURE & SYSTEM DESIGN STUDY GUIDE"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p8464
captured_at: 2026-09-07T21:36:03.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: f05cc210a343ceb5b88770421392fa77c81ed32bc910f6bbf3d54d438a215ac2
---

ADOBE META FACTORY — ARCHITECTURE & SYSTEM DESIGN STUDY GUIDE

￼

What this round is testing

This is not a test of how many AI buzzwords you can fit on a whiteboard. The interviewers are testing whether you can take an ambiguous enterprise problem and make clear architectural decisions.

For almost every system-design question, demonstrate:

Requirements → Scale → Architecture → Trust Boundaries → Reliability → Economics → Evaluation → Tradeoffs → Rollout

Your default opening:

“Before I design the architecture, I want to clarify the builder, desired outcome, scale, trust boundaries, and success criteria, because those should drive the design.”

Your default architecture:

Builder Intent → Planning → Capability/Model Routing → Control Plane → Durable Orchestration → Context Intelligence → Secure Execution → Verification → Evidence → Human Authority → Delivery → Outcome → Learning

⸻

1. DESIGN META FACTORY

QUESTION

“How would you design Adobe Meta Factory?”

TALKING SCRIPT

“I’d start with the builder and the outcome, not with the model or agent framework.

The builder should be able to express an objective, constraints, and acceptance criteria without needing to understand which model, agent, skill, or MCP server should execute the work.

From there, I’d separate the architecture into several major responsibilities.

First is the control plane. That owns identity, authorization, policy, durable state, scheduling, budgets, observability, and lifecycle management.

Second is the orchestration layer. It interprets intent, decomposes work, resolves dependencies, selects capabilities, and manages the execution loop.

Third is context and code intelligence. That provides the minimum high-value repository and enterprise context required for the task.

Fourth is model and capability routing. Instead of sending everything to the largest model, we select capabilities based on quality, workload, latency, security, reliability, and cost.

Fifth is bounded execution. Agents operate inside isolated, ephemeral environments with explicit repository, tool, network, credential, compute, time, and token boundaries.

Then comes verification. Tests, security scanning, policy validation, code review, and independent evaluation produce evidence about whether the result is actually acceptable.

Humans retain authority over consequential decisions such as acceptance, merge, and release.

Finally, production outcomes feed a learning system that can propose improvements to routing, skills, prompts, context strategies, tools, and evaluations.

But those changes don’t silently promote themselves.

Learning can be autonomous. Promotion should be governed.

So I think about Meta Factory as the system governing the complete path from builder intent through execution, evidence, verification, approval, release, outcome, and learning.”

⸻

2. WHAT BELONGS IN THE CONTROL PLANE?

QUESTION

“What does the control plane own?”

TALKING SCRIPT

“I want the control plane separated from agent execution.

The control plane owns the things required to govern the lifecycle: identity, authorization, policy, job scheduling, durable state, execution leases, budgets, model access, telemetry, audit history, approvals, and lifecycle controls.

Agents execute in isolated workers underneath it.

That separation matters because if an agent crashes, enters an infinite loop, exhausts its context, or starts behaving incorrectly, the system responsible for stopping it cannot depend on that agent remaining healthy.

The worker can fail.

The control plane still needs to know who owns the execution, what it’s authorized to do, how much budget remains, what state has been persisted, and whether the run should continue, recover, or terminate.”

KEY LINE

“The system governing the agent must remain healthy when the agent itself is unhealthy.”

⸻

3. CONTROL PLANE VS. EXECUTION PLANE

QUESTION

“Why separate the control plane from the worker fleet?”

TALKING SCRIPT

“Because I don’t want probabilistic execution to own its own governance.

The control plane is authoritative. It owns policy, identity, durable state, budgets, scheduling, and lifecycle.

The execution plane is disposable. Workers receive bounded authority, execute the task, produce artifacts and evidence, and disappear.

That means I can kill or replace a worker without losing the authoritative state of the workflow.

It also gives me a much cleaner security boundary.”

⸻

4. HOW WOULD YOU DESIGN THE AGENT HARNESS?

QUESTION

“What should an enterprise agent harness actually do?”

TALKING SCRIPT

“I think of the harness as where probabilistic reasoning meets deterministic control.

The model can propose what should happen next.

The harness determines what context it receives, what tools it can invoke, what permissions apply, what state persists, how much budget is available, how retries work, where execution occurs, what evidence must be produced, and when the system stops or escalates.

I would expect a production harness to provide durable state, context management, tool orchestration, policy enforcement, checkpointing, recovery, budget controls, observability, evaluation hooks, and human-intervention points.

The simplest way I remember it is:

The model reasons. The harness controls.”

⸻

5. SHOULD ADOBE BUILD ITS OWN HARNESS?

QUESTION

“Adobe has roughly 15,000 engineers. Should we build our own agent harness?”

TALKING SCRIPT

“I wouldn’t begin with the assumption that Adobe should build one.

I’d begin with where Adobe actually differentiates.

Models are increasingly interchangeable. Generic coding and orchestration capabilities are also becoming more commoditized.

So I would benchmark the leading external and open capabilities against Adobe’s actual builder workflows before making the decision.

Where I think Adobe is much more likely to differentiate is the Builders Experience, enterprise context, secure execution, identity and policy integration, evaluation, repository intelligence, capability routing, learning, and integration with Adobe’s engineering ecosystem.

My preference would therefore be a thin Adobe-owned control plane around replaceable underlying capabilities wherever possible.

I don’t want us rebuilding commodity technology simply because we can.

Proprietary should be an outcome of differentiation, not an architectural preference.”

⸻

6. HOW DO YOU KEEP META FACTORY MODEL-INDEPENDENT?

QUESTION

“How would you design model independence?”

TALKING SCRIPT

“The model should sit behind a capability interface, not define the architecture.

The platform owns state, tools, context, policy, execution, evaluation, and observability.

Models become execution resources selected according to workload requirements.

That lets us change providers without rebuilding the factory.

But model independence doesn’t mean pretending every model behaves identically. Different models have different tool-use patterns, context behavior, reasoning strengths, latency, economics, and failure modes.

So I’d separate the stable platform contract from model-specific adapters and capability metadata.

That gives us independence without reducing everything to the lowest common denominator.”

KEY LINE

“Model-independent doesn’t mean model-unaware.”

⸻

7. DESIGN MODEL ROUTING

QUESTION

“How would you decide which model handles a task?”

TALKING SCRIPT

“I wouldn’t route purely on a static complexity score.

I’d treat routing as an optimization problem across task type, required capability, historical evaluation performance, context requirements, security policy, latency, reliability, availability, and cost.

The important part is that the router itself needs a feedback loop.

Every completed workload produces evidence: quality, retries, latency, token usage, verification results, human corrections, and whether the outcome was ultimately accepted.

That gives us workload-specific evidence for improving routing over time.

And the metric I care about isn’t simply cost per token or even cost per run.

It’s cost per accepted outcome.”

FOLLOW-UP

“Would you always use a smaller model when it’s cheaper?”

“No. A cheaper inference that creates additional retries, bad code, more human review, or a failed outcome can be substantially more expensive.

That’s why I optimize the complete outcome rather than the individual inference.”

⸻

8. TOKENOMICS

This is a high-priority Adobe topic because Shibu explicitly identified it as one of ABX’s early architectural priorities.

QUESTION

“How would you reduce token costs?”

TALKING SCRIPT

“I’d attack token economics across the entire execution path rather than just negotiate a lower model price.

First is routing. Don’t send every workload to the most expensive reasoning model.

Second is context engineering. Retrieve the minimum sufficient context rather than repeatedly injecting enormous payloads.

Third is deterministic execution. If something can be reliably handled by code, a compiler, a query, or an existing tool, don’t spend inference on it.

Fourth is caching and reuse, particularly around stable context and repeated computation.

Fifth is loop efficiency. Repeated failed attempts can destroy the economics of an otherwise inexpensive model.

And finally I’d instrument everything so we understand token consumption relative to successful outcomes.

Again, my north-star metric would be cost per accepted outcome, segmented by workflow.”

⸻

9. DESIGN SECURE REMOTE AGENT EXECUTION

QUESTION

“How would you safely allow Adobe engineers to delegate work to cloud agents?”

TALKING SCRIPT

“I’d treat remote execution as a fundamentally different trust boundary from an agent running interactively beside an engineer.

Each task gets an ephemeral, identity-bound sandbox created from a defined execution manifest.

The worker receives only the repository scope, credentials, tools, network destinations, compute, time, and token budget necessary for that particular task.

Credentials should be short-lived. Network egress should be restricted. Repository and potentially file-level writes should be scoped. Tools should require explicit authorization. Resource and token limits should be enforced outside the agent.

Every consequential action produces an auditable event and evidence.

When execution finishes, the environment is destroyed.

And I would not give the agent direct authority to merge or release simply because its tests passed.

The sandbox shouldn’t just isolate compute. It should bound authority.”

⸻

10. WHAT HAPPENS WHEN AN AGENT GETS STUCK?

QUESTION

“How do you prevent infinite agent loops?”

TALKING SCRIPT

“I would use multiple bounded controls rather than one arbitrary retry counter.

Every execution has time, token, tool-call, compute, and iteration budgets.

More importantly, the runtime should classify failure.

A transient network failure may justify retrying.

Repeating the same reasoning failure with essentially the same state probably doesn’t.

We need circuit breakers, progress detection, stop conditions, fallback strategies, and human escalation.

And the authoritative budget belongs in the control plane, not inside the agent’s prompt.

The agent shouldn’t be responsible for deciding whether it has spent too much money.”

⸻

11. CONTEXT ENGINEERING FOR 100,000+ REPOSITORIES

QUESTION

“How would you provide useful code context across Adobe’s repository landscape?”

TALKING SCRIPT

“I wouldn’t dump repositories into context windows and call that context engineering.

At Adobe’s scale, context resolution needs to be structural, hierarchical, permission-aware, and workload-specific.

I’d combine code search with symbol indexes, dependency relationships, ownership metadata, repository instructions, architecture decisions, historical changes, tests, documentation, and semantic retrieval where it adds value.

Context should also be layered.

Adobe-wide engineering standards can exist at one level.

Product and language-specific knowledge exists beneath that.

Repository-specific architecture and history exist beneath that.

And task-specific context is assembled at runtime.

The objective isn’t maximum context.

It’s the minimum sufficient high-value context required to make the correct decision.”

⸻

12. RAG VS. FINE-TUNING VS. CPT

QUESTION

“Would you use RAG, fine-tuning, or continual pretraining?”

TALKING SCRIPT

“I don’t think that’s one decision for the whole platform.

Dynamic, permission-sensitive, frequently changing knowledge is generally better kept outside model weights and retrieved when needed.

Stable behavioral patterns that repeatedly consume context or aren’t being solved effectively through prompting and retrieval may justify fine-tuning.

Continual pretraining becomes interesting when there’s a sufficiently large, stable domain corpus and evaluation demonstrates that incorporating that knowledge into the model materially improves the economics or quality.

I’d start with the least irreversible mechanism and let evaluation justify moving deeper.

Retrieval is relatively easy to update and reverse.

Model-weight changes carry a different operational burden.”

KEY LINE

“Use the least irreversible mechanism that meets the quality bar.”

⸻

13. DESIGN CODE REVIEW FOR ADOBE

QUESTION

“How would you design code review across 100,000+ repositories?”

TALKING SCRIPT

“I would not try to build one giant Adobe-specific reviewer that understands every repository.

I’d build a common review platform with progressively specialized context, policy, skills, and evaluation.

At the Adobe level, we have enterprise security requirements, common engineering policies, shared review infrastructure, models, observability, and evaluation.

At the product level, we add language, framework, architecture, and product-specific standards.

At the repository level, we add ownership, repository instructions, dependency information, historical accepted review findings, prior changes, tests, and local conventions.

That lets the execution infrastructure remain standardized while the actual review becomes highly repository-specific.

The platform stays common. The intelligence becomes progressively more specific.”

⸻

14. WHY NOT JUST BUY A CODE REVIEWER?

QUESTION

“Why should Adobe build a code-review agent instead of using an existing product?”

TALKING SCRIPT

“I wouldn’t assume Adobe should.

I’d establish a representative benchmark across Adobe’s repository distribution and evaluate external capabilities first.

If a commercial reviewer gives us excellent generic review, I would rather adopt that capability and invest Adobe engineering effort in what actually differentiates us: Adobe-specific context, policy, repository learning, security integration, evaluation, orchestration, and builder experience.

If the benchmark shows a meaningful capability gap that matters strategically, then we have evidence supporting a build decision.

Adopt commodity. Build differentiation.”

⸻

15. HOW DOES A REPOSITORY LEARN?

QUESTION

“How would you build repository-specific learning?”

TALKING SCRIPT

“I would separate memory, learning, and promotion.

Memory means retrieving useful historical repository information at runtime.

Learning means analyzing outcomes such as accepted and rejected findings, author corrections, merged changes, reviewer feedback, incidents, and rollbacks.

Those signals can generate candidate improvements to skills, prompts, retrieval strategies, routing, policies, or evaluations.

Then promotion is a separate process.

Candidate behavior gets compared against the current baseline using repository-specific and global evaluations.

Only improvements that meet the required quality and safety bar get promoted.

I wouldn’t start by fine-tuning a separate model for every repository.

I’d start with repository context and versioned skills because they’re cheaper, explainable, reversible, and easier to govern.”

⸻

16. DESIGN THE SELF-CORRECTION LOOP

QUESTION

“How does an agent fix its own mistakes?”

TALKING SCRIPT

“After implementation, deterministic verification runs first wherever possible.

Compile.

Lint.

Unit tests.

Integration tests where appropriate.

Security checks.

Policy checks.

If something fails, the runtime captures the failure evidence and determines whether another attempt is justified.

If so, the relevant failure evidence goes back into the next execution context.

But this is bounded by budget and progress.

I don’t want ‘recursive improvement’ to mean ‘keep asking the model until something passes.’

Eventually the system must succeed, choose a different strategy, escalate, or stop.”

⸻

17. DESIGN VERIFICATION

QUESTION

“How do you know agent-generated code is correct?”

TALKING SCRIPT

“I don’t think one verifier answers that question.

I’d layer verification.

Deterministic verification handles things like compilation, tests, static analysis, policy, schemas, and security scanning.

Semantic evaluation handles requirements that aren’t reducible to deterministic assertions.

Independent review examines architecture, behavior, and potentially adversarial conditions.

And the evidence is evaluated against the acceptance criteria defined at the beginning of the workflow.

Most importantly, I don’t want the producing agent to be the sole authority deciding whether its own work is correct.

Production and verification should be independently accountable.”

⸻

18. WHAT IS THE EVIDENCE PLANE?

QUESTION

“What evidence would you preserve from an agent run?”

TALKING SCRIPT

“Enough to reconstruct why the system made the decision it made.

I want the original intent and acceptance criteria, plan, execution manifest, model and version, relevant context provenance, tool invocations, state transitions, code changes, test results, security results, evaluation scores, approvals, token and cost telemetry, and final outcome.

That evidence supports debugging, auditability, evaluation replay, compliance, rollback, and learning.

The final code isn’t enough to understand an autonomous system.

The trajectory is part of the artifact.”

⸻

19. DESIGN THE EVALUATION PLATFORM

QUESTION

“How would you evaluate Meta Factory?”

TALKING SCRIPT

“I’d evaluate at multiple levels.

Component evaluations test retrieval, routing, tool use, skills, and model behavior.

Trajectory evaluations examine whether the agent took an effective path.

Outcome evaluations determine whether the actual builder objective was achieved.

Policy evaluations determine whether execution stayed within authorized boundaries.

And system metrics cover reliability, latency, cost, retries, and human intervention.

Before changing a model, router, harness, skill, prompt, context strategy, or policy, I’d replay representative workloads against the candidate and baseline.

The evaluation corpus should combine curated golden cases with historical production trajectories and real failure cases.

Evaluation isn’t a test phase. It’s part of the architecture.”

⸻

20. DESIGN THE LEARNING LOOP

QUESTION

**“How does Meta Factory improve
20. DESIGN THE LEARNING & SELF-IMPROVEMENT LOOP

QUESTION

“How does Meta Factory improve over time?”

TALKING SCRIPT

“I separate learning from promotion.

Every execution produces signals: task success, verification results, traces, human corrections, accepted and rejected code reviews, incidents, rollbacks, latency, token consumption, and cost.

The learning system analyzes those signals and identifies patterns. Maybe a particular skill consistently fails on a certain repository type. Maybe the router is sending Java refactoring tasks to a model that costs more without producing better outcomes. Maybe retrieval is repeatedly missing a particular class of context.

From those observations, the system can propose candidate changes to routing, prompts, skills, context strategies, tools, agent definitions, policies, or evaluations.

But I would not let those changes silently modify production behavior.

The candidate gets evaluated against the existing baseline using representative workloads. We measure quality, safety, reliability, cost, and regressions.

If it clears the promotion criteria, we can progressively roll it out. If not, we reject it.

That’s why I use the phrase:

Learning can be autonomous. Promotion should be governed.”

⸻

21. RLHF VS. RLAIF VS. RUNTIME SELF-IMPROVEMENT

QUESTION

“How is your feedback loop different from RLHF?”

This is important because Shibu already probed you here.

TALKING SCRIPT

“I would separate them because they’re different layers of the system.

RLHF uses human preference signals as part of training or adapting model behavior.

RLAIF uses AI-generated feedback or preferences in a similar model-improvement process.

What I’m primarily describing for Meta Factory is an engineering-system learning loop around the model, rather than retraining the foundation model itself.

We observe production trajectories and outcomes and use that evidence to improve things like routing, prompts, skills, context strategies, tool selection, agent definitions, and evaluations.

There may absolutely be places where specialists use preference learning, fine-tuning, or reward models. But I wouldn’t conflate that with runtime platform improvement.

My deepest experience is in the system around the model, where production evidence becomes candidate improvements and evaluation determines whether those changes should be promoted.”

KEY DISTINCTION

RLHF / RLAIF: primarily changes model behavior.

Factory learning: can change system behavior.

KEY LINE

“The model can learn, but the factory can learn too. They’re different systems.”

⸻

22. WHAT SHOULD BE DETERMINISTIC VS. AGENTIC?

QUESTION

“Where should we use an LLM versus traditional automation?”

TALKING SCRIPT

“I use models where the problem contains ambiguity, interpretation, reasoning, planning, or synthesis.

I use deterministic systems wherever the desired behavior is known and reproducible.

So understanding an ambiguous builder request may require a model.

Deciding whether code satisfies a nuanced architectural requirement may require semantic reasoning.

But compiling code doesn’t.

Checking a schema doesn’t.

Running a unit test doesn’t.

Enforcing a permission doesn’t.

Performing a known API operation usually doesn’t.

A software factory should therefore combine probabilistic reasoning with deterministic execution.

I don’t spend intelligence where determinism gives me a safer and cheaper answer.”

⸻

23. DESIGN DURABLE EXECUTION

QUESTION

“What happens if a worker crashes halfway through a two-hour task?”

TALKING SCRIPT

“I don’t want the workflow’s authoritative state living only inside the worker.

The control plane persists durable workflow state, while the worker is treated as replaceable execution capacity.

At meaningful boundaries, the system records checkpoints and artifacts: completed tasks, tool results, repository state, execution metadata, and evidence.

If the worker disappears, its lease eventually expires.

Another worker can acquire the work, reconstruct the approved execution context from persisted state, and resume from a safe boundary rather than blindly restarting everything.

The difficult part is ensuring actions are idempotent so recovery doesn’t create duplicate side effects.

That’s why I’d design durable state, leases, checkpointing, idempotency, and replay semantics together rather than adding recovery afterward.”

MISSION CONTROL CONNECTION

If useful:

“That’s something I’ve explored directly in Mission Control with durable workers, leases, sequenced events, attempt-specific execution, and evidence publication.”

⸻

24. HOW WOULD YOU HANDLE STATE?

QUESTION

“What state needs to persist?”

TALKING SCRIPT

“I’d separate several types of state.

Workflow state tells us where we are in the execution graph.

Task state tells us whether individual work units are queued, running, blocked, failed, or complete.

Agent state contains execution-specific reasoning context where persistence is appropriate.

Artifact state covers code changes, patches, test outputs, and generated evidence.

Approval state records human or policy decisions.

And budget state tracks tokens, compute, time, and other execution limits.

The important design principle is that the durable source of truth lives outside ephemeral workers.”

⸻

25. HOW WOULD YOU HANDLE CONCURRENCY?

QUESTION

“What if thousands of builders start agent runs simultaneously?”

TALKING SCRIPT

“I’d separate admission control, scheduling, and execution capacity.

Requests enter through the control plane and become durable jobs.

Admission control applies identity, quotas, priority, policy, and budget before work consumes expensive resources.

The scheduler then allocates work based on workload type, resource requirements, organizational priority, and available execution capacity.

The worker fleet scales horizontally.

But I wouldn’t treat every task equally.

Interactive developer work has different latency expectations from a six-hour autonomous refactoring job.

So I’d define workload classes with different priority, concurrency, SLA, model, compute, and budget policies.

The goal isn’t simply maximum throughput.

It’s predictable service under contention.”

⸻

26. QUEUE DESIGN

QUESTION

“Would you use Redis, RabbitMQ, Kafka, or something else?”

TALKING SCRIPT

“I wouldn’t choose the technology before defining the semantics.

First I’d ask whether I need a work queue, durable event stream, workflow engine, or some combination.

Task dispatch needs ownership, retries, visibility timeouts or leases, prioritization, and backpressure.

Event history needs durable ordered records and replay.

Long-running workflows may justify a durable workflow engine rather than building all the state-machine semantics ourselves.

Once those requirements are clear, then I can evaluate the implementation options.

The important architecture decision isn’t ‘Redis versus Kafka.’

It’s what delivery, ordering, durability, replay, and ownership guarantees the system requires.”

That is a stronger Senior Manager answer than prematurely choosing infrastructure.

⸻

27. MULTI-AGENT OR SINGLE AGENT?

QUESTION

“Would Meta Factory use multiple agents?”

TALKING SCRIPT

“Only where the task benefits from genuine separation of responsibility.

Multiple agents make sense when we have different permissions, tools, contexts, specializations, independent verification responsibilities, or parallelizable work.

For example, I may deliberately separate an implementation agent from a verification agent because independence has architectural value.

But I wouldn’t create five personas simply because a multi-agent diagram looks sophisticated.

Every additional agent adds coordination, latency, token consumption, state synchronization, and failure modes.

So my default is:

Use the simplest architecture that reliably produces the required outcome.

Multi-agent architecture should solve complexity in the task, not create complexity in the platform.”

⸻

28. SUPERVISOR AGENT VS. WORKFLOW ENGINE

QUESTION

“Would you use an LLM supervisor to orchestrate everything?”

TALKING SCRIPT

“Not everything.

I want the model making decisions where reasoning is actually required.

I want the workflow engine enforcing deterministic lifecycle rules.

A supervisor model may decide that a task needs decomposition or that a different capability is appropriate.

But things like authorization, budget enforcement, execution state transitions, approval requirements, timeout behavior, and release policy should not depend on the model deciding to remember them.

So I would combine a probabilistic supervisor with a deterministic runtime.

Reasoning decides what might happen next. Policy and runtime decide what is allowed to happen next.”

⸻

29. DESIGN HUMAN-IN-THE-LOOP

QUESTION

“Where do humans belong in an autonomous software factory?”

TALKING SCRIPT

“I don’t think human involvement should be uniformly applied to every action.

It should be risk-based.

Low-risk, reversible actions with strong deterministic verification can have high autonomy.

As impact, irreversibility, uncertainty, or privilege increases, the human-authority requirement increases.

I would define risk tiers around things like repository sensitivity, production impact, security implications, data access, deployment scope, and confidence in verification.

A documentation change may be highly autonomous.

A change to authentication infrastructure should have a very different approval path.

The important distinction is that human review must be meaningful.

I don’t want a developer clicking Merge because an agent says ‘everything looks good.’

The system should present the evidence necessary for the human to make an informed decision.”

KEY LINE

“Human-in-the-loop should mean human authority, not human ceremony.”

⸻

30. HOW DO YOU DEFINE AUTONOMY?

QUESTION

“How autonomous should Meta Factory become?”

TALKING SCRIPT

“I don’t think autonomy should be one platform-wide setting.

Autonomy should be a function of risk, reversibility, verification strength, and organizational policy.

If a task is low-risk, reversible, and independently verifiable, the system can operate with much greater autonomy.

If a task is consequential, difficult to reverse, or difficult to verify, authority should remain with a human.

So rather than asking ‘Is Meta Factory autonomous?’ I would ask:

For this class of work, what evidence is required before the system earns the authority to proceed?”

⸻

31. DESIGN POLICY & AUTHORIZATION

QUESTION

“How would permissions work?”

TALKING SCRIPT

“The agent should never inherit broad authority simply because the user has it.

I would derive a task-specific execution identity from the authenticated builder, organizational policy, requested workflow, and risk classification.

Then grant only the minimum required permissions for that execution.

Tool authorization should be enforced outside the model.

Repository access should be scoped.

Credentials should be short-lived.

High-risk operations should require explicit approval.

Every authorization decision should be auditable.

The model can request an action.

The policy layer decides whether that action is permitted.”

⸻

32. PROMPT INJECTION IN A SOFTWARE FACTORY

QUESTION

“How do you defend against malicious instructions inside a repository?”

TALKING SCRIPT

“I assume repository content is untrusted input.

A README, comment, issue, test fixture, dependency, or source file can contain instructions designed to manipulate the agent.

So retrieved content never becomes authority.

System policy and tool permissions exist outside the model.

I’d separate trusted instructions from untrusted content, preserve provenance, minimize unnecessary context, constrain tools, restrict egress, protect secrets, and require policy checks before consequential actions.

Even if the model is successfully manipulated, the attacker should still hit deterministic authorization boundaries.

That’s why prompt-injection defense isn’t primarily a prompt-engineering problem.

It’s an architecture and authority problem.”

⸻

33. SECRET MANAGEMENT

QUESTION

“How does an agent access credentials?”

TALKING SCRIPT

“I would avoid injecting durable secrets into the agent’s context or environment.

The worker should obtain short-lived, narrowly scoped credentials through the platform based on the task’s execution identity.

Ideally the tool gateway mediates privileged actions so the model doesn’t need raw credentials at all.

Secrets should be redacted from logs and model context, rotated automatically, and revoked when execution terminates.

The agent needs capability, not possession of the underlying secret.”

⸻

34. NETWORK EGRESS

QUESTION

“Would sandboxed agents have internet access?”

TALKING SCRIPT

“Not unrestricted internet access.

Egress should be determined by workload and policy.

A task may require package repositories, source control, approved documentation, model endpoints, or specific internal services.

Those destinations can be allowlisted.

Unknown outbound connections should be denied or explicitly approved depending on the risk tier.

This reduces exfiltration risk and makes execution much easier to reason about.

Least privilege applies to the network too.”

⸻

35. WHAT IF THE MODEL PROVIDER GOES DOWN?

QUESTION

“How would you design for a model outage?”

TALKING SCRIPT

“That’s one reason model independence matters operationally.

The router should understand which models are functionally eligible for each workload.

If a provider becomes unavailable, the system can either route to an evaluated fallback, queue the work, degrade capability, or surface the failure depending on the workload.

I wouldn’t automatically fail over a high-risk workflow to an unvalidated model simply because it’s available.

Availability does not override the quality and policy bar.

Fallbacks should be pre-evaluated for the workload classes they’re allowed to serve.”

⸻

36. WHAT IF A MODEL CHANGES UNDERNEATH YOU?

QUESTION

“Providers update models constantly. How do you prevent regressions?”

TALKING SCRIPT

“I don’t treat a model name as a stable behavioral contract.

Model versions should be explicit platform dependencies.

Before changing the version serving an important workload, I would run the representative evaluation corpus against the candidate and compare it with the baseline.

I’d look at quality, tool behavior, policy compliance, latency, cost, and failure distribution.

Then progressively roll it out with rollback available.

A model upgrade is a production change, not a procurement event.”

⸻

37. HOW WOULD YOU VERSION THE FACTORY?

QUESTION

“What needs versioning?”

TALKING SCRIPT

“Almost every behavior-changing artifact.

Models, agent definitions, prompts, skills, tools, MCP schemas, policies, retrieval configurations, evaluation suites, execution images, and workflow definitions should have explicit versions.

Ideally each execution records the exact combination it used.

That lets us reproduce failures, compare candidates with baselines, roll back behavior, and understand why two otherwise similar runs produced different results.

In autonomous systems, configuration is part of the executable product.”

⸻

38. HOW WOULD YOU ROLL OUT A NEW FACTORY VERSION?

QUESTION

“How would you release changes safely?”

TALKING SCRIPT

“I would treat factory behavior like production software.

First, offline evaluation against representative workloads.

Then shadow execution where useful.

Then a small design-partner cohort.

Then progressive rollout based on explicit quality, reliability, security, and economic thresholds.

The release unit should be observable and reversible.

If quality regresses or cost per accepted outcome increases materially, we need the ability to stop or roll back quickly.

Learning speed matters, but blast radius should grow only as evidence grows.”

⸻

39. DESIGN OBSERVABILITY

QUESTION

“What would you instrument?”

TALKING SCRIPT

“I want visibility into the entire trajectory:

Intent → Plan → Context → Model → Tool selection → Tool call → State transition → Artifact → Verification → Approval → Outcome.

At the system level, I’d monitor latency, queue depth, model availability, tool failures, sandbox failures, retry rates, token consumption, cost, and reliability.

At the agent level, I care about task success, tool-selection accuracy, context quality, correction rate, loop behavior, and escalation.

And at the builder level, I care about time saved, acceptance, repeat usage, and whether we’re actually improving the development workflow.

Evaluation tells me whether the system produced a good outcome.

Observability tells me why.”

⸻

40. WHAT ARE THE MOST IMPORTANT METRICS?

QUESTION

“How would you know Meta Factory is successful?”

TALKING SCRIPT

“I would use a balanced scorecard because optimizing one metric can damage another.

For quality, task success, accepted outcomes, human correction rate, regressions, and verification pass rate.

For economics, token cost, compute cost, retries, and especially cost per accepted outcome.

For reliability, successful execution rate, recovery rate, latency, and incident rate.

For builder experience, time to first value, cycle-time reduction, repeat usage, and satisfaction.

For platform leverage, onboarding time, capability reuse, bespoke infrastructure retired, and adoption across organizations.

And for autonomy, I’d measure how much work completes without unnecessary human intervention while maintaining the required quality and risk bar.

I wouldn’t optimize adoption alone.

High adoption of an unreliable platform is dependency, not success.”

⸻

41. HOW WOULD YOU DEFINE SLOS?

QUESTION

“What SLOs would an agent platform have?”

TALKING SCRIPT

“I’d distinguish infrastructure SLOs from outcome-quality objectives.

Infrastructure can have traditional SLOs around API availability, job acceptance, scheduling latency, sandbox provisioning, state durability, and tool availability.

But an agent returning something successfully doesn’t mean it produced a correct outcome.

So I’d separately define quality objectives for major workload classes: task success, verification pass rate, human correction, and perhaps cost per accepted outcome.

Availability tells me whether the factory ran. Evaluation tells me whether it worked.”

⸻

42. WHAT IS BACKPRESSURE?

QUESTION

“What happens if demand exceeds capacity?”

TALKING SCRIPT

“I want the platform degrading intentionally rather than accidentally.

Admission control can apply quotas and workload priorities before expensive resources are allocated.

Interactive tasks may receive higher scheduling priority than long-running background work.

Low-priority workloads can
