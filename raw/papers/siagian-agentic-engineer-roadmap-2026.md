# Complete Roadmap to Become an Agentic AI Engineer in 2026
> Author: Lamhot Siagian — PhD Student, AI Evaluation Engineer
> Published: January 19, 2026
> Source: PDF — softwaretestarchitect.com / linkedin.com/in/lamhotsiagian

Interview Q&A guide: 10 sections × 10 questions each, covering the full agentic AI engineering stack.
Foundation-first learning order: Python → LLM → Framework → Advanced → Memory → Tools → RAG → Agents → Production.

---

## Section 1: Python Fundamentals

- Project structure: app/ core/ agents/ tools/ rag/ eval/ infra/ — separations of concern so prompts/tools evolve independently
- Type hints + Pydantic schemas throughout; reduces hallucinated tool parameters
- Async/await for IO-heavy tool calls; multiprocessing for CPU-bound embedding
- Pydantic for typed tool input schemas: validate before agent runs tool
- Test deterministic layers (parsers, adapters) with unit tests; LLM steps with golden prompts + snapshot testing
- Production pitfalls: unbounded retries, missing timeouts, global state, mixed prompt/business logic, no observability
- Dependency management: lockfiles (uv/poetry/pip-tools), pinned Docker OS packages; library changes can alter tokenization

## Section 2: LLM Fundamentals

- Token limits force tradeoffs: what instructions, memory, retrieved docs fit — "context budgeting"
- Prompting is interface design: role, task, constraints, output schema, examples, tool-use policies
- Temperature: lower for production (JSON/tool calls), higher for brainstorming
- Function calling: model outputs structured tool invocation → system executes → returns results; enables schema validation + sandboxing
- Prompt injection defense: treat retrieved text as untrusted; strict system policy; separate tool outputs from system instructions; content provenance tags
- Hallucination: reduce via tools for factual queries, RAG+citations, constrained outputs, abstain rules, verification loops, second-pass critic
- Embeddings: semantic similarity → ANN search; choose model by domain/language/cost/dimension; chunking = coherent meaning units
- Production risks: reliability, security (injection, leaks), privacy (PII), cost/latency spikes, evaluation drift; agents add action risks

## Section 3: Framework Selection

- LangGraph: explicit state machines/graphs, checkpointing, retries, long-running workflows, human-in-the-loop → best for production
- CrewAI: opinionated "role-based" multi-agent collaboration
- AutoGen: flexible agent-to-agent chat patterns
- Biggest anti-pattern: copy-pasting demo code and treating framework as architecture; frameworks amplify chaos if fundamentals skipped
- Vendor lock-in: abstract LLM + embedding behind interfaces; keep prompts/schemas/evals portable; isolate framework in a layer
- State: structured data flowing through steps (user input, history, retrieved docs, tool results, decisions); typed + minimal; enables reproducibility + observability
- Router pattern: Router (decide) → Tool Executor (act) → Verifier (check)
- Migration path: notebook → package + API → typed schemas + error handling + retries → evaluation harnesses → containerize + monitoring

## Section 4: Advanced Framework Concepts

- LCEL: composes prompts/models/parsers/tools into pipelines; modularity + observability
- Runnables: uniform interface (input → output) for pipeline steps; standardizes logging, retries, concurrency
- Retry/fallback: classify failures (transient vs persistent) → backoff for transient, fallback tool or clarifying question for persistent; model in graph as error edge → repair node → retry; cap retries
- Multi-agent vs single agent: only go multi-agent when task truly benefits from decomposition; adds coordination complexity
- Loop prevention: max steps + time budgets + stop conditions; track repeated tool calls; watchdog forcing escalation; state counters + guard edges
- Structured output: machine-validated JSON = difference between demo and reliable system; schema validation gates tool execution
- Critic/verifier step: deterministic checks first (schema, regex, business rules); optional LLM judge as second layer
- Parallelism tradeoffs: parallel tool calls reduce latency but waste cost; cap concurrency; serialize where decisions depend on prior results
- Long-running tasks: async jobs + persistent state (DB/queue) + checkpoint after each step; idempotent tool calls; resume from checkpoint

