---
title: "Enterprise Multi-Factory Software Architecture"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p8436
captured_at: 2026-09-07T06:28:07.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: ab7f64137ae9beab3673439a3ac55c1c5b5cc2cfc69ebddb7027055563e9e805
---

￼


1. Enterprise Experience & Integration Layer
Purpose: Provide multiple enterprise entry points while presenting one normalized control-plane contract underneath.
Talking points: Web portal, IDE plugins, CLI/SDK, mobile, Teams/Slack, Jira/ServiceNow, GitHub/GitLab, CI/CD, APIs, webhooks, schedules, and other enterprise systems all enter through the same architecture. The channel does not dictate execution logic. Every request is normalized into a common request model containing goal, context, target resources, identity, authorization context, and trace correlation.
Talking script: “I start by decoupling the user experience from the factory architecture. A developer may enter through VS Code or CLI, a business user through a portal, an automated pipeline through an API, or Jira and GitHub through events. I don’t want separate factory logic for each channel. All of those entry points converge on a unified request contract that captures intent, context, identity, authorization, and correlation metadata. That keeps the factory architecture stable even as user experiences evolve.”
Technical emphasis: Common request schema, correlation IDs, tenant/org context, resource references, intent payload, event metadata, API contracts.
Key distinction: Experience surface ≠ execution architecture.
Most important line: “Many channels, one governed request model.”

⸻

2. Edge & API Management Layer
Purpose: Protect, normalize, and scale ingress before requests reach expensive AI or orchestration resources.
Talking points: CDN/global acceleration, WAF/DDoS, API Gateway, REST/GraphQL/gRPC, quotas, schema validation, authentication handoff, traffic management, API versioning, webhooks, streaming, and admission control.
Talking script: “Before any intelligence runs, I want conventional distributed-system controls protecting the platform. Requests are rate-limited, schema-validated, versioned, traced, and subjected to admission control. Admission control is important at enterprise scale because downstream capacity—models, sandboxes, tool APIs, GPUs, and provider quotas—is finite. I don’t want burst traffic from 30,000 builders turning directly into unbounded autonomous execution.”
Technical emphasis: Backpressure, queue-aware admission, tenant quotas, global throttles, retries, idempotency keys, API version compatibility.
Key distinction: API routing gets requests into the platform; Factory Routing decides which factory executes work.
Most important line: “Cheap deterministic controls protect expensive intelligence.”

⸻

3. Identity, Security & Policy Layer
Purpose: Establish zero-trust identity, authorization, secrets, policy decisions, network boundaries, data controls, and auditability across every execution.
Talking points: SSO/SAML/OIDC, SCIM, RBAC/ABAC/PBAC, service accounts, API keys, PDP, credential broker, secret management, PII/DLP, network policy, tenant isolation, and compliance audit.
Talking script: “Identity has to propagate beyond login. Every Objective, WorkOrder, Task, Attempt, model call, tool invocation, and deployment should be attributable to a human or machine principal. I then evaluate policy using identity plus context—repository, environment, risk tier, data classification, Factory Version, model route, requested tool, and region. The policy engine may allow, deny, require approval, or allow with constraints. Enforcement happens outside the model.”
Technical emphasis: Policy Decision Point versus Policy Enforcement Points, short-lived credentials, service identity, least privilege, workload identity, region/data-residency enforcement.
Key distinction: Policy decides what is allowed; infrastructure enforces it.
Most important line: “The model never defines its own security boundary.”

⸻

4. Mission Control — Meta Factory Control Plane
Purpose: Provide the durable control plane that coordinates objectives across many factories.
Talking points: Intent understanding, planning, WorkOrder decomposition, routing, durable orchestration, approvals, evidence, outcomes, event bus, scheduler, budget service, audit ledger, state store, and recovery.
Talking script: “Mission Control is the center of the architecture, but it is not an agent runtime. It is the operating system for governed autonomous work. It interprets intent, produces a governed Plan, decomposes that Plan into WorkOrders, evaluates dependencies, selects qualified Factory Versions, manages long-lived state, budgets, approvals, evidence, and recovery, and keeps the entire objective moving across potentially multiple factories.”
Core services: Objective Service, Plan Service, WorkOrder Service, Event Bus, State Store, Global Scheduler, Budget Service, Evidence Service, Approval Service, Audit Ledger, Notification Service.
Technical emphasis: Durable state machine, event-driven orchestration, DAG evaluation, retries, fencing, idempotency, checkpointing, state recovery.
Key distinction: Mission Control orchestrates factories; factories do not orchestrate one another ad hoc.
Most important line: “The durable thing is the work—not the agent.”

