---
title: "Presentation"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p8490
captured_at: 2026-09-07T21:37:40.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: b16ca7e84d9d52ebc7a5862967befdff2bed3edcaa48f7941697dc7c8ba1dcd3
---

Presentation


￼


The content and thesis are strong, but the original deck had one major visual weakness: several slides were essentially small crops of the master infographic plus repeated prose, which made the diagrams harder to read than they should be during an onsite presentation. I improved the deck by tightening the thesis, adding presentation guidance into the speaker notes, strengthening the cover, and adding a dedicated bar-raiser Q&A appendix.

Download the revised Adobe Technical Vision deck⁠

I also made the wrong tradeoff after the Keynote compatibility failures: I simplified the deck until it became technically safe but visually mediocre. That’s not acceptable for this use case.

What I would change

This needs to be rebuilt as an executive technical narrative, not another collection of boxes. In particular, Slide 7 should look much more like a real architecture infographic:

BUILDER INTENT
↓
PLAN & DECOMPOSE
↓
ROUTE CAPABILITIES
↓
BOUNDED EXECUTION
↓
INDEPENDENT VERIFICATION
↓
EVIDENCE + HUMAN AUTHORITY
↓
DELIVER / OBSERVE / LEARN

Underneath it, a visually distinct Control Plane spans the lifecycle:

Identity | Policy | State | Budgets | Observability | Audit | Governance

And the learning loop should visually return production outcomes to the factory, rather than sitting in a random rectangle underneath it.

More broadly, I would rebuild the presentation around 8 strong slides instead of 10 dense ones:

Beyond Coding Agents — provocative thesis, minimal cover.
The SDLC Is Becoming a Factory Loop — one strong visual showing Traditional → Assisted → Autonomous.
Builder Intent Becomes the Interface — personas feeding an intent contract, with complexity hidden behind Meta Factory.
Intelligence Becomes Routable — model/capability routing + tokenomics, with cost per accepted outcome as the centerpiece.
Autonomy Requires a Control Plane — model vs. control plane vs. secure sandbox; this is where Shibu’s sandboxing priority lands.
Verification Becomes the Bottleneck — visually the strongest slide: generation exploding while verification becomes the scarce resource.
The Autonomous Software Factory — the complete architecture, beautifully rendered and readable from across a conference room.
Where Adobe Should Differentiate — commoditize vs. durable capabilities + workforce transformation + “where I could be wrong.”



=========

The story you should tell

The deck now has a very deliberate narrative:

Code generation becomes abundant → intent becomes the interface → models become resources → the control plane governs → verification becomes scarce → evidence becomes the artifact → the pieces form a software factory → Adobe invests where differentiation remains durable → workforce transformation follows.

That is much stronger than presenting “here are the components of an agent platform.”

Slide 1 — Beyond Coding Agents

Purpose: Establish a provocative thesis immediately.

Talking script:

“I wanted to use this discussion to explore a technical shift I’ve become increasingly opinionated about through both my work at Workday and the autonomous software-factory systems I’ve been building personally.

My thesis is pretty simple:

Code generation is becoming abundant. Trusted autonomous software delivery is not.

I think we’re moving beyond AI-assisted coding toward an AI-native software-development operating model, where builders increasingly define intent and acceptance criteria, agents perform more of the implementation, and the platform governs execution, verification, evidence, authority, and learning.

What I’d like to explore is what that changes architecturally, what I think becomes scarce, what I think becomes durable, and importantly, where I think this thesis could be wrong.”

Then move.

Do not introduce your résumé here.

⸻

Slide 2 — The AI-Native SDLC Paradigm Shift

Key message: This isn’t just better coding assistance.

Talking script:

“I see this evolution in three stages.

In the traditional SDLC, humans perform almost every activity.

With AI-assisted development, the workflow is still fundamentally human-led, but AI accelerates individual steps like coding, testing, documentation, and analysis.

The third stage is structurally different.

In an AI-native software factory, the builder increasingly defines the outcome, constraints, architecture, and acceptance criteria, while agents perform more of the implementation and execution.

The platform then determines whether that work is authorized, correct, secure, economical, and ready to ship.

So I don’t think we’re simply accelerating the SDLC.

We’re changing who performs the work inside it.”

Don’t over-explain this slide. About 60 seconds.

⸻

