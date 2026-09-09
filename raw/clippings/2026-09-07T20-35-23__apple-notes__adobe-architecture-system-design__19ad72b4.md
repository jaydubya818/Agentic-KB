---
title: "ADOBE — ARCHITECTURE & SYSTEM DESIGN"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p8446
captured_at: 2026-09-07T20:35:23.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: 19ad72b49f9044f9d091202a685f32109b8662496c0a61626acc9a2887d2f74e
---

ADOBE — ARCHITECTURE & SYSTEM DESIGN

Jeffrey Mott + Vikram Sethi — 45-Minute Interview Study Guide

What this round is testing

This is not a test of how many AI buzzwords you can fit on a whiteboard. Jeffrey and Vikram are testing whether you can take an ambiguous enterprise problem, establish the requirements that matter, make clear architectural decisions, defend the boundaries, and explain how the system behaves at Adobe scale.

For almost every system-design question, demonstrate:

Requirements → Scale → Architecture → Trust Boundaries → Reliability → Economics → Evaluation → Tradeoffs → Rollout

Your default opening: “Before I design the architecture, I want to clarify the builder, desired outcome, first workflows, scale, trust boundaries, autonomy level, and success criteria, because those should drive the design.”

Your default architecture:

Builder Intent → Governed Plan → Capability/Model Routing → Control Plane → Durable Orchestration → Context Intelligence → Skills/Tools → Secure Execution → Verification → Evidence → Human Authority → Delivery → Outcome → Learning

Cross-cutting: Identity | Policy | Authorization | Budget | Observability | Audit | Governance

⸻

1. DESIGN ADOBE META FACTORY

QUESTION: “How would you design Adobe Meta Factory?”

TALKING SCRIPT: “I’d start with the builder and the outcome, not with the model or agent framework. The builder should be able to express an objective, constraints, architecture where appropriate, and acceptance criteria without needing to understand which model, agent, skill, tool, or MCP server should execute the work. From there, I’d separate the system into several major responsibilities. The control plane owns identity, authorization, policy, durable state, budgets, scheduling, observability, audit, and lifecycle. A planning layer converts builder intent into a durable, inspectable plan containing dependencies, acceptance criteria, verification requirements, budgets, and authority boundaries. Capability routing selects qualified models, agents, skills, and deterministic tools based on workload, quality, security, latency, reliability, and economics. Context intelligence assembles the minimum sufficient repository and enterprise context required for the task. Durable orchestration manages dependencies, checkpoints, retries, leases, recovery, and escalation. Agents execute inside isolated, ephemeral sandboxes with explicit repository, filesystem, tool, credential, network, compute, time, and token boundaries. Then an independent verification plane combines tests, static analysis, security, policy, agentic review, and dynamic evaluations to determine whether the acceptance criteria have actually been satisfied. The factory produces an evidence bundle supporting those claims. Humans retain authority over consequential decisions based on risk. Finally, production outcomes feed a learning system that can propose improvements to routing, prompts, skills, context strategies, tools, policies, and evaluations—but those improvements must be evaluated before promotion. So Meta Factory governs the complete path from builder intent to trusted outcome.”

KEY LINE: “A harness executes an agent. Meta Factory governs the work.”

WHITEBOARD: Intent → Plan → Route → Orchestrate → Context → Execute → Verify → Evidence → Authority → Deliver → Outcome → Learn

⸻

2. START WITH REQUIREMENTS, NOT ARCHITECTURE

QUESTION: “What would you clarify before designing?”

TALKING SCRIPT: “I’d clarify seven things before drawing the architecture: who the builder is, what outcome we’re solving, the first workflows, expected scale, latency expectations, trust boundaries, and success criteria. An interactive code-review assistant and a six-hour autonomous modernization workflow have completely different requirements. I’d also clarify what agents can touch—source code, credentials, production systems, customer data—and what level of autonomy is expected. Those decisions determine the execution model, security posture, verification requirements, economics, and human-authority model.”

KEY LINE: “The architecture should follow the workload, not the other way around.”

⸻

3. BUILDER INTENT BECOMES THE INTERFACE

QUESTION: “How does a builder interact with Meta Factory?”

TALKING SCRIPT: “I don’t want builders selecting implementation machinery. The builder should primarily express goal, constraints, architecture where necessary, acceptance criteria, relevant context, and success metrics. The system turns that into an executable intent contract. If the request is ambiguous in a way that materially affects the outcome, the system clarifies it before execution. The factory can then determine the plan, capabilities, context, execution strategy, verification requirements, and authority boundaries. This becomes increasingly important as Adobe’s builder population expands beyond traditional software engineers.”

KEY LINE: “Builders define the what. The factory determines the how.”

FOLLOW-UP — “Does the builder lose architectural control?” “No. Architecture can itself be part of the constraints. Hiding implementation machinery doesn’t mean removing intentional human decisions.”

⸻

4. THE PLANNER IS NOT THE PLAN

QUESTION: “How would planning work?”

TALKING SCRIPT: “I separate the planner from the plan. The planner may be probabilistic, model-dependent, and replaceable. But once autonomous execution is going to begin, I want the output to become a durable governed artifact. The plan should capture work decomposition, dependency relationships, constraints, acceptance criteria, verification requirements, budgets, and authority boundaries. That gives orchestration something stable to execute and verification something explicit to evaluate against. If we later replace the planning model, we don’t lose the execution contract.”

KEY LINE: “The planner can be probabilistic. The plan should be governed.”

FOLLOW-UP — “Would the plan ever change?” “Yes, but materially changing a governed plan should itself be an explicit state transition with provenance, rather than invisible model behavior.”

⸻

5. CONTROL PLANE VS. EXECUTION PLANE

QUESTION: “Why separate the control plane from the worker fleet?”

TALKING SCRIPT: “Because I don’t want probabilistic execution owning its own governance. The control plane is authoritative: identity, policy, budgets, durable state, scheduling, leases, lifecycle, approvals, and audit. The execution plane is disposable: workers receive bounded authority, perform the work, produce artifacts and evidence, and disappear. If a worker crashes, loops, loses connectivity, or starts behaving incorrectly, the system responsible for stopping or recovering it must remain healthy. I should be able to destroy a worker without losing the authoritative workflow state.”

KEY LINE: “The worker performs the work. The control plane owns the truth.”

⸻

6. WHAT BELONGS IN THE CONTROL PLANE?

QUESTION: “What specifically does the control plane own?”

TALKING SCRIPT: “I’d put identity, authorization, policy, job admission, scheduling, durable workflow state, execution leases, budgets, capability qualification, lifecycle controls, approvals, telemetry, evidence references, and audit history in the control plane. I’d keep actual model reasoning and code execution in isolated workers underneath it. The exact implementation can evolve, but the important boundary is that a failed or compromised agent cannot become the authoritative source of truth for its own permissions, budget, state, or success.”

KEY LINE: “The system governing the agent must remain healthy when the agent itself is unhealthy.”

⸻

7. DESIGN THE AGENT HARNESS

QUESTION: “What should an enterprise agent harness actually do?”

TALKING SCRIPT: “I think of the harness as where probabilistic reasoning meets deterministic control. The model proposes what should happen next. The harness determines what context the model receives, which tools it can request, what state persists, how execution proceeds, how retries and checkpoints work, what budgets apply, what evidence must be produced, and when the system stops or escalates. I’d expect production harness capabilities around context management, tool orchestration, durable state integration, checkpointing, recovery, budgets, observability, evaluation hooks, and human-intervention points. But I’d deliberately keep identity, enterprise policy, and ultimate authority outside the model itself.”

KEY LINE: “Models reason. The harness controls.”

⸻

8. SHOULD ADOBE BUILD ITS OWN HARNESS?

QUESTION: “Adobe has roughly 15,000 engineering builders. Should we build our own harness?”

TALKING SCRIPT: “I wouldn’t begin with the assumption that Adobe should build one. I’d benchmark leading commercial and open capabilities against representative Adobe workloads and ask where Adobe actually differentiates. Generic coding, planning, tool use, and orchestration are moving quickly toward commoditization. Adobe is much more likely to create durable differentiation in Builders Experience, enterprise context, secure execution, identity and policy integration, repository intelligence, evaluation, evidence, learning, and domain-specific workflows. My preference would be an Adobe-owned control boundary around replaceable execution capabilities wherever possible. If an external harness satisfies the requirements, adopt it. If evaluation exposes a strategically important gap, then build.”

KEY LINES: “Adopt commodity. Build differentiation.” · “Proprietary should be an outcome of differentiation, not an architectural preference.”

⸻

9. MODEL-INDEPENDENT DOESN’T MEAN MODEL-UNAWARE

QUESTION: “How would you keep Meta Factory model-independent?”

TALKING SCRIPT: “I’d put models behind stable capability interfaces so the rest of the factory doesn’t depend directly on one provider. But I wouldn’t pretend every model behaves identically. Different models have different reasoning strengths, context behavior, tool-use patterns, latency, economics, security constraints, and failure modes. So I’d keep the platform contract stable while using model-specific adapters and capability metadata where necessary. That gives us replaceability without forcing every model through the lowest common denominator.”

KEY LINE: “Model-independent doesn’t mean model-unaware.”

⸻

10. DESIGN CAPABILITY AND MODEL ROUTING

QUESTION: “How do you decide which model handles a task?”

TALKING SCRIPT: “I’d separate eligibility from optimization. First, eliminate capabilities that cannot satisfy hard constraints such as security policy, required tools, context limits, latency, reliability, or workload support. Then rank eligible capabilities using empirical workload evidence: quality, historical evaluation performance, retries, latency, availability, and cost. I wouldn’t route solely using a static complexity score or public benchmark. Every completed workload gives us evidence about whether the routing decision actually worked, so routing should improve over time. Economically, my north-star metric is cost per accepted outcome, not cost per token.”

KEY LINE: “Hard constraints first. Optimization second.”

FOLLOW-UP — “Would you always use the cheaper model?” “No. A cheap inference that creates three retries, fails verification, and requires twenty minutes of engineer correction may be significantly more expensive.”

⸻

11. TOKENOMICS

QUESTION: “How would you reduce inference cost?”

TALKING SCRIPT: “I’d attack token economics across the complete execution path. Routing: don’t use frontier reasoning for every task. Context: retrieve minimum sufficient context rather than repeatedly sending enormous payloads. Determinism: don’t spend inference on something a compiler, query, static analyzer, or deterministic tool can solve reliably. Caching and reuse: avoid recomputing stable context and repeated work. Loop efficiency: failed retries can dominate cost. Planning: spend intelligence where it reduces expensive downstream mistakes. Finally, instrument everything against successful outcomes. I care less about minimizing tokens than maximizing useful work per dollar.”

KEY LINE: “Optimize for cost per accepted outcome, not cost per token.”

⸻

12. CONTEXT ENGINEERING ACROSS 100,000+ REPOSITORIES

QUESTION: “How do you provide useful context across Adobe’s repository landscape?”

TALKING SCRIPT: “I wouldn’t dump repositories into context windows and call it context engineering. At Adobe scale, context resolution needs to be structural, hierarchical, permission-aware, and workload-specific. I’d combine code and symbol search, dependency relationships, ownership metadata, repository instructions, architecture decisions, historical changes, tests, documentation, incidents, and semantic retrieval where useful. Context should be layered: enterprise standards → product/domain knowledge → repository knowledge → task-specific context. Retrieval must preserve authorization. The objective is not maximum context; it’s the minimum sufficient high-value context required for the decision.”

KEY LINES: “More context is not automatically better context.” · “Retrievability is not authorization.”

⸻

13. RAG VS. FINE-TUNING VS. CONTINUAL PRETRAINING

QUESTION: “Would you use RAG, fine-tuning, or CPT?”

TALKING SCRIPT: “I don’t think that’s one platform-wide decision. Dynamic, permission-sensitive, frequently changing knowledge generally belongs outside model weights and should be retrieved. Stable behavioral patterns that repeatedly consume context or remain difficult through prompting may justify fine-tuning. Continual pretraining becomes interesting when we have a sufficiently large, stable domain corpus and evaluation demonstrates material quality or economic improvement. I’d start with the least irreversible mechanism and let evidence justify increasing operational complexity.”

KEY LINE: “Use the least irreversible mechanism that meets the quality bar.”

⸻

14. DESIGN SECURE REMOTE AGENT EXECUTION

QUESTION: “How would you safely allow Adobe builders to delegate work to cloud agents?”

TALKING SCRIPT: “I’d treat remote execution as a distinct trust boundary. Each task receives an ephemeral, identity-bound sandbox created from a versioned execution manifest. It receives only the repository scope, filesystem access, tools, credentials, network destinations, compute, time, and token budget required for that task. Credentials should be short-lived, network egress restricted, and resource limits enforced outside the model. Repository content itself is treated as untrusted. Every consequential action produces auditable evidence, and the environment is destroyed when execution completes. Successful execution does not automatically grant merge or deployment authority.”

KEY LINE: “The sandbox should bound authority, not just compute.”

⸻

15. POLICY AND AUTHORIZATION

QUESTION: “How would permissions work?”

TALKING SCRIPT: “The agent should not simply inherit the builder’s ambient authority. I’d derive a task-specific execution identity from the authenticated builder, workflow, organizational policy, requested resources, and risk classification. Then grant only the minimum required capabilities. Tool authorization is enforced outside the model, repository access is scoped, credentials are short-lived, and high-impact operations require additional authority. Every authorization decision should be auditable. The model can request an action; the policy layer decides whether it is allowed.”

KEY LINES: “Capability does not imply permission.” · “Intelligence does not imply authority.”

⸻

16. PROMPT INJECTION

QUESTION: “What if a repository tells the agent to leak credentials?”

TALKING SCRIPT: “I assume repository content is untrusted input. A README, comment, dependency, issue, source file, or test fixture can contain malicious instructions. Retrieved content can influence reasoning, but it cannot create authority. System policy and tool permissions remain outside the model. Context retains provenance, secrets are protected, egress is restricted, tools are scoped, and consequential actions pass deterministic authorization. Even if the model is manipulated, the attacker should still hit an external authority boundary.”

KEY LINE: “Prompt injection is an authority problem, not just a prompting problem.”

⸻

17. DESIGN DURABLE EXECUTION

QUESTION: “What happens when a worker crashes halfway through a two-hour task?”

TALKING SCRIPT: “I don’t want authoritative workflow state living only inside an ephemeral worker. The control plane persists workflow and task state. Workers acquire leases to perform work. At meaningful boundaries, the runtime checkpoints completed tasks, artifacts, repository state, tool results, execution metadata, and evidence. If the worker disappears, its lease expires and another worker can resume from a safe boundary. The difficult part is side effects, so recovery has to be designed together with idempotency, deduplication, replay semantics, and publication authority.”

KEY LINE: “Durability, leases, checkpointing, and idempotency have to be designed together.”

MISSION CONTROL PROOF: “I’ve implemented variants of this directly in Mission Control using durable workers, leases, sequenced events, attempt-specific execution, and lease-checked publication.”

⸻

18. WHAT STATE PERSISTS?

QUESTION: “What state needs to be durable?”

TALKING SCRIPT: “I’d separate workflow state—where we are in the dependency graph; task state—queued, running, blocked, failed, complete; attempt state—the current execution attempt; artifact state—patches, code, test output; approval state—human and policy decisions; budget state—tokens, time, compute, cost; and evidence state—what supports acceptance. The durable source of truth belongs outside the worker. I would be careful about persisting raw model reasoning unless there is a clear operational requirement because it can be noisy, expensive, sensitive, and model-specific.”

KEY LINE: “Persist what the system needs to govern and recover—not everything the model happened to think.”

⸻

19. QUEUE VS. EVENT STREAM VS. WORKFLOW ENGINE

QUESTION: “Would you use Redis, RabbitMQ, Kafka, Temporal, or something else?”

TALKING SCRIPT: “I wouldn’t choose the technology before defining the semantics. First ask whether I need a work queue, durable event stream, workflow engine, or combination. Task dispatch needs ownership, prioritization, retries, leases, and backpressure. Event history needs durable ordered records and replay. Long-running workflows need state transitions, timers, recovery, and potentially human pauses. Once those requirements are clear, then we evaluate technologies. The important architectural decision isn’t Redis versus Kafka; it’s the required delivery, ordering, ownership, durability, and replay guarantees.”

KEY LINE: “Choose semantics before technology.”

⸻

20. CONCURRENCY AND SCALE

QUESTION: “What happens when thousands of builders start jobs simultaneously?”

TALKING SCRIPT: “I’d separate admission control, scheduling, and execution capacity. Requests become durable jobs. Admission control applies identity, quotas, policy, priority, and budget before expensive resources are allocated. Scheduling considers workload type, latency requirements, resource requirements, organizational priority, and available capacity. Workers scale horizontally. But I’d explicitly define workload classes: interactive builder tasks, asynchronous review, long-running autonomous development, large modernization jobs, and so forth. They need different concurrency, SLA, model, compute, and budget policies.”

KEY LINE: “The goal isn’t maximum throughput. It’s predictable service under contention.”

21. BACKPRESSURE

QUESTION: “Demand exceeds capacity. What happens?”

TALKING SCRIPT: “I want the system to degrade intentionally rather than accidentally. Admission control prevents unlimited expensive work from entering execution. Interactive builder tasks can receive higher priority than long-running background work; low-priority jobs can queue; organizational quotas prevent one team from exhausting shared capacity; and provider rate limits become part of scheduling. I’d also avoid uncontrolled retries, because an overloaded dependency plus aggressive retry behavior creates a retry storm and makes recovery harder. The control plane should understand capacity and apply backpressure before downstream systems collapse.”

KEY LINE: “Overload should create controlled queuing and degradation, not cascading failure.”

FOLLOW-UP — “Would you reject requests?” “Potentially. For interactive workloads, a fast and explicit rejection may be better than accepting work we cannot satisfy within the expected SLO. For asynchronous workloads, durable queuing may be appropriate.”

⸻

22. WHAT HAPPENS WHEN AN AGENT GETS STUCK?

QUESTION: “How do you prevent infinite agent loops?”

TALKING SCRIPT: “I’d use multiple bounded controls rather than one arbitrary retry counter. Every execution has explicit time, token, tool-call, compute, iteration, and potentially monetary budgets. The runtime also needs progress detection. A transient network failure may justify retrying; repeatedly making the same tool call, receiving the same error, producing equivalent plans, or making no improvement in verification probably does not. The runtime should classify failures, apply circuit breakers, select fallback strategies where appropriate, and escalate when additional autonomous work has diminishing value. Most importantly, the authoritative budget lives outside the agent.”

KEY LINE: “The agent should never be responsible for deciding whether it has spent too much money.”

FOLLOW-UP — “How do you detect progress?” “Use multiple signals: state advancement, new artifacts, changed verification results, resolved dependencies, different tool outcomes, and meaningful movement toward acceptance criteria.”

⸻

23. RETRIES, CIRCUIT BREAKERS & RECOVERY

QUESTION: “How would you design retries?”

TALKING SCRIPT: “I wouldn’t treat every failure as retryable. I’d classify errors into transient, capability, policy, deterministic, and unknown failures. A temporary provider timeout may justify exponential backoff with jitter. Invalid credentials should not. A model repeatedly producing the same failing patch should probably trigger a strategy change rather than another identical attempt. Circuit breakers protect dependencies and prevent runaway loops. Recovery should also consider whether the operation is idempotent, because retrying an ambiguous side effect can be more dangerous than failing.”

KEY LINE: “Retries should reduce transient failure, not amplify permanent failure.”

⸻

24. IDEMPOTENCY

QUESTION: “What if the same task executes twice?”

TALKING SCRIPT: “For distributed execution, I generally assume at-least-once delivery, which means duplicate work is an expected condition rather than an exceptional one. Consequential operations need stable idempotency keys or equivalent deduplication. The hard case is when an external side effect succeeds but the worker crashes before recording success. Where possible, the external operation itself should support idempotency; otherwise we need reconciliation before retry. For repository changes, attempt-specific workspaces also help isolate retries so duplicate execution doesn’t silently corrupt shared state.”

KEY LINE: “Exactly-once is usually a business invariant built on top of weaker delivery guarantees.”

⸻

25. MULTI-AGENT VS. SINGLE AGENT

QUESTION: “Would Meta Factory use multiple agents?”

TALKING SCRIPT: “Only where separation creates actual value. Multiple agents make sense when we need different permissions, different tools, specialized context, parallel execution, independent responsibilities, or verification separation. Implementation and verification are a good example because independence has architectural value. But every additional agent creates coordination, latency, token consumption, state synchronization, and new failure modes. I wouldn’t create planner, architect, coder, reviewer, critic, and supervisor personas merely because a multi-agent diagram looks sophisticated. Start with the simplest architecture that reliably meets the outcome and trust requirements.”

KEY LINE: “Multi-agent architecture should solve complexity in the task, not create complexity in the platform.”

⸻

26. SUPERVISOR AGENT VS. WORKFLOW ENGINE

QUESTION: “Would you use an LLM supervisor to orchestrate everything?”

TALKING SCRIPT: “No. I want the model deciding things that actually require reasoning and the workflow runtime enforcing deterministic lifecycle rules. A supervisor may determine that an objective requires decomposition, select a capability, or propose a recovery strategy. But authorization, budget enforcement, legal state transitions, timeouts, leases, approval requirements, and release policy shouldn’t depend on the model remembering to enforce them. So I combine probabilistic supervision with deterministic orchestration.”

KEY LINE: “Reasoning decides what should happen next. Runtime and policy decide what is allowed to happen next.”

⸻

27. DESIGN CODE REVIEW ACROSS 100,000+ REPOSITORIES

QUESTION: “How would you design Adobe-wide code review?”

TALKING SCRIPT: “I would not try to build one giant Adobe reviewer that understands every repository. I’d build a common review platform with progressively specialized intelligence. At the enterprise level, we have shared security requirements, policies, model access, execution infrastructure, observability, and evaluation. At the product or domain level, we add language, framework, architecture, and product-specific knowledge. At the repository level, we add ownership, local instructions, dependency information, tests, historical accepted findings, prior changes, and repository-specific conventions. Deterministic checks should run first where possible; model-based review should focus on semantic issues where reasoning adds value. The infrastructure stays common while the context and verification become progressively more specific.”

KEY LINE: “Standardize the platform. Specialize the context.”

⸻

28. WHY NOT JUST BUY A CODE REVIEWER?

QUESTION: “Why should Adobe build code review rather than use an industry product?”

TALKING SCRIPT: “I wouldn’t assume Adobe should build it. I’d establish a representative benchmark across Adobe’s actual repository distribution and evaluate external capabilities first. If a commercial or open reviewer gives us excellent generic review, I’d rather adopt it and invest Adobe engineering capacity in Adobe-specific context, policy, repository intelligence, evaluation, orchestration, security integration, and builder experience. If the benchmark exposes a strategically important capability gap, then we have evidence supporting a build decision. The decision should follow measured differentiation rather than engineering pride.”

KEY LINE: “Adopt commodity. Build differentiation.”

⸻

29. HOW DOES A REPOSITORY LEARN?

QUESTION: “How would you make review repository-specific over time?”

TALKING SCRIPT: “I separate memory, learning, and promotion. Memory means retrieving useful repository history during execution. Learning means analyzing outcomes: accepted and rejected findings, author corrections, merged changes, incidents, rollbacks, review comments, and verification failures. Those signals can produce candidate improvements to repository skills, prompts, retrieval strategies, routing, policies, or evaluations. Promotion is separate: candidate behavior competes against the current baseline using repository-specific and global evaluations. I would not begin by fine-tuning a separate model for every repository. Repository context and versioned skills are cheaper, explainable, reversible, and easier to govern.”

KEY LINE: “Learning changes candidates. Promotion changes production.”

⸻

30. DESIGN THE SELF-CORRECTION LOOP

QUESTION: “How does an agent fix its own mistakes?”

TALKING SCRIPT: “After implementation, deterministic verification runs first wherever possible: compile, lint, unit tests, integration tests, security checks, policy checks. If something fails, the runtime captures structured failure evidence and determines whether another attempt is justified. The next attempt receives the relevant failure information rather than blindly repeating the original prompt. But self-correction remains bounded by budget and progress. If repeated attempts don’t improve the verification state, the system should change strategy, select another capability, escalate, or stop.”

KEY LINE: “Self-correction should be evidence-driven, not ‘keep asking the model until something passes.’”

⸻

31. DESIGN THE VERIFICATION PLANE

QUESTION: “How do you know agent-generated software is correct?”

TALKING SCRIPT: “I don’t think one verifier can establish that. I’d use a layered verification plane. Deterministic verification handles compilation, tests, static analysis, schemas, security scanning, and policy checks. Semantic evaluation handles requirements that aren’t reducible to deterministic assertions. Dynamic evaluation checks runtime behavior where static evidence isn’t enough. Independent review can assess architecture, intent alignment, and adversarial conditions. Finally, evidence gets mapped back to the acceptance criteria established in the governed plan. The verification strategy should vary by workload risk.”

KEY LINE: “Generation tells me what the agent produced. Verification tells me whether I should trust it.”

⸻

32. INDEPENDENT VERIFICATION

QUESTION: “Would you just use another LLM as the verifier?”

TALKING SCRIPT: “Not necessarily. Independence is about failure-mode diversity, not model count. The same model with a different prompt may have highly correlated failures. Independence can come from deterministic tests, independently derived acceptance criteria, different context, static analyzers, security tools, adversarial checks, alternative implementations, different models, or human review. I’d choose the verification portfolio according to consequence and the types of failures we’re trying to catch.”

KEY LINE: “The producer should not be the sole judge of its own work.”

FOLLOW-UP — “What if the verifier is wrong?” “Independent verification reduces correlated failure; it doesn’t eliminate error. That’s why I want multiple evidence types and production outcomes feeding back into evaluation of the evaluators themselves.”

⸻

33. DESIGN THE EVIDENCE PLANE

QUESTION: “What evidence would you preserve from an autonomous run?”

TALKING SCRIPT: “Enough to support trust, reproducibility, debugging, auditability, and learning. I’d preserve the original intent and acceptance criteria, governed plan, execution/factory version, models and tools used, context provenance, relevant state transitions, code changes, test and security results, evaluation outcomes, authorization decisions, human approvals, cost telemetry, and final production outcome. The goal is to reconstruct what happened, why the system made the decisions it made, and what evidence justified accepting the result. I would not retain every raw model token indefinitely; evidence retention should be risk-based and purpose-driven, because raw trajectories can be expensive, sensitive, noisy, and model-specific.”

KEY LINE: “The artifact becomes a set of claims backed by evidence.”

FOLLOW-UP — “Would you store the entire trajectory?” “Not necessarily. High-risk workflows may justify substantially more evidence, while routine work may only require decision-relevant provenance. Preserve what is required for verification, reproducibility, audit, incident analysis, and learning.”

⸻

34. HUMAN-IN-THE-LOOP VS. HUMAN AUTHORITY

QUESTION: “Where do humans belong?”

TALKING SCRIPT: “I don’t want one human-approval gate applied to everything. Human involvement should be risk-based. Low-risk, reversible actions with strong deterministic verification can operate with high autonomy. As consequence, irreversibility, uncertainty, privilege, or verification difficulty increases, the human-authority requirement increases. And the system should present evidence, not simply ask someone to click Approve. A meaningful approval should explain what changed, which acceptance criteria were satisfied, what verification ran, what risk remains, and what authority the person is exercising.”

KEY LINE: “Human-in-the-loop should mean human authority, not human ceremony.”

⸻

35. HOW DO YOU DEFINE AUTONOMY?

QUESTION: “How autonomous should Meta Factory become?”

TALKING SCRIPT: “I wouldn’t make autonomy one global platform setting. Autonomy should be a function of risk, reversibility, verification strength, confidence, and organizational policy. A documentation update with deterministic validation can operate differently from a security-sensitive production change. The better question is not ‘Is Meta Factory autonomous?’ It’s: For this class of work, what evidence must the system produce before it earns the authority to proceed? As verification improves, the autonomy boundary can move.”

KEY LINE: “Autonomy is earned through evidence.”

⸻

36. DESIGN THE EVALUATION PLATFORM

QUESTION: “How would you evaluate Meta Factory?”

TALKING SCRIPT: “I’d evaluate at multiple levels. Component evaluations test retrieval, routing, skills, tool use, and model behavior. Trajectory evaluations examine whether the system took an effective execution path. Outcome evaluations determine whether the builder objective was achieved. Policy evaluations determine whether execution remained inside authorized boundaries. System metrics cover reliability, latency, cost, retries, and human intervention. Before changing a model, router, skill, prompt, harness, context strategy, or policy, I’d replay representative workloads against the candidate and baseline. The corpus should combine curated golden cases, historical production trajectories, and real failure cases.”

KEY LINE: “Evaluation isn’t a test phase. It’s part of the architecture.”

⸻

37. OFFLINE EVALS VS. PRODUCTION OUTCOMES

QUESTION: “What if offline evaluations say the new model is better but production says otherwise?”

TALKING SCRIPT: “Then our evaluation distribution isn’t sufficiently representative of production. I’d roll affected workloads back to the known-good capability, identify which production failure classes were missing from the evaluation corpus, and add those cases. I’d also look for aggregate scores hiding domain-specific regressions. Offline evaluations predict production behavior; production outcomes validate whether those evaluations are actually meaningful. The evaluation system itself has to learn.”

KEY LINE: “Production is not where we discover every failure, but production tells us whether our evaluations predict reality.”

⸻

38. DESIGN THE LEARNING LOOP

QUESTION: “How does Meta Factory improve over time?”

TALKING SCRIPT: “Every execution produces signals: task success, verification results, human corrections, accepted and rejected review findings, incidents, rollbacks, latency, token consumption, cost, and production outcomes. The learning system analyzes those signals and identifies candidate improvements to routing, prompts, skills, context strategies, tools, agent definitions, policies, and evaluations. But discovering an improvement doesn’t give it production authority. Candidate behavior is evaluated against the current baseline, then shadowed or progressively rolled out where appropriate. If it improves quality, safety, reliability, or economics without unacceptable regressions, promote it. Otherwise reject it.”

KEY LINE: “Learning can be autonomous. Promotion should be governed.”

⸻

39. RLHF VS. RLAIF VS. FACTORY LEARNING

QUESTION: “How is this different from RLHF?”

TALKING SCRIPT: “They’re different layers. RLHF and RLAIF primarily change model behavior through training or preference optimization. What I’m describing is system-level learning around the model. The factory can improve routing, prompts, skills, context strategies, tools, policies, workflows, and evaluations without modifying the foundation model at all. Fine-tuning or preference learning can participate when justified, but I wouldn’t conflate model training with runtime platform improvement.”

KEY LINE: “The model can learn, but the factory can learn too. They’re different systems.”

⸻

40. WHAT SHOULD BE DETERMINISTIC VS. AGENTIC?

QUESTION: “When should you use an LLM instead of conventional software?”

TALKING SCRIPT: “I use models where ambiguity, interpretation, planning, reasoning, or synthesis creates value. I use deterministic systems wherever the required behavior is known and reproducible. Understanding an ambiguous builder request may require reasoning; compiling code doesn’t. Assessing a nuanced architecture requirement may require semantic evaluation; checking a schema doesn’t. Planning a migration may require a model; enforcing authorization doesn’t. I don’t spend intelligence where determinism gives me a safer, cheaper, and more reliable answer.”

KEY LINE: “Use intelligence for ambiguity. Use determinism for invariants.”

⸻

41. VERSIONING THE FACTORY

QUESTION: “What needs to be versioned?”

TALKING SCRIPT: “Anything capable of materially changing behavior: models, agent definitions, prompts, skills, tools, MCP schemas, policies, context/retrieval configuration, evaluation suites, execution images, workflow definitions, and routing configuration. Ideally every execution records the exact immutable combination it used. That allows reproduction, baseline comparison, rollback, incident investigation, and qualification. I don’t want a run from yesterday and a run from today both claiming they used ‘the same factory’ when five mutable components changed underneath them.”

KEY LINE: “In autonomous systems, configuration is executable product behavior.”

⸻

42. FACTORY VERSION AS THE RELEASE UNIT

QUESTION: “Would you version every component independently?”

TALKING SCRIPT: “Components can have independent versions, but I want a qualified immutable factory version as the routable release unit. That version binds the approved combination of workflow, model routes, skills, tools, policies, execution environment, verification requirements, and evaluation identity. Otherwise we can individually version everything while still being unable to answer the simple production question: ‘What exact system behavior did this workload execute against?’”

KEY LINE: “Components evolve independently. Production executes a qualified composition.”

⸻

43. SAFE ROLLOUT OF A NEW FACTORY VERSION

QUESTION: “How do you release changes?”

TALKING SCRIPT: “I’d treat factory behavior like production software. Start with offline qualification against representative workloads. Then shadow execution where useful, followed by a small design-partner cohort, canary rollout, and progressive expansion based on explicit quality, reliability, security, and economic thresholds. The release unit must be observable and reversible. If accepted-outcome quality drops, policy violations increase, or economics materially regress, stop or roll back. Blast radius should increase only as evidence increases.”

KEY LINE: “Learning speed can be aggressive. Blast-radius growth should be evidence-based.”

44. OBSERVABILITY — CONTINUED

KEY LINE: “Evaluation tells me whether it worked. Observability tells me why.”

FOLLOW-UP — “Would you log chain-of-thought?” “No. I don’t need private model reasoning to operate the platform effectively. I want observable inputs, outputs, tool calls, state transitions, context provenance, policy decisions, verification evidence, latency, costs, and outcomes. Those are the operational artifacts required to understand system behavior.”

⸻

45. WHAT ARE THE MOST IMPORTANT METRICS?

QUESTION: “How would you know Meta Factory is successful?”

TALKING SCRIPT: “I’d use a balanced scorecard because optimizing one dimension can damage another. For delivery, I’d measure cycle time, time to merge, deployment frequency, and task completion. For quality, accepted outcomes, verification pass rate, human correction, defect escape, security findings, and rollback. For economics, tokens, compute, retries, and especially cost per accepted outcome. For reliability, successful execution rate, recovery rate, latency, and incidents. For builder experience, time to first value, repeat usage, satisfaction, and unnecessary manual work removed. Finally, I’d measure platform leverage: onboarding time, reuse of shared capabilities, and bespoke infrastructure retired. I don’t want adoption to become the goal by itself.”

KEY LINE: “A platform succeeds when it creates leverage, not merely adoption.”

FOLLOW-UP — “What’s your single north-star metric?” “For the factory itself, I like accepted outcomes, with quality and economics attached. A raw run count tells me activity. An accepted outcome tells me useful work occurred.”

⸻

46. SLOs FOR AN AGENT PLATFORM

QUESTION: “What SLOs would you define?”

TALKING SCRIPT: “I’d distinguish infrastructure SLOs from outcome-quality objectives. Traditional SLOs still matter: API availability, job acceptance, scheduling latency, state durability, sandbox provisioning, model-gateway availability, and tool availability. But an agent can return successfully and still produce a terrible result, so workload classes also need objectives around task success, verification pass rate, policy compliance, human correction, and possibly cost per accepted outcome. A 99.99% available system producing incorrect software is not reliable.”

KEY LINE: “Availability tells me whether the factory ran. Evaluation tells me whether it worked.”

⸻

47. MODEL-PROVIDER OUTAGE

QUESTION: “Your primary model provider goes down. What happens?”

TALKING SCRIPT: “The capability registry should already know which alternative models are qualified for each workload class. For some workloads we can transparently fail over. Others may queue or degrade. High-risk workloads may need to pause rather than silently lower the quality or security bar. I’d also protect fallback providers from a thundering herd through admission control and rate limiting. Model independence is operationally useful only if we’ve actually evaluated the alternatives; an untested fallback isn’t resilience.”

KEY LINE: “Availability does not override the quality or policy bar.”

⸻

48. WHAT IF THE MODEL CHANGES UNDERNEATH YOU?

QUESTION: “Providers continuously update models. How do you prevent regressions?”

TALKING SCRIPT: “I don’t treat a model name as a stable behavioral contract. Model identity and version should be explicit dependencies of the qualified factory configuration. Before changing a model serving an important workload, I’d replay representative evaluations and compare quality, tool behavior, security, latency, economics, and failure distribution against the current baseline. Then progressively roll out the candidate with observability and rollback available. If a provider doesn’t offer sufficient version stability, that becomes part of the risk and qualification decision.”

KEY LINE: “A model upgrade is a production change, not a procurement event.”

⸻

49. TOOL / MCP GOVERNANCE

QUESTION: “How would MCP fit into Meta Factory?”

TALKING SCRIPT: “I think MCP is useful as a standardized connectivity layer, but I wouldn’t confuse tool interoperability with tool governance. Meta Factory still needs a capability registry containing ownership, versions, schemas, permissions, qualification status, evaluation history, and operational metadata. The agent can discover that a capability exists, but policy determines whether this execution identity may invoke it against this resource. I’d also want centralized revocation so a compromised tool can be disabled without redeploying every agent.”

KEY LINE: “MCP standardizes connectivity. It doesn’t outsource governance.”

⸻

50. CAPABILITY REGISTRY

QUESTION: “What would you put in a capability registry?”

TALKING SCRIPT: “Anything the factory may select as an execution resource: models, agents, skills, deterministic tools, MCP capabilities, evaluators, and potentially human capabilities. Each entry should include identity, owner, version, supported workloads, input/output contract, permissions, security classification, cost profile, latency characteristics, reliability history, evaluation results, and qualification status. The router should select from qualified capabilities rather than discovering arbitrary functionality at runtime.”

KEY LINE: “Discovery tells me what exists. Qualification tells me what I’m willing to trust.”

⸻

51. CAPABILITY ROUTING VS. MODEL ROUTING

QUESTION: “Why not just have a model router?”

TALKING SCRIPT: “Because the correct solution to a task isn’t always another model. A validation step might be better handled by a compiler. Repository metadata may come from a deterministic query. Security analysis may belong to a specialized scanner. A human may be the appropriate capability for a high-risk decision. So I’d route to capabilities, with models being one class of capability. That prevents us from turning every engineering problem into an inference problem.”

KEY LINE: “Route work to capabilities, not automatically to intelligence.”

⸻

52. LOCAL VS. GLOBAL VERIFICATION

QUESTION: “Would every repository have its own verification?”

TALKING SCRIPT: “I’d use a layered model. Some verification is global: enterprise security policies, dependency rules, secrets scanning, common compliance requirements, and platform-level acceptance requirements. Some is domain-specific: language, framework, architecture, or product rules. Some is repository-specific: local tests, ownership requirements, repository conventions, historical regressions, and custom acceptance criteria. The factory should compose these layers rather than forcing every team to rebuild the verification infrastructure.”

