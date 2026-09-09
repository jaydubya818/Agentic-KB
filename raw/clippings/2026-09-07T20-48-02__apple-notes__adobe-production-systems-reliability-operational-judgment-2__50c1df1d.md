---
title: "ADOBE — PRODUCTION SYSTEMS, RELIABILITY & OPERATIONAL JUDGMENT (2)"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p8451
captured_at: 2026-09-07T20:48:02.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: 50c1df1d004121a663d865b9f2a04bf96ffce71e6a5ed61dcaf7fe0abb43882b
---

ADOBE — PRODUCTION SYSTEMS, RELIABILITY & OPERATIONAL JUDGMENT

Alexandru Chiculita — 45-Minute Interview Study Guide

This round requires a different operating mode from Jeffrey + Vikram.

System Design: “How would you build it?”
Alexandru: “You built it. It’s 2:17 AM, something is wrong, builders are affected, autonomous agents are still executing, and you don’t know why. What do you do?”

He is likely testing judgment under pressure, not whether you can recite reliability terminology.

⸻

What this round is testing

For almost every scenario, demonstrate:

ASSESS → CONTAIN → PRESERVE → ISOLATE → RESTORE → CORRECT → PREVENT → PROVE

Your default opening:

“First I want to establish severity, blast radius, business impact, and whether the incident is still expanding. Then I’ll contain additional damage while preserving the evidence necessary to understand what happened. My immediate objective is a safe state, not perfect root-cause analysis. Once the system is stable, I’ll isolate the failing layer, restore known-good behavior, determine root cause, add the failure to our regression and evaluation systems, and prove the corrective controls actually work.”

KEY LINE: “Contain first. Preserve evidence. Restore safety. Diagnose deeply afterward.”

⸻

1. YOUR INCIDENT FRAMEWORK

QUESTION: “Walk me through how you handle a production incident.”

TALKING SCRIPT: “I use a consistent sequence. Assess: determine severity, affected builders, repositories, workflows, regions, and business impact. Contain: stop the incident from expanding—disable a capability, stop routing, revoke credentials, pause deployment, or reduce autonomy. Preserve: retain traces, state, model/tool versions, context provenance, policy decisions, artifacts, and deployment evidence. Isolate: identify the failing layer. Restore: move to a known-safe state, often before root cause is fully understood. Correct: fix the immediate defect. Prevent: improve architecture, policy, verification, or operational controls. Prove: reproduce the failure and demonstrate that the new control catches it.”

KEY LINE: “Incident response optimizes first for reducing harm, then for understanding.”

⸻

2. ESTABLISH BLAST RADIUS

QUESTION: “What’s the first thing you need to know?”

TALKING SCRIPT: “I need to know what is affected and whether the impact is growing. Which builders? Which repositories? Which Factory Versions? Which model or tool routes? Which regions? Which production environments? Which credentials? Which artifacts have already been merged or deployed? Then I distinguish active exposure from historical exposure. That determines whether I need a global stop, targeted quarantine, rollback, or continued observation.”

KEY LINE: “Before fixing the failure, understand how far the failure can travel.”

⸻

3. SEVERITY

QUESTION: “How do you classify severity?”

TALKING SCRIPT: “I care about customer/business impact, data or security exposure, production impact, number of builders or repositories affected, irreversibility, and whether the incident is actively expanding. A model provider outage affecting low-priority background work is different from cross-repository data leakage even if fewer users are affected. Security and irreversible consequence can elevate severity independently of volume.”

KEY LINE: “Severity follows consequence, not just user count.”

⸻

4. SAFE STATE VS. ROOT CAUSE

QUESTION: “Do you diagnose first or roll back first?”

TALKING SCRIPT: “If impact is active and I have a known-safe containment or restoration path, I usually prioritize that before exhaustive diagnosis. I don’t need to understand every causal detail before disabling a bad Factory Version or routing traffic to a known-good model. Preserve enough evidence first, then restore safety. Deep root-cause analysis can continue after the blast radius is controlled.”

KEY LINE: “Mean time to safe state comes before mean time to perfect understanding.”

⸻

5. PRESERVE EVIDENCE

QUESTION: “What do you preserve before containment?”

TALKING SCRIPT: “Enough to reconstruct the failure: intent, governed plan, Factory Version, Execution Profile, model/provider version, context provenance, tool calls, state transitions, sandbox identity, policy and authorization decisions, candidate artifacts, verification results, cost telemetry, deployment history, production signals, and relevant logs/traces. But evidence preservation should not delay urgent containment when customer or security impact is expanding.”

KEY LINE: “Preserve enough to investigate without allowing evidence collection to prolong harm.”

⸻

6. FAILURE-DOMAIN ISOLATION

When something goes wrong, mentally walk this stack:

MODEL → CONTEXT → PLAN → ROUTING → ORCHESTRATION → STATE → TOOL → SANDBOX → POLICY → VERIFICATION → DELIVERY → INFRASTRUCTURE

TALKING SCRIPT: “Once contained, I want to identify the failing layer. Did the model reason incorrectly? Was context stale or poisoned? Was the plan wrong? Did routing choose an unqualified capability? Did orchestration duplicate work? Did a tool create an unintended side effect? Did the sandbox boundary fail? Did verification miss the defect? Did deployment or production infrastructure fail? I don’t want every AI incident automatically diagnosed as ‘the model hallucinated.’”

KEY LINE: “Agent failure is a system failure until we’ve isolated the layer.”

⸻

7. RUNAWAY AGENT

QUESTION: “An agent is stuck in a loop and burning tokens. What do you do?”

TALKING SCRIPT: “First stop additional consumption: terminate or pause the execution from the control plane and prevent new instances of the affected workflow if the failure appears systemic. Preserve the last useful state, loop history, tool results, token consumption, model route, and stopping-policy decisions. Then determine whether the failure came from missing stop conditions, repeated identical failures, bad context, a tool returning unusable results, or progress detection failing. Recovery should resume from a safe checkpoint with a changed strategy—not simply restart the same loop. The long-term fix is bounded time, tokens, tool calls, iterations, cost, progress detection, and circuit breakers enforced outside the model.”

KEY LINE: “The runtime, not the agent, owns the stopping condition.”

⸻

8. TOKEN / COST EXPLOSION

QUESTION: “Your AI spend suddenly increases 10x. What do you do?”

TALKING SCRIPT: “First determine whether this is legitimate demand or pathological execution. Break cost down by Factory Version, workload, model route, repository, team, retry count, context size, tool loop, and verification stage. Contain abnormal workloads through quotas, routing changes, or execution limits while preserving high-value traffic. Then determine whether the increase came from traffic, larger contexts, expensive routing, retries, loops, speculative execution, or verification. I want both objective-level and attempt-level budget enforcement so one pathological workload cannot consume unlimited shared capacity.”

KEY LINE: “Cost is a production resource and needs the same operational controls as compute.”

⸻

9. BAD MODEL RELEASE

QUESTION: “A new model version starts producing poor code.”

TALKING SCRIPT: “Stop routing new eligible workloads to that model and move them to the last qualified known-good route where safe. Identify which Factory Versions and executions used the candidate. For already-produced artifacts, determine whether they were merely generated, merged, or deployed and increase verification accordingly. Then compare candidate versus baseline evaluation and production evidence to understand why qualification missed the regression.”

KEY LINE: “A model upgrade is a production change and needs rollback semantics.”

⸻

10. MODEL PROVIDER OUTAGE

QUESTION: “Anthropic/OpenAI/etc. goes down. What happens?”

TALKING SCRIPT: “First identify which workload classes depend on that provider. Route only to prequalified fallback capabilities. Interactive low-risk work may degrade; asynchronous work can queue; workloads with no qualified alternative should stop rather than silently lower the quality or security bar. Protect fallback providers from a thundering herd through admission control. Then communicate the degraded service clearly.”

KEY LINE: “An unqualified fallback isn’t resilience.”

⸻

11. FALLBACK MODEL IS WORSE

QUESTION: “The fallback is available but produces lower-quality output.”

TALKING SCRIPT: “Availability doesn’t override the workload’s minimum quality bar. If the fallback is qualified only for certain workloads, restrict it to those. Queue higher-risk work or require additional verification rather than silently accepting degraded quality. If we choose to operate degraded, that should be an explicit operational mode with known limits.”

KEY LINE: “Degrade capability intentionally; don’t degrade trust silently.”

⸻

12. MODEL BEHAVIOR CHANGES WITHOUT VERSION CHANGE

QUESTION: “The provider says nothing changed, but outcomes suddenly regress.”

TALKING SCRIPT: “Production evidence outranks the provider’s claim. Compare accepted outcomes, verification failures, tool behavior, latency, context behavior, and failure distribution against baseline. Quarantine or reduce traffic if the workload threshold is breached. Preserve representative failures and engage the provider, but don’t wait for provider confirmation before protecting production.”

KEY LINE: “Operate from observed behavior, not assumed behavioral stability.”

⸻

13. STALE CONTEXT CAUSES BAD CHANGES

QUESTION: “The agent used outdated architecture documentation.”

TALKING SCRIPT: “Contain affected workflows if stale context can create repeated bad changes. Identify the source, freshness metadata, indexing lag, and executions that consumed it. Invalidate affected context and any evidence dependent on it. Restore from authoritative sources, rerun impacted verification, and improve freshness controls. High-risk workflows may need direct current-state retrieval rather than eventually consistent indexes.”

KEY LINE: “Relevant context can still be dangerous when it isn’t current.”

⸻

14. CONTEXT POISONING

QUESTION: “Someone intentionally adds malicious instructions to a repository.”

TALKING SCRIPT: “Treat the content as untrusted and contain any affected executions or capability if authority may have been abused. Determine what context was retrieved, what actions followed, what credentials or tools were available, and whether deterministic policy boundaries prevented consequence. The architectural correction is not simply a better prompt: preserve provenance, restrict tools and egress, minimize credentials, and keep authority outside retrieved content.”

KEY LINE: “Prompt injection should fail at the authority boundary even when it succeeds at the reasoning layer.”

⸻

15. CROSS-REPOSITORY DATA LEAKAGE

QUESTION: “An agent exposes code from Repository A while working in Repository B.”

TALKING SCRIPT: “That’s a security incident. Immediately stop affected context routes or executions, determine whether the issue is index ACL propagation, cache contamination, execution identity, retrieval filtering, or model/session reuse, and identify every affected query and output. Revoke or isolate the faulty path, preserve evidence, assess whether sensitive data left Adobe’s boundary, and involve the appropriate security/privacy responders. Before restoration, prove permission boundaries with negative tests.”

KEY LINE: “Permissions must survive indexing, caching, retrieval, and generation.”

⸻

16. CREDENTIAL EXPOSURE

QUESTION: “An agent prints a credential into logs.”

TALKING SCRIPT: “Assume compromise. Revoke or rotate the credential immediately, determine its scope and lifetime, identify where it propagated—model context, logs, evidence, tool output, external provider—and restrict access to those artifacts. Then determine why the secret was visible to the agent at all. The preferred design is short-lived scoped credentials or tool mediation where the model never receives the raw secret.”

