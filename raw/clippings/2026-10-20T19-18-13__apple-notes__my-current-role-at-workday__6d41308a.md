---
title: "My CURRENT ROLE at Workday"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p9635
captured_at: 2026-10-20T19:18:13.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: 6d41308ac09cdd8b667cdd32fd33ba7bd6717adfbd28162179b4f8035adcbda0
---

My CURRENT ROLE at Workday 

1. CURRENT ROLE — EXECUTIVE OVERVIEW

60-SECOND TALKING SCRIPT

“At Workday, I led a 12-engineer AI organization responsible for building and operating our shared AI and agent platform.

Our mission was to enable more than 300 engineering teams and 3,000 engineers to build intelligent agents, copilots, and AI-powered workflows without having to recreate the same infrastructure.

I owned the platform strategy, engineering roadmap, technical direction, architecture, delivery, production operations, and team development.

We built two major platforms.

Workbench, our governed agent orchestration and execution platform.

And Hopper, our enterprise knowledge and retrieval platform that provides agents with trusted organizational context.

Together, these platforms provided reusable capabilities for agent orchestration, enterprise RAG, MCP integrations, evaluation, observability, security, and governance.

The result was a scalable foundation that helped engineering teams adopt AI faster, reduce duplicated effort, and deliver more reliable AI products.

What makes this relevant to Ridgeline is that I’ve already led the type of Internal AI Platform organization you’re looking to build and scale.”


WHAT I OWNED

My responsibilities included:

Engineering Leadership: Leading, coaching, and developing a 12-engineer AI organization.
Platform Strategy: Defining the vision, roadmap, and investment priorities for Workbench and Hopper.
Technical Architecture: Guiding decisions around agent orchestration, RAG, MCP, evaluation, security, and shared infrastructure.
Product Development: Translating business needs into AI products, intelligent agents, and automation capabilities.
Cross-Functional Partnerships: Working with Engineering, Product, HR, Finance, IT, Legal, Security, and Infrastructure.
AI-First Engineering: Introducing Claude Code, Cursor, and agentic development practices.
Production Operations: Establishing reliability, evaluation, observability, governance, and release standards.
Business Impact: Measuring adoption, productivity improvements, engineering efficiency, and operating costs.

KEY TAKEAWAY

“I don’t treat AI as a collection of isolated assistants. I treat it as an engineering platform and operating-model transformation.”

⸻

PART II — WHAT WE BUILT

2. WORKBENCH — GOVERNED AI AGENT PLATFORM

KEYWORDS: Agent Orchestration | Agent Harness | Control Plane | MCP | Skills | Governance | Production AI

WHAT IS WORKBENCH?

Workbench is Workday’s governed AI agent platform, execution harness, and control plane.

It provides the shared infrastructure that allows engineering teams to build, deploy, and operate intelligent agents securely and consistently.

It is not simply a chatbot.

It is the platform that governs how agents execute workflows, access tools, retrieve context, interact with systems, and operate in production.


45-SECOND TALKING SCRIPT

“Workbench is the governed agent platform and orchestration layer we built at Workday.

It allows engineering teams to develop intelligent agents without independently building their own execution frameworks, tool integrations, security controls, and evaluation systems.

The platform manages agent execution, workflow orchestration, MCP tool access, reusable skills, permissions, human approvals, and observability.

Our strategy was to centralize the complex, high-risk platform capabilities while allowing individual teams to own their specific agents and workflows.

That helped us scale AI adoption across more than 300 engineering teams.

Workbench governs what an agent can do.”

WORKBENCH CAPABILITIES

￼


2. — HOPPER - Enterprise RAG

Enterprise RAG | Knowledge Retrieval | Intelligent Search | Organizational Productivity

TALKING SCRIPT — 60 SECONDS

“Another major initiative I led at Workday was our enterprise knowledge platform, called Hopper.

One of the challenges with enterprise AI is that organizational knowledge is fragmented across systems like Confluence, Jira, Slack, and internal documentation.

We built Hopper as a shared retrieval platform that intelligent agents could use to access trusted enterprise information.

It supported hybrid retrieval, reranking, permission-aware access, citations, and retrieval evaluation.

