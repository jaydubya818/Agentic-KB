---
title: "NSCALE — WORKDAY TECHNICAL TRAINING GUIDE"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p9343
captured_at: 2026-10-15T23:24:53.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: 6456a9e1b056a33504f594c8271e92f1f977f9a3536ec765239eb01c1d07dfd4
---

NSCALE — WORKDAY TECHNICAL TRAINING GUIDE

The 5 Workday Competencies You Need to Master for the Product Manager, People Systems Role

I’ve reviewed Workday’s official documentation and training resources to help you understand what each area does, how it works, what you need to learn, and what Nscale may ask during your technical interview.

One important discovery: Workday’s official Workday Pro program lists certifications for HCM Core, Security, Integrations, HCM Reporting, and Platform Administration. Business Process Administration is a core configuration competency covered within Workday training, rather than a separately listed Workday Pro certification.  

My recommendation: Prepare as someone who will be responsible for owning, configuring, maintaining, troubleshooting, and improving Nscale’s Workday environment, not simply managing the product roadmap.


￼
What I Recommend

For your Nscale Product Manager, People Systems technical interview, we should build a complete Workday Administrator Training and Interview Preparation Guide covering all five areas.

Each section should include:

What it is — A clear explanation of the Workday functionality and terminology.
How it works — Architecture, relationships, and configuration concepts.
How to configure it — Step-by-step instructions using Workday tasks and configuration options.
Real-world Nscale scenarios — Examples involving hiring, transfers, global expansion, Greenhouse, and employee data.
Troubleshooting — Common configuration failures and how to diagnose them.
Technical interview questions — Questions a Workday administrator or People Tech director might ask.
Interview talking scripts — Natural, conversational answers with key words and phrases bolded.
Hands-on exercises — Practical scenarios to complete in an authorized Workday training tenant.

Recommended Training Order

I would organize the complete guide into these five modules:

MODULE 1 — WORKDAY CORE HCM

Workday architecture and foundational concepts
Supervisory organizations and organizational hierarchies
Position Management vs. Job Management
Job profiles, positions, and worker records
Hiring, transfers, promotions, and terminations
Effective dating and staffing transactions
Global HCM configuration

MODULE 2 — WORKDAY BUSINESS PROCESS ADMINISTRATION

Workday Business Process Framework
Business process definitions and event types
Approval steps, reviews, and notifications
Condition rules and dynamic routing
Business process security
Business process troubleshooting
Workflow optimization and automation

MODULE 3 — WORKDAY SECURITY

Workday security architecture
Role-based and user-based security groups
Domain security policies
Business process security policies
Organization-based security assignments
Integration System Users (ISUs)
Least-privilege access
Security troubleshooting and auditing

MODULE 4 — WORKDAY INTEGRATIONS

Integration architecture and design
Enterprise Interface Builder (EIB)
Workday Studio
REST and SOAP APIs
Report-as-a-Service (RaaS)
Integration security and authentication
Greenhouse-to-Workday integration
Monitoring, error handling, and reconciliation

MODULE 5 — WORKDAY REPORTING

Workday reporting architecture
Business objects and data sources
Standard vs. custom reports
Advanced and matrix reports
Calculated fields (LRV, ESI, EMI, conditional expressions)
Report filters and prompts
Report security and troubleshooting
Reporting performance optimization

One Additional Area I Would Include

Because Nscale specifically lists platform stability, testing, and release management, I would add:

MODULE 6 — WORKDAY PLATFORM ADMINISTRATION & RELEASE MANAGEMENT

This would cover tenant management, Workday’s release cycle, preview testing, regression automation, production support, integration monitoring, and change management.

This sixth module is especially relevant to your quality engineering background and gives you an opportunity to demonstrate how you could improve Nscale’s platform reliability and reduce operational costs.

Bottom line: We’ve covered portions of all five areas through the interview questions and explanations, but we have not yet completed a comprehensive, hands-on training guide for all five. The next logical step is to work through Module 1 — Core HCM, then continue sequentially through the remaining modules, including the sixth module on platform administration.

—————————⸻

1. WORKDAY CORE HCM

Priority: CRITICAL | Training Days: 1–3

What is Workday Core HCM?

Workday Human Capital Management (HCM) is the foundation of an organization’s employee management system.

It manages the employee lifecycle, including:

Hiring and onboarding
Employee records
Organizational structures
Job assignments and positions
Promotions and transfers
Compensation changes
Terminations
Workforce reporting

For Nscale, Core HCM would serve as a central source of employee and organizational information.

A. Supervisory Organizations

What they are:

Supervisory organizations represent the management hierarchy within Workday.

They determine how workers are grouped, who manages them, and how organizational relationships are structured.

For example:

Nscale

CEO
VP, Engineering
Director, Cloud Infrastructure
Engineering Manager
Software Engineers
VP, People
Director, People Tech
Product Manager, People Systems

Each management group can be represented by a supervisory organization.

Why this matters:

Supervisory organizations influence:

Reporting relationships
Business process routing
Role-based security
Staffing configuration
Organizational reporting

Workday’s documentation confirms that supervisory organizations form management hierarchies and are associated with jobs, positions, and compensation structures.  

What you need to learn

You should understand how to:

Create a supervisory organization.
Assign a manager.
Establish superior and subordinate organizations.
Configure staffing models.
Assign organizational roles.
Move workers between organizations.
Validate the resulting organizational hierarchy.

Practice scenario:

Nscale opens a new engineering division in Houston.

How would you configure the supervisory organization, assign its manager, establish reporting relationships, and prepare it for hiring?

⸻

B. Position Management vs. Job Management

This is a particularly important Workday concept.

Position Management

Position Management provides greater control over individual positions.

For example:

Nscale approves 10 software engineering positions.

Each position can be tracked independently, including whether it is open or filled.

This supports:

Headcount planning
Position-level restrictions
Vacancy tracking
Workforce budgeting
Position history

Job Management

Job Management provides greater staffing flexibility.

Rather than creating and maintaining individual positions, organizations define hiring restrictions at the supervisory organization level.

This can support organizations where staffing requirements change frequently.

Key differences

￼

Workday supports both staffing models, but each supervisory organization uses one model. Different supervisory organizations within the same hierarchy can use different models.  

What you need to learn

Workday tasks to study:

Create Supervisory Organization
Create Position
Edit Position Restrictions
Set Hiring Restrictions
Maintain Staffing Models
Hire Employee

Interview question

“What is the difference between Position Management and Job Management?”

TALKING SCRIPT

“Position Management provides greater control over individual positions, approved headcount, and workforce planning.

Job Management provides greater flexibility, allowing organizations to hire based on supervisory organization hiring restrictions rather than maintaining individual positions.

For Nscale, I would evaluate the appropriate staffing model based on workforce planning requirements, financial controls, hiring velocity, and organizational flexibility.

The important consideration is selecting a model that supports the company’s growth without creating unnecessary administrative complexity.”

⸻

C. Employee Lifecycle Configuration

You need to understand the Workday transactions that support an employee’s entire lifecycle.

￼

The exact transaction depends on the organization’s configuration and business requirements.

Hands-on practice

Scenario: An employee is promoted from Software Engineer to Engineering Manager.

Walk through:

Identify the worker.
Determine the appropriate job-change transaction.
Select the new job profile.
Confirm supervisory organization changes.
Enter the effective date.
Update compensation, where applicable.
Route required approvals.
Validate the completed transaction.
Confirm downstream integrations receive the correct information.

Official training

⁠Workday HCM Core Administrator Training — Staffing Models

Your learning objective: Be able to explain the employee lifecycle from hire through termination, including the configuration and validation required for each transaction.

⸻

2. WORKDAY BUSINESS PROCESS ADMINISTRATION

Priority: CRITICAL | Training Days: 4–5

What is the Workday Business Process Framework?

The Business Process Framework (BPF) is Workday’s configurable workflow engine.

It determines:

Who can initiate a transaction
Which approvals are required
Who receives tasks
Which conditions control routing
When notifications are sent
When a transaction is considered complete

Workday supports business process definitions containing configurable steps, approval routing, conditions, and notifications.  

A. Understanding Business Process Steps

Imagine Nscale is hiring a new engineering manager.

The process might look like this:

Step 1 — Initiation

HR initiates the hiring transaction.

Step 2 — Validation

Workday validates required information.

Step 3 — Approval

The designated manager approves the transaction.

Step 4 — Compensation Approval

Compensation approval is requested when required.

Step 5 — Completion

The hiring transaction reaches its configured completion step.

Step 6 — Downstream Actions

