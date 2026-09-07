---
title: "Multi-factory software delivery"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p8399
captured_at: 2026-09-07T04:35:19.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: 4a7da06902a8cbed19969c33aa6158160f20dbc9670cdb5e649e61f1aa828779
---

Multi-factory software delivery

￼

1. Builder Intent — Express the Objective, Not the Factory
Purpose: Give builders a simple interface into an extremely sophisticated autonomous delivery system. The builder specifies the desired outcome; the platform determines how to accomplish it.
Talking points: Builders should not need to select agents, models, skills, harnesses, MCP servers, or even necessarily factories. Intent can be natural language or structured. Mission Control automatically enriches the request with repository and enterprise context. Intent establishes the desired outcome, constraints, and scope—but does not automatically grant execution authority. This separation is essential at enterprise scale.
Talking script: “I start with builder intent because I don’t want 30,000 employees learning the topology of our software factory. A builder shouldn’t have to know which agent, model, harness, skill, or factory to invoke. They should be able to say, ‘Modernize payments to Java 21, remediate the vulnerabilities, improve test coverage, and deploy safely.’ The system then enriches that request with repository topology, language and framework information, data classification, business ownership, environment, regulatory constraints, and the builder’s permissions. The important architectural boundary is that intent expresses the desired outcome—it doesn’t grant an agent authority to do whatever is necessary to achieve it.”
Technical details: Mission Control should normalize the request into a durable Objective with identity, scope, target resources, desired outcomes, constraints, acceptance criteria, risk classification, budget, SLA, provenance, and authority context. The original request remains evidence, but downstream components operate against the Objective rather than repeatedly interpreting an uncontrolled prompt.
Key distinction: Intent ≠ authority.
Most important line: “Builders express outcomes, not factory topology.”
Transition: “Once I know what the builder wants, the first routing problem is determining what capabilities are actually required.”

⸻

2. Intent Classification & Objective Routing — Determine What Factories Are Needed
Purpose: Perform Level 1 routing by determining the workload types and capability domains required to accomplish the overall objective.
Talking points: Classification should combine LLM reasoning with deterministic repository and enterprise signals. One objective may require multiple factories. This stage identifies required capabilities—not necessarily exact Factory Versions. Policy constraints begin filtering the solution space immediately. The result becomes an input to planning.
Talking script: “The first routing decision isn’t which model to use. It’s what kinds of capabilities are necessary to achieve the objective. In this example, the platform recognizes that this isn’t simply a coding request. It requires modernization, security remediation, test engineering, delivery, and ultimately production validation. I would combine semantic reasoning with deterministic signals such as repository manifests, dependency graphs, SBOMs, CI configuration, ownership, security classification, and enterprise policy. That gives the planner a grounded capability requirement rather than asking an LLM to invent an execution strategy from scratch.”
Technical flow:
Intent → Classification → Repository Analysis → Policy Evaluation → Required Capabilities → Candidate Factory Classes
For the example:
Java modernization + vulnerability remediation + testing + verification + deployment + production validation
Key distinction: Objective routing determines what categories of execution are required. WorkOrder routing later determines exactly which Factory Version executes each piece.
Most important line: “Route the objective to capabilities before routing tasks to models.”
Transition: “Once the platform understands the required capabilities, it has to convert the objective into something durable and executable.”

⸻

3. Objective Planning — Planner ≠ Plan
Purpose: Transform an ambiguous objective into a durable, inspectable, governable dependency graph.
Talking points: The Planner is replaceable intelligence. The Plan is durable state. The Planner proposes WorkOrders, dependencies, acceptance criteria, factory requirements, verification requirements, budgets, and human gates. Humans can review or modify the Plan where required. Approval binds to a specific Plan revision/digest. Execution should not depend on retaining the Planner’s conversation history.
Talking script: “This is one of my most important architectural boundaries: the Planner is not the Plan. The Planner is replaceable intelligence. I can change its model, retry it, evaluate it, or replace it completely. Its job is to reason about the objective and propose decomposition. The output becomes a durable governed Plan containing WorkOrders, dependency edges, acceptance criteria, factory requirements, verification requirements, security constraints, budget, SLA, evidence requirements, human decision points, and release conditions. Once approved, Mission Control executes that artifact—not the Planner’s transient chain of reasoning.”
The Plan contains: Objective; acceptance criteria; WorkOrders; dependency graph; factory requirements; verification contracts; security constraints; budget/SLA; evidence requirements; authority gates; release conditions; retry/recovery policies; stop conditions; provenance.
Technical requirement: The approved Plan should be immutable. Modification creates a new revision requiring appropriate re-evaluation and potentially renewed approval.
Key distinction: Planner = reasoning. Plan = governed execution contract.
Most important line: “The Planner proposes. The Plan persists.”
Transition: “The Plan now tells Mission Control exactly what work exists and which dependencies must be satisfied before each piece can execute.”

⸻

4. WorkOrder Routing — Select the Best Qualified Factory Version
Purpose: Perform Level 2 routing: select the exact qualified Factory Version allowed to execute a particular WorkOrder.
Talking points: Routing is qualification before optimization. First eliminate factories that are unauthorized, incompatible, or unqualified. Then empirically rank eligible Factory Versions. Routing should consider quality, historical verification pass rate, capability fit, context fit, reliability, latency, economics, and risk. Routing decisions must be attributable and reproducible.
Talking script: “Once a WorkOrder becomes runnable, Mission Control performs Factory Routing. I don’t ask, ‘What’s the smartest available model?’ I first ask, ‘Which Factory Versions are actually authorized and qualified for this workload?’ Eligibility filtering considers repository type, language, data classification, environment, policy, risk, available execution backend, required capabilities, and builder authority. Only after that do I rank eligible versions empirically using quality, verification pass rate, capability fit, context fit, reliability, latency, economics, and risk.”
Conceptual route score:
Quality + Verification History + Capability Fit + Context Fit + Reliability + Latency Fitness + Economic Efficiency − Risk
The weights should be workload-specific. Security remediation might prioritize correctness and security qualification heavily; low-risk documentation might optimize latency and economics more aggressively.
Example: WO-103 Security Remediation → security-remediation@4.7 → java-high-assurance@3.2
Key distinction: Qualification determines what may execute. Routing determines which qualified option should execute.
Most important line: “Never let optimization bypass qualification.”
Transition: “Once Mission Control selects the Factory Version, orchestration moves inside that factory.”

