---
title: "Workday (My role) — Workbench, Hopper, Agentic Engineering"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p9377
captured_at: 2026-10-16T20:20:14.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: 8edce94535a1709dbb5babe463ee2a9cff39962c2fcce1e22ed06f9ce26f930f
---

Workday (My role) — Workbench, Hopper, Agentic Engineering, and My Role
 

⸻ 

My Role
Core Message

“I lead a 12-engineer organization building a shared AI-native platform that helps more than 300 scrum teams and over 3,000 engineers create agents, copilots, knowledge assistants, and workflow automation using common enterprise standards.”

At Workday, AI demand was growing quickly. Teams wanted to build agents, copilots, enterprise search, testing tools, developer workflows, code-review agents, and customer-facing AI capabilities.

The opportunity was significant, but so was the risk.

Without a shared platform, every team would have rebuilt its own:

Agent framework
Retrieval layer
Tool integrations
Authentication and permissions
Evaluation approach
Observability
Deployment model
Governance process

That would have created duplicated work, fragmented architecture, inconsistent quality, security risk, weak auditability, unclear ownership, and impressive demos that were not ready for production.

My responsibility 
Platform strategy
Product and technical direction
Engineering architecture
Operating model
Portfolio and priority management
Delivery execution
Quality and production readiness
AI governance
Cross-functional alignment
People development
Organizational adoption
Impact measurement

My role is broader than managing individual agents, chatbot features, or AI experiments.

“I do not treat AI as a collection of isolated assistants. I treat it as an Engineering platform and operating-model transformation.”

⸻

2. What We Built

Workbench

Workbench is the governed AI Agentic platform, agent orchestration layer, agent harness, and control plane using to develop co-pilots, agents and agentic solutions for Workday products include HCM and Finance management.  

It manages how agents are created, invoked, orchestrated, governed, observed, and moved toward production.

Simple explanation:

Workbench governs what an agent can do.

Workbench provides:

Agent orchestration
Workflow planning
Task routing
Workflow state
Tool selection
MCP tool calls
Permission-aware execution
Human approval checkpoints
Reusable skills
Retry and recovery behavior
Evaluation hooks
Observability hooks
Audit trails
Production controls

Strong line:

“Workbench is the orchestration and control plane that turns a model response into a governed enterprise workflow.”

⸻

Hopper

Hopper is the enterprise knowledge-ingestion, retrieval, and grounding platform.

It gives engineers and agents trusted, source-backed organizational context.

Simple explanation:

Hopper improves what an agent can know.

Hopper provides:

Source connectors
Document loading
Content extraction
Chunking
Metadata enrichment
Permission metadata
Incremental ingestion
Hybrid retrieval
Reranking
Citations
Source provenance
Retrieval evaluations

Strong line:

“Hopper is not just search. It is trusted enterprise context for AI.”

Combined line:

“Workbench governs what an agent can do. Hopper improves what an agent can know.”

⸻

3. Platform Strategy

The strategy was to centralize the repeated, high-risk, undifferentiated capabilities while preserving domain-team ownership of specific workflows and user experiences.

Shared platform capabilities included:

Agent orchestration
Enterprise retrieval and RAG
MCP and tool integrations
Authentication and authorization
Permission-aware execution
Reusable skills
Human approval points
Evaluation
Observability
Auditability
Release-readiness standards

The mission was not to centralize every AI experience or prevent experimentation.

The mission was to prevent hundreds of teams from building separate, incompatible AI stacks.

Shared platform capabilities stay centralized. Domain-specific workflows stay with the teams closest to the user.

⸻

4. AI Tech Stack 

Frontend / User Experience

Users can interact through:

Workbench UI
CLI
IDE integrations such as Cursor or Claude Code
Slack / chat
APIs / SDKs
Embedded internal tools

Purpose:

Meet engineers where they already work.

⸻

Agent Orchestration / Control Plane

Owned by Workbench.

This layer handles:

Agent selection
Workflow planning
Task routing
Workflow state
Tool selection
Hopper retrieval calls
MCP tool calls
Human approvals
Completion criteria
Retries
Escalation paths
Audit and trace events

Simple line:

“The model reasons, Hopper grounds, tools act, and Workbench orchestrates.”

