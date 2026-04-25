---
id: 01KQ2Z133GCKDDGF9CK71Q57DK
title: Agent Sandboxing
type: concept
tags: [agents, architecture, deployment, workflow, automation]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [multi-agent-systems, agent-loops, memory-systems]
---

# Agent Sandboxing

## Definition

Agent sandboxing is the practice of running agent workloads inside isolated, remote execution environments rather than on a user's local machine. Each sandbox provides a reproducible, self-contained OS-level context — including a cloned repository, installed dependencies, and a running build — that agents can read from and write to without affecting other sessions or the host system.

## Why It Matters

Local agent execution suffers from three core constraints:

1. **Resource contention** — a single machine cannot run many concurrent agent sessions
2. **Environment inconsistency** — "works on my machine" failures break reproducibility
3. **Single-user limits** — local sessions can't support multiplayer or multi-client collaboration

Moving execution to hosted sandboxes eliminates all three. Teams gain unlimited concurrency, bit-identical environments across every run, and the ability to share live sessions across Slack, web, and other clients.

## Key Patterns

### Image Registry Pattern

Pre-build environment images on a regular cadence (e.g. every 30 minutes). Each image captures:
- A cloned repository at a known commit
- All runtime dependencies installed
- Initial build and setup commands completed
- Warm caches from running the app and test suite once

At session start, spin up a sandbox from the most recent image. The repository is at most 30 minutes stale, making sync with the latest commit fast.

### Snapshot and Restore

Take filesystem snapshots at key lifecycle points:
- After initial image build (base snapshot)
- When the agent finishes a change set (session snapshot)
- Before sandbox exit, in case of follow-up prompts

Snapshots enable instant restoration without re-running setup, dramatically reducing follow-up latency.

### Warm Pool Strategy

For high-volume repositories, maintain a pool of pre-warmed sandboxes that are ready before users start sessions. Expire and recreate pool entries as new image builds complete. Predictive warm-up — starting a sandbox as soon as a user begins typing — can reduce perceived startup time to near zero.

> **Critical insight**: Session speed should be limited only by model provider time-to-first-token. All infrastructure setup should be complete before the user's session begins.

### Git Identity for Background Agents

Git operations inside sandboxes are not tied to a specific human user. Best practices:
- Generate GitHub App installation tokens for repository access during image clones
- Update `user.name` and `user.email` at commit time to reflect the prompting user's identity, not the app identity

## Example

A coding agent platform using [Modal](https://modal.com) (or similar) might:
1. Build a new environment image every 30 minutes from `main`
2. Keep a warm pool of 5 sandboxes for the most-active repositories
3. On session start, attach the user to the freshest warm sandbox
4. Snapshot the sandbox after the agent pushes its changes
5. Restore from snapshot on follow-up prompts

## Multi-Client Architecture

Hosted sandboxes naturally support multiplayer and multi-client access. A server-first agent framework — where the agent runs as an API server and Slack, web, and CLI are all thin clients — means:
- No duplicated agent logic per surface
- Consistent behaviour everywhere
- Real-time event streaming to all connected clients simultaneously

See [multi-agent systems](multi-agent-systems.md) for patterns around agents spawning sub-agents for parallel workloads within sandboxed environments.

## Common Pitfalls

- **Not pre-warming**: Cold sandbox starts can take 30–90 seconds; users perceive this as the agent being slow
- **Stale image pools**: Failing to expire warm pool entries after new image builds causes sessions to run on outdated code
- **App-identity commits**: Forgetting to set per-user git config results in all commits attributed to the service account
- **No snapshot strategy**: Without snapshots, follow-up prompts restart from scratch, wasting time and money

## See Also

- [Agent Loops](agent-loops.md)
- [Multi-Agent Systems](multi-agent-systems.md)
- [Memory Systems](memory-systems.md)
- [Agent Observability](agent-observability.md)
- [Cost Optimization](cost-optimization.md)