⸻

5. Factory Execution — Multi-Agent Orchestration
Purpose: Execute a bounded WorkOrder using a qualified composition of supervisor intelligence, specialist agents, harnesses, models, skills, tools, context, and deterministic execution capabilities.
Talking points: Mission Control orchestrates across factories; the Factory Supervisor orchestrates inside a factory. A Factory Version defines the qualified composition. The Execution Profile specializes that composition for a workload/environment. The supervisor decomposes the WorkOrder into Tasks and coordinates specialists. Not everything should be an agent. Deterministic tools should remain deterministic where appropriate. Harnesses establish boundaries around model execution.
Talking script: “This is where multi-agent orchestration actually occurs. Mission Control has handed the factory a bounded WorkOrder. Inside the selected Factory Version, a Supervisor reads the WorkOrder and Plan, decomposes the work into Tasks, manages dependencies, coordinates specialists, manages context, monitors progress, handles retries and recovery, enforces budgets and policy, and decides when execution should stop. But I don’t make everything an agent. Research may be agentic. Context retrieval may be a deterministic RAG service. Coding may run through a specialized coding harness. Compilation, tests, static analysis, and security scanning should remain deterministic wherever possible.”
Supervisor responsibilities
Task planning · Agent coordination · Context management · Tool/harness selection · Progress monitoring · State management · Retry/recovery · Budget enforcement · Stop conditions
Specialist execution
Research Agent — analyzes issues, documentation, CVEs, APIs, dependencies and external information.
RAG / Context capability — retrieves authorized enterprise knowledge and repository context with provenance.
Security Agent + deterministic tools — reasons about remediation while scanners/SBOM/SAST capabilities provide deterministic signals.
Coding Agent / Harness — modifies code inside a bounded execution environment.
Testing Agent / Harness — generates tests where appropriate and executes deterministic test suites/builds.
Build/Execution tools — compiler, package manager, static analysis, CI, sandbox and other deterministic capabilities.
Key architectural principle: A Factory Version is not a giant agent. It is a qualified composition of intelligence and control.
Key distinction: Mission Control orchestrates factories; supervisors orchestrate execution resources inside factories.
Most important line: “Use intelligence where reasoning adds value; keep control outside the model wherever determinism matters.”
Transition: “And execution itself doesn’t mean success. It produces a candidate that still has to be independently verified.”

⸻

6. Verification — Local and Global
Purpose: Separate producing work from determining whether that work is acceptable.
Talking points: Producer ≠ verifier. Every significant output becomes an unpublished Candidate. Local verification operates at the WorkOrder/factory boundary. Global verification operates at the objective/system boundary. Verification produces attributable evidence. Local PASS does not imply objective PASS.
Talking script: “I deliberately separate execution from verification. A producer Attempt does not declare itself successful and publish its own work. It produces a Candidate. An independent verifier evaluates that Candidate against the acceptance criteria, policy, security requirements, quality gates, and required evidence. That’s local verification. But because this objective spans multiple factories, I need another level: global verification. Every WorkOrder can independently pass while the integrated system still fails. Global verification determines whether the combined outputs actually satisfy the original objective.”
Local verification
Factory execution → Producer Attempt → Candidate → Independent Verifier Attempt → Evidence → PASS/FAIL
Checks can include:
acceptance criteria,
compilation/build,
unit/integration tests,
security scans,
policy compliance,
quality metrics,
artifact integrity,
required evidence,
downstream readiness.
Question answered: “Did this factory correctly satisfy this WorkOrder?”
Global verification
Consumes the verified outputs from multiple WorkOrders and evaluates:
all required WorkOrders complete,
cross-WorkOrder consistency,
integration behavior,
original objective acceptance criteria,
end-to-end testing,
security/compliance,
performance/reliability,
release readiness.
Question answered: “Did the integrated system actually achieve the builder’s objective?”
Key distinction: Task success ≠ WorkOrder success ≠ Objective success.
Most important line: “Local verification proves the component. Global verification proves the composition.”
Transition: “Even a globally verified result isn’t necessarily authorized to enter production—that is a separate authority decision.”

⸻

7. Human Authority & Release — Verification Does Not Equal Permission
Purpose: Preserve explicit authority over consequential transitions such as publication, production deployment, rollout scope, exceptions, and rollback.
Talking points: Agents can recommend; verifiers can establish evidence; neither necessarily owns release authority. Human authority can vary according to risk. Low-risk operations may eventually be policy-authorized; consequential transitions retain explicit human authority. Release should support rings/canaries. Rollback authority must remain available.
Talking script: “Verification answers whether the system believes the work satisfies its contract. Authority answers whether we’re permitted to act on that result. I keep those separate. Humans review the evidence and verification results, approve consequential releases, define rollout scope, monitor deployment, and retain rollback authority. Over time, policy may allow low-risk transitions to become increasingly autonomous, but the architecture doesn’t require us to give a model unconditional authority just because models become more capable.”
Authority actions shown in the infographic: Review evidence; approve release; define release scope/rings; monitor deployment; retain rollback authority.
Technical model:
Candidate → Verified → Authorized → Published → Released
Those should be separate state transitions.
For high-risk systems:
Verified ≠ Authorized
and:
Authorized ≠ Released
Key distinction: Verification establishes confidence; authority grants permission.
Most important line: “Autonomy can increase without collapsing the authority boundary.”
Transition: “Once the release occurs, the architecture still isn’t finished. We need to know whether it actually worked in production.”

⸻

