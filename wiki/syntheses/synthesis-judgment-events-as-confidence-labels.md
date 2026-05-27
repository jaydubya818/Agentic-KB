---
title: Episodic Judgment Events as Ground-Truth Labels for Per-Claim Confidence
type: synthesis
sources:
  - [[patterns/pattern-episodic-judgment-log]]
  - [[patterns/pattern-per-claim-confidence]]
  - [[syntheses/synthesis-episodic-judgment-as-freshness-signal]]
  - [[summaries/summary-llm-wiki-v2]]
question: Should per-claim confidence scores be calibrated against human correction events captured in the episodic judgment log, rather than scored from automated heuristics (source counts, recency, contradictions) alone?
tags: [memory, evaluation, human-in-the-loop, agentic, knowledge-management, calibration]
created: 2026-05-25
updated: 2026-05-25
reviewed: false
reviewed_date: ""
---

# Episodic Judgment Events as Ground-Truth Labels for Per-Claim Confidence

## Question
Should per-claim confidence scores be calibrated against human correction events captured in the [[patterns/pattern-episodic-judgment-log|episodic judgment log]], rather than scored from automated heuristics (source counts, recency, contradictions) alone?

## Argument
Yes. Per-claim confidence is currently a pure automation heuristic — counts, recency, contradiction flags — with no empirical anchor. The episodic judgment log already captures the strongest possible signal available to the system: moments when a human reviewed a *specific claim* and either confirmed or contradicted it. Treating those events as labels for confidence calibration turns confidence from a guessed-at scalar into an empirically-anchored estimate. The infrastructure exists; the routing does not.

## Evidence
[[patterns/pattern-per-claim-confidence]] scores each claim on three automated signals: number of supporting sources, freshness of the most recent source, and whether contradicting claims exist elsewhere in the wiki. None of these signals reflect whether a human ever examined the claim and registered a judgment.

[[patterns/pattern-episodic-judgment-log]] writes a JSONL record for every human correction event: the claim under review, the judgment (confirm / contradict / correct / defer), a rationale snippet, and a timestamp. The log is read by the contradiction detector but is not consumed by the per-claim confidence scorer.

[[syntheses/synthesis-episodic-judgment-as-freshness-signal]] already established the structural argument that judgment events should reset freshness clocks. This synthesis extends the same logic to confidence: a claim corrected twice by Jay should not score `high` no matter how many sources support it, and a claim confirmed by Jay last week should not decay to `medium` because the original ingest is 90 days old.

The implementation shape is straightforward: extend the per-claim confidence formula to read the episodic-judgment-log for matching claim IDs, weight `contradict` events as strong negative signal and `confirm` events as strong positive signal, and decay the human-judgment weight on the same half-life schedule the freshness policy already uses.

## Counter-arguments & Gaps
**Sparse-label problem.** If judgment events are rare (few claims get human review), confidence scores will be poorly calibrated in the long tail. The system needs a fallback path — likely the existing heuristic, with a flag indicating "unlabeled" so downstream consumers know the score is heuristic-only.

**Label-quality drift.** Jay's judgments at hour 12 of a session are not the same quality as judgments at hour 1. The log captures the event but not the fatigue context. Naive use of every judgment as equal-weight ground truth will introduce noise. A weighting term tied to judgment-density-per-session might help.

**Cold-start.** New claims have no judgment events by definition. Confidence must default to the heuristic score until a judgment event arrives.

**Out-of-scope evidence.** The synthesis assumes the existing episodic log schema is sufficient. The schema does NOT today record *why* a human is reviewing a claim (proactive audit vs. reactive contradiction), and that context likely matters for label weighting.

## Conclusion
Route episodic judgment events into the per-claim confidence scorer as authoritative labels, with the heuristic score as a fallback when no judgments exist. Treat this as a sibling change to [[syntheses/synthesis-episodic-judgment-as-freshness-signal]] — both fix the same architectural mistake (siloed judgment log) at different points in the scoring pipeline. Open question for the next iteration: should the confidence scorer also down-weight claims from sessions where Jay marked many things `defer` (a signal that judgment quality was lower that session)?

## Sources
- [[patterns/pattern-episodic-judgment-log]]
- [[patterns/pattern-per-claim-confidence]]
- [[syntheses/synthesis-episodic-judgment-as-freshness-signal]]
- [[summaries/summary-llm-wiki-v2]]
