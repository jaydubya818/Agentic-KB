---
title: "Runtime Preparation Agent"
type: pattern
tags: [agents, deployment, workflow, automation, patterns]
created: 2025-01-30
updated: 2025-01-30
visibility: public
confidence: high
related: [pattern-architecture-first, pattern-confirm-before-destructive, concepts/agent-sandboxing]
---

# Runtime Preparation Agent

A specialised agent that bridges the gap between "code is written" and "it actually runs." Handles the unglamorous but critical pre-flight work after a milestone passes validation and before the live system is tested.

## When to Use

- After a development milestone passes full code review and automated validation
- Before smoke testing or staging deployment
- When multiple services, dependencies, and environment configs need to be reconciled in one pass
- In any multi-agent pipeline where a [architecture-first](../patterns/pattern-architecture-first.md) agent defined the stack and a build agent implemented it — this agent closes the loop

## Structure

The agent takes three inputs:
1. **Architecture output** — stack, services, required infrastructure
2. **Milestone summary** — which tasks were implemented
3. **Current manifest files** — `package.json`, `requirements.txt`, `Dockerfile`, etc.

It produces six outputs in sequence:

| Output | Purpose |
|---|---|
| Dependency Audit | Verifies all libraries are listed, pinned, and non-conflicting |
| Environment Variables | Documents every new env var with name, description, and example value |
| Database / Storage Setup | Exact migration commands; flags destructive ops with warnings |
| Service Wiring Check | Confirms host/port/auth config and startup order |
| Smoke Test Checklist | 3–7 specific, verifiable end-to-end checks |
| Start Commands | Ordered `bash` block to bring the milestone up |

## Example

After implementing a "User Auth" milestone, the agent might produce:

```
# Dependency Audit
Add to requirements.txt:
  bcrypt==4.1.2
  python-jose[cryptography]==3.3.0

# Environment Variables
JWT_SECRET_KEY — signs access tokens — real credential required
ACCESS_TOKEN_EXPIRE_MINUTES — default: 30 — dummy value OK

# Database Setup
alembic upgrade head
# ⚠️ WARNING: migration 003 drops legacy `sessions` table

# Smoke Test
curl -X POST /auth/login -d '{"user":"test@example.com","pass":"secret"}'
Expected: 200 OK with {"access_token": "..."}
```

Ends with a canonical closer:
> "Runtime preparation complete. System ready for smoke testing."

## Trade-offs

**Pros:**
- Forces explicit documentation of every environmental assumption before testing begins
- Destructive operation warnings prevent data-loss incidents in shared dev/staging environments
- Smoke test checklist gives human testers a clear, reproducible starting point
- Pinning dependency versions reduces "works on my machine" failures

**Cons:**
- Requires accurate architecture and milestone summaries as input — garbage in, garbage out
- Cannot actually run commands or verify connectivity itself; output is a checklist, not automation
- May produce redundant output for simple milestones with no new dependencies or services

## Related Patterns

- [Architecture First](../patterns/pattern-architecture-first.md) — defines the stack this agent operationalises
- [Confirm Before Destructive](../patterns/pattern-confirm-before-destructive.md) — same philosophy applied to dangerous database operations flagged here
- [Code Generation Agent](../patterns/pattern-code-generation-agent.md) — typically the upstream producer whose output this agent prepares for runtime

## See Also

- [Agent Sandboxing](../concepts/agent-sandboxing.md)
- [Human-in-the-Loop](../concepts/human-in-the-loop.md)
- [Sandboxed Execution](../concepts/sandboxed-execution.md)