8. Outcomes & Learning — Optimize for Real Outcomes, Not Agent Activity
Purpose: Close the factory lifecycle by measuring production outcomes and feeding evidence back into qualification, routing, skills, models, context strategies, and factory design.
Talking points: Success is not “agent completed.” Measure quality, velocity, reliability, cost, security posture, user adoption and real operational outcomes. Compare Factory Versions and Execution Profiles empirically. Feed results back into routing and qualification. Learning should propose new candidates—not silently mutate production factories.
Talking script: “The lifecycle doesn’t stop at release. The entire point of the factory is achieving a measurable outcome. I observe quality, velocity, reliability, cost, security posture, adoption, incidents, rollback rates, and whatever business metrics matter for that workload. Those outcomes become empirical evidence for routing and factory qualification. If one Execution Profile consistently outperforms another on large Java migrations, routing should learn from that. But learning doesn’t silently mutate production. It creates a new candidate skill, model route, context strategy, Execution Profile, or Factory Version that must be evaluated and promoted.”
Learning loop
Outcome → Attribution → Evaluation → Compare → Improvement Candidate → Qualification → New Version → Controlled Promotion
This protects against an extremely dangerous anti-pattern:
Production outcome → self-modifying agent → immediate production change
Instead:
Production outcome → learning evidence → candidate → qualification → controlled promotion
Key distinction: Learning proposes change; qualification authorizes change.
Most important line: “The factory learns empirically without becoming self-modifying production infrastructure.”
Transition: “Those eight stages describe the lifecycle. A through F show the mechanisms underneath it.”

⸻

A. Governed Plan — WorkOrders & Dependency Graph
Purpose: Show how Mission Control orchestrates one objective across multiple independent factories.
Talking points: The Plan is a DAG, not an agent conversation. WorkOrders have explicit dependencies. Mission Control owns readiness and sequencing. Independent branches can execute concurrently. Outputs are exchanged as attributable artifacts, not informal agent messages. Changes upstream can invalidate downstream evidence.
Talking script: “This graph is critical because factories shouldn’t orchestrate one another ad hoc. Mission Control orchestrates the objective. Each WorkOrder has explicit prerequisites, input artifacts, acceptance criteria, verification requirements, and completion conditions. Here, Analyze enables Modernize. Modernize then enables Security and Testing to execute in parallel. Global verification cannot proceed until both branches independently pass. Deployment cannot proceed until verification succeeds, and production validation follows deployment.”
Dependency graph
WO-101 Analyze ↓ WO-102 Modernize ↙︎　　　　　　　↘︎ WO-103 Secure　WO-104 Tests ↘︎　　　　　　　↙︎ WO-105 Verify ↓ WO-106 Deploy ↓ WO-107 Validate
Mission Control tracks
WorkOrder readiness · blocked dependencies · parallelism · critical path · artifact lineage · evidence freshness · retries · failures · budgets · deadlines · cancellation · invalidation · recovery.
Technical scenario: If WO-103 verified artifact A from WO-102, and WO-102 subsequently produces artifact B, Mission Control should be able to invalidate WO-103’s stale evidence and determine which downstream WorkOrders must be rerun.
Key distinction: Factories execute graph nodes; Mission Control owns graph semantics.
Most important line: “Factories execute nodes. Mission Control owns the graph.”
Transition: “Let’s zoom into one node and look at what actually happens inside a factory.”

⸻

B. Inside a Factory — Multi-Agent Orchestration
Purpose: Explain the execution machinery inside a selected Factory Version.
Talking points: A WorkOrder enters a specific qualified Factory Version and Execution Profile. The Supervisor orchestrates specialized agents and deterministic capabilities. Tasks are smaller execution units beneath the WorkOrder. Capability routing occurs per Task. Every execution creates an attributable Attempt. Outputs become Candidates. Independent verification occurs outside the producer’s authority.
Talking script: “This is the factory internals. WO-103 enters the Security Remediation Factory. Mission Control has already selected security-remediation@4.7 and an appropriate high-assurance Execution Profile. The Supervisor reads the WorkOrder and Plan and decomposes execution into Tasks. It might ask a Research Agent to understand the CVE, retrieve enterprise context through RAG, run dependency and security tooling, use a coding harness to implement remediation, and use a test harness to validate the resulting build. For each Task, the Capability Router selects only qualified models, skills, harnesses, tools, and context strategies.”
Three levels of routing
Level 1 — Objective Routing: “What factories/capabilities does the objective require?”
Level 2 — WorkOrder Routing: “Which qualified Factory Version should execute this WorkOrder?”
Level 3 — Capability Routing: “Which qualified model, skill, harness, tool, context strategy, or specialist should execute this Task?”
Task execution path
Task → Capability Router → Execution Producer → Attempt → Candidate → Independent Verifier → Evidence
Failure path: A verifier failure returns control through an explicit remediation policy. It does not create an unlimited autonomous retry loop.
Retry policies should define:
maximum Attempts,
budget ceiling,
repeated-failure threshold,
escalation conditions,
alternate route eligibility,
human intervention conditions,
terminal failure state.
Key distinction: Agent orchestration is subordinate to factory governance.
Most important line: “The Supervisor coordinates intelligence; the harness constrains execution; Mission Control retains durable state.”
Transition: “The next question is how we prove that all this autonomous execution produced something trustworthy.”

⸻