KEY LINE: “Rotate first. Then ask why the agent possessed the secret.”

⸻

17. SANDBOX ESCAPE

QUESTION: “You suspect an agent escaped its sandbox.”

TALKING SCRIPT: “Treat it as a high-severity security incident. Stop new executions using the affected Execution Profile or sandbox image, isolate potentially compromised hosts, revoke workload credentials, restrict network access, preserve host and sandbox evidence, and identify affected executions. Restore only onto known-clean infrastructure. Then determine whether the weakness was runtime isolation, mount configuration, kernel exposure, credential scope, or host policy.”

KEY LINE: “Contain the execution boundary before investigating the exploit.”

⸻

18. MALICIOUS TOOL / MCP SERVER

QUESTION: “An MCP server has been compromised.”

TALKING SCRIPT: “Quarantine the exact capability/version in the registry and block new invocation at the tool gateway. Use dependency metadata to identify Factory Versions, skills, and executions that depended on it. Revoke credentials it could access, determine side effects, and invalidate affected qualification. Restore only after the replacement is independently qualified.”

KEY LINE: “Capability revocation should propagate faster than capability deployment.”

⸻

19. BAD PRs AT SCALE

QUESTION: “An agent starts generating hundreds of bad PRs.”

TALKING SCRIPT: “Stop new publication authority for the affected Factory Version or workflow first. Separate candidate generation from publication so we can continue diagnosis without creating repository noise. Identify whether the issue came from routing, context, planning, model behavior, or verification. Close or quarantine bad candidates where appropriate, preserve representative failures, and restore the last qualified behavior.”

KEY LINE: “Generation failure should not automatically become repository pollution.”

⸻

20. BAD CODE ALREADY MERGED

QUESTION: “What if some of those PRs already merged?”

TALKING SCRIPT: “Now blast radius includes source state. Identify every affected merge and whether it deployed. Prioritize based on production impact, security risk, and reversibility. Revert safe changes where appropriate; roll forward when state or dependency changes make rollback dangerous. Increase verification around dependent changes because multiple individually bad commits may interact.”

KEY LINE: “Once bad candidates become accepted state, recovery moves from containment to restoration.”

⸻

21. BAD CODE ALREADY DEPLOYED

QUESTION: “The agent-generated defect is in production.”

TALKING SCRIPT: “First restore customer safety: feature disable, rollback, traffic shift, configuration change, or roll-forward fix, whichever is safest. Preserve the exact deployed artifact and associated factory evidence. Then trace backward: deployment → accepted artifact → verification → execution → plan → context → route. The postmortem asks not only why the code was wrong, but why the trust system allowed it to progress.”

KEY LINE: “Fix both the defect and the verification gap that certified it.”

⸻

22. VERIFICATION REGRESSION

QUESTION: “A verifier starts missing defects.”

TALKING SCRIPT: “Treat the verifier as a production dependency. Determine which Factory Versions use it, reduce autonomy where verification confidence is compromised, and restore the prior qualified verifier if available. Re-run high-risk affected candidates where necessary. Then add the escaped defects to protected evaluation cases and determine whether the regression came from the model, rubric, context, tool, or aggregation policy.”

KEY LINE: “When verification weakens, autonomy should contract.”

⸻

23. VERIFIER FALSE-POSITIVE EXPLOSION

QUESTION: “The code-review agent suddenly flags everything.”

TALKING SCRIPT: “If it’s advisory, the immediate customer impact is developer noise rather than unsafe code, so containment may mean disabling or degrading that reviewer while deterministic gates remain active. Measure precision, accepted findings, affected repositories, and recent model/context changes. Restore the prior version and investigate without blocking unrelated delivery.”

KEY LINE: “Contain according to consequence; not every regression deserves the same operational response.”

⸻

24. VERIFIERS DISAGREE

QUESTION: “Security passes, tests pass, but semantic review fails.”

TALKING SCRIPT: “Don’t majority-vote heterogeneous evidence. Determine the authority semantics of each verifier. A mandatory security failure may block regardless of semantic review. A probabilistic architectural disagreement may trigger another evaluator or human review. Disagreement is itself evidence of uncertainty and should reduce autonomy where the workload requires high confidence.”

KEY LINE: “Verification disagreement should trigger policy, not improvisation.”

⸻

25. EVALUATION REGRESSION

QUESTION: “Your offline eval score suddenly drops.”

TALKING SCRIPT: “First determine whether production behavior also changed. If the active system hasn’t changed, the evaluation infrastructure or corpus may have. Compare evaluator version, dataset version, environment, model route, context, and scoring. Don’t automatically roll back production because the measurement system may be wrong. Conversely, don’t ignore the signal—establish which side changed.”

KEY LINE: “When the metric moves, verify whether the system changed or the measurement changed.”

⸻

26. OFFLINE EVALS PASS, PRODUCTION FAILS

QUESTION: “Everything passed qualification. Production is bad.”

TALKING SCRIPT: “Restore the known-good production version first if impact warrants it. Then identify the production failure class missing from qualification. Was the corpus unrepresentative? Did production have different context, data, tool behavior, concurrency, repository scale, or provider behavior? Add representative production failures to the corpus and verify the corrected candidate against both old and new cases.”

KEY LINE: “Production failures expose gaps in our model of reality.”

⸻

27. OBSERVABILITY OUTAGE

QUESTION: “Your tracing platform goes down while agents continue running.”

TALKING SCRIPT: “Separate optional diagnostics from required safety evidence. Low-risk executions may continue while buffering essential lifecycle events durably. High-autonomy or high-consequence workflows may need to pause if we can no longer establish required evidence or supervise execution. I don’t want telemetry dependency failure to unnecessarily kill everything, but I also don’t want blind autonomous production.”

KEY LINE: “Observability can become part of the safety boundary as autonomy increases.”

⸻

28. LOGGING PIPELINE OVERLOAD

QUESTION: “Agents generate so much telemetry that logging is falling over.”

TALKING SCRIPT: “Protect production execution from optional diagnostic volume. Preserve mandatory audit, authority, state, and evidence events, then sample or shed high-cardinality diagnostic telemetry according to policy. Reduce verbose traces for healthy low-risk workloads and preserve richer capture for failures, new versions, and high-risk runs.”

KEY LINE: “Shed diagnostics before shedding accountability.”

⸻

29. STATE CORRUPTION

QUESTION: “The workflow state appears inconsistent.”

TALKING SCRIPT: “Pause consequential progression for affected executions. Determine whether corruption is isolated or systemic, preserve the state and event history, and compare authoritative state, durable events, artifacts, leases, and observed external side effects. Recover from the last known-consistent state where possible. Do not let workers infer missing authoritative state from their conversation history.”

KEY LINE: “When authoritative state is uncertain, reduce authority until state is reconciled.”

⸻

ADOBE — PRODUCTION SYSTEMS, RELIABILITY & OPERATIONAL JUDGMENT

Alexandru Chiculita — Continued

30. DUPLICATE EXECUTION

QUESTION: “The same work ran twice. What do you do?”

TALKING SCRIPT: “First determine whether this is duplicate computation or duplicate consequence. Two workers generating the same candidate is wasteful; two workers deploying, opening duplicate PRs, modifying tickets, or performing database operations can be dangerous. I’d stop additional execution, identify the objective, task, attempt IDs, leases, idempotency keys, and external side effects, then reconcile actual state. Architecturally, I assume at-least-once execution and use leases, fencing tokens, idempotency keys, attempt-specific workspaces, and side-effect reconciliation to make duplicates safe.”

KEY LINE: “Duplicate computation is expensive. Duplicate consequence is dangerous.”

⸻

31. STALE WORKER PUBLISHES AFTER RECOVERY

QUESTION: “Worker A times out, Worker B takes over, then Worker A wakes up and tries to publish.”

TALKING SCRIPT: “Worker A has lost authority. Every consequential publication should validate the current lease or fencing token. Once Worker B acquires newer ownership, Worker A may continue computing locally, but its publication attempt is rejected. Process termination alone isn’t sufficient because distributed systems create delayed and partitioned workers.”

KEY LINE: “A stale worker may continue computing. It must not continue committing.”

⸻

32. WORKER CRASHES MID-RUN

QUESTION: “A two-hour autonomous task loses its worker after 90 minutes.”

TALKING SCRIPT: “The workflow should survive because authoritative state lives outside the worker. Let the lease expire, determine the last durable checkpoint, reconcile any ambiguous external side effects, then assign a new attempt that reconstructs the approved execution context. I don’t blindly restart two hours of work, and I don’t trust an incomplete worker-local state blob.”

KEY LINE: “Persist the workflow, not the worker.”

⸻

33. LEASE SERVICE FAILURE

QUESTION: “The lease mechanism itself is failing.”

TALKING SCRIPT: “That’s authority-sensitive infrastructure. I’d stop granting new ownership and prevent workers whose leases cannot be validated from publishing consequential results. Safe local computation may continue for some workloads, but authority should contract until ownership can be established. Then restore the lease service and reconcile potentially ambiguous attempts.”

KEY LINE: “When ownership is uncertain, stop consequence before stopping computation.”

⸻

34. QUEUE BACKLOG EXPLODES

QUESTION: “Queue depth suddenly grows 20x.”

TALKING SCRIPT: “First determine whether the problem is demand increase or throughput collapse. Check arrival rate, workload mix, provider capacity, sandbox provisioning, tool latency, verification latency, worker utilization, and recent deployments. Protect interactive and critical workload classes through priority and admission control, shed or delay lower-priority work, and avoid scaling blindly if a downstream dependency is the actual bottleneck.”

KEY LINE: “Queue depth is a symptom; arrival rate versus service rate tells me why.”

⸻

35. THUNDERING HERD

QUESTION: “A provider recovers and thousands of queued jobs retry simultaneously.”

TALKING SCRIPT: “I’d use bounded concurrency, exponential backoff with jitter, admission control, and gradual queue draining. Recovery shouldn’t immediately recreate the outage. The scheduler should understand downstream capacity rather than allowing every worker to independently retry.”

KEY LINE: “Recovery traffic needs backpressure too.”

⸻

36. RETRY STORM

QUESTION: “A failing dependency causes every worker to retry.”

TALKING SCRIPT: “Trip a circuit breaker, stop useless retries, classify the dependency failure, and protect both our platform and the downstream service. Retry budgets should exist at the attempt and aggregate platform level. Once the dependency recovers, reintroduce traffic gradually.”

KEY LINE: “Retries are load. During an outage, uncontrolled retries become part of the incident.”

⸻

37. SANDBOX PROVISIONING FAILURE

QUESTION: “Agents can’t get execution environments.”

TALKING SCRIPT: “Determine whether this is capacity, image, networking, scheduler, identity, or infrastructure failure. Queue asynchronous work, degrade interactive workflows explicitly, and fail fast where latency SLOs cannot be met. If a recent sandbox image caused the issue, roll back to the last qualified image. I would not bypass sandboxing by executing code directly on hosts.”

