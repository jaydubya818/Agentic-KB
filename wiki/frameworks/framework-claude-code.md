---
id: 01KNNVX2QT1HH509TKCCJB9V2C
title: Claude Code
type: framework
vendor: Anthropic
version: "1.x (model: claude-sonnet-4-6 default)"
language: any
license: proprietary
github: ""
tags: [claude-code, anthropic, agentic, orchestration, cli, tool-use, multi-agent]
last_checked: 2026-04-04
jay_experience: extensive
---

## Overview

[[framework-claude-code]] is [[anthropic]]'s official CLI for Claude — an agentic coding assistant that runs in your terminal and operates directly on your filesystem, git repos, and shell. It is not a chat wrapper; it is a fully autonomous coding agent with a rich tool set, spawnable sub-agents, hooks for custom automation, a skills system for slash commands, and a structured memory system. Jay uses Claude Code as his primary development environment and orchestration layer.

Unlike IDEs with embedded AI (Copilot, Cursor), Claude Code is a headless agent you control via prompts, permission modes, CLAUDE.md instructions, and hooks — making it fully automatable and composable into larger agentic systems.

---

## Core Concepts

### Permission Modes
Claude Code has five distinct permission modes that determine what it can do without asking:

| Mode | Behavior |
|------|----------|
| `default` | Reads freely; asks before destructive writes, bash, git |
| `acceptEdits` | Auto-accepts file writes; still asks for bash/git |
| `bypassPermissions` | All tools run without confirmation (headless/CI use) |
| `plan` | Reads only; produces a plan, no execution |
| `auto` | Fully autonomous; respects `settings.json` `allow`/`ask` arrays |

In `settings.json`, the `permissions.allow` and `permissions.ask` arrays fine-tune what triggers confirmation even in non-bypass modes. Jay's config allows `Edit(*)`, `Write(*)`, `WebFetch`, and all [[mcp-ecosystem]] tools by default, but asks for `git`, `npm`, `rm`, destructive bash, and network tools.

### Tools
Claude Code exposes a built-in tool set to the model:

| Tool | Function |
|------|----------|
| `Read` | Read file contents (2,000-line soft limit — chunk large files) |
| `Write` | Write/overwrite files |
| `Edit` | Precise string replacement in files |
| `Bash` | Execute shell commands |
| `Glob` | File pattern matching |
| `Grep` | ripgrep-powered content search |
| `Agent` | Spawn a sub-agent (the key to multi-agent orchestration) |
| `WebFetch` | Fetch a URL |
| `WebSearch` | Web search |
| `ToolSearch` | Discover deferred tools by name/keyword |
| `NotebookEdit` | Edit Jupyter notebooks |
| MCP tools | Any tool registered from an MCP server (prefixed `mcp__`) |

The `Agent` tool is the foundation of Claude Code's multi-agent capability. A single instruction can fan out to N parallel sub-agents, each with its own context, tool restrictions, and optional worktree isolation.

### CLAUDE.md — The Instruction Layer
CLAUDE.md files define the operating instructions for Claude Code at three scopes:
- **Global**: `~/.claude/CLAUDE.md` — applies to every session
- **Project-level**: `<repo>/CLAUDE.md` — overrides global, project-specific rules
- **Rules files**: `~/.claude/rules/*.md` — loaded when working in matching file types (e.g., `api.md` for API route files, `react.md` for `.tsx` files)

CLAUDE.md supports markdown headings, code blocks, tables, and conditional `<important if="...">` tags. Project-level files always override global ones; global fills gaps.

### Skills System — Slash Commands
Skills are slash commands that expand to full structured prompts. They live as directories under `~/.claude/skills/<skill-name>/SKILL.md` and are invoked with `/skill-name` or scoped as `/namespace:command`. Jay has 29+ skills installed covering GSD, [[framework-superpowers]], [[framework-bmad]], graphify, context management, testing, and more.

Skills can be chained, invoked from within sub-agent prompts, and passed as `skill:` parameters to Agent tool calls.

### Memory System
Claude Code projects maintain persistent memory at:
```
~/.claude/projects/<hashed-project-path>/memory/MEMORY.md
```
This file is auto-injected into sessions for that project directory. It stores decisions, known issues, key architectural notes, and verification commands. The schema encourages sections like `Key Decisions`, `Known Issues`, and `Verification Commands`.

### Hooks System
Hooks execute shell commands in response to Claude Code events, enabling custom automation without modifying core behavior. Configured in `~/.claude/settings.json` under the `hooks` key.

