---
title: "THE OPERATING FRAMEWORK TO MEMORIZE"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p8453
captured_at: 2026-09-07T20:51:34.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: 58a2672d0091ce82371983b2f7a1309aa73ebea62b9695f658c77f73e79f925d
---

THE OPERATING FRAMEWORK TO MEMORIZE

For virtually every production scenario:

ASSESS → CONTAIN → PRESERVE → ISOLATE → RESTORE → CORRECT → PREVENT → PROVE

￼

Your default opening

“First I want to establish severity, blast radius, business impact, and whether the incident is still expanding. My immediate priority is containing additional damage while preserving the evidence we’ll need to understand what happened. Then I’ll restore the safest known operating state before spending too much time on perfect root-cause analysis. Once we’re stable, I’ll isolate the failing layer, correct the defect, add the failure to our regression and evaluation systems, and prove the corrective control actually prevents recurrence.”

MEMORIZE: “Contain first. Preserve evidence. Restore safety. Diagnose deeply afterward.”

⸻

YOUR FAILURE-DOMAIN MEMORY MAP

When Alexandru says “Something’s broken”, mentally scan:

MODEL → CONTEXT → PLAN → ROUTING → ORCHESTRATION → STATE → TOOL → SANDBOX → POLICY → VERIFICATION → DELIVERY → INFRASTRUCTURE

Don’t automatically blame the model.

Ask:

Model: bad reasoning, behavioral drift, provider outage?
Context: stale, missing, poisoned, unauthorized?
Plan: incorrect decomposition or acceptance criteria?
Routing: wrong/unqualified capability?
Orchestration: retry storm, deadlock, duplicate execution?
State: corruption, stale lease, lost update?
Tool: outage, compromise, ambiguous side effect?
Sandbox: escape, resource exhaustion, bad image?
Policy: authorization failure, excessive authority?
Verification: false negative, regression, correlated failure?
Delivery: partial deployment, bad migration, rollback failure?
Infrastructure: capacity, database, network, region, identity?

KEY LINE: “Agent failure is a system failure until we’ve isolated the failing layer.”

⸻

THE 20 SCENARIOS I WOULD ACTUALLY STUDY

Don’t rehearse all 178+ equally. Nail these:

￼

THE 10 ANSWERS ALEXANDRU SHOULD HEAR REPEATEDLY

1. Safe state before perfect diagnosis

“Mean time to safe state comes before mean time to perfect understanding.”

2. Preserve evidence

“I want enough evidence to reconstruct the decision and execution path without delaying urgent containment.”

3. Smallest containment boundary

“Contain at the smallest boundary I can trust—capability, model, Factory Version, Execution Profile, workflow, region, then global.”

4. Known-good restoration

“Restore a known-good qualified state before introducing another unqualified variable.”

5. Authority contracts under uncertainty

“When confidence in governance or verification decreases, autonomy should decrease with it.”

6. Failure must be bounded

“We cannot eliminate every failure. We can prevent one failure from becoming an enterprise-wide failure.”

7. Retries are not recovery

“Recovery should change information or strategy, not merely repeat failure.”

8. Production closes the evaluation loop

“Offline evaluation predicts behavior. Production tells us whether the prediction was correct.”

9. Incidents improve the factory

“Every escaped failure should become evidence that strengthens qualification.”

10. Fix systems, not humans

“Corrective actions should change system behavior, not ask people to remember harder.”

⸻

RUNAWAY AGENT — YOUR MODEL ANSWER

QUESTION: “An agent has been running for hours, calling tools repeatedly, and cost is exploding. What do you do?”

TALKING SCRIPT: “First I’d stop the affected execution from the control plane, because budget and lifecycle authority shouldn’t belong to the agent. I’d determine whether this is isolated or whether the same Factory Version is creating similar behavior elsewhere. If systemic, I’d stop new routing to that version.

