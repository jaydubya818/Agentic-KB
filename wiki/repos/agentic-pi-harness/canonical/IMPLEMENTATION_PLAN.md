---
title: Implementation Plan — Agentic-Pi-Harness
type: canonical
repo_name: agentic-pi-harness
doc_type: implementation_plan
tags: [canonical, agentic-pi-harness]
status: active
created: 2026-04-09
updated: 2026-04-09
---

# Agentic-Pi-Harness — Implementation Plan

## Phase Overview

| Phase | Duration | Status | Goal |
|-------|----------|--------|------|
| Phase 1: Core Patterns | Complete | ✅ Done | [[pattern-supervisor-worker]], tool integration working |
| Phase 2: Optimization | In Progress | 🟡 70% | Memory, latency targets hit |
| Phase 3: Resilience | In Progress | 🟡 60% | Network recovery, offline queueing |
| Phase 4: Hardware Validation | In Progress | 🟡 50% | Pi 3B+ through Pi 5 tested |
| Phase 5: Production | Pending | ⏳ Q3 | Hardening, monitoring, fleet management |

---

## Phase 1: Core Patterns (COMPLETE)

### Milestone 1.1: [[pattern-supervisor-worker]] Architecture
**Status**: ✅ Complete (2026-04-03)

- [x] Adapt [[pattern-supervisor-worker]] pattern for Pi edge
- [x] Implement task assignment (supervisor → Pi workers)
- [x] Implement result collection (Pi → supervisor)
- [x] Test multi-worker (2–4 concurrent workers per Pi)

### Milestone 1.2: Tool Integration
**Status**: ✅ Complete (2026-04-06)

- [x] GPIO control (digital I/O, PWM)
- [x] File operations (read, write, directory listing)
- [x] Local subprocess execution
- [x] Integrate with agent tool registry

### Milestone 1.3: Model Inference
**Status**: ✅ Complete (2026-04-07)

- [x] Set up ollama on Pi 4 + Pi 5
- [x] Load Llama 7B (int8) successfully
- [x] Verify token generation on hardware
- [x] Benchmark token latency (current: 100–150ms)

---

## Phase 2: Optimization (IN PROGRESS — 70%)

### Milestone 2.1: Memory Optimization
**Status**: 🟡 In Progress

- [x] Profile memory usage (current: 1.2GB baseline)
- [x] Identify bottlenecks (model weights, Python runtime)
- [ ] Implement sliding-window context cache
- [ ] Reduce baseline to <1.0GB target

**Progress**: 2/4 complete. Baseline profiling done; sliding window in development.

**Estimated completion**: 2026-04-22

### Milestone 2.2: Token Latency
**Status**: 🟡 In Progress

- [x] Implement streaming (avoid loading full responses)
- [x] Benchmark Llama 7B (current: 100–150ms per token)
- [ ] Test int8 vs int4 quantization trade-offs
- [ ] Hit target: <100ms per token

**Progress**: 2/4 complete. Streaming working; quantization testing pending.

**Estimated completion**: 2026-04-25

### Milestone 2.3: Startup Time
**Status**: 🟡 In Progress

- [x] Current: 8–12s on Pi 4, 4–6s on Pi 5
- [ ] Analyze startup bottlenecks (model loading vs OS)
- [ ] Implement lazy-load or pre-loading strategy
- [ ] Target: <5s on Pi 4, <3s on Pi 5

**Progress**: 1/4 complete. Baseline measured; optimization pending.

**Estimated completion**: 2026-04-28

---

## Phase 3: Resilience (IN PROGRESS — 60%)

### Milestone 3.1: Network Recovery
**Status**: 🟡 In Progress

- [x] Detect disconnection (supervisor ping fails)
- [x] Auto-reconnect (periodic ping with backoff)
- [ ] Graceful degradation (work offline with reduced features)
- [ ] Sync backlog on reconnect

**Progress**: 2/4 complete. Detection + reconnect working; offline mode pending.

**Estimated completion**: 2026-04-20

### Milestone 3.2: Local Action Queueing
**Status**: 🟡 In Progress

- [ ] SQLite database for queuing
- [ ] Queue task assignments when disconnected
- [ ] Drain queue when reconnected
- [ ] Handle queue conflicts (old task still relevant?)

**Progress**: 0/4 started. Database schema designed; implementation pending.

**Estimated completion**: 2026-04-24

---

## Phase 4: Hardware Validation (IN PROGRESS — 50%)

### Milestone 4.1: Pi 3B+ Support (Legacy)
**Status**: 🟡 In Progress

- [x] Verify Pi OS compatibility
- [ ] Benchmark on Pi 3B+ (1GB RAM)
- [ ] Document limitations (Phi 2.7B only, no large models)
- [ ] Create Pi 3B+ specific docs

**Progress**: 1/4 complete. OS compatibility verified; benchmarking pending.

**Estimated completion**: 2026-04-20

### Milestone 4.2: Pi 4 Baseline
**Status**: ✅ Complete (2026-04-08)

- [x] Full testing on Pi 4 (4GB)
- [x] Benchmark all metrics (latency, memory, startup)
- [x] Document performance profile
- [x] Create hardware matrix

