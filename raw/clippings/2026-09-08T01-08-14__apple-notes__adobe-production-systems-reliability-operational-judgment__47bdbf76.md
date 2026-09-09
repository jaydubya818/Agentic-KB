---
title: "ADOBE — PRODUCTION SYSTEMS, RELIABILITY & OPERATIONAL JUDGMENT"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p8557
captured_at: 2026-09-08T01:08:14.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: 47bdbf76b8db83daed0466ec4905ea1d016d1840bf098828df9b95461465ab8f
---

ADOBE — PRODUCTION SYSTEMS, RELIABILITY & OPERATIONAL JUDGMENT
Interviewer: Alexandru Chiculita Duration: 45 Minutes Role: Senior Manager Engineering — Meta Factory / Agentic Builders Experience

⸻

0. WHAT ALEXANDRU IS REALLY TESTING
This is not primarily a system-design interview.
Jeffrey + Vikram:
“How would you design the system?”
Alexandru:
“You built it. It’s running in production. Something is going wrong, autonomous agents are still executing, builders are affected, and you don’t know exactly why. What do you do?”
He is testing whether you can:
Establish severity and blast radius quickly.
Make decisions with incomplete information.
Stop additional damage without destroying evidence.
Separate symptoms from causes.
Understand distributed-system failure modes.
Handle AI-specific behavioral failures.
Know when to rollback, roll forward, degrade, quarantine, or stop.
Understand security and authority boundaries.
Preserve service without weakening safety.
Lead engineers effectively during a major incident.
Convert incidents into systemic reliability improvements.
What you want Alexandru thinking
“Jay understands autonomous systems, but he operates them with disciplined production engineering rather than treating AI as magical infrastructure.”
You want him to see that you:
Do not panic.
Establish impact before debugging.
Contain before theorizing.
Preserve evidence.
Understand distributed systems.
Separate intelligence from authority.
Understand that rollback isn’t always safe.
Know how to use degraded modes.
Know when humans should intervene.
Convert incidents into stronger systems.

⸻

1. THE FRAMEWORK TO MEMORIZE
ASSESS → CONTAIN → PRESERVE → ISOLATE → RESTORE → CORRECT → PREVENT → PROVE
￼
DEFAULT OPENING
“First, I want to establish severity, blast radius, business impact, and whether the incident is still expanding. Then I want to contain additional damage while preserving enough evidence to understand what happened.
My immediate objective is getting to a safe state, not proving perfect root cause. Once we’re stable, I’ll isolate the failing layer, restore known-good behavior, correct the defect, turn the incident into a regression case, strengthen the control that failed, and prove through production evidence that the corrective action works.”
MEMORIZE
“Contain first. Preserve evidence. Restore safety. Diagnose deeply afterward.”

⸻

2. YOUR RELIABILITY PHILOSOPHY
MASTER 60-SECOND ANSWER
QUESTION
“How do you think about reliability for agentic systems?”
TALKING SCRIPT
“Agent reliability is different from traditional service reliability because the service can be available while the agent is behaving incorrectly.
So I think about reliability at several levels.
Infrastructure reliability tells me whether the platform is available.
Execution reliability tells me whether workflows complete.
Outcome reliability tells me whether they completed correctly.
Policy compliance tells me whether they operated within their authority.
And economic reliability tells me whether they did so efficiently.
I assume models will fail, tools will fail, workers will crash, context will become stale, providers will go down, and occasionally our verification will be wrong.
So I design around bounded execution, durable state, idempotency, leases, fencing, circuit breakers, backpressure, sandboxing, independent verification, evidence, progressive rollout, and human escalation.
The goal isn’t to make probabilistic components deterministic.
It’s to build deterministic controls around probabilistic intelligence.”

⸻

3. WHAT IS DIFFERENT ABOUT OPERATING AI SYSTEMS?
Traditional distributed-system principles still apply:
Timeouts → Retries → Backoff → Circuit Breakers → Bulkheads → Backpressure → Idempotency → Durable State → Leases → Observability → SLOs → Progressive Delivery → DR
But AI introduces another source of nondeterminism.
The:
API can return 200.
Model can respond successfully.
Tool can execute successfully.
Workflow can complete successfully.
…and the outcome can still be wrong.
Therefore you need two reliability models:
OPERATIONAL RELIABILITY
Did the system execute correctly?
BEHAVIORAL RELIABILITY
Did the system produce an acceptable outcome?
KEY LINE
“An agent returning HTTP 200 doesn’t mean the system succeeded.”
This is why evaluation and verification become production reliability capabilities, not merely offline AI testing.

⸻

4. FAILURE-DOMAIN MEMORY MAP
When Alexandru says “Something is broken,” mentally scan:
MODEL → CONTEXT → PLAN → ROUTING → ORCHESTRATION → STATE → TOOL → SANDBOX → POLICY → VERIFICATION → DELIVERY → INFRASTRUCTURE
Ask:
￼
KEY LINE
“Agent failure is a system failure until we’ve isolated the failing layer.”
Do not automatically blame the model.

⸻

5. THE INCIDENT WHITEBOARD
Draw this for a complex scenario:
                       INCIDENT
                          │
             ┌────────────┴────────────┐
             │                         │
          IMPACT                  EXPANDING?
   Builders / Prod / Data        Still happening?
             │                         │
             └────────────┬────────────┘
                          ▼
                       CONTAIN
                          │
       Route / Capability / Factory Version
       Credential / Workflow / Region
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
        Rollback | Failover | Degrade
        Roll-forward | Recommendation-only
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
Don’t draw a NASA launch diagram during the outage. 😄

⸻

6. BLAST RADIUS FIRST
QUESTION
“What is the first thing you need to understand?”
TALKING SCRIPT
“I need to know what is affected and whether impact is growing.
Which builders? Repositories? Factory Versions? Models? Tools? Regions? Production systems? Credentials?
Then I distinguish active exposure from historical exposure.
That determines whether I need a global stop, targeted quarantine, rollback, degraded operation, or continued observation.”
KEY LINE
“Before fixing the failure, understand how far the failure can travel.”

⸻

