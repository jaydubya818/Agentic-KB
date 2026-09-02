# Agentic Engineering Knowledge Base

## Persistent knowledge and context infrastructure for agent systems

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![test](https://github.com/jaydubya818/Agentic-KB/actions/workflows/test.yml/badge.svg)](https://github.com/jaydubya818/Agentic-KB/actions/workflows/test.yml)
[![Node](https://img.shields.io/badge/node-24.x-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Interfaces](https://img.shields.io/badge/interfaces-web%20%7C%20CLI%20%7C%20MCP-informational.svg)](#quickstart)
[![Articles](https://img.shields.io/badge/compiled%20articles-1000%2B-blueviolet.svg)](#what-it-includes)

Agentic-KB is a persistent, cross-referenced engineering knowledge system for **agentic AI, autonomous software delivery, agent memory, evaluations, orchestration, and AI engineering patterns**.

It contains 1,000+ compiled articles and exposes the knowledge through a Wikipedia-style web UI, CLI, graph/search interfaces, and an MCP server.

The core idea is simple:

> Useful agent memory should be durable, inspectable, attributable, and continuously maintained—not trapped in one chat window or rebuilt from raw context on every run.

## Quickstart

Requires Node 24.x.

```bash
git clone https://github.com/jaydubya818/Agentic-KB.git
cd Agentic-KB
npm install
```

**Browse the knowledge base in a browser**

```bash
cd web && npm install && npm run dev
```

Open <http://localhost:3002> for Wikipedia-style search, article rendering,
backlinks, and graph navigation.

**Query it from the terminal**

```bash
node cli/kb.js search "multi-agent orchestration"
node cli/kb.js query "What is the best pattern for a supervisor-worker system?"
node cli/kb.js read concepts/tool-use
node cli/kb.js list concepts
```

The CLI and web server both use `http://localhost:3002` by default. Set
`KB_API_URL` only when the API is running at a different address.

### CLI command reference

This command list mirrors `node cli/kb.js help` and is checked for drift by the
test suite.

| Command | Purpose |
| --- | --- |
| `kb help` | Show the complete command reference. |
| `kb search <query> [--scope public/private/all] [--limit N]` | Search compiled knowledge. |
| `kb query <question> [--scope public/private/all] [--pin <pin>]` | Ask a synthesized question through the API. |
| `kb read <slug>` | Read one compiled page. |
| `kb list <section> [--table]` | List pages in a wiki section. |
| `kb pending` | Show pending raw sources. |
| `kb compile [--mode full/incremental]` | Compile pending knowledge. |
| `kb lint` | Run the API-backed knowledge lint. |
| `kb reindex` | Rebuild `wiki/index.md`. |
| `kb ingest-file <path> [--dir <raw-subdir>]` | Convert and stage a local file. |
| `kb ingest-youtube <url>` | Ingest a YouTube transcript. |
| `kb ingest-twitter <archive.zip>` | Ingest a Twitter/X archive. |
| `kb session bootstrap <role>` | Print a Hermes, Pi, or universal bootstrap. |
| `kb session acceptance <role>` | Print the Hermes or Pi acceptance contract. |
| `kb promote <channel> <item-id> [--target <path>] [--approver <name>]` | Promote a bus learning. |
| `kb env` | Validate the local environment. |
| `kb bootstrap [role]` | List or print a personal agent bootstrap. |
| `kb redact preview <file>` | Preview redaction rules against a file. |
| `kb cost` | Show API cost totals. |
| `kb health` | Run the local health checks. |

| Repository and bus command | Purpose |
| --- | --- |
| `kb repo list` | List tracked repositories. |
| `kb repo show <name>` | Show repository metadata. |
| `kb repo sync <name> [--token <pat>]` | Sync one repository. |
| `kb repo sync-all [--token <pat>]` | Sync all active repositories. |
| `kb repo search <name> <query>` | Search imported repository docs. |
| `kb repo status <name>` | Show repository sync status. |
| `kb repo docs <name> [--section <section>]` | List imported repository docs. |
| `kb repo progress <name>` | Show repository progress. |
| `kb repo close-task <name> <agent> --payload <file.json> [--dry-run]` | Close or preview a repository task. |
| `kb bus list <name> <channel>` | List repository bus items. |
| `kb bus publish <name> <channel> --from <id> --body <text>` | Publish a repository bus item. |
| `kb bus transition <name> <channel> <id> <status> [--actor <id>]` | Transition a bus item. |
| `kb rewrite list <name>` | List repository rewrite artifacts. |
| `kb canonical list <name>` | List canonical repository docs. |
| `kb canonical show <name> <doc>` | Read a canonical repository doc. |

| Agent-runtime command | Purpose |
| --- | --- |
| `kb agent list` | List agent contracts. |
| `kb agent show <agent-id>` | Show one agent contract. |
| `kb agent context <agent-id> [--project <project>]` | Assemble bounded agent context. |
| `kb agent start-task <agent-id> [--project <project>] [--description <text>] [--task-id <id>]` | Start an agent task. |
| `kb agent active-task <agent-id>` | Show the active task. |
| `kb agent status <agent-id> [--last <n>]` | Show recent runtime status. |
| `kb agent append-state <agent-id> <task-id> <entry>` | Append durable task state. |
| `kb agent verify-state <agent-id>` | Verify task-state integrity. |
| `kb agent repair-state <agent-id>` | Repair recoverable task-state drift. |
| `kb agent abandon-task <agent-id> <task-id> [--reason <reason>]` | Abandon an active task. |
| `kb agent close-task <agent-id> --payload <file.json> [--dry-run]` | Close or preview an agent task. |
| `kb agent trace <agent-id> [--last <n>]` | Show recent runtime traces. |
| `kb agent dry-run-close-task <agent-id> --payload <file.json>` | Preview close-task writes. |
| `kb agent new <agent-id> --tier <tier> [--domain <domain>] [--team <team>] [--force]` | Scaffold an agent contract. |
| `kb agent verify-audit` | Verify the audit-log hash chain. |

Network commands use `KB_API_URL` (default `http://localhost:3002`) and
`KB_API_TIMEOUT_MS`. Private scopes require `PRIVATE_PIN`. Repository sync uses
`GITHUB_PAT` unless `--token` is supplied. Query and compile operations require
`ANTHROPIC_API_KEY`.

**Expose it to an agent runtime over MCP**

```bash
node mcp/server.js
```

Point any MCP client at that process to get bounded, policy-checked knowledge
tools instead of raw filesystem access. See [mcp/README.md](mcp/README.md).

**Run the tests**

```bash
npm test
```

## Beyond RAG

Agentic-KB does not treat the knowledge base as a pile of documents behind semantic search.

Raw sources move through an explicit compilation and maintenance process into a persistent wiki:

```text
Raw sources
    ↓
Ingestion / normalization
    ↓
Compilation
    ↓
Cross-referenced knowledge
    ↓
Lint / graph / contradiction checks
    ↓
Queryable wiki + CLI + MCP
    ↓
Agent and human workflows
```

The compile step is deliberate, incremental, logged, and auditable. Retrieval remains useful, but the durable asset is maintained knowledge rather than transient context assembly.

## What it includes

- 1,000+ agentic-engineering articles
- concepts, patterns, frameworks, entities, recipes, and evaluations
- persistent operational memory
- cross-referenced wiki links and backlinks
- graph-oriented navigation and maintenance
- CLI query and maintenance workflows
- MCP access for agent runtimes
- source citations and contradiction markers
- incremental compilation state
- ingestion ledgers and durable receipts
- private/public knowledge boundaries
- linting, stale-content detection, and graph-maintenance checks
- agent-driven capture and maintenance workflows

## Why this matters for AI-native engineering

As agent systems become more autonomous, context engineering becomes infrastructure.

A durable knowledge layer can help agents and operators answer:

- What do we already know about this system?
- Which source supports this claim?
- Is the knowledge current or stale?
- Does another source contradict it?
- Which concepts and systems are related?
- What was learned from previous execution?
- Which knowledge is safe to expose to a given agent?
- What should become durable memory versus temporary context?

The objective is not unlimited memory. It is **useful, governed, high-signal context**.

## Interfaces

### Web

Wikipedia-style browsing, search, article rendering, backlinks, graph-oriented navigation, and maintenance workflows.

### CLI

Command-line access for ingestion, compilation, querying, verification, and maintenance.

### MCP

Agent-facing tools expose bounded knowledge operations so external agent runtimes can query the KB without treating the filesystem as an unrestricted authority surface.

## Knowledge lifecycle

Agentic-KB distinguishes raw input from compiled knowledge and private/canonical state.

Important design principles include:

1. Raw content is untrusted input.
2. Compilation is an explicit state transition.
3. Sources and citations should survive synthesis.
4. Contradictions should be visible rather than silently resolved.
5. Writes should be atomic and recoverable.
6. Private knowledge must not leak through reports, indexes, or git.
7. Agent access should be policy-bounded.
8. Maintenance should be continuously testable.

## Reliability and security work

The repository includes extensive correctness and maintenance coverage around areas such as:

- atomic writes
- SSE/event-stream failure handling
- graph and backlink correctness
- private-layer exclusions
- PIN-gated operations
- webhook authentication
- MCP error propagation
- citation preservation
- contradiction signaling
- ingestion idempotency
- file-descriptor safety
- supply-chain pinning and install-script restrictions

The latest maintenance cycle reports **503 passing tests**.

## Relationship to autonomous software delivery

Agentic-KB is the **knowledge/context layer** in a broader autonomous-engineering architecture.

[Mission Control](https://github.com/jaydubya818/MissionControl) governs intent, WorkOrders, execution, verification, evidence, and delivery decisions.

[Agentic Pi Harness](https://github.com/jaydubya818/Agentic-Pi-Harness) explores governed worker execution and knowledge-access boundaries.

Agentic-KB provides durable knowledge those systems can query without turning transient model context into the system of record.

```text
Mission / WorkOrder
       ↓
Agent runtime / harness
       ↓
bounded context request
       ↓
    Agentic-KB
       ↓
source-backed knowledge
       ↓
execution + evidence
```

## Technical themes

- context engineering
- agent memory
- knowledge graphs
- MCP
- retrieval and synthesis
- provenance and citations
- contradiction detection
- incremental compilation
- durable state
- privacy boundaries
- operational memory
- agent-access policy
- knowledge maintenance automation

## Status

Active and continuously maintained. The project combines a large compiled knowledge corpus with working web, CLI, MCP, graph, ingestion, linting, and maintenance paths. Current development emphasizes correctness, privacy boundaries, durable operations, and making the knowledge layer safer and more useful for autonomous agent systems.

## License

MIT — see [LICENSE](LICENSE).
