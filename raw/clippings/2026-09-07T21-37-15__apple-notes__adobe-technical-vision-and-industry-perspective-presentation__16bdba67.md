---
title: "Adobe Technical Vision and Industry Perspective presentation"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p8484
captured_at: 2026-09-07T21:37:15.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: 16bdba678d8e9a25ed6f64ffeb9681646c29807db2b849e2a1ff10d722437b31
---

Adobe: Technical Vision and Industry Perspective (presentation) 

45 min. Technical Vision and Industry Perspective. Candidate presents a technical topic of their choice relevant to agentic systems, followed by structured Q&A. Bar raiser independently assesses whether the candidate raises the overall technical bar of the team. Any 1 of Ross Pfahler, Titus Winter, Prama Anand


￼

 Training Local reasoning and coding models on company data (option) 

Beyond Coding Agents: The Architecture of the Autonomous Software Factory
2.


This is not primarily a system-design presentation and it is not a “tell us about your Workday architecture” session. It is a technical bar-raiser. They want to see whether you have an original, defensible view of where agentic software engineering is going and whether you can hold that view under challenge.

What they are actually evaluating

The presentation is only the setup. The real evaluation is likely:

Do you have a clear technical thesis, rather than a survey of AI trends?
Is your thesis forward-looking and relevant to Adobe’s agentic strategy?
Can you distinguish what is durable from what is likely to commoditize?
Do you understand the underlying architecture and engineering mechanics?
Can you make and defend tradeoffs?
Can you change your position when presented with better evidence?
Can you communicate at the level of Principal/Distinguished engineers?
Would your perspective actually raise Adobe’s technical bar?

So I would not title your presentation simply “AI-Native SDLC.” That’s broad and increasingly common.

I’d make the thesis sharper.

Recommended Topic

Beyond Coding Agents: The Architecture of the Autonomous Software Factory

Subtitle

Why trusted execution, verification, and learning become the bottlenecks as code generation becomes abundant

Your opening thesis:

“My thesis is that we’re approaching an important transition in software engineering.

Code generation is becoming abundant, but trustworthy software delivery is not.

As agents become capable of producing increasingly large amounts of software, the bottleneck moves from generating code to determining whether autonomous work is correct, secure, authorized, economical, and ready for production.

I believe that changes the architecture of developer platforms.

We move from coding assistants toward autonomous software factories, where builders increasingly define intent and acceptance criteria, agents perform more of the implementation, and the platform governs execution, verification, evidence, and learning.

I want to walk through what I think that architecture looks like, what becomes durable, and where I think the industry could still prove me wrong.”

That last sentence is important for a bar raiser. You’re presenting a position that can be debated, not delivering a lecture.

⸻

The 6 Arguments

I would build the presentation around six claims, not 15 topics.

1. Intent becomes the interface

Traditional:

Developer → Code

AI-assisted:

Developer → Prompt → Agent → Code

AI-native:

Builder Intent + Constraints + Acceptance Criteria → Factory → Verified Outcome

Your argument:

“Builders shouldn’t need to select the model, agent, MCP server, or execution strategy. They should describe the outcome and constraints. The factory should determine execution.”

This directly connects to Adobe’s Builders Experience.

⸻

2. Models become interchangeable execution resources

Don’t spend much time explaining model independence.

Take it farther:

“Model independence isn’t primarily about avoiding vendor lock-in. It’s what creates the ability to optimize execution.”

Then:

Workload → Capability Requirements → Evaluated Models → Routing → Outcome

Routing dimensions:

Quality · Capability · Security · Latency · Context · Reliability · Cost

And your metric:

“Cost per accepted outcome, not cost per token.”

That’s especially strong because Shibu independently identified tokenomics as a strategic problem.

⸻

3. The harness becomes the control boundary

Your position:

“As models get smarter, I actually expect some orchestration capabilities to disappear into the models.

But I don’t expect enterprises to outsource identity, authority, budgets, execution isolation, durable state, evidence, or policy to probabilistic intelligence.”

That’s much more sophisticated than “the harness is important.”

Then:

“Models reason. The control plane governs.”

And acknowledge uncertainty:

“Where the exact boundary settles will keep changing.”

Excellent bar-raiser material.

⸻

4. Verification becomes the scarce resource

This should be the center of the presentation.

Show:

Generation cost ↓↓↓

while

Verification demand ↑↑↑

