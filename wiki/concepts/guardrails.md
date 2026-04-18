---
id: 01KNNVX2QEX59X1KJTRNBCPNT3
title: Guardrails
type: concept
tags: [agentic, safety, guardrails, validation, content-filtering, policy]
confidence: high
sources:
  - "NVIDIA NeMo Guardrails documentation"
  - "Anthropic: Safety best practices (2025)"
  - "Rebuff: Prompt injection detection"
created: 2026-04-04
updated: 2026-04-04
related:
  - "[[concepts/human-in-the-loop]]"
  - "[[concepts/permission-modes]]"
  - "[[concepts/agent-failure-modes]]"
  - "[[patterns/pattern-confirm-before-destructive]]"
  - "[[patterns/pattern-minimal-permissions]]"
  - "[[patterns/pattern-tool-output-validation]]"
status: stable
---

## TL;DR

Guardrails are enforcement mechanisms layered around LLM inputs, outputs, and actions. They range from hard stops (abort on policy violation) to soft warnings (flag but continue). The layer model — input → LLM → output → action — defines where each guardrail type applies. Defense in depth: no single guardrail is sufficient; layer them.

---

## Definition

Guardrails are validation, filtering, and enforcement mechanisms that constrain what an LLM-based system receives as input, generates as output, and executes as actions. They enforce policy at the system level, independent of the model's own safety training.

---

## How It Works

### The Guardrail Layer Model

```
[User/External Input]
        ↓
[Input Guardrails] ← validate, sanitize, reject if policy violated
        ↓
[LLM Processing] ← system prompt constraints, tools
        ↓
[Output Guardrails] ← validate format, content, policy
        ↓
[Action Guardrails] ← before destructive actions, permission checks
        ↓
[Effect on World]
```

Each layer has different tools and failure modes.

---

## Input Validation

**What to check**:
- Schema: Does input match expected structure (type, length, required fields)?
- Content policy: Does input contain prompt injection attempts, jailbreaks, harmful content?
- Rate limiting: Is this user/session making requests at suspicious frequency?
- Authorization: Does the caller have permission to submit this type of input?

**Prompt injection detection** — A specific input guardrail for agentic systems. When user input or tool output will be injected into agent context, check for instruction-injection patterns:

```python
INJECTION_PATTERNS = [
    r"ignore (all |previous |your )?instructions",
    r"you are now",
    r"new system prompt",
    r"<\/?system>",
    r"disregard (your |the )?system prompt",
]

def check_injection(text: str) -> bool:
    return any(re.search(p, text, re.IGNORECASE) for p in INJECTION_PATTERNS)
```

Schema-level validation with Zod (TypeScript) or Pydantic (Python) before any text reaches the model:

```typescript
const UserInputSchema = z.object({
  message: z.string().max(4000),
  context_id: z.string().uuid(),
  intent: z.enum(['query', 'command', 'feedback'])
});
```

---

## Output Validation

**Structural guardrails (JSON Schema)**: When the model is supposed to output structured data, validate it:

```python
def validated_output(raw_output: str, schema: dict) -> dict:
    try:
        parsed = json.loads(raw_output)
        jsonschema.validate(parsed, schema)
        return parsed
    except json.JSONDecodeError:
        raise OutputValidationError(f"Model returned invalid JSON: {raw_output[:200]}")
    except jsonschema.ValidationError as e:
        raise OutputValidationError(f"Output schema mismatch: {e.message}")
```

**Semantic guardrails (classifiers)**: When structural validation isn't sufficient, use a classifier to detect policy violations in the output:

- Toxicity classifiers (Perspective API, custom fine-tuned models)
- PII detectors (detect SSN, credit card numbers, etc. in output)
- Custom policy classifiers (domain-specific prohibited content)

```python
def check_output_policy(output: str) -> PolicyResult:
    pii_result = detect_pii(output)
    toxicity_result = classify_toxicity(output)

    if pii_result.contains_pii:
        return PolicyResult(violation=True, reason="PII detected", action="block")
    if toxicity_result.score > TOXICITY_THRESHOLD:
        return PolicyResult(violation=True, reason="Toxic content", action="block")
    return PolicyResult(violation=False)
```

---

## Action Guardrails

Before the agent takes an irreversible action, gate on a check:

```python
DESTRUCTIVE_ACTIONS = {"delete_file", "send_email", "deploy_to_production", "drop_table"}

def execute_tool(tool_name: str, args: dict) -> str:
    if tool_name in DESTRUCTIVE_ACTIONS:
        confidence = assess_confidence(tool_name, args)
        if confidence < CONFIDENCE_THRESHOLD:
            return request_human_approval(tool_name, args)  # HITL gate
    return run_tool(tool_name, args)
```

See [[patterns/pattern-confirm-before-destructive]] for full implementation.

---

