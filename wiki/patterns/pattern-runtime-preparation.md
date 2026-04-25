     1|---
     2|id: 01KNNVX2R2B37K4DYFKS0WWRAN
     3|title: "Runtime Preparation Agent"
     4|type: pattern
     5|tags: [agents, deployment, workflow, automation, patterns]
     6|created: 2025-01-30
     7|stale_after_days: 730
updated: 2025-01-30
     8|visibility: public
     9|confidence: high
    10|related: [pattern-architecture-first, pattern-confirm-before-destructive, concepts/agent-sandboxing]
    11|---
    12|
    13|# Runtime Preparation Agent
    14|
    15|A specialised agent that bridges the gap between "code is written" and "it actually runs." Handles the unglamorous but critical pre-flight work after a milestone passes validation and before the live system is tested.
    16|
    17|## When to Use
    18|
    19|- After a development milestone passes full code review and automated validation
    20|- Before smoke testing or staging deployment
    21|- When multiple services, dependencies, and environment configs need to be reconciled in one pass
    22|- In any multi-agent pipeline where a [architecture-first](../patterns/pattern-architecture-first.md) agent defined the stack and a build agent implemented it — this agent closes the loop
    23|
    24|## Structure
    25|
    26|The agent takes three inputs:
    27|1. **Architecture output** — stack, services, required infrastructure
    28|2. **Milestone summary** — which tasks were implemented
    29|3. **Current manifest files** — `package.json`, `requirements.txt`, `Dockerfile`, etc.
    30|
    31|It produces six outputs in sequence:
    32|
    33|| Output | Purpose |
    34||---|---|
    35|| Dependency Audit | Verifies all libraries are listed, pinned, and non-conflicting |
    36|| Environment Variables | Documents every new env var with name, description, and example value |
    37|| Database / Storage Setup | Exact migration commands; flags destructive ops with warnings |
    38|| Service Wiring Check | Confirms host/port/auth config and startup order |
    39|| Smoke Test Checklist | 3–7 specific, verifiable end-to-end checks |
    40|| Start Commands | Ordered `bash` block to bring the milestone up |
    41|
    42|## Example
    43|
    44|After implementing a "User Auth" milestone, the agent might produce:
    45|
    46|```
    47|# Dependency Audit
    48|Add to requirements.txt:
    49|  bcrypt==4.1.2
    50|  python-jose[cryptography]==3.3.0
    51|
    52|# Environment Variables
    53|JWT_SECRET_KEY — signs access tokens — real credential required
    54|ACCESS_TOKEN_EXPIRE_MINUTES — default: 30 — dummy value OK
    55|
    56|# Database Setup
    57|alembic upgrade head
    58|# ⚠️ WARNING: migration 003 drops legacy `sessions` table
    59|
    60|# Smoke Test
    61|curl -X POST /auth/login -d '{"user":"test@example.com","pass":"secret"}'
    62|Expected: 200 OK with {"access_token": "***"}
    63|```
    64|
    65|Ends with a canonical closer:
    66|> "Runtime preparation complete. System ready for smoke testing."
    67|
    68|## Trade-offs
    69|
    70|**Pros:**
    71|- Forces explicit documentation of every environmental assumption before testing begins
    72|- Destructive operation warnings prevent data-loss incidents in shared dev/staging environments
    73|- Smoke test checklist gives human testers a clear, reproducible starting point
    74|- Pinning dependency versions reduces "works on my machine" failures
    75|
    76|**Cons:**
    77|- Requires accurate architecture and milestone summaries as input — garbage in, garbage out
    78|- Cannot actually run commands or verify connectivity itself; output is a checklist, not automation
    79|- May produce redundant output for simple milestones with no new dependencies or services
    80|
    81|## Related Patterns
    82|
    83|- [Architecture First](../patterns/pattern-architecture-first.md) — defines the stack this agent operationalises
    84|- [Confirm Before Destructive](../patterns/pattern-confirm-before-destructive.md) — same philosophy applied to dangerous database operations flagged here
    85|- [Code Generation Agent](../patterns/pattern-code-generation-agent.md) — typically the upstream producer whose output this agent prepares for runtime
    86|
    87|## See Also
    88|
    89|- [Agent Sandboxing](../concepts/agent-sandboxing.md)
    90|- [Human-in-the-Loop](../concepts/human-in-the-loop.md)
    91|- [Sandboxed Execution](../concepts/sandboxed-execution.md)
    92|