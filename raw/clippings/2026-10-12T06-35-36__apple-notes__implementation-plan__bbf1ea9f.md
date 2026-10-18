---
title: "IMPLEMENTATION PLAN"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p9113
captured_at: 2026-10-12T06:35:36.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: bbf1ea9f746712df3575be0e9d3f784a9952fd2cdb0394880b5ca6795beaa433
---

IMPLEMENTATION PLAN

Transform AVF Into an Autonomous Company Creation and Operating Platform

Project: Autonomous Venture Factory (AVF)
Priority: Strategic / Foundational
Execution Model: Autonomous, evidence-driven, owner-governed
Initial Reference Venture: Fairhome
Long-Term Objective: One human owner operating a portfolio of 10–100 AI-native businesses.

The following implementation plan is designed to be copied directly into a new Codex or Claude Code thread.

⸻

MASTER IMPLEMENTATION DIRECTIVE

1. Mission and Vision

Transform the existing Autonomous Venture Factory (AVF) into a fully integrated platform capable of autonomously discovering, evaluating, creating, launching, operating, optimizing, and scaling real businesses.

The primary objective is to create profitable companies—not simply generate software, business plans, prototypes, or research reports.

AVF must become the central investment, orchestration, and operating platform for a portfolio of AI-native companies.

The owner should be able to:

Discover and evaluate business opportunities.
Review evidence-backed investment recommendations.
Approve investments with defined budgets and permissions.
Authorize AVF to establish and build companies.
Monitor autonomous execution across business and engineering workstreams.
Approve public launches.
Track actual revenue, expenses, profitability, and cash flow.
Oversee multiple operating businesses through one interface.
Scale successful ventures and retire unsuccessful ones.
Continuously improve AVF using lessons learned from every venture.

Core operating principle

One Owner → One AVF → Many Autonomous Businesses

The target is minimal owner involvement while maintaining appropriate financial, legal, security, and operational controls.

⸻

2. System Architecture

AVF must integrate with existing infrastructure rather than creating another software factory.

Proposed architecture

                         OWNER
                           │
                           ▼
                AVF PORTFOLIO DASHBOARD
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
       OPPORTUNITY ENGINE       INVESTMENT ENGINE
              │                         │
              └────────────┬────────────┘
                           ▼
                 INVESTMENT DECISION
                           │
                    OWNER APPROVAL
                           │
                           ▼
              COMPANY CREATION ENGINE
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
 BUSINESS FORMATION    ENGINEERING         GO-TO-MARKET
       │                   │                   │
 LLC / EIN               MyEve               Branding
 Domain                  Relay               SEO
 Banking                 Software Factory    Marketing
 Stripe                  Mission Control     CRM
 Accounting              QA / Evals          Lead Generation
 Legal / Insurance       Deployment          Analytics
       │                   │                   │
       └───────────────────┼───────────────────┘
                           ▼
                 LAUNCH READINESS GATE
                           │
                    OWNER APPROVAL
                           │
                           ▼
                    PUBLIC LAUNCH
                           │
                           ▼
                 VENTURE OPERATOR
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
 CUSTOMER OPERATIONS   PRODUCT OPERATIONS  FINANCIAL OPS
       │                   │                   │
 Support                 Improvements       Revenue
 Onboarding              Bug Fixes          Expenses
 Retention               Releases           Profitability
 Communications          Monitoring         Cash Flow
       │                   │                   │
       └───────────────────┼───────────────────┘
                           ▼
                  PORTFOLIO LEARNING
                           │
                           ▼
                 NEXT VENTURE / SCALE

Responsibilities
￼

Architecture requirement: Inspect the real repositories before assigning integration responsibilities. The table above is a target responsibility model, not a claim that all integrations currently exist.

⸻

3. Phase 0 — Repository Discovery and Architecture Audit

Priority: P0 — Mandatory first phase

Objective

Understand the existing AVF implementation and its integration points before making architectural changes.

Tasks

Locate the AVF repository.
Inspect its source code, architecture, documentation, database schema, API routes, and agent workflows.
Identify existing venture lifecycle models.
Locate existing opportunity discovery and scoring capabilities.
Identify current approval, authorization, and spending controls.
Inspect existing MyEve, Relay, Software Factory, and Mission Control repositories.
Determine supported integration contracts and ownership boundaries.
Identify existing UI components that can be reused.
Establish a baseline of existing tests and application functionality.
Produce an implementation gap analysis.

Deliverables

Current-state architecture.
Integration inventory.
Existing-versus-missing capability matrix.
Dependency map.
Implementation sequencing.
Baseline test results.

Acceptance criteria

No new orchestration infrastructure is introduced without first demonstrating why existing capabilities cannot support the requirement.

⸻

4. Phase 1 — Venture Lifecycle and Domain Model

Priority: P0

Objective

Implement a persistent lifecycle for opportunities and operating companies.

Required lifecycle
DISCOVERED
    ↓
RESEARCHING
    ↓
EVALUATING
    ↓
VALIDATING
    ↓
INVESTMENT_REVIEW
    ↓
APPROVED
    ↓
FORMING
    ↓
BUILDING
    ↓
LAUNCH_REVIEW
    ↓
LAUNCHED
    ↓
OPERATING
    ↓
SCALING / MAINTAINING / PIVOTING
    ↓
EXITED / SHUT_DOWN

Support blocked, failed, deferred, and canceled states without forcing an opportunity into the next stage.

Core entities

Implement or extend existing models for:

Venture
Opportunity
MarketResearch
CompetitorAnalysis
InvestmentEvaluation
EvaluationEvidence
InvestmentDecision
InvestmentAuthorization
Company
CompanyFormation
CompanyLaunchPlan
WorkOrder
ExternalAccount
BusinessAsset
VentureBudget
VentureExpense
RevenueEvent
VentureMetric
LaunchReadiness
OperationalIncident
VentureAgent
AuditEvent

Avoid duplicating existing entities.

Required capabilities

Each venture must have:

Unique identifier.
Business concept.
Target customer.
Market and jurisdiction.
Business model.
Current lifecycle stage.
Investment recommendation.
Approval status.
Budget.
Responsible agents.
Development progress.
Operational readiness.
Revenue and expense records.
Supporting evidence.
Audit history.

Acceptance criteria

Venture records persist across restarts, lifecycle transitions are validated, and every material decision is auditable.

⸻

5. Phase 2 — Opportunity Discovery and Investment Evaluation

Priority: P0

Objective

Enable AVF to identify and rank commercially attractive business opportunities.

Opportunity discovery

Support research into:

Existing profitable software categories.
Underserved vertical SaaS markets.
Expensive enterprise software.
Manual business workflows.
Legacy applications.
AI automation opportunities.
Small, recurring customer problems.
Businesses suitable for one-person ownership.

Integrate REA where installed, supported, and appropriate for authorized software analysis.

Evaluation framework

Implement weighted scoring across:
￼

Weights must be configurable.

Evidence requirements

Every investment evaluation must distinguish:

Verified facts.
External source claims.
Estimates.
Assumptions.
Unknowns.

Record confidence, source freshness, and falsification criteria.

Investment outcomes

GO: Evidence supports investment.
VALIDATE: Additional experiments required.
PIVOT: Alternative business model recommended.
NO-GO: Opportunity fails investment requirements.
DEFER: Opportunity is promising but not currently actionable.

Acceptance criteria

AVF can evaluate an opportunity, generate a defensible recommendation, and explain the supporting evidence.

⸻

6. Phase 3 — Owner Investment Authorization

Priority: P0 — Critical governance capability

Objective

Allow the owner to approve a venture once and authorize continued execution within clearly defined boundaries.

Investment Authorization Contract

Each approval must record:
venture_id: fairhome

investment:
  status: approved
  approved_by: owner
  approved_at: null

budget:
  initial_capital: owner_defined
  monthly_operating_limit: owner_defined
  per_transaction_limit: owner_defined
  paid_marketing_limit: owner_defined

permissions:
  local_development: true
  automated_testing: true
  research: true
  create_workorders: true

  purchase_domain: false
  submit_llc_formation: false
  open_bank_account: false
  activate_payment_processing: false
  launch_publicly: false

  deploy_to_staging: true
  deploy_to_production: false

controls:
  require_verified_evidence: true
  enforce_budget_limits: true
  require_independent_verification: true
  maintain_audit_trail: true
  stop_on_authorization_expiry: true

This is an illustrative contract, not an actual Fairhome approval.

Required features

Owner approval UI.
Permission-scoped execution.
Budget enforcement.
Authorization expiry.
Approval revocation.
Approval history.
Human intervention queue.
Automatic continuation after authorized actions.
Idempotency protection.
Approval binding to the exact scope and version of the proposed action.

Acceptance criteria

AVF cannot execute restricted actions without valid authorization, but routine authorized execution continues without repeated prompts.

⸻

7. Phase 4 — Autonomous Company Creation Engine

Priority: P0

Objective

Create a reusable engine that coordinates the establishment of a real company after investment approval.

The engine must generate a Company Launch WorkOrder containing every required business, technical, legal, operational, and commercial activity.

4.1 Business Formation Agent

Responsibilities:

Business name availability research.
Entity structure analysis.
State-of-formation comparison.
LLC formation preparation.
Registered-agent requirements.
EIN application preparation.
Business licensing research.
Insurance requirements.
Operating agreement preparation.
Compliance calendar.
Banking onboarding preparation.

External filing and attestations must use supported providers and appropriate owner authorization.

4.2 Brand and Domain Agent

Responsibilities:

Company naming.
Domain availability.
Trademark screening.
Brand positioning.
Visual identity.
Domain purchasing workflow.
DNS configuration.
Business email.
Brand asset management.

Domain purchase must use an authorized registrar integration and an approved budget.

4.3 Financial Infrastructure Agent

Responsibilities:

Stripe account onboarding.
Payment configuration.
Billing models.
Invoicing.
Refund workflows.
Revenue reconciliation.
Accounting integration.
Expense tracking.
Financial reporting.

AVF should distinguish account creation, configuration, verification, and payment activation.

A configured Stripe integration is not equivalent to an activated merchant account.

4.4 Customer Infrastructure Agent

Responsibilities:

CRM provisioning.
Lead capture.
Customer profiles.
Sales pipeline.
Email workflows.
Customer onboarding.
Support ticketing.
Customer communications.
Customer lifecycle analytics.

4.5 Legal and Compliance Agent

Responsibilities:

Jurisdiction-specific requirements.
Professional licensing dependencies.
Privacy policy preparation.
Terms of service preparation.
Customer agreement preparation.
Data retention requirements.
Consent management.
Regulatory calendar.
Professional review coordination.

Acceptance criteria

The Company Creation Engine can generate, execute, track, and verify a complete company formation workflow.

External actions must have authoritative receipts. Uncompleted provider actions remain pending rather than being marked successful.

⸻

8. Phase 5 — MyEve, Relay, and Software Factory Integration

Priority: P0

Objective

Enable AVF to delegate approved product development through the existing engineering infrastructure.

Integration workflow

AVF
 │
 ▼
Approved Venture
 │
 ▼
Product Requirements
 │
 ▼
Company Launch WorkOrder
 │
 ▼
Existing Coordination / Routing Infrastructure
 │
 ├── MyEve
 │
 ├── Relay
 │
 ├── Software Factory
 │
 └── Mission Control
 │
 ▼
Engineering Execution
 │
 ▼
Independent Verification
 │
 ▼
Evidence + Receipts
 │
 ▼
AVF Development Dashboard

The exact handoff sequence must be determined by repository inspection.

Required WorkOrder fields

Venture ID.
Business objective.
Product requirements.
Technical scope.
Design specifications.
Acceptance criteria.
Budget.
Security requirements.
Verification requirements.
Target environment.
Dependencies.
Approval scope.
Evidence requirements.

Required integrations

WorkOrder dispatch.
Execution status.
Agent assignment.
Task dependencies.
Failure reporting.
Retry handling.
Verification receipts.
Build artifacts.
Deployment readiness.
Release approvals.

Acceptance criteria

An approved venture can generate a real engineering WorkOrder, dispatch it through supported infrastructure, and receive independently verifiable completion evidence.

⸻

9. Phase 6 — Autonomous Product and Infrastructure Builder

Priority: P0

Objective

Build reusable templates for the technical foundation of new businesses.

Standard venture template

Every company should be able to provision:

Marketing website.
Customer application.
Admin dashboard.
Authentication.
Database.
Secure file storage.
CRM.
Payment integration.
Transactional email.
Analytics.
Error monitoring.
Logging.
Customer support.
SEO infrastructure.
Deployment pipelines.
Automated tests.

Architecture requirements

Shared factory infrastructure.
Isolated venture environments.
Isolated secrets.
Isolated customer data.
Per-venture cost attribution.
Reusable components.
Configurable branding.
Independent deployment.
Centralized operational visibility.

Acceptance criteria

AVF can initiate creation of a new business application using reusable templates without manually rebuilding common infrastructure.

⸻

10. Phase 7 — Autonomous Marketing and Customer Acquisition

Priority: P1

Objective

Enable newly created businesses to attract and convert customers.

Marketing Agent capabilities

SEO

Keyword research.
Technical SEO.
Metadata.
Structured data.
Sitemap generation.
Search indexing workflows.
Search performance reporting.

Content

Landing pages.
Educational articles.
Comparison pages.
Email campaigns.
Customer FAQs.
Conversion copy.

Growth

Referral programs.
Conversion experiments.
Funnel analysis.
Lead qualification.
Campaign attribution.
Customer acquisition reporting.

Paid marketing