KEY LINE: “Centralize the verification machinery. Federate the definition of correctness.”

⸻

53. WHAT IF VERIFIERS DISAGREE?

QUESTION: “One verifier passes the change and another rejects it. What happens?”

TALKING SCRIPT: “I wouldn’t reduce heterogeneous verification to simple majority voting. Verification results have different semantics and authority. A deterministic security policy failure may be a hard block regardless of what an LLM reviewer thinks. Two semantic evaluators disagreeing may require additional evidence or human review. The governed plan should define which checks are mandatory, advisory, weighted, or escalation-triggering. Disagreement itself can also be useful evidence that confidence is low.”

KEY LINE: “Verification is evidence aggregation, not model voting.”

⸻

54. HUMAN APPROVAL AT ADOBE SCALE

QUESTION: “Won’t human approval become a bottleneck?”

TALKING SCRIPT: “It will if every autonomous action requires the same approval. That’s why authority should be risk-tiered. Low-risk, reversible work with strong verification can proceed automatically. Medium-risk work may require asynchronous review. High-risk or irreversible changes require explicit human authority. As verification improves, more workload classes can earn greater autonomy. The objective isn’t to remove humans; it’s to spend scarce human judgment where it materially reduces risk.”

KEY LINE: “Human attention is another scarce resource the architecture should allocate intelligently.”

⸻

55. FAIL OPEN VS. FAIL CLOSED

QUESTION: “What happens when policy or verification is unavailable?”

TALKING SCRIPT: “That depends on risk and reversibility. If the operation can expose data, modify production, alter security controls, or create difficult-to-reverse effects, I bias toward fail closed. For low-risk, reversible operations, graceful degradation may be acceptable. I wouldn’t define one global policy. The action’s consequence profile should determine failure behavior.”

KEY LINE: “The higher the consequence and irreversibility, the stronger the bias toward fail closed.”

⸻

56. DATA ISOLATION

QUESTION: “How do you prevent one team from seeing another team’s repository context?”

TALKING SCRIPT: “Authorization needs to exist throughout the context pipeline, not only at the front door. Repository permissions and data classifications should travel with indexed content. Retrieval evaluates the requesting execution identity before returning results. Caches must preserve tenant and authorization boundaries. Context assembly can’t silently combine unauthorized data. Tool access follows the same task-specific identity. And the evidence should show which sources contributed to the model context.”

KEY LINE: “Permissions must travel with the data.”

⸻

57. SECRET MANAGEMENT

QUESTION: “How does an agent access credentials?”

TALKING SCRIPT: “I don’t want durable secrets sitting in model context or static worker environments. The execution receives a task-specific identity and obtains short-lived, narrowly scoped credentials only when required. Where possible, a tool gateway mediates privileged operations so the model never sees the raw credential. Secrets are excluded or redacted from context and telemetry, rotated automatically, and revoked when the execution ends.”

KEY LINE: “The agent needs capability, not possession of the underlying secret.”

⸻

58. NETWORK EGRESS

QUESTION: “Would sandboxed agents have internet access?”

TALKING SCRIPT: “Not unrestricted access. Egress should be workload- and policy-specific. A task may need source control, approved package registries, documentation, model endpoints, or certain internal services. Those destinations can be explicitly allowed. Unknown outbound connections should be denied or require additional authority depending on risk. That limits exfiltration and makes execution easier to reason about.”

KEY LINE: “Least privilege applies to the network too.”

⸻

59. SANDBOX ESCAPE

QUESTION: “What if you discover a sandbox vulnerability?”

TALKING SCRIPT: “I treat the sandbox as a real security boundary, so a suspected escape becomes a security incident. I want the ability to disable the affected execution profile centrally, isolate potentially compromised workers, rotate exposed credentials, inspect network and host activity, and move workloads to known-clean infrastructure. Architecturally, ephemeral workers, minimal host surface area, scoped mounts, short-lived credentials, restricted egress, and independent control-plane state limit the blast radius.”

KEY LINE: “Assume the workload can be hostile even when the builder isn’t.”

⸻

60. DESIGN FOR MULTI-REGION / DISASTER RECOVERY

QUESTION: “Would Meta Factory need multi-region architecture?”

TALKING SCRIPT: “I’d let the workload and recovery objectives determine that. The control-plane metadata and durable state are more important to protect than ephemeral workers, because workers can be recreated. I’d define RTO and RPO for job state, evidence, configuration, and builder-facing APIs. Execution capacity can often be reconstructed in another region, but active workflows need deterministic recovery semantics. Model-provider and tool dependencies also need to be considered because a multi-region control plane doesn’t help if every region depends on the same unavailable external service.”

KEY LINE: “Protect authoritative state first; execution capacity is replaceable.”

⸻

61. REPOSITORY SCALE: 100,000+ REPOS

QUESTION: “Does anything fundamentally change at 100,000 repositories?”

TALKING SCRIPT: “Yes. I don’t want the platform creating a bespoke runtime or persistent agent for every repository. The common substrate should remain shared, while repository-specific behavior is expressed through metadata, context, versioned skills, policies, evaluations, and configuration loaded when needed. Indexing and context systems need incremental updates rather than full reprocessing. Ownership and permission metadata become first-class. Evaluation also needs representative sampling because we cannot exhaustively run every scenario against every repository for every candidate change.”

KEY LINE: “Scale the shared machinery; load specialization on demand.”

⸻

62. MONOREPO VS. POLYREPO

QUESTION: “How does the design change between Photoshop-scale repositories and tiny microservices?”

TALKING SCRIPT: “I want the platform contract to remain common while execution profiles differ. A small service may require narrow context, lightweight sandboxing, fast tests, and short execution. A massive legacy codebase may require dependency-aware context resolution, larger workspaces, specialized build infrastructure, longer-running execution, incremental verification, and different models. That’s why I prefer workload and execution profiles over one universal agent configuration.”

KEY LINE: “Standardize the contract, not the workload.”

⸻

63. LARGE LEGACY CODEBASES

QUESTION: “How would an agent operate on a 30-year-old codebase?”

TALKING SCRIPT: “I’d reduce the scope of reasoning rather than assume a larger context window solves the problem. Use dependency and symbol information to identify the relevant slice, retrieve architectural and historical context, establish explicit change boundaries, and verify incrementally. For high-risk legacy systems, I’d also increase the verification strength and potentially reduce autonomy. Large context windows are useful, but they don’t replace understanding structure.”

KEY LINE: “Context windows scale tokens. Architecture intelligence scales understanding.”

⸻

64. CROSS-REPOSITORY WORK

QUESTION: “What if one objective requires changes across multiple repositories?”

TALKING SCRIPT: “Then the governed plan becomes an objective-level dependency graph rather than a single-repository task. Each work unit can have its own repository scope, execution identity, verification requirements, and factory/execution profile. The orchestration layer coordinates dependencies and aggregate acceptance criteria. I would avoid giving one worker unrestricted access to every repository merely because the overall objective spans several.”

KEY LINE: “Coordinate globally. Authorize locally.”

⸻

65. ONE FACTORY OR MULTIPLE FACTORIES?

QUESTION: “Do we need a separate factory for every workflow?”

TALKING SCRIPT: “No. I distinguish the enterprise software-factory platform from a factory definition. Adobe should generally have one shared substrate for identity, capability registry, model gateway, context, orchestration, sandboxing, verification, evidence, and governance. A factory is an outcome-specific governed configuration on top of that substrate. Features, bug fixes, tests, refactoring, and dependency updates may all belong to one Software Delivery Factory with different workflows. I create another factory only when the outcome requires materially different ownership, qualification, policy, authority, or lifecycle.”

KEY LINE: “One enterprise platform; multiple governed factory definitions only where the outcome requires them.”

⸻

66. HOW DO FACTORIES SHARE AGENTS?

QUESTION: “If there are multiple factories, do they each need their own agents?”

TALKING SCRIPT: “No. Factory count and agent count are independent. Agents, skills, tools, models, evaluators, and harnesses should be reusable capabilities in the shared registry. A Software Delivery Factory and a Modernization Factory may both use the same qualified coding capability or test capability while applying different plans, policies, verification requirements, and authority models.”

KEY LINE: “Factories compose capabilities. They don’t need to duplicate them.”

⸻

67. WHAT IF ONE OBJECTIVE REQUIRES MULTIPLE FACTORIES?

QUESTION: “Who orchestrates work across factories?”

TALKING SCRIPT: “I don’t want factories directly orchestrating one another because that creates hidden coupling and unclear authority. An objective-level planner/orchestrator decomposes the objective into governed work orders and routes each work order to the appropriate qualified factory definition. The factories execute their assigned outcomes and return evidence. The objective layer owns the dependency graph and determines whether the aggregate objective has been satisfied.”

KEY LINE: “Mission Control orchestrates the objective. Factories execute governed work.”

⸻

68. HOW DOES A BUILDER KNOW WHICH FACTORY TO USE?

QUESTION: “Do builders select a factory?”

TALKING SCRIPT: “Usually I don’t want them to. The builder should describe the outcome. The objective router interprets that intent and selects the appropriate qualified factory or combination of factories based on workload, policy, ownership, and required capabilities. Advanced users may explicitly request a factory when appropriate, but factory selection should not become another piece of infrastructure knowledge every builder has to learn.”

KEY LINE: “Route intent to factories; don’t make builders memorize the platform topology.”

⸻

69. HOW WOULD YOU PREVENT PLATFORM LOCK-IN?

QUESTION: “What if Adobe wants to replace the orchestrator, model provider, or harness later?”

TALKING SCRIPT: “I’d identify the durable contracts and keep replaceable components behind them. The stable contracts are around intent, governed plans, capabilities, execution state, evidence, policy, verification, and outcomes. Models, harnesses, workflow engines, vector stores, and even some sandbox implementations can evolve underneath those contracts. But abstraction has a cost, so I wouldn’t build theoretical portability everywhere. I’d create seams where we have genuine vendor, capability, or evolution risk.”

KEY LINE: “Abstract around expected change, not hypothetical change.”

⸻

70. HOW DO YOU AVOID OVERENGINEERING?

QUESTION: “This sounds like a lot. What would you actually build first?”

TALKING SCRIPT: “I would not build the complete architecture on day one. I’d start with three to five high-value builder journeys and design partners. Establish the minimum control plane, one secure execution path, a small capability registry, basic context, deterministic verification, evidence, and observable outcomes. Use existing harnesses and infrastructure where they satisfy the requirements. Then let real workloads tell us which abstractions need to become platform capabilities. I don’t want to build a universal agent operating system before we’ve observed enough real work to know what should be universal.”

KEY LINE: “Earn the platform through repeated workload evidence.”

⸻

71. WHAT WOULD YOU DELIBERATELY NOT BUILD FIRST?

QUESTION: “What wouldn’t you build?”

TALKING SCRIPT: “I would not build a proprietary foundation model, universal agent framework, giant multi-agent hierarchy, repository-specific fine-tuned model for every team, or massive evaluation platform before we have representative workloads. I wouldn’t create abstractions simply because they look elegant. Start with builder journeys, secure execution, evidence, evaluation, and the minimum shared capabilities required to make those journeys successful. Then extract common platform capabilities from repetition.”

KEY LINE: “Don’t platform hypothetical reuse.”

72. BUILD VS. ADOPT DECISION FRAMEWORK

QUESTION: “How do you decide whether Adobe should build or adopt a capability?”

TALKING SCRIPT: “I’d evaluate strategic differentiation, quality against Adobe workloads, security and compliance, integration cost, extensibility, portability, operational burden, economics, and rate of market evolution. If an external capability satisfies the requirements and the capability itself doesn’t differentiate Adobe, I’d rather adopt it and invest our engineering capacity elsewhere. If the capability is strategically important, deeply coupled to Adobe-specific context or policy, or external options consistently fail representative evaluations, then building becomes more compelling. I’d also consider reversibility: adopting something behind a stable interface is much safer than deeply coupling the platform to a vendor-specific execution model.”

KEY LINE: “Build where ownership creates advantage; adopt where ownership creates maintenance.”

FOLLOW-UP — “What if the external product is only 80% there?” “Then I’d compare the cost of closing the 20% gap through integration or extension with the full lifecycle cost of owning 100%. Build-versus-buy should include maintenance, qualification, upgrades, security response, and migration, not just initial implementation.”

⸻

73. DESIGN THE FIRST VERSION OF META FACTORY

QUESTION: “What would V1 actually contain?”

TALKING SCRIPT: “I’d deliberately keep V1 narrow. Pick 3–5 representative builder journeys and a small group of design partners. The minimum platform needs authenticated intent intake, a governed plan, a small qualified capability registry, one or two model routes, permission-aware context, durable workflow state, one secure remote execution path, deterministic verification, basic agentic evaluation where needed, evidence generation, human authority, and end-to-end observability. I’d integrate with existing source control, CI/CD, identity, and security systems rather than recreate them. The objective of V1 is not feature completeness; it’s proving the end-to-end trust loop on real workflows.”

KEY LINE: “Prove the lifecycle before expanding the surface area.”

⸻

74. HOW WOULD YOU ROLL IT OUT ACROSS ADOBE?

QUESTION: “How do you go from a pilot to thousands of builders?”

TALKING SCRIPT: “I’d scale through design partners → paved paths → measurable outcomes → progressive expansion. Start with teams that have real pain and enough engineering maturity to give useful feedback. Instrument everything so we know whether the platform improves cycle time, quality, economics, and builder experience. Convert repeated successful patterns into paved paths and reusable capabilities. Then onboard adjacent teams with similar workloads before expanding into fundamentally different domains. Forward-deployed engineers can accelerate this by building alongside teams, identifying missing platform capabilities, and contributing those improvements back into the shared product.”

KEY LINE: “Adoption should follow demonstrated value, not platform mandate.”

⸻

75. FORWARD-DEPLOYED ENGINEERING

QUESTION: “Where do FDEs fit into the architecture and operating model?”

TALKING SCRIPT: “I’d treat forward-deployed engineers as a product-learning mechanism, not a permanent services layer. They sit close to builders, help implement real workflows, understand where the platform breaks against reality, and contribute reusable capabilities back into Meta Factory. Their success isn’t measured by how many custom solutions they maintain; it’s how quickly a customer-specific need becomes a generalized platform capability where appropriate. That creates a loop between centralized platform engineering and domain-specific builder needs.”

KEY LINE: “Build with customers, not merely for customers.”

⸻

76. PLATFORM TEAM VS. DOMAIN TEAM OWNERSHIP

QUESTION: “Where should Meta Factory ownership stop?”

TALKING SCRIPT: “I’d centralize invariants and federate domain expertise. The platform should own identity, policy enforcement, model access, capability qualification, durable orchestration, sandboxing, evidence contracts, common observability, and shared evaluation infrastructure. Domain teams should own their acceptance criteria, domain-specific context, specialized skills, repository conventions, and business-specific verification. The platform should make those extensions safe and easy rather than trying to understand every Adobe domain centrally.”

KEY LINE: “Centralize invariants. Federate expertise.”

FOLLOW-UP — “What if teams bypass the platform?” “First ask why. If the paved path is slower, less capable, or harder than the workaround, that’s a product problem. Governance matters, but the strongest adoption mechanism is making the governed path the easiest path.”

⸻

77. HOW DO YOU AVOID THE PLATFORM BECOMING A BOTTLENECK?

QUESTION: “How do you keep a central platform from slowing teams down?”

TALKING SCRIPT: “The platform should own guardrails and reusable machinery, not every implementation decision. Give teams self-service APIs, SDKs, templates, qualified capabilities, extension points, and clear ownership boundaries. Automate qualification where possible. Define service levels for onboarding new capabilities. Measure time to onboard a repository, skill, model, and workflow. And preserve escape hatches for legitimate experimentation while keeping production authority governed. If every team needs a ticket to the platform group to innovate, we’ve centralized too much.”

KEY LINE: “Platform control should remove friction from governance, not create friction around innovation.”

⸻

78. PLATFORM VS. PRODUCT

QUESTION: “Is Meta Factory a platform or a product?”

TALKING SCRIPT: “Both dimensions matter. Architecturally it’s a platform because it provides shared capabilities used by many workflows. Operationally, I would run it like a product for builders. That means explicit personas, journeys, adoption funnels, usability, documentation, reliability, support, success metrics, and roadmap decisions driven by builder outcomes. Platform teams fail when they assume technical reuse automatically creates customer value.”

KEY LINE: “Platform is the architecture. Product is the operating mindset.”

⸻

79. WHAT IS THE DEVELOPER / BUILDER EXPERIENCE?

QUESTION: “How should builders experience all of this complexity?”

TALKING SCRIPT: “Ideally, they shouldn’t. The common path should feel much simpler than the architecture underneath it. A builder expresses the outcome from the environment where they already work—IDE, CLI, source control, issue system, or another Adobe workflow. The factory resolves capabilities, context, execution, and verification behind the interface. Advanced builders can inspect or override appropriate decisions, but the platform shouldn’t require every engineer to become an expert in models, orchestration, sandboxes, or token economics.”

KEY LINE: “Hide infrastructure complexity without hiding consequential decisions.”

⸻

80. HOW DO YOU SUPPORT EXTENSIBILITY?

QUESTION: “How do teams add new skills, tools, agents, or workflows?”

TALKING SCRIPT: “I’d provide explicit extension contracts. A capability declares identity, owner, version, schema, required permissions, supported workloads, cost characteristics, and evaluation requirements. Before production routing, it goes through qualification appropriate to its risk. Domain teams can develop capabilities independently, but Meta Factory controls whether a capability is discoverable, eligible, and authorized for a production workload. That gives teams flexibility without turning the platform into an ungoverned plugin ecosystem.”

KEY LINE: “Extensibility should expand capability without expanding implicit authority.”

⸻

81. HOW DO YOU QUALIFY A NEW CAPABILITY?

QUESTION: “A team wants to add a new coding agent. What happens?”

TALKING SCRIPT: “First establish its contract and authority: what workloads it supports, what context it requires, which tools it needs, what resources it can access, and what side effects it can create. Then run representative evaluations covering quality, security, reliability, latency, and economics. Verify sandbox and policy behavior. Establish ownership and operational support. If it clears the required threshold, register that exact version as qualified for defined workload classes. Qualification should be explicit and version-specific; updating the capability means requalifying behavior that materially changed.”

KEY LINE: “Registration makes a capability visible. Qualification makes it routable.”

⸻

82. WHAT IF A CAPABILITY DEGRADES AFTER QUALIFICATION?

QUESTION: “A model or tool starts performing worse in production. What happens?”

TALKING SCRIPT: “Qualification isn’t permanent. Production outcomes should continuously update our confidence in capabilities. If a capability falls below its quality, reliability, security, or economic threshold, the router can reduce traffic, quarantine it, or remove it from eligibility. Then investigate whether the issue is workload drift, provider behavior, context changes, tool degradation, or evaluation mismatch. The registry should represent current operational fitness, not simply historical approval.”

KEY LINE: “Qualification is evidence-backed and revocable.”

⸻

83. HOW DO YOU HANDLE PROVIDER RATE LIMITS?

QUESTION: “What happens when the best model has limited capacity?”

TALKING SCRIPT: “Provider capacity becomes another routing and scheduling constraint. The platform should know quotas, current utilization, expected latency, and eligible alternatives. High-priority workloads may reserve capacity; lower-priority work can queue or route elsewhere. I’d avoid letting every worker independently discover a provider limit through failed requests because that creates retry storms. Provider capacity should be managed centrally enough to support admission control and predictable degradation.”

KEY LINE: “Capacity is part of routing, not merely an error condition.”

⸻

84. WHAT IF CONTEXT IS STALE?

QUESTION: “The agent gets outdated repository or documentation context. How do you handle it?”

TALKING SCRIPT: “Context needs freshness metadata and provenance. For code, I want context aligned to the exact commit or workspace being modified. For enterprise knowledge, each source should expose version or freshness information where possible. High-consequence decisions may require live retrieval rather than relying on stale indexes. Verification can also detect some stale-context failures by evaluating against the actual current system state. I wouldn’t assume retrieval correctness simply because a search returned something relevant.”

KEY LINE: “Relevant context can still be wrong context if it isn’t current.”

⸻

85. CONTEXT WINDOW MANAGEMENT

QUESTION: “What if the repository context is larger than the model window?”

TALKING SCRIPT: “I wouldn’t solve that simply by choosing a model with a larger window. Start with the governed task and resolve the relevant dependency surface. Use symbol and dependency graphs, code search, repository structure, ownership, recent changes, and iterative retrieval to assemble the minimum sufficient context. Context can also be staged: planning may need architecture-level information, while implementation needs a narrower code slice. Larger context windows are useful, but indiscriminate context increases cost, latency, distraction, and sometimes quality degradation.”

KEY LINE: “Context engineering is selection, not accumulation.”

⸻

86. MEMORY VS. CONTEXT VS. STATE

QUESTION: “What’s the difference between agent memory, context, and state?”

TALKING SCRIPT: “I keep them conceptually separate. Context is the information presented to the model for the current reasoning step. State is authoritative workflow information the system needs to govern and recover execution. Memory is information from prior interactions or outcomes that may be useful to future reasoning. Context can be ephemeral, state generally needs durable semantics, and memory should have explicit provenance, scope, retention, and authorization. Mixing all three into a conversation history creates both reliability and security problems.”

KEY LINE: “Context informs reasoning. State governs execution. Memory informs future reasoning.”

⸻

87. HOW DO YOU HANDLE LONG-RUNNING TASKS?

QUESTION: “What if an autonomous migration runs for six hours?”

TALKING SCRIPT: “I wouldn’t model six hours as one giant model conversation. Decompose it into durable work units with checkpoints, bounded attempts, explicit acceptance criteria, and intermediate verification. Persist authoritative progress outside the model. Context should be reconstructed for each work unit from the plan, state, artifacts, and relevant history rather than relying on an ever-growing transcript. Budgets and leases apply at both work-unit and objective levels. Humans can pause or intervene at meaningful boundaries.”

KEY LINE: “Long-running autonomy should be durable workflow, not a long-running chat.”

⸻

88. HOW DO YOU CANCEL A RUN SAFELY?

QUESTION: “The builder cancels a task halfway through. What happens?”

TALKING SCRIPT: “Cancellation is a governed state transition. Stop scheduling new work, signal active workers, allow bounded cleanup where necessary, revoke task credentials, preserve the current artifacts and evidence, and distinguish between cancelled, rolled back, and partially completed. External side effects may require compensation rather than pretending cancellation erased them. The control plane remains authoritative about the final state.”

KEY LINE: “Cancellation stops future authority; it doesn’t magically undo past side effects.”

⸻

89. TRANSACTIONS AND COMPENSATION

QUESTION: “How do you handle a workflow that changes several external systems?”

TALKING SCRIPT: “I generally can’t rely on a distributed ACID transaction across source control, deployment systems, ticketing, and external tools. I’d use explicit workflow state, idempotent operations where possible, and compensating actions where reversal is required. The plan should identify consequential side effects and their rollback or compensation strategy before execution. If an operation isn’t safely reversible, that increases the required authority and verification before performing it.”

KEY LINE: “Irreversibility is an architectural input, not an incident surprise.”

⸻

90. HOW DO YOU HANDLE PARTIAL SUCCESS?

QUESTION: “Three of five tasks succeed and two fail.”

TALKING SCRIPT: “The answer depends on the objective’s semantics. If the tasks are independently valuable, preserve successful work and retry or escalate the failures. If the objective requires atomic acceptance, the overall outcome remains incomplete even though individual work units succeeded. The governed plan should define dependency and acceptance semantics so the runtime isn’t improvising them after failure. Evidence should clearly distinguish task success from objective success.”

KEY LINE: “A completed task is not necessarily a completed objective.”

⸻

91. HOW DO YOU HANDLE MODEL NONDETERMINISM?

QUESTION: “The same prompt produces different results. How do you operate that reliably?”

TALKING SCRIPT: “I don’t try to eliminate nondeterminism entirely; I design the system so correctness doesn’t depend on identical generation. Persist the inputs and versions necessary for operational reconstruction, constrain outputs through schemas where appropriate, use deterministic tools for invariants, and verify outcomes independently. For debugging, exact replay may not reproduce the same generation, so I care about reconstructing the execution conditions and reproducing the failure class, not pretending every token sequence is deterministic.”

KEY LINE: “Reliability should come from verified outcomes, not identical generations.”

⸻

92. WHAT DOES “REPRODUCIBLE” MEAN FOR AGENTS?

QUESTION: “Can an autonomous run really be reproduced?”

TALKING SCRIPT: “I distinguish bit-for-bit replay from operational reproducibility. With nondeterministic models and external dependencies, exact output may not always be possible. But I should be able to reconstruct the governed plan, factory version, model route, context provenance, tool versions, execution environment, policies, state transitions, artifacts, and verification evidence. That lets us understand and test the behavior even when a new inference isn’t token-identical.”

KEY LINE: “Reproducibility means reconstructable behavior and evidence, not necessarily identical tokens.”

⸻

93. HOW DO YOU TEST THE CONTROL PLANE ITSELF?

QUESTION: “Your evaluations test agents. How do you test the platform?”

TALKING SCRIPT: “The deterministic control plane gets conventional engineering rigor: unit tests, integration tests, state-machine tests, property-based testing where useful, fault injection, security tests, load tests, disaster-recovery exercises, and end-to-end workflow tests. Agent evaluations do not replace software testing. In fact, because the control plane governs probabilistic execution, I want its invariants tested more aggressively.”

KEY LINE: “Probabilistic workloads increase the need for deterministic platform testing; they don’t reduce it.”

⸻

94. CHAOS / FAULT INJECTION

QUESTION: “Would you use chaos engineering?”

TALKING SCRIPT: “Yes, selectively. I’d inject failures at boundaries we expect to fail: model timeout, tool failure, worker crash, lease expiry, state-store latency, sandbox provisioning failure, provider rate limit, network interruption, and verifier disagreement. The objective is to prove recovery semantics and blast-radius controls before production incidents do it for us. I wouldn’t randomly destroy production for theater; fault injection should validate explicit resilience hypotheses.”

KEY LINE: “Test the recovery path before you need the recovery path.”

⸻

95. WHAT IF OBSERVABILITY GOES DOWN?

QUESTION: “Can agents continue operating without tracing?”

TALKING SCRIPT: “I’d make that risk-dependent. Telemetry should be decoupled enough that a temporary observability failure doesn’t automatically crash all low-risk execution; workers can durably buffer essential events. But for high-autonomy or high-consequence workflows, losing the evidence required to supervise execution may itself require degradation or pause. Observability becomes part of the control architecture when autonomy is high.”

KEY LINE: “For autonomous systems, observability can become part of the safety boundary.”

⸻

96. HOW DO YOU HANDLE AUDIT AND COMPLIANCE?

QUESTION: “How do you make the system auditable?”

TALKING SCRIPT: “Every consequential action should be attributable to a builder identity, execution identity, qualified factory version, policy decision, capability version, and resulting evidence. Audit events should be immutable enough for the required compliance domain and separate from mutable operational state. The evidence plane should answer: who initiated this, what authority was delegated, what executed, what was verified, who approved it, and what outcome resulted. Compliance requirements should influence evidence retention and authority boundaries rather than being bolted on afterward.”

KEY LINE: “Autonomy increases the need for attributable decisions.”

⸻

97. HOW DO YOU HANDLE PRIVACY?

QUESTION: “What if model context contains sensitive Adobe or customer data?”

TALKING SCRIPT: “Data classification needs to participate in routing, retrieval, model eligibility, logging, and retention. Some data may be eligible only for particular providers or internal models. Retrieval must respect source permissions. Sensitive context should be minimized rather than copied broadly. Telemetry needs redaction and retention controls. And provider contracts don’t replace architectural controls—we still need to know exactly which data crosses which trust boundary.”

KEY LINE: “Data classification should influence execution, not merely storage.”

98. WHAT IF INFERENCE BECOMES NEARLY FREE?

QUESTION: “If frontier inference becomes almost free, does your routing architecture still matter?”

TALKING SCRIPT: “Cost-based routing becomes less important, and I would simplify it if the economics no longer justify the complexity. But routing can still matter for quality, latency, security, data residency, context capacity, tool-use capability, specialization, reliability, and provider availability. The important point is that routing is a mechanism, not a permanent architectural requirement. If one model eventually dominates every meaningful dimension, use it. I don’t want architecture that exists simply to justify architecture.”

KEY LINE: “If a constraint disappears, delete the architecture that existed only to manage that constraint.”

⸻

99. WHAT IF MODELS ABSORB THE HARNESS?

QUESTION: “What happens if models eventually handle planning, context, tools, memory, and orchestration themselves?”

TALKING SCRIPT: “Then I would gladly move those responsibilities into the model where evaluation proves it creates a better system. I don’t consider today’s harness boundary permanent. What I think remains durable is the distinction between intelligence and enterprise authority. Even if the model can plan perfectly and orchestrate tools perfectly, I still want external control over identity, permissions, budgets, execution isolation, policy, audit, consequential actions, and release authority. So the harness may shrink dramatically; the enterprise control boundary doesn’t necessarily disappear.”

KEY LINE: “The harness boundary can move. The authority boundary remains explicit.”

⸻

100. WHAT IF AI VERIFICATION BECOMES BETTER THAN HUMAN REVIEW?

QUESTION: “If AI reviewers outperform humans, why retain human review?”

TALKING SCRIPT: “I wouldn’t preserve human review for ceremonial reasons. If evaluation demonstrates that independent automated verification reliably exceeds human review for a workload class, then the autonomy boundary should move. Humans can move downstream toward policy, exceptions, ambiguous requirements, high-consequence actions, and organizational authority. The goal isn’t to preserve today’s workflow; it’s to allocate human judgment where it adds the most value. Verification strength and consequence should determine the authority model.”

KEY LINE: “Human authority should move as machine evidence improves.”

⸻

101. HOW DO YOU KNOW WHEN TO SIMPLIFY THE ARCHITECTURE?

QUESTION: “Agent platforms are evolving quickly. How do you avoid carrying obsolete complexity?”

TALKING SCRIPT: “I’d continuously evaluate whether each abstraction is still buying us something measurable. Does routing improve accepted-outcome economics? Does an orchestration layer improve recovery or merely duplicate model-native capability? Does a custom context service outperform provider-native retrieval enough to justify ownership? Does our harness add durable enterprise control or reproduce commodity functionality? If a layer no longer creates meaningful quality, security, reliability, economic, or organizational value, remove it. I want explicit architectural fitness criteria rather than treating today’s platform boundaries as permanent.”

KEY LINE: “The architecture should get simpler as models get better, not fight to justify its own existence.”

⸻

102. WHERE SHOULD THE MODEL BOUNDARY BE?

QUESTION: “What belongs inside the model versus outside it?”

TALKING SCRIPT: “I’d use a simple principle: put reasoning under uncertainty where the model is strong, and keep organizational invariants and consequential authority externally enforceable. Planning, interpretation, semantic analysis, synthesis, and dynamic strategy can increasingly move into models. Identity, authorization, budgets, audit, release policy, durable workflow ownership, and hard security boundaries should remain outside. Context selection and orchestration are moving boundaries that I would continuously reevaluate based on capability and evidence.”

KEY LINE: “Put intelligence where it creates leverage; keep invariants where they can be enforced.”

⸻

103. HOW DO YOU DESIGN FOR A MOVING BOUNDARY?

QUESTION: “How do you build a platform when the underlying technology changes every few months?”

TALKING SCRIPT: “I’d stabilize the contracts around the things I expect to remain durable: builder intent, governed plans, capability contracts, authorization, execution state, evidence, verification, authority, and outcomes. Behind those contracts, models, harnesses, orchestration frameworks, retrieval implementations, and evaluation techniques can evolve. I wouldn’t abstract everything preemptively, but I would create seams around areas with demonstrated volatility. The architecture should allow us to adopt better capabilities without rewriting the governance model.”

KEY LINE: “Stabilize the durable contracts. Keep the intelligence layer replaceable.”

⸻

104. HOW DO YOU PREVENT CORRELATED AGENT FAILURE?

QUESTION: “What if multiple agents all make the same mistake?”

TALKING SCRIPT: “Using multiple agents doesn’t automatically create independence. If they share the same model, context, prompt assumptions, and tools, they may fail in exactly the same way. For consequential verification, I want failure-mode diversity: deterministic tests, different context derivation, independent acceptance criteria, security tooling, different models where useful, adversarial evaluation, and potentially humans. I’d also look for systemic common-mode dependencies such as a corrupted context source or incorrect policy that could cause every agent to reach the same wrong conclusion.”

KEY LINE: “Redundancy without failure-mode diversity is not independence.”

⸻

105. WHAT IF THE PLAN ITSELF IS WRONG?

QUESTION: “You have strong execution and verification, but the planner misunderstood the objective.”

TALKING SCRIPT: “That’s why acceptance criteria need to be anchored to builder intent, not merely generated by the planner and then self-certified downstream. Before consequential execution, the governed plan should resolve material ambiguity and expose assumptions. Verification should evaluate the result against the accepted contract, not just whether the implementation followed the plan. For higher-risk work, plan review may itself be a gate. A perfectly executed wrong plan is still failure.”

KEY LINE: “Execution correctness cannot compensate for intent misalignment.”

⸻

106. WHAT IF ACCEPTANCE CRITERIA ARE AMBIGUOUS?

QUESTION: “How does the system know what ‘good’ means?”

TALKING SCRIPT: “The intent layer should distinguish ambiguity that can safely be resolved from ambiguity that changes the business outcome. The system can infer low-consequence details, but consequential uncertainty should trigger clarification. Acceptance criteria should become explicit enough to drive verification. Some criteria will be deterministic, others semantic, and some may require human judgment. The important point is that we establish the success contract before autonomous execution consumes significant resources.”

KEY LINE: “Clarify consequential ambiguity before automating it.”

⸻

107. WHAT IF THE BUILDER CHANGES THEIR MIND MID-RUN?

QUESTION: “Can intent change during execution?”

TALKING SCRIPT: “Yes, but I would treat a material intent change as a new governed revision, not silently mutate the active objective. Determine which completed work remains valid, invalidate affected downstream tasks, update acceptance criteria and dependencies, recalculate budget and authority where necessary, and preserve provenance between versions. Otherwise we lose the ability to explain what the system was actually trying to accomplish at any point.”

KEY LINE: “Intent can evolve; execution history should not be rewritten.”

⸻

108. HOW DO YOU HANDLE CONFLICTING REQUIREMENTS?

QUESTION: “Security says one thing, product says another, and the builder requests something incompatible.”

TALKING SCRIPT: “Not every requirement has equal authority. I’d model policy hierarchy and ownership explicitly. Hard enterprise security policy cannot be overridden by a builder prompt. Product requirements may constrain the plan. Repository-specific preferences may be advisory. If two authoritative policies genuinely conflict, execution should stop and escalate rather than letting the model choose which governance rule to ignore. The system needs to know both the requirement and the authority behind it.”

KEY LINE: “Requirements have semantics; policies have authority.”

⸻

109. HOW WOULD YOU DESIGN RISK CLASSIFICATION?

QUESTION: “How does Meta Factory determine whether something is high risk?”

TALKING SCRIPT: “I’d combine deterministic attributes with workload-specific classification. Signals include repository sensitivity, production impact, data classification, credential scope, security surface, deployment scope, reversibility, blast radius, novelty, verification strength, and requested authority. I wouldn’t make the LLM solely responsible for determining its own risk tier. The model may help classify semantic characteristics, but deterministic policy should ultimately map the workload into an authority profile.”

KEY LINE: “Risk classification can use intelligence; authority assignment should remain governed.”

⸻

110. EXECUTION PROFILES

QUESTION: “How would different workloads receive different controls?”

TALKING SCRIPT: “I’d use versioned Execution Profiles that bind the operational constraints for a workload class: eligible models, sandbox type, CPU and memory, repository scope, network policy, credential policy, tool access, timeouts, token and cost budgets, retry policy, verification requirements, evidence retention, and human-authority requirements. A low-risk documentation workflow and a production-sensitive migration shouldn’t share the same operational envelope.”

KEY LINE: “Autonomy needs an explicit execution envelope.”

⸻

111. HOW DO YOU PREVENT CONFIGURATION DRIFT?

QUESTION: “What if the model, skill, sandbox, and policy all evolve independently?”

TALKING SCRIPT: “Independent component evolution is fine during development, but production routing should target an immutable qualified composition. The factory version records the exact model route, skills, tools, policies, execution profile, verification requirements, and evaluation identity. Otherwise qualification becomes meaningless because the system we tested isn’t the system we’re running. Configuration changes produce a new candidate version and go through the appropriate qualification path.”

KEY LINE: “Qualification applies to a composition, not a collection of mutable pointers.”

⸻

112. HOW DO YOU HANDLE SCHEMA EVOLUTION?

QUESTION: “Tools and agent contracts change over time. How do you prevent breakage?”

TALKING SCRIPT: “Capability contracts should be explicitly versioned. Breaking changes require new contract versions rather than silently changing existing behavior. The registry can describe compatibility, and factory versions bind to specific supported contracts. Where possible, adapters can preserve compatibility during migration. I’d test contract compatibility independently from model quality because a brilliant model still fails if its tool schema no longer matches the runtime.”

KEY LINE: “Tool contracts are APIs. Treat them like APIs.”

⸻

113. HOW DO YOU HANDLE TOOL SIDE EFFECTS?

QUESTION: “The agent can call tools that modify real systems. How do you control that?”

TALKING SCRIPT: “I’d distinguish read capabilities from side-effecting capabilities, and then classify side effects by risk and reversibility. The model requests an action; a deterministic gateway validates identity, parameters, policy, budget, and authority before invocation. High-risk actions may require approval or staged execution. Tool results and side effects become part of evidence. For irreversible operations, the governed plan should define verification and rollback or compensation strategy before execution.”

KEY LINE: “Tool use is where reasoning becomes consequence.”

⸻

114. MCP SERVER FAILS MID-RUN

QUESTION: “A required tool becomes unavailable halfway through execution.”

TALKING SCRIPT: “The runtime should classify whether the capability is required, replaceable, or deferrable. If an equivalent qualified tool exists, the router may choose it. If the operation is safely retryable, backoff may be appropriate. If the missing capability prevents verification or creates uncertainty around side effects, pause or fail rather than pretending the objective completed. The plan should make capability dependencies explicit enough that the runtime can reason about the impact.”

KEY LINE: “Capability failure should change execution state, not disappear into the prompt.”

⸻

115. HOW DO YOU DESIGN TOOL APPROVAL?

QUESTION: “Does every new MCP tool need central approval?”

