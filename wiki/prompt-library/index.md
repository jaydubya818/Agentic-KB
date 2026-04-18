---
title: Prompt Library
type: moc
category: prompt-library
tags: [prompts, claude-code, slash-commands, thinking-tools, reflection]
created: 2026-04-13
updated: 2026-04-13
---

# Prompt Library

Reusable prompts, thinking tools, and slash commands for working with Claude across engineering, research, and knowledge management tasks. Organized by use case.

---

## Contents

- [[prompt-library/thinking-tools|Thinking Tools]] — `/trace`, `/challenge`, `/steelman`, `/assumptions` and other reasoning scaffolds
- [[prompt-library/note-processing|Note Processing Prompts]] — Ingest, summarize, extract, link, and synthesize notes
- [[prompt-library/idea-generation|Idea Generation]] — Brainstorming, divergent thinking, constraint removal
- [[prompt-library/reflection-synthesis|Reflection & Synthesis]] — Session debrief, cross-note synthesis, pattern extraction
- [[prompt-library/custom-slash-commands|Custom Slash Commands]] — Jay's `.claude/commands/` library with usage notes

---

## How to Use

**In [[framework-claude-code]]:** paste the prompt text directly, or invoke the relevant slash command if registered in `~/.claude/commands/`.

**In Cowork:** paste prompt text into the conversation. Hermes will detect the intent and route accordingly.

**As a skill trigger:** prompts that follow a consistent pattern (same inputs, same output format) are candidates for promotion to `~/.claude/skills/` as a full skill definition.

---

## Prompt Quality Standards

A good prompt in this library:
- **States the output format explicitly** — "Return a markdown table with columns X, Y, Z"
- **Sets the constraint** — "In 200 words or fewer" / "3 options only" / "No hedging"
- **Specifies the reasoning mode** — thinking step-by-step, steel-manning, devil's advocate
- **Is tested** — run on ≥3 different inputs; confirm output quality

---

## Related

- [[mocs/claude-integration|Claude Integration]] — .claude/commands/ folder setup
- [[mocs/automation|Automation]] — Promoting prompts to skills
- [[mocs/knowledge-workflows|Knowledge Workflows]] — Note processing workflows
