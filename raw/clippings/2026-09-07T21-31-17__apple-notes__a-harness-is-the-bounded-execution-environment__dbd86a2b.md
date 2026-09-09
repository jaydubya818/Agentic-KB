---
title: "A harness is the bounded execution environment"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p8459
captured_at: 2026-09-07T21:31:17.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: dbd86a2bcce0f1b81163cc1064a9cd7b71ad5f7bd0b9c95ab3c1ad01b3f8fa4a
---

A harness is the bounded execution environment that turns model intelligence into a reliable capability.

But there are different kinds of harnesses, depending on what capability you are bounding.

The hierarchy I would use

￼

That distinction resolves probably 90% of what you’re reading.

⸻

1. The “harness is the while loop” article

It isn’t necessarily wrong. It’s just using harness in the narrowest possible sense.

Imagine:
while not done:

    load_context()

    decision = model.reason()

    action = select_tool(decision)

    result = execute(action)

    observe(result)

    evaluate_progress()

    update_state()

    if budget_exceeded:
        stop()

    if no_progress:
        stop()

That is the agent loop.

Some researchers and engineers call that the harness because it is the machinery wrapping repeated model inference.

I would not use that definition in your architecture.

Call it:

Agent Loop / Execution Loop

The loop should be part of a harness, not synonymous with the harness.

Your first diagram gets this right by labeling that inner section Loop Engineering.

⸻

2. Then what is an Agent Harness?

An Agent Harness is bigger.

Think:
              AGENT HARNESS
┌───────────────────────────────────────┐
│                                       │
│  Instructions / Task Contract         │
│                                       │
│  Context Management                   │
│  State / Memory                       │
│  Agent Loop                           │
│  Tool Interfaces                      │
│  Permissions                          │
│  Model Interface                      │
│  Budget / Token Controls              │
│  Retry / Recovery                     │
│  Stop Conditions                      │
│  Artifact Handling                    │
│  Telemetry                            │
│                                       │
│           ┌──────────────┐            │
│           │    MODEL     │            │
│           └──────────────┘            │
│                                       │
└───────────────────────────────────────┘

The model provides intelligence.

The harness determines how that intelligence is allowed to operate.

That’s why I like your first diagram’s statement:

AGENT = MODEL + HARNESS

It’s not mathematically universal, but it’s an excellent architectural mental model.

⸻

3. So is Claude Code a harness?

Yes — at a useful architectural level.

Claude Code isn’t merely Claude with a prompt.

It provides machinery around the model for software engineering: repository/context interaction, tool execution, file operations, shell interaction, iterative execution, state/context management, permission boundaries, and other control behavior.

Therefore, in your FDLC vocabulary I would classify it as:

Coding Harness

More specifically:

MODEL
Claude
   │
   ▼
CODING HARNESS
Claude Code
   │
   ▼
EXECUTION ENVIRONMENT
Local machine / container / sandbox / remote environment


And importantly:

Claude ≠ Claude Code

Claude is the model.

Claude Code is a software-engineering execution harness using Claude models.

That distinction is extremely important for your architecture.

⸻

4. What is a Coding Harness?

Now we’re getting to the terminology I think matters most for your Meta Factory presentation.

A Coding Harness is a specialized Agent Harness optimized for software engineering.

It understands concepts such as:

repository/workspace
files
diffs
shell
compiler
test runner
source control
build system
dependency manager
code search
patches
checkpoints
coding-specific context
repository instructions
test/build feedback
iterative repair

So:
AGENT HARNESS
      │
      ├── Coding Harness
      ├── Research Harness
      ├── Data Harness
      ├── Browser Harness
      ├── Security Harness
      └── Operational Harness

Coding Harness is a specialization, not a synonym for every Agent Harness.

⸻

5. What about an IDE Harness?

I’d make this even more specific.

An IDE Harness is a coding harness whose operating environment and interaction model are centered around an IDE/editor.

Think:
Agent Harness
      ↓
Coding Harness
      ↓
IDE-oriented Coding Harness


It may provide:
IDE
├── open buffers
├── selection/cursor
├── language server
├── diagnostics
├── terminal
├── repository
├── diff UI
├── user approvals
├── context selection
└── agent interaction