## Hard Stops vs Soft Warnings

**Hard stop**: Abort the operation and return an error. Used when:
- Input contains a confirmed prompt injection
- Output contains PII that must not be transmitted
- Action would violate a non-negotiable policy (e.g., attempting to access an unauthorized resource)

**Soft warning**: Flag the issue, log it, but allow the operation to continue (possibly with escalation). Used when:
- Content is borderline and human review is warranted
- The model may have made a suboptimal choice but not a policy violation
- You're in monitoring mode (calibrating thresholds)

**The architecture**:

```python
class GuardrailResult:
    verdict: Literal["pass", "warn", "block"]
    reason: Optional[str]
    evidence: Optional[dict]

def apply_guardrails(request: AgentRequest) -> GuardrailResult:
    results = [
        check_input_schema(request),
        check_injection(request.user_message),
        check_rate_limit(request.session_id),
    ]
    blocks = [r for r in results if r.verdict == "block"]
    if blocks:
        return blocks[0]  # First block wins
    warns = [r for r in results if r.verdict == "warn"]
    if warns:
        log_warnings(warns)
    return GuardrailResult(verdict="pass")
```

---

## Policy Enforcement Layers

Guardrails should be implemented at multiple layers, not just in the prompt:

1. **Infrastructure layer**: Network rules, authentication, rate limiting — before the request reaches the agent
2. **Input layer**: Schema validation, injection detection, content policy
3. **Agent layer**: System prompt constraints, tool permission sets
4. **Output layer**: Schema validation, semantic classifiers
5. **Action layer**: Pre-action checks, HITL gates, audit logging
6. **Audit layer**: Post-hoc review, anomaly detection on logs

No layer is sufficient alone. A prompt injection that bypasses layer 2 should still be caught at layer 3 (model's safety training) and layer 5 (action gates). Defense in depth.

---

## When To Use

- Any agent with access to external systems (email, APIs, databases, file systems)
- Any agent that processes untrusted input (user messages, web scraping, external data)
- Any agent that can take irreversible actions
- Any agent deployed in a regulated domain (healthcare, finance, legal)

---

## Risks & Pitfalls

- **Guardrail evasion**: Adversarial users will probe for edge cases. No regex or classifier is perfect. Layer them.
- **Over-blocking**: Overly aggressive guardrails break legitimate workflows. Calibrate thresholds against real usage data.
- **Latency addition**: Classifier-based semantic guardrails add 100-500ms per call. Factor into SLA.
- **False sense of security**: Guardrails reduce risk, they don't eliminate it. Maintain human oversight for high-stakes systems regardless.
- **Guardrail blindness**: Agents are not told about guardrails in the system prompt. If the agent doesn't know a guardrail will fire, it can't account for it in its planning.

---

## Counter-arguments & Gaps

Published jailbreak research (Zou et al. "Universal and Transferable Adversarial Attacks" 2023, Wei et al. "Jailbroken: How Does LLM Safety Training Fail" 2023) shows that LLM-based guardrails are systematically bypassable with adversarial prefixes and multi-turn setups. The layered-defense argument still holds — each layer forces more adversarial effort — but claiming guardrails "work" without specifying the threat model overstates the protection. Against a determined adversary, they mostly buy time.

Over-blocking is rarely measured with the rigor under-blocking gets. Teams publish false-positive rates on benign benchmarks but not false-*negative* measurements from production telemetry. The result is that guardrail quality is evaluated asymmetrically: we know how often they block legitimate requests, not how often they miss malicious ones.

Semantic guardrails (Llama Guard, NeMo Guardrails) inherit the biases and refusal patterns of their underlying models. Using a guardrail model trained by vendor A to protect a primary model from vendor B means importing vendor A's safety policy — which may not match the product's requirements. This is a governance choice disguised as a technical one.

Open questions: (a) how do guardrails compose with agentic tool use? An agent with a blocked output can often route around the block by calling a tool whose output isn't checked. (b) At what adversarial sophistication does the layered-defense equation flip from "worth the latency" to "security theater"?

What would change the verdict on pure semantic guardrails: adversarial evaluations where success rates stay below 5% over a red-team cycle longer than a quarter. Current published results cluster at 20-60% bypass rates within days.

---

## Related Concepts

- [[concepts/human-in-the-loop]] — the HITL gate as a special case of action guardrail
- [[concepts/permission-modes]] — model-level permission constraints
- [[concepts/agent-failure-modes]] — what happens when guardrails fail
- [[patterns/pattern-confirm-before-destructive]] — action guardrail implementation
- [[patterns/pattern-minimal-permissions]] — reducing blast radius

---

## Sources

- NVIDIA NeMo Guardrails documentation (2024)
- [[anthropic]] Safety best practices (2025)
- Inan et al. "Llama Guard: LLM-based Input-Output Safeguard" (2023)
