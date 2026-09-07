---
title: "Titus Winters — Technical Vision & Industry Perspective"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p8266
captured_at: 2026-09-06T19:26:13.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: 2a8889b488448b2d79a576a1418850bdb4c142a729d786ea549a43d4b31d7c11
---

Titus Winters — Technical Vision & Industry Perspective

￼
￼
What I think Titus is really testing

Assume he will agree with many of your premises:

Models will improve.
Coding agents will improve.
Tool use will improve.
Context windows will grow.
Agent frameworks will change.
AI-generated code will increase dramatically.

So simply explaining those things won’t raise the bar.

The interesting question is:

What architectural consequences follow if all of those things are true?

Your answer is:

The scarce resources move from intelligence and generation toward verification, authority, evidence, enterprise context, and measurable outcomes.

That’s the intellectual center of your presentation.

Everything else should support it.

⸻

Your 12-Minute Presentation

I would compress the infographic into 10–11 presentation slides, rather than trying to walk through every panel.

SLIDE 1 — Beyond Coding Agents

On screen

Beyond Coding Agents

The Architecture of the Autonomous Software Factory

Code generation is becoming abundant.
Trusted autonomous software delivery is not.

SAY THIS

“I want to start with a fairly simple thesis.

Code generation is becoming abundant. Trusted autonomous software delivery is not.

Models are getting dramatically better at reasoning, coding, planning, and tool use.

But if agents can generate ten times more software, the interesting problem becomes less about whether they can produce code and more about whether an enterprise can determine that their work is correct, secure, authorized, economical, and ready for production.

I think that changes the architecture of developer platforms.

And today I want to make six claims about where I think that architecture is going—and then talk about where I could be wrong.”

Time: ~60 seconds

That last sentence invites Titus into the debate.

⸻

SLIDE 2 — The Bottleneck Moves

Don’t spend much time explaining traditional → assisted → autonomous.

Titus knows.

Make the argument sharper.

SAY

“The first thing I think changes is the bottleneck.

Historically, software production was expensive because human engineering capacity was scarce.

Generative AI attacks that constraint directly.

But making generation cheap doesn’t automatically make delivery cheap.

In fact, it can create the opposite problem.

If I can generate software faster than I can understand, validate, secure, and approve it, I’ve moved the bottleneck downstream.

So my prediction is that generation becomes abundant while verification becomes scarce.

That’s the transition underlying everything else I’m going to show.”

Titus may interrupt here:

“Haven’t compilers and CI already done this?”

Answer:

“Absolutely—and I think autonomous development extends that same trajectory.

Compilers automated one class of correctness. CI automated repeatable integration checks.

What’s different now is that the producer itself is becoming autonomous and can dynamically choose plans, tools, context, and actions.

That expands the verification problem beyond ‘does this compile?’ into ‘did the system do the right thing, under the right authority, for the right reasons, with acceptable risk?’”

Excellent distinction.

⸻

SLIDE 3 — Intent Becomes the Interface

This is your first major prediction.

SAY

“My first prediction is that intent increasingly becomes the interface.

Today we expose enormous amounts of AI implementation machinery to developers:

models, prompts, agents, skills, tools, MCP servers, workflows.

I think much of that eventually becomes infrastructure.

The builder should increasingly specify an executable contract:

the outcome, constraints, acceptance criteria, relevant context, and success metrics.

The factory determines how to accomplish it.

That means planning, decomposition, capability selection and verification strategy increasingly become platform responsibilities.

Builders define the what. The factory determines the how.”

Then add one sophisticated qualifier:

“I don’t mean intent replaces code as a useful abstraction. I mean intent becomes the highest-level control surface from which increasingly large amounts of implementation can be derived.”

That prevents Titus from attacking an overly broad interpretation.

⸻

SLIDE 4 — Models Become Execution Resources

This is where you demonstrate economics and architectural sophistication.

SAY

“My second prediction is that models increasingly look like execution resources rather than architecture.

Model independence isn’t interesting to me primarily because of vendor lock-in.

It’s interesting because optionality allows optimization.

Once I’ve decomposed the workload, I can ask:

What capability does this task require?

What quality threshold?

What security classification?

What latency?

What context?

And what models have actually demonstrated acceptable performance for this workload?

Then I can route accordingly.”

Now your killer line:

“And I wouldn’t optimize cost per token. I’d optimize cost per accepted outcome.”

Explain:

“A model that’s half the inference cost but causes three retries, fails verification twice, and requires twenty minutes of engineer correction isn’t cheaper.”

Then go one level deeper:

Titus may ask:

“Why route at all if models converge?”

“Then I route less.

Routing isn’t a religious architectural requirement.

