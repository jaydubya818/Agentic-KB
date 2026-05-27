---
title: "Synthesis: The Episodic Judgment Log IS the Bootstrapping Dataset for Contradiction Auto-Resolution"
type: synthesis
sources:
  - "[[patterns/pattern-episodic-judgment-log]]"
  - "[[summaries/summary-llm-wiki-v2]]"
  - "[[syntheses/synthesis-episodic-judgment-as-freshness-signal]]"
question: "What is the missing training signal for moving contradiction resolution from human-routed to LLM-auto-resolved, and where does it come from?"
tags: [memory, evaluation, agentic, knowledge-management, human-in-the-loop, pattern-memory]
created: 2026-05-24
updated: 2026-05-24
reviewed: false
reviewed_date: ""
---

# The Episodic Judgment Log IS the Bootstrapping Dataset for Contradiction Auto-Resolution

## Question

What is the missing training signal for moving contradiction resolution from human-routed to LLM-auto-resolved, and where does it come from?

## Argument

It already exists. Every human-resolved contradiction logged to the episodic judgment log is a labeled training example for the auto-resolver — `{claim_A, claim_B, context} → {resolution, authority_signal, rationale}` — and the KB is already collecting them as a byproduct of normal operation. The v2 gap analysis in `[[summaries/summary-llm-wiki-v2]]` explicitly flags "AI contradiction resolution → Routes to human review only ❌ Gap" as a current limitation, treating the path to auto-resolution as a separate data-collection problem. It isn't. The append-only JSONL events the `[[patterns/pattern-episodic-judgment-log]]` writes when a human resolves a flagged contradiction are *exactly* the supervised dataset a fine-tuned or few-shot classifier needs.

The freshness-signal synthesis (`[[syntheses/synthesis-episodic-judgment-as-freshness-signal]]`) routes these same events to the decay engine. That work establishes that judgment events carry authoritative weight and structured provenance. The natural extension is a second consumer on the same event bus: a contradiction-resolution module that learns from prior human resolutions to propose new ones.

## Evidence

- `[[patterns/pattern-episodic-judgment-log]]` (added 2026-04-09): captures append-only JSONL events with `{judgment, rationale, authority, timestamp}` whenever a human resolves a flagged claim.
- `[[summaries/summary-llm-wiki-v2]]` gap table (2026-04-12): lists "AI contradiction resolution → Routes to human review only ❌ Gap" as a primary limitation of the current architecture.
- `[[syntheses/synthesis-episodic-judgment-as-freshness-signal]]` (2026-05-23): establishes the pattern of routing judgment events to a downstream consumer (the decay engine) and validates the authority semantics.
- The KB already has ≥17 unresolved contradictions logged across the last 60 days (per `wiki/log.md`), each of which will eventually produce a human resolution event — meaning the dataset is accreting at a steady rate without new instrumentation.

## Counter-arguments & Gaps

The strongest objection is that human-resolved contradictions are systematically biased toward easy cases — the resolver Jay reaches for first tend to be ones where one source is obviously authoritative. A classifier trained on this distribution may learn a shortcut ("trust the page with more inbound links") rather than the underlying reasoning. This bias is not addressed by simply having more events.

A second gap: the current episodic log schema does not capture *near-misses* — cases where Jay considered two resolutions before picking one. The training signal for "what would have been wrong" is absent. Without negative examples, the auto-resolver will be over-confident on novel contradictions.

Third, "auto-resolution" itself is under-specified. Three different behaviors are conflated: (a) propose a resolution + ask human to confirm, (b) auto-resolve only high-confidence cases, (c) fully autonomous. The first is a clear next step. The third may not be the right goal at all, since the freshness-signal synthesis treats human authority as the *whole point* of the log — auto-resolution dilutes that.

Finally, the v2 gap may be miscategorized. Routing to human review isn't *only* a gap; for contested claims it's the correct behavior. The question to resolve before building is: which contradiction classes are safe to auto-resolve, and which are *intentional* human checkpoints?

## Conclusion

Build the smallest version of this first: a few-shot classifier that reads new contradictions and proposes a resolution + cited prior judgments, but still routes to human confirmation. This costs almost nothing (the data is already structured, the prompt is straightforward) and surfaces the bias problem fast. If the proposal-confirmation flow shows that the classifier is right 80%+ of the time on a chosen contradiction class, that class becomes a candidate for fuller automation. The freshness-signal synthesis is the architectural template — same event bus, second consumer.

Open question for the next round: should the episodic log schema be extended to capture rejected alternatives, or is that better stored separately as a "considered-but-not-chosen" sibling event?

## Sources

- `[[patterns/pattern-episodic-judgment-log]]`
- `[[summaries/summary-llm-wiki-v2]]`
- `[[syntheses/synthesis-episodic-judgment-as-freshness-signal]]`
- `[[syntheses/synthesis-episodic-judgment-log-to-trace-dataset]]` (adjacent — establishes the trace-to-dataset equivalence)
