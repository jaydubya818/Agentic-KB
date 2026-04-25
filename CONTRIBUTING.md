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
tests/agents/                  node:test suites (98+ tests)
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
node --test tests/agents/                        # all green
node --test tests/agents/fuzz-paths.test.mjs     # path-safety fuzzer
node --test tests/agents/context-snapshots.test.mjs  # context drift
node cli/kb.js agent verify-audit                # audit chain OK
node scripts/audit-context-leaks.mjs             # tier-leak report
node cli/kb.js env check                         # env sanity
```

CI mirrors all of the above. PR template (`.github/pull_request_template.md`) lists each as a checkbox.

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
