---
title: "Enterprise Multi-Pactory Sortware Delvery Architecture"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p8414
captured_at: 2026-09-07T06:16:14.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: edf45b65d33d24b844444ffac98421961c6d7adecfbacdc8bd6125af3e075d30
---

￼

￼

￼

￼


1. Users & Channels — Where Enterprise Intent Enters the System
Purpose: Support many interaction surfaces without coupling the factory architecture to any one UX.
Talking points: Builders may enter through IDEs, CLI, web, mobile, APIs, chat, tickets, scheduled jobs, webhooks, CI/CD, or other systems. All channels normalize into the same governed Objective contract. The channel is not the source of authority; identity and policy are. One builder can initiate many durable sessions, and sessions can continue after the originating channel disconnects.
Talking script: “I start by separating the user experience from the execution architecture. A developer might initiate work from an IDE, a business user from a web experience, a service from an API, or CI from a webhook. I don’t want separate orchestration logic for each channel. Every interaction is normalized into the same authenticated Objective contract. The originating channel may disappear five seconds later; the work can continue because Mission Control owns durable state independently of the user connection.”
Technical depth: Normalize inbound requests into common IDs and metadata: principal, organization, objective, target resources, requested outcome, authority context, correlation ID, environment, repository context, and policy scope.
Key distinction: Channel ≠ session ≠ objective.
Most important line: “The user initiates the work; the channel does not own the work.”
Transition: “Before that request can touch expensive intelligence, it passes through deterministic enterprise edge controls.”

⸻

2. Edge & API Layer — Protect the Control Plane Before AI Runs
Purpose: Provide scalable, resilient, versioned ingress into the architecture.
Talking points: CDN, WAF, DDoS protection, API Gateway, request validation, quotas, rate limits, tenant isolation, versioning, streaming, correlation IDs, caching where appropriate, and admission control all belong here. Cheap deterministic controls should protect expensive downstream model and sandbox capacity.
Talking script: “Agents never sit directly on the public edge. Every request first goes through conventional distributed-systems controls: WAF, API Gateway, authentication handoff, schema validation, rate limiting, quotas, tenant boundaries, API versioning, and correlation. This is also where I introduce admission control, because 30,000 employees should not translate directly into 30,000 unbounded expensive agent executions.”
Technical depth: Track lineage beyond HTTP:
Request ID → Objective ID → Plan ID → WorkOrder ID → Task ID → Attempt ID → Candidate ID → Verification ID → Release ID
Use queue depth, model quota, sandbox capacity, budget, and SLA to apply backpressure.
Key distinction: Edge routing gets requests into the system; Factory Routing decides who performs the work.
Most important line: “Expensive intelligence sits behind cheap deterministic protection.”
Transition: “Once the request enters, the next question is not what model to use—it is who is acting and what they are actually permitted to do.”

⸻

3. Identity & Access Control — Every Autonomous Action Needs a Principal
Purpose: Establish attributable identity and least-privilege authorization across builders, agents, services, tools, and environments.
Talking points: Use SSO/OIDC/SAML, SCIM, MFA, RBAC/ABAC, tenant isolation, service accounts, resource-level authorization, secret management, short-lived credentials, and audit identity. Authority should become narrower as it is delegated from builder to Objective to WorkOrder to Task to tool.
Talking script: “Authentication at the front door isn’t enough. Identity has to propagate through the entire execution graph. Every Objective, WorkOrder, Task, Attempt, tool call, and deployment should be attributable to a human or machine principal. A Research Agent should get read-only search capability. A coding harness may get write access only to an isolated worktree. Neither inherits production credentials simply because the builder happens to possess them.”
Technical flow:
Human / Service Principal → Objective Authority → WorkOrder Delegation → Task Capability Grant → Short-Lived Tool Credential
Key principle: Delegation may preserve or reduce authority. It should never silently expand authority.
Key distinction: Authentication proves identity; authorization determines permissible action.
Most important line: “Every autonomous action has an identity, scope, and authority envelope.”
Transition: “Identity tells us who is asking. Mission Control determines what work should actually happen.”

⸻

