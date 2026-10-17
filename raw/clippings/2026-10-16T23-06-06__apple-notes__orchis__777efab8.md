---
title: "Orchis"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p9432
captured_at: 2026-10-16T23:06:06.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: 777efab8515e6659956383e1acc6b5322f4122e57906d2eb398662019ac41445
---

Orchis 

PART I — CRITICAL HANDS-ON WORKDAY CONFIGURATION

1. WORKDAY TENANT NAVIGATION & ADMINISTRATION

Priority: CRITICAL | Hands-On Demonstration

Have her demonstrate:

Tenant environments: Production · Sandbox · Sandbox Preview · Implementation · Configuration migration.
Navigation: Global search · Tasks · Related Actions · Business Objects · Reports · Administrative tasks.
Configuration management: How to find, inspect, modify, test, and promote configurations.
Security administration: How to determine whether you have permission to perform a task.
Audit history: How to identify who changed a configuration and when.
Troubleshooting: How to investigate an unsuccessful transaction or configuration issue.

ASK HER: “If Austin asks me to modify an existing Workday business process, can you show me exactly where I would navigate, what I would change, and how I would validate it?”

EXPECTED OUTCOME: You can explain the process of locating, modifying, testing, and promoting a Workday configuration.

2. CORE HCM ORGANIZATIONAL ARCHITECTURE

Priority: CRITICAL | Hands-On Demonstration

Have her walk through:

Supervisory Organizations: Create · Edit · Hierarchies · Manager assignments · Reorganizations.
Companies: Legal entities · Company hierarchy · Country considerations.
Cost Centers: Financial organizations · Assignments · Reporting.
Locations: Work locations · Geographic attributes · Location hierarchies.
Job Profiles: Job families · Job family groups · Job levels · Job classifications.
Positions: Create · Freeze · Close · Manage position restrictions.
Staffing Models: Position Management vs. Job Management.
Worker Types: Employees · Contingent workers · Employment classifications.
Effective Dating: Current, historical, and future-dated transactions.
Organization Assignments: How supervisory organizations, companies, cost centers, and locations relate.

PRACTICAL EXERCISE: Create a supervisory organization, assign a manager, establish a position, and explain how an employee would be hired into that organization.

ASK HER: “If Nscale grows from 1,000 to 10,000 employees across multiple countries, what organizational design decisions should we make now to avoid future rework?”

3. BUSINESS PROCESS FRAMEWORK

Priority: CRITICAL | MOST IMPORTANT SESSION

Have her open an actual Workday business process definition and explain:

Core Configuration

Business Process Definitions: How to locate and edit them.
BP Steps: Initiation · Approval · Review · To Do · Integration · Notifications.
Approval Routing: Manager · HR Partner · Compensation Partner · Security groups.
Condition Rules: When a step executes or is skipped.
Validation Rules: Required data and transaction constraints.
Business Process Security: Who can initiate, approve, or participate.
Notifications: How to configure and trigger them.
Subprocesses: How related business processes interact.
Effective Dating: How transaction dates affect processing.
BP Troubleshooting: Event history · Process status · Failed steps · Stuck approvals.
Rescinding and Correcting: Differences and operational implications.

Core Business Processes to Review

Hire
Change Job
Request Compensation Change
Termination
Onboarding
Transfer
Leave of Absence

PRACTICAL EXERCISE 1 — HIRE

“Show me how to configure a Hire business process with manager approval, HR review, conditional steps, and downstream integration dependencies.”

PRACTICAL EXERCISE 2 — COMPENSATION

“A manager requests a 15% salary increase. Increases above 10% require additional Compensation approval. Walk me through configuring the condition rule, approval step, security, and testing.”

PRACTICAL EXERCISE 3 — REGIONAL ROUTING

“Configure a Hire process where German employees require an additional regional HR approval, but US employees follow the standard process.”

EXPECTED OUTCOME: You can confidently explain BP Definition → Step Configuration → Condition Rules → Security → Testing → Deployment.

4. WORKDAY SECURITY CONFIGURATION

Priority: CRITICAL | Hands-On Demonstration

Have her demonstrate:

Role-Based Security Groups: How roles and organizational constraints determine access.
User-Based Security Groups: Direct user membership.
Domain Security Policies: View and modify access.
Business Process Security Policies: Initiation, approval, and other process permissions.
Constrained vs. Unconstrained Security: Organizational scope.
Integration System Users (ISUs): Dedicated integration identities.
Integration System Security Groups (ISSGs): Integration permissions.
Segregation of Duties: Conflicting permissions.
Sensitive Data: Compensation · Banking · Government IDs · Candidate PII.
Security Policy Activation: How changes become effective.
Security Troubleshooting: Missing access · Excessive access · Incorrect routing.
Security Testing: Test users · Proxy access where permitted · Positive and negative scenarios.
Audit Readiness: Security reviews · Change history · Access certification.

