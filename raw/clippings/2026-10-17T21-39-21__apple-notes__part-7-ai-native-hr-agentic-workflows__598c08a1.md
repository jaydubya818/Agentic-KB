---
title: "PART 7 — AI-NATIVE HR & AGENTIC WORKFLOWS"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p9454
captured_at: 2026-10-17T21:39:21.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: 598c08a178de62b8ce39817e2b91e8fd8b71cdbf94583ff35cf1abddd61990ce
---

PART 7 — AI-NATIVE HR & AGENTIC WORKFLOWS

29. IF YOU COULD REDESIGN ONE EMPLOYEE WORKFLOW FROM SCRATCH USING AI, WHICH WOULD YOU CHOOSE?

Likelihood: EXTREMELY HIGH | 90 seconds

I’d start with employee onboarding, because it’s one of the highest-impact workflows and touches nearly every part of the People Technology ecosystem.

Today, onboarding often involves multiple systems, manual handoffs, repetitive questions, and coordination between Recruiting, HR, IT, Security, Payroll, and hiring managers.

Rather than simply automating the existing workflow, I’d redesign the experience around the employee.

Imagine a new hire having a single AI-powered onboarding assistant.

The assistant could explain onboarding requirements, answer policy questions, guide employees through tasks, and coordinate approved actions across connected systems.

For example, it could identify missing onboarding requirements, check task status, create an IT service request, and remind the appropriate owner when something is delayed.

The architecture would use Workday as the authoritative source for worker information, with approved integrations to Greenhouse, IT service management, and identity systems.

I’d establish role-based permissions, audit logging, human approvals, and clear boundaries around sensitive data.

I’d start with a narrow use case, measure onboarding completion time and manual HR effort, and expand based on demonstrated value.

At Workday, I’ve led AI platforms and workflows that reduced manual effort so I’ve seen how effective this approach can be.

KEY MESSAGE: I wouldn’t use AI to make a broken onboarding process faster. I’d redesign the process so employees don’t have to navigate the complexity in the first place.

⸻

30. HOW WOULD YOU BUILD AN AI-NATIVE HR FUNCTION FROM A BLANK CANVAS?

Likelihood: EXTREMELY HIGH | 90 seconds

I’d start by separating the system of record, business workflows, and employee experience.

Workday should remain the authoritative platform for core worker information and employment transactions.

But employees shouldn’t necessarily have to navigate multiple applications to complete everyday tasks.

I’d build an experience where employees and managers can interact with People Systems through a single, intelligent service layer.

For example, a manager could ask:

“What do I need to do to onboard my new employee?”

Instead of returning a generic knowledge article, the system could securely retrieve the employee’s onboarding status, identify outstanding tasks, and recommend the next action.

For approved low-risk actions, it could execute workflows through supported APIs.

For sensitive transactions involving compensation, employment status, or access permissions, I’d require appropriate authorization and human approval.

I’d prioritize three foundational capabilities:

First, trusted data and integrations. Accurate worker information, secure APIs, and reliable system connections.

Second, governed AI infrastructure. Permission-aware retrieval, auditability, evaluations, and human-in-the-loop controls.

Third, redesigned employee experiences. Conversational self-service, proactive workflow assistance, and intelligent task orchestration.

I’d start with measurable use cases and expand based on adoption, reliability, and business value.

KEY MESSAGE: AI-native HR isn’t about adding a chatbot to Workday. It’s about r