Campaign planning.
Budget allocation.
Performance monitoring.
Cost-per-lead analysis.
Cost-per-customer analysis.

Paid campaigns must operate within approved budgets and applicable advertising requirements.

Acceptance criteria

AVF can prepare and operate authorized marketing workflows, measure acquisition performance, and attribute results to individual ventures.

⸻

11. Phase 8 — Autonomous Venture Operator

Priority: P1

Objective

Operate launched businesses with minimal owner involvement.

Venture Operator responsibilities

Customer operations

Customer onboarding.
Support requests.
Account management.
Customer notifications.
Retention workflows.
Escalation handling.

Product operations

Bug identification.
Feature prioritization.
Development requests.
Automated testing.
Release monitoring.
Product analytics.

Financial operations

Revenue reconciliation.
Expense monitoring.
Profitability reporting.
Cash-flow forecasting.
Payment failure monitoring.
Refund handling.

Business operations

Compliance monitoring.
Vendor monitoring.
Operational incidents.
Service-level reporting.
Performance optimization.

Agent autonomy levels

￼

Autonomy levels should be implemented as enforceable permissions, not merely labels.

Acceptance criteria

A launched venture can operate through recurring agent workflows, with financial controls, escalation paths, and verifiable execution records.

⸻

12. Phase 9 — Portfolio Management and Financial Intelligence

Priority: P1

Objective

Provide a centralized financial and operational view across all ventures.

Portfolio dashboard

￼


Rows other than Fairhome are illustrative.

Required financial metrics

Collected revenue.
MRR.
ARR.
Gross margin.
Contribution margin.
Operating expenses.
Cash flow.
Customer acquisition cost.
Customer lifetime value.
Churn.
Payback period.
Capital invested.
Runway.
Return on invested capital.
Human oversight hours.

Distinguish accrual, cash, projected, and realized metrics.

Investment recommendations

AVF should recommend:

INVEST.
VALIDATE.
BUILD.
LAUNCH.
SCALE.
MAINTAIN.
PIVOT.
SHUT DOWN.

Recommendations should use configurable financial and operational thresholds.

Acceptance criteria

The owner can evaluate the health of the entire portfolio and understand which businesses deserve additional capital.

⸻

13. Phase 10 — Continuous Learning and Venture Intelligence

Priority: P2
Objective: Make AVF more effective, efficient, and profitable after every venture it creates.

AVF must become a continuously improving venture creation platform.

Every company created, every experiment performed, every dollar invested, and every operational outcome should improve future investment decisions and execution.

The goal is to create a compounding intelligence advantage.

Venture #50 should be cheaper, faster, and more likely to succeed than Venture #1.

13.1 Learning System

AVF must systematically capture:

Opportunity evaluation accuracy.
Forecast-versus-actual financial performance.
Development costs.
Time to MVP and launch.
Customer acquisition costs.
Pricing experiments.
Product adoption and retention.
Customer support workload.
Agent execution failures.
Regulatory and compliance incidents.
Infrastructure and operational expenses.
Human intervention requirements.
Reasons ventures succeed, pivot, or fail.

All observations must be attributable to a specific venture, experiment, period, and evidence source.

13.2 Required Capabilities

A. Reusable Venture Playbooks

Create standardized playbooks for:

B2B SaaS businesses.
B2C subscription businesses.
Usage-based software businesses.
AI-native service businesses.
Marketplace businesses.
Success-fee businesses.
Regulated professional services.
Vertical SaaS microbusinesses.
API and developer-tool businesses.
AI-powered automation businesses.

Each playbook should contain:

Recommended business model.
Typical infrastructure.
Required integrations.
Common regulatory dependencies.
Acquisition strategies.
Pricing experiments.
Development templates.
Operational workflows.
Financial models.
Evaluation suites.
Launch readiness criteria.

Playbooks must distinguish reusable patterns from assumptions requiring validation.

B. Financial Forecast Calibration

AVF should continuously compare projected and actual performance.

Example:

￼

Illustrative figures.

Use these differences to improve future forecasts.

Required functionality:

Historical forecast snapshots.
Actual financial observations.
Variance calculations.
Forecast confidence.
Assumption tracking.
Model calibration.
Comparable venture analysis.

Never overwrite an original forecast when updating projections.

C. Cross-Venture Intelligence

AVF should identify patterns across its portfolio.

Examples:

Which industries produce the highest contribution margins?
Which customer acquisition channels perform best?
Which business models require the least human intervention?
Which software architectures minimize operating expenses?
Which agent workflows consistently fail?
Which pricing strategies improve retention?
Which types of ventures reach profitability fastest?

AVF should use these observations to recommend improvements.

D. Agent Performance Evaluation

Evaluate every participating agent and execution system.

Metrics should include:

Task completion rate.
First-attempt success rate.
Retry frequency.
Execution cost.
Execution duration.
Verification pass rate.
Human escalation frequency.
Defect escape rate.
Evidence quality.
Financial impact.

Use these evaluations to improve routing and workflow design.

Do not optimize solely for speed or token consumption.

E. Knowledge Freshness

Every research finding and reusable recommendation should include:

Source.
Collection timestamp.
Last verification timestamp.
Confidence.
Applicable jurisdiction or market.
Expiration or revalidation policy.
Dependencies.
Superseding evidence.

Regulatory, pricing, and competitor information must be refreshed when it becomes stale.

13.3 Continuous Learning Workflow
VENTURE EXECUTION
       │
       ▼
CAPTURE OBSERVATIONS
       │
       ▼
NORMALIZE EVIDENCE
       │
       ▼
COMPARE FORECASTS TO ACTUALS
       │
       ▼
IDENTIFY PATTERNS
       │
       ▼
GENERATE IMPROVEMENT HYPOTHESES
       │
       ▼
RUN CONTROLLED EXPERIMENTS
       │
       ▼
INDEPENDENT VERIFICATION
       │
       ▼
UPDATE APPROVED PLAYBOOKS
       │
       ▼
IMPROVE FUTURE VENTURES

Learning recommendations must not automatically weaken financial, regulatory, security, or approval controls.

13.4 Acceptance Criteria

Every venture produces structured learning records.
Forecasts remain historically reproducible.
Actual results can be compared with original assumptions.
Reusable playbooks are versioned.
Learning recommendations include supporting evidence.
Agent performance can be compared across ventures.
Stale evidence is identified.
Cross-venture learning cannot expose another venture’s protected customer information.
Updated playbooks pass regression evaluations.
AVF can explain why a recommendation changed.

⸻

14. Phase 11 — Autonomous Portfolio Management

Priority: P1
Objective: Enable one owner to manage dozens of independently operated companies through a centralized portfolio.

This is the foundation of the one-person holding-company model.

14.1 Portfolio Dashboard

Build an agent-native portfolio management interface.

Required portfolio views

Portfolio Overview

Display:

Total ventures.
Opportunities under evaluation.
Approved ventures.
Companies under construction.
Launched companies.
Revenue-generating companies.
Profitable companies.
Ventures requiring intervention.
Ventures recommended for expansion.
Ventures recommended for termination.

Financial Overview

Display:

Actual collected revenue.
MRR and ARR where applicable.
Gross margin.
Contribution margin.
Operating profit.
Cash balance.
Cash burn.
Working capital requirements.
Capital invested.
Return on invested capital.
Revenue growth.
Customer acquisition cost.
Customer lifetime value.
Churn and retention.

Operational Overview

Display:

Active agents.
Running workflows.
Open WorkOrders.
Pending approvals.
Failed tasks.
Human intervention hours.
Customer support escalations.
Compliance deadlines.
Production incidents.
Launch blockers.

14.2 Venture Investment Recommendations

AVF should continuously evaluate every venture.

Supported recommendations:

￼

Recommendations must include:

Financial evidence.
Operational evidence.
Confidence.
Principal risks.
Expected benefits.
Required investment.
Opportunity cost.
Suggested next action.

Material capital allocation, entity dissolution, and shutdown decisions remain subject to owner authorization.

14.3 Capital Allocation Engine

AVF should recommend how to allocate limited investment capital.

For example:

￼

Illustrative allocations, not approved budgets.

The engine should consider:

Expected risk-adjusted return.
Evidence confidence.
Available capital.
Cash-flow timing.
Portfolio concentration.
Human oversight requirements.
Regulatory exposure.
Time to revenue.
Downside risk.
Alternative uses of capital.

AVF should not allocate more than the owner’s authorized investment envelope.

14.4 Profit per Human Hour

Introduce a portfolio-wide metric:

Owner Attention Efficiency = Net operating contribution ÷ owner hours spent

Track both:

Owner hours.
Total human hours, including employees and contractors.

A venture requiring substantial professional labor may still be attractive, but its operating model should not be represented as fully autonomous.

Acceptance Criteria

Portfolio financial data is traceable to authoritative records.
Revenue projections are separate from actual collections.
Venture-level and consolidated financial metrics reconcile.
Owner attention is measurable.
Investment recommendations explain their reasoning.
Portfolio actions respect venture-specific authorization.
AVF supports at least 100 simulated ventures without cross-venture data leakage.
Dashboard calculations pass deterministic financial tests.

⸻

15. Phase 12 — Autonomous Growth and Customer Acquisition

Priority: P1
Objective: Give every launched venture a repeatable, measurable customer acquisition system.

Building software is not the same as building a business.

AVF must develop the capability to attract customers, convert demand into revenue, and improve customer retention.

15.1 Growth Agent Architecture

Create a reusable Growth Operations capability.

Suggested logical agents:
￼

These are logical roles, not necessarily nine separate running agents.

Reuse existing orchestration and model-routing capabilities.

15.2 Automated Marketing Infrastructure

Each approved venture should be able to provision:

Marketing website.
Analytics.
Search Console integration.
Sitemap generation.
Structured metadata.
Conversion events.
CRM integration.
Email templates.
Customer segmentation.
Lead attribution.
Campaign reporting.
Experiment tracking.

AVF should distinguish completed configuration from confirmed indexing, traffic, or conversions.

15.3 Autonomous Growth Experiments

AVF should support controlled experiments.

Examples:

Landing page headline A/B testing.
Pricing presentation.
Customer onboarding.
Email conversion.
Referral incentives.
SEO content strategy.
Lead qualification.
Paid acquisition within approved budgets.

Every experiment requires:

Hypothesis.
Primary metric.
Guardrail metrics.
Budget.
Start and end conditions.
Sample-size or stopping rationale.
Measurement method.
Decision rule.
Results.
Evidence.

Do not allow agents to declare a winning experiment from insufficient data.

15.4 Revenue Attribution

AVF should connect:

MARKETING CHANNEL
       ↓
WEBSITE VISITOR
       ↓
QUALIFIED LEAD
       ↓
CUSTOMER
       ↓
DELIVERED SERVICE
       ↓
COLLECTED REVENUE
       ↓
CONTRIBUTION PROFIT

For Fairhome, distinguish:

Website visitors.
Address searches.
Eligible properties.
Qualified appeal opportunities.
Signed customers.
Filed appeals.
Successful appeals.
Verified savings.
Invoiced fees.
Collected fees.

A signed customer is not equivalent to earned revenue.

Acceptance Criteria

Every venture can configure conversion tracking.
Marketing activity is attributable to the correct venture.
Paid campaigns cannot exceed authorized spending.
Content publication follows applicable review requirements.
Analytics reconcile with CRM and revenue records.
Experiments preserve their original hypotheses.
Growth agents cannot fabricate testimonials, customer outcomes, or performance metrics.
AVF can identify channels producing positive contribution margin.

⸻

16. Phase 13 — Autonomous Business Operations

Priority: P1
Objective: Operate launched companies with minimal owner involvement.

16.1 Venture Operator

Introduce a reusable Venture Operator capability.

Every operating business should have a logical AI operating team responsible for:

Monitoring business performance.
Managing routine customer workflows.
Identifying operational problems.
Coordinating support.
Tracking financial performance.
Recommending improvements.
Dispatching product work.
Monitoring compliance obligations.
Escalating exceptional decisions.

The Venture Operator should coordinate existing systems rather than independently bypassing their controls.

16.2 Operational Workflow Engine

Support configurable business workflows.

Example: Fairhome.

NEW CUSTOMER
      ↓
PROPERTY LOOKUP
      ↓
ELIGIBILITY SCREENING
      ↓
SAVINGS ANALYSIS
      ↓
CUSTOMER AUTHORIZATION
      ↓
EVIDENCE PREPARATION
      ↓
PROFESSIONAL REVIEW
      ↓
APPEAL SUBMISSION
      ↓
HEARING / COUNTY PROCESS
      ↓
OUTCOME VERIFICATION
      ↓
SUCCESS-FEE BILLING
      ↓
COLLECTION
      ↓
ANNUAL REVIEW

Each step must have:

Defined inputs.
Responsible actor.
Preconditions.
Execution permissions.
Evidence requirements.
Success criteria.
Failure handling.
Retry policy.
Escalation rules.
Audit events.

16.3 Customer Support Automation

Implement reusable customer support infrastructure.

Capabilities:

Knowledge-grounded responses.
Customer account lookup.
Case-status explanations.
Document requests.
Appointment coordination.
Billing questions.
Support ticket creation.
Escalation routing.
Customer satisfaction measurement.

Agents must not invent case status or claim an external action occurred without confirmation.

16.4 Operational Exception Management

AVF should automatically handle recoverable failures.

Examples:

Temporary API failures.
Retryable workflow errors.
Missing optional data.
Expired internal jobs.
Noncritical synchronization failures.

Escalate:

Financial disputes.
Material customer complaints.
Professional judgment requirements.
Regulatory incidents.
Security incidents.
Unauthorized actions.
Budget exceptions.
Unresolved production failures.

16.5 Autonomous Product Improvement

Venture Operators should identify product improvements from:

Customer feedback.
Support tickets.
Analytics.
Conversion funnels.
Production incidents.
Operational bottlenecks.
Competitive developments.

Approved improvements should become structured engineering WorkOrders.

Route implementation through MyEve, Relay, and Software Factory according to their verified responsibilities.

Independent verification remains mandatory.

Acceptance Criteria

Venture Operators run with venture-scoped permissions.
Operational workflows survive interruptions and restarts.
External actions use idempotency and reconciliation.
Support agents retrieve authoritative customer information.
Professional decisions are routed appropriately.
Financial actions are auditable.
Operational exceptions have defined escalation policies.
Product improvements use existing factory governance.
A simulated venture can operate through a complete customer lifecycle.

⸻

17. Phase 14 — Company Formation and External Service Automation

Priority: P0
Objective: Enable AVF to coordinate the administrative work required to establish a real business.

This is one of the most important differences between a software factory and a company factory.

17.1 Company Formation Workflow

AVF should support:

Business name research.
Entity structure evaluation.
State-of-formation analysis.
Registered-agent selection.
Formation document preparation.
Filing fee estimation.
Owner approval and required signatures.
Authorized filing submission.
Confirmation retrieval.
Entity record storage.
EIN application assistance.
Business licensing analysis.
Annual compliance tracking.

Use supported official or authorized service-provider integrations.

Do not represent an entity as legally formed until authoritative confirmation exists.

17.2 Domain and Brand Provisioning

Capabilities:

Domain availability checks.
Trademark conflict screening.
Domain price comparison.
Domain purchase authorization.
Registration.
DNS provisioning.
SSL configuration.
Business email setup.
Brand asset generation.
Website deployment configuration.

Record:

Registrar.
Domain.
Purchase date.
Renewal date.
Annual cost.
Ownership.
DNS configuration.
Renewal status.

The owner or approved legal entity must retain control of critical accounts.

17.3 Stripe and Revenue Infrastructure

Create a reusable payment-provider onboarding workflow.

For Stripe, support:

Account creation or connection.
Business profile preparation.
Product and pricing configuration.
Payment method configuration.
Webhook setup.
Billing workflows.
Refund policies.
Tax configuration.
Reconciliation.
Operational monitoring.

Required identity verification, beneficial ownership attestations, and bank authorization must be completed by the appropriate authorized person.

AVF should prepare information and track completion rather than fabricate or bypass verification.

17.4 CRM Provisioning

AVF should provision a venture-specific CRM configuration.

Minimum capabilities:

Leads.
Customers.
Opportunities.
Pipeline stages.
Activities.
Communications.
Documents.
Tasks.
Attribution.
Reporting.
Customer lifecycle automation.

Prefer reusable CRM adapters and templates.

Do not assume every venture requires a separate commercial CRM subscription.

17.5 Banking and Accounting

Support:

Banking provider comparison.
Application preparation.
Account verification tracking.
Accounting system setup.
Chart of accounts.
Revenue classification.
Expense tracking.
Invoice reconciliation.
Cash-flow forecasting.
Tax-document organization.
Financial reporting.

External banking transactions must follow explicit financial authority.

Acceptance Criteria

Company formation workflows track authoritative status.
Domain ownership is verifiable.
Payment accounts have distinct sandbox and live states.
CRM records are venture-isolated.
Financial account credentials are securely managed.
External actions are idempotent where supported.
Legal and financial attestations require the correct actor.
Every external service has a recoverable provisioning state.
Failed provisioning cannot produce false readiness.

⸻

18. Phase 15 — Security, Governance, and Financial Controls

Priority: P0
Objective: Make autonomous company creation safe, auditable, and financially controlled.

18.1 Investment Authorization Contract

Every approved venture must have a structured authorization contract.

Example:

{
  "venture_id": "fairhome",
  "investment_status": "approved",
  "authorization_version": 1,
  "budget": {
    "initial_limit_usd": 2500,
    "monthly_limit_usd": 500
  },
  "permissions": {
    "research": true,
    "local_development": true,
    "testing": true,
    "domain_purchase": false,
    "company_formation_submission": false,
    "stripe_configuration": true,
    "paid_marketing": false,
    "public_launch": false
  },
  "approval_requirements": {
    "legal_filings": true,
    "banking": true,
    "public_launch": true,
    "material_contracts": true
  }
}

Illustrative contract only. No budget or permission is approved by this example.

18.2 Authorization Binding

Every consequential action must bind to:

Venture identifier.
Authorization version.
Authorized actor.
Action type.
Resource.
Budget.
Approval


13. Phase 10 — Continuous Learning and Venture Intelligence

Priority: P2
Objective: Make AVF more intelligent, efficient, and profitable after every venture it evaluates, builds, launches, and operates.

AVF must not treat each venture as an isolated project.

Every business should contribute knowledge that improves future opportunity selection, investment decisions, engineering efficiency, customer acquisition, and autonomous operations.

The goal is to create a compounding venture intelligence system.

13.1 Learning System

Capture structured information across the entire venture lifecycle.

￼

All records should include timestamps, source provenance, venture identifiers, and confidence or verification status.

13.2 Venture Knowledge Graph

Implement a shared knowledge system connecting:

Venture → Market → Customer Segment → Problem → Competitor → Business Model → Experiment → Outcome → Learning

Example:

VENTURE: Fairhome
    │
    ├── Industry: Property Technology
    │
    ├── Business Model: Success-Fee Services
    │
    ├── Customer: Residential Property Owners
    │
    ├── Acquisition: Organic Search
    │
    ├── Experiment: Landing Page Conversion
    │       │
    │       └── Result: Measured Conversion Rate
    │
    ├── Operational Experiment
    │       │
    │       └── Result: Actual Human Minutes Per Case
    │
    └── Learning
            │
            └── Reusable Across Similar Ventures

The knowledge graph should support queries such as:

Which business models have produced the highest contribution margins?
Which customer acquisition channels consistently perform best?
Which industries require the least human intervention?
Which agent configurations deliver the best cost-to-quality ratio?
Which types of ventures reach first revenue fastest?
Which assumptions most frequently cause investment decisions to fail?

Implementation requirement: Reuse existing knowledge infrastructure where available. Do not introduce a new graph database unless current storage and retrieval capabilities are demonstrably insufficient.

13.3 Reusable Venture Playbooks

AVF should automatically generate and maintain playbooks for recurring business patterns.

Initial playbooks:

Micro-SaaS company launch.
AI-native professional services.
Usage-based SaaS.
Subscription-based SaaS.
Success-fee services.
Vertical SaaS.
B2B workflow automation.
Marketplace businesses.
AI-powered document processing.
Local-service lead generation.

Each playbook should include:

Typical customer profile.
Revenue model.
Recommended technical architecture.
Required integrations.
Formation and compliance considerations.
Customer acquisition strategies.
Operating cost benchmarks.
Agent configurations.
Common failure modes.
Recommended evaluations.
Launch checklist.
Financial assumptions and their evidence.

Playbooks must be versioned and continuously updated.

13.4 Forecast Calibration Engine

Compare investment forecasts with actual venture performance.

For each venture, record:

Forecasted revenue
Actual collected revenue

Forecasted customer acquisition cost
Actual customer acquisition cost

Forecasted operating expenses
Actual operating expenses

Forecasted contribution margin
Actual contribution margin

Forecasted time to launch
Actual time to launch

Forecasted human involvement
Actual human involvement

Calculate forecast error and calibration metrics.

Do not automatically modify investment scoring weights based on small or biased samples.

Require sufficient evidence before promoting new scoring models.

Acceptance criteria

Every venture produces structured learning records.
Forecasts can be compared against actual outcomes.
Successful experiments can be reused.
Failed experiments remain discoverable.
Knowledge freshness is tracked.
Recommendations include supporting evidence.
Cross-venture data isolation remains enforced.

⸻

14. Phase 11 — Autonomous Venture Operator

Priority: P1
Objective: Enable AVF to operate launched companies with minimal ongoing owner involvement.

This phase introduces the Venture Operator, a persistent operational capability responsible for coordinating the day-to-day activities of an approved and launched business.

The Venture Operator is not a single unrestricted AI agent.

It is a coordinated set of specialized agents operating under defined permissions, budgets, and business policies.

14.1 Venture Operator Architecture

                 AUTONOMOUS VENTURE FACTORY
                            │
                            ▼
                    VENTURE OPERATOR
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
     REVENUE AGENT     OPERATIONS AGENT   PRODUCT AGENT
          │                 │                 │
      Marketing          Customers        Improvements
      Conversion         Support          Bugs
      Retention          Fulfillment      Features
      Analytics          Compliance       Reliability
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                            ▼
                    FINANCIAL AGENT
                            │
                      Revenue
                      Expenses
                      Cash Flow
                      Profitability
                            │
                            ▼
                     OWNER DASHBOARD

The Venture Operator should coordinate existing factory and agent infrastructure rather than implement a second orchestration engine.

14.2 Revenue Agent

Responsible for improving customer acquisition and revenue generation.

Capabilities:

SEO monitoring.
Search performance analysis.
Landing page optimization.
Conversion funnel analysis.
Content creation.
Customer segmentation.
Email campaign preparation.
Referral program management.
Pricing experiment recommendations.
Customer retention analysis.
Revenue attribution.

The agent may execute approved low-risk marketing changes within its authorization.

Paid advertising, material pricing changes, and regulated marketing claims must respect applicable approval controls.

Revenue Agent KPIs

￼

For success-fee businesses such as Fairhome, track case outcomes and collections rather than assuming conventional SaaS MRR.

14.3 Operations Agent

Responsible for coordinating service delivery and customer operations.

Capabilities:

Customer onboarding.
Document collection.
Workflow scheduling.
Task assignment.
Case tracking.
Customer notifications.
Support triage.
Exception management.
Deadline monitoring.
Operational reporting.
Professional escalation.

Every external action must have:

Explicit authorization.
Idempotency protection where applicable.
Audit records.
Retry policies.
Failure recovery.
Completion verification.

For Fairhome, the Operations Agent should coordinate property tax appeals without independently performing activities reserved for qualified professionals.

14.4 Product Agent

Responsible for identifying product improvements and coordinating engineering work.

Capabilities:

Analyze customer feedback.
Detect recurring defects.
Identify usability problems.
Evaluate feature requests.
Prioritize improvements.
Generate development WorkOrders.
Dispatch work through existing factory infrastructure.
Track implementation.
Request independent verification.
Measure post-release outcomes.

The Product Agent should not deploy unverified changes directly to production.

All changes must follow existing release governance.

14.5 Financial Agent

Responsible for business financial intelligence.

Capabilities:

Revenue reconciliation.
Expense classification.
Budget monitoring.
Cash-flow forecasting.
Contribution margin analysis.
Payment failure detection.
Refund monitoring.
Financial anomaly detection.
Profitability recommendations.
Working capital forecasts.

The agent should distinguish:

Revenue booked ≠ Revenue collected ≠ Profit ≠ Cash available.

Financial records must be reconciled against authoritative payment and accounting systems.

The agent may prepare financial actions, but transfers, tax filings, lending, and other binding financial commitments require explicit authorization.

14.6 Human Attention Optimization

Introduce a new AVF metric:

Owner Attention Efficiency

Owner Attention Efficiency =
Risk-Adjusted Operating Contribution
÷
Owner Hours Required

Track:

Owner approvals.
Manual interventions.
Escalations.
Time spent resolving incidents.
Financial oversight.
Operational decisions.
Customer exceptions.

AVF should recommend automation opportunities based on measurable reductions in human workload.

It must not improve this metric by hiding incidents, skipping required reviews, or understating owner time.

Acceptance criteria

A venture can be assigned an operational agent team.
Agents execute within defined permissions.
Operations continue without unnecessary owner intervention.
Exceptions are surfaced automatically.
Financial performance is visible.
Product improvements route through the software factory.
Every material external action is auditable.

⸻

15. Phase 12 — Autonomous Growth and Portfolio Scaling

Priority: P2
Objective: Enable AVF to scale successful companies and allocate resources across the portfolio.

AVF should treat capital, engineering capacity, compute, and owner attention as scarce resources.

15.1 Portfolio Capital Allocation

For each venture, calculate:

Capital invested.
Revenue collected.
Operating contribution.
Cash burn.
Working capital requirements.
Growth rate.
Customer acquisition efficiency.
Operational risk.
Expected return.
Owner involvement.

AVF should generate recommendations:

￼

Recommendations are not automatically binding investment decisions.

15.2 Autonomous Expansion

Once a venture demonstrates positive economics, AVF should evaluate expansion opportunities.

Examples:

Fairhome

Additional counties.
Additional states.
New homeowner segments.
Property investor portfolios.
Property management partnerships.

Micro-SaaS

Additional customer segments.
New integrations.
Higher-value subscription tiers.
International markets.
White-label partnerships.

Expansion must pass fresh market, regulatory, financial, and operational evaluations.

15.3 Venture Shutdown and Capital Recycling

Not every company should survive.

AVF must support orderly shutdown recommendations.

Triggers may include:

Persistent negative contribution margins.
Unsustainable acquisition costs.
Insufficient customer demand.
Regulatory barriers.
Excessive owner involvement.
Better investment alternatives.
Repeated operational failures.

Shutdown workflows should cover:

Customer notifications.
Contractual obligations.
Refunds.
Data retention and deletion.
Vendor cancellations.
Domain disposition.
Financial reconciliation.
Legal entity closure requirements.
Knowledge capture.