But be careful with the terminology.

IDE is not inherently the harness.

The IDE is an execution/interface environment through which a coding harness can operate.

That’s why something such as a terminal coding agent can be a perfectly legitimate Coding Harness without being an IDE Harness.

⸻

6. “AI Harness”

This is the term I would use the least.

It’s too broad.

Depending on who’s writing the article, “AI harness” might mean:

prompt management + model gateway

or

agent runtime

or

evaluation harness

or

the entire freaking platform. 😄

For FDLC, I’d avoid it unless you’re quoting someone else’s terminology.

Use Agent Harness and then qualify the specialization:

Coding Harness, Research Harness, Browser Harness, Testing Harness, Security Harness, etc.

Much cleaner.

⸻

7. Harness vs Runtime

This is another major source of confusion.

They are related but not identical.

Harness = behavior and control

It answers:

How does this agent operate?

For example:
context
tools
loop
instructions
budgets
permissions
stop conditions
recovery behavior
artifact handling

Runtime = execution substrate

It answers:

Where and how does this execution survive and run?

For example:
process/container
sandbox
compute
filesystem
network
queue
checkpointing
leases
scheduling
persistence
resume
secrets injection



So you can have:

Claude Code
CODING HARNESS

        ↓ executes through

FDLC Runtime
DURABLE EXECUTION

        ↓ provisions

Sandbox / VM / Container
EXECUTION ENVIRONMENT


This distinction is very important for your architecture.

⸻

8. Harness vs Orchestrator

Also different.

The harness controls a worker.

The orchestrator coordinates work.

Imagine your Software Delivery Factory gets:

Upgrade authentication library across 73 repositories.

The orchestrator might create:

             PLAN
               │
               ▼
        Dependency Analysis
               │
        ┌──────┼───────┐
        ▼      ▼       ▼
      Repo A Repo B   Repo C
        │      │       │
        ▼      ▼       ▼
      CODING HARNESS INVOCATIONS
        │      │       │
        └──────┼───────┘
               ▼
            VERIFY
               │
               ▼
          HUMAN GATE
               │
               ▼
            RELEASE


￼


Update both the FDLC repository and the FDLC Guide to standardize and clarify the terminology around models, agents, loops, harnesses, runtimes, orchestrators, graphs, capabilities, factories, and enterprise control planes.

Primary objective:
Remove ambiguity around the overloaded term “agent harness” and establish a precise FDLC taxonomy that can be used consistently across the architecture, documentation, diagrams, examples, and future product language.

Do not just add a glossary entry. Update the relevant conceptual documentation so the distinctions are explained in context, with examples, architecture relationships, and guidance on how FDLC uses each term.

CORE PRINCIPLE

The industry often uses “harness” to describe several different layers:
1. the iteration loop inside an agent,
2. the operating environment around an agent,
3. the workflow/orchestration layer around multiple agents,
4. sometimes even the enterprise policy/control layer.

These are not the same thing.

FDLC should explicitly separate them.

Use this core explanation:

“Most disagreement about the meaning of ‘agent harness’ is a boundary disagreement. Some people mean the loop inside a worker. Some mean the operating environment around the worker. Some mean the workflow that coordinates many workers. Others include enterprise policy, identity, budgets, and kill switches under the same term. FDLC separates these concerns so that each layer has a clear responsibility, owner, lifecycle, and qualification boundary.”

STANDARD FDLC TAXONOMY

Add or update the canonical definitions below.

MODEL
Definition:
An inference engine that provides reasoning, generation, classification, or other model intelligence.

Examples:
- Claude
- GPT
- Gemini
- DeepSeek

Important:
The model is not the agent, harness, runtime, or factory.

AGENT
Definition:
A goal-directed execution entity that uses model intelligence, instructions, context, state, and capabilities to perform work.

An agent is the worker.

Conceptually:

Agent = goal-directed behavior using model intelligence inside a bounded operating environment.

Do not define an agent as merely “an LLM with tools.”

AGENT LOOP
Definition:
The iterative control cycle used by an agent to make progress on a task.

Typical loop:

Load State
→ Plan / Select
→ Act / Call
→ Observe Result
→ Evaluate
→ Update / Replan
→ Repeat