KEY LINE: “Loss of safe execution capacity should reduce service, not reduce isolation.”

⸻

38. BAD SANDBOX IMAGE

QUESTION: “A new execution image breaks thousands of runs.”

TALKING SCRIPT: “Stop scheduling the affected Execution Profile/image, restore the last qualified image, identify active attempts, and decide whether they can safely restart from checkpoints. Then compare toolchain, dependency, permission, and environment differences. Execution images are production dependencies and need qualification, canarying, and rollback.”

KEY LINE: “The runtime environment is part of production behavior.”

⸻

39. RESOURCE EXHAUSTION

QUESTION: “A task consumes huge CPU, memory, or disk.”

TALKING SCRIPT: “The sandbox should enforce hard CPU, memory, disk, process, and wall-clock limits independently of the agent. Terminate the offending workload, preserve evidence, and determine whether the workload legitimately needs a larger Execution Profile or whether generated code behaved pathologically. One task should never destabilize the worker fleet.”

KEY LINE: “A task may exhaust its allocation. It must not exhaust the platform.”

⸻

40. CAPACITY EXHAUSTION

QUESTION: “The entire worker fleet is saturated.”

TALKING SCRIPT: “Use workload classes, quotas, priorities, and admission control. Protect critical interactive work, queue background jobs, scale horizontally where downstream capacity exists, and expose realistic wait times or degraded service. I don’t want uncontrolled autoscaling if model providers, build infrastructure, or downstream tools are already saturated.”

KEY LINE: “Scale the bottleneck, not merely the worker count.”

⸻

41. NOISY NEIGHBOR

QUESTION: “One Adobe organization consumes most capacity.”

TALKING SCRIPT: “Apply organizational quotas and fair-share scheduling, determine whether demand is legitimate, and protect other tenants. If the workload is strategically urgent, explicitly change priority or capacity allocation rather than allowing accidental monopolization.”

KEY LINE: “Fairness should be policy, not incident improvisation.”

⸻

42. LATENCY REGRESSION

QUESTION: “Agent workflows suddenly take twice as long.”

TALKING SCRIPT: “Break the lifecycle into queueing → context → inference → tools → sandbox/build → verification → human wait and compare with baseline. Recent model, context, tool, image, or routing changes are obvious suspects, but I want traces before guessing. Restore or reroute if the regression breaches SLOs, then optimize the actual critical path.”

KEY LINE: “End-to-end latency matters more than whichever component happens to look slow.”

⸻

43. CONTEXT SERVICE OUTAGE

QUESTION: “Enterprise context/RAG is unavailable.”

TALKING SCRIPT: “Workloads that require enterprise context should not silently continue with missing knowledge and claim equivalent quality. Some low-risk tasks may operate with repository-local context; others should queue or degrade explicitly. If cached context is used, its freshness and authorization validity must still satisfy the workload.”

KEY LINE: “Missing context should create explicit degradation, not invisible quality loss.”

⸻

44. CONTEXT INDEX LAG

QUESTION: “The index is several hours behind.”

TALKING SCRIPT: “Expose that as degraded state. For code-sensitive workflows, retrieve directly from the current workspace or wait for the index. For less time-sensitive enterprise knowledge, the workload may tolerate known staleness. The policy should follow the consequence of acting on stale information.”

KEY LINE: “Freshness is part of context correctness.”

⸻

45. CACHE CONTAMINATION

QUESTION: “One repository receives cached context from another.”

TALKING SCRIPT: “Treat it as potential cross-boundary data exposure. Disable the affected cache path, identify keys and executions, assess whether unauthorized data reached model providers or outputs, and involve security/privacy responders as required. The correction needs cache keys that incorporate authorization scope, repository/source identity, version, and freshness.”

KEY LINE: “Caching must never weaken authorization boundaries.”

⸻

46. TOOL SERVICE OUTAGE

QUESTION: “A critical MCP/tool service is down.”

TALKING SCRIPT: “Determine whether the tool is required, replaceable, or deferrable. Use a qualified alternative where available; retry transient failures within bounded policy; queue work that can wait; stop workflows where the missing capability prevents correctness or verification. Don’t allow the model to hallucinate the tool result and continue.”

KEY LINE: “Missing capability should change workflow state, not become imaginary success.”

⸻

47. TOOL RETURNS CORRUPT DATA

QUESTION: “The tool is up, but its output is wrong.”

TALKING SCRIPT: “That can be more dangerous than an outage because the failure looks successful. Quarantine the capability if evidence suggests systemic corruption, identify executions that consumed its results, and determine which downstream artifacts and verification depend on them. Add schema, invariant, plausibility, or cross-source checks where possible.”

KEY LINE: “Silent bad data is often more dangerous than explicit failure.”

⸻

48. TOOL SIDE EFFECT TIMES OUT

QUESTION: “The API timed out. Did the action happen?”

TALKING SCRIPT: “Treat completion as unknown, not failed. Query the external system using operation identity or idempotency key. Only retry once we’ve established whether the side effect occurred or the API guarantees idempotent submission.”

KEY LINE: “Resolve ambiguity before repeating consequence.”

⸻

49. PARTIAL DEPLOYMENT

QUESTION: “Half the production fleet gets the new version before deployment fails.”

TALKING SCRIPT: “Stop additional rollout and determine which state is safer: complete rollout, rollback the changed cohort, or hold split state temporarily. Look at compatibility between versions, database/schema state, production health, and reversibility. Preserve exact artifact and cohort identity. Progressive delivery should make this state observable rather than surprising.”

KEY LINE: “Partial deployment is a production state that needs explicit recovery semantics.”

⸻

50. FAILED ROLLBACK

QUESTION: “Rollback itself fails.”

TALKING SCRIPT: “Now the incident has changed. Stop repeatedly attempting the same rollback, reassess system state, identify why restoration is failing, and determine whether roll-forward, traffic isolation, feature disablement, or manual recovery is safer. Escalate expertise and authority quickly. Recovery mechanisms need testing precisely because they can fail too.”

KEY LINE: “A failing recovery path is a new incident condition, not a reason to repeat it harder.”

⸻

51. FEATURE FLAG FAILS

QUESTION: “The emergency feature flag doesn’t disable the behavior.”

TALKING SCRIPT: “Use the next independent containment mechanism: traffic routing, deployment rollback, capability quarantine, API gateway restriction, or service isolation. Then investigate why the assumed safety control failed. Critical containment should not depend on one mechanism.”

KEY LINE: “Critical recovery needs independent containment paths.”

⸻

52. DATABASE MIGRATION INCIDENT

QUESTION: “An autonomous migration is damaging production data.”

TALKING SCRIPT: “Stop the migration immediately if safe, prevent additional writes, assess whether the damage is reversible, preserve migration checkpoints and affected ranges, and involve database/domain experts. Recovery may require rollback, restoration, compensating migration, or roll-forward depending on state. Then ask why the workflow had the authority to perform that migration with insufficient safeguards.”

KEY LINE: “For irreversible operations, incident response begins with stopping additional consequence.”

⸻

53. BAD BACKFILL

QUESTION: “A backfill has modified millions of records incorrectly.”

TALKING SCRIPT: “Pause the job, establish the exact processed partitions and checkpoints, determine whether writes are idempotent or reversible, and isolate affected records. Use the original data or audit trail to restore or compensate. A production backfill should have bounded batches, progress tracking, validation samples, rate limits, and pause/resume precisely for this reason.”

KEY LINE: “Large operations should fail in bounded pieces, not one giant consequence.”

⸻

54. DEPENDENCY OUTAGE

QUESTION: “GitHub, artifact storage, CI, or another core dependency is unavailable.”

TALKING SCRIPT: “Classify workflows by whether the dependency is required now or only later. Continue safe local computation where useful, queue publication or verification that requires the dependency, and avoid creating state that cannot later be reconciled. Communicate degraded capabilities clearly. Recovery should drain queued work gradually.”

KEY LINE: “Degrade by capability rather than treating every dependency outage as total platform failure.”

⸻

55. SOURCE CONTROL OUTAGE

QUESTION: “GitHub is unavailable. Do agents continue coding?”

TALKING SCRIPT: “Potentially for already-provisioned, low-risk workspaces, but they cannot safely fetch current baselines, publish candidates, or establish some forms of repository authority. New work requiring current source state should queue. Existing local work can continue only if the resulting candidate can later be reconciled against current source before acceptance.”

KEY LINE: “Local progress can continue; authoritative publication waits for authoritative source control.”

⸻

56. MERGE QUEUE OUTAGE

QUESTION: “Everything is verified, but the merge queue is unavailable.”

TALKING SCRIPT: “Preserve accepted candidates and evidence in a waiting state. Don’t bypass the integration gate simply because it’s unavailable unless an explicit emergency process exists. When service returns, revalidate evidence affected by baseline changes before merge.”

KEY LINE: “Dependency outage should not silently lower the acceptance bar.”

⸻

57. CI OUTAGE

QUESTION: “Authoritative CI is unavailable.”

TALKING SCRIPT: “Local verification may provide useful confidence, but if authoritative CI is a mandatory acceptance requirement, the candidate waits. We can continue generation and nondependent verification without granting publication authority. This is a good example of separating progress from acceptance.”

KEY LINE: “The factory can continue working without pretending missing proof exists.”

⸻

58. VERIFICATION SERVICE OUTAGE

QUESTION: “Your AI verifier is unavailable.”

TALKING SCRIPT: “If that verifier is advisory, continue with reduced functionality. If it’s mandatory for the workload, pause progression or use a prequalified equivalent verifier. I would not automatically substitute the producing model as its own verifier simply to preserve throughput.”

KEY LINE: “Availability pressure should not collapse independence.”

⸻

59. POLICY ENGINE OUTAGE

QUESTION: “Authorization policy cannot be evaluated.”

TALKING SCRIPT: “For consequential actions, fail closed. Previously granted bounded authority may continue until expiry where policy permits, but no new privileged action should be inferred as allowed. Low-risk read-only behavior may have a defined degraded mode. Restore policy service before resuming broader authority.”

KEY LINE: “When permission cannot be established, consequence should wait.”

⸻

60. IDENTITY PROVIDER OUTAGE

QUESTION: “Identity services are unavailable.”

TALKING SCRIPT: “Existing short-lived workload identities may continue within their bounded validity if policy permits. New executions or privilege escalation should stop if identity cannot be established. Don’t fall back to shared service credentials simply to keep the platform available.”

KEY LINE: “Identity degradation should reduce new authority, not create anonymous authority.”

⸻

61. CLOCK / TOKEN EXPIRY ISSUES

QUESTION: “Credentials start expiring unexpectedly because of clock skew.”

TALKING SCRIPT: “Contain repeated authentication failures, verify time synchronization across affected infrastructure, and distinguish provider-side expiration from local clock issues. Retry logic shouldn’t repeatedly request new credentials without understanding why they’re rejected. Time is part of distributed security semantics.”