C. Verification — Local vs. Global, continued
Local verification
Factory Execution → Producer Attempt → Candidate → Independent Verifier Attempt → Evidence → Local PASS / FAIL
Local verification should evaluate:
WorkOrder acceptance criteria
Compilation and build correctness
Unit and component tests
Static analysis
Security scans
Policy compliance
Artifact integrity
Required quality metrics
Required evidence completeness
Input/output provenance
Readiness for downstream consumption
Talking script: “Local verification answers a very bounded question: did this Factory Version correctly satisfy this WorkOrder against the exact inputs it consumed? The producer doesn’t grade its own work. Its output is frozen as a Candidate, and an independent verifier evaluates that Candidate against the WorkOrder’s verification contract. The resulting evidence is attributable to the exact Factory Version, Execution Profile, producer Attempt, input artifacts, output artifact, verifier Attempt, policies, and evaluation results.”
Global verification
Verified WorkOrders → Integrated Candidate → Objective Verification → Objective PASS / FAIL
Global verification evaluates:
All required WorkOrders completed
Correct versions of upstream artifacts consumed
Cross-WorkOrder consistency
End-to-end functional behavior
Original objective acceptance criteria
Integration/regression tests
Security posture
Compliance
Performance
Reliability
Deployment readiness
Required evidence completeness
Talking script: “Global verification asks a fundamentally different question: did the composition of all these locally verified outputs achieve the original objective? Security can pass. Modernization can pass. Testing can pass. Yet when I integrate them, the system can still fail. That’s why local PASS is necessary but insufficient for objective completion.”
Independent verification does not necessarily mean “another LLM”
This is an important technical point.
The verifier can compose:
Deterministic checks + specialized evaluators + policy engines + security scanners + test harnesses + LLM judges + human review
For example:
Java modernization verification
Compiler → unit tests → integration tests → API compatibility → static analysis → dependency validation → performance regression → specialized verifier reasoning.
Talking script: “Independent verification doesn’t mean I blindly ask a second model whether the first model did a good job. I want deterministic evidence wherever deterministic evidence exists. Models are useful for semantic requirements and judgments that cannot easily be encoded, but compilation, tests, security scans, policy checks, artifact digests, and deployment health should remain deterministic.”
Correlated failure
If producer and verifier share identical models, prompts, context, assumptions, and tools, independence may be mostly cosmetic.
Stronger verification can introduce diversity through:
different model route,
different verification harness,
independent context construction,
deterministic checks,
adversarial test generation,
separate security tools,
independent policy evaluation.
Most important line: “Local verification proves the component. Global verification proves the composition.”
Key distinction: Execution produces claims. Verification produces evidence supporting or rejecting those claims.
Transition: “Once we understand verification, the next question is what kinds of factories actually exist and how we prevent every team from creating its own bespoke factory.”

⸻

D. Factory Catalog — Reusable Enterprise Factory Definitions
Purpose: Show how a large enterprise supports thousands of repositories and tens of thousands of builders without creating a factory for every user, team, or repository.
Talking points: Factory Definitions represent reusable delivery capabilities. A factory is not a user, repository, agent, container, or Kubernetes deployment. A relatively small number of Factory Definitions can support enormous enterprise scale. Specialization occurs through Factory Versions and Execution Profiles. Factories should scale through composition rather than duplication.
Talking script: “For 30,000 builders and thousands of repositories, I would not create 30,000 factories. I might initially have five to ten major Factory Definitions and perhaps dozens as the platform matures. A Factory Definition represents a reusable governed delivery capability. Scale happens through WorkOrders, Tasks, Attempts, Execution Profiles, and runtime concurrency—not by cloning factories for every repository.”
Example Factory Catalog
Software Delivery Factory
Purpose: General feature development, bug fixes, refactoring and routine engineering changes.
Potential capabilities:
repository understanding,
implementation,
refactoring,
code generation,
code review,
unit testing,
build execution,
documentation updates.
Talking script: “The Software Delivery Factory is my general-purpose engineering factory. It handles bounded feature development, defects, and refactoring. But I wouldn’t overload it with every specialized workload. When modernization or security requires a different qualification envelope, I route to a specialized factory.”

⸻

Modernization Factory
Purpose: Framework, language, runtime, API and architecture migrations.
Examples:
Java 17 → Java 21
React upgrades
Spring migrations
dependency modernization
API migrations
monolith decomposition assistance.
Its qualification corpus should contain historical migration scenarios and representative enterprise repositories.
Talking script: “Modernization deserves its own factory because the failure modes, context requirements, tools, acceptance criteria, and evaluation corpus differ from normal feature development.”

⸻

Security Remediation Factory
Purpose: CVEs, dependency vulnerabilities, insecure patterns and security remediation.
Potential capabilities:
CVE Research → SBOM → Dependency Analysis → SAST → Remediation → Build → Security Verification
It may require:
restricted networking,
approved security tools,
stronger verification,
specialized models/skills,
mandatory human approval,
stricter evidence retention.
Talking script: “Security is a good example of why one universal factory is insufficient. The security factory can operate under a higher-assurance Execution Profile with stricter tools, stronger verification, different network policy, and different release authority.”

⸻

Test Engineering Factory
Purpose: Test generation, coverage improvement, regression detection and quality engineering.
Capabilities could include:
coverage analysis,
test generation,
mutation testing,
regression selection,
integration testing,
flaky-test diagnosis,
performance testing.

⸻

Delivery Factory
Purpose: Build, packaging, release preparation and deployment execution.
This should be more deterministic than agentic.
Talking script: “Deployment is an area where I want models reasoning around the process but deterministic infrastructure executing the consequential action. The agent might diagnose a deployment problem. It should not invent an arbitrary deployment mechanism.”

⸻

Verification Factory
Purpose: System-level integration and objective verification.
This is especially valuable when multiple factories contribute artifacts to one objective.

⸻

Reliability Factory
Purpose: Production validation, health analysis, observability, rollback analysis and post-release validation.
Potential inputs:
Metrics + Logs + Traces + SLOs + Deployment Events + Error Rates + User Signals
Most important line: “Factories scale through composition, not duplication.”
Key distinction: A Factory Definition represents a governed capability domain; an Execution Profile specializes how that capability operates for a workload.
Transition: “The next challenge is change. Models improve weekly, skills change, context strategies evolve, and harnesses are upgraded. We therefore need a version model that prevents the factory from becoming a mutable bag of dependencies.”

⸻