7. SAFE STATE VS. ROOT CAUSE
QUESTION
“Do you diagnose first or rollback first?”
TALKING SCRIPT
“If impact is active and I have a known-safe containment or restoration path, I prioritize reducing consequence before exhaustive diagnosis.
I preserve enough evidence first, but I don’t need perfect causal understanding before quarantining a bad Factory Version, revoking a credential, or stopping a rollout.
Once the blast radius is controlled, we can perform deeper root-cause analysis.”
KEY LINE
“Mean time to safe state comes before mean time to perfect understanding.”

⸻

8. SMALLEST CONTAINMENT BOUNDARY
Do not automatically shut down the whole platform.
Contain hierarchically:
Execution → Capability → Model → Factory Version → Execution Profile → Workflow → Organization → Region → Global
KEY LINE
“Contain at the smallest boundary I can trust.”
This demonstrates blast-radius management instead of panic.

⸻

9. OPERATIONAL DEGRADATION LADDER
One of your strongest concepts:
FULL AUTONOMY
      ↓
AUTONOMOUS EXECUTION
+ HUMAN ACCEPTANCE
      ↓
CANDIDATE GENERATION ONLY
      ↓
RECOMMENDATION ONLY
      ↓
READ-ONLY DIAGNOSIS
      ↓
QUEUE / PAUSE
If verification is degraded: → Continue generation, remove autonomous acceptance.
If authorization is uncertain: → Move toward read-only.
If models are unavailable: → Deterministic work may continue while reasoning queues.
KEY LINE
“Degrade capability before degrading safety.”
And:
“When verification weakens, autonomy should contract.”

⸻

10. RUNAWAY AGENT
QUESTION
“An agent has been running for hours, repeatedly invoking tools and burning money.”
TALKING SCRIPT
“First I stop the affected execution from the control plane because lifecycle and budget authority shouldn’t belong to the agent.
Then I determine whether the behavior is isolated or whether the same Factory Version, model, skill, or tool is creating similar behavior elsewhere. If systemic, stop new routing to that version.
Before destroying the environment, preserve the relevant trajectory: plan, model route, context, tool calls, state transitions, retries, progress signals, verification changes, tokens, and cost.
Then determine why our controls didn’t terminate it.
Was the model repeating reasoning?
Was a tool returning ambiguous results?
Was context missing?
Did progress detection fail?
Were budgets wrong?
Recovery should resume from the last safe checkpoint with a different strategy, not simply restart the same execution.
Long term, enforce external limits on time, tokens, tool calls, iterations, compute, cost, and progress, with circuit breakers and escalation.”
KEY LINES
“The runtime, not the agent, owns the stopping condition.”
“Autonomy must always be bounded.”

⸻

11. HOW DO YOU DETECT A STUCK AGENT?
Do not rely only on max_iterations = 20.
Look for:
Equivalent tool calls repeatedly.
Identical errors.
Unchanged workflow state.
Near-identical plans.
Repeated edits followed by reversions.
No verification improvement.
Oscillation between states.
Increasing cost without increasing evidence.
A legitimate six-hour migration can require hundreds of steps.
Therefore:
Budgets should be workload-specific, but externally enforced.

⸻

12. TOKEN / COST EXPLOSION
QUESTION
“Inference spend increases 10x overnight.”
TALKING SCRIPT
“First determine whether this is legitimate adoption or pathological execution.
Break consumption down by Factory Version, workload, model, organization, repository, context size, retries, cache behavior, tool loops, verification, and successful outcomes.
If pathological, contain the affected workload while preserving healthy traffic.
Then identify the amplification mechanism:
Routing shifted to frontier models?
Context size exploded?
Retry rates increased?
Cache hit rate collapsed?
Recursive execution?
Speculative execution?
Verification loops?
Success rate dropped?
Longer term, I want budgets at the objective, work-order, and attempt level, anomaly detection, and circuit breakers.
But my north-star isn’t token consumption.
It’s cost per accepted outcome.”
KEY LINES
“Cost is an execution constraint, not just an accounting metric.”
“Optimize for cost per accepted outcome.”

⸻

13. EVERYTHING IS ON FIRE
QUESTION
“The provider is degraded, agents are retrying, queues are exploding, costs are rising, and builders are complaining.”
TALKING SCRIPT
“I don’t want to treat those as five independent incidents until I understand whether they’re one cascading failure.
My initial hypothesis is provider degradation increases latency and failures → failures trigger retries → retries increase queue depth → queue growth consumes workers and raises cost → saturation creates additional timeouts.
First verify that from telemetry.
Then break the feedback loop.
Circuit-break or reduce traffic to the failing provider.
Stop uncontrolled retries.
Apply admission control.
Protect critical workloads.
Route only eligible workloads to qualified fallbacks.
Queue lower-priority work.
Only after demand and retry pressure are controlled would I decide whether additional worker capacity is actually necessary.
Blind autoscaling could simply send more traffic into the failing dependency.”
KEY LINE
“Don’t scale the symptom. Break the feedback loop.”

⸻

14. PROMPT INJECTION
QUESTION
“The agent reads malicious instructions from a README.”
TALKING SCRIPT
“Repository content is untrusted data, never authority.
A README, source file, issue, dependency, test fixture, or comment can contain adversarial instructions.
So even if malicious content successfully influences model reasoning, it should encounter deterministic boundaries before creating consequential action.
Policy lives outside the model. Tool authorization lives outside the model. Credentials are scoped. Execution is sandboxed. Egress is restricted. Sensitive actions require deterministic authorization.
During an incident, stop affected workflows, preserve trajectories, rotate potentially exposed credentials, determine what actions occurred and whether anything crossed the execution boundary.
Then turn the attack into an adversarial regression case.”
KEY LINE
“Prompt injection is ultimately an authority problem, not just a prompting problem.”

⸻

15. CREDENTIAL EXPOSURE
QUESTION
“An agent exposes a production credential.”
TALKING SCRIPT
“First: revoke or rotate it.
I don’t wait for complete RCA while active exposure exists.
Then determine where it traveled:
Model context → Logs → Traces → Generated code → Tools → Artifacts → Network requests
Then determine what authority it provided and inspect for unauthorized activity.
After containment, ask why the agent possessed it.
Long term I want workload identity, short-lived credentials, least privilege, just-in-time secret injection, telemetry redaction, and automatic expiration.”
KEY LINE
“Agents need capabilities, not possession of long-lived secrets.”