KEY LINE: “In distributed systems, time errors can become authorization errors.”

⸻

62. CERTIFICATE EXPIRATION

QUESTION: “A certificate expires and tools stop communicating.”

TALKING SCRIPT: “Restore the certificate through the approved emergency process, identify why expiration monitoring or rotation failed, and assess affected services. Certificate lifecycle should be automated with expiration alerts well ahead of impact. If a dependency requires manual certificate rotation, that’s operational debt worth addressing.”

KEY LINE: “Predictable expiration should never be a surprise incident.”

⸻

63. CONFIGURATION CHANGE BREAKS PRODUCTION

QUESTION: “No code changed, but a configuration update caused the outage.”

TALKING SCRIPT: “Treat configuration as production behavior. Identify the exact configuration version, revert to known-good state if safe, and determine blast radius. Configuration should have versioning, validation, progressive rollout, observability, and rollback just like code where it materially changes system behavior.”

KEY LINE: “If configuration can break production, configuration is production software.”

⸻

64. FEATURE / FACTORY CONFIGURATION DRIFT

QUESTION: “Different regions are running different routing or policy configuration unexpectedly.”

TALKING SCRIPT: “First determine whether the difference is intentional. If not, stop further propagation, identify the authoritative desired version, and reconcile regions. Immutable Factory Versions reduce this risk because behavior shouldn’t depend on mutable configuration references. Region-specific policy should be explicit rather than accidental drift.”

KEY LINE: “Intentional variation is architecture. Unintentional variation is drift.”

⸻

65. FACTORY VERSION REGRESSION

QUESTION: “A new Factory Version has a 20% higher failure rate.”

TALKING SCRIPT: “Stop promotion, route traffic back to the last known-good version, preserve failed and successful trajectories, and segment by workload to determine whether the regression is universal or concentrated. Compare every behavior-changing dependency: model route, skill, prompt, tool, policy, context strategy, execution image, and verifier.”

KEY LINE: “Rollback the composition first; isolate the component second.”

⸻

66. ONLY ONE WORKLOAD REGRESSES

QUESTION: “The new version is better overall but terrible for Java repositories.”

TALKING SCRIPT: “Don’t throw away useful improvement unnecessarily. Remove the candidate from Java workload eligibility while preserving it where evidence shows improvement. Then isolate why Java behaves differently—model capability, context, toolchain, repository distribution, or evaluation coverage. Qualification should be workload-specific enough to support this.”

KEY LINE: “Roll back the affected qualification boundary, not necessarily the entire platform.”

67. REGRESSION AFTER 50% ROLLOUT

QUESTION: “The new Factory Version looked healthy at 1% and 10%, but starts failing after reaching 50%. What do you do?”

TALKING SCRIPT: “Stop further rollout immediately and determine whether the safest response is rollback, traffic reduction, or targeted workload exclusion. The fact that smaller canaries passed tells me to investigate scale-dependent behavior: concurrency, provider throttling, cache behavior, queue pressure, resource exhaustion, workload diversity, or a failure class absent from the smaller cohort. Preserve both successful and failed trajectories because the difference between them may reveal the trigger. Once stable, add the newly discovered workload or scale condition to qualification.”

KEY LINE: “Canaries reduce blast radius; they don’t guarantee absence of scale-dependent failure.”

⸻

68. ROLLBACK VS. ROLL FORWARD

QUESTION: “How do you decide whether to rollback or fix forward?”

TALKING SCRIPT: “I choose the fastest safe restoration path, not one ideology. Rollback is attractive when the previous state is known-good and compatible. Roll-forward may be safer when database migrations, external side effects, dependency changes, or compatibility constraints make rollback dangerous. I evaluate current state, reversibility, time-to-recovery, confidence in the fix, and customer impact.”

KEY LINE: “Recovery strategy follows current state and reversibility, not habit.”

⸻

69. KNOWN-GOOD STATE

QUESTION: “What does ‘known-good’ actually mean?”

TALKING SCRIPT: “A version or configuration with recent evidence that it meets the workload’s quality, security, reliability, and operational requirements. Ideally it’s the previously qualified production version with known artifacts, dependencies, policy, and runtime environment. ‘Old’ doesn’t automatically mean safe if external state has changed since it ran.”

KEY LINE: “Known-good means evidence-backed and compatible with current state.”

⸻

70. ROLLBACK CAUSES ANOTHER REGRESSION

QUESTION: “You rollback and something else breaks.”

TALKING SCRIPT: “Stop assuming rollback is inherently safe. Reassess the current system, dependency compatibility, schema state, feature flags, and external side effects. Stabilize through whichever mechanism now creates the smallest blast radius—traffic isolation, partial roll-forward, feature disablement, or targeted remediation. Then update the rollback qualification because the recovery path itself had an invalid assumption.”

KEY LINE: “Recovery mechanisms are production systems and need testing too.”

⸻

71. DEPLOYMENT VERSION UNKNOWN

QUESTION: “During the incident nobody knows exactly what’s running.”

TALKING SCRIPT: “That’s an observability and provenance failure. Query the deployment system and artifact registry to establish actual artifact identity by environment and cohort, rather than relying on intended state. Until we know what is running, avoid broad remediation that assumes one version. Afterward, make deployment identity first-class telemetry.”

KEY LINE: “Operate against observed production state, not intended production state.”

⸻

72. PRODUCTION CONFIGURATION UNKNOWN

QUESTION: “The artifact is correct, but nobody knows which runtime configuration is active.”

TALKING SCRIPT: “Configuration needs the same provenance discipline. Establish current configuration from authoritative systems, compare with desired state, identify drift, and restore the known-safe combination. If configuration materially affects behavior, it belongs in release and incident evidence.”

KEY LINE: “Code plus configuration creates production behavior.”

⸻

73. MULTI-REGION INCIDENT

QUESTION: “Only one region is failing.”

TALKING SCRIPT: “That gives me a useful comparison. Contain the affected region, compare Factory Version, model route, provider endpoint, configuration, deployment artifact, context infrastructure, sandbox image, network dependencies, and traffic characteristics against healthy regions. If architecture supports it and capacity allows, shift traffic while investigating. Avoid immediately changing healthy regions and destroying the control group.”

KEY LINE: “Healthy regions are evidence—don’t erase the comparison prematurely.”

⸻

74. GLOBAL INCIDENT

QUESTION: “Every region is affected simultaneously.”

TALKING SCRIPT: “That pushes shared dependencies to the top of my hypothesis list: recent global configuration, Factory Version, model provider, identity, state store, policy service, shared context, or capability gateway. Contain the shared failing layer rather than independently treating every region. Restore the most recent known-good global dependency where evidence supports it.”

KEY LINE: “Correlated failure points toward correlated dependency.”

⸻

75. ONE REPOSITORY FAILS REPEATEDLY

QUESTION: “Everything works except one repository.”

TALKING SCRIPT: “Treat that as likely workload-specific rather than platform-wide until evidence says otherwise. Compare repository build environment, instructions, language/toolchain, context, tests, dependency graph, security policy, size, and historical behavior with successful repositories. Don’t destabilize the entire platform to solve a local incompatibility.”

KEY LINE: “Scope remediation to the failure domain.”

⸻

76. ONE CUSTOMER / TEAM REPORTS A FAILURE YOU CAN’T REPRODUCE

QUESTION: “What do you do?”

TALKING SCRIPT: “Start from their exact execution identity: Factory Version, repository baseline, context provenance, model route, Execution Profile, tool versions, artifacts, and verification evidence. Reconstruct the conditions rather than asking them to repeat the problem manually. If model nondeterminism prevents token-identical replay, reproduce the failure class under equivalent conditions.”

KEY LINE: “Reproduce the environment and evidence, not necessarily every token.”

⸻

77. INTERMITTENT FAILURE

QUESTION: “It only fails 1% of the time.”

TALKING SCRIPT: “Intermittent failures require correlation. Segment failures by model/provider, worker host, region, repository, context path, tool version, concurrency, latency, and time. Increase targeted tracing for affected workloads without logging everything globally. If the failure is consequential, reduce autonomy until confidence improves.”

KEY LINE: “Rare failures become diagnosable when execution identity is rich enough to correlate them.”

⸻

78. HEISENBUG / OBSERVABILITY CHANGES THE FAILURE

QUESTION: “The problem disappears when you turn on detailed tracing.”

TALKING SCRIPT: “Use lower-overhead instrumentation, sampling, state snapshots, and deterministic event records. Compare timing-sensitive dimensions such as concurrency and race conditions. Don’t keep modifying production behavior trying to catch the bug. Sometimes the safest path is reproducing the workload in an isolated environment from captured state.”

KEY LINE: “Observability should illuminate behavior without becoming the behavior.”

⸻

79. RACE CONDITION

QUESTION: “Two workers mutate shared state incorrectly.”

TALKING SCRIPT: “Contain affected workflows and identify the invariant that failed. Then look at transaction boundaries, ownership, leases, optimistic concurrency/version checks, and idempotency. Fix the invariant in the deterministic control plane rather than asking agents to ‘coordinate better.’”

KEY LINE: “Concurrency invariants belong in deterministic systems.”

⸻

80. DEADLOCK

QUESTION: “Two work orders are waiting on each other indefinitely.”

TALKING SCRIPT: “Detect lack of progress and inspect the dependency graph. If the plan contains a cycle, that’s a planning-validation failure. If runtime resources are deadlocked, identify lock or capacity ordering. Break the deadlock safely, then add cycle detection, lock ordering, timeout, or dependency validation depending on root cause.”

KEY LINE: “Deadlock prevention begins with explicit ownership and dependency semantics.”

⸻

81. LOST UPDATE

QUESTION: “Two actors overwrite each other’s state.”

TALKING SCRIPT: “Use versioned state transitions or optimistic concurrency so a mutation only succeeds against the expected current version. A stale writer receives a conflict and must reload current state. For highly consequential ownership state, stronger transactional semantics may be appropriate.”

KEY LINE: “Reject stale mutation rather than silently accepting last writer wins.”

⸻

82. EVENT LOSS

QUESTION: “An important lifecycle event disappears.”

TALKING SCRIPT: “If authoritative state depends solely on an unreliable event stream, that’s a design problem. Durable lifecycle events need appropriate delivery guarantees, but I also like reconciliation against authoritative state so missed events don’t create permanent divergence. Determine whether the event represented state or merely notification.”

KEY LINE: “Events accelerate coordination; reconciliation repairs missed coordination.”

⸻

83. DUPLICATE EVENT

QUESTION: “An event arrives twice.”

TALKING SCRIPT: “Consumers should assume duplicates and use event IDs, aggregate versions, or idempotent processing. Duplicate notification should not produce duplicate side effects. This is normal distributed-systems behavior, not necessarily an incident.”

KEY LINE: “Design consumers for at-least-once delivery.”

⸻

84. OUT-OF-ORDER EVENTS

QUESTION: “Completion arrives before started.”

TALKING SCRIPT: “Use aggregate sequence/version information and authoritative state-transition validation. We don’t need global event ordering, only enough ordering to preserve the relevant invariant. Late events should not move state backward.”

