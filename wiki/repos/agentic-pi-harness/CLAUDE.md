---
title: Agentic-Pi-Harness — Agent Instructions
type: repo-claude
repo_name: agentic-pi-harness
tags: [agents, agentic-pi-harness]
created: 2026-04-09
updated: 2026-04-09
---

# Agentic-Pi-Harness — Agent Instructions

Instructions for agents operating on the Agentic-Pi-Harness repository.

## Purpose

Agentic-Pi-Harness is the execution layer for running agentic AI systems on resource-constrained edge hardware (Raspberry Pi 4/5). Agents working here focus on:

1. **Adapting Agentic-KB patterns** for local execution (memory-constrained, lower bandwidth)
2. **Optimizing model performance** (quantization, caching, streaming)
3. **Integrating Pi-native tools** (GPIO, sensors, cameras, local subprocess)
4. **Testing and validating** patterns on real hardware
5. **Maintaining deployment infrastructure** (Docker, Docker Compose, CI/CD)

## Primary Workflows

### PATTERN_ADAPTATION
When asked to bring a new pattern from Agentic-KB to Pi harness:

1. **Read the KB pattern** — understand the cloud-based design assumptions
2. **Identify constraints** — memory, compute, latency, network bandwidth
3. **Adapt the pattern**:
   - Reduce context window sizes (fit in Pi RAM)
   - Implement local caching/queuing
   - Add network resilience (handle disconnection gracefully)
   - Use streaming where possible (avoid loading full responses into memory)
4. **Document adaptations** — capture decisions in `canonical/APP_FLOW.md`
5. **Test on hardware** — validate on Pi 4 (baseline) and Pi 5 (optimal)
6. **Log learnings** — append to progress.md for future agents

### OPTIMIZATION
When performance is insufficient (latency, memory, startup time):

1. **Profile current behavior** — CPU, memory, disk I/O, network
2. **Identify bottleneck** — where is time/space being spent?
3. **Implement optimization**:
   - Quantization (int8, int4) for model weights
   - Caching (sliding window, LRU for context)
   - Streaming (tokens, file chunks)
   - Lazy loading (defer non-critical initialization)
4. **Benchmark improvement** — measure before/after
5. **Trade-off analysis** — document speed vs quality/completeness
6. **Iterate** — repeat if target not met

### TOOL_INTEGRATION
When adding a new Pi-native capability:

1. **Define tool interface** — inputs, outputs, error cases
2. **Implement wrapper** — connect to Pi hardware/OS (GPIO, camera, subprocess)
3. **Test locally** — validate on actual Pi hardware (not just simulation)
4. **Add to agent** — make callable from agentic loop
5. **Document usage** — add example to canonical/APP_FLOW.md
6. **Update progress** — log completion in progress.md

### HARDWARE_VALIDATION
When asked to test on a specific Pi version/configuration:

1. **Set up test environment** — SSH into Pi, verify OS/dependencies
2. **Run baseline benchmarks** — startup time, token latency, memory, disk usage
3. **Compare against targets** — how does it stack up?
4. **Document results** — add to canonical/TECH_STACK.md
5. **Flag issues** — note any hardware-specific problems
6. **Update hardware matrix** — list supported configurations

## Key Integration Points

### Agentic-KB
- Read patterns from [[agentic-kb/home|Agentic-KB]] (e.g., supervisor-worker, streaming)
- Reference recipes for implementation guidance
- Log validated learnings back to KB (feedback loop)

### MissionControl
- Receives deployment instructions from [[mission-control/home|MissionControl]]
- Reports back on agent health, resource usage, tool availability

### Pi Repository
- Coordinate with [[pi/home|Pi]] repo for low-level OS tasks
- Use Pi repo for system updates, dependency management

### LLMwiki
- Use LLMwiki CLI to query Agentic-KB for pattern guidance
- Log decisions in canonical docs for future reference

## File Organization