Then:

“If agents can produce ten times more implementation, we cannot respond by asking humans to perform ten times more review.

Verification itself has to become intelligent, automated, and scalable.”

Your verification stack:

Compiler / Tests → Static Analysis → Security → Policy → Agentic Review → Dynamic Evals → Independent Verification → Evidence

Then your strongest line:

“The agent that produced the work shouldn’t be the only system deciding whether the work is correct.”

This is where Mission Control becomes evidence supporting the thesis, rather than the presentation becoming a commercial for your side project.

⸻

5. Evidence becomes part of the software artifact

This is an original enough idea to differentiate you.

Traditional delivery artifact:

Code + tests

Autonomous delivery artifact:

Code + provenance + trajectory + verification + evidence

Explain:

“When autonomous systems perform more of the work, I need to know not just what changed, but why it changed, what context influenced it, what tools executed, what verification occurred, what policy applied, and what evidence justified acceptance.”

Then:

“In autonomous software delivery, the trajectory becomes part of the artifact.”

That is a strong technical-vision statement.

⸻

6. Learning becomes a governed deployment problem

Show:

Execute → Observe → Evaluate → Diagnose → Propose → Validate → Promote

Then distinguish it carefully from model training:

“I’m not saying every factory should continuously retrain its models.

The factory itself can learn by improving routing, skills, prompts, context strategies, tools, policies, and evaluations from production outcomes.”

Then:

“Learning can be autonomous. Promotion should be governed.”

⸻

The Architecture Slide

After the six claims, show one integrated architecture 
                        BUILDER
                           │
             Intent + Constraints + Acceptance
                           │
                           ▼
                    INTENT CONTRACT
                           │
                           ▼
                  PLAN / DECOMPOSE
                           │
                           ▼
             CAPABILITY + MODEL ROUTER
                           │
                           ▼
                 GOVERNED CONTROL PLANE
          Identity │ Policy │ State │ Budget
                           │
                           ▼
                    AGENT HARNESS
             Context │ Skills │ Tools
                           │
                           ▼
                   SECURE SANDBOX
                           │
                           ▼
                     IMPLEMENT
                           │
                           ▼
                 VERIFICATION PLANE
      Tests │ Security │ Policy │ Evals │ Review
                           │
                           ▼
                    EVIDENCE BUNDLE
                           │
                           ▼
                     HUMAN AUTHORITY
                           │
                           ▼
                   MERGE / DEPLOY
                           │
                           ▼
                       OUTCOME
                           │
                           ▼
                 LEARNING / FEEDBACK
                           │
                           ▼
                CANDIDATE IMPROVEMENT
                           │
                           ▼
                 EVALUATION / PROMOTION
                           │
                           └──────────────↺

Your explanation:

“The important thing about this architecture isn’t any individual box.

It’s the separation of reasoning, execution, verification, authority, and learning.

Those boundaries are what allow autonomy to increase without requiring trust in any individual model.”

That’s your architectural thesis.

⸻

Then Make It About Adobe

Don’t spend the whole presentation saying “Adobe should…”

Near the end, connect it.

“I think this is particularly relevant to Adobe because the problem isn’t simply building another coding agent.

You have roughly 15,000 engineering builders, a very heterogeneous repository landscape, existing agentic workflows already emerging across teams, and a long-term Builders Experience vision that extends beyond developers.

That makes the opportunity less about choosing the winning coding agent and more about creating the governed substrate where many models, agents, skills, and builder workflows can safely operate and improve.

That’s how I think Meta Factory can become more than another developer tool. It can become the Agentic Operating System for how Adobe builds.”

⸻

The Most Important Slide: “What I Think Will Commoditize”

This is what I’d add specifically because it’s a bar-raiser interview.

￼

Then say:

“The investment mistake I want to avoid is spending Adobe engineering capacity rebuilding the left side while underinvesting in the right.

The boundary will move, so the architecture has to let us adopt aggressively where the market commoditizes and build deeply where Adobe differentiates.”

That’s a Senior Manager / technical-strategy answer, not merely an AI architecture answer.

⸻

And Include: “Where I Could Be Wrong”

I strongly recommend ending the presentation content with this before Q&A.

Three assumptions I would continuously test

1. Harness capabilities may commoditize faster than expected.

Models may absorb more planning, context management, and tool orchestration.

2. Inference economics may collapse.