**Hook events:**
- `PreToolUse` — fires before a tool call; can block it (exit 2)
- `PostToolUse` — fires after a tool call; output fed back to model
- `Notification` — fires on status notifications
- `Stop` — fires when a session ends
- `SubagentStop` — fires when a sub-agent completes

Each hook has a `matcher` (regex against tool name) and a `command` (shell command to run). Exit code 2 blocks the tool call entirely — this is how Jay's `file-read-guard.sh` enforces the 2,000-line read warning, and how `gsd-prompt-guard.js` prevents writes in wrong workflow states.

Jay's active hooks:
- `file-read-guard.sh` — PreToolUse/Read: warns on large files
- `gsd-prompt-guard.js` — PreToolUse/Write|Edit: GSD workflow enforcement
- `prompt-injection-defender/post-tool-defender.py` — PostToolUse/Read|Bash|WebFetch: scans for injection patterns
- `send_event.py` (Multi-Agent-Observability) — all events: telemetry to observability stack
- `stop-validation.sh` — Stop: end-of-session verification gate

### Agent Tool — Sub-Agent Spawning
The `Agent` tool is what makes Claude Code a multi-agent framework, not just a single AI assistant:

```
Agent tool parameters:
- prompt: string          — the sub-agent's full task description
- skill: string           — inherit a skill (e.g. "superpowers:tdd")
- effort: low|normal|high — compute budget hint
- background: bool        — non-blocking, result delivered async
- isolation: "worktree"   — sandboxed git worktree copy
- tools: string[]         — restrict what tools sub-agent can use
- model: string           — override model for sub-agent
```

Multiple Agent calls in a single response execute in parallel. This is the [[pattern-fan-out-worker]] pattern — an orchestrator decomposes tasks, dispatches N parallel sub-agents, then collects and merges results. See [[patterns/pattern-fan-out-worker]].

---

## Architecture

```
User prompt
    │
    ▼
Claude Code CLI
    │
    ├── CLAUDE.md loader (global → project → rules)
    ├── settings.json (permissions, hooks, model, env)
    ├── Memory injector (~/.claude/projects/.../memory/MEMORY.md)
    │
    ▼
Model (claude-sonnet-4-6 by default)
    │
    ├── Tool calls → PreToolUse hooks → Tool execution → PostToolUse hooks
    │
    ├── Agent tool → spawn sub-agent
    │       ├── own context window
    │       ├── own tool restrictions
    │       ├── optional worktree isolation
    │       └── returns result to orchestrator
    │
    ├── MCP tools (registered servers)
    └── Skills (slash commands → prompt expansion)
```

Session flow: Claude Code reads CLAUDE.md, injects memory, then enters a tool loop. Each tool call may trigger hooks. Sub-agents run as fully independent Claude Code instances with their own tool loops. Results from sub-agents are returned as strings into the orchestrator's context.

---

## Strengths

- **Native parallelism**: multiple Agent calls in one message = genuine parallel execution
- **Filesystem-native**: works directly with your actual files and git history; no staging
- **Composable automation**: hooks + skills + CLAUDE.md = a fully programmable agent runtime
- **Worktree isolation**: sub-agents can work in sandboxed git worktrees without corrupting main branch
- **MCP extensibility**: any custom tool set can be wired in as an MCP server
- **Context control**: permission modes let you go from interactive to fully headless
- **Memory persistence**: MEMORY.md means decisions survive session boundaries
- **Jay's most-productive tool**: the tight CLI + filesystem integration beats any IDE integration for complex multi-file agentic work

---

## Weaknesses