⸻

5. Factory & Capability Registry
Purpose: Maintain the governed inventory of everything Mission Control and factories are allowed to compose.
Talking points: Factory Registry, Agent Registry, Capability Registry, Model Registry, Execution Profiles, environment and compliance configurations.
Talking script: “At enterprise scale I need registries, not hard-coded names in prompts. A Factory Definition, Factory Version, agent definition, skill, harness, MCP server, model route, execution profile, and verifier all need identity, ownership, version, compatibility, evaluation history, security metadata, and lifecycle state. Routing operates over these governed assets.”
Technical emphasis: Immutable versions, semantic compatibility, qualification status, deprecation, ownership, cost/latency history, capability metadata.
Example: security-remediation@4.7 may resolve to supervisor recipe, agents, harnesses, model routes, context policy, tool policy, sandbox profile, and verifier contract.
Key distinction: A registered component exists; a qualified component may be routed.
Most important line: “Production uses qualified compositions, not mutable collections of parts.”

⸻

6. Factory Runtime Layer
Purpose: Host multiple specialized software factories that execute bounded WorkOrders using their own qualified compositions.
Talking points: Modernization Factory, Security Remediation Factory, Test Engineering Factory, Delivery Factory, Verification Factory, Reliability Factory. Each contains a supervisor plus specialized agents and harnesses.
Talking script: “A factory is not just an agent. It is a qualified runtime composition designed for a workload class. The Security Remediation Factory may use research, security analysis, coding, test, and scanner capabilities under a high-assurance profile. The Test Engineering Factory may use different agents, harnesses, model routes, and evaluation contracts. Mission Control routes WorkOrders to these factories based on qualification evidence.”
Technical emphasis: Factory Version + Execution Profile + supervisor + capability set + policy + verification contract.
Key distinction: Factory identity is independent of model identity.
Most important line: “Factories specialize by workload; they scale through composition, not duplication.”

⸻

7. Inference Layer
Purpose: Abstract model providers and provide controlled, resilient, observable inference.
Talking points: Model Gateway, Model Router, providers such as OpenAI, Azure OpenAI, Anthropic, Gemini, Llama, Mistral, Bedrock, Vertex, or internal endpoints.
Talking script: “Inference is a shared architectural plane, not something each agent manages independently. Agents and harnesses request a logical model route. The Model Gateway resolves that route to an approved provider and model configuration, applies retries, timeouts, rate limits, circuit breakers, regional constraints, token budgets, safety controls, and cost attribution.”
Technical emphasis: Provider abstraction, route identity, fallback eligibility, request metadata, context/output limits, cost tracking, caching, circuit breaking.
Important distinction: Factory Router selects security-remediation@4.7; Model Router may select security-reasoning@6.
Key distinction: Factory Routing chooses the qualified system; Model Routing chooses inference within that system.
Most important line: “Fallback is a governance decision, not just a reliability feature.”

⸻

8. Context Intelligence / RAG Layer
Purpose: Assemble the right authorized enterprise context for each inference.
Talking points: Ingestion pipeline, retrieval services, context assembly, vector search, lexical search, graph search, ACL filtering, metadata filtering, reranking, compaction, token budgeting, provenance.
Talking script: “I treat RAG as one capability inside a broader Context Intelligence layer. Engineering tasks need code intelligence, lexical retrieval, semantic search, dependency graphs, documentation, tickets, incidents, runbooks, and runtime evidence. The system retrieves only authorized information, reranks it, deduplicates it, compacts it to the token budget, and preserves provenance.”
Technical emphasis: Parse → normalize → chunk → metadata → ACL → embed → index; then query rewrite → hybrid retrieval → filter → rerank → compact → context package.
Key distinction: Context, state, memory, and knowledge are different architectural concerns.
Most important line: “A large context window is capacity; Context Intelligence decides what deserves to occupy it.”

⸻

9. Tooling, MCP & Integration Layer
Purpose: Give agents and harnesses safe, standardized access to enterprise systems and actions.
Talking points: MCP/Tool Gateway, GitHub, Jira, ServiceNow, Salesforce, databases, cloud APIs, CI/CD, custom APIs, credentials, authentication, schema validation, rate limiting, auditing.
Talking script: “Agents should not directly connect to arbitrary MCP servers or carry broad static credentials. Tool access goes through a governed gateway. The gateway validates the tool schema, checks policy, obtains a scoped short-lived credential, applies rate limits and idempotency, executes the request, and captures the result and audit trail.”
Technical emphasis: MCP registry, tool versioning, credential broker, schema validation, retries, authorization, response validation, tracing.
Key distinction: The model requests a capability; the gateway controls the consequential action.
Most important line: “Give agents capabilities, not standing credentials.”