If reasoning becomes dramatically cheaper, routing for cost matters less, although routing for quality, security, latency, and specialization remains.

3. Verification models may approach or exceed human review quality.

That could shift human authority farther downstream toward policy, exceptions, and risk, rather than individual change review.

Then say:

“So I don’t want to build architecture around the assumption that today’s model limitations remain permanent.

I want to build around the things I believe remain durable even as intelligence improves: authority, evidence, evaluation, secure execution, enterprise context, economics, and measurable outcomes.”

That answer alone could materially help you in the bar-raiser round.

⸻

How I’d Use the 45 Minutes

Don’t prepare a 30-minute monologue.

Aim for roughly 10–12 minutes of prepared material.

0–1 min: Thesis
1–3 min: Intent + model/routing shift
3–6 min: Harness + secure execution + verification
6–8 min: Evidence + learning
8–10 min: What commoditizes vs. what remains durable
10–11 min: Adobe relevance
11–12 min: Where your thesis might be wrong
Remaining ~30 minutes: Q&A and technical debate

The Q&A is the interview.

Your presentation merely gives the bar raiser something interesting enough to attack.

Your opening and closing should be memorized

OPEN:

“Code generation is becoming abundant. Trustworthy software delivery is not. I believe that changes the architecture of developer platforms.”

CLOSE:

“So my thesis isn’t that today’s agent frameworks become permanent infrastructure.

Quite the opposite. I expect much of today’s stack to commoditize rapidly.

What I believe persists is the need for a system that can turn builder intent into bounded execution, independently verified evidence, governed decisions, and measurable outcomes, regardless of which model happens to be best six months from now.

That’s what I think the autonomous software factory becomes.”

That’s the presentation I would take into this round.
——

ADOBE — TECHNICAL VISION & INDUSTRY PERSPECTIVE

Beyond Coding Agents: The Architecture of the Autonomous Software Factory

Your central thesis

“The thesis I want to explore is fairly simple:

Code generation is becoming abundant. Trusted autonomous software delivery is not.

I believe we’re moving beyond AI-assisted coding toward an AI-native software-development operating model, where builders increasingly define intent, constraints, and acceptance criteria, agents perform more of the implementation, and the platform governs execution, verification, evidence, authority, and learning.

That changes where I think the durable engineering problems live.”

⸻

1. THE PARADIGM SHIFT

What you need to communicate

The progression is:

Traditional SDLC → AI-Assisted SDLC → AI-Native Autonomous Factory

The important shift is not merely faster coding. It is who performs the work and how the work is governed.

TALKING SCRIPT

“I think we’re going through something more significant than simply adding AI to the existing SDLC.

In the traditional model, humans perform most of the lifecycle. We plan, design, code, test, review, deploy, and operate.

The first wave of generative AI gave us AI-assisted development. Humans still owned essentially the same workflow, but AI helped generate code, tests, documentation, and analysis.

What I think comes next is structurally different.

We move toward an AI-native software factory, where the builder increasingly defines the intent, constraints, architecture, and acceptance criteria, while agents perform much more of the implementation and execution.

The platform then governs whether that work is authorized, correct, secure, economical, and ready to ship.

So we’re not simply accelerating the existing SDLC.

We’re changing the software-development operating model itself.”

If challenged: “Isn’t this just better automation?”

“I think the difference is dynamic reasoning.

Traditional automation executes workflows we explicitly encode.

Agentic systems can interpret ambiguous intent, construct plans, choose capabilities, react to observations, and modify the execution path dynamically.

That requires a different control architecture around them.”

KEY LINES

“We’re not just making developers faster. We’re changing the software-development operating model.”

“AI doesn’t simply automate the workflow. It increasingly participates in deciding how the workflow executes.”

⸻

2. BUILDER INTENT BECOMES THE INTERFACE

What you need to communicate

This is directly aligned with Adobe’s Builders Experience.

Builders shouldn’t need to know:

model → agent → skill → MCP server → orchestration framework

They should define:

Goal → Constraints → Acceptance Criteria → Context → Success

TALKING SCRIPT

“The second shift is that I think builder intent becomes the primary interface to software development.

Today we still expose a lot of implementation machinery to the user.

Which model?

Which agent?

Which tool?

Which skill?

Which workflow?

I think much of that eventually disappears behind the factory.

The builder should tell the system:

