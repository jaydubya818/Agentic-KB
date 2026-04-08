---
id: 01KNNVX2R7ZARTMW08QJD9Q231
title: Claude Code Hooks — Custom Automation
type: recipe
difficulty: intermediate
time_estimate: 1-2 hours
prerequisites:
  - Claude Code installed and authenticated
  - Basic shell scripting or Node.js knowledge
  - Access to ~/.claude/settings.json
tested: false
tags: [claude-code, hooks, automation, workflow, shell]
---

## Goal

Write [[framework-claude-code]] hooks for custom automation — scripts that run before/after tool calls, at session end, and on notifications. After this recipe you'll have three working hooks: a lint-on-edit hook, a large-file guard, and a bash command logger.

See [[frameworks/framework-claude-code]] for the full hooks architecture.

---

## Prerequisites

```bash
# Verify Claude Code is installed
claude --version

# Check existing hooks directory
ls ~/.claude/hooks/ 2>/dev/null || mkdir -p ~/.claude/hooks/

# Verify settings.json location
ls ~/.claude/settings.json
```

---

## Hook Fundamentals

### Events
| Event | When It Fires | Can Block? |
|-------|-------------|-----------|
| `PreToolUse` | Before a tool call | Yes (exit 2) |
| `PostToolUse` | After a tool call | No (informational) |
| `Notification` | On status notifications | No |
| `Stop` | When session ends | No |
| `SubagentStop` | When a sub-agent finishes | No |

### Matcher
The `matcher` field is a regex matched against the tool name. Examples:
- `"Bash"` — only Bash tool calls
- `"Edit|Write"` — Edit or Write
- `"mcp__.*"` — all [[mcp-ecosystem]] tool calls
- `""` — all tools (empty string matches everything)

### Hook Exit Codes
- Exit `0`: success, continue normally
- Exit `2`: block the tool call (PreToolUse only); output is shown to the model as a warning
- Any other exit code: treat as error; tool call continues

### Environment Variables
Claude Code sets these env vars for hook processes:
- `CLAUDE_TOOL_NAME` — name of the tool being called
- `CLAUDE_TOOL_INPUT` — JSON string of tool arguments
- `CLAUDE_TOOL_OUTPUT` — tool's output (PostToolUse only)
- `CLAUDE_SESSION_ID` — current session ID

---

## Steps

### Step 1 — Large File Guard (PreToolUse/Read)

This hook blocks reads of files over 2,000 lines and warns the model:

```bash
# ~/.claude/hooks/file-read-guard.sh
#!/bin/bash
# PreToolUse hook for Read tool
# Warns when a file exceeds 2000 lines (Claude Code's silent read limit)

FILE_PATH=$(echo "$CLAUDE_TOOL_INPUT" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('file_path', ''))" 2>/dev/null)

if [ -z "$FILE_PATH" ]; then
  exit 0  # No file_path in input, let it proceed
fi

if [ ! -f "$FILE_PATH" ]; then
  exit 0  # File doesn't exist, let Read handle the error
fi

LINE_COUNT=$(wc -l < "$FILE_PATH" 2>/dev/null || echo "0")

if [ "$LINE_COUNT" -gt 2000 ]; then
  echo "⚠️  LARGE FILE WARNING: $FILE_PATH has $LINE_COUNT lines."
  echo "Claude Code's Read tool silently stops at 2000 lines."
  echo "ACTION REQUIRED: Use 'wc -l $FILE_PATH' to confirm, then read in chunks:"
  echo "  Read(file_path=\"$FILE_PATH\", offset=0, limit=2000)"
  echo "  Read(file_path=\"$FILE_PATH\", offset=2000, limit=2000)"
  echo "  # Continue until offset >= $LINE_COUNT"
  exit 2  # Block the read — force the model to chunk
fi

exit 0
```

```bash
chmod +x ~/.claude/hooks/file-read-guard.sh
```

### Step 2 — Lint on Edit (PostToolUse/Edit+Write)

This hook runs ESLint after every TypeScript/JavaScript file edit:

