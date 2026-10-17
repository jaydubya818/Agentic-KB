---
title: "NSCALE — PRODUCT MANAGER, PEOPLE SYSTEMS"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p9430
captured_at: 2026-10-16T22:56:21.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: 867ff72dd2dbcdf0908422ed0b18d0dbca49974aa1c33a1c70bf170bc40ace84
---

NSCALE — PRODUCT MANAGER, PEOPLE SYSTEMS

TECHNICAL QUESTION — BUILDING AN AI-NATIVE HR FUNCTION FROM A BLANK CANVAS

AUSTIN: “If you were building an AI-native HR function from the ground up, how would you approach it? Which employee workflow would you redesign first, and why?”

WHAT HE IS TESTING: AI-Native Architecture · Product Strategy · Workday Integration · Agentic Workflows · Employee Experience · Security · Business Value

TALKING SCRIPT — 90 SECONDS

“I would start by rethinking the employee experience rather than simply automating existing HR processes.

If we’re starting with a blank canvas, I would first establish Workday as the system of record, with scalable foundations around Core HCM, business processes, security, integrations, and data governance.

Then I would build an AI-native experience layer that allows employees and managers to interact with People Systems based on what they’re trying to accomplish, rather than which application they need to use.

For the first workflow, I would choose end-to-end employee onboarding.

The reason is that onboarding touches nearly every part of the People Technology ecosystem: Greenhouse, Workday, IT, identity provisioning, payroll, benefits, and People Operations.

Traditionally, onboarding involves multiple disconnected systems, manual handoffs, emails, and service tickets.

I would redesign that experience around an AI-powered new-hire readiness agent.

Once a candidate accepts an offer in Greenhouse, the agent would coordinate and monitor the onboarding journey across connected systems.

It would identify missing information, incomplete approvals, integration failures, and outstanding tasks before they impact the employee’s first day.

For example, if a new hire starts Monday but their Workday record is incomplete or their identity provisioning failed, the agent would identify the issue, determine the responsible team, and initiate an approved remediation workflow.

I would use traditional automation for predictable transactions and agentic AI for contextual reasoning, exception handling, and cross-system coordination.

Workday would continue to own employee records and business processes, while the agent operates within established security, authorization, human approval, and audit controls.

I would measure success through day-one readiness, onboarding completion rates, manual HR interventions, integration failures, and employee satisfaction.

Ultimately, my goal would be to create an onboarding experience where the employee doesn’t have to understand the underlying systems because the technology coordinates everything for them.

And once we establish that architecture, we can reuse those capabilities across employee transfers, promotions, compensation changes, leave management, and offboarding.”

ARCHITECTURE — HOW I WOULD BUILD IT

Employee Intent → AI Experience Layer → Policy & Context → Authorization → Agent Orchestration → Workday & Enterprise APIs → Human Approval → Verification

￼

HOW I WOULD EXECUTE IT

FIRST 30 DAYS — DISCOVER & DESIGN: Map the current offer-to-day-one workflow, identify systems, manual handoffs, integration failures, security requirements, and baseline metrics.

DAYS 31–60 — BUILD THE FOUNDATION: Establish integration contracts, permission-aware access, workflow orchestration, monitoring, and automated validation. Select one employee population for a controlled pilot.

DAYS 61–90 — PILOT & MEASURE: Launch a bounded new-hire readiness agent, initially focused on monitoring, answering questions, identifying exceptions, and routing approved corrective actions. Measure results before expanding autonomous capabilities.