KEY LINE: “Order where the invariant requires it.”

⸻

85. EVENT STREAM OUTAGE

QUESTION: “Kafka/event infrastructure goes down.”

TALKING SCRIPT: “Determine whether the stream is authoritative or transport. If transactional state remains authoritative, components can buffer events and reconcile later within limits. If critical lifecycle state depends on the stream itself, failover or pause may be necessary. Avoid allowing event-delivery failure to create ambiguous authority.”

KEY LINE: “Know whether your event system carries truth or carries truth between systems.”

⸻

86. EVIDENCE PUBLICATION FAILS

QUESTION: “The work finished but the evidence store is unavailable.”

TALKING SCRIPT: “If evidence is mandatory for acceptance, the workflow cannot progress to consequential authority simply because generation succeeded. Preserve evidence locally or in durable intermediate storage, retry publication, and keep the execution in verification/evidence-pending state. Don’t recreate evidence later from memory if authoritative results already existed.”

KEY LINE: “No required evidence means no evidence-backed authority.”

⸻

87. EVIDENCE IS CORRUPTED

QUESTION: “A stored verification artifact fails integrity checks.”

TALKING SCRIPT: “Treat that evidence as invalid. Determine whether corruption is isolated storage failure, publication defect, or malicious modification. Re-run the relevant verifier against the exact candidate where possible and inspect other evidence from the same path. High-risk accepted artifacts may need re-verification.”

KEY LINE: “Corrupt proof is no proof.”

⸻

88. EVIDENCE MISMATCHES ARTIFACT

QUESTION: “Tests passed, but against a different commit.”

TALKING SCRIPT: “That’s a serious acceptance-integrity failure. Stop progression, bind evidence explicitly to artifact identity, identify other potentially affected executions, and rerun verification against the correct candidate. The long-term fix is content-addressed or commit-bound evidence rather than loose associations.”

KEY LINE: “Proof must bind to the thing it claims to prove.”

⸻

89. STALE APPROVAL

QUESTION: “A human approved the change, then the code changed.”

TALKING SCRIPT: “The approval should be invalidated if the change materially affects the evidence or decision. Determine what changed, rerun affected verification, and require renewed approval where policy demands it. Human approval should bind to an exact candidate and evidence state.”

KEY LINE: “Authority expires when the evidence supporting it changes.”

⸻

90. APPROVER UNAVAILABLE

QUESTION: “The required human is unavailable during an incident.”

TALKING SCRIPT: “Resolve authority through an approved role/escalation path, not by bypassing the gate. Emergency authority should be designed beforehand with clear scope and audit. If no authorized decision-maker exists, consequential action waits unless an emergency policy explicitly provides another path.”

KEY LINE: “Operational urgency doesn’t create authority.”

⸻

91. HUMAN MAKES THE WRONG DECISION

QUESTION: “The human approves something the system warned against.”

TALKING SCRIPT: “Determine whether the finding was advisory or mandatory. If the human had legitimate override authority, preserve the rationale and treat the outcome as learning data. If policy intended the control to be non-overridable, that’s an authorization defect. Human authority doesn’t mean humans are infallible; it means accountability is explicit.”

KEY LINE: “Human authority assigns accountability; it doesn’t guarantee correctness.”

⸻

92. INCIDENT COMMAND

QUESTION: “Who runs a major incident?”

TALKING SCRIPT: “I want explicit roles: incident commander, technical leads for relevant domains, communications owner, and scriber/operations support depending on severity. The incident commander owns prioritization and coordination rather than becoming the deepest debugger. For security incidents, bring security response into command structure immediately.”

KEY LINE: “One person owns coordination so experts can own investigation.”

⸻

93. YOUR ROLE AS ENGINEERING MANAGER DURING AN INCIDENT

QUESTION: “What do you personally do?”

TALKING SCRIPT: “My role depends on the incident, but generally I establish clarity: impact, priorities, ownership, communication cadence, decision authority, and escalation. I remove distractions, ensure the right technical experts are engaged, challenge assumptions, make or escalate consequential decisions, and protect the team from chaotic parallel direction. I don’t need to be the person typing every command to provide technical leadership.”

KEY LINE: “My job is to create a high-quality decision system under pressure.”

⸻

94. WHEN DO YOU TAKE OVER TECHNICALLY?

QUESTION: “Would you jump into the debugging yourself?”

TALKING SCRIPT: “If my expertise materially accelerates diagnosis, yes. But I don’t want leadership ego turning the incident commander into a bottleneck. I stay technically close enough to understand evidence, challenge hypotheses, and make tradeoffs while allowing the engineer with the strongest system knowledge to drive detailed debugging.”

KEY LINE: “Stay technically engaged without displacing the best person to solve the problem.”

⸻

95. COMMUNICATION DURING INCIDENTS

QUESTION: “How often do you communicate?”

TALKING SCRIPT: “Set a predictable cadence based on severity. Communicate impact, what is known, what is not known, containment status, current mitigation, next decision point, and next update time. Avoid speculative root cause. Internal executive communication and builder/customer communication may require different detail, but they should share the same factual state.”

KEY LINE: “Communicate facts, decisions, uncertainty, and next update—not speculation.”

⸻

96. WHAT IF YOU DON’T KNOW THE ROOT CAUSE?

QUESTION: “Executives want an answer.”

TALKING SCRIPT: “Say what we know and what we don’t. ‘We know the regression began after Factory Version X reached 50%. We’ve stopped rollout and restored the previous version. Service is recovering. We are investigating whether the trigger was model routing or sandbox concurrency. We don’t yet have confirmed root cause.’ Credibility matters more than premature certainty.”

KEY LINE: “Never convert pressure for certainty into fabricated certainty.”

⸻

97. MULTIPLE COMPETING HYPOTHESES

QUESTION: “Three engineers think three different things are wrong.”

TALKING SCRIPT: “Make the hypotheses explicit and rank them by evidence, likelihood, impact, and cost of testing. Assign parallel investigation where it won’t create conflicting production changes. Use experiments that discriminate between hypotheses. Avoid three people independently modifying production to prove themselves right.”

KEY LINE: “Parallelize investigation, not uncontrolled remediation.”

⸻

98. TOO MANY PEOPLE IN THE INCIDENT

QUESTION: “Fifty engineers join the bridge.”

TALKING SCRIPT: “Create a smaller active response group with explicit owners and move observers to an update channel. Too many voices reduce signal and increase conflicting actions. Pull specialists in when their expertise becomes relevant.”

KEY LINE: “Incident response needs enough expertise, not maximum attendance.”

⸻

99. CHANGE FREEZE

QUESTION: “Would you freeze deployments?”

TALKING SCRIPT: “For a severe or poorly understood incident, potentially freeze unrelated changes to reduce variables and avoid compounding impact. But don’t automatically prevent a required remediation from deploying. The freeze should have explicit scope and owner.”

KEY LINE: “Reduce change noise without blocking recovery.”

⸻

100. ANOTHER INCIDENT OCCURS SIMULTANEOUSLY

QUESTION: “A second unrelated outage begins.”

TALKING SCRIPT: “Don’t assume they’re unrelated or related prematurely. Establish separate incident ownership if necessary, compare shared dependencies, and ensure critical experts aren’t overloaded across both. Leadership may need to prioritize customer impact and resource allocation.”

KEY LINE: “Separate coordination until evidence establishes shared causality.”

⸻

101. WHEN TO DECLARE RECOVERY

QUESTION: “When is the incident over?”

TALKING SCRIPT: “Not when the graph turns green for thirty seconds. I want customer/builders recovered, error and latency stable, backlog draining predictably, containment holding, no ongoing security exposure, and enough observation time for confidence. Then move from active response to follow-up while continuing heightened monitoring.”

KEY LINE: “Recovery means stable service and contained risk, not temporary metric improvement.”

⸻

102. BACKLOG AFTER RECOVERY

QUESTION: “Service is healthy but 100,000 jobs are queued.”

TALKING SCRIPT: “That’s still operational recovery. Drain gradually according to priority, downstream capacity, quotas, and workload freshness. Some jobs may now be obsolete and should be cancelled rather than executed. Monitor whether backlog draining recreates provider or infrastructure saturation.”

KEY LINE: “Recover demand as deliberately as you recover supply.”

⸻

103. STALE QUEUED WORK

QUESTION: “Do you execute jobs submitted six hours ago?”

TALKING SCRIPT: “Not automatically. Revalidate intent freshness, repository baseline, policy, credentials, dependencies, and workload usefulness. Interactive requests may simply expire. Long-running delegated objectives may still be valid but require re-planning against current state.”

KEY LINE: “Queued work ages; validity should be reestablished before execution.”

⸻

104. POST-INCIDENT REVIEW

QUESTION: “How do you run a postmortem?”

TALKING SCRIPT: “Focus on system conditions and decision quality, not blame. Establish timeline, impact, detection, containment, restoration, root and contributing causes, why safeguards didn’t prevent or detect the failure, what made recovery difficult, and concrete corrective actions with owners. For agentic incidents, include model route, context, plan, tools,

104. POST-INCIDENT REVIEW — CONTINUED

QUESTION: “How do you run a postmortem?”

TALKING SCRIPT: “I focus on system conditions, control failures, and decision quality, not individual blame. Establish the timeline, impact, detection, containment, restoration, root cause, contributing factors, and why existing safeguards didn’t prevent or detect the failure. For an agentic incident, I also inspect the builder intent, plan, Factory Version, model route, context provenance, tool calls, sandbox, policy decisions, verification evidence, authority decisions, deployment, and production outcome. Then corrective actions need owners, priority, and measurable completion criteria. The important question isn’t only ‘What broke?’ It’s ‘What allowed this failure to become consequential?’”

KEY LINE: “Fix the defect, the detection gap, and the control gap.”

⸻

105. ROOT CAUSE VS. CONTRIBUTING FACTORS

QUESTION: “How do you determine root cause?”

TALKING SCRIPT: “I avoid forcing every incident into one simplistic root cause. There may be a triggering defect plus multiple contributing system conditions. For example, a model generated an incorrect change, but weak acceptance criteria, missing tests, correlated verification, broad rollout, and poor observability allowed it to reach production. Fixing only the model prompt leaves the system vulnerable to the next variant.”

KEY LINE: “The trigger explains why the incident started. Contributing factors explain why it became an incident.”

⸻

106. FIVE WHYS

QUESTION: “Do you use Five Whys?”

TALKING SCRIPT: “It can be useful for pushing beyond the immediate symptom, but I wouldn’t force complex distributed incidents into one linear causal chain. Agentic systems can fail through interacting conditions across model, context, orchestration, state, verification, policy, and deployment. I want causal depth without artificial simplicity.”

KEY LINE: “Go deep enough to change the system, not merely name the component.”

⸻

107. CORRECTIVE ACTIONS

QUESTION: “What makes a good postmortem action item?”

