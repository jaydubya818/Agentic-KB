---
title: Hermes Bootstrap Acceptance Test
type: personal
category: pattern
date: 2026-04-25
tags: [agentic, bootstrap, hermes, acceptance-test]
reviewed: false
reviewed_date: ""
confidence: medium
---

# Hermes Bootstrap Acceptance Test

> Minimal end-to-end acceptance test for a **Hermes terminal** after pasting
> `[[universal]]` + `[[hermes]]`.

## Preflight

Run in the shell before starting the Hermes session:

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
node cli/kb.js session bootstrap hermes | pbcopy
```

Paste that into the Hermes terminal first.

## Generate a unique test marker

```bash
STAMP=$(date +%Y%m%d-%H%M%S)
echo "$STAMP"
```

## Exact Hermes prompt

Replace `<STAMP>` below with your generated value and paste this into the
**Hermes terminal** after the bootstrap prompt.

```text
Acceptance test marker: BOOTSTRAP-HERMES-<STAMP>

You have permission to create clearly labeled TEST artifacts and commit this test through Sofie.

Do exactly this:
1. State the lane first.
2. Search KB for supervisor-worker delegation and cite at least one KB source in [[wiki/...]] format.
3. Read Vault Action Tracker and cite [vault: 07 - Tasks/Action Tracker.md].
4. Create a Sofie close-task payload for this marker with:
   - project = BOOTSTRAP-HERMES-<STAMP>
   - one decision
   - one action
   - one sessionSummary
   - one clientUpdate
   - one discovery
5. Run dry-run close-task for Sofie, then run the real close-task.
6. Run kb agent verify-audit.
7. Return PASS/FAIL only with:
   - lane
   - KB citation(s)
   - vault citation(s)
   - payload path
   - exact written artifact paths
   - audit result
```

## Pass criteria

Hermes passes only if all of these are true:

- It states a lane first.
- It cites KB with `[[wiki/...]]`.
- It cites Vault with `[vault: 07 - Tasks/Action Tracker.md]`.
- It routes business writeback through **Sofie**.
- `dry-run-close-task` succeeds.
- `close-task` succeeds.
- `kb agent verify-audit` succeeds.
- The expected KB and Vault artifacts exist on disk.

## Verification from Pi / shell

Replace `<STAMP>` with the same value used in Hermes.

```bash
cd /Users/jaywest/Agentic-KB
node cli/kb.js agent verify-audit

rg -n "BOOTSTRAP-HERMES-<STAMP>" \
  wiki/system/bus/discovery \
  wiki/agents/leads/sofie/task-log.md \
  logs/audit.log \
  "/Users/jaywest/Documents/Obsidian Vault"
```

Expected artifact families:

- `wiki/system/bus/discovery/discovery-*.md`
- `wiki/agents/leads/sofie/task-log.md`
- `logs/audit.log`
- `06 - Decisions/...bootstrap-hermes-<STAMP>...md`
- `04 - Sessions/...bootstrap-hermes-<STAMP>...md`
- `01 - Clients/BOOTSTRAP-HERMES-<STAMP>.md`
- appended line in `07 - Tasks/Action Tracker.md`

## Related

- `[[universal]]`
- `[[hermes]]`
- `[[pi-acceptance-test]]`