TALKING SCRIPT: “Not necessarily the same approval process. I’d make qualification risk-tiered. A read-only internal documentation tool can have a lightweight automated qualification path. A capability capable of modifying production infrastructure requires substantially stronger security review, testing, ownership, monitoring, and authority controls. Central governance should define the qualification contract; it doesn’t need to manually inspect every low-risk capability forever.”

KEY LINE: “Centralize the standard for trust, not every act of trusting.”

⸻

116. WHAT IF AN AGENT CALLS THE WRONG TOOL?

QUESTION: “The model selects a valid tool, but it’s the wrong tool for the task.”

TALKING SCRIPT: “Tool authorization only answers whether the action is permitted, not whether it is wise. For low-risk actions, verification and outcome evaluation may be enough. For consequential actions, the plan can constrain allowable capability classes or require preconditions before invocation. We can also evaluate tool-selection accuracy from historical trajectories and feed that back into capability routing or skills. But I wouldn’t attempt to hard-code every valid tool sequence because that destroys the value of agentic reasoning.”

KEY LINE: “Authorization prevents forbidden actions; evaluation improves poor decisions.”

⸻

117. HOW WOULD YOU DESIGN A MODEL GATEWAY?

QUESTION: “What does the model gateway do?”

TALKING SCRIPT: “The gateway gives the enterprise one governed interface to model providers. It can enforce identity, model eligibility, data policy, quotas, rate limits, routing metadata, request telemetry, cost accounting, provider failover policy, and version control. I would be careful not to make it responsible for every piece of agent logic. It should govern access to inference, while the orchestration and harness layers govern workload execution.”

KEY LINE: “Centralize model access without centralizing every reasoning decision.”

⸻

118. HOW DO YOU HANDLE MODEL CONTEXT LIMITS?

QUESTION: “What if the task requires more information than the selected model can handle?”

TALKING SCRIPT: “That can make the model ineligible for the workload, or it can change the context strategy. The router needs to understand capability constraints such as effective context capacity. But before escalating to a larger model, I’d ask whether the task can be decomposed or context can be narrowed structurally. The goal isn’t to fill the largest available context window; it’s to provide the right information for each reasoning step.”

KEY LINE: “Context capacity is a capability constraint, not a target to fill.”

⸻

119. HOW WOULD YOU SUPPORT LOCAL MODELS?

QUESTION: “Where do local or Adobe-hosted models fit?”

TALKING SCRIPT: “They fit into the same capability model. I wouldn’t architect a separate factory around them. A local or internally hosted model may be attractive for privacy, latency, economics, offline use, or specialization. It gets qualified against workloads like any other capability and routed only where its measured quality and policy profile are sufficient. I wouldn’t use a weaker local model merely because it’s local, and I wouldn’t use an expensive frontier model merely because it’s fashionable.”

KEY LINE: “Model location is a capability attribute, not an architecture.”

⸻

120. TRAINING ON COMPANY DATA

QUESTION: “Would you train models on Adobe’s internal engineering data?”

TALKING SCRIPT: “Potentially, but I’d first identify what problem training solves better than retrieval, skills, or prompting. For dynamic and permission-sensitive knowledge, retrieval is generally easier to govern and update. For stable domain behavior that repeatedly consumes context or produces measurable quality gaps, fine-tuning or continual pretraining may make sense. Any training pipeline also creates data-governance, evaluation, lineage, security, and model-lifecycle obligations. I’d require evidence that the quality or economic gain justifies those obligations.”

KEY LINE: “Training is an optimization, not the default answer to missing context.”

⸻

121. HOW WOULD YOU HANDLE MODEL TRAINING DATA GOVERNANCE?

QUESTION: “What internal data can go into model training?”

TALKING SCRIPT: “I’d require explicit data classification, provenance, usage rights, retention policy, privacy controls, and lineage. Repository access doesn’t automatically imply permission to use that repository as training data. Customer data, employee data, secrets, licensed code, and sensitive security information may have completely different constraints. The resulting model also needs a defined ownership and qualification lifecycle because knowledge moved into weights is harder to selectively revoke than retrieved context.”

KEY LINE: “Permission to read data is not automatically permission to train on it.”

⸻

122. WHAT IF YOU NEED TO FORGET TRAINED DATA?

QUESTION: “How do you remove information once it’s in model weights?”

TALKING SCRIPT: “That’s one reason I prefer retrieval for dynamic or revocable enterprise knowledge. Removing specific learned information from model weights is materially harder than removing it from a retrieval index. If revocability is a requirement, that should influence the original architecture choice. For trained models, we may need retraining, model replacement, or specialized unlearning techniques, but I wouldn’t promise fine-grained deletion unless the model lifecycle actually supports it.”

KEY LINE: “Revocability is one of the hidden costs of putting knowledge into weights.”

⸻

123. DESIGN THE SOFTWARE-DELIVERY FACTORY

QUESTION: “What does a Software Delivery Factory actually do?”

TALKING SCRIPT: “It is an outcome-specific factory on the shared Meta Factory substrate. It can handle features, bug fixes, refactoring, test generation, dependency updates, security fixes, and releases through different governed workflows. It composes reusable planning, coding, testing, security, verification, and deployment capabilities rather than owning bespoke versions of each. The factory definition specifies the lifecycle, policies, verification requirements, execution profiles, and authority model for software-delivery outcomes.”

KEY LINE: “The factory is a governed composition of reusable capabilities around an outcome.”

⸻

124. FACTORY VS. AGENT

QUESTION: “Why isn’t a coding agent itself a factory?”

TALKING SCRIPT: “Because an agent is an execution capability. A factory governs an outcome lifecycle. A coding agent may modify code. The factory determines why that work exists, what plan it belongs to, what authority applies, which verification must occur, what evidence is required, whether the result can progress, and what production outcome resulted. One factory can use many agents, and one agent can be reused by many factories.”

KEY LINE: “Agent count and factory count are independent architectural dimensions.”

⸻

125. FACTORY VS. HARNESS

QUESTION: “What’s the difference between a harness and a factory?”

TALKING SCRIPT: “The harness governs the execution lifecycle of an agent: context, tools, state, loop behavior, retries, budgets, and stopping. The factory governs the outcome lifecycle: intent, planning, capability composition, execution, independent verification, evidence, authority, delivery, outcome, and learning. A factory may use multiple harnesses depending on the capabilities involved.”

KEY LINE: “The harness governs execution. The factory governs outcomes.”

126. FACTORY VERSION VS. EXECUTION PROFILE

QUESTION: “What’s the difference between a Factory Version and an Execution Profile?”

TALKING SCRIPT: “I’d separate what behavior has been qualified from the operational envelope under which work executes. A Factory Version is the immutable, qualified composition of workflow behavior: planning strategy, capability routes, skills, tools, policies, verification requirements, and compatible runtime artifacts. An Execution Profile defines operational constraints such as sandbox type, compute, network policy, credentials, repository scope, timeouts, token and cost budgets, retry limits, and authority requirements. A Factory Version may support multiple qualified Execution Profiles for different risk or workload classes, but I don’t want arbitrary combinations assembled dynamically in production.”

KEY LINE: “Factory Version defines qualified behavior. Execution Profile defines the bounded operating envelope.”

⸻

127. THREE LEVELS OF ROUTING

QUESTION: “Where does routing actually happen?”

TALKING SCRIPT: “I’d distinguish three routing decisions because they solve different problems. Level 1 is objective routing: given builder intent, which factory or factories are capable of satisfying the objective? Level 2 is work-order routing: once the objective is decomposed, which qualified Factory Version should execute each work unit? Level 3 is task routing: inside that factory execution, which model, skill, tool, agent, or deterministic capability should perform a specific task? Mixing those together creates an opaque router trying to solve business intent, platform selection, and inference optimization simultaneously.”

KEY LINE: “Route the objective to factories, work to qualified versions, and tasks to capabilities.”

WHITEBOARD: Objective → Factory → Factory Version → Work Order → Model/Skill/Tool

⸻

128. HOW DO YOU ROUTE BUILDER INTENT TO A FACTORY?

QUESTION: “How does the system know which factory should handle an objective?”

TALKING SCRIPT: “Each factory should publish a capability and outcome contract describing the objective classes it supports, required inputs, constraints, policy domain, acceptance semantics, and qualification status. The objective router compares normalized builder intent against those contracts. If one factory can satisfy the objective, route there. If multiple factories are required, the objective planner creates a dependency graph across governed work orders. If confidence is insufficient or the objective falls outside qualified capability, clarify with the builder rather than guessing.”

KEY LINE: “Factory routing should be based on qualified outcome capability, not naming conventions.”

⸻

129. WHAT IF THE OBJECTIVE REQUIRES MULTIPLE FACTORIES?

QUESTION: “Suppose modernization, security remediation, and software delivery are all required. Who coordinates them?”

TALKING SCRIPT: “The objective orchestration layer owns the aggregate dependency graph. It may produce one work order for modernization analysis, another for remediation, and another for software delivery. Each work order routes to an independently qualified Factory Version. Factories don’t call each other and silently transfer authority. They return artifacts and evidence to the objective layer, which evaluates dependencies and aggregate acceptance criteria before progressing.”

KEY LINE: “Factories don’t orchestrate each other. The objective orchestrator composes their outcomes.”

⸻

130. HOW DO YOU HANDLE DEPENDENCY GRAPHS?

QUESTION: “How would you represent dependencies between autonomous tasks?”

TALKING SCRIPT: “I’d represent the governed plan as a DAG where possible, with explicit work-order dependencies, acceptance criteria, required artifacts, and verification gates. Tasks become eligible only when prerequisites are satisfied. Independent branches can execute concurrently. If execution discovers a new dependency, that becomes a governed plan revision rather than invisible agent state. I’d also detect cycles before execution because an unresolved cyclic dependency should fail planning rather than deadlock workers.”

KEY LINE: “Parallelize independent work; govern dependency changes explicitly.”

⸻

131. HOW DO YOU HANDLE PARALLEL AGENTS MODIFYING THE SAME CODE?

QUESTION: “What happens when multiple agents touch overlapping files?”

TALKING SCRIPT: “I’d avoid letting agents write concurrently into one shared working tree. Each attempt should have an isolated workspace or Git worktree based on an explicit baseline. The plan should minimize overlapping ownership where possible. Before integration, detect conflicting file or semantic changes and either serialize dependent work, rebase against the new baseline, or trigger reconciliation. Verification runs against the integrated candidate, not merely each isolated patch, because individually correct changes can interact badly.”

KEY LINE: “Parallelize execution without sharing mutable workspace.”

⸻

132. HOW DO YOU HANDLE GIT AND SOURCE CONTROL?

QUESTION: “Where does Git fit into the factory?”

TALKING SCRIPT: “Source control remains the durable engineering system of record for code. The factory creates attempt-specific branches or worktrees from known commits, records the exact baseline, captures candidate diffs, and associates them with execution evidence. Agents should not have unrestricted ability to rewrite shared history. Publication should occur through governed platform mechanisms, and merge authority remains separate from implementation authority. The factory complements Git; it doesn’t invent a new source-control system.”

KEY LINE: “Agents produce candidates. Governed source control publishes accepted state.”

⸻

133. SHOULD AGENTS BE ALLOWED TO PUSH CODE?

QUESTION: “Would the sandbox have GitHub write credentials?”

TALKING SCRIPT: “My default would be no broad persistent repository credential inside the sandbox. The sandbox can produce a candidate diff or commit locally. A trusted host-side or platform publication mechanism can validate the execution identity, repository scope, evidence, and policy before pushing. If direct push is necessary for a workflow, use narrowly scoped short-lived credentials and explicit branch restrictions. Implementation authority and publication authority should remain separable.”

KEY LINE: “Writing code and publishing code are different authorities.”

⸻

134. SHOULD AGENTS AUTO-MERGE?

QUESTION: “Would you eventually allow autonomous merge?”

TALKING SCRIPT: “For some workload classes, potentially yes—but only when the system has earned that authority. I’d require strong deterministic verification, independent evidence, low consequence, reversibility, sufficient historical confidence, and explicit policy permitting it. I wouldn’t make ‘human merge forever’ a philosophical requirement, but I also wouldn’t grant merge authority merely because an agent reports that its tests passed. Authority should expand with demonstrated verification strength.”

KEY LINE: “Autonomous merge should be an earned capability, not a default feature.”

⸻

135. HOW WOULD YOU DESIGN PREVIEW ENVIRONMENTS?

QUESTION: “How does the builder inspect an autonomous change before release?”

TALKING SCRIPT: “For changes where runtime behavior matters, the factory can create an ephemeral preview environment from the candidate artifact. That allows automated functional evaluation, visual or accessibility checks, security testing, and human inspection against the acceptance criteria. Preview environments should be tied to the exact candidate version and destroyed after their retention window. They become another verification capability rather than an informal demo environment.”

KEY LINE: “Preview is part of verification when correctness is experiential.”

⸻

136. HOW WOULD YOU DESIGN RELEASE AUTHORITY?

QUESTION: “Who decides whether something can deploy?”

TALKING SCRIPT: “Release authority should be determined by the risk policy associated with the workload and environment. The factory assembles evidence; policy evaluates mandatory gates; humans exercise authority where required. Low-risk changes with strong verification may progress automatically through progressive delivery. Higher-risk changes may require named approvers or separation of duties. The producing agent never gets release authority merely by producing the artifact.”

KEY LINE: “Evidence informs authority. It does not replace authority.”

⸻

137. HOW DO YOU HANDLE PROGRESSIVE DELIVERY?

QUESTION: “How would an autonomous factory deploy safely?”

TALKING SCRIPT: “I’d reuse existing deployment infrastructure and progressive-delivery mechanisms rather than reinvent them. The factory can invoke feature flags, canaries, staged rollout, traffic splitting, health gates, and automated rollback as deterministic capabilities. Production telemetry becomes additional evidence. A successful pre-production evaluation isn’t proof that the production outcome is healthy, so release continues to be an observed workflow.”

KEY LINE: “Deployment is not the end of verification; production outcome closes the loop.”

⸻

138. WHAT IF THE DEPLOYMENT IS HEALTHY TECHNICALLY BUT THE OUTCOME IS BAD?

QUESTION: “All SLOs are green, but users dislike the change.”

TALKING SCRIPT: “That distinguishes system health from outcome success. Technical telemetry may show availability and latency are fine while product or builder metrics show the intended objective wasn’t achieved. The original intent contract should include measurable success criteria where possible. Those production outcome signals feed learning and potentially trigger rollback or iteration. An autonomous factory should optimize for accepted outcomes, not merely technically successful deployment.”

KEY LINE: “A successful deployment is not necessarily a successful outcome.”

⸻

139. WHAT DOES THE LEARNING SYSTEM ACTUALLY CHANGE?

QUESTION: “What artifacts are allowed to self-improve?”

TALKING SCRIPT: “Potential candidate changes include routing policy, prompts, skills, retrieval strategies, tool selection, agent definitions, verification rules, evaluation cases, and potentially execution strategies. I’d be much more conservative around identity, authorization, security policy, and hard organizational invariants. Every candidate change has an owner, version, evaluation identity, baseline comparison, and promotion path. Self-improvement should generate candidates, not silently rewrite production.”

KEY LINE: “Self-improvement proposes behavior. Governance decides production behavior.”

⸻

140. HOW DO YOU AVOID REWARD HACKING?

QUESTION: “What if the factory learns to optimize the metric instead of the real outcome?”

TALKING SCRIPT: “That is a serious risk whenever the system optimizes against evaluations. I’d avoid a single scalar reward representing success. Use multiple independent quality, safety, reliability, economic, and outcome measures, holdout evaluations, adversarial cases, and production outcome checks. Keep some evaluation criteria hidden from the producing system where appropriate. Watch for suspicious metric improvement without corresponding real-world benefit. And periodically change or expand the evaluation distribution as behavior evolves.”

KEY LINE: “Never let the metric become easier to satisfy than the objective it represents.”

⸻

141. HOW DO YOU KEEP EVALS FROM BEING GAMED?

QUESTION: “If agents know the eval suite, won’t they optimize to it?”

TALKING SCRIPT: “Potentially. I’d use a mixture of visible development evaluations, protected holdouts, historical production failures, adversarial cases, and continuously refreshed workloads. The goal isn’t secrecy for its own sake; it’s preventing overfitting to a narrow benchmark. Evaluation quality itself should be measured by how well it predicts production outcomes.”

KEY LINE: “The eval suite is a model of reality. Production tells us whether the model is good.”

⸻

142. DETERMINISTIC EVAL VS. LLM-AS-JUDGE

QUESTION: “When would you use an LLM judge?”

TALKING SCRIPT: “Only when the property we need to evaluate is genuinely semantic or difficult to encode deterministically. If compilation, tests, schemas, static analysis, security rules, or exact assertions can answer the question, use them. For semantic requirements, an LLM judge may add value, but I want calibrated rubrics, representative examples, judge evaluation, and potentially independent models for consequential decisions. LLM-as-judge should complement hard evidence, not replace it.”

KEY LINE: “Use deterministic evidence whenever correctness is deterministic.”

⸻

143. HOW DO YOU EVALUATE THE EVALUATOR?

QUESTION: “How do you know your LLM judge is reliable?”

TALKING SCRIPT: “Create a labeled benchmark containing human-reviewed examples, edge cases, adversarial cases, and known disagreements. Measure judge precision, recall, consistency, calibration, and failure patterns. Compare judge decisions with downstream human corrections and production outcomes. Version the evaluator like any other production dependency. If changing the judge changes whether the same candidate passes, that is a behavior change requiring qualification.”

KEY LINE: “Evaluators are production components and need evaluations too.”

⸻

144. HOW DO YOU HANDLE FALSE POSITIVES IN CODE REVIEW?

QUESTION: “An AI reviewer overwhelms developers with noise.”

TALKING SCRIPT: “Then raw finding count is the wrong success metric. I’d measure finding acceptance, precision by category, severity calibration, developer correction, and downstream defect prevention. Low-confidence findings may be suppressed, grouped, or presented differently. Repository-specific feedback can improve skills and context. A reviewer that catches everything but trains developers to ignore it is operationally ineffective.”

KEY LINE: “Review quality is signal delivered, not findings generated.”

⸻

145. HOW DO YOU HANDLE FALSE NEGATIVES?

QUESTION: “What about defects the reviewer misses?”

TALKING SCRIPT: “Escaped defects become some of the most valuable evaluation data we have. Trace them back to determine whether the failure came from missing context, inadequate verification, weak model capability, incorrect routing, absent tests, or an evaluation gap. Then add representative regression cases and decide whether the verification portfolio needs another independent mechanism. I wouldn’t expect one reviewer to achieve perfect recall.”

KEY LINE: “Every escaped defect is evidence about the verification system.”

⸻

146. HOW DO YOU DESIGN REPOSITORY-SPECIFIC SKILLS?

QUESTION: “What is a skill in this architecture?”

TALKING SCRIPT: “I think of a skill as a versioned reusable capability package containing instructions, context strategy, tool contract, constraints, and evaluation identity for a particular kind of work. Skills can exist at enterprise, domain, product, or repository scope. They should be independently owned and evaluated. A repository-specific review skill might know local architecture conventions and tests without requiring a repository-specific model.”

KEY LINE: “Specialize behavior before specializing the model.”

⸻

147. SKILLS VS. AGENTS

QUESTION: “What’s the difference between a skill and an agent?”

TALKING SCRIPT: “A skill describes reusable capability; an agent is an executing actor or configuration that can use capabilities. I don’t want every reusable behavior turned into another long-lived agent persona. A coding agent can invoke a test-generation skill, migration skill, or repository-review skill depending on the task. Keeping those concerns separate improves reuse and qualification.”

KEY LINE: “Agents execute. Skills package reusable behavior.”

⸻

148. HOW DO YOU HANDLE SKILL CONFLICTS?

QUESTION: “Two skills give contradictory instructions.”

TALKING SCRIPT: “Skills need explicit scope, precedence, compatibility, and ownership. Enterprise policy isn’t just another skill and should override conflicting behavioral instructions. Domain and repository skills can compose where compatible. If two equally authoritative capabilities conflict in a consequential way, planning should detect that and resolve or escalate rather than asking the model to arbitrarily choose.”

KEY LINE: “Composable capabilities still need deterministic precedence.”

⸻

149. HOW DO YOU VERSION PROMPTS?

QUESTION: “Do prompts really need production versioning?”

TALKING SCRIPT: “Yes, if changing them can materially change system behavior. Prompts, system instructions, and templates should have explicit versions, evaluation history, owners, and rollout semantics. But I wouldn’t treat prompts as the entire product. They’re one behavioral artifact among models, skills, context strategies, tools, policies, and evaluations. The qualified factory version records the exact prompt or instruction identity used.”

KEY LINE: “If changing it can change production behavior, version it.”

⸻

150. PROMPT TEMPLATE VS. GOVERNED WORKFLOW

QUESTION: “Why isn’t a good prompt template enough?”

TALKING SCRIPT: “A prompt can guide reasoning, but it cannot reliably own identity, durable state, authorization, budgets, side-effect control, independent verification, evidence, or release authority. Prompt templates are useful behavioral artifacts inside a larger governed runtime. As autonomy and consequence increase, the platform needs enforceable controls outside natural-language instructions.”

KEY LINE: “Prompts influence behavior. Runtime enforces invariants.”

⸻

151. HOW DO YOU HANDLE TOKEN BUDGETS ACROSS A DAG?

QUESTION: “A complex objective has 50 tasks. How do you allocate budget?”

TALKING SCRIPT: “I’d establish an objective-level budget and then allocate or reserve portions to work orders based on estimated complexity and priority. Work units report actual consumption. Unused reservations can return to the objective pool. If one branch begins consuming disproportionate budget without progress, the orchestrator can stop, reroute, or request additional authority rather than starving every other branch. Budget becomes another governed resource in the dependency graph.”

KEY LINE: “Budget should follow the plan, not emerge from accumulated API calls.”

⸻

152. HOW DO YOU ESTIMATE COST BEFORE EXECUTION?

QUESTION: “Can you know what an agent run will cost?”

TALKING SCRIPT: “Not perfectly, but planning can produce a bounded estimate based on task class, historical trajectories, expected context, model route, tool usage, sandbox duration, and verification requirements. I’d treat it as a range with confidence rather than false precision. High-cost objectives can require budget approval before execution. Over time, actual outcomes improve the estimator.”

KEY LINE: “Estimate probabilistically; enforce budgets deterministically.”

⸻

153. WHAT IF THE BUDGET IS EXHAUSTED MID-RUN?

QUESTION: “The task is almost finished but has no budget left.”

TALKING SCRIPT: “The agent shouldn’t silently exceed the limit. The runtime pauses at a safe boundary and evaluates the policy. Low-cost overage may be automatically allowed within a predefined reserve; larger increases may require authorization. The system should present progress, remaining work, evidence, estimated additional cost, and alternatives. Budget exhaustion is an execution state, not a prompt suggestion.”

KEY LINE: “Budget authority belongs outside the agent.”

⸻

154. LATENCY VS. QUALITY

QUESTION: “How do you optimize an interactive coding workflow versus autonomous background work?”

TALKING SCRIPT: “They should be different workload classes. Interactive experiences prioritize fast first response, incremental feedback, and bounded reasoning. Background autonomous work can spend more time planning, use stronger reasoning models, execute deeper verification, and tolerate longer queues. Trying to force both through one latency and model policy creates poor economics and poor user experience.”

KEY LINE: “Different latency budgets justify different intelligence strategies.”

⸻

155. STREAMING VS. DURABLE EXECUTION — CONTINUED

QUESTION: “Would you stream agent activity to the builder?”

TALKING SCRIPT: “Yes, but I’d separate the experience stream from authoritative execution state. The UI can stream plan progress, tool activity, artifacts, verification results, and requests for intervention so the builder understands what is happening. But if the browser disconnects or the stream drops, execution must continue correctly because durable state lives in the control plane. When the builder reconnects, the UI reconstructs the current state from durable events rather than depending on the original stream.”

KEY LINE: “Streaming is an experience mechanism. Durable state is the source of truth.”

⸻

156. EVENT-DRIVEN VS. REQUEST/RESPONSE

QUESTION: “Would Meta Factory be event-driven?”

TALKING SCRIPT: “For long-running autonomous work, largely yes. Builder APIs can remain request/response for submission and queries, but execution naturally produces asynchronous events: plan created, work ready, worker acquired, tool completed, verification failed, approval required, deployment started, outcome observed. An event-driven model decouples components and supports recovery, observability, and long-running workflows. But I wouldn’t turn every internal function call into an event. Use events where asynchronous state transitions and independent consumers create value.”

KEY LINE: “Use events for durable lifecycle transitions, not architectural fashion.”

⸻

157. EVENT ORDERING

QUESTION: “What if events arrive out of order?”

TALKING SCRIPT: “I wouldn’t assume global ordering. Events should carry execution identity, aggregate identity, sequence or version information, and idempotency metadata where ordering matters. State transitions validate that an event is legal relative to the authoritative current state. For many independent work orders, global ordering isn’t necessary; we need ordering within the relevant workflow or aggregate. Late or duplicate events should not be able to move authoritative state backward.”

KEY LINE: “Order only where the business invariant requires order.”

⸻

158. EVENT REPLAY

QUESTION: “Would you support replay?”

TALKING SCRIPT: “For durable lifecycle events, replay can be extremely valuable for reconstructing state, debugging, rebuilding projections, and incident analysis. But replaying state events is different from replaying side effects. I can rebuild an observability view from historical events; I should not accidentally rerun a deployment because I replayed its event history. Commands and events need different semantics.”

KEY LINE: “Replay history freely; replay side effects deliberately.”

⸻

159. COMMANDS VS. EVENTS

QUESTION: “What’s the distinction?”

TALKING SCRIPT: “A command requests an action: run verification, create sandbox, publish candidate. An event records something that happened: sandbox created, verification completed, candidate published. Commands may be rejected based on state or policy. Events should represent immutable historical facts. Keeping those semantics separate makes recovery, audit, and authorization much easier to reason about.”

KEY LINE: “Commands express intent. Events record fact.”

⸻

160. WHAT IF A COMMAND IS REPLAYED?

QUESTION: “How do you stop duplicate or malicious commands?”

TALKING SCRIPT: “Commands should carry identity, authorization context, unique command IDs, freshness or expiry information, and potentially signatures for sensitive boundaries. The receiving system validates ownership, current state, idempotency, and policy before performing the action. A previously valid command shouldn’t automatically remain valid forever. For consequential operations, replay protection is part of the authority model.”

KEY LINE: “Authorization answers who may act; replay protection answers whether this action is still valid now.”

⸻

161. LEASES VS. LOCKS

QUESTION: “Why use leases instead of locks for workers?”

TALKING SCRIPT: “A distributed worker can disappear without releasing a conventional lock. A lease expires, allowing the system to recover ownership after failure. Workers periodically renew their lease while healthy. Any publication of authoritative results should verify that the worker still owns the lease. Otherwise a slow or partitioned worker could return after another worker took over and publish stale results.”

KEY LINE: “A lease makes ownership recoverable.”

⸻

162. THE STALE-WORKER PROBLEM

QUESTION: “Worker A pauses, Worker B takes over, then Worker A wakes up. What happens?”

TALKING SCRIPT: “Worker A must no longer have publication authority. Every consequential state mutation or artifact publication checks the current lease or fencing token. Once B acquires newer ownership, A’s stale token is rejected. Killing the process isn’t sufficient because network partitions and delayed workers happen. Ownership has to be enforced at the resource boundary.”

KEY LINE: “A stale worker may continue computing; it must not continue committing.”

⸻

163. CHECKPOINTING STRATEGY

QUESTION: “How frequently would you checkpoint?”

TALKING SCRIPT: “At meaningful recovery boundaries, not after every token. Good checkpoints occur after expensive or consequential units of work: plan completion, repository mutation, successful build, completed verification stage, external side effect, or work-order completion. Too little checkpointing increases recovery cost; too much creates storage and coordination overhead. I’d optimize checkpoint frequency around the cost of recomputation and consequence of losing progress.”

KEY LINE: “Checkpoint around durable progress, not arbitrary time intervals.”

⸻

164. WHAT GOES INTO A CHECKPOINT?

QUESTION: “What do you need to resume safely?”

TALKING SCRIPT: “Enough to reconstruct the approved execution context: plan/work-order version, current state, baseline commit, candidate artifacts, completed tool results, verification status, budget consumption, capability versions, relevant context references, and outstanding dependencies. I don’t necessarily need the complete conversational transcript. Resume should reconstruct from governed state and artifacts rather than trust an opaque memory blob.”

KEY LINE: “Resume from durable state, not from conversational nostalgia.”

⸻

165. WORKER ISOLATION

QUESTION: “Would multiple agent runs share workers?”

TALKING SCRIPT: “The answer depends on the risk and isolation technology, but I would strongly prefer task-level isolation for untrusted code execution. Reusing hosts can be economically necessary, but workloads should not share filesystem state, credentials, process namespaces, or residual secrets. Higher-risk workloads may justify stronger isolation such as microVMs. The execution profile determines the required boundary.”

KEY LINE: “Reuse infrastructure where economical; never reuse authority accidentally.”

⸻

166. CONTAINERS VS. MICROVMS

QUESTION: “Containers, gVisor, Firecracker—what would you choose?”

TALKING SCRIPT: “I’d choose based on the required isolation strength, startup latency, workload compatibility, operational maturity, and economics. Standard containers are fast but provide a weaker boundary against hostile workloads. Sandboxed runtimes or microVMs provide stronger isolation at additional complexity and startup cost. I would not make one universal choice. Risk-tiered Execution Profiles can use different isolation mechanisms while preserving the same higher-level execution contract.”

KEY LINE: “Isolation strength should follow workload risk.”

⸻

167. BUILD ENVIRONMENT REPRODUCIBILITY

QUESTION: “How do you make sure the agent builds against the right environment?”

TALKING SCRIPT: “Execution should start from a versioned environment definition: container or VM image, toolchain, dependencies, repository baseline, environment variables, network policy, and capability versions. That exact environment identity becomes part of evidence. Otherwise a successful agent run may be impossible to reproduce because the underlying toolchain drifted.”

KEY LINE: “The execution environment is part of the artifact’s provenance.”

⸻

168. DEPENDENCY SUPPLY-CHAIN SECURITY

QUESTION: “An agent decides to install a new package. What happens?”

TALKING SCRIPT: “Package installation is a side effect with supply-chain risk. The execution profile should define approved registries, dependency policy, version constraints, vulnerability requirements, and whether agents may introduce new dependencies without approval. Package provenance and resulting lockfile changes become part of verification. For sensitive workloads, unknown packages may be blocked entirely.”

KEY LINE: “Agent convenience doesn’t override software supply-chain policy.”

⸻

169. UNTRUSTED GENERATED CODE

QUESTION: “When does generated code become trusted?”

TALKING SCRIPT: “Not when the model emits it. Generated code starts as an untrusted candidate artifact. It gains confidence through deterministic tests, security checks, semantic evaluation, independent review, policy validation, and potentially runtime evidence. Authority then determines whether that evidence is sufficient for merge or release. Trust is accumulated from evidence rather than inferred from model identity.”

KEY LINE: “Generated code is a candidate until evidence earns acceptance.”

⸻

170. CONFIDENCE VS. TRUST

QUESTION: “What if the model says it’s 99% confident?”

TALKING SCRIPT: “Model confidence can be useful as one signal, but I would never make it the basis of consequential authority. Trust should come from external evidence about the outcome: tests, policy, security, independent verification, runtime behavior, and historical calibration. A model being confident about its own output doesn’t establish correctness.”

KEY LINE: “Confidence is a model property. Trust is a system property.”

⸻

171. HOW DO YOU DEFINE “ACCEPTED OUTCOME”?

QUESTION: “You keep saying cost per accepted outcome. What exactly is accepted?”

TALKING SCRIPT: “An accepted outcome means the objective’s acceptance criteria were satisfied, required verification and policy gates passed, required authority approved the result, and the artifact progressed to the intended lifecycle state. For a code-review workflow, acceptance may mean the developer accepted a valid finding. For autonomous delivery, it may mean merged and successfully deployed with healthy production signals. The definition must be workload-specific.”

KEY LINE: “Accepted outcome is a workload contract, not a generic platform counter.”

⸻

172. COST PER ACCEPTED OUTCOME

QUESTION: “How do you calculate it?”

TALKING SCRIPT: “For a workload class, I’d attribute the relevant variable costs across the complete lifecycle: model inference, sandbox compute, tool execution, verification, retries, and potentially measurable human correction effort. Divide by accepted outcomes, while also tracking the quality distribution so we don’t improve economics by lowering the bar. It gives us a much better optimization target than token cost because it captures retry and quality effects.”

KEY LINE: “Cheap attempts are irrelevant if they produce expensive outcomes.”

⸻

173. ECONOMIC ATTRIBUTION

QUESTION: “How do you attribute shared infrastructure cost?”

TALKING SCRIPT: “I’d separate direct variable cost from allocated platform cost. Model calls and sandbox compute can often be attributed directly to executions. Shared control-plane, indexing, and observability costs can be allocated by reasonable usage drivers when needed for planning. I wouldn’t create false precision. The main objective is understanding which workflows, routing strategies, and capabilities materially change marginal economics.”

KEY LINE: “Use economics to improve decisions, not to manufacture accounting precision.”

⸻

174. QUALITY VS. COST ROUTING

QUESTION: “How do you stop the router from sacrificing quality to save money?”

TALKING SCRIPT: “Quality and policy requirements become hard eligibility constraints before economic optimization. The router chooses the cheapest capability among those that meet the required quality, security, reliability, and latency thresholds. Production outcomes continuously validate those thresholds. Cost never gets to purchase permission to violate the workload’s quality bar.”

KEY LINE: “Optimize cost inside the quality envelope.”

⸻

175. ROUTER COLD START

QUESTION: “How do you route a new workload with no historical data?”

TALKING SCRIPT: “Start conservatively using capability metadata, public/provider evidence where useful, offline evaluations, and similar workload classes. Route early production traffic to stronger known capabilities while collecting evidence. Then experiment with alternatives through shadowing or bounded cohorts. The router should become more empirical as workload-specific evidence accumulates.”

KEY LINE: “Start with qualified priors; earn optimization from production evidence.”

⸻

176. ROUTER EXPLORATION VS. EXPLOITATION

QUESTION: “How do you discover that another model has become better?”

TALKING SCRIPT: “I need controlled exploration, not permanent exploitation of yesterday’s winner. Candidate capabilities can receive shadow workloads or a small bounded percentage of eligible traffic. Compare accepted outcomes, quality, latency, reliability, and cost with the incumbent. Exploration budgets and risk limits prevent experimentation from harming consequential workloads.”

KEY LINE: “A router that never explores eventually routes based on stale truth.”

⸻

177. MODEL QUALIFICATION

QUESTION: “What does it mean for a model to be qualified?”

TALKING SCRIPT: “Qualification should be workload-specific, not a global ‘approved model’ badge. A model may be qualified for test generation but not architectural migration, or for public code but not restricted data. Qualification captures model/version, supported workload classes, evaluation results, security/data eligibility, latency, economics, tool behavior, and known limitations. Routing operates only within those qualified boundaries.”

KEY LINE: “Models are qualified for workloads, not crowned universally good.”

⸻

178. PROVIDER ABSTRACTION FAILURE

QUESTION: “What if your common model API prevents you from using provider-specific strengths?”

TALKING SCRIPT: “That’s the danger of over-abstraction. I’d define a stable minimum platform contract while allowing capability-specific extensions where they materially improve outcomes. The router knows which features each model supports. The platform shouldn’t force every provider into the least capable common interface simply to claim portability.”

KEY LINE: “Portability should not require capability amputation.”

⸻

179. WHAT IF A PROVIDER CHANGES TOOL-CALLING BEHAVIOR?

QUESTION: “How do you protect the platform?”

TALKING SCRIPT: “Tool-use behavior is part of model qualification. A provider change should trigger representative evaluation against tool-selection accuracy, schema adherence, failure handling, and side-effect safety. Tool gateways remain deterministic boundaries regardless of model behavior. If the new behavior regresses below the required threshold, keep the prior version or remove the candidate from eligibility.”

KEY LINE: “Provider behavior can change; tool authority should not.”

⸻

180. CONTEXT PROVENANCE

QUESTION: “Why does provenance matter?”

TALKING SCRIPT: “Because if the agent makes a bad decision, I need to know which information influenced it and where that information came from. Context items should retain source, version, permission scope, timestamp/freshness, retrieval method, and ideally relevance metadata. Provenance also allows evidence to show whether a claim was based on authoritative documentation or stale informal content.”

KEY LINE: “Context without provenance is difficult to trust and difficult to debug.”

⸻

181. CONTEXT POISONING

QUESTION: “What if someone intentionally adds misleading documentation?”

TALKING SCRIPT: “I assume knowledge sources have different trust levels. Context retrieval should preserve source authority and provenance, and sensitive workflows can prioritize approved sources. Retrieved content still cannot create permissions. Adversarial or suspicious content can be flagged, and high-consequence claims may require corroboration from authoritative sources or deterministic system state.”

KEY LINE: “Relevant information and authoritative information are not always the same thing.”

⸻

182. CODE GRAPH VS. VECTOR SEARCH

QUESTION: “Would you use a graph database or vector database for code?”

TALKING SCRIPT: “Potentially both, but they solve different retrieval problems. Structural relationships—symbol references, call graphs, dependencies, ownership, build relationships—are better represented explicitly. Semantic search is useful when the builder or agent doesn’t know exact identifiers or needs conceptual retrieval. I wouldn’t force all code intelligence through embeddings. The context layer should compose structural, lexical, metadata, and semantic retrieval according to the workload.”

KEY LINE: “Code is both text and structure. Context architecture should respect both.”

⸻

183. INDEX FRESHNESS

QUESTION: “How quickly must the code index update?”

TALKING SCRIPT: “It depends on the workflow. Interactive review of a fresh PR needs context aligned to the candidate commit, not an index from an hour ago. Stable architecture documentation may tolerate slower refresh. I’d combine incremental indexing with direct workspace inspection where exact freshness matters. The retrieval result should expose freshness so the runtime can determine whether the source is acceptable.”

KEY LINE: “Freshness requirements are workload-specific.”

⸻

184. HOW DO YOU HANDLE GENERATED FILES?

QUESTION: “Should agents edit generated code?”

TALKING SCRIPT: “Repository metadata or skills should identify generated artifacts and their source of truth. The agent should generally modify the generator, schema, or upstream source rather than directly patch generated output unless the workflow explicitly permits it. Verification can detect unexpected generated-file changes.”

KEY LINE: “Teach the factory where source of truth lives.”

⸻

185. HOW DO YOU HANDLE REPOSITORY INSTRUCTIONS?

