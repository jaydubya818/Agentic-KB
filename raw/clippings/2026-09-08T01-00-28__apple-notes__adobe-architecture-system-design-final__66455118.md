---
title: "ADOBE — ARCHITECTURE & SYSTEM DESIGN - final"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p8552
captured_at: 2026-09-08T01:00:28.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: 6645511853b6f99c8a069c83d6e29feecf41ebafc03d7d879db21586629d7b29
---

ADOBE — ARCHITECTURE & SYSTEM DESIGN - final 


Vikram Sethi + Jeffrey Mott / Lalit Mathwani / Mike Gardner | 45 Minutes

⸻

0. WHAT THIS ROUND IS REALLY TESTING
They are not testing whether you can name 25 AI components.
They are testing whether you can:
Take an ambiguous enterprise problem and establish requirements.
Design for Adobe scale: thousands of builders, 100K+ repositories, polyglot environments.
Draw clear architectural boundaries.
Reason about distributed systems, not just agents.
Handle security, identity, authority, isolation, failure, recovery, and state.
Understand AI economics / tokenomics.
Explain how autonomous software is verified and trusted.
Make strong build vs. adopt decisions.
Know what to build now vs. later.
Defend your design through explicit tradeoffs.
The impression you want to leave
“Jay understands that models are only one component of an enterprise autonomous system. He understands state, distributed execution, security, verification, evidence, authority, reliability, economics, and platform evolution.”

⸻

1. YOUR UNIVERSAL SYSTEM-DESIGN FRAMEWORK
Never immediately start drawing boxes.
Open with:
“Before I draw the architecture, I want to clarify the builder, desired outcome, first workflows, expected scale, trust boundaries, autonomy level, and success criteria, because those decisions should drive the design.”
Then work through:
Requirements → Scale → Trust → Interfaces → Architecture → State → Security → Reliability → Verification → Economics → Tradeoffs → Rollout
Questions to ask first
Pick 3–5:
Who is the builder?
What exact outcome are we producing?
Interactive or long-running delegated work?
How many builders / repositories / concurrent executions?
What systems can the agent touch?
What data classifications are involved?
What actions may have real-world side effects?
What autonomy level is expected?
What latency/SLO matters?
How do we determine success?
Key line
“The architecture should follow the workload, not the other way around.”

⸻

2. THE ARCHITECTURE TO KEEP IN YOUR HEAD
                         BUILDER
                            │
                 Intent + Constraints
                 + Acceptance Criteria
                            │
                            ▼
                    GOVERNED PLAN
                            │
                            ▼
                 OBJECTIVE / FACTORY ROUTER
                            │
                            ▼
                  CAPABILITY ROUTER
                            │
                            ▼
                DURABLE ORCHESTRATION
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
          CONTEXT         HARNESS       TOOLS
              │             │             │
              └─────────────┼─────────────┘
                            ▼
                     SECURE SANDBOX
                            │
                            ▼
                       EXECUTION
                            │
                            ▼
                 VERIFICATION PLANE
          Tests | Security | Policy | Evals
                            │
                            ▼
                         EVIDENCE
                            │
                            ▼
                  AUTHORITY / APPROVAL
                            │
                            ▼
                    DELIVERY / CI-CD
                            │
                            ▼
                         OUTCOME
                            │
                            ▼
                         LEARNING
                            │
                            ▼
                 CANDIDATE IMPROVEMENT
                            │
                            ▼
                  EVAL + PROMOTION GATE
Across everything:
CONTROL PLANE → Identity | Policy | State | Budgets | Scheduling | Qualification | Observability | Audit | Lifecycle
Supporting intelligence:
ENTERPRISE CONTEXT → Repository Intelligence | Organizational Knowledge | Runtime Evidence

⸻

3. META FACTORY IN ONE SENTENCE
“Meta Factory is the governed enterprise substrate that turns builder intent into independently verified, evidence-backed software outcomes using replaceable models, agents, tools, and execution capabilities.”
Short version:
“Meta Factory turns builder intent into trusted software outcomes.”
And:
“A harness executes an agent. Meta Factory governs the work.”

⸻

4. YOUR 2-MINUTE “DESIGN META FACTORY” ANSWER
“I’d start with the builder and desired outcome rather than the model or agent framework. The builder expresses an objective, constraints, and acceptance criteria without needing to know which model, agent, skill, tool, or MCP capability should execute the work.

A planner converts that intent into a durable governed plan containing work decomposition, dependencies, budgets, acceptance criteria, verification requirements, and authority boundaries.

An objective router determines the appropriate factory or factories, and capability routing selects qualified models, agents, skills, and deterministic tools based on workload requirements, security, historical quality, latency, reliability, and economics.

Durable orchestration owns workflow state, leases, checkpoints, retries, recovery, cancellation, and escalation. Context intelligence supplies permission-aware repository and enterprise knowledge with provenance.

Agents execute in ephemeral sandboxes with bounded repository, filesystem, tool, credential, network, compute, time, and token authority.