⸻

Knowledge / RAG Layer

Owned by Hopper.

Possible sources:

Confluence
Jira
Google Docs
Product documentation
Engineering standards
Support articles
Runbooks
Approved Slack channels

Retrieval uses:

Vector search
Keyword search
Metadata filtering
Hybrid retrieval
Reranking
Citations
Provenance
Retrieval evaluations

Strong line:

“Vector search finds meaning. Keyword search finds exactness. Enterprise RAG usually needs both.”

⸻

Database and Search Layer

This layer stores documents, embeddings, metadata, retrieval indexes, workflow state, permissions, audit data, and operational records.

Fictional components:

Chroma — lightweight vector database for prototypes, local testing, and smaller retrieval use cases
Pinecone — managed vector database for scalable semantic search and production retrieval workloads
Elasticsearch — keyword search, exact matching, filtering, logs, metadata search, and hybrid retrieval support
PostgreSQL — relational storage for workflow state, agent registry, permissions, audit records, and configuration
Redis — cache layer for sessions, short-lived state, rate limits, and fast lookups
Object storage — raw documents, processed chunks, embedding artifacts, logs, and ingestion history

Simple explanation:

Chroma or Pinecone handles vector similarity. Elasticsearch handles keyword search and exact matching. PostgreSQL stores platform state and governance records. Redis supports fast temporary state and caching.

⸻

Model Layer

The model layer provides reasoning, language understanding, summarization, planning, and synthesis.

Possible providers:

GPT-style models
Claude-style models
Gemini-style models
Internal model gateway
Open-source models
Smaller routing or classification models

Architecture principle:

“Use models for ambiguity and reasoning. Use deterministic systems for predictable execution.”

LLMs are useful for:

Planning
Interpretation
Synthesis
Ambiguous intent
Summarization

APIs, CLIs, SDKs, and scripts are better for predictable actions that need to be:

Secure
Testable
Auditable
Recoverable
Reliable

Strong line:

“I do not use an LLM where deterministic automation is safer, faster, and easier to validate.”

⸻

Tools and MCP Layer

The tools layer lets agents take action beyond generating text.

Possible tools:

Jira tools
Confluence tools
GitHub tools
CI/CD tools
Deployment tools
Incident tools
Hopper retrieval tool
Internal APIs
Slack notification tools

The MCP gateway gives agents a governed way to discover and use approved tools.

MCP capabilities:

Tool registry
Typed schemas
Authentication
Authorization
Audit logging
Usage tracking
Tool ownership
Versioning
Permission-aware access

Strong line:

“Tools connect AI to the real world, but governance determines whether that connection is safe.”

⸻

Reusable Skills Layer

A skill is a reusable procedure that helps an agent perform recurring work consistently.

Skills define:

When to use the skill
Required context
Approved tools
Steps to follow
Engineering standards
Validation criteria
Expected output
Escalation conditions
Human approval points

Why skills matter:

Skills allow senior engineers and subject-matter experts to turn repeatable knowledge into reusable organizational capability.

Strong line:

“Skills are how senior engineers scale their judgment through the platform.”

⸻

Evaluation and Observability

Evaluation tells us whether the AI system is useful, grounded, safe, and production-ready.

Evaluation includes:

Retrieval evaluations
Agent evaluations
Groundedness checks
Citation accuracy
Tool-use validation
Workflow completion checks
Regression tests
Human review

Observability includes:

Prompt traces
Tool-call traces
Retrieval traces
Latency
Cost
Token usage
Failure rates
User feedback
Production dashboards

Possible tools:

Langfuse-style tracing
OpenTelemetry-style traces
Grafana-style dashboards
Cloud monitoring tools

Strong line:

“Evaluation tells us whether the agent is right. Observability tells us why it behaved that way.”

⸻

Governance and Security

This layer keeps AI safe, permission-aware, auditable, and enterprise-ready.

Capabilities include:

Identity
Authentication
Authorization
Role-based access
Data access controls
Sensitive data handling
Secrets management
Tool permissions
Audit logging
Human approval policies
Risk classification
Security review
Production readiness gates

Talent Tech line:

“Decision support is appropriate. Unreviewed decision replacement is not.”

⸻

