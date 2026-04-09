---
title: Pi — Agent Instructions
type: repo-claude
repo_name: pi
tags: [agents, pi]
created: 2026-04-09
updated: 2026-04-09
---

# Pi — Agent Instructions

Instructions for agents operating on the Pi system management repository.

## Purpose

Pi repo manages low-level Raspberry Pi infrastructure: OS configuration, dependency management, hardware setup, and deployment automation. Agents here focus on:

1. Provisioning reproducible Pi environments (Ansible playbooks)
2. Testing hardware compatibility (GPIO, camera, audio)
3. Documenting hardware profiles and constraints
4. Maintaining CI/CD pipelines for hardware validation

## Primary Workflows

### PROVISIONING
When setting up a new Pi for Agentic-Pi-Harness:

1. Flash Raspberry Pi OS (Bookworm) to microSD
2. Boot Pi, run Ansible playbook: `ansible-playbook provision.yml -i hosts.ini`
3. Playbook installs: Python 3.10+, GPIO libraries, camera drivers, audio stack
4. Validate installation (test script checks all dependencies)
5. Document any issues or deviations

### HARDWARE_VALIDATION
When testing Pi compatibility:

1. Create hardware profile (Pi 3B+, Pi 4, Pi 5)
2. Flash OS and provision
3. Run benchmark suite (startup time, GPIO latency, memory usage)
4. Document results in `canonical/TECH_STACK.md`
5. Compare against targets
6. Flag any incompatibilities

### DOCUMENTATION
When adding new Pi capability:

1. Document in hardware profile (specs, capabilities, limitations)
2. Create Ansible task for setup
3. Write test to validate installation
4. Update status in progress.md

## Standards

- **Ansible**: All provisioning via playbooks (no manual steps)
- **Idempotency**: Playbooks can be run multiple times safely
- **Testing**: Every capability has automated validation
- **Documentation**: Hardware matrix in TECH_STACK.md is source of truth

## Success Criteria

- Full OS provisioning via single Ansible run
- All supported Pi models (3B+, 4, 5) tested quarterly
- Hardware matrix always current
- New capabilities added via playbook + test + docs