```
agentic-pi-harness/
├── canonical/              # Repo-specific documentation
│   ├── PRD.md             # Product requirements (edge focus)
│   ├── APP_FLOW.md        # Adapted application flows
│   ├── TECH_STACK.md      # Hardware specs, dependencies
│   └── IMPLEMENTATION_PLAN.md
├── repo-docs/             # GitHub-synced documentation
│   ├── raw-imports/       # Raw imports from GitHub
│   └── README.md, DEPLOYMENT.md, etc.
├── agent-memory/
│   ├── orchestrators/     # Supervisor agent config
│   ├── leads/             # Team lead notes
│   └── workers/           # Worker agent implementations
├── tasks/                 # Active/completed tasks
├── rewrites/              # RFC, spec, test plan drafts
│   ├── prds/, specs/, plans/, test-plans/
├── bus/                   # Business/discovery
│   ├── discovery/         # Architectural exploration
│   ├── escalation/        # Issues, blockers
│   ├── standards/         # Coding standards, conventions
│   └── handoffs/          # Integration checkpoints
└── .gitkeep               # Directory markers
```

## Standards & Conventions

### Code Style
- Python: Black formatter, type hints
- Shell: ShellCheck compliant
- Docker: Follow official best practices
- YAML: Consistent indentation (2 spaces)

### Testing
- Unit tests for all Python modules
- Integration tests on actual Pi hardware (weekly)
- Benchmark tests before/after optimizations
- Test coverage target: 80%

### Documentation
- Every code file has docstring with purpose
- Every optimization logged with before/after metrics
- Every hardware test logged with Pi model, OS version
- Every decision documented in canonical docs

### Hardware Support Matrix
Maintain in `canonical/TECH_STACK.md`:
- Supported Pi models (3B+, 4, 5)
- RAM requirements (min 2GB, recommended 4GB+)
- Tested models (Llama 7B, Mistral 7B, Phi 2.7B)
- Tool support by Pi generation

## Error Handling

**Memory limit exceeded** (OOMKilled):
- Reduce model size (use smaller quantization)
- Reduce context window (max 2K tokens on Pi 4)
- Implement sliding-window cache
- Log incident and metrics in progress.md

**Network disconnect** during agent execution:
- Implement local queue (buffer actions)
- Retry cloud sync when reconnected
- Log disconnection event and recovery time

**Tool not available** (GPIO, camera, etc.):
- Return graceful error message to agent
- Suggest alternative tool if available
- Log hardware capability mismatch

**Model quantization quality degradation**:
- Test on real use case (not just synthetic)
- Compare outputs against unquantized baseline
- Document quality trade-offs in TECH_STACK.md

## Escalation Criteria

**Escalate to Jay West if:**
- Token latency >500ms (indicates bottleneck)
- Memory footprint >1.5GB (constrained environments failing)
- Hardware incompatibility discovered (Pi 3B+ no longer supported)
- Tool integration prevents backward compatibility
- New external dependency needed (adds to setup burden)

## Knowledge Base References

**Essential patterns**:
- [[agentic-kb/patterns/pattern-supervisor-worker|Supervisor-Worker]] — adapt for Pi
- [[agentic-kb/recipes/recipe-streaming-tokens-over-sockets|Streaming Tokens]] — local efficiency
- [[agentic-kb/recipes/recipe-multi-modal-tool-use|Tool Use]] — Pi-native tools

**Hardware-related concepts**:
- Context window management (smaller on Pi)
- Memory-latency trade-offs
- Network resilience patterns

## Success Metrics

1. **Startup time** <5s on Pi 4, <3s on Pi 5
2. **Token latency** <100ms (Llama 7B with int8 quantization)
3. **Memory footprint** <1.0GB baseline
4. **Tool coverage** ≥8 Pi-native capabilities
5. **Test coverage** ≥80% of codebase
6. **Hardware support** Pi 3B+ through Pi 5 stable
7. **Uptime** 99%+ (network resilience working)

## Getting Started (for new agents)

1. Read `canonical/TECH_STACK.md` (understand hardware constraints)
2. Review `canonical/APP_FLOW.md` (see how patterns adapted)
3. Check `progress.md` (see what's in flight, what's blocked)
4. Read `canonical/IMPLEMENTATION_PLAN.md` (understand roadmap)
5. Ask: "What's the bottleneck right now?" (see Recent Tasks in progress.md)
6. Pick one task, implement, test, document