The loop terminates when:
- success criteria are met,
- maximum turns are reached,
- budget is exhausted,
- timeout is reached,
- no meaningful progress is being made,
- policy requires escalation,
- a human decision is required.

Important:
Some articles call this loop the “harness.” FDLC does not.

FDLC calls this the Agent Loop or Execution Loop.

AGENT HARNESS
Definition:
The bounded operating environment that governs how an agent interacts with models, context, tools, state, execution resources, and external systems.

The harness converts raw model intelligence into an operational capability.

Typical harness responsibilities may include:
- task contract
- instructions
- context construction
- context compression
- state
- memory
- tool interfaces
- model interface
- execution loop
- permissions
- capability restrictions
- retries
- recovery behavior
- stopping conditions
- token limits
- cost budgets
- time budgets
- artifact handling
- telemetry
- provenance
- validation of tool results

Use this architectural principle:

“A harness determines how an agent is allowed to operate.”

Important:
Do not imply that every enterprise control must be owned by the harness.

The harness may enforce policy locally, but policy authority should generally remain outside the harness in the enterprise control plane.

CODING HARNESS
Definition:
An Agent Harness specialized for software engineering work.

Typical coding-harness capabilities:
- repository access
- source-file manipulation
- code search
- shell execution
- compiler interaction
- test execution
- build-system interaction
- package/dependency management
- git operations
- diff generation
- patch generation
- diagnostics
- language servers
- repository-specific instructions
- checkpointing
- repair loops
- test/build feedback
- artifact generation

Examples may include products such as Claude Code or Codex-style coding environments when used as the bounded software-engineering execution environment around a model.

Clarify:

Claude is a model.

Claude Code is better classified in FDLC terminology as a Coding Harness.

Do not imply that Claude Code is the entire factory, platform, runtime, or orchestrator.

IDE HARNESS
Definition:
A Coding Harness whose primary interaction and execution experience is integrated into an IDE or code editor.

Possible environment inputs:
- open files
- cursor position
- selected text
- editor diagnostics
- language-server data
- terminal
- git status
- diff viewer
- user approvals
- workspace state

Clarify:
An IDE is not inherently a harness.

An IDE can host or expose a Coding Harness.

A terminal-based coding harness can still be a Coding Harness without being an IDE Harness.

AI HARNESS
FDLC guidance:
Do not use “AI Harness” as a canonical architectural primitive.

Reason:
The term is too broad and inconsistently used across the industry.

If external sources use it, translate it into the more precise FDLC term where possible:
- Model Harness
- Agent Harness
- Coding Harness
- Evaluation Harness
- Runtime
- Orchestrator
- Control Plane

RUNTIME
Definition:
The execution substrate that provides the infrastructure required for work to actually run and survive.

The runtime answers:

“Where and how does execution live?”

Typical responsibilities:
- process lifecycle
- compute allocation
- containers
- VMs
- sandbox provisioning
- scheduling
- queues
- leases
- checkpointing
- persistence
- resume
- retry infrastructure
- filesystem lifecycle
- network access
- credentials injection
- execution isolation
- concurrency
- durable state
- compensation for side effects

Important distinction:

Harness = how the agent operates.

Runtime = where and how the execution runs and survives.

SANDBOX
Definition:
An isolated execution environment provisioned by or beneath the runtime.

Typical responsibilities:
- filesystem isolation
- process isolation
- network restrictions
- scoped credentials
- resource limits
- dependency installation boundaries
- blast-radius reduction

Clarify:

Runtime != Sandbox.

The runtime may provision and manage sandboxes.

ORCHESTRATOR
Definition:
The durable coordinator responsible for coordinating tasks, agents, harness invocations, workflow state, dependencies, retries, handoffs, gates, and completion.

The orchestrator answers:

“What work should execute next, and how should the overall run progress?”

Typical responsibilities:
- dependency tracking
- scheduling
- fan-out
- fan-in
- retries
- pause/resume
- human waits
- compensation
- recovery
- task lifecycle
- durable workflow state

Important distinction:

The harness controls the worker.

The orchestrator coordinates the work.