It’s economically justified only while meaningful differences exist across capability, security, latency, reliability, specialization or cost.

If those differences disappear, I want the architecture to simplify.”

That’s a very good Titus answer.

You’re defending the principle, not the implementation.

⸻

SLIDE 5 — Intelligence ≠ Authority

I would actually rename your slide from:

The Harness Becomes the Control Boundary

to:

Intelligence Does Not Imply Authority

Much stronger.

Then underneath:

Models reason → Agents act → Control plane authorizes

SAY

“This is probably my most durable architectural claim.

Intelligence and authority should remain separate concepts.

I expect models to absorb more planning.

More context management.

More tool selection.

Possibly significant portions of what we currently call orchestration.

But a model becoming smarter doesn’t mean it should get to decide what credentials it receives, what repositories it can mutate, how much money it can spend, whether it can reach production, or whether its own work should be accepted.

Those are authority decisions.”

Then:

“So I expect the precise harness boundary to move.

But I don’t expect enterprises to eliminate the authority boundary.”

And:

“Allow intelligence to operate. Always bound authority.”

This may be one of your strongest moments.

⸻

SLIDE 6 — Verification Becomes Scarce

Spend more time here than anywhere else.

SAY

“This is the claim I feel strongest about.

Generation scales output.

Verification scales trust.

If agents produce ten times more implementation, humans cannot perform ten times more conventional review.

Verification itself has to scale.”

Walk through your stack quickly:

Compiler → tests → static analysis → security → policy → agentic review → dynamic evaluation → independent verification

But make an important distinction:

“I don’t think this means replacing humans with an LLM judge.

Verification should be heterogeneous.

Deterministic mechanisms where possible.

Specialized evaluators where necessary.

Independent reasoning where useful.

Humans where uncertainty, consequence, or irreversibility justify the cost.”

Then:

“The producer should not be the sole judge of its own work.”

Expect Titus to attack this.

“Why does another model make verification independent?”

Great question.

Answer:

“It doesn’t automatically.

Independence is a property of failure modes, not simply model identity.

Calling the same model twice with two prompts may give me correlated failure.

Stronger independence can come from different mechanisms: deterministic tests, independently derived acceptance checks, security scanners, different models, different context, adversarial evaluation, or eventually independently implemented verifiers.

What I’m trying to avoid is a system where generation and acceptance share the exact same assumptions and failure modes.”

That answer is Principal/Distinguished-level.

Memorize it.

⸻

SLIDE 7 — Evidence Becomes Part of the Artifact

This may be your most differentiated idea.

SAY

“Once autonomous systems perform more consequential work, I think our definition of the software artifact changes.

Git gives us the resulting state.

But autonomous development creates another thing worth preserving: evidence about how that state came to exist.”

Then show:

Intent + Plan + Changes + Tests + Evals + Security + Provenance + Decisions

→

Trusted Software Artifact

“I want to know what intent initiated the work.

What context influenced it.

What tools acted.

What changed.

What verification ran.

What policies applied.

And what evidence justified acceptance.”

But introduce a nuance Titus may appreciate:

“I don’t necessarily mean storing every token of every trajectory forever.

Raw trajectories can be enormous, sensitive, noisy, and model-specific.

What needs to survive is the evidence necessary for reproducibility, auditability, debugging and trust.”

That’s stronger than claiming the entire trajectory always becomes the artifact.

⸻

SLIDE 8 — Learning Becomes Governed

SAY

“Once we have execution and outcome evidence, something else becomes possible.

The factory itself can improve.”

Then distinguish this sharply from training:

“I’m not primarily talking about retraining the foundation model.

I’m talking about improving the system around it:

routing,
skills,
prompts,
context strategies,
tools,
policies,
verification criteria,
and eventually perhaps models.”

Then:

Observe → Evaluate → Diagnose → Propose → Validate → Promote

“But I make a strong distinction between learning and promotion.

A system discovering a candidate improvement doesn’t mean that behavior should silently enter production.

Candidate behavior should compete against a baseline through evaluation and progressive rollout.”

Your line:

“Learning can be autonomous. Promotion should be governed.”

⸻

SLIDE 9 — Put the Architecture Together

Now use the big architecture.

Don’t explain every box.

Say:

“When I combine those ideas, I get something like this.”

Then walk left to right:

Intent → Plan → Route → Execute → Verify → Evidence → Authority → Deliver → Outcome → Learn

Across everything:

Identity | Policy | Budget | Observability | Audit

Then stop.

And say:

“But the boxes aren’t actually the important part.”

Pause.

“The important architecture is the separation of reasoning, execution, verification, authority, and learning.”

Then:

“Those separations allow autonomy to increase without requiring us to place unconditional trust in any individual model.”