QUESTION: “What if every repository has its own AGENTS.md or instructions?”

TALKING SCRIPT: “That’s useful repository-specific context, but I would treat it as behavioral guidance within a governed precedence model, not absolute authority. Enterprise security and policy override repository instructions. Product/domain standards may have defined precedence. The exact instruction version becomes part of the execution provenance so changes can be correlated with behavior.”

KEY LINE: “Local instructions specialize behavior; they don’t override enterprise authority.”

⸻

186. HOW DO YOU HANDLE LEGACY TEST SUITES?

QUESTION: “What if the repository has flaky or inadequate tests?”

TALKING SCRIPT: “The factory should represent verification confidence, not pretend all green tests mean the same thing. Historical flakiness can inform test interpretation. Missing coverage may trigger additional static analysis, generated tests, semantic review, runtime evaluation, or human authority. For important autonomous work, improving the verification substrate may be a prerequisite to increasing autonomy.”

KEY LINE: “Autonomy cannot exceed our ability to verify the outcome.”

⸻

187. WHAT IF THERE ARE NO TESTS?

QUESTION: “Can the factory autonomously modify a system with no meaningful tests?”

TALKING SCRIPT: “Potentially, but the authority level should drop significantly. The system may first create characterization tests, baseline behavior snapshots, static checks, or other verification mechanisms before making the substantive change. For high-risk code, insufficient verification may be a reason to stop and request human involvement rather than pretend model confidence substitutes for evidence.”

KEY LINE: “Weak verification should reduce autonomy, not reduce standards.”

⸻
188. TEST GENERATION

QUESTION: “Should the same agent that writes the code also generate the tests?”

TALKING SCRIPT: “It can generate tests, but I wouldn’t automatically treat those tests as independent verification. The implementation agent has the same understanding—and potentially the same misunderstanding—of the requirement when it writes both the code and the tests. Generated tests are useful for increasing coverage and encoding expected behavior, but for consequential work I want verification derived independently from acceptance criteria, existing behavioral contracts, production invariants, security requirements, historical regressions, or a separately accountable verifier. Otherwise the agent can produce code and tests that agree with each other while both being wrong.”

KEY LINE: “Code and tests agreeing is not the same as the outcome being correct.”

⸻

189. TEST PYRAMID FOR AUTONOMOUS SOFTWARE

QUESTION: “What types of tests would the factory run?”

TALKING SCRIPT: “I’d select verification based on the change rather than blindly execute every test in the company. Start with fast local checks—compile, lint, type checking, focused unit tests—then dependency-aware integration tests, contract tests, security checks, and broader system or end-to-end tests where the blast radius justifies them. The plan and repository intelligence should identify which verification is relevant. For user-facing changes, visual, accessibility, or runtime evaluation may also be necessary. Verification should be comprehensive enough for the risk without making every change wait hours unnecessarily.”

KEY LINE: “Verification depth should follow change impact.”

⸻

190. IMPACT-BASED TEST SELECTION

QUESTION: “At Adobe scale, you can’t run every test for every change. What do you do?”

TALKING SCRIPT: “I’d combine dependency analysis, code ownership, historical test-to-change relationships, affected APIs, build graphs, and risk classification to select the most relevant verification. Critical global gates still run regardless. The selection system itself needs evaluation because a false-negative test-selection strategy can create invisible risk. For high-consequence changes, broaden the test surface rather than over-optimize latency.”

KEY LINE: “Optimize test selection without optimizing away confidence.”

⸻

191. FLAKY TESTS

QUESTION: “How does the factory handle flaky tests?”

TALKING SCRIPT: “I don’t want the agent repeatedly modifying correct code to satisfy nondeterministic tests. The verification platform should maintain test reliability history and distinguish likely product failure from known flakiness. A suspected flaky failure can be rerun according to bounded policy or quarantined, but repeated flakiness should create an engineering issue rather than become permanent retry logic. For high-risk changes, an unresolved flaky test may still block progression if it prevents us from establishing confidence.”

KEY LINE: “Don’t let flaky verification teach the agent to fix code that isn’t broken.”

⸻

192. SECURITY VERIFICATION

QUESTION: “Where does security scanning happen?”

TALKING SCRIPT: “Security is layered throughout the lifecycle. Before execution, policy controls identity, data access, tools, and sandbox permissions. During implementation, the sandbox constrains authority. After code changes, deterministic security verification can include SAST, dependency analysis, secret detection, license policy, configuration checks, and relevant product-specific controls. Semantic or adversarial security review can supplement those checks for areas where reasoning adds value. High-risk findings become hard gates rather than advisory model comments.”

KEY LINE: “Security isn’t one verifier at the end; it’s a property of the entire execution path.”

⸻

193. SECURITY AGENT VS. SECURITY TOOLS

QUESTION: “Would you build an AI security-review agent?”

TALKING SCRIPT: “Potentially, but as a complement to deterministic security tooling rather than a replacement. Static analyzers, dependency scanners, secret detectors, and policy engines give reproducible signals. A reasoning agent can add value by understanding cross-file behavior, architectural vulnerabilities, exploitability, or intent. Findings should normalize into a common evidence model so the authority layer understands which checks are deterministic, probabilistic, advisory, or blocking.”

KEY LINE: “Use AI to expand security reasoning, not to discard deterministic security evidence.”

⸻

194. ADVERSARIAL VERIFICATION

QUESTION: “What does adversarial verification mean?”

TALKING SCRIPT: “Instead of asking only ‘Does this implementation appear correct?’ deliberately ask how it could fail. An adversarial verifier can examine security abuse cases, boundary conditions, requirement violations, unsafe assumptions, privilege escalation, concurrency failures, data leakage, and ways the implementation might satisfy tests without satisfying intent. For high-risk workloads, adversarial verification gives us a different failure orientation than the producing agent.”

KEY LINE: “Verification should try to disprove correctness, not merely confirm it.”

⸻

195. POLICY-AS-CODE

QUESTION: “Would you express governance as code?”

TALKING SCRIPT: “Where policies can be deterministically represented, yes. Repository sensitivity, permitted model providers, credential scope, network destinations, required verification, approval thresholds, and deployment authority are good candidates for versioned machine-enforceable policy. Not every organizational judgment can be reduced to code, but the enforceable invariants should not live only in prompts or documentation.”

KEY LINE: “If a policy must always hold, don’t rely on the model remembering it.”

⸻

196. POLICY VERSIONING

QUESTION: “What happens when policy changes during a long-running execution?”

TALKING SCRIPT: “I’d distinguish policies that are bound at execution start from emergency or security policies that must take effect immediately. The factory version records the policy identity under which execution began, but the control plane can enforce revocations or emergency restrictions against active runs. For example, if a tool is compromised, I don’t want a six-hour job continuing to use it because the tool was authorized when the run started.”

KEY LINE: “Reproducibility matters, but revocation must outrank reproducibility.”

⸻

197. EMERGENCY KILL SWITCH

QUESTION: “Would Meta Factory have a kill switch?”

TALKING SCRIPT: “Yes, but not just one giant red button. I want hierarchical containment controls: disable a model version, capability, tool, execution profile, factory version, repository class, organization, or all autonomous execution if necessary. The goal is to stop the smallest failing surface that reliably contains the incident. Those controls belong in the control plane and must not depend on healthy workers.”

KEY LINE: “Design containment at multiple levels of blast radius.”

⸻

198. WHAT IF THE CONTROL PLANE FAILS?

QUESTION: “You’ve made the control plane authoritative. What if it goes down?”

TALKING SCRIPT: “Then I want a conservative execution policy. Workers should have bounded leases and authority, so loss of the control plane does not grant them indefinite autonomous execution. Depending on workload risk, active workers may finish a bounded local operation but should not acquire new authority or publish consequential results without validating ownership. The control plane itself requires traditional high-availability engineering, durable state replication, backups, tested recovery, and clear degraded modes.”

KEY LINE: “Loss of governance should reduce authority, not expand it.”

⸻

199. CONTROL-PLANE CONSISTENCY

QUESTION: “Do you need strong consistency everywhere?”

TALKING SCRIPT: “No. I’d use stronger consistency around invariants where conflicting decisions create unsafe behavior: lease ownership, authorization state, budget reservation, promotion state, and consequential approvals. Telemetry, analytics, and some discovery metadata can tolerate eventual consistency. I don’t want to pay distributed-consensus costs for data that doesn’t require them, but I also don’t want two workers both believing they own publication authority.”

KEY LINE: “Consistency should follow the invariant.”

⸻

200. CAP THEOREM / NETWORK PARTITION

QUESTION: “What happens during a partition?”

TALKING SCRIPT: “For authority-sensitive operations, I’d generally prefer sacrificing availability over allowing conflicting ownership. A worker that cannot confirm its lease or authorization should eventually stop consequential actions. Low-risk local computation may continue within previously granted bounded authority, but publication, new credentials, additional budget, or production changes may require control-plane connectivity. Again, failure behavior should follow consequence.”

KEY LINE: “Partition tolerance doesn’t mean every operation remains available.”

⸻

201. STATE STORE

QUESTION: “What database would you use for control-plane state?”

TALKING SCRIPT: “I’d start from access patterns and consistency requirements rather than naming a database. I need durable workflow state, transactional transitions around important invariants, indexing by execution and owner, potentially high event volume, and reliable recovery. A relational transactional store is attractive for authoritative state because many invariants are naturally relational and transactional. Large event and telemetry streams may belong elsewhere. I wouldn’t force authoritative state, evidence blobs, analytics, and traces into one storage technology.”

KEY LINE: “Separate authoritative state from analytical telemetry.”

⸻

202. DATABASE VS. EVENT SOURCING

QUESTION: “Would you event-source the entire factory?”

TALKING SCRIPT: “Not necessarily. Event sourcing can provide excellent history and reconstruction, but it adds operational and conceptual complexity. I may use durable lifecycle events alongside a transactional authoritative state model. If event sourcing materially improves audit, recovery, and replay for specific aggregates, use it there. I wouldn’t make every piece of platform state event-sourced simply because agents generate interesting trajectories.”

KEY LINE: “Use event sourcing where history is part of the domain, not because history exists.”

⸻

203. EVIDENCE STORAGE

QUESTION: “Where does all the evidence live?”

TALKING SCRIPT: “I’d separate evidence metadata from large evidence artifacts. The control plane can maintain immutable references, hashes, ownership, execution identity, type, retention, and verification status. Large logs, test reports, diffs, security reports, or runtime artifacts can live in durable object storage. Sensitive evidence gets classification and access controls. Evidence should be addressable and attributable without forcing the transactional state store to hold every artifact.”

KEY LINE: “Store evidence for integrity and retrieval, not convenience.”

⸻

204. EVIDENCE INTEGRITY

QUESTION: “How do you know evidence hasn’t been modified?”

TALKING SCRIPT: “For consequential workflows, evidence can be content-addressed or cryptographically hashed, associated with the execution identity and immutable factory version, and published through trusted platform mechanisms rather than directly asserted by the producing worker. The strength should match the threat model; I don’t need blockchain theater. I need enough integrity to prove that the evidence being reviewed corresponds to the artifact and execution we claim it does.”

KEY LINE: “Evidence is useful only if its provenance and integrity are trustworthy.”

⸻

205. WHO CAN WRITE EVIDENCE?

QUESTION: “Can the agent simply report that tests passed?”

TALKING SCRIPT: “It can report an observation, but that isn’t authoritative evidence. The trusted test runner should produce the test result. The security scanner produces security evidence. The policy engine produces authorization evidence. The agent may orchestrate those capabilities, but the evidence should be attributable to the system that actually established the claim.”

KEY LINE: “Don’t let the claimant manufacture the proof.”

⸻

206. EVIDENCE GRAPH

QUESTION: “How do you relate evidence to acceptance criteria?”

TALKING SCRIPT: “I like thinking of this as a claim-evidence graph. The governed plan defines claims such as ‘all required tests pass,’ ‘latency remains below target,’ or ‘no critical security findings exist.’ Verification capabilities produce evidence attached to those claims. Authority can then see which criteria are satisfied, which are uncertain, and which failed. That is more useful than one opaque overall score.”

KEY LINE: “Acceptance is a set of claims supported by evidence.”

⸻

207. EVIDENCE EXPIRATION

QUESTION: “Can evidence become stale?”

TALKING SCRIPT: “Absolutely. A test result against commit A doesn’t prove commit B. A security scan from yesterday may not cover a newly introduced dependency. Evidence should bind to the artifact, environment, policy version, and relevant time context. Material changes invalidate dependent evidence and trigger re-verification. Evidence is not permanently transferable across changing state.”

KEY LINE: “Evidence is valid only for the conditions under which it was established.”

⸻

208. ACCEPTANCE CRITERIA TRACEABILITY

QUESTION: “How do you know every requirement was verified?”

TALKING SCRIPT: “Each acceptance criterion should map to one or more verification requirements in the governed plan. During execution, evidence attaches to those criteria. Before authority can accept the outcome, the system checks whether mandatory criteria have sufficient evidence. That gives us traceability from builder intent → plan → implementation → verification → evidence → acceptance.”

KEY LINE: “Every consequential acceptance claim should be traceable back to intent.”

⸻

209. ARCHITECTURE DECISION RECORDS

QUESTION: “Would agents create ADRs?”

TALKING SCRIPT: “For meaningful architectural decisions, potentially yes. If autonomous work makes a durable design choice, recording the decision, alternatives, constraints, rationale, and evidence can improve future context and human understanding. But I wouldn’t create ADRs for every implementation detail. The threshold should be the same principle we use with humans: preserve decisions future engineers will need to understand.”

KEY LINE: “Autonomy shouldn’t erase architectural memory.”

⸻

210. DOCUMENTATION

QUESTION: “Who updates documentation after autonomous changes?”

TALKING SCRIPT: “Documentation can be another governed work item derived from the plan. If a change modifies public APIs, operational procedures, architecture, or builder-facing behavior, the acceptance criteria can require corresponding documentation updates. The implementation capability may produce a candidate, but documentation is verified like any other artifact. I don’t want documentation to be a best-effort afterthought.”

KEY LINE: “Documentation requirements belong in the plan, not in developer memory.”

⸻

211. INCIDENT FEEDBACK INTO THE FACTORY

QUESTION: “How does a production incident change Meta Factory?”

TALKING SCRIPT: “An incident should produce more than a code fix. We determine whether the failure exposed a gap in context, planning, routing, policy, sandboxing, verification, evaluation, or rollout. Representative failure trajectories become regression cases. Missing controls become candidate platform changes. Then those changes go through the same qualification and promotion process. Incidents become evidence for improving the factory itself.”

KEY LINE: “Every incident should improve both the product and the production system that created it.”

⸻

212. POSTMORTEMS FOR AGENT FAILURES

QUESTION: “What would an agent incident postmortem contain?”

TALKING SCRIPT: “In addition to conventional timeline, impact, detection, root cause, and corrective actions, I’d capture the builder intent, factory version, model route, context provenance, tool trajectory, sandbox boundary, policy decisions, verification evidence, authority decisions, and why existing evaluations failed to predict the incident. The goal is to understand not just which code failed, but which autonomous decision path allowed it.”

KEY LINE: “Agent incidents require trajectory analysis, not just service logs.”

⸻

213. ROLLBACK VS. ROLL FORWARD

QUESTION: “How do you decide?”

TALKING SCRIPT: “I’d optimize for the fastest safe restoration path. If the previous factory or application version is known-good and rollback is safe, use it. If state migrations or external side effects make rollback dangerous, rolling forward may be safer. The architecture should preserve enough versioning and evidence to understand both options. I wouldn’t dogmatically prefer rollback.”

KEY LINE: “Recovery strategy follows reversibility, not habit.”

⸻

214. WHAT IF ROLLBACK IS IMPOSSIBLE?

QUESTION: “The agent performed an irreversible action.”

TALKING SCRIPT: “That’s why irreversibility should influence authority before execution. If we’re already there, contain additional effects, preserve evidence, assess blast radius, and use whatever compensating actions exist. The post-incident architectural question is why an irreversible action had the authority it did without sufficient verification or human control. Some operations simply cannot be made safely autonomous at the same level as reversible changes.”

KEY LINE: “Irreversibility should increase pre-execution scrutiny.”

⸻

215. FEATURE FLAGS

QUESTION: “Would agents use feature flags?”

TALKING SCRIPT: “Absolutely where appropriate. Feature flags increase reversibility and progressive exposure, which can justify greater autonomy. The factory can create or use approved flags, deploy dark, evaluate production behavior, gradually increase exposure, and roll back by disabling the flag. But flag lifecycle itself needs governance because permanent stale flags create complexity.”

KEY LINE: “Reversibility is one of the strongest enablers of safe autonomy.”

⸻

216. PRODUCTION EXPERIMENTATION

QUESTION: “Would you let agents experiment in production?”

TALKING SCRIPT: “Potentially for bounded, reversible, policy-approved experiments. The experiment needs explicit hypothesis, exposure limits, success and failure metrics, duration, rollback criteria, and authority. Production experimentation isn’t ‘let the agent try things.’ It’s a governed execution mode with tighter observation and blast-radius control.”

KEY LINE: “Experimentation is safe when the hypothesis, boundary, and rollback are explicit.”

⸻

217. SHADOW MODE

QUESTION: “How would you validate a new agent without affecting builders?”

TALKING SCRIPT: “Run the candidate in shadow mode against representative real workloads without giving it production authority. Compare its plans, outputs, verification, latency, and economics with the active version. Shadowing is particularly useful for routers, reviewers, and models where we can observe candidate behavior without creating side effects. It gives us production-distribution evidence before increasing blast radius.”

KEY LINE: “Observe candidate behavior before granting candidate authority.”

⸻

218. CANARYING AGENT BEHAVIOR

QUESTION: “How is canarying an agent different from canarying a service?”

TALKING SCRIPT: “A service canary often focuses on availability, errors, and latency. An agent canary also needs outcome quality, verification results, human correction, policy behavior, cost, and trajectory differences. The service can remain perfectly healthy while agent behavior regresses. So canary criteria must include semantic quality, not just infrastructure health.”

KEY LINE: “Agent canaries need behavioral SLOs, not just service SLOs.”

219. A/B TESTING MODEL ROUTERS

QUESTION: “Would you A/B test model routing?”

TALKING SCRIPT: “Yes, for appropriate workloads, but carefully. Randomization should occur only across qualified capabilities that already satisfy the workload’s minimum quality, security, and policy requirements. Then I can compare accepted outcomes, verification results, retries, latency, human correction, and cost. For high-risk workloads, I’d prefer shadowing before live traffic. The purpose isn’t experimentation for its own sake; it’s generating empirical evidence about which routing strategy actually produces the best outcome.”

KEY LINE: “Experiment inside the qualified envelope.”

⸻

220. WHAT IF THE ROUTER ITSELF FAILS?

QUESTION: “The router starts making bad decisions. What happens?”

TALKING SCRIPT: “Routing is production behavior, so it needs versioning, evaluation, observability, rollback, and conservative fallbacks. If router confidence is low or routing infrastructure is unavailable, I’d fall back to a known-good default capability for workloads where that is safe. For workloads where no safe default exists, queue or stop. I’d also log the routing decision and rationale metadata so we can determine whether failures came from the selected capability or the selection mechanism.”

KEY LINE: “The router is part of the production system, not invisible plumbing.”

⸻

221. STATIC VS. DYNAMIC ROUTING

QUESTION: “Would you start with intelligent dynamic routing?”

TALKING SCRIPT: “Probably not. I’d start with simple policy-based routing using known workload classes and qualified capabilities. As we accumulate production evidence showing meaningful variance in quality or economics, introduce more dynamic routing. Sophisticated routing creates its own complexity, evaluation burden, and failure modes, so it should earn its place.”

KEY LINE: “Start deterministic. Add intelligence where evidence shows optimization value.”

⸻

222. HOW DO YOU EXPLAIN A ROUTING DECISION?

QUESTION: “Does routing need to be explainable?”

TALKING SCRIPT: “For consequential or expensive workloads, yes. I don’t need a philosophical explanation from the model; I need operationally useful decision data: which capabilities were eligible, which hard constraints removed candidates, which version was selected, and what quality/economic evidence supported the selection. That helps debugging, audit, economics, and qualification.”

KEY LINE: “Explain the decision boundary, not the model’s private reasoning.”

⸻

223. ROUTING SECURITY-SENSITIVE WORK

QUESTION: “How does security affect model selection?”

TALKING SCRIPT: “Security is an eligibility constraint, not a ranking preference. Data classification, provider policy, geographic restrictions, tool requirements, and workload sensitivity determine which capabilities may even participate. Only after those requirements are satisfied do quality, latency, and economics matter. A cheaper model that isn’t permitted to see the data isn’t an option.”

KEY LINE: “Policy defines the candidate set before economics chooses among it.”

⸻

224. HOW DO YOU DESIGN FOR PROVIDER CONCENTRATION RISK?

QUESTION: “What if 90% of workloads use one model provider?”

TALKING SCRIPT: “I’d distinguish logical portability from operational resilience. Having adapters for three providers doesn’t help if we haven’t qualified alternatives or lack capacity with them. For critical workload classes, maintain evaluated fallback capabilities and periodically exercise them. But diversification also has cost—contracts, evaluations, integration, operational complexity—so I wouldn’t require artificial provider distribution solely for architectural symmetry.”

KEY LINE: “A fallback you never qualify or exercise isn’t a fallback.”

⸻

225. MODEL DEPRECATION

QUESTION: “A provider gives you 30 days to migrate off a model. What do you do?”

TALKING SCRIPT: “Because model identity is versioned and workload qualification already exists, I’d identify every Factory Version and workload depending on that model, evaluate candidate replacements against those workloads, qualify the replacement, create new candidate Factory Versions, and progressively migrate. The key is avoiding hidden model dependencies scattered throughout application code.”

KEY LINE: “Model lifecycle should be managed as dependency lifecycle.”

⸻

226. HOW DO YOU HANDLE MODEL QUALITY DRIFT?

QUESTION: “Nothing changed in your code, but model quality deteriorates.”

TALKING SCRIPT: “That’s why production outcomes need to continuously validate capability fitness. I’d monitor workload-specific accepted outcomes, verification failures, retries, human corrections, latency, and cost. If those drift beyond thresholds, reduce traffic or quarantine the capability while investigating provider behavior, workload drift, context changes, or evaluator drift. A previously qualified model isn’t permanently trusted.”

KEY LINE: “Qualification establishes trust at a point in time; telemetry tells us whether it remains deserved.”

⸻

227. HOW DO YOU HANDLE NON-CODE BUILDER WORKFLOWS?

QUESTION: “Does Meta Factory only apply to software engineers?”

TALKING SCRIPT: “The substrate can extend beyond coding if the lifecycle abstractions remain useful: intent, governed plan, capabilities, bounded execution, verification, evidence, authority, and outcome. A designer, PM, or program manager may use different capabilities and verification criteria, but the governance model can remain consistent. I would still start with engineering builders because that’s the clearest initial persona and avoid prematurely generalizing every abstraction.”

KEY LINE: “Generalize the lifecycle carefully; specialize the capabilities aggressively.”

⸻

228. HOW DO YOU SUPPORT PRODUCT MANAGERS AS BUILDERS?

QUESTION: “What changes if a PM can build?”

TALKING SCRIPT: “The platform has to compensate for less implementation-specific knowledge without removing meaningful control. A PM may express the desired product behavior and constraints while the system surfaces architectural implications, security requirements, cost, and acceptance criteria. High-consequence implementation decisions can route to engineering authority. The goal isn’t pretending every persona suddenly has identical expertise; it’s enabling more people to create while preserving appropriate technical governance.”

KEY LINE: “Expand who can build without pretending expertise has disappeared.”

⸻

229. HOW DO YOU SUPPORT DESIGNERS AS BUILDERS?

QUESTION: “How would this apply to design?”

TALKING SCRIPT: “Design intent can become executable input, particularly for UI workflows, but verification changes. We may need visual comparison, accessibility evaluation, design-system compliance, interaction tests, responsive behavior, and human experiential judgment. This illustrates why the factory substrate can be shared while verification and capabilities remain domain-specific.”

KEY LINE: “Shared lifecycle, domain-specific definition of correctness.”

⸻

230. HOW DOES QA CHANGE?

QUESTION: “What happens to QA in an autonomous factory?”

TALKING SCRIPT: “QA becomes more upstream and more strategic. Instead of primarily validating finished implementation, quality engineering increasingly helps define acceptance criteria, verification strategies, evaluation datasets, risk models, test automation, production-quality signals, and confidence thresholds. As generation increases, verification engineering becomes more important, not less.”

KEY LINE: “As implementation becomes abundant, quality engineering moves from downstream inspection to upstream trust design.”

⸻

231. WHAT IS THE ROLE OF THE ENGINEER?

QUESTION: “If agents write most of the code, what does the engineer do?”

TALKING SCRIPT: “Engineering responsibility moves toward intent, architecture, decomposition, constraints, acceptance criteria, verification, reliability, economics, and governance. Engineers still implement directly where that is the best mechanism, but increasingly they design and govern systems that produce implementation. I don’t think AI removes engineering responsibility; it increases the leverage—and therefore potentially the consequence—of engineering decisions.”

KEY LINE: “AI doesn’t remove engineering responsibility. It moves it up a level.”

⸻

232. HOW DOES ENGINEERING MANAGEMENT CHANGE?

QUESTION: “How would you lead teams differently in this environment?”

TALKING SCRIPT: “I’d manage less around raw output and more around systems of leverage: capability reuse, verification strength, accepted outcomes, learning speed, platform adoption, human attention, and production quality. Engineers need development toward architecture, evaluation, technical judgment, and agent supervision. Team boundaries may also change because digital execution capacity can scale differently from human headcount. But accountability remains human and organizational.”

KEY LINE: “Leaders increasingly manage systems of leverage, not just systems of labor.”

⸻

233. DIGITAL WORKERS AND OWNERSHIP

QUESTION: “Who owns an agent?”

TALKING SCRIPT: “Every production capability needs human organizational ownership. An agent or skill should have an owner responsible for qualification, operational behavior, security posture, evaluation quality, lifecycle, and deprecation. Digital workers don’t eliminate accountability. If anything, scalable autonomous execution makes explicit ownership more important.”

KEY LINE: “Autonomous execution does not imply autonomous accountability.”

⸻

234. TEAM TOPOLOGY

QUESTION: “How would you organize the Meta Factory team?”

TALKING SCRIPT: “I’d organize around durable platform responsibilities rather than specific model vendors. Likely areas include builder experience/intake, execution and sandboxing, context/code intelligence, capability/model platform, verification/evaluation, and control-plane reliability. I’d avoid creating a separate team for every agent type. Forward-deployed engineers bridge these platform groups with design partners and feed repeated patterns back into the core.”

KEY LINE: “Organize around durable problems, not temporary technologies.”

⸻

235. WHO OWNS EVALUATIONS?

QUESTION: “Central platform team or individual product teams?”

TALKING SCRIPT: “Both, with different responsibilities. The platform owns the evaluation infrastructure, contracts, execution, storage, comparison, observability, and promotion mechanisms. Domain teams own or contribute the definition of correctness for their workflows: representative cases, domain rubrics, repository-specific expectations, and acceptance criteria. Centralizing all evaluation semantics would make the platform team a domain bottleneck.”

KEY LINE: “Centralize evaluation machinery. Federate evaluation truth.”

⸻

236. WHO OWNS CONTEXT?

QUESTION: “Does Meta Factory own all enterprise knowledge?”

TALKING SCRIPT: “No. Meta Factory can own the context-access substrate, indexing contracts, authorization enforcement, provenance, retrieval interfaces, and quality mechanisms. Source systems and domain owners remain authoritative for their knowledge. I don’t want the AI platform becoming a shadow owner of every enterprise data source.”

KEY LINE: “Centralize access and governance, not ownership of every truth source.”

⸻

237. WHO OWNS SANDBOXING?

QUESTION: “Should Meta Factory build its own compute platform?”

TALKING SCRIPT: “Not necessarily. If Adobe already has strong container, Kubernetes, cloud-compute, identity, networking, and security infrastructure, Meta Factory should compose those capabilities rather than recreate them. What Meta Factory needs to own is the agent execution contract: what isolation, credentials, network policy, repository scope, lifecycle, evidence, and budgets a workload requires. The underlying compute substrate can be shared infrastructure.”

KEY LINE: “Own the agent execution contract; reuse the enterprise compute substrate.”

⸻

238. BOUNDARY WITH DEVELOPER PLATFORM

QUESTION: “Where does Meta Factory end and the developer platform begin?”

TALKING SCRIPT: “I’d start with the builder outcome rather than an organizational boundary. Meta Factory should consume existing platform capabilities—source control, CI/CD, compute, identity, artifact systems, observability—through stable contracts. It should own the agentic lifecycle and governance that isn’t already provided. Over time, repeated overlap tells us where ownership should settle. I wouldn’t compromise the builder experience merely to preserve an arbitrary org chart.”

KEY LINE: “Start from the builder journey; derive organizational boundaries afterward.”

⸻

239. BOUNDARY WITH CI/CD

QUESTION: “Does Meta Factory replace CI/CD?”

TALKING SCRIPT: “No. CI/CD is a deterministic delivery capability the factory should invoke. Meta Factory governs intent, planning, autonomous execution, verification, evidence, and authority around the work. Once an artifact is accepted, existing CI/CD and release infrastructure remain valuable execution machinery. The factory should integrate with those systems, not rebuild mature deployment capabilities because AI exists.”

KEY LINE: “Meta Factory governs autonomous work; CI/CD remains a delivery capability.”

⸻

240. BOUNDARY WITH IDE TOOLS

QUESTION: “What happens to Cursor, Copilot, Codex, or other coding tools?”

TALKING SCRIPT: “They can become interfaces or execution capabilities within the broader builder ecosystem. I wouldn’t require Adobe to replace every successful developer tool. Meta Factory can provide governed model access, context, capabilities, sandboxing, evaluation, evidence, and policy that multiple interfaces consume. The strategic substrate should survive changes in whichever IDE agent happens to be popular.”

KEY LINE: “Don’t confuse the builder interface with the enterprise control plane.”

⸻

241. LOCAL VS. REMOTE EXECUTION

QUESTION: “Should agents run locally or remotely?”

TALKING SCRIPT: “Both can make sense. Local execution gives low latency, tight builder interaction, and sometimes stronger data locality. Remote execution provides scalable compute, long-running delegation, standardized environments, and better centralized control. I’d treat them as different Execution Profiles under the same governance model. High-autonomy delegated work generally demands stronger remote isolation, identity, evidence, and lifecycle controls.”

KEY LINE: “Execution location changes the trust boundary, not the lifecycle.”

⸻

242. WHEN SHOULD WORK MOVE TO THE CLOUD?

QUESTION: “When do you delegate locally initiated work to remote workers?”

TALKING SCRIPT: “When the workload benefits from long duration, standardized compute, specialized hardware, parallelism, asynchronous execution, or independence from the developer workstation. But delegation also expands the trust boundary, so the remote environment needs explicit identity, repository scope, credentials, egress, budgets, and evidence. Convenience isn’t enough justification for weakening control.”

KEY LINE: “Remote delegation increases capability and therefore requires stronger authority boundaries.”

⸻

243. HOW DO YOU HANDLE OFFLINE / DISCONNECTED WORK?

QUESTION: “Can builders work when cloud services are unavailable?”

TALKING SCRIPT: “Potentially through local capabilities for eligible workflows, but I would make the limitations explicit. Some tasks may use cached context, local deterministic tools, or approved local models. Actions requiring current policy, protected enterprise context, or consequential authority may need connectivity. Offline mode should not silently bypass governance.”

KEY LINE: “Degraded connectivity may reduce capability; it should not silently reduce policy.”

⸻

244. EDGE VS. CLOUD MODELS

QUESTION: “Would you route small tasks to developer laptops?”

TALKING SCRIPT: “Only if the local model is qualified for that workload and the economics, privacy, latency, and operational complexity justify it. Local compute can eliminate variable inference cost, but model distribution, hardware variance, update management, observability, and quality become new costs. I’d treat local inference as another capability route rather than an ideological preference.”

KEY LINE: “Free inference isn’t free operations.”

⸻

245. HOW DO YOU UPDATE LOCAL MODELS?

QUESTION: “What happens when thousands of laptops need a new model?”

TALKING SCRIPT: “That becomes a software-distribution and qualification problem: signed artifacts, version manifests, staged rollout, compatibility checks, disk and hardware constraints, rollback, telemetry, and security response. The platform should know which model version is actually serving a workload. This operational burden is part of the build-versus-cloud decision.”

KEY LINE: “Model distribution is part of model economics.”

⸻

246. WHAT ABOUT SPECIALIZED MODELS?

QUESTION: “Would you use separate models for coding, review, security, planning?”

TALKING SCRIPT: “Where evaluation demonstrates specialization creates meaningful value. I don’t want specialization simply because a model has a category label. The capability registry should tell us whether a specialized model materially improves accepted outcome quality, latency, security, or economics for a workload. If a general frontier model wins across the board, use it. If a specialized security model catches materially different defects, route accordingly.”

KEY LINE: “Specialization should be empirical, not categorical.”

⸻

247. HOW DO YOU HANDLE MODEL CASCADES?

QUESTION: “Would you start cheap and escalate to stronger models?”

TALKING SCRIPT: “Potentially. A cascade can be economically effective if we can identify when the cheaper capability is sufficient. But escalation itself adds latency and repeated inference. I’d evaluate the entire cascade against direct use of the stronger model. A useful pattern may be cheap classification or deterministic preprocessing → appropriate execution capability → stronger escalation only on uncertainty or failed verification.”

KEY LINE: “A cascade is valuable only if escalation saves more than it costs.”

⸻

248. SPECULATIVE EXECUTION

QUESTION: “Would you run multiple models in parallel and choose the best result?”

TALKING SCRIPT: “For high-value or difficult workloads, possibly. Parallel candidates can increase quality or reduce latency-to-first-success, but they multiply inference and verification cost. The selection mechanism also has to be trustworthy. I’d reserve speculative execution for workloads where expected outcome value justifies the economics, not make it the default.”

KEY LINE: “Spend redundant intelligence where the expected outcome justifies redundancy.”

⸻

249. ENSEMBLE VERIFICATION

QUESTION: “Would you use several LLM judges?”

TALKING SCRIPT: “Potentially, but I wouldn’t assume majority vote creates truth. Different evaluators should contribute meaningfully different evidence or failure perspectives. A deterministic test can outweigh three semantic judges. For subjective requirements, multiple independently qualified evaluators may improve confidence. The aggregation policy should be explicit and workload-specific.”

KEY LINE: “More judges aren’t automatically more independent.”

⸻

250. HOW DO YOU HANDLE DISAGREEMENT BETWEEN HUMAN AND AI?

QUESTION: “The verifier says fail; the senior engineer says ship.”

TALKING SCRIPT: “First determine the authority semantics. A deterministic security-policy violation shouldn’t be overridable simply because a senior engineer disagrees unless an explicit exception process exists. A probabilistic architectural finding may be advisory and overridable with rationale. Overrides should be attributable and become learning data. The platform should distinguish mandatory controls from judgment-supporting evidence.”

KEY LINE: “Human authority should be explicit enough that overrides are intentional, not accidental.”

251. OVERRIDE GOVERNANCE — CONTINUED

QUESTION: “Would humans be allowed to override the factory?”

TALKING SCRIPT: “Yes where organizational policy permits it, but an override is itself a governed action. Capture who overrode what, why, which evidence was rejected, what risk was accepted, and what happened afterward. Some controls—security, privacy, legal, or separation-of-duties requirements—may require a different authority rather than being individually overridable. Overrides also become valuable learning signals. If engineers repeatedly override the same verifier, either the verifier is wrong, the policy is wrong, or the workflow is creating unnecessary friction.”

KEY LINE: “Overrides should create accountability and learning, not bypass governance.”

⸻

252. SEPARATION OF DUTIES

QUESTION: “Would the same person who initiates a high-risk autonomous change be allowed to approve it?”

TALKING SCRIPT: “For sufficiently consequential workflows, I’d support separation of duties. The builder initiating the objective, the autonomous system producing the change, the verifier evaluating it, and the authority approving release don’t necessarily need to be the same actor. The required separation should follow risk and policy rather than apply universally. Low-risk changes don’t need enterprise bureaucracy; production security or financial controls may.”

KEY LINE: “Independence should increase with consequence.”

⸻

253. HUMAN APPROVAL FATIGUE

QUESTION: “What if engineers start rubber-stamping agent approvals?”

TALKING SCRIPT: “Then human-in-the-loop has degraded into human ceremony. I’d reduce unnecessary approvals through risk tiers and stronger automated verification, while improving the information presented for decisions that genuinely require humans. The approval interface should summarize intent, change scope, verification evidence, residual risk, and unusual behavior—not dump a 10,000-line trajectory on the reviewer. I’d also measure approval latency, override behavior, and post-approval failures.”

KEY LINE: “If humans approve everything, human approval verifies nothing.”

⸻

254. TRUST CALIBRATION

QUESTION: “How do builders know when to trust the factory?”

TALKING SCRIPT: “Trust should be earned empirically and workload-specifically. Show builders what the system did, what evidence exists, where uncertainty remains, and how the capability has historically performed. Don’t communicate confidence through anthropomorphic statements like ‘I’m sure this is correct.’ Give them observable evidence and calibrated system behavior. As the platform demonstrates reliability, builders naturally delegate more.”

KEY LINE: “Trust grows from predictable evidence-backed behavior, not persuasive AI language.”

⸻

255. AUTONOMY MATURITY MODEL

QUESTION: “How would you progressively increase autonomy?”

TALKING SCRIPT: “I’d think about autonomy as levels. Level 0: recommendation only. Level 1: agent produces candidate artifacts but humans execute consequential actions. Level 2: autonomous execution with mandatory human acceptance. Level 3: low-risk work can progress automatically when verification meets defined thresholds. Level 4: broader autonomous delivery with humans handling exceptions and high-risk decisions. Movement between levels is earned through workload-specific evidence, not declared platform-wide.”

KEY LINE: “Autonomy is a property of a qualified workload, not a marketing label for the platform.”

⸻

256. REVERSIBILITY AS A DESIGN DIMENSION

QUESTION: “Why do you keep emphasizing reversibility?”

TALKING SCRIPT: “Because reversibility changes the cost of being wrong. A bad documentation change can be reverted easily. A destructive database migration or exposed credential may not be. As reversibility decreases, I increase verification strength, authority requirements, rollout controls, evidence, and potentially human involvement. One of the best ways to safely increase autonomy is to redesign workflows so actions become more reversible.”

