---
title: "Code Review Architecture module core design"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p8469
captured_at: 2026-09-07T21:36:25.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: b5f1b7a442c342d1531716c0dec50d4cbfbec9ea4fa806b5390582c8b123a3a4
---

Code Review Architecture module, the core design should be:

￼

PR / Change → Repo Classification → Context Assembly → Policy + Skills → Model/Capability Routing → AI Review → Deterministic Checks → Repository-Specific Learning → Evidence → Human Review → Outcome Feedback

And the big talking points should be:

Global Adobe standards
Product/domain standards
Repository-specific context
Polyglot support
Historical accepted/rejected review comments
Model routing by workload
Cost per accepted finding
Build vs. adopt commercial reviewers
Repo-specific learning without fine-tuning every repo
Independent verification
Human authority
Continuous improvement

The key line for that section:

“The platform stays common. The intelligence becomes progressively more repository-specific.”

ADOBE META FACTORY — CODE REVIEW ARCHITECTURE STUDY GUIDE

This is a high-priority topic for your onsite because Shibu repeatedly pushed on the concrete Adobe problem:

100,000+ repositories → polyglot ecosystem → radically different codebases → repository-specific practices → token economics → learning → build vs. adopt.

Your core thesis should be:

“I would not build one giant Adobe-specific reviewer that tries to understand 100,000 repositories. I would build a common review platform with progressively specialized context, policy, skills, evaluation, and learning.

The platform stays common. The intelligence becomes progressively more repository-specific.”

⸻

Architecture to memorize

PR / Change
↓
Repository Classification
↓
Context Assembly
↓
Policy + Skills
↓
Model / Capability Routing
↓
AI Review
↓
Deterministic Verification
↓
Findings + Evidence
↓
Human Review / Merge
↓
Outcome Signals
↓
Repository Learning
↓
Evaluate Candidate vs. Baseline
↓
Governed Promotion

⸻

1. “DESIGN A CODE-REVIEW PLATFORM FOR 100,000+ ADOBE REPOSITORIES.”

TALKING SCRIPT

“I’d start by rejecting one assumption: I would not try to make one model understand every Adobe repository equally well.

I’d build a common review platform and progressively specialize the intelligence.

When a PR arrives, we first classify the repository and change: language, framework, product area, ownership, sensitivity, change type, size, and risk.

Then we assemble context at three levels.

Adobe-wide context gives us enterprise security policies, engineering standards, and common review practices.

Product or domain context gives us architecture patterns, frameworks, shared components, and known failure modes.

Repository context gives us CODEOWNERS, repository instructions, dependency information, tests, build configuration, historical PRs, accepted and rejected review findings, and local conventions.

Then the router selects the appropriate models, skills, tools, and review strategy based on that workload.

Deterministic checks run wherever possible: compile, tests, linters, SAST, secret scanning, dependency and policy checks.

AI review handles the semantic problems that deterministic systems can’t reliably answer.

Findings must include evidence, location, reasoning, severity, and confidence, not just generic comments.

Humans retain merge authority.

Finally, we capture what happened after the review and use those outcomes to improve repository-specific behavior.

So the architecture is centralized where Adobe needs scale and governance, and specialized where teams need local intelligence.”

⸻

2. “WHY NOT JUST USE GITHUB COPILOT, CURSOR, CODERABBIT, OR ANOTHER COMMERCIAL REVIEWER?”

This is the question Shibu was trying to get you to answer.

TALKING SCRIPT

“I absolutely would evaluate them.

I wouldn’t begin with the assumption that Adobe needs to build a proprietary reviewer.

I’d create a representative benchmark across Adobe’s repository distribution and measure existing products against review quality, false positives, security, language coverage, context integration, latency, economics, enterprise controls, and extensibility.

If an external product gives us excellent generic code review, I’d rather adopt it than recreate commodity capability.

Where Adobe may need to build is around its differentiated requirements: Adobe-specific context and policy, repository-specific learning, secure execution, evaluation, routing, evidence, and integration with the broader Meta Factory.

So this could easily become a hybrid architecture.

Adopt commodity. Build differentiation.”

FOLLOW-UP: “When would you build the reviewer?”

“When evaluation demonstrates a strategic capability gap that external systems can’t economically or safely close.”

⸻

3. “HOW DO YOU MAKE REVIEW REPOSITORY-SPECIFIC?”

TALKING SCRIPT

“I’d use layered context.