TALKING SCRIPT: “It should reduce either probability, blast radius, detection time, containment time, or recovery time. ‘Be more careful’ isn’t corrective action. ‘Add a protected regression case for this failure class,’ ‘enforce fencing on evidence publication,’ or ‘automatically quarantine a Factory Version when verification failure exceeds X’ changes the system.”

KEY LINE: “Corrective actions should change system behavior, not ask humans to remember harder.”

⸻

108. ACTION-ITEM PRIORITIZATION

QUESTION: “You identify 25 improvements. Do you implement all of them?”

TALKING SCRIPT: “No. Prioritize based on risk reduction, recurrence probability, blast radius, implementation cost, and systemic leverage. Fix controls that eliminate entire classes of failure before polishing edge-case diagnostics. Some items may be accepted risk if the expected benefit doesn’t justify complexity.”

KEY LINE: “Postmortems should improve the system without turning every incident into permanent architecture.”

⸻

109. VERIFYING THE FIX

QUESTION: “How do you know the incident is actually fixed?”

TALKING SCRIPT: “Reproduce the original failure class against the corrected system. The new control should prevent, detect, contain, or recover from it as intended. Add the scenario to automated regression or evaluation where appropriate. For operational controls, fault-inject the condition. Closing the ticket isn’t proof.”

KEY LINE: “A corrective action is complete when its risk reduction is demonstrated.”

⸻

110. INCIDENT → EVALUATION CORPUS

QUESTION: “How do incidents improve AI evaluations?”

TALKING SCRIPT: “Production failures are extremely valuable because they expose where our evaluation model differed from reality. Convert representative incidents into regression workloads, adversarial cases, verification tests, routing cases, context tests, or policy cases. Preserve enough of the original conditions to reproduce the failure class. Then future candidate Factory Versions must demonstrate they don’t reintroduce it.”

KEY LINE: “Every escaped defect should make the qualification system harder to fool.”

⸻

111. INCIDENT → ROUTING IMPROVEMENT

QUESTION: “What if the wrong model was selected?”

TALKING SCRIPT: “Determine whether the model was incorrectly eligible or merely incorrectly ranked. If it lacked the required capability, fix qualification. If another qualified model consistently performs better for that workload, improve routing evidence. Don’t simply add a hardcoded rule for one incident unless the underlying workload characteristic justifies it.”

KEY LINE: “Fix the routing principle, not merely the routing symptom.”

⸻

112. INCIDENT → CONTEXT IMPROVEMENT

QUESTION: “The agent failed because it didn’t know something important.”

TALKING SCRIPT: “Determine why: source absent, retrieval failure, stale index, permission issue, ranking problem, context budget, or bad compaction. Then fix the appropriate layer and add a context evaluation proving the required information is available for that workload. Avoid solving every missing-context incident by injecting another giant static prompt.”

KEY LINE: “Fix context acquisition, not prompt accumulation.”

⸻

113. INCIDENT → VERIFICATION IMPROVEMENT

QUESTION: “Verification missed the defect.”

TALKING SCRIPT: “Ask what evidence could have detected the failure before production. Maybe an existing deterministic test was missing, maybe we need a new security rule, dynamic evaluation, adversarial case, repository-specific check, or independent semantic verifier. Then add that mechanism at the cheapest reliable layer.”

KEY LINE: “Turn escaped failures into future evidence requirements.”

⸻

114. INCIDENT → AUTHORITY CHANGE

QUESTION: “The workflow had too much autonomy.”

TALKING SCRIPT: “Temporarily reduce autonomy for the affected workload while correcting verification or controls. That may mean requiring human acceptance, preventing auto-merge, restricting production authority, or reducing repository scope. Once evidence demonstrates stronger safety, autonomy can increase again.”

KEY LINE: “Autonomy should contract when evidence weakens and expand when evidence improves.”

⸻

115. INCIDENT → BLAST-RADIUS REDUCTION

QUESTION: “The defect was inevitable. How could impact have been smaller?”

TALKING SCRIPT: “Look at canary size, feature flags, repository scope, credential scope, concurrency, rollout speed, organizational quota, regional isolation, and reversibility. Reliability isn’t only preventing failure. It’s designing failures so they remain bounded.”

KEY LINE: “Assume some failures will escape; design how far they’re allowed to travel.”

⸻

116. REPEATED INCIDENT

QUESTION: “The same class of incident happens again.”

TALKING SCRIPT: “That’s evidence the prior corrective action didn’t address the systemic cause or wasn’t completed effectively. Reopen the previous assumptions, compare the trajectories, and determine whether we treated the symptom. Repeated incidents deserve escalation because they indicate a control we believe exists isn’t actually working.”

KEY LINE: “Recurrence is evidence against the effectiveness of the previous fix.”

⸻

117. INCIDENT CAUSED BY HUMAN ERROR

QUESTION: “An engineer made a bad production change.”

TALKING SCRIPT: “I still ask why the system allowed one mistake to create that consequence. Was the action reversible? Was blast radius bounded? Was verification missing? Did the interface make the unsafe choice easy? Was authority too broad? Human error is expected in complex systems; resilient systems constrain its impact.”

KEY LINE: “Don’t stop the analysis at ‘someone made a mistake.’”

⸻

118. INCIDENT CAUSED BY AGENT ERROR

QUESTION: “How is that different?”

TALKING SCRIPT: “The same reliability principles apply, but autonomous systems can execute at much greater speed and scale, so mistakes can propagate faster. That increases the importance of bounded authority, independent verification, rate limits, progressive rollout, and centralized revocation. An agent mistake repeated 10,000 times is fundamentally different operationally from one engineer making one mistake.”

KEY LINE: “Autonomy changes failure velocity and therefore changes containment requirements.”

⸻

119. HUMAN VS. AGENT FAILURE

QUESTION: “Do you hold AI-generated changes to a higher bar?”

TALKING SCRIPT: “I hold consequential changes to the appropriate bar regardless of author, but autonomous scale can justify stronger controls. If an agent can create hundreds of changes per hour, the verification and rollout architecture must account for that throughput. Trust should derive from evidence rather than whether a human or model typed the code.”

KEY LINE: “Trust the evidence, not the author type.”

⸻

120. ERROR BUDGETS

QUESTION: “Would you use error budgets for Meta Factory?”

TALKING SCRIPT: “Yes, but at multiple levels. Traditional infrastructure error budgets can cover API availability, scheduling, sandbox provisioning, and state durability. Workload-level budgets can cover accepted outcome failure, human correction, policy violations, or verification regressions. If a Factory Version burns its quality or reliability budget, slow rollout, reduce autonomy, or prioritize reliability work.”

KEY LINE: “Error budgets can govern behavioral reliability as well as infrastructure reliability.”

⸻

121. QUALITY BUDGET

QUESTION: “What’s a quality budget?”

TALKING SCRIPT: “A tolerated failure envelope for a workload: perhaps accepted-outcome rate, defect escape, human correction, false-positive rate, or verification disagreement. It doesn’t mean accepting unsafe behavior. Security and hard policy can remain zero-tolerance while lower-consequence quality dimensions have defined operational thresholds.”

KEY LINE: “Not every reliability dimension has the same tolerance.”

⸻

122. COST BUDGET

QUESTION: “Would cost have operational thresholds too?”

TALKING SCRIPT: “Absolutely. A sudden increase in cost per accepted outcome, tokens per run, sandbox duration, retry rate, or verification expense can indicate degraded behavior even if quality remains stable. Economic regression should be observable and capable of stopping promotion or triggering routing changes.”

KEY LINE: “Economics are part of production health.”

⸻

123. BURN-RATE ALERTS

QUESTION: “How would you alert on error-budget consumption?”

TALKING SCRIPT: “Use multiple windows so we catch both fast catastrophic burn and slower sustained degradation. The exact thresholds depend on the SLO, but the principle is the same as conventional SRE. For behavioral quality, enough volume is needed before declaring statistical regression, so alerting may incorporate confidence and workload segmentation.”

KEY LINE: “Alert on meaningful consumption of reliability margin, not every individual failure.”

⸻

124. ALERT FATIGUE

QUESTION: “How do you prevent too many alerts?”

TALKING SCRIPT: “Every page should correspond to something requiring timely human action. Low-priority anomalies become dashboards, tickets, or automated remediation. Group correlated symptoms around likely incidents. Regularly review noisy alerts and remove or retune them.”

KEY LINE: “If nobody needs to act now, it probably shouldn’t page.”

⸻

125. AI-SPECIFIC ALERTS

QUESTION: “What agentic behavior would you alert on?”

TALKING SCRIPT: “Examples: runaway token consumption, repeated identical tool calls, abnormal retry rate, sudden accepted-outcome regression, unusual tool/credential usage, unexpected egress, context authorization failure, verifier disagreement spike, model-route shift, Factory Version regression, stuck workflows, and abnormal human override rate. But alerts should be tied to risk, not novelty.”

KEY LINE: “Alert on consequential behavioral anomalies, not merely interesting AI behavior.”

⸻

126. ANOMALY DETECTION

QUESTION: “Would you use AI to detect operational anomalies?”

TALKING SCRIPT: “Potentially as a supplement. Statistical and deterministic thresholds remain valuable and interpretable. AI can help correlate high-dimensional signals or summarize incidents, but I wouldn’t make the only outage detector another probabilistic system without independent signals.”

KEY LINE: “Use intelligence to improve detection, not to eliminate observable invariants.”

⸻

127. AUTOMATED REMEDIATION

QUESTION: “How much incident remediation should be automated?”

TALKING SCRIPT: “Automate actions that are well-understood, bounded, reversible, and strongly triggered by evidence: restart a failed worker, quarantine a bad capability, roll traffic back to a qualified version, expire a stale lease, or scale known bottlenecks. Ambiguous or irreversible remediation should remain recommendation-first until evidence supports more autonomy.”

KEY LINE: “Automate known recovery paths before automating uncertain diagnosis.”

⸻

128. SELF-HEALING SYSTEM

QUESTION: “Would Meta Factory be self-healing?”

TALKING SCRIPT: “For defined failure classes, yes. Worker replacement, lease recovery, provider failover, queue rebalancing, sandbox recreation, and qualified rollback can be highly automated. But ‘self-healing’ shouldn’t mean the system improvises unrestricted production mutations whenever something looks wrong.”

KEY LINE: “Self-healing should execute proven recovery playbooks within bounded authority.”

⸻

129. RUNBOOKS

QUESTION: “Do runbooks still matter with AI?”

TALKING SCRIPT: “Absolutely. They become both human operational guidance and structured recovery knowledge for agents. Good runbooks capture symptoms, diagnostics, authority boundaries, safe remediation, rollback, escalation, and verification of recovery. AI can make runbooks easier to execute, but shouldn’t eliminate explicit operational knowledge.”

KEY LINE: “AI makes runbooks more executable; it doesn’t make operational knowledge unnecessary.”

⸻

130. RUNBOOK DRIFT

QUESTION: “What if the runbook is outdated?”

