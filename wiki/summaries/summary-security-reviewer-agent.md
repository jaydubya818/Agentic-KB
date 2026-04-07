---
title: Security Reviewer Agent
type: summary
source_file: raw/my-agents/security-reviewer.md
author: Jay West
date_ingested: 2026-04-04
tags: [agentic, claude-code, agent-definition, security, owasp, vulnerability-assessment]
key_concepts: [threat-model, owasp-top-10, attacker-mindset, automated-scan-commands, security-controls-checklist]
confidence: high
---

# Security Reviewer Agent

## Key Purpose

Application security specialist for audits, vulnerability assessments, auth flow reviews, and dependency scanning. Particularly valuable before production deployments and after adding new external integrations. Uses `model: claude-opus-4-6` — alongside the architect, one of only two agents assigned to the highest-capability model.

## Tools Granted

None specified (inherits context). Opus model. The security reviewer is intentionally given no autonomous tools — it reviews code provided to it rather than reading the codebase autonomously.

## Design Decisions

### Attacker Mindset Framing

"You think like an attacker to defend like a defender." The threat model framework forces four questions for every feature reviewed:
1. Who could attack this? (External, authenticated, internal)
2. What could they gain? (Data, access, money, control)
3. How could they exploit it? (OWASP Top 10, business logic)
4. What's the impact? (Data breach, account takeover, disruption)

This prevents security review from becoming a checkbox exercise.

### OWASP Top 10 as Structured Checklist

Every review explicitly checks all 10 OWASP categories. The checklist is embedded in the prompt, not referenced externally — the agent carries the full checklist in its working context.

### Automated Scan Commands

Includes ready-to-run bash commands for:
- `npm audit --audit-level=high` and `npx snyk test` for JavaScript
- `pip-audit` and `bandit` for Python
- Grep patterns for hardcoded secrets and debug markers

These commands are part of the agent's standard operating procedure, not suggestions.

### Security Controls Verification

Output always ends with a `### Verified Security Controls` checklist covering: Authentication, Authorization, Input validation, Secret management, HTTPS enforcement. This final checklist ensures reviewers don't stop after finding issues — they also verify what IS working.

### Threat Level Rating

Output begins with a single threat level: `CRITICAL / HIGH / MEDIUM / LOW / CLEAN`. This gives the caller an immediate signal before reading the detailed findings.

## Prompt Patterns Observed

- **Model selection as signal:** Opus for security (like architecture) signals that these are the two domains where underpowered analysis is most costly.
- **Pre-written scan commands:** Including copy-paste bash commands in the agent definition reduces friction between review and action. The reviewer doesn't just name the tool — it gives the exact invocation.
- **Structured output with CVSS scores:** Vulnerability table includes CVSS score column — treats security findings with the same rigor as a formal penetration test report.
- **"Recommended Immediate Actions":** Output always includes prioritized action items, not just findings. The reviewer is actionable, not just descriptive.

## Related Concepts

- [[wiki/summaries/summary-architect-agent]]
- [[wiki/summaries/summary-code-reviewer-agent]]
- [[wiki/personal/personal-agent-design-observations]]

## Sources

- `raw/my-agents/security-reviewer.md`