A separate verification plane combines deterministic tests, security, policy checks, semantic evaluation, and independent review. Verification produces evidence mapped back to the original acceptance criteria.

Human or deterministic policy authority determines whether consequential actions such as merge or deployment can proceed.

Production outcomes then feed evaluation and learning. The factory can propose improvements to routing, skills, prompts, tools, context, and verification, but those changes become candidates and must qualify against the current baseline before promotion.

So the core architecture separates reasoning, execution, verification, authority, and learning.”
Final line
“Models reason. Agents act. Verification establishes evidence. The control plane governs authority.”

⸻

5. THE 15 QUESTIONS TO STUDY HARDEST
￼
⸻

6. CONTROL PLANE
Question
“What belongs in the control plane?”
“Identity, authorization, policy, admission, scheduling, durable workflow state, leases, budgets, capability qualification, lifecycle controls, approvals, telemetry, evidence references, and audit history.

Actual model reasoning and code execution happen underneath it in disposable workers.

A failed agent cannot be authoritative for its own permissions, budget, state, or success.”
Key lines
“The worker performs the work. The control plane owns the truth.”
“The system governing the agent must remain healthy when the agent itself is unhealthy.”

⸻

7. CONTROL PLANE VS. EXECUTION PLANE
“I don’t want probabilistic execution owning its own governance.

The control plane is authoritative and durable.

The execution plane is disposable.

Workers receive bounded authority, execute, produce artifacts/evidence, and disappear.

I should be able to kill or replace the worker without losing the workflow.”
Tradeoff
Choice: durable state outside workers. Benefit: recovery, replaceability, security. Cost: coordination and persistence complexity.

⸻

8. PLANNER ≠ PLAN
“The planner may be probabilistic, model-dependent, and replaceable.

The plan becomes a durable governed artifact containing dependencies, constraints, acceptance criteria, verification requirements, budgets, and authority boundaries.

Material changes create an explicit plan revision rather than invisible model behavior.”
Key line
“The planner can be probabilistic. The plan should be governed.”

⸻

9. AGENT HARNESS
“I think of the harness as where probabilistic reasoning meets deterministic control.

The model proposes actions.

The harness manages context, tools, execution loop, state integration, checkpoints, recovery, retries, budgets, evidence hooks, observability, and escalation.

But enterprise identity and ultimate authority remain outside the model.”
Key line
“Models reason. The harness controls.”

⸻

10. SHOULD ADOBE BUILD ITS OWN HARNESS?
Do not automatically argue yes.
“I’d benchmark commercial and open capabilities against Adobe workloads first.

Generic coding, planning, tool use, and orchestration are rapidly commoditizing.

Adobe’s differentiation is much more likely to be Builders Experience, enterprise context, secure execution, repository intelligence, evaluation, policy, evidence, learning, and integration with Adobe’s engineering ecosystem.

My preference is an Adobe-owned control boundary around replaceable underlying capabilities.”
Key lines
“Adopt commodity. Build differentiation.”
“Proprietary should be an outcome of differentiation, not an architectural preference.”

⸻

11. CAPABILITY ROUTING — HIGH PRIORITY
Do not describe only a “model router.”
Two phases
1. Eligibility
Hard constraints:
Security / data classification
Workload support
Required tools
Context capacity
Latency requirement
Reliability threshold
Model/provider policy
Geographic requirements
2. Optimization
Among eligible capabilities compare:
Historical task success
Eval performance
Verification success
Retries
Latency
Availability
Cost
“I separate eligibility from optimization. Hard constraints define which capabilities are allowed. Empirical evidence determines which eligible capability is best.”
Key lines
“Hard constraints first. Optimization second.”
“Route work to capabilities, not automatically to intelligence.”

⸻

12. TOKENOMICS — HIGH PRIORITY
Shibu explicitly told you this matters.
Do not stop at:
“Use smaller models for easier work.”
Say:
“I wouldn’t optimize for cost per token. I’d optimize for cost per accepted outcome.”
Cost per accepted outcome includes
Model inference
Context
Retries
Sandbox compute
Tools
Verification
Human correction
Attack economics through
Routing — strongest capability required, not strongest available.
Context efficiency — minimum sufficient context.
Determinism — compilers/tools instead of inference.
Caching — stable prompts/context/builds.
Loop efficiency — stop useless retries.
Task decomposition — expensive reasoning only where needed.
Verification economics — verification proportional to risk.
Killer line
“Cheap attempts are irrelevant if they produce expensive outcomes.”

⸻

13. SECURE REMOTE EXECUTION — PROBABLY THE MOST IMPORTANT TECHNICAL TOPIC
Prompt:
“How would you safely allow 15,000 Adobe engineers to delegate coding work to remote agents?”
Your architecture:
Identity → Execution Profile → Ephemeral Sandbox → Scoped Context → Scoped Tools → Short-Lived Credentials → Restricted Egress → Resource Limits → Evidence → Teardown
Each execution gets
Task-specific identity
Immutable execution manifest
Exact repository scope
Branch/worktree scope
File scope where justified
Explicit tools
Short-lived credentials
Network allowlist
CPU / memory / disk
Time limit
Token / cost budget
Retry limits
Audit
Artifact capture
Kill switch
Automatic teardown
“Successful code generation should not automatically create publication, merge, or production authority.”
Killer line
“The sandbox should bound authority, not just compute.”