AGENT GRAPH / WORK GRAPH
Definition:
The explicit topology of work describing nodes, dependencies, branches, joins, gates, interrupts, cycles, error transitions, and terminal states.

Use this distinction:

Nodes do work.

Edges determine what happens next.

Example:

Intake
→ Plan
→ Route
→ Specialist
→ Tool Action
→ Human Gate
→ Join
→ Verify
→ Done

Important:

Graph != Agent Loop.

The Agent Loop operates inside a node or capability execution.

The graph coordinates multiple units of work.

GRAPH ENGINEERING
Definition:
The engineering discipline focused on designing the topology and state transitions of work.

Questions Graph Engineering answers:
- What happens next?
- Which work can run in parallel?
- Where are human gates?
- What happens on failure?
- Where do joins happen?
- When should execution terminate?
- What can be retried?
- What should escalate?

LOOP ENGINEERING
Definition:
The engineering discipline focused on improving how an individual agent iterates toward completion.

Questions Loop Engineering answers:
- Did the agent choose the right next action?
- Is it making progress?
- Should it replan?
- Is the context sufficient?
- Is the model/tool combination effective?
- When should the loop stop?

HARNESS ENGINEERING
Definition:
The engineering discipline focused on the operating environment and controls around an agent.

Questions Harness Engineering answers:
- What can the agent see?
- What tools can it use?
- What identity does it operate under?
- What state can it retain?
- What budgets apply?
- What happens when tools fail?
- What context should be loaded?
- How are actions validated?
- How does the run stop safely?

CAPABILITY
Definition:
A qualified ability to perform a defined type of work.

Examples:
- code modification
- test generation
- dependency analysis
- security scanning
- incident investigation
- browser interaction
- database analysis
- documentation generation

Important:
A capability is not synonymous with an agent.

A capability may be implemented using:
- a model
- an agent
- a coding harness
- a deterministic tool
- an MCP capability
- an API
- a workflow
- a human
- a hybrid combination

CAPABILITY IMPLEMENTATION
Definition:
A concrete qualified implementation of a capability.

A capability implementation may bind:
- Agent Recipe
- Harness
- Model Route
- Runtime Artifact
- Execution Backend
- Tool set
- Context policy
- Qualification evidence

Example:

Capability:
Code Modification

Implementation A:
- Coding Harness: Claude Code adapter
- Model Route: qualified Claude route
- Runtime Artifact: versioned container
- Execution Backend: hardened sandbox
- Qualification Score: X
- Cost Profile: Y
- Latency Profile: Z

Implementation B:
- Coding Harness: Codex adapter
- Model Route: qualified GPT route
- Runtime Artifact: versioned container
- Execution Backend: hardened sandbox
- Qualification Score: X2
- Cost Profile: Y2
- Latency Profile: Z2

Explain that routing should increasingly choose among qualified capability implementations rather than simply choosing “an agent.”

CONTROL PLANE
Definition:
The external authority that governs execution across agents, harnesses, runtimes, and factories.

Typical responsibilities:
- identity
- authentication
- authorization
- policy
- execution profiles
- budgets
- model routing authority
- capability grants
- approval requirements
- kill switches
- tenant boundaries
- audit requirements
- governance
- evidence requirements
- release authority

Important architectural principle:

The harness may enforce controls.

The control plane owns the authority behind those controls.

Do not build every harness into an independent governance system.

FACTORY
Definition:
A governed, versioned composition of workflows, capabilities, policies, context, execution environments, verification rules, evidence requirements, and authority designed to produce a defined outcome.

Examples:
- Software Delivery Factory
- Modernization Factory
- Security Remediation Factory

Important:
A Factory is not an Agent Harness.

A Factory may invoke many different agents and harnesses.

The same harness may be reused across many factories.

FACTORY PLATFORM
Definition:
The shared enterprise infrastructure on which many governed factories execute.

Typical shared platform capabilities:
- Mission Control
- identity
- policy
- Capability Registry
- model gateway
- context / RAG
- orchestration
- runtime
- sandbox infrastructure
- observability
- evaluation
- evidence
- governance
- approval systems
- release integration

Use this principle:

One enterprise platform can support many Factory Definitions and Factory Versions without duplicating the underlying infrastructure.