Before destroying the environment, I’d preserve the relevant trajectory: plan, model route, context, tool calls, state transitions, retries, progress signals, and token/cost telemetry.

Then I’d determine why our controls didn’t terminate it. Was the model repeating the same reasoning? Was a tool returning an ambiguous result? Was context missing? Did progress detection fail? Were budgets configured incorrectly?

Recovery would resume from the last safe checkpoint with a different strategy, not simply restart the same execution.

And the systemic fix would be external limits on time, tokens, tool calls, iterations, compute, cost, and progress, plus circuit breakers and escalation.”

KEY LINE: “The runtime, not the agent, owns the stopping condition.”

⸻

BAD AGENT-GENERATED CODE REACHES PRODUCTION — YOUR MODEL ANSWER

QUESTION: “An autonomous agent shipped a defect. Production is down.”

TALKING SCRIPT: “My first priority is production restoration, not determining whether the model hallucinated. Establish impact and stop expansion. Depending on the system, that could mean disable a feature flag, stop rollout, rollback, shift traffic, or roll forward.

Once production is safe, I’d trace the artifact backward:

Production → Deployment → Authority → Evidence → Verification → Candidate → Execution → Plan → Context → Route.

I want to understand which trust boundary failed.

Did the agent misunderstand the requirement? Did verification miss the defect? Was the verifier correlated with the producer? Was the rollout too broad? Did someone override evidence?

Then I’d reproduce that failure and add it to the qualification corpus.

The corrective action isn’t simply ‘fix the prompt.’ We need to strengthen the control that should have prevented this failure from becoming production consequence.”

KEY LINE: “Fix both the defect and the trust-system gap that allowed the defect through.”

⸻

SECURITY INCIDENT — YOUR MODEL ANSWER

QUESTION: “An agent may have leaked proprietary Adobe code.”

TALKING SCRIPT: “I treat that as a security incident immediately. First contain the authority path: stop affected executions, disable the retrieval or tool capability involved, restrict egress, and revoke potentially exposed credentials.

Then preserve the relevant evidence and establish blast radius: which execution identities, repositories, context sources, models, providers, outputs, caches, and external destinations were involved.

I bring security and privacy responders in early rather than trying to independently decide notification implications.

Only after containment do we determine whether the failure was ACL propagation, cache contamination, prompt injection, tool authorization, credential scope, or another trust-boundary failure.

Before restoring service, I’d require negative tests proving that an unauthorized execution cannot reproduce the exposure.”

KEY LINE: “Contain authority first. Then establish exactly where the data traveled.”

⸻

COST EXPLOSION — YOUR MODEL ANSWER

QUESTION: “Adobe’s inference bill suddenly increases 10x.”

TALKING SCRIPT: “First establish whether this is legitimate adoption or pathological execution. Break consumption down by Factory Version, workload, model, team, repository, context size, retry rate, tool loops, and verification.

If pathological, contain the affected workload while preserving healthy traffic.

Then identify the economic mechanism: Did routing move too much traffic to a frontier model? Did context explode? Did retries increase? Did a provider change token accounting? Did speculative execution activate? Did verification start looping?

I’d restore the previous economic behavior, then fix the control.

Longer term I want budgets at objective, work-order, and attempt levels, with anomaly detection and circuit breakers.

And my north-star isn’t token cost. It’s cost per accepted outcome.”

⸻

WORKER CRASH — YOUR DISTRIBUTED-SYSTEMS ANSWER

QUESTION: “A worker crashes 90 minutes into a two-hour task.”

TALKING SCRIPT: “The worker should be disposable. The authoritative workflow state lives in the control plane.

The worker owns a lease. When it disappears, the lease expires. We identify the last safe checkpoint and reconcile any ambiguous external side effects.

A replacement worker acquires a new lease and reconstructs execution from durable state.

And critically, if the original worker wakes up later, a fencing token prevents it from publishing stale results.