E. Versioning Model — Immutable Factory Versions
Purpose: Make every production execution reproducible, attributable, qualified, promotable, and reversible.
Talking points: Factory Definition ≠ Factory Version. Factory Versions are immutable qualified compositions. Skills, models, harnesses, context strategies, policies, tools, and profiles can have independent lifecycles. Production routing targets qualified versions—not mutable “latest.” A component upgrade creates a new candidate composition rather than silently changing an existing factory. Promotion occurs through controlled rings. Rollback means routing back to a previously qualified version.
Talking script: “The Factory Definition is the logical capability—for example, Security Remediation. A Factory Version is an immutable qualified composition of the exact execution resources allowed to implement that capability. That distinction matters because models, skills, harnesses, tools, policies, and context strategies evolve independently. I don’t want security-remediation@4.7 to mean one thing Monday and something different Friday.”
Version hierarchy
Factory Definition Security Remediation
↓
Factory Version security-remediation@4.7
↓
Execution Profiles java-high-assurance@3.2 node-standard@2.8
↓
Qualified components
Supervisor recipe/version
Coding harness
Research capability
Security skills
Test skills
Model routes
Context policies
MCP/tool capabilities
Sandbox/runtime
Verification contract
Governance policy
Example conceptual composition
security-remediation@4.7
Supervisor Recipe — security-supervisor@3.4
Research Skill — cve-research@5.2
Remediation Skill — dependency-remediation@7.1
Coding Harness — fab@4.8
Context Policy — repo-security-context@3.6
Security Scanner — qualified tool version
Model Route — security-reasoning@6
Sandbox Profile — restricted-network@4
Verification Policy — security-critical@5.3
Talking script: “The Factory Version is effectively the qualification boundary. I can independently version every underlying asset, but once those assets are assembled and qualified together, that exact composition gets immutable identity.”
Why component qualification alone is insufficient
Suppose:
Skill A = qualified Harness B = qualified Model Route C = qualified
That does not automatically prove:
A + B + C = qualified system
Composition can introduce emergent failure.
Therefore:
Component qualification → Composition qualification → Factory Version
Most important technical principle: Qualification is compositional, not merely additive.

⸻

Factory Version Lifecycle
The infographic shows the right lifecycle:
1. Develop
Create a candidate:
security-remediation@4.8-candidate
New components can be introduced here without affecting production.
2. Qualify
Run:
deterministic tests,
golden workloads,
historical scenarios,
adversarial workloads,
policy tests,
security tests,
reliability tests,
cost evaluation,
latency evaluation,
regression comparison.
3. Promote
Use controlled rings:
Internal → Canary → Early Adopter → Pilot → Enterprise
4. Activate
Routing policy is permitted to select the version for eligible workloads.
This distinction matters:
Published ≠ Qualified ≠ Activated.
A version may exist in the registry without being eligible for production routing.
5. Observe
Measure:
verification pass rate,
completion rate,
intervention rate,
rollback rate,
latency,
token consumption,
compute consumption,
cost,
reliability,
security findings,
objective success.
6. Improve
Evidence produces a new candidate version.
Never mutate the current version.
7. Roll Back
Routing can revert from:
4.8 → 4.7
without reconstructing the old environment from memory.
Talking script: “Rollback is one of the strongest arguments for immutable Factory Versions. I don’t want rollback to mean ‘try to reconstruct what the factory looked like three weeks ago.’ I want Mission Control to route back to an already-qualified immutable composition.”

⸻

Execution Profiles
Purpose: Avoid creating separate Factory Definitions merely because workloads have different execution requirements.
For example:
Security Remediation Factory
could expose:
Java High Assurance — stronger verifier, restricted network, larger context budget, mandatory human release.
Node Standard — normal sandbox, standard verification, lower budget.
Legacy Repository — larger context window, specialized build tooling, longer timeout.
Regulated Production — restricted models/tools, stronger audit retention, mandatory authority gates.
Talking script: “Execution Profiles give me specialization without factory explosion. I don’t create a separate factory for every language, business unit, or risk tier. The Factory Definition remains stable while profiles define qualified operating envelopes.”
Key distinction: Factory Version answers ‘what qualified composition?’ Execution Profile answers ‘under what operating configuration?’
Most important line: “Production routes to immutable qualified compositions—not mutable collections of components.”
Transition: “Once immutable versions are operating at scale, we can finally measure which compositions actually perform best and feed that evidence back into the system.”

⸻

F. Outcomes & Learning — Close the Empirical Loop
Purpose: Turn production execution into evidence that improves routing, capabilities, skills, profiles, and future Factory Versions.
Talking points: Measure actual objective outcomes, not agent activity. Maintain attribution from outcome all the way back to Factory Version and Attempts. Compare versions empirically. Detect regressions and specialization opportunities. Learning proposes candidates; it does not mutate production. Routing can increasingly become empirical rather than heuristic.
Talking script: “This is where the architecture becomes a learning system instead of a static automation platform. Every objective gives me an attributable dataset: what workload we attempted, which Factory Version executed it, which Execution Profile was selected, which capabilities and model routes were used, what verification found, how much it cost, how long it took, whether humans intervened, whether we rolled back, and what happened in production. That evidence can improve future routing and qualification.”
Outcome dimensions shown in the infographic
Quality — defect escape, verification success, regressions.
Velocity — objective cycle time, WorkOrder duration, time-to-remediation.
Reliability — failure rate, retries, recovery success, production health.
Cost — tokens, inference, compute, sandbox, tools, human intervention.
Security posture — vulnerabilities introduced/remediated, policy violations.
User adoption — builder usage, acceptance, overrides, abandonment.
Feedback loop — explicit builder and operator feedback.
Add these enterprise metrics
objective success rate,
first-attempt verification pass rate,
retries per WorkOrder,
human escalation rate,
human override rate,
candidate rejection rate,
production rollback rate,
escaped defect rate,
mean recovery time,
context utilization,
tool failure rate,
routing regret,
factory-version regression rate.
Routing regret is particularly interesting
If Mission Control selected Factory Version A but historical evidence later suggests Factory Version B would probably have performed better, that becomes a routing-learning signal.
Over enough executions:
Static routing
“Java → Factory A”
can become:
Empirical routing
“For Java 21 modernization on large Spring monorepos with high test coverage and this risk classification, Factory Version 4.8/Profile 3.2 has historically produced the best verified quality/cost/reliability tradeoff.”
That directly addresses the sophisticated routing problem.