```bash
# ~/.claude/hooks/lint-on-edit.sh
#!/bin/bash
# PostToolUse hook for Edit and Write tools
# Runs ESLint on TypeScript/JavaScript files after edits

FILE_PATH=$(echo "$CLAUDE_TOOL_INPUT" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('file_path', d.get('path', '')))" 2>/dev/null)

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Only lint TypeScript/JavaScript files
if [[ ! "$FILE_PATH" =~ \.(ts|tsx|js|jsx)$ ]]; then
  exit 0
fi

if [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

# Find the project root (directory with package.json)
PROJECT_DIR="$FILE_PATH"
while [ "$PROJECT_DIR" != "/" ]; do
  PROJECT_DIR=$(dirname "$PROJECT_DIR")
  if [ -f "$PROJECT_DIR/package.json" ]; then
    break
  fi
done

if [ ! -f "$PROJECT_DIR/package.json" ]; then
  exit 0  # No project root found, skip
fi

# Run ESLint
LINT_OUTPUT=$(cd "$PROJECT_DIR" && npx eslint "$FILE_PATH" --fix 2>&1)
LINT_EXIT=$?

if [ $LINT_EXIT -ne 0 ]; then
  echo "ESLint issues in $FILE_PATH:"
  echo "$LINT_OUTPUT"
  # Exit 0 — report the issue but don't block (PostToolUse can't block anyway)
fi

exit 0
```

```bash
chmod +x ~/.claude/hooks/lint-on-edit.sh
```

### Step 3 — Bash Command Logger (PostToolUse/Bash)

Logs all Bash commands executed by Claude Code for audit and debugging:

```javascript
// ~/.claude/hooks/log-bash.js
#!/usr/bin/env node
// PostToolUse hook for Bash tool
// Logs all bash commands to a session log file

const fs = require("fs")
const path = require("path")
const os = require("os")

const LOG_DIR = path.join(os.homedir(), ".claude", "bash-logs")
fs.mkdirSync(LOG_DIR, { recursive: true })

try {
  const toolInput = JSON.parse(process.env.CLAUDE_TOOL_INPUT || "{}")
  const toolOutput = process.env.CLAUDE_TOOL_OUTPUT || ""
  const sessionId = process.env.CLAUDE_SESSION_ID || "unknown"

  const logFile = path.join(LOG_DIR, `${sessionId}.log`)
  const timestamp = new Date().toISOString()

  const entry = {
    timestamp,
    command: toolInput.command || toolInput.cmd || "",
    exit_code: toolOutput.includes("Exit code: ") ? toolOutput.match(/Exit code: (\d+)/)?.[1] : "unknown",
    output_preview: toolOutput.slice(0, 200)
  }

  fs.appendFileSync(logFile, JSON.stringify(entry) + "\n", "utf-8")
} catch (err) {
  // Never fail silently in a hook — but don't crash the session
  process.stderr.write(`log-bash.js error: ${err.message}\n`)
}

process.exit(0)
```

### Step 4 — Session Completion Validator (Stop)

Runs at session end to verify work is committed:

```bash
# ~/.claude/hooks/stop-validation.sh
#!/bin/bash
# Stop hook — runs when Claude Code session ends
# Checks for uncommitted changes and warns

SESSION_ID="$CLAUDE_SESSION_ID"

# Find current git repo (from cwd or closest parent)
GIT_DIR=$(git rev-parse --git-dir 2>/dev/null)

if [ -z "$GIT_DIR" ]; then
  exit 0  # Not in a git repo
fi

# Check for unstaged changes
UNSTAGED=$(git diff --stat 2>/dev/null | wc -l | tr -d ' ')
UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null | wc -l | tr -d ' ')

if [ "$UNSTAGED" -gt 0 ] || [ "$UNTRACKED" -gt 0 ]; then
  echo "⚠️  Session ending with uncommitted changes:"
  [ "$UNSTAGED" -gt 0 ] && echo "  - $UNSTAGED modified files (git diff)"
  [ "$UNTRACKED" -gt 0 ] && echo "  - $UNTRACKED untracked files"
  echo "Consider: git add -A && git commit -m 'WIP: <session-$SESSION_ID>'"
fi

exit 0
```

