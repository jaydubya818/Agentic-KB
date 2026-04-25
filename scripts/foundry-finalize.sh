#!/usr/bin/env bash
# foundry-finalize.sh — one-shot: clear stale sandbox lock, stage Foundry
# files only, run tests, commit, push, open PR.
#
# Usage:  bash scripts/foundry-finalize.sh
#
# Idempotent for the staging step. If commit already happened, re-running
# will skip past it via the `git diff --cached --quiet` check.

set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

# 1. Clear the stale index.lock that the cowork sandbox could not remove.
if [[ -f .git/index.lock ]]; then
  echo "→ removing stale .git/index.lock"
  rm -f .git/index.lock
fi

# 2. Confirm we're on the feature branch (created earlier from sandbox).
branch="$(git branch --show-current)"
if [[ "$branch" != "feat/foundry-integration" ]]; then
  echo "→ switching to feat/foundry-integration"
  git checkout feat/foundry-integration 2>/dev/null || git checkout -b feat/foundry-integration
fi

# 3. Stage Foundry files only — skip Obsidian workspace.json noise.
git add \
  CLAUDE.md \
  .gitignore \
  .claude/commands/foundry-ingest.md \
  .claude/commands/foundry-compile.md \
  .claude/commands/foundry-ask.md \
  .claude/commands/foundry-lint.md \
  .claude/commands/foundry-propose.md \
  scripts/compile-2source-gate.mjs \
  scripts/ingest-dedup.mjs \
  scripts/install-personal-vault-guard.sh \
  scripts/lib/compile-gate-core.mjs \
  scripts/lib/foundry-propose-core.mjs \
  scripts/foundry-propose.mjs \
  scripts/foundry-finalize.sh \
  tests/foundry-integration.test.mjs \
  tests/foundry-propose.test.mjs \
  wiki/candidates.md \
  wiki/_meta/compile-log.md \
  outputs/plan-foundry-integration-2026-04-18.md

echo
echo "→ Staged for commit:"
git diff --cached --name-only | sed 's/^/    /'
echo

# 4. Run tests as a final gate.
echo "→ Running tests..."
node --test tests/foundry-integration.test.mjs tests/foundry-propose.test.mjs

# 5. Commit (skip if nothing staged — e.g. re-run after a previous commit).
if git diff --cached --quiet; then
  echo "→ Nothing staged; commit already exists. Skipping commit step."
else
  git commit -m "$(cat <<'EOF'
feat(foundry): install Foundry slash commands + 2-source gate + proposal loop

Adds the Foundry UX layer over the existing kb CLI:
- /foundry-ingest  — sha256-dedup raw/clippings/, route by type
- /foundry-compile — 2-source gate (PROMOTE >=2, DEFER 1, GRADUATE on threshold)
- /foundry-ask     — kb query with >=2-citation enforcement
- /foundry-lint    — kb lint + candidate-health + keyword-drift
- /foundry-propose — surface actionable proposals from KB history
                     (stuck >30d, repeat-graduate flapping, heavy backlog >50)

Implementation:
- scripts/lib/compile-gate-core.mjs       pure helpers (testable, zero side effects)
- scripts/compile-2source-gate.mjs        CLI wrapper, --plan/--execute/--force
- scripts/ingest-dedup.mjs                sha256 dedup + content-aware routing
- scripts/lib/foundry-propose-core.mjs    pure detectors (stuck/repeat/backlog)
- scripts/foundry-propose.mjs             CLI, dedupe-aware, append-only ledger
- scripts/install-personal-vault-guard.sh pre-commit hook enforcing Rule 13
- tests/foundry-integration.test.mjs      28 tests on gate + dedup
- tests/foundry-propose.test.mjs          28 tests on proposal detectors
- wiki/candidates.md, wiki/_meta/         gate + proposals scaffold

CLAUDE.md adds Rule 13 (one-way personal vault) + Rule 14 (2-source rule)
plus a Foundry Slash Commands section.

.gitignore whitelists .claude/commands/ so Foundry commands ship with repo.

Proposal loop borrows the concept (not code) from claude-code-hermit but
keeps Foundry's strict gate philosophy: detect → propose → user accepts
manually. No auto-act, no auto-edit of wiki pages.

All 56 tests pass. Gate smoke-tested against real wiki: 29 promote, 108 defer.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
fi

# 6. Push.
echo
echo "→ Pushing to origin..."
git push -u origin feat/foundry-integration

# 7. Open PR (skip silently if one already exists for this branch).
echo
echo "→ Opening PR..."
if gh pr view feat/foundry-integration >/dev/null 2>&1; then
  echo "→ PR already exists:"
  gh pr view feat/foundry-integration --json url --jq .url
else
  gh pr create --title "Foundry: slash commands + 2-source gate + proposal loop" --body "$(cat <<'EOF'
## Summary
- 5 slash commands (`/foundry-ingest`, `/foundry-compile`, `/foundry-ask`, `/foundry-lint`, `/foundry-propose`) as UX layer over existing `kb` CLI — single source of truth, no parallel vault
- 2-source compile gate prevents single-source themes from becoming wiki pages; deferred themes wait in `wiki/candidates.md` and graduate when a second source arrives
- Hash-based ingest dedup makes `/foundry-ingest` idempotent
- Proposal loop (`/foundry-propose`) surfaces actionable patterns from KB history: stuck candidates, flapping graduates, heavy backlog. Reactive — user accepts manually
- Rule 13 (one-way personal vault) + Rule 14 (2-source rule) added to CLAUDE.md
- Optional pre-commit hook enforces Rule 13 at git layer

## Test plan
- [x] 56/56 unit tests pass: `node --test tests/foundry-integration.test.mjs tests/foundry-propose.test.mjs`
- [x] Gate runs against real wiki (`node scripts/compile-2source-gate.mjs --plan`): 29 promote, 108 defer
- [x] `/foundry-propose` smoke: handles empty compile-log gracefully ("steady state")
- [ ] Smoke-test `/foundry-ingest` with empty `raw/clippings/` (should report empty inbox)
- [ ] Smoke-test `/foundry-compile --execute` once, then `/foundry-propose` to confirm detectors fire
- [ ] Optional: `bash scripts/install-personal-vault-guard.sh` then `git commit --allow-empty -m smoke`

## Notes
- `.claude/commands/` whitelisted in `.gitignore` (skills already were)
- Zero `kb` CLI changes — gate and propose call existing scripts only
- Additive: existing commands continue to work
- Proposal loop borrows the concept (not code) from `claude-code-hermit` but keeps Foundry's strict gate philosophy: no auto-act
EOF
)"
fi

echo
echo "✓ Done."