We scaled the platform across more than 40 knowledge sources and 2 million documents, improving retrieval quality by approximately 30%.

The real value was that engineering teams no longer needed to build separate retrieval systems for every agent.

At Ridgeline, I see a similar opportunity to provide trusted enterprise knowledge across Engineering, Product, Sales, Customer Experience, and Corporate Functions.

My philosophy is that an intelligent agent is only as useful as the context it can securely and accurately retrieve.”

WHAT WE WERE SOLVING

At Workday, valuable organizational knowledge was distributed across numerous systems.

Engineers often needed to search multiple locations to find:

Technical documentation.
Architecture decisions.
Product specifications.
Engineering standards.
Support information.
Historical incidents.
Internal procedures.
System configurations.

This created several problems.

First, productivity loss. Employees spent time searching for information rather than completing work.

Second, fragmented knowledge. Different teams maintained separate documentation and search experiences.

Third, inconsistent AI responses. Agents lacked a common source of trusted enterprise context.

Fourth, security concerns. AI systems needed to respect existing document permissions.

WHAT WE BUILT — HOPPER

We developed Hopper, our enterprise knowledge ingestion and retrieval platform.

Hopper provided shared retrieval capabilities that intelligent agents and knowledge assistants could use to access organizational information.

The architecture included:
￼

HOW AN ENTERPRISE KNOWLEDGE AGENT WORKS

Imagine an engineer asks:

“Why did the last deployment fail, and what changes were made to resolve it?”

The agent could:

Receive the question through Workbench or another approved interface.
Determine which enterprise knowledge sources are relevant.
Query Hopper for authorized documentation.
Retrieve relevant Jira issues, runbooks, and incident records.
Combine keyword and semantic retrieval.
Rerank the results.
Provide relevant context to the language model.
Generate a grounded response.
Return citations so the engineer can verify the information.

The important distinction is that the agent is not relying solely on the model’s pretrained knowledge.

It is retrieving enterprise-specific information from approved sources.

MY RESPONSIBILITIES

I led the engineering strategy for:

Enterprise knowledge architecture.
Retrieval capabilities and integrations.
Permission-aware data access.
Retrieval quality and evaluation.
Shared services for agent development.
Engineering roadmap and prioritization.
Production reliability and observability.

MEASURABLE RESULTS

40+ enterprise knowledge sources

2 million+ documents

30% improvement in retrieval quality


KEY PHRASE

“Workbench governs what an agent can do. Hopper improves what an agent can know.”

⸻

3. HOPPER — ENTERPRISE KNOWLEDGE AND RAG PLATFORM

KEYWORDS: Enterprise RAG | Knowledge Retrieval | Hybrid Search | Permissions | Citations | Trusted Context

WHAT IS HOPPER?

Hopper is Workday’s enterprise knowledge ingestion, retrieval, and grounding platform.

It connects intelligent agents to trusted organizational information across enterprise systems.

Where Workbench governs agent execution, Hopper provides the context agents need to reason accurately.

45-SECOND TALKING SCRIPT

“Hopper is our enterprise knowledge and retrieval platform.

One of the biggest challenges with intelligent agents is giving them accurate, trusted organizational context.

At Workday, information was distributed across systems like Confluence, Jira, Slack, and internal documentation.

Rather than having every team build its own retrieval solution, we established Hopper as a shared platform.

It provides document ingestion, hybrid search, permission-aware retrieval, reranking, citations, and retrieval evaluation.

We scaled it across more than 40 knowledge sources and two million documents, improving retrieval quality by approximately 30%.

The key lesson is that intelligent agents are only as useful as the information they can securely and accurately access.

Hopper improves what an agent can know.”

MEMORABLE EXPLANATION

“Workbench governs what an agent can do. Hopper improves what an agent can know.”

“The model reasons, Hopper grounds, tools act, and Workbench orchestrates.”

HOPPER CAPABILITIES

Enterprise Knowledge Ingestion: Connectors to Confluence, Jira, Slack, documentation, and approved internal systems.
Document Processing: Extraction, chunking, metadata enrichment, and indexing.
Hybrid Retrieval: Combines keyword search and vector similarity.
Reranking: Improves relevance of retrieved information.
Permission-Aware Access: Respects user authorization and data boundaries.
Citations & Provenance: Connects answers to their original sources.
Retrieval Evaluation: Measures search quality, relevance, and accuracy.
Freshness Monitoring: Helps keep enterprise knowledge current.