⸻

10. Execution Environment Layer
Purpose: Provide secure, ephemeral compute for code execution, testing, builds, scanners, and other tool workloads.
Talking points: Sandbox Manager, Docker, Kubernetes, VMs, serverless, Azure Container Apps, CI runners, isolated filesystem/network/secrets, reproducible environments.
Talking script: “Inference and execution are separate. Models reason through the inference plane, while code, commands, tests, scanners, package managers, and builds execute inside isolated sandboxes. The sandbox is provisioned from a qualified Execution Profile and constrained by filesystem, network, secrets, resource, timeout, and environment policy.”
Technical emphasis: Ephemeral worktrees, immutable base images, runtime artifacts, network allowlists, resource limits, checkpoint restore, sandbox identity.
Key distinction: Session state is durable; sandboxes are disposable.
Most important line: “The session may live for days; the sandbox may live for minutes.”

⸻

11. Data, State, Artifact & Memory Plane
Purpose: Persist authoritative system state, execution artifacts, semantic indexes, events, caches, and memory at the correct lifecycle boundaries.
Talking points: PostgreSQL for authoritative state, Redis for ephemeral cache/queues, object storage for artifacts/evidence, vector DB/search, event stream, artifact registry, evaluation store.
Talking script: “I deliberately avoid calling all persistence ‘memory.’ Objective state, Plan state, WorkOrder status, Attempt identity, and approval state belong in an authoritative transactional store. Build outputs, patches, logs, evidence, SBOMs, and reports belong in object storage. Semantic retrieval belongs in indexes. Working memory and session memory have different scopes and retention rules.”
Technical emphasis: Content-addressable artifacts, immutable digests, event sourcing where useful, retention, provenance, TTL, ownership.
Key distinction: State must be correct; memory only needs to be useful.
Most important line: “An LLM conversation is never the system of record.”

⸻

12. Testing, Verification & Evaluation Layer
Purpose: Separate software testing, execution verification, and reusable capability evaluation.
Talking points: Test frameworks, independent verifiers, evaluation/benchmarking, golden datasets, quality/safety evaluation, regression testing, A/B and canary evaluation.
Talking script: “Testing, verification, and evaluation solve different problems. Tests determine whether software behavior is correct. Verification determines whether a specific WorkOrder result satisfies its contract. Evaluation determines whether a reusable agent, model route, Execution Profile, or Factory Version is good enough to qualify for future use.”
Verification flow: Producer Attempt → Candidate → Independent Verifier → Evidence → PASS/FAIL.
Evaluation flow: Golden workload → benchmark → compare versions → qualification evidence.
Technical emphasis: Deterministic tests, LLM judge only where necessary, independence, adversarial scenarios, reproducibility.
Key distinction: Testing checks software. Verification judges work. Evaluation qualifies capabilities.
Most important line: “A producer does not grade its own work.”

⸻

13. Observability & Monitoring
Purpose: Provide end-to-end telemetry across objectives, factories, models, context, tools, sandboxes, verification, and cost.
Talking points: Traces, metrics, logs, dashboards, alerts, usage analytics, OpenTelemetry, Azure Monitor, Prometheus, Grafana, centralized logging.
Talking script: “I need more than agent traces. I want a distributed objective trace from the original builder request through Plan, WorkOrder, Factory Version, Task, Attempt, model calls, retrievals, tool calls, sandbox execution, verification, approval, and release. That lets engineering and platform teams explain what happened, where latency occurred, what cost was incurred, and why a result failed.”
Trace hierarchy: Objective → WorkOrder → Task → Attempt → Model / Tool / Retrieval / Sandbox spans.
Key distinction: Observability explains execution; audit proves accountability.
Most important line: “I need an objective trace, not just an agent trace.”

⸻

14. Reliability, Scalability & Cost Management
Purpose: Operate the architecture under enterprise concurrency, provider limits, failures, and economic constraints.
Talking points: Global scheduler, autoscaling, circuit breakers, retries, model-agent failover, cost tracking, knowledge/resource caching, repo concurrency control.
Talking script: “Once thousands of WorkOrders can become runnable simultaneously, orchestration becomes a scheduling problem. The global scheduler considers tenant fairness, priority, SLA, model quotas, sandbox capacity, region, cost, and risk. Reliability mechanisms such as leases, fencing, checkpoints, retries, dead-letter queues, and circuit breakers prevent agent failures from becoming system failures.”
Technical emphasis: Backpressure, idempotency, authoritative Attempt fencing, admission control, budget ceilings, provider quota awareness.
Cost principle: Track model, context, tools, compute, sandbox, verification, and human intervention.
Key distinction: Cheapest inference is not necessarily cheapest outcome.
Most important line: “Optimize cost per verified outcome—not cost per token.”

