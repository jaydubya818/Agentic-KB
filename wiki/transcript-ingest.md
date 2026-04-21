---
title: Call Transcript Ingest SOP
type: sop
tags: [ingest, transcripts, sop, operational]
created: 2026-04-20
updated: 2026-04-20
reviewed: false
reviewed_date: ""
---

# Meeting Note Ingest — SOP
> Extension of the standard [[CLAUDE|INGEST]] workflow for meeting-derived files.
> Triggered when a file in `raw/transcripts/` has frontmatter `type: meeting-note` AND `ingest_status: pending`.
> Source: Obsidian Vault `05 - Meetings/` staged via `sofie-watch-obsidian.mjs`.
> Non-meeting types (`sofie-session`, `daily-note`, `obsidian-note`, YouTube transcripts) do NOT trigger this SOP — they use the standard INGEST workflow.

## TL;DR
Standard INGEST handles knowledge extraction. Meeting-note INGEST adds three extraction passes — **summary**, **actions**, **decisions** — that write to operational wiki targets (not just `summaries/`).

## Pipeline
For each pending meeting note in `raw/transcripts/`:

1. **Read** the full transcript including the staged frontmatter.
2. **Summary pass** — write `wiki/summaries/{slug}.md` using the standard summary frontmatter. Include:
   - 3-5 bullet "What was discussed"
   - Participants (from the transcript header if present, else inferred)
   - One-paragraph narrative of the key arc of the conversation
3. **Actions pass** — append every commitment to `wiki/action-tracker.md` under `## Open`:
   - Format: `- [ ] {description} — owner: {name} · due: {YYYY-MM-DD or "tbd"} · source: [[summaries/{slug}]]`
   - If ambiguous ownership, use `owner: tbd` — never guess.
   - If ambiguous deadline, use `due: tbd`.
   - Deduplicate against existing open actions (case-insensitive substring match on description + owner).
4. **Decisions pass** — for every durable decision (something that changes how work is done going forward, not just a task), create `wiki/decisions/decision-{YYYY-MM-DD}-{slug}.md` following the schema in `wiki/decisions/README.md`:
   - Prepend a link to `wiki/decisions/README.md` `## Index` section.
   - Cross-link from the summary page.
5. **Standard INGEST** — apply steps 4-11 of the canonical INGEST workflow in `CLAUDE.md` (concept/entity extraction, autolink, index + log updates, recently-added, MoC updates). Treat client names, vendors, and people as canonical entities — add them to `scripts/entity-map.json` if missing.
6. **Flip status** — update the transcript's frontmatter: `ingest_status: pending` → `ingest_status: ingested` and stamp `ingested_at: {ISO timestamp}`.
7. **Log** — append one entry to `wiki/log.md`:
   ```
   [YYYY-MM-DD HH:MM] INGEST call-transcript: {slug}
     Summary:   wiki/summaries/{slug}.md
     Actions:   {N} added
     Decisions: {N} logged
     Entities:  {list of new canonical entities}
     Contradictions: {none | list}
   ```

## Boundary Rules
- **Never silently overwrite** an existing summary, action, or decision. If a contradiction is detected (e.g. a decision reversed on a later call), flag it in `log.md` AND set `supersedes: [[old-decision]]` on the new decision page.
- **Confidence defaults to `medium`** for anything inferred from tone or context rather than stated explicitly.
- **Do not hallucinate ownership or deadlines.** `tbd` is always acceptable.
- **Respect the reviewed flag** — LLM-authored summaries, decisions, and tracker edits are born `reviewed: false`. Only Jay flips to `true`.

## Failure Modes & Recovery
- **Transcript is empty or garbled** → skip, log a warning to `wiki/log.md`, leave `ingest_status: pending` so it surfaces on the next lint pass.
- **Ambiguous decision vs. action** → default to action. Decisions are a higher bar: they outlast the sprint.
- **Same meeting noted twice** (Obsidian note + a separate transcript file of the same meeting) → detect by title + date proximity; ingest the longer one; move the duplicate to `raw/archive/transcripts/`.

## Related
- [[CLAUDE|Schema / INGEST canonical workflow]]
- [[action-tracker|Action Tracker]]
- [[decisions/README|Decisions Log]]
- `scripts/sofie-watch-obsidian.mjs` — staging script (Obsidian Vault → `raw/transcripts/`)