MEASURABLE RESULTS

40+ enterprise knowledge sources
2 million+ documents
30% improvement in retrieval quality


⸻

PART III — THE BUSINESS PROBLEM

4. WHY DID WORKDAY NEED WORKBENCH AND HOPPER?

45-SECOND TALKING SCRIPT

“At Workday, we were seeing tremendous demand for AI across Engineering and Product.

Teams wanted to build agents, copilots, knowledge assistants, and automation workflows.

The challenge was that every team was potentially building its own AI infrastructure.

That meant duplicated effort, inconsistent security, fragmented architecture, and higher operating costs.

I recognized that the opportunity wasn’t simply to build more agents.

It was to create a shared Internal AI Platform that allowed hundreds of teams to innovate without rebuilding the same foundational capabilities.

That’s what drove our strategy behind Workbench and Hopper.”



SITUATION

AI adoption was accelerating across Workday.

Engineering teams wanted to build:

Intelligent agents and copilots
Enterprise search and knowledge assistants
Developer productivity tools
Testing and code-review agents
Workflow automation
Customer-facing AI capabilities

However, teams were beginning to approach AI independently.

Without a shared platform, every team would potentially need to build its own:

Agent orchestration framework
Enterprise retrieval layer
Tool integrations
Authentication and permissions
Evaluation systems
Observability
Deployment processes
Governance controls

BUSINESS RISKS

This would create:

Duplicated engineering effort, fragmented architecture, inconsistent security, higher operating costs, and unreliable production AI experiences.
KEY TAKEAWAY

“Model access alone wasn’t enough. Teams needed a trusted platform around the model.”

⸻

PART IV — MY TASKS AND RESPONSIBILITIES

5. WHAT WAS YOUR RESPONSIBILITY?

60-SECOND TALKING SCRIPT

“My responsibility was to take broad and sometimes ambiguous AI demand and turn it into a clear platform strategy and executable engineering roadmap.

I worked closely with Engineering, Product, Architecture, Security, Infrastructure, and Developer Experience teams to understand their needs.

From there, I established the platform priorities, architectural direction, ownership boundaries, and delivery milestones.

I led the engineering organization responsible for implementing those capabilities while maintaining production reliability and security.

An important part of my role was balancing centralized platform capabilities with decentralized innovation.

I didn’t want every team building its own AI stack, but I also didn’t want the platform organization becoming a bottleneck.

The objective was to give teams reusable capabilities so they could focus on solving their specific business problems.”

KEYWORDS: Engineering Strategy | Product Ownership | Roadmap | Architecture | Execution | Team Leadership

MY MISSION

Build and scale a shared, governed AI platform that enables engineering teams to develop reliable AI products and intelligent agents faster, more securely, and at lower cost.

MY SIX PRIMARY RESPONSIBILITIES

1. PLATFORM STRATEGY

Define the long-term vision for Workbench and Hopper, including the shared capabilities required to support enterprise AI adoption.

2. PRODUCT ROADMAP AND PRIORITIZATION

Identify high-value engineering needs, prioritize platform investments, and balance immediate delivery with long-term architectural scalability.

3. ENGINEERING ARCHITECTURE

Guide technical decisions across agent orchestration, retrieval, MCP, security, evaluation, and infrastructure.

4. ENGINEERING EXECUTION

Lead delivery planning, implementation, production readiness, and operational reliability.

5. PEOPLE LEADERSHIP

Recruit, coach, mentor, and develop senior engineers while establishing clear ownership and accountability.

6. ADOPTION AND BUSINESS IMPACT

Partner with engineering teams to drive platform adoption and measure productivity, reliability, cost, and business outcomes.



KEY TAKEAWAY

“Centralize shared platform capabilities. Decentralize workflow innovation.”

⸻

PART V — MY ACTIONS

6. HOW DID YOU EXECUTE THE PLATFORM STRATEGY?

