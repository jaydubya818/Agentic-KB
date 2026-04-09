---
title: Application Flow — Pi
type: canonical
repo_name: pi
doc_type: app_flow
tags: [canonical, pi]
status: draft
created: 2026-04-09
updated: 2026-04-09
---

# Pi — Application Flow

## Provisioning Flow

```
User runs:
  ansible-playbook provision.yml -i hosts.ini

Ansible executes:
  1. Flash Raspberry Pi OS (Bookworm) → microSD
  2. Boot Pi
  3. Update system packages
  4. Install Python 3.10+
  5. Install GPIO libraries (RPi.GPIO, gpiozero)
  6. Install camera drivers (libcamera)
  7. Install audio stack (ALSA, sounddevice)
  8. Validate installation (test script)
  9. Log results

Output:
  Pi ready for Agentic-Pi-Harness deployment
```

## Hardware Validation Flow

```
1. Create hardware profile (e.g., Pi 4 with 4GB)
2. Provision Pi (Ansible)
3. Run benchmark suite:
   - Startup time (boot to Python ready)
   - GPIO latency (write/read pin timing)
   - Memory usage (baseline, with models)
   - Disk I/O (model load time)
4. Compare against targets
5. Document in TECH_STACK.md
6. Update hardware matrix
```

## Dependency Installation

Each dependency has automated installation and validation:
- Python: Install via apt, verify version
- GPIO: Install library, test LED on/off
- Camera: Install libcamera, capture test image
- Audio: Install sounddevice, record + playback test

See canonical/TECH_STACK.md for complete dependency list and versions.
