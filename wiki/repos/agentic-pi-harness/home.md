---
title: Agentic-Pi-Harness — Repo Home
type: repo-home
repo_name: agentic-pi-harness
tags: [repo, agentic-pi-harness]
created: 2026-04-09
updated: 2026-04-09
status: active
---

# Agentic-Pi-Harness

## Purpose

Agentic-Pi-Harness is a Claude Code harness optimized for running agentic AI systems on Raspberry Pi edge hardware. It adapts patterns from [[agentic-kb/home|Agentic-KB]] for resource-constrained environments, implements streaming and token management for local inference, and provides deployment infrastructure for distributed agent networks.

The harness serves as the execution layer for agents that need to run on-device (privacy-sensitive, latency-critical, or offline scenarios), while delegating complex decision-making to cloud-based models when needed.

## Current Status

- **Architecture**: Supervisor-worker pattern implemented for local execution
- **Hardware**: Tested on Raspberry Pi 4 (4GB RAM) and Pi 5 (8GB RAM)
- **Integration**: Bidirectional sync with Agentic-KB patterns; CLI from LLMwiki
- **Deployment**: Docker containers for reproducible environments
- **Current workload**: Document analysis, local tool execution, streaming responses

## Canonical Docs

| Document | Status | Last Updated |
|----------|--------|--------------|
| [[canonical/PRD|Product Requirements]] | draft | 2026-04-09 |
| [[canonical/APP_FLOW|Application Flow]] | draft | 2026-04-09 |
| [[canonical/TECH_STACK|Tech Stack]] | current | 2026-04-09 |
| [[canonical/IMPLEMENTATION_PLAN|Implementation Plan]] | draft | 2026-04-09 |

## Imported Docs

### Repo Documentation
- **README.md**: Setup, quick-start, common issues
- **DEPLOYMENT.md**: Pi-specific deployment guide
- **CONFIG.md**: Environment variables, model selection, resource limits
- **EXAMPLES.md**: Sample agents and workflows

### Canonical Patterns
- [[agentic-kb/concepts/agent-loop|Agent Loop]] (adapted for Pi)
- [[agentic-kb/patterns/pattern-supervisor-worker|Supervisor-Worker]] (edge-optimized)
- [[agentic-kb/recipes/recipe-streaming-tokens-over-sockets|Streaming Tokens]] (core feature)
- [[agentic-kb/recipes/recipe-multi-modal-tool-use|Tool Use]] (Pi-native tools)

## Recent Tasks

1. **Local inference benchmarking** (2026-04-08): Tested Llama 2 7B, Mistral 7B performance on Pi 5
2. **Streaming implementation** (2026-04-07): Added socket-based token streaming for real-time responses
3. **Tool integration** (2026-04-06): GPIO, file I/O, local subprocess tools working
4. **Docker optimization** (2026-04-05): Multi-stage builds, layer caching for faster deployments

## Recent Discoveries

- **Memory-constrained token handling**: Discovered trade-off between context window size and token latency. Implemented sliding-window cache for longer conversations on 4GB Pi.
- **Network resilience**: Added auto-reconnect logic for cloud-based supervisor when on unreliable networks (mobile hotspot).
- **Model quantization impact**: Llama 2 7B at int8 quantization shows 2x speed with acceptable quality loss on Pi 4.

## Related Repos

- [[agentic-kb/home|Agentic-KB]] — source of orchestration patterns deployed here
- [[mission-control/home|MissionControl]] — supervisory agents that coordinate edge clusters
- [[pi/home|Pi]] — low-level system management for hardware

## Sync Status

| Component | Status | Last Sync |
|-----------|--------|-----------|
| GitHub repo | synced | 2026-04-09 |
| Agentic-KB patterns | current | 2026-04-09 |
| Docker images | built | 2026-04-08 |
| Hardware specs | current | 2026-04-09 |

**Next Sync**: 2026-04-16 (weekly)

## Key Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Startup time | 8–12s | <5s |
| Token latency (Llama 7B) | 150–250ms | <100ms |
| Memory usage (baseline) | 1.2GB | <1.0GB |
| Supported models | 3 (Llama, Mistral, Phi) | 5+ |
| Test coverage | 45% | 80% |

## Deployment Status

- **Development**: Active on Pi 4 + Pi 5
- **Staging**: Docker container tested in cloud (for CI/CD validation)
- **Production**: Ready for privacy-sensitive workloads, edge deployments
- **Known issues**: Memory spikes during multi-document processing (being addressed)