KEYWORDS: Strategy to Execution | Cross-Functional Alignment | Architecture | Prioritization | Delivery


60-SECOND TALKING SCRIPT

“I approached the platform transformation in several stages.

First, I aligned our engineering and product stakeholders around a shared platform vision.

Second, I worked with senior engineers to establish the architecture and identify which capabilities needed to be centralized.

Third, I translated that vision into an engineering roadmap with clear ownership, milestones, and delivery expectations.

Fourth, we built reusable capabilities across agent orchestration, enterprise retrieval, MCP integrations, evaluation, and governance.

Finally, we focused heavily on developer experience and adoption, making it easier for engineering teams to build on the platform rather than developing their own infrastructure.

Throughout the process, I stayed close to architectural decisions and production readiness while empowering senior engineers to own the detailed implementation.”

ACTION 1 — ESTABLISHED THE PLATFORM VISION

I aligned Engineering, Product, Architecture, Security, and Infrastructure around a common AI platform strategy.

Decision: Build reusable infrastructure rather than allowing hundreds of disconnected AI implementations.

ACTION 2 — DEFINED THE ARCHITECTURE

I guided engineering decisions across:

Agent execution and orchestration
Enterprise retrieval and RAG
MCP gateways and tool integration
Identity and permissions
Evaluation and observability
Human approval controls
Production operations

ACTION 3 — ESTABLISHED ENGINEERING OWNERSHIP

I assigned senior engineers ownership of major platform capabilities.

I established:

Technical direction
Architecture standards
Engineering milestones
Decision rights
Delivery expectations
Quality requirements

ACTION 4 — BUILT REUSABLE PLATFORM SERVICES

We developed shared services for agent execution, enterprise knowledge retrieval, tool integrations, reusable skills, and governance.

ACTION 5 — INTRODUCED AI-FIRST ENGINEERING

We incorporated Claude Code, Cursor, and AI-assisted development practices into engineering workflows.

ACTION 6 — ESTABLISHED PRODUCTION STANDARDS

We implemented evaluation frameworks, observability, security controls, human approval gates, and release-readiness requirements.

ACTION 7 — DROVE ORGANIZATIONAL ADOPTION

We supported engineering teams through reusable APIs, SDKs, developer tooling, migration capabilities, and enablement.



⸻

PART VI — AI ARCHITECTURE AND TECHNICAL JUDGMENT

7. HOW DID YOU APPROACH AI PLATFORM ARCHITECTURE?

KEYWORDS: Model Independence | Agent Harness | Deterministic Execution | Security | Scalability

45-SECOND TALKING SCRIPT

“One important architectural principle I established was separating AI reasoning from deterministic execution.

I don’t believe every workflow needs an LLM.

We use models for tasks requiring reasoning, interpretation, and planning.

But for predictable operations, such as retrieving build status, triggering a workflow, or executing an approved API call, deterministic automation is often more reliable and cost-effective.

This approach improves security, testability, observability, and operational reliability.

At Ridgeline, I’d apply the same principle when evaluating where intelligent agents create meaningful value versus where traditional automation is sufficient.”

CORE ARCHITECTURE PRINCIPLE

Use AI for reasoning and ambiguity. Use deterministic systems for predictable execution.

WHERE WE USED LLMS

Reasoning
Planning
Interpretation
Summarization
Synthesis
Ambiguous user requests

WHERE WE USED DETERMINISTIC AUTOMATION

API operations
CLI commands
Workflow execution
Build status retrieval
CI/CD operations
Approved system updates
Validation and testing

WHY THIS MATTERS

Deterministic execution is easier to:

Test | Secure | Audit | Monitor | Recover | Scale



KEY TAKEAWAY

“I don’t use an LLM where deterministic automation is safer, faster, and easier to validate.”

⸻

PART VII — PRODUCTION READINESS AND GOVERNANCE

8. HOW DID YOU MAKE AI AGENTS PRODUCTION-READY?

KEYWORDS: Evaluation | Observability | Security | Human Oversight | Reliability | Governance

THE CHALLENGE

An AI demonstration may work well under controlled conditions but fail when exposed to real enterprise workflows.

Production systems require:

Reliable execution
Secure data access
Permission-aware tools
Evaluation frameworks
Observability
Error handling
Recovery and retries
Human approvals
Auditability
Controlled releases

WHAT WE IMPLEMENTED

Evaluation: More than 500 scenarios per release.

Observability: Execution tracing, tool-call monitoring, latency, failures, and cost tracking.

Security: Identity, permissions, scoped tools, and controlled execution.

Human Oversight: Approval gates for sensitive or high-risk actions.

Release Management: Staging validation, regression testing, and controlled promotion.

MEASURABLE RESULTS

Agent task success: 15% → 65%
Cost per agent run: 45% reduction
500+ evaluation scenarios per release

60-SECOND TALKING SCRIPT

“One of the biggest lessons I’ve learned is that the demonstration is usually the easiest part of AI development.

The real challenge is making an agent reliable enough for production.

At Workday, I established engineering practices around evaluation, observability, security, governance, and human oversight.

We ran more than 500 evaluation scenarios per release and used execution tracing to understand agent behavior, tool calls, failures, and costs.

We also established permission-aware execution and human approval gates for sensitive actions.

That helped us improve evaluated agent task success from 15% to 65% across a measured cohort while reducing cost per agent run by 45%.

My philosophy is that AI should move quickly, but production trust must be earned through evidence.”

KEY TAKEAWAY

“The difference between an AI demo and an enterprise AI product is evaluation, reliability, governance, and measurable outcomes.”

⸻

PART VIII — ENGINEERING LEADERSHIP

9. HOW DID YOU LEAD YOUR ENGINEERING ORGANIZATION?

KEYWORDS: Player-Coach | Senior Engineers | Ownership | Accountability | Technical Leadership

MY LEADERSHIP PHILOSOPHY

I lead through:

Context | Clarity | Ownership | Accountability | Decision Rights | Measurable Outcomes

Because my organization consisted primarily of senior engineers, I didn’t want to become the architectural decision bottleneck.

WHAT I PROVIDED

Business problems
Expected outcomes
Technical constraints
Architecture direction
Risks and tradeoffs
Dependencies
Decision rights
Delivery expectations

WHAT ENGINEERS OWNED

Detailed technical design
Implementation decisions
Architecture proposals
Technical execution
Quality and validation
Operational ownership

60-SECOND TALKING SCRIPT

“My leadership style is collaborative, transparent, and outcome-driven.

At Workday, I led a senior-heavy organization of approximately 12 engineers.

My responsibility was to establish the strategy, priorities, architectural direction, and measurable outcomes.

I gave senior engineers ownership of technical decisions while staying close enough to the architecture and delivery to remove obstacles and manage risks.

I also invested heavily in coaching, technical leadership development, and creating opportunities for engineers to grow.

I believe great engineering organizations scale through strong people and clear decision-making, not through managers being involved in every technical detail.

I don’t scale by being in every decision. I scale by improving the quality of decisions made without me.”

⸻

PART IX — RESULTS AND BUSINESS IMPACT

10. WHAT BUSINESS RESULTS DID YOU DELIVER?

KEYWORDS: Adoption | Productivity | Organizational Leverage | Cost Efficiency | AI Quality

KEY METRICS

￼


KEY BUSINESS IMPACT

“At Workday, we scaled our internal AI platform to support more than 300 engineering teams and 3,000 engineers, enabling over 25 customer-facing agents and 50 internal agents.

But what I’m most proud of is the measurable impact.

We improved evaluated agent task success from 15% to 65%, reduced manual effort by 35%, and lowered cost per agent run by 45%.

By centralizing reusable capabilities, we also conservatively estimated that we avoided more than 10,000 hours of duplicated engineering effort.

The biggest accomplishment wasn’t the number of agents we delivered. It was creating a shared AI foundation that improved engineering productivity, reliability, and organizational leverage.”

KEY PHRASE

“AI success isn’t measured by how many agents we build. It’s measured by how much organizational leverage we create.”

⸻

12. HOW I MEASURE AI PLATFORM SUCCESS

Likelihood: EXTREMELY HIGH | 60 Seconds

KEYWORDS: Employee Adoption | Productivity | Task Success | Reliability | Cost Efficiency | Business Impact

