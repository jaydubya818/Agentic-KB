---
title: The Worker's Tool Set Belongs to the Permission Layer, Not the Orchestration Topology
type: synthesis
sources:
  - [[patterns/pattern-supervisor-worker]]
  - [[patterns/pattern-minimal-permissions]]
  - [[concepts/tool-design]]
  - [[mocs/orchestration]]
  - [[mocs/tool-use]]
  - [[syntheses/synthesis-permissions-as-single-compiled-policy]]
question: When a supervisor fans work out to worker agents, who owns the source of truth for a worker's allowed tool set — the orchestrator's topology, or the tool layer's permission policy?
tags: [orchestration, tool-use, permissions, safety, multi-agent, least-privilege, blast-radius]
created: 2026-08-31
updated: 2026-08-31
reviewed: false
reviewed_date: ""
---

# The Worker's Tool Set Belongs to the Permission Layer, Not the Orchestration Topology

## Question
When a supervisor fans work out to worker agents, who owns the source of truth for a worker's allowed tool set — the orchestrator's topology, or the tool layer's permission policy?

## Argument
The permission layer owns it. Today the KB answers this question twice, in two different vocabularies, and the answers do not compose. [[wiki/hot]] states the orchestration rule flatly — "Orchestrator has full tools; workers have restricted sets" — deriving a worker's privileges from its *position in the graph*. [[patterns/pattern-minimal-permissions]] derives them from the *task being performed*: "Each task type gets its own defined tool set." These are different functions over different inputs. Position-derived scoping says a worker is restricted because it is a worker; task-derived scoping says an agent is restricted because of what it was asked to do. A system that believes both, without deciding which is authoritative, has no answer for the ordinary case where a worker's subtask legitimately needs a tool the topology rule denies it — or, more dangerously, where the topology rule grants a tool the task never needed.

The seam is real, not theoretical. [[patterns/pattern-supervisor-worker]] — the page that owns this pattern — never mentions tool restriction at all. Its "Worker Agents" definition scopes *context* ("a scoped subtask with minimal context") and says nothing about *capability*. The restriction rule exists only in the hot cache and in the framework-specific implementations the Orchestration MoC catalogues, which means it is enforced by convention per framework rather than by a policy any framework must honor. Meanwhile [[patterns/pattern-minimal-permissions]] names the exact failure this produces: "if Agent A with broad permissions delegates to Agent B, Agent B inherits the same blast radius even if it only needs read access." Inheritance is the default that topology-based scoping produces when nobody writes the restriction down.

Resolving it in favor of the permission layer follows from where the enforcement primitive already lives. A tool allowlist is checked at call time by the tool layer regardless of which agent called it; the orchestrator cannot enforce a restriction on a tool it does not mediate. Topology should therefore be an *input* to the policy — a subject attribute, like tenant or role — rather than a parallel authority. This is the same move [[syntheses/synthesis-permissions-as-single-compiled-policy]] makes for retrieval filters and tool allowlists, extended one level: the compiled policy's subject is not just "which user" but "which agent, at which depth, under which delegation."

## Evidence
[[wiki/hot]] (Most-Used Patterns, supervisor-worker entry) encodes the topology rule as load-bearing hot-path guidance: "Orchestrator has full tools; workers have restricted sets." No qualifying condition, no pointer to a permission policy.

[[patterns/pattern-supervisor-worker]] specifies the orchestrator as defining "the fan-out strategy (how many workers, what each receives)" and workers as receiving "a scoped subtask with minimal context." Capability scoping is absent from the page entirely — a documentation gap that leaves the hot-cache rule without a canonical home.

[[patterns/pattern-minimal-permissions]] (`confidence: high`, category `safety`) grounds scoping in Principle of Least Privilege and defines tool sets per task type, listing the delegation-inheritance case as the compounding risk in [[concepts/multi-agent-systems]]. Its tradeoff line — "Principle of least privilege vs friction for trusted agents" — is precisely the tension a topology rule tries to shortcut by declaring all workers untrusted and the orchestrator trusted.

[[concepts/tool-design]] supplies the mechanism by which a topology rule fails silently: a tool's invocation contract is evaluated at call time against arguments, not against the caller's position in a delegation graph. Nothing in the contract can see "this caller is a worker" unless that fact is passed as policy input.

[[syntheses/synthesis-permissions-as-single-compiled-policy]] establishes the design-time precedent — one policy document compiling to multiple enforcement surfaces — and [[syntheses/synthesis-retrieval-and-tool-permissions-as-co-enforced-boundary]] the runtime one. Neither treats delegation depth as a subject attribute; that is the extension this synthesis proposes.

## Counter-arguments & Gaps
**Topology is cheap and usually right.** For a supervisor spawning short-lived, homogeneous workers, "workers get a read-only subset" is one line of config and correct almost always. Routing it through a policy compiler adds a build step and a DSL for a restriction that fits in a constructor argument. The permission-layer argument earns its cost only when workers are heterogeneous, long-lived, or recursively delegating — and the KB documents no deployment where that threshold has actually been crossed.

**The orchestrator may be the only thing that knows the task.** Task-derived scoping presumes the task type is known before the tool set is fixed. In dynamic decomposition the supervisor invents the subtask at runtime, so the only agent positioned to scope the worker *is* the orchestrator. This weakens the claim that the permission layer should own the source of truth; it may only own enforcement while the orchestrator owns derivation.

**No evidence of the failure mode in practice.** The blast-radius-inheritance risk is asserted from first principles in [[patterns/pattern-minimal-permissions]] (its sources are OWASP and general least-privilege doctrine, not incident reports). [UNVERIFIED] — the KB contains no logged case of a worker agent invoking a tool it should not have had. Without that, the severity ranking here rests on doctrine.

**Overlap risk with existing syntheses.** [[syntheses/synthesis-permissions-as-single-compiled-policy]] already argues for a single compiled policy across retrieval and tool surfaces. If delegation depth is simply another subject attribute, this synthesis may be a corollary rather than a distinct position. The distinguishing claim is narrow: that claim is about *multi-tenant user access*, this one about *intra-system agent topology* — two axes that a single policy DSL would have to express jointly, which no source in the KB demonstrates.

**What would resolve it:** an audit of the five-plus frameworks in [[mocs/orchestration]] recording, for each, whether worker tool sets are declared in orchestration config or in a permission policy, and whether any framework lets the two disagree. If all five bind tool sets at spawn time from orchestration config, the topology answer is the de facto standard and this synthesis is prescribing against the grain.

## Conclusion
Make topology an input to the permission policy, not a second authority over it. The concrete near-term step is smaller than the architecture: add the capability-scoping rule to [[patterns/pattern-supervisor-worker]] itself, so the restriction stops living only in [[wiki/hot]], and state explicitly that the worker's tool set is derived from its subtask and *narrowed* by its delegation depth — never widened by inheritance from the supervisor. Whether that derivation compiles from a shared policy document, per [[syntheses/synthesis-permissions-as-single-compiled-policy]], remains open until the framework audit above is done.

## Sources
- [[patterns/pattern-supervisor-worker]]
- [[patterns/pattern-minimal-permissions]]
- [[concepts/tool-design]]
- [[concepts/multi-agent-systems]]
- [[mocs/orchestration]]
- [[mocs/tool-use]]
- [[syntheses/synthesis-permissions-as-single-compiled-policy]]
- [[syntheses/synthesis-retrieval-and-tool-permissions-as-co-enforced-boundary]]
- [[wiki/hot]]