⸻

15. Governance, Compliance & Risk
Purpose: Provide enterprise-wide trust, accountability, risk management, model governance, data governance, and regulatory control.
Talking points: AI governance, risk management, data governance, compliance, model governance, policy/audit, standards review, responsible AI.
Talking script: “Governance sits across the entire architecture rather than at the end. Every Factory Version, model route, capability, data source, deployment region, and authority transition needs ownership, policy, qualification, audit history, and lifecycle controls. Enterprise governance also determines retention, residency, model eligibility, acceptable autonomy, and required human authority.”
Technical emphasis: Controls mapped to runtime enforcement, audit evidence, model provenance, data lineage, policy versions, compliance reporting.
Key distinction: Governance is runtime semantics, not documentation around the system.
Most important line: “The architecture should be able to prove not only what happened, but that it happened under the correct policy.”

⸻

16. CI/CD, ModelOps & FactoryOps
Purpose: Build, test, version, qualify, promote, operate, and roll back the software factory itself.
Talking points: Source control, CI/CD, ModelOps, Factory lifecycle, infrastructure as code, factory/version qualification.
Talking script: “The final architectural plane is how we evolve the factory itself. Agents, skills, harnesses, prompts, context policies, model routes, Execution Profiles, MCP integrations, verification rules, and Factory Versions all change over time. Those changes should go through CI/CD just like software: candidate creation, automated testing, offline evaluation, security qualification, canary deployment, pilot, enterprise promotion, observation, and rollback.”
Lifecycle: Component change → candidate composition → Factory Version candidate → qualification → canary → pilot → enterprise.
Technical emphasis: Immutable Factory Versions, signed artifacts, infrastructure as code, rollback, promotion rings, compatibility checks.
Key distinction: A factory is software and must have its own SDLC/FDLC.
Most important line: “We don’t just use factories to build software—we engineer the factories themselves.”

⸻

Master 4-Minute Talking Script
“I think of this as an enterprise reference architecture rather than a delivery flow. At the top, builders and systems can enter through web, IDEs, CLI, APIs, collaboration tools, CI/CD, or events. Those channels converge through a conventional enterprise edge with WAF, API Gateway, validation, quotas, backpressure, and versioned contracts.
Identity and policy then establish who is acting, what resources they may access, what models, tools, data, environments, and autonomy levels are permitted, and where enforcement must occur.
Mission Control is the Meta Factory control plane. It is not itself an agent runtime. It owns Objectives, Plans, WorkOrders, dependency state, factory routing, global scheduling, budgets, approvals, evidence, events, and recovery. It uses the Factory and Capability Registries to select immutable, qualified Factory Versions and reusable execution resources.
Inside each factory, a Supervisor coordinates specialized agents and deterministic harnesses. But those agents depend on shared platform planes. Inference goes through a Model Gateway that abstracts providers, handles routing, retries, quotas, region, cost, and fallback. Context Intelligence handles ingestion, lexical and vector retrieval, graph search, ACL filtering, reranking, compaction, and provenance. MCP and enterprise tool access go through a governed Tool Gateway and Credential Broker. Commands, builds, tests, and scanners execute in ephemeral sandbox environments rather than directly on developer hosts.
Persistent state, artifacts, indexes, caches, events, and memory are separated into the appropriate data stores. Testing verifies software behavior, independent verification determines whether a WorkOrder result satisfies its contract, and evaluation qualifies reusable components and Factory Versions.
Across the entire architecture, observability gives us objective-level traces, reliability gives us scheduling, backpressure, retries and recovery, security and governance define enterprise trust boundaries, and FactoryOps gives the factory itself a controlled lifecycle.
The key idea is that multi-agent orchestration is only one subsystem inside a much larger Multi-Factory Software Architecture. The real architecture is the control planes, runtime planes, data planes, security boundaries, inference services, context services, integration gateways, execution environments, and qualification systems that make autonomous software engineering safe and operable at enterprise scale.”
Five lines worth memorizing
“Mission Control orchestrates factories; supervisors orchestrate agents.”
“Factory Routing chooses the qualified system; Model Routing chooses inference within it.”
“The model requests capabilities; infrastructure owns authority and enforcement.”
“Testing checks software, verification judges work, and evaluation qualifies reusable capabilities.”
“Multi-agent orchestration is a subsystem; the Multi-Factory Software Architecture is the system.”