That’s your architectural thesis in one sentence.

⸻

SLIDE 10 — What Commoditizes?

This is probably the most important strategy slide for Titus.

Don’t merely read the table.

Say:

“Now comes the investment question.

If I’m building this platform, what should I actually own?”

Likely to commoditize

Foundation models
Generic agent loops
Generic coding
Basic tool calling
Basic orchestration
Generic review
Prompt techniques
Basic MCP connectivity

Durable differentiation

Enterprise context
Repository intelligence
Secure execution
Identity and authorization
Policy
Verification systems
Evidence
Domain capabilities
Outcome data
Learning loops

Then:

“The strategic mistake would be spending enormous engineering capacity defending something on the left while underinvesting in something on the right.”

But avoid asserting permanence.

“And this boundary will move.

So I want replaceability on the commodity side and compounding advantage on the differentiated side.”

Killer line

“Build for a moving boundary.”

⸻

SLIDE 11 — Where I Could Be Wrong

Absolutely keep this.

It transforms the presentation from a pitch into a thesis.

SAY

“There are at least three assumptions here that I’d continuously try to falsify.”

1. Harness capabilities commoditize faster

“Models may absorb much more planning, context management and orchestration than I’m assuming.”

2. Inference economics collapse

“If high-quality reasoning becomes effectively cheap, economics becomes a much weaker routing dimension.”

3. Verification becomes dramatically stronger

“AI verification may eventually outperform human review across broad categories of software changes.”

Then add a fourth one.

4. Evidence requirements may become much more compact

“We may discover that reproducibility requires preserving far less trajectory information than we currently assume.”

Then:

“None of those outcomes actually bother me.

I don’t want to preserve architecture because I predicted it.

I want the system designed so evidence can tell us when an assumption has stopped being true.”

Fantastic segue into Q&A.

⸻

Your Closing

Memorize this nearly verbatim:

“So my thesis isn’t that today’s agent frameworks become permanent infrastructure.

Quite the opposite.

I expect significant portions of today’s stack to commoditize or disappear as models improve.

What I think persists is the need to turn builder intent into bounded execution, independently verified evidence, governed decisions, and measurable outcomes.

And the architecture has to do that regardless of which model, agent framework, or orchestration technique happens to be best six months from now.

That’s what I think the autonomous software factory becomes.”

Stop.

Don’t tack on another five minutes about Adobe.

Let Titus attack it.

⸻

Now Prepare for the Real Interview: Titus’s Q&A

This is where I’d spend 70% of your remaining preparation time.

There are about 15 questions I’d expect him to use to pressure-test this thesis.

￼


One Question I Really Want You Ready For

I can imagine Titus asking:

“You’re proposing a lot of infrastructure. Why isn’t this just an elaborate architecture around temporary model deficiencies?”

Your answer should be excellent.

I’d use:

“That’s exactly the failure mode I’m trying to avoid.

I separate capabilities into two categories.

Some compensate for current model limitations. Elaborate prompt scaffolding, certain planning loops, context tricks, perhaps portions of orchestration—I assume those may disappear.

The other category exists because an enterprise needs enforceable boundaries regardless of intelligence.

Identity, authorization, resource limits, policy enforcement, evidence, independent acceptance criteria and consequential authority aren’t primarily compensating for a dumb model.

They’re properties of operating a production system.

So I’d aggressively delete scaffolding as intelligence improves while preserving externally enforceable control boundaries.

The architecture should get simpler as models get better, not fight to justify its own existence.”

That last sentence is gold for this interview.

⸻

Another Dangerous Titus Question

“Why call this a software factory? Isn’t that metaphor encouraging centralized, industrialized software development?”

Answer:

“That’s a legitimate concern.

I’m using factory to describe the production system, not a centralized organizational model.

I don’t want a central team deciding how every Adobe team builds software.

I want centralized primitives where duplication is expensive—identity, execution isolation, evidence, evaluation infrastructure—and decentralized domain capabilities where local knowledge matters.

So the architecture is shared substrate plus federated specialization.

If the platform becomes a centralized tollbooth, we’ve designed it incorrectly.”

Very strong Senior Manager answer.

⸻

And the Question That Connects Everything

Titus:

“What’s actually new here?”

Don’t get defensive.

Say:

“Almost none of the individual mechanisms are new.

Sandboxing isn’t new. CI isn’t new. Policy engines aren’t new. Evaluation isn’t new. Workflow orchestration isn’t new.

What changes is the producer.

We’re introducing probabilistic systems capable of dynamically planning and taking increasingly consequential actions at machine scale.

That changes the relative importance and composition of those mechanisms.

My thesis isn’t that we invented verification or authorization.