Slide 3 — Builder Intent Becomes the Interface

Key message: Outcome, not tooling, becomes the abstraction.

Talking script:

“Once that happens, I think builder intent becomes the primary interface.

I don’t want an engineer, PM, designer, or QA engineer needing to understand which model, agent, skill, MCP server, or orchestration framework should execute their request.

The builder should tell the system:

Here’s the outcome I want. Here are the constraints. Here’s the relevant context. And here’s what good looks like.

The factory turns that into an executable contract.

It clarifies ambiguity, establishes acceptance criteria, decomposes the work, selects capabilities, and determines how the result should be verified.

That’s also why I think Adobe’s term Builder is important.

As the implementation machinery disappears behind the platform, the population capable of building expands.”

Key line:

“Builders define the what. The factory determines the how.”

⸻

Slide 4 — Models Become Interchangeable Execution Resources

This is where you connect to Shibu’s tokenomics concern.

Talking script:

“The next shift is how I think about models.

I don’t think the architecture should organize itself around one preferred foundation model.

I increasingly think of models as execution resources with different capability profiles.

Once work is decomposed, the router can choose capabilities based on task type, complexity, historical evaluation performance, security, latency, context requirements, availability, and cost.

But the important part is that routing itself has to learn from outcomes.

Public benchmarks aren’t enough. I want to know how these models perform against our actual workloads.

And economically, I wouldn’t optimize for cost per token.

I’d optimize for cost per accepted outcome.

A cheaper model that creates three retries and twenty minutes of human correction isn’t actually cheaper.”

Key line:

“Model independence creates optionality. Routing turns optionality into economics.”

⸻

Slide 5 — The Harness Becomes the Control Boundary

This needs to sound nuanced because a bar raiser may challenge whether harnesses themselves will disappear.

Talking script:

“I actually expect models to absorb more of what currently lives in agent frameworks.

Planning will improve. Tool selection will improve. Context handling will improve. Some orchestration will probably move into the models themselves.

But there are capabilities I don’t think an enterprise should delegate to probabilistic intelligence:

Identity. Authorization. Policy. Durable state. Budgets. Audit. And consequential authority.

The model can reason about what should happen next.

The control plane determines whether that action is permitted, affordable, observable, and recoverable.

And execution happens inside a bounded environment with scoped repositories, files, credentials, network access, compute, time, and budget.

That’s why I think the sandbox isn’t merely isolating compute.

It’s bounding authority.”

Key lines:

“Models reason. The control plane governs.”

“The sandbox should bound authority, not just compute.”

⸻

Slide 6 — Verification Becomes the Scarce Resource

This should be your strongest slide.

Slow down here.

Talking script:

“This is probably the part of the thesis I feel strongest about.

The cost of generating software is collapsing much faster than the cost of trusting software.

If agents can eventually produce ten times more implementation, we can’t respond by asking humans to perform ten times more review.

Verification itself has to become intelligent, automated, layered, and scalable.

I think that verification plane combines deterministic and probabilistic mechanisms.

Compile and test.

Static analysis.

Security and policy.

Agentic code review.

Dynamic and trajectory evaluations.

Independent verification.

And evidence against the original acceptance criteria.

One principle I’ve become particularly opinionated about is independence:

The agent that produced the work shouldn’t be the only system deciding whether that work is correct.

Generation tells us what the agent produced.

Verification tells us whether we should trust it.”

That’s your bar-raiser moment.

⸻

Slide 7 — Code + Evidence Becomes the Artifact

This is one of the more differentiated parts of your thesis.

Talking script:

“That leads to another architectural change.

If autonomous systems perform increasingly consequential work, the artifact can’t simply be the code.

I also need the evidence behind the code.

What was requested?

What acceptance criteria applied?

What plan executed?

Which models and tools participated?

What context influenced the result?

What changed?

What tests and security checks passed?

What evaluations ran?

Who approved consequential decisions?

And what ultimately happened in production?

That evidence gives us reproducibility, debugging, auditability, compliance, evaluation replay, and learning.

So I think autonomous delivery changes the definition of the software artifact itself.”

Key line:

“The output isn’t just code. It’s code plus evidence.”

Then:

“The trajectory becomes part of the artifact.”

⸻

Slide 8 — The Autonomous Software Factory

This is where everything comes together.

Don’t explain every box individually.