⸻

Learning should operate on attributable lineage
You want:
Production Outcome ↓ Release ↓ Objective ↓ Plan ↓ WorkOrder ↓ Factory Version ↓ Execution Profile ↓ Tasks ↓ Capability selections ↓ Attempts ↓ Candidates ↓ Verification Evidence
That gives the learning system enough information to ask:
“What actually caused this outcome?”
rather than:
“Which model was running?”
Talking script: “The model is only one independent variable. Maybe quality improved because of a better skill. Maybe the context strategy changed. Maybe the harness gave the model better recovery. Maybe verification caught more failures. Maybe the new Execution Profile allocated more budget. The lineage lets us attribute outcomes to the actual factory composition.”

⸻

Learning must not bypass governance
The dangerous architecture is:
Outcome → Learn → Automatically mutate production
The governed architecture is:
Outcome → Evidence → Hypothesis → Candidate Change → Evaluation → Qualification → Factory Version → Canary → Promotion
Talking script: “Continuous learning doesn’t mean continuous uncontrolled mutation. Learning can recommend a new skill, prompt, context strategy, routing rule, model route, or Factory Version. But that recommendation enters the same qualification lifecycle as every other production change.”
Key distinction: Learning changes what we test next; qualification changes what production may use.
Most important line: “The factory gets smarter through evidence, not uncontrolled self-modification.”
Transition: “When I put A through F together, you can see that this isn’t really an agent architecture. It’s a governed execution architecture in which agents are replaceable execution resources.”

⸻

The Key Principles Panel — What I Would Say About All Seven
The lower-right panel is small in the graphic, but these are actually the architectural principles I would emphasize in the interview.
1. Builders express intent, not factory details
Talking script: “Complexity belongs behind the platform boundary. Builders describe outcomes; Mission Control resolves execution.”
2. Mission Control orchestrates the objective
Talking script: “Factories should not form an uncontrolled peer-to-peer agent network. Mission Control owns the authoritative dependency graph, WorkOrder state, cross-factory coordination, and objective lifecycle.”
3. Factories are composed, not duplicated
Talking script: “I scale through reusable Factory Definitions, immutable Factory Versions, Execution Profiles, and reusable capabilities—not thousands of bespoke factories.”
4. The Plan is a durable governed artifact
Talking script: “The Planner can disappear. The Plan must survive. That’s what makes recovery, auditability, human review, and durable orchestration possible.”
5. Local verification ≠ global verification
Talking script: “A factory can correctly complete its WorkOrder while the overall system is still wrong. I verify both the node and the composition.”
6. Only qualified versions can be used
Talking script: “A model being available doesn’t mean it’s routable. A skill being published doesn’t mean it’s production-authorized. Production routing operates only over qualified compositions.”
7. Humans retain authority
Talking script: “I don’t use human-in-the-loop as a euphemism for making humans supervise every agent action. Humans should sit at consequential authority boundaries—approval, exception, publication, deployment, rollout, and rollback—while routine execution becomes increasingly autonomous.”

⸻

The Entire Infographic — 2-Minute Talking Script
If Titus asks you simply, “Walk me through this architecture,” I’d use this:
“I start with builder intent rather than an agent. The builder expresses the objective, and Mission Control enriches it with repository, organizational, security, and policy context. We classify the workload to determine which capability domains are required.
A replaceable Planner then decomposes that objective, but the Planner is not the Plan. The Plan becomes a durable governed artifact containing WorkOrders, dependencies, acceptance criteria, verification contracts, budgets, security constraints, evidence requirements, and authority gates.
Mission Control owns that dependency graph. When a WorkOrder becomes runnable, the Factory Router first filters for eligibility and qualification and then empirically selects the best Factory Version based on quality, verification history, capability fit, context fit, reliability, latency, economics, and risk.
Inside that factory, a Supervisor coordinates specialized agents and deterministic harnesses—research, RAG, coding, testing, security analysis, build tooling and whatever else that WorkOrder requires. Capability routing happens at the Task level, so different tasks can use different qualified models, skills, tools, harnesses, and context strategies.
Execution never directly becomes authoritative. A producer Attempt creates a Candidate. An independent verifier evaluates it and





———
————

The builder doesn’t need to understand that composition unless they want to inspect it.

A. Governed Plan — WorkOrders & Dependency Graph

Purpose: Represent a large enterprise objective as a durable dependency graph of independently executable, governable WorkOrders. Mission Control owns this graph and determines when each WorkOrder is eligible to execute.

Talking script: “This graph is critical because factories should not orchestrate one another ad hoc. Mission Control orchestrates the objective. Each WorkOrder has explicit prerequisites, required inputs, acceptance criteria, verification requirements, and completion conditions. In this example, security remediation and test engineering can execute in parallel after modernization, but global verification cannot begin until both branches have independently passed and their evidence is available.”

Architecture flow:

WO-101 — Analyze
Software Delivery Factory
↓
WO-102 — Modernize
Modernization Factory
↓
Branches into:

WO-103 — Secure — Security Remediation Factory
and
WO-104 — Tests — Test Engineering Factory

Once both are complete:
↓
WO-105 — Verify — Verification Factory
↓
WO-106 — Deploy — Delivery Factory
↓
WO-107 — Validate — Reliability Factory

WorkOrder contract

Every WorkOrder should be a durable governed object containing:
￼

Why DAG semantics matter

Purpose: Make multi-factory execution deterministic, recoverable, parallelizable, and auditable.

Talking script: “I model the Plan as a dependency graph rather than a sequence of agent conversations. That gives Mission Control deterministic knowledge of what is ready, what is blocked, what can execute concurrently, and what must be invalidated when an upstream dependency changes. This is essential once objectives span many factories and potentially thousands of repositories.”

Mission Control continuously evaluates the graph to determine:

Runnable WorkOrders — all dependencies have satisfied their required states.