4. Mission Control — Durable Orchestration and the Objective Control Plane
Purpose: Turn builder intent into durable, governed work across multiple factories.
Talking points: Mission Control owns intent classification, objective planning, the durable Plan, WorkOrder DAG, routing, state, budgets, evidence, approvals, retries, recovery, event handling, and cross-factory dependencies. It must remain independent of individual model or agent lifetimes.
Talking script: “Mission Control is the architectural center. A normal AI application orchestrator asks, ‘What does this request need?’ Mission Control asks a much larger question: ‘What objective is being requested, how should it be decomposed, which WorkOrders are required, what dependencies exist, which qualified factories may execute them, what evidence is required, and where does human authority apply?’ Most importantly, Mission Control owns durable state. An agent can crash, the user can disconnect, a model can change, and the work still continues.”
Durable hierarchy:
Objective → Plan → WorkOrders → Tasks → Attempts → Candidates → Evidence → Authority → Release
Mission Control should be event-driven:
Webhook / timer / user action / CI result → event → state transition → dependency evaluation → next runnable work
Key distinction: Mission Control orchestrates the objective; Factory Supervisors orchestrate execution inside individual factories.
Most important line: “The durable thing is the work—not the agent process.”
Transition: “But Mission Control is not allowed to invent its own rules. Its decisions operate inside an enterprise policy envelope.”

⸻

5. Policy & Governance — Define What the System Is Allowed to Do
Purpose: Establish centrally managed boundaries for every factory, agent, model, tool, environment, and data source.
Talking points: This layer contains Policy Decision Points and feeds Policy Enforcement Points throughout the architecture. Control model access, MCP servers, plugins, autonomy ceilings, data access, network policy, command allow/deny/block lists, region, retention, tool permissions, risk-based approvals, and compliance rules.
Talking script: “Governance can’t be a PDF sitting beside the architecture. It has to participate in runtime decisions. I separate Policy Decision Points from Policy Enforcement Points. Policy may decide that this WorkOrder can use only EU-hosted models, cannot access the public internet, requires a high-assurance sandbox, and needs human approval before deployment. Those decisions are then enforced at the router, model gateway, tool gateway, sandbox, credential broker, and deployment system.”
Policy evaluation may consider: principal, organization, repo, classification, environment, risk, Factory Version, model route, tool, requested action, region, and autonomy level.
Key distinction: Policy defines the allowable solution space; routing optimizes inside it.
Most important line: “Intelligence recommends. Policy constrains. Infrastructure enforces.”
Transition: “Once policy defines what information may be accessed, the context system determines what information should actually be provided.”

⸻

6. Data & Knowledge Layer — Governed Context, Durable Data, and Retrieval
Purpose: Provide trusted enterprise information, operational state, artifacts, and retrieval services without collapsing them all into ‘memory.’
Talking points: Separate structured databases, object storage, code repositories, enterprise documents, vector indexes, lexical search, knowledge graphs, caches, ingestion pipelines, ACL filtering, metadata, provenance, reranking, and context assembly.
Talking script: “I don’t treat enterprise knowledge as one giant vector database. Engineering work needs multiple retrieval modes. Symbol names, APIs, file paths, CVEs, and error codes frequently benefit from lexical retrieval. Architectural relationships benefit from graphs. Semantic knowledge benefits from vector retrieval. The Context Intelligence layer combines these sources, applies authorization before retrieval, reranks results, compacts them to a budget, and preserves provenance.”
Critical separation:
State = authoritative execution facts. Knowledge = governed enterprise information. Context = information assembled for this inference. Memory = information intentionally retained across time.
Key distinction: RAG is one retrieval capability inside a broader Context Intelligence system.
Most important line: “A large context window is capacity; context engineering determines what belongs inside it.”
Transition: “The system now needs a governed inventory of the reusable resources capable of performing work.”

⸻

7. Agent & Capability Registry — The Governed Inventory of Execution Resources
Purpose: Make agents, skills, tools, models, harnesses, factories, profiles, and integrations discoverable, qualified, versioned, and routable.
Talking points: Separate Factory Registry, Agent Registry, and Capability Registry. Every reusable resource should have identity, version, owner, permissions, compatibility, evaluation history, cost, latency, quality, security classification, and lifecycle state.
Talking script: “At enterprise scale I don’t want agents or skills referenced by random names in prompts. They become governed software assets. A Research Agent might be version 3.2. A Java modernization skill might be 6.1. The Fab coding harness might be 4.8. Each carries ownership, compatibility, qualification history, allowed tools, supported models, performance evidence, and policy constraints.”
Registry hierarchy:
Factory Registry: Definitions, Versions, Execution Profiles. Agent Registry: Supervisor, Research, Data, Security, Coding, Test, Governance agents. Capability Registry: Skills, tools, MCP servers, harnesses, context providers, evaluators, execution backends.
Key distinction: An agent definition is not a running agent. Runtime instantiates bounded execution Attempts from qualified definitions.
Most important line: “Agents and skills are software assets—not anonymous prompt fragments.”
Transition: “Once Mission Control chooses a factory, this registry supplies the qualified building blocks used inside that factory.”

⸻