⸻

16. SANDBOX ESCAPE
QUESTION
“You suspect an agent escaped the sandbox.”
TALKING SCRIPT
“I treat that as a security incident, not a failed agent run.
Stop the affected Execution Profile.
Isolate potentially compromised hosts.
Preserve process, filesystem, network, identity, sandbox, and host evidence.
Revoke exposed credentials.
Determine whether lateral movement occurred.
Restore only onto known-clean infrastructure.
Then investigate whether the weakness came from runtime isolation, mounts, kernel exposure, credential scope, network policy, or host configuration.
Architecturally I want ephemeral execution, strong isolation, minimal host surface, scoped mounts, restricted egress, short-lived identity, resource limits, and automatic teardown.
And I assume repository code itself can be hostile.”
KEY LINE
“The sandbox is a security boundary, not a convenience feature.”

⸻

17. CROSS-REPOSITORY DATA LEAKAGE
QUESTION
“A developer receives context from a repository they cannot access.”
TALKING SCRIPT
“That’s immediately a data-isolation incident.
Disable or constrain the affected retrieval path.
Determine whether this was one response or systematic leakage.
Preserve the identity, query, retrieved documents, ACL decision, indexing metadata, cache behavior, context assembly, model route, and response.
Then isolate the authorization failure:
Ingestion → Indexing → Retrieval → Cache → Context Assembly → Tool Authorization → Output
Permissions need to travel with content, and authorization needs to be enforced against the requesting identity at retrieval time.”
KEY LINE
“Retrievability is not authorization.”

⸻

18. MCP / TOOL COMPROMISE
QUESTION
“An MCP capability is compromised.”
TALKING SCRIPT
“I want centralized capability revocation without redeploying every agent.
Disable that tool/version.
Query which Factory Versions and executions depended on it.
Determine what data and authority it could access.
Rotate credentials.
Inspect side effects.
Invalidate affected qualification.
Then requalify the replacement before restoring it.
This is why I separate tool discovery from tool authority.”
KEY LINE
“MCP standardizes connectivity. It doesn’t outsource governance.”

⸻

19. TOOL TIMEOUT AFTER SIDE EFFECT
QUESTION
“The API timed out. Did the action happen?”
TALKING SCRIPT
“Completion is unknown, not failed.
Before retrying, query the external system using the operation identity or idempotency key.
Only retry when we know the operation didn’t occur or the API guarantees idempotent submission.”
KEY LINE
“Resolve ambiguity before repeating consequence.”

⸻

20. BAD MODEL RELEASE
QUESTION
“Offline evaluations improved, but production quality got worse.”
TALKING SCRIPT
“That tells me qualification didn’t sufficiently represent production behavior.
First route affected workloads back to the previous qualified known-good model where safe.
Then compare production failures with the offline corpus.
Maybe generation improved while tool selection regressed.
Maybe one repository class collapsed while aggregate performance improved.
Maybe production context differs.
Maybe latency changed agent behavior.
Those production failures become new evaluation cases.
Then I review why promotion allowed it through.
I want workload-specific gates and progressive rollout, not one aggregate benchmark.”
KEY LINE
**“Offline evaluations predict production behavior
20. BAD MODEL RELEASE — CONTINUED
KEY LINE
“Offline evaluations predict production behavior. Production outcomes validate the evaluations.”
And:
“A model upgrade is a production change and needs rollback semantics.”

⸻

21. MODEL PROVIDER OUTAGE
QUESTION
“Your primary model provider goes down. What happens?”
TALKING SCRIPT
“The capability registry and router should already know which fallback models are qualified for each workload class.
For some workloads, we can transparently fail over.
For others, we queue.
Some can operate in degraded mode.
High-risk workloads without a qualified alternative should pause.
What I would not do is route consequential work to an arbitrary available model simply because the preferred provider is unavailable.
I’d also protect the fallback provider from a thundering herd using admission control, rate limits, bounded concurrency, and gradual traffic shifting.
Availability doesn’t override the quality, security, or policy bar.”
FOLLOW-UP
“Why support multiple providers?”
“Operational resilience is one reason, but provider diversity only creates resilience if the alternative has actually been qualified for the workload.”
KEY LINE
“An unqualified fallback isn’t resilience.”

⸻

22. QUALITY VS. AVAILABILITY
QUESTION
“What if staying available requires using a lower-quality model?”
TALKING SCRIPT
“I wouldn’t optimize availability in isolation.
For low-risk interactive assistance, an evaluated but somewhat weaker model may be acceptable.
For security review, production migration, autonomous deployment, or other high-consequence workflows, lowering the quality bar simply to stay technically available may create more harm than pausing.
So degradation policy should be workload-specific.
Reliability means delivering the required service level—not merely returning a response.”
KEY LINE
“Availability does not override the quality or safety bar.”

⸻

23. MODEL BEHAVIOR CHANGES WITHOUT A VERSION CHANGE
QUESTION
“The provider says nothing changed, but your outcomes suddenly regress.”
TALKING SCRIPT
“Production evidence outranks the assumption of behavioral stability.
I’d compare accepted outcomes, verification failures, tool behavior, latency, context utilization, token patterns, and workload segmentation against the previous baseline.
If our behavioral SLO is breached, I reduce traffic or quarantine the route while investigating.
I’ll engage the provider with request IDs and evidence, but I don’t need provider confirmation before protecting production.”
KEY LINE
“Operate from observed behavior, not assumed behavioral stability.”

⸻

24. EVALUATION REGRESSION
QUESTION
“Success rate drops from 80% to 60% overnight.”
TALKING SCRIPT
“First determine whether the system changed or the measurement changed.
Did the:
Model change?
Router?
Prompt?
Skill?
Retrieval?
Context source?
Evaluation corpus?
Evaluator?
Judge model?
Infrastructure?
Then segment by workload.
Maybe Java is stable while C++ collapsed.
Maybe generation is healthy but code review deteriorated.
Maybe one Factory Version is responsible.
Then identify the earliest correlated change and replay representative cases against the previous known-good configuration.
I don’t want to change five variables simultaneously because that destroys our ability to isolate causality.”
KEY LINE
“First determine whether behavior changed or measurement changed.”

