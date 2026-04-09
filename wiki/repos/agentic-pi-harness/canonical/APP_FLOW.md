---
title: Application Flow — Agentic-Pi-Harness
type: canonical
repo_name: agentic-pi-harness
doc_type: app_flow
tags: [canonical, agentic-pi-harness]
status: draft
created: 2026-04-09
updated: 2026-04-09
---

# Agentic-Pi-Harness — Application Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Supervisor (Cloud-based or Local)                      │
│  - Receives task from MissionControl                    │
│  - Assigns work to Pi Workers                           │
└────────────────┬────────────────────────────────────────┘
                 │
         ┌───────┴─────────┐
         │                 │
    ┌────▼─────┐      ┌────▼─────┐
    │  Pi #1   │      │  Pi #2   │
    │ (4GB)    │      │ (8GB)    │
    └────┬─────┘      └────┬─────┘
         │                 │
    ┌────▼─────────────────▼────┐
    │  Local Inference Engine   │
    │  - Llama 7B (int8)        │
    │  - Streaming tokens       │
    │  - Tool execution         │
    └────┬─────────────────┬────┘
         │                 │
    ┌────▼──────┐     ┌────▼──────────┐
    │ Pi Tools  │     │ Local Queue   │
    │ - GPIO    │     │ (disconnected)│
    │ - Files   │     │ - Buffer      │
    │ - Camera  │     │   actions     │
    │ - Audio   │     │ - Sync on     │
    └───────────┘     │   reconnect   │
                      └───────────────┘
```

## Workflow: Task Execution on Pi

### 1. Task Assignment
```
Supervisor (Cloud)
  └─→ Sends task to Worker on Pi #1: "Analyze image from camera"
      │
      └─→ Worker receives task
          └─→ Queues locally if no cloud connectivity
```

### 2. Model Loading & Initialization
```
Pi Worker
  ├─→ Check if Llama 7B (int8) loaded
  │   └─→ If not: Load from disk (~3.8GB with int8 quantization)
  │       └─→ Takes 8–12 seconds on Pi 4
  │
  └─→ Initialize streaming context
      └─→ Allocate circular buffer for tokens (~100–200MB)
```

### 3. Tool Invocation
```
Agent Loop
  ├─→ Read from camera:
  │   └─→ Call GPIO control tool
  │       └─→ Trigger camera capture via /dev/video0
  │       └─→ Return image buffer to model
  │
  └─→ Process image via inference
      └─→ Stream tokens back to supervisor
      └─→ If network drops: Queue remaining tokens locally
```

### 4. Streaming Response
```
Model inference (Llama 7B int8)
  ├─→ Generate tokens at ~6–10 tokens/sec (150–250ms per token)
  ├─→ Stream tokens over socket to supervisor
  │   └─→ If network disconnected: Buffer in local queue
  │
  └─→ Complete response
      └─→ Send final status back to supervisor
```

### 5. Network Reconnection
```
If network was disconnected:
  ├─→ Detect reconnection (ping to supervisor succeeds)
  ├─→ Drain local queue:
  │   └─→ Send buffered tokens/actions to supervisor
  │
  └─→ Resume normal operation
```

## Tool Execution Examples

### GPIO Control
```python
# Agent calls tool: "Turn on LED on GPIO 17"
tool_result = execute_gpio(pin=17, state="ON")
# Returns: {"status": "success", "pin": 17, "state": "ON"}
```

### File Operations
```python
# Agent calls: "Read config from /etc/myconfig.ini"
tool_result = read_file(path="/etc/myconfig.ini")
# Returns: {"status": "success", "content": "...file contents..."}
```

### Camera Capture
```python
# Agent calls: "Take a photo and describe it"
tool_result = capture_image(resolution="1920x1080", format="jpg")
# Returns: {"status": "success", "image_path": "/tmp/photo_2026_04_09_10_15_32.jpg"}
# Agent then reads image, passes to vision model
```

### Subprocess Execution
```python
# Agent calls: "What's the network status?"
tool_result = run_command(cmd="ping -c 1 8.8.8.8")
# Returns: {"status": "success", "stdout": "...ping output..."}
```

## Memory Management

### Context Window Adaptation
```
Cloud model:
  - Context window: 4096 tokens (typical)

