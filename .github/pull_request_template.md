<!-- PR title format: <type>(<scope>): <description>  — max 65 chars
     Types: feat | fix | docs | test | refactor | perf | chore | ci | security  -->

## Summary

<!-- 1–3 bullets — what changed, why -->

## Scope

- [ ] Runtime / agent contracts
- [ ] CLI
- [ ] Web app
- [ ] MCP server
- [ ] Wiki content
- [ ] Scripts / infra
- [ ] Docs / ADR only

## Verification

- [ ] `node --test tests/agents/` — all green
- [ ] `node --test tests/agents/fuzz-paths.test.mjs` — fuzzer green
- [ ] `node --test tests/agents/context-snapshots.test.mjs` — no drift (or `UPDATE_SNAPSHOTS=1` accepted intentionally)
- [ ] `node cli/kb.js agent verify-audit` — chain OK
- [ ] `node scripts/audit-context-leaks.mjs` — no NEW cross-tier leaks introduced
- [ ] `kb env check` — no regressions

## Touches Sofie / Vault / Memory

- [ ] No
- [ ] Yes — vault writes go through `closeTask` only; ADR auto-emit verified; Memory.md route still backwards compatible.

## Notes for reviewer

<!-- Anything specific to look at, especially gotchas in the diff -->
