---
title: "Factory Learning V1 sequencing and System Qualification Run"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p7000
captured_at: 2026-08-16T18:28:43.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: f651153fd02590c27f4423a0d3a5332472b74f442997a772fa2c29554445537e
---

Yes — that’s exactly where I’d concentrate now.
You’ve built enough substrate that the next value jump comes from closing the learning loop, then proving the entire factory works as one coherent system under a realistic end-to-end scenario.
I’d sequence it like this:
Factory Learning V1: finish signals → clustering → improvement candidates → human review → governed experiment → promotion recommendation.
Factory Learning hardening: make sure it can’t self-authorize, can’t directly mutate governance, can’t bypass verification, and can’t become a token sink.
Factory Learning UX: Basic gets a few high-confidence recommendations; Intermediate gets evidence/impact; Advanced gets raw traces/evals/config drift/experiment history.
Then Full System E2E Qualification: one realistic Mission traverses the whole control plane and proves every major subsystem works together.
For that final system test, I’d want something much broader than a normal golden path. I’d define a Mission Control System Qualification Run that proves, in one governed scenario:
Mission → Plan → recipe recommendation → Factory Version → Context Package → worker lease → sandbox/local execution → trace/observability → source Attempt → candidate PR → independent verification Attempt → exact Verification Subject → frozen Verification Plan → evidence/receipts → exact-current eligibility → human acceptance → Factory Learning signal generation → improvement candidate → experiment proposal
And then add deliberate faults so you prove the negative paths too:
stale worker lease
candidate/PR-head mismatch
verification failure
retry/new Attempt lineage
context miss
deterministic gate failure
sandbox cleanup failure or simulated orphan
model-routing override
a repeated correction that becomes a Learning Signal
an Improvement Candidate that cannot directly change production/config without a governed WorkOrder
The important part is that the final E2E should not just prove “the app works.” It should prove your architectural invariants survive across subsystem boundaries.
Once Codex finishes the currently-running tasks, I’d have one dedicated coordinating thread create a fresh worktree for something like:
codex/system-factory-e2e-qualification-v1
and make that the single authoritative integration/qualification stream. No new product features in that worktree unless the test exposes a real defect.
That’s where you’ll know you’ve moved from “many strong components” to an actual governed autonomous software factory.