⸻

14. AUTHORITY MODEL
The agent should not inherit everything the builder can do.
“Builder authority is the ceiling. Task authority should usually be smaller.”
Use:
Initiating User Identity + Workload Identity + Policy + Risk → Task-Specific Authority
Important distinctions
Read ≠ write
Write ≠ publish
Publish ≠ merge
Merge ≠ deploy
Deploy ≠ production-admin authority
Key lines
“Capability does not imply permission.”
“Agents can request authority. They cannot manufacture authority.”
“Writing code and publishing code are different authorities.”

⸻

15. PROMPT INJECTION
“I assume repository content is untrusted input.

README files, comments, test fixtures, issues, dependencies, or tool output may contain malicious instructions.

Retrieved information can influence reasoning but cannot create authority.

Policy, secrets, network access, and tool permissions remain external.”
Defense
Untrusted content labeling
Provenance
Scoped context
Least privilege
Restricted egress
Tool authorization
Short-lived credentials
Output scanning
Independent verification
Key line
“Prompt injection is primarily an architecture and authority problem, not merely a prompt-engineering problem.”

⸻

16. DURABLE EXECUTION — HIGH PROBABILITY
Prompt:
“Worker dies halfway through a two-hour task. What happens?”
Answer:
Worker acquires lease → heartbeat → checkpoint → worker fails → lease expires → replacement worker acquires newer lease/fencing token → reconstructs state → resumes → stale worker cannot publish
“The control plane persists workflow state. Workers are disposable execution capacity.”
You must mention
Durable state
Leases
Heartbeats
Checkpoints
Idempotency
Fencing tokens
Replay semantics
Attempt-specific workspaces
Reconciliation
Key lines
“A lease makes ownership recoverable.”
“A stale worker may continue computing; it must not continue committing.”
“Exactly-once is usually a business invariant built on top of weaker delivery guarantees.”

⸻

17. WHAT STATE PERSISTS?
Separate:
￼
Key line
“Persist what the system needs to govern and recover—not everything the model happened to think.”

⸻

18. CONTEXT FOR 100,000+ REPOSITORIES
Do not say:
“Put the repositories into RAG.”
Say:
“Context needs to be structural, hierarchical, permission-aware, provenance-backed, and workload-specific.”
Layered context
Adobe-wide
Security policy
Engineering standards
Shared architectural principles
Product/domain
Language/framework rules
Product architecture
Shared libraries
Known failure patterns
Repository
CODEOWNERS
Instructions
ADRs
Build graph
Dependencies
Tests
History
Incidents
Review patterns
Task
Relevant symbols
Changed files
Exact baseline
Acceptance criteria
Retrieval methods
Lexical search
Symbol index
Dependency graph
Code graph
Metadata
Semantic search
Runtime topology
Historical changes
Key lines
“Standardize the platform. Specialize the context.”
“The objective isn’t maximum context. It’s minimum sufficient high-value context.”
“Retrievability is not authorization.”

⸻

19. RAG VS. FINE-TUNING VS. CPT
“Use the least irreversible mechanism that meets the quality bar.”
RAG
Best when knowledge is:
Dynamic
Permission-sensitive
Frequently changing
Revocable
Repository-specific
Fine-tuning
Potentially when:
Behavior is stable
Volume is high
Prompt/RAG repeatedly fail
Context cost is excessive
Evaluation shows persistent gain
Continual pretraining
Only when:
Corpus is large
Stable
Legally usable
Widely relevant
Measurable benefit justifies lifecycle complexity
Key line
“Training is an optimization, not the default answer to missing context.”

⸻

20. ADOBE-WIDE CODE REVIEW
Prompt:
“Design a code-review capability across 100,000 repositories.”
Start:
“I wouldn’t build one giant Adobe-specific model that understands every repository.”
Architecture:
Common platform
Model gateway
Security
Policy
Evaluation
Observability
Sandboxing
Review taxonomy
Product/domain specialization
Language
Framework
Architecture
Shared components
Repository specialization
CODEOWNERS
Local instructions
Tests
Dependencies
Historical accepted findings
Prior changes
Conventions
Incidents
Flow
PR → Impact Analysis → Context Assembly → Deterministic Checks → Semantic Review → Evidence → Findings → Developer Feedback → Learning
Key line
“The platform stays common. The intelligence becomes progressively more specific.”

⸻

21. WHY NOT BUY A CODE REVIEWER?
This was a direct Shibu challenge.
“I wouldn’t assume Adobe should build the reviewer.

I’d benchmark commercial and open reviewers across Adobe’s actual repository distribution.

If an external reviewer provides excellent generic capability, adopt it and build Adobe’s differentiated context, policy, repository intelligence, evaluation, orchestration, security integration, and builder experience around it.