8. Agent Orchestration & Execution Layer — Multi-Agent Execution Inside a Factory
Purpose: Coordinate specialized reasoning and deterministic execution for one bounded WorkOrder.
Talking points: The Factory Supervisor reads the Plan and WorkOrder, decomposes Tasks, delegates specialists, manages dependencies, context, budget, retries, and stopping conditions. Research, RAG, Data, Security, Coding, Test, and Governance capabilities may collaborate. Not every capability should be an agent.
Talking script: “This is where multi-agent orchestration belongs—but inside a governed boundary. Mission Control has already selected an immutable Factory Version and Execution Profile. The Factory Supervisor receives a bounded WorkOrder and decomposes it into Tasks. It may use a Research Agent for CVE analysis, Context Intelligence for trusted knowledge, a Security Agent plus SAST tools, a coding harness for implementation, and deterministic test infrastructure for validation. The Supervisor coordinates them, but it cannot arbitrarily expand its toolset, bypass policy, or choose unqualified resources.”
Three routing levels
Level 1 — Objective Routing: What factory capabilities are required? Level 2 — WorkOrder Routing: Which qualified Factory Version executes this WorkOrder? Level 3 — Capability Routing: Which agent, skill, harness, model, tool, and context strategy execute this Task?
Key distinction: The factory is not a swarm. It is a qualified composition of intelligence and control.
Most important line: “Mission Control orchestrates factories; the Supervisor orchestrates agents.”
Transition: “Agents themselves don’t directly touch arbitrary enterprise systems. Their actions go through a governed integration layer.”

⸻

9. Tooling & Integration Layer — Governed Access to the Real World
Purpose: Safely expose enterprise actions through APIs, MCP, functions, databases, CI/CD, source control, SaaS applications, and infrastructure.
Talking points: Add an MCP/Tool Gateway, credential broker, schema validation, rate limits, authorization, versioned contracts, audit, retries, and idempotency. Agents should receive capabilities rather than static secrets.
Talking script: “I don’t let every agent independently configure MCP servers or carry standing credentials. Tool execution goes through a governed gateway. The agent requests a capability, policy is evaluated, a short-lived scoped credential is issued if permitted, the request is validated, rate limited, executed, and audited. This creates one enforcement boundary between model reasoning and consequential enterprise actions.”
Flow:
Agent → Capability Router → Tool/MCP Gateway → Policy → Credential Broker → API/System → Result → Audit
Examples include GitHub, GitLab, Jira, ServiceNow, SAP, Salesforce, cloud APIs, databases, build systems, scanners, and deployment services.
Key distinction: The model requests an action; the gateway decides whether and how that action can occur.
Most important line: “Give agents capabilities, not permanent credentials.”
Transition: “When code or commands need to execute, they should run inside an environment built for containment and recovery.”

⸻

10. Execution Environment Layer — Ephemeral, Isolated, Recoverable Sandboxes
Purpose: Contain agent execution and make compute disposable while preserving durable work state.
Talking points: Sandboxes may be containers, VMs, dev environments, serverless workers, or isolated Kubernetes workloads. They should be ephemeral, least-privileged, network-restricted, credential-scoped, reproducible, checkpointable, and replaceable.
Talking script: “The session may live for days, but the sandbox should usually live for minutes or hours. That’s an important distinction. Mission Control owns durable state. Execution environments are disposable resources acquired on demand for Tasks. If a sandbox crashes, I recreate it from a known runtime artifact and restore the necessary repository and checkpoint state rather than treating the container as the system of record.”
Sandbox contract can define: runtime image, CPU/memory, repository mounts, filesystem permissions, outbound domains, credentials, toolchain, timeout, token/compute budget, and region.
One Objective Session may use multiple sandboxes simultaneously.
Key distinction: Session = continuity of work. Sandbox = disposable execution environment.
Most important line: “The durable thing is the objective; compute is replaceable.”
Transition: “Once execution begins at this scale, we need much more than logs—we need full objective-level observability, evaluation, and audit.”

⸻

11. Observability, Evaluation & Audit — Explain What Happened and Why
Purpose: Make every autonomous action observable, measurable, evaluable, attributable, and reconstructable.
Talking points: Instrument traces, logs, metrics, model calls, context retrievals, tool calls, costs, state transitions, evaluations, approvals, artifacts, and policy decisions. Distinguish observability, evaluation, verification, and audit.
Talking script: “An agent trace is not enough. I need an objective trace. I want to follow one business objective through its Plan, WorkOrders, Tasks, Attempts, model calls, retrievals, tool calls, Candidates, verifier decisions, approvals, release, and production outcome.”
Trace hierarchy:
Objective → WorkOrder → Task → Attempt → Model/Context/Tool spans
Observe quality, latency, retries, token usage, cost, tool failures, context utilization, verification pass rate, human intervention, and rollback.
Evaluation asks: “How capable is this reusable component or Factory Version?” Verification asks: “Did this particular execution satisfy its contract?” Audit asks: “Who did what, when, under whose authority?”
Key distinction: Telemetry explains execution; evaluation measures capability; verification judges work; audit establishes accountability.
Most important line: “I need an objective trace, not merely an agent trace.”
Transition: “Observability shows what happened. Durable state and memory determine what the system carries forward.”