That’s why I design durable state, leases, checkpointing, idempotency, and fencing together.”

KEY LINE: “A stale worker may continue computing. It must not continue committing.”

⸻

THE INCIDENT WHITEBOARD

If Alexandru gives you a complex incident, write:

                        INCIDENT
                           │
             ┌─────────────┴─────────────┐
             │                           │
          IMPACT                     EXPANSION?
     Builders / Prod / Data        Still happening?
             │                           │
             └─────────────┬─────────────┘
                           ▼
                       CONTAIN
                           │
      Route / Capability / Factory / Credential
                           │
                           ▼
                    PRESERVE EVIDENCE
                           │
                           ▼
                    ISOLATE FAILURE
                           │
     Model | Context | State | Tool | Sandbox
     Policy | Verification | Delivery | Infra
                           │
                           ▼
                     RESTORE SAFE
                           │
                Rollback / Failover
                Degrade / Roll-forward
                           │
                           ▼
                     ROOT CAUSE
                           │
                           ▼
                 SYSTEMIC CORRECTION
                           │
                           ▼
                 REGRESSION / EVAL
                           │
                           ▼
                    PROVE THE FIX


That’s enough. Don’t draw a NASA launch diagram during an outage. 😄

⸻

YOUR OPERATIONAL DEGRADATION LADDER

This is particularly useful for agentic systems:

FULL AUTONOMY
↓
AUTONOMOUS EXECUTION + HUMAN ACCEPTANCE
↓
CANDIDATE GENERATION ONLY
↓
RECOMMENDATION ONLY
↓
READ-ONLY DIAGNOSIS
↓
QUEUE / PAUSE

This gives you a sophisticated answer when a subsystem fails.

Instead of saying:

“The system goes down.”

Say:

“I want to determine the highest level of capability we can safely preserve. If verification is degraded, perhaps we reduce autonomous acceptance but continue candidate generation. If authorization is degraded, we may move to read-only. If model inference is unavailable, deterministic portions of the workflow may continue while reasoning work queues.”

KEY LINE: “Degrade capability before degrading safety.”

⸻

YOUR INCIDENT-COMMAND MODEL

For a major incident:

Incident Commander — coordination and decisions
Technical Lead(s) — diagnosis/remediation
Communications Owner — stakeholder updates
Security/Privacy — when applicable
Scribe/Timeline — evidence and decisions

As Senior Manager:

“My job is to create a high-quality decision system under pressure. I establish impact, priorities, ownership, decision authority, communication cadence, and escalation. I stay technically close enough to challenge hypotheses and make tradeoffs without displacing the engineers with the deepest system expertise.”

That is a very strong Senior Manager answer.

⸻

THE FIVE OPERATIONAL METRICS BUCKETS

￼

And distinguish:

Infrastructure SLO: Did the factory run?

Behavioral SLO: Did it produce acceptable outcomes?

That’s important.

THE 12 FAILURE CONTROLS TO MEMORIZE

You can derive almost every reliability answer from these:

1. Timeouts — stop waiting forever.
2. Retries — only for appropriate transient failures.
3. Exponential backoff + jitter — prevent retry synchronization.
4. Circuit breakers — stop hammering broken dependencies.
5. Bulkheads — isolate failure domains.
6. Backpressure — prevent overload propagation.
7. Admission control — reject/defer work before expensive allocation.
8. Leases — recover ownership after worker failure.
9. Fencing tokens — prevent stale workers publishing.
10. Idempotency — make duplicate execution safe.
11. Checkpoints — recover without restarting everything.
12. Reconciliation — repair divergence between intended and actual state.

If Alexandru drills into distributed systems, these are your tools.

⸻

THE 10 INCIDENT QUESTIONS TO ASK YOURSELF

Whenever Alexandru gives you a scenario:

What is the business/customer impact?
Is the incident still expanding?
What is the blast radius?
What changed recently?
What can I disable safely right now?
What evidence must I preserve?
What is the last known-good state?
What side effects may already have happened?
What control should have prevented this?
How will I prove the fix?

If you hit those ten, you’re demonstrating operational judgment.

⸻

WHAT NOT TO DO IN THIS INTERVIEW

Don’t immediately say:

“I’d restart it.” — What failed? Is restart safe?

“I’d rollback.” — Is rollback compatible with current state?

“I’d retry.” — Is the operation idempotent?

“I’d switch models.” — Is the fallback qualified?

“I’d scale workers.” — Is capacity actually the bottleneck?

“I’d add an alert.” — Would anyone meaningfully act on it?

“I’d add a human approval.” — Does that address the actual failure?

“I’d fix the prompt.” — Was the model actually the failed boundary?

“I’d store more logs.” — Which evidence was actually missing?

Instead say:

“Before taking that action, I want to understand whether it can create additional consequence.”

That’s operational maturity.

⸻

ALEXANDRU’S LIKELY PRESSURE TEST

Expect something like:

“Okay, you rolled back. Rollback fails.”

You:

“Then rollback is no longer my safe-state strategy. I reassess current state and look at roll-forward, feature disablement, traffic isolation, or targeted remediation.”

Then:

“Feature flag service is down.”

You:

“Then I move to the next independent containment boundary—traffic routing, deployment control, capability quarantine, or service isolation.”

Then:

“Your observability system is down too.”

You:

“I distinguish mandatory operational evidence from optional telemetry. If I can’t establish enough state to safely continue autonomous execution, I reduce autonomy or pause consequential work.”

They’re testing whether your principles survive changing conditions.

Don’t defend your first solution.

Adapt.

⸻

THE 15 LINES TO MEMORIZE FOR ALEXANDRU

“Contain first. Preserve evidence. Restore safety. Diagnose deeply afterward.”

“Mean time to safe state comes before mean time to perfect understanding.”

“Agent failure is a system failure until we’ve isolated the failing layer.”

“A stale worker may continue computing. It must not continue committing.”

“Retries should reduce transient failure, not amplify permanent failure.”

“Resolve ambiguity before repeating consequence.”

“Degrade capability before degrading safety.”

“When verification weakens, autonomy should contract.”

“An unqualified fallback isn’t resilience.”

“Loss of governance should reduce authority, not expand it.”

“Fix causes before scaling symptoms.”

“Production failures expose gaps in our model of reality.”

“Corrective actions should change system behavior, not ask humans to remember harder.”

“Every escaped failure should strengthen qualification.”

“My job during an incident is to create a high-quality decision system under pressure.”

⸻

YOUR 90-SECOND MASTER ANSWER — CONTINUED

QUESTION: “How do you think about operating autonomous production systems?”

TALKING SCRIPT:

“I start from the assumption that models will fail, tools will fail, workers will crash, context will become stale, providers will go down, and occasionally our own verification will be wrong. So reliability can’t depend on preventing every failure. It has to come from how effectively we bound, detect, contain, recover from, and learn from failure.

When an incident occurs, I first establish severity, blast radius, business impact, and whether the incident is still expanding. Then I contain additional damage while preserving enough evidence to reconstruct what happened.

My priority is getting to a safe state, not immediately proving perfect root cause. That might mean quarantining a Factory Version, disabling a capability, revoking credentials, routing to a qualified fallback, rolling back, reducing autonomy, or moving the platform into recommendation-only mode.

Once stable, I isolate the failure across the system—model, context, plan, routing, orchestration, state, tool, sandbox, policy, verification, delivery, or infrastructure.

Then we correct the immediate defect and ask the more important question: what control should have prevented this failure from becoming consequential?

Finally, I convert the incident into regression evidence, update our evaluation or operational controls, and prove the corrective action works.

That’s how I think about operating autonomous systems: failure is expected; uncontrolled failure propagation isn’t.”