PRACTICAL EXERCISE: Configure a regional HR Partner role so it can access authorized employee records but cannot view restricted compensation information outside its scope.

ASK HER: “What is the exact difference between domain security and business process security, and how would I troubleshoot a user who can view an employee but cannot initiate a Change Job transaction?”

5. CALCULATED FIELDS & CONDITION RULES

Priority: CRITICAL | Likely Technical Follow-Up

Have her explain and demonstrate:
￼
PRACTICAL EXERCISES:

Create a calculated field that retrieves an employee’s manager or supervisory organization.
Create a condition that identifies salary increases greater than 10%.
Create a calculated field used in a custom worker report.
Demonstrate how calculated fields support business process conditions and integration mappings.

ASK HER: “How do I know when to use a delivered field versus a calculated field? How do I choose the correct business object and troubleshoot a calculated field returning no data?”

6. CUSTOM REPORTING & ANALYTICS

Priority: HIGH | Hands-On Demonstration

Have her demonstrate:

Report Types: Standard · Custom · Advanced · Matrix · Composite.
Data Sources: Selecting the appropriate worker or organizational data source.
Business Objects: Primary and related objects.
Fields: Delivered fields vs. calculated fields.
Filters: Worker status · Company · Location · Supervisory organization.
Prompts: User-selectable report parameters.
Security: How domain permissions affect report output.
Report Sharing: Authorized audiences and scheduling.
RaaS: Report-as-a-Service for integrations.
Reporting Performance: Large datasets and efficient filters.

PRACTICAL EXERCISE: Build an Active Workers by Company, Location, and Supervisory Organization report. Add a calculated field, apply security, and explain how it could support an integration.

ASK HER: “If an HR Partner runs a report and sees fewer workers than expected, how would I determine whether the problem is the report filter, data source, or security configuration?”

⸻

PART II — INTEGRATIONS & CONNECTED PEOPLE SYSTEMS

7. WORKDAY INTEGRATION ARCHITECTURE

Priority: CRITICAL | Your Existing Strength

Have her compare:
￼

Have her demonstrate: Integration setup · Field mapping · Authentication · Scheduling · Integration events · Error logs · Monitoring · Retry behavior · Reconciliation.

ASK HER: “For each pattern, when would you choose it, what are its limitations, and how would you troubleshoot a failure?”

8. GREENHOUSE → WORKDAY → ONBOARDING

Priority: CRITICAL | Nscale’s Actual Recruiting Stack

PRACTICAL EXERCISE: Walk through the complete hiring lifecycle.

Greenhouse Offer Accepted → Data Validation → Identity Matching → Workday Pre-Hire/Hire → Identity Provisioning → Payroll/Benefits/IT → Day-One Readiness

Have her cover:

System Ownership: Greenhouse candidate data vs. Workday worker data.
Integration Trigger: Offer accepted · Ready to hire.
Field Mapping: Candidate · Requisition · Position · Supervisory org · Location · Start date.
Pre-Hire Creation: Matching and duplicate prevention.
Hire BP: Required steps and approvals.
Effective Dating: Future-dated hires and downstream timing.
Identity Provisioning: Workday → Okta or other IdP.
Error Handling: Missing fields · Invalid mappings · Failed transactions.
Reconciliation: Confirming successful creation and downstream completion.
Security: Candidate PII and integration identities.

ASK HER: “Show me how you would troubleshoot a candidate whose offer was accepted in Greenhouse but whose Workday hire never completed.”

9. PAYROLL, COMPENSATION & BENEFITS INTEGRATIONS

Priority: HIGH

Have her cover:

Payroll Inputs: Worker status · Compensation · Effective dates · Tax-related data.
Payroll Providers: ADP · UKG · Regional providers.
Compensation: Salary changes · Bonuses · Allowances · Eligibility.
Benefits: Eligibility · Enrollment · Carrier feeds.
Time & Absence: PTO · Leave · Time tracking.
Integration Timing: Scheduled vs. event-driven.
Reconciliation: Missing workers · Incorrect pay data · Duplicate transactions.
Global Payroll: Country-specific requirements and local providers.

PRACTICAL EXERCISE: An employee receives a promotion and salary increase effective next month. Show how Workday records the change and how the downstream payroll integration receives the correct effective-dated data.