At the bottom is the common Adobe platform.

Above that is product and domain knowledge.

At the top is repository-specific intelligence.

For a particular repository, I’d make available things like CODEOWNERS, architecture decisions, symbols, dependency graphs, build configuration, repository instructions, tests, historical PRs, review comments, accepted findings, rejected findings, incidents, and previous fixes.

But I wouldn’t blindly put all of that into the context window.

Context assembly should retrieve the minimum sufficient information relevant to the specific change.

That’s how you get repository specialization without maintaining 100,000 separate models.”

⸻

4. “WOULD YOU FINE-TUNE A MODEL FOR EVERY REPOSITORY?”

TALKING SCRIPT

“No. That would probably be one of the last things I’d do.

I’d begin with retrieval, repository metadata, versioned skills, and repository-specific instructions because they’re easier to update, inspect, evaluate, and reverse.

Then I’d measure where those mechanisms consistently fail.

If a family of repositories exhibits a stable behavioral pattern that context engineering can’t solve efficiently, then fine-tuning or another adaptation technique becomes worth evaluating.

But evaluation should justify that additional operational complexity.

I would use the least irreversible mechanism that meets the quality bar.”

⸻

5. “HOW DO YOU HANDLE ADOBE’S POLYGLOT ENVIRONMENT?”

TALKING SCRIPT

“I would keep the platform common while making the review capabilities composable.

Repository classification tells us the languages, frameworks, build systems, dependencies, and relevant engineering domain.

That determines which parsers, static analyzers, linters, test runners, security scanners, skills, context sources, and models become eligible.

A C++ Photoshop repository shouldn’t go through exactly the same review path as a small TypeScript microservice.

They share the control plane, evaluation infrastructure, evidence model, policy framework, and learning architecture.

But the actual review pipeline can be workload-specific.

Standardize the platform, not every review path.”

⸻

6. “HOW WOULD YOU HANDLE SOMETHING AS LARGE AS PHOTOSHOP?”

TALKING SCRIPT

“I wouldn’t attempt to load an enormous mature codebase into a model context.

I’d start with the change surface and progressively expand context.

First the diff.

Then affected symbols and call relationships.

Then direct dependencies.

Then tests and ownership.

Then relevant architecture and historical changes.

Only expand farther when the task requires it.

A code graph or symbol index becomes especially useful here because we’re navigating the structure rather than treating the repository as a bag of text.

For large architectural changes, I may also decompose the review into specialized passes and synthesize the findings.

Context should expand with uncertainty, not repository size.”

⸻

7. “HOW DO YOU PREVENT PROMPT INJECTION FROM REPOSITORY CONTENT?”

TALKING SCRIPT

“I treat repository content as untrusted input.

Comments, README files, issues, source code, test fixtures, dependencies, or generated files could contain adversarial instructions.

Retrieved content therefore cannot become authority.

System policy lives outside the model.

Tool authorization lives outside the model.

Secrets remain outside model context.

Execution happens in a sandbox with bounded permissions and restricted egress.

And consequential operations require deterministic policy enforcement.

Even if malicious repository content manipulates the model, it should still encounter hard authorization boundaries.

Prompt injection is ultimately an authority problem, not merely a prompting problem.”

⸻

8. “HOW WOULD MODEL ROUTING WORK FOR CODE REVIEW?”

TALKING SCRIPT

“I wouldn’t route solely by PR size.

I’d consider language, framework, change type, complexity, context requirements, security sensitivity, required reasoning depth, historical model performance, latency, availability, and cost.

A formatting or documentation change might need little or no LLM reasoning.

A straightforward localized bug may use an efficient general-purpose model.

A complex architectural refactor may justify a stronger reasoning model.

Security-sensitive changes might invoke specialized capabilities or multiple independent reviewers.

Most importantly, routing should learn from actual outcomes.

If one model costs half as much but produces twice as many false positives and human corrections, it isn’t cheaper.

Optimize for cost per accepted finding or accepted outcome, not cost per token.”

⸻

9. “HOW DO YOU CONTROL TOKEN COST?”

TALKING SCRIPT

“I’d attack token economics in several places.

First, don’t use an LLM for deterministic checks.

Second, retrieve minimum sufficient context rather than dumping repositories into prompts.

Third, route workloads to the cheapest capability that reliably meets the quality bar.

Fourth, cache reusable context and computation where appropriate.