That answer alone establishes your operating philosophy.

⸻

IF HE ASKS: “WHAT’S DIFFERENT ABOUT OPERATING AI SYSTEMS?”

TALKING SCRIPT:

“Most traditional distributed-systems principles still apply—timeouts, retries, idempotency, leases, backpressure, circuit breakers, observability, SLOs, progressive delivery, and disaster recovery.

What’s different is that we’re introducing another source of nondeterminism into the execution path.

The service can be available.

The model can respond successfully.

The tool can execute successfully.

And the resulting outcome can still be wrong.

So I need two reliability models.

Operational reliability: Did the system execute correctly?

Behavioral reliability: Did the system produce an acceptable outcome?

That’s why evaluation and verification become production reliability capabilities rather than simply offline AI testing.”

KEY LINE: “An agent returning HTTP 200 doesn’t mean the system succeeded.”

⸻

IF HE ASKS: “WHAT’S THE MOST IMPORTANT RELIABILITY PRINCIPLE?”

TALKING SCRIPT:

“For autonomous systems, I’d probably choose bounded authority.

Models will eventually become much more capable, but capability doesn’t eliminate failure.

Every execution should have explicit boundaries around repository scope, credentials, tools, network, compute, time, tokens, cost, publication, and production authority.

Then when something behaves incorrectly, we’ve already determined how much damage it can create.

I don’t want incident containment to begin after the agent misbehaves. I want containment designed into the execution contract.”

KEY LINE: “The best incident containment starts before the incident.”

⸻

IF HE ASKS: “WHAT’S YOUR PHILOSOPHY ON SLOs?”

TALKING SCRIPT:

“I separate infrastructure SLOs from behavioral objectives.

Infrastructure SLOs tell me whether APIs, scheduling, state, sandbox provisioning, model gateways, and tools are available.

But autonomous systems also need workload-specific quality objectives around accepted outcomes, verification pass rate, human correction, policy compliance, recovery, and potentially cost per accepted outcome.

Otherwise we could have a 99.99% available factory that reliably produces bad software.”

KEY LINE: “Availability tells me whether it ran. Evaluation tells me whether it worked.”

⸻

IF HE ASKS: “WHAT DO YOU AUTOMATE?”

TALKING SCRIPT:

“I automate recovery where the failure condition is well understood, the remediation is bounded, and the action is reversible.

Worker crashes? Recover from checkpoint.

Lease expires? Reassign work.

Provider outage? Use a qualified fallback.

Bad Factory Version? Route to known-good.

Capacity pressure? Apply backpressure.

Known deployment regression? Roll back if rollback is proven safe.

Where diagnosis is ambiguous or remediation is irreversible, AI can accelerate investigation and propose options while humans retain authority.

Over time, as specific recovery paths demonstrate reliability, we can automate more of them.”

KEY LINE: “Automate proven recovery paths before automating uncertain diagnosis.”

⸻

IF HE ASKS: “HOW DO YOU THINK ABOUT HUMAN-IN-THE-LOOP DURING OPERATIONS?”

TALKING SCRIPT:

“I think in terms of human authority, not mandatory human involvement everywhere.

If the failure is known, the remediation is reversible, and we have strong evidence, automation may be safer and faster than waiting for a person.

If the system is uncertain, the action is high consequence, or recovery is difficult to reverse, human authority increases.

So the question isn’t ‘Should humans be in the loop?’

It’s ‘What evidence does the system need before it earns authority to perform this recovery automatically?’”

KEY LINE: “Human authority should concentrate where uncertainty and consequence intersect.”

⸻

THE FOUR RELIABILITY LOOPS TO REMEMBER

Think about Meta Factory reliability through four loops:

1. EXECUTION LOOP

Reason → Act → Observe → Persist → Verify

Controls: budget, timeout, progress detection, retry, circuit breaker

2. RECOVERY LOOP

Failure → Classify → Checkpoint → Reassign → Reconcile → Resume

