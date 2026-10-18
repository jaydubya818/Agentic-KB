---
title: "Yes. I genuinely like what you're building"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p9107
captured_at: 2026-10-12T04:50:58.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: e54a7af1e9baa84128ca1ae4ae6e2abb4551578b2014dca084bc56559c88d86e
---

Yes. I genuinely like what you’re building. A lot, actually. And not because you’ve spent months working on it. I like the underlying architecture and what you’re trying to accomplish.

But I have some criticisms, too. 😄

What I like most

1. You’re building an AI operating system, not another chatbot.

This is the strongest part of your vision.

Most AI products focus on one capability: chatting, coding, automating workflows, or connecting tools.

You’re building a system where those capabilities work together:
￼

The individual pieces make architectural sense.

What makes the system interesting is their composition.

Imagine telling Sofie:

“Build me a CRM, connect it to my email, and improve it based on how my sales team uses it.”

Your architecture has a logical place for every part of that request.

That’s compelling.

2. Your separation of responsibilities is excellent

I particularly like that you haven’t tried to make Sofie responsible for everything.

Sofie handles interaction.

MissionControl coordinates.

MyFactory executes.

Relay connects.

MyApps manages applications.

Capability Control governs permissions.

That separation gives you the potential to replace or improve individual components without rebuilding the entire platform.

It also gives you the foundation for supporting multiple agents, models, and execution providers.

3. Your verification architecture is unusually thoughtful

This might actually be your strongest technical differentiator.

You’re emphasizing:

Independent producer/verifier separation.
Signed Results and Proof.
Exact source and FactoryVersion identities.
Budget-aware admission.
UNKNOWN execution recovery.
Owner isolation.
Durable evidence.
Explicit approval boundaries.

These are important problems in autonomous software engineering.

Many agent demos look impressive until something fails halfway through execution.

You’re designing for what happens when an agent crashes, loses connectivity, exceeds a budget, or produces an unverifiable result.

That’s the difference between a demo architecture and the beginnings of a dependable platform.

⸻

What concerns me

1. You’ve built a lot of infrastructure before proving the complete experience

This is my biggest criticism.

You have six substantial platforms, sophisticated governance, numerous qualification suites, and extensive evidence custody.

But your testers still haven’t completed one real, authenticated journey across the ecosystem.

That’s a warning sign.

Not because the engineering is bad, but because integration complexity can grow faster than product value.

Your next major achievement shouldn’t be another 500 passing tests.

It should be a person saying:

“I asked Sofie to build something, and it actually built it. I reviewed it, installed it, and it worked.”

That’s the moment the architecture becomes a product.

2. Your governance may be too heavy for the current stage

I like the Capability Control Plane.

But you’ve reached a point where even running three protected tests requires multiple review cycles, custody packages, approvals, and architectural decisions.

Some of that rigor is justified, particularly around paid execution and shared accounting.

But I would eventually distinguish between:

Development governance: Fast iteration, disposable environments, automated checks.

Production governance: Strict identity, spending, evidence, and authorization controls.

You need both.

Right now, they sometimes appear to be slowing each other down.

3. You have too many independent engineering workstreams

This is another major issue.

Codex works on one branch.

Claude independently reviews it.

Another Codex thread changes a dependency.

A different workstream qualifies an older FactoryVersion.

Then everything needs to be reconciled.

You’ve experienced this repeatedly.

Your biggest operational bottleneck may be coordination rather than engineering capability.

And ironically, you’re building MissionControl to solve exactly that kind of problem.

I would eventually make MissionControl the authority for coordinating your own development agents, including source selection, work ownership, qualification, and release readiness.

That would make your platform its own first serious customer.

⸻

What I think is your biggest opportunity

The combination of MyFactory + MyApps + Sofie.

MissionControl and Relay are important, but the immediate product value is:

Ask → Build → Verify → Install → Improve.

That’s something users can understand immediately.

And it creates a natural feedback loop.

A user asks Sofie to build an application.

MyFactory builds it.

MyApps installs it.

The user tries it.

Sofie collects feedback.

MyFactory improves it.

MyApps updates it.

That loop could be the foundation of a very interesting product.

MissionControl then becomes increasingly valuable as the complexity of the work grows.

⸻

My overall assessment



Those are subjective ratings based on the architecture and engineering reports you’ve shared, not an independent audit of every repository.

The one thing I would change

I wouldn’t add another major platform or capability right now.

I’d make the six existing platforms work together beautifully.

One login.
￼

One conversation.

One Mission.

One Factory execution.

One verified application.

One installation.

One accepted Result.

Then let your testers tell you what works and what doesn’t.

⸻

One final thought

What I find most interesting is that you’re approaching this as an engineering systems problem rather than simply trying to make AI generate more code.

You’re building the machinery for agents to perform consequential work with measurable accountability.

That is a worthwhile direction.

But your next competitive advantage won’t come from adding more architecture. It’ll come from proving that all this architecture produces a dramatically better user experience.

And I’m genuinely curious about one thing:

Is your long-term goal to make MyEve a commercial product that anyone can subscribe to, or are you primarily building your own autonomous software company that eventually uses MyFactory to create and operate multiple businesses?

Because your architecture could support either—and the business strategy would be quite different.