## Section 5: Memory Management

- Short-term: context window (conversation, tool outputs, task state) — fast but limited
- Long-term: external storage (DB, vector stores, user profiles, summaries) — scalable but needs retrieval + filtering
- Summaries for "what happened" (decisions, commitments, preferences); embeddings for large knowledge needing semantic retrieval
- Checkpointing: saves workflow state after steps; enables resume after failures, human approvals; includes inputs + tool calls + outputs + prompt versions; enables replay + debugging
- Context budgeting: allocate % of context window to instructions/chat/docs/memory; enforce budgets; compress (summarize, deduplicate, drop low-value) when exceeded
- Memory evaluation: A/B tests; measure task success, hallucination rate, user satisfaction; monitor "memory hit rate" and "memory-induced error"
- Recency vs relevance: balance both — top semantic matches re-ranked by recency and trust
- Multi-agent memory: shared (task plan, verified facts) vs private (specialist intermediate notes); structured state as primary "truth"; provenance required
- Failure modes: irrelevant chunks, noisy/unverified storage, hallucination feedback loops, stale preferences, conflicting memories; mitigate with validation + decay/expiration + "do not store uncertain content"
- User corrections: high priority; mark old entries deprecated (not deleted) for auditability; store corrective note + re-rank by recency

## Section 6: Tool Integration

- Agent-friendly tool: clear name, narrow purpose, typed input schema, deterministic output, fast failure, structured return, timeouts, helpful error codes
- Side-effect tools: separate read/write; require explicit confirmation for irreversible actions; policy checks + HITL approvals; audit log every action
- Allowlist + sandbox: allowlist limits callable tools; sandbox limits what they can do (restricted filesystem, network egress); both needed for hallucinated calls + injection defense
- Tool output design: return only what agent needs; concise fields + summaries; pagination/top-k; strip irrelevant metadata; store large outputs externally + return reference ID
- Error handling: structured errors (code, message, retryable); backoff for retryable; repair loop for non-retryable; cap retries; expose to logs/traces
- Tools vs connectors: connectors wrap external services with auth/discovery; requires OAuth, token refresh, permission scopes; only access what user authorized
- Tool versioning: treat like APIs; version schemas; deprecate gradually; pin versions per workflow
- Preventing unnecessary tool calls: explicit policy "call only when need external truth"; classifier step (answer directly vs use tool); penalize unnecessary calls in eval
- Observability: latency, error rate, retries, request volume, output sizes; trace spans per call; sanitized arguments; correlate tool calls with task success

## Section 7: RAG Systems

- RAG: injects external knowledge; reduces hallucinations; enables up-to-date/private knowledge without retraining
- Chunk size: 300–800 tokens with 10–20% overlap as starting point; use semantic chunking (by headings); always measure retrieval quality
- Dense (embeddings) vs sparse (BM25) vs hybrid retrieval: hybrid improves recall especially for technical terms; retrieve hybrid then re-rank with cross-encoder or LLM
- Re-ranking: stronger model scores candidates against query; improves precision; costs latency; cache frequent queries
- Preventing irrelevant retrieval: careful top-k; re-ranking; metadata filtering (date, source, permissions); "no relevant evidence" abstention condition; require citations mapping to chunks
- RAG metrics: recall@k, precision@k, MRR, nDCG; factuality, citation correctness, task success; latency, cost, failure rates
- Index freshness: incremental indexing; detect changed docs; re-embed affected chunks; track versions + timestamps; streaming ingestion for high-change sources
- Metadata filtering: filter by tenant, permission, doc type, date, language; enforce in code not model; key security requirement for enterprise RAG
- Grounded generation: claims supported by retrieved evidence; citations map to chunk IDs/URLs; automatically verify citations
- Common failures: bad chunking, weak domain embeddings, missing metadata filters, wrong top-k, query mismatch; fix with hybrid retrieval + re-ranking + query rewriting