If representative evaluations expose a strategically important gap, then we have evidence to build.”
Key line
“Adopt commodity. Build differentiation.”

⸻

22. REPOSITORY LEARNING
Memorize this distinction:
MEMORY
Retrieve historical repository information.
LEARNING
Analyze:
Accepted/rejected findings
Human corrections
Merged changes
Incidents
Rollbacks
Review behavior
Verification failures
CANDIDATE IMPROVEMENT
Propose changes to:
Skills
Prompts
Retrieval
Routing
Policies
Evaluations
PROMOTION
Candidate vs. current baseline.
Key line
“Learning changes candidates. Promotion changes production.”
And:
“Learning can be autonomous. Promotion should be governed.”

⸻

23. VERIFICATION — CORE ARCHITECTURAL DIFFERENTIATOR
Prompt:
“How do you know AI-generated code is correct?”
Do not answer:
“Run tests.”
Use layered verification.
Deterministic
Compile
Lint
Types
Unit tests
Integration
Static analysis
Security scanning
Policy
Schema/contracts
Semantic
Requirement alignment
Architecture
Maintainability
UX/design
Code review
Dynamic
Preview
Runtime tests
Performance
Load
Accessibility
Chaos where appropriate
Independent
Separate verifier
Alternative context
Alternative model
Adversarial review
Human authority
Key lines
“Generation scales output. Verification scales trust.”
“The producer should not be the sole judge of its own work.”
“Code and tests agreeing is not the same as the outcome being correct.”

⸻

24. INDEPENDENT VERIFICATION
If asked:
“Why not just use another LLM?”
Say:
“Independence is about failure-mode diversity, not model count.”
Possible independence:
Deterministic tests
Different acceptance derivation
Static analyzers
Security scanners
Different models
Different context
Adversarial testing
Human judgment
Key line
“Redundancy without failure-mode diversity is not independence.”

⸻

25. EVIDENCE PLANE
Evidence should answer:
What was requested?
What plan executed?
Which factory version?
Which model/tool/skill versions?
What context/provenance?
What actions happened?
What changed?
Which tests ran?
Which security checks ran?
What evaluations passed?
What authority approved progression?
What did it cost?
What happened in production?
Think:
Claim → Evidence
Example:
Claim: “Authentication behavior remains correct.” Evidence: unit + integration + policy + security + runtime tests.
Key lines
“The artifact becomes a set of claims backed by evidence.”
“Don’t let the claimant manufacture the proof.”

⸻

26. HUMAN AUTHORITY
Do not say human approval everywhere.
Say:
“Authority should be risk-tiered.”
Consider:
Risk
Consequence
Reversibility
Verification strength
Security
Privilege
Blast radius
Uncertainty
Examples
Documentation → high autonomy. Unit-test generation → high autonomy. Normal feature → autonomous implementation + review. Authentication change → stronger human authority. Database migration → strong verification + explicit authority.
Key lines
“Human-in-the-loop should mean human authority, not human ceremony.”
“Autonomy is earned through evidence.”

⸻

27. ONE FACTORY OR MULTIPLE FACTORIES?
Your answer:
“Adobe generally needs one enterprise Meta Factory platform. On top of it, there can be multiple independently governed factory definitions only where outcomes materially differ in ownership, qualification, policy, authority, or lifecycle.”
Example platform:
Identity + Model Gateway + Capability Registry + Context + Orchestration + Sandboxes + Verification + Evidence + Observability
Possible factories:
Software Delivery Factory
Modernization Factory
Security Remediation Factory
Operational/Incident Factory
Key line
“One enterprise platform; multiple governed factory definitions only where the outcome requires them.”

⸻

28. HOW FACTORIES SHARE AGENTS
“Factory count and agent count are independent.

Agents, skills, models, tools, and evaluators are reusable capabilities in a shared registry.

Different factories compose those capabilities under different workflows and governance.”
Key line
“Factories compose capabilities. They don’t duplicate them.”

⸻

29. THREE LEVELS OF ROUTING
This is a strong differentiator.
Level 1 — Objective Routing
Which factory/factories satisfy the builder objective?
Level 2 — Work-Order Routing
Which qualified Factory Version should execute this unit of work?
Level 3 — Task Routing
Which model, agent, skill, or deterministic tool performs the task?
Objective
   ↓
Factory
   ↓
Qualified Factory Version
   ↓
Work Order
   ↓
Model / Agent / Skill / Tool
Key line
“Route the objective to factories, work to qualified versions, and tasks to capabilities.”

⸻

30. CROSS-FACTORY ORCHESTRATION
If multiple factories are needed:
“Factories should not directly orchestrate each other.

An objective-level orchestrator owns the dependency graph, routes work orders to qualified factories, receives artifacts/evidence, and determines aggregate completion.”
Key line
“The objective orchestrator composes factory outcomes. Factories do not orchestrate each other.”

⸻

