---
title: "Login → Today → chat with Sofie → ask for real work → Sofie creates…"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p8961
captured_at: 2026-10-02T03:36:11.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: 4b9d105a083f0d98e987b5b735c966d96d0e09e0b3fe159c05ced4f6bf2b3226
---

Login → Today → chat with Sofie → ask for real work → Sofie creates Work → progress appears → Software Engineer/MyFactory executes → verification appears → Result → Proof of Work → Needs You → approve publication → PR → CI/review status → completed outcome.

then surround that with other UI journeys:
Computer access, Memory correction/reuse, Goal→Task→Work, Inbox→Work, completed-task follow-up in the same conversation, second-owner isolation, Relay agent-to-agent communication, failure/recovery, and rejection/approval flows.

791. FINAL ARCHITECTURE

Target architecture:

Owner
↓
Sofie / MyEve
↓
Goal / Work / Authority
↓
MyFactory Cloud Control Plane
↓
ExecutionProvider
↓
Ephemeral Cloud Sandbox
↓
HarnessProvider
↓
DeepAgent OR Existing Qualified Harness
↓
Qualified Model Route
↓
Implementation + Host Checkpoints
↓
Immutable Candidate Custody
↓
Independent Cloud Verifier
↓
Result + Proof
↓
Sofie
↓
Needs You
↓
Publisher
↓
PR / CI / Review

Jay's Mac is not in this path unless Work explicitly requires the Owner Computer.

0—

100%. I would make this a release gate, not "we should add some E2E tests later."

What we just spent eight live attempts discovering should become permanent automated coverage so you never manually rediscover those failures again.

And I would deliberately use multiple layers/frameworks, because Playwright alone won't catch everything:

Playwright — primary browser/UI Golden Journeys.
Vitest — contracts, state machines, adapters, authority boundaries.
PostgreSQL integration tests — persistence, concurrency, recovery, isolation.
MyFactory harness/CLI tests — real execution protocol and lifecycle.
API/contract tests — MyEve ↔ Relay ↔ MyFactory boundaries.
Accessibility automation — axe through Playwright.
Visual regression — Playwright screenshots for critical owner surfaces.
Fault-injection/recovery tests — kill/restart, stale responses, 503s, UNKNOWN, duplicate events.
Small live-canary suite — only for the handful of things mocks fundamentally cannot establish.

The critical distinction should be:

Most E2E qualification must be deterministic and cheap. A tiny canary proves the real external world still connects.