Fifth, avoid repeatedly analyzing unchanged files.

Sixth, bound self-correction loops and detect repeated failures.

And finally, measure economics relative to accepted outcomes.

A cheap review that generates noise and wastes developer time isn’t actually cheap.”

⸻

10. “WHAT SHOULD BE DETERMINISTIC?”

TALKING SCRIPT

“As much as possible.

Compilation, formatting, linting, unit tests, integration tests, dependency checks, secret detection, license checks, policy validation, known security rules, and schema checks should generally be deterministic.

I use model reasoning for the things that require interpretation, architectural judgment, semantic understanding, ambiguity, or synthesis.

That division improves reliability and economics.

Use models for ambiguity. Use deterministic systems for certainty.”

⸻

11. “HOW DO YOU REDUCE FALSE POSITIVES?”

TALKING SCRIPT

“False positives are one of the fastest ways to destroy adoption.

I’d attack them through repository-specific context, severity thresholds, confidence thresholds, historical outcomes, better evaluation, and feedback from developers.

I also wouldn’t require every possible observation to become a PR comment.

Findings should be prioritized according to actionability, severity, confidence, and likely developer value.

Then we measure whether the author acted on the finding.

If a category is repeatedly ignored or rejected, that’s evidence the reviewer needs improvement.

The objective isn’t maximum findings. It’s maximum useful findings.”

⸻

12. “HOW DO YOU KNOW WHETHER A REVIEW COMMENT WAS GOOD?”

TALKING SCRIPT

“I want outcome signals beyond thumbs-up and thumbs-down.

Did the developer modify the code because of the finding?

Was the finding accepted or dismissed?

Did the PR merge afterward?

Was the same problem caught later by another reviewer?

Did a related production incident occur?

Was the recommendation reversed?

Human feedback is useful, but behavioral outcomes are often stronger signals.

I’d combine explicit feedback with observed outcomes to construct the learning signal.”

⸻

13. “HOW DOES EACH REPOSITORY LEARN OVER TIME?”

TALKING SCRIPT

“I separate memory, learning, and promotion.

Memory gives the reviewer access to relevant repository history.

Learning analyzes outcomes such as accepted findings, rejected findings, author corrections, incidents, rollbacks, and review behavior.

From those patterns, the system can propose improvements to skills, prompts, retrieval strategies, policies, routing, or evaluation cases.

Candidate behavior then gets tested against both repository-specific and global evaluation sets.

Only improvements that outperform the baseline without unacceptable regressions get promoted.

Learning can be autonomous. Promotion should be governed.”

⸻

14. “WHAT DOES THE EVALUATION SYSTEM LOOK LIKE?”

TALKING SCRIPT

“I’d maintain evaluation sets at multiple levels.

Global Adobe evals cover enterprise security and engineering expectations.

Domain evals cover product and language-specific behavior.

Repository evals capture local patterns and important historical failures.

And production trajectories continuously contribute candidate evaluation cases.

For every significant change to the reviewer, model, skill, prompt, context strategy, or router, I’d compare candidate behavior against the baseline.

Metrics include precision, recall where measurable, false-positive rate, accepted findings, missed critical findings, human correction, latency, and cost.

I don’t want to ship reviewer changes because they feel better.

I want evidence.”

⸻

15. “WHAT IF A MODEL PROVIDER GOES DOWN?”

TALKING SCRIPT

“The capability registry should know which evaluated models are eligible for each workload class.

If the preferred provider fails, the router can choose a pre-evaluated fallback, queue the work, or degrade the review depending on the requirement.

But I would never automatically route security-sensitive review to an arbitrary available model simply because the primary model is unavailable.

Availability doesn’t override the quality or policy bar.”

⸻

16. “HOW DO YOU SECURE THE CODE-REVIEW SYSTEM?”

TALKING SCRIPT

“I’d use defense in depth.

Repository content is untrusted.

Context retrieval is permission-aware.

Tools are explicitly authorized.

Credentials are short-lived.

Execution is sandboxed.

Network egress is restricted.

Secrets are kept outside model context.

Policy enforcement occurs outside the model.

Models and skills are versioned.

Every consequential action and finding produces auditable evidence.

And for higher-risk changes, I’d require independent verification and human authority.

The model can recommend. The platform controls authority.”

⸻

17. “WHERE SHOULD HUMANS BE INVOLVED?”

TALKING SCRIPT

“I would make human involvement risk-based, not uniform.