⸻

PART III — PLATFORM RELIABILITY, TROUBLESHOOTING & GOVERNANCE

10. WORKDAY RELEASE MANAGEMENT

Priority: HIGH | Your Existing Strength

Have her walk through:

Workday Major Releases: R1/R2 release cycles.
Sandbox Preview: Testing upcoming functionality.
Release Notes: Identifying relevant changes.
Impact Analysis: BPs · Security · Reports · Integrations.
Regression Testing: Hire · Change Job · Termination · Compensation.
Integration Validation: EIB · Studio · APIs · Vendor connections.
Feature Adoption: Optional functionality and configuration changes.
Change Management: Stakeholder communication and approvals.
Production Readiness: Acceptance criteria and operational monitoring.
Recovery: What can be corrected, reverted, or remediated after a release.

ASK HER: “Show me the actual workflow an experienced Workday administrator follows to prepare for a major Workday release.”

11. WORKDAY TROUBLESHOOTING — LIVE SCENARIOS

Priority: CRITICAL | Have Her Quiz You

Ask her to demonstrate how she would investigate these scenarios:

￼

MOST IMPORTANT QUESTION: “What exact Workday tasks, reports, and event details would you inspect first for each failure?”

⸻

PART IV — PRODUCT OWNERSHIP & AI-NATIVE HR

12. CONFIGURE VS. EXTEND VS. INTEGRATE VS. BUILD

Priority: HIGH

Have her walk through three decisions:

Scenario A: HR wants an additional approval step for compensation changes.
Expected Approach: Workday BP configuration and condition rules.

Scenario B: Managers need a custom employee experience closely connected to Workday data.
Expected Approach: Evaluate Workday Extend.

Scenario C: Nscale wants an AI assistant coordinating onboarding across Greenhouse, Workday, IT, and payroll.
Expected Approach: Evaluate delivered capabilities, Orchestrate, APIs, and external AI services.

ASK HER: “What can Workday handle natively, what requires Extend, and when would you recommend an external application?”

13. WORKDAY AI, EXTEND & ORCHESTRATE

Priority: HIGH | Directly Relevant to Austin’s Vision

Have her explain:

Workday Extend: Custom application capabilities and limitations.
Workday Orchestrate: Integration and workflow orchestration.
Workday AI Capabilities: Relevant native AI functionality and availability.
AI Agent Integration: How agents securely access Workday data and transactions.
Authorization: Workday security vs. external agent permissions.
Human Approval: Sensitive employee and compensation changes.
Auditability: Tracking agent decisions and actions.
Governance: PII protection, data minimization, and evaluations.

PRACTICAL EXERCISE: Design an AI-powered new-hire readiness agent using Greenhouse, Workday, identity provisioning, and IT workflows.

ASK HER: “If we were designing an AI-native HR function today, which Workday capabilities would you use, and which would you build outside the platform?”

14. GLOBAL WORKDAY ARCHITECTURE

Priority: HIGH | Nscale Growth Scenario

SCENARIO: Design Workday for 1,000 employees today and 10,000 globally.

Have her walk through:

Global Organizations: Supervisory orgs · Companies · Cost centers · Locations.
Staffing Models: Position Management vs. Job Management.
Job Architecture: Profiles · Families · Levels.
Regional Business Processes: Country-specific conditions and approvals.
Security: Regional HR access · Sensitive data · Segregation of duties.
Payroll: Multiple countries and providers.
Data Governance: Worker identifiers · Effective dating · Reporting standards.
Integrations: Reusable patterns for new countries and vendors.
Scalability: Avoiding unnecessary customization and configuration debt.

ASK HER: “What are the five most expensive Workday configuration mistakes companies make when scaling globally?”

⸻

PART V — INTERVIEW SIMULATION

15. MOCK TECHNICAL INTERVIEW — 20 QUESTIONS

Priority: CRITICAL | Final 30–45 Minutes of Coaching

Ask her to interview you as if she were Austin.

CORE HCM & CONFIGURATION

How hands-on are you with Workday? What have you personally configured?
Explain the difference between supervisory organizations, companies, and cost centers.
When would you choose Position Management vs. Job Management?
Walk me through configuring a Hire business process.
How would you configure a 15% salary increase requiring approval above 10%?
Explain condition rules, calculated fields, and business process routing.
What’s the difference between domain security and BP security?
How would you troubleshoot an HR Partner who cannot access an employee record?