It’s that as generation becomes abundant, those previously supporting concerns become the primary architecture of autonomous software delivery.”

That’s probably one of the best answers you can give him.

⸻

The Five Things Titus Should Remember About You

Don’t try to make him remember fifteen claims.

At the end of 45 minutes, you want five ideas associated with Jarrett West:

1. Code generation becomes abundant; verification becomes scarce.

2. Intelligence and authority are separate architectural concepts.

3. Cost per accepted outcome matters more than cost per token.

4. Autonomous software should produce evidence, not merely code.

5. Build for a moving boundary—adopt what commoditizes and invest in what remains durable.

Everything in your infographic ultimately supports those five.

nd there’s a subtle sixth message underneath all of them:

**You aren’t betting Adobe Meta Factory on today’s agents. You’re designing the substrate

for a future where models, agents, and orchestration layers will keep changing underneath it.**

That is the deeper message you want Titus to walk away with.

Now I’d Prepare You for the Debate

The presentation itself is strong enough. The bigger risk is getting pulled into a technical corner during Q&A and answering at the wrong level.

For Titus, use this pattern whenever he challenges a claim:

Position → Reasoning → Boundary → Tradeoff → Evidence that would change your mind

For example:

“My current position is that verification should remain architecturally independent from generation.

The reason is correlated failure risk.

I don’t mean that every verifier must be a different model; independence can come from deterministic tests, separately derived acceptance criteria, different context, adversarial evaluation, or different implementations.

The tradeoff is cost and latency.

If evidence showed a unified model could produce and self-verify at equivalent reliability with materially lower cost, I would simplify the architecture.”

That structure makes you sound thoughtful rather than ideological.

⸻

TITUS DEEP-DIVE QUESTION BANK

These are the questions I would rehearse aloud.

1. “What exactly do you mean by autonomy?”

Do not answer, “agents do things without humans.”

Use:

“I think autonomy is multidimensional.

An agent can have autonomy over planning, tool selection, implementation, verification, or deployment, and those don’t need to advance at the same rate.

I would define autonomy as the amount of consequential decision-making and execution the system can perform without synchronous human intervention.

The important architectural idea is that autonomy should increase as confidence, verification strength, reversibility, and observability increase.”

Then give an example:

“An agent generating a unit test may have almost complete autonomy.

An agent changing authentication logic may be allowed to implement and test autonomously but require independent security verification and human approval before merge.

A production schema migration may require a completely different authority policy.”

That shows you don’t think “autonomous” is binary.

⸻

2. “How do you decide how much autonomy to allow?”

Give him a model.

I would use:

Risk = Consequence × Uncertainty × Irreversibility

And then:

Autonomy ∝ Verification Confidence + Reversibility + Observability

Say:

“I wouldn’t assign autonomy by agent.

I’d assign authority by action and risk.

A highly capable agent shouldn’t automatically gain broad authority.

I would evaluate consequence, uncertainty, and reversibility.

Low-consequence, highly reversible actions can be highly autonomous.

High-consequence or irreversible actions should require stronger verification or additional authority.”

This is a fantastic bridge back to:

Intelligence ≠ Authority.

⸻

3. “Why would planning be a separate layer?”

Be careful. Titus might challenge architecture diagrams containing too many boxes.

Answer:

“It doesn’t necessarily need to remain separate.

I’m showing planning as a conceptual responsibility rather than asserting it must be a standalone service.

Today, explicit plans are useful because they create inspectable decomposition, allow policy and budget checks before execution, and give verification something to compare against.

But if models eventually plan reliably inline, I would happily collapse that layer—as long as the resulting execution remains governable and observable.”

That’s exactly the type of answer he wants.

Architecture diagrams represent responsibilities, not permanent microservices.

Memorize that sentence too.

⸻

4. “What is the control plane actually controlling?”

Your answer needs to be concrete.

“Anything that grants or limits consequential capability.

Identity and credentials.

Repository scope.

Tool authorization.

Network access.

Runtime environment.

Resource and token budgets.

State transitions.

Promotion authority.

And auditability.

The control plane doesn’t need to make the intelligent decision about what to do.

It needs to make the enforceable decision about what is allowed to happen.”

That distinction is extremely important.

⸻

5. “Why not let the model enforce policy?”

“Models can participate in interpreting policy, especially where policy itself is semantic.

But I wouldn’t make probabilistic interpretation the only enforcement mechanism for enforceable constraints.

If a repository is forbidden, the runtime shouldn’t expose it.

If network egress is prohibited, the sandbox shouldn’t allow it.

If an agent has a $5 budget, the system should terminate or escalate when that budget is exhausted.

Models can reason about policy.