Talking script:

“Put those ideas together and this is what I mean by an autonomous software factory.

A builder expresses intent and acceptance criteria.

Planning decomposes the objective.

Routing selects the appropriate models, tools, and skills.

Agents execute inside bounded environments.

Independent systems verify the work and generate evidence.

Humans retain authority over consequential decisions.

Outcomes then feed the learning system.

Across the entire lifecycle sits a control plane governing identity, policy, budgets, state, observability, audit, and authority.

The important architectural idea isn’t any individual box.

It’s the separation between reasoning, execution, verification, authority, and learning.

That’s the distinction I make between an agent harness and a software factory:

A harness executes an agent. A software factory governs the work.”

⸻

Slide 9 — What Commoditizes vs. What Remains Durable

This may be your most important Senior Manager slide.

It proves technical strategy rather than just technical architecture.

Talking script:

“Then there’s the strategic investment question:

What should Adobe actually build?

I expect a lot of today’s stack to commoditize quickly.

Foundation-model access.

Generic coding.

Basic agent loops.

Generic tool calling.

Some orchestration.

Some generic code review.

I would be cautious about building large proprietary systems around capabilities whose primary advantage depends on today’s model limitations.

Where I think enterprise differentiation remains more durable is enterprise context, secure execution, identity and policy, repository intelligence, evaluation and verification, domain capabilities, outcome data, learning loops, and end-to-end builder workflows.

So the architecture needs to let Adobe adopt aggressively where the market commoditizes while investing deeply where Adobe differentiates.”

Key lines:

“Build for a moving boundary.”

“Proprietary should be an outcome of differentiation, not an architectural preference.”

This is exactly the type of argument a bar raiser can challenge.

⸻

Slide 10 — From Developers to Builders / Why Adobe

You need to accomplish three things here:

Workforce transformation.
Adobe relevance.
Intellectual humility.

Talking script

“The final consequence is organizational.

I think Shibu’s framing of ABX as workforce transformation is exactly right.

As agents perform more implementation, engineers move increasingly toward architecture, intent, constraints, verification, reliability, and governance.

Product managers become capable of producing executable prototypes.

QA moves farther upstream into acceptance criteria and evaluation.

Designers participate more directly in implementation.

That’s why I think builder becomes a more useful abstraction than developer.

And Adobe is particularly interesting because you have roughly 15,000 engineering builders, a highly heterogeneous engineering environment, and agentic experimentation already occurring across teams.

Meta Factory has the opportunity to turn those fragmented experiments into a shared organizational capability.

But I also want to acknowledge where this thesis could be wrong.

Harness capabilities may commoditize faster than I expect.

Inference economics may collapse.

AI verification may exceed human review across more workload classes.

So I don’t want to architect around today’s model limitations.

I want to architect around what I think remains durable even as models improve:

authority, evidence, secure execution, evaluation, enterprise context, outcomes, and learning.

That’s why I think the destination isn’t simply a better coding assistant.

It’s an Agentic Operating System for how Adobe builds.”

Then stop.

Do not keep selling.

Invite the challenge.

⸻

Slide 11 — Q&A Appendix

I added this as an appendix, not part of your prepared presentation.

It contains five challenges I think the bar raiser is particularly likely to push:

Why won’t better models eliminate the harness?
Why should Adobe build any of this?
How autonomous should the factory become?
What if inference becomes nearly free?
What part of your thesis may be wrong?

You shouldn’t present this slide unless it becomes useful during Q&A.

⸻

Recommended timing

Your original deck could easily turn into a 20+ minute architecture lecture. Don’t do that.

I would target:

Slide 1: 1:00
Slide 2: 1:00
Slide 3: 1:00
Slide 4: 1:15
Slide 5: 1:15
Slide 6: 2:00
Slide 7: 1:15
Slide 8: 1:30
Slide 9: 1:30
Slide 10: 1:30

Total: roughly 13 minutes.

That leaves approximately 30 minutes for the structured Q&A, which is where I believe the actual bar-raiser evaluation happens.

The five lines I would memorize

You don’t need to memorize the entire presentation. Memorize these:

“Code generation is becoming abundant. Trusted autonomous software delivery is not.”

“Builders define the what. The factory determines the how.”

“Models reason. The control plane governs.”