Controls: leases, fencing, idempotency, durable state

3. INCIDENT LOOP

Assess → Contain → Preserve → Restore → Diagnose → Correct

Controls: kill switches, rollback, degraded modes, incident command

4. LEARNING LOOP

Incident → Failure Case → Eval → Candidate Fix → Qualification → Promotion

Controls: baseline comparison, canary, rollback

And the critical connection is:

“Production reliability feeds factory learning, but learning never gets to bypass qualification.”

⸻

YOUR “EVERYTHING IS ON FIRE” ANSWER

If Alexandru deliberately gives you an ugly scenario:

“The model provider is degraded, agents are retrying, the queue is exploding, costs are rising, and builders are complaining. What do you do?”

Don’t chase each symptom.

TALKING SCRIPT:

“I want to determine whether these are independent failures or one cascading failure.

My hypothesis would be that provider degradation may be increasing latency and failures, which causes retries, which increases queue depth, which increases worker utilization and cost.

First I’d establish impact and verify that hypothesis from telemetry.

Then I’d break the feedback loop.

Circuit-break or reduce traffic to the failing provider. Stop uncontrolled retries. Apply admission control. Protect critical workloads. Route only eligible workloads to qualified fallbacks. Queue lower-priority work.

Once demand and retry pressure are controlled, I can determine whether additional worker capacity is actually necessary.

I would specifically avoid blindly autoscaling workers because that could simply send more traffic into the failing dependency.

Then, once service is stable, I’d determine why provider degradation created such a large cascade and improve the isolation and backpressure controls.”

KEY LINE: “Don’t scale the symptom. Break the feedback loop.”

That is an excellent production-systems answer.

⸻

YOUR “AGENT DID SOMETHING DANGEROUS” ANSWER

If he asks:

“An agent performed an action it shouldn’t have.”

Your first question should effectively be:

“Was the action unauthorized, or was it authorized but incorrect?”

That distinction is extremely important.

Unauthorized

The authority system failed.

Investigate:

Identity → Policy → Credentials → Tool gateway → Sandbox → Authorization

Authorized but incorrect

The reasoning/trust system failed.

Investigate:

Intent → Plan → Context → Model → Verification → Evidence → Authority policy

KEY LINE: “A bad decision and an unauthorized decision are different incident classes.”

⸻

YOUR “THE AGENT PASSED EVERYTHING AND STILL FAILED” ANSWER

QUESTION: “All verification passed. The change still caused an incident.”

TALKING SCRIPT:

“That’s one of the most valuable failures we can get because it tells us our trust model was incomplete.

Restore production first.

Then ask which property wasn’t represented in verification.

Was the production workload different from our tests?

Did concurrency expose something?

Did we miss a dependency?

Was the acceptance criterion incomplete?

Was the rollout too broad?

Was the verifier correlated with the producer?

Was production configuration different?

Then encode the failure into a regression mechanism.

The goal isn’t simply making that particular test pass next time. It’s identifying the class of assumption our verification system failed to challenge.”

KEY LINE: “Every production escape is evidence about what our verification model doesn’t understand yet.”

⸻

YOUR “I DON’T KNOW” ANSWER

This matters in an operational interview.

If Alexandru asks something where you genuinely don’t yet know the cause:

“I don’t know yet, and I wouldn’t want to speculate during the incident. What I do know is the impact, the current blast radius, and the safest containment action available. I’d preserve the evidence, restore safe operation, and run targeted investigations against the highest-probability hypotheses.”

That’s stronger than inventing a cause.

⸻

YOUR SENIOR-MANAGER OPERATING MODEL

Alexandru isn’t hiring an SRE IC.

He’s evaluating whether a Senior Engineering Manager responsible for Meta Factory can create an organization capable of operating this platform.

Your operating model:

CLEAR OWNERSHIP
Every production factory, capability, tool, model integration, and platform service has an accountable owner.