Appropriate notifications, integrations, or onboarding tasks are triggered.

The actual sequence depends on the configured business process definition.

Important Workday terminology

￼

B. Conditional Approval Routing

This is something Nscale may expect you to configure independently.

Example: Compensation approvals

Nscale wants the following workflow:

Salary increases below 5% require manager approval.
Increases from 5% to 10% require additional HR approval.
Increases above 10% require executive approval.

You would need to understand how to configure the relevant business process steps and condition rules to implement this policy.

What you need to learn

Study:

Business Process Definitions
Edit Business Process Definition
Business Process Configuration Options
Condition Rules
Approval Steps
Security Group Assignments
Business Process Testing

Practical exercise

Design an approval workflow for an employee promotion.

Include:

Manager approval
Conditional HR approval
Compensation review
Completion notification
Error and exception handling

Interview question

“How would you configure conditional approvals in Workday?”

TALKING SCRIPT

“I would start by understanding the business requirements and approval policies.

Next, I would review the existing business process definition, including its steps, security groups, and condition rules.

I would configure conditional routing so that approvals are triggered only when the relevant business criteria are met.

For example, a compensation change above a defined threshold might require additional approval.

I would then validate the configuration in a nonproduction environment using positive, negative, and boundary test cases.

My goal would be to reduce unnecessary approvals while preserving financial controls, security, and auditability.”

Official training

⁠Workday Business Process Framework Training

⸻

3. WORKDAY SECURITY

Priority: CRITICAL | Training Days: 6–7

What is Workday Security?

Workday security controls what users can see and what actions they can perform.

For Nscale, this is particularly important because People Systems contain sensitive information such as:

Employee personal information
Compensation
Performance records
Recruiting information
Organizational data
Payroll-related information

Workday’s configurable security framework uses security groups, domains, and business process policies to control access across the platform.  

A. Security Groups

Security groups define collections of users who can receive access to secured functionality.

Examples include:

Role-Based Security Groups

Access is associated with an organizational role.

Examples:

HR Partner
Manager
Compensation Partner

User-Based Security Groups

Specific users are assigned to the security group.

Integration System Security Groups

These can be used to grant integrations access to the resources they require.

Example

A People Operations employee needs to update employee contact information but should not have unrestricted access to compensation records.

You would evaluate the employee’s security group memberships and grant only the permissions necessary for the role.

⸻

B. Domain Security

Domain security determines access to secured data and functionality.

Examples include:

Worker personal information
Compensation information
Organization data
Reporting data
Integration-related functionality

Domain security policies can grant appropriate access to security groups.

Example

An HR administrator can view employee contact details but cannot view restricted compensation information.

You would review the relevant domain security policies and security group permissions.

⸻

C. Business Process Security

Business process security determines who can perform actions within a workflow.

For example:

Who can initiate a promotion?
Who can approve a salary increase?
Who can correct a hiring transaction?
Who can cancel a business process?
Who can reassign a task?

The distinction you must remember:

Domain Security = What data or secured functionality can I access?

Business Process Security = What actions can I perform in a workflow?

Workday documents these as distinct security mechanisms.  

⸻

D. Security Troubleshooting

Scenario: A manager cannot view compensation information for a direct report.

Your troubleshooting approach:

Confirm the manager’s organizational relationship.
Identify the expected security group membership.
Review relevant domain security policies.
Determine whether the required permissions exist.
Check whether any changes need to be activated.
Test the resulting access using an approved method.
Verify that the change does not expose unauthorized employee data.

Interview question

“How would you troubleshoot missing security access in Workday?”

TALKING SCRIPT

“I would start by identifying what the user is trying to access and what permissions their role should have.

Next, I would review their security group memberships, organizational assignments, and applicable domain security policies.

If the issue involves an approval or workflow action, I would also review the relevant business process security policy.

I would validate the correction using the appropriate security testing tools and ensure the change follows least-privilege principles.

My objective would be to resolve the access issue without creating unnecessary security exposure.”

Official training

⁠Workday Security for Administrators

⸻

4. WORKDAY INTEGRATIONS

Priority: HIGH | Training Days: 8–10

What are Workday Integrations?

Workday integrations allow employee information to move between Workday and other enterprise systems.

For Nscale, these could include:

Greenhouse
Payroll providers
Identity management systems
Benefits providers
Finance applications
IT service management systems
Data analytics platforms