Here’s the outcome I want. Here are my constraints. Here’s the relevant context. And here’s what good looks like.

The factory then turns that into an executable contract.

It clarifies ambiguity, decomposes the work, resolves dependencies, selects capabilities, determines the execution strategy, and creates the verification plan.

That’s particularly important if the builder population expands beyond engineers.

A product manager shouldn’t have to understand agent orchestration to build something useful.”

Adobe connection

“That’s one reason I really like Adobe’s use of builder rather than developer.

The abstraction has to eventually support people expressing intent without understanding all of the machinery underneath.”

KEY LINE

“Builders define the what. The factory determines the how.”

⸻

3. MODELS BECOME INTERCHANGEABLE EXECUTION RESOURCES

What you need to communicate

Don’t frame model independence merely as vendor independence.

The deeper concept is dynamic capability allocation.

TALKING SCRIPT

“The third shift is how I think about models.

I don’t think the long-term architecture should organize itself around one preferred foundation model.

I increasingly think of models as execution resources with different capability profiles.

One model may be exceptional at planning.

Another at coding.

Another may provide sufficient quality at a fraction of the cost.

Another may be required because of a security or data-policy constraint.

So once work has been decomposed, the platform can select capabilities based on task type, complexity, quality requirements, security, latency, context requirements, historical evaluation performance, availability, and economics.

And critically, routing should improve from outcomes.

We should know how different models actually perform against Adobe’s workloads rather than relying entirely on public benchmarks.”

Tokenomics

“That changes the economics as well.

I wouldn’t optimize for cost per token.

I’d optimize for cost per accepted outcome.

A model that’s 50 percent cheaper but causes three retries and twenty minutes of engineer correction isn’t actually cheaper.”

KEY LINES

“Model independence creates optionality. Routing turns optionality into economics.”

“Optimize for cost per accepted outcome, not cost per token.”

⸻

4. THE HARNESS BECOMES THE CONTROL BOUNDARY

What you need to communicate

Separate:

Model intelligence from enterprise authority.

TALKING SCRIPT

“As models become more capable, I actually expect them to absorb some things that currently live in agent frameworks.

Planning will improve.

Tool selection will improve.

Context handling will improve.

Some orchestration may increasingly move into the models themselves.

But there are things I don’t think an enterprise should delegate to probabilistic intelligence.

Identity. Authorization. Policy. Durable state. Budgets. Execution isolation. Audit. And consequential authority.

That’s why I think some form of harness or control plane remains durable even as its exact boundary changes.

The model can reason about what should happen next.

The platform determines whether that action is permitted, affordable, observable, recoverable, and within policy.

Then execution happens inside a bounded environment.”

Secure execution

“And the sandbox isn’t merely protecting compute.

It limits repository scope, filesystem access, credentials, network egress, tools, time, compute, and token budget.

In other words, it bounds authority.”

KEY LINES

“Models reason. The control plane governs.”

“Allow intelligence to operate. Always bound authority.”

“The sandbox should bound authority, not just compute.”

⸻

5. VERIFICATION BECOMES THE SCARCE RESOURCE

This should be one of your strongest sections.

TALKING SCRIPT

“This is probably the part of the thesis I feel strongest about.

The cost of generating software is collapsing much faster than the cost of trusting software.

Agents can already produce enormous amounts of code.

If they eventually produce ten times more implementation, we can’t respond by asking engineers to perform ten times more manual review.

Verification itself has to become intelligent, automated, layered, and scalable.

I think of the verification plane as combining deterministic and probabilistic mechanisms.

Compile and test.

Static analysis.

Security scanning.

Policy and compliance checks.

Agentic code review.

Dynamic evaluations.

Independent verification.

And evidence against the original acceptance criteria.

The point isn’t to eliminate humans.

It’s to make human judgment the scarce resource we use where it actually adds value.”

Critical distinction

“Generation tells us what the agent produced.

Verification tells us whether we should trust it.”

KEY LINES

“Generation scales output. Verification scales trust.”

“Code generation is becoming abundant. Verification becomes scarce.”

⸻

6. EVIDENCE BECOMES A FIRST-CLASS ARTIFACT

What you need to communicate

Traditional artifact:

Code + Tests

Autonomous artifact:

Code + Tests + Provenance + Trajectory + Verification + Authority

TALKING SCRIPT

“If autonomous systems perform increasingly consequential work, I don’t think the resulting artifact can simply be the code.