⸻

25. OFFLINE EVALS PASS — PRODUCTION FAILS
QUESTION
“Everything passed qualification, but production is bad.”
TALKING SCRIPT
“Restore safe production behavior first. Then treat the incident as evidence that our qualification model was incomplete.
I want to know what property production exposed that qualification didn’t.
Was the production workload different?
Concurrency?
Repository scale?
Context?
Tool behavior?
Provider behavior?
Production configuration?
Dependency interaction?
Did our verifier correlate too closely with the producer?
Was rollout too broad?
Then capture representative production failures and add them to the qualification corpus.
The goal isn’t merely making that one test pass.
It’s identifying the class of assumption our verification system failed to challenge.”
KEY LINE
“Production failures expose gaps in our model of reality.”
And:
“Every production escape is evidence about what our verification model doesn’t understand yet.”

⸻

26. WHAT IF THE VERIFIER IS WRONG?
QUESTION
“You rely on independent verification. What happens when the verifier is wrong?”
TALKING SCRIPT
“Independent doesn’t mean infallible.
I don’t want one mechanism determining trust.
Where possible, deterministic evidence dominates:
Tests
Static analysis
Security scanning
Schema validation
Policy checks
Build results
Runtime invariants
For semantic evaluation, depending on risk, I may use different models, different prompts, domain-specific evaluators, historical baselines, or human review.
And importantly, I evaluate the evaluators.
Production outcomes tell us whether our verification system actually predicts quality.
The goal isn’t finding one perfect judge.
It’s creating a verification system with diverse evidence and known confidence.”
KEY LINE
“Independent verification reduces correlated failure; it doesn’t eliminate error.”

⸻

27. VERIFICATION REGRESSION
QUESTION
“Your verifier starts missing defects.”
TALKING SCRIPT
“I treat the verifier as a production dependency.
Determine which Factory Versions and workloads depend on it.
If verification confidence is materially compromised, reduce autonomy.
Restore the previous qualified verifier where possible.
Re-run affected high-risk candidates where necessary.
Then determine whether the regression came from the model, rubric, context, tool, aggregation logic, or evaluator configuration.
Every escaped defect becomes a protected regression case.”
KEY LINE
“When verification weakens, autonomy should contract.”

⸻

28. VERIFIERS DISAGREE
QUESTION
“Security passes, tests pass, but semantic review fails. What wins?”
TALKING SCRIPT
“I wouldn’t majority-vote heterogeneous evidence.
The verification policy should define the authority semantics of each signal.
A mandatory security failure can block regardless of other scores.
A probabilistic architecture disagreement may trigger another evaluator or human review.
Verification disagreement itself is evidence of uncertainty.
The required response depends on workload consequence.”
KEY LINE
“Verification disagreement should trigger policy, not improvisation.”

⸻

29. BAD AGENT-GENERATED CODE REACHES PRODUCTION
QUESTION
“An autonomous agent shipped a defect and production is down.”
TALKING SCRIPT
“My first priority is restoring production—not determining whether the model hallucinated.
Establish impact and stop expansion.
Depending on the system, that could mean:
Feature disable → Stop rollout → Traffic shift → Rollback → Roll-forward
Once production is safe, trace the artifact backward:
Production → Deployment → Authority → Evidence → Verification → Candidate → Execution → Plan → Context → Route
I’m looking for the failed trust boundary.
Did the agent misunderstand the requirement?
Did verification miss the defect?
Was the verifier correlated with the producer?
Was rollout too broad?
Did someone override evidence?
Did production differ from qualification?
Then reproduce the failure and add it to qualification.
The corrective action isn’t simply ‘fix the prompt.’
We strengthen the control that should have prevented the defect from becoming production consequence.”
KEY LINE
“Fix both the defect and the trust-system gap that allowed the defect through.”

⸻

30. BAD PRs ACROSS HUNDREDS OF REPOSITORIES
QUESTION
“An agent starts generating bad PRs across hundreds of repositories.”
TALKING SCRIPT
“First distinguish a quality incident from a safety incident.
If these are poor candidates that haven’t created downstream consequence, I may disable publication for that Factory Version while preserving candidate generation for investigation.
If production authority, protected repositories, security, or destructive side effects are involved, containment becomes more aggressive.
Then preserve representative failed trajectories and compare them with known-good runs.
I’m looking for the common change boundary:
Model → Prompt → Skill → Context → Router → Tool → Policy → Verification → Factory Version
Once isolated, restore the known-good composition.
Then convert representative failures into regression cases before the capability returns to production.”
KEY LINE
“Contain the failing capability, not necessarily the entire platform.”
And:
“Generation failure should not automatically become repository pollution.”

⸻

31. BAD CODE ALREADY MERGED
QUESTION
“What if those PRs already merged?”
TALKING SCRIPT
“Now the blast radius includes authoritative source state.
Identify every affected merge and whether it deployed.
Prioritize by production impact, security risk, dependency impact, and reversibility.
Revert where safe.
Roll forward where rollback is dangerous because state or dependencies have changed.
And increase verification around dependent changes because several individually bad commits may interact.”
KEY LINE
“Once bad candidates become accepted state, recovery moves from containment to restoration.”

⸻

32. DUPLICATE EXECUTION
QUESTION
“The same task executes twice.”
TALKING SCRIPT
“First distinguish duplicate computation from duplicate consequence.
Two workers generating the same candidate is wasteful.
Two workers deploying, opening PRs, updating tickets, or modifying databases can be dangerous.
In distributed systems I generally assume at-least-once execution, so consequential operations need idempotency or equivalent deduplication.
I’d inspect the task ID, attempt IDs, leases, fencing tokens, idempotency keys, and external side effects, then reconcile actual state.
Durable state, leases, fencing, idempotency, and publication authority all need to work together.”
MISSION CONTROL CONNECTION
“I’ve explored this directly in Mission Control using durable workers, leases, sequenced events, attempt-specific execution, and lease-checked publication.”
KEY LINE
“Duplicate computation is expensive. Duplicate consequence is dangerous.”

⸻

