---
title: Automate KB Lifecycle Hooks
type: recipe
difficulty: intermediate
time_estimate: 2-3h
prerequisites:
  - Node.js ≥ 20
  - Agentic-KB running (wiki/ and raw/ directories in place)
  - raw-file-watcher.mjs already exists (ingest hook — partial)
  - Claude Code or equivalent agent runtime available
tested: false
tags: [agentic, memory, deployment, automation, context-management]
---

# Recipe: Automate KB Lifecycle Hooks

## Goal
Fully automate the bookkeeping that kills manually-maintained wikis. Three hooks cover the complete KB lifecycle:
1. **Ingest hook** — new file in raw/ triggers automatic INGEST
2. **Session-end hook** — session close compresses working memory and files it
3. **Scheduled hooks** — cron runs lint weekly, freshness decay monthly, consolidation on threshold

[[llm-wiki]] v2 identified this automation as the feature that separates wikis that compound from wikis that rot. The raw-file-watcher already covers the ingest hook partially — this recipe formalizes and completes all three.

---

## Prerequisites
- `raw/` and `wiki/` directories exist
- `wiki/log.md` is in place (append-only)
- `scripts/generate-stats.mjs` exists (for post-hook stats update)
- Existing `scripts/sofie-watch-obsidian.mjs` (reference implementation for file watching pattern)

---

## Steps

### Step 1 — Complete the Ingest Hook

The existing raw-file-watcher monitors Obsidian directories. Extend it to also watch `raw/` directly and trigger the INGEST workflow.

Create `scripts/hooks/ingest-watcher.mjs`:

```javascript
import chokidar from 'chokidar';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const RAW_DIR = './raw';
const INGEST_LOG = './raw/.ingest-log.json';

// Load or create ingest log (tracks processed files by mtime)
let processed = {};
try { processed = JSON.parse(readFileSync(INGEST_LOG, 'utf8')); } catch {}

const watcher = chokidar.watch(RAW_DIR, {
  ignored: /[\/\\]\.|\.ingest-log/,
  persistent: true,
  ignoreInitial: true
});

watcher.on('add', (filePath) => triggerIngest(filePath));
watcher.on('change', (filePath) => triggerIngest(filePath));

function triggerIngest(filePath) {
  const ext = path.extname(filePath);
  if (!['.md', '.pdf', '.txt'].includes(ext)) return;

  console.log(`[ingest-watcher] New file detected: ${filePath}`);
  // Signal Claude Code / agent to run INGEST workflow
  // Option A: write a bus item
  const busItem = {
    type: 'ingest-request',
    source_path: filePath,
    detected_at: new Date().toISOString(),
    status: 'pending'
  };
  const busPath = `./wiki/system/bus/ingest/${Date.now()}.json`;
  writeFileSync(busPath, JSON.stringify(busItem, null, 2));
  console.log(`[ingest-watcher] Bus item written: ${busPath}`);

  processed[filePath] = Date.now();
  writeFileSync(INGEST_LOG, JSON.stringify(processed, null, 2));
}

console.log(`[ingest-watcher] Watching ${RAW_DIR} for new files...`);
```

Install dependency: `npm install chokidar --save-dev`

---

### Step 2 — Session-End Hook

At session end, working memory should be compressed into a session-class entry and the daily log updated. Add this to your agent's system prompt or CLAUDE.md:

```markdown
## Session-End Protocol (mandatory)
When a session ends (user says goodbye, compaction is imminent, or explicitly triggered):

1. Write a session summary to wiki/system/sessions/YYYY-MM-DD-HH.md:
   Format:
   - **Tasks completed**: bullet list
   - **Discoveries**: anything new learned, patterns observed
   - **Open items**: what was left unfinished
   - **Files changed**: list of wiki/ paths written this session
   
2. If any open items exist, write them to wiki/system/bus/working/ as bus items.

3. Update wiki/hot.md IF any concept was referenced 3+ times this session.

4. Append to wiki/log.md:
   [YYYY-MM-DD] SESSION END | {n} tasks, {m} pages written, {k} open items
```

Create `scripts/hooks/session-summarizer.mjs` for programmatic invocation:

```javascript
import { writeFileSync, appendFileSync, mkdirSync } from 'fs';
import path from 'path';

export function writeSessionSummary({ tasks, discoveries, openItems, filesChanged }) {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 13).replace('T', '-');
  const sessDir = './wiki/system/sessions';
  mkdirSync(sessDir, { recursive: true });

  const content = `# Session Summary: ${dateStr}

## Tasks Completed
${tasks.map(t => `- ${t}`).join('\n')}