I need the evidence behind the code.

What was the original intent?

What acceptance criteria applied?

What plan was executed?

Which models and tools participated?

What context was retrieved?

What files changed?

What tests ran?

What security and policy checks passed?

What evaluations were performed?

Who approved the consequential decisions?

And ultimately, what happened in production?

That evidence gives us reproducibility, debugging, auditability, compliance, evaluation replay, and learning.

As autonomy increases, I think the execution trajectory itself increasingly becomes part of the software artifact.”

Mission Control connection

“That’s one of the principles I’ve been exploring personally with Mission Control: the execution should produce an evidence bundle, not merely a claim that the work completed.”

KEY LINES

“The output isn’t just code. It’s code plus evidence.”

“In autonomous software delivery, the trajectory becomes part of the artifact.”

⸻

7. LEARNING BECOMES A GOVERNED DEPLOYMENT PROBLEM

What you need to communicate

Be precise. Don’t blur this into RLHF.

TALKING SCRIPT

“Once the factory produces execution evidence, the system has something extremely valuable: outcome data.

Every run tells us something.

Which routing decisions worked.

Which models performed best.

Which context was missing.

Which tools failed.

Which review findings developers accepted.

Which changes caused regressions.

Which workflows consumed too much money.

The factory can analyze those outcomes and propose changes to routing, prompts, skills, retrieval strategies, tool usage, policies, and evaluation criteria.

But I make a strong distinction between learning and promotion.

A system discovering a potentially better behavior doesn’t mean that behavior should silently enter production.

Candidate behavior should be evaluated against the existing baseline.

If it improves quality, safety, reliability, or economics without unacceptable regressions, then we progressively promote it.

Otherwise we reject it or roll it back.”

KEY LINE

“Learning can be autonomous. Promotion should be governed.”

If asked about RLHF

“This is primarily system-level learning around the model, not necessarily retraining the foundation model.

Model training and preference learning can participate, but they’re a different layer.”

⸻

8. THE END-TO-END ARCHITECTURE

This is your synthesis slide.

TALKING SCRIPT

“When I put those ideas together, this is how I think the autonomous factory starts to look.

A builder expresses intent, constraints, and acceptance criteria.

The intent layer turns that into an executable contract.

Planning decomposes the objective, resolves dependencies, and determines what work needs to happen.

The capability router selects the appropriate models, tools, skills, and execution strategy.

Agents execute inside bounded environments.

The verification plane independently determines whether the work satisfies the acceptance criteria and required policy.

The system assembles evidence.

Humans retain authority over consequential decisions.

The outcome gets observed.

And those outcomes feed the learning system.

Across the entire lifecycle sits the control plane, governing identity, policy, budgets, state, observability, audit, and authority.

That’s why I call this a factory rather than simply an agent.

A harness executes an agent. A software factory governs the work.”

KEY LINE

“The important architecture is the separation of reasoning, execution, verification, authority, and learning.”

⸻

9. WORKFORCE TRANSFORMATION

This is where you connect directly to Shibu’s ABX vision.

TALKING SCRIPT

“The most interesting consequence may actually be organizational rather than technical.

Shibu described ABX’s charter as workforce transformation, and I think that’s exactly where this goes.

As agents perform more implementation, the engineer’s value moves toward architecture, system decomposition, acceptance criteria, technical judgment, verification, and governance.

Product managers increasingly move from requirements toward executable prototypes.

Designers participate more directly in implementation.

QA moves upstream toward evaluation and acceptance.

Operations becomes increasingly AI-augmented.

So the boundaries between some traditional roles become less rigid.

That’s why I think builder is the right abstraction.

But I don’t think this reduces engineering responsibility.

It does the opposite.

The engineer increasingly becomes responsible for governing a much more powerful production system.”

KEY LINES

“AI doesn’t remove engineering responsibility. It moves it up a level.”

“The engineer increasingly becomes an architect and governor of autonomous production.”

⸻

10. WHAT WILL COMMODITIZE VS. WHAT’S DURABLE?

This section can separate you from weaker candidates.

TALKING SCRIPT

“One of the most important strategic questions is where Adobe should actually invest engineering capacity.

I expect a lot of today’s stack to commoditize quickly.

Foundation-model access. Basic agent loops. Generic tool calling. Generic code generation. Basic orchestration. Generic code review. Prompt techniques. Basic MCP connectivity.

