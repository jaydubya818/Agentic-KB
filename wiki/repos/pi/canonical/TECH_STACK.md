---
title: Tech Stack — Pi
type: canonical
repo_name: pi
doc_type: tech_stack
tags: [canonical, pi]
status: current
created: 2026-04-09
updated: 2026-04-09
---

# Pi — Tech Stack

## Operating System

- **Distribution**: Raspberry Pi OS (Bookworm, 64-bit)
- **Kernel**: Linux 6.6+ (Pi 5 optimized)
- **Init system**: systemd

## Supported Hardware

| Device | CPU | RAM | Storage | Status |
|--------|-----|-----|---------|--------|
| Pi 3B+ | 1.4 GHz 4-core | 1GB | microSD | Legacy |
| Pi 4 | 1.5 GHz 4-core | 2–8GB | microSD/NVMe | Baseline |
| Pi 5 | 2.4 GHz 4-core | 4–8GB | NVMe | Recommended |

## Core Dependencies

### System Libraries
- **Python**: 3.10+ (apt: python3.10, python3-pip)
- **Git**: For version control
- **Build tools**: gcc, make (for pip packages)

### Hardware Interface
- **GPIO**: RPi.GPIO or gpiozero (choose one)
  - RPi.GPIO: Lower level, more control
  - gpiozero: Higher level, easier API
- **Camera**: libcamera (default on Bookworm)
- **Audio**: ALSA, sounddevice (pip)

### Networking
- **SSH**: OpenSSH (pre-installed)
- **Network tools**: curl, ping, net-tools

## Versions (Current)

```yaml
OS: Raspberry Pi OS Bookworm
Python: 3.10.12
RPi.GPIO: 0.7.0 (or gpiozero: 2.0.1)
libcamera: 0.1.0+
ALSA: 1.2.10
sounddevice: 0.4.6
```

## Provisioning Stack

- **Automation**: Ansible 2.14+
- **Format**: YAML playbooks
- **Inventory**: hosts.ini (list of Pi devices)
- **Idempotency**: All playbooks re-runnable

## Deployment

### Ansible Playbook Structure
```
provision.yml
├── Pre-flight checks (OS version, Python available)
├── System updates (apt update, apt upgrade)
├── Python setup (install 3.10+)
├── GPIO setup (install RPi.GPIO or gpiozero)
├── Camera setup (libcamera configuration)
├── Audio setup (ALSA + sounddevice)
├── Validation (run tests for each dependency)
└── Logging (capture results)
```

### Typical Execution
```bash
# 1. Provision Pi
ansible-playbook provision.yml -i hosts.ini

# 2. Validate
ansible-playbook validate.yml -i hosts.ini

# 3. Deploy Agentic-Pi-Harness (separate repo)
cd ../agentic-pi-harness && docker-compose up
```

## Testing

### Unit Tests
- GPIO library installation and basic operation
- Python version verification
- Import all installed packages

### Integration Tests
- GPIO write/read cycle (LED on/off)
- Camera capture (verify image file created)
- Audio record/playback (5-second test)

### Hardware Validation
- Startup time benchmark
- GPIO latency (measure pin toggle timing)
- Memory usage profile
- Disk I/O (model loading speed)

## Performance Targets

| Metric | Pi 3B+ | Pi 4 | Pi 5 |
|--------|--------|------|------|
| Setup time | 15–20m | 12–15m | 8–10m |
| GPIO latency | 5–10ms | 5–10ms | 2–5ms |
| Disk I/O (model load) | 20–30s | 15–20s | 8–12s |

## Known Issues & Workarounds

### Pi 3B+ Constraints
- Only 1GB RAM (models must be small or quantized)
- Slower CPU (inference slow)
- **Workaround**: Use Phi 2.7B or quantized models

### GPIO Library Choice
- RPi.GPIO: More mature, but deprecated
- gpiozero: Active development, recommended
- **Recommendation**: Use gpiozero for new projects

### Camera Compatibility
- Pi Camera v2 and HQ camera supported
- USB webcams also work (fallback)
- **Note**: libcamera is new, some edge cases possible

## Security

- No default password changes needed (ephemeral)
- SSH key-based auth recommended for fleet
- Firewall rules: No incoming on GPIO ports (local only)

## Scaling

Single Pi provisioned via Ansible. For fleet:
- Use Ansible inventory with multiple IPs
- Parallel playbook execution (--forks parameter)
- Can provision 10+ Pi devices in ~15 minutes