⸻

12. Memory & State Management — Continuity Without Unlimited Memory
Purpose: Preserve durable work state and intentionally scoped memory across agents, models, sessions, and time.
Talking points: Separate working memory, session memory, project memory, organizational knowledge, and outcome memory. Durable transactional state belongs outside models. Checkpoint state machines and artifact references. Apply retention, ACLs, provenance, TTLs, invalidation, and privacy controls.
Talking script: “I strongly separate state from memory. State contains authoritative facts such as WorkOrder status, selected Factory Version, authoritative Attempt, budget remaining, and approval state. Memory contains information we intentionally retain for future reasoning. Those have different lifecycle and security semantics. A model’s context window is neither.”
Memory tiers
Working memory: current Task. Session memory: current Objective. Project memory: repository/team knowledge. Organizational knowledge: long-lived governed corpus. Outcome memory: historical execution and evaluation evidence.
State machines
Objective Session: CREATED → ACTIVE → SUSPENDED → RESUMED → VERIFYING → COMPLETED
Tasks have their own states, as do Attempts.
Key distinction: State must be correct; memory only needs to be useful.
Most important line: “Never use an LLM conversation as your authoritative database.”
Transition: “Durable work eventually reaches consequential boundaries where autonomy alone should not decide what happens next.”

⸻

13. Human Authority & Approvals — Preserve Consequential Decision Rights
Purpose: Introduce explicit human or policy authority before sensitive transitions.
Talking points: Do not model this merely as a “Human Approval Agent.” Use a durable Authority/Approval Service. Approval should bind to exact Plan revision, artifact digest, scope, action, approver, expiration, and rationale. Support single approval, dual control, risk-based gates, exception handling, and revocation.
Talking script: “Humans shouldn’t babysit every agent action. That destroys the value of autonomy. I place humans at consequential authority boundaries: approving a high-risk Plan, accepting an exception, publishing an artifact, expanding rollout, or authorizing production deployment. Verification can establish that something appears correct, but verification does not grant permission.”
Authority states:
Candidate → Verified → Authorized → Published → Released
Each transition may have different authority requirements.
Key distinction: Verification establishes confidence; authority grants permission.
Most important line: “Human-in-the-loop should mean human authority at meaningful boundaries—not humans supervising every token.”
Transition: “Once authorization is granted, deployment itself should still be a controlled engineering system rather than an arbitrary agent action.”

⸻

14. Release & Deployment — Turn Verified Artifacts Into Controlled Production Change
Purpose: Safely promote verified artifacts through environments and rollout rings while maintaining rollback and provenance.
Talking points: Release is separate from build and separate from authority. Support signed artifacts, manifests, immutable versions, environment promotion, canaries, blue-green, phased rollout, rollback, deployment health gates, and production validation.
Talking script: “I keep release deterministic wherever possible. The Delivery Factory can reason about how to prepare or remediate a release, but actual production transitions should run through established deployment mechanisms. Verified artifacts are signed, tied to exact provenance, promoted through environments, and rolled out through canary or phased rings. Production telemetry determines whether we continue, pause, or roll back.”
Flow:
Verified Artifact → Authority → Publish → Dev/Test/Staging → Canary → Pilot → Enterprise → Production Validation
Important release metadata should include Factory Version, source commit, artifact digest, evidence bundle, approval identity, environment, deployment ID, and rollback target.
Key distinction: The factory may prepare deployment; the release system governs production transition.
Most important line: “Production deployment is a state transition—not a tool call.”
Transition: “After release, the architecture still isn’t complete. We need evidence about whether the change actually produced the intended outcome.”

⸻