33. WORKER CRASH
QUESTION
“A worker crashes 90 minutes into a two-hour task.”
TALKING SCRIPT
“The worker should be disposable. The authoritative workflow state lives in the control plane.
The worker owns a time-bounded lease.
When it disappears, that lease expires.
We identify the last safe checkpoint and reconcile any ambiguous external side effects.
A replacement worker acquires a new lease and reconstructs execution from durable state.
Critically, if the original worker wakes up later, its stale ownership must prevent it from publishing authoritative results.”
KEY LINE
“Persist the workflow, not the worker.”

⸻

34. STALE WORKER WAKES UP
QUESTION
“Worker A times out. Worker B takes over. Then Worker A wakes up and publishes.”
TALKING SCRIPT
“Worker A has lost authority.
Every consequential publication validates current ownership through a lease epoch or fencing token.
Once Worker B has acquired newer ownership, Worker A may continue computing locally—but its publication attempt must be rejected.
Killing processes isn’t enough because distributed systems produce delayed and partitioned workers.”
KEY LINE
“A stale worker may continue computing. It must not continue committing.”
This is one of your strongest distributed-systems lines.

⸻

35. LEASE SERVICE FAILURE
QUESTION
“What if the lease mechanism itself fails?”
TALKING SCRIPT
“That’s authority-sensitive infrastructure.
Stop granting new ownership.
Workers whose authority can’t be validated shouldn’t publish consequential results.
Some safe local computation might continue, depending on workload risk, but authority contracts until ownership can be established.
After restoration, reconcile ambiguous attempts before resuming normal operation.”
KEY LINE
“When ownership is uncertain, stop consequence before stopping computation.”

⸻

36. STATE CORRUPTION
QUESTION
“Workflow state becomes inconsistent.”
TALKING SCRIPT
“Pause consequential progression for affected executions.
Preserve state and event history.
Compare:
Authoritative state
Durable events
Artifacts
Leases
External side effects
Worker observations
Recover from the last known-consistent state where possible.
I don’t want workers reconstructing authoritative truth from their conversation history.”
KEY LINE
“When authoritative state is uncertain, reduce authority until state is reconciled.”

⸻

37. TOOL SIDE EFFECTS + IDEMPOTENCY
Know this pattern cold:
REQUEST
   │
   ▼
External Side Effect
   │
   ├── Response received ──► Known outcome
   │
   └── Timeout ────────────► UNKNOWN outcome
                                  │
                                  ▼
                              RECONCILE
                                  │
                       Did operation happen?
                           │             │
                          YES            NO
                           │             │
                        DON'T          RETRY
                        REPEAT       IDEMPOTENTLY
KEY LINE
“Resolve ambiguity before repeating consequence.”

⸻

38. THE 12 DISTRIBUTED-SYSTEM CONTROLS TO KNOW COLD
￼
RAPID-FIRE DEFINITIONS
Circuit breaker: Stops repeated calls into a failing dependency.
Backpressure: Prevents upstream demand from overwhelming downstream capacity.
Bulkhead: Isolates failure so one workload cannot consume everything.
Lease: Time-bounded ownership that permits recovery after worker failure.
Fencing token: Prevents an old owner from publishing after ownership changes.
Idempotency: Allows repeated execution without repeated consequence.
Checkpoint: Durable point from which execution can safely resume.
Reconciliation: Compares authoritative intent/state with external reality and repairs divergence.
RPO: Maximum acceptable state/data loss.
RTO: Maximum acceptable recovery duration.

⸻

39. RETRY STORM
QUESTION
“A failing dependency causes every worker to retry.”
TALKING SCRIPT
“Retries are themselves load.
Trip the circuit breaker.
Stop useless retries.
Classify the dependency failure.
Protect our platform and the downstream service.
Retry budgets should exist at both individual-attempt and aggregate-platform levels.
When the dependency recovers, gradually reintroduce traffic with backoff and jitter rather than releasing everything simultaneously.”
KEY LINE
“Retries should reduce transient failure, not amplify permanent failure.”

⸻

40. THUNDERING HERD
QUESTION
“The provider recovers and thousands of queued jobs hit it simultaneously.”
TALKING SCRIPT
“Recovery traffic needs control too.
Use bounded concurrency, admission control, exponential backoff with jitter, and gradual queue draining.
The scheduler should understand downstream capacity instead of letting every worker independently decide to retry.”
KEY LINE
“Recovery traffic needs backpressure too.”

⸻

41. QUEUE EXPLOSION
QUESTION
“Queue depth increases 20x.”
TALKING SCRIPT
“First determine whether the problem is demand increase or throughput collapse.
Compare arrival rate versus service rate.
Then inspect workload mix, provider latency, sandbox provisioning, tools, verification, worker utilization, and recent changes.
Protect critical and interactive workload classes with priority and admission control.
Delay lower-priority work.
Don’t scale workers blindly if the bottleneck is downstream.”
KEY LINE
“Queue depth is the symptom. Arrival rate versus service rate tells me why.”

⸻

42. RESOURCE EXHAUSTION
QUESTION
“One agent consumes enormous CPU, memory, or disk.”
TALKING SCRIPT
“The execution environment should enforce hard CPU, memory, disk, process, and wall-clock limits independently of the model.
Terminate the offending workload and preserve evidence.
Then determine whether the workload legitimately needs a larger Execution Profile or whether generated code behaved pathologically.
One task can exhaust its allocation.
It should never destabilize the worker fleet.”
KEY LINE
“A task may exhaust its allocation. It must not exhaust the platform.”

⸻

43. NOISY NEIGHBOR
QUESTION
“One Adobe organization consumes most platform capacity.”
TALKING SCRIPT
“Apply organizational quotas and fair-share scheduling while determining whether demand is legitimate.
Protect other tenants.
If that workload is strategically urgent, explicitly change priority or allocate additional capacity.
Don’t let accidental demand become accidental organizational policy.”
KEY LINE
“Fairness should be policy, not incident improvisation.”

⸻