The job description specifically emphasizes integrations, automations, and data flows.

This makes integrations one of the most important areas for you.

A. Enterprise Interface Builder (EIB)

EIB is used for relatively straightforward inbound and outbound integrations.

Example

Nscale needs to send an employee data file to a benefits provider every night.

An outbound EIB may be appropriate.

What to learn:

Inbound vs. outbound EIB
Data sources
File formats
Scheduling
Transformation
Integration security
Error handling

Practice scenario:

Design a daily employee export that includes only authorized worker information.

⸻

B. Workday Studio

Workday Studio is an integration development environment used for more complex requirements.

Example

Nscale needs to integrate employee information across multiple applications.

The integration requires:

Multiple API calls
Conditional processing
Data transformations
Error handling
Retry logic
Multiple destination systems

Studio may be appropriate when simpler integration approaches cannot satisfy the requirements.

What to learn

Integration architecture
Data transformation
Orchestration
Error handling
Integration testing
Deployment and maintenance

Given your engineering background, you should be comfortable discussing these concepts.

The Workday-specific implementation details are what you need to study.

⸻

C. Workday APIs

Workday provides APIs for interacting with supported resources and operations.

REST APIs

Useful for supported modern application integration scenarios.

SOAP APIs

Used extensively across Workday web services.

Example

Nscale needs to synchronize approved employee changes with an external application.

You would evaluate the available API operations, authentication, security, data requirements, and transaction semantics.

⸻

D. Report-as-a-Service (RaaS)

RaaS allows supported custom reports to be exposed through web-service endpoints.

Example

Nscale wants to populate an internal employee directory with approved employee information.

A secured custom report exposed through RaaS could be an option.

You would evaluate:

Reporting requirements
Data freshness
Security
Authentication
Performance
Whether an API or integration is more appropriate

⸻

E. Greenhouse-to-Workday Integration

This is the integration I would prioritize most for your Nscale interview.

Example workflow

Greenhouse → Candidate Hired → Integration → Workday Hire → Employee Onboarding

You should be prepared to explain:

How a hiring event is detected.
How candidate data is validated.
How duplicate records are prevented.
How the Workday hiring transaction is initiated.
How business process approvals are handled.
How errors are detected.
How data is reconciled.
How downstream systems receive authorized information.

Interview question

“How would you integrate Greenhouse with Workday?”

TALKING SCRIPT

“I would begin by defining system ownership and the employee lifecycle data model.

Greenhouse would manage recruiting information, while Workday would become the authoritative source for employee records.

I would design a secure integration that validates required candidate information before initiating the appropriate Workday hiring transaction.

I would also implement duplicate prevention, error handling, retry controls, and reconciliation.

Given my background in enterprise integrations, automation, and quality engineering, I would emphasize automated end-to-end testing and operational monitoring.

My goal would be to create a reliable recruiting-to-hire workflow that minimizes manual intervention and supports Nscale’s global growth.”

Certification to investigate

⁠Workday Pro — Integrations Certification

⸻

5. WORKDAY REPORTING AND CALCULATED FIELDS

Priority: HIGH | Training Days: 11–12

What is Workday Reporting?

Workday reporting allows organizations to retrieve, analyze, and distribute business information.

For Nscale, reporting could support:

Global headcount
Hiring trends
Employee turnover
Compensation analysis
Organizational growth
Workforce planning
People Systems operational metrics

A. Business Objects

A business object represents a type of information within Workday.

Examples:

Worker
Position
Supervisory Organization
Job Profile
Compensation

Business objects have relationships to other business objects.

Example

A Worker can be associated with:

A supervisory organization
A job profile
A position
A manager
Compensation information

Understanding these relationships is essential when creating reports.

⸻

B. Data Sources

A data source determines the population of records available to a report.

For example:

A report designed to show active employees needs a data source appropriate for the required worker population.

You must understand how the selected data source affects:

Which records appear
Available fields
Reporting performance
Security
Business object relationships

⸻

C. Calculated Fields

Calculated fields allow you to derive information that may not exist as a directly available report field.

Three particularly important types are:

1. Lookup Related Value (LRV)

Purpose: Retrieve a value from a related business object.

Example:

You are building a worker report and want to display information associated with the worker’s manager.

An LRV may help retrieve the required related value.

