---
title: "YOUR SYSTEM-DESIGN MEMORY MAP"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p8448
captured_at: 2026-09-07T20:37:23.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: bd7fe26da188649a835c202a77351649ab85c249f26292bad2dd6a92cd129b0e
---

YOUR SYSTEM-DESIGN MEMORY MAP

￼


Your whiteboard:

Builder Intent → Governed Plan → Route → Orchestrate → Context → Execute → Verify → Evidence → Authority → Deliver → Outcome → Learn

Across the top:

CONTROL PLANE — Identity | Policy | State | Budget | Observability | Audit

Underneath:

ENTERPRISE CONTEXT — Repository Intelligence | Organizational Knowledge | Production Evidence

⸻

THE 15 QUESTIONS I WOULD STUDY HARDEST

If you only rehearse 15 questions, make them these:

￼
If you can answer those naturally, most of the other 560 answers can be derived from first principles.

⸻

THE 10 ARCHITECTURAL DISTINCTIONS TO MEMORIZE

These are more valuable than memorizing technology names.

1. Planner ≠ Plan
The planner may be probabilistic. The plan is governed.

2. Capability ≠ Authority
Being capable of performing an action doesn’t mean you’re permitted to perform it.

3. Context ≠ State ≠ Memory
Context informs reasoning. State governs execution. Memory informs future reasoning.

4. Agent ≠ Harness ≠ Factory
Agent performs reasoning/work. Harness governs agent execution. Factory governs outcomes.

5. Model Routing ≠ Capability Routing
Sometimes the correct execution resource isn’t an LLM at all.

6. Generation ≠ Verification
Generation scales output. Verification scales trust.

7. Confidence ≠ Trust
Confidence is a model property. Trust is a system property.

8. Learning ≠ Promotion
Learning can be autonomous. Promotion should be governed.

9. Task Success ≠ Objective Success
Individual work can succeed while the overall objective fails.

10. Availability ≠ Correctness
A factory can run perfectly and produce the wrong answer.

⸻

THE 12 LINES I WOULD MEMORIZE

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

“Build for a moving boundary.”

⸻

YOUR WHITEBOARD STRATEGY

Do not walk to the whiteboard and immediately draw 25 boxes.

Start verbally:

“Before I design the architecture, I want to clarify five things: who the builder is, what outcome we’re solving, expected scale, trust boundaries, and how we’re measuring success.”

Ask 3–5 useful questions.

Then draw only this:

                         BUILDER
                            │
                    Intent + Acceptance
                            ▼
                     GOVERNED PLAN
                            │
                            ▼
                   CAPABILITY ROUTER
                            │
                            ▼
                 DURABLE ORCHESTRATION
                            │
                ┌───────────┼───────────┐
                ▼           ▼           ▼
             CONTEXT      HARNESS      TOOLS
                │           │           │
                └───────────┼───────────┘
                            ▼
                     SECURE SANDBOX
                            │
                            ▼
                       EXECUTION
                            │
                            ▼
                 VERIFICATION PLANE
                            │
                            ▼
                       EVIDENCE
                            │
                            ▼
                       AUTHORITY
                            │
                            ▼
                    DELIVERY / PROD
                            │
                            ▼
                        OUTCOME
                            │
                            ▼
                        LEARNING

Across the top:

CONTROL PLANE: Identity | Policy | State | Budget | Observability | Audit

Then let Jeffrey and Vikram choose where to drill down.

That’s important. Don’t spend 25 minutes explaining every box.

⸻

IF THEY SAY “GO DEEPER”

Use this pattern every time:

PURPOSE → CONTRACT → STATE → FAILURE → SECURITY → SCALE → TRADEOFF

Example: they point at the router.

“The router’s purpose is selecting a qualified capability for a workload. Its inputs are task characteristics, policy, capability metadata, historical evaluation performance, availability, and economics. Hard constraints establish eligibility; optimization ranks what’s left. Routing decisions and outcomes become observable state. Failure falls back only to prequalified alternatives. Security is an eligibility constraint. At scale I’d begin with static policies and evolve toward empirical routing as evidence accumulates. The tradeoff is optimization value versus routing complexity.”

Now you’re demonstrating system-design depth, not memorization.

⸻

IF THEY INTERRUPT YOU

Good.

That usually means they’ve found something worth exploring.

Don’t fight to finish your prepared architecture.

If Vikram says:

“Forget verification. Tell me about leases.”

Go immediately into:

Worker acquires lease → heartbeat → checkpoint → lease expires → replacement worker → fencing token → stale worker cannot publish → idempotent recovery

If Jeffrey says:

“Why do you need a capability registry?”

Go:

Discovery → ownership → version → qualification → permission → evaluation history → routing → dependency → revocation

Follow their curiosity.

⸻

YOUR DEFAULT TRADEOFF LANGUAGE

Whenever you make an architectural decision, explicitly say what you’re trading.

“I’m choosing X because Y. The cost is Z.”

Examples:

“I’d use ephemeral remote sandboxes because they provide stronger isolation and reproducibility. The cost is startup latency and compute expense.”

“I’d keep durable state outside workers because it gives us recovery and replaceability. The cost is additional coordination and persistence complexity.”

“I’d start with static routing because it’s easier to understand and qualify. The tradeoff is leaving some economic optimization on the table.”

“I’d use retrieval before fine-tuning because it’s easier to update, revoke, and govern. The tradeoff is inference-time context cost.”

That sentence structure will make you sound considerably stronger.

⸻

YOUR DEFAULT FAILURE QUESTION

After drawing any component, ask yourself:

“What happens when this fails halfway through?”

Model fails → fallback / queue / stop
Worker fails → lease + checkpoint
Tool fails → classify + retry/reroute
Context fails → freshness/provenance
Verifier fails → required vs. advisory
Control plane fails → bounded authority expires
State store fails → stop consequential progression
Human doesn’t respond → durable waiting state
Deployment fails → rollback/roll-forward
Learning fails → baseline remains production

That’s distributed-systems thinking.

⸻

YOUR DEFAULT SECURITY QUESTION

Ask:

“What authority does this component actually need?”

Then reduce:

Repository scope
Filesystem
Tools
Credentials
Network
Compute
Time
Tokens
Cost
Publication
Deployment

That’s your sandbox/security model.

⸻

YOUR DEFAULT ECONOMICS QUESTION

Ask:

“What does this cost per accepted outcome?”

Not:

How many tokens?

Include:

Inference + retries + sandbox + tools + verification + human correction

That brings Shibu’s tokenomics priority directly into your architecture without forcing it.

⸻

YOUR DEFAULT VERIFICATION QUESTION

Ask:

“What evidence would convince me this claim is true?”

Then:

Deterministic assertion? → test it.
Security property? → scanner/policy.
Semantic property? → evaluator.
Runtime property? → execute/observe.
High consequence? → independent verification.
Organizational decision? → human authority.

That one mental model handles an enormous portion of the interview.

⸻

THE ANSWER YOU WANT JEFFREY AND VIKRAM TO WALK AWAY WITH

Not:

“Jay knows a lot about AI.”

You want:

“Jay understands that models are only one component of an enterprise autonomous system. He understands distributed systems, state, security, authority, context, evaluation, reliability, economics, and production governance—and he knows which complexity to build now versus later.”

That is the bar for this round.

And your architecture story can be reduced to one final sentence:

“Turn builder intent into a governed plan; route work to qualified capabilities; execute inside bounded environments; verify independently; preserve evidence; grant authority based on risk; observe production outcomes; and let those outcomes improve the next qualified version.”

That’s the entire Architecture & System Design interview in one answer.
