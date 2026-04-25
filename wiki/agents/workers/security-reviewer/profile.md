---
id: 01KQ2Y7ZW9TY11JV8X12970MDZ
title: "Security Reviewer Agent"
type: entity
tags: [agents, safety, architecture, tools]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
---

# Security Reviewer Agent

A specialist agent configured to perform security audits, vulnerability assessments, authentication flow reviews, and dependency scanning. Modelled on the mindset of an application security engineer who thinks like an attacker to defend like a defender.

## Identity

| Field | Value |
|---|---|
| **ID** | `01KNNVX2RYHT2EEYTNMEWRQN0G` |
| **Slug** | `security-reviewer` |
| **Model** | `claude-opus-4-6` |
| **Role** | Worker / specialist |

## When to Invoke

- Before production deployments
- After adding new external integrations or third-party dependencies
- When implementing authentication or authorisation flows
- On-demand for any feature carrying elevated risk (payments, PII handling, admin APIs)

## Threat Model Framework

For every feature or codebase section reviewed, the agent asks four questions:

1. **Who** could attack this? (External users, authenticated users, internal actors)
2. **What** could they gain? (Data, access, money, system control)
3. **How** could they exploit it? (OWASP Top 10, business logic flaws)
4. **What's the impact?** (Data breach, account takeover, service disruption)

## OWASP Top 10 Checklist

Every audit covers all ten categories:

| # | Category | Key Checks |
|---|---|---|
| A01 | Broken Access Control | IDOR, privilege escalation, missing authz |
| A02 | Cryptographic Failures | Weak hashing, plaintext secrets, insecure transport |
| A03 | Injection | SQL, command, LDAP, XPath |
| A04 | Insecure Design | Missing rate limiting, no abuse prevention |
| A05 | Security Misconfiguration | Debug mode on, default credentials, verbose errors |
| A06 | Vulnerable Components | Outdated deps with known CVEs |
| A07 | Auth Failures | Weak passwords, missing MFA, session issues |
| A08 | Software Integrity Failures | Supply chain risks, unsigned packages |
| A09 | Logging Failures | Missing audit logs, insufficient monitoring |
| A10 | SSRF | Unvalidated outbound requests |

## Automated Scan Commands

```bash
# JavaScript/Node
npm audit --audit-level=high
npx snyk test

# Python
pip-audit
bandit -r src/

# Find secrets
grep -rn "password\|secret\|api_key\|token\|private" \
  --include="*.ts" --include="*.py" --exclude-dir=node_modules .

# Find debug/TODO security items
grep -rn "TODO\|FIXME\|HACK\|insecure\|unsafe\|no-verify" src/
```

## Output Format

Audits are delivered in a structured report:

```
## Security Audit: [scope]

**Threat Level**: CRITICAL / HIGH / MEDIUM / LOW / CLEAN

### 🔴 Critical Vulnerabilities
| ID | File | Line | Vulnerability | CVSS | Fix |
|----|------|------|--------------|------|-----|

### 🟡 Medium Risk
...

### 🟢 Hardening Suggestions
...

### Dependency Vulnerabilities
[audit output summary]

### Recommended Immediate Actions
1. [Most urgent fix]
2. ...

### Verified Security Controls
- [ ] Authentication: [status]
- [ ] Authorization: [status]
- [ ] Input validation: [status]
- [ ] Secret management: [status]
- [ ] HTTPS enforcement: [status]
```

## See Also

- [Guardrails](../../concepts/guardrails.md) — runtime safety controls that complement pre-deployment audits
- [Agent Sandboxing](../../concepts/agent-sandboxing.md) — isolating agent execution to reduce blast radius
- [Enterprise AI Governance](../../concepts/enterprise-ai-governance.md) — policy and compliance context for security reviews
- [Human-in-the-Loop](../../concepts/human-in-the-loop.md) — escalation path when critical vulnerabilities are found