INTEGRATIONS & RELIABILITY
9. Walk me through Greenhouse → Workday → Identity/Payroll.
10. When would you use EIB, Studio, APIs, or RaaS?
11. How would you troubleshoot a failed Workday integration?
12. How would you prevent duplicate hires and incorrect employee data?
13. How would you manage Workday R1/R2 releases?

ARCHITECTURE & PRODUCT
14. How would you design Workday for 10,000 global employees?
15. When would you configure, Extend, integrate, or build?
16. How would you prioritize a People Systems roadmap?
17. What would your first 90 days look like?

————



PRIORITY 1 — WORKDAY CONFIGURATION (40%)

Core HCM: Supervisory Organizations · Staffing Models · Job Profiles · Companies · Cost Centers.

Business Processes: Hire · Change Job · Termination · Compensation · Approval Routing · Condition Rules.

Security: Role-Based Groups · Domain Security · BP Security · Integration Security.

Reporting: Calculated Fields · Advanced Reports · RaaS.

Practice: Explain how to configure a Hire BP and a conditional compensation approval


1. TOP 15 MOST LIKELY QUESTIONS — RANKED

￼
2. WORKDAY CONFIGURATION — MOST IMPORTANT TECHNICAL QUESTIONS

Austin previously worked as a Workday consultant, served as a Workday product owner at Meta, and holds a Workday PRO: HCM certification.

He will likely recognize the difference between someone who has configured Workday and someone who has primarily tested or integrated it.

EXPECT THESE QUESTIONS

Q1. “What Workday modules have you worked with directly?”

PREPARE: Core HCM · Talent · Recruiting · Compensation · Payroll integrations · EIB · Studio · Security validation · Tenant release testing.

YOUR ANGLE: Clearly distinguish direct execution, architecture ownership, and validation responsibilities.

Q2. “Have you personally configured Workday business processes?”

PREPARE: BP definitions · Approval steps · Condition rules · Security groups · Routing · Testing.

YOUR ANGLE: Explain your actual level of involvement without suggesting you’ve personally performed configuration tasks that you haven’t.

Q3. “How would you configure a Hire business process?”

PREPARE: Requirements → BP definition → Steps → Condition rules → Security → Testing → Deployment.

Q4. “How would you configure an approval for salary increases above 10%?”

PREPARE: Compensation BP → Percentage calculation → Condition rule → Approval routing → Security → Boundary testing.

Q5. “What’s the difference between domain security and business process security?”

ANSWER: Domain security controls data and functional access. Business process security controls transaction participation and authorization.

Q6. “What’s the difference between Position Management and Job Management?”

ANSWER: Position Management provides position-level staffing control; Job Management generally supports more flexible hiring without independently maintained positions.

Q7. “How would you structure supervisory organizations?”

PREPARE: Management hierarchy · Staffing ownership · Security constraints · BP routing · Reporting relationships.

Q8. “What calculated fields have you built?”

PREPARE: Lookup Related Value (LRV) · Extract Single Instance (ESI) · Extract Multi-Instance (EMI) · Evaluate Expression · Conditional calculations.

IMPORTANT: This is a question where Austin could quickly establish your direct configuration experience. Be ready to explain which calculated fields you’ve personally created versus those you’ve worked with through integrations or testing.

⸻

3. WORKDAY INTEGRATIONS — YOUR STRONGEST TECHNICAL AREA

Your Cornerstone experience includes integration architecture connecting Workday, Greenhouse, Okta, ServiceNow, SAP SuccessFactors, Oracle, UKG, and ADP, with reported 99.9% synchronization accuracy. Jarrett West Resume - Nscale People Systems.pdf

EXPECT THESE QUESTIONS

￼

MOST LIKELY DEEP-DIVE

AUSTIN: “Let’s say a candidate accepts an offer in Greenhouse. Walk me through everything that happens until they’re ready for their first day.”

YOUR ANSWER STRUCTURE:

Greenhouse Offer → Data Validation → Identity Matching → Workday Pre-Hire/Hire → Identity Provisioning → Payroll/Benefits/IT → Reconciliation → Day-One Readiness

KEY DIFFERENTIATOR: Discuss failure handling and recovery, not just the happy path.

10. THE FIVE QUESTIONS I WOULD PRACTICE FIRST

If you only have time to rehearse five answers, make them these:

1. “How hands-on are you with Workday, and what have you personally configured?”

2. “Walk me through how you would integrate Greenhouse with Workday, including failures and reconciliation.”

3. “How would you configure a Workday Hire business process, including security and conditional approvals?”

4. “If you were building an AI-native HR function from scratch, what would you build first and why?”

5. “How would you design Nscale’s People Systems architecture to scale from 1,000 to 10,000 employees?”