Pi model (Llama 7B int8):
  - Context window: 2048 tokens (fits in Pi 4 RAM)
  - Sliding window: Keep last 2000 tokens, drop oldest 500
  - New conversation: Start fresh (clear memory)
```

### Token Streaming for Memory Efficiency
```
Without streaming (cloud approach):
  1. Generate full response (e.g., 500 tokens)
  2. Load entire response in memory
  3. Send to client
  4. Clear memory
  
With streaming (Pi approach):
  1. Generate 1 token
  2. Send immediately
  3. Free that token from memory
  4. Repeat until response complete
  → Peak memory usage constant (1 token)
  → User sees response in real-time
```

## Network Resilience Flow

### Normal Operation (Connected)
```
Pi Agent
  ├─→ Receives task from cloud supervisor
  ├─→ Executes on local hardware
  ├─→ Streams response back to supervisor
  └─→ Awaits next task
```

### Disconnection Detected
```
Pi Agent
  ├─→ Ping supervisor fails
  ├─→ Switch to offline mode:
  │   ├─→ Queue new tasks locally
  │   ├─→ Execute queued tasks
  │   ├─→ Buffer results in local queue
  │   └─→ Retry supervisor connection every 5 seconds
  │
  └─→ Log: "Disconnected at 10:15:32"
```

### Reconnection
```
Pi Agent
  ├─→ Ping supervisor succeeds
  ├─→ Drain local queue:
  │   ├─→ Send queued task results
  │   ├─→ Fetch any new tasks
  │   └─→ Resume normal operation
  │
  └─→ Log: "Reconnected at 10:22:15 (7 minutes offline)"
```

## Performance Characteristics

### Startup Time
```
Pi 4 (4GB):
  - Boot OS: 20–30s (handled by Pi)
  - Start harness: 2–4s
  - Load model (Llama 7B int8): 8–12s
  - Total: ~10–15s to first inference

Pi 5 (8GB):
  - Boot OS: 15–20s
  - Start harness: 1–2s
  - Load model (Llama 7B int8): 4–6s
  - Total: ~5–10s to first inference
```

### Latency
```
Token generation (Llama 7B int8):
  - First token: 200–400ms (model initialization)
  - Subsequent tokens: 100–150ms each
  - Throughput: ~6–10 tokens/sec
  - User perception: Streaming, visibly generating response
```

### Memory Usage
```
Baseline (no model):
  - OS + harness: ~200MB
  - Python runtime: ~400MB
  - Buffers: ~100MB
  - Total: ~700MB

With Llama 7B (int8):
  - Model weights: ~3.8GB
  - Context buffer: ~200MB
  - Inference scratch: ~300MB
  - Total: ~4.3GB (fits on Pi 5, tight on Pi 4)
```

## Error Handling

| Error | Detection | Response |
|-------|-----------|----------|
| Network disconnect | Supervisor ping fails | Queue locally, retry periodically |
| Out of memory | OOMKilled | Reduce context window, restart |
| Model load fails | File not found | Use fallback model (if available) |
| Tool not available | Permission denied | Return error, suggest alternative |
| GPU out of VRAM | CUDA error | Fall back to CPU (slower) |

## Integration with MissionControl

```
MissionControl
  │
  └─→ POST /task (JSON):
      {
        "pi_id": "pi-1-kitchen",
        "task": "Analyze image from camera",
        "tools": ["camera", "vision_model"],
        "timeout": 30
      }
      
Pi Agent
  │
  ├─→ Receive task
  ├─→ Execute locally
  └─→ POST /result (JSON):
      {
        "task_id": "...",
        "status": "success",
        "result": "Image shows...",
        "tokens_generated": 47,
        "latency_ms": 1250
      }
```

## Integration with Agentic-KB

```
During optimization:
  1. Read pattern from Agentic-KB: "Streaming Tokens Over Sockets"
  2. Adapt for Pi: Reduce buffer size, implement timeout
  3. Test on hardware
  4. Document learnings in progress.md
  5. Contribute back: "Updated recipe with Pi optimization notes"
```