TALKING SCRIPT: “Runbooks need ownership, versioning, review, and ideally automated validation where possible. Incident outcomes should update them. For high-risk remediation, current system state and policy outrank stale documentation.”

KEY LINE: “A stale recovery instruction can become an incident multiplier.”

⸻

131. GAME DAYS

QUESTION: “Would you run game days?”

TALKING SCRIPT: “Definitely. Exercise model outage, tool compromise, worker crash, state-store degradation, sandbox failure, context outage, bad Factory Version, credential exposure, verifier outage, and rollback failure. The goal is to validate technical recovery and team coordination before real incidents.”

KEY LINE: “Practice failure while the stakes are low.”

⸻

132. CHAOS ENGINEERING

QUESTION: “How is that different from game days?”

TALKING SCRIPT: “Game days validate broader people, process, and system response. Chaos engineering can continuously or periodically inject controlled technical failures to validate specific resilience hypotheses. Both are valuable; neither should be random destruction for theater.”

KEY LINE: “Inject failure to test a hypothesis, not to prove we’re brave.”

⸻

133. FAILURE INJECTION FOR AGENT SYSTEMS

QUESTION: “What failures would you inject?”

TALKING SCRIPT: “Model timeout, malformed model response, tool 500, tool ambiguous timeout, stale context, missing context, worker death, lease expiry, duplicate event, state-store latency, sandbox provisioning failure, verifier disagreement, provider rate limit, credential expiration, and evidence-store outage.”

KEY LINE: “Test the boundaries where autonomous workflows are most likely to become ambiguous.”

⸻

134. LOAD TESTING

QUESTION: “How would you load-test Meta Factory?”

TALKING SCRIPT: “Test more than API requests. Simulate realistic objective arrival rates, task fan-out, model-provider quotas, sandbox provisioning, context retrieval, tool traffic, verification, evidence publication, and queue behavior. Include workload mix because 10,000 tiny review tasks behave differently from 1,000 six-hour autonomous jobs.”

KEY LINE: “Load-test the lifecycle, not merely the front door.”

⸻

135. CAPACITY PLANNING

QUESTION: “How do you plan capacity?”

TALKING SCRIPT: “Model demand by workload class, expected concurrency, task duration, sandbox requirements, provider quotas, context load, verification cost, and growth. Maintain headroom for failures and bursts. Understand which capacity can scale elastically and which dependencies have hard quotas.”

KEY LINE: “Capacity planning follows workload shape, not just request count.”

⸻

136. PEAK DEMAND

QUESTION: “What if Adobe has a huge launch and usage spikes?”

TALKING SCRIPT: “Pre-plan known events where possible, reserve capacity for critical workflows, increase provider quotas, prewarm execution capacity if economics justify it, and establish priority policies. Low-priority autonomous background work can yield capacity to interactive or release-critical workloads.”

KEY LINE: “Not all work deserves equal priority during scarcity.”

⸻

137. DEGRADED MODES

QUESTION: “What degraded modes would you design?”

TALKING SCRIPT: “Examples: queue autonomous work, disable expensive frontier routing, use qualified fallback models, turn off optional semantic review while retaining mandatory deterministic gates, reduce background concurrency, use repository-local context when enterprise context is unavailable, or switch from autonomous execution to recommendation-only mode. Each degraded mode needs explicit trust implications.”

KEY LINE: “Degrade features before degrading invariants.”

⸻

138. RECOMMENDATION-ONLY MODE

QUESTION: “Why is that useful operationally?”

TALKING SCRIPT: “It lets builders continue receiving AI assistance when execution or authority infrastructure is degraded. The agent can analyze and propose changes without receiving write or publication authority. That’s a powerful fallback because we preserve some utility while dramatically reducing consequence.”

KEY LINE: “When trust infrastructure weakens, reduce autonomy before removing intelligence.”

⸻

139. READ-ONLY MODE

QUESTION: “When would you use it?”

TALKING SCRIPT: “During security incidents, uncertain state, publication failures, or major control-plane degradation. Agents can inspect code, context, telemetry, and potentially diagnose problems without modifying repositories or production. It gives responders intelligence without expanding the incident.”

KEY LINE: “Read-only is a useful containment state for intelligent systems.”

⸻

140. GLOBAL KILL SWITCH

QUESTION: “Would you ever stop all autonomous execution?”

TALKING SCRIPT: “Yes if we have a systemic security or authority failure where targeted containment cannot establish safety. But I prefer hierarchical controls: model, capability, Factory Version, Execution Profile, workflow, organization, region, then global. A global stop is the last reliable boundary, not the first operational reflex.”

KEY LINE: “Contain at the smallest boundary you can trust.”

141. KILL SWITCH ITSELF FAILS

QUESTION: “What if your central kill switch doesn’t stop execution?”

TALKING SCRIPT: “That’s a severe control-plane failure because a containment mechanism we believed existed isn’t actually enforceable. I’d move to the next independent boundary: revoke workload identities and credentials, block model/tool access at gateways, restrict network egress, stop scheduling, terminate worker infrastructure, or isolate the affected environment. Once contained, the kill-switch path becomes a priority reliability issue. Critical containment controls need independent testing and should not depend on the same component they’re intended to stop.”

KEY LINE: “A safety control isn’t real until we’ve proven it works during failure.”

⸻

142. CONTROL PLANE OUTAGE

QUESTION: “The control plane goes down while thousands of agents are executing.”

TALKING SCRIPT: “Active workers retain only their previously granted bounded, expiring authority. They should not acquire new work, increase budgets, obtain new credentials, or publish consequential results if ownership and policy can’t be validated. Depending on risk, some safe local computation may finish. Restore the control plane, invalidate stale leases, reconcile workers and external side effects, then progressively resume scheduling.”

KEY LINE: “Loss of governance should reduce authority, not expand it.”

⸻

143. CONTROL PLANE DATABASE FAILURE

QUESTION: “The database containing workflow state is unavailable.”

TALKING SCRIPT: “Stop consequential state transitions if authoritative state cannot be established. Protect the database first, fail over if available, and determine RPO/RTO impact. Once restored, reconcile leases, attempts, budgets, approvals, artifacts, and external side effects before simply restarting workers. The hard problem isn’t restoring rows; it’s restoring coherent workflow ownership.”

KEY LINE: “State recovery isn’t complete until execution ownership is coherent.”

⸻

144. DATABASE RESTORED FROM BACKUP

QUESTION: “You’ve lost five minutes of workflow state.”

TALKING SCRIPT: “Treat the restored database as potentially behind external reality. Some workers may have published branches, invoked tools, or deployed artifacts during the missing interval. Reconcile using execution IDs, idempotency keys, artifact repositories, source control, deployment systems, and external tool state. Don’t blindly replay the missing five minutes.”

KEY LINE: “After state loss, reconcile reality before replaying intent.”

⸻

145. SPLIT BRAIN

QUESTION: “Two control-plane regions both think they own the same work.”

TALKING SCRIPT: “For authority-sensitive operations, that’s unacceptable. Use leases, epochs or fencing tokens, and strongly consistent ownership semantics so only the newest valid owner can publish consequential results. During partition, I would rather sacrifice some availability than allow conflicting production authority.”

KEY LINE: “Availability is negotiable. Ambiguous authority isn’t.”

⸻

146. DISASTER RECOVERY

QUESTION: “A region is completely lost.”

TALKING SCRIPT: “Protect authoritative state first. Fail builder-facing traffic where appropriate, restore or fail over durable workflow state, invalidate stale regional leases, recreate disposable execution capacity elsewhere, reconnect model/tool dependencies, and resume eligible workflows from safe checkpoints. Then verify evidence integrity and external side effects before declaring recovery.”

KEY LINE: “Workers are replaceable. Authoritative state is not.”

⸻

147. RPO VS. RTO

QUESTION: “What recovery objectives matter?”

TALKING SCRIPT: “RTO tells me how quickly service must return. RPO tells me how much authoritative state we can afford to lose. For autonomous execution, I’d define them separately for control-plane state, evidence, artifacts, telemetry, and disposable workers. Losing five minutes of traces is very different from losing five minutes of deployment-authority decisions.”

KEY LINE: “Recovery requirements should follow the value and authority of the state.”

⸻

148. DISASTER RECOVERY TESTING

QUESTION: “How do you know DR actually works?”

TALKING SCRIPT: “Exercise it. Simulate loss of a region or primary state service, restore authoritative state, invalidate stale ownership, recreate workers, resume representative long-running objectives, and verify RPO, RTO, duplicate-side-effect protection, evidence integrity, and builder-visible state. Infrastructure failover alone doesn’t prove workflow recovery.”

KEY LINE: “Test disaster recovery at the workflow level.”

⸻

149. MODEL PROVIDER DISASTER + REGION FAILURE

QUESTION: “Your region fails and your fallback model provider is also unavailable.”

TALKING SCRIPT: “Now capability is genuinely constrained. Prioritize critical workloads, use only qualified remaining capabilities, queue work that can wait, and explicitly degrade workflows where necessary. Don’t lower security or quality thresholds simply to maintain a green availability number.”

KEY LINE: “Sometimes the correct degraded behavior is to stop.”

⸻

150. MULTIPLE DEPENDENCIES FAIL

QUESTION: “How do you reason about cascading failure?”

TALKING SCRIPT: “Identify the first failing dependency and feedback loops amplifying it. Provider latency can create retries; retries create queue growth; queue growth creates worker saturation; saturation creates timeouts; timeouts create more retries. Break the feedback loop through circuit breakers, backpressure, admission control, and workload shedding rather than independently scaling every symptom.”

KEY LINE: “Cascading incidents are often feedback loops disguised as multiple failures.”

⸻

151. CASCADE PREVENTION

QUESTION: “How do you architect against cascading failure?”

TALKING SCRIPT: “Use bounded retries, circuit breakers, quotas, workload isolation, bulkheads, timeouts, backpressure, resource limits, and degraded modes. One model provider, tool, organization, or workload class shouldn’t consume every shared resource. Isolation is a reliability mechanism as much as a security mechanism.”

KEY LINE: “Bound failure propagation before failure happens.”

⸻

152. BULKHEADS

QUESTION: “What are bulkheads in Meta Factory?”

TALKING SCRIPT: “Separate capacity or failure domains so one workload doesn’t sink everything else. Interactive coding, background modernization, code review, and high-compute autonomous delivery may have different worker pools, quotas, provider budgets, or scheduling classes. We don’t necessarily need physically separate infrastructure everywhere; we need enough isolation to preserve critical service.”

KEY LINE: “Share infrastructure without sharing every failure mode.”

⸻

153. GRACEFUL DEGRADATION

QUESTION: “What does graceful degradation look like?”

TALKING SCRIPT: “Move down the autonomy/capability ladder deliberately: full autonomous delivery → autonomous candidate generation with human acceptance → recommendation-only → read-only diagnosis → queue/defer. Which mode applies depends on which trust component failed. If model routing fails, perhaps use a qualified fallback. If policy fails, consequence stops.”

KEY LINE: “Degrade capability before degrading safety.”

⸻

154. LOAD SHEDDING

