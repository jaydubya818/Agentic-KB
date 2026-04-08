---
id: 01KNNVX2R1MV5VVRSRAMDFFQK0
title: Minimal Permissions
type: pattern
category: safety
problem: Agents with broad tool access create larger blast radius for mistakes
solution: Grant only the tools needed for the current task; expand permissions explicitly
tradeoffs:
  - "Smaller blast radius vs requires upfront tool scoping per task type"
  - "Clear audit trail vs may need permission escalation mid-task"
  - "Principle of least privilege vs friction for trusted agents"
tags: [safety, permissions, least-privilege, tools, blast-radius]
confidence: high
sources:
  - "Security principle: Principle of Least Privilege"
  - "Anthropic: Claude Code permission documentation"
  - "OWASP: Secure design principles"
created: 2026-04-04
updated: 2026-04-04
---

## Problem

An agent with access to `delete_file`, `send_email`, `deploy_production`, and `charge_payment` can accidentally or maliciously use any of these — even when the task at hand is simply "analyze this code." The agent's blast radius (maximum possible damage from a mistake) equals the set of all possible effects of all available tools. Broad tool sets create broad blast radius.

The risk compounds in [[multi-agent-systems]]: if Agent A with broad permissions delegates to Agent B, Agent B inherits the same blast radius even if it only needs read access.

---

## Solution

Apply the Principle of Least Privilege: grant only the tools strictly necessary to complete the assigned task. Start with the minimum possible set and expand explicitly when needed. Each task type gets its own defined tool set.

---

## Implementation Sketch

### Tool Set Definition by Task Type

```python
from typing import frozenset

# Define tool sets for each task category
TOOL_SETS = {
    "read_only": frozenset({
        "read_file",
        "search_files",
        "list_directory",
        "check_file_exists",
    }),

    "code_analysis": frozenset({
        "read_file",
        "search_files",
        "list_directory",
        "bash_readonly",  # read-only bash commands: cat, ls, grep, wc
    }),

    "code_implementation": frozenset({
        "read_file",
        "write_file",
        "search_files",
        "list_directory",
        "bash_safe",  # non-destructive: mkdir, cp, git add, npm install
    }),

    "testing": frozenset({
        "read_file",
        "write_file",
        "search_files",
        "bash_testing",  # test runners: npm test, pytest, etc.
    }),

    "deployment": frozenset({
        "read_file",
        "bash_deployment",  # docker, kubectl, etc.
        "deploy_staging",
        # NOT deploy_production — that requires explicit escalation
    }),

    "research": frozenset({
        "read_file",
        "search_files",
        "web_search",
        "read_url",
    }),
}

def get_tool_set(task_type: str) -> frozenset[str]:
    return TOOL_SETS.get(task_type, TOOL_SETS["read_only"])
```

### Agent Initialization with Scoped Tools

```python
def create_agent(task_type: str, task: str) -> Agent:
    """Create an agent with the minimum required tool set for the task type."""
    allowed_tools = get_tool_set(task_type)
    all_tools = get_all_registered_tools()

    # Only include tools in the allowed set
    scoped_tools = [t for t in all_tools if t.name in allowed_tools]

    return Agent(
        system=build_system_prompt(task_type),
        tools=scoped_tools,
        task=task,
        metadata={"task_type": task_type, "tools_granted": list(allowed_tools)}
    )

# Usage:
agent = create_agent(task_type="code_analysis", task="Analyze the auth module for security issues")
# Agent can read files and run grep/ls, but cannot write files or call external APIs
```

### Permission Escalation Pattern

When the agent discovers mid-task that it needs additional tools:

```python
class PermissionEscalationRequest:
    tool_needed: str
    reason: str
    alternative_if_denied: str

# In the agent's tool set, include a special tool for escalation:
async def request_additional_permission(
    tool_name: str,
    reason: str,
    alternative: str
) -> str:
    """
    Request access to a tool not in the current permission set.
    This pauses execution until the permission is granted or denied.
    """
    if tool_name not in ALL_AVAILABLE_TOOLS:
        return f"ERROR: Tool '{tool_name}' does not exist."

    # Present to human for approval
    decision = await request_human_approval(PermissionEscalationRequest(
        tool_needed=tool_name,
        reason=reason,
        alternative_if_denied=alternative,
    ))

    if decision.approved:
        # Dynamically add tool to current session
        current_agent.add_tool(tool_name)
        log_permission_escalation(tool_name, reason, "approved")
        return f"Permission granted: {tool_name} is now available."
    else:
        log_permission_escalation(tool_name, reason, "denied")
        return f"Permission denied. Proceed with alternative: {alternative}"
```