No irreversible shutdown actions should occur without appropriate authorization.

Acceptance criteria

Portfolio-level investment recommendations are generated.
Expansion opportunities are evaluated independently.
Capital allocation is traceable.
Venture shutdown plans are supported.
Portfolio performance can be compared across business models.
Historical decisions remain auditable.

⸻

16. Phase 13 — Agent-Native AVF User Interface

Priority: P1
Objective: Create a unified owner experience for managing an entire portfolio of autonomous companies.

The interface must be agent-native, not simply a traditional dashboard with an AI chatbot added.

Agents should expose their reasoning summaries, evidence, available actions, operational state, and recommended decisions directly through the interface.

Use existing AVF design systems and agent-native patterns where available.

16.1 Portfolio Command Center

The AVF homepage should display:
￼

Illustrative data only.

The dashboard should highlight:

Ventures requiring owner decisions.
Material operational incidents.
Budget exceptions.
Launch blockers.
Revenue performance.
Growth opportunities.
Agent execution status.

16.2 Venture Detail Workspace

Each venture should provide the following views.

Overview: Business concept, market, current stage, financial summary, investment recommendation.

Research: Competitors, market evidence, customer demand, experiments, assumptions.

Investment: Scoring, financial models, forecasts, authorization, capital allocation.

Company Formation: Entity status, registration, EIN, banking, insurance, compliance.

Product: Website, applications, CRM, integrations, engineering progress.

Growth: SEO, campaigns, leads, conversion, acquisition economics.

Operations: Customers, cases, support, agent activity, exceptions.

Financials: Revenue, expenses, contribution margin, cash flow, collections.

Evidence: Verification artifacts, receipts, source provenance, audit history.

Decisions: Owner approvals, rejected proposals, pending authorizations.

16.3 Agent-Native Interactions

Examples:

Find five business opportunities similar to Fairhome with lower regulatory complexity.

Explain why Fairhome’s projected contribution margin decreased.

Show the evidence supporting the recommended launch county.

Prepare Fairhome for launch within the approved budget.

Compare customer acquisition performance across all operating ventures.

Identify which business deserves the next $5,000 investment.

These interactions should invoke real AVF capabilities and produce traceable results.

The interface must distinguish:

Proposed actions.
Authorized actions.
Executing actions.
Verified completed actions.
Blocked actions.
Failed actions.

16.4 Owner Approval Center

Implement a centralized decision queue.

Each approval request should include:

Venture.
Proposed action.
Business justification.
Financial impact.
Risks.
Supporting evidence.
Requested authorization.
Expiration.
Consequences of approval or rejection.

Support:

APPROVE · REJECT · MODIFY · DEFER · REQUEST EVIDENCE

Approvals must bind to the exact action scope, budget, relevant artifacts, and execution conditions.

Material changes should invalidate stale approvals.

Acceptance criteria

Portfolio and venture information is persisted.
Owner decisions are actionable.
Agent activity is inspectable.
Financial data is traceable.
Approval state is enforced by backend controls.
The interface works on desktop and mobile.
No simulated status is presented as actual completion.

⸻

17. Phase 14 — End-to-End Integration With MyEve, Relay, and Software Factory

Priority: P0
Objective: Make AVF the business-level coordinator of the existing autonomous engineering ecosystem.

This is a critical architectural dependency.

Before implementation, inspect the actual capabilities and contracts of each system.

Do not assume the following conceptual responsibilities already match the repositories.

17.1 Target Responsibility Model

￼

AVF should own the business objective.

The existing engineering ecosystem should own the technical execution.

17.2 Company Launch WorkOrder

Define a structured Company Launch WorkOrder.

Example:

{
  "venture_id": "fairhome",
  "objective": "Create a launch-ready property tax appeals business",
  "investment_status": "approved",
  "execution_mode": "autonomous",
  "budget": {
    "currency": "USD",
    "initial_limit": null,
    "monthly_limit": null
  },
  "workstreams": [
    "company_formation",
    "branding",
    "domain",
    "website",
    "crm",
    "payments",
    "marketing",
    "operations",
    "compliance"
  ],
  "engineering": {
    "coordinator": "existing_factory_integration",
    "verification_required": true
  },
  "launch": {
    "public_launch_approved": false,
    "requires_owner_decision": true
  }
}

The example is conceptual. The actual schema must align with existing AVF and factory contracts.
A null budget limit must mean no spending authority, not unlimited spending.
17.3 Integration Requirements
Implement or reuse adapters supporting:
WorkOrder submission.
Execution status retrieval.
Task dependency tracking.
Agent assignment.
Retry handling.
Cancellation.
Budget tracking.
Evidence retrieval.
Independent verification.
Approval state.
Release readiness.
Completion receipts.
17.4 Execution Reliability
Every integration must support:
Idempotency: Repeated requests must not create duplicate work.
Correlation: Every task must be traceable to a venture and authorization.
Recovery: Interrupted workflows must resume safely.
Verification: Completion must be supported by authoritative evidence.
Freshness: Material changes must invalidate affected approvals and verification results.
Isolation: One venture’s execution must not access another venture’s resources without authorization.
Acceptance criteria
AVF can create an authorized engineering WorkOrder.
The existing factory receives it through a supported interface.
AVF can monitor execution.
Verification evidence returns to AVF.
Failed work can be retried safely.
Duplicate dispatches are prevented.
Approval and budget controls are enforced.
No parallel orchestration infrastructure is introduced unnecessarily.

⸻

18. Phase 15 — Fairhome End-to-End Reference Implementation
Priority: P0 Objective: Demonstrate that AVF can transform a researched business opportunity into a launch-ready company.
Fairhome is the first reference venture.
Its purpose is twofold:
Build a commercially viable property tax appeals business.
Validate AVF’s reusable company-building capabilities.
These objectives must remain separately measurable.
18.1 Fairhome Venture Lifecycle

AVF MASTER IMPLEMENTATION PLAN

18. Phase 15 — Fairhome End-to-End Reference Implementation

Priority: P0
Objective: Demonstrate that Autonomous Venture Factory (AVF) can transform a researched business opportunity into a launch-ready company.

Fairhome is the first reference venture.

Its purpose is twofold:

Build a commercially viable property tax appeals business.
Validate AVF’s reusable autonomous company-building capabilities.

These objectives must remain separately measurable.

Fairhome must not become a collection of disconnected prototypes, business plans, or research documents. It must progress toward becoming a legally established, operational business capable of acquiring customers, delivering property tax appeal services, and collecting revenue.

At the same time, AVF must extract reusable capabilities so subsequent companies can be established faster, more economically, and with less human intervention.

⸻

18.1 Fairhome Venture Lifecycle

Implement and validate the complete lifecycle:

DISCOVER → RESEARCH → EVALUATE → INVESTMENT APPROVAL → COMPANY FORMATION → BUILD → VERIFY → LAUNCH APPROVAL → OPERATE → OPTIMIZE → SCALE

Each stage must have defined inputs, outputs, ownership, acceptance criteria, and transition requirements.

￼

Acceptance criterion: Every lifecycle transition is persisted, auditable, and accessible through AVF.

18.2 Fairhome Investment Evaluation

Before initiating external company-formation expenses, AVF must produce a defensible investment recommendation.

Evaluate:

Market demand and addressable customers.
Existing competition.
County-level property tax appeal opportunities.
Customer acquisition costs.
Potential verified savings.
Expected success-fee revenue.
Cost per accepted case.
Cost of unsuccessful appeals.
Professional representation requirements.
Regulatory complexity.
Data acquisition costs.
Time to revenue collection.
Working capital requirements.
AI automation feasibility.
Profitability.
Scalability.

Evaluate at least 10 candidate counties across multiple states.

Select three finalists and recommend one initial launch market.

The recommendation must prioritize:

Fastest realistic path to collected revenue.
Positive contribution margin.
Manageable regulatory complexity.
Reliable access to assessment and sales data.
Availability of qualified professional representation.
Low customer acquisition costs.
High automation potential.

Do not automatically favor Texas or California.

Deliverable: A Fairhome Investment Memorandum containing the recommended launch market, financial scenarios, supporting evidence, principal risks, and investment decision.

18.3 Fairhome Company Formation

After owner investment approval, AVF must coordinate formation of the operating business.

Required workflows:

Business identity

Verify Fairhome name availability.
Research potential trademark conflicts.
Confirm appropriate business entity name.
Establish brand identity and positioning.

Legal entity

Recommend formation jurisdiction.
Prepare LLC formation documents.
Identify registered-agent requirements.
Coordinate filing.
Verify state acceptance.
Store formation evidence.

Tax and financial

Prepare EIN application information.
Coordinate authorized EIN submission.
Prepare business banking requirements.
Configure accounting categories.
Establish venture-specific financial reporting.

Insurance and compliance

Identify applicable professional licensing or registration requirements.
Determine professional liability insurance requirements.
Identify general liability and cybersecurity coverage needs.
Establish document retention requirements.
Define customer authorization requirements.
Establish required professional representation arrangements.

AVF must distinguish between preparation, submission, pending review, and verified completion.

Acceptance criterion: AVF cannot mark Fairhome as legally established until authoritative formation evidence exists.

18.4 Fairhome Digital Infrastructure

AVF must coordinate the establishment of Fairhome’s digital business infrastructure.

Required components:

Domain registration.
DNS configuration.
Business email.
Website hosting.
Application hosting.
Production database.
Secure document storage.
Authentication.
Customer communications.
Analytics.
Monitoring.
Error tracking.
Backup and recovery.
Secrets management.
Access controls.

The domain and brand must remain configurable until availability and ownership are confirmed.

AVF should use existing infrastructure providers and integrations where appropriate.

All credentials must be scoped to Fairhome rather than shared across unrelated ventures.

Acceptance criterion: Infrastructure must be provisioned, tested, monitored, and associated with the correct venture identity.

18.5 Fairhome Website and Customer Experience

Coordinate MyEve, Relay, and Software Factory to develop a production-quality customer experience.

The website must support:

Public experience

Clear value proposition.
Property address entry.
Supported geographic coverage.
Explanation of the appeal process.
Transparent pricing.
Frequently asked questions.
Customer trust information.
Privacy policy.
Terms of service.
Contact and support channels.

Assessment experience

Property identification.
Parcel matching.
Assessment retrieval.
Property characteristics.
Assessment-year selection.
Potential savings analysis.
Evidence confidence.
Missing-information handling.
Eligibility determination.

Customer onboarding

Account creation.
Identity and property ownership verification as required.
Property information confirmation.
Document uploads.
Service agreement.
Professional representation authorization.
Electronic signatures.
Customer communication preferences.

Customer dashboard

Property overview.
Assessment information.
Potential savings.
Appeal eligibility.
Case status.
Required actions.
Documents.
Messages.
Filing confirmation.
Hearing information.
Outcome verification.
Billing.
Annual assessment monitoring.

Acceptance criterion: Every customer-facing workflow must be tested end-to-end using representative data, with simulated behavior clearly separated from live integrations.

18.6 Fairhome CRM and Case Management

AVF must coordinate implementation of a CRM and case management platform.

The system must manage the complete customer lifecycle:

LEAD → PROPERTY CHECK → QUALIFICATION → AUTHORIZATION → CASE PREPARATION → PROFESSIONAL REVIEW → FILING → HEARING → DECISION → SAVINGS VERIFICATION → BILLING → ANNUAL REVIEW

Required CRM capabilities:

Lead capture.
Contact management.
Property records.
Customer communication history.
Lead source attribution.
Conversion tracking.
Customer segmentation.
Automated follow-ups.
Support tickets.
Customer satisfaction tracking.

Required case management capabilities:

Case ownership.
Jurisdiction.
Assessment year.
Filing deadlines.
Required documents.
Evidence status.
Professional assignment.
Review decisions.
Filing status.
Submission receipts.
Hearing schedules.
County communications.
Final decisions.
Savings calculations.
Billing eligibility.
Audit history.

The system must prevent duplicate cases, unauthorized submissions, and unsupported status transitions.

Acceptance criterion: Every case must have an authoritative state, assigned responsibility, supporting evidence, and a complete audit trail.

18.7 Fairhome AI Agent Architecture

Implement specialized agents through existing orchestration infrastructure.

￼

Agents must use structured inputs and outputs.

Every consequential recommendation must retain its evidence and uncertainty.

Professional review and authorization must remain explicit where required.

Acceptance criterion: Agents can execute supported workflows autonomously while respecting permissions, evidence requirements, and human-review boundaries.

18.8 Fairhome Property Assessment Intelligence

Build a reusable property assessment analysis capability.

Required functionality:

Normalize property addresses.
Match addresses to authoritative parcel identifiers.
Retrieve assessment records.
Identify applicable assessment years.
Retrieve relevant historical records.
Obtain permitted comparable-sales data.
Evaluate property characteristics.
Apply jurisdiction-specific assessment rules.
Estimate potential assessment discrepancies.
Estimate potential tax savings.
Generate evidence-backed recommendations.
Flag uncertainty and missing data.

The system must distinguish:

Assessed value.
Market value.
Taxable value.
Exemptions.
Tax rates.
Fixed charges.
Estimated savings.
Verified savings.

Do not treat an automated valuation estimate as definitive evidence of overassessment.

Acceptance criterion: Deterministic calculations and property matching must pass jurisdiction-specific evaluation suites before live use.

18.9 Fairhome Professional Operations

The business must support the professional services required to deliver full-service property tax appeals.

Required workflows:

Professional onboarding.
Credential verification.
Jurisdiction eligibility.
Case assignment.
Professional capacity management.
Evidence review.
Appeal approval.
Filing authorization.
Hearing representation.
Escalation.
Outcome review.
Professional compensation tracking.

AVF must identify which activities require licensed or otherwise authorized professionals in each jurisdiction.

A professional must not be assigned to a case outside their authorized scope.

Acceptance criterion: Fairhome cannot accept a case requiring professional representation unless appropriate operational coverage is available.

18.10 Fairhome Stripe and Revenue Infrastructure

AVF must coordinate establishment of Fairhome’s payment infrastructure.

Required capabilities:

Stripe account onboarding.
Business identity verification.
Bank account connection.
Customer billing profiles.
Success-fee calculation.
Invoice generation.
Payment collection.
Refunds.
Disputes.
Payment reconciliation.
Revenue reporting.
Failed-payment handling.

Billing must follow the agreed service contract.

For example:

Verified tax savings × agreed success-fee percentage = service fee

The system must not invoice customers based solely on projected savings.

Required billing evidence:

Official outcome.
Assessment year.
Savings baseline.
Verified tax impact.
Applicable fee percentage.
Customer agreement.
Invoice calculation.
Payment status.

Acceptance criterion: Every invoice must be traceable to a valid agreement and verified savings calculation.

18.11 Fairhome Marketing and Customer Acquisition

AVF must coordinate the development of a measurable customer acquisition engine.

Required channels:

Organic acquisition

Search engine optimization.
County-specific landing pages.
Educational content.
Property tax appeal guides.
Search indexing.
Technical SEO.
Local search visibility.

Direct acquisition

Email campaigns.
Referral programs.
Real estate partnerships.
Property management partnerships.
Homeowner associations.
Community outreach.

Paid acquisition

Search advertising.
Retargeting.
Landing-page experiments.
Conversion optimization.

Paid campaigns must operate within approved budgets.

Marketing agents must not fabricate customer reviews, savings claims, or success rates.

Required analytics:

Website visitors.
Lead conversion.
Qualified leads.
Accepted cases.
Customer acquisition cost.
Cost per paying customer.
Revenue per customer.
Contribution margin by acquisition channel.
Referral performance.

Acceptance criterion: AVF must attribute customer acquisition costs to actual accepted and paying cases.

18.12 Fairhome Financial Intelligence

Implement a financial model that measures profitability at the case, county, and company levels.

Track:

Screening costs.
Data costs.
Professional review costs.
Hearing costs.
Filing costs.
Customer acquisition costs.
Support costs.
Payment processing costs.
Unsuccessful-case costs.
Collected success fees.
Refunds.
Fixed operating expenses.
Working capital.
Cash flow.
Contribution margin.

The primary financial calculation should be:

Expected collected revenue per accepted case = success probability × average verified savings among successful cases × success-fee percentage × collection rate.

Then:

Expected contribution per accepted case = expected collected revenue − fully allocated variable costs.

AVF must run adverse, base, and favorable scenarios.

Do not use competitor-reported success rates as Fairhome’s own operating assumptions without supporting evidence.

Acceptance criterion: Financial projections must be clearly separated from actual collected revenue and actual expenses.

18.13 Fairhome Operational Evaluations

Create executable evaluations covering:

￼

Use synthetic, historical, and authorized test cases.
Evaluate edge cases, missing data, contradictory records, provider failures, and stale evidence.
Acceptance criterion: Critical safety, authorization, billing, and filing evaluations must pass before public launch.
18.14 Fairhome Launch Readiness
Implement a launch readiness scorecard.
Business readiness
Entity formation verified.
Required registrations completed.
Insurance requirements addressed.
Professional coverage established.
Customer agreements approved.
Pricing approved.
Technical readiness
Production infrastructure operational.
Security evaluations passed.
Customer onboarding functional.
Assessment analysis validated.
CRM operational.
Case management operational.
Billing integration verified.
Monitoring configured.
Backup and recovery tested.
Operational readiness
Professional capacity available.
Filing procedures validated.
Customer support operational.
Escalation procedures established.
Financial reconciliation operational.
Regulatory requirements verified.
Commercial readiness
Initial market selected.
Acquisition channels prepared.
Pricing validated.
Working capital available.
Pilot capacity defined.
Financial success criteria established.
Acceptance criterion: AVF must not classify Fairhome as launch-ready while critical requirements remain unresolved.
18.15 Fairhome First-Revenue Milestone
The first commercial milestone is:
$1,000 in Actual Collected Revenue
This milestone must represent genuine payments collected for successfully delivered services.
It must not include:
Projected revenue.
Estimated tax savings.
Unpaid invoices.
Simulated transactions.
Test payments.
Revenue from unrelated businesses.
Track:
Number of qualified leads.
Number of accepted cases.
Number of completed appeals.
Number of successful outcomes.
Verified customer savings.
Success fees invoiced.
Success fees collected.
Total acquisition costs.
Total delivery costs.
Contribution margin.
Human operating hours.
The milestone is achieved only when authoritative payment records confirm at least $1,000 in collected revenue.
18.16 Fairhome Reference Implementation Exit Criteria
Phase 15 is complete when:
Fairhome exists as a persisted AVF venture.
Its investment evaluation is complete.
Owner investment authorization is recorded.
Company-creation workflows are operational.
MyEve, Relay, and Software Factory integrations are verified.
Business formation status is evidence-backed.
Domain and infrastructure provisioning are tracked.
Website and customer workflows are functional.
CRM and case management are operational.
Professional operations are supported.
Stripe integration is verified.
Marketing infrastructure is prepared.
Financial reporting is operational.
Launch readiness evaluations execute.
AVF can present an evidence-backed launch recommendation.
The owner can approve public launch.
Actual formation, payment activation, and launch remain dependent on required external approvals and verified completion.
Most importantly, reusable AVF capabilities must be extracted from the Fairhome implementation rather than remaining hardcoded to Fairhome.

⸻

19. Phase 16 — End-to-End Factory Orchestration
Priority: P0 Objective: Prove that AVF can coordinate existing engineering and business systems to create a company without manually managing every task.
19.1 Orchestration Responsibilities
AVF owns:
Venture objectives.
Investment authorization.
Business requirements.
Company creation.
Capital allocation.
Business readiness.
Portfolio performance.
MyEve, Relay, Mission Control, and Software Factory should retain their existing verified responsibilities.
Discover their actual interfaces before assigning responsibilities.
19.2 Company Launch WorkOrder
Implement a reusable CompanyLaunchWorkOrder.
Required fields:


This is a conceptual contract. Adapt it to the existing repository schemas rather than creating incompatible infrastructure.

19.3 Parallel Execution

AVF should execute independent workstreams concurrently.

For example:

While Software Factory develops the website, AVF can coordinate:

Business name research.
Domain availability checks.
CRM configuration.
Marketing research.
Accounting preparation.
Customer agreement drafting.
Professional partner research.

Dependency-aware orchestration must prevent downstream tasks from executing prematurely.

19.4 Failure Recovery

Implement:

Durable execution state.
Idempotency keys.
Bounded retries.
Dependency tracking.
Partial completion recovery.
Evidence reconciliation.
Stale authorization detection.
Compensation or manual recovery procedures for partially completed external actions.

Never retry an uncertain external action blindly.

A timeout during domain registration, payment collection, or government filing must trigger status reconciliation before another attempt.

19.5 Acceptance Criteria

The factory must successfully execute a simulated company launch involving multiple parallel workstreams.

Tests must demonstrate:

Correct task routing.
Durable state.
Budget enforcement.
Approval enforcement.
Independent verification.
Failure recovery.
Accurate dashboard status.


AVF MASTER IMPLEMENTATION PLAN

Continuation — Section 20: Production Readiness, Execution Roadmap, and Final Acceptance Criteria

This continues directly after Section 19.5 — Acceptance Criteria. It is intended to be appended to the existing AVF implementation plan and provided to Codex for autonomous execution.

⸻

20. Phase 17 — Production Readiness and Operational Hardening

Priority: P0
Objective: Ensure Autonomous Venture Factory can reliably coordinate real company creation, development, launch, and operations without requiring constant human supervision.

AVF must transition from a collection of independent agent workflows into a durable, recoverable, auditable business execution platform.

20.1 Production Reliability

Implement or extend existing capabilities for:

Durable workflow execution.
Persistent task and venture state.
Automatic recovery after application restarts.
Agent execution retries with bounded limits.
Dead-letter queues for unrecoverable tasks.
Idempotent external operations.
Dependency-aware task scheduling.
Concurrent execution across independent workstreams.
Timeout detection.
Stalled workflow identification.
Automated reconciliation of external provider states.
Execution history and audit trails.

Critical requirement: An interrupted company-creation workflow must resume without repeating completed financial transactions, legal filings, domain purchases, or other consequential actions.

Acceptance Criteria

AVF resumes an interrupted venture workflow without losing state.
Completed tasks are not duplicated.
Failed tasks follow documented recovery procedures.
External operations are reconciled against provider records.
Every state transition is attributable to an agent, owner, or external system.

20.2 Security and Venture Isolation

Each company must operate within its own security boundary.

Implement:

Venture-scoped credentials.
Venture-scoped access controls.
Separate production data environments.
Secret management.
Credential rotation.
Least-privilege agent permissions.
Encryption for sensitive information.
Secure customer document storage.
Cross-venture access restrictions.
Audit logging.
Incident detection and escalation.

Shared infrastructure may be used where isolation is enforced.

Required Evaluations

Test that:

A Fairhome agent cannot access another venture’s customer records.
One venture cannot spend another venture’s budget.
One venture cannot use another venture’s Stripe credentials.
A compromised agent cannot modify investment authorizations.
Revoked credentials cannot be reused.
A failed venture cannot disrupt unrelated venture workflows.

20.3 Financial Controls

AVF must maintain accurate financial boundaries.

Implement:

Per-venture capital allocations.
Monthly operating budgets.
Transaction-level spending limits.
Vendor-specific permissions.
Expense categorization.
Budget forecasting.
Financial commitment tracking.
Payment reconciliation.
Refund tracking.
Cash-flow monitoring.
Financial exception alerts.

Financial Invariants

No external spending without valid authorization.
No spending beyond approved limits.
No duplicate payments after retries.
No revenue recognition based solely on projections.
No success-fee invoice without verified savings.
No transfer between ventures without explicit authorization.
No financial account activation based on simulated verification.

Acceptance Criteria: Every financial operation is attributable to a venture, an authorization, and an auditable execution record.

⸻

21. Phase 18 — Autonomous Company Operations

Priority: P0
Objective: Enable AVF to operate companies after launch, not merely build them.

The Company Builder and Company Operator must be distinct capabilities.

The Company Builder establishes the business.

The Company Operator manages ongoing business activities.

21.1 Venture Operator Architecture

Every operating company should have a dedicated logical Venture Operator.

The operator coordinates specialized capabilities:

￼

These are logical roles, not necessarily separate persistent agents.

Reuse existing MyEve, Relay, Mission Control, and Software Factory capabilities wherever supported.

Do not create unnecessary agent infrastructure.

21.2 Autonomous Operating Loops

Implement recurring business operating loops.

Daily Loop

Check business health.
Monitor customer activity.
Review revenue and collections.
Identify operational failures.
Process authorized support workflows.
Monitor outstanding cases.
Detect unusual expenses.
Identify urgent deadlines.
Dispatch approved corrective work.

Weekly Loop

Analyze customer acquisition.
Review conversion performance.
Evaluate support workload.
Identify product improvements.
Compare actual expenses against budgets.
Review profitability.
Recommend operational improvements.
Evaluate agent performance.

Monthly Loop

Reconcile financial performance.
Calculate contribution margin.
Review customer retention.
Evaluate marketing effectiveness.
Compare forecasts against actual results.
Update venture investment scores.
Recommend SCALE, MAINTAIN, PIVOT, or SHUT DOWN.

Execution Requirements

Recurring loops must be:

Durable.
Idempotent.
Budget-aware.
Evidence-backed.
Observable.
Recoverable.
Scoped to approved permissions.

21.3 Human Exception Management

AVF should minimize routine owner involvement.

The owner should receive requests only when:

A legally required action needs personal participation.
A proposed expense exceeds authorization.
A material business strategy change requires approval.
A regulated activity requires qualified human judgment.
A significant operational incident occurs.
A company is ready for public launch.
An investment expansion or shutdown requires an owner decision.

Routine engineering, testing, research, analytics, and authorized operational work should continue without repeated approval requests.

Acceptance Criteria: AVF can complete a simulated 30-day operating cycle while escalating only genuine exceptions.

⸻

22. Phase 19 — Autonomous Growth and Revenue Optimization

Priority: P1
Objective: Enable AVF to acquire customers and improve business profitability through measurable experiments.

22.1 Growth Infrastructure

Implement reusable integrations and workflows for:

Search engine optimization.
Search indexing.
Website analytics.
Conversion tracking.
CRM lead management.
Email marketing.
Customer onboarding.
Referral attribution.
Campaign performance.
Landing page experimentation.
Customer segmentation.
Retention analysis.
Revenue attribution.

Use established third-party services when they provide a clear cost or reliability advantage.

22.2 Growth Experiment Engine

Every growth experiment must include:

Hypothesis.
Target customer.
Acquisition channel.
Expected cost.
Success metric.
Maximum authorized spend.
Experiment duration.
Minimum evidence threshold.
Stop conditions.
Final recommendation.

Examples:

Experiment A — Organic SEO

Determine whether county-specific property tax assessment content generates qualified Fairhome leads.