44. OBSERVABILITY OUTAGE
QUESTION
“Tracing goes down, but agents appear healthy. Do you keep running?”
TALKING SCRIPT
“That depends on workload risk.
I want observability sufficiently decoupled that telemetry failure doesn’t automatically crash execution.
Low-risk workflows may continue while mandatory events are durably buffered.
But high-autonomy or high-impact workflows may need to degrade or pause because we’ve lost evidence necessary for supervision.
I distinguish optional debugging telemetry from required operational evidence.
I don’t want agents operating indefinitely without accountability simply because compute is still healthy.”
KEY LINE
“For autonomous systems, observability becomes part of the safety architecture.”

⸻

45. LOGGING PIPELINE OVERLOAD
QUESTION
“Agent telemetry is overwhelming the logging infrastructure.”
TALKING SCRIPT
“Protect mandatory accountability before optional diagnostics.
Preserve:
State transitions
Authority decisions
Security events
Evidence
Artifact identity
Consequential tool actions
Then sample or shed high-cardinality diagnostic telemetry.
Healthy low-risk workloads can use lighter tracing while failures, new Factory Versions, and high-risk runs receive richer capture.”
KEY LINE
“Shed diagnostics before shedding accountability.”

⸻

46. PARTIAL DEPLOYMENT
QUESTION
“Half the fleet is running the new configuration and half the old one.”
TALKING SCRIPT
“First determine whether mixed-version operation is supported.
If not, stop rollout.
Then understand state, API, schema, workflow, and user-visible compatibility.
Based on current state, either complete rollout or restore the previous version.
Most importantly, agent behavior must be treated like production software.
That means explicit versioning of models, prompts, skills, tools, policies, evaluators, execution images, routing, and agent definitions.”
KEY LINE

“Agent configuration is production software.”

And:

“If it changes behavior, it’s a production change.”

46. PARTIAL DEPLOYMENT — CONTINUED
KEY LINE
“Agent configuration is production software.”
And:
“If it changes behavior, it’s a production change.”

⸻

47. ROLLBACK VS. ROLL FORWARD
QUESTION
“How do you decide whether to roll back or fix forward?”
TALKING SCRIPT
“I choose the fastest safe restoration path, not one ideology.
Rollback is attractive when the previous state is known-good and still compatible with current state.
Roll-forward may be safer when database migrations, external side effects, dependency changes, schema evolution, or compatibility constraints make rollback dangerous.
I evaluate:
Current production state
Reversibility
External side effects
State/schema compatibility
Confidence in the remediation
Time to recovery
Customer impact
The objective is safe restoration, not winning an argument about rollback philosophy.”
KEY LINE
“Recovery strategy follows current state and reversibility, not habit.”

⸻

48. WHAT DOES “KNOWN-GOOD” MEAN?
QUESTION
“You keep saying known-good. What exactly does that mean?”
TALKING SCRIPT
“Known-good means evidence-backed and compatible with current state.
Ideally it’s the previously qualified production composition with known artifacts, model routes, policies, tools, runtime environment, and recent production evidence.
But old doesn’t automatically mean safe.
If database state, dependencies, APIs, schemas, or external systems have changed, yesterday’s version may no longer be compatible today.”
KEY LINE
“Known-good means evidence-backed and compatible with current state.”

⸻

49. FAILED ROLLBACK
QUESTION
“You try to roll back and rollback fails.”
TALKING SCRIPT
“Then rollback is no longer my safe-state strategy.
I stop repeatedly executing the same failing recovery.
Reassess current state.
Then evaluate:
Roll-forward → Feature disablement → Traffic isolation → Capability quarantine → Targeted remediation → Manual recovery
I also escalate the appropriate expertise quickly.
Recovery mechanisms themselves are production systems and must be tested.”
KEY LINE
“A failing recovery path is a new incident condition, not a reason to repeat it harder.”

⸻

50. FEATURE FLAG / KILL SWITCH FAILS
QUESTION
“Your emergency feature flag doesn’t stop the behavior.”
TALKING SCRIPT
“I move to the next independent containment boundary.
That might be:
Capability registry
API gateway
Routing layer
Deployment system
Workload credentials
Network egress
Scheduler
Worker infrastructure
Critical containment should never depend entirely on one mechanism.
After containment, failure of the safety mechanism itself becomes a high-priority reliability issue.”
KEY LINE
“Critical recovery needs independent containment paths.”
And:
“A safety control isn’t real until we’ve proven it works during failure.”

⸻

51. GLOBAL KILL SWITCH
QUESTION
“Would you ever stop every autonomous agent?”
TALKING SCRIPT
“Yes, if we have a systemic security, authority, or integrity failure where targeted containment can’t establish safety.
But global shutdown shouldn’t be the first reflex.
I prefer hierarchical containment:
Execution → Capability → Model → Factory Version → Execution Profile → Workflow → Organization → Region → Global
The goal is preserving as much safe utility as possible while eliminating consequence.”
KEY LINE
“Contain at the smallest boundary you can trust.”

⸻

52. CONTROL-PLANE OUTAGE
QUESTION
“Mission Control / the Meta Factory control plane goes down while thousands of agents are executing.”
TALKING SCRIPT
“Active workers retain only previously granted, bounded, expiring authority.
They should not:
Acquire new work
Increase budgets
Escalate privilege
Obtain new credentials
Extend leases indefinitely
Publish consequential results if ownership or policy can’t be validated
Depending on workload risk, some safe local computation may finish.
After the control plane returns, invalidate stale leases, reconcile workers and external side effects, establish authoritative state, and progressively resume scheduling.”
KEY LINE
“Loss of governance should reduce authority, not expand it.”
This is one of your best Meta Factory answers.

⸻

53. CONTROL-PLANE DATABASE FAILURE
QUESTION
“The database containing authoritative workflow state is unavailable.”
TALKING SCRIPT
“If authoritative state can’t be established, consequential state transitions stop.
Fail over the database where possible.
Once state returns, don’t simply restart every worker.
Reconcile:
Active leases
Attempts
Budgets
Approvals
Candidate artifacts
Evidence
External side effects
Publication state
The difficult part isn’t restoring database rows.
It’s restoring coherent execution ownership.”
KEY LINE
“State recovery isn’t complete until execution ownership is coherent.”

⸻