TALKING SCRIPT

“I measure AI platform success across five dimensions.

First, adoption. Are employees actively using the platform, and are they incorporating AI into their daily workflows?

Second, productivity. Are we reducing manual effort, accelerating workflows, and allowing employees to accomplish more?

Third, quality and reliability. Are agents completing tasks successfully, producing accurate results, and operating reliably?

Fourth, efficiency. Are we reducing cost per successful task, eliminating duplicated engineering effort, and improving resource utilization?

Fifth, business impact. Are we improving customer outcomes, accelerating delivery, and creating measurable organizational capacity?

At Workday, we used these principles to scale adoption across 300+ engineering teams, improve evaluated task success from 15% to 65%, reduce manual effort by 35%, and lower execution costs by 45%.

At Ridgeline, I would establish clear baselines for each AI initiative and measure its impact on employee productivity and business outcomes.

My philosophy is that adoption is important, but adoption without measurable value isn’t success.”

⸻

13. HOW I WOULD APPLY THIS EXPERIENCE AT RIDGELINE

Likelihood: EXTREMELY HIGH | 60–90 Seconds

KEYWORDS: Internal AI Platform | Organizational Leverage | AI-Native Engineering | Cross-Functional Adoption | Business Outcomes

TALKING SCRIPT

“What excites me about Ridgeline is that you’re looking to accomplish something very similar to what I’ve been building at Workday, but across an even broader set of business functions.

At Workday, our initial focus was creating shared AI capabilities that engineering teams could use to build agents, automate workflows, and improve developer productivity.

At Ridgeline, I see an opportunity to apply that same platform approach across Engineering, Product, Go-to-Market, Customer Experience, and Corporate Functions.

I would start by understanding the highest-friction workflows across those organizations and identifying where AI could create measurable business value.

From there, I’d assess the existing technology landscape and establish reusable capabilities around agent orchestration, enterprise knowledge retrieval, MCP integrations, security, evaluation, and observability.

I’d also prioritize a few high-impact use cases that could demonstrate measurable productivity improvements quickly.

The goal would be to create a shared platform that employees actively adopt because it makes their jobs easier.

I wouldn’t approach this as building more AI tools. I’d approach it as transforming how Ridgeline operates through AI.”

⸻

14. HOW I LEAD SENIOR ENGINEERS AND TECHNICAL LEADERS

Likelihood: VERY HIGH | 60 Seconds

KEYWORDS: Engineering Leadership | Player-Coach | Technical Strategy | Empowerment | Accountability | Talent Development

TALKING SCRIPT

“My leadership style is collaborative, transparent, and outcome-driven.

At Workday, I led a senior-heavy organization of approximately 12 engineers, responsible for complex AI platform capabilities.

My role was to establish the strategy, priorities, architecture direction, operating model, and measurable outcomes.

I gave senior engineers ownership of the technical solutions while ensuring their decisions aligned with our broader platform strategy.

I stayed involved in architecture reviews, technical tradeoffs, production risks, and cross-functional dependencies, but I didn’t want to become the decision-making bottleneck.

I also invested heavily in coaching and developing engineers into broader technical leadership roles.

Throughout my career, I’ve led organizations of up to 24 engineers, and some of my most rewarding accomplishments have been helping engineers grow into senior, lead, and architecture positions.

My philosophy is that I don’t scale by being involved in every decision. I scale by improving the quality of decisions made without me.”

⸻

15. HOW I BUILD AN AI-FIRST ENGINEERING CULTURE

Likelihood: VERY HIGH | 60 Seconds

KEYWORDS: Claude Code | Cursor | AI-Native SDLC | Agentic Engineering | Developer Productivity | Engineering Transformation

TALKING SCRIPT

“I believe AI-first engineering requires fundamentally rethinking how software gets built.

At Workday, we introduced tools like Claude Code and Cursor into our engineering workflows.

We used AI across requirements analysis, architecture exploration, code generation, test development, debugging, code reviews, and documentation.

But I believe the bigger opportunity goes beyond coding assistance.

It’s moving toward agentic software development, where engineers define objectives, constraints, and acceptance criteria while AI agents perform increasingly complex implementation tasks.

