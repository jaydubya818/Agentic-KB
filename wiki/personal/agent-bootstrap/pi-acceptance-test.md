---
title: Pi Bootstrap Acceptance Test
type: personal
category: pattern
date: 2026-04-25
tags: [agentic, bootstrap, pi, acceptance-test]
reviewed: false
reviewed_date: ""
confidence: medium
---

# Pi Bootstrap Acceptance Test

> Minimal end-to-end acceptance test for a **Pi terminal** after pasting
> `[[universal]]` + `[[pi]]`.

## Preflight

Run in the shell before starting the Pi session:

```bash
cd /Users/jaywest/Agentic-KB
export KB_API_URL=http://localhost:3000
```

Ensure the KB web server is running:

```bash
cd /Users/jaywest/Agentic-KB
npm --prefix web run dev
```

Load the bootstrap prompt into your clipboard:

```bash
cd /Users/jaywest/Agentic-KB
node cli/kb.js session bootstrap pi | pbcopy
```

Paste that into the Pi terminal first.

## Generate a unique test marker

```bash
STAMP=$(date +%Y%m%d-%H%M%S)
echo "$STAMP"
```

## Exact Pi prompt

Replace `<STAMP>` below with your generated value and paste this into the
**Pi terminal** after the bootstrap prompt.

```text
Acceptance test marker: BOOTSTRAP-PI-<STAMP>

Use the Pi bootstrap rules exactly.
On this machine, use worker contract gsd-executor.

Do exactly this:
1. Load agent context for gsd-executor with project bootstrap-pi-acceptance.
2. Start a task for gsd-executor.
3. Search KB for supervisor-worker and cite [[wiki/patterns/pattern-supervisor-worker]] if found.
4. Run kb agent verify-audit.
5. Close the task with:
   - project = bootstrap-pi-acceptance
   - taskLogEntry = BOOTSTRAP-PI-<STAMP> completed worker acceptance test
   - one discovery noting KB search + audit passed and no vault writes occurred
6. Confirm no Vault write was attempted and that Vault writes must route through Sofie.
7. Return only:
   { status, evidence, next }

Rules:
- no direct Vault writes
- if anything fails, status=red and publish escalation instead of discovery
```

## Pass criteria

Pi passes only if all of these are true:

- It uses worker contract `gsd-executor`.
- It loads context and starts a task.
- It searches KB and cites the result.
- It verifies the audit chain.
- It closes the task successfully.
- It writes only to the worker namespace / discovery bus.
- It does **not** create any Vault artifacts.
- It returns worker-style output: `{ status, evidence, next }`.

## Verification from Pi / shell

Replace `<STAMP>` with the same value used in Pi.

```bash
cd /Users/jaywest/Agentic-KB
node cli/kb.js agent verify-audit

rg -n "BOOTSTRAP-PI-<STAMP>" \
  wiki/system/bus/discovery \
  wiki/agents/workers/gsd-executor/task-log.md \
  logs/audit.log

rg -n "BOOTSTRAP-PI-<STAMP>" \
  "/Users/jaywest/Documents/Obsidian Vault"
# expected: no output
```

Expected artifact families:

- `wiki/system/bus/discovery/discovery-*.md`
- `wiki/agents/workers/gsd-executor/task-log.md`
- `wiki/agents/workers/gsd-executor/active-task.md`
- `wiki/agents/workers/gsd-executor/working-memory/*.md`
- `logs/audit.log`
- no Vault hits

## Related

- `[[universal]]`
- `[[pi]]`
- `[[hermes-acceptance-test]]`
