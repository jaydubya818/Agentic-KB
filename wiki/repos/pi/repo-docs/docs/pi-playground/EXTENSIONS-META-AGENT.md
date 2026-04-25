---
repo_name: Pi
repo_visibility: private
source_type: github
branch: main
commit_sha: 1a669c97bc2760e9298c6ff3d892feea5426fc09
source_path: "docs/pi-playground/EXTENSIONS-META-AGENT.md"
imported_at: "2026-04-25T16:05:44.780Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/Pi/main/docs/pi-playground/EXTENSIONS-META-AGENT.md"
---

# Meta-Agent Extension — Pi Pi (playground)

A **primary** Pi session ([`pi-orchestrator.md`](../../.pi/agents/pi-pi/pi-orchestrator.md)) coordinates **domain experts** ([`.pi/agents/pi-pi/*.md`](../../.pi/agents/pi-pi/)) via the `query_experts` tool in [`extensions/pi-pi.ts`](../../extensions/pi-pi.ts). Experts run read-only **sub-`pi` JSON processes** with scoped tools; the primary agent **writes** extensions, YAML, themes, and docs.

## Layout

| Piece | Path |
|-------|------|
| Extension | [`extensions/pi-pi.ts`](../../extensions/pi-pi.ts) |
| Primary prompt template | [`.pi/agents/pi-pi/pi-orchestrator.md`](../../.pi/agents/pi-pi/pi-orchestrator.md) |
| Experts | [`.pi/agents/pi-pi/*.md`](../../.pi/agents/pi-pi/README.md) (except orchestrator) |
| Team roster hint | [`teams.yaml` → `pi-pi`](../../.pi/agents/teams.yaml) |
| Copy-paste examples | [`examples/meta-agent/`](../../examples/meta-agent/) |

## Run

```bash
npm run pi-play:pi-pi
# or
just ext-pi-pi
# raw:
pi -e extensions/pi-pi.ts -e extensions/theme-cycler.ts
```

**Commands:** `/experts`, `/experts-grid N`
**Tool:** `query_experts` with `{ queries: [{ expert, question }, ...] }`

**Dry-run / asset check (no API):** `npm run verify:meta-agent`

## Expert roster

Pi Pi uses **13 domain experts**. The orchestrator queries the relevant experts in parallel, then writes the implementation itself.

- **agent-expert** — agents, frontmatter, tool selection, teams, orchestration patterns
- **cli-expert** — `pi` CLI flags, modes, sessions, models, automation
- **config-expert** — `settings.json`, providers, models, UI settings, packages
- **docs-expert** — README, extension docs, examples, doc conventions
- **ext-expert** — extensions, tools, hooks, commands, runtime behavior
- **keybinding-expert** — shortcuts, remaps, conflicts, terminal compatibility
- **prompt-expert** — prompt templates, arguments, discovery, `/template` workflows
- **safety-expert** — damage-control rules, bash patterns, protected paths
- **skill-expert** — skills, `SKILL.md`, structure, discovery, invocation
- **teams-chains-expert** — `teams.yaml`, `agent-chain.yaml`, delegation, pipelines
- **test-expert** — validation, stack-load checks, verify scripts
- **theme-expert** — theme JSON, token coverage, palettes, hot reload
- **tui-expert** — TUI components, overlays, widgets, rendering, input handling

## Example workflows

See [`examples/meta-agent/`](../../examples/meta-agent/):

1. **01-query-all-experts.md** — one `query_experts` call with every expert.
2. **02-pi-variant-spec.template.md** — filled by the meta-agent into an extension variant spec.
3. **03-scaffold-team-or-extension.md** — instructions to emit `teams.yaml` snippet + `extensions/*.ts` skeleton.

## Limits

- Expert calls spawn **`pi`** with `--no-extensions` and your model; **API keys** required for real research output.
- **verify:meta-agent** only checks files, team list overlap, and `pi --help` load—not LLM quality.