Remember:

LRV = Retrieve a related value.

⸻

2. Extract Single Instance (ESI)

Purpose: Extract one instance from a collection of related instances.

Example:

A worker has multiple related records, and your reporting requirement needs one record meeting specific criteria.

An ESI calculated field can help select the appropriate instance.

Remember:

ESI = Select one instance from multiple instances.

⸻

3. Extract Multi-Instance (EMI)

Purpose: Extract multiple instances from a collection based on defined criteria.

Example:

You need a subset of related records that meet particular conditions.

An EMI calculated field can help return that collection.

Remember: EMI = Return multiple qualifying records from a collection.

Unlike ESI (Extract Single Instance), which returns one matching record, EMI (Extract Multi-Instance) returns a collection of matching records.

Example — Employees with Multiple Job Changes

Suppose Nscale wants a report showing all job changes an employee experienced during the past 12 months.

An employee might have the following history:
￼

You want to extract only the qualifying job change transactions within a specified date range.

How EMI works:

Business Object: Worker
Related Multi-Instance Field: Relevant worker business process or job change history collection
Filter Conditions: Transaction type, status, and effective date
Result: A collection containing the qualifying transactions

The exact related field and available filters depend on the Workday business object and tenant configuration.

When Would You Use EMI?

Use Extract Multi-Instance when you need to:

Retrieve multiple qualifying job changes.
Identify all active positions associated with a worker.
Extract relevant compensation history records.
Filter a collection of employee-related transactions.
Return multiple qualifying records for a custom report.

Interview Talking Script

“An Extract Multi-Instance calculated field is useful when I need to retrieve multiple related records that satisfy specific conditions.

For example, if I wanted to analyze employee job changes over the past year, I could use an EMI calculated field to identify the qualifying transactions from the employee’s history.

The key difference between ESI and EMI is that ESI returns one qualifying instance, while EMI returns multiple qualifying instances.

I would select the appropriate calculated field based on the reporting requirements, the underlying business object, and whether the output needs a single record or a collection.”

⸻

4. LOOKUP RELATED VALUE (LRV)

Purpose: Retrieve a field value from a related business object.

This is one of the most important Workday calculated field types to understand.

Example — Retrieve an Employee’s Manager’s Email Address

Suppose Nscale wants a custom report containing:

Employee name
Employee ID
Department
Manager name
Manager email address

The report uses the Worker business object.

The employee’s manager is a related worker record.

An LRV calculated field can retrieve the manager’s email address through that relationship.

How LRV Works

Step 1 — Identify the starting business object

Worker

Step 2 — Identify the related business object

Manager, represented through the relevant worker relationship.

Step 3 — Identify the field you want to retrieve

Manager’s work email address.

Step 4 — Create the calculated field

Configure an LRV calculated field using the appropriate lookup relationship and return field.

Step 5 — Add the field to the report

The report can now display the manager’s email address alongside the employee information.

When Would You Use LRV?

Retrieve manager information.
Retrieve supervisory organization attributes.
Retrieve department information.
Retrieve related position information.
Retrieve company or location attributes.
Access values from related business objects.

Interview Talking Script

“Lookup Related Value, or LRV, allows me to retrieve a specific value from a related business object.

For example, if I’m building an employee report and need to include the employee’s manager’s email address, I can use an LRV calculated field to retrieve that information through the appropriate worker relationship.

LRV is particularly useful when building custom reports and integrations that require information across related Workday business objects.”

⸻

5. CONDITIONAL EXPRESSIONS

Purpose: Return different values depending on whether specified conditions are satisfied.

Conditional expressions are useful for applying business logic to reporting.

Example — Identify Employees Eligible for an Onboarding Program

Suppose Nscale wants to identify employees who meet the following conditions:

Employee is active.
Employee was hired within the past 90 days.
Employee is located in the United States.

The calculated field evaluates those conditions and returns an appropriate result.

Conceptually:

The exact implementation depends on the available Workday calculated field functions and data types.

When Would You Use Conditional Expressions?

Classify employees based on business rules.
Identify onboarding eligibility.
Categorize workers by employment status.
Flag missing or inconsistent data.
Support reporting and integration transformations.

Interview Talking Script

“Conditional calculated fields allow me to apply business logic to Workday reporting.

For example, I could create a calculated field that identifies employees who meet specific onboarding criteria based on their employment status, hire date, and location.

