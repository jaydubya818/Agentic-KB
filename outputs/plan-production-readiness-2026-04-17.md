---
title: Agentic-KB Production-Readiness Fix Plan
type: plan
date: 2026-04-17
scope: correctness + bugs, surgical fixes only
status: awaiting-approval
---

# Production-Readiness Fix Plan — 2026-04-17

## How this was built
Six parallel Explore agents reviewed `web/api`, `web/pages+components`, `mcp/server.js`, `cli/kb.js`, `lib/{agent,repo}-runtime`, and `scripts/`. Every line number below is a claim from those agents; I will re-read each file and verify before editing. Surgical only — no refactors, no style polish.

Findings are grouped by theme so related fixes can ship together.

---

## TIER 1 — CRITICAL (fix before anything else)

### 1. Path traversal across MCP tools (mcp/server.js)
User-supplied `slug` / `repo` / `type` / `project` values flow into `path.join(KB_ROOT, ...)` with no containment check. An LLM driven by a prompt-injected document can read or write outside the KB root.

- `mcp/server.js:656–658` — `read_article` slug
- `mcp/server.js:876` — `get_repo_home` repo
- `mcp/server.js:893` — `search_repo_docs` repo
- `mcp/server.js:993` — `write_rewrite_artifact` repo + type (**write** side, worst case)

**Fix:** Add one helper — `safeJoin(root, ...parts)` that resolves then verifies `resolved.startsWith(root + path.sep)` and rejects otherwise. Use everywhere a user string touches a path. **≈20 lines, one file.**

### 2. Path traversal in CLI (cli/kb.js)
Same class of bug, CLI side.
- `cli/kb.js:181, 195, 366, 434, 585, 651` — slug → `path.join(KB_ROOT, 'wiki', slug + '.md')`
**Fix:** Same `safeJoin` helper; validate slug `^[a-z0-9][a-z0-9/-]*$` before use.

### 3. Path traversal in web API
- `web/src/app/api/article/route.ts:18` — `filePath` query param
- `web/src/app/api/repos/[repo]/docs/route.ts:61–62` — `repo` segment

**Fix:** Share one `safeJoin` util (can live in `web/src/lib/safe-path.ts`). Validate `repo` matches `[a-zA-Z0-9_-]+`.

### 4. Command injection risk in CLI
- `cli/kb.js:404, 426, 530` — `execSync('rm -rf ' + tmpDir)` and `execSync('unzip -q "' + resolvedPath + '"...')`
**Fix:** Switch to `spawnSync(cmd, [args], {shell: false})` — no string concat, no shell.

### 5. Credentials written world-readable (scripts/team-setup.sh)
- `scripts/team-setup.sh:141–144, 189–192` — heredoc writes `.env.local` / `.env` with default umask; any local user can read API keys.
**Fix:** `umask 077` at top of script, or `chmod 600` immediately after each write. 2-line change.

### 6. Off-by-one in CLI arg parsing (cli/kb.js:1189)
`args` is already sliced at top (line 29) and then sliced again inside `parseArgs(args.slice(1))` at 1189. Drops a positional arg — `kb search foo` passes only `['search']` downstream.
**Fix:** Remove the inner `.slice(1)`. **Needs verification** — this one surprised me, I will re-read before changing.

### 7. PIN bypass (mcp/server.js + private search)
- `mcp/server.js:639, 669, 707, 747, 782` — PIN comparison does not reject when `PRIVATE_PIN === ''`, so private content becomes readable.
**Fix:** Early-out `if (!PRIVATE_PIN) return error("private disabled")` at top of the check.

### 8. Hardcoded user paths (sofie-* scripts + vault-structure)
Works only on Jay's laptop; breaks in CI and for anyone else.
- `scripts/sofie-ingest-session.mjs:29`
- `scripts/sofie-kb-digest.mjs:26`
- `scripts/sofie-watch-obsidian.mjs:27`
- `web/src/app/api/vault-structure/route.ts:8`
**Fix:** Read `process.env.OBSIDIAN_VAULT_ROOT` (or existing `DEFAULT_KB_ROOT`) with a sensible fallback.

---

## TIER 2 — HIGH (correctness / data-integrity, no security)

### 9. Unprotected `JSON.parse` on untrusted input
Multiple sites crash on malformed input.
- `mcp/server.js:790` — `await res.json()` without try
- `cli/kb.js:850, 1047` — `JSON.parse(fs.readFileSync(...))`
- `web/src/app/api/compile/route.ts:258–260` — `analysisText.match(/\{[\s\S]*\}/)[0]` when match is null
- `web/src/app/api/query/route.ts:101` — `response.content[0].type` without checking array
- `web/src/app/api/lint/route.ts:178` — same pattern

**Fix:** Wrap each in `try/catch` and return a structured 4xx/isError, not a crash.

### 10. Missing awaits
- `web/src/app/api/repos/[repo]/close-task/route.ts:17` — `closeTask()` is async but not awaited (**needs verification**; the agent was inferring from sibling patterns)
**Fix:** Add `await` once verified.

### 11. Race conditions on shared state files (lib/)
Append-only logs and task state files are read-modify-written without any lock or atomic append.
- `lib/agent-runtime/writeback.mjs:217` — append-only racing
- `lib/agent-runtime/task-lifecycle.mjs:166` — status check races with concurrent abandon/close
- `lib/agent-runtime/bus.mjs:124–128` — double read of same file
- `lib/repo-runtime/sync.mjs:184` — `existsSync` then `writeFile` race

**Fix:** Two changes do most of the work:
1. Switch append-only logs to `fs.appendFileSync(path, data)` (atomic append on posix).
2. For read-modify-write, write to `path.tmp` then `fs.renameSync` atomically.
No cross-process locking beyond that — this is a single-user KB.

