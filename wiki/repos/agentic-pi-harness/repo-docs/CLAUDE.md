---
repo_name: "Agentic-Pi-Harness"
repo_visibility: private
source_type: github
branch: main
commit_sha: 6ca54127576e6b9273297bbd8eff4671ca45b187
source_path: CLAUDE.md
imported_at: "2026-06-06T18:59:58.679Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/Agentic-Pi-Harness/main/CLAUDE.md"
---

# Claude Code defaults for this repo

Default concise-response mode in this repo: **Caveman lite**.

Use these defaults unless the user asks for more detail:

- **Normal repo responses:** concise, clear, technically exact, low-fluff
- **Code review comments:** caveman-review style — one-line findings with severity, problem, fix
- **Commit message suggestions:** caveman-commit style — Conventional Commits, terse subject, why over what
- **General engineering work:** compress wording, not substance

Do **not** compress away important details for:
- governed execution behavior
- KB/Wiki policy boundaries
- contract/state/event semantics
- safety constraints
- migration or operational steps
- exact commands, paths, IDs, schemas, or failure modes

If the user explicitly asks for a detailed explanation, fuller reasoning, or formal wording, expand as needed.
