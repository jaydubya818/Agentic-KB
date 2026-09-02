---
title: "GSD's Deviation Rules Are a Permission Policy — Evaluate Every Orchestrator Against Them"
type: synthesis
sources:
  - "[[frameworks/framework-gsd]]"
  - "[[concepts/permission-modes]]"
  - "[[concepts/guardrails]]"
  - "[[patterns/pattern-plan-execute-verify]]"
  - "[[patterns/pattern-minimal-permissions]]"
  - "[[patterns/pattern-confirm-before-destructive]]"
question: "The Tool Use MoC defines permission modes and guardrails abstractly; the Orchestration MoC carries GSD's four Deviation Rules as a hot-cache note. Are the Deviation Rules a concrete instance of a permission policy, and if so, why does no other orchestration framework in the KB get evaluated against the same taxonomy?"
tags: [orchestration, tool-use, safety, human-in-the-loop, gsd, agentic, pattern-safety]
created: 2026-09-02
updated: 2026-09-02
status: draft
confidence: medium
reviewed: false
reviewed_date: ""
---

## Question

[[frameworks/framework-gsd|GSD]]'s Executor ships four Deviation Rules (auto-fix bugs, auto-add missing critical functionality, auto-fix blocking issues, STOP for architectural changes). [[concepts/permission-modes]] and [[concepts/guardrails]] describe permission tiers and action guardrails as general theory. The two live in different MoCs and never cite each other. Is the Deviation Rule set just a permission policy with domain-specific vocabulary — and if it is, should it become the shared rubric every orchestration framework in the KB is scored against?

## Argument

The GSD Deviation Rules are an action-guardrail policy expressed in the language of software delivery rather than the language of tool access, and the two vocabularies map one-to-one. Rules 1–3 are an *allow list* keyed on intent class (bug fix, missing critical functionality, blocking dependency) instead of on tool name; Rule 4 is a *hard stop* keyed on blast radius (new table, framework swap) — exactly the "action guardrail before destructive actions" layer in [[concepts/guardrails]] and exactly the boundary that [[concepts/permission-modes]] draws between `acceptEdits` and human confirmation. The "3 failed fix attempts → document and move on" clause is a retry budget, which is the same mechanism [[patterns/pattern-confirm-before-destructive]] and [[concepts/agent-failure-modes]] describe as the cure for infinite fix loops. What GSD adds that the abstract pages lack is the *classification step*: the executor must first label its intended change by intent class before the permission tier applies. Claude Code's permission modes classify by tool (Read, Write, Bash, Agent); GSD classifies by consequence. Consequence-keyed classification is the more useful primitive for orchestration, because a `Write` can be a one-line bug fix or a schema migration, and only the second should trip the human gate.

That makes the Deviation Rules the most reusable, already-validated permission policy in the KB, and it is currently unreachable from the Tool Use MoC. Every other orchestration framework catalogued in [[mocs/orchestration]] — [[frameworks/framework-bmad|BMAD]], [[frameworks/framework-langgraph|LangGraph]], [[frameworks/framework-crewai|CrewAI]] — either has no explicit stop rule or buries one in framework-specific config. Scoring each against the four-rule taxonomy ("what does it auto-fix, what does it auto-add, what does it retry, where does it stop?") would convert a vague "does it have guardrails?" evaluation column into four testable yes/no cells and expose which frameworks silently default to `bypassPermissions`-equivalent behaviour.

## Evidence

- `wiki/hot.md` §"GSD Deviation Rules (Executor)" — Rules 1–4 plus the three-attempt retry budget. This is the only place in the KB where a permission policy is stated as a numbered, executable rule set.
- [[concepts/permission-modes]] — four Claude Code modes from `default` to `bypassPermissions`; classification is by tool type, with confirmation as the gate. The page names [[patterns/pattern-minimal-permissions]] and [[concepts/guardrails]] as related but does not cite GSD.
- [[concepts/guardrails]] — layer model `input → LLM → output → action`; "Action Guardrails ← before destructive actions, permission checks." Rule 4 is a textbook action guardrail. The page cites NeMo Guardrails and Rebuff, not any orchestration framework.
- [[frameworks/framework-gsd]] — describes Executors as implementing "phase work within guardrails" and names `pattern-architecture-first` as related, but the Deviation Rules themselves appear only in the hot cache, not on the framework page. `[UNVERIFIED]` whether the GSD source repo states the rules in exactly this four-part form or whether the hot-cache text is a KB paraphrase.
- [[patterns/pattern-plan-execute-verify]] — the loop GSD's Executor runs inside. Deviation Rules are the policy that decides when the loop may self-correct versus when it must exit to a human.

## Counter-arguments & Gaps

**The mapping may be lossy in the other direction.** Permission modes govern *who confirms*; Deviation Rules govern *what class of change is allowed*. GSD says nothing about read-vs-write tool scope, network access, or worktree isolation ([[patterns/pattern-worktree-isolation]]), so treating the four rules as a complete permission policy would leave the tool-scope half unspecified. The synthesis in [[syntheses/synthesis-worker-tool-scope-ownership]] argues that scope ownership is itself unresolved; Deviation Rules do not settle that question, they sit beside it.

**Intent classification is not free.** Rules 1–3 assume the executor can reliably label a change as "bug fix" versus "architectural." That label is produced by the same model whose judgment the rule is meant to constrain — a self-grading problem the KB already flags in [[concepts/agent-evaluation-gaming]]. Tool-keyed permissions (Claude Code's approach) are cruder but cannot be gamed by relabelling a migration as a bug fix. `[UNVERIFIED]` whether any GSD run has ever misclassified an architectural change under Rule 1–3; no trajectory in `raw/` records one.

**Single-source provenance.** The four-rule form comes from one framework's docs. The 2-source rule (CLAUDE.md Rule 14) means this cannot graduate to a `patterns/pattern-consequence-keyed-permissions` page until a second, independent framework or paper states an equivalent policy. Anthropic's own tiering of `acceptEdits` versus Bash confirmation is a partial second source but is tool-keyed, not consequence-keyed.

**What the evidence does NOT show.** No evaluation page in [[mocs/evaluation]] has scored BMAD, LangGraph, or CrewAI against the four rules, so the claim that they "silently default to bypass-equivalent behaviour" is an inference from absence, not a finding.

## Conclusion

Position: the GSD Deviation Rules are a consequence-keyed action-guardrail policy and belong in the Tool Use MoC as the canonical worked example of [[concepts/permission-modes]] applied at orchestration level; the two concept pages should cite `hot.md` §Deviation Rules and [[frameworks/framework-gsd]] should carry the rules on the page itself rather than only in the cache. Remaining uncertainty: whether consequence-keyed classification is robust enough to be trusted without a tool-keyed backstop. Next round: add a four-column "Deviation Rule coverage" row to [[evaluations/eval-orchestration-frameworks]] and fill it for GSD, BMAD, LangGraph, CrewAI from their primary docs — that produces the second source needed to graduate the pattern, or falsifies the claim that GSD is unusual.

## Sources

- [[frameworks/framework-gsd]]
- [[concepts/permission-modes]]
- [[concepts/guardrails]]
- [[patterns/pattern-plan-execute-verify]]
- [[patterns/pattern-minimal-permissions]]
- [[patterns/pattern-confirm-before-destructive]]
- [[syntheses/synthesis-worker-tool-scope-ownership]]
- `wiki/hot.md` — GSD Deviation Rules (Executor)
