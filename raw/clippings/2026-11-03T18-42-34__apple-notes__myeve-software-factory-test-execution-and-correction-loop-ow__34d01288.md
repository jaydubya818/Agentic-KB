---
title: "MyEve Software Factory -- test execution and correction-loop ownership"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p9942
captured_at: 2026-11-03T18:42:34.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: 34d01288112f6cc9e3bbcae58fcf30f296b18991b1293114719879bbb8a67da3
---

In the actual MyEve Software Factory, that responsibility must be automated.

Who should run the tests? MyFactory should own test execution. Deep Agent should own the
correction loop.

Workflow: Sofie receives the developer's request and creates canonical Work. Deep Agent
plans implementation and delegates coding. Coding Agent writes the application in an
isolated workspace. MyFactory executes the build and tests in a controlled environment.
MyFactory returns structured failures to Deep Agent. Deep Agent instructs the coding agent
to correct the defects. MyFactory reruns the affected tests within the authorized execution
budget. Independent Verifier checks the final candidate using separately protected
acceptance criteria. Sofie receives the signed Result/Proof. MyApps delivers the verified
application.

MyEve / MyFactory / Sofie / MyApps are not in this job's repository routing table -- KB
candidate only, not a notes-to-factory work order.
