---
repo_name: Pi
repo_visibility: private
source_type: github
branch: main
commit_sha: 1a669c97bc2760e9298c6ff3d892feea5426fc09
source_path: trees.md
imported_at: "2026-04-25T16:01:56.264Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/Pi/main/trees.md"
---

# Repository Tree

_Scope: repo-owned files only; `.git/`, `node_modules/`, and `.runtime/` are excluded._

```text
pi-multi-team-local/
├── .claude/
│   └── commands/
│       └── prime.md
├── .github/
│   └── workflows/
│       └── ci.yml
├── .pi/
│   ├── agent-sessions/
│   │   ├── builder.json
│   │   ├── planner.json
│   │   └── reviewer.json
│   ├── agents/
│   │   ├── pi-pi/
│   │   │   ├── agent-expert.md
│   │   │   ├── cli-expert.md
│   │   │   ├── config-expert.md
│   │   │   ├── docs-expert.md
│   │   │   ├── ext-expert.md
│   │   │   ├── keybinding-expert.md
│   │   │   ├── pi-orchestrator.md
│   │   │   ├── prompt-expert.md
│   │   │   ├── README.md
│   │   │   ├── safety-expert.md
│   │   │   ├── skill-expert.md
│   │   │   ├── teams-chains-expert.md
│   │   │   ├── test-expert.md
│   │   │   ├── theme-expert.md
│   │   │   └── tui-expert.md
│   │   ├── agent-chain.yaml
│   │   ├── bowser.md
│   │   ├── builder.md
│   │   ├── documenter.md
│   │   ├── plan-reviewer.md
│   │   ├── planner.md
│   │   ├── red-team.md
│   │   ├── reviewer.md
│   │   ├── scout.md
│   │   ├── teams.yaml
│   │   └── tester.md
│   ├── experts/
│   │   ├── _archive/
│   │   ├── backend_dev.md
│   │   ├── engineering_lead.md
│   │   ├── frontend_dev.md
│   │   ├── orchestrator.md
│   │   ├── planning_lead.md
│   │   ├── product_pragmatist.md
│   │   ├── qa_engineer.md
│   │   ├── security_reviewer.md
│   │   ├── spec_writer.md
│   │   └── validation_lead.md
│   ├── logs/
│   │   └── smoke-test.jsonl
│   ├── prompts/
│   │   ├── lead.md
│   │   ├── orchestrator.md
│   │   └── worker.md
│   ├── skills/
│   │   ├── active-listener/
│   │   │   └── SKILL.md
│   │   ├── artifact-first-reporting/
│   │   │   └── SKILL.md
│   │   ├── backend-implementation-discipline/
│   │   │   └── SKILL.md
│   │   ├── bowser/
│   │   │   └── SKILL.md
│   │   ├── conversational-response/
│   │   │   └── SKILL.md
│   │   ├── delegation-protocol/
│   │   │   └── SKILL.md
│   │   ├── domain-boundary/
│   │   │   └── SKILL.md
│   │   ├── frontend-implementation-discipline/
│   │   │   └── SKILL.md
│   │   ├── implementation-handoff-discipline/
│   │   │   └── SKILL.md
│   │   ├── mental-model/
│   │   │   └── SKILL.md
│   │   ├── planning-handoff-discipline/
│   │   │   └── SKILL.md
│   │   ├── security-review-discipline/
│   │   │   └── SKILL.md
│   │   ├── synthesis-first-reporting/
│   │   │   └── SKILL.md
│   │   ├── test-validation-discipline/
│   │   │   └── SKILL.md
│   │   ├── validation-handoff-discipline/
│   │   │   └── SKILL.md
│   │   └── zero-micromanagement/
│   │       └── SKILL.md
│   ├── themes/
│   │   ├── catppuccin-mocha.json
│   │   ├── cyberpunk.json
│   │   ├── dracula.json
│   │   ├── everforest.json
│   │   ├── gruvbox.json
│   │   ├── midnight-ocean.json
│   │   ├── nord.json
│   │   ├── ocean-breeze.json
│   │   ├── rose-pine.json
│   │   ├── synthwave.json
│   │   └── tokyo-night.json
│   ├── damage-control-rules.yaml
│   └── settings.json
├── apps/
│   ├── api/
│   └── web/
├── config/
│   └── multi-team.yaml
├── docs/
│   ├── pi-playground/
│   │   ├── TIER1-VARIANTS.md
│   │   ├── TIER2-ORCHESTRATION.md
│   │   ├── TIER3-META-AGENT.md
│   │   └── TRANSCRIPT-FEATURE-TEST-MATRIX.md
│   └── pi-vs-claude-code/
│       ├── images/
│       │   └── pi-logo.svg
│       ├── CLAUDE.md
│       ├── COMPARISON.md
│       ├── PI_VS_OPEN_CODE.md
│       ├── README.md
│       ├── RESERVED_KEYS.md
│       ├── THEME.md
│       └── TOOLS.md
├── examples/
│   └── meta-agent/
│       ├── 01-query-all-experts.md
│       ├── 02-pi-variant-spec.template.md
│       └── 03-scaffold-team-or-extension.md
├── extensions/
│   ├── agent-chain.ts — Implements a Pi extension that runs sequential agent pipelines from chain definitions.
│   ├── agent-team.ts — Implements a dispatcher-only Pi extension with team selection, agent dashboards, and a dispatch_agent tool.
│   ├── cross-agent.ts — Implements a Pi extension that imports commands, skills, and agents from other coding-agent ecosystems.
│   ├── damage-control.ts — Implements a rule-driven safety extension that blocks, prompts for, and audits risky tool calls.
│   ├── formatters.ts — Provides shared footer and metric formatting helpers for Pi extensions.
│   ├── minimal.ts — Implements a compact footer extension that shows the model name and context usage.
│   ├── pi-pi.ts — Implements a meta-agent extension that coordinates Pi-building specialists through a single dispatch tool.
│   ├── playground-boot.ts — Implements a startup notifier extension that labels playground sessions and reports the active stack.
│   ├── pure-focus.ts — Implements a UI-cleanup extension that removes footer and status noise for distraction-free sessions.
│   ├── purpose-gate.ts — Implements a session-start gate that forces the operator to declare the agent's purpose.
│   ├── session-replay.ts — Implements an interactive TUI replay view for browsing prior user, assistant, and tool events.
│   ├── subagent-widget.ts — Implements subagent commands and live stacked widgets for background Pi subagents.
│   ├── system-select.ts — Implements a /system picker that switches among discovered system prompts from multiple agent folders.
│   ├── theme-cycler.ts — Implements keyboard shortcuts for cycling through available Pi themes at runtime.
│   ├── themeMap.ts — Maps extensions to default themes and applies those defaults at session start.
│   ├── tilldone.ts — Implements a task-discipline extension that tracks TODOs and forces explicit progress before work.
│   ├── tool-counter-widget.ts — Implements a live widget that displays per-tool usage counts above the editor.
│   └── tool-counter.ts — Implements a richer footer that shows model, context, token, cost, and tool metrics.
├── handoffs/
├── packages/
│   ├── backend/
│   └── ui/
├── plans/
├── scripts/
│   ├── pi-play-verify-if-available.mjs
│   ├── verify-pi-play.mjs
│   ├── verify-tier2.mjs
│   └── verify-tier3.mjs
├── specs/
│   └── pi-vs-claude-code/
│       ├── agent-forge.md
│       ├── agent-workflow.md
│       ├── damage-control.md
│       └── pi-pi.md
├── src/
│   ├── agents/
│   │   ├── approval-queue.test.ts — Tests FIFO approval handling, session-scoped auto-approval, and denial behavior in the approval queue.
│   │   ├── approval-queue.ts — Implements the in-memory approval queue, decision submission flow, and turn-cancellation support for gated actions.
│   │   ├── expertise-writer.ts — Updates writable expertise markdown files with recent lessons, blockers, and archival trimming after each turn.
│   │   ├── mediated-tools.test.ts — Tests shell-intent extraction and blocking rules for the mediated tool wrapper.
│   │   ├── mediated-tools.ts — Wraps agent tools with path-aware policy checks, approval gates, shell intent parsing, and audit callbacks.
│   │   ├── model-resolve.ts — Resolves model aliases and provider/model references into Pi model objects.
│   │   ├── prompt-build.test.ts — Smoke-tests skill bundle loading and deduplication in system prompt assembly.
│   │   ├── prompt-build.ts — Loads prompt, skill, and expertise files and assembles the final system prompt for each agent.
│   │   ├── run-agent.ts — Creates and runs an agent session with mediated tools, prompt assembly, mock mode, and JSON-contract repair handling.
│   │   └── tool-capabilities.ts — Defines the tool capability registry and classifies shell commands for policy enforcement.
│   ├── app/
│   │   └── config-loader.ts — Loads and validates the multi-team YAML config and resolves project-root-relative paths.
│   ├── cli/
│   │   ├── chat-ui.tsx
│   │   ├── demo-exit.test.ts — Verifies that the mock demo CLI command exits cleanly and prints the expected success marker.
│   │   ├── main.tsx
│   │   ├── replay.ts — Loads session timelines and renders replay data into markdown-friendly summaries and exports.
│   │   └── shell-guard.test.ts — Tests the shell-command detector against allowed prompts, blocked commands, and edge cases.
│   ├── control-plane/
│   │   ├── pipeline.ts — Runs the end-to-end multi-team pipeline, including routing, orchestration, delegation, reliability, validation, and artifact writing.
│   │   └── routing.ts — Parses user requests into routing modes, target teams, and default task contracts.
│   ├── git/
│   │   └── session-git.ts — Captures session-scoped git baselines, computes diffs, audits artifacts, and writes session summary files.
│   ├── memory/
│   ├── models/
│   │   ├── config-schema.ts — Defines the Zod schema and inferred types for multi-team application, model, agent, and team configuration.
│   │   ├── delegation.ts — Defines delegation-envelope schemas plus JSON extraction, parsing, and repair instructions for inter-agent handoffs.
│   │   ├── events.ts — Defines normalized session event types, schemas, and an event-construction helper.
│   │   ├── task-contracts.ts — Defines task-contract schemas and generates default contracts and task types from team identities.
│   │   └── validation.ts — Defines the schema and types for structured validation results returned by agents.
│   ├── policy/
│   │   ├── command-policy.test.ts — Tests shell-command policy checks for interpreters, redirection, package installs, and safe commands.
│   │   ├── command-policy.ts — Implements shell-command safety checks for destructive patterns, package managers, nested interpreters, redirection, and secret-like paths.
│   │   ├── path-policy.ts — Provides path normalization and root-membership helpers for read and write allow-list enforcement.
│   │   └── policy-engine.ts — Implements the policy engine that enforces read, write, delete, and bash rules while tracking mutation budgets.
│   ├── sessions/
│   │   └── session-context.ts — Creates per-session directories and appends event, conversation, routing, and timing records.
│   ├── ui/
│   └── utils/
│       ├── ids.ts — Generates unique session IDs and correlation IDs for runs and events.
│       ├── jsonl.ts — Appends structured objects to JSONL files.
│       └── shell-guard.ts — Detects when user input looks like a shell command so the TUI can block accidental agent routing.
├── validation/
├── vendor/
│   ├── library/
│   │   ├── cookbook/
│   │   │   ├── add.md
│   │   │   ├── install.md
│   │   │   ├── list.md
│   │   │   ├── push.md
│   │   │   ├── remove.md
│   │   │   ├── search.md
│   │   │   ├── sync.md
│   │   │   └── use.md
│   │   ├── images/
│   │   │   ├── 03_agentic_stack.svg
│   │   │   ├── 10_meta_skill.svg
│   │   │   ├── 26_problem_skill_sprawl.svg
│   │   │   ├── 27_solution_library_workflow.svg
│   │   │   ├── 32_problem_team_sharing.svg
│   │   │   └── 45_solution_full_workflow.svg
│   │   ├── .gitignore
│   │   ├── justfile
│   │   ├── library.yaml
│   │   ├── LICENSE
│   │   ├── README.md
│   │   └── SKILL.md
│   └── pi-vs-claude-code/
│       ├── .claude/
│       │   └── commands/
│       │       └── prime.md
│       ├── .pi/
│       │   ├── agents/
│       │   │   ├── pi-pi/
│       │   │   │   ├── agent-expert.md
│       │   │   │   ├── cli-expert.md
│       │   │   │   ├── config-expert.md
│       │   │   │   ├── ext-expert.md
│       │   │   │   ├── keybinding-expert.md
│       │   │   │   ├── pi-orchestrator.md
│       │   │   │   ├── prompt-expert.md
│       │   │   │   ├── skill-expert.md
│       │   │   │   ├── theme-expert.md
│       │   │   │   └── tui-expert.md
│       │   │   ├── agent-chain.yaml
│       │   │   ├── bowser.md
│       │   │   ├── builder.md
│       │   │   ├── documenter.md
│       │   │   ├── plan-reviewer.md
│       │   │   ├── planner.md
│       │   │   ├── red-team.md
│       │   │   ├── reviewer.md
│       │   │   ├── scout.md
│       │   │   └── teams.yaml
│       │   ├── skills/
│       │   │   └── bowser.md
│       │   ├── themes/
│       │   │   ├── catppuccin-mocha.json
│       │   │   ├── cyberpunk.json
│       │   │   ├── dracula.json
│       │   │   ├── everforest.json
│       │   │   ├── gruvbox.json
│       │   │   ├── midnight-ocean.json
│       │   │   ├── nord.json
│       │   │   ├── ocean-breeze.json
│       │   │   ├── rose-pine.json
│       │   │   ├── synthwave.json
│       │   │   └── tokyo-night.json
│       │   ├── damage-control-rules.yaml
│       │   └── settings.json
│       ├── extensions/
│       │   ├── agent-chain.ts — Vendored copy of: implements a Pi extension that runs sequential agent pipelines from chain definitions.
│       │   ├── agent-team.ts — Vendored copy of: implements a dispatcher-only Pi extension with team selection, agent dashboards, and a dispatch_agent tool.
│       │   ├── cross-agent.ts — Vendored copy of: implements a Pi extension that imports commands, skills, and agents from other coding-agent ecosystems.
│       │   ├── damage-control.ts — Vendored copy of: implements a rule-driven safety extension that blocks, prompts for, and audits risky tool calls.
│       │   ├── minimal.ts — Vendored copy of: implements a compact footer extension that shows the model name and context usage.
│       │   ├── pi-pi.ts — Vendored copy of: implements a meta-agent extension that coordinates Pi-building specialists through a single dispatch tool.
│       │   ├── pure-focus.ts — Vendored copy of: implements a UI-cleanup extension that removes footer and status noise for distraction-free sessions.
│       │   ├── purpose-gate.ts — Vendored copy of: implements a session-start gate that forces the operator to declare the agent's purpose.
│       │   ├── session-replay.ts — Vendored copy of: implements an interactive TUI replay view for browsing prior user, assistant, and tool events.
│       │   ├── subagent-widget.ts — Vendored copy of: implements subagent commands and live stacked widgets for background Pi subagents.
│       │   ├── system-select.ts — Vendored copy of: implements a /system picker that switches among discovered system prompts from multiple agent folders.
│       │   ├── theme-cycler.ts — Vendored copy of: implements keyboard shortcuts for cycling through available Pi themes at runtime.
│       │   ├── themeMap.ts — Vendored copy of: maps extensions to default themes and applies those defaults at session start.
│       │   ├── tilldone.ts — Vendored copy of: implements a task-discipline extension that tracks TODOs and forces explicit progress before work.
│       │   ├── tool-counter-widget.ts — Vendored copy of: implements a live widget that displays per-tool usage counts above the editor.
│       │   └── tool-counter.ts — Vendored copy of: implements a richer footer that shows model, context, token, cost, and tool metrics.
│       ├── images/
│       │   ├── pi-logo.png
│       │   └── pi-logo.svg
│       ├── specs/
│       │   ├── agent-forge.md
│       │   ├── agent-workflow.md
│       │   ├── damage-control.md
│       │   └── pi-pi.md
│       ├── .env.sample
│       ├── .gitignore
│       ├── bun.lock
│       ├── CLAUDE.md
│       ├── COMPARISON.md
│       ├── justfile
│       ├── package.json
│       ├── PI_VS_OPEN_CODE.md
│       ├── README.md
│       ├── RESERVED_KEYS.md
│       ├── THEME.md
│       └── TOOLS.md
├── .env.example
├── .env.sample.pi-playground
├── .gitignore
├── .npmrc
├── biome.json
├── e2e-test-report.md
├── justfile
├── package-lock.json
├── package.json
├── README.md
├── trees.md
└── tsconfig.json
```

