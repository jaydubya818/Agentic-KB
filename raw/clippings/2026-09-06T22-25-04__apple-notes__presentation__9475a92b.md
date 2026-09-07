---
title: "Presentation"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p8276
captured_at: 2026-09-06T22:25:04.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: 9475a92b2703c57e6d3130a1f68e2de0117e14ae2aca44e51e7478c407b5dbed
---

Presentation


￼
——

CENTRAL THESIS


Beyond Coding Agents - The Architecture of the Autonomous Software Factory

Code generation is becoming abundant. Trusted autonomous software delivery is not.


Beyond Coding Agents — central thesis

￼

Purpose: Establish the argument, not just the topic.

Talking script: “I want to explore a fairly simple thesis: code generation is becoming abundant, but trusted autonomous software delivery is not. Models are getting dramatically better at reasoning, coding, planning, and tool use. As that happens, producing another candidate implementation becomes less interesting than determining whether autonomous work is correct, secure, authorized, economical, and actually ready for production. I believe that changes the architecture of developer platforms. We move from systems designed primarily to help humans write code toward systems designed to turn human intent into trusted outcomes. I call that an autonomous software factory. I want to walk through the architectural consequences I think follow from that, and also the assumptions behind them that I think we should continue trying to falsify.”

Key line: “Code generation is becoming abundant. Trusted autonomous software delivery is not.”

Transition: “To understand why I think the architecture changes, it helps to look at where we’ve been.”



The Paradigm Shift
￼

Traditional → AI-Assisted → AI-Native 

Your visual progression:

Traditional SDLC

Human writes code → AI-Assisted SDLC

Human + AI write code → AI-Native Software Factory

Human directs, Agents execute and Platform governs

Purpose: Show that this is more than faster coding.

Talking script: “I think we’re going through something more significant than simply adding AI to the existing SDLC. In traditional development, humans perform essentially the entire lifecycle: plan, design, code, test, review, deploy, and operate. The first generative-AI wave gave us AI-assisted development. The human still owns the same workflow, but AI accelerates portions of it. What I think comes next is structurally different. The builder increasingly defines the outcome, constraints, architecture, and acceptance criteria. Agents perform increasingly large portions of the implementation. And the platform determines whether that work is authorized, correct, secure, economical, and ready to ship. So we’re not simply making developers faster. We’re changing the software-development operating model.”

Important nuance: “Humans don’t disappear. Human responsibility moves upward—from manually performing every action toward defining intent, architecture, constraints, verification, and authority.”

Transition: “And once generation improves dramatically, the bottleneck moves somewhere else.”

⸻



The Inflection Point — generation becomes abundant; trust becomes scarce 
￼

If agents can produce 10x more code, we can't ask humans to do 10x more review.
"Builders define the what. The factory determines the how."
Verification must be intelligent, automated, and scalable.

Generation becomes abundant; trust becomes scarce

Purpose: Establish the bottleneck shift.

Talking script: “This is the inflection point underneath the rest of my argument. The marginal cost of generating software is collapsing, but the marginal cost of trusting software isn’t collapsing at the same rate. Imagine agents can produce ten times more implementation. We obviously can’t respond by asking engineers to perform ten times more conventional review. We’ve simply moved the bottleneck downstream. The challenge changes from ‘Can the agent produce something?’ to ‘Can we establish that the result should be trusted?’ That means verification itself has to become intelligent, automated, layered, and scalable.”

Key lines: “If agents can produce 10x more code, we can’t ask humans to do 10x more review.” · “Generation scales output. Verification scales trust.”

Technical point: “That’s why I don’t think autonomous software development is primarily a code-generation problem. Eventually it becomes a trust-scaling problem.”

Transition: “If that’s true, it also changes what the human should have to tell the system.”


⸻


Builders Intent Become the Interface
￼

Purpose: Shift the interface from tools/models to outcomes.

Talking script: “My first architectural prediction is that builder intent increasingly becomes the primary interface. Today we expose a surprising amount of AI implementation machinery to users: which model, which agent, which skill, which tool, which MCP server, which workflow. I think much of that eventually becomes infrastructure. The builder should increasingly describe the desired outcome, constraints, acceptance criteria, relevant context, and success metrics. The factory converts that into something much stronger than a prompt—an executable intent contract. From that contract, the system can clarify consequential ambiguity, decompose the work, resolve dependencies, select capabilities, establish budgets, and determine the verification strategy.”