- **No built-in state machine**: orchestration logic lives in prompts, not code — complex workflows drift without careful CLAUDE.md discipline
- **Context window limits**: sub-agents get their own windows, but deep hierarchies burn tokens fast
- **2,000-line read limit**: silent truncation is a footgun; requires the file-read-guard hook or manual chunking
- **No native observability**: without external hooks (like Jay's Multi-Agent-Observability stack), you have no visibility into what sub-agents did
- **Session statefulness**: sessions are ephemeral unless memory is explicitly written; partial completions are lost on interrupt
- **Proprietary**: no access to internals; breaking changes happen without notice

---

## Minimal Working Example

```bash
# Launch in default mode (interactive)
claude

# Launch with full bypass (headless/scripted)
claude --dangerouslySkipPermissions

# Single-shot non-interactive
claude -p "Refactor src/auth.ts to use async/await throughout. Write the file."

# Fan-out: orchestrator prompt that spawns parallel sub-agents
# (Written in the prompt, not as a bash command)
```

Example orchestrator prompt that uses the Agent tool fan-out pattern:
```
You are an orchestrator. Spawn three parallel agents:
1. Agent: analyze the current test coverage in src/ and report gaps
2. Agent: identify all TODO comments in src/ and categorize them
3. Agent: check package.json dependencies for outdated packages

After all three complete, synthesize their findings into a priority list.
```

Example minimal hook (`~/.claude/hooks/lint-on-edit.sh`):
```bash
#!/bin/bash
# PostToolUse hook — runs ESLint after every Edit/Write
# Matcher: "Edit|Write"
FILE="$CLAUDE_TOOL_OUTPUT_FILE"  # env var set by Claude Code
if [[ "$FILE" == *.ts || "$FILE" == *.tsx ]]; then
  npx eslint "$FILE" --fix 2>&1
fi
```

Register in `settings.json`:
```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{"type": "command", "command": "bash ~/.claude/hooks/lint-on-edit.sh", "timeout": 10}]
    }]
  }
}
```

---

## Integration Points

- **[[frameworks/framework-mcp]]**: Register MCP servers in `~/.claude/mcp_servers.json` or project-level config; tools appear prefixed `mcp__<server>__<tool>`
- **[[frameworks/framework-gsd]]**: GSD skills (`gsd:execute-phase`, etc.) run inside Claude Code; GSD agents are `.md` files in `~/.claude/agents/`
- **[[frameworks/framework-superpowers]]**: Superpowers skills invoked via `/superpowers:tdd` etc.; iron law enforcement via PreToolUse hooks
- **[[frameworks/framework-bmad]]**: BMAD skills in `~/.claude/skills/bmad/`; BMAD agents reference Claude Code's Agent tool for sub-agent spawning
- **[[entities/jay-west-agent-stack]]**: Claude Code is the primary runtime for Jay's full stack
- **[[entities/anthropic]]**: Claude Code calls the Anthropic API; model selection in `settings.json`
- **Obsidian**: Claude Code reads/writes the Agentic-KB vault directly; no special integration needed
- **Multi-Agent-Observability**: hooks forward all events to Jay's observability stack via `send_event.py`

---

## Jay's Experience

Jay uses Claude Code as his primary development environment — not as an assistant but as an autonomous agent runtime. Key patterns he's validated:

1. **Fan-out for parallelism**: spawning 3-8 parallel sub-agents for independent tasks cuts wall-clock time dramatically for research, analysis, and multi-file changes.
2. **Worktree isolation for risky changes**: when a sub-agent might trash state (DB migrations, auth refactors), `isolation: worktree` prevents main branch corruption.
3. **Hooks as invariants**: using PreToolUse hooks with exit code 2 to enforce workflow rules (e.g., GSD phase gate) is more reliable than prompt instructions alone.
4. **Memory.md as session continuity**: explicit MEMORY.md updates at the end of each session eliminate the "re-explain the project" tax.
5. **`bypassPermissions` for scripted pipelines**: when Claude Code is being orchestrated by another agent, bypass mode prevents confirmation prompts from blocking async flows.
6. **Model tiering in sub-agents**: using `claude-haiku-4-5` for leaf tasks (grep analysis, file reads) and `claude-sonnet-4-6` for orchestration keeps costs controlled.

Known footguns: the 2,000-line read limit, losing work on context auto-compact without a `CHECKPOINT:` marker, and sub-agent results being string-truncated in very large fan-outs.

---

## Version Notes

- **2026.x**: `autoCompactThreshold: 0.75` — context auto-compacts at 75% capacity (intentional behavior, not a bug)
- **2026.x**: `maxFileReadTokens: 100000` — configurable cap on file read token consumption
- **2026.x**: SubagentStop hook event added — enables sub-agent lifecycle tracking
- **2026.x**: `ToolSearch` tool added — allows model to discover deferred/lazy-loaded tools
- Model `opusplan` appears in Jay's `settings.json` as the model setting — this is a custom model alias or plan tier [UNVERIFIED]
- Skills system: directory-based SKILL.md format (not single flat files)

---

## Sources

- Jay's `~/.claude/settings.json` (direct inspection)
- Jay's `~/.claude/CLAUDE.md` (global instructions)
- Jay's `~/.claude/hooks/` directory (hook implementations)
- Jay's `~/.claude/agents/` directory (34 agent definitions)
- [[entities/anthropic]]
- [[entities/jay-west-agent-stack]]
