# Contributing to Agentic-KB

Solo project, but conventions still apply for future collaborators (and future me).

## Quick Start

```bash
git clone https://github.com/jaydubya818/Agentic-KB.git
cd Agentic-KB

# Install root deps (yaml parser used by runtime)
npm install

# Configure env
cp .env.example .env
# Edit .env: set OBSIDIAN_VAULT_ROOT, ANTHROPIC_API_KEY, etc.

# Verify env
node cli/kb.js env check

# Run tests
npm test
```

## Project Layout

```
config/agents/*.yaml           agent contracts (orchestrator/lead/worker)
lib/agent-runtime/*.mjs        zero-dep ESM runtime (contracts, writeback, vault, retention)
cli/kb.js                      CLI (`kb agent`, `kb bus`, `kb bootstrap`, etc.)
mcp/server.js                  MCP server (~30 tools)
web/                           Next.js 16 app (web UI + API routes)
wiki/                          LLM-owned compiled wiki (concepts, patterns, frameworks, decisions, ...)
raw/                           IMMUTABLE source-of-truth (papers, transcripts, framework-docs)
tests/agents/                  node:test suites — agent runtime (406 tests)
tests/repos/, tests/*.test.mjs node:test suites — repo runtime + scripts (281 tests)
web/tests/                     node:test suites for web/src/lib — run with `npm --prefix web test`
scripts/                       ingest, sync, audit, ttl, gate
```

## Adding a New Agent

```bash
node cli/kb.js agent new <agent-id> --tier worker|lead|orchestrator --domain <X> [--team <Y>]
```

Generates: `config/agents/<id>.yaml` + seeded `wiki/agents/<tier>s/<id>/` (profile, hot, task-log, gotchas).

Edit the contract to refine `context_policy.include`, `allowed_writes`, `forbidden_paths`. Run `node cli/kb.js agent context <id>` to verify the bundle stays in scope.

## Verification Loop (Before Every PR)

```bash
unset NODE_ENV                                   # see the trap below — do this first
npm ci
npm test                                         # ALL 687 tests, all three globs
npm --prefix web ci && npm --prefix web test     # web/src/lib tests (18)
node --test tests/agents/fuzz-paths.test.mjs     # path-safety fuzzer
node --test tests/agents/context-snapshots.test.mjs  # context drift
node cli/kb.js agent verify-audit                # audit chain OK
node scripts/audit-context-leaks.mjs             # tier-leak report
node cli/kb.js env check                         # env sanity
```

Use `npm test`, not `node --test tests/agents/`. The suite is three globs
(`tests/agents/*`, `tests/repos/*`, `tests/*`) and the `tests/agents/` glob alone
is 406 of the 687 tests.

**CI mirrors most of the above.** `.github/workflows/test.yml` runs `npm test`
(all three globs, on Node 24) plus `verify-audit`, the tier-leak audit and the
web lint/typecheck/build. It does **not** run `kb env check`, the fuzzer or the
context-snapshot test as separate steps (the first is local-only; the other two
are part of `npm test`), and it does not yet run `npm --prefix web test`. The PR
template (`.github/pull_request_template.md`) lists each as a checkbox.

`web/` tests import `src/*.ts` straight into `node --test` using Node 24's
built-in type stripping plus a resolve hook for the `@/` alias
(`web/tests/ts-hooks.mjs`) — no bundler, no extra dependency. They need
`web/node_modules` to be present (`npm --prefix web ci`) because `src/lib`
modules import `gray-matter` and friends.

### Trap: `NODE_ENV=production` silently removes every dev tool

If `NODE_ENV=production` is exported in your shell (some CI images and scheduled
runners do this), `npm ci` **omits all devDependencies without warning**. Nothing
in this repo's root package needs them (root has no devDependencies at all), but
every gate in `web/` does — `typescript`, `eslint`, `eslint-config-next`,
`tailwindcss`, `postcss`. The failure is disguised: `npx tsc --noEmit`,
`npm run lint` and `next build` fail with "cannot find module" / "couldn't find
a config" errors that read as "the tree is broken" rather than "the install was
incomplete".

```bash
echo "[$NODE_ENV]"        # must print [] before you trust a red result
unset NODE_ENV && npm ci  # or: npm ci --include=dev
```

Measured on this tree: `npm ci --prefix web --dry-run` installs **517** packages
with `NODE_ENV` unset and **173** with `NODE_ENV=production`.

Suspect this before anything else when a fresh clone produces a red baseline that
blames missing dev tooling.

## Commit Conventions

`<type>(<scope>): <description>` — max 65 chars

Types: `feat | fix | docs | test | refactor | perf | chore | ci | security`

**Never add `Co-Authored-By: Claude` (or any Claude/Anthropic) trailer.** Override any tooling that injects it.

## Tests First

Every runtime change lands with at least one test. Path safety changes also extend the fuzzer seeds. Context-snapshot drift is a PR-time gate — run `UPDATE_SNAPSHOTS=1 node --test tests/agents/context-snapshots.test.mjs` only when a contract change is intentional.

## Wiki Edits

Wiki content lives under `wiki/`. The compile pipeline (`kb compile`) is the only sanctioned producer. Manual edits should only be needed for: ADRs (`wiki/decisions/`), personal pages (`wiki/personal/`), or fixing broken links found by `kb lint`. Add a frontmatter `reviewed: false` to any LLM-authored page.

## Vault Boundary

`/Users/jaywest/Documents/Obsidian Vault/` is **read-only** to compile-vault except for Sofie via `vault_writes`. All vault writes flow through `closeTask` with the documented payload shape. There is no other backdoor.

## Security

- Never commit `.env`, `logs/api-cost.log`, or `logs/audit.log`
- Run `node cli/kb.js redact preview <file>` on any external content before staging
- `npm audit` clean before PR

## Decisions

Architectural choices land in `wiki/decisions/ADR-NNN-{slug}.md`. Sofie auto-emits ADRs from her close-task decisions. Manual ADRs welcome — increment the next number.