Key line: “Builders define the what. The factory determines the how.”

Nuance: “That doesn’t mean the builder gives up architectural control. Architecture and constraints can themselves be part of intent.”

Transition: “Once work is represented in terms of capabilities rather than individual tools, the way we think about models changes too.”






Models become interchangeable Execution Resources  - 

￼
￼
Purpose: Show model independence as an optimization mechanism, not just vendor flexibility.

Talking script: “I increasingly think of models as execution resources with different capability profiles. Model independence isn’t primarily interesting because it avoids vendor lock-in. Model independence creates optionality, and routing turns that optionality into economics. Once the factory understands the workload, it can determine the capabilities required: task type, complexity, quality requirement, security classification, latency, context size, reliability, availability, and cost. One model may be exceptional at planning, another at implementation, another may provide sufficient quality at dramatically lower cost, and another may be required because of data policy. Those decisions should increasingly be informed by evaluation performance on our workloads, not just public benchmarks.”

Tokenomics: “I wouldn’t optimize around cost per token. I’d optimize around cost per accepted outcome. A model that is fifty percent cheaper but causes three retries, fails verification twice, and requires twenty minutes of engineer correction isn’t actually cheaper.”

Key lines: “Model independence creates optionality. Routing turns optionality into economics.” · “Cost per accepted outcome, not cost per token.”

Titus-proof qualifier: “And if models eventually converge enough that routing stops creating meaningful value, simplify it. Routing is a mechanism, not a religion.”

Transition: “But increasing model intelligence introduces another distinction that I think is even more important.”




 The Harness become the Control Boundary —

￼
￼

Purpose: Separate intelligence from enterprise authority.

Suggested visual headline: Intelligence Does Not Imply Authority

Talking script: “As models get smarter, I expect them to absorb capabilities that currently live in agent frameworks—planning, tool selection, context management, and potentially portions of orchestration. But there are capabilities I don’t think an enterprise should delegate simply because intelligence improves: identity, authorization, policy, resource budgets, durable state, execution boundaries, audit, and consequential authority. The model reasons. The agent acts. The control plane authorizes. And the execution environment enforces those boundaries.”

Sandbox: “The sandbox shouldn’t merely isolate compute; it should bound authority. That means repository scope, filesystem access, credentials, network egress, available tools, compute, execution time, and token budget. The agent should receive only the capabilities required for the task rather than inheriting the ambient authority of the person who launched it.”

Key lines: “Allow intelligence to operate. Always bound authority.” · “The agent shouldn’t inherit the ambient authority of the human who launched it.”

Transition: “Once agents can act with bounded authority, the next question becomes whether their work deserves to survive.”


 
Verification Becomes the Scarce Resource —



￼

Purpose: Make verification the center of your thesis.

Talking script: “This is the part of the thesis I feel strongest about. As generation scales, verification becomes the scarce resource. And I don’t think verification means replacing a human reviewer with one LLM judge. Verification should be heterogeneous and layered: compile and test, static analysis, security scanning, policy and compliance, agentic code review, dynamic runtime evaluation, independent verification, and finally evidence and attestation. Use deterministic mechanisms wherever the property can be deterministically checked. Use probabilistic evaluators where correctness is semantic. Use runtime evaluation where static evidence isn’t sufficient. And preserve human judgment for uncertainty and consequence that justify its cost.”

Independent verification: “Independent verification doesn’t simply mean calling another model. Independence is about failure-mode diversity. The same model with a different prompt may still have highly correlated failures. Independence can come from deterministic tests, independently derived acceptance criteria, different context, security tooling, adversarial evaluation, different models, or different implementations.”

Key lines: “The producer should not be the sole judge of its own work.” · “Verification strength should be proportional to consequence.”

Transition: “But if the system says a change passed verification, we need something stronger than ‘trust me.’”


Evidence Becomes Part of the Artifact — claims → evidence → authority → acceptance

￼
￼


Purpose: Show that autonomous delivery requires proof, not just output.

Talking script: “I think autonomous development also changes what we consider the software artifact. Traditionally we preserve the resulting state: code, tests, dependencies. But when autonomous systems perform consequential work, I also need the evidence supporting the claims we’re making about that state. What was the original intent? What plan was executed? Which models and tools participated? What context was used? What changed? What tests ran? What evaluation occurred? What security and policy checks passed? Who approved consequential decisions? And eventually, what happened in production?”