### Step 5 — Register All Hooks in settings.json

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read",
        "hooks": [{
          "type": "command",
          "command": "bash /Users/yourname/.claude/hooks/file-read-guard.sh",
          "timeout": 5
        }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{
          "type": "command",
          "command": "bash /Users/yourname/.claude/hooks/lint-on-edit.sh",
          "timeout": 15
        }]
      },
      {
        "matcher": "Bash",
        "hooks": [{
          "type": "command",
          "command": "node /Users/yourname/.claude/hooks/log-bash.js",
          "timeout": 3
        }]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [{
          "type": "command",
          "command": "bash /Users/yourname/.claude/hooks/stop-validation.sh",
          "timeout": 10
        }]
      }
    ]
  }
}
```

Important: use **absolute paths** — hooks execute with an unpredictable cwd.

### Step 6 — Test Each Hook

```bash
# Test file-read-guard: create a large file
seq 1 2500 > /tmp/test-large-file.txt
# In Claude Code: ask it to read /tmp/test-large-file.txt
# Expected: hook blocks the read with a warning message

# Test lint-on-edit: edit a TypeScript file with a lint error
# In Claude Code: ask it to write a .ts file with `var x = 1`
# Expected: eslint output appears in session after the write

# Test bash logger
# In Claude Code: ask it to run `echo hello`
# Check: cat ~/.claude/bash-logs/<session-id>.log
# Expected: JSON entry with the echo command

# Test stop validation
# Make some file edits without committing
# End the session (Ctrl+C or /exit)
# Expected: warning about uncommitted changes
```

---

## Verification

1. **large-file-guard**: `wc -l /tmp/test-large-file.txt` → 2500 lines. Ask Claude Code to read it. Should see the exit 2 warning in the session.

2. **lint-on-edit**: Edit a `.ts` file that has an ESLint error. The error should appear in the session output immediately after the edit.

3. **bash-logger**: After running any bash command, check `ls ~/.claude/bash-logs/`. Should see a file. `cat` it to verify JSON entries.

4. **stop-validation**: With unstaged changes, end a Claude Code session. Warning should appear.

---

## Common Failures & Fixes

### Failure: Hook doesn't fire
Causes: (1) settings.json has JSON syntax error — validate with `python3 -m json.tool ~/.claude/settings.json`, (2) matcher regex doesn't match tool name — test with `echo "Bash" | grep -E "your_pattern"`, (3) hook file isn't executable — run `chmod +x hookfile.sh`.

### Failure: Hook exit 2 blocks but shows no message
Fix: ensure the hook script outputs text to stdout before exiting. `echo "message"` then `exit 2`. Claude Code displays stdout from a blocking hook.

### Failure: lint-on-edit slows down every edit significantly
Cause: ESLint startup cost (~500ms). Fix: (1) use `--cache` flag in ESLint call, (2) only lint if the file is in an ESLint-configured project (`[ -f "$PROJECT_DIR/.eslintrc*" ] || exit 0`), (3) run lint async by backgrounding and only report errors in the next turn.

### Failure: Bash logger JSON is malformed
Cause: `CLAUDE_TOOL_INPUT` contains special characters that break JSON parsing. Fix: always wrap in try-catch; never assume env vars are valid JSON.

---

## Next Steps

1. **Add prompt injection defender**: scan PostToolUse outputs (WebFetch, Read) for injection patterns — Jay's stack uses this at `prompt-injection-defender/post-tool-defender.py`
2. **Add observability forwarding**: forward all events to an external telemetry service (Jay's Multi-Agent-Observability stack pattern)
3. **Add GSD workflow guard**: PreToolUse/Write — block writes if not in an active GSD execution phase (Jay's `gsd-prompt-guard.js` pattern)

---

## Related Recipes

- [[recipes/recipe-parallel-subagents]] — hooks can monitor sub-agent activity via SubagentStop event
- [[frameworks/framework-claude-code]] — full hook architecture reference
- [[entities/jay-west-agent-stack]] — Jay's complete hook setup for inspiration
