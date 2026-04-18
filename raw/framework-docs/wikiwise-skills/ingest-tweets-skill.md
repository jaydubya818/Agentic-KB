# Wikiwise — ingest-tweets/SKILL.md

Source: https://github.com/TristanH/wikiwise/blob/main/Sources/Wikiwise/Resources/scaffold/skills/ingest-tweets/SKILL.md
Retrieved: 2026-04-12

---

## Purpose
Collect and ingest Twitter/X threads or search results as raw source material.

## Tools required
Uses `mcp__claude-in-chrome__*` or `mcp__chrome-devtools__*` browser [[mcp-ecosystem]] tools.

## Protocol
1. Navigate to `x.com/search?q=<query>&f=top` (top results filter, not latest)
2. Scroll to collect relevant threads/posts
3. Write ALL collected content into a SINGLE file: `raw/tweets_<topic>_<date>.md`
4. One file per topic session — do not create per-tweet files
5. Run standard INGEST workflow on the combined file

## Output file format
```markdown
# Tweets: <topic> — <date>

## @<handle> — <date>
<tweet content>
<thread continuation if any>

---

## @<handle> — <date>
...
```

## Source trust
Tweets are Tier 5 (Social/Anecdotal) in the source trust policy. Claims sourced only from tweets get `confidence: low`. Use tweets to surface leads, not to establish facts.

## When to use
- Tracking practitioner consensus on emerging patterns
- Identifying who is doing interesting work in an area (leads to better sources)
- Capturing early signals before formal papers/posts exist