Infrastructure should enforce what can be enforced deterministically.”

Strong line:

“Policy interpretation can be probabilistic. Policy enforcement should be deterministic wherever possible.”

⸻

6. “What does an intent contract look like?”

This is where you should get concrete.

Use an example:

“Imagine the builder says:

‘Add account deletion to this application.’

That’s not sufficient intent.

The system should turn it into something closer to an executable contract:

outcome: users can permanently delete their account;

scope: API, UI and persistence layer;

constraints: preserve audit records required by policy;

acceptance criteria: deletion completes within the defined SLA, authentication is required, dependent records are handled correctly;

security requirements: no cross-tenant access;

rollback constraints;

verification requirements;

and success metrics.

The agent can help construct that contract interactively, but the contract becomes the stable object the rest of the factory executes against.”

Then:

“Natural language initiates the work. Structured intent governs it.”

Excellent line.

⸻

7. “Aren’t acceptance criteria themselves incomplete?”

Say yes.

Don’t defend them as magical.

“Absolutely.

Acceptance criteria are necessary but not sufficient.

There are at least three sources of correctness:

explicit intent,

organizational invariants,

and emergent domain knowledge.

The builder may say what they want.

The repository tells us architectural constraints.

Policies tell us what must never happen.

Production history may tell us failure modes nobody wrote down.

So verification has to combine stated acceptance criteria with system-level invariants.”

This is a strong answer.

⸻

8. “How do you handle ambiguous intent?”

“Ambiguity should be surfaced before expensive execution when it materially affects outcomes.

But I wouldn’t require clarification for everything.

The system can distinguish between ambiguity it can safely resolve from context and ambiguity that changes consequential behavior.

If two interpretations produce equivalent low-risk implementations, proceed.

If they lead to materially different product behavior, security implications, or irreversible decisions, escalate.”

That’s a practical autonomous-system rule.

⸻

9. “How would you implement model routing?”

Don’t over-engineer it immediately.

Start simple.

“I would begin with policy-based routing, not reinforcement learning.

Classify the workload.

Define minimum capability and policy requirements.

Restrict eligible models.

Then select from qualified candidates using historical evaluation performance, latency, reliability, and cost.

Only after we accumulate enough production outcome data would I introduce adaptive routing.”

Then describe the evolution:

Phase 1
Static policy.

Phase 2
Evaluation-driven routing.

Phase 3
Contextual optimization.

Phase 4
Adaptive learning with guardrails.

Key line:

“You need telemetry before you need intelligence in the router.”

Very good.

⸻

10. “What if routing introduces nondeterminism?”

“It does, which is why model identity and configuration need to be part of the execution evidence.

More importantly, the qualification unit shouldn’t just be the model.

It should be the executable configuration: model, system instructions, tools, runtime constraints, retrieval strategy, relevant policies and evaluator set.

Otherwise you’re pretending a model benchmark tells you how the system behaves.”

This connects beautifully with your Mission Control thinking.

You can call this a:

Factory Version

or

Qualified Execution Profile

If Titus asks for terminology.

⸻

11. “What’s the unit that gets qualified?”

This is one of the more sophisticated points you can make:

“Not the model.

I would qualify an immutable execution configuration.

A model can pass an eval under one prompt, tool set and context strategy and fail badly under another.

So the deployable unit should represent the meaningful behavior-producing configuration.”

You can illustrate:

Factory Version =

Model route

system instructions
skills
tools
context strategy
runtime policy
verification policy

Then:

“That’s the unit I can evaluate, compare, promote and roll back.”

That is strong.

⸻

12. “How would you evaluate such a system?”

This could become 10 minutes of the interview by itself.

Break evaluation into four levels:

Component

Does an individual model, tool or skill perform?

Workflow

Can the complete agent workflow accomplish a defined scenario?

System

Does the factory satisfy reliability, security, policy and economic requirements?

Outcome

Did the change actually produce the desired real-world result?

Say:

“The mistake is evaluating only agent task completion.

A run can succeed technically and still be a bad outcome.

I want evaluation from component behavior all the way through production impact.”

Then mention:

Golden scenarios
Regression sets
Adversarial cases
Production sampling
Human disagreement
Outcome metrics

⸻

13. “LLM-as-judge: good idea or bad idea?”

Best answer:

“Useful mechanism. Dangerous foundation.

LLM judges are extremely useful when correctness is semantic and deterministic checks aren’t available.

But I would calibrate them against human-labeled sets, measure disagreement, version the judge, and avoid allowing one probabilistic evaluator to become the sole promotion gate for consequential changes.

Different evaluator types should compensate for each other’s weaknesses.”

If pressed:

“I trust an LLM judge more when the task is narrow, rubric-driven, independently grounded, and empirically calibrated.”

⸻

14. “How do you avoid evaluation overfitting?”

“Treat evals like tests and like data.

Maintain hidden holdouts.

Add production failures to regression sets.

Rotate adversarial scenarios.

Monitor divergence between offline evals and production outcomes.

And never optimize on one aggregate score.”

Then:

“The system will eventually optimize whatever we measure, so evaluation governance becomes as important as model governance.”

Very Titus-friendly point.

⸻

15. “You said verification is scarce. Why?”

Don’t say simply “there’s more code.”

Use a deeper argument:

“Because generation is highly parallelizable while trustworthy verification often depends on independent information, domain constraints and downstream effects.

Creating another candidate implementation is cheap.

Establishing that it won’t violate an invariant we didn’t explicitly encode is much harder.

Verification is fundamentally an information problem.”

That’s powerful.

Then:

“The best long-term solution isn’t merely more reviewers. It’s making more correctness properties machine-verifiable.”

That opens a fascinating discussion around formal methods.

⸻

TITUS MAY GO STRAIGHT TO FORMAL METHODS

Be ready.

He may say something like:

“If verification is scarce, why aren’t you talking about specifications and formal verification?”

Great opening.

Answer:

“I think increased autonomy actually strengthens the case for better specifications and formalizable invariants.

Wherever we can convert semantic intent into machine-checkable properties, we should.

Type systems, schemas, contracts, static invariants, property-based tests, model checking, policy-as-code—all of those reduce the amount of correctness we leave to probabilistic judgment.

I don’t expect arbitrary product intent to become formally specified end-to-end.

But I absolutely expect autonomous systems to increase the economic value of formalizing the parts that matter.”

Excellent.

Then:

“The future verification stack isn’t AI instead of formal methods. AI increases the leverage of formal methods.”

That is a very good technical-vision statement.

⸻

TITUS MAY ATTACK “EVIDENCE”

He could say:

“Isn’t all this provenance just expensive logging nobody will ever look at?”

Don’t argue that every trace is valuable.

Say:

“If evidence is just logging, I agree.

The purpose isn’t recording everything.

It’s preserving the evidence necessary to support consequential claims.

If the system claims a security-sensitive change is safe, I need to know which security gates actually passed.

If it claims acceptance criteria were met, I need reproducible evidence tied to those criteria.

Evidence should be structured around decisions and assertions, not merely exhaustive telemetry.”

Then introduce:

Claims → Evidence

Claim: tests passed
→ test results + version

Claim: authorized
→ identity + policy decision

Claim: security validated
→ scanner + result + policy

Claim: ready to merge
→ required gates + attestations

That is much more sophisticated than “save the agent trace.”

⸻

THIS LEADS TO A REALLY STRONG CONCEPT

You could describe a software delivery result as:

An assertion graph

Instead of merely:

Here’s some code.

The factory effectively produces:

Here is the change.

Here are the claims we’re making about it.

Here is the evidence supporting those claims.

Here are the authorities that accepted those claims.

That is a genuinely interesting direction.

If Titus engages with evidence, use it.

⸻

“WHO VERIFIES THE VERIFIER?”

This is almost guaranteed.

Answer:

“Ultimately, verification isn’t recursively solved by adding another verifier forever.

It’s solved through diversity of mechanisms and empirical calibration.

Some properties terminate in deterministic facts.

The build either succeeds or doesn’t.

A schema invariant either holds or doesn’t.

Other properties remain probabilistic.

Those require calibrated evaluators, disagreement analysis, production sampling and outcome feedback.

The goal isn’t mathematical certainty for every software property.

It’s measurable confidence appropriate to the consequence of the action.”

Excellent closing phrase:

“Verification strength should be proportional to consequence.”

⸻

THE HARDEST QUESTION: “WHAT’S YOUR TRUST MODEL?”

I’d answer with four layers.

Never trust intelligence with authority merely because it’s intelligent.

Minimize granted capability.

Independently verify consequential claims.

Preserve evidence and reversibility.

Then say:

“I don’t think zero trust means zero autonomy.

It means autonomy operates through explicitly granted capabilities.”

Beautiful.

⸻

YOUR SECURITY MODEL

You should be able to whiteboard this instantly:

Agent

↓ capability request

Policy Decision Point

↓ approved capability

Short-lived credential

↓

Sandbox

Allowed:

specific repo
specific branch
specific APIs
specific MCP tools
specific network destinations

Denied:

production credentials
unapproved repositories
unrestricted shell/network
persistent secrets

Then:

“The agent shouldn’t inherit the ambient authority of the human who launched it.”

Memorize that.

This could land extremely well.

⸻