KEY LINE: “Reversibility converts some failures from disasters into experiments.”

⸻

257. BLAST RADIUS

QUESTION: “How would you limit blast radius?”

TALKING SCRIPT: “At multiple layers: repository scope, filesystem scope, tool permissions, credential scope, network egress, execution budget, workload concurrency, rollout cohort, environment, and authority. A code-review agent doesn’t need deployment credentials. A repository migration doesn’t need access to every Adobe repository. A new Factory Version shouldn’t immediately serve the entire company. Blast-radius control is not one sandbox feature; it’s a property of the complete architecture.”

KEY LINE: “Limit authority before you need containment.”

⸻

258. WHAT IF A BAD FACTORY VERSION REACHES THOUSANDS OF REPOSITORIES?

QUESTION: “How do you contain it?”

TALKING SCRIPT: “The control plane should allow centralized revocation of the exact Factory Version, capability, model route, skill, tool, or Execution Profile responsible. Stop new work first, determine whether active executions need termination, preserve representative evidence, and route eligible workloads back to the last known-good qualified version. Then identify why offline qualification and progressive rollout failed to catch the regression.”

KEY LINE: “Contain at the smallest reliable boundary.”

⸻

259. MULTI-TENANCY

QUESTION: “How would you isolate different Adobe organizations on one shared platform?”

TALKING SCRIPT: “I’d use shared infrastructure with identity-aware logical isolation where appropriate, while allowing stronger physical isolation for sensitive workloads. Organizational identity and repository permissions propagate through admission, context retrieval, tool access, evidence, quotas, and execution. One organization’s context, budget, credentials, or artifacts should never become another’s simply because they share worker infrastructure.”

KEY LINE: “Shared infrastructure must not imply shared authority.”

⸻

260. NOISY NEIGHBOR

QUESTION: “One organization launches thousands of expensive jobs and impacts everyone else.”

TALKING SCRIPT: “Admission control and scheduling should enforce organizational quotas, workload-class limits, priority, and fair-share policies before resources are exhausted. I’d also monitor model-provider quotas and sandbox capacity centrally. High-value workloads may have reserved capacity. The platform shouldn’t discover fairness only after one team consumes every shared resource.”

KEY LINE: “Fairness belongs in admission control, not incident response.”

⸻

261. RATE LIMITING

QUESTION: “Where do you rate-limit?”

TALKING SCRIPT: “At several boundaries depending on the scarce resource: builder/API admission, organization, workflow class, model provider, tool, repository, and external dependency. Rate limits should coordinate with scheduling and backpressure rather than independently generating failures. For expensive resources, I prefer admission control before the request reaches the dependency.”

KEY LINE: “Rate-limit where scarcity exists; queue where waiting creates value.”

⸻

262. PRIORITY INVERSION

QUESTION: “A long-running low-priority job is consuming resources needed by an urgent task.”

TALKING SCRIPT: “The scheduler needs workload priority and potentially preemption semantics. Some execution resources can be reclaimed safely at checkpoints; others may need to finish their current bounded operation. Budget and lease design should support pausing or rescheduling lower-priority work without corrupting state. I’d avoid preemption if recomputation cost is worse than waiting, so scheduling should understand workload characteristics.”

KEY LINE: “Priority should influence resource ownership, not just queue order.”

⸻

263. SCHEDULER DESIGN

QUESTION: “What inputs should the scheduler consider?”

TALKING SCRIPT: “Workload class, priority, execution profile, required compute, sandbox type, model/provider capacity, organizational quota, deadline or latency objective, estimated duration, cost budget, data locality, and dependency readiness. The scheduler doesn’t decide semantic model quality—that’s capability routing—but it does determine when and where qualified work executes.”

KEY LINE: “Routing decides what capability should perform the work; scheduling decides when and where it runs.”

⸻

264. ROUTER VS. SCHEDULER

QUESTION: “Why keep them separate?”

TALKING SCRIPT: “Because they optimize different dimensions. The router selects the best eligible capability based on quality, security, latency, reliability, and economics. The scheduler allocates execution resources and timing based on capacity, priority, quota, locality, and availability. They exchange constraints, but combining them into one opaque decision engine makes both harder to reason about and evaluate.”

KEY LINE: “Capability selection and resource allocation are related, but not identical problems.”

⸻

265. CONTROL PLANE SCALE

QUESTION: “Does the control plane become a bottleneck?”

TALKING SCRIPT: “It can if we put high-volume execution data through strongly consistent centralized paths unnecessarily. I’d keep the control plane authoritative for lifecycle and authority decisions, but workers can perform bounded local computation without round-tripping every token or tool observation through a central database. Telemetry streams asynchronously. Large artifacts go to object storage. State is partitioned by appropriate aggregate or execution identity. Strong consistency is reserved for invariants.”

KEY LINE: “Centralize authority, not every byte of execution.”

⸻

266. CONTROL PLANE PARTITIONING

QUESTION: “How would you partition control-plane state?”

TALKING SCRIPT: “Likely around natural aggregates such as objective/execution identity, organization, or region, depending on workload and consistency requirements. Work belonging to one objective should generally have a clear authoritative owner for state transitions. Cross-objective analytics can remain asynchronous. I wouldn’t prematurely shard until load requires it, but I would choose identifiers and state boundaries that allow partitioning later.”

KEY LINE: “Partition along ownership boundaries where possible.”

⸻

267. HOT PARTITIONS

QUESTION: “One massive objective creates thousands of tasks. Does it overload one partition?”

TALKING SCRIPT: “Potentially. The objective can own the high-level dependency graph while work-order execution state is distributed across separate aggregates. We need enough coordination to enforce objective-level invariants without forcing every task transition through one serialized hot key. Hierarchical state ownership helps: objective → work order → task → attempt.”

KEY LINE: “Hierarchical orchestration lets us preserve ownership without serializing all execution.”

⸻

268. HIERARCHICAL ORCHESTRATION

QUESTION: “What does hierarchical orchestration mean?”

TALKING SCRIPT: “Different levels govern different scopes. The objective layer owns the business outcome and cross-factory dependencies. The factory/work-order layer owns a governed lifecycle for its assigned outcome. The task layer owns concrete execution steps. The attempt layer owns one bounded execution. Each layer exposes explicit state and evidence upward without allowing lower layers to silently redefine the higher-level objective.”

KEY LINE: “Higher layers govern outcomes; lower layers execute bounded responsibility.”

⸻

269. NESTED AGENT LOOPS

QUESTION: “Would agents recursively spawn agents?”

TALKING SCRIPT: “Only through governed orchestration. I wouldn’t let an agent create unlimited autonomous descendants with inherited credentials and budget. A reasoning component may propose decomposition, but child work becomes explicit governed tasks with their own identity, scope, budget, capabilities, and evidence requirements. Parent budget and authority constrain the descendants.”

KEY LINE: “Delegation should subdivide authority, not multiply it.”

⸻

270. FAN-OUT LIMITS

QUESTION: “What if a planner decomposes one request into 10,000 tasks?”

TALKING SCRIPT: “The governed plan needs complexity and budget validation before execution. Excessive fan-out may indicate a valid large objective or a planning failure. Admission control can require approval for high-cost plans, cap concurrency independently from task count, and potentially re-plan into larger work units. The planner doesn’t get unlimited execution merely because it generated a large DAG.”

KEY LINE: “Planning creates proposals; admission decides whether the plan deserves resources.”

⸻

271. PLAN QUALIFICATION

QUESTION: “Would you evaluate the plan before executing it?”

TALKING SCRIPT: “For meaningful autonomous work, yes. Validate that the plan is acyclic where required, within scope and budget, uses qualified capabilities, respects policy, contains sufficient acceptance criteria, has required verification, and doesn’t request excessive authority. For high-risk objectives, semantic plan review may also be appropriate. It’s much cheaper to reject a bad plan before twenty agents execute it.”

KEY LINE: “Verify the strategy before paying to execute the strategy.”

⸻

272. PLANNER FAILURE

QUESTION: “What if the planner keeps generating bad plans?”

TALKING SCRIPT: “Treat planning as another qualified capability. Measure plan acceptance, downstream rework, execution success, cost variance, missing dependencies, and human corrections. If a planner degrades, remove it from eligible workloads or route planning to a stronger capability. Planner output isn’t inherently trusted simply because planning happens first.”

KEY LINE: “Planning is a capability and should be evaluated like one.”

⸻

273. PLAN REVISION

QUESTION: “An agent discovers halfway through execution that the plan is wrong.”

TALKING SCRIPT: “The execution can propose a plan revision, but it shouldn’t silently rewrite the contract. Identify the new information, determine which tasks and evidence are invalidated, update dependencies, acceptance criteria or budget if necessary, and pass the revision through the required policy or human authority. Then resume against the new plan version.”

KEY LINE: “Adaptation is allowed; invisible contract mutation is not.”

⸻

274. STATIC PLAN VS. ADAPTIVE EXECUTION

QUESTION: “Does a governed plan make the system too rigid?”

TALKING SCRIPT: “No, if we distinguish governed invariants from adaptive strategy. The plan can define objectives, boundaries, dependencies, acceptance criteria, and authority while allowing agents to choose implementation tactics dynamically. Material changes to the objective or authority require revision; local tactical decisions do not. Governance shouldn’t eliminate reasoning—it should bound it.”

KEY LINE: “Govern the boundaries; let intelligence adapt inside them.”

⸻

275. TOOL PLANNING

QUESTION: “Should the plan specify every tool call?”

TALKING SCRIPT: “Usually no. That would turn agentic execution back into deterministic workflow automation. The plan should specify required capabilities, constraints, expected artifacts, and verification, while the agent chooses individual tool calls within its authorized capability set. For high-risk side effects, the plan may explicitly require or restrict particular operations.”

KEY LINE: “Plan outcomes and boundaries, not every keystroke.”

⸻

276. DETERMINISTIC WORKFLOW VS. AGENTIC WORKFLOW

QUESTION: “When should the workflow itself be deterministic?”

TALKING SCRIPT: “When the correct sequence is known and stable. If every deployment must run the same security gates and approval checks, encode that deterministically. If the system must diagnose an unfamiliar failure or decide how to refactor an ambiguous codebase, agentic reasoning adds value. Most production factories will be hybrid workflows: deterministic lifecycle skeleton with agentic reasoning at selected decision points.”

KEY LINE: “Deterministic skeleton, agentic decision points.”

⸻

277. WHAT IS THE EXECUTION LOOP?

QUESTION: “Walk me through one agent execution.”

TALKING SCRIPT: “Load the bounded task, current durable state, execution profile, qualified capabilities, relevant context, and remaining budget. The model reasons and proposes an action. The runtime validates the action against tool schema and policy. The authorized tool executes. The result becomes an observation and relevant state/evidence is persisted. The loop continues while progress is occurring and budget remains. Success triggers required verification. Repeated failure can trigger strategy change, rerouting, escalation, or termination.”

KEY LINE: “Reason → authorize → act → observe → persist → verify.”

⸻

278. WHEN DOES THE LOOP STOP?

QUESTION: “How do you define stopping conditions?”

TALKING SCRIPT: “Several conditions: objective satisfied, required artifact produced, verification success, terminal failure, policy denial, budget exhaustion, timeout, cancellation, insufficient progress, unavailable required capability, or human escalation. The model can recommend completion, but the runtime should determine whether the externally defined completion contract has actually been satisfied.”

KEY LINE: “The model can propose ‘done.’ The system decides whether done is true.”

⸻

279. PROGRESS DETECTION

QUESTION: “How do you know the agent is making progress?”

TALKING SCRIPT: “I’d combine signals such as completed plan nodes, reduced verification failures, new valid artifacts, resolved dependencies, changed test results, successful tool outcomes, and movement toward acceptance criteria. Repeating similar reasoning or tool calls without improving those signals suggests stagnation. Progress is workload-specific, so I wouldn’t reduce it to token count or number of steps.”

KEY LINE: “Activity is not progress.”

⸻

280. STUCK AGENT RECOVERY

QUESTION: “The agent isn’t progressing. What next?”

TALKING SCRIPT: “First classify why: missing context, weak capability, unavailable tool, incorrect plan, deterministic failure, or model loop. Then choose a different strategy: retrieve additional context, invoke another skill, reroute to a stronger model, revise the plan, reset to a checkpoint, or escalate. Repeating the identical attempt should be the last resort.”

KEY LINE: “Recovery should change information or strategy, not merely repeat failure.”

⸻

281. RETRY BUDGET

QUESTION: “How many retries?”

TALKING SCRIPT: “I wouldn’t use one global number. Retry budgets depend on failure class, workload value, operation cost, idempotency, latency expectations, and progress. A cheap transient network call might tolerate several retries; an expensive 20-minute model execution should not. The control plane owns the remaining retry and economic budget.”

KEY LINE: “Retry policy should be economic and semantic, not arbitrary.”

⸻

282. TIMEOUT DESIGN

QUESTION: “How do you set timeouts?”

TALKING SCRIPT: “At multiple levels: individual tool call, model inference, task attempt, work order, and overall objective. They should reflect historical latency and workload expectations. A timeout should trigger a known state transition and recovery policy rather than leave ownership ambiguous. Long-running work benefits from heartbeats or leases rather than simply setting a six-hour socket timeout.”

KEY LINE: “Timeouts define failure semantics, not just waiting duration.”

283. CANCELLATION PROPAGATION — CONTINUED

QUESTION: “How does cancellation propagate through a multi-agent DAG?”

TALKING SCRIPT: “The objective enters a cancelling state, which prevents new dependent work from being scheduled. Active work receives a cancellation signal and stops at a safe boundary where possible. Task-specific credentials and future authority are revoked. Child tasks either terminate, finish a bounded non-interruptible operation, or enter compensation if they already created external side effects. Then the orchestrator determines which completed artifacts remain valid and records the objective as cancelled, partially completed, or requiring cleanup. Cancellation should propagate through the dependency graph without pretending already-committed side effects never happened.”

KEY LINE: “Cancellation revokes future authority; compensation handles past consequences.”

⸻

284. COMPENSATING ACTIONS

QUESTION: “What happens when cancellation or failure occurs after side effects?”

TALKING SCRIPT: “For every consequential non-transactional operation, I want to understand its compensation strategy before execution. Creating a branch may be reversible through deletion. Provisioning infrastructure may require teardown. Publishing an artifact may require deprecation rather than deletion. A database migration may require a specific rollback procedure. The workflow records which side effects completed and executes compensation in dependency-aware order where safe. If no reliable compensation exists, that irreversibility increases the verification and authority required before the original action.”

KEY LINE: “Compensation is part of workflow design, not cleanup improvisation.”

⸻

285. SAGA PATTERN

QUESTION: “Would you use distributed transactions?”

TALKING SCRIPT: “For workflows spanning source control, CI/CD, cloud infrastructure, ticketing, and external tools, a distributed ACID transaction generally isn’t realistic. I’d use a saga-style workflow: each step has durable state, idempotency semantics, and a compensation strategy where applicable. The orchestrator knows which steps committed and which compensations remain. For irreversible operations, we increase pre-execution authority rather than pretending compensation always exists.”

KEY LINE: “Use durable workflow and compensation where global transactions aren’t available.”

⸻

286. PARTIAL FAILURE ACROSS A DAG

QUESTION: “One branch of a parallel objective fails while three others succeed. What happens?”

TALKING SCRIPT: “The governed plan determines whether those branches are independent, conditionally useful, or jointly required. Successful independent work doesn’t need to be thrown away automatically. Dependent downstream work remains blocked. The failed branch can retry, reroute, revise, or escalate. At the objective level, success occurs only when the aggregate acceptance criteria are satisfied. This is why task completion and objective completion need separate semantics.”

KEY LINE: “Preserve valid progress without confusing partial progress with objective success.”

⸻

287. ORPHANED WORK

QUESTION: “What if the parent workflow dies but child workers keep running?”

TALKING SCRIPT: “Child execution should depend on leases and parent lifecycle authority, not merely a process that launched it. If the objective is cancelled, expired, or permanently failed, child work should lose the ability to acquire additional authority or publish results. Periodic reconciliation can detect orphaned attempts and terminate them. The control plane, not process ancestry, defines whether work still belongs to a valid objective.”

KEY LINE: “Execution ownership should survive process failure and terminate when authority disappears.”

⸻

288. RECONCILIATION LOOP

QUESTION: “How do you recover from state that doesn’t match reality?”

TALKING SCRIPT: “I’d use reconciliation for resources whose actual state can diverge from control-plane state. Compare desired state, authoritative workflow state, and observed external state. Examples include sandboxes, branches, deployments, credentials, and active workers. If the database says a sandbox is terminated but the cloud resource still exists, reconciliation cleans it up. If a worker disappeared without completing its transition, reconciliation expires ownership and makes recovery possible.”

KEY LINE: “Events drive progress; reconciliation repairs missed reality.”

⸻

289. EXACTLY-ONCE VS. AT-LEAST-ONCE

QUESTION: “Can you guarantee exactly-once execution?”

TALKING SCRIPT: “Usually not end-to-end across distributed external systems. I’d assume at-least-once delivery and build business-level exactly-once effects through idempotency, deduplication, transactions where available, fencing, and reconciliation. Claiming exactly-once without defining the scope usually hides failure cases.”

KEY LINE: “Exactly-once is usually an application invariant, not a transport guarantee.”

⸻

290. WHAT IF THE STATE STORE IS UNAVAILABLE?

QUESTION: “Can workers continue?”

TALKING SCRIPT: “Only within previously granted bounded authority, and the answer depends on risk. A worker may finish a safe local computation, but it shouldn’t acquire new work, extend budget, publish consequential state, obtain new credentials, or perform production actions if authoritative state can’t be confirmed. High-risk workflows should pause. When the state store recovers, reconciliation determines which attempts still own valid leases.”

KEY LINE: “Loss of authoritative state should constrain progress, not create speculative authority.”

⸻

291. DATABASE RECOVERY

QUESTION: “How do you protect workflow state?”

TALKING SCRIPT: “Traditional reliability engineering still applies: replication, backups, point-in-time recovery, integrity checks, failover, tested restore procedures, and explicit RPO/RTO. But I’d test recovery with active workflows, not merely whether the database can be restored. We need to know what happens to leases, in-flight attempts, approvals, budgets, and partially completed side effects after state recovery.”

KEY LINE: “Database recovery isn’t complete until workflow ownership is coherent again.”

⸻

292. DISASTER RECOVERY EXERCISE

QUESTION: “How would you test DR?”

TALKING SCRIPT: “Run controlled exercises: lose a region or primary state service, restore authoritative state, reestablish control-plane ownership, invalidate stale leases, reconnect model/tool dependencies, and resume representative long-running workflows. Verify RPO, RTO, evidence integrity, duplicate-side-effect protection, and builder-visible state. DR should prove the complete operating model rather than only infrastructure failover.”

KEY LINE: “Test recovery at the workflow level, not just the infrastructure level.”

⸻

293. MULTI-REGION ACTIVE/ACTIVE?

QUESTION: “Would you make Meta Factory active/active?”

TALKING SCRIPT: “Only if availability requirements justify the additional consistency and operational complexity. Builder APIs and stateless services may be easy to run active/active. Authority-sensitive workflow ownership is harder because I don’t want two regions simultaneously believing they own the same consequential execution. We could partition ownership by region or use globally coordinated leases, but I’d choose the simplest topology that meets the SLO rather than defaulting to active/active.”

KEY LINE: “High availability is valuable; ambiguous authority is not.”

⸻

294. DATA RESIDENCY

QUESTION: “What if some workloads can’t leave a geography?”

TALKING SCRIPT: “Data residency becomes an execution and routing constraint. Context retrieval, model eligibility, sandbox placement, artifact storage, evidence, and telemetry all need to honor the workload’s residency policy. The scheduler selects eligible regional capacity, and the capability router excludes providers that violate the data boundary. Residency isn’t just where the database lives.”

KEY LINE: “Data residency follows the complete execution path.”

⸻

295. MODEL PROVIDER DATA BOUNDARIES

QUESTION: “How do you know which data can be sent to which model?”

TALKING SCRIPT: “The model gateway combines data classification, provider policy, workload identity, geography, model qualification, and organizational rules before inference. Context assembly should label sensitive sources so routing knows whether the resulting request is eligible for a provider. I don’t want security policy buried in application prompts or left to individual engineers.”

KEY LINE: “Inference routing is also data-governance routing.”

⸻

296. DATA MINIMIZATION

QUESTION: “How do you minimize sensitive data exposure?”

TALKING SCRIPT: “Start by retrieving only what the task actually requires. Redact secrets and unnecessary PII before model context where possible. Prefer tool-mediated queries over dumping whole datasets into context. Restrict evidence and telemetry retention. Use narrower execution identities. Data minimization improves security, privacy, token economics, and often model quality simultaneously.”

KEY LINE: “Minimum sufficient context is also a security principle.”

⸻

297. OUTPUT DATA LEAKAGE

QUESTION: “What if the model returns sensitive context in its output?”

TALKING SCRIPT: “Authorization can’t stop at retrieval. Before presenting or publishing output, apply data-loss controls appropriate to the workload, especially when context contains mixed classifications. Tool results and generated artifacts should inherit provenance where practical. For high-risk workflows, deterministic scanners can detect secrets or restricted data before publication. The stronger defense remains preventing unnecessary sensitive data from entering context in the first place.”

KEY LINE: “Protect both context ingress and artifact egress.”

⸻

298. AUDIT LOG VS. OBSERVABILITY TRACE

QUESTION: “Are they the same thing?”

TALKING SCRIPT: “No. Observability traces are optimized for debugging and performance analysis and may have shorter retention or mutable enrichment. Audit records establish attributable consequential facts: who initiated the run, what authority was delegated, which policy allowed an action, who approved it, and what was released. They can share underlying events, but their integrity, retention, and access requirements differ.”

KEY LINE: “Telemetry explains behavior. Audit establishes accountability.”

⸻

299. LOGGING COST

QUESTION: “Won’t all this observability become enormously expensive?”

TALKING SCRIPT: “Yes if we retain everything indiscriminately. I’d use tiered telemetry: compact structured lifecycle events for every execution, richer traces for sampled or problematic runs, and risk-based retention for evidence. Large raw payloads can have shorter retention or be omitted unless needed. Cost itself should be observable so we know whether debugging value justifies retention.”

KEY LINE: “Observability should be sufficient, not infinite.”

⸻

300. TRACE SAMPLING

QUESTION: “Can you sample autonomous executions?”

TALKING SCRIPT: “For diagnostic traces, yes. For mandatory evidence or audit events, no. I’d distinguish optional high-cardinality observability from required lifecycle and authority records. Successful low-risk runs may receive lower trace sampling, while failures, high-risk workflows, anomalies, or new Factory Versions receive richer capture.”

KEY LINE: “Sample diagnostics; don’t sample accountability.”

⸻

301. DISTRIBUTED TRACING

QUESTION: “How would you trace a multi-agent objective?”

TALKING SCRIPT: “Use a hierarchical correlation model: objective ID → work-order ID → task ID → attempt ID, propagated through model calls, tool invocations, sandbox operations, verification, and delivery. That lets us reconstruct both the high-level lifecycle and individual execution attempts. I want the trace topology to mirror the orchestration topology.”

KEY LINE: “Trace identity should follow work identity.”

⸻

302. COST TRACING

QUESTION: “How do you know which task consumed the money?”

TALKING SCRIPT: “Attribute model tokens, provider charges, sandbox compute, tool cost, and verification cost to the attempt, then aggregate upward to task, work order, objective, factory, team, and workload class. That supports cost-per-accepted-outcome analysis and identifies whether economics are being driven by routing, retries, context, or verification.”

KEY LINE: “Cost should be traceable through the same hierarchy as work.”

⸻

303. PERFORMANCE BOTTLENECKS

QUESTION: “Where do you expect latency to come from?”

TALKING SCRIPT: “Different workloads have different bottlenecks: model inference, context retrieval, sandbox provisioning, repository checkout, build/test execution, tool latency, verification, queueing, or human authority. End-to-end tracing lets us measure rather than guess. I’d optimize the critical path for interactive workloads while allowing background workflows to trade latency for deeper reasoning or verification.”

KEY LINE: “Optimize the critical path, not the loudest component.”

⸻

304. SANDBOX COLD START

QUESTION: “Remote sandboxes take too long to start.”

TALKING SCRIPT: “Options include prewarmed pools, cached base images, layered dependency caches, workload-specific images, lazy initialization, and predictive provisioning. But prewarming changes security and cost characteristics, so I’d ensure each task still gets clean isolation and credentials. For interactive workflows, startup latency matters much more than for long-running delegated work.”

KEY LINE: “Optimize startup without turning ephemeral isolation into shared mutable state.”

⸻

305. REPOSITORY CHECKOUT COST

QUESTION: “What about enormous repositories?”

TALKING SCRIPT: “Use workload-appropriate source strategies: shallow or sparse checkout where safe, shared read-only object caches, incremental fetch, repository mirrors, or remote filesystem techniques. But the candidate workspace remains isolated and tied to an exact baseline commit. Repository optimization shouldn’t weaken provenance.”

KEY LINE: “Optimize data movement while preserving exact source identity.”

⸻

306. BUILD CACHE

QUESTION: “Would agents share build caches?”

TALKING SCRIPT: “Potentially, because build cost can dominate autonomous execution. Shared caches need content-addressing, integrity validation, authorization where artifacts are sensitive, and protection against cache poisoning. Cache keys should include the relevant toolchain and dependency identity. The sandbox can consume trusted cached artifacts without sharing mutable workspace.”

KEY LINE: “Share immutable computation, not mutable execution state.”

⸻

307. CACHE POISONING

QUESTION: “What if an agent poisons a shared cache?”

TALKING SCRIPT: “Treat cache publication as a privileged operation. Content-address artifacts, verify provenance, isolate untrusted candidate caches where necessary, and don’t allow arbitrary worker output to become globally trusted simply because it has a cache key. High-value shared caches may require trusted builders or post-build verification.”

KEY LINE: “A performance optimization must not become a trust shortcut.”

⸻

308. CONTEXT CACHE

QUESTION: “Would you cache RAG results?”

TALKING SCRIPT: “Yes where useful, but cache identity must include source version/freshness, authorization scope, retrieval configuration, and potentially task context. A cached result from one user’s permission context cannot automatically serve another. Dynamic code and policy may have short validity windows. Caching is an economic optimization that must preserve correctness and authorization.”

KEY LINE: “Cache context only when freshness and permission remain valid.”

⸻

309. PROMPT CACHING

QUESTION: “How would you use provider prompt caching?”

TALKING SCRIPT: “Stable shared context such as approved system instructions, large repository summaries, or common documentation may benefit from provider caching if the provider’s security and data policies allow it. I’d measure actual hit rate and end-to-end economics, because optimizing prompts around caching can create unnecessary coupling. Provider caching is an optimization beneath the capability interface, not a foundational architecture assumption.”

KEY LINE: “Exploit provider optimizations without designing the platform around them.”

⸻

310. CONTEXT COMPACTION

QUESTION: “What happens as an agent’s working context grows?”

TALKING SCRIPT: “I don’t want an indefinitely growing transcript. Persist authoritative state externally, summarize or compact prior observations, preserve important artifacts and evidence separately, and reconstruct each reasoning step from current task, state, relevant history, and retrieved context. Compaction itself can lose information, so high-value facts should be promoted into structured state rather than relying solely on model-generated summaries.”

KEY LINE: “Move durable facts out of conversation and into governed state.”

⸻

311. SUMMARIZATION ERRORS

QUESTION: “What if context compaction summarizes something incorrectly?”

TALKING SCRIPT: “Don’t make a generated summary the sole source of truth for consequential facts. Preserve references to original artifacts, structured state, tool results, and evidence. Summaries help reasoning efficiency; authoritative decisions should remain traceable to source information. For high-risk facts, retrieve the original rather than trusting a lossy summary.”

KEY LINE: “Summaries optimize context; they don’t replace provenance.”

⸻

312. AGENT MEMORY

QUESTION: “Would agents have long-term memory?”

TALKING SCRIPT: “Only with explicit scope, provenance, retention, authorization, and value. Repository-specific lessons, prior accepted decisions, or builder preferences may be useful. But unconstrained memory can propagate stale information, cross permission boundaries, and make behavior difficult to reproduce. I’d prefer structured domain memory and retrieval over opaque endless conversation memory.”

KEY LINE: “Memory should be governed knowledge, not accumulated conversation residue.”

⸻

313. MEMORY POISONING

QUESTION: “What if bad feedback becomes long-term memory?”

TALKING SCRIPT: “Memory writes should have their own trust and promotion semantics. One developer rejecting a finding shouldn’t automatically become repository truth. Candidate lessons can accumulate evidence, be scoped appropriately, and potentially require validation before becoming reusable memory. Provenance lets us remove or downgrade bad knowledge.”

KEY LINE: “Learning from feedback doesn’t mean believing every feedback signal.”

⸻

314. REPOSITORY-SPECIFIC MEMORY

QUESTION: “What should a repository remember?”

TALKING SCRIPT: “Useful durable information might include architecture decisions, accepted conventions, ownership, recurring failure patterns, historical incidents, known flaky tests, accepted/rejected review patterns, and verified repository-specific instructions. But it should remain versioned and attributable. Source code itself remains the primary truth for implementation behavior.”

KEY LINE: “Repository memory should explain the codebase, not compete with it.”

⸻

315. HUMAN FEEDBACK

QUESTION: “How do thumbs-up/down signals fit?”

TALKING SCRIPT: “They’re useful but weak signals. I prefer behavioral evidence such as whether a finding was accepted, whether code changed in response, whether the PR merged, whether a defect later escaped, or whether the builder reverted the output. Explicit feedback can supplement those signals, but I wouldn’t let a simple thumbs-up become a direct production-training command.”

KEY LINE: “Prefer outcome signals over sentiment signals when available.”

ADOBE — ARCHITECTURE & SYSTEM DESIGN

Jeffrey Mott + Vikram Sethi — Continued

316. IMPLICIT FEEDBACK — CONTINUED

QUESTION: “What implicit signals would you collect?”

TALKING SCRIPT: “I’d capture signals that tell us what happened after the agent produced an answer: accepted patch, rejected patch, edits after generation, review finding accepted, tool call manually corrected, rerun requested, merge outcome, rollback, incident, time-to-accept, and production behavior. Those signals are often more useful than asking whether someone liked the response. I’d connect them back to the exact Factory Version, model route, skill, context strategy, repository, and workload class so we can identify what actually contributed to success or failure.”

KEY LINE: “Prefer observed outcomes over self-reported satisfaction when both are available.”

⸻

317. LEARNING FROM HUMAN CORRECTIONS

QUESTION: “How would you use edits engineers make to agent-generated code?”

TALKING SCRIPT: “First determine what the correction means. It may indicate a model failure, missing context, incorrect plan, repository convention, verification gap, or simply human preference. I wouldn’t automatically turn every edit into a new rule. Aggregate repeated patterns, preserve provenance, and evaluate candidate improvements. If the same correction occurs repeatedly across similar workloads, that’s evidence worth converting into a skill, context source, evaluation, or routing adjustment.”

KEY LINE: “Corrections are evidence to analyze, not instructions to blindly memorize.”

⸻

318. ACCEPTED VS. REJECTED CODE REVIEW FINDINGS

QUESTION: “How would review feedback improve the system?”

TALKING SCRIPT: “For every finding, I’d ideally know category, severity, model/capability, repository, context used, whether the developer accepted it, whether code changed, and whether the resulting change survived downstream verification and production. Repeated false positives can improve repository-specific skills or suppression. Escaped defects become new verification cases. The objective is improving review precision and defect prevention, not maximizing comment volume.”

KEY LINE: “A review agent should learn which findings create engineering value, not which findings create activity.”

⸻

319. PRODUCTION OUTCOMES AS LEARNING SIGNALS

QUESTION: “Why do production outcomes belong in the factory?”

TALKING SCRIPT: “Because pre-merge verification is still a prediction. Production tells us whether the change actually achieved the intended result. Signals such as rollback, incident, latency regression, error rate, user behavior, adoption, or business KPI movement can validate or challenge our verification assumptions. Those signals should connect back to the execution evidence so we can ask whether the plan, model, verification, or rollout strategy should change.”

KEY LINE: “Verification predicts trust. Production validates the prediction.”

⸻

320. OUTCOME ATTRIBUTION

QUESTION: “How do you know an agent caused a production improvement or regression?”

TALKING SCRIPT: “Attribution is difficult, so I wouldn’t overclaim causality. I’d preserve traceability from objective → candidate change → deployment → exposure → production telemetry and use controlled rollout, canaries, feature flags, or experiments where appropriate. That gives us stronger evidence than simple temporal correlation. The learning system should represent uncertainty rather than pretending every outcome has one obvious cause.”

KEY LINE: “Learning requires attribution, but attribution should preserve uncertainty.”

⸻

321. LEARNING LOOP FREQUENCY

QUESTION: “How quickly should Meta Factory update itself?”

TALKING SCRIPT: “Observation can be continuous; promotion cadence should follow risk. Routing weights for low-risk workloads might adapt relatively quickly. Repository skills could promote after sufficient evaluation. Security policy or high-impact verification changes should move much more conservatively. I wouldn’t tie every learning mechanism to one release cadence.”

KEY LINE: “Learn continuously; promote according to consequence.”

⸻

322. ONLINE LEARNING

QUESTION: “Would you let the router learn directly from production traffic?”

TALKING SCRIPT: “Potentially within bounded parameters, but I’d separate online adaptation from unconstrained production mutation. A router may update statistical estimates from observed outcomes while the set of eligible capabilities and hard policy constraints remain governed. Material behavioral changes still become candidate versions with evaluation and rollback. I don’t want an optimizer silently redefining production policy because yesterday’s traffic looked different.”

KEY LINE: “Adapt estimates online; govern changes in authority and behavior.”

⸻

323. RECURSIVE SELF-IMPROVEMENT

QUESTION: “Could Meta Factory improve Meta Factory?”

TALKING SCRIPT: “Yes, but that’s where governance matters most. The factory can identify weaknesses in its own routing, prompts, skills, tools, evaluation, context strategy, or code, generate candidate changes, and run those candidates through the same independent qualification process. What I would not allow is the active production factory rewriting and promoting its own control plane without independent evaluation and authority. The system can propose its successor; it shouldn’t unilaterally crown it.”

KEY LINE: “A factory can build its successor. It should not self-authorize its successor.”

⸻

324. SELF-MODIFYING CONTROL PLANE

QUESTION: “Would you let agents modify Meta Factory’s own governance code?”

TALKING SCRIPT: “They can produce candidate changes like any other engineering workflow, but those changes should have a higher risk tier, stronger independent verification, protected holdouts, separation of duties, and explicit human authority. Control-plane changes can alter the rules governing every other agent, so their blast radius is fundamentally different from an application feature.”

KEY LINE: “The machinery governing autonomy deserves the strongest verification.”

⸻

325. BOOTSTRAP PROBLEM

QUESTION: “If Meta Factory evaluates itself, who verifies the verifier?”

TALKING SCRIPT: “I avoid one circular trust chain. Use deterministic platform tests, independently maintained security tooling, protected evaluation sets, alternative evaluators, human authority, and production evidence. Some verification infrastructure should remain independently accountable from the system being changed. We don’t need infinite regress; we need enough failure-mode diversity that one defective component cannot certify the entire stack.”

KEY LINE: “Break circular trust with independent evidence sources.”

⸻

326. HOLDOUT EVALUATIONS

QUESTION: “Why protect some evaluations from the agent?”

TALKING SCRIPT: “To detect overfitting and reward hacking. Development evaluations help agents and engineers improve behavior, while protected holdouts provide an independent measure of whether the candidate generalized. The producing system shouldn’t be able to inspect or modify every criterion used to qualify its own promotion.”

KEY LINE: “The producer should not control its entire exam.”

⸻

327. BASELINE VS. CANDIDATE

QUESTION: “How do you decide whether a new Factory Version is better?”

TALKING SCRIPT: “Run the same representative workload corpus against the current qualified baseline and candidate. Compare quality, policy compliance, security, reliability, latency, retries, human correction, and economics. I wouldn’t promote solely because the candidate improves one aggregate score. Required dimensions have floors, and regressions in critical workload classes can block promotion even when the overall average rises.”

KEY LINE: “Promotion is comparative, multidimensional, and workload-specific.”

⸻

328. REGRESSION BUDGETS

QUESTION: “Can a candidate regress anywhere?”

TALKING SCRIPT: “Potentially on noncritical dimensions if the overall tradeoff is explicitly acceptable. For example, a slight latency increase may be worthwhile for a major quality improvement in background work. But security, policy, and critical correctness may have zero-tolerance floors. Define allowable regression budgets by workload and dimension rather than assume every metric must monotonically improve.”

KEY LINE: “Tradeoffs are acceptable only where the contract says they are acceptable.”

⸻

329. EVALUATION DISTRIBUTION

QUESTION: “How do you make the eval corpus representative?”

TALKING SCRIPT: “Combine curated golden cases, sampled real workloads, repository diversity, difficult edge cases, historical failures, adversarial scenarios, and protected holdouts. Segment results by language, repository type, workflow, risk, and complexity so aggregate averages don’t hide failures. Continuously compare offline scores with production outcomes and refresh the corpus when they diverge.”

KEY LINE: “An evaluation suite is useful only to the extent it represents the workload distribution we care about.”

⸻

330. EVAL COST

QUESTION: “Running every candidate against everything is too expensive. What do you do?”

TALKING SCRIPT: “Use a tiered evaluation strategy. Fast deterministic and targeted regression suites run on every change. Broader semantic and expensive workload evaluations run for behavior-changing candidates. High-risk releases receive the full qualification suite. Impact analysis can select relevant workload subsets, while periodic full evaluations detect blind spots. Evaluation cost should follow expected blast radius.”

KEY LINE: “Qualification depth should scale with behavioral change and consequence.”

⸻

331. EVAL LATENCY

QUESTION: “What if qualification takes hours?”

TALKING SCRIPT: “Parallelize independent evaluation workloads, reuse immutable environment and context caches safely, run cheap gates first to fail candidates quickly, and separate developer feedback from final qualification. I don’t need every engineer waiting for the complete enterprise qualification suite while iterating locally. The release path can be slower than the development feedback loop.”

KEY LINE: “Fast feedback and strong qualification are different latency problems.”

⸻

332. SHADOW EVALUATION

QUESTION: “How would you test a candidate router or reviewer on live traffic?”

TALKING SCRIPT: “Mirror eligible workloads to the candidate without giving it production authority. Compare decisions, outputs, verification, latency, cost, and downstream acceptance with the active system. For code generation, we may avoid executing side effects; for review, shadowing is straightforward. Shadow data gives us current workload distribution before canarying.”