Experiment B — Conversion Optimization

Compare two homeowner onboarding experiences to determine which produces more completed property assessments.

Experiment C — Referral Acquisition

Determine whether partnerships with real estate professionals produce qualified leads at an economically sustainable acquisition cost.

22.3 Revenue Optimization

Track:

Visitors.
Leads.
Qualified leads.
Customer acquisition cost.
Conversion rate.
Accepted customers.
Revenue per customer.
Contribution margin.
Collection rate.
Customer lifetime value.
Payback period.
Refunds and disputes.

For success-fee ventures such as Fairhome, distinguish signed customers from completed cases and collected revenue.

Acceptance Criteria: AVF can create, execute, measure, and evaluate authorized growth experiments without confusing marketing activity with profitable customer acquisition.

⸻

23. Phase 20 — Portfolio Investment and Capital Allocation

Priority: P1
Objective: Enable AVF to recommend how the owner should allocate capital across multiple ventures.

23.1 Portfolio Investment Engine

Each venture must maintain a current investment profile containing:

Total capital invested.
Current operating expenses.
Actual collected revenue.
Contribution margin.
Operating cash flow.
Customer acquisition performance.
Growth rate.
Capital requirements.
Financial runway.
Operational risk.
Regulatory exposure.
Human oversight requirements.
Investment recommendation.

23.2 Investment Recommendations

AVF must support the following recommendations:

￼

Each recommendation must explain:

Supporting evidence.
Financial implications.
Risks.
Confidence.
Alternative decisions.
Required owner authorization.
Next executable actions.

23.3 Capital Allocation Optimization

Develop a portfolio-level model that compares ventures using:

Risk-adjusted expected contribution, capital efficiency, cash requirements, and owner attention.

Do not optimize solely for revenue growth.

A venture generating $3,000 monthly revenue with $2,500 contribution and minimal human involvement may be preferable to a venture generating $20,000 with poor margins and substantial operational demands.

Acceptance Criteria

AVF can compare multiple ventures, recommend capital allocations, and explain why one opportunity deserves additional investment over another.

Actual capital movements remain subject to explicit authorization.

⸻

24. Phase 21 — Agent-Native AVF Control Center

Priority: P0
Objective: Provide a unified interface for managing the complete venture portfolio.

The interface must be designed for autonomous agents and human oversight.

It should not simply reproduce a traditional project management dashboard.

24.1 Portfolio Home

The primary dashboard should display:

￼

The table above illustrates the intended interface, not actual portfolio data.

24.2 Venture Detail View

Each venture must provide access to:

Overview

Business concept.
Investment thesis.
Market opportunity.
Current lifecycle stage.
Investment recommendation.

Business Formation

Entity status.
Registered agent.
EIN.
Banking.
Insurance.
Licensing.
Compliance.

Engineering

Product roadmap.
MyEve activity.
Relay activity.
Software Factory WorkOrders.
Test results.
Deployment status.

Commercial Operations

CRM.
Customer acquisition.
Marketing.
Revenue.
Billing.
Support.
Customer retention.

Financial Performance

Capital invested.
Operating expenses.
Cash flow.
Contribution margin.
Forecasts.
Financial risks.

Evidence

Research sources.
Evaluation results.
Approval records.
Verification receipts.
Audit history.

24.3 Agent-Native Interactions

Support natural-language commands such as:

“Evaluate Fairhome’s launch readiness.”
“Show why Fairhome’s investment score decreased.”
“Compare our three most profitable ventures.”
“Identify companies requiring owner attention.”
“Prepare Fairhome’s next growth experiment.”
“Show all blocked Software Factory work.”
“Explain why this venture exceeded its cost forecast.”
“Recommend which business should receive the next investment.”

Agent responses should produce actionable, structured UI elements backed by actual system state.

Commands that change external systems must be checked against the venture’s authorization contract.

24.4 Owner Attention Center

Create a dedicated owner inbox.

Prioritize:

Critical incidents.
Required legal or financial actions.
Investment decisions.
Launch approvals.
Material strategy changes.
Informational updates.

Group related approvals where appropriate.

Do not interrupt the owner for routine implementation details.

Acceptance Criteria: The owner can understand the status of every venture and resolve genuine decisions from a single interface.

⸻

25. Phase 22 — Multi-Venture Scalability

Priority: P2
Objective: Support a portfolio of 10–100 ventures without proportionally increasing operating costs or owner involvement.

25.1 Shared Infrastructure

Identify components that can be reused across ventures:

Authentication.
Website templates.
CRM adapters.
Payment integrations.
Analytics.
SEO infrastructure.
Customer support tooling.
Email services.
Agent orchestration.
Development pipelines.
Monitoring.
Security.
Compliance tracking.
Financial reporting.

Separate shared platform services from venture-specific business logic.

25.2 Venture Templates

Create reusable templates for:

Micro-SaaS

Subscription billing.
Self-service onboarding.
Product analytics.
Support automation.

Professional Services

Customer intake.
Authorization.
Document management.
Case workflows.
Professional review.
Outcome-based billing.

Transaction Businesses

Transaction processing.
Payment reconciliation.
Customer communications.
Dispute handling.

AI-Native Automation

Agent workflows.
Usage-based billing.
Evaluation pipelines.
Human escalation.
Reliability monitoring.

25.3 Portfolio Scaling Evaluations

Test:

10 simultaneous venture workflows.
25 concurrent venture evaluations.
50 active venture records with operating agents.
100 ventures in portfolio reporting.
Concurrent engineering dispatch.
Cross-venture budget isolation.
Agent resource contention.
Recovery after orchestration failures.

These are capacity-testing targets, not requirements to create 100 real companies.

Acceptance Criteria

AVF demonstrates that adding ventures does not require manually recreating infrastructure or compromising security and financial isolation.

⸻

26. Implementation Roadmap and Dependency Order

Priority: P0
Objective: Establish an executable implementation sequence that avoids unnecessary dependencies and duplicated infrastructure.

The phases in this master plan describe capabilities. They should not all be implemented sequentially.

Use dependency-aware execution.

Wave 1 — Foundation

Primary goal: Establish reliable venture execution.

Implement:

Repository and architecture discovery.
Existing-system integration contracts.
Venture data model.
Investment authorization.
Durable execution.
Evidence provenance.
Budget enforcement.
Approval enforcement.
Venture isolation.

Exit criteria: AVF can persist and execute an authorized venture workflow safely.

Wave 2 — Company Builder

Primary goal: Transform an approved venture into a coordinated company-creation program.

Implement:

Company Launch WorkOrders.
Business formation workflows.
Domain acquisition workflows.
Stripe onboarding workflows.
CRM provisioning.
Website development coordination.
Marketing preparation.
Launch readiness tracking.

Exit criteria: AVF can coordinate a simulated company launch across multiple independent workstreams.

Wave 3 — Factory Integration

Primary goal: Connect venture execution to existing engineering infrastructure.

Implement:

MyEve integration.
Relay integration.
Software Factory dispatch.
Mission Control integration where applicable.
WorkOrder lifecycle synchronization.
Independent verification.
Failure recovery.

Exit criteria: AVF can request engineering work, monitor its execution, and verify completion through the actual supported interfaces.

Wave 4 — Fairhome Reference Venture

Primary goal: Demonstrate real business-building capabilities.

Implement:

Fairhome opportunity registration.
Investment evaluation.
Launch market analysis.
Financial evaluations.
Product requirements.
Company formation preparation.
Engineering dispatch.
Operational workflow preparation.
Launch readiness review.

Exit criteria: Fairhome has an evidence-backed investment recommendation and an executable company launch plan, with authorized development completed.

Wave 5 — Autonomous Operations

Primary goal: Operate a launched venture with minimal owner involvement.

Implement:

Venture Operator.
Customer support workflows.
Growth experiments.
Revenue monitoring.
Financial reporting.
Operational alerts.
Continuous improvement.

Exit criteria: AVF successfully executes a simulated 30-day business operating cycle.

Wave 6 — Portfolio Intelligence

Primary goal: Make the factory more effective as the number of ventures increases.

Implement:

Cross-venture learning.
Financial forecast calibration.
Reusable playbooks.
Capital allocation recommendations.
Portfolio optimization.
Multi-venture scalability.

Exit criteria: AVF can compare ventures, learn from results, and recommend where to invest next.

⸻

27. Engineering Execution Requirements

Priority: P0

Codex must translate this implementation plan into actual engineering work.

27.1 Repository Discovery

Before making architectural changes:

Locate AVF.
Inspect its current implementation.
Identify existing tests.
Identify existing database schemas.
Identify existing agent infrastructure.
Discover MyEve, Relay, Software Factory, and Mission Control.
Identify supported integration interfaces.
Document existing capabilities versus missing capabilities.

Do not assume an integration exists because it appears in a design document.

27.2 Work Breakdown

Create implementation work orders with:

Unique identifiers.
Objectives.
Dependencies.
Assigned execution system.
Acceptance criteria.
Required evaluations.
Budget constraints.
Evidence requirements.
Verification requirements.
Completion status.

Prioritize P0 capabilities before optional P2 enhancements.

Parallelize independent workstreams.

27.3 Development Standards

Require:

Automated tests.
Integration tests.
End-to-end evaluations.
Typed interfaces where supported.
Schema validation.
Idempotency.
Structured logging.
Error handling.
Security controls.
Migration compatibility.
Rollback procedures.
Independent verification.

Avoid unnecessary frameworks or architectural rewrites.

27.4 Evidence Requirements

Every completed work order must produce evidence identifying:

Exact code revision.
Tests executed.
Test results.
Relevant configuration.
External dependencies.
Verification status.
Remaining risks.
Deployment state.

A successful local test must not be represented as successful production deployment.

⸻

28. Master Evaluation Framework

Priority: P0
Objective: Ensure AVF’s company-building capabilities are measured by executable evaluations rather than demonstrations alone.

28.1 Venture Evaluation Evals

Test whether AVF can:

Identify viable opportunities.
Distinguish facts from assumptions.
Calculate investment scores.
Explain recommendations.
Detect weak unit economics.
Identify regulatory dependencies.
Recommend cheap falsification experiments.

28.2 Company Creation Evals

Test whether AVF can:

Generate a complete Company Launch WorkOrder.
Track LLC formation accurately.
Distinguish prepared filings from submitted filings.
Verify domain ownership.
Track Stripe onboarding accurately.
Provision CRM infrastructure.
Coordinate website development.
Track marketing readiness.
Prevent unauthorized spending.

28.3 Engineering Integration Evals

Test:

WorkOrder dispatch.
Task routing.
Execution monitoring.
Failure recovery.
Independent verification.
Approval invalidation when code changes.
Evidence freshness.
Deployment readiness.

28.4 Business Operations Evals

Test:

Customer onboarding.
CRM lifecycle.
Billing accuracy.
Customer support
AVF MASTER IMPLEMENTATION PLAN

Continuation — Section 28.4: Business Operations Evals Through Final Execution Requirements

This section continues directly from 28.4 and is intended to be appended to the existing AVF implementation plan.

⸻

28.4 Business Operations Evals

Priority: P0
Objective: Verify that AVF can establish, coordinate, and operate the core business functions required by an autonomous company.

Required Test Coverage

Customer onboarding

Lead registration and identity resolution.
Customer account creation.
Email verification.
Consent and authorization capture.
Duplicate customer detection.
Required document collection.
Incomplete onboarding recovery.
Customer activation.
Customer cancellation.
Secure customer data handling.

CRM lifecycle

Lead creation and attribution.
Lead qualification.
Opportunity conversion.
Customer lifecycle transitions.
Automated follow-up.
Agent-generated customer communications.
Customer segmentation.
Customer activity history.
Duplicate record prevention.
Customer retention workflows.
Customer reactivation.
CRM-to-product synchronization.

Billing accuracy

Customer billing authorization.
Success-fee calculations.
Subscription billing.
Usage-based billing.
Invoice generation.
Payment collection.
Failed-payment recovery.
Refund processing.
Dispute handling.
Tax calculations where applicable.
Revenue recognition.
Financial reconciliation.
Duplicate-charge prevention.

Customer support

Support ticket creation.
AI-assisted classification.
Customer identity verification.
Knowledge-base retrieval.
Suggested responses.
Automated resolution for authorized requests.
Human escalation.
Complaint handling.
Refund requests.
Support quality evaluation.
Customer satisfaction measurement.
Ticket closure verification.

Additional Operational Evals

Marketing operations

Lead attribution.
Campaign creation.
Content approval.
SEO metadata generation.
Search indexing verification.
Email campaign execution.
Unsubscribe enforcement.
Marketing consent.
Conversion tracking.
Advertising budget enforcement.

Company administration

Business formation status verification.
Domain registration verification.
DNS configuration.
Business email provisioning.
Payment processor activation.
Bank account onboarding status.
Accounting integration.
Vendor onboarding.
Insurance requirements.
Compliance deadline tracking.

Financial operations

Revenue reconciliation.
Expense categorization.
Budget tracking.
Cash-flow projections.
Contribution margin calculations.
Profitability reporting.
Working capital requirements.
Vendor payment authorization.
Financial anomaly detection.

Failure Scenarios

Test at least the following:

A customer submits onboarding twice.
An agent attempts to contact a customer without appropriate authorization.
A CRM provider returns inconsistent customer identifiers.
A payment succeeds but the API response times out.
A refund is requested after an invoice has been reconciled.
A billing agent attempts to charge an unverified savings estimate.
A customer cancels while an operational workflow is active.
A marketing agent attempts to exceed its approved advertising budget.
A support agent encounters a request requiring professional judgment.
An external provider becomes unavailable during company launch.
A company formation filing is submitted but confirmation is delayed.
A venture’s credentials are accidentally referenced by another venture.