31. FACTORY VERSION
Anything changing behavior should be versioned:
Models
Agents
Prompts
Skills
Tools
MCP schemas
Policies
Retrieval configuration
Evaluators
Workflow
Execution images
Routing
Verification
But production should route to an:
Immutable Qualified Factory Version
Key line
“Components evolve independently. Production executes a qualified composition.”

⸻

32. FACTORY VERSION VS. EXECUTION PROFILE
Factory Version
What behavior has been qualified?
Workflow
Capabilities
Models
Skills
Tools
Policies
Verification
Routing
Execution Profile
Under what operational envelope may it execute?
Sandbox type
CPU/memory
Network
Credentials
Repo scope
Time
Tokens
Cost
Retry limits
Authority
Key line
“Factory Version defines qualified behavior. Execution Profile defines the bounded operating envelope.”

⸻

33. OBSERVABILITY
Instrument:
Intent → Plan → Routing → Context → Model → Tools → State → Artifacts → Verification → Authority → Delivery → Outcome
Platform
API availability
Queue depth
Scheduling latency
Sandbox provisioning
Model availability
Tool errors
Recovery
State failures
Agent
Task success
Retries
Stuck loops
Context quality
Tool-selection accuracy
Correction
Escalation
Economics
Tokens
Sandbox
Tools
Verification
Human correction
Cost per accepted outcome
Builder
Time to first accepted outcome
Cycle time
Repeat usage
Satisfaction
Manual effort removed
Key line
“Evaluation tells me whether it worked. Observability tells me why.”

⸻

34. SLOs
Separate:
Infrastructure SLO
Availability
Job acceptance
Scheduling latency
State durability
Sandbox provisioning
Model gateway
Tool availability
Behavioral / Quality Objective
Accepted outcomes
Verification pass
Human correction
Policy compliance
Defect escape
Cost per accepted outcome
Key line
“Availability tells me whether the factory ran. Evaluation tells me whether it worked.”

⸻

35. BACKPRESSURE & CONCURRENCY
At Adobe scale:
Admission Control → Durable Queue → Scheduler → Worker Fleet
Admission considers:
Organization quota
Workload class
Priority
Budget
Policy
Provider capacity
Define workload classes:
Interactive coding
PR review
Background development
Large modernization
Security remediation
Key lines
“The goal isn’t maximum throughput. It’s predictable service under contention.”
“Overload should create controlled queuing and degradation, not cascading failure.”

⸻

36. ROUTER VS. SCHEDULER
Router
What capability should do the work?
Optimizes:
Quality
Security
Latency
Reliability
Economics
Scheduler
When and where should work run?
Optimizes:
Capacity
Priority
Quotas
Compute
Data locality
Deadlines
Key line
“Routing selects capability. Scheduling allocates execution.”

⸻

37. QUEUE / KAFKA / TEMPORAL QUESTION
Do not jump to technology.
Say:
“I’d choose semantics before technology.”
Clarify whether you need:
Work queue
Event stream
Workflow engine
Or combination
Questions:
Delivery guarantee?
Ordering?
Replay?
Ownership?
Leases?
Timers?
Human pauses?
Backpressure?
Long-running workflows?
Key line
“The architectural question isn’t Redis versus Kafka. It’s what delivery, ordering, ownership, durability, and replay guarantees we require.”

⸻

38. AGENT STUCK / INFINITE LOOP
Controls:
Token budget
Time budget
Cost budget
Tool-call count
Iteration count
Progress detection
Circuit breakers
Retry classification
Strategy change
Reroute
Escalation
Key lines
“Activity is not progress.”
“Recovery should change information or strategy, not merely repeat failure.”
“The agent should never decide whether it has spent too much money.”

⸻

39. FAILURE FRAMEWORK
For every component ask:
“What happens if this fails halfway through?”
￼
This question alone will make you sound much stronger.

⸻

40. SECURITY FRAMEWORK
For every component ask:
“What authority does this component actually need?”
Reduce:
Repository
Branch
Filesystem
Tools
Credentials
Network
Compute
Time
Tokens
Cost
Publication
Merge
Deployment
Production
Key line
“Limit authority before you need containment.”

⸻

41. VERIFICATION FRAMEWORK
For every acceptance claim ask:
“What evidence would convince me this claim is true?”
￼
⸻

42. TRADEOFF LANGUAGE
Always explicitly articulate the tradeoff.
Use:
“I’m choosing X because Y. The cost is Z.”
Examples:
“I’m choosing ephemeral remote sandboxes for stronger isolation and reproducibility. The cost is startup latency and compute expense.”
“I’m keeping durable state outside workers because it gives us recovery and replaceability. The cost is additional coordination complexity.”
“I’d start with deterministic routing because it’s easier to understand and qualify. The cost is leaving some economic optimization on the table.”
“I’d start with retrieval before fine-tuning because it’s easier to update and revoke. The cost is inference-time context overhead.”

⸻

