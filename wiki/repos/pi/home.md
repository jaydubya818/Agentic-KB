---
title: Pi — Repo Home
type: repo-home
repo_name: pi
tags: [repo, pi]
created: 2026-04-09
updated: 2026-04-09
status: active
---

# Pi

## Purpose

Pi is the low-level system management and infrastructure repository for Raspberry Pi devices. It handles OS configuration, system scripts, dependency management, hardware setup, and deployment automation for Pi-based projects. Serves as the foundation layer for [[agentic-pi-harness/home|Agentic-Pi-Harness]].

## Current Status

- **OS Management**: Raspberry Pi OS (Bookworm) provisioning scripts
- **Dependency Stack**: Python, GPIO libraries, camera drivers, audio stack
- **Hardware Profiles**: Pi 3B+, Pi 4, Pi 5 configurations
- **Automation**: Ansible playbooks for reproducible setup
- **CI/CD**: GitHub Actions for testing on hardware simulators

## Canonical Docs

| Document | Status | Last Updated |
|----------|--------|--------------|
| [[canonical/PRD|Product Requirements]] | draft | 2026-04-09 |
| [[canonical/APP_FLOW|Application Flow]] | draft | 2026-04-09 |
| [[canonical/TECH_STACK|Tech Stack]] | current | 2026-04-09 |
| [[canonical/IMPLEMENTATION_PLAN|Implementation Plan]] | draft | 2026-04-09 |

## Recent Tasks

1. **Ansible playbook for full setup** (2026-04-08): Automates Pi OS provisioning, dependency installation
2. **GPIO library compatibility matrix** (2026-04-07): Documented differences between RPi.GPIO vs gpiozero
3. **Camera driver optimization** (2026-04-06): Improved libcamera performance on Pi 5
4. **Hardware testing** (2026-04-05): Validated Python 3.10+ on all Pi models

## Related Repos

- [[agentic-pi-harness/home|Agentic-Pi-Harness]] — runs on infrastructure managed by Pi repo
- [[mission-control/home|MissionControl]] — coordinates Pi fleet

## Sync Status

| Component | Status | Last Sync |
|-----------|--------|-----------|
| Ansible playbooks | current | 2026-04-09 |
| Hardware profiles | current | 2026-04-09 |
| Documentation | current | 2026-04-09 |

**Next Sync**: 2026-04-16