ARCHITECTURAL RELATIONSHIPS

Add a simple canonical relationship diagram in text/markdown form:

BUILDER / SYSTEM
        |
        v
MISSION CONTROL / CONTROL PLANE
        |
        v
GOVERNED PLAN
        |
        v
ORCHESTRATOR / WORK GRAPH
        |
        v
CAPABILITY ROUTER
        |
        v
QUALIFIED CAPABILITY IMPLEMENTATION
        |
        v
AGENT
        |
        v
HARNESS
        |
   +----+----+
   |         |
 MODEL      TOOLS
   |
   v
AGENT LOOP
        |
        v
RUNTIME
        |
        v
SANDBOX / EXECUTION BACKEND
        |
        v
ARTIFACTS
        |
        v
INDEPENDENT VERIFICATION
        |
        v
EVIDENCE / APPROVAL / AUTHORITY
        |
        v
DELIVERY

Cross-cutting:
Identity, Policy, Security, Budgets, Context, Observability, Evaluation, Evidence, Governance.

Also add this compact mental model:

Model = intelligence.
Agent = worker.
Loop = iteration.
Harness = operating envelope.
Graph = topology of work.
Orchestrator = coordination.
Runtime = execution substrate.
Sandbox = isolation.
Capability = qualified ability.
Factory = outcome-producing system.
Platform = shared enterprise foundation.

EXPLAIN THE THREE COMMON “HARNESS” MEANINGS

Add a section explaining why articles appear to conflict.

Use approximately this framing:

“Three different concepts are often collapsed into the word harness.”

1. LOOP

Plan
→ Act
→ Observe
→ Evaluate
→ Replan

Question:
“How does this worker make progress?”

FDLC term:
Agent Loop / Loop Engineering

2. GRAPH

Intake
→ Router
→ Specialist
→ Human Gate
→ Tool
→ Join
→ Verify
→ Done

Question:
“What work happens next?”

FDLC term:
Work Graph / Graph Engineering

3. OPERATING ENVELOPE

Context
Tools
Permissions
State
Budgets
Recovery
Stopping
Telemetry
Artifacts

Question:
“Under what conditions may this worker operate?”

FDLC term:
Agent Harness / Harness Engineering

Then explicitly state:

“These layers cooperate, but they should not be collapsed into one architectural primitive.”

FAILURE-DIAGNOSIS EXAMPLE

Add this practical diagnostic model:

When an autonomous run fails, ask:

1. Did the agent choose a poor next action?
Likely domain:
Loop Engineering

2. Did the workflow route the task incorrectly or coordinate work badly?
Likely domain:
Graph Engineering / Orchestration

3. Did the system allow the worker to see, spend, retry, call, or modify something outside its intended authority?
Likely domain:
Harness Engineering / Control Plane

4. Did execution disappear, fail to resume, lose state, or corrupt side effects?
Likely domain:
Runtime / Durable Orchestration

5. Did the system produce an output that was accepted without adequate evidence?
Likely domain:
Verification / Evidence / Authority

This should help readers diagnose architectural failures instead of treating every issue as an “agent problem.”

CLAUDE CODE EXAMPLE

Add a concrete example because this is one of the most common sources of confusion.

Use this framing:

Claude
= Model

Claude Code
= Coding Harness / coding-agent operating environment

Hardened container or remote execution environment
= Runtime / Execution Backend / Sandbox, depending on the specific layer

Temporal-style workflow, durable graph executor, or FDLC orchestration system
= Orchestrator

FDLC Mission Control
= Control Plane / factory coordination and governance

Software Delivery Factory
= Governed outcome-producing composition using all of the above

Make clear that vendor boundaries may differ internally, but FDLC categorizes components according to architectural responsibility rather than marketing terminology.

IMPORTANT GOVERNANCE PRINCIPLE

Explicitly add this principle:

“Enforcement and authority are not the same thing.”

Example:

The Coding Harness may enforce:
- max turns
- allowed tools
- local filesystem scope
- output limits

But those limits may originate from:
- Factory Version
- Execution Profile
- Control Plane
- Policy Engine
- Capability qualification
- user or organizational authority

Therefore:

Policy authority should remain external to the replaceable harness wherever practical.

