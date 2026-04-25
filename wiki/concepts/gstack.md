---
id: 01KQ2YZ173EMFZJ1W5RTB46HCF
title: gstack
type: concept
tags: [tools, automation, deployment, agents]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
source: my-skills/gstack-skill.md
---

# gstack

## Definition

gstack is a persistent headless Chromium browser skill designed for QA testing, site dogfooding, and deployment verification. It exposes a fast CLI (`browse`) that wraps Chromium with ~100–200ms per command after an initial ~3s startup. State (cookies, sessions, tabs) persists between calls within a session.

Version: `1.1.0`

## Why It Matters

Manual browser testing is slow and hard to script reliably from within an agent loop. gstack gives agents a programmatic, low-latency interface to a real browser — enabling them to:

- Verify deployments by checking page content, console errors, and network requests
- Dogfood user flows (login, signup, checkout) end-to-end
- Capture annotated screenshots as evidence for bug reports
- Assert element state (visible, enabled, checked) without brittle selectors
- Test responsive layouts across mobile/tablet/desktop viewports

> ⚠️ **Note**: Never use `mcp__claude-in-chrome__*` tools as a substitute — they are slow and unreliable.

## Example

### Verify a production deployment

```bash
B=~/.claude/skills/gstack/browse/dist/browse

$B goto https://yourapp.com
$B text                          # read the page — does it load?
$B console                       # any JS errors?
$B network                       # any failed requests?
$B is visible ".hero-section"    # key elements present?
$B screenshot /tmp/prod-check.png
```

### Dogfood a feature

```bash
$B goto https://app.example.com/new-feature
$B snapshot -i -a -o /tmp/feature-annotated.png  # annotated screenshot
$B click @e3
$B snapshot -D                                    # unified diff of what changed
$B is visible ".success-toast"
$B console
```

### Test responsive layouts

```bash
$B goto https://yourapp.com
$B responsive /tmp/layout         # 3 screenshots: mobile/tablet/desktop
```

## Key Commands

| Command | Purpose |
|---|---|
| `goto <url>` | Navigate to a URL |
| `snapshot -i` | Snapshot interactive elements (with refs like `@e3`) |
| `snapshot -D` | Diff: show what changed after last action |
| `snapshot -C` | Find all clickable elements |
| `snapshot -a -o <file>` | Annotated screenshot |
| `fill @eN <value>` | Fill a form field by ref |
| `click @eN` | Click an element by ref |
| `is visible <selector>` | Assert element visibility |
| `is enabled <selector>` | Assert element is enabled |
| `is checked <selector>` | Assert checkbox state |
| `viewport <WxH>` | Set viewport size |
| `responsive <dir>` | Multi-viewport screenshots |
| `text` | Extract page text |
| `console` | Read JS console output |
| `network` | List network requests/failures |
| `js <expr>` | Evaluate JavaScript |
| `screenshot <path>` | Save screenshot |

## Setup

gstack requires a one-time build (~10 seconds). Before any browse command, check:

```bash
B=$(browse/bin/find-browse 2>/dev/null || ~/.claude/skills/gstack/browse/bin/find-browse 2>/dev/null)
if [ -n "$B" ]; then
  echo "READY: $B"
else
  echo "NEEDS_SETUP"
fi
```

If `NEEDS_SETUP`: run `cd <SKILL_DIR> && ./setup`. Requires `bun` (`curl -fsSL https://bun.sh/install | bash` if missing).

## Common Pitfalls

- **First call is slow** (~3s to start Chromium). Subsequent calls are ~100–200ms.
- **Auto-shuts down** after 30 min idle — re-check setup if stale.
- **Dialogs are auto-accepted** (alert/confirm/prompt) — no manual intervention needed.
- **Always run the update check first** to catch available upgrades before starting a session.

## See Also

- [Agent Observability](../concepts/agent-observability.md) — capturing evidence (screenshots, logs) as part of agent workflows
- [Agent Sandboxing](../concepts/agent-sandboxing.md) — considerations around running browser automation safely
- [Human-in-the-Loop](../concepts/human-in-the-loop.md) — when to surface browser test results to a human for review