Acceptance Criteria

Business operations evaluations must demonstrate:

Correct customer lifecycle transitions.
Accurate financial calculations.
Reliable external-provider reconciliation.
Effective duplicate-action prevention.
Proper authorization enforcement.
Correct human escalation.
Durable operational records.
Cross-venture data isolation.
Traceable agent decisions.
Recovery from partial failures.

Completion evidence: Automated test results, execution receipts, financial reconciliation reports, authorization records, and independently verified operational outcomes.

⸻

28.5 Agent Autonomy and Decision Quality Evals

Priority: P0
Objective: Verify that AVF agents can make useful decisions and execute authorized work without excessive human intervention.

Evaluation Categories

Decision accuracy

Test whether agents correctly:

Interpret business objectives.
Identify missing information.
Select appropriate tools.
Choose execution workflows.
Distinguish verified facts from assumptions.
Recognize financial and operational constraints.
Escalate genuinely restricted decisions.
Avoid unnecessary approval requests.

Execution reliability

Measure:

Task completion rate.
First-attempt success rate.
Retry frequency.
Recovery success rate.
Time to completion.
Cost per successful task.
External dependency failures.
Human intervention frequency.

Business reasoning

Evaluate whether agents can:

Compare business opportunities.
Interpret unit economics.
Identify unprofitable customer segments.
Recommend appropriate pricing experiments.
Detect operational inefficiencies.
Prioritize high-impact improvements.
Recommend scaling or shutting down ventures.

Authorization compliance

Test attempts to:

Exceed approved budgets.
Purchase unapproved services.
Launch without authorization.
Modify financial accounts.
Access another venture’s data.
Bypass independent verification.
Submit unauthorized legal filings.
Execute restricted external actions.

Every prohibited action must be blocked and recorded.

Acceptance Criteria

Agents complete authorized workflows autonomously.
Restricted actions are blocked.
Decision explanations reference supporting evidence.
Agent execution remains within budget.
Failures produce recoverable states.
Human escalation occurs only when justified.
Every material action is auditable.

⸻

28.6 Company Creation End-to-End Evals

Priority: P0
Objective: Prove that AVF can transform an approved venture opportunity into a launch-ready business.

Golden Journey

Execute the following end-to-end scenario:

Step 1 — Discover

AVF identifies a commercially plausible business opportunity.

Step 2 — Evaluate

Research agents produce a market assessment, competitive analysis, financial model, and investment recommendation.

Step 3 — Approve

The owner approves the venture with explicit spending and execution limits.

Step 4 — Create

AVF generates a Company Launch WorkOrder and initiates authorized business formation preparation.

Step 5 — Build

MyEve, Relay, and Software Factory receive engineering work through their verified integration contracts.

Step 6 — Establish Infrastructure

AVF coordinates:

Website hosting.
Domain provisioning.
CRM.
Customer authentication.
Payment processing.
Analytics.
Customer support.
Business email.

Step 7 — Establish Operations

AVF configures business-specific workflows and assigns operational responsibilities.

Step 8 — Verify

Independent verification evaluates technical, financial, operational, regulatory, and security readiness.

Step 9 — Launch Approval

AVF presents a complete launch-readiness report to the owner.

Step 10 — Launch

Following explicit authorization, AVF coordinates deployment and business activation.

Step 11 — Operate

Venture Operator agents monitor customer activity, service delivery, revenue, costs, and operational exceptions.

Step 12 — Optimize

AVF recommends improvements based on actual business performance.

Required Test Modes

Implement three execution modes.


￼
Simulation and sandbox modes must never produce real purchases, legal filings, customer communications, or payment charges.

Acceptance Criteria

AVF must successfully execute the Golden Journey in simulation.

The test must demonstrate:

Opportunity creation.
Evidence-backed evaluation.
Owner authorization.
Company Launch WorkOrder generation.
Parallel workstream execution.
Engineering dispatch.
Business infrastructure provisioning.
Budget enforcement.
Durable state.
Independent verification.
Launch approval enforcement.
Operational monitoring.
Financial reporting.
Failure recovery.

The system must accurately distinguish simulated readiness from real-world operational readiness.

⸻

29. Implementation Sequencing and Dependencies

Priority: P0
Objective: Implement AVF incrementally without destabilizing existing factory infrastructure.

29.1 Implementation Waves

Wave 1 — Foundation and Architecture

Target: Establish verified integration contracts and venture lifecycle foundations.

Deliverables:

Existing-system capability inventory.
AVF architecture assessment.
MyEve integration contract.
Relay integration contract.
Software Factory integration contract.
Mission Control integration contract.
Venture lifecycle state machine.
Investment authorization model.
Durable execution records.
Initial evaluation framework.

Exit criteria: AVF can represent an opportunity, record an investment decision, and generate a valid Company Launch WorkOrder.

Wave 2 — Company Creation Engine

Target: Build reusable company establishment workflows.

Deliverables:

Business formation workflow.
Domain provisioning workflow.
Digital infrastructure workflow.
CRM provisioning workflow.
Stripe integration workflow.
Accounting setup workflow.
Business email provisioning workflow.
Company launch orchestration.
Provider adapters.
Retry and reconciliation mechanisms.

Exit criteria: AVF can coordinate a complete simulated company setup.

Wave 3 — Software Factory Integration

Target: Enable AVF to dispatch engineering work.

Deliverables:

Product requirements generation.
Engineering WorkOrder contracts.
MyEve and Relay handoffs.
Software Factory execution.
Verification evidence ingestion.
Development progress tracking.
Release readiness reporting.

Exit criteria: AVF can initiate and track a verified engineering workflow using existing factory infrastructure.

Wave 4 — Revenue and Customer Operations

Target: Enable a venture to acquire and serve customers.

Deliverables:

Customer onboarding.
CRM lifecycle automation.
Billing and invoicing.
Payment reconciliation.
Customer support.
Marketing automation.
Operational agent workflows.
Financial reporting.

Exit criteria: A simulated venture can acquire a customer, deliver a service, generate an invoice, process a test payment, and reconcile revenue.

Wave 5 — Portfolio Intelligence

Target: Enable AVF to manage multiple ventures.

Deliverables:

Portfolio dashboard.
Venture financial reporting.
Budget allocation.
Investment recommendations.
Venture Operator agents.
Cross-venture analytics.
Continuous learning.
Operational performance evaluations.

Exit criteria: AVF can operate multiple simulated ventures with isolated resources and consolidated reporting.

Wave 6 — Fairhome Reference Implementation

Target: Validate AVF against a real business concept.

Deliverables:

Fairhome opportunity record.
Market evaluation.
Investment recommendation.
Owner approval workflow.
Company Launch WorkOrder.
Fairhome product development handoff.
Business formation preparation.
Payment infrastructure preparation.
CRM configuration.
Operational workflow design.
Launch-readiness assessment.

Exit criteria: Fairhome is represented in AVF as a real venture with independently verifiable business and technical readiness.

⸻

30. Agent Architecture and Responsibilities

Priority: P0

AVF should introduce specialized venture agents while reusing existing agent infrastructure.

￼

These represent logical responsibilities, not necessarily separate processes or models.

The implementation should consolidate responsibilities where doing so reduces cost and complexity without weakening controls.

30.1 Agent Execution Contract

Every agent execution must include:

Venture ID.
Objective.
WorkOrder ID.
Task ID.
Assigned role.
Permitted tools.
Authorization scope.
Budget allocation.
Input evidence.
Expected outputs.
Acceptance criteria.
Execution deadline.
Retry policy.
Escalation rules.
Verification requirements.

Agent output must include:

Execution status.
Artifacts produced.
Evidence references.
Costs incurred.
Decisions made.
Errors encountered.
Remaining dependencies.
Recommended next actions.

⸻

31. Autonomous Execution and Human Approval Model

Priority: P0

The platform must minimize unnecessary interruptions while preserving owner control over material business decisions.

31.1 Owner Approval Categories

Investment Approval

Authorizes the venture to proceed within defined financial and operational limits.

Financial Authorization

Defines:

Maximum initial investment.
Monthly operating budget.
Individual purchase limits.
Approved providers.
Permitted spending categories.
Advertising limits.
Recurring subscription limits.

Legal Authorization

Controls:

Entity formation.
Registered agent agreements.
Legal attestations.
Regulatory applications.
Binding contracts.
Banking agreements.

Launch Authorization

Controls public deployment and customer-facing activation.

Expansion Authorization

Controls material changes in geography, financial exposure, regulated services, or operating scope.

31.2 Approval Invalidation

Approvals must be bound to the exact scope and evidence reviewed.

Reopen an approval if material changes occur to:

Authorized budget.
Legal entity.
Launch jurisdiction.
Contract terms.
Deployment artifact.
Security posture.
Regulatory requirements.
Professional representation arrangements.
Payment processing configuration.
Business model.

An approval must not remain valid indefinitely when its underlying evidence becomes stale.

31.3 Autonomous Continuation

Within approved authority, AVF should:

Select the next executable task.
Verify dependencies.
Reserve budget.
Dispatch execution.
Collect evidence.
Run verification.
Commit completion state.
Release dependent tasks.
Continue automatically.

If one task is blocked, AVF should continue unrelated authorized work.

The owner should manage decisions and exceptions, not routine task execution.

⸻

32. Company Launch Control Center

Priority: P0

Implement an agent-native dashboard that allows the owner to supervise the entire company-building lifecycle.

32.1 Portfolio Overview

Display:

Total ventures.
Opportunities under evaluation.
Approved ventures.
Companies being established.
Products under development.
Launch-ready companies.
Operating companies.
Revenue-generating companies.
Monthly revenue.
Monthly expenses.
Contribution profit.
Cash balances where connected.
Capital committed.
Owner actions required.

32.2 Venture Detail Page

Each venture must include:

Overview

Business concept.
Target market.
Investment thesis.
Current stage.
Next milestone.

Investment

Opportunity score.
Evidence confidence.
Financial projections.
Approved budget.
Investment decisions.

Company

Legal entity.
Formation status.
Domain.
Banking.
Stripe.
Accounting.
Compliance.

Product

Requirements.
Engineering work.
MyEve and Relay activity.
Software Factory execution.
Test results.
Deployment status.

Growth

Website analytics.
SEO.
Marketing campaigns.
Leads.
Conversion.
Customer acquisition costs.

Operations

CRM.
Customer onboarding.
Support.
Agent activity.
Operational exceptions.

Financials

Revenue.
Expenses.
Cash flow.
Contribution margin.
Profitability.
Forecast-versus-actual results.

Evidence

Research.
Execution receipts.
Test results.
Provider confirmations.
Approval history.
Audit records.

32.3 Owner Action Center

Provide a centralized queue for:

Investment approvals.
Budget increases.
Legal attestations.
Provider identity verification.
Launch approvals.
Expansion decisions.
Material risk escalations.

Each action must show:

What decision is required.
Why it is required.
Available options.
Financial implications.
Supporting evidence.
Consequences of approval.
Expiration or invalidation conditions.

⸻

33. Financial Management and Profitability Optimization

Priority: P0

AVF must distinguish revenue generation from actual profitability.

33.1 Financial Metrics

Track:

Gross revenue.
Collected revenue.
Refunds.
Payment processing costs.
Customer acquisition costs.
Variable service costs.
Infrastructure expenses.
Agent execution costs.
Professional service expenses.
Fixed operating costs.
Contribution margin.
Operating profit.
Cash flow.
Working capital.
Capital invested.
Return on invested capital.

33.2 Human Attention Economics

Introduce a portfolio-wide metric:

Owner Attention Efficiency = Risk-adjusted contribution profit ÷ owner hours invested

Track separately:

Owner oversight hours.
Professional service hours.
Contractor hours.
Agent execution hours.
Automated task completion.

Do not treat agent activity as free labor. Model inference, infrastructure, tool execution, and failed tasks all have costs.

33.3 Venture Investment Recommendations

AVF should generate recommendations including:

BUILD: Commercial evidence supports initial investment.

VALIDATE: Important assumptions remain unresolved.

LAUNCH: Operational and commercial readiness criteria are satisfied.

SCALE: Actual performance supports additional investment.

MAINTAIN: Continue operating without material expansion.

PIVOT: Change the business model or target market.

SHUT DOWN: Expected future returns do not justify continued investment.

Each recommendation must include financial evidence, uncertainty, risks, and proposed next actions.

⸻

34. Security, Governance, and Operational Reliability

Priority: P0

AVF will eventually interact with real financial accounts, customer information, legal entities, and external providers.

Security and operational reliability must be foundational.

34.1 Venture Isolation

Enforce:

Venture-scoped identities.
Separate secrets.
Least-privilege tool access.
Database access controls.
Financial account isolation.
Environment isolation.
Audit logging.
Secure document storage.

34.2 External Action Safety

Implement:

Idempotency keys.
Duplicate-action prevention.
Provider status reconciliation.
Spending reservations.
Approval validation.
Transaction receipts.
Failure recovery.
Credential rotation.
Rate limiting.

34.3 Independent Verification

Verification must not rely exclusively on the agent that performed the work.

Require independent checks for:

Engineering changes.
Production deployments.
Financial calculations.
Provider account activation.
Legal formation status.
Regulatory readiness.
Customer-facing claims.
Launch readiness.

34.4 Evidence Freshness

Evidence must include:

Source.
Collection timestamp.
Verification timestamp.
Scope.
Associated artifact.
Expiration or invalidation conditions.