43. BUILD VS. ADOPT
Use this decision framework:
Strategic differentiation
Adobe-specific requirements
Quality on representative Adobe workloads
Security/compliance
Integration effort
Extensibility
Portability
Operational burden
Economics
Market evolution
Replacement cost
Key line
“Build where ownership creates advantage. Adopt where ownership creates maintenance.”

⸻

44. WHAT WOULD YOU BUILD FIRST?
“I would not build the entire architecture upfront.”
V1
Choose 3–5 high-value builder journeys and a small design-partner cohort.
Build:
Authenticated intent
Governed plan
Small capability registry
1–2 model routes
Permission-aware context
Durable workflow state
Secure remote execution
Deterministic verification
Evidence
Human authority
End-to-end observability
Reuse:
Source control
CI/CD
Identity
Compute
Security tooling
Policy systems
Key lines
“Prove the lifecycle before expanding the surface area.”
“Earn the platform through repeated workload evidence.”

⸻

45. WHAT NOT TO BUILD FIRST
Avoid:
Proprietary foundation model
Universal proprietary harness
Massive multi-agent hierarchy
Fine-tuned model per repository
Replacement CI/CD platform
Giant universal RAG system
Sophisticated ML router before evidence
Hundreds of hypothetical abstractions
Key line
“Don’t platform hypothetical reuse.”

⸻

46. 90-DAY ANSWER
“First, identify 3–5 representative builder journeys and establish baselines for quality, cycle time, cost, and pain.

Second, inventory Adobe’s existing agents, model access, context systems, sandboxes, evaluation, developer infrastructure, and commercial tools.

Third, establish the minimum common substrate: identity, governed model access, secure execution, capability registration, context, evaluation, evidence, and observability.

Fourth, prove one workflow completely from intent to accepted production outcome.

Then use real workload evidence to determine which pieces deserve platform investment.”
Key line
“Prove one complete operating loop before scaling the architecture.”

⸻

47. ROLLOUT
Design Partners → Paved Path → Cohorts → Canary → Broader Adoption
Metrics:
Time to first accepted outcome
Accepted outcome rate
Cycle time
Human correction
Defect escape
Cost per accepted outcome
Reliability
Builder satisfaction
Capability reuse
Key line
“Adoption should follow demonstrated value, not platform mandate.”

⸻

48. FORWARD-DEPLOYED ENGINEERS
If FDE comes up:
“FDEs should be a product-learning mechanism rather than a permanent services organization.

They work directly with builder teams, implement real workflows, discover where the platform fails reality, then convert repeated local solutions into reusable platform capabilities.”
Key line
“Build with customers, not merely for customers.”

⸻

49. CENTRALIZE VS. FEDERATE
Centralize
Identity
Policy
Model access
Capability registry
Secure execution
Durable orchestration
Evidence contracts
Common observability
Evaluation machinery
Federate
Repository context
Domain knowledge
Specialized skills
Acceptance criteria
Product workflows
Repository verification
Key line
“Centralize invariants. Federate expertise.”

⸻

50. MODEL-OUTAGE ANSWER
“The capability registry should know which alternatives are already qualified for the workload.

Depending on workload, we can fail over, queue, degrade, or stop.

I would never automatically switch a high-risk workflow to an unevaluated model merely because it is available.”
Key line
“Availability does not override the quality or policy bar.”

⸻

51. MODEL UPGRADE ANSWER
“I don’t treat a model name as a stable behavioral contract.

Model identity is a versioned dependency.

Candidate version → representative eval → compare quality/security/latency/cost/tool behavior → shadow/canary → promotion → rollback available.”
Key line
“A model upgrade is a production change, not a procurement event.”

⸻

52. MCP
“MCP provides interoperability between models/agents and tools or context. It doesn’t solve enterprise governance.”
Meta Factory still needs:
Ownership
Versioning
Permission
Qualification
Evaluation
Revocation
Audit
Key line
“MCP standardizes connectivity. It doesn’t outsource governance.”

⸻

53. CAPABILITY REGISTRY
Registry should contain:
Identity
Owner
Version
Supported workloads
Input/output contracts
Permissions
Security classification
Cost
Latency
Reliability
Eval results
Qualification status
Dependencies
Deprecation state
Key lines
“Discovery tells me what exists. Qualification tells me what I’m willing to trust.”
“Registration makes a capability visible. Qualification makes it routable.”

⸻

54. MULTI-AGENT
“Use multiple agents only when separation creates architectural value.”
Good reasons:
Different permissions
Different tools
Specialized context
Parallel work
Independent verification
Separation of responsibility
Bad reason:
Because a five-agent diagram looks sophisticated.
Key line
“Multi-agent architecture should solve complexity in the task, not create complexity in the platform.”

⸻

55. SUPERVISOR AGENT VS WORKFLOW ENGINE
“I want the model making decisions requiring reasoning.

I want the workflow engine enforcing lifecycle invariants.”
Model may decide:
Decomposition
Strategy
Capability request
Recovery strategy
Runtime owns:
Authorization
State transitions
Budgets
Leases
Timeouts
Approvals
Release policy
Key line
“Reasoning decides what should happen next. Runtime and policy decide what is allowed to happen next.”

