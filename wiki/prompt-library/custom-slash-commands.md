---
title: Custom Slash Commands
type: personal
category: pattern
confidence: high
date: 2026-04-13
tags: [prompts, slash-commands, claude-code, commands, automation]
---

# Custom Slash Commands

Jay's `.claude/commands/` library. Slash commands are markdown files in `~/.claude/commands/` invoked via `/command-name` in Claude Code. Simpler than full skills — no SKILL.md overhead.

---

## How Slash Commands Work

Claude Code reads `~/.claude/commands/` on startup. Each `.md` file becomes a `/command-name` invokable from the prompt. The file content is the system instruction for that command.

```
~/.claude/commands/
├── ingest.md          → /ingest
├── lint.md            → /lint  
├── brief.md           → /brief
├── explore.md         → /explore
├── hot.md             → /hot-update
└── query.md           → /query
```

---

## /ingest

**File:** `~/.claude/commands/ingest.md`

```markdown
Run the INGEST workflow on the specified file from raw/.

Steps:
1. Read the full source file
2. Extract concepts, patterns, frameworks, key claims, code examples, Jay-specific insights
3. Create wiki/summaries/{source-slug}.md with full frontmatter and key points
4. Update or create relevant concept/pattern/framework pages
5. Flag contradictions with existing wiki content
6. Cross-link bidirectionally
7. Update wiki/index.md and wiki/log.md
8. Append to wiki/recently-added.md

Usage: /ingest raw/path/to/file.md
```

---

## /lint

**File:** `~/.claude/commands/lint.md`

```markdown
Run the LINT workflow on the Agentic-KB wiki.

Steps:
1. Read wiki/index.md for all page paths
2. Check orphan pages (no inbound links)
3. Check 2-click rule (every page reachable from home.md in ≤2 clicks)
4. Check stale framework pages (last_checked > 60 days)
5. Check untested recipes older than 30 days
6. Check low-confidence claims for verification candidates
7. Identify gap candidates (concepts referenced but no page exists)
8. Output lint report to wiki/syntheses/lint-{today}.md

Usage: /lint
```

---

## /brief

**File:** `~/.claude/commands/brief.md`

```markdown
Run the BRIEF workflow on a topic.

Steps:
1. Read wiki/index.md to identify relevant pages
2. Read the top 5-8 relevant pages
3. Write a 400-600 word structured briefing:
   Current State → Key Tensions → Open Questions → Recommended Next Steps
4. Every claim cites its wiki page: [Source: wiki/concepts/page-name]
5. Save to outputs/brief-{topic}-{today}.md
6. Offer to promote to wiki/syntheses/ if it surfaces new connections

Usage: /brief {topic}
```

---

## /explore

**File:** `~/.claude/commands/explore.md`

```markdown
Run the EXPLORE workflow to find unexplored connections in the KB.

Steps:
1. Read wiki/index.md in full
2. Identify the 5 most interesting unexplored connections between existing topics
3. For each: explain the insight, the question it answers, what source would confirm it
4. Offer to create a wiki/syntheses/ page for any the user wants to develop
5. Suggest 3 raw sources or web articles that would enrich the weakest areas

Usage: /explore
```

---

## /hot-update

**File:** `~/.claude/commands/hot.md`

```markdown
Review and update wiki/hot.md.

Rules:
- hot.md must stay ≤500 words
- Add: any concept referenced 3+ times in this session
- Add: any pattern Jay explicitly requested be cached
- Prune: least-accessed entries if adding would exceed 500 words
- Structure: brief summaries with [[wiki links]], not full explanations
- Never exceed 600 words even temporarily

Current hot.md content will be shown. Propose specific additions and removals.

Usage: /hot-update
```

---

## /query

**File:** `~/.claude/commands/query.md`

```markdown
Run the QUERY workflow against the Agentic-KB.

Steps:
1. Read wiki/hot.md first (frequently-used context)
2. Read wiki/index.md to find relevant pages
3. Read relevant concept/pattern/framework pages
4. Synthesize answer with specific citations ([[page-name]])
5. If the question touches gaps: do a web search, then backfill the wiki before answering
6. If answer is >200 words of synthesis: offer to file as wiki/syntheses/synthesis-{slug}.md
7. Offer to update hot.md if this query is likely to recur

Usage: /query {your question}
```

---

## /hermes

**File:** `~/.claude/commands/hermes.md`

```markdown
Activate Hermes mode for this session.

Steps:
1. Read wiki/hot.md
2. Read wiki/personal/hermes-operating-context.md
3. If domain-specific, read the relevant MoC
4. Operate as Hermes for the remainder of the session:
   - Route all requests by work lane
   - Apply the delegation contract
   - Surface escalation triggers
   - Produce decision-ready artifacts

This is automatically triggered on Cowork session start via CLAUDE.md.
Use /hermes to re-activate after a long conversation drifts from context.

Usage: /hermes
```

---

## Adding New Commands

1. Create `~/.claude/commands/{command-name}.md`
2. Write the instruction content — what Claude should do when this command is invoked
3. Test with `/command-name` in Claude Code
4. Document here with usage notes

If a command proves high-value and needs more structure, promote to a full skill in `~/.claude/skills/`.

---

## Related

- [[prompt-library/index|Prompt Library]] ← parent
- [[mocs/claude-integration|Claude Integration]] — .claude/commands/ folder setup
- [[mocs/automation|Automation]] — Promoting commands to skills