The AI reviewer can automatically surface evidence and recommendations.

Low-risk findings may simply inform the developer.

Higher-risk security or architectural findings may require explicit acknowledgment or specialist review.

But humans retain responsibility for accepting the change and ultimately merging it.

The important thing is that we’re not asking the developer to rubber-stamp AI output.

We should give them enough evidence to make an informed decision.

Human-in-the-loop should mean human authority, not human ceremony.”

⸻

18. “HOW WOULD YOU ROLL THIS OUT?”

TALKING SCRIPT

“I wouldn’t turn it on across 100,000 repositories.

I’d start with a small set of design partners representing different workload classes.

Maybe a modern service, a mature large codebase, a security-sensitive repository, and a few different language ecosystems.

Establish baseline review behavior first.

Run the AI reviewer initially in shadow or advisory mode.

Measure quality, false positives, latency, cost, and developer reaction.

Then progressively increase visibility and capability.

At the same time, I’d build migration tooling and paved paths so onboarding becomes increasingly automated.

Blast radius should grow with evidence.”

⸻

19. “HOW DO YOU MEASURE WHETHER THIS IS WORKING?”

TALKING SCRIPT

“I’d measure three categories.

Quality: accepted findings, false-positive rate, critical defects caught, defect escape rate, human correction, and regression rate.

Economics: cost per accepted finding, token usage, latency, retries, and developer time consumed.

Impact: review cycle time, time to merge, production incidents, developer satisfaction, repeat usage, and adoption.

I’d be particularly careful with adoption.

High adoption combined with high noise isn’t success.

A review platform succeeds when developers trust its findings enough to change their behavior.”

⸻

20. “HOW DOES CODE REVIEW FIT INTO META FACTORY?”

TALKING SCRIPT

“I think code review is one of the most important workflows in Meta Factory because implementation is becoming cheaper while verification is becoming more valuable.

Meta Factory may generate or modify increasingly large amounts of software.

That means verification cannot remain proportional to human implementation effort.

Code review becomes part of a broader verification plane alongside tests, security analysis, policy validation, dynamic evaluations, and independent verification.

It also creates one of the richest learning signals in the factory because we can observe what the agent produced, what the reviewer found, what the developer accepted, what changed, and what ultimately happened.

So code review isn’t simply a feature.

It becomes part of the trust and learning infrastructure for autonomous software delivery.”

⸻

THE 5 QUESTIONS I WOULD EXPECT THEM TO PUSH HARDEST

If you have limited study time, master these first:

1. Why build anything when commercial code-review agents already exist?

“Benchmark first. Adopt commodity. Build Adobe differentiation.”

2. How do you support 100,000 heterogeneous repositories?

“Common platform, progressively specialized intelligence.”

3. How does a repository-specific reviewer learn?

“Memory → Outcomes → Candidate Improvement → Evaluation → Governed Promotion.”

4. How do you control cost?

“Minimum sufficient context + deterministic checks + workload routing + bounded loops → cost per accepted outcome.”

5. How do you make it trustworthy?

“Untrusted repository content + external policy enforcement + bounded execution + layered verification + evidence + human authority.”

⸻

WHITEBOARD DESIGN TO MEMORIZE

If they hand you a board and say “Design Adobe’s code-review platform,” draw this:

                     PR / CHANGE
                         │
                         ▼
              REPOSITORY CLASSIFIER
       language │ product │ risk │ change type
                         │
                         ▼
                 CONTEXT ASSEMBLY
                         │
       ┌─────────────────┼─────────────────┐
       ▼                 ▼                 ▼
 ADOBE GLOBAL        PRODUCT/DOMAIN       REPOSITORY
 standards           architecture         history
 security            frameworks           CODEOWNERS
 policies            shared patterns      tests
                                               
                         │
                         ▼
                POLICY + SKILL LAYER
                         │
                         ▼
              MODEL/CAPABILITY ROUTER
       quality │ cost │ latency │ security │ evals
                         │
                         ▼
                    AI REVIEW
                         │
             ┌───────────┴───────────┐
             ▼                       ▼
      SEMANTIC REVIEW        DETERMINISTIC CHECKS
      architecture           compile / tests
      correctness            lint / SAST
      maintainability        secrets / policy
             │                       │
             └───────────┬───────────┘
                         ▼
                 FINDINGS + EVIDENCE
                         │
                         ▼
                   HUMAN REVIEW