## Section 8: Agents & Multi-Agents

- ReAct: interleaves reasoning (plan) + actions (tool calls) + observations (results); iterative; improves factuality; challenges: controlling loops, tool misuse, context growth
- Supervisor: coordinates specialists (retriever, coder, critic); explicit criteria for delegating + accepting results; adds overhead; must be instrumented
- Agent communication: structured messages (objective, constraints, state, output format); pass references/summaries not huge raw context; track provenance per claim
- Planning vs execution: planner proposes, executor validates + runs only safe actions; planning = low temperature; execution = strict schema validation
- Uncertainty: explicit confidence scores + assumptions + "need more info" flags; if low confidence, call tool or ask clarifying question
- Tool abuse in multi-agent: centralize execution behind policy gate; allowlists + scopes + rate limits at executor level; restrict each agent's tool set
- Agent protocol: standardized format for inputs/outputs (schemas, fields, error conventions); includes goal, constraints, context refs, tool results, final answer with citations
- Multi-agent RAG+report pattern: retriever → summarizer (citations) → writer → critic (unsupported claims); supervisor orchestrates; loop back if verification fails
- Agent evaluation: task suites with expected outcomes; success rate, tool call counts, latency/cost, safety violations; error buckets; regression tests; continuous
- Unique safety concerns: agents take real actions; prompt injection can redirect; tool outputs can contain malicious instructions; mitigate with least privilege + confirmations + sandboxing + policy gates + audit logs

## Section 9: Production Deployment

- End-to-end architecture: UI (Streamlit/React) → API (FastAPI) → Orchestrator (graph) → Tools + RAG (vector store) + Memory (DB); add observability + eval pipelines + queue for long tasks + cache for retrieval
- FastAPI: async support, Pydantic typing, auto OpenAPI docs, middleware for logging/auth
- Streamlit UI: chat layout + debug panel for traces; stream responses + show citations/tool steps
- Dockerfile: slim base, pinned deps, non-root user, health checks, separate images for API vs worker
- AWS: ECS/Fargate (containers), EKS (Kubernetes), Lambda (serverless); RDS/DynamoDB (state), S3 (artifacts), Secrets Manager (creds), CloudWatch (logs/metrics)
- Observability: structured logs + request IDs, trace spans for each step + tool call, metrics for latency/tokens/errors; capture prompts + arguments (sanitized); replay from trace ID
- Streaming: stream tokens for UX; stream progress events for tool calls; backpressure + timeouts; streaming ≠ correctness
- API security: auth, rate limits per user, tenant isolation, input validation, tool scopes by user permission, sanitized logs, prompt injection defense
- CI/CD: linting + type checks + unit tests + integration tests (mocked tools); build + scan Docker; deploy to staging with canary prompts; run eval suites on each change; block deploys on metric regression
- Production readiness: reliability + safety + observability + maintainability; graceful degradation; cite evidence; avoid unsafe actions; reproduce failures from logs; continuous evaluation as models/tools/data evolve

## Section 10: Quick Learning Checklist (2026)

1. Python fundamentals: types, APIs, async, project structure, tests
2. LLM fundamentals: tokens, context budgeting, prompting, tool calling
3. Framework choice: start simple → graduate to graphs/workflows
4. Advanced concepts: composition, retries, fallbacks, verification
5. Memory: summaries + vector retrieval + checkpointing
6. Tools: schemas, safety gates, observability
7. RAG: chunking, hybrid retrieval, re-ranking, evaluation
8. Agents: ReAct, supervisors, protocols, safety
9. Real projects: FastAPI + UI + Docker + cloud + CI/CD + eval

Interview tip: bring 2–3 concrete projects showing tool use, RAG, evaluation, production thinking; explain one real failure you debugged.