54. DATABASE RESTORED WITH FIVE MINUTES OF DATA LOSS
QUESTION
“Your RPO means five minutes of workflow state was lost.”
TALKING SCRIPT
“I treat the restored database as potentially behind external reality.
During those five minutes, workers may have:
Opened PRs
Called tools
Modified tickets
Published artifacts
Performed deployments
Created evidence
So I reconcile against external systems using execution IDs, operation IDs, idempotency keys, source control, artifact repositories, deployment systems, and tool state.
I don’t blindly replay the missing five minutes.”
KEY LINE
“After state loss, reconcile reality before replaying intent.”

⸻

55. SPLIT BRAIN
QUESTION
“Two control-plane regions both believe they own the same work.”
TALKING SCRIPT
“For authority-sensitive operations, ambiguous ownership is unacceptable.
Use leases, epochs or fencing tokens, and sufficiently strong consistency around ownership so only the newest valid owner can publish consequential results.
During a partition, I’d rather sacrifice some availability than permit conflicting production authority.”
KEY LINE
“Availability is negotiable. Ambiguous authority isn’t.”

⸻

56. DISASTER RECOVERY
QUESTION
“An entire region disappears.”
TALKING SCRIPT
“Protect authoritative state first.
Fail builder-facing traffic where appropriate.
Restore or fail over durable workflow state.
Invalidate stale regional leases.
Recreate disposable execution capacity elsewhere.
Reconnect model, context, and tool dependencies.
Then resume eligible workflows from safe checkpoints.
Before declaring recovery, reconcile external side effects and verify evidence integrity.”
KEY LINE
“Workers are replaceable. Authoritative state is not.”

⸻

57. RPO VS. RTO
QUESTION
“What recovery objectives matter for Meta Factory?”
ANSWER
RTO — Recovery Time Objective How quickly must the service/capability return?
RPO — Recovery Point Objective How much authoritative state loss can we tolerate?
For Meta Factory, define them separately for:
Control-plane state
Workflow state
Evidence
Artifacts
Security/audit events
Telemetry
Disposable workers
KEY LINE
“Losing five minutes of traces is very different from losing five minutes of deployment-authority decisions.”

⸻

58. POLICY ENGINE OUTAGE
QUESTION
“Authorization policy can’t be evaluated.”
TALKING SCRIPT
“For consequential actions, fail closed.
Previously granted bounded authority may continue until expiration where policy explicitly allows it.
But no new privileged action should be inferred as allowed simply because policy infrastructure is unavailable.
Low-risk read-only operations may have a defined degraded mode.”
KEY LINE
“When permission cannot be established, consequence should wait.”

⸻

59. IDENTITY PROVIDER OUTAGE
QUESTION
“Identity services are unavailable.”
TALKING SCRIPT
“Existing short-lived workload identities may continue within their bounded validity if policy permits.
New privileged executions or privilege escalation should stop if identity cannot be established.
What I absolutely don’t want is falling back to a shared super-user credential simply to keep the availability graph green.”
KEY LINE
“Identity degradation should reduce new authority, not create anonymous authority.”

⸻

60. CONTEXT SERVICE OUTAGE
QUESTION
“Enterprise RAG/context goes down.”
TALKING SCRIPT
“Workloads requiring enterprise context shouldn’t silently continue without it and claim equivalent quality.
Some repository-local tasks may continue.
Other workloads should queue or explicitly degrade.
If cached context is available, freshness and authorization still need to satisfy workload requirements.”
KEY LINE
“Missing context should create explicit degradation, not invisible quality loss.”

⸻

61. STALE CONTEXT
QUESTION
“The agent made a bad change using outdated architecture documentation.”
TALKING SCRIPT
“Identify the source, freshness metadata, indexing lag, and executions that consumed the stale content.
Invalidate affected context and evidence that materially depended on it.
Restore from the authoritative source and reverify impacted work.
Then strengthen freshness controls.
For high-risk code workflows, current workspace or authoritative-source retrieval may be required instead of eventually consistent knowledge.”
KEY LINE
“Relevant context can still be dangerous when it isn’t current.”
And:
“Freshness is part of context correctness.”

⸻

62. CACHE CONTAMINATION
QUESTION
“Repository B receives cached context belonging to Repository A.”
TALKING SCRIPT
“Treat that as potential cross-boundary exposure.
Disable the cache path.
Identify affected cache keys and executions.
Determine whether unauthorized data reached models, providers, outputs, or users.
Then correct cache isolation.
Keys need to incorporate the relevant authorization scope, repository identity, source/version, and freshness semantics.”
KEY LINE
“Caching must never weaken authorization boundaries.”

⸻

63. TOOL SERVICE OUTAGE
QUESTION
“A critical tool or MCP server goes down.”
TALKING SCRIPT
“Determine whether the capability is required, replaceable, or deferrable.
Use a qualified alternative where available.
Retry transient failures within bounded policy.
Queue work that can wait.
Stop workflows where the missing tool prevents correctness or verification.
What I don’t allow is the model hallucinating the missing tool result and continuing as if the call succeeded.”
KEY LINE
“Missing capability should change workflow state, not become imaginary success.”

⸻

64. TOOL RETURNS BAD DATA
QUESTION
“The tool is available, but its results are wrong.”
TALKING SCRIPT
“That’s potentially more dangerous than an outage because the failure looks successful.
Quarantine the capability if corruption appears systemic.
Identify executions that consumed its output and downstream artifacts depending on it.
Then add appropriate schema, invariant, plausibility, provenance, or cross-source checks where possible.”
KEY LINE
“Silent bad data is often more dangerous than explicit failure.”

⸻

65. SANDBOX PROVISIONING FAILURE
QUESTION
“Agents can’t get execution environments.”
TALKING SCRIPT
“Determine whether the cause is capacity, image, networking, scheduling, identity, or infrastructure.
Queue asynchronous work.
Explicitly degrade interactive workflows where necessary.
Fail fast when latency SLOs can’t be met.
If a new sandbox image caused the problem, restore the last qualified image.
What I won’t do is preserve availability by executing untrusted generated code directly on hosts.”
KEY LINE
“Loss of safe execution capacity should reduce service, not reduce isolation.”

⸻