Blocked WorkOrders — one or more required upstream dependencies remain incomplete or failed.

Parallel branches — independent WorkOrders can execute concurrently.

Critical path — identifies the chain of WorkOrders controlling objective completion time.

Failure propagation — determines which downstream WorkOrders become blocked or invalid.

Artifact freshness — verifies downstream execution consumed the authoritative upstream artifact version.

Budget propagation — tracks spending at WorkOrder, factory, and objective levels.

Cancellation propagation — safely terminates downstream work when an objective or dependency is cancelled.

Recovery position — allows orchestration to restart from durable state rather than replaying the entire agent conversation.

WorkOrder lifecycle

A typical WorkOrder progresses through:

PLANNED → READY → ROUTED → RUNNING → CANDIDATE → VERIFYING → VERIFIED → COMPLETE

Exceptional states include:

BLOCKED · FAILED · RETRYABLE · REQUIRES AUTHORITY · INVALIDATED · CANCELLED

Technical point: A WorkOrder should not become COMPLETE merely because a producer agent says it finished. Execution produces a Candidate. Independent verification determines whether that Candidate satisfies the WorkOrder’s contract.

Dependency invalidation

This becomes particularly important in multi-factory systems.

Assume:

WO-102 Modernize → WO-103 Secure → WO-105 Verify

If WO-103 consumed artifact modernized-build@A, but WO-102 later produces a corrected modernized-build@B, then the evidence generated by WO-103 against version A may no longer be authoritative.

Mission Control should be able to detect:

Upstream artifact changed → downstream evidence stale → affected WorkOrders invalidated or re-qualified

Talking script: “Evidence is only valid against the inputs that produced it. If an upstream artifact changes, I don’t want the system pretending downstream verification is still authoritative. Provenance lets Mission Control identify exactly what needs to be rerun.”

What Mission Control owns

Mission Control owns the cross-factory control loop:

Plan state → Dependency evaluation → WorkOrder readiness → Factory routing → Execution observation → Verification state → Evidence → Dependency release

Individual factories do not independently decide which enterprise WorkOrder should happen next.

What the factory owns

A selected factory receives a bounded WorkOrder and owns execution inside that boundary:

WorkOrder → Factory Version → Execution Profile → Supervisor → Tasks → Agents/Harnesses → Candidate → Local Verification

The factory returns its result and evidence to Mission Control.

Most important line

“Factories execute nodes. Mission Control owns the graph.”

Key distinction

Cross-factory orchestration belongs to Mission Control. Intra-factory orchestration belongs to the Factory Supervisor.

Transition

“Once a WorkOrder becomes runnable, Mission Control still has another decision to make: which exact qualified Factory Version is best suited to execute it?”







I would use three layers of selection

1. Intent classification. What outcome is the builder asking for? Feature development, bug repair, modernization, security remediation, dependency upgrade, test improvement, documentation, migration, etc.

2. Eligibility filtering. Which factories are actually authorized for this repository and workload? Mission Control filters by language, repo characteristics, data classification, environment, permissions, regulatory constraints, required capabilities, available execution backends, and organizational policy.

3. Empirical routing. Among the eligible factories, which qualified version performs best for this workload? Now you’re using the routing challenge you discussed with Shibu:

Route Score =

Quality

+ Historical Success

+ Verification Pass Rate

+ Capability Fit

+ Context Fit

+ Reliability

+ Latency

+ Economics

- Risk
and for enterprise scale, you can make the experience even simpler by exposing entry points rather than factories:

Build

Fix

Upgrade

Secure

Test

Migrate

Investigate

A builder clicks Upgrade, describes the desired outcome, and Mission Control handles the factory resolution underneath.

The architecture then becomes:

UILDER

   │

   │ "Upgrade payments to Java 21"

   ▼

INTENT

   │

   ▼

WORKLOAD CLASSIFICATION

   │

   ├─ repository characteristics

   ├─ risk

   ├─ policy

   ├─ permissions

   ├─ required capabilities

   └─ complexity

   │

   ▼

FACTORY ROUTER

   │

   ▼

ELIGIBLE FACTORY VERSIONS

   │

   ▼

EMPIRICAL QUALIFICATION

   │

   ▼

BEST FACTORY + PROFILE

   │

   ▼

GOVERNED PLAN

   │

   ▼

WORKORDER → TASKS → ATTEMPTS


“At enterprise scale, factory selection becomes a routing problem, not a navigation problem. Builders should express intent; the platform should determine the safest and best-qualified factory composition capable of delivering that intent.”

Intelligence recommends the route. Governance defines the allowable routes.

Exactly. And this is where the architecture becomes much more interesting: a builder’s objective should not be constrained to one factory.

For a large objective, the system should decompose the objective into governed WorkOrders and route each WorkOrder—or major task group—to the best-qualified factory.

The builder owns the objective. The platform owns the decomposition and routing proposal. Factories own specialized execution

BUILDER OBJECTIVE

"Modernize our payments platform to Java 21,

remediate vulnerabilities, improve coverage,

and deploy safely."

             │

             ▼

      OBJECTIVE PLANNER

             │

             ▼

      GOVERNED PROGRAM PLAN

             │

     ┌───────┼────────┬───────────┐

     ▼       ▼        ▼           ▼

 MODERNIZE  SECURE    TEST       DELIVERY

     │       │        │           │

     ▼       ▼        ▼           ▼

Factory A  Factory B Factory C  Factory D

     │       │        │           │

     └───────┴────┬───┴───────────┘

                  ▼

          INTEGRATED EVIDENCE

                  │

                  ▼

         OBJECTIVE VERIFICATION

                  │

                  ▼

             HUMAN AUTHORITY

                  │

                  ▼

                RELEASE

                  │

                  ▼

               OUTCOME






I wouldn’t make a “super factory” that contains everything.

I’d introduce a layer above factories:

Objective → Governed Program Plan → WorkOrders → Factory Routing → Execution

For example, the builder says:

“Modernize our customer identity platform to Java 21, eliminate critical vulnerabilities, get test coverage above 85%, and migrate it without downtime.”


The planner might produce:

￼

But these aren’t seven independent agents running around doing whatever they want. The Plan contains the dependency graph:
WO-101 Analyze
     │
     ▼
WO-102 Modernize
     │
     ├───────────────┐
     ▼               ▼
WO-103 Secure    WO-104 Tests
     │               │
     └───────┬───────┘
             ▼
       WO-105 Verify
             │
             ▼
       WO-106 Deploy
             │
             ▼
       WO-107 Validate

That graph is extremely important because factories shouldn’t orchestrate each other ad hoc.

Mission Control should orchestrate the objective.

This gives you three levels of routing

This is probably the cleanest way to explain the architecture.

Level 1 — Objective Routing

“What capabilities/factories are required to accomplish this objective?”

Intent
  ↓
Objective Planner
  ↓
Modernization + Security + Testing + Delivery


Level 2 — WorkOrder Routing

“Which qualified Factory Version should execute each WorkOrder?”
WO-103: Dependency remediation

              ↓

Factory Router

              ↓

security-remediation@4.7

Level 3 — Task/Capability Routing

“Inside that factory, which qualified execution resource should perform this particular task?”

Task

 ↓

Capability Router

 ↓

Skill + Harness + Model Route + Tool + Context

OBJECTIVE

    │

    ▼

OBJECTIVE PLANNING

    │

    ▼

┌─────────────────────────────┐

│ GOVERNED DEPENDENCY GRAPH   │

└─────────────────────────────┘

    │

    ▼

WORKORDERS

    │

    ▼

FACTORY ROUTING

    │

    ▼

FACTORY VERSIONS

    │

    ▼

TASKS

    │

    ▼

CAPABILITY ROUTING

    │

    ▼

ATTEMPTS

That’s a much more scalable model.

And the Plan becomes the contract

This connects directly to your Planner ≠ Plan principle.

The planner might be an intelligent agent. It can propose:

“I believe this objective requires four factories and seven WorkOrders.”

But once approved, the Plan becomes a durable governed artifact.

It contains things such as:


bjective

│

├── Acceptance Criteria

├── WorkOrders

├── Dependencies

├── Factory Requirements

├── Verification Requirements

├── Security Constraints

├── Budget

├── Time / SLA

├── Required Evidence

├── Human Decision Points

└── Release Conditions


The planner can disappear after producing it.

Mission Control can recover three days later and still know exactly what has to happen.

That’s why your distinction is powerful:

The planner is replaceable intelligence. The Plan is durable authority.

Factories should exchange artifacts, not conversations

I’d make this another architectural principle.

Factory A shouldn’t tell Factory B:

“Hey buddy, I changed these 37 files; can you take it from here?”

Instead:
Modernization Factory
       │
       ▼
Candidate Artifact
+ Evidence
+ Provenance
+ Verification State
       │
       ▼
MISSION CONTROL
       │
dependency satisfied
       ▼
Security Factory

he handoff itself becomes governed.

Mission Control knows:
Produced by:
modernization@5.3

Factory Version:
5.3.17

WorkOrder:
WO-102

Attempt:
A-004

Input SHA:
abc123

Output SHA:
def456

Verification:
PASS

Evidence:
EV-92837

Downstream authorized:
YES

Now Factory B receives a known artifact with provenance, not some mutable workspace left behind by another agent.

That matters enormously when you’re operating across thousands of repositories.

⸻

It also creates an important distinction: local vs global verification

Each factory verifies its own output:
Each factory verifies its own output: Modernization
 Producer → Candidate → Verifier → PASS

Security
 Producer → Candidate → Verifier → PASS

Testing
 Producer → Candidate → Verifier → PASS

But three locally correct outputs do not necessarily produce a globally correct system.

Therefore the objective needs an integration verification layer:

Factory A ── PASS ──┐
Factory B ── PASS ──┼──→ OBJECTIVE VERIFICATION
Factory C ── PASS ──┘             │
                                  ▼
                       Acceptance Criteria
                                  │
                                  ▼
                         HUMAN AUTHORITY

Now imagine 30,000 builders

This architecture becomes:

30,000 BUILDERS

                          │

                          ▼

                       INTENT

                          │

                          ▼

                  OBJECTIVE PLANNING

                          │

                          ▼

                  GOVERNED PLAN GRAPH

                          │

             ┌────────────┼────────────┐

             ▼            ▼            ▼

          WorkOrder    WorkOrder    WorkOrder

             │            │            │

             ▼            ▼            ▼

         FACTORY       FACTORY       FACTORY

         ROUTER        ROUTER        ROUTER

             │            │            │

             ▼            ▼            ▼

        Factory V      Factory V     Factory V

             │            │            │

             ▼            ▼            ▼

         Capability    Capability    Capability

          Routing       Routing       Routing

             │            │            │

             ▼            ▼            ▼

          Attempts      Attempts      Attempts

             │            │            │

             └────────────┼────────────┘

                          ▼

                       EVIDENCE

                          │

                          ▼

                OBJECTIVE VERIFICATION

                          │

                          ▼

                    HUMAN AUTHORITY

                          │

                          ▼

                       RELEASE

                          │

                          ▼

                       OUTCOME

                          │

                          ▼

                       LEARNING

And here’s the line I think would land particularly well in your Adobe discussion:

“A sufficiently large builder objective shouldn’t select a factory—it should compile into a governed execution graph. The platform decomposes intent into WorkOrders, routes each WorkOrder to an empirically qualified Factory Version, manages dependencies and artifact handoffs, independently verifies local and global outcomes, and preserves human authority over consequential transitions.”

That changes the mental model from:

“Which coding agent should I use?”

to:

“What governed system of specialized factories should Mission Control compose to achieve this business objective?”

And that, in my view, is where Meta Factory becomes the right term: the Meta Factory isn’t another factory. It’s the system that plans, qualifies, routes, orchestrates, governs, observes, and learns across the factories.