QUESTION: “What do you drop first?”

TALKING SCRIPT: “Low-priority, stale, speculative, or background work before interactive and release-critical workloads. I may cancel duplicate speculative candidates, postpone broad evaluations, reduce background concurrency, or expire stale requests. But I don’t shed mandatory security or policy verification to increase throughput.”

KEY LINE: “Shed optional work, not required trust.”

⸻

155. CAPACITY VS. RELIABILITY

QUESTION: “Why maintain headroom?”

TALKING SCRIPT: “Because systems operating at 100% utilization have little ability to absorb bursts, retries, failover, or dependency slowdown. Headroom is operational insurance. The amount depends on workload elasticity and recovery requirements.”

KEY LINE: “Unused capacity can be reliability capacity.”

⸻

156. CHANGE MANAGEMENT

QUESTION: “How do you reduce incidents caused by Meta Factory itself?”

TALKING SCRIPT: “Treat every behavior-changing artifact as production software: versioning, evaluation, review, canarying, progressive rollout, observability, rollback, and change attribution. That includes models, prompts, skills, tools, routing, policies, context strategies, evaluators, and sandbox images.”

KEY LINE: “If it changes behavior, it’s a production change.”

⸻

157. CHANGE CORRELATION

QUESTION: “How do you quickly know what changed before an incident?”

TALKING SCRIPT: “The incident view should correlate recent changes across Factory Versions, model routes, tools, skills, policies, execution images, context configuration, infrastructure, and application deployments. I want responders to answer ‘what changed?’ in minutes, not by searching five systems manually.”

KEY LINE: “Change provenance reduces diagnosis time.”

⸻

158. TOO MANY SIMULTANEOUS CHANGES

QUESTION: “Teams ship models, prompts, tools, and policies independently. How do you debug?”

TALKING SCRIPT: “That’s one reason production executes an immutable qualified Factory Version. Components can evolve independently during development, but production behavior should identify the exact composition. Otherwise every incident becomes combinatorial archaeology.”

KEY LINE: “Independent development is useful. Unidentified production composition is not.”

⸻

159. EMERGENCY CHANGE

QUESTION: “Would you bypass normal qualification during an incident?”

TALKING SCRIPT: “Potentially through an explicit emergency path, but not an ungoverned one. Narrow the change, establish authority, run the fastest meaningful verification, deploy to the smallest safe scope, observe aggressively, and follow up with full qualification afterward. Emergency process trades some confidence for time consciously.”

KEY LINE: “Emergency doesn’t mean uncontrolled; it means deliberately compressed.”

⸻

160. HOTFIX CREATED BY AN AGENT

QUESTION: “Would you trust an agent to generate the emergency fix?”

TALKING SCRIPT: “It can generate a candidate quickly, but incident pressure is exactly when independent verification matters. Keep the change narrow, test the failure reproduction and fix, inspect unintended scope, and use progressive rollout or feature flags where possible. Speed of generation shouldn’t eliminate trust controls.”

KEY LINE: “Use AI to compress remediation time, not to compress judgment to zero.”

⸻

161. INCIDENT DURING AN INTERVIEW-STYLE ‘EVERYTHING IS ON FIRE’ SCENARIO

QUESTION: “Everything is failing. What do you do first?”

TALKING SCRIPT: “I refuse to debug ten symptoms independently. First establish severity and blast radius, identify what changed, stop expansion, and determine whether there’s a common dependency. I want one incident commander, clear technical owners, and a stable communication cadence. Then restore the safest known operating mode—even if that’s reduced autonomy or recommendation-only—before deep root-cause analysis.”

KEY LINE: “Create order before creating theories.”

⸻

162. HOW DO YOU PRIORITIZE MULTIPLE FAILURES?

QUESTION: “Model failures, queue backlog, and cost explosion are happening simultaneously.”

TALKING SCRIPT: “Prioritize by customer/security impact and causal leverage. If the model failure is generating retries that cause the queue and cost explosion, contain the model route first. Fixing queue capacity before stopping the source would make the system fail faster. I look for the upstream failure creating downstream symptoms.”

KEY LINE: “Fix causes before scaling symptoms.”

⸻

163. DECISION UNDER INCOMPLETE INFORMATION

QUESTION: “How much evidence do you need before acting?”

TALKING SCRIPT: “Enough to make the next decision safer than inaction. During an expanding incident, waiting for certainty can itself be a bad decision. I favor reversible containment actions under uncertainty—pause rollout, quarantine a version, reduce authority—while preserving evidence. Irreversible remediation requires a higher confidence threshold.”

KEY LINE: “Decision confidence should scale with irreversibility.”

⸻

164. WRONG HYPOTHESIS

QUESTION: “What if your initial diagnosis is wrong?”

TALKING SCRIPT: “That’s expected sometimes. Make early mitigations reversible, explicitly track hypotheses, and update based on evidence. I care more about whether the response process corrects itself quickly than whether the first hypothesis was perfect.”

KEY LINE: “Strong incident response is adaptive, not clairvoyant.”

⸻

165. WHEN DO YOU ESCALATE?

QUESTION: “When do you bring in executives, security, or vendors?”

TALKING SCRIPT: “Based on impact and expertise required. Security/privacy exposure, major customer impact, material business interruption, regulatory implications, provider-level failure, or inability to contain should trigger appropriate escalation early. Escalation isn’t failure; delayed escalation can be.”

KEY LINE: “Escalate before missing expertise becomes part of the incident.”

⸻

166. VENDOR ESCALATION

QUESTION: “A model provider appears responsible.”

TALKING SCRIPT: “Protect Adobe first. Route away, queue, or degrade as appropriate, then provide the vendor with precise evidence: timestamps, request IDs, model/version, failure characteristics, and impact. I don’t wait for the vendor to acknowledge the problem before containing our side.”

KEY LINE: “Vendor ownership doesn’t outsource our operational responsibility.”

⸻

167. EXECUTIVE COMMUNICATION

QUESTION: “What do you tell leadership?”

TALKING SCRIPT: “Concise facts: impact, current containment, customer/business exposure, what changed, what is known versus unknown, current mitigation, major decision required if any, and next update time. Avoid deep implementation detail unless it changes the decision.”

KEY LINE: “Executives need impact, risk, decisions, and trajectory.”

⸻

168. BUILDER COMMUNICATION

QUESTION: “What do you tell Adobe engineers using the platform?”

TALKING SCRIPT: “Tell them which capabilities are affected, what still works, whether queued work is safe, what actions they should avoid or take, and when they’ll hear next. If we switch to recommendation-only or pause autonomous merge, make that explicit. Builders need actionable information.”

KEY LINE: “Operational communication should change user behavior when user behavior matters.”

⸻

169. SECURITY COMMUNICATION

QUESTION: “What if you’re unsure whether data leaked?”

TALKING SCRIPT: “Say exactly that internally to the appropriate responders: potential exposure under investigation, affected scope currently known, containment performed, evidence being preserved. Don’t prematurely claim no exposure. Security/privacy teams can determine required notification based on evidence and policy.”

KEY LINE: “Uncertainty should be communicated as uncertainty.”

⸻

170. INCIDENT TIMELINE

QUESTION: “Why maintain a timeline?”

TALKING SCRIPT: “It prevents memory reconstruction later and helps correlate system changes, alerts, human decisions, containment, recovery, and external events. During complex agent incidents, the execution evidence provides much of the machine timeline automatically; responders add decisions and context.”

KEY LINE: “A good timeline turns postmortem debate into evidence.”

⸻

171. OPERATIONAL OWNERSHIP

QUESTION: “Who should be on call for Meta Factory?”

TALKING SCRIPT: “Teams owning production capabilities need operational responsibility appropriate to their layer. The platform team owns shared control-plane, execution, routing, and platform reliability. Capability owners own their models/tools/agents. Domain teams own domain-specific workflows. Escalation paths should reflect dependencies rather than forcing one central team to understand everything.”

KEY LINE: “Ownership should follow the component capable of fixing the failure.”

⸻

172. FOLLOW-THE-SUN OPERATIONS

QUESTION: “Adobe is global. How do you handle handoffs?”

TALKING SCRIPT: “Use structured handoffs with current impact, containment, hypotheses, active experiments, recent changes, decisions made, outstanding risks, owners, and next actions. The incoming team shouldn’t have to reconstruct the incident from chat history.”

KEY LINE: “Handoffs transfer state, not just conversation.”

⸻

173. ON-CALL FATIGUE

QUESTION: “How do you prevent an AI platform from creating endless pages?”

TALKING SCRIPT: “Automate known recovery, improve alert quality, remove nonactionable pages, establish clear ownership, use workload isolation, and invest in reliability after incidents. If engineers are constantly paged for agent loops or provider hiccups, that’s platform design debt.”

KEY LINE: “Human attention is a reliability resource too.”

⸻

174. AI FOR ON-CALL SUPPORT

QUESTION: “Would you use agents to help responders?”

TALKING SCRIPT: “Absolutely. They can assemble recent changes, traces, correlated alerts, affected Factory Versions, runbooks, historical incidents, blast-radius queries, and candidate hypotheses. But I’d initially keep consequential remediation behind human authority unless the recovery path is well qualified.”

KEY LINE: “Use AI to compress time-to-understanding before expanding time-to-action autonomy.”

⸻

175. AUTOMATED INCIDENT SUMMARY

QUESTION: “Could AI maintain the incident timeline?”

TALKING SCRIPT: “Yes. Structured platform events provide strong source material. AI can summarize state, decisions, changes, and outstanding hypotheses, but important facts should link back to source evidence. The summary is an interface over the evidence, not the evidence itself.”

KEY LINE: “AI can summarize operational truth; it shouldn’t manufacture operational truth.”

⸻

176. AI-GENERATED ROOT CAUSE

QUESTION: “Would you trust an agent’s RCA?”

TALKING SCRIPT: “As a hypothesis generator, yes. As final truth, no. Root cause needs evidence. The agent can correlate signals humans might miss and propose causal chains, but responders should validate them against state, traces, code, changes, and experiments.”

KEY LINE: “AI accelerates hypothesis formation; evidence establishes causality.”

⸻

177. AI-GENERATED REMEDIATION

QUESTION: “Would an incident agent generate a fix?”

TALKING SCRIPT: “Yes, especially for code/configuration problems. But the candidate enters the same trust path: bounded execution → verification → evidence → authority → progressive delivery. Incident urgency may compress the process, but it shouldn’t erase the distinction between generation and acceptance.”

KEY LINE: “Fast generation is useful precisely because verification remains independent.”

⸻

178. RELIABILITY VS. VELOCITY

QUESTION: “How do you balance innovation speed with reliability?”

TALKING SCRIPT: “By making experimentation cheap and blast radius progressive. Teams should be able to experiment rapidly in constrained environments. Production authority grows only with evidence. Feature flags, canaries, qualified capabilities, automated verification, and rollback let us move quickly without making every experiment enterprise-wide.”

KEY LINE: “Move fast in learning; expand blast radius slowly.”