Infrastructure and Compute

This layer runs Workbench and Hopper reliably at scale.

Possible infrastructure:

Docker — containerized services for agents, APIs, ingestion workers, retrieval workers, and platform services
Kubernetes — orchestration, scaling, service management, rollout control, and environment isolation
AWS — cloud compute, storage, networking, managed databases, queues, monitoring, and GPU-backed workloads
Google Cloud — cloud compute, storage, managed AI services, and GPU-backed workloads
Message queues — asynchronous ingestion, embedding generation, workflow execution, and retries
Object storage — raw documents, chunks, processed artifacts, logs, and ingestion history
CI/CD pipelines — build, test, deployment, and environment promotion
Secrets management — secure credentials, tokens, and service secrets
Autoscaling — scale ingestion, retrieval, and agent workloads based on demand

GPU / CPU provider layer:

AWS GPU instances
Google Cloud GPU instances
Managed model providers
Internal compute gateway
CPU workers for deterministic jobs
GPU workers for embeddings, reranking, or specialized model workloads

Strong line:

“Production AI is still production software. It needs containers, orchestration, monitoring, scaling, security, and recovery.”

⸻

5. End-to-End Flow

A user starts a workflow through UI, CLI, IDE, Slack, or API.
Workbench identifies the user intent, permissions, tools, and workflow boundaries.
Workbench orchestration determines the workflow plan, required context, required tools, and approval points.
Hopper retrieves trusted enterprise context from approved sources.
Retrieval uses vector search, keyword search, metadata filtering, and reranking.
The model reasons over the task and retrieved context.
Workbench invokes approved tools through MCP, APIs, CLI, or SDKs.
Human approval is requested for sensitive actions.
The system validates the result through evals, checks, or deterministic verification.
Observability captures traces, latency, cost, retrieval quality, and tool behavior.
The user receives an answer or completed action with citations, audit trail, and completion status.

⸻

6. Production Readiness

Production readiness required a different level of discipline than experimentation.

We introduced or strengthened:

Observability
Agent evaluations
Retrieval evaluations
Feedback loops
Auditability
Human-in-the-loop controls
Security review
Staging validation
Critical-flow testing
Error handling
Recovery and retry behavior
Release-readiness criteria

Strong line:

“The demonstration is usually the easiest part of AI development. The hard part is making the capability trusted, observable, evaluated, permission-aware, secure, auditable, recoverable, and durable enough for production.”

⸻

7. How I Led

Because I lead a senior-heavy organization, I did not want to become the architecture or decision bottleneck.

I gave teams:

The business problem
The user pain
The expected outcome
The technical constraints
The risks
The tradeoffs
The dependencies
The decision rights

Then I expected architects, technical leads, and senior engineers to own the detailed solution.

I led through:

Context
Clarity
Ownership
Accountability
Decision boundaries
Measurable outcomes

Strong lines:

“I do not scale by being in every decision. I scale by improving the quality of decisions made without me.”

“I do not confuse autonomy with the absence of leadership. Strong autonomy requires clear context, explicit expectations, decision rights, trust, feedback, and accountability.”

⸻

8. Results and Impact

Workbench evolved into a reusable AI platform foundation that supports more than:

25 customer-facing agents
50 internal agents
300 Engineering scrum teams
3,000 engineers

The platform gave teams a more consistent and governed approach to:

Building agents
Accessing trusted knowledge
Connecting to approved tools
Managing identity and permissions
Validating agent behavior
Observing production execution
Applying human oversight
Moving from experimentation to production

We conservatively estimated more than 10,000 hours of avoided duplicated Engineering effort.

That estimate is based on common capabilities teams would otherwise have needed to design, integrate, secure, test, deploy, and maintain independently across areas like authentication, authorization, agent orchestration, retrieval, tool connectivity, evaluation, observability, security, deployment, and production readiness.

Important qualification:

“The 10,000-hour figure is an avoided-effort estimate, not a claim that we directly measured 10,000 individual productivity hours.”

Broader organizational impact:

Less duplicated Engineering effort
Stronger architecture alignment
Clearer ownership
More reusable platform capabilities
Better security and governance
More consistent quality standards
Greater delivery discipline
Faster path from AI experimentation to production