KEY LINE: “Shadow first when observation is valuable and authority isn’t necessary.”

⸻

333. CANARY PROMOTION

QUESTION: “What gates move a candidate from 1% to 10% to 50%?”

TALKING SCRIPT: “Predefined thresholds across quality, security, policy, reliability, latency, cost, human correction, and incident signals. Cohorts should be representative enough to expose relevant workload diversity. A promotion controller can automate movement within approved boundaries, but critical regressions stop or roll back immediately. Promotion policy itself is versioned.”

KEY LINE: “Increase blast radius only when evidence earns it.”

⸻

334. AUTOMATED ROLLBACK

QUESTION: “Would you let the system roll itself back?”

TALKING SCRIPT: “Yes for predefined, evidence-backed conditions where rollback is safe. If a new Factory Version causes a clear quality, reliability, or cost regression, automated rollback can reduce impact faster than waiting for humans. The rollback target must be a known-good qualified version, and the system should preserve evidence explaining why rollback occurred.”

KEY LINE: “Automation is especially valuable when it reduces time spent in a known-bad state.”

⸻

335. FACTORY VERSION RESTORATION

QUESTION: “How do you restore the previous behavior?”

TALKING SCRIPT: “Because production routes to immutable qualified Factory Versions, restoration means moving eligible traffic back to the prior qualified composition rather than manually reconstructing old prompts, tools, policies, and models. Any external side effects created by the bad version still need separate recovery, but behavioral restoration becomes straightforward.”

KEY LINE: “Immutable qualified versions turn rollback from archaeology into routing.”

⸻

336. FACTORY VERSION PROMOTION

QUESTION: “Who promotes a Factory Version?”

TALKING SCRIPT: “Promotion authority depends on risk. The platform can automate progression when all predefined qualification and rollout conditions are met, while higher-risk factory changes may require explicit human approval or separation of duties. The key is that promotion is a control-plane action backed by evaluation evidence, not something the producing agent can perform directly.”

KEY LINE: “The system can earn promotion; the producer doesn’t grant itself promotion.”

⸻

337. IMMUTABILITY

QUESTION: “Why make Factory Versions immutable?”

TALKING SCRIPT: “Because qualification needs a stable target. If the model route, prompt, skill, tool, policy, or execution environment can mutate underneath the same version identifier, we cannot reproduce behavior, compare candidates, investigate incidents, or confidently roll back. New behavior creates a new candidate version.”

KEY LINE: “If behavior can change, identity must change.”

⸻

338. CONFIGURATION AS CODE

QUESTION: “Would factory definitions live in source control?”

TALKING SCRIPT: “Yes for declarative behavior that benefits from review, history, ownership, and reproducibility: workflow definitions, policies, routing configuration, skill manifests, evaluation configuration, and execution profiles. Sensitive runtime values such as secrets remain outside source control. Promotion still produces an immutable runtime artifact rather than assuming whatever is currently on main is qualified.”

KEY LINE: “Version configuration like code; qualify the resulting runtime composition.”

⸻

339. SCHEMA FOR A FACTORY DEFINITION

QUESTION: “What would a Factory Definition contain?”

TALKING SCRIPT: “At a high level: factory identity and owner; supported outcome classes; workflow/dependency rules; required and eligible capabilities; routing policy; context strategy; Execution Profiles; security and authorization policy; verification requirements; evidence contract; human-authority rules; evaluation identity; rollout policy; and lifecycle metadata. The definition describes how an outcome class is governed, not the implementation of every capability.”

KEY LINE: “Factory definition is the governed contract for producing an outcome.”

⸻

340. FACTORY OWNERSHIP

QUESTION: “Who owns a factory?”

TALKING SCRIPT: “A named engineering/product organization should own its outcome contract, lifecycle, qualification, SLOs, verification quality, operational health, and deprecation. Shared capabilities have their own owners. This prevents the common failure where everyone uses an autonomous workflow but nobody owns its production behavior.”

KEY LINE: “Reusable autonomy still requires explicit ownership.”

⸻

341. FACTORY DEPRECATION

QUESTION: “How do you retire an old factory?”

TALKING SCRIPT: “Identify active workloads and consumers, provide a qualified replacement where appropriate, stop new routing, migrate or complete in-flight work according to compatibility rules, preserve required evidence, and eventually revoke the deprecated version. Deprecation should be part of the lifecycle from the beginning because models, tools, and workflows will change quickly.”

KEY LINE: “Design for replacement as deliberately as design for adoption.”

⸻

342. CAPABILITY DEPRECATION

QUESTION: “A shared tool is being retired. What breaks?”

TALKING SCRIPT: “The registry should let us query every Factory Version and workload depending on that capability. Qualify replacements, create new candidate Factory Versions, migrate progressively, and prevent new versions from depending on the deprecated capability. This is why capability dependency metadata matters.”

KEY LINE: “A capability registry should answer not only ‘what exists?’ but ‘what depends on it?’”

⸻

343. DEPENDENCY MANAGEMENT

QUESTION: “How do you prevent dependency chaos across hundreds of capabilities?”

TALKING SCRIPT: “Use explicit version constraints, ownership, compatibility contracts, dependency graphs, automated qualification, and deprecation policy. Factory Versions bind exact qualified compositions rather than dynamically resolving arbitrary latest versions. Development can experiment with newer dependencies, but production runs known compositions.”

KEY LINE: “Resolve flexibility before production; execute deterministically after qualification.”

⸻

344. PLUGIN / EXTENSION ECOSYSTEM

QUESTION: “Could every Adobe team publish tools into Meta Factory?”

TALKING SCRIPT: “Yes, with a governed path. Teams can develop extensions independently, but publication requires a manifest, owner, version, schemas, requested permissions, security classification, evaluation evidence, and operational metadata. Low-risk capabilities can have highly automated qualification; high-risk side-effecting tools require stronger review. Production routing sees only qualified versions.”

KEY LINE: “Make extension easy; make implicit trust impossible.”

⸻

345. CAPABILITY DISCOVERY

QUESTION: “How does an agent discover available capabilities?”

TALKING SCRIPT: “The runtime exposes a task-appropriate subset from the registry rather than dumping thousands of tools into context. Selection can consider workflow, permissions, task type, repository, Execution Profile, and capability qualification. This improves both security and model performance because unnecessary tools increase choice complexity and token usage.”

KEY LINE: “Expose the minimum sufficient capability set, just like minimum sufficient context.”

⸻

346. TOOL OVERLOAD

QUESTION: “What happens when the model has hundreds of tools?”

TALKING SCRIPT: “Tool-selection quality generally deteriorates as irrelevant options grow. Use hierarchical discovery, capability search, skills that package related tools, or a deterministic prefilter to narrow the candidate set before reasoning. Evaluate tool-selection accuracy explicitly. I don’t want the model solving enterprise service discovery on every step.”

KEY LINE: “Capability abundance requires capability selection.”

⸻

347. CAPABILITY COMPOSITION

QUESTION: “Can one skill call another skill?”

TALKING SCRIPT: “Potentially, but composition should remain visible to governance. If one capability internally invokes another with different authority or cost, that dependency needs to be represented. I don’t want hidden transitive permissions where approving Skill A silently grants access to powerful Tool B. Capability composition should preserve permission and evidence boundaries.”

KEY LINE: “Composition should not hide authority.”

⸻

348. TRANSITIVE AUTHORITY

QUESTION: “Why is that dangerous?”

TALKING SCRIPT: “Because an apparently low-risk capability can become high-risk through its dependencies. If a review skill can invoke a shell tool that can access credentials and network egress, its effective authority is much larger than its name suggests. Qualification should consider the transitive capability graph, not just the top-level interface.”

KEY LINE: “Effective authority is the union of what the execution can actually reach.”

⸻

349. LEAST PRIVILEGE FOR AGENTS

QUESTION: “How granular should permissions be?”

TALKING SCRIPT: “Granular enough to materially reduce blast radius without making the system unusable. Think in terms of repository, branch, file class where appropriate, tool, operation, network destination, credential scope, environment, and duration. I wouldn’t invent file-level policy everywhere unless the risk warrants it. Least privilege is an optimization against consequence, not a contest to create the most ACLs.”

KEY LINE: “Grant the smallest practical authority required for the task.”

⸻350. TEMPORAL AUTHORITY

QUESTION: “Should an agent keep the same permissions for the entire workflow?”

TALKING SCRIPT: “Not necessarily. I prefer just-in-time, task-specific authority. A planning task may need read-only repository and documentation access. Implementation may need write access to an isolated worktree. Verification may need execute access but no publication authority. Deployment requires a completely different capability. Credentials should be issued when the relevant stage begins and expire when that authority is no longer required. That prevents an agent from accumulating privileges across a long-running workflow.”

KEY LINE: “Authority should be scoped by capability, resource, and time.”

⸻

351. PRIVILEGE ESCALATION

QUESTION: “What if the agent discovers it needs more permissions?”

TALKING SCRIPT: “The agent can request additional authority, but it cannot grant that authority to itself. The request should explain what capability is needed, why, which resource is affected, what action will be performed, and whether the operation is reversible. Policy may automatically authorize low-risk escalation within predefined boundaries; higher-risk requests go to a human or appropriate authority. The resulting authorization becomes part of the evidence trail.”

KEY LINE: “Agents can request authority. They cannot manufacture authority.”

⸻

352. DELEGATED AUTHORITY

QUESTION: “Does an agent simply inherit the permissions of the builder?”

TALKING SCRIPT: “No. The builder’s identity establishes the maximum possible authority, not necessarily the authority delegated to the task. Meta Factory derives a narrower execution identity based on builder permissions, workflow, repository, risk classification, requested capabilities, and policy. A builder who can deploy production manually doesn’t imply every agent they launch should receive production deployment credentials.”

KEY LINE: “User authority is the ceiling; task authority should usually be smaller.”

⸻

353. SERVICE IDENTITY VS. USER IDENTITY

QUESTION: “Should the agent act as the user or as a service?”

TALKING SCRIPT: “I want both concepts preserved. The execution needs an attributable initiating identity—who requested the work—and a task-specific workload identity representing the autonomous execution. Policy can then reason about the combination. That gives us attribution without forcing long-running remote workers to impersonate a human indefinitely.”

KEY LINE: “Preserve who requested the work and separately identify what is performing it.”

⸻

354. CREDENTIAL BROKER

QUESTION: “How would agents obtain credentials?”

TALKING SCRIPT: “Through a trusted credential broker or workload-identity mechanism, not static secrets embedded in prompts or images. The runtime presents its authenticated execution identity, requests a specific capability, and receives a short-lived credential scoped to the required resource and operation. Ideally privileged tools mediate the operation so the model never receives the underlying secret at all.”

KEY LINE: “Give agents access to capabilities, not bags of secrets.”

⸻

355. CREDENTIAL REVOCATION

QUESTION: “How quickly can you revoke an agent?”

TALKING SCRIPT: “Short-lived credentials reduce the revocation problem, but I also want centralized capability and workload revocation. Cancelling the execution or quarantining a Factory Version should prevent renewal and invalidate future authority. For serious incidents, revoke active tokens or underlying identities where supported. Revocation latency becomes an important security characteristic.”

KEY LINE: “Short-lived authority limits how long a mistake remains powerful.”

⸻

356. SECRET LEAKAGE INTO MODEL CONTEXT

QUESTION: “What if a tool returns a secret and the agent puts it into the prompt?”

TALKING SCRIPT: “I want secrets prevented from entering model context wherever possible. Tool gateways can return opaque handles or redacted values rather than raw credentials. Context assembly and telemetry can apply secret detection and redaction. If the model doesn’t need the secret to reason, it shouldn’t receive it. If exposure occurs, rotate the credential and trace where the value propagated.”

KEY LINE: “The safest secret in model context is the secret that never entered it.”

⸻

357. PROMPT INJECTION THROUGH TOOL OUTPUT

QUESTION: “What if an external tool returns malicious instructions?”

TALKING SCRIPT: “Tool output is also untrusted data unless the capability contract explicitly establishes otherwise. Preserve provenance, distinguish data from system instructions, minimize unnecessary output, and keep authorization outside the model. A malicious package description, webpage, issue, or tool response may influence reasoning, but it should not expand authority.”

KEY LINE: “Untrusted input remains untrusted regardless of which connector delivered it.”

⸻

358. INDIRECT PROMPT INJECTION

QUESTION: “What if the malicious instruction isn’t in the prompt but in retrieved documentation?”

TALKING SCRIPT: “That’s precisely why prompt injection is an architecture problem. Retrieved content is interpreted as data with provenance and trust level. The model may still be manipulated, so the real defense is bounded tools, scoped credentials, restricted egress, deterministic authorization, and independent verification. Prompt filtering can help, but I wouldn’t make security depend on perfectly recognizing malicious natural language.”

KEY LINE: “Assume reasoning can be influenced; ensure authority remains bounded.”

⸻

359. DATA EXFILTRATION THROUGH TOOL CALLS

QUESTION: “The model tries to send source code to an external endpoint.”

TALKING SCRIPT: “The sandbox’s network policy should prevent arbitrary egress. Tool invocation also passes through authorization, so the model cannot create a new outbound capability simply by constructing a URL. For approved external destinations, data classification can restrict which content is allowed to leave. The event becomes a security signal and potentially terminates the execution depending on policy.”

KEY LINE: “The model can propose exfiltration; the runtime must make it impossible to authorize accidentally.”

⸻

360. MALICIOUS DEPENDENCY

QUESTION: “An agent installs a compromised package.”

TALKING SCRIPT: “The execution profile should restrict package sources to approved registries, while dependency verification checks provenance, vulnerabilities, signatures where available, licenses, and policy. Installation happens inside the sandbox with restricted egress and no broad credentials. Newly introduced dependencies become part of the candidate diff and evidence. For sensitive workflows, introducing a new dependency may require additional authority.”

KEY LINE: “Dependency installation is a governed side effect, not harmless setup.”

⸻

361. MALICIOUS REPOSITORY

QUESTION: “What if the repository itself contains code designed to attack the agent?”

TALKING SCRIPT: “Assume repository code is hostile. Clone it into a bounded sandbox with no ambient host credentials, restricted network, scoped filesystem, resource limits, and short-lived task identity. Builds and tests execute inside that boundary. The agent should not be able to escape simply because a test script executes arbitrary code.”

KEY LINE: “Treat code execution as hostile workload execution.”

⸻

362. RESOURCE EXHAUSTION ATTACK

QUESTION: “A repository test consumes all CPU or memory.”

TALKING SCRIPT: “Resource limits belong in the Execution Profile: CPU, memory, disk, process count, wall-clock time, and potentially network bandwidth. The sandbox runtime enforces them independently of the agent. Resource exhaustion becomes a classified execution failure rather than destabilizing the worker fleet.”

KEY LINE: “A task can exhaust its allocation; it should not exhaust the platform.”

⸻

363. FORK BOMB / PROCESS EXPLOSION

QUESTION: “What if generated code spawns thousands of processes?”

TALKING SCRIPT: “Namespace isolation and process limits should stop that at the sandbox boundary. The worker reports resource-limit failure, preserves relevant evidence, and terminates the environment. The model doesn’t get to negotiate around operating-system resource controls.”

KEY LINE: “Enforce hard resource boundaries below the model.”

⸻

364. NETWORK ABUSE

QUESTION: “What if an agent starts scanning internal services?”

TALKING SCRIPT: “Default-deny or tightly restricted egress dramatically reduces that risk. The execution profile defines allowed destinations and protocols. Network policy is enforced outside the sandbox process where possible. Unexpected connection attempts become security telemetry and can trigger termination or quarantine.”

KEY LINE: “Network reachability is authority.”

⸻

365. DENIAL-OF-SERVICE THROUGH AGENTS

QUESTION: “Could thousands of agents accidentally DDoS an internal service?”

TALKING SCRIPT: “Yes, which is why individual sandbox isolation isn’t enough. The platform needs aggregate rate limits, concurrency controls, service-aware quotas, and backpressure. A tool gateway can centrally protect shared dependencies rather than letting every worker independently hammer them. Agent scale turns ordinary retry bugs into distributed incidents.”

KEY LINE: “Safe individual behavior can still become unsafe aggregate behavior.”

⸻

366. TOOL GATEWAY

QUESTION: “Why put a gateway between agents and tools?”

TALKING SCRIPT: “It creates a deterministic enforcement point for identity, authorization, schemas, rate limits, audit, credential mediation, policy, telemetry, and revocation. It also prevents every agent from embedding direct credentials and integration logic. I wouldn’t force every low-level local operation through a remote gateway, but consequential enterprise capabilities benefit from a governed boundary.”

KEY LINE: “Centralize consequential tool authority without centralizing every local operation.”

⸻

367. TOOL GATEWAY BOTTLENECK

QUESTION: “Doesn’t that gateway become a bottleneck?”

TALKING SCRIPT: “Potentially, so it should scale horizontally and avoid unnecessary state. Authorization decisions can use cached policy where safe, while authoritative revocations remain centrally enforceable. High-volume local deterministic tools can remain inside the sandbox. The gateway should govern shared or consequential capabilities, not every filesystem read.”

KEY LINE: “Govern the risky boundary, not every instruction.”

⸻

368. TOOL RESULT SCHEMAS

QUESTION: “Why require structured tool outputs?”

TALKING SCRIPT: “Structured outputs improve validation, context efficiency, error classification, evidence, and model reliability. A tool can return typed success, failure, metadata, and artifacts rather than forcing the model to parse arbitrary prose. Free-form output can still exist where appropriate, but consequential tools benefit from explicit contracts.”

KEY LINE: “Structured boundaries reduce probabilistic ambiguity.”

⸻

369. TOOL FAILURE CLASSIFICATION

QUESTION: “How should tools report errors?”

TALKING SCRIPT: “Not every failure should look like generic text. Distinguish transient, authorization, validation, not-found, conflict, rate-limit, dependency, and terminal failures where possible. The runtime can then choose retry, reroute, clarification, escalation, or stop. Error semantics are part of the tool contract.”

KEY LINE: “Structured failures enable intelligent recovery.”

⸻

370. TOOL TIMEOUT

QUESTION: “A tool never returns.”

TALKING SCRIPT: “Every external capability needs bounded timeout semantics. The runtime cancels or abandons the call, determines whether the operation may have produced an ambiguous side effect, and applies the appropriate retry or reconciliation strategy. A timeout isn’t always proof that nothing happened.”

KEY LINE: “Timeout means unknown completion, not necessarily no completion.”

⸻

371. AMBIGUOUS SIDE EFFECT

QUESTION: “The deployment API times out after you send the request. Retry?”

TALKING SCRIPT: “Not blindly. First query the external system using an idempotency key or operation ID to determine whether the deployment actually started. If the API supports idempotent submission, retry safely. Otherwise reconcile before taking another side effect. This is a classic place where naïve retry logic duplicates consequential actions.”

KEY LINE: “Resolve ambiguity before repeating consequence.”

⸻

372. TOOL COMPROMISE

QUESTION: “An MCP server is compromised. What do you do architecturally?”

TALKING SCRIPT: “The capability registry lets me centrally quarantine the exact tool/version, preventing new routing. The tool gateway blocks invocation, active high-risk runs can be paused, affected execution histories identify who invoked it and what authority it had, credentials can be rotated, and dependent Factory Versions become unqualified until a replacement is validated.”

KEY LINE: “Capability revocation should propagate faster than capability deployment.”

⸻

373. TRANSITIVE TOOL COMPROMISE

QUESTION: “What if dozens of skills depend on the compromised tool?”

TALKING SCRIPT: “That’s why the registry needs dependency relationships. Quarantining the underlying capability should automatically make dependent compositions ineligible where that tool is required. We shouldn’t rely on every team manually discovering the dependency.”

KEY LINE: “Govern dependency graphs, not just individual tools.”

⸻

374. SOFTWARE BILL OF MATERIALS FOR THE FACTORY

QUESTION: “Would you maintain an SBOM-like record for agent systems?”

TALKING SCRIPT: “Yes conceptually. A qualified Factory Version should identify its models, skills, tools, policies, execution image, workflow definitions, evaluation identity, and important dependencies. That gives us a behavioral bill of materials. If a tool, model, or library is compromised, we can identify affected versions quickly.”

KEY LINE: “Autonomous behavior needs a bill of materials too.”

⸻

375. MODEL SBOM / PROVENANCE

QUESTION: “What would you record about models?”

TALKING SCRIPT: “Provider, exact model/version where available, deployment route, qualification status, data-policy eligibility, evaluation history, known limitations, and potentially model-card or provenance metadata. For internally trained models, add training-data lineage, training configuration, checkpoint identity, and evaluation evidence.”

KEY LINE: “A model name isn’t sufficient production provenance.”

⸻

376. SOFTWARE SUPPLY CHAIN

QUESTION: “How does Meta Factory interact with existing software supply-chain controls?”

TALKING SCRIPT: “It should strengthen them rather than bypass them. Generated code still flows through source control, dependency policy, artifact signing, provenance, build systems, vulnerability scanning, release controls, and deployment policy. Meta Factory adds provenance about autonomous generation and verification. AI doesn’t create a separate trusted lane around the software supply chain.”

KEY LINE: “Agent-generated software should enter the same or stronger supply-chain controls as human-generated software.”

⸻

377. ARTIFACT SIGNING

QUESTION: “Would the factory sign artifacts?”

TALKING SCRIPT: “Where Adobe’s existing supply-chain architecture uses signing, the trusted build or publication system should sign accepted artifacts—not the model. The evidence bundle can bind the artifact hash to the Factory Version, verification, and authority decision. That creates a verifiable chain from autonomous execution to released artifact.”

KEY LINE: “Models propose artifacts; trusted infrastructure establishes provenance.”

⸻

378. PROVENANCE ATTESTATION

QUESTION: “What should an attestation say?”

TALKING SCRIPT: “Something like: this artifact came from this source baseline, under this Factory Version and Execution Profile, using these relevant capabilities, passed these required verification gates, and received this authority decision. The exact format can align with existing supply-chain standards rather than inventing an AI-specific cryptographic universe.”

KEY LINE: “Extend existing provenance systems with autonomous-execution evidence.”

⸻

379. BUILD SYSTEM INTEGRATION

QUESTION: “Would Meta Factory own builds?”

TALKING SCRIPT: “No reason to replace mature build infrastructure. The factory invokes existing build systems as deterministic capabilities, captures the exact inputs and results, and uses them as verification evidence. For sandbox-local fast feedback, it may run targeted builds directly, but authoritative release builds should continue through established trusted infrastructure.”

KEY LINE: “Reuse deterministic engineering systems where they already establish trust.”

⸻

380. CI INTEGRATION

QUESTION: “Does the agent run CI itself?”

TALKING SCRIPT: “It can invoke CI through a governed capability and observe results. The factory may also run fast local verification before publishing a candidate. I distinguish fast agent feedback from authoritative enterprise CI evidence. Both can be useful at different stages.”

KEY LINE: “Local checks accelerate iteration; authoritative CI supports acceptance.”

⸻

381. MERGE QUEUE

QUESTION: “How does a merge queue fit?”

TALKING SCRIPT: “It’s valuable because verification against an isolated branch may become stale as main changes. The factory can submit accepted candidates to the existing merge queue, where integration verification runs against the current merge base. Meta Factory should consume that result as additional evidence rather than assume earlier verification remains permanently valid.”

KEY LINE: “Evidence must follow the artifact through integration.”

⸻

382. STALE VERIFICATION AFTER REBASE

QUESTION: “The PR rebases. Are the old tests still valid?”

TALKING SCRIPT: “Not necessarily. Material changes to the baseline can invalidate evidence. The system should understand evidence dependencies and rerun affected verification after rebase or merge-queue integration. We don’t need to rerun everything if impact analysis proves some evidence remains valid, but we shouldn’t blindly carry acceptance forward.”

KEY LINE: “When the artifact changes, reevaluate the evidence that depended on it.”

⸻

383. MERGE CONFLICT

QUESTION: “An autonomous PR conflicts with another change.”

TALKING SCRIPT: “Treat conflict resolution as new implementation work, not mechanical success. The agent may attempt a rebase or semantic reconciliation inside a new bounded attempt, then rerun impacted verification. For consequential or ambiguous conflicts, escalate. The original evidence applies to the old candidate and must be updated.”

KEY LINE: “Conflict resolution creates a new candidate state and therefore new verification obligations.”

⸻

384. DEPLOYMENT DRIFT

QUESTION: “Production isn’t running what source control says it should be running.”

TALKING SCRIPT: “The delivery layer should preserve artifact identity and deployment provenance. Meta Factory needs production observation tied to the actual deployed artifact, not merely the merged commit. Existing deployment systems should expose which artifact/version is active. If drift exists, production outcome evidence shouldn’t be attributed to the wrong candidate.”

KEY LINE: “Observe the artifact that actually ran, not the artifact we intended to run.”

⸻

385. CONFIGURATION DRIFT IN PRODUCTION

QUESTION: “Runtime configuration changes outside the factory.”

TALKING SCRIPT: “Production outcome analysis needs to account for configuration as part of deployed behavior. Where configuration materially affects correctness, it should be versioned and included in deployment provenance. External drift can invalidate assumptions and should be detected by existing configuration-management or reconciliation systems.”

KEY LINE: “Code is only one component of production behavior.”

⸻

386. DATABASE MIGRATIONS

QUESTION: “Would you let an agent generate and execute schema migrations?”

TALKING SCRIPT: “Generating a migration and executing it are two very different authorities. I’m comfortable allowing an agent to produce a candidate migration, compatibility analysis, rollback strategy, test plan, and impact assessment. Execution requires a stronger authority model because database changes can be difficult or impossible to reverse. I’d verify backward and forward compatibility, data-loss risk, lock duration, expected runtime, application-version compatibility, and rollback or roll-forward strategy. For consequential production migrations, I’d require stronger evidence and explicit authority before execution.”

KEY LINE: “Generation authority should be much easier to earn than irreversible execution authority.”

⸻

387. ZERO-DOWNTIME MIGRATIONS

QUESTION: “How would the factory handle a zero-downtime schema change?”

TALKING SCRIPT: “I’d favor an expand-and-contract strategy where possible. First introduce backward-compatible schema changes. Then deploy application code capable of operating against both versions. Migrate or backfill data incrementally. Verify production behavior. Only after consumers have moved should we remove the old schema. The governed plan should represent those stages explicitly because this isn’t one atomic code change.”

KEY LINE: “For difficult-to-reverse changes, separate compatibility from cleanup.”

⸻

388. BACKFILL JOBS

QUESTION: “An agent needs to update billions of records. How would you design that?”

TALKING SCRIPT: “I would not let an agent generate one enormous transaction and hope. Treat the backfill as a bounded, resumable workflow with partitioning, checkpoints, idempotency, rate limits, progress metrics, validation, pause/resume, and rollback or correction strategy. Production load becomes an explicit constraint. The agent can reason about strategy, but deterministic execution controls throughput and state.”

KEY LINE: “Reason about the migration intelligently; execute it predictably.”

⸻

389. PRODUCTION DATA ACCESS

QUESTION: “Should coding agents have access to production data?”

TALKING SCRIPT: “By default, no. Most implementation workflows shouldn’t need raw production data. Where production evidence is required, expose the minimum necessary data through governed tools, preferably aggregated, redacted, or read-only. Access follows task identity, data classification, purpose, and retention policy. I wouldn’t give a general-purpose coding sandbox production database credentials.”

KEY LINE: “Production insight does not require production possession.”

⸻

390. DEBUGGING PRODUCTION

QUESTION: “How does an agent investigate a production incident?”

TALKING SCRIPT: “Give it controlled access to logs, metrics, traces, deployment history, configuration, incident records, and safe diagnostic tools rather than broad shell access to production. The agent can correlate signals, form hypotheses, and recommend or execute bounded diagnostics. Remediation authority remains separately governed according to consequence.”

KEY LINE: “Separate diagnostic authority from remediation authority.”

⸻

391. AGENTIC OPERATIONS

QUESTION: “Could Meta Factory eventually operate production systems?”

TALKING SCRIPT: “Potentially, but I’d treat operations as another factory or governed workflow class with a different risk profile. Diagnosis, remediation, rollback, scaling, and configuration changes require stronger observability, state awareness, policy, verification, reversibility, and authority than many development tasks. I would increase autonomy incrementally from recommendation → bounded remediation → low-risk autonomous recovery as evidence accumulates.”

KEY LINE: “Operational autonomy should be earned workload by workload.”

⸻

392. INCIDENT-RESPONSE AGENT

QUESTION: “Would you build an incident-response agent?”

TALKING SCRIPT: “Yes, but I’d begin with evidence aggregation and diagnosis rather than autonomous production mutation. It can correlate alerts, recent deployments, traces, logs, model/tool changes, and historical incidents; propose likely failure domains; and surface safe remediation options. Once specific remediation classes have strong verification and reversibility, some can become autonomous.”

KEY LINE: “Start by automating understanding before automating consequence.”

⸻

393. ROLLBACK AGENT

QUESTION: “Could an agent automatically roll back a bad release?”

TALKING SCRIPT: “For predefined conditions and known-safe rollback paths, yes. The system needs strong correlation between the release and degradation, an explicit known-good target, and confidence that rollback won’t create greater harm. Feature flags and progressive delivery make this substantially safer. For ambiguous incidents, the agent can recommend rollback while human authority remains.”

KEY LINE: “Automate recovery when the failure signal and safe action are both well understood.”

⸻

394. MODEL-INDUCED PRODUCTION INCIDENT

QUESTION: “An agent-generated change causes a production incident. What does the factory learn?”

TALKING SCRIPT: “Trace the incident back through deployed artifact → verification evidence → implementation trajectory → plan → context → model route → Factory Version. Determine which layer should have prevented the failure. Maybe acceptance criteria were incomplete. Maybe context was stale. Maybe verification missed the defect. Maybe rollout gave the change too much blast radius. Then convert that failure into regression evidence and improve the weakest control.”

KEY LINE: “Don’t just fix the code. Fix the trust system that allowed the code through.”

⸻

395. MODEL-PROVIDER INCIDENT

QUESTION: “A provider begins returning unsafe or malformed responses.”

TALKING SCRIPT: “Quarantine the affected model/version or provider route, stop new eligible traffic, preserve representative failures, and use prequalified fallbacks where available. Deterministic schema and tool boundaries should prevent malformed output from directly becoming consequential action. Then requalify before restoring traffic.”

KEY LINE: “Provider failure should degrade intelligence, not bypass control.”

⸻

396. SECURITY INCIDENT IN META FACTORY

QUESTION: “How would you contain a security incident?”

TALKING SCRIPT: “First establish blast radius and active authority. Stop or quarantine the affected Factory Version, tool, model route, credential class, or Execution Profile. Revoke credentials. Restrict egress. Preserve evidence. Identify affected executions through provenance. Restore only through known-clean qualified components. Then convert the attack path into security tests and adversarial evaluations.”

KEY LINE: “Contain authority first; investigate completely second.”

⸻

397. AUDITABILITY AFTER AN INCIDENT

QUESTION: “What should you be able to reconstruct?”

TALKING SCRIPT: “Who initiated the objective, what intent was accepted, which Factory Version executed, what authority was delegated, what context was used, which models and tools acted, what side effects occurred, what verification ran, which evidence existed, who approved consequential decisions, what was deployed, and what happened afterward.”

KEY LINE: “If we can’t reconstruct the decision path, we don’t have sufficient operational evidence.”

⸻

398. INCIDENT BLAST-RADIUS QUERY

QUESTION: “A tool is compromised. How do you know what was affected?”

TALKING SCRIPT: “Query the capability/evidence graph: which Factory Versions included the tool, which executions invoked that exact version, which repositories and environments those executions touched, which credentials were issued, what side effects occurred, and which artifacts were produced or released. That’s why capability identity and execution provenance aren’t just compliance features—they materially reduce incident-response time.”

KEY LINE: “Good provenance turns blast-radius analysis from archaeology into a query.”

⸻

399. SECURITY VS. DEVELOPER VELOCITY

QUESTION: “Won’t all these controls slow builders down?”

TALKING SCRIPT: “They will if we implement governance as manual gates. My goal is to make the secure path the fastest path through automated identity, sandbox provisioning, credential issuance, policy evaluation, verification, and evidence generation. Builders shouldn’t manually assemble compliance artifacts the platform can generate automatically. High-risk exceptions can remain slower because consequence justifies it.”

KEY LINE: “The paved path should make governance faster than bypassing governance.”

⸻

400. SECURITY EXCEPTIONS

QUESTION: “A team says the sandbox restrictions prevent their workflow.”

TALKING SCRIPT: “First understand the legitimate capability they need. If it’s common, extend the platform safely. If it’s exceptional, create an explicit risk-reviewed Execution Profile or temporary exception with scope, owner, expiration, and evidence. I don’t want teams permanently bypassing the platform because one constraint didn’t fit.”

KEY LINE: “Exceptions should be explicit, bounded, owned, and temporary.”

⸻

401. POLICY EXCEPTION EXPIRATION

QUESTION: “How do you prevent temporary exceptions becoming permanent?”

TALKING SCRIPT: “Every exception gets owner, justification, scope, creation date, expiration, and renewal criteria. The control plane can automatically revoke expired authority. Repeated exceptions should trigger product analysis: either the policy is wrong or the platform lacks a legitimate capability.”

KEY LINE: “Exceptions are data about where platform and policy don’t match reality.”

⸻

402. COMPLIANCE EVIDENCE

QUESTION: “Could Meta Factory reduce compliance burden?”

TALKING SCRIPT: “Yes. Because the platform already knows identity, policy decisions, execution environment, tool access, verification, approvals, artifact provenance, and deployment outcome, much of the evidence required for controls can be generated automatically. That can transform compliance from manually reconstructed documentation into byproduct evidence of the engineering workflow.”

KEY LINE: “Good governance generates compliance evidence as a byproduct of execution.”

⸻

403. POLICY ENGINE

QUESTION: “Would you build a custom policy engine?”

TALKING SCRIPT: “Probably not unless Adobe has requirements existing policy technologies can’t satisfy. I’d prefer established policy mechanisms and integrate them into the control plane. The strategic value is in defining what decisions require policy enforcement and providing the correct identity/context, not inventing another policy language.”

KEY LINE: “Own the policy model where necessary; don’t rebuild commodity enforcement without reason.”

⸻

404. AUTHORIZATION PERFORMANCE

QUESTION: “Does checking policy before every action create latency?”

TALKING SCRIPT: “Potentially. We can issue bounded capability grants or cache decisions where safe, but revocation and high-risk operations still need authoritative checks. The optimization is to avoid recomputing identical decisions while preserving the security invariant. A task-scoped signed authorization can allow multiple local operations without asking a central service on every filesystem action.”

KEY LINE: “Optimize authorization without turning cached permission into permanent authority.”

⸻

405. AUTHORIZATION TOCTOU

QUESTION: “What if permission changes between check and action?”

TALKING SCRIPT: “For consequential actions, authorization should be enforced at or near the side-effect boundary, not merely during planning. Short-lived grants, resource versions, leases, or transactional policy checks reduce time-of-check/time-of-use gaps. Emergency revocation may need to invalidate existing grants.”

KEY LINE: “Authorize consequence as close as practical to consequence.”

⸻

406. REPOSITORY OWNERSHIP CHANGES

QUESTION: “What if CODEOWNERS or team ownership changes during a run?”

TALKING SCRIPT: “Ownership is part of current authority, so consequential publication or approval should evaluate current ownership rather than rely forever on the snapshot at planning time. The original owner information remains in provenance, but current policy determines whether the action may proceed.”

KEY LINE: “Historical context explains the run; current authority governs the action.”

⸻

407. HUMAN AUTHORITY CHANGES MID-RUN

QUESTION: “An approver leaves the company while the workflow is waiting.”

TALKING SCRIPT: “Approval requests reference an authority role or policy requirement, not only one person’s identity. The system can resolve another currently authorized approver. A stale approval request shouldn’t automatically remain valid after the underlying authorization changes.”

KEY LINE: “Approval should depend on current authority, not historical entitlement.”

⸻

408. APPROVAL EXPIRATION

QUESTION: “Should approvals expire?”

TALKING SCRIPT: “Yes when the artifact, environment, policy, or risk context can materially change. Approval should bind to the exact candidate and evidence state. If the code rebases, critical verification changes, or too much time passes for the workload, require renewed evidence or approval.”

KEY LINE: “Approval is evidence-bound, not timeless.”

⸻

409. WHAT INVALIDATES APPROVAL?

QUESTION: “What changes force reapproval?”

TALKING SCRIPT: “Anything material to the decision: candidate artifact change, baseline change, failed or changed verification, security-policy change, expanded deployment scope, changed authority requirements, or new material risk evidence. We don’t need to reapprove because a telemetry label changed. Invalidation should follow decision relevance.”

KEY LINE: “Invalidate authority when the evidence supporting the decision materially changes.”

⸻

410. APPROVAL UX

QUESTION: “What should a human reviewer see?”

TALKING SCRIPT: “A concise decision package: intent, change summary, affected systems, acceptance criteria, verification results, security findings, unusual trajectory behavior, cost if relevant, residual uncertainty, rollout/rollback strategy, and the exact authority being requested. Let them drill into evidence without forcing them to reconstruct the entire run.”

KEY LINE: “Present the decision, the evidence, and the residual risk—not the entire transcript.”

⸻

411. EXPLAINABILITY

QUESTION: “How explainable does an agent system need to be?”

TALKING SCRIPT: “I care more about operational explainability than reconstructing hidden reasoning. Can I explain what intent was accepted, what plan executed, which capabilities were selected, what context was used, what actions occurred, what evidence passed, and why authority allowed progression? That’s enough to debug and govern most system behavior without requiring private model reasoning.”

KEY LINE: “Explain decisions through observable state and evidence, not hidden chain-of-thought.”

⸻

412. WHY DID THE MODEL CHOOSE THIS TOOL?

QUESTION: “Don’t you need the model’s reasoning?”

TALKING SCRIPT: “Usually I need the decision context, not private reasoning. Record eligible tools, selected capability, relevant structured rationale if the workflow requires it, inputs, output, policy decision, and outcome. If tool selection repeatedly fails, evaluate it empirically. Asking the model to narrate its own internal reasoning isn’t a reliable substitute for system evidence.”

KEY LINE: “Observe behavior and consequences; don’t confuse self-explanation with proof.”

⸻

413. ARCHITECTURE EVOLUTION

QUESTION: “How do you keep this architecture from becoming obsolete?”

TALKING SCRIPT: “Every major layer should have a reason for existing tied to quality, security, reliability, economics, or organizational leverage. As models absorb capabilities, test whether external layers still create measurable value. Remove abstractions that no longer do. Preserve stable contracts around authority, evidence, state, and outcomes so underlying intelligence can evolve.”