This can support operational reporting, data quality monitoring, and integration requirements.

I would also consider whether the requirement can be met through standard report filters before introducing additional calculated field complexity.”

⸻

6. COMPARING LRV, ESI, EMI, AND CONDITIONAL CALCULATED FIELDS

￼

Easy Way to Remember

LRV = Look up a related value.

ESI = Extract one record.

EMI = Extract multiple records.

Conditional Expression = Apply IF/THEN logic.

⸻

7. REAL-WORLD NSCALE SCENARIO — EMPLOYEE DATA QUALITY REPORT

Imagine Nscale is expanding globally and wants a report that identifies employee records requiring administrative attention.

The People Systems team wants to identify:

Employees missing manager information.
Employees assigned to incorrect supervisory organizations.
Employees with incomplete onboarding information.
Employees with recent job changes.
Employees whose data may require synchronization with downstream systems.

You could combine different calculated field types to support this report.

LRV: Retrieve related manager or organizational attributes.

ESI: Identify the most recent qualifying job change.

EMI: Retrieve a collection of qualifying job changes within a specified period.

Conditional Expression: Classify records based on defined data quality conditions.

The final report could help the People Systems team identify potential problems before they affect payroll, onboarding, reporting, or integrations.

Interview Talking Script

“One practical application of Workday calculated fields would be creating an employee data quality dashboard.

I would use LRV fields to retrieve related organizational information, ESI to identify individual transactions, and EMI to analyze collections of related records.

I could also use conditional expressions to flag employees whose records meet specific exception criteria.

This would allow the People Systems team to proactively identify data quality issues, reduce manual reconciliation, and improve the reliability of downstream integrations.

Given my background in quality engineering and automation, I would also look for opportunities to automate exception monitoring and establish measurable data quality metrics.”

⸻

8. TECHNICAL INTERVIEW QUESTIONS — WORKDAY CALCULATED FIELDS

Question 1: What is the difference between ESI and EMI?

Answer:

“ESI returns a single qualifying instance from a collection, while EMI returns multiple qualifying instances.

I would use ESI when I need one specific record, such as the most recent qualifying job change.

I would use EMI when I need a collection of records, such as all qualifying job changes during a reporting period.”

Question 2: When would you use LRV?

Answer:

“I would use Lookup Related Value when I need to retrieve information from a related business object.

For example, I might use LRV to retrieve an employee’s manager’s email address for a custom report or downstream integration.”

Question 3: How do you troubleshoot a calculated field that returns no data?

Answer:

“I would start by verifying the business object and related field configuration.

Next, I would confirm that the underlying records contain the expected data.

I would also review filter conditions, effective dates, security permissions, and calculated field dependencies.

Finally, I would test the field using a small set of known records to isolate the issue.”

Question 4: How would you improve the performance of a complex Workday report?

Answer:

“I would review the report’s data source, filters, calculated fields, and related business object relationships.

I would look for unnecessary calculations, repeated lookups, and large multi-instance collections.

Where possible, I would simplify the report design, use appropriate filters, and reduce the volume of data being processed.

I would then validate performance and confirm that the optimized report still produces accurate results.”

Question 5: How would you use calculated fields in a Greenhouse-to-Workday integration?

Answer:

“Calculated fields can help expose or derive the information required for downstream integrations.

For example, I might use calculated fields to retrieve related organizational attributes, identify qualifying employee records, or classify workers based on defined business rules.

I would ensure that the integration uses consistent data definitions, appropriate security permissions, and automated validation.

For inbound Greenhouse-to-Workday transactions, I would evaluate the integration’s mapping and transformation capabilities rather than assuming calculated fields alone can handle the required transformations.”

⸻

WHAT YOU SHOULD MASTER BEFORE THE NSCALE INTERVIEW

For Workday reporting and calculated fields, I would focus on five capabilities:

Business Objects: Understand how Workday organizes employee, position, organization, and transaction information.
Data Sources: Understand how report data sources determine which records and fields are available.
Calculated Fields: Explain LRV, ESI, EMI, and conditional expressions.
Security: Understand why users may see different report results based on their permissions.
Integrations: Understand how custom reports and calculated fields can support downstream data exchanges.

Your goal is to confidently explain not only what each calculated field does, but also when to use it, how to validate it, and how to troubleshoot it.
