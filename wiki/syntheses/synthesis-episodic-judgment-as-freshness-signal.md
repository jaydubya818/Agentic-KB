---
title: Episodic Judgment Events as the Highest-Authority Freshness Signal
type: synthesis
sources:
  - [[patterns/pattern-episodic-judgment-log]]
  - [[system/policies/freshness-policy]]
  - [[system/policies/contradiction-policy]]
  - [[syntheses/synthesis-episodic-judgment-log-to-trace-dataset]]
question: Should human-judgment events stored in the episodic log be routed to the freshness-decay engine as authoritative signals that reset (or accelerate) decay clocks on the facts they touch?
tags: [memory, evaluation, human-in-the-loop, agentic, knowledge-management]
created: 2026-05-23
updated: 2026-05-23
reviewed: false
reviewed_date: ""
---

# Episodic Judgment Events as the Highest-Authority Freshness Signal

## Question
Should human-judgment events stored in the episodic log be routed to the freshness-decay engine as authoritative signals that reset (or accelerate) decay clocks on the facts they touch?

## Argument
Yes — human-judgment events are the highest-confidence freshness signal the system has access to, and the current architecture wastes that signal by siloing it in the episodic log without feeding it back to the freshness-decay engine. The fix is structurally simple (emit a `freshness_touch` event alongside the episodic-log write) and the cost of not doing it is non-trivial: facts that a human just examined are suppressed by automated staleness scoring as if no human ever looked at them. The system has the data; it just doesn't route it.

## Evidence
[[system/policies/freshness-policy]] implements exponential decay with half-lives keyed by memory class — operational facts decay faster than principles, principles decay faster than verified architectural decisions. The decay clock is reset only by *re-ingestion* of the source (a new summary mentioning the fact, an autoresearch run that re-cites it). There is no path in the current design for *human attention* to reset the clock.

[[patterns/pattern-episodic-judgment-log]] records every event where a human reviews agent output and registers a judgment: confirmation, contradiction, correction, deferral. Each event is a JSONL line with a timestamp, the fact under review, the judgment, and a rationale snippet. The log's stated purpose is auditability and replay — it is read by the contradiction detector but not by the freshness engine.

The mismatch produces a concrete failure pattern: a human reviews an agent's claim about, say, an API rate limit. They confirm the fact is still correct. Three weeks later, the freshness policy decays that fact's confidence to `medium` and suppresses it from the next retrieval pass — even though a human verified it 21 days ago, which is more recent and more authoritative than any of the source ingests that originally produced the fact.

The [[summaries/summary-llm-wiki-v2]] notes a related gap: *"AI contradiction resolution — routes to human review only."* But the deeper missed opportunity is that once human review happens, its output is not routed back to the systems that would benefit from knowing it occurred.

The proposed integration is small: every write to the episodic log also emits a `freshness_touch` event of the form `{fact_id, judgment, ts}` to a queue the freshness engine consumes. Confirmation events reset the decay clock to the configured half-life. Contradiction events accelerate decay (or trigger an immediate review marker). Correction events both reset the clock *and* update the canonical fact. Deferral events are ignored by freshness (deferral means "I don't know enough to judge," which carries no signal).

[[syntheses/synthesis-episodic-judgment-log-to-trace-dataset]] argues for the episodic log as an *architecture-equivalence* to LangSmith's trace-to-dataset workflow — a comparison about external mappings. This synthesis is distinct: it argues for using the log as an *internal control signal* for an existing subsystem. Both syntheses can be true at once; they describe different uses of the same artifact.

[[system/policies/contradiction-policy]] is adjacent — it handles the detection side of human judgment (flagging contradictions). The freshness integration this synthesis proposes is the feedback side (using human attention as a confidence signal even when no contradiction is found). The two policies should be designed together; currently only one of them reads the episodic log.

## Counter-arguments & Gaps
The cleanest counter-argument is that this couples two subsystems that benefit from staying decoupled. The freshness engine works on its own clock and can be reasoned about as a pure decay process; injecting external signals turns it into a state machine with surprising behavior (a single human confirmation can dramatically shift the visibility of a fact across the entire KB). That coupling is a real cost — debugging "why is this fact suddenly ranking higher?" gets harder.

A second counter-argument: human judgment isn't always more authoritative than re-ingestion. A re-ingest of a primary source three weeks ago is structurally a better confidence signal than a human glance that confirmed a stale memory. The synthesis assumes human review is always high-confidence; in practice, the rigor of human judgment events varies wildly, and treating "deferral" as the only low-signal event undersells how many "confirmation" events are actually rubber-stamps.

The proposed integration also assumes the episodic log identifies *which fact* was reviewed with enough specificity to map to a freshness record. In practice, human judgments often apply to a paragraph or a page, not a single fact. The mapping from judgment-target to freshness-record needs design work this synthesis hand-waves over.

What would change the verdict: if a calibration study showed that confidence-decay reversed by human-judgment events produced *worse* retrieval quality (because rubber-stamp confirmations falsely inflated stale facts), the integration should be scoped narrower — only contradiction and correction events get routed, not confirmations. That would be a safer first cut and is probably the right way to ship this.

## Conclusion
The minimal-risk version of the proposal is: route only **contradiction** and **correction** events from the episodic log to the freshness engine; ignore confirmations and deferrals for now. This captures the highest-signal cases (a human found a fact wrong) without exposing the system to rubber-stamp inflation. Once that integration is live and observable, expand to confirmations only if telemetry shows the signal is real. Updates required: [[system/policies/freshness-policy]] adds a `freshness_touch` event consumer; [[patterns/pattern-episodic-judgment-log]] adds the emitter spec; [[system/policies/contradiction-policy]] documents the cross-policy handoff. Open question: how to define fact-level identity in the episodic log so the mapping to freshness records is unambiguous.

## Sources
- [[patterns/pattern-episodic-judgment-log]]
- [[system/policies/freshness-policy]]
- [[system/policies/contradiction-policy]]
- [[syntheses/synthesis-episodic-judgment-log-to-trace-dataset]]
- [[summaries/summary-llm-wiki-v2]]
