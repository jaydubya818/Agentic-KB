---
repo_name: "Agentic-Pi-Harness"
repo_visibility: private
source_type: github
branch: main
commit_sha: 5deb5faadc138a6bbd7455f7177b53a18960bb78
source_path: CLAUDE.md
imported_at: "2026-04-25T16:05:39.322Z"
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