I would be cautious about building large proprietary systems around capabilities where the market is moving extremely quickly.

Where I think enterprise differentiation remains much more durable is enterprise context, secure execution, identity and policy, repository intelligence, evaluation and verification, domain-specific capabilities, outcome data, learning loops, and end-to-end builder workflows.

So I want an architecture that lets Adobe aggressively adopt improvements from the ecosystem without giving away the things that actually differentiate Adobe.”

KEY LINE

“Build for a moving boundary.”

Another strong line

“Proprietary should be an outcome of differentiation, not an architectural preference.”

⸻

11. WHY THIS MATTERS FOR ADOBE

TALKING SCRIPT

“This is why I think Adobe has a particularly interesting opportunity.

You’re starting with roughly 15,000 engineering builders.

You have a highly heterogeneous environment with an enormous repository landscape, mature products, newer cloud services, different languages, and different engineering histories.

You already have agentic experiments emerging across teams.

And the Builders Experience vision intentionally goes beyond developers.

Meta Factory has the opportunity to take fragmented experimentation and turn it into shared organizational capability.

And because Adobe is simultaneously building customer-facing AI products, internal learning can potentially create another feedback loop into Adobe’s broader product strategy.

So I don’t think the end state is simply a better coding assistant.

I think Meta Factory has the opportunity to become the Agentic Operating System for how Adobe builds.”

KEY LINE

“Meta Factory can turn fragmented AI experimentation into organizational capability.”

⸻

12. KEY DESIGN TRADEOFFS

TALKING SCRIPT

“There are several tradeoffs I wouldn’t pretend have one universal answer.

Simplicity versus flexibility. I want to start simple without creating architecture that’s impossible to evolve.

Cost versus quality. I optimize for accepted outcomes, not cheap inference.

Latency versus reasoning depth. Interactive builder workflows and long-running autonomous work need different strategies.

Centralized versus decentralized. Centralize the capabilities teams shouldn’t reinvent while preserving domain specialization.

Build versus adopt. Adopt aggressively where the market commoditizes and build where Adobe differentiates.

Autonomy versus safety. Increase autonomy as verification strength, confidence, and reversibility increase.

Short-term versus long-term. I want to ship quickly without accidentally creating an architecture whose assumptions are already obsolete six months later.

And finally, platform control versus team velocity.

Governance should enable innovation rather than turn the platform into a tollbooth.”

KEY LINE

“The paved path has to be easier than going around the platform.”

⸻

13. METRICS FOR SUCCESS

TALKING SCRIPT

“I would be careful not to measure Meta Factory simply by adoption or tokens consumed.

I’d measure four dimensions.

Delivery: cycle time, time to merge, deployment frequency.

Quality: defect escape rate, security incidents, accepted findings, human correction.

Economics: cost per accepted outcome, token consumption per run, infrastructure cost.

And people: builder adoption, satisfaction, productivity impact, and how much unnecessary manual work disappears.

I’d also look at platform leverage.

How quickly can a new team onboard?

How many shared capabilities are being reused?

How much bespoke infrastructure are teams able to retire?

The platform succeeds when it creates measurable organizational leverage, not simply usage.”

KEY LINE

“A platform succeeds when it creates leverage, not merely adoption.”

⸻

14. WHERE I COULD BE WRONG

This is one of your most important bar-raiser sections.

TALKING SCRIPT

“I also want to be explicit about where this thesis could be wrong, because this space is moving too quickly for anyone to pretend the architecture is settled.

The first uncertainty is the harness boundary.

Models may absorb planning, tool orchestration, context management, and other capabilities much faster than we expect.

The second is inference economics.

If inference costs collapse dramatically, cost-based routing becomes less important, although routing for quality, latency, security, and specialization probably remains.

The third is verification quality.

Independent AI verification may eventually equal or exceed human review for many classes of work.

If that happens, human authority may move farther downstream toward policy, exceptions, and high-risk decisions.

So I don’t want to architect around today’s model limitations.

I want to architect around the capabilities I think remain durable as the models improve.”

KEY LINE

“Build for a moving boundary. Invest in what remains durable even as models get better.”

If they ask what would change your mind

“Evidence.

If evaluation shows that a capability we considered strategically important has become reliably commoditized, I want the architecture to let us replace it.”

That is an excellent bar-raiser answer.

⸻