⸻

56. DETERMINISTIC VS. AGENTIC
Agentic
Use for:
Ambiguity
Planning
Interpretation
Diagnosis
Semantic analysis
Synthesis
Deterministic
Use for:
Compilation
Schema validation
Tests
Authorization
Security policy
Known API actions
Resource enforcement
Key line
“Use intelligence for ambiguity. Use determinism for invariants.”

⸻

57. LONG-RUNNING TASKS
“I would not model a six-hour migration as one giant conversation.”
Use:
DAG
Work units
Checkpoints
External durable state
Reconstructed context
Task budgets
Objective budgets
Pause/resume
Human intervention
Key line
“Long-running autonomy should be durable workflow, not a long-running chat.”

⸻

58. CANCEL / TAKEOVER
Cancellation:
“Cancellation is a governed state transition.”
Stop new scheduling
Signal workers
Revoke credentials
Preserve artifacts/evidence
Compensate external side effects
Reconcile
Human takeover:
Pause agent
Transfer mutation authority
Preserve state
Human modifies candidate
Invalidate affected evidence
Reverify
Key line
“Human takeover should transfer authority, not create concurrent ownership.”

⸻

59. AUTONOMY MATURITY
Think workload-specific levels:
L0 Recommendation L1 Candidate generation L2 Autonomous execution + mandatory acceptance L3 Low-risk autonomous progression after verification L4 Broad autonomous delivery, humans on exceptions/high-risk work
Key line
“Autonomy is a property of a qualified workload, not a marketing label for the platform.”

⸻

60. THE 10 DISTINCTIONS TO MEMORIZE
Planner ≠ Plan Planner is probabilistic; plan is governed.
Capability ≠ Authority Ability does not imply permission.
Context ≠ State ≠ Memory Context informs reasoning; state governs execution; memory informs future reasoning.
Agent ≠ Harness ≠ Factory Agent works; harness governs execution; factory governs outcomes.
Model Routing ≠ Capability Routing The best executor may not be an LLM.
Generation ≠ Verification Generation scales output; verification scales trust.
Confidence ≠ Trust Confidence is a model property; trust is a system property.
Learning ≠ Promotion Learning proposes; governance promotes.
Task Success ≠ Objective Success Successful work units can still fail the objective.
Availability ≠ Correctness The platform can function perfectly while producing a wrong result.

⸻

61. THE 18 LINES TO MEMORIZE
“Builders define the what. The factory determines the how.”
“The planner can be probabilistic. The plan should be governed.”
“Models reason. The control plane governs.”
“Capability does not imply permission.”
“The sandbox should bound authority, not just compute.”
“The producer should not be the sole judge of its own work.”
“Generation scales output. Verification scales trust.”
“Confidence is a model property. Trust is a system property.”
“Human-in-the-loop should mean human authority, not human ceremony.”
“Learning can be autonomous. Promotion should be governed.”
“Optimize for cost per accepted outcome, not cost per token.”
“Use intelligence for ambiguity. Use determinism for invariants.”
“Centralize invariants. Federate expertise.”
“Adopt commodity. Build differentiation.”
“A stale worker may continue computing; it must not continue committing.”
“The model can propose done. The system determines whether done is true.”
“The architecture should get simpler as models get better.”
“Build for a moving boundary.”

⸻

62. WHEN THEY SAY “GO DEEPER”
Use:
PURPOSE → CONTRACT → STATE → FAILURE → SECURITY → SCALE → TRADEOFF
Example: Router
“The router’s purpose is selecting a qualified capability for the workload. Inputs include task characteristics, policy, capability metadata, evaluation performance, availability, and economics. Hard constraints determine eligibility, then optimization ranks the remaining choices. The decision and outcome become observable state. Failure can use only prequalified fallbacks. Security is a hard eligibility constraint. I’d start with deterministic policies and evolve toward empirical routing as evidence accumulates. The tradeoff is optimization value versus routing complexity.”
Apply this pattern to any box they select.

⸻

63. IF THEY INTERRUPT YOU
That’s good.
Follow them.
If they ask about leases:
Acquire → Heartbeat → Checkpoint → Expire → Reassign → Fencing Token → Reject Stale Publication
If they ask about capability registry:
Discovery → Owner → Version → Contract → Permissions → Qualification → Eval History → Routing → Dependency → Revocation
If they ask about sandboxing:
Identity → Manifest → Isolation → Repository Scope → Credentials → Egress → Resource Limits → Audit → Teardown
If they ask about verification:
Acceptance Criteria → Deterministic → Semantic → Independent → Evidence → Authority
Do not try to finish your memorized architecture.

⸻

64. YOUR WHITEBOARD STRATEGY
First 2–3 minutes:
Say
“Before I draw, I want to clarify the builder, outcome, scale, trust boundary, autonomy expectation, and success metric.”
Then draw only:
Builder Intent
      ↓
Governed Plan
      ↓
Route
      ↓
Durable Orchestration
      ↓
Context + Harness + Tools
      ↓
