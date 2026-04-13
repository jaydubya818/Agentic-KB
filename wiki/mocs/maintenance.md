---
title: Maintenance & Optimization
type: moc
category: structure
tags: [maintenance, lint, health-checks, backup, git, performance, context-optimization]
created: 2026-04-13
updated: 2026-04-13
---

# Maintenance & Optimization

Keeping the KB sharp, fast, and trustworthy. Covers vault health checks, dead link cleanup, performance tuning, backup and git sync, and Claude context optimization.

---

## Vault Health Checks

**LINT Workflow** (defined in [[CLAUDE.md]]) — the primary health check. Run monthly or after >20 new pages:

| Check | Pass Condition | Failure Action |
|-------|---------------|----------------|
| Orphan pages | No page has 0 inbound links | Add link from MoC or index |
| 2-click rule | Every page reachable from home in ≤2 clicks | Add to relevant MoC |
| Stale frameworks | `last_checked` < 60 days ago | Update or mark deprecated |
| Untested recipes | `tested: false` pages < 30 days old | Test or flag in log |
| Low-confidence claims | `[UNVERIFIED]` tags resolved | Web search → update or remove |
| Gap candidates | Concepts referenced but no page exists | Create or note as gap |
| Inbound link density | Hub pages have multiple inbound links | Add backlinks from related pages |

**Output:** `wiki/syntheses/lint-{YYYY-MM-DD}.md`

**Lint history:**
- [[syntheses/lint-2026-04-12]] — post-Wikiwise session
- [[syntheses/lint-2026-04-06]] — initial lint

**Quick daily health signal:** check the graph view (see [[mocs/visualization]]) — isolated nodes immediately visible.

---

## Dead Link Cleanup

Dead links (links to non-existent pages) are the most common structural failure. Sources:
- Pages deleted without updating inbound links
- Typos in wiki link paths
- Pages moved without redirect

**Detection:**
Obsidian flags dead links natively (unresolved links appear in the backlinks panel with no source). Graph view shows them as isolated nodes.

**Cleanup protocol:**
1. Run graph view with `path:wiki/` filter
2. Identify isolated nodes (dead link destinations)
3. For each: either create the missing page or update all inbound links to the correct target
4. After cleanup: append to `wiki/log.md` with count of links fixed

**Prevention:**
- Never delete a page without searching for inbound links first (`Ctrl+Shift+F` in Obsidian)
- Use the "Rename" function (not manual file rename) — Obsidian auto-updates all links

---

## Performance Tuning

For large vaults (this KB will exceed 500 pages as it grows), performance optimization matters:

**Indexing:**
- Obsidian re-indexes on every vault open. Exclude `raw/` from search if only querying wiki content.
- Add `.obsidianignore` entry for `.brv/` (if ByteRover ever used) and any large binary directories.

**Dataview:**
- Heavy `TASK` queries across the full vault are expensive. Scope queries to specific folders: `FROM "wiki/concepts"` not `FROM ""`.
- Cache expensive queries in a dedicated `wiki/stats.md` page refreshed on demand, not live.

**Context budget for Claude:**
- Maximum useful context = hot.md (500w) + 1 MoC (400w) + 5 concept pages (~600w each) ≈ 3,900 words
- Loading the entire wiki index degrades answer quality — prefer targeted page loads
- See [[mocs/advanced-techniques|Advanced Techniques]] → Vault-as-Context Engineering

---

## Backup & Git Sync

**Git sync** is the recommended backup strategy for this vault structure — Markdown files git-diff cleanly, and the commit history is a readable audit trail of KB evolution.

Recommended setup:
```bash
cd /Users/jaywest/Agentic-KB
git init
git remote add origin git@github.com:jaywest/agentic-kb.git
# Auto-commit hook on save (via Obsidian Git plugin):
# Commit message: "auto: {file} @ {timestamp}"
```

**Obsidian Git Plugin** — auto-commit on save, auto-push on schedule. Configure:
- Vault backup interval: every 10 minutes
- Auto-pull on startup: yes
- Commit message template: `vault: {{date}} — {{numFiles}} files changed`

**What to exclude from git:**
```
.obsidian/workspace.json   # noisy, machine-specific
.obsidian/cache            # regenerated
.DS_Store                  # macOS noise
```

**Immutability check:** `raw/` should never have uncommitted changes from LLM sessions. If a diff shows raw/ modified, something violated the immutability rule — investigate before committing.

---

## Claude Context Optimization

The KB is also optimized as a context source for Claude. Key principles (detailed in [[mocs/advanced-techniques|Advanced Techniques]]):

- **hot.md** — primes Claude on the most important 500 words. Update when a pattern is referenced 3+ times in one week.
- **Self-contained pages** — each page should work when loaded alone. No "as mentioned above" references.
- **Confidence signals** — Claude weights high-confidence claims more heavily. Low-confidence flags tell Claude to hedge.
- **Recency signals** — `updated` date helps Claude prioritize fresher information over stale.
- **Length discipline** — concept pages 400-800 words, not 2000. Longer pages increase context cost without proportional value.

**Context cost check:** before a major ingestion session, estimate context budget: will loading the planned pages fit in a single Claude session? If not, break into multiple sessions or summarize first.

---

## Related

- [[mocs/automation|Automation]] — Automated maintenance scripts
- [[mocs/visualization|Visualization]] — Graph view as health signal
- [[log]] — Append-only audit trail
- [[syntheses/lint-2026-04-12]] — Most recent lint report