EXPECT A SCALE QUESTION

Titus may suddenly say:

“Okay, this works for a team. What happens at Adobe scale?”

Don’t start naming Kubernetes components.

Start with the dimensions.

“I’d first separate scaling execution from scaling control.

Execution is embarrassingly parallel compared with governance.

The harder scaling issues are identity, context freshness, evaluation throughput, evidence volume, policy composition, repository heterogeneity and economics.”

Then at Adobe scale:

15,000 builders
100,000+ repositories
multiple languages/stacks
many autonomous runs
different risk classes

Architect around:

Shared control plane

but

Distributed execution

and

Federated domain capabilities

That’s the architecture.

⸻

“WOULD YOU CENTRALIZE META FACTORY?”

Answer:

“Centralize invariants, federate expertise.”

Then explain:

Centralize:

Identity
Policy primitives
Execution contracts
Audit/evidence standards
Evaluation infrastructure
Model gateway
Core sandboxing

Federate:

Domain skills
Repository knowledge
Team-specific evaluations
Domain policies
Specialized workflows

Key line:

“Standardize the substrate, not the innovation.”

Great Adobe answer.

⸻

TITUS MAY ASK YOU ABOUT ORGANIZATIONAL FAILURE

Example:

“Why do internal developer platforms fail?”

Answer:

“Usually because platform teams optimize for architectural consistency while product teams optimize for delivery.

If the platform adds friction without producing enough leverage, teams route around it.

So governance can’t just be mandatory.

The paved road needs to be economically better for the builder.”

Then:

“Meta Factory should make the secure, observable, governed route the fastest route.”

That ties directly into your design philosophy.

⸻

WHERE TO USE YOUR WORKDAY EXPERIENCE

Do not turn the presentation into:

“At Workday, we built…”

Use Workday only when Titus asks:

“Have you seen this in practice?”

Then you have proof.

Examples:

Model/platform abstraction

“We’ve seen this with multiple model providers and workloads: the value isn’t selecting one model, it’s being able to evaluate capability against actual internal workloads.”

Enterprise context

“At enterprise scale, retrieval quality and freshness can dominate model capability. Better reasoning over stale context still produces the wrong answer.”

Verification

“We’ve seen adoption accelerate only when teams trust the evaluation and governance around the agent, not just the agent demo.”

Scale

Use your numbers selectively:

300+ teams

10,000+ governed runs/week

500+ evaluation scenarios/release

Those establish that you aren’t theorizing from toy demos.

⸻

WHERE TO USE MISSION CONTROL

Mission Control should appear once, perhaps twice.

Not:

“Here’s this framework I created.”

Instead:

“I’ve been testing some of these ideas in a reference implementation because I wanted to know where the abstractions break in practice.”

Then one concrete lesson:

“One thing that became obvious quickly was that agent state, verification state, and human authority have to be separate. Otherwise retry and recovery semantics get very dangerous.”

Now Mission Control becomes evidence of technical depth.

Not a side business pitch.

⸻

THE 3 LEVELS YOU SHOULD MOVE BETWEEN

Titus may intentionally change altitude.

Be comfortable moving between:

Vision

“Verification becomes scarce.”

↓

Architecture

“Separate generation and verification.”

↓

Mechanism

“Compile, tests, static analysis, adversarial verifier, evidence bundle.”

↓

Implementation

“Immutable execution version, durable state, sandbox capability, policy decision.”

Then come back up.

Don’t get trapped spending fifteen minutes describing queues.

⸻

HOW TO HANDLE DISAGREEMENT

If Titus says:

“I don’t buy that.”

Do not immediately retreat.

Use:

“The assumption I’m making is X.”

Then:

“If that assumption isn’t true, I agree the architecture changes.”

Then engage:

“The piece I would still want to preserve is Y because…”

Example:

Titus:

“I think models are going to absorb orchestration entirely.”

You:

“I think that’s plausible.

The assumption I’m making is that enterprises will still want external authority and durable execution semantics even if the reasoning about orchestration moves into the model.

So I wouldn’t defend the orchestration layer itself.

I would defend the externally enforceable boundary around consequential action.”

Perfect.

You aren’t protecting your diagram.

You’re protecting your thesis.

⸻

HOW TO SAY “I DON’T KNOW”

A bar raiser will appreciate this much more than hand-waving.

Use:

“I don’t think we know that yet.”

Then immediately:

“The experiment I’d run is…”

For instance:

“I don’t think we know whether cross-model verification produces enough failure independence to justify the additional cost.

I’d build a corpus of known failures, measure correlated misses across verifier configurations, and choose based on empirical fault diversity rather than assuming another model is independent.”

That’s dramatically better than bluffing.