This preserves:
- portability
- governance consistency
- model independence
- harness independence
- reproducibility
- auditability
- centralized revocation
- enterprise control

FACTORY VERSION RELATIONSHIP

Align the terminology with the existing FDLC Factory Version architecture.

Do not collapse these identities:

- Model identity
- Model Route identity
- Agent Recipe identity
- Harness identity/version
- Runtime Artifact identity
- Execution Backend identity
- Capability identity
- Qualification identity
- Factory Version identity

A Factory Version should bind the qualified, immutable composition used for an execution.

The routable unit should remain the governed Factory Version or another explicitly governed execution composition defined by current FDLC architecture.

Do not introduce mutable runtime coupling that breaks reproducibility.

DOCUMENTATION CHANGES

Inspect the existing FDLC repository and FDLC Guide before editing.

Identify all existing uses of:
- harness
- agent harness
- coding harness
- runtime
- agent runtime
- orchestrator
- graph
- workflow
- capability
- agent
- model
- sandbox
- control plane
- execution profile
- factory
- factory version

Reconcile terminology rather than blindly replacing words.

Where existing text intentionally uses a narrower or broader definition, update it so the scope is explicit.

Do not create contradictory definitions in separate sections.

Update whichever artifacts are appropriate, likely including:
- glossary / terminology
- architecture overview
- harness documentation
- capability architecture
- orchestration documentation
- runtime documentation
- Factory Development Lifecycle documentation
- Factory Version documentation
- diagrams or Mermaid diagrams
- examples
- README/navigation if needed

If there is no canonical terminology page, create one and link to it from the relevant architecture pages.

GUIDE REQUIREMENTS

In the FDLC Guide, explain these concepts pedagogically rather than only as specifications.

Include:
- why the terminology is confusing
- the three overloaded meanings of harness
- the FDLC definitions
- Claude vs Claude Code example
- loop vs graph vs harness comparison
- harness vs runtime
- harness vs orchestrator
- control-plane ownership vs harness enforcement
- capability implementation example
- relationship to factories
- common failure-diagnosis questions
- concise interview/executive explanation

Include a callout similar to:

“Do not ask only, ‘What is a harness?’ Ask which boundary you are discussing: the iteration loop, the operating envelope, the work graph, the execution substrate, or the enterprise control plane.”

DIAGRAM REQUIREMENTS

Where diagrams exist, update them so that they do not imply:

Agent Harness = entire autonomous system

or

Agent Harness = enterprise platform

or

Runtime = Harness

or

Graph = Loop

or

Agent = Model

Preferred conceptual view:

Factory Platform
  |
  +-- Control Plane
  |
  +-- Factory Version
        |
        +-- Work Graph / Orchestration
        |
        +-- Capability Implementations
              |
              +-- Agent
                    |
                    +-- Harness
                          |
                          +-- Model
                          +-- Tools
                          +-- Agent Loop
                          |
                          +-- Runtime
                                |
                                +-- Sandbox / Execution Backend

Treat this as conceptual architecture, not necessarily strict process nesting if the current implementation models these as peers or references.

QUALITY BAR

Before completing:

1. Search the repositories for conflicting terminology.
2. Ensure definitions are consistent across both FDLC and the FDLC Guide.
3. Preserve existing architecture where it is already more precise.
4. Do not invent implementation details that do not exist.
5. Do not change runtime behavior unless required for documentation correctness.
6. Keep examples vendor-neutral except where explicitly illustrating Claude/Claude Code.
7. Ensure Mermaid/Markdown renders successfully.
8. Run documentation lint/build/test commands.
9. Run relevant repository tests if documentation generation or schemas are affected.
10. Review the final diff for accidental terminology regressions.

DELIVERABLES

At completion, provide:

- summary of terminology standardized
- files changed in FDLC
- files changed in FDLC Guide
- conflicting definitions found and how they were resolved
- any diagrams added or updated
- validation/build/test results
- any terminology questions that could not be resolved from the current architecture
- commit SHA(s), if commits are part of the repository workflow

Do not stop after drafting a proposal.

Inspect the current repositories, make the changes, validate them, and bring the documentation to a completed, internally consistent state.
