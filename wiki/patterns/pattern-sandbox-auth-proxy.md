---
id: 01KNNVX2R25ZHE74CTEFFC37SY
title: Sandbox Auth Proxy
type: pattern
tags: [agentic, security, credentials, sandboxing, multi-tenancy]
confidence: medium
sources:
  - [[summaries/langchain-deepagents-production]]
created: 2026-04-07
updated: 2026-04-07
related:
  - [[concepts/guardrails]]
  - [[concepts/permission-modes]]
status: evolving
---

# Pattern: Sandbox Auth Proxy

## Intent
Inject credentials into outbound requests from sandboxed agent execution environments so that sandbox code never holds raw API keys or secrets.

## Problem
Agents running in isolated sandboxes need to call external APIs (databases, SaaS tools, cloud services) that require authentication. Storing secrets inside the sandbox creates sprawl, rotation complexity, and exfiltration risk.

## Solution
Route all outbound HTTP requests from the sandbox through a sidecar or proxy layer that intercepts requests and injects the appropriate credentials (headers, tokens, signing) before forwarding. The sandbox code calls a local endpoint; the proxy handles auth transparently.

```
[Agent Sandbox] → http://localhost:proxy/target-api
                        ↓
               [Auth Proxy Sidecar]
               - resolves credential for target
               - injects Authorization header
               - forwards to real endpoint
                        ↓
               [External API]
```

## Consequences
- **+** Secrets never enter sandbox memory or logs
- **+** Credential rotation is centralized (update proxy config, not agent code)
- **+** Audit trail of all outbound calls is captured at proxy layer
- **−** Adds a network hop and proxy maintenance surface
- **−** Proxy itself becomes a high-value attack target — must be hardened

## Known Uses
- LangChain Deep Agents: sandbox auth proxy for LangSmith-deployed agents
- General pattern in cloud-native microservices (Envoy, AWS VPC endpoints with IAM injection)

## Related Patterns
- [[concepts/permission-modes]] — controlling what actions agents can take
- [[concepts/guardrails]] — broader constraint layer for agent behavior