Claims → Evidence: “If the factory claims tests passed, show me the test evidence. If it claims security validation passed, show me the scanner, policy, and result. If it claims an action was authorized, show me the identity and policy decision. If it claims the acceptance criteria were satisfied, show me the evidence supporting that assertion.”

Nuance: “I’m not arguing that we preserve every token of every agent trajectory forever. Raw trajectories can be expensive, sensitive, noisy, and model-specific. Preserve the decision-relevant evidence necessary for reproducibility, debugging, auditability, and trust.”

Key lines: “The output isn’t just code. It’s code plus evidence.” · “The artifact becomes a set of claims backed by evidence.”

Transition: “And that evidence creates something else extremely valuable: outcome data.”




Learning Becomes Governed — execute → observe → evaluate → propose → validate → promote
￼
￼
Purpose: Separate autonomous learning from production promotion.

Talking script: “Every factory execution now produces signals. Which models worked? Which context was missing? Which tools failed? Which verifier caught the defect? Which findings did engineers reject? Which changes caused production regressions? Which workflows consumed too much money? That gives the system the ability to improve itself. But I’m not primarily talking about retraining the foundation model. The system around the model can learn: routing, prompts, skills, context retrieval, tools, policies, evaluations, and repository-specific rules.”

Learning loop: “The loop becomes execute → observe → evaluate → diagnose → propose → validate → promote. But I draw a hard distinction between discovering an improvement and deploying an improvement. Candidate behavior should compete against a baseline through evaluation, then move through shadowing, canarying, governed promotion, and rollback if necessary.”

Key line: “Learning can be autonomous. Promotion should be governed.”

Transition: “Now we can put these ideas together.”



Meta Factory Architecture — complete end-to-end architecture
￼
￼

Purpose: Synthesize the thesis into one system.

Talking script: “When I combine those ideas, this is what I mean by an autonomous software factory. A builder expresses executable intent. Planning decomposes the objective and resolves dependencies. Capability routing determines the appropriate models, agents, tools, and skills. Durable orchestration manages execution state, budgets, retries, and recovery. Agents execute inside bounded environments. Independent verification determines whether the resulting work satisfies the required acceptance criteria and policy. The factory assembles evidence supporting those claims. Human or policy authority governs consequential decisions. The change gets delivered. We observe the production outcome. And that outcome feeds the learning system.”

Architecture spine: Intent → Plan → Route → Orchestrate → Execute → Verify → Evidence → Authority → Deliver → Outcome → Learn.

Cross-cutting control plane: Identity | Policy | Budget | Observability | Audit | Governance.

Foundation: Enterprise context | Repository intelligence | Organizational knowledge.

Most important line: “The boxes aren’t actually the important architecture. The important architecture is the separation of reasoning, execution, verification, authority, and learning. Those boundaries allow autonomy to increase without requiring unconditional trust in any individual model.”

Key distinction: “A harness executes an agent. A software factory governs the work.”

Transition: “Once that architecture exists, the next question becomes where we should actually invest.”




What Commoditizes vs. What Remains Durable — your strategic investment thesis
￼

Purpose: Show strategic judgment about where Adobe should build vs. adopt.

Talking script: “One of the most important strategic questions is where an organization should actually invest engineering capacity. I expect significant parts of today’s AI stack to commoditize quickly: foundation-model access, generic agent loops, generic coding, basic tool calling, basic orchestration, generic code review, prompt techniques, and basic MCP connectivity. I would be cautious about building large proprietary platforms around capabilities where the market is improving extraordinarily quickly.”

Durable differentiation: “Where I think enterprise differentiation remains more durable is enterprise context, repository intelligence, secure execution, identity and authorization, policy and governance, verification systems, evidence and provenance, domain-specific capabilities, outcome data, learning loops, and end-to-end builder workflows.”

Key lines: “Adopt what commoditizes. Invest in what differentiates.” · “Proprietary should be an outcome of differentiation, not an architectural preference.” · “Build for a moving boundary.”

Transition: “Of course, that assumes I’m right about where the boundary moves, and there are several ways I could be wrong.”




Where I Could Be Wrong — explicit falsifiable assumptions
￼
Purpose: Demonstrate falsifiability and intellectual flexibility.