KEY LINE: “Architecture should be allowed to disappear when its problem disappears.”

⸻

414. TECHNOLOGY SELECTION

QUESTION: “How do you choose frameworks in such a fast-moving market?”

TALKING SCRIPT: “I evaluate capability fit, operational maturity, openness, extensibility, observability, state semantics, security model, portability, economics, community/vendor trajectory, and replacement cost. I also avoid allowing one framework’s abstractions to become the enterprise architecture. Frameworks implement our contracts; they shouldn’t define our enduring conceptual model.”

KEY LINE: “Adopt frameworks; own the architecture.”

⸻

415. LANGGRAPH / TEMPORAL / CUSTOM ORCHESTRATION

QUESTION: “Which would you use?”

TALKING SCRIPT: “They solve somewhat different problems. An agent framework can help with model-centric graph execution; a durable workflow engine provides strong lifecycle, timers, retries, state, and recovery semantics. I might compose them rather than force one technology to solve both. If a simpler runtime meets the workload, use that. The requirements should decide.”

KEY LINE: “Agent orchestration and durable workflow orchestration overlap, but they aren’t automatically the same problem.”

⸻

416. SHOULD THE LLM OWN STATE?

QUESTION: “Why not just keep state in the model conversation?”

TALKING SCRIPT: “Because conversation history isn’t an authoritative durable state machine. It can be truncated, summarized incorrectly, lost, duplicated, or interpreted differently by another model. Workflow ownership, budget, approvals, completed side effects, and evidence need explicit external semantics. The model receives the state it needs to reason; it doesn’t become the database.”

KEY LINE: “Context is for reasoning. Durable state is for governance.”

⸻

417. SHOULD THE LLM OWN MEMORY?

QUESTION: “What about provider-native memory?”

TALKING SCRIPT: “It may be useful for low-risk personalization or reasoning continuity, but I wouldn’t make enterprise correctness depend on opaque provider memory. Important organizational knowledge needs provenance, authorization, versioning, retention, and portability. Provider memory can be one implementation mechanism behind a governed memory contract if it satisfies those requirements.”

KEY LINE: “Convenient memory is not automatically governed memory.”

⸻

418. SHOULD THE LLM OWN TOOL AUTHORIZATION?

QUESTION: “Models are getting better at deciding when tools are appropriate. Why not trust them?”

TALKING SCRIPT: “Tool selection and tool authorization are different decisions. The model may become excellent at choosing the right action, but whether that execution identity is allowed to perform the action is an organizational policy question. I want the model optimizing capability selection while deterministic policy enforces permission.”

KEY LINE: “Choosing an action is intelligence. Permitting an action is authority.”

⸻

419. SHOULD THE MODEL DECIDE WHEN IT IS DONE?

QUESTION: “Why not?”

TALKING SCRIPT: “The model can propose completion, but the workflow’s externally defined acceptance criteria determine whether completion is valid. If the model says ‘done’ while required tests failed or an acceptance criterion has no evidence, the runtime should continue, fail, or escalate.”

KEY LINE: “Completion is a contract, not a feeling.”

⸻

420. SHOULD THE MODEL DECIDE ITS OWN BUDGET?

QUESTION: “Could a smart model estimate whether another attempt is worth the cost?”

TALKING SCRIPT: “It can provide a recommendation, but the authoritative budget and spending policy remain external. The model doesn’t have the authority to redefine the economic constraints of the workload. The runtime can combine the model’s expected-value estimate with remaining budget, workload priority, and policy.”

KEY LINE: “Models can advise resource allocation; they shouldn’t mint resources.”

421. SHOULD THE MODEL CHOOSE ITS OWN MODEL?

QUESTION: “Could an agent decide that it needs a stronger model and reroute itself?”

TALKING SCRIPT: “It can request escalation, but I wouldn’t give the executing model unrestricted authority to choose its own provider, quality tier, or spending level. The runtime can take the request plus evidence—failed verification, task complexity, remaining budget, latency requirement—and ask the capability router for another qualified option. That preserves adaptive reasoning without letting an agent simply decide to spend ten times more money.”

KEY LINE: “The agent can request escalation. The router authorizes capability selection.”

⸻

422. WHEN SHOULD A MODEL ESCALATE?

QUESTION: “How do you know the current model isn’t good enough?”

TALKING SCRIPT: “I’d use observable signals: repeated verification failure, lack of progress, unresolved ambiguity, inability to use required tools, context-capacity limits, low-confidence classification where calibrated, or known workload qualification boundaries. Escalation should change capability meaningfully rather than repeatedly calling a more expensive model without evidence that the additional capability helps.”

KEY LINE: “Escalate because the workload demonstrates need, not because bigger sounds safer.”

⸻

423. WHEN SHOULD YOU DE-ESCALATE?

QUESTION: “Can the system move from a frontier model to a cheaper model?”

TALKING SCRIPT: “Absolutely. Planning may require strong reasoning while subsequent deterministic or localized tasks need much less. Once the plan identifies task characteristics, simpler implementation, formatting, test generation, classification, or summarization may route to less expensive capabilities—assuming they meet the quality threshold. Routing should happen at the appropriate task granularity.”

KEY LINE: “Use expensive intelligence where it changes the outcome.”

⸻

424. TASK COMPLEXITY SCORING

QUESTION: “Would you assign every task a complexity score?”

TALKING SCRIPT: “Complexity can be useful as one feature, but I wouldn’t reduce routing to a single scalar. Two tasks with similar apparent complexity may require completely different capabilities because one touches security-sensitive code and another requires a huge context window. I’d represent task characteristics and capability requirements, then use empirical performance to select among qualified options.”

KEY LINE: “Complexity is a routing signal, not the routing architecture.”

⸻

425. ROUTING FEATURE SET

QUESTION: “What information goes into routing?”

TALKING SCRIPT: “Potentially task type, language, repository class, complexity, context requirement, tool requirements, security/data classification, latency objective, historical model performance, reliability, availability, estimated cost, verification requirement, and current provider capacity. I’d begin with a small interpretable feature set and add complexity only where evaluation shows value.”

KEY LINE: “Routing sophistication should itself earn its complexity.”

⸻

426. ROUTING WITH MACHINE LEARNING

QUESTION: “Would you eventually train a model to perform routing?”

TALKING SCRIPT: “Potentially. Once we have enough labeled workload outcomes, routing becomes a prediction and optimization problem. But I’d keep hard policy and qualification constraints deterministic. A learned router can rank eligible capabilities, predict quality or cost, or estimate escalation probability. It should not learn its way around security policy.”

KEY LINE: “Learn optimization; enforce constraints.”

⸻

427. ROUTER REWARD FUNCTION

QUESTION: “What would the router optimize?”

TALKING SCRIPT: “Not one simplistic reward. I’d treat it as constrained optimization: satisfy minimum quality, security, reliability, and latency requirements, then optimize accepted-outcome economics. Depending on the workload, quality or latency may dominate cost. The reward model must also account for retries and human correction or it will learn superficially cheap behavior.”

KEY LINE: “Optimize economics only after satisfying the outcome contract.”

⸻

428. ROUTER FEEDBACK DELAY

QUESTION: “What if you don’t know whether a routing decision was good until days later?”

TALKING SCRIPT: “Different signals arrive at different horizons. Immediate verification gives fast but incomplete evidence. Human acceptance may arrive later. Production regressions may arrive much later. I’d retain the routing decision identity so delayed outcomes can update historical capability performance. Don’t force every learning decision to depend only on immediate feedback.”

KEY LINE: “Outcome evidence has different clocks; preserve attribution across them.”

⸻

429. ROUTING BY REPOSITORY

QUESTION: “Could the best model differ by repository?”

TALKING SCRIPT: “Absolutely. A model may perform exceptionally on modern TypeScript services and poorly on a large legacy C++ codebase. Repository-specific evidence can inform routing, but I’d avoid overfitting from tiny sample sizes. Start with workload/domain-level evidence and become repository-specific where enough data exists.”

KEY LINE: “Routing should specialize only as far as the evidence supports specialization.”

⸻

430. ROUTING BY LANGUAGE

QUESTION: “Would language be a routing dimension?”

TALKING SCRIPT: “Yes if evaluation demonstrates meaningful differences. Language is an obvious candidate feature because models can differ in ecosystem familiarity and tool behavior, but I’d still validate against Adobe workloads rather than assume public coding benchmarks predict internal performance.”

KEY LINE: “Benchmark on the workloads you actually own.”

⸻

431. ROUTING BY SECURITY CLASS

QUESTION: “Would sensitive code always use an internal model?”

TALKING SCRIPT: “Only if policy requires it. Security classification determines the eligible provider and execution set. If approved external providers satisfy Adobe’s data and contractual requirements, they can remain eligible. If a workload cannot cross that trust boundary, internal or approved hosted models become necessary. Architecture should express the policy rather than embed assumptions about provider categories.”

KEY LINE: “Security policy determines eligibility; architecture shouldn’t invent policy.”

⸻

432. MODEL GATEWAY FAILURE

QUESTION: “Your central model gateway is down. Does the entire factory stop?”

TALKING SCRIPT: “For model-dependent work, potentially, unless we have a qualified alternate path. The gateway itself needs high availability, but I wouldn’t encourage agents to bypass it directly because governance failed. Deterministic work can continue where appropriate; model work may queue or use an approved secondary gateway. Losing centralized governance shouldn’t trigger uncontrolled direct provider access.”

KEY LINE: “Degraded infrastructure should not create an ungoverned escape path.”

⸻

433. BYPASSING THE MODEL GATEWAY

QUESTION: “What if a team wants direct API access for experimentation?”

TALKING SCRIPT: “I’d distinguish experimentation from governed production execution. Teams may need controlled sandboxes for exploring new models quickly, but production workflows should use the governed gateway once capabilities matter to the enterprise. The platform should make adding and qualifying a new model fast enough that teams don’t need permanent bypasses.”

KEY LINE: “Allow experimentation at the edge; govern production at the boundary.”

⸻

434. NEW MODEL APPEARS TOMORROW

QUESTION: “A dramatically better model launches tomorrow. How quickly can Adobe use it?”

TALKING SCRIPT: “The architecture should make onboarding fast: add the provider/model adapter, define capability metadata and data eligibility, run representative qualification suites, compare it with current baselines, then register it for qualified workload classes. Shadowing and canarying can generate production-distribution evidence. We shouldn’t need to rewrite workflows simply because the intelligence provider changed.”

KEY LINE: “New intelligence should plug into qualification, not trigger platform reconstruction.”

⸻

435. FOUNDATION MODEL VS. SPECIALIZED AGENT

QUESTION: “What’s actually being routed—the model or the agent?”

TALKING SCRIPT: “Potentially either, which is why I prefer capability routing. An agent may package a model, tools, skills, context strategy, and harness configuration. A task may instead invoke a raw model behind a deterministic workflow. The router chooses the qualified capability appropriate to the work rather than forcing every decision into model selection.”

KEY LINE: “Models are resources. Agents are compositions. Capabilities are what the workload consumes.”

⸻

436. AGENT DEFINITION

QUESTION: “What exactly is an agent in your architecture?”

TALKING SCRIPT: “A versioned execution definition that binds some combination of model eligibility, instructions, skills, tools, context strategy, state behavior, and execution policy for a class of reasoning work. I don’t want ‘agent’ to mean an anthropomorphic employee. Architecturally it’s a qualified execution capability.”

KEY LINE: “Treat agents as versioned software capabilities, not personalities.”

⸻

437. STATEFUL VS. STATELESS AGENTS

QUESTION: “Should agents be stateful?”

TALKING SCRIPT: “The workflow is stateful; individual workers don’t necessarily need to be. Durable authoritative state lives externally so workers remain replaceable. A model invocation can receive the state and context necessary for its reasoning step. Long-lived local state may improve performance, but it shouldn’t become the only copy of information required for recovery.”

KEY LINE: “Make workflow state durable so execution capacity can remain disposable.”

⸻

438. AGENT IDENTITY

QUESTION: “Does each agent need its own identity?”

TALKING SCRIPT: “I want identity at multiple levels: capability identity tells us what agent/version is executing; execution identity tells us which bounded task instance is acting; builder identity tells us who initiated the objective. Permissions should generally attach to the execution identity rather than a broad permanent agent identity.”

KEY LINE: “Identify the capability, the execution, and the initiator separately.”

⸻

439. AGENT OWNERSHIP

QUESTION: “What metadata belongs with an agent?”

TALKING SCRIPT: “Owner, version, supported workloads, required tools, context strategy, model eligibility, requested permissions, evaluation history, operational SLOs, known limitations, deprecation state, and qualification status. If nobody owns an agent’s lifecycle, I don’t want it becoming critical production infrastructure.”

KEY LINE: “Production autonomy requires production ownership.”

⸻

440. AGENT DISCOVERY

QUESTION: “How does the platform discover the right agent?”

TALKING SCRIPT: “Through the capability registry and router, based on supported workload contract, qualification, required tools/context, security eligibility, historical performance, and economics. The model shouldn’t search arbitrary GitHub repositories for an agent implementation during production execution.”

KEY LINE: “Discovery should operate over governed capability metadata.”

⸻

441. AGENT COMPOSITION

QUESTION: “Can one agent delegate to another?”

TALKING SCRIPT: “Yes where the plan and authority model permit it, but delegation becomes explicit work with bounded scope, budget, permissions, and evidence. I don’t want unlimited recursive delegation hidden inside prompts. If a coding capability needs a specialized security capability, the orchestration layer should make that relationship observable.”

KEY LINE: “Delegation should be explicit enough to govern.”

⸻

442. AGENT COMMUNICATION

QUESTION: “Would agents communicate directly with each other?”

TALKING SCRIPT: “Only if direct communication materially helps the workflow. In many cases I prefer agents exchanging artifacts and structured state through orchestration rather than maintaining free-form agent-to-agent conversations. Structured coordination improves reproducibility, authorization, and debugging. Protocols such as A2A may help interoperability, but they don’t remove the need for governance.”

KEY LINE: “Prefer governed artifact exchange over invisible agent conversation.”

⸻

443. MCP VS. A2A

QUESTION: “What’s the difference?”

TALKING SCRIPT: “Conceptually, MCP connects models or agents to tools and context capabilities, while agent-to-agent protocols address communication or delegation between autonomous actors. They solve different interoperability problems. Neither one defines enterprise policy, qualification, authority, or outcome governance; those remain Meta Factory responsibilities.”

KEY LINE: “Protocols standardize interaction. The platform still governs trust.”

⸻

444. AGENT-TO-AGENT TRUST

QUESTION: “If one agent calls another, does the child trust the parent?”

TALKING SCRIPT: “Not automatically. The child receives a governed task identity and explicit delegated authority. The parent’s output is input data, not proof of authorization. The platform determines what the child may access and what evidence it must return. Delegation shouldn’t create transitive unlimited trust.”

KEY LINE: “Delegation passes bounded responsibility, not unlimited trust.”

⸻

445. CROSS-FACTORY AGENT REUSE

QUESTION: “Can the same coding agent serve several factories?”

TALKING SCRIPT: “Yes, and I want that reuse. The coding capability is qualified independently for supported workload classes. Different factories can compose it with different plans, context, verification, policies, and authority. That is one of the benefits of separating capabilities from factories.”

KEY LINE: “Reuse capabilities; specialize governance around outcomes.”

⸻

446. CAPABILITY VERSION COMPATIBILITY

QUESTION: “A coding agent gets upgraded. Do all factories automatically get it?”

TALKING SCRIPT: “No. Existing immutable Factory Versions remain bound to the qualified version they were tested with. The new agent version becomes a candidate dependency. Evaluate affected factory/workload combinations, create new Factory Versions, and progressively promote. Automatic ‘latest’ dependencies destroy reproducibility.”

KEY LINE: “Shared capability does not mean shared uncontrolled upgrade.”

⸻

447. SEMANTIC VERSIONING FOR AGENTS

QUESTION: “Would you use semver?”

TALKING SCRIPT: “Possibly for interface compatibility, but semantic versioning alone doesn’t capture behavioral change in probabilistic systems. Two model or prompt versions can maintain identical schemas while materially changing quality. I need evaluation identity and behavioral qualification in addition to API compatibility.”

KEY LINE: “Interface compatibility is not behavioral compatibility.”

⸻

448. BEHAVIORAL VERSIONING

QUESTION: “What does behavioral versioning mean?”

TALKING SCRIPT: “Treat changes to models, prompts, skills, context strategies, tools, or policies as potentially behavior-changing even when APIs remain stable. The candidate gets a new immutable identity and evaluation history. We can then compare behavioral distributions across versions rather than assume identical interfaces imply identical outcomes.”

KEY LINE: “In agent systems, behavior is part of the version contract.”

⸻

449. NONDETERMINISTIC QUALIFICATION

QUESTION: “If outputs vary, how can you qualify anything?”

TALKING SCRIPT: “Qualification is statistical and outcome-based where determinism isn’t possible. Run representative workloads enough times to understand success distribution, failure classes, variance, latency, cost, and policy behavior. Combine that with deterministic invariants around authority and execution. We don’t need identical outputs; we need sufficiently reliable outcome distributions for the workload’s risk.”

KEY LINE: “Qualify probabilistic behavior statistically and govern consequences deterministically.”

⸻

450. SAMPLE SIZE

QUESTION: “How many eval runs are enough?”

TALKING SCRIPT: “There’s no universal number. It depends on expected failure rate, variance, workload diversity, consequence, and the magnitude of improvement we’re trying to detect. For high-risk changes, I need stronger statistical confidence and more adversarial coverage. For low-risk internal tooling, smaller evaluation plus progressive rollout may be sufficient.”

KEY LINE: “Evaluation confidence should follow decision consequence.”

⸻

451. RANDOMNESS / TEMPERATURE

QUESTION: “Would you set temperature to zero for production agents?”

TALKING SCRIPT: “Where supported, lower randomness can reduce unnecessary variance, but I wouldn’t mistake temperature zero for deterministic behavior. Models, provider infrastructure, tool outputs, and context can still vary. Some creative or exploratory workloads may benefit from diversity. Reliability should come from bounded execution and verification, not one sampling parameter.”

KEY LINE: “Sampling settings influence variance; they don’t establish correctness.”

⸻

452. MULTIPLE CANDIDATES

QUESTION: “Would you generate several implementations and pick one?”

TALKING SCRIPT: “For difficult or high-value tasks, potentially. Candidate diversity can improve the probability of finding a strong solution, but we pay for every generation and every verification. The selection mechanism must be independently reliable. I would make candidate count a workload-specific economic decision rather than a universal pattern.”

KEY LINE: “Generate alternatives when the expected quality gain exceeds the verification cost.”

⸻

453. BEST-OF-N

QUESTION: “What are the risks of best-of-N?”

TALKING SCRIPT: “Cost, latency, evaluator bias, and reward hacking. If the evaluator has a systematic weakness, generating more candidates can increase the chance that one exploits that weakness. Best-of-N only helps when the verifier correlates strongly with the actual objective.”

KEY LINE: “More generation amplifies the strengths—and weaknesses—of the evaluator.”

⸻

454. ADVERSARIAL MODEL SELECTION

QUESTION: “Would you use a different provider for verification?”

TALKING SCRIPT: “Sometimes, especially when we have evidence that provider diversity reduces correlated failure. But different vendor names don’t guarantee independent reasoning. I’d evaluate whether the verifier actually catches different failure classes. Deterministic evidence may create much stronger independence than another foundation model.”

KEY LINE: “Independence is empirical, not branding.”

⸻

455. VERIFIER COST

QUESTION: “What if verification costs more than generation?”

TALKING SCRIPT: “That may be entirely rational for consequential workloads. As generation becomes cheap, trust may legitimately dominate cost. But I’d still optimize verification: deterministic checks first, impact-based test selection, specialized evaluators, risk-tiered depth, caching of valid evidence where appropriate, and stronger verification only where consequence requires it.”

KEY LINE: “The cheapest code is useless if establishing trust costs more than the outcome is worth.”

⸻

456. VERIFICATION BUDGET

QUESTION: “Should verification have its own budget?”

TALKING SCRIPT: “Yes. The governed plan can allocate generation and verification budgets separately because their economics and importance differ. High-risk work may intentionally spend more on verification than implementation. Budget exhaustion should not cause the system to silently skip mandatory verification; instead the workflow pauses, fails, or requests additional authority.”

KEY LINE: “Mandatory trust controls should not disappear because generation overspent.”

457. VERIFYING ACCEPTANCE CRITERIA — CONTINUED

QUESTION: “How do you translate natural-language acceptance criteria into checks?”

TALKING SCRIPT: “Some criteria map directly to deterministic assertions. Others require semantic evaluators, runtime experiments, or human judgment. During planning, I want each criterion classified with a verification strategy, required evidence, and authority semantics. If we can’t identify a credible way to verify an important acceptance criterion, that is itself a planning failure. I don’t want the system implementing work first and figuring out afterward what ‘correct’ was supposed to mean.”

KEY LINE: “If we cannot define how success will be verified, we’re not ready for autonomous execution.”

⸻

458. WHO DEFINES ACCEPTANCE CRITERIA?

QUESTION: “Does the agent generate its own acceptance criteria?”

TALKING SCRIPT: “The planner can propose and refine them, but consequential criteria should remain anchored to builder intent, product requirements, architecture constraints, policy, and existing system contracts. The same model shouldn’t be allowed to reinterpret an ambiguous objective, create convenient acceptance criteria, implement against them, and then declare itself successful. For high-risk work, humans may confirm the contract before execution.”

KEY LINE: “The system can refine the success contract; it shouldn’t silently redefine success.”

⸻

459. VERIFICATION REQUIREMENTS IN THE PLAN

QUESTION: “Why put verification in the plan instead of deciding after implementation?”

TALKING SCRIPT: “Because verification requirements influence how we implement the work. If a performance objective requires load testing, or a security-sensitive change requires adversarial verification, I want that known before execution begins. It also prevents the producer from selecting an easier verification strategy after seeing its own output.”

KEY LINE: “Define how you will prove success before producing the candidate.”

⸻

460. TESTS PASS BUT ACCEPTANCE FAILS

QUESTION: “Everything compiles and tests pass, but the result doesn’t satisfy the builder.”

TALKING SCRIPT: “Then verification proved implementation consistency, not objective success. Tests are evidence against specific claims; they’re not universal proof. The factory should trace the failure back to whether acceptance criteria were incomplete, tests were insufficient, semantic verification was missing, or intent was misunderstood. This is why outcome evaluation sits above test execution.”

KEY LINE: “Passing tests can prove the implementation satisfies the tests. They don’t automatically prove it satisfies the intent.”

⸻

461. SEMANTIC ACCEPTANCE CRITERIA

QUESTION: “How do you verify something subjective like ‘improve usability’?”

TALKING SCRIPT: “First make the criterion less vague. Define observable proxies: task completion, interaction count, accessibility, design-system compliance, user-study results, or experiment metrics. Some dimensions may still require human judgment or calibrated semantic evaluation. The important step is converting broad intent into measurable claims wherever possible while preserving explicit uncertainty where measurement remains subjective.”

KEY LINE: “Don’t automate ambiguity you haven’t first made observable.”

⸻

462. PERFORMANCE ACCEPTANCE

QUESTION: “The builder says ‘make this service faster.’ How do you turn that into executable intent?”

TALKING SCRIPT: “Clarify which path, workload, baseline, target percentile, environment, acceptable resource increase, and regression tolerance. ‘Make it faster’ isn’t an executable contract. ‘Reduce p95 latency on checkout from 420 ms to below 300 ms under workload X without increasing error rate or compute cost by more than Y’ is much closer. Then verification has an explicit benchmark.”

KEY LINE: “Optimization needs a baseline, target, workload, and regression budget.”

⸻

463. SECURITY ACCEPTANCE

QUESTION: “What does ‘make it secure’ mean?”

TALKING SCRIPT: “Again, convert intent into concrete requirements: which threat model, vulnerabilities, policies, data classifications, privilege boundaries, dependencies, and compliance requirements apply? Security acceptance may combine deterministic policy, scanners, adversarial testing, architectural review, and explicit risk acceptance. ‘Secure’ isn’t a binary property one model can simply assert.”

KEY LINE: “Security verification begins with a threat model, not a confidence score.”

⸻

464. ARCHITECTURAL ACCEPTANCE

QUESTION: “How would you verify that generated code follows the architecture?”

TALKING SCRIPT: “Use multiple mechanisms: dependency rules, module boundaries, API contracts, architecture tests, repository-specific skills, static analysis, semantic review, and ADR constraints. Some architectural rules can be encoded deterministically; others require reasoning. The repository’s architecture should be available as structured context and, where possible, executable constraints.”

KEY LINE: “The strongest architecture rules are both documented and enforceable.”

⸻

465. VERIFICATION ORDER

QUESTION: “In what order do checks run?”

TALKING SCRIPT: “Generally cheap and deterministic first, expensive and semantic later. Parse/build failures, formatting, lint, types, focused tests, security policy, broader tests, semantic review, dynamic evaluation, and human authority depending on the workflow. There’s little value spending expensive reasoning on a candidate that doesn’t compile.”

KEY LINE: “Fail cheaply before verifying expensively.”

⸻

466. PARALLEL VERIFICATION

QUESTION: “Can verification run in parallel?”

TALKING SCRIPT: “Yes where checks are independent. Static analysis, security scanning, unit tests, semantic review, and policy evaluation may execute concurrently once the candidate exists. The verification graph should express dependencies so we reduce latency without losing ordering where one verifier depends on another’s artifact.”

KEY LINE: “Verification itself is a dependency graph.”

⸻

467. EARLY TERMINATION

QUESTION: “A critical security check fails while other verification is running. Stop everything?”

TALKING SCRIPT: “Potentially. If the failure is a hard blocking condition and additional verification provides no diagnostic value, cancel unnecessary expensive work. For some workflows, we may let independent checks finish because their evidence helps remediation. This becomes an economic and diagnostic policy.”

KEY LINE: “Don’t spend verification budget proving a candidate we already know cannot ship—unless the evidence helps fix it.”

⸻

468. VERIFICATION CACHE

QUESTION: “Can verification results be reused?”

TALKING SCRIPT: “Yes when the evidence remains valid for the exact relevant inputs. A deterministic check over unchanged files and dependencies may be reusable. But the cache key needs to capture artifact identity, relevant environment, tool version, policy version, and dependencies. Security or policy evidence may expire independently. Reuse evidence only when its assumptions remain true.”

KEY LINE: “Cache proof only while the conditions of the proof remain unchanged.”

⸻

469. EVIDENCE INVALIDATION

QUESTION: “What invalidates evidence?”

TALKING SCRIPT: “Anything material to the claim: code changes, baseline changes, dependency changes, environment changes, verifier changes, policy changes, configuration changes, or freshness expiration. Different evidence types have different dependency sets. The system should model those relationships so it reruns what became invalid rather than blindly rerunning everything.”

KEY LINE: “Evidence has dependencies just like code does.”

⸻

470. VERIFYING GENERATED TESTS

QUESTION: “How do you know agent-generated tests are good?”

TALKING SCRIPT: “Evaluate whether they detect meaningful failures, cover the acceptance criteria, avoid simply encoding the current implementation, and survive mutation or negative cases where appropriate. Historical bugs and adversarial cases are especially valuable. Test quantity isn’t the metric; defect-detection value is.”

KEY LINE: “Generated tests should challenge the implementation, not merely describe it.”

⸻

471. MUTATION TESTING

QUESTION: “Would mutation testing help?”

TALKING SCRIPT: “For some critical workloads, yes. Deliberately introducing controlled defects can tell us whether generated or existing tests actually detect behavioral changes. It can be expensive, so I wouldn’t run it universally, but it’s a useful qualification mechanism for assessing verification strength.”

KEY LINE: “A test suite’s value is demonstrated by the failures it can detect.”

⸻

472. DIFFERENTIAL TESTING

QUESTION: “How would you verify a refactor that should preserve behavior?”

TALKING SCRIPT: “Run the same representative inputs against baseline and candidate and compare observable behavior, performance, side effects, and outputs. Differential testing is particularly powerful for refactors, migrations, compiler changes, or modernization where the primary acceptance criterion is behavioral equivalence.”

KEY LINE: “When behavior should not change, compare behavior rather than implementation.”

⸻

473. GOLDEN DATASETS

QUESTION: “Would you maintain golden test cases?”

TALKING SCRIPT: “Yes, but not exclusively. Golden cases give stable regression coverage, while historical production cases and refreshed workloads prevent overfitting. For agentic systems, I’d preserve both expected outcomes and relevant evaluation criteria rather than assuming one exact code output is the only correct answer.”

KEY LINE: “Golden outcomes matter more than golden token sequences.”

⸻

474. TRAJECTORY EVALUATION

QUESTION: “Why evaluate the trajectory if the final code is correct?”

TALKING SCRIPT: “Because trajectory affects cost, security, reliability, and future risk. An agent may eventually produce correct code after leaking data, making unnecessary privileged calls, burning 100x the expected budget, or repeatedly modifying unrelated files. Outcome correctness alone doesn’t establish operational acceptability.”

KEY LINE: “A good outcome reached through an unsafe trajectory is not a good factory execution.”

⸻

475. OUTCOME VS. TRAJECTORY

QUESTION: “Which matters more?”

TALKING SCRIPT: “Both, but for different reasons. Outcome evaluation asks whether the objective was achieved. Trajectory evaluation asks whether it was achieved within acceptable policy, cost, authority, and operational behavior. A factory needs both because autonomy is about how work gets done as well as what it produces.”

KEY LINE: “Outcome tells us whether it worked. Trajectory tells us whether it worked acceptably.”

⸻

476. TOOL-SELECTION EVALS

QUESTION: “How would you evaluate tool use?”

TALKING SCRIPT: “Measure whether the agent selected an appropriate capability, supplied valid arguments, avoided unnecessary calls, respected policy, handled failures correctly, and achieved the task efficiently. Historical traces can reveal repeated tool misuse. Tool selection becomes a first-class evaluation dimension rather than hidden model behavior.”

KEY LINE: “Tool-use quality is observable and therefore evaluable.”

⸻

477. CONTEXT EVALS

QUESTION: “How do you evaluate context retrieval?”

TALKING SCRIPT: “Measure relevance, sufficiency, freshness, authorization correctness, provenance quality, redundancy, token efficiency, and downstream outcome impact. Retrieval can look excellent on semantic relevance while still missing the one dependency that matters. Ultimately, I care whether better context improves accepted outcomes.”

KEY LINE: “Context quality is measured by decisions enabled, not documents retrieved.”

⸻

478. ROUTING EVALS

QUESTION: “How do you evaluate routing?”

TALKING SCRIPT: “Replay representative workloads across candidate routes and compare quality, retries, latency, security eligibility, cost, and accepted outcomes. Then evaluate the router’s decision against the best qualified capability or Pareto-efficient choices. Production experimentation validates whether offline routing predictions generalize.”

KEY LINE: “Evaluate both the capabilities and the decision that selected them.”

⸻

479. PLANNING EVALS

QUESTION: “How do you evaluate planners?”

TALKING SCRIPT: “Look at requirement coverage, dependency correctness, unnecessary decomposition, missing verification, authority requests, estimated versus actual cost, downstream re-planning, execution success, and human corrections. A plan that looks elegant but repeatedly causes downstream failure isn’t good planning.”

KEY LINE: “Plan quality is measured partly by execution quality.”

⸻

480. SANDBOX EVALS

QUESTION: “How do you test sandbox security?”

TALKING SCRIPT: “Use deterministic security testing, escape attempts, privilege-escalation tests, network-policy tests, filesystem isolation, credential-leakage scenarios, resource exhaustion, and hostile repository workloads. Sandbox qualification is closer to traditional security engineering than LLM evaluation.”

KEY LINE: “Don’t use an LLM judge to prove an isolation boundary.”

⸻

481. POLICY EVALS

QUESTION: “How do you test authorization policy?”

TALKING SCRIPT: “Create positive and negative cases covering identities, repositories, data classes, tools, environments, risk tiers, approval states, and revocation. Property-based testing can be useful for invariants such as ‘no execution without X authority can invoke Y operation.’ Policy correctness should be deterministic wherever possible.”

KEY LINE: “Policy should be testable as an invariant.”

⸻

482. HUMAN-AUTHORITY EVALS

QUESTION: “Can you evaluate human approval design?”

TALKING SCRIPT: “Yes. Measure approval latency, override rate, evidence consumption, disagreement, rubber-stamping behavior, escaped incidents after approval, and unnecessary approval volume. If humans approve 99.9% of low-risk work instantly, that gate probably isn’t creating meaningful risk reduction.”

KEY LINE: “Human gates should justify the human attention they consume.”

⸻

483. ECONOMIC EVALS

QUESTION: “How do economics become part of qualification?”

TALKING SCRIPT: “Measure model cost, sandbox compute, tool cost, verification cost, retries, duration, and human correction relative to accepted outcomes. Candidate behavior that improves quality 0.1% while multiplying cost 20x may not be the right production choice for low-risk workloads. Economics are part of engineering correctness when operating at enterprise scale.”

KEY LINE: “Production quality includes economic sustainability.”

⸻

484. LATENCY EVALS

QUESTION: “How do you evaluate latency?”

TALKING SCRIPT: “At the end-to-end workflow and component levels: queueing, context retrieval, inference, tool calls, sandbox provisioning, build/test, verification, and human wait. Optimize against the workload’s latency objective. A 30-second improvement in inference doesn’t matter if the merge queue dominates the lifecycle.”

KEY LINE: “Measure latency from builder intent to useful outcome.”

⸻

485. RELIABILITY EVALS

QUESTION: “What reliability metrics matter?”

TALKING SCRIPT: “Execution success rate, recovery success, retries, stuck-run rate, lease expiration, sandbox failure, provider failure, tool failure, state inconsistency, evidence-publication failure, and time to safe recovery. Then separate platform failure from task failure; a correctly functioning factory may legitimately reject an impossible task.”

KEY LINE: “Task failure and platform failure are different reliability dimensions.”

⸻

486. TASK SUCCESS VS. PLATFORM SUCCESS

QUESTION: “What if the agent correctly determines the requested change can’t be made?”

TALKING SCRIPT: “That may be a successful platform outcome even though no code was produced. If the system correctly identifies conflicting constraints, insufficient authority, impossible acceptance criteria, or unsafe execution and explains why, the factory behaved correctly. Success shouldn’t be defined as ‘always produce a patch.’”

KEY LINE: “A trustworthy factory must be allowed to say no.”

⸻

487. ABSTENTION

QUESTION: “Should agents be able to abstain?”

TALKING SCRIPT: “Yes. Abstention is valuable when uncertainty, missing context, insufficient capability, or risk exceeds the allowed threshold. The important thing is distinguishing useful abstention from weak capability. Track why the system abstained and whether escalation resolved the task.”

KEY LINE: “Knowing when not to act is part of autonomous competence.”

⸻

488. CONFIDENCE CALIBRATION

QUESTION: “Would you use model confidence to trigger abstention?”

TALKING SCRIPT: “Only if it is empirically calibrated for the workload. Self-reported confidence can be poorly correlated with correctness. I prefer observable indicators such as verification disagreement, missing required context, planner uncertainty, capability qualification boundaries, or historical failure patterns. Confidence can supplement those signals.”

KEY LINE: “Use calibrated uncertainty, not confident language.”

⸻

489. ESCALATION TO HUMAN

QUESTION: “When does the system ask for help?”

TALKING SCRIPT: “When consequential ambiguity remains unresolved, authority is insufficient, required capability is unavailable, verification disagrees materially, progress stalls, budget needs expansion, or policy explicitly requires human judgment. The escalation should present the decision needed and supporting evidence rather than asking the human to reconstruct the whole run.”

KEY LINE: “Escalate decisions, not confusion.”

⸻

490. ESCALATION TO ANOTHER AGENT

QUESTION: “When would you escalate to another model instead of a human?”

TALKING SCRIPT: “When the problem appears to be capability rather than authority or fundamentally ambiguous business intent. A stronger planner, specialized security model, or different implementation capability may resolve it. If the unresolved issue is an organizational decision—acceptable risk, product intent, or policy exception—more inference isn’t the answer.”

KEY LINE: “Escalate capability problems to capabilities; escalate authority problems to authorities.”

⸻

491. HUMAN RESPONSE TIME

QUESTION: “What happens to a six-hour agent run waiting for human approval?”

TALKING SCRIPT: “The workflow enters a durable waiting-for-authority state. Expensive execution resources are released, temporary credentials expire, artifacts and evidence persist, and the system can resume after approval by creating a new bounded attempt if needed. Human latency should not require keeping a sandbox alive for six hours.”

KEY LINE: “Persist the workflow, not the worker.”

⸻

492. APPROVAL AFTER ENVIRONMENT EXPIRES

QUESTION: “The human approves tomorrow. What happens?”

TALKING SCRIPT: “Reconstruct the required execution environment from the immutable Factory Version and artifacts. Before consequential action, revalidate evidence whose freshness may have expired—baseline commit, security policy, deployment state, repository ownership, or tests as required. Approval doesn’t freeze the world.”

KEY LINE: “Resume from durable evidence, then refresh what time invalidated.”

⸻

493. HUMAN EDITS DURING APPROVAL

QUESTION: “What if the reviewer modifies the agent’s patch?”

TALKING SCRIPT: “That creates a new candidate artifact. Determine which evidence remains valid and rerun affected verification. Preserve the human modification in provenance. The system shouldn’t treat a materially changed patch as verified merely because its ancestor passed.”

KEY LINE: “Change the artifact, reconsider the proof.”

494. MANUAL TAKEOVER

QUESTION: “What happens if an engineer wants to take over from the agent halfway through execution?”

TALKING SCRIPT: “I want manual takeover to be a supported governed state transition, not an emergency workaround. Pause autonomous execution at a safe boundary, revoke or suspend the agent’s write authority, preserve the current workspace, plan, artifacts, state, and evidence, and transfer control to the engineer. If the engineer modifies the candidate, those changes become part of provenance and affected verification must run again. The engineer should be able to resume autonomous execution later if appropriate, but there should never be ambiguity about whether the human or agent currently owns mutation authority.”

KEY LINE: “Human takeover should transfer authority, not create concurrent ownership.”

⸻

495. HANDING WORK BACK TO THE AGENT

QUESTION: “Can the engineer make changes and then let the agent continue?”

TALKING SCRIPT: “Yes. Human modifications create a new candidate state. Persist that state, identify which parts of the original plan remain valid, invalidate affected evidence, and create a new bounded execution attempt from the updated baseline. The agent receives the current governed state rather than assuming its previous context is still correct.”