⸻

YOUR “WHERE I COULD BE WRONG” SECTION CAN BECOME A WEAPON

If Titus challenges you with something that’s already on the slide:

Smile and say something like:

“That’s actually one of the assumptions I’m trying to falsify.”

Then discuss it.

That makes the slide meaningful rather than performative.

⸻

A STRONGER VERSION OF YOUR CENTRAL THESIS

You currently have:

Code generation is becoming abundant. Trusted autonomous software delivery is not.

Keep it.

But underneath it, mentally carry:

The value migrates toward the systems that determine what autonomous intelligence is allowed to do, whether its work should be trusted, and how the organization learns from the outcome.

That is your entire interview in one sentence.

⸻

YOUR 60-SECOND ANSWER IF TITUS SAYS

“Give me the whole thing in one minute.”

Use this:

“My thesis is that as coding agents improve, generation stops being the dominant constraint in software delivery.

Builders increasingly express intent and acceptance criteria while autonomous systems perform more planning and implementation.

Models become interchangeable execution resources, and the durable platform moves toward controlling authority, secure execution, verification, evidence, and learning.

I think the crucial separation is between reasoning, execution, verification, and consequential authority.

Intelligence can become arbitrarily capable without automatically inheriting unlimited authority.

And because generation scales faster than human review, verification becomes the scarce resource.

That means the long-term competitive advantage isn’t necessarily owning the best coding model. It’s owning the enterprise context, evaluation systems, secure execution substrate, evidence, and outcome learning that allow many forms of intelligence to operate safely at scale.”

That’s your emergency compressed presentation.

⸻

ONE THING I WOULD CHANGE IN YOUR INFOGRAPHIC

The graphic is excellent as a study guide, but it’s too information-dense to be the actual 12-minute presentation.

For Titus, I would not put this entire graphic up and talk through it.

Instead:

Use the graphic as the final synthesis / backup slide.

Your main deck should visually reveal the thesis one argument at a time.

Think:

Slide 1

CODE GENERATION
↓↓↓↓ cost

TRUST
still scarce

Slide 2

INTENT

↓

Factory

↓

OUTCOME

Slide 3

Workload

→ Capability

→ Model A / B / C

Slide 4

INTELLIGENCE ≠ AUTHORITY

Slide 5

Generation ↑↑↑

Verification ↑↑↑

Slide 6

Change + Evidence

Slide 7

Learn

→ Candidate

→ Evaluate

→ Governed Promotion

Slide 8

Your architecture

Slide 9

Commoditize ↔ Durable

Slide 10

Where I could be wrong

That’s vastly more persuasive.

⸻

AND I WOULD REMOVE ONE THING FROM THE MAIN PRESENTATION

Workforce Transformation.

Not because it’s wrong.

Because for Titus, it weakens the technical thesis slightly and consumes scarce presentation time.

Save it for:

“What does this mean organizationally?”

Then you have a fantastic answer ready.

Similarly, metrics and design tradeoffs should mostly become backup/Q&A slides.

⸻

MY RECOMMENDED TITUS DECK

Your actual presentation should be:

1. Beyond Coding Agents
The thesis

2. Generation Is No Longer the Constraint
Paradigm shift

3. Intent Becomes the Interface

4. Models Become Execution Resources

5. Intelligence Does Not Imply Authority

6. Verification Becomes Scarce

7. Evidence Becomes Part of the Artifact

8. Learning Becomes Governed

9. The Autonomous Software Factory
Integrated architecture

10. What Commoditizes / What Remains Durable

11. Where I Could Be Wrong

12. Closing
Build for the moving boundary

And then have backup slides for:

A. Verification architecture

B. Secure sandbox / authority model

C. Evaluation strategy

D. Model/capability routing

E. Factory version / qualification

F. Failure/recovery semantics

G. Metrics/economics

H. Workforce transformation

I. Adobe opportunity

That gives you ammunition without bloating the presentation.

⸻

The Standard You Want to Hit

By the end, Titus should not be thinking:

“Jarrett knows agent architecture.”

He should be thinking:

“Jarrett has a coherent theory about how software engineering architecture changes when autonomous generation becomes cheap—and he understands which parts of his own theory are assumptions rather than facts.”

That’s a much higher bar.

And it lines up extremely well with the rest of your interview loop:

Titus: Why should this architecture exist?

Vishal / Anirudh: Can you actually build the agentic mechanisms?

Jeffrey / Vikram: Can you design the system rigorously?

Alexandru: Can you make the thing reliable at enterprise scale?

For Titus, stay above the implementation until he deliberately pulls you downward. Your job is to establish the technical worldview, then demonstrate that every layer beneath it is real when he starts probing.