### 12. Silent error-swallowing that hides real failures
- `lib/agent-runtime/audit.mjs:11–13` — bare `catch {}` on all audit errors
- `lib/agent-runtime/promotion.mjs:92–94` — file-read and YAML-parse errors collapsed into one catch
- `cli/kb.js:445` — Twitter archive parse returns `[]` silently on bad JSON
- `web/src/components/WikiSidebar.tsx:40–43` — `.catch(() => {})` on fetch

**Fix:** Split try blocks so file-I/O errors log to stderr; keep parse errors silent only where intended.

### 13. Next.js / React rendering correctness
- Non-unique `key={idx}` on `.map()` in: `web/src/app/repos/[repo]/page.tsx:478–480`, `web/src/app/query/page.tsx:478–480`, `web/src/components/QueryPanel.tsx:494–512`, `web/src/app/process/page.tsx:287, 304`
- `web/src/components/QueryPanel.tsx:395` — ReactMarkdown `<a>` renders `href="undefined"` when href missing

**Fix:** Use a stable composite key (`${path}-${idx}`); fallback `href={href || '#'}` with conditional render.

### 14. Wrong HTTP status codes
- `web/src/app/api/search/route.ts:30–34` — returns 401 for bad PIN; should be 403.

**Fix:** One-line status change.

---

## TIER 3 — MEDIUM (edge cases, debugging, observability)

- `web/src/app/api/query/save/route.ts:71–74` — TOCTOU on new slug; use `{flag: 'wx'}` on write.
- `web/src/app/api/query/save/route.ts:29–31` — YAML values not quote-escaped; will break on `"` in answer.
- `mcp/server.js:897–911` — `walkDir` doesn't handle ENOENT mid-traversal.
- `mcp/server.js:995` — frontmatter YAML built via string interpolation without escaping.
- `cli/kb.js:220, 274` — fetches not wrapped in try/catch; network blip crashes CLI.
- `cli/kb.js:98–102` — `parseArgs` reads `args[++i]` without bounds check — `kb search --scope` with no value crashes.
- `cli/kb.js:1114` — `--body` consumes all trailing args including other flags.
- `cli/kb.js:693` — `kb agent` with no subcommand crashes instead of showing usage.
- `cli/kb.js:828, 838` — `process.exitCode = 2` set but execution continues.
- `lib/agent-runtime/context-loader.mjs:62–66` — `new Date(malformed)` returns NaN; file incorrectly treated as fresh.
- `lib/agent-runtime/frontmatter.mjs:59–60` — `parseFloat('Infinity')` returns `Infinity`; should reject.
- `lib/agent-runtime/ids.mjs:11` — `_tsSeq` not atomic; concurrent timestamp collisions.
- `lib/agent-runtime/paths.mjs:48` — `path.isAbsolute(rel)` is dead code (always false).
- `lib/agent-runtime/writeback.mjs:163` — ternary precedence bug (**needs verification** — agent flagged logic inversion, this one I want to read carefully).
- `scripts/ingest-omm.sh:26` — non-portable `find -prune` on BSD/macOS.
- `scripts/team-setup.sh:340–364` — PIN embedded in inline Node script without JSON-escaping.
- `scripts/sofie-kb-digest.mjs:84` — hardcoded lint date `2026-04-06`.

---

## TIER 4 — LOW (deferrable)

- `web/src/components/TopBar.tsx:352` / `IngestForm.tsx:132` — HTML entities (`&ldquo;`, `&quot;`) in JSX text; cosmetic.
- `web/src/app/repos/[repo]/page.tsx:90` — `any[]` on `searchResults`; type-safety only.
- `cli/kb.js:307, 424` — hardcoded `/tmp/`; should be `os.tmpdir()`.
- `mcp/server.js:85` — full-text lowercase on every search; perf only.
- Agent findings 11–17 in `lib/` report — mostly observability / documentation mismatches.

---

## Excluded from this pass (out of scope)

- Adding tests (user picked correctness + bugs, not Tests + CI).
- Splitting `mcp/server.js` / `cli/kb.js` into smaller modules (user picked surgical only).
- Perf/DX (caching, structured logging, types) (user did not pick Performance + DX).
- Security hardening beyond what fixes these bugs (no CORS / rate-limit overhaul) (user did not pick Security hardening).

---

## Proposed execution order

1. **Verify-pass first (no edits).** Re-read the flagged lines for items 1–8 and 11. Several agent claims (esp. CLI line 1189, writeback 163, close-task missing await) were pattern-inferred; I want my eyes on the actual code before any change lands.
2. **Tier 1 edits.** One PR worth of changes; mostly the `safeJoin` helper + its callers, plus the credential umask and the off-by-one.
3. **Tier 2 edits.** Quiet correctness fixes. No behavior change for the happy path.
4. **Tier 3 edits** if you want them; otherwise file them as follow-ups in `wiki/log.md`.

## Total blast radius estimate

- **Files touched (Tiers 1+2):** ~18 — `mcp/server.js`, `cli/kb.js`, ~8 web route files, ~4 lib files, ~4 scripts.
- **Lines changed:** rough order of magnitude 250–400 (most of it is wrapping existing calls in try/catch and the `safeJoin` helper adoption).
- **New files:** one tiny `web/src/lib/safe-path.ts` (or inline helpers, TBD).
- **Runtime behavior change for correct callers:** none intended. Error-path messages become clearer; malformed input no longer crashes.

## What I'd like from you before editing

Approve (or deny/modify) two things:

1. **Scope of this pass:** Tier 1+2 (recommended), or 1+2+3, or Tier 1 only.
2. **Commit style:** one big "prod-readiness pass" commit, or split by tier / by file area.