66. BAD SANDBOX IMAGE
QUESTION
“A new execution image breaks thousands of runs.”
TALKING SCRIPT
“Stop scheduling the affected Execution Profile.
Restore the last qualified image.
Identify active attempts and determine which can safely restart from checkpoints.
Then compare:
Toolchain
Dependencies
Permissions
Runtime
Network
Filesystem
Security controls
Execution images require qualification, canarying, observability, and rollback just like other production artifacts.”
KEY LINE
“The runtime environment is part of production behavior.”

⸻

67. LATENCY REGRESSION
QUESTION
“Agent workflows suddenly take twice as long.”
TALKING SCRIPT
Break the lifecycle apart:
Queue → Context → Inference → Tool Calls → Sandbox/Build → Verification → Human Wait → Publication
Then compare each stage against baseline.
TALKING SCRIPT
“I want to identify the critical-path regression before optimizing anything.
Recent model, context, tool, sandbox, verification, or routing changes are suspects—but I want evidence before guessing.
If SLOs are materially breached, restore or reroute where appropriate while diagnosing.”
KEY LINE
“End-to-end latency matters more than whichever component happens to look slow.”

⸻

68. FACTORY VERSION REGRESSION
QUESTION
“A new Factory Version has a 20% higher failure rate.”
TALKING SCRIPT
“Stop promotion and route affected workloads back to the last qualified version.
Preserve failed and successful trajectories.
Segment by workload to determine whether the regression is universal or concentrated.
Then compare every behavior-changing dependency:
Model route → Prompt → Skill → Tool → Policy → Context strategy → Execution image → Verifier
Because production executes an immutable composition, I should know exactly what changed.”
KEY LINE
“Rollback the composition first; isolate the component second.”

⸻

69. ONLY ONE WORKLOAD REGRESSES
QUESTION
“The new Factory Version is better overall but terrible for Java repositories.”
TALKING SCRIPT
“Don’t throw away useful improvement unnecessarily.
Remove the candidate from Java workload eligibility while preserving it where evidence shows improvement.
Then isolate why Java differs:
Model capability?
Repository distribution?
Toolchain?
Context?
Verification?
Build characteristics?
Qualification should be workload-specific enough to support targeted eligibility.”
KEY LINE
“Roll back the affected qualification boundary, not necessarily the entire platform.”

⸻

70. REGRESSION APPEARS AT 50% ROLLOUT
QUESTION
“The new version passed 1% and 10% canaries but starts failing at 50%.”
TALKING SCRIPT
“Stop further rollout immediately.
The smaller canaries passing makes scale-dependent behavior a strong hypothesis:
Concurrency
Provider throttling
Cache behavior
Queue pressure
Resource exhaustion
Workload diversity
Rate limits
Failure class absent from small cohorts
Preserve both healthy and unhealthy trajectories because their differences may expose the trigger.
Once identified, add the workload or scale condition to qualification.”
KEY LINE
“Canaries reduce blast radius; they don’t guarantee absence of scale-dependent failure.”

⸻

71. CHANGE MANAGEMENT
QUESTION
“How do you reduce incidents caused by Meta Factory itself?”
TALKING SCRIPT
“Treat every behavior-changing artifact as production software.
That means:
Version → Evaluate → Review → Canary → Progressive Rollout → Observe → Rollback
And it applies to:
Models
Prompts
Skills
Tools
Routing
Policies
Context strategies
Evaluators
Sandbox images
Factory Versions
Production needs exact change attribution.”
KEY LINE
“If it changes behavior, it’s a production change.”

⸻

72. TOO MANY COMPONENTS CHANGE INDEPENDENTLY
QUESTION
“Models, prompts, tools, and policies all evolve separately. How do you debug production?”
TALKING SCRIPT
“Independent development is fine. Unidentified production composition isn’t.
That’s one reason I want production to execute an immutable, qualified Factory Version.
When an incident occurs, I can identify the exact composition responsible rather than reconstructing mutable references across ten systems.”
KEY LINE
“Independent development is useful. Unidentified production composition is not.”
Or, more memorably:
“Otherwise every incident becomes combinatorial archaeology.”

⸻

73. FAIL OPEN VS. FAIL CLOSED
QUESTION
“When should an autonomous system fail open versus fail closed?”
TALKING SCRIPT
“I make that decision primarily from risk, authority, and reversibility.
If the operation can:
Expose data
Modify production
Change security configuration
Cross an authorization boundary
Create irreversible external side effects
…I bias strongly toward fail closed.
If the operation is low-risk, reversible, and stopping creates more harm than continuing, graceful degradation may make sense.
I wouldn’t have one platform-wide rule.
Failure behavior belongs to the risk classification of the action.”
KEY LINE
“The higher the consequence and irreversibility, the stronger the bias toward fail closed.”

⸻

74. AUTHORIZED BUT WRONG VS. UNAUTHORIZED
QUESTION
“An agent performed an action it shouldn’t have.”
Your first conceptual distinction:
Was the action unauthorized—or authorized but incorrect?
UNAUTHORIZED
The authority system failed.
Investigate:
Identity → Policy → Credential → Tool Gateway → Sandbox → Authorization
AUTHORIZED BUT INCORRECT
The reasoning/trust system failed.
Investigate:
Intent → Plan → Context → Model → Verification → Evidence → Authority Policy
KEY LINE
“A bad decision and an unauthorized decision are different incident classes.”
This is a very strong interview distinction.

⸻

75. WHAT SLOs WOULD YOU DEFINE?
QUESTION
“What are the SLOs for Meta Factory?”
TALKING SCRIPT
“I separate infrastructure SLOs from behavioral objectives.
Traditional infrastructure SLOs include:
API availability
Job acceptance
Scheduling latency
Sandbox provisioning
State durability
Tool availability
Provider availability
But a factory can be 99.99% available while producing terrible software.
So workload classes also need behavioral objectives:
Task success
Accepted outcome rate
Verification pass rate
Human correction rate
Defect escape
Policy compliance
Recovery rate
Cost per accepted outcome
Availability tells me whether the factory ran.
Evaluation tells me whether it actually worked.”
KEY LINE
“A healthy API does not imply a healthy agent.”
And:
“Availability tells me whether it ran. Evaluation tells me whether it worked.”

⸻

76. FIVE OPERATIONAL METRIC BUCKETS
￼