Material changes must trigger reevaluation.

⸻

35. Implementation Deliverables

Priority: P0

The implementation must produce working software, not merely architectural documentation.

35.1 Required Technical Deliverables

Durable venture lifecycle engine.
Investment authorization system.
Company Launch WorkOrder schema.
Company creation orchestration.
Provider integration architecture.
MyEve integration.
Relay integration.
Software Factory integration.
Mission Control integration where supported.
Company formation workflows.
Domain and infrastructure workflows.
Stripe provisioning workflow.
CRM provisioning workflow.
35.1 Required Technical Deliverables (Continued)

Marketing automation and campaign management workflows.
SEO optimization and search engine indexing workflows.
Customer acquisition and conversion tracking.
Autonomous Venture Operator agent framework.
Customer onboarding and lifecycle management.
Customer support automation with escalation handling.
Financial reporting and profitability analytics.
Venture-level budget management and spending controls.
Portfolio management dashboard.
Company Launch Control Center UI.
Investment Decision Center UI.
Agent-native interfaces for venture operations.
Evidence provenance and audit trail infrastructure.
Independent verification and release qualification.
Regulatory and compliance readiness tracking.
Company launch readiness evaluation engine.
Automated GO / NO-GO investment recommendations.
Venture performance monitoring and alerting.
Cross-venture learning and knowledge management.
Reusable venture templates and operational playbooks.
Automated experiment generation and evaluation.
Venture expansion, pivot, and shutdown workflows.
Multi-venture isolation and access controls.
Secrets management and provider credential isolation.
Durable execution, retries, and recovery mechanisms.
End-to-end integration and regression test suites.
Fairhome reference venture implementation.

Deliverable Requirements

Every technical deliverable must include:

Implemented functionality rather than documentation alone.
Automated tests.
Integration verification where applicable.
Operational documentation.
Evidence of successful execution.
Failure handling and recovery procedures.
Security and authorization validation.
Clear ownership and maintenance responsibilities.

Definition of Done: A capability is complete only when its implementation is functional, independently verified, integrated into the relevant AVF workflow, and accessible through the appropriate API or user interface.

35.2 Required Business Deliverables

AVF must generate and maintain the following artifacts for each approved venture.

￼

￼
All deliverables must be linked to the venture record and remain accessible through AVF.

⸻

35.3 Required User Experience

AVF must provide a unified owner experience.

Portfolio Home

The owner should immediately see:

Total ventures.
Opportunities under evaluation.
Approved investments.
Companies under construction.
Companies ready for launch.
Operating companies.
Revenue and profitability.
Capital deployed.
Budget utilization.
Outstanding approvals.
Critical operational exceptions.
Recommended next investment decisions.

Venture Detail

Selecting a venture should reveal:

Business opportunity and investment thesis.
Market research and competitive intelligence.
Financial forecasts and actual performance.
Investment authorization.
Company formation progress.
Engineering execution status.
Infrastructure provisioning.
CRM and revenue infrastructure.
Marketing readiness.
Operational readiness.
Agent activity and execution evidence.
Launch readiness.
Customer and revenue performance.
Expansion recommendations.

Company Launch Control Center

The owner must be able to monitor parallel company-building workstreams.

Each workstream should display:

Current status.
Assigned agent or execution system.
Completed tasks.
Active tasks.
Blockers.
Dependencies.
Budget consumption.
Verification evidence.
Expected next action.

The interface must distinguish:

NOT STARTED → IN PROGRESS → BLOCKED → VERIFYING → COMPLETE → FAILED

No simulated or planned activity may be presented as completed external execution.

⸻

36. Implementation Priorities and Dependency Management

The implementation must prioritize foundational capabilities that unlock subsequent work.

Priority P0 — Essential Platform

Implement first:

Existing architecture and repository discovery.
Durable venture lifecycle.
Investment authorization.
Company Launch WorkOrders.
MyEve, Relay, and Software Factory integration contracts.
Durable orchestration and recovery.
Budget enforcement.
Independent verification.
Company Launch Control Center.
Fairhome end-to-end reference workflow.

P0 success criterion: An approved venture can move from investment authorization into coordinated, verifiable company-building execution.

Priority P1 — Company Creation and Revenue Operations

Implement next:

Company formation workflows.
Domain acquisition and DNS provisioning.
Hosting and infrastructure provisioning.
Stripe onboarding and billing integration.
CRM provisioning.
Customer onboarding.
Marketing and SEO workflows.
Autonomous Venture Operator.
Financial reporting.
Launch readiness evaluation.

P1 success criterion: AVF can coordinate the infrastructure, operations, and business processes required to prepare a real company for launch.

Priority P2 — Portfolio Intelligence and Scale

Implement after the core operating model is validated:

Portfolio optimization.
Cross-venture learning.
Reusable company templates.
Automated financial forecasting calibration.
Autonomous growth experiments.
Multi-venture resource allocation.
Expansion and shutdown recommendations.
Advanced agent-native interfaces.
Venture performance benchmarking.
Continuous improvement across the portfolio.

P2 success criterion: AVF can manage multiple ventures efficiently and use observed results to improve subsequent investment and operating decisions.

⸻

37. Implementation Sequencing

Do not implement every subsystem simultaneously without regard to dependencies.

Use the following execution sequence.

￼
Parallel Execution

Independent workstreams should execute concurrently where safe.

For example:

Business formation preparation can run alongside product development.
Branding can run alongside market research.
CRM configuration can run alongside website development.
Marketing content preparation can run alongside infrastructure provisioning.
Financial modeling can run alongside technical implementation.

However, dependent activities must wait for their prerequisites.

Examples:

Domain registration requires appropriate purchasing authorization.
Company filings require verified information and applicable authorization.
Payment processing activation requires successful provider onboarding.
Regulated services require appropriate professional arrangements.
Public launch requires launch authorization.

⸻

38. Autonomous Execution Requirements

AVF must operate autonomously within explicitly approved authority.

38.1 Execution Without Routine Approvals

Agents should independently:

Research opportunities.
Generate investment analyses.
Create technical specifications.
Write and test code.
Prepare business documentation.
Configure local development environments.
Execute simulations.
Run evaluations.
Analyze financial scenarios.
Generate marketing content.
Prepare operational workflows.
Monitor authorized systems.
Report progress.

Do not interrupt the owner for routine technical decisions.

38.2 Owner Approval Boundaries

Owner authorization is required for:

Investment commitments.
Spending beyond approved budgets.
Binding agreements.
Required identity or legal attestations.
Company formation submissions requiring owner action.
Financial account activation requiring owner verification.
Material changes to the approved business model.
Public launch.
Material regulatory or financial exposure.
Business shutdown or irreversible disposition.

AVF should group related approval requests whenever possible.

38.3 Durable Autonomy

Long-running execution must survive:

Agent restarts.
Application restarts.
Network interruptions.
Provider failures.
Expired credentials.
Partial task completion.
Temporary resource unavailability.

Execution must resume from persisted state without duplicating external actions.

38.4 Escalation Policy

When an action is blocked:

Record the blocker.
Identify the responsible party.
Determine whether the blocker affects other workstreams.
Continue independent authorized tasks.
Present a concise approval or intervention request.
Resume automatically after the dependency is resolved.

A blocked task must not unnecessarily stop the entire venture.

⸻

39. Final End-to-End Acceptance Test

AVF must demonstrate the complete venture lifecycle using Fairhome as the reference case.

Scenario: Create Fairhome Through AVF

Step 1 — Opportunity Discovery

AVF registers Fairhome as a property tax appeals opportunity.

Expected result: A persistent venture record with supporting evidence.

Step 2 — Investment Evaluation

AVF evaluates:

Market opportunity.
Competition.
Financial viability.
Regulatory complexity.
Automation feasibility.
Operational requirements.
Investment needs.

Expected result: Evidence-backed investment recommendation.

Step 3 — Owner Investment Approval

The owner approves Fairhome with defined authorization and budget limits.

Expected result: A durable investment authorization record.

Step 4 — Company Launch WorkOrder

AVF generates a structured launch program containing all required workstreams.

Expected result: WorkOrders with dependencies, owners, acceptance criteria, and budgets.

Step 5 — Engineering Dispatch

AVF coordinates MyEve, Relay, and Software Factory through their verified integration contracts.

Expected result: Engineering work executes with independent verification and traceable evidence.

Step 6 — Business Formation

AVF prepares the required company formation package and coordinates authorized external steps.

Expected result: Accurate formation status supported by authoritative records.

Step 7 — Infrastructure

AVF coordinates domain registration, hosting, DNS, email, databases, and monitoring.

Expected result: Infrastructure readiness supported by actual provider evidence.

Step 8 — Revenue Infrastructure

AVF coordinates Stripe onboarding, billing logic, invoicing, and financial reconciliation.

Expected result: Verified payment workflows and accurate provider status.

Step 9 — CRM and Marketing

AVF configures customer lifecycle workflows and prepares customer acquisition infrastructure.

Expected result: Lead capture, CRM integration, attribution, and marketing readiness verified.

Step 10 — Operational Readiness

AVF validates Fairhome’s professional service workflows, customer support, case processing, and compliance requirements.

Expected result: Operational readiness report with explicit unresolved blockers.

Step 11 — Launch Decision

AVF generates a final launch recommendation.

Expected result: GO / CONDITIONAL GO / NO-GO with supporting evidence.

Step 12 — Owner Launch Approval

The owner authorizes public launch after reviewing the readiness evidence.

Expected result: Launch authorization bound to the verified release and approved operating scope.

Step 13 — Operations

AVF coordinates customer acquisition, service delivery, billing, support, and financial monitoring.

Expected result: Actual operating metrics flow into the venture dashboard.

Step 14 — Continuous Improvement

AVF evaluates performance and recommends improvements.

Expected result: Evidence-backed optimization proposals and authorized execution.

⸻

40. Final Success Metrics

AVF must measure success at three levels.

40.1 Platform Success

41. Definition of Complete

The AVF transformation is complete only when the following conditions are satisfied.

Platform

Existing infrastructure has been audited.
Venture lifecycle engine is operational.
Investment authorization is enforced.
Company Launch WorkOrders are functional.
Existing factory integrations are verified.
Durable orchestration and recovery work.
Budget controls are enforced.
Independent verification is operational.
Company Launch Control Center is functional.
Portfolio dashboard displays accurate state.

Company Creation

Company formation workflows are operational.
Domain and infrastructure workflows are operational.
Stripe onboarding workflows are operational.
CRM provisioning is operational.
Marketing workflows are operational.
Launch readiness evaluations execute.
External actions have authorization and audit controls.

Business Operations

Venture Operator framework is functional.
Customer lifecycle management works.
Revenue and expense reporting are accurate.
Business performance monitoring is operational.
Exception handling and escalation work.
Continuous improvement workflows are functional.

Fairhome

Fairhome is registered in AVF.
Investment evaluation is complete.
Launch market recommendation is evidence-backed.
Financial viability has been evaluated.
Engineering requirements are prepared.
Company Launch WorkOrder is generated.
Factory handoffs are verified.
Product and business readiness are independently assessed.
Launch blockers are visible.
Owner can make an informed investment and launch decision.

Verification

Unit tests pass.
Integration tests pass.
End-to-end tests pass.
Authorization tests pass.
Budget enforcement tests pass.
Failure recovery tests pass.
Multi-venture isolation tests pass.
Independent verification passes.
Dashboard state matches authoritative execution records.

A passing simulation demonstrates technical readiness, not completion of real-world company formation, payment activation, professional arrangements, or commercial launch. Those must be verified separately.

⸻

42. Final Execution Directive for Codex

AUTONOMOUS VENTURE FACTORY — IMPLEMENTATION MANDATE

You are responsible for implementing the Autonomous Venture Factory transformation described in this master plan.

The objective is to create a functioning platform capable of turning approved business opportunities into operational companies.

Execution Instructions

Read the entire implementation plan before modifying code.
Inspect the existing AVF repository and connected engineering systems.
Identify implemented capabilities, gaps, and dependencies.
Build an execution plan based on actual repository evidence.
Prioritize P0 capabilities.
Implement working functionality rather than documentation-only deliverables.
Reuse MyEve, Relay, Mission Control, and Software Factory wherever supported.
Avoid creating duplicate orchestration infrastructure.
Implement durable state, authorization, budget enforcement, and independent verification.
Integrate company-building workflows into the existing AVF interface.
Use Fairhome as the first end-to-end reference venture.
Build automated evaluations and regression tests.
Execute all locally authorized implementation and verification.
Continue independent workstreams when external dependencies are blocked.
Produce evidence-backed completion reports.

Autonomy Requirements

Continue autonomously without requesting routine approvals.

Do not stop after research, planning, or documentation.

Do not repeatedly ask whether to proceed with authorized development tasks.

Do not bypass existing security, financial, legal, or release controls.

Do not invent successful external actions.

Do not mark work complete without verification.

Final Deliverable

Provide:

Implemented architecture.
Repository changes.
New capabilities.
Verified integrations.
Test results.
Fairhome reference implementation.
AVF dashboard location.
Outstanding external dependencies.
Investment and launch readiness status.
Remaining implementation work.

Ultimate Acceptance Criterion

I can approve a business opportunity inside AVF, and AVF autonomously coordinates the authorized work required to establish, build, prepare, launch, and operate that business through my existing agent and software factory infrastructure.

The owner should manage investments, exceptions, and strategic decisions—not routine execution.

⸻

43. Long-Term Vision — The Autonomous Holding Company

The final objective extends beyond building individual companies.

AVF should become the operating infrastructure for an AI-native holding company.
