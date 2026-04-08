---
id: 01KNNVX2QJ3DMC9KKRR5QPZVQZ
title: Permission Modes
type: concept
tags: [agentic, claude-code, permissions, safety, tool-access, authorization]
confidence: high
sources:
  - "Anthropic: Claude Code documentation (2025)"
  - "Claude Code permission system internals"
created: 2026-04-04
updated: 2026-04-04
related:
  - "[[concepts/guardrails]]"
  - "[[concepts/human-in-the-loop]]"
  - "[[concepts/agent-failure-modes]]"
  - "[[patterns/pattern-minimal-permissions]]"
  - "[[patterns/pattern-worktree-isolation]]"
status: stable
---

## TL;DR

Claude Code's permission system controls which tools the model can invoke and whether it needs user confirmation before acting. Four permission modes exist along a spectrum from maximum oversight to maximum autonomy. Choosing the wrong mode either slows down legitimate automation or eliminates safety rails that prevent mistakes. Default mode is correct for most interactive work; bypassPermissions is for trusted automation only.

---

## Definition

Permission modes in Claude Code are session-level configurations that determine which tool invocations require explicit user confirmation and which are automatically allowed. They balance development velocity against blast radius in case of agent error.

---

## How It Works

### The Four Permission Modes

#### Default Mode

The standard interactive mode. Claude can:
- Read files freely
- Write to files **after prompting for confirmation**
- Execute bash commands **after prompting for confirmation**
- Call the Agent tool **after prompting for confirmation**
- Browse the web (if enabled)

Every write or destructive operation shows the user what will happen and waits for confirmation. The user can approve, reject, or modify before execution.

**Best for**: Normal development work. The confirmation prompts are a feature — they keep the human in the loop for consequential actions.

**Risk profile**: Low. Mistakes require user co-authoring.

---

#### acceptEdits Mode

Claude can automatically apply file edits without per-edit confirmation. Bash commands and Agent invocations still require confirmation.

**Activated via**: `--allow-edits` flag or session setting.

**Best for**: When you've reviewed the plan and trust the file edits. Removes friction for refactoring sessions where you're watching the output anyway but don't want to click "approve" 50 times.

**Risk profile**: Medium. Bad edits can corrupt files before you notice, but bash commands still prompt.

**Guideline**: Use this mode when you understand the scope of changes and are monitoring the output. Do not use on repos with no version control (no git means no `git diff` recovery).

---

#### bypassPermissions Mode

All tool invocations are automatically approved. No confirmation prompts for file writes, bash commands, or agent spawning.

**Activated via**: The `bypassPermissions` configuration or `--dangerously-skip-permissions` flag (the flag name is intentional).

**Best for**:
- CI/CD pipelines where there's no human to prompt
- Automated testing of agent behavior
- Long-running autonomous tasks where you've reviewed the plan and want hands-off execution
- Trusted automation contexts with external safety mechanisms (sandboxing, git worktree isolation)

**Risk profile**: High. Claude can delete files, make API calls, and execute arbitrary commands without confirmation. One bad plan execution can cause significant damage.

**Mandatory safeguards when using**:
- Run in a git worktree (see [[patterns/pattern-worktree-isolation]]) so all changes are isolated and reversible
- Scope the working directory to the minimum necessary
- Have an external watchdog monitoring for unexpected behaviors
- Set a hard time/iteration limit so a runaway agent terminates

```bash
# Safe bypassPermissions usage:
git worktree add /tmp/agent-workspace feature/auto-refactor
cd /tmp/agent-workspace
claude --dangerously-skip-permissions --max-turns 20 "Refactor the auth module to use the new token format"
# Review changes with git diff before merging
git diff main..feature/auto-refactor
```

---

#### dontAsk Mode

Claude does not ask for clarification or confirmation during execution. It proceeds with its best interpretation of ambiguous instructions.

**Best for**: Batch processing scenarios where prompting would block indefinitely.

**Risk profile**: Medium to high — ambiguous instructions are resolved by the model's judgment, not the user's.

**Guideline**: Only use when instructions are fully specified and you've verified the agent interprets them correctly on a test run.

---

### Tool-Level vs Session-Level Permissions

Session-level: The permission mode applies to all tools uniformly for the session.

Tool-level: Individual tools can be enabled or disabled regardless of session mode. In a custom agent, you might enable only the specific tools needed:

```python
# Claude Code Agent tool with restricted tool set
result = await mcp.call_tool("agent", {
    "system": "You are a documentation writer. Only read files and write markdown.",
    "tools": ["read_file", "write_file"],  # only these tools are available
    "allowed_extensions": [".md", ".txt"],  # further restriction
})
```

Principle: grant tools at the narrowest scope that enables the task. See [[patterns/pattern-minimal-permissions]].

---

### Permission Escalation

In some workflows, an agent starts with minimal permissions and requests elevation:

```
Agent: "I need to run the test suite to verify my changes. This requires bash access. Approve?"
User: approve → bash access granted for remainder of session
```

This is preferable to starting with broad permissions "just in case." The escalation request is itself an audit point.

---

## When Each Mode Is Appropriate

| Mode | Interactive Dev | Pair Programming | CI/CD Automation | Untrusted Task |
|------|:-:|:-:|:-:|:-:|
| Default | ✓ | ✓ | ✗ (blocks) | ✓ |
| acceptEdits | ✓ | ✓ | ✗ | ✗ |
| bypassPermissions | ✗ | Sometimes | ✓ (sandboxed) | Never |
| dontAsk | ✗ | Sometimes | ✓ | ✗ |

---

## Risks of Permissive Modes

- **No safety net**: bypassPermissions removes the one human checkpoint before irreversible actions. In default mode, a human would have rejected "delete all .env files" — in bypassPermissions, it executes.
- **Scope creep**: Without confirmation prompts, agents may edit files outside the intended scope before you notice.
- **Audit gap**: Confirmation prompts are implicit audit logs. bypassPermissions means you only find out what happened after the fact.
- **Cascading errors**: In multi-agent systems with bypassPermissions, one agent's bad action can trigger downstream agents before any human sees it.

---

## Risks & Pitfalls

- Leaving bypassPermissions on after a CI run completes, then starting an interactive session in the same environment
- Not using git worktree with bypassPermissions — no recovery path if something goes wrong
- Using dontAsk when the task genuinely has ambiguous decision points that require human judgment
- Assuming acceptEdits is as safe as default — file corruption is possible without bash risk

---

## Related Concepts

- [[concepts/guardrails]] — complementary safety mechanisms
- [[concepts/human-in-the-loop]] — the design philosophy behind default mode
- [[patterns/pattern-minimal-permissions]] — scoping tools to the task
- [[patterns/pattern-worktree-isolation]] — the required companion to bypassPermissions

---

## Sources

- Anthropic Claude Code documentation (2025)
- Claude Code permission system design notes