SLOs
Infrastructure + behavioral reliability.

ON-CALL
Ownership follows systems capable of fixing failures.

RUNBOOKS
Common failure modes have executable recovery procedures.

OBSERVABILITY
End-to-end trajectory from intent through production outcome.

CHANGE MANAGEMENT
Models, prompts, skills, policies, tools, and Factory Versions receive production discipline.

GAME DAYS
Test failures before incidents test them for you.

POSTMORTEMS
System-focused, evidence-driven, corrective actions.

EVALUATION FEEDBACK
Production failures become qualification cases.

PROGRESSIVE AUTONOMY
Autonomy expands only as evidence demonstrates reliability.

⸻

WHAT YOU WANT ALEXANDRU THINKING

Not:

“Jarrett knows AI terminology.”

Not even:

“Jarrett understands SRE.”

You want:

“Jarrett understands how autonomous systems fundamentally change the failure surface, but he applies disciplined production engineering rather than treating AI as magical infrastructure.”

Specifically:

He doesn’t panic.
He establishes impact before debugging.
He contains before theorizing.
He understands distributed systems.
He separates intelligence from authority.
He knows rollback isn’t always safe.
He understands degraded modes.
He preserves evidence.
He knows when humans should intervene.
He converts incidents into systemic improvements.

⸻

THE 10 QUESTIONS I WOULD REHEARSE OUT LOUD

If you have limited study time, practice these until the answers feel conversational:

1. “An autonomous agent is stuck in a loop and spending thousands of dollars. What do you do?”

2. “A new model version suddenly produces bad code across hundreds of repositories.”

3. “An agent-generated change passes every test and causes a production outage.”

4. “A worker crashes halfway through a two-hour autonomous task.”

5. “The same task executes twice and both workers attempt to publish.”

6. “Your primary model provider goes down.”

7. “An agent may have leaked code from one repository into another.”

8. “Your verification service is down. Do you keep autonomous execution running?”

9. “The queue is exploding, latency is increasing, retries are increasing, and costs are climbing. What’s your response?”

10. “Tell me how you would operate Meta Factory reliably at Adobe scale.”

If you can handle those ten, you can derive almost everything else.

⸻

THE 10 RAPID-FIRE DEFINITIONS

Circuit breaker: Stops repeated calls into a failing dependency.

Backpressure: Prevents upstream demand from overwhelming downstream capacity.

Bulkhead: Isolates workloads so one failure doesn’t consume everything.

Lease: Time-bounded ownership that can recover after worker failure.

Fencing token: Prevents an old owner from publishing after ownership changed.

Idempotency: Makes repeated execution produce one intended effect.

Checkpoint: Durable recovery boundary.

Reconciliation: Compares authoritative desired state with actual external state and repairs divergence.

RPO: How much state/data loss is acceptable.

RTO: How long recovery may take.

Know these cold.

⸻

YOUR 30-SECOND CLOSING POSITION

If Alexandru eventually asks what reliability means for an autonomous software factory:

“I don’t define reliability as agents never failing. Models, tools, infrastructure, and humans will all fail. I define reliability as the system’s ability to keep those failures bounded, observable, recoverable, and increasingly difficult to repeat. The more autonomy we introduce, the more important durable state, bounded authority, independent verification, evidence, progressive rollout, and tested recovery become. Ultimately, autonomous software development is only valuable if we can operate it with the same—or stronger—production discipline we expect from every other critical engineering platform.”

The five lines to walk into the room remembering

“Contain first. Preserve evidence. Restore safety. Diagnose deeply afterward.”

“Mean time to safe state comes before mean time to perfect understanding.”

“Degrade capability before degrading safety.”

“Loss of governance should reduce authority, not expand it.”

“Failure is expected. Uncontrolled failure propagation isn’t.”

That’s the spine of your Production Systems, Reliability & Operational Judgment round.