KEY LINE: “Resume from current truth, not stale agent memory.”

⸻

496. HUMAN + AGENT PAIR PROGRAMMING

QUESTION: “How does interactive human-agent development fit with autonomous factories?”

TALKING SCRIPT: “I see interactive pair programming and autonomous delegation as different execution modes on the same underlying substrate. In interactive mode, the builder remains closely involved and latency matters heavily. In delegated mode, the factory needs stronger durable state, budgets, sandboxing, recovery, verification, and authority controls. The same capabilities—models, context, skills, tools, evaluation—can support both.”

KEY LINE: “Interactive assistance and autonomous delegation can share capabilities without sharing the same control model.”

⸻

497. TRANSITION FROM ASSISTED TO AUTONOMOUS

QUESTION: “How would Adobe move from copilots to autonomous development?”

TALKING SCRIPT: “Incrementally. Start with recommendation and candidate generation, then bounded delegated tasks, then independently verified low-risk workflows, and finally progressively higher-autonomy workload classes as evidence accumulates. I wouldn’t attempt a company-wide switch from human-led development to autonomous delivery. Each workload earns greater autonomy through measured quality, verification strength, reversibility, and operational evidence.”

KEY LINE: “Scale autonomy by workload evidence, not organizational ambition.”

⸻

498. LEGACY WORKFLOWS

QUESTION: “What happens to existing developer workflows?”

TALKING SCRIPT: “Don’t force migration simply because Meta Factory exists. Integrate into IDE, CLI, source control, Jira, CI/CD, code review, and deployment systems developers already use. Successful workflows can gradually move behind the factory as the governed path becomes more valuable. The platform should absorb complexity rather than require every team to rewrite how it works.”

KEY LINE: “Meet builders where they work; move governance underneath the workflow.”

⸻

499. BROWNFIELD VS. GREENFIELD

QUESTION: “Would you design differently for new applications versus legacy systems?”

TALKING SCRIPT: “Yes. Greenfield systems can intentionally expose clear architecture, tests, APIs, ownership, observability, and agent-friendly repository structure. Brownfield systems require more repository intelligence, characterization tests, historical context, impact analysis, conservative authority, and stronger verification. I wouldn’t assume one autonomy level applies equally to both.”

KEY LINE: “Autonomy depends partly on how legible and verifiable the system already is.”

⸻

500. AGENT-FRIENDLY SOFTWARE ARCHITECTURE

QUESTION: “Will we start designing software differently for agents?”

TALKING SCRIPT: “I think so. The same properties that help humans often help agents: clear module boundaries, explicit contracts, deterministic builds, strong tests, machine-readable schemas, documented ownership, observable runtime behavior, reproducible environments, and executable architecture rules. We may increasingly evaluate architecture partly on how safely both humans and autonomous systems can understand and modify it.”

KEY LINE: “Agentic development increases the value of legible software architecture.”

⸻

501. REPOSITORY LEGIBILITY

QUESTION: “What makes a repository easy for agents to work in?”

TALKING SCRIPT: “Clear structure, accurate build instructions, deterministic setup, strong tests, explicit dependencies, architecture documentation, ownership, repository-specific instructions, consistent conventions, and useful local tooling. If an experienced engineer can’t determine how to build or verify a repository, an agent will struggle too.”

KEY LINE: “Agent readiness starts with engineering hygiene.”

⸻

502. AGENT READINESS SCORE

QUESTION: “Would you score repositories for agent readiness?”

TALKING SCRIPT: “Potentially, as a diagnostic rather than a vanity metric. Dimensions might include build reproducibility, test quality, documentation, dependency clarity, repository instructions, security posture, context quality, deployment reversibility, and observability. That score can inform autonomy and identify investments required before a repository becomes suitable for highly autonomous workflows.”

KEY LINE: “Don’t increase autonomy faster than the repository’s verification substrate can support.”

⸻

503. AUTONOMY BY REPOSITORY

QUESTION: “Would different repositories get different autonomy levels?”

TALKING SCRIPT: “Absolutely. A mature service with deterministic builds, excellent tests, strong observability, and reversible deployments can safely support more autonomy than a poorly tested security-sensitive legacy system. Repository characteristics become part of workload risk and Execution Profile selection.”

KEY LINE: “Autonomy should reflect the system being changed, not just the agent doing the changing.”

⸻

504. AUTONOMY BY CHANGE TYPE

QUESTION: “Would all changes within one repository have the same autonomy?”

TALKING SCRIPT: “No. Documentation, test generation, dependency updates, authentication changes, schema migrations, and production configuration have very different consequence profiles. Risk classification should include change type and affected components, not just repository identity.”

KEY LINE: “Autonomy is workload-specific even inside the same codebase.”

⸻

505. CHANGE IMPACT ANALYSIS

QUESTION: “How does the factory determine blast radius before changing code?”

TALKING SCRIPT: “Combine dependency graphs, symbol references, ownership, API contracts, build graphs, test relationships, deployment topology, runtime telemetry, and historical change impact. The planner can reason over that structural evidence to estimate affected components and required verification. For high-risk changes, uncertainty in impact analysis should itself reduce autonomy.”

KEY LINE: “Impact analysis determines both execution scope and verification scope.”

⸻

506. RUNTIME DEPENDENCY GRAPH

QUESTION: “Static code dependencies don’t show everything. What about runtime behavior?”

TALKING SCRIPT: “Exactly. Where available, combine static repository intelligence with service topology, distributed traces, API usage, feature flags, deployment metadata, and runtime dependency information. Static structure tells us what can interact; runtime evidence helps tell us what actually interacts.”

KEY LINE: “Code graphs explain possibility. Runtime graphs explain reality.”

⸻

507. HISTORICAL CHANGE INTELLIGENCE

QUESTION: “Would Git history be useful context?”

TALKING SCRIPT: “Yes, selectively. Prior changes, reverts, ownership, incident-linked commits, accepted review feedback, and files that frequently change together can provide valuable context. But raw Git history is enormous and noisy. Retrieve history when it informs the current task rather than stuffing years of commits into every context window.”

KEY LINE: “History is useful when it explains current risk or intent.”

⸻

508. INCIDENT HISTORY AS CONTEXT

QUESTION: “Should an agent know about prior incidents?”

TALKING SCRIPT: “For affected components, definitely. If a similar change caused a production incident before, that information can influence planning, risk classification, verification, and rollout. Incident knowledge should have strong provenance because it may materially change autonomous authority.”

KEY LINE: “Past failures should become future verification context.”

⸻

509. CODE OWNERSHIP

QUESTION: “How does ownership metadata help?”

TALKING SCRIPT: “Ownership supports context, routing, authority, escalation, and review. The system can identify domain experts, repository-specific skills, approval requirements, and responsible teams. But ownership metadata can become stale, so consequential authority should ultimately resolve against current enterprise identity and policy.”

KEY LINE: “Ownership informs expertise; identity systems establish current authority.”

⸻

510. ORGANIZATIONAL KNOWLEDGE

QUESTION: “Would you put Jira, Slack, Confluence, and design docs into context?”

TALKING SCRIPT: “Potentially, through permission-aware retrieval. Different sources have different authority and freshness. An approved architecture decision may deserve more weight than an old Slack conversation. I’d preserve source type, owner, timestamp, permissions, and provenance so the model and verifier can distinguish authoritative requirements from informal discussion.”

KEY LINE: “Enterprise context needs an authority model, not merely a search index.”

⸻

511. KNOWLEDGE CONFLICT

QUESTION: “Confluence says one thing, the code says another. Which is correct?”

TALKING SCRIPT: “It depends on the claim. Running code may establish current implementation behavior while an approved architecture document establishes intended architecture. The context system should expose provenance and authority rather than silently merge contradictory information. Material conflict can trigger clarification or become part of the plan.”

KEY LINE: “Don’t hide conflicting truth sources from the reasoning system.”

⸻

512. STALE DOCUMENTATION

QUESTION: “How do you prevent agents from following outdated docs?”

TALKING SCRIPT: “Track freshness, ownership, references to current code versions, usage, and contradiction signals where possible. For consequential implementation decisions, corroborate documentation with current repository or runtime state. Production failures caused by stale sources should feed back into source-quality scoring.”

KEY LINE: “Retrieval relevance without source quality is insufficient.”

⸻

513. CONTEXT AUTHORITY RANKING

QUESTION: “Would you rank context by trust?”

TALKING SCRIPT: “Yes, but not with one universal number. Context metadata can represent source authority, freshness, permission, domain ownership, and relevance. The reasoning system can use that information when sources conflict. Hard enterprise policy remains external and doesn’t become just another high-scoring document.”

KEY LINE: “Context has relevance; governance has authority.”

⸻

514. ENTERPRISE RAG ARCHITECTURE

QUESTION: “How would you architect enterprise RAG?”

TALKING SCRIPT: “I’d separate connectors/ingestion, normalization, metadata and ACL propagation, indexing, structural and semantic retrieval, ranking, context assembly, provenance, freshness, and evaluation. Different sources may use different indexes. Retrieval executes under the task identity. The final context package should expose provenance and fit within the workload’s context budget.”

KEY LINE: “Enterprise RAG is primarily a governed information-access system, not a vector database.”

⸻

515. GRAPH RAG

QUESTION: “Would you use GraphRAG?”

TALKING SCRIPT: “Where relationships materially improve reasoning. Code dependencies, service topology, ownership, requirements, and architecture can benefit from graph representation. But I wouldn’t turn every document corpus into a graph because the term is fashionable. Use structural relationships where the domain actually has meaningful structure.”

KEY LINE: “Use graphs when relationships are part of the answer.”

⸻

516. HYBRID RETRIEVAL

QUESTION: “Keyword, semantic, graph—which one?”

TALKING SCRIPT: “Likely hybrid. Exact symbols and identifiers benefit from lexical search. Conceptual questions benefit from semantic retrieval. Dependency reasoning benefits from structural graphs. Metadata filters enforce repository, ownership, freshness, and permissions. The retrieval planner can compose these based on workload.”

KEY LINE: “Different questions require different retrieval semantics.”

⸻

517. CONTEXT ROUTER

QUESTION: “Would you route context retrieval too?”

TALKING SCRIPT: “Potentially. Planning may need architecture and requirements; implementation needs code and tests; security review needs threat models and policy; operations needs runtime telemetry. Context strategy should follow the reasoning task rather than one giant universal retrieval query.”

KEY LINE: “Context should be task-specific inside the same objective.”

⸻

518. CONTEXT TOKEN BUDGET

QUESTION: “How much context do you give the model?”

TALKING SCRIPT: “Enough to satisfy the task with margin, but not automatically the model’s maximum. Context competes with reasoning tokens, latency, cost, and attention. I’d allocate a context budget by task, retrieve high-value information first, and expand iteratively when the model or verification identifies a gap.”

KEY LINE: “Treat context as a scarce resource even when context windows grow.”

⸻

519. CONTEXT EXPANSION

QUESTION: “What if the first retrieval isn’t enough?”

TALKING SCRIPT: “Allow iterative retrieval. The model can identify missing information and request another bounded retrieval using the context system. Preserve which additional context changed the decision. That is often more efficient than front-loading every potentially relevant document.”

KEY LINE: “Retrieve progressively as uncertainty becomes specific.”

⸻

520. CONTEXT COLLAPSE / OVERLOAD

QUESTION: “Can too much context make models worse?”

TALKING SCRIPT: “Yes. Irrelevant or contradictory information can distract reasoning, increase latency and cost, and bury the decisive signal. That’s why I care about selection, ranking, structure, provenance, and compaction, not merely context-window size.”

KEY LINE: “A larger context window increases capacity, not automatically comprehension.”

⸻

521. CONTEXT PRIVACY

QUESTION: “How do you prevent context from crossing organizational boundaries?”

TALKING SCRIPT: “ACLs and classification propagate from source ingestion through indexes and caches. Retrieval executes under the task-specific identity, and context assembly can only combine sources the execution is authorized to access. Evidence records source provenance without necessarily exposing sensitive content to unauthorized viewers.”

KEY LINE: “Authorization must survive indexing.”

⸻

522. INDEXING PIPELINE FAILURE

QUESTION: “What if indexing falls behind?”

TALKING SCRIPT: “Expose freshness explicitly. Low-risk workflows may tolerate a known lag. High-consequence code modification should supplement stale indexes with direct workspace inspection or wait for current indexing. Alert on freshness SLOs and degrade intentionally rather than silently serving old context as current.”

KEY LINE: “Stale context should be visible state, not hidden uncertainty.”

⸻

523. SOURCE DELETION

QUESTION: “A document is deleted. How quickly does it disappear from RAG?”

TALKING SCRIPT: “Deletion and permission revocation need to propagate through indexes, caches, summaries, derived artifacts, and memory according to defined SLOs. That’s another reason provenance matters—we need to know what derived representations depend on the deleted source. Sensitive revocation may require faster invalidation than normal freshness updates.”

KEY LINE: “Govern derived knowledge through its source lineage.”

⸻

524. RIGHT TO DELETE / DATA REVOCATION

QUESTION: “What if enterprise policy requires data removal?”

TALKING SCRIPT: “Retrieval-based knowledge is substantially easier to revoke than knowledge embedded in model weights. Remove the source, invalidate indexes and caches, and identify dependent derived artifacts through provenance. If the data was used for model training, the remediation problem is harder and may require model replacement or retraining depending on requirements.”

KEY LINE: “Revocability should influence whether knowledge belongs in context or weights.”

⸻

525. RAG VS. LONG CONTEXT

QUESTION: “If models support millions of tokens, do we still need retrieval?”

TALKING SCRIPT: “Probably, because retrieval isn’t only a context-window workaround. It provides authorization, freshness, provenance, source selection, economics, and relevance. Long context may simplify some workloads and reduce retrieval complexity, and I’d gladly use it where it wins. But dumping all accessible enterprise information into every request remains undesirable even if technically possible.”

KEY LINE: “Retrieval is an information-governance problem, not merely a token-limit workaround.”

⸻

526. RAG VS. MODEL-NATIVE SEARCH

QUESTION: “What if model providers provide excellent native repository search?”

TALKING SCRIPT: “Use it if it satisfies our quality, security, authorization, provenance, freshness, and economics requirements. I don’t need Adobe to own retrieval algorithms simply for architectural purity. The durable contract is the ability to provide qualified context with provenance and policy, not which retrieval engine implements it.”

KEY LINE: “Own the context contract, not necessarily the retrieval implementation.”

⸻

527. FINE-TUNING DECISION

QUESTION: “What evidence would make you fine-tune?”

TALKING SCRIPT: “Repeated workload-specific gaps that retrieval, prompting, skills, and tool improvements don’t solve economically. I’d want a stable dataset, clear target behavior, representative evaluation, sufficient volume to justify lifecycle cost, and evidence that the improvement persists without unacceptable regressions.”

KEY LINE: “Fine-tune when repeated evidence shows system-level techniques have reached diminishing returns.”

⸻

528. CPT DECISION

QUESTION: “When does continual pretraining make sense?”

TALKING SCRIPT: “When Adobe has a large, stable, legally usable domain corpus whose concepts repeatedly matter across workloads and incorporating that knowledge into weights produces measurable quality or economic improvement. CPT carries substantially more data lineage, infrastructure, model-lifecycle, evaluation, and revocation complexity than retrieval, so the evidence bar should be higher.”

KEY LINE: “The deeper the knowledge moves into the model, the higher the justification bar.”

⸻

529. MODEL DISTILLATION

QUESTION: “Would you distill frontier-model behavior into smaller internal models?”

TALKING SCRIPT: “Potentially for high-volume stable workloads where we have enough representative data and the economics justify it. Distillation can reduce latency and cost, but the smaller model needs independent qualification and monitoring. I wouldn’t assume the teacher’s quality automatically transfers.”

KEY LINE: “Distill proven workload behavior, not generic ambition.”

530. SYNTHETIC TRAINING DATA — CONTINUED

QUESTION: “Would you use agent trajectories as training data?”

TALKING SCRIPT: “Potentially, but I wouldn’t assume successful production trajectories automatically make good training data. They can contain unnecessary reasoning paths, stale context, sensitive information, accidental correlations, or behavior specific to the model that generated them. I’d curate and sanitize trajectories, preserve provenance, identify the behavior we’re actually trying to teach, and evaluate the resulting model independently. Production evidence is valuable precisely because it tells us outcomes, but that doesn’t mean every token belongs in a training corpus.”

KEY LINE: “Production trajectories are valuable evidence; they are not automatically valuable training data.”

⸻

531. TRAINING VS. FACTORY LEARNING

QUESTION: “If you have all this production data, why not continuously train the model?”

TALKING SCRIPT: “Because changing model weights is only one way the system can improve. Often the faster and more reversible improvement is changing routing, skills, context retrieval, tools, prompts, policies, or verification. Training creates additional data governance, model lifecycle, evaluation, deployment, and rollback complexity. I’d use the cheapest and most reversible mechanism that solves the observed failure first.”

KEY LINE: “Improve the system at the cheapest effective layer.”

⸻

532. WHEN SHOULD THE FACTORY TRAIN A MODEL?

QUESTION: “What would justify training?”

TALKING SCRIPT: “I’d want evidence of a persistent, high-volume, strategically important capability gap that system-level improvements aren’t solving efficiently. Then I’d establish a representative dataset, baseline, target behavior, training-data rights and lineage, candidate model, evaluation suite, and deployment strategy. The trained model becomes another qualified capability—not a special trusted object.”

KEY LINE: “Training creates a candidate capability, not automatic production authority.”

⸻

533. MODEL TRAINING LIFECYCLE

QUESTION: “How would internally trained models enter Meta Factory?”

TALKING SCRIPT: “Through the same lifecycle as external models: identity → provenance → evaluation → security qualification → workload qualification → registry → bounded rollout → production monitoring → deprecation. Internally trained models additionally need training-data lineage, training configuration, checkpoint identity, and reproducibility metadata.”

KEY LINE: “Model ownership doesn’t eliminate model qualification.”

⸻

534. MODEL REGISTRY VS. CAPABILITY REGISTRY

QUESTION: “Would models have their own registry?”

TALKING SCRIPT: “Potentially as an implementation detail, but Meta Factory should reason primarily through the broader Capability Registry. Models are one capability type alongside agents, skills, tools, evaluators, and human authorities. A specialized model registry may manage weights, endpoints, and checkpoints underneath that abstraction.”

KEY LINE: “The factory consumes capabilities; models are one class of capability.”

⸻

535. WHY A CAPABILITY REGISTRY MATTERS

QUESTION: “Why is the registry strategically important?”

TALKING SCRIPT: “Because once Adobe has hundreds of agents, skills, models, tools, and evaluators, the problem shifts from creating capabilities to discovering, qualifying, reusing, governing, and retiring them. Without a registry, every team independently reinvents integrations and the router has no authoritative catalog of what it can safely use.”

KEY LINE: “Capability abundance creates a capability-governance problem.”

⸻

536. CAPABILITY REUSE

QUESTION: “How do you encourage reuse?”

TALKING SCRIPT: “Make capabilities discoverable, well-documented, versioned, evaluated, easy to consume, and economically visible. Give teams a paved path for publishing new capabilities and metrics showing reuse. But don’t force reuse where a domain genuinely requires specialization. Standardize contracts and governance while allowing implementations to evolve.”

KEY LINE: “Reuse should be easier than reinvention.”

⸻

537. CAPABILITY DUPLICATION

QUESTION: “What if five teams build code-review agents?”

TALKING SCRIPT: “Initially that may be healthy experimentation. I wouldn’t centralize prematurely. Once we have evidence, compare the capabilities across representative workloads. Consolidate commodity infrastructure, preserve domain-specific differentiation where it matters, and migrate teams toward the strongest shared capabilities. Meta Factory should make duplication visible rather than banning experimentation.”

KEY LINE: “Experiment broadly; consolidate from evidence.”

⸻

538. CENTRALIZATION VS. FEDERATION

QUESTION: “What should be centralized?”

TALKING SCRIPT: “Centralize the things teams should not independently reinvent: identity, model access, policy enforcement, capability contracts, secure execution, evidence, core observability, qualification infrastructure, and common lifecycle semantics. Federate domain context, repository-specific skills, acceptance criteria, specialized workflows, and domain verification. That creates consistency without making Meta Factory responsible for understanding every Adobe product.”

KEY LINE: “Centralize invariants. Federate expertise.”

⸻

539. PLATFORM GOVERNANCE

QUESTION: “How do you keep governance from slowing innovation?”

TALKING SCRIPT: “Automate governance wherever the rules are known. Self-service capability registration, automated security checks, evaluation pipelines, sandbox provisioning, policy evaluation, evidence generation, and progressive qualification should make the governed path easier than bypassing it. Human review belongs primarily where judgment is actually required.”

KEY LINE: “Governance should become infrastructure, not bureaucracy.”

⸻

540. THE PAVED PATH

QUESTION: “How do you get teams to actually use Meta Factory?”

TALKING SCRIPT: “The paved path has to be faster, safer, cheaper, and easier than building independently. Give teams model access, secure execution, enterprise context, evaluation, observability, evidence, reusable skills, and deployment integration without forcing them to build those systems themselves. Then measure onboarding friction and remove it continuously.”

KEY LINE: “The paved path has to be easier than going around the platform.”

⸻

541. WHAT IF TEAMS STILL BYPASS IT?

QUESTION: “What if teams build their own agents anyway?”

TALKING SCRIPT: “First understand why. They may need a capability Meta Factory doesn’t provide, the onboarding path may be too slow, or experimentation may genuinely require freedom. Give teams a sandbox for innovation while making production governance explicit. Successful experiments can graduate into qualified capabilities.”

KEY LINE: “Don’t confuse centralized governance with centralized innovation.”

⸻

542. EXPERIMENTATION ZONE

QUESTION: “Would you provide an ungoverned playground?”

TALKING SCRIPT: “I’d provide a lower-risk experimentation environment, but not an environment with unlimited enterprise authority. Teams can experiment with new models, prompts, agents, and tools against synthetic or approved data with constrained credentials and no production authority. Moving from experimentation to production triggers qualification.”

KEY LINE: “Make experimentation easy and production trust explicit.”

⸻

543. FROM EXPERIMENT TO PRODUCTION

QUESTION: “How does a prototype become production?”

TALKING SCRIPT: “Establish an owner, capability contract, security classification, permissions, representative evaluations, operational SLOs, versioning, observability, failure handling, and qualification. Then register the capability and progressively introduce it into eligible workloads. The prototype’s code may survive; its assumptions don’t automatically survive.”

KEY LINE: “Prototype speed and production trust are different engineering problems.”

⸻

544. TECH DEBT FROM RAPID AI EXPERIMENTATION

QUESTION: “How do you prevent thousands of AI experiments becoming permanent infrastructure?”

TALKING SCRIPT: “Require explicit ownership, lifecycle state, usage visibility, qualification status, and expiration/deprecation mechanisms. Experimental capabilities shouldn’t silently become critical dependencies. Meta Factory can identify duplicated or abandoned capabilities and help consolidate successful patterns.”

KEY LINE: “Experimentation without lifecycle management becomes platform entropy.”

⸻

545. META FACTORY AS A PRODUCT

QUESTION: “What does success look like from the builder’s perspective?”

TALKING SCRIPT: “The builder shouldn’t care that we have an elegant capability registry or sophisticated router. They should experience faster delivery, less repetitive work, reliable outcomes, clear evidence, easy recovery, and fewer infrastructure decisions. Platform sophistication is justified only if it creates builder leverage.”

KEY LINE: “The architecture is invisible when the builder experience is working.”

⸻

546. TIME TO FIRST VALUE

QUESTION: “What adoption metric would you watch first?”

TALKING SCRIPT: “Time to first accepted outcome. How long from a team deciding to use Meta Factory until it successfully completes a real workflow? If onboarding takes months, the platform’s theoretical leverage doesn’t matter. I’d track onboarding friction at repository, capability, and workflow levels.”

KEY LINE: “Reduce the distance between curiosity and useful outcome.”

⸻

547. PLATFORM LEVERAGE

QUESTION: “How do you measure platform leverage?”

TALKING SCRIPT: “Look at capability reuse, teams onboarded, time to add a workflow, duplicated infrastructure retired, accepted outcomes, cycle-time reduction, autonomous completion rate at constant quality, and engineering effort avoided. I care about whether one platform improvement benefits dozens of teams.”

KEY LINE: “Platform leverage is the multiplier on local engineering effort.”

⸻

548. AUTONOMY RATE

QUESTION: “Would you measure percentage of work completed autonomously?”

TALKING SCRIPT: “Yes, but never alone. A high autonomy percentage achieved through lower quality is meaningless. Pair it with accepted outcomes, defect escape, verification strength, human correction, incidents, and economics. The goal isn’t maximizing autonomy; it’s maximizing useful autonomous leverage inside the required trust boundary.”

KEY LINE: “Autonomy is a means, not the outcome.”

⸻

549. PRODUCTIVITY METRICS

QUESTION: “How do you prove developers are more productive?”

TALKING SCRIPT: “Avoid simplistic metrics like lines of code or prompts sent. Measure cycle time, time to accepted change, cognitive/manual work removed, review burden, throughput at stable quality, developer satisfaction, and outcome delivery. Where possible, compare representative cohorts and workflows rather than relying entirely on self-reporting.”

KEY LINE: “Measure useful outcomes and removed friction, not generated activity.”

⸻

550. QUALITY METRICS

QUESTION: “What quality metrics matter?”

TALKING SCRIPT: “Accepted outcome rate, human correction, verification failure, defect escape, rollback, incidents, security findings, review precision, and production regression. Segment by workflow because quality requirements differ dramatically between documentation and authentication infrastructure.”

KEY LINE: “Quality is workload-specific and multidimensional.”

⸻

551. ECONOMIC METRICS

QUESTION: “What economic metrics matter?”

TALKING SCRIPT: “Model cost, sandbox compute, verification cost, retries, human correction, shared infrastructure, and especially cost per accepted outcome. I’d also watch marginal economics as autonomy scales because a workflow that is economical for 100 runs may behave very differently at 100,000.”

KEY LINE: “Scale multiplies small economic mistakes.”

⸻

552. RELIABILITY METRICS

QUESTION: “What reliability metrics matter?”

TALKING SCRIPT: “Job acceptance, successful execution, recovery success, stuck-run rate, retry rate, model/tool availability, sandbox provisioning, state durability, evidence publication, queue latency, and incident rate. Separate infrastructure reliability from task success.”

KEY LINE: “A factory can be operationally healthy while correctly rejecting an impossible task.”

⸻

553. SECURITY METRICS

QUESTION: “What security metrics would you monitor?”

TALKING SCRIPT: “Unauthorized action attempts, policy denials, credential exposure, unexpected egress, sandbox violations, capability revocations, prompt-injection detections where useful, secret findings, vulnerable dependencies, security-verification failures, and time to revoke compromised capability.”

KEY LINE: “Measure whether authority boundaries are actually holding.”

⸻

554. LEARNING METRICS

QUESTION: “How do you know the factory is learning?”

TALKING SCRIPT: “Compare successive qualified versions: accepted outcome improvement, fewer retries, lower correction, better routing, improved verification precision, reduced cost, fewer incidents, and faster recovery. Learning isn’t the number of candidate changes generated; it’s measurable improvement after governed promotion.”

KEY LINE: “Learning is demonstrated by improved production behavior.”

⸻

555. PLATFORM NORTH STAR

QUESTION: “Give me one north-star metric.”

TALKING SCRIPT: “If forced to choose one, I’d use accepted outcomes, then pair it with quality and economics guardrails. Accepted outcomes force us to care about whether the builder actually received useful work rather than whether the platform generated code or consumed tokens.”

KEY LINE: “Optimize the system around accepted outcomes, not agent activity.”

⸻

556. WHAT WOULD YOU BUILD IN THE FIRST 90 DAYS?

QUESTION: “You’re hired. What do you do first?”

TALKING SCRIPT: “First, identify 3–5 high-value representative builder journeys with design partners and establish baseline quality, cycle time, cost, and pain. Second, inventory reusable capabilities and existing Adobe experimentation before building new infrastructure. Third, establish the minimum shared substrate: identity, governed model access, secure execution, capability registration, basic context, evaluation, evidence, and observability. Fourth, prove one real workflow end to end from intent through accepted outcome. Then use that evidence to decide which capabilities deserve platform investment.”

KEY LINE: “Prove one complete operating loop before scaling the architecture.”

⸻

557. WHAT WOULD YOU BUILD IN 6–12 MONTHS?

QUESTION: “What comes after the first workflows?”

TALKING SCRIPT: “Turn repeated patterns into reusable platform capabilities: stronger capability qualification, dynamic routing, repository intelligence, durable orchestration, layered verification, Factory Versions, Execution Profiles, evidence, progressive promotion, and self-service extension. Expand from design partners to broader builder cohorts while continuously measuring quality and economics.”

KEY LINE: “Scale proven abstractions, not speculative abstractions.”

⸻

558. WHAT WOULD YOU NOT BUILD IN YEAR ONE?

QUESTION: “What would you deliberately avoid?”

TALKING SCRIPT: “I wouldn’t begin by building a proprietary foundation model, universal agent framework, enormous multi-agent hierarchy, custom replacement for mature CI/CD, fine-tuned model per repository, or giant centralized knowledge system without workload evidence. I’d adopt aggressively where the ecosystem already solves the problem and preserve Adobe engineering capacity for differentiated capabilities.”

KEY LINE: “Don’t spend strategic engineering capacity rebuilding rapidly commoditizing layers.”

⸻

559. BIGGEST ARCHITECTURAL RISK

QUESTION: “What’s the biggest risk?”

TALKING SCRIPT: “Building too much architecture around today’s model limitations. Planning, context management, orchestration, and even verification will improve rapidly inside models and commercial systems. If we tightly couple Adobe to today’s agent framework abstractions, we could own enormous complexity that becomes obsolete. That’s why I want stable contracts around intent, authority, evidence, verification, state, and outcomes while allowing intelligence implementations to evolve.”

KEY LINE: “Build for a moving boundary.”

⸻

560. BIGGEST SECURITY RISK

QUESTION: “What’s the biggest security risk?”

TALKING SCRIPT: “Conflating intelligence with authority. As models become more capable, it’s tempting to give them broader credentials and access because they appear competent. But model competence doesn’t establish permission. The strongest architecture assumes reasoning can fail or be manipulated while deterministic authority boundaries remain intact.”

KEY LINE: “Capability does not imply permission.”

⸻

561. BIGGEST RELIABILITY RISK

QUESTION: “What’s the biggest reliability risk?”

TALKING SCRIPT: “Allowing probabilistic execution to own durable lifecycle state or its own recovery semantics. Workers will fail, providers will fail, models will loop, tools will timeout. The authoritative workflow must survive those failures independently.”

KEY LINE: “The system governing the agent must survive the agent.”

⸻

562. BIGGEST ECONOMIC RISK

QUESTION: “What’s the biggest economic risk?”

TALKING SCRIPT: “Optimizing individual inference cost instead of the full outcome. Cheap models can generate retries, bad patches, expensive verification, and human correction. Large context, runaway loops, speculative candidates, and excessive verification can also quietly destroy economics at scale.”

KEY LINE: “Optimize cost per accepted outcome.”

⸻

563. BIGGEST QUALITY RISK

QUESTION: “What’s the biggest quality risk?”

TALKING SCRIPT: “Scaling generation faster than verification. If agents generate ten times more implementation and human review remains the primary trust mechanism, either review becomes the bottleneck or quality deteriorates. Verification needs to scale with generation.”

KEY LINE: “Generation scales output. Verification scales trust.”

⸻

564. BIGGEST ORGANIZATIONAL RISK

QUESTION: “What’s the biggest organizational risk?”

TALKING SCRIPT: “Building a central platform that becomes a tollbooth. If every team needs Meta Factory engineers to create a skill, onboard a repository, qualify a model, or launch a workflow, the platform will constrain the transformation it’s supposed to enable. Centralize invariants while making domain extension self-service.”

KEY LINE: “Standardize the substrate, not the innovation.”

⸻

565. BIGGEST PRODUCT RISK

QUESTION: “What if builders don’t use it?”

TALKING SCRIPT: “Then architecture doesn’t matter. Start from builder pain, not platform ambition. Instrument onboarding, time to first accepted outcome, repeat usage, corrections, and satisfaction. If teams repeatedly bypass the platform, understand what capability or experience they’re getting elsewhere that Meta Factory isn’t providing.”

KEY LINE: “Adoption is earned through utility.”

⸻

566. WHAT IF YOUR ARCHITECTURE IS WRONG?

QUESTION: “What’s most likely to change?”

TALKING SCRIPT: “The exact boundaries around harnesses, orchestration, context management, routing, and verification. Models may absorb those faster than expected. Inference economics may collapse. AI verification may outperform humans broadly. I don’t want to defend architecture after the problem it solved disappears. That’s why those layers should remain replaceable.”

KEY LINE: “The architecture should get simpler as models get better.”

567. WHAT DO YOU BELIEVE IS DURABLE?

QUESTION: “If models and frameworks keep changing, what do you believe actually survives?”

TALKING SCRIPT: “I think the implementation boundary will move constantly, but several enterprise requirements remain durable: intent, authority, secure execution, durable state, verification, evidence, policy, measurable outcomes, and learning. Models may absorb planning, tool selection, context management, and orchestration. That’s fine. I want Adobe’s architecture organized around the things the enterprise still needs regardless of which model performs the reasoning.”

KEY LINE: “Don’t architect around what models can’t do today. Architect around what the enterprise must still control tomorrow.”

⸻

568. WHAT WOULD MAKE YOU CHANGE YOUR MIND?

QUESTION: “What evidence would cause you to change this architecture?”

TALKING SCRIPT: “Production evidence. If model-native orchestration reliably replaces an external orchestration layer, simplify. If one model dominates sufficiently that dynamic routing creates no economic or quality advantage, remove routing complexity. If provider-native context consistently satisfies Adobe’s authorization, provenance, quality, and economics requirements, adopt it. If automated verification reliably exceeds human review for a workload, move the human boundary. I don’t want the architecture defending my assumptions.”

KEY LINE: “I want an architecture capable of surviving when parts of my thesis are wrong.”

⸻

569. WHAT IS META FACTORY IN ONE SENTENCE?

QUESTION: “Give me the simplest definition.”

TALKING SCRIPT: “Meta Factory is the governed enterprise substrate that turns builder intent into independently verified, evidence-backed software outcomes using replaceable models, agents, tools, and execution capabilities.”

SHORTER VERSION: “Meta Factory turns builder intent into trusted software outcomes.”

⸻

570. WHAT MAKES IT A FACTORY?

QUESTION: “Why call this a factory instead of an agent platform?”

TALKING SCRIPT: “Because the unit of value isn’t an agent run. It’s a repeatable, governed outcome-production system. A factory takes intent, creates a plan, composes qualified capabilities, executes work, verifies the result, produces evidence, exercises authority, delivers the artifact, observes the outcome, and learns. Agents are machinery inside that system.”

KEY LINE: “Agents perform work. Factories produce governed outcomes.”

⸻

571. WHAT IS MISSION CONTROL?

QUESTION: “Where does your Mission Control concept fit?”

TALKING SCRIPT: “Mission Control is how I’ve personally been exploring the control-plane concepts required for governed autonomous software delivery: objective orchestration, durable execution, Factory Versions, Execution Profiles, capability routing, independent verification, evidence, human authority, recovery, observability, and governed promotion. I wouldn’t claim my implementation is Adobe’s answer. I use it as concrete engineering evidence behind the architectural principles I’m describing.”

KEY LINE: “Mission Control is evidence that I’ve been implementing these ideas, not a product I’m proposing Adobe adopt.”

⸻

572. WORKBENCH VS. META FACTORY

QUESTION: “How does your Workday experience map to this?”

TALKING SCRIPT: “At Workday, Workbench gave us governed agent execution: harnesses, tools, authentication, evaluation, observability, and human controls. Hopper provided enterprise context and grounding. Agent Factory helped teams create and adopt reusable agent capabilities. What I think Meta Factory adds conceptually is the broader software-delivery lifecycle: intent, governed planning, capability composition, autonomous execution, independent verification, evidence, release authority, production outcomes, and learning.”

KEY LINE: “Workbench executes agents. Meta Factory governs autonomous software delivery.”

⸻

573. WHY ADOBE NEEDS META FACTORY

QUESTION: “Why can’t individual teams simply adopt their preferred AI tools?”

TALKING SCRIPT: “They should retain freedom where it creates innovation, but at enterprise scale Adobe doesn’t want every team independently rebuilding identity integration, model access, secure sandboxes, context, tool governance, evaluation, observability, evidence, and release controls. The shared platform centralizes those invariants while allowing teams to specialize agents, skills, workflows, context, and verification.”

KEY LINE: “Meta Factory turns fragmented experimentation into organizational capability.”

⸻

574. WHY NOW?

QUESTION: “Why is this architecture necessary now?”

TALKING SCRIPT: “Because the constraint is changing. When AI primarily suggested code to a human, the human remained the control plane. As systems become capable of planning, executing tools, modifying repositories, running tests, and operating asynchronously, we are delegating substantially more discretion. That increases the importance of explicit state, authority, verification, evidence, and recovery.”

KEY LINE: “The more discretion we delegate to intelligence, the more explicit the control architecture needs to become.”

⸻

575. YOUR FINAL SYSTEM-DESIGN ANSWER

If Jeffrey or Vikram says:

“Okay, summarize your architecture.”

Give them this:

TALKING SCRIPT: “I start with builder intent, constraints, and acceptance criteria. A planner converts that into a durable governed plan with dependencies, budgets, verification requirements, and authority boundaries. An objective router determines the appropriate factory or factories. Within each factory, capability routing selects qualified models, agents, skills, and deterministic tools based on workload requirements and empirical performance. Durable orchestration owns state, leases, retries, checkpoints, recovery, and cancellation. Context intelligence provides permission-aware, provenance-backed repository and enterprise knowledge. Agents execute inside ephemeral sandboxes with bounded repository, filesystem, tool, credential, network, compute, time, and economic authority. A separate verification plane combines deterministic tests, security, policy, semantic evaluation, and independent review. Those systems produce an evidence bundle mapped to the original acceptance criteria. Human or policy authority determines whether consequential actions may proceed. Existing CI/CD delivers accepted artifacts, production outcomes feed evaluation and learning, and candidate improvements go through qualification before promotion. Across everything sits the control plane governing identity, policy, state, budgets, observability, audit, and lifecycle. The core architectural principle is the separation of reasoning, execution, verification, authority, and learning.”

FINAL LINE: “Models reason. Agents act. Verification establishes evidence. The control plane governs authority.”

⸻