Strong line:

“Some of the greatest platform value is invisible because it shows up as duplicated work avoided, risk reduced, and future delivery made easier.”

⸻

9. Talent Technology / Netflix Relevance

For Talent Technology, AI-supported workflows can affect:

Hiring
Internal mobility
Skills intelligence
Learning
Career development
Performance
Workforce decisions
Employee opportunities
HR operations

Those workflows need more than model capability.

They need:

Trusted data
Clear permissions
Governance
Evaluation
Human accountability
Auditability
Production discipline

Netflix relevance:

“For Netflix, the value is not just creating AI-enabled Talent experiences. The value is creating a trusted foundation so those experiences are reliable, permission-aware, measurable, and worthy of employee trust.”

Natalie line:

“The goal is not more technology. The goal is making work simpler, more reliable, and more effective for employees and the teams supporting them.”


⸻

11. Final Closing Lines

“Workbench governs what an agent can do. Hopper improves what an agent can know.”

“The model reasons, Hopper grounds, tools act, and Workbench orchestrates.”

“I do not treat AI as a collection of isolated assistants. I treat it as an Engineering platform and operating-model transformation.”

“The model provides intelligence, but the harness, workflow, governance, and operating discipline determine whether that intelligence becomes useful, reliable, and trustworthy.”

“Production AI is not just a model call. It is retrieval, orchestration, tools, databases, permissions, evaluation, observability, infrastructure, governance, and human accountability.”

“In Talent workflows, responsible AI is not only a technical concern. It is an employee trust concern.”
⸻

AI Tech Stack View

Frontend

Workbench UI
CLI
IDE integrations
Slack / chat
APIs / SDKs

Orchestration / Agent Platform

Workbench runtime
Agent orchestration
Workflow planning
Task routing
Workflow state
Human approvals
Skills
MCP gateway

Knowledge / RAG

Hopper ingestion
Document processing
Metadata enrichment
Hybrid retrieval
Citations
Provenance
Retrieval evals

Databases / Search

Chroma
Pinecone
Elasticsearch
PostgreSQL
Redis
Object storage

Models

GPT-style models
Claude-style models
Gemini-style models
Internal model gateway
Smaller routing / classification models

Tools

Jira
Confluence
GitHub
CI/CD
Deployment tools
Incident tools
Slack
Internal APIs

Evaluation / Observability

Retrieval evals
Agent evals
Groundedness checks
Prompt traces
Tool-call traces
Dashboards
Cost and latency tracking

Governance

Identity
Permissions
Audit logs
Human approvals
Security policies
Data controls
Risk classification

Infrastructure

Docker
Kubernetes
AWS
Google Cloud
Message queues
CI/CD
Secrets management
Monitoring

GPU / Compute

AWS GPU providers
Google Cloud GPU providers
Managed model providers
CPU workers
GPU workers for embeddings, reranking, and model workloads

⸻

Interview Explanation

Workbench is the governed AI platform, orchestration layer, and agent control plane. It manages workflow planning, task routing, tools, permissions, human approvals, evaluation, observability, and safe execution.

Hopper is the trusted enterprise knowledge layer. It ingests approved sources, indexes content, supports hybrid retrieval, returns citations, and grounds AI responses in verified context.

The supporting stack includes vector databases like Chroma or Pinecone, search systems like Elasticsearch, relational storage like PostgreSQL, cache layers like Redis, container infrastructure like Docker and Kubernetes, and cloud compute providers like AWS and Google Cloud for scalable CPU and GPU workloads.

Together, the stack turns model capability into trusted enterprise capability.

⸻

Strong Closing Lines

“Workbench orchestrates and governs the agent. Hopper grounds the agent.”

“Workbench turns model output into governed workflow execution.”

“Hopper turns fragmented enterprise knowledge into trusted AI context.”

“The model reasons, Hopper grounds, tools act, and Workbench orchestrates.”

“Vector search finds meaning. Keyword search finds exactness. Enterprise RAG usually needs both.”

“Production AI is not just a model call. It is retrieval, orchestration, tools, databases, permissions, evaluation, observability, infrastructure, governance, and human accountability.”
⸻

AI Pictures


￼

￼


￼

￼
￼
￼