### [[framework-claude-code]] Permission Modes Integration

In Claude Code, permission modes map to tool permission tiers:

```
Code analysis task:
  → Default mode: read_file, search, list (no write prompts arise)

Code implementation task:
  → Default mode: prompts on write (user sees each change)
  → acceptEdits mode: writes without prompting (use when watching output)

Autonomous CI task:
  → bypassPermissions: no prompts (must be sandboxed in git worktree)
  → Scope: tools registered at session start; no dynamic escalation
```

### Tool Scoping in Sub-Agents

When spawning sub-agents, explicitly scope their tool sets:

```python
async def spawn_research_sub_agent(research_query: str) -> str:
    """Spawn a research agent with read-only tools only."""
    return await agent_tool.call(
        task=research_query,
        allowed_tools=["web_search", "read_url", "read_file"],
        # Note: NOT "write_file", "bash", or any mutation tools
        # The research agent reports findings; it doesn't modify files
    )
```

This is especially important in [[patterns/pattern-fan-out-worker]] where multiple workers run simultaneously — each with its own scoped tool set.

---

## Permission Tiers

Define explicit tiers with clear upgrade paths:

| Tier | Tool Set | When To Use |
|------|----------|-------------|
| Read-only | read, search, list | Analysis, research, review |
| Write-safe | + write_file, append_file | Implementation in test env |
| Execute-safe | + bash (non-destructive), test runner | Testing, building |
| Privileged | + deploy, external APIs | Deployments, external integrations |
| Admin | All tools | Rare; requires explicit justification per session |

Default to the lowest tier that enables the task. Require explicit justification to move up a tier.

---

## Blast Radius Calculation

Quantify what an agent can do if it goes wrong:

```python
def calculate_blast_radius(allowed_tools: set[str]) -> BlastRadius:
    can_delete_files = "delete_file" in allowed_tools
    can_write_files = "write_file" in allowed_tools
    can_send_external = any(t in allowed_tools for t in ["send_email", "post_webhook", "call_api"])
    can_deploy = any(t in allowed_tools for t in ["deploy_production", "kubectl_apply"])
    can_charge = "charge_payment" in allowed_tools

    risk_score = sum([
        can_delete_files * 3,
        can_write_files * 1,
        can_send_external * 4,
        can_deploy * 5,
        can_charge * 5,
    ])

    return BlastRadius(score=risk_score, flags={
        "can_delete_files": can_delete_files,
        "can_communicate_externally": can_send_external,
        "can_deploy": can_deploy,
        "can_charge": can_charge,
    })
```

Document the blast radius for each agent deployment. Alert when an agent's blast radius exceeds a threshold.

---

## Tradeoffs

| | Pros | Cons |
|---|------|------|
| Smaller blast radius | Mistakes have bounded impact | Task discovery may reveal need for more tools |
| Audit clarity | Tool grants are explicit and logged | Upfront work to define tool sets per task type |
| Defense in depth | Complements guardrails and confirmation gates | Permission escalation adds HITL friction |
| Trust calibration | Easy to loosen permissions when trust is established | Tight permissions can block legitimate work |

---

## When To Use

- Any agent deployed in production (non-negotiable)
- Multi-agent systems where sub-agents should have restricted access
- Any agent that handles sensitive data or can take external actions
- bypassPermissions sessions — the lack of confirmation gates makes tool scoping more critical

## When NOT To Use

- Development environments where the developer is watching the agent work (friction outweighs benefit)
- Trusted automation contexts where the tool set is already minimal by design

---

## Real Examples

- Claude Code bypassPermissions CI agent: only read + write file tools; no bash
- Research sub-agent: only web_search + read_url; no file writes
- Deployment agent: staging tools only; production requires explicit escalation
- Security audit agent: read-only file access; no writes that could interfere with the audit subject

---

## Related Patterns

- [[concepts/permission-modes]] — Claude Code's session-level permission system
- [[patterns/pattern-confirm-before-destructive]] — gate on actions that do reach destructive tools
- [[patterns/pattern-worktree-isolation]] — sandbox complement to minimal permissions
- [[concepts/guardrails]] — additional safety layers

---

## Sources

- Saltzer & Schroeder "Protection of Information in Computer Systems" (1975) — Principle of Least Privilege
- [[anthropic]] Claude Code permission documentation (2025)
- OWASP "Security by Design Principles"