## TypeScript TODOs

- [ ] `extensions/agent-chain.ts` — Implements a Pi extension that runs sequential agent pipelines from chain definitions.
- [ ] `extensions/agent-team.ts` — Implements a dispatcher-only Pi extension with team selection, agent dashboards, and a dispatch_agent tool.
- [ ] `extensions/cross-agent.ts` — Implements a Pi extension that imports commands, skills, and agents from other coding-agent ecosystems.
- [ ] `extensions/damage-control.ts` — Implements a rule-driven safety extension that blocks, prompts for, and audits risky tool calls.
- [ ] `extensions/formatters.ts` — Provides shared footer and metric formatting helpers for Pi extensions.
- [ ] `extensions/minimal.ts` — Implements a compact footer extension that shows the model name and context usage.
- [ ] `extensions/pi-pi.ts` — Implements a meta-agent extension that coordinates Pi-building specialists through a single dispatch tool.
- [ ] `extensions/playground-boot.ts` — Implements a startup notifier extension that labels playground sessions and reports the active stack.
- [ ] `extensions/pure-focus.ts` — Implements a UI-cleanup extension that removes footer and status noise for distraction-free sessions.
- [ ] `extensions/purpose-gate.ts` — Implements a session-start gate that forces the operator to declare the agent's purpose.
- [ ] `extensions/session-replay.ts` — Implements an interactive TUI replay view for browsing prior user, assistant, and tool events.
- [ ] `extensions/subagent-widget.ts` — Implements subagent commands and live stacked widgets for background Pi subagents.
- [ ] `extensions/system-select.ts` — Implements a /system picker that switches among discovered system prompts from multiple agent folders.
- [ ] `extensions/theme-cycler.ts` — Implements keyboard shortcuts for cycling through available Pi themes at runtime.
- [ ] `extensions/themeMap.ts` — Maps extensions to default themes and applies those defaults at session start.
- [ ] `extensions/tilldone.ts` — Implements a task-discipline extension that tracks TODOs and forces explicit progress before work.
- [ ] `extensions/tool-counter-widget.ts` — Implements a live widget that displays per-tool usage counts above the editor.
- [ ] `extensions/tool-counter.ts` — Implements a richer footer that shows model, context, token, cost, and tool metrics.
- [ ] `src/agents/approval-queue.test.ts` — Tests FIFO approval handling, session-scoped auto-approval, and denial behavior in the approval queue.
- [ ] `src/agents/approval-queue.ts` — Implements the in-memory approval queue, decision submission flow, and turn-cancellation support for gated actions.
- [ ] `src/agents/expertise-writer.ts` — Updates writable expertise markdown files with recent lessons, blockers, and archival trimming after each turn.
- [ ] `src/agents/mediated-tools.test.ts` — Tests shell-intent extraction and blocking rules for the mediated tool wrapper.
- [ ] `src/agents/mediated-tools.ts` — Wraps agent tools with path-aware policy checks, approval gates, shell intent parsing, and audit callbacks.
- [ ] `src/agents/model-resolve.ts` — Resolves model aliases and provider/model references into Pi model objects.
- [ ] `src/agents/prompt-build.test.ts` — Smoke-tests skill bundle loading and deduplication in system prompt assembly.
- [ ] `src/agents/prompt-build.ts` — Loads prompt, skill, and expertise files and assembles the final system prompt for each agent.
- [ ] `src/agents/run-agent.ts` — Creates and runs an agent session with mediated tools, prompt assembly, mock mode, and JSON-contract repair handling.
- [ ] `src/agents/tool-capabilities.ts` — Defines the tool capability registry and classifies shell commands for policy enforcement.
- [ ] `src/app/config-loader.ts` — Loads and validates the multi-team YAML config and resolves project-root-relative paths.
- [ ] `src/cli/demo-exit.test.ts` — Verifies that the mock demo CLI command exits cleanly and prints the expected success marker.
- [ ] `src/cli/replay.ts` — Loads session timelines and renders replay data into markdown-friendly summaries and exports.
- [ ] `src/cli/shell-guard.test.ts` — Tests the shell-command detector against allowed prompts, blocked commands, and edge cases.
- [ ] `src/control-plane/pipeline.ts` — Runs the end-to-end multi-team pipeline, including routing, orchestration, delegation, reliability, validation, and artifact writing.
- [ ] `src/control-plane/routing.ts` — Parses user requests into routing modes, target teams, and default task contracts.
- [ ] `src/git/session-git.ts` — Captures session-scoped git baselines, computes diffs, audits artifacts, and writes session summary files.
- [ ] `src/models/config-schema.ts` — Defines the Zod schema and inferred types for multi-team application, model, agent, and team configuration.
- [ ] `src/models/delegation.ts` — Defines delegation-envelope schemas plus JSON extraction, parsing, and repair instructions for inter-agent handoffs.
- [ ] `src/models/events.ts` — Defines normalized session event types, schemas, and an event-construction helper.
- [ ] `src/models/task-contracts.ts` — Defines task-contract schemas and generates default contracts and task types from team identities.
- [ ] `src/models/validation.ts` — Defines the schema and types for structured validation results returned by agents.
- [ ] `src/policy/command-policy.test.ts` — Tests shell-command policy checks for interpreters, redirection, package installs, and safe commands.
- [ ] `src/policy/command-policy.ts` — Implements shell-command safety checks for destructive patterns, package managers, nested interpreters, redirection, and secret-like paths.
- [ ] `src/policy/path-policy.ts` — Provides path normalization and root-membership helpers for read and write allow-list enforcement.
- [ ] `src/policy/policy-engine.ts` — Implements the policy engine that enforces read, write, delete, and bash rules while tracking mutation budgets.
- [ ] `src/sessions/session-context.ts` — Creates per-session directories and appends event, conversation, routing, and timing records.
- [ ] `src/utils/ids.ts` — Generates unique session IDs and correlation IDs for runs and events.
- [ ] `src/utils/jsonl.ts` — Appends structured objects to JSONL files.
- [ ] `src/utils/shell-guard.ts` — Detects when user input looks like a shell command so the TUI can block accidental agent routing.
- [ ] `vendor/pi-vs-claude-code/extensions/agent-chain.ts` — Vendored copy of: implements a Pi extension that runs sequential agent pipelines from chain definitions.
- [ ] `vendor/pi-vs-claude-code/extensions/agent-team.ts` — Vendored copy of: implements a dispatcher-only Pi extension with team selection, agent dashboards, and a dispatch_agent tool.
- [ ] `vendor/pi-vs-claude-code/extensions/cross-agent.ts` — Vendored copy of: implements a Pi extension that imports commands, skills, and agents from other coding-agent ecosystems.
- [ ] `vendor/pi-vs-claude-code/extensions/damage-control.ts` — Vendored copy of: implements a rule-driven safety extension that blocks, prompts for, and audits risky tool calls.
- [ ] `vendor/pi-vs-claude-code/extensions/minimal.ts` — Vendored copy of: implements a compact footer extension that shows the model name and context usage.
- [ ] `vendor/pi-vs-claude-code/extensions/pi-pi.ts` — Vendored copy of: implements a meta-agent extension that coordinates Pi-building specialists through a single dispatch tool.
- [ ] `vendor/pi-vs-claude-code/extensions/pure-focus.ts` — Vendored copy of: implements a UI-cleanup extension that removes footer and status noise for distraction-free sessions.
- [ ] `vendor/pi-vs-claude-code/extensions/purpose-gate.ts` — Vendored copy of: implements a session-start gate that forces the operator to declare the agent's purpose.
- [ ] `vendor/pi-vs-claude-code/extensions/session-replay.ts` — Vendored copy of: implements an interactive TUI replay view for browsing prior user, assistant, and tool events.
- [ ] `vendor/pi-vs-claude-code/extensions/subagent-widget.ts` — Vendored copy of: implements subagent commands and live stacked widgets for background Pi subagents.
- [ ] `vendor/pi-vs-claude-code/extensions/system-select.ts` — Vendored copy of: implements a /system picker that switches among discovered system prompts from multiple agent folders.
- [ ] `vendor/pi-vs-claude-code/extensions/theme-cycler.ts` — Vendored copy of: implements keyboard shortcuts for cycling through available Pi themes at runtime.
- [ ] `vendor/pi-vs-claude-code/extensions/themeMap.ts` — Vendored copy of: maps extensions to default themes and applies those defaults at session start.
- [ ] `vendor/pi-vs-claude-code/extensions/tilldone.ts` — Vendored copy of: implements a task-discipline extension that tracks TODOs and forces explicit progress before work.
- [ ] `vendor/pi-vs-claude-code/extensions/tool-counter-widget.ts` — Vendored copy of: implements a live widget that displays per-tool usage counts above the editor.
- [ ] `vendor/pi-vs-claude-code/extensions/tool-counter.ts` — Vendored copy of: implements a richer footer that shows model, context, token, cost, and tool metrics.
