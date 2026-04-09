---
title: Tech Stack — Agentic-Pi-Harness
type: canonical
repo_name: agentic-pi-harness
doc_type: tech_stack
tags: [canonical, agentic-pi-harness]
status: current
created: 2026-04-09
updated: 2026-04-09
---

# Agentic-Pi-Harness — Tech Stack

## Hardware

### Supported Platforms
| Device | RAM | CPU | GPU | Status | Notes |
|--------|-----|-----|-----|--------|-------|
| Pi 3B+ | 1GB | 1.4 GHz (4 core) | None | Legacy | Llama 7B won't fit; use Phi 2.7B max |
| Pi 4 | 4GB | 1.5 GHz (4 core) | None | Baseline | Target platform; Llama 7B int8 fits |
| Pi 5 | 8GB | 2.4 GHz (4 core) | None | Optimal | Recommended; 2x faster than Pi 4 |

### Recommended Configuration
- **Minimum**: Pi 4 with 4GB RAM + 32GB microSD
- **Recommended**: Pi 5 with 8GB RAM + 64GB microSD (NVMe for faster model loading)
- **Storage**: USB 3.0 SSD (model files can be large)
- **Cooling**: Passive heatsink or small fan (continuous inference generates heat)
- **Power**: 5A USB-C supply (27W typical, 30W+ peak)

## Core Dependencies

### Python Runtime
- **Python**: 3.10+ (type hints, performance)
- **Package manager**: pip (virtual environment recommended)

### ML Inference
- **Framework**: Ollama or llama.cpp
- **Models**: Llama 2 7B, Mistral 7B, Phi 2.7B
- **Quantization**: GGML format (int8, int4)

### System Libraries
- **GPIO**: RPi.GPIO or gpiozero
- **Camera**: libcamera (Pi OS default)
- **Audio**: ALSA (Pi OS default)
- **Networking**: Python socket (stdlib)

### Deployment
- **Containerization**: Docker + Docker Compose
- **OS**: Raspberry Pi OS (Bookworm, 64-bit)

## Application Stack

### Inference Engine
```yaml
Component: Local LLM Inference
Technology: ollama or llama.cpp
Models:
  - Llama 2 7B (int8): ~3.8GB
  - Mistral 7B (int8): ~4.2GB
  - Phi 2.7B (int8): ~1.5GB
Quantization: int8 (speed/quality trade-off)
Memory: Fits in Pi 4 RAM (4GB) with int8
```

### Agent Loop
```yaml
Component: Claude Code Harness (adapted)
Language: Python
Key modules:
  - supervisor.py (cloud-based or local)
  - worker.py (Pi worker process)
  - tool_registry.py (GPIO, files, etc.)
  - streaming.py (token streaming)
  - network_resilience.py (offline queueing)
```

### Tools Interface
```yaml
GPIO Control:
  Library: RPi.GPIO or gpiozero
  Supported: Digital I/O, PWM
  
File Operations:
  Library: os, pathlib (stdlib)
  Supported: read, write, list, delete
  
Camera:
  Library: libcamera-python
  Supported: JPEG capture, image processing
  
Audio:
  Library: sounddevice (or ALSA direct)
  Supported: record, playback
  
Subprocess:
  Library: subprocess (stdlib)
  Supported: shell commands, pipelines
```

## Data Formats

### Task Specification (JSON)
```json
{
  "task_id": "uuid",
  "pi_id": "pi-1-kitchen",
  "task_name": "Analyze image from camera",
  "tools": ["camera", "vision_model"],
  "timeout_seconds": 30,
  "priority": "high"
}
```

### Result Streaming (JSON Lines)
```json
{"type": "token", "text": "The", "latency_ms": 150}
{"type": "token", "text": " image", "latency_ms": 140}
{"type": "tool_call", "tool": "camera", "args": {"resolution": "1920x1080"}}
{"type": "complete", "total_tokens": 47, "total_ms": 1250}
```

### Health Report (JSON)
```json
{
  "pi_id": "pi-1-kitchen",
  "timestamp": "2026-04-09T10:15:32Z",
  "status": "healthy",
  "cpu_usage_percent": 45,
  "memory_usage_mb": 1200,
  "model_loaded": "llama-2-7b-int8",
  "network_connected": true,
  "queue_depth": 0,
  "uptime_seconds": 864000
}
```

## Deployment

### Docker Setup
```dockerfile
# Multi-stage build
FROM python:3.10-bookworm AS builder
# Install dependencies, download models

FROM python:3.10-bookworm
COPY --from=builder /models /models
COPY --from=builder /app /app
CMD ["python", "/app/worker.py"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  pi-worker:
    build: .
    environment:
      PI_ID: "pi-1"
      SUPERVISOR_URL: "http://supervisor:5000"
    volumes:
      - /dev/mem:/dev/mem  # GPIO access
      - /dev/video0:/dev/video0  # Camera access
    devices:
      - /dev/gpiomem  # GPIO device
    networks:
      - agent-net
```

## Model Storage

### Location & Organization
```
/home/pi/models/
├── llama-2-7b-int8.gguf (3.8 GB)
├── mistral-7b-int8.gguf (4.2 GB)
├── phi-2.7b-int8.gguf (1.5 GB)
└── manifest.json
```

### Loading Strategy
- Pre-load model on startup (8–12 seconds on Pi 4)
- Cache in memory (model stays loaded unless swapped)
- Optional: Lazy-load on first task (slower first response)

## Network

### Supervisor Communication
- **Protocol**: HTTP/WebSocket
- **Port**: 5000 (supervisor), 5001+ (workers)
- **Format**: JSON
- **Timeout**: 30s (tasks), 5s (pings)

### Offline Queueing
- **Storage**: SQLite (local database)
- **Queue size**: Up to 100 queued tasks
- **Persistence**: Survives Pi reboot
- **Sync on reconnect**: Automatic retry

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Startup (Pi 4) | <12s | 8–12s |
| Model load | 8–12s | Achieved |
| Token latency | <100ms | 100–150ms |
| Memory (baseline) | <1.0GB | 1.2GB (optimize) |
| Tool latency | <50ms | Achieved (GPIO, file) |
| Network reconnect | <5s | Achieved |

## Scaling Limits

**Single Pi**:
- 1 supervisor + 2–4 concurrent workers
- ~1–2 tasks/minute per worker
- Limited by model inference speed

**Multi-Pi Cluster**:
- Up to 10+ Pi devices coordinated by MissionControl
- Tasks distributed by load
- Supervisor on cloud or dedicated high-end Pi

## Known Limitations

1. **No GPU acceleration** — Pi has no discrete GPU; inference on CPU only
2. **Large context windows don't fit** — Reduce from 4K to 2K tokens on Pi 4
3. **int4 quantization risky** — Quality loss may be significant; test carefully
4. **Audio/camera drivers** — Require specific Pi OS versions (Bookworm recommended)
5. **Real-time constraints** — Pi not suitable for sub-50ms latency requirements

## Security Considerations

- **No authentication** (local network assumed trusted)
- **File access**: Restrict to designated directories
- **GPIO access**: Run as pi user (not root)
- **Network**: Run supervisor on VPN if over internet

## Future Upgrades

- **Coral TPU**: USB accelerator (3x inference speedup)
- **Model optimization**: ONNX, TensorRT compilation
- **Custom kernels**: Optimized matrix operations for Pi CPU
- **Distributed inference**: Split models across Pi cluster