“The agent that produced the work shouldn’t be the only system deciding whether the work is correct.”

“Build for a moving boundary. Invest in what remains durable even as models get better.”

Those five lines give the entire presentation a spine.

I also embedded expanded talking guidance into the deck’s speaker notes, so you can rehearse directly from PowerPoint rather than maintaining a separate script. ———————

—




Adobe explicitly told you:

“Candidate presents a technical topic of their choice relevant to agentic systems, followed by structured Q&A.”

A concise, polished deck will make you look much more intentional than trying to verbally walk through a complicated autonomous-software-factory thesis. More importantly, your topic is inherently architectural and benefits enormously from visuals.

But I would not turn the 15-section infographic into 15 slides. That’s too much. The presentation should be about 8–10 slides and roughly 10–12 minutes, leaving most of the 45 minutes for technical discussion.

The deck I recommend

￼
Slide 1 should immediately establish a position

Don’t start with your résumé.

I’d open:

“I wanted to use our time to discuss a technical shift I’ve become pretty opinionated about through both my work at Workday and the autonomous software-factory systems I’ve been building personally.

My thesis is simple:

Code generation is becoming abundant. Trusted autonomous software delivery is not.

I think we’re moving beyond coding assistants toward an AI-native software-development operating model, where builders increasingly define intent and acceptance criteria, agents perform more of the implementation, and the platform governs execution, verification, evidence, authority, and learning.

I’d like to walk through why I think that shift matters architecturally, what I believe becomes durable, and also where I think this thesis could be wrong.”

That’s a much stronger start for a bar raiser than “Here are the components of an AI software factory.”

Slide 6 is probably your most important technical slide

Title:

Verification Becomes the Bottleneck

Show visually:

Cost of Generation ↓↓↓

Volume of Generated Code ↑↑↑

Verification Demand ↑↑↑

Then your verification stack:

Compile/Test → Static Analysis → Security → Policy → Agentic Code Review → Dynamic Evals → Independent Verification → Evidence

Say:

“If agents can generate ten times more implementation, we can’t respond by asking humans to perform ten times more review.

Verification itself has to become intelligent, automated, and scalable.

And one architectural principle I care deeply about is independence: the agent that produced the work shouldn’t be the only system deciding whether that work is correct.”

That’s where Mission Control becomes supporting evidence.

Slide 9 is probably your best bar-raiser slide

What Commoditizes vs. What Remains Durable

Likely to commoditize

Foundation models
Generic coding agents
Basic agent loops
Generic tool calling
Basic orchestration
Generic code review
Prompt techniques
Basic MCP connectivity

Durable enterprise capabilities

Enterprise context
Secure execution & sandboxing
Identity, authorization & policy
Repository intelligence
Evaluation & verification
Domain-specific capabilities
Outcome data & learning loops
End-to-end builder workflows

Then:

“The investment mistake I’d want to avoid is spending Adobe engineering capacity rebuilding the left side while underinvesting in the right.

Build for a moving boundary. Adopt aggressively where the ecosystem commoditizes and invest deeply where Adobe differentiates.”

That demonstrates technical strategy, not just architecture.

End with uncertainty, not a sales pitch

On slide 10, include a small section:

Where I Could Be Wrong

Harness capabilities may commoditize faster than expected.
Inference economics may collapse, reducing cost-routing importance.
AI verification may approach or exceed human review for many workloads.

Then close:

“I don’t want to design around the assumption that today’s model limitations remain permanent.

I want to design around the things I believe remain durable even as intelligence improves: authority, evidence, secure execution, evaluation, enterprise context, measurable outcomes, and organizational learning.

That’s why I think the destination isn’t simply a better coding agent.

It’s a governed autonomous software factory.”

Then stop.

Let them challenge you.

One thing I would deliberately avoid

Don’t make the presentation overly Adobe-specific.

This is an industry-perspective interview. You want the bar raiser thinking:

“Jay has a technical thesis about where the industry is going that could influence how we think about Meta Factory.”

Not:

“Jay researched our job description and built us a Meta Factory proposal.”

Use Adobe as the application of your thesis near the end, not as the premise of the presentation.

And yes, I think we should build the actual deck next. I would make it 10 slides, visually sophisticated, architecture-heavy, very little text, with speaker notes containing your complete talking script. That would give you both the presentation and the rehearsal material in one artifact.