Talking script: “This space is moving too quickly to pretend any of this architecture is settled. There are several assumptions I’d continuously try to falsify. First, models may absorb planning, context management, tool orchestration, and execution semantics much faster than I’m assuming. Second, inference economics may collapse enough that cost-based routing becomes much less important. Third, AI verification may approach or exceed human verification for broad categories of software changes. Fourth, we may discover that much less execution evidence is required for reproducibility and trust than I’m currently assuming.”

Key line: “If the evidence tells me one of those things has become reliably commoditized, I want to delete architecture—not defend it.”

Best line on the slide: “The architecture should get simpler as models get better, not fight to justify its own existence.”

If Titus asks what changes your mind: “Evidence. If evaluation shows a capability we considered strategic has become reliably commoditized, the architecture should let us replace it.”

Transition: “And if this technical shift is real, the implications aren’t only architectural. They change how engineering work itself is organized.”






13. AI Workforce Transformation — How Roles and Leadership Change
￼
Purpose: Connect the architecture to workforce transformation without turning the talk into an org-design presentation.

Talking script: “The most interesting consequence may be organizational. As agents perform more implementation, human value moves upward toward intent, architecture, decomposition, acceptance criteria, technical judgment, verification, and governance. Engineers increasingly become architects and governors of autonomous production. Product managers can move closer to executable prototypes. Designers participate more directly in implementation. QA moves upstream toward evaluation and acceptance. Operations becomes increasingly AI-augmented.”

Leadership angle: “And leaders have to manage differently too. You can’t manage an AI-native engineering organization only through headcount, sprint capacity, and individual output. Leaders increasingly have to manage systems of leverage: agent capability, verification strength, platform reuse, evaluation quality, learning loops, and human attention. Team design also changes. The scarce human resource becomes judgment, not typing speed.”

What leaders need to do differently: “Define clear ownership boundaries between platform and domain teams. Measure outcomes rather than raw activity. Treat evaluation and observability as core engineering disciplines. Create paved paths so governed autonomy is easier than bypassing the platform. Invest in upskilling engineers from implementers toward architects, evaluators, and governors. And maintain accountability even when more work is performed by autonomous systems.”

Key lines: “AI doesn’t remove engineering responsibility. It moves it up a level.” · “The engineer increasingly becomes an architect and governor of autonomous production.” · “Leaders increasingly manage systems of leverage, not just teams of people.”

Transition: “And that’s why I think Adobe is in a particularly interesting position.”




 Adobe’s Future that Im optomic about

￼

Purpose: Make the thesis relevant to Adobe without turning the presentation into a sales pitch.

Talking script: “This is why I’m particularly optimistic about Adobe. You have a large population of engineering builders, a highly heterogeneous repository landscape, mature products alongside newer cloud services, and agentic experimentation already emerging across teams. And the Builders Experience vision extends beyond developers. That creates an opportunity that is much larger than building another coding assistant.”

Adobe opportunity: “Meta Factory can become the substrate that turns fragmented AI experimentation into shared organizational capability. It can provide common identity, policy, sandboxing, routing, context, verification, evidence, and learning while still allowing teams to build domain-specific agents and workflows. That lets Adobe centralize the invariants teams shouldn’t reinvent and federate the expertise that belongs close to the domain.”

Strategic framing: “And because Adobe is simultaneously building customer-facing AI products, the internal factory can potentially create another feedback loop: what Adobe learns about safe, productive agentic workflows internally can inform broader product strategy.”

Key lines: “Meta Factory can turn fragmented AI experimentation into organizational capability.” · “Centralize invariants. Federate expertise.” · “Standardize the substrate, not the innovation.”

Optional bold line: “Meta Factory can become the agentic operating system for how Adobe builds.”

Transition: “And that brings me back to the principle I’d want to use to guide the entire architecture.”




Closing — Build for a Moving Boundary
￼

Purpose: End on the durable principle, not on a feature list.

Talking script: “So my thesis isn’t that today’s agent frameworks become permanent infrastructure. Quite the opposite. I expect significant portions of today’s stack to commoditize or disappear as models improve. What I think persists is the need to turn builder intent into bounded execution, independently verified evidence, governed decisions, and measurable outcomes. The architecture has to do that regardless of which model, agent framework, or orchestration technique happens to be best six months from now.”

Closing line: “I don’t want to architect around today’s model limitations. I want to architect around what remains durable as models improve.”

Final sentence: “That’s what I think the autonomous software factory becomes.”

⸻