## Discoveries
${discoveries.map(d => `- ${d}`).join('\n')}

## Open Items
${openItems.map(o => `- ${o}`).join('\n')}

## Files Changed
${filesChanged.map(f => `- ${f}`).join('\n')}
`;

  writeFileSync(path.join(sessDir, `${dateStr}.md`), content);

  appendFileSync('./wiki/log.md',
    `\n[${now.toISOString().slice(0,10)}] SESSION END | ${tasks.length} tasks, ` +
    `${filesChanged.length} pages written, ${openItems.length} open items\n`
  );

  return path.join(sessDir, `${dateStr}.md`);
}
```

---

### Step 3 — Scheduled Hooks (Cron)

Create `scripts/hooks/scheduled-maintenance.mjs`:

```javascript
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, appendFileSync } from 'fs';

const SCHEDULE_LOG = './wiki/system/maintenance-log.json';

export async function runWeeklyLint() {
  console.log('[maintenance] Running weekly lint...');
  // Trigger LINT workflow — generates wiki/syntheses/lint-{date}.md
  // Implementation: call your existing lint script or invoke Claude agent
  const date = new Date().toISOString().slice(0,10);
  appendFileSync('./wiki/log.md',
    `\n[${date}] SCHEDULED | Weekly lint triggered\n`
  );
}

export async function runMonthlyDecay() {
  console.log('[maintenance] Running monthly freshness decay...');
  // Read all wiki pages, recalculate freshness scores, flag stale items
  // Pages with freshness < 0.40 get flagged in wiki/system/bus/review/
  const date = new Date().toISOString().slice(0,10);
  appendFileSync('./wiki/log.md',
    `\n[${date}] SCHEDULED | Monthly freshness decay run\n`
  );
}

export async function runConsolidation(threshold = 200) {
  // If wiki page count exceeds threshold, suggest consolidation candidates
  // (pages with 0 inbound links, pages with overlapping content)
  console.log(`[maintenance] Checking consolidation threshold (>${threshold} pages)...`);
}
```

Wire into cron (macOS launchd or crontab):

```bash
# Weekly lint — Sundays at 2am
0 2 * * 0 cd /path/to/Agentic-KB && node scripts/hooks/scheduled-maintenance.mjs lint

# Monthly decay — 1st of month at 3am
0 3 1 * * cd /path/to/Agentic-KB && node scripts/hooks/scheduled-maintenance.mjs decay
```

Or use the Cowork schedule skill to wire these as scheduled tasks.

---

## Verification

1. **Ingest hook:** Drop a new `.md` file into `raw/framework-docs/`. Confirm a bus item appears in `wiki/system/bus/ingest/`. Confirm `wiki/log.md` gets an entry within 30 seconds.

2. **Session-end hook:** Manually call `writeSessionSummary({...})` with test data. Confirm `wiki/system/sessions/YYYY-MM-DD-HH.md` created and `wiki/log.md` appended.

3. **Scheduled hooks:** Run `node scripts/hooks/scheduled-maintenance.mjs lint` manually. Confirm lint output appears in `wiki/syntheses/`.

---

## Common Failures & Fixes

**Ingest watcher exits silently:** chokidar requires a persistent process. Run via `node --watch` or wire into a launchd plist / pm2. Check that the process is actually running: `ps aux | grep ingest-watcher`.

**Session summary not triggering:** The session-end hook depends on agent discipline. Add a CLAUDE.md reminder at the top of the file (Layer 1 sticky note). If sessions end abruptly (crash/compaction), the hook won't fire — add a "resume check" at session start that looks for missing session summaries in the last 24h.

**Scheduled cron not running:** On macOS, crontab requires Full Disk Access for the Terminal app. Alternatively use launchd plists in `~/Library/LaunchAgents/`.

---

## Next Steps
- Wire `ingest-watcher` into `pm2` for persistent background operation
- Add Slack/notification webhook on ingest completion so you know when new content is processed
- Extend session summarizer to push summaries to the shared agent workspace (`Agent-Shared/`) per [[patterns/pattern-shared-agent-workspace]]
- See [[recipes/recipe-hybrid-search-llm-wiki]] for what these hooks feed into

## Related Recipes
- [[recipes/recipe-llm-wiki-setup]] — Base wiki setup this hooks into
- [[recipes/recipe-codebase-memory]] — Similar automation pattern for codebase sessions
- [[patterns/pattern-layered-injection-hierarchy]] — Session-end hook maintains the Layer 3 vault
- [[patterns/pattern-shared-agent-workspace]] — Session summaries can feed the shared workspace