15. Learning & Continuous Improvement — Improve Through Evidence, Not Self-Mutation
Purpose: Convert execution and production outcomes into safer, better future Factory Versions, routes, skills, agents, prompts, and context strategies.
Talking points: Learning should operate through controlled candidate generation and qualification. Compare versions, detect regressions, improve routing, update skills, evaluate prompt/context changes, and use A/B or canary data. Never allow production agents to silently rewrite the production system.
Talking script: “I want the factory to learn, but not to self-modify uncontrollably. Production outcomes generate evidence. That evidence may suggest a better prompt, skill, model route, context policy, agent definition, or Execution Profile. The change becomes a candidate, runs through evaluation and qualification, receives a new immutable version, and is promoted through controlled rings.”
Learning lifecycle:
Outcome → Attribution → Hypothesis → Candidate Change → Evaluation → Qualification → New Version → Canary → Promotion
Routing becomes increasingly empirical:
“For this workload class, Factory Version 4.8/Profile 3.2 historically has higher verified success at lower cost than 4.7.”
Key distinction: Learning proposes changes; qualification determines what production may use.
Most important line: “Continuous learning does not require continuous uncontrolled mutation.”
Transition: “Ultimately, none of this architecture matters unless the enterprise can demonstrate measurable outcomes.”

⸻

16. Outcomes & Business Value — Optimize for Verified Outcomes
Purpose: Measure whether the entire system delivers meaningful engineering and business results.
Talking points: Measure quality, velocity, reliability, cost, security, productivity, adoption, user satisfaction, rollback, human intervention, and business KPIs. Attribute results back to exact Factory Versions, Execution Profiles, capabilities, routing decisions, and Attempts.
Talking script: “The final unit of success isn’t an LLM response, an agent completion, or even a merged pull request. It’s a verified outcome. Did quality improve? Did we reduce cycle time? Did reliability hold? Did we reduce cost? Did we avoid security regressions? Did builders actually adopt the system? Because we preserve lineage, I can attribute those outcomes back to the exact Factory Version, Execution Profile, skills, model routes, context strategy, and verifier behavior that produced them.”
Useful enterprise metrics
Quality: escaped defects, verification pass rate, regression rate. Velocity: objective cycle time, remediation time, release frequency. Reliability: retries, failure rate, rollback rate, recovery time. Economics: cost per verified outcome, inference spend, compute, human intervention. Security: vulnerabilities introduced/remediated, policy violations. Adoption: active builders, successful objectives, repeat usage. Autonomy: human intervention rate, override rate, approval rate. Business: productivity, customer impact, operational savings, risk reduction.
Do not optimize for cost per token in isolation.
Optimize for:
Cost per verified successful outcome.
Key distinction: Activity metrics tell you how much AI ran. Outcome metrics tell you whether the factory was valuable.
Most important line: “The objective—not the agent run—is the unit of value.”

⸻

Master 3-Minute Talking Script — All 16 Sections
“I think of this as a governed distributed system for autonomous work rather than an agent application. Builders enter through multiple channels, but every request is normalized through a secure API and identity boundary. Identity and policy determine who is acting, what data they may access, which capabilities are available, and how much autonomy is permitted.
Mission Control then becomes the durable control plane. It understands intent, produces a governed Plan, materializes WorkOrders and dependencies, manages durable Objective Sessions, handles events, budgets, approvals and recovery, and routes each WorkOrder only to qualified Factory Versions.
Those factories are assembled from governed assets in the Agent and Capability Registry. Inside a factory, a Supervisor coordinates specialized Research, Data, Security, Coding, Test, and Governance capabilities. Task-level routing selects the appropriate agents, harnesses, models, tools and context strategies. Agents do not directly receive unrestricted enterprise access; MCP and tool gateways enforce authorization, issue scoped credentials, validate requests, rate-limit execution and maintain audit trails.
Code and commands run in ephemeral isolated sandboxes. The durable session survives those sandboxes, models and agents. State, memory, knowledge and context are deliberately separated. Everything is observable at the Objective, WorkOrder, Task and Attempt levels.
Producer execution creates Candidates—not truth. Independent verification produces evidence. Humans or policy authorities govern consequential transitions. Verified artifacts move through controlled release and deployment rings, production outcomes are measured, and those outcomes feed a learning system.
But learning does not mutate production directly. It creates new candidate agents, skills, routes, profiles or Factory Versions that must be evaluated, qualified and promoted.
So the architecture ultimately becomes: Identity → Policy → Intent → Durable Plan → WorkOrders → Qualified Factories → Specialized Agents → Governed Tools → Isolated Execution → Verification → Evidence → Authority → Release → Outcomes → Learning.
And that’s the key distinction for me: agents provide intelligence; the architecture provides trust.”
The five lines I would make sure you remember
“The durable thing is the work—not the agent.”
“Mission Control orchestrates factories; supervisors orchestrate agents.”
“Policy defines the allowable solution space; routing optimizes inside it.”
“Verification establishes confidence; authority grants permission.”
“The objective—not the agent run—is the unit of value.”
