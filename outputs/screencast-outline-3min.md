---
title: Sponsor Demo Screencast — 3-Minute Outline
type: screencast-script
date: 2026-04-18
audience: executive sponsor + InfoSec
target_length: 3:00 (hard cap 3:30)
recording_tool: QuickTime / ScreenFlow / OBS
resolution: 1920×1080, 30fps minimum
---

# 3-Minute Demo Screencast — Script

> **Goal:** Convince the sponsor in 3 minutes that this is real, safe, and useful. **One persona** (a Workday Xpresso dev), **one realistic problem** (debugging an Xpresso compile error), **one continuous workflow** end-to-end. No edits except cuts between segments.

## Pre-roll prep (do once before recording)

- Hide all dock notifications, set Do Not Disturb, close personal tabs.
- Open three windows pre-positioned:
  1. Terminal (left half) — `cd ~/workday`, prompt cleared, font ≥ 18pt.
  2. Claude Code (right half).
  3. Browser tab 1: KB web UI at `localhost:3002`. Tab 2: `brain dashboard` at `localhost:3847`.
- Pre-write the dev's "captured insight" in your head — don't type from memory live.
- Stage a realistic Xpresso error in Terminal scrollback so paste is instant.
- Test mic: record 10 seconds, listen back.

## Beat sheet (target durations are budgets, not goals)

### 0:00 – 0:15 · Cold open (15s)
**On screen:** Terminal full-screen, an Xpresso compile error pasted.
**Voiceover:**
> "It's Tuesday afternoon. I'm a Workday Xpresso dev. I just hit a compile error I haven't seen before. Old workflow — slack a senior, wait an hour, lose context. New workflow — this."

### 0:15 – 0:55 · Query the shared KB (40s)
**On screen:** Type into terminal:
```
kb query "Xpresso compile error: cannot resolve symbol in deferred binding"
```
**Voiceover:**
> "Query goes to our internal Xpresso knowledge base. Compiled by Claude from the language spec, ADRs, and senior-engineer war stories. Hosted on a Workday VM, all LLM calls through our internal gateway — nothing leaves the network."

**Cut to:** Browser tab — same question typed in the web UI. Show streaming answer, citations.
**Voiceover (over the streaming answer):**
> "Same KB, browser surface. Every claim cites the wiki page it came from. I can click through to the source. Median answer time: under 30 seconds."

### 0:55 – 1:40 · Inside Claude Code (45s)
**On screen:** Switch to Claude Code window. Type:
> "I'm hitting that deferred-binding error. Look at the Xpresso KB and my own notes — what have I tried before that's relevant?"

**Voiceover:**
> "Same KB available inside Claude Code as an MCP tool. But now Claude also pulls from my personal brain — local-only, on my laptop, never synced to the cloud. So it can remember that I hit a similar issue last sprint and what worked."

**Highlight in the Claude response:** the two MCP tool calls (one to `agentic-kb`, one to `second-brain`).

### 1:40 – 2:20 · Capture the new insight (40s)
**On screen:** Terminal:
```
echo "## Deferred binding fix\n\nResolved by ..." > ~/workday/brain/raw/2026-04-tue-deferred-binding.md
brain ingest
brain diff
```
**Voiceover:**
> "I just learned something new. Capture it — one file in raw, one ingest. Now the trust boundary kicks in."

**Cut to:** Output of `brain diff` showing the proposed wiki change.
**Voiceover:**
> "Every change to my brain is a git diff I review before commit. Nothing the AI writes lands silently. I scan it — looks right —"

```
brain approve -m "deferred binding gotcha"
```

> "— approved, committed locally. Not pushed anywhere. My second brain just got smarter."

### 2:20 – 2:50 · The egress proof (30s)
**On screen:** Terminal:
```
sudo pfctl -sr | grep "api.anthropic\|api.openai"
```
Show the firewall rules blocking public LLM endpoints.

**Voiceover:**
> "The whole demo I just ran — public LLM endpoints firewall-blocked. Every model call routed through Workday's gateway. This is the InfoSec story."

**Cut to:** `tail -5 ~/workday/xpresso-kb/logs/audit.log` showing internal-gateway hostname.

### 2:50 – 3:00 · Close (10s)
**On screen:** Black slide or Claude Code window with three bullets:
- 8-week pilot · 5–8 devs
- Internal LLM only · git-reviewed personal brain
- Time-to-answer < 30s

**Voiceover:**
> "Pilot is 8 weeks, 5 to 8 devs. I need your sign-off and an intro to InfoSec and the LLM gateway team. Plan and exec brief in your inbox."

## Post-production checklist
- Trim dead air at every cut.
- Add a 1-second title card up front: "Xpresso AI KB — Pilot Demo · April 2026"
- Add captions (auto-generated then hand-corrected — Workday accessibility policy).
- Export 1080p H.264, < 100 MB target.
- Upload to **internal video host only** (never YouTube). Confirm access list before sharing.

## What NOT to show
- Real Xpresso source code from production repos.
- Customer data, ticket numbers, or internal Slack screenshots.
- Anyone's name except yours.
- Any URL pointing outside `*.workday.com`.

## Backup if something breaks live
Pre-record each segment separately. If the live demo flakes during recording, you can splice. Aim for **one clean live take** but have the backup.
