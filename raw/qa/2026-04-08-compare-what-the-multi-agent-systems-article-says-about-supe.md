---
id: 01KNNVX2S9BA6QZGK8CKBMPWHA
title: "Q: Compare what the multi-agent-systems article says about supervisor-worker vs wha"
source: qa
date: 2026-04-08T05:39:07.799Z
question: "Compare what the multi-agent-systems article says about supervisor-worker vs what the pattern-supervisor-worker article says. Where do they disagree?"
sources: ["wiki/concepts/multi-agent-systems.md", "wiki/summaries/summary-multi-agent-patterns-skill.md"]
tags: ["qa", "user-question"]
verified: true
---
# Compare what the multi-agent-systems article says about supervisor-worker vs what the pattern-supervisor-worker article says. Where do they disagree?

## Question

Compare what the multi-agent-systems article says about supervisor-worker vs what the pattern-supervisor-worker article says. Where do they disagree?

## Answer

# Supervisor-Worker: Where the Two Articles Disagree

The two articles are largely complementary, but there are several meaningful points of disagreement or tension worth unpacking carefully.

---

## 1. What Each Article Says About Supervisor-Worker

### `wiki/concepts/multi-agent-systems.md`

Describes **Orchestrator-Worker** as "the most common pattern" where:
- A single orchestrator maintains the high-level plan and delegates atomic subtasks to workers
- Workers are **stateless across tasks**; orchestrator owns all state
- Use it when tasks decompose cleanly, you need a clear chain of custody, and debugging must trace back to one decision point

### `wiki/summaries/summary-multi-agent-patterns-skill.md`

Describes **Supervisor/Orchestrator** as one of three patterns, adding important production nuance:
- Central agent maintains global state, routes to specialists, synthesizes results
- Documents a specific **"Telephone Game Problem"**: supervisors paraphrase sub-agent responses incorrectly, losing fidelity — backed by LangGraph benchmarks showing **50% worse performance** in naive implementations
- Proposes a `forward_message` tool mitigation so sub-agents can bypass the supervisor for final responses

---

## 2. Points of Disagreement

### 2a. Whether Supervisor-Worker Is Actually the Best Default

**`multi-agent-systems.md`** presents Orchestrator-Worker as the go-to topology — "the most common pattern" — with no caveat that it might underperform alternatives.

**`summary-multi-agent-patterns-skill.md`** directly challenges this: it states that with the `forward_message` fix applied, **swarm/peer-to-peer architectures *slightly* outperform supervisors** because sub-agents respond directly to users, eliminating translation errors. This implies supervisor-worker is not the unconditionally preferred pattern — it's a pattern with a known structural disadvantage that requires an explicit workaround.

> This is a direct disagreement: one article implies supervisor-worker is the safe default; the other implies it requires remediation to be competitive.

---

### 2b. The Role of the Supervisor in Synthesis

**`multi-agent-systems.md`** treats supervisor synthesis as a feature: the orchestrator "collects results → synthesizes," implying this is a normal, desirable part of the architecture.

**`summary-multi-agent-patterns-skill.md`** treats that same synthesis step as a **failure risk** — the Telephone Game Problem is specifically about the supervisor corrupting outputs during synthesis. The fix (`forward_message`) is designed to *skip* supervisor synthesis when possible, not improve it.

> One article treats synthesis as the point of the supervisor; the other treats it as the primary failure mode.

---

### 2c. Worker Statefulness

**`multi-agent-systems.md`** is explicit: "Workers are stateless across tasks." This is presented as a design constraint and a virtue (enables safe retries).

**`summary-multi-agent-patterns-skill.md`** does not assert workers are stateless. Its context isolation table includes **"File system memory"** as a mechanism for shared state across agents — which implies workers can and sometimes should carry or access persistent state. This isn't framed as an anti-pattern; it's listed as a legitimate trade-off ("enables sharing without context bloat, but adds latency").

> `multi-agent-systems.md` prescribes stateless workers; `summary-multi-agent-patterns-skill.md` is agnostic and accommodates stateful patterns.

---

### 2d. Why You Use Sub-Agents at All

**`multi-agent-systems.md`** frames sub-agents through multiple lenses: handling tasks that exceed context length, enabling specialization, enabling parallelism, and providing fault isolation.

**`summary-multi-agent-patterns-skill.md`** is more opinionated with its core thesis: *"Sub-agents exist primarily to isolate context, not to anthropomorphize role division."* The organizational metaphor (researcher, analyst, writer) is explicitly called **secondary**. This reframes the *purpose* of the supervisor-worker pattern — it's not about role specialization, it's about keeping each agent's context window clean.

> A subtle but important philosophical disagreement about *why* you decompose work in the first place.

---

## Summary Table

| Dimension | `multi-agent-systems.md` | `summary-multi-agent-patterns-skill.md` |
|---|---|---|
| Default recommendation | Supervisor-worker is the most common, go-to pattern | Supervisor-worker needs `forward_message` fix; swarm may outperform it |
| Synthesis step | Feature — orchestrator synthesizes results | Failure risk — the Telephone Game Problem |
| Worker statefulness | Workers must be stateless | Statefulness is a legitimate trade-off |
| Primary reason for sub-agents | Context length, specialization, parallelism, fault isolation | Context isolation is primary; role division is secondary |

---

## Practical Implication

If you're designing a supervisor-worker system, the `multi-agent-systems.md` article gives you the structural blueprint, but the `summary-multi-agent-patterns-skill.md` article is the more trustworthy production guide — it identifies a specific, benchmarked failure mode that the first article doesn't mention at all. You'd want to incorporate the `forward_message` pattern from the start rather than discovering the synthesis degradation problem after deployment.


## Sources Read

- [[wiki/concepts/multi-agent-systems]]
- [[wiki/summaries/summary-multi-agent-patterns-skill]]