Engineers then focus more on architecture, orchestration, evaluation, and quality.

I’ve also explored this through my open-source project, Mission Control, which demonstrates governed autonomous software delivery with sandboxed execution, independent verification, and human acceptance gates.

At Ridgeline, I would help establish an AI-first engineering culture where teams continuously experiment with emerging technologies while maintaining high standards for security, reliability, and software quality.

AI-first engineering isn’t simply giving developers AI tools. It’s redesigning how engineering work gets done.”

⸻

16. WHY MY EXPERIENCE ALIGNS WITH RIDGELINE

Likelihood: EXTREMELY HIGH | 45–60 Seconds

KEYWORDS: Direct Experience | AI Platform Leadership | Engineering Management | Enterprise Adoption | Organizational Leverage

TALKING SCRIPT

“I believe my background aligns particularly well with Ridgeline because I’ve already led many of the initiatives this role is responsible for.

First, internal AI platform leadership. At Workday, I led the organization building Workbench and Hopper, shared AI capabilities supporting more than 300 engineering teams and 3,000 engineers.

Second, engineering leadership. I bring more than 18 years of management experience, including leading global engineering organizations and developing senior technical leaders.

Third, AI-native engineering. I’ve worked extensively with intelligent agents, enterprise RAG, orchestration, MCP, evaluation, and AI-assisted development tools like Claude Code and Cursor.

Fourth, measurable business impact. We’ve reduced manual effort by 35%, lowered agent execution costs by 45%, and significantly improved agent task success.

What makes this opportunity exciting is the chance to take that experience and apply it across an entire organization.

Ridgeline is looking for someone who can turn AI capabilities into organizational leverage. That’s exactly the work I’ve been focused on.”

⸻

17. FINAL 60-SECOND WORKDAY SUMMARY

Use when Alyssa asks: “Tell me about what you’re doing at Workday.”

“At Workday, I led a 12-engineer AI organization responsible for building and operating our shared internal AI platform.

We developed two major capabilities.

Workbench, our governed agent platform, provides the orchestration, execution harnesses, tool integrations, permissions, evaluation, and observability needed to build and operate intelligent agents.

Hopper, our enterprise knowledge platform, provides trusted, permission-aware retrieval across internal knowledge sources so agents can access accurate organizational context.

My responsibility was to establish the platform strategy, technical direction, roadmap, engineering execution, governance, and production readiness, while leading and developing the engineering team.

We scaled the platform from six pilot teams to more than 300 engineering teams, supporting approximately 3,000 engineers.

We also improved evaluated agent task success from 15% to 65%, reduced manual effort by 35%, and lowered execution costs by 45%.

The biggest accomplishment was creating a reusable AI foundation that allowed engineering teams to innovate without repeatedly rebuilding the same infrastructure.

That’s what excites me about Ridgeline—the opportunity to bring that same approach to an Internal AI Platform that improves productivity across the entire company.”

⸻

18. FINAL INTERVIEW QUICK REFERENCE

FIVE MESSAGES TO REINFORCE

1. PLATFORM STRATEGY

“I don’t treat AI as a collection of isolated assistants. I treat it as an engineering platform and operating-model transformation.”

2. WORKBENCH + HOPPER

“Workbench governs what an agent can do. Hopper improves what an agent can know.”

3. ORGANIZATIONAL LEVERAGE

“Centralize shared platform capabilities. Decentralize workflow innovation.”

4. ENGINEERING LEADERSHIP

“I don’t scale by being involved in every decision. I scale by improving the quality of decisions made without me.”

5. AI GOVERNANCE

“Trust the system, not the model.”

⸻

YOUR PRIMARY POSITIONING FOR RIDGELINE

“I’ve spent the last several years building and scaling an internal AI platform at Workday, leading the engineers, establishing the architecture and operating model, and delivering measurable improvements in adoption, productivity, and reliability. Ridgeline is looking to build that same kind of organizational leverage through AI, and that’s exactly the experience I’d bring to this role.”

For your 30-minute recruiter interview with Alyssa, prioritize your leadership responsibilities, Workbench and Hopper, measurable results, and why Ridgeline. Save the deeper architectural details for the technical interview.