Secure Sandbox
      ↓
Execution
      ↓
Verification
      ↓
Evidence
      ↓
Authority
      ↓
Delivery
      ↓
Outcome
      ↓
Learning
Across top:
CONTROL PLANE
Identity | Policy | State | Budget | Scheduling | Observability | Audit
Stop.
Let them pick the drill-down.

⸻

65. 45-MINUTE INTERVIEW PACING
0–5 min — Requirements
Clarify persona, workflow, scale, trust, autonomy, metrics.
5–12 min — Core architecture
Draw only the main lifecycle.
12–30 min — Deep dive
Follow interviewer into:
Sandbox/security
Routing/tokenomics
Durable execution
Context
Verification
Scale
30–38 min — Failures + tradeoffs
Discuss:
Worker crash
Model outage
State failure
Overload
Security failure
Cost
38–43 min — Rollout
V1 → design partners → qualification → canary → scale.
43–45 min — Summary
Return to the architecture thesis.

⸻

66. THE ADOBE-SPECIFIC AREAS I WOULD PRIORITIZE TONIGHT
Tier 1 — Must be excellent
1. Secure Remote Execution
Because Shibu explicitly emphasized it.
2. Tokenomics / Dynamic Routing
Because he explicitly said the conversation has shifted to tokenomics.
3. Code Review Across 100K+ Repositories
Because he spent significant interview time challenging this.
4. Repository-Specific Context and Learning
Especially retrieval vs fine-tuning.
5. Durable Execution
Leases, checkpoints, recovery, idempotency.
6. Verification and Evidence
This differentiates your architecture from a generic agent platform.
Tier 2 — Be very comfortable
Control vs execution plane
Capability registry
Factory Versions
Execution Profiles
Human authority
Build vs adopt
Multi-factory routing
Observability/evals
Rollout strategy

⸻

67. RAPID FIRE — 20 SECOND ANSWERS
What is Meta Factory?
“A governed substrate turning builder intent into trusted software outcomes.”
Agent vs Factory?
“Agent performs work. Factory governs the complete outcome lifecycle.”
Harness vs Factory?
“Harness governs execution. Factory governs outcomes.”
Planner vs Plan?
“Planner is probabilistic. Plan is durable and governed.”
Context vs State?
“Context informs reasoning. State governs execution.”
Capability vs Authority?
“Being able to do something doesn’t mean the execution is permitted to do it.”
Why capability routing?
“Because the right executor may be a model, agent, deterministic tool, scanner, or human.”
North-star economic metric?
“Cost per accepted outcome.”
Main sandbox principle?
“Bound authority, not just compute.”
Main verification principle?
“The producer should not be the sole judge of its own work.”
Main learning principle?
“Learning can be autonomous. Promotion should be governed.”
Main human principle?
“Human-in-the-loop should mean human authority, not human ceremony.”
Main reliability principle?
“Authoritative workflow state must survive worker failure.”
Main security principle?
“Capability does not imply permission.”
Main context principle?
“Minimum sufficient high-value context.”
Main build-vs-buy principle?
“Adopt commodity. Build differentiation.”
Main future-proofing principle?
“Build for a moving boundary.”

⸻

68. YOUR CLOSING SUMMARY
If they ask:
“Okay Jay, summarize the architecture.”
Say:
“Turn builder intent into a governed plan; route work to qualified factories and capabilities; maintain durable state outside disposable workers; provide permission-aware context; execute in bounded environments; independently verify the outcome; preserve evidence; grant authority according to risk; deliver through existing engineering systems; observe the production outcome; and feed those outcomes into candidate improvements that must qualify before promotion.

The architecture deliberately separates reasoning, execution, verification, authority, and learning.

Models reason. Agents act. Verification establishes evidence. The control plane governs authority.”

⸻

FINAL MEMORY MAP
1. REQUIREMENTS
Who / outcome / workflows?

2. SCALE
Builders / repos / concurrency / latency?

3. TRUST
Data / credentials / side effects?

4. PLAN
DAG / acceptance / budgets / authority?

5. ROUTE
Which qualified factory/capability?

6. ORCHESTRATE
State / leases / retries / recovery?

7. CONTEXT
Minimum sufficient permission-aware context?

8. EXECUTE
Sandbox / bounded authority?

9. VERIFY
What proves correctness?

10. EVIDENCE
What supports each claim?

11. AUTHORITY
Who may progress the work?

12. DELIVER
CI/CD / progressive release?

13. OUTCOME
Did the objective actually succeed?

14. LEARN
What should improve?

15. PROMOTE
What evidence earns production authority?
YOUR MASTER ARCHITECTURE
Builder Intent → Governed Plan → Route → Orchestrate → Context → Execute → Verify → Evidence → Authority → Deliver → Outcome → Learn
Across everything:
Identity | Policy | State | Budget | Qualification | Observability | Audit
YOUR MASTER THESIS
“The more discretion we delegate to intelligence, the more explicit the architecture for state, authority, verification, evidence, and recovery needs to become.”