### Milestone 4.3: Pi 5 Optimization
**Status**: 🟡 In Progress

- [x] Testing on Pi 5 (8GB)
- [x] Benchmark improvements vs Pi 4
- [ ] Identify Pi 5 specific optimizations (higher clock speed)
- [ ] Document as "recommended" platform

**Progress**: 2/4 complete. Testing done; optimization pending.

**Estimated completion**: 2026-04-23

---

## Phase 5: Production (PENDING — Q3 2026)

### Milestone 5.1: Hardening
**Target start**: 2026-05-01

- [ ] Error recovery (graceful failures, logging)
- [ ] Resource limits (prevent OOMKill, CPU throttling)
- [ ] Monitoring hooks (health checks, alerts)
- [ ] Graceful shutdown (clean model unload, queue persistence)

**Estimated completion**: 2026-05-31

### Milestone 5.2: Observability
**Target start**: 2026-06-01

- [ ] Metrics export (CPU, memory, latency)
- [ ] Dashboard for Pi health
- [ ] Centralized logging (ship logs to supervisor)
- [ ] Performance trending

**Estimated completion**: 2026-06-30

### Milestone 5.3: Fleet Management
**Target start**: 2026-07-01

- [ ] Multi-Pi orchestration via MissionControl
- [ ] Task balancing (round-robin by load)
- [ ] Failure recovery (reassign if Pi becomes unresponsive)
- [ ] Dynamic model assignment (match Pi RAM to model size)

**Estimated completion**: 2026-08-31

---

## Development Dependencies

### Required Now
- Python 3.10+
- Git
- Docker + Docker Compose
- Raspberry Pi 4 or 5 for testing

### Required for Phase 5
- Prometheus + Grafana (metrics)
- ELK stack (logging, optional)
- Kubernetes (fleet orchestration, optional)

---

## Success Criteria (by Phase)

### Phase 1 ✅
- [x] Task assignment works supervisor → Pi
- [x] Tool invocation (GPIO, files, subprocess) functional
- [x] Model inference on real hardware validated
- [x] Multi-worker support tested

### Phase 2 (target 2026-04-28)
- [ ] Memory baseline <1.0GB (currently 1.2GB)
- [ ] Token latency <100ms (currently 100–150ms)
- [ ] Startup <5s on Pi 4 (currently 8–12s)
- [ ] Quantization matrix documented

### Phase 3 (target 2026-04-24)
- [ ] Disconnection detected and logged
- [ ] Auto-reconnect working with backoff
- [ ] Local queue persists across reboot
- [ ] Backlog synced on reconnect

### Phase 4 (target 2026-04-28)
- [ ] Pi 3B+ support documented (legacy)
- [ ] Pi 4 baseline all metrics achieved
- [ ] Pi 5 optimizations identified
- [ ] Hardware matrix complete (3 models tested)

### Phase 5 (target 2026-08-31)
- [ ] All errors caught and logged
- [ ] Zero memory leaks (monitored 24h)
- [ ] Metrics collected and dashboarded
- [ ] Fleet orchestration (10+ Pi devices)

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Memory overflow (OOMKill) | High | Critical | Implement sliding-window cache; test on Pi 4 |
| Network flaky | High | Medium | Local queueing + sync strategy |
| Model too slow (>200ms/token) | Medium | Medium | Fallback to smaller model; offer Pi 5 |
| Pi 3B+ too weak | Medium | Low | Mark legacy; document Phi 2.7B only |
| Hardware differences | Low | Medium | Test on Pi 3B+, 4, 5; document matrix |

---

## Rollback Plan

1. **Phase 2 blocked** (Memory not improvable):
   - Fallback: Accept 1.2GB baseline
   - Workaround: Recommend Pi 5 (larger RAM)

2. **Phase 3 blocked** (Network queueing too complex):
   - Fallback: Require cloud supervisor (no offline mode)
   - Simplified: Cache last 5 tasks locally; drain on reconnect

3. **Phase 4 blocked** (Pi 3B+ incompatible):
   - Decision: Drop Pi 3B+ support; target Pi 4+ only
   - Document: "Minimum: Pi 4 with 4GB RAM"

4. **Phase 5 blocked** (Hardening takes longer):
   - Fallback: Alpha/beta deployment only
   - Deferral: Production push to Q4 2026

---

## Timeline Summary

```
Apr 2026:
  ✅ Phase 1 (Complete)
  🟡 Phase 2 (In progress, target 2026-04-28)
  🟡 Phase 3 (In progress, target 2026-04-24)
  🟡 Phase 4 (In progress, target 2026-04-28)

May 2026:
  🟡 Phase 5 Milestone 5.1 (Hardening, target 2026-05-31)

Jun–Aug 2026:
  🟡 Phase 5 Milestone 5.2 + 5.3 (Observability + Fleet, target 2026-08-31)
```

**Current focus**: Complete Phase 2 optimization (memory, latency) and Phase 3 resilience
**Next checkpoint**: 2026-04-28 (all Phase 2–4 milestones complete)
