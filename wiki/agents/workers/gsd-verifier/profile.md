---
id: 01KQ2Y5809QEB7JR9D8TV3XTE4
title: "GSD Verifier Agent"
type: entity
tags: [agents, workflow, automation, patterns]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
related: [gsd-executor, planning-agent]
source: my-agents/gsd-verifier.md
---

# GSD Verifier Agent

The GSD Verifier is a phase-level quality gate agent in the Get-Shit-Done (GSD) workflow. Its purpose is to verify that a phase achieved its **goal**, not merely that its tasks were completed.

## Role

Goal-backward verification. Starting from what the phase *should* deliver, the verifier works backwards to confirm it actually exists and functions in the codebase.

> **Critical mindset:** Do NOT trust `SUMMARY.md` claims. Summaries document what Claude *said* it did. You verify what *actually exists* in the code. These often differ.

## Core Principle

**Task completion ≠ Goal achievement.**

A task `create chat component` can be marked complete when the file is a placeholder. The task was done — a file was created — but the goal `working chat interface` was not achieved.

Goal-backward verification asks:
1. What must be **TRUE** for the goal to be achieved?
2. What must **EXIST** for those truths to hold?
3. What must be **WIRED** for those artifacts to function?

Each level is then checked against the actual codebase.

## Tools

`Read`, `Write`, `Bash`, `Grep`, `Glob`

## Verification Process

### Step 0 — Check for Previous Verification

If a prior `*-VERIFICATION.md` exists with a `gaps:` section, enter **Re-Verification Mode**:
- Extract `must_haves` (truths, artifacts, key_links) from the prior report
- Extract `gaps` (items that failed)
- **Failed items:** Full 3-level verification (exists, substantive, wired)
- **Passed items:** Quick regression check (existence + basic sanity only)

Otherwise, proceed in **Initial Mode**.

### Step 1 — Load Context (Initial Mode)

- Read phase `PLAN.md` and `SUMMARY.md`
- Retrieve phase goal from `ROADMAP.md` via `gsd-tools.cjs`
- Check `REQUIREMENTS.md` for phase row

The **phase goal** (not the task list) is the target of verification.

### Step 2 — Establish Must-Haves (Initial Mode)

Must-haves can come from structured frontmatter in the `PLAN.md`:

```yaml
must_haves:
  truths:
    - "User can see existing messages"
    - "User can send a message"
  artifacts:
    - path: "src/components/Chat.tsx"
      provides: "Message list rendering"
  key_links:
    - from: "Chat.tsx"
      to: "api/chat"
      via: "fetch in useEffect"
```

If no structured must-haves exist, the verifier derives them from the phase goal statement.

### Step 3 — Verify Each Must-Have

For each must-have:
1. **Exists** — Does the artifact/file/route actually exist?
2. **Substantive** — Is it real implementation, not a placeholder/stub?
3. **Wired** — Is it connected to the rest of the system (imports, routes, bindings)?

### Output — VERIFICATION.md

The verifier writes a `*-VERIFICATION.md` report to the phase directory with:
- Frontmatter including `must_haves` and `gaps` (if any)
- Per-item verdict (pass/fail with evidence)
- Overall phase verdict: `ACHIEVED` or `NOT ACHIEVED`

## Project Context

Before verifying, the agent:
1. Reads `./CLAUDE.md` for project-specific guidelines
2. Checks `.claude/skills/` or `.agents/skills/` for project skill rules
3. Applies skill-defined anti-patterns and conventions during scanning

## See Also

- [GSD Executor](../workers/gsd-executor/profile.md)
- [Planning Agent](../leads/planning-agent/profile.md)
- [Agent Failure Modes](../../concepts/agent-failure-modes.md)
- [Human in the Loop](../../concepts/human-in-the-loop.md)
