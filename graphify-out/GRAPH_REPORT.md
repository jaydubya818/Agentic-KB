# Graph Report - /Users/jaywest/Agentic-KB  (2026-04-06)

## Corpus Check
- 87 files · ~94,579 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 222 nodes · 299 edges · 57 communities detected
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 44 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `Hot Cache (wiki/hot.md)` - 18 edges
2. `GSD — Get Shit Done` - 14 edges
3. `Jay West — Agent Stack` - 13 edges
4. `Jay's Agent Design Patterns (Observed)` - 12 edges
5. `Anthropic Claude API` - 12 edges
6. `Plan-Execute-Verify` - 11 edges
7. `Fan-Out Worker` - 10 edges
8. `Superpowers Framework` - 10 edges
9. `Claude Code` - 10 edges
10. `Agentic Engineering KB Master Index` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Design Decision: Tool Restriction by Agent Role` --implements--> `Minimal Permissions`  [INFERRED]
  wiki/personal/personal-agent-design-observations.md → wiki/patterns/pattern-minimal-permissions.md
- `Reflection Loop` --semantically_similar_to--> `Supervisor-Worker`  [INFERRED] [semantically similar]
  wiki/patterns/pattern-reflection-loop.md → wiki/patterns/pattern-supervisor-worker.md
- `Mandatory Initial Read Protocol` --implements--> `Read Before Write`  [INFERRED]
  wiki/personal/personal-agent-design-observations.md → wiki/patterns/pattern-read-before-write.md
- `Structured Output as Contract` --semantically_similar_to--> `Tool Schema Design`  [INFERRED] [semantically similar]
  wiki/personal/personal-agent-design-observations.md → wiki/patterns/pattern-tool-schema.md
- `Design Decision: Model Assignment by Agent Consequence` --implements--> `Model Tiering Strategy`  [INFERRED]
  wiki/personal/personal-agent-design-observations.md → wiki/hot.md

## Hyperedges (group relationships)
- **Agent Safety Triad: Minimal Permissions + Confirm Before Destructive + Worktree Isolation** — pattern_minimal_permissions, pattern_confirm_before_destructive, pattern_worktree_isolation [INFERRED 0.90]
- **Context and Memory Management Cluster: Hot Cache + Rolling Summary + External Memory** — pattern_hot_cache, pattern_rolling_summary, pattern_external_memory [INFERRED 0.88]
- **Orchestration Topology Patterns: Fan-Out Worker + Supervisor-Worker + Pipeline** — pattern_fan_out_worker, pattern_supervisor_worker, pattern_pipeline [INFERRED 0.92]
- **Jay's Three-Framework Decision System: GSD + Superpowers + BMAD with explicit selection rules** — framework_gsd, framework_superpowers, framework_bmad, entity_jay_west_agent_stack, concept_hybrid_framework_pattern [EXTRACTED 1.00]
- **Anthropic Claude Ecosystem: API + Claude Code + MCP as unified platform** — entity_anthropic, framework_claude_api, framework_claude_code, framework_mcp, entity_mcp_ecosystem [EXTRACTED 1.00]
- **Research Lineage: Weng+Ng+Nakajima defined vocabulary adopted by LangGraph+CrewAI+AutoGen** — person_lilian_weng, person_andrew_ng, person_yohei_nakajima, framework_langgraph, framework_crewai, framework_autogen, concept_weng_agent_taxonomy, concept_agentic_design_patterns [INFERRED 0.80]
- **Multi-Agent Safety Triad** — concept_guardrails, concept_permission_modes, concept_agent_failure_modes [INFERRED 0.88]
- **Agent Loop Resource Management** — concept_agent_loops, concept_context_management, concept_cost_optimization [INFERRED 0.85]
- **Multi-Agent Recipe Stack** — recipe_build_tool_agent, recipe_multi_agent_crew, recipe_parallel_subagents [EXTRACTED 0.92]
- **GSD Plan-Execute-Verify Triad** — summary_gsd_executor, summary_gsd_verifier, gsd_framework [EXTRACTED 0.95]
- **Agentic Evaluation Cluster** — trajectory_evaluation, llm_as_judge, observability, summary_gsd_verifier [INFERRED 0.82]
- **Karpathy LLM Wiki Pattern Sources** — summary_karpathy_gist, summary_karpathy_video, summary_nate_herk, karpathy_raw_folder_workflow [EXTRACTED 0.92]

## Communities

### Community 0 - "LLM Models & Third-Party Frameworks"
Cohesion: 0.13
Nodes (26): AutoGen Code Execution Agent, AutoGen Conversational Agent Paradigm, CrewAI Role-Goal-Backstory Agent Identity, Extended Thinking (Claude Opus), LangGraph Checkpointing, LangGraph State Machine Graph, Model Tiering Strategy, Prompt Caching (+18 more)

### Community 1 - "GSD/Superpowers/BMAD Operations"
Cohesion: 0.13
Nodes (23): gsd-executor Agent, gsd-planner Agent, gsd-verifier Agent, superpowers-code-reviewer Agent, Adversarial Plan Verification, Agent Tool Fan-Out Pattern, BMAD Party Mode, CLAUDE.md Instruction Layer (+15 more)

### Community 2 - "Multi-Agent Patterns & Orchestration"
Cohesion: 0.12
Nodes (21): Blast Radius, bypassPermissions + Worktree Combination, Multi-Agent Systems, Numbered Pipeline vs Orchestrator Star, Principle of Least Privilege, Telephone Game Problem, Claude Code CLI, Confirm Before Destructive (+13 more)

### Community 3 - "Karpathy KB, MCP & Anthropic Ecosystem"
Cohesion: 0.15
Nodes (19): Constitutional AI, LLM Wiki Pattern, MCP JSON-RPC Tool Protocol, OpenClaw Antfarm Swarm, Andrej Karpathy, Anthropic, Jay West — Agent Stack, MCP Ecosystem (+11 more)

### Community 4 - "Memory Systems & Tool Safety Patterns"
Cohesion: 0.18
Nodes (18): Context Window Survival Strategies, Idempotency Key, Letta Filesystem vs Mem0 Benchmark Finding, Memory Systems Taxonomy (CoALA), Write-and-Return Pattern, Letta (memory framework), Mem0 (memory framework), Zep/Graphiti (temporal knowledge graph) (+10 more)

### Community 5 - "Framework Philosophy & Design Decisions"
Cohesion: 0.19
Nodes (17): BMAD Method, Superpowers Framework v5.0.6, Superpowers Iron Laws, Karpathy File-Based Wiki Pattern, Design Decision: Hybrid Framework Pattern (GSD+Superpowers+BMAD), Agentic Engineering KB, Jay West, Eval — Memory Approaches for Agentic Systems (+9 more)

### Community 6 - "GSD Execution Architecture"
Cohesion: 0.17
Nodes (16): GSD Framework (Get Shit Done) v1.28.0, GSD Executor Deviation Rules, Mandatory Initial Read Protocol, Structured Output as Contract, XML Section Architecture (GSD Agents), Design Decision: Model Assignment by Agent Consequence, Design Decision: Opus for long-lasting structural artifacts, Design Decision: Tool Restriction by Agent Role (+8 more)

### Community 7 - "Context Management & Evaluation Core"
Cohesion: 0.22
Nodes (9): Context Management, Cost Optimization, Memory Systems, Human-in-the-Loop, LLM-as-Judge, Observability, Context Compression Recipe, State Persistence (+1 more)

### Community 8 - "Agent Taxonomy & Research Foundations"
Cohesion: 0.36
Nodes (8): Andrew Ng Four Agentic Design Patterns, ReAct Pattern (Reasoning + Acting), Weng LLM Agent Taxonomy (Memory+Action+Planning), Key Agentic Researchers, Andrew Ng, Kanjun Qiu, Lilian Weng, Yohei Nakajima

### Community 9 - "GSD/Superpowers Framework Summaries"
Cohesion: 0.5
Nodes (5): GSD Framework, GSD Executor Agent Summary, GSD Framework Skills Summary, GSD Verifier Agent Summary, Superpowers Framework Summary

### Community 10 - "Orchestration Framework Evaluations"
Cohesion: 0.67
Nodes (3): GSD Framework, Orchestration Frameworks Evaluation, Raw Claude Code Agents

### Community 11 - "Reasoning & Loop Primitives"
Cohesion: 0.67
Nodes (3): Chain of Thought, Agent Loops, Tool Use

### Community 12 - "Karpathy LLM Wiki Sources"
Cohesion: 0.67
Nodes (3): Karpathy LLM Wiki Gist Summary, Karpathy LLM Wiki Video Summary, Nate Herk LLM Wiki Summary

### Community 13 - "LangGraph & Observability Tooling"
Cohesion: 1.0
Nodes (2): LangGraph Framework, LangSmith Observability

### Community 14 - "LLM Wiki Setup Recipes"
Cohesion: 1.0
Nodes (2): Karpathy-Style LLM KB Pattern, LLM Wiki Setup Recipe

### Community 15 - "Safety: Guardrails & Failure Modes"
Cohesion: 1.0
Nodes (2): Agent Failure Modes, Guardrails

### Community 16 - "Self-Critique & Constitutional AI"
Cohesion: 1.0
Nodes (2): Self-Critique, Constitutional AI

### Community 17 - "Security: OWASP & Review"
Cohesion: 1.0
Nodes (2): OWASP Top 10, Security Reviewer Agent Summary

### Community 18 - "Code & Architecture Review Agents"
Cohesion: 1.0
Nodes (2): Architect Agent Summary, Code Reviewer Agent Summary

### Community 19 - "Knowledge Graph & Raw Folder Workflow"
Cohesion: 1.0
Nodes (2): Karpathy Raw Folder Workflow, Graphify Skill Summary

### Community 20 - "Cluster: eval_autogen"
Cohesion: 1.0
Nodes (1): AutoGen Framework

### Community 21 - "Cluster: eval_crewai"
Cohesion: 1.0
Nodes (1): CrewAI Framework

### Community 22 - "Cluster: recipe_claude_code_hooks"
Cohesion: 1.0
Nodes (1): Claude Code Hooks Recipe

### Community 23 - "Cluster: recipe_agent_evaluation"
Cohesion: 1.0
Nodes (1): Agent Evaluation Harness Recipe

### Community 24 - "Cluster: recipe_mcp_server"
Cohesion: 1.0
Nodes (1): MCP Server Recipe

### Community 25 - "Cluster: concept_permission_modes"
Cohesion: 1.0
Nodes (1): Permission Modes

### Community 26 - "Cluster: concept_benchmark_design"
Cohesion: 1.0
Nodes (1): Benchmark Design

### Community 27 - "Cluster: concept_system_prompt_design"
Cohesion: 1.0
Nodes (1): System Prompt Design

### Community 28 - "Cluster: concept_few_shot_prompting"
Cohesion: 1.0
Nodes (1): Few-Shot Prompting

### Community 29 - "Cluster: entity_react_paradigm"
Cohesion: 1.0
Nodes (1): ReAct (Reason+Act) Paradigm

### Community 30 - "Cluster: entity_llm_as_judge"
Cohesion: 1.0
Nodes (1): Anthropic TypeScript SDK

### Community 31 - "Cluster: entity_mcp_protocol"
Cohesion: 1.0
Nodes (1): Model Context Protocol (MCP)

### Community 32 - "Cluster: entity_swe_bench"
Cohesion: 1.0
Nodes (1): SWE-bench

### Community 33 - "Cluster: entity_bypassPermissions"
Cohesion: 1.0
Nodes (1): bypassPermissions Mode

### Community 34 - "Cluster: rationale_gsd_wins_eval"
Cohesion: 1.0
Nodes (1): Rationale: GSD Wins Orchestration Eval

### Community 35 - "Cluster: rationale_bypass_safeguards"
Cohesion: 1.0
Nodes (1): Rationale: bypassPermissions Mandatory Safeguards

### Community 36 - "Cluster: rationale_compression_threshol"
Cohesion: 1.0
Nodes (1): Rationale: 75% Compression Trigger Threshold

### Community 37 - "Cluster: rationale_haiku_for_leaf_tasks"
Cohesion: 1.0
Nodes (1): Rationale: Use Haiku for Leaf Tasks

### Community 38 - "Cluster: rationale_atomic_tools_over_co"
Cohesion: 1.0
Nodes (1): Rationale: Prefer Atomic Tools Over Composed

### Community 39 - "Cluster: rationale_specific_critique_pr"
Cohesion: 1.0
Nodes (1): Rationale: Specific Critique Prompts Over Generic

### Community 40 - "Cluster: summary_gsd_codebase_mapper"
Cohesion: 1.0
Nodes (1): GSD Codebase Mapper Agent Summary

### Community 41 - "Cluster: summary_multi_agent_patterns"
Cohesion: 1.0
Nodes (1): Multi-Agent Patterns Skill Summary

### Community 42 - "Cluster: summary_gsd_debugger"
Cohesion: 1.0
Nodes (1): GSD Debugger Agent Summary

### Community 43 - "Cluster: lint_2026_04_06"
Cohesion: 1.0
Nodes (1): Wiki Lint Report 2026-04-06

### Community 44 - "Cluster: superpowers_framework"
Cohesion: 1.0
Nodes (1): Superpowers Framework

### Community 45 - "Cluster: numbered_pipeline_architecture"
Cohesion: 1.0
Nodes (1): Numbered Pipeline Architecture (01-07)

### Community 46 - "Cluster: rationale_trajectory_vs_outcom"
Cohesion: 1.0
Nodes (1): Rationale: Trajectory vs Outcome-Only Evaluation

### Community 47 - "Cluster: rationale_llm_judge_rubric"
Cohesion: 1.0
Nodes (1): Rationale: Rubric-Driven LLM Judge Design

### Community 48 - "Cluster: rationale_hitl_async_pattern"
Cohesion: 1.0
Nodes (1): Rationale: Async HITL over Synchronous Checkpoints

### Community 49 - "Cluster: rationale_write_and_return"
Cohesion: 1.0
Nodes (1): Rationale: Write-and-Return Pattern for Context Economy

### Community 50 - "Cluster: rationale_context_isolation"
Cohesion: 1.0
Nodes (1): Rationale: Context Isolation as Primary Multi-Agent Benefit

### Community 51 - "Cluster: rationale_deviation_rules"
Cohesion: 1.0
Nodes (1): Rationale: Deviation Rules for Autonomous Execution

### Community 52 - "Cluster: rationale_goal_backward_verifi"
Cohesion: 1.0
Nodes (1): Rationale: Goal-Backward Verification Over Task Completion

### Community 53 - "Cluster: rationale_cot_when_to_use"
Cohesion: 1.0
Nodes (1): Rationale: When CoT Helps vs Hurts

### Community 54 - "Cluster: rationale_wiki_vs_rag"
Cohesion: 1.0
Nodes (1): Rationale: LLM Wiki vs RAG Tradeoffs

### Community 55 - "Cluster: rationale_tdd_iron_laws"
Cohesion: 1.0
Nodes (1): Rationale: Iron Laws for High-Stakes Feature Development

### Community 56 - "Cluster: rationale_opus_for_architectur"
Cohesion: 1.0
Nodes (1): Rationale: Opus Model Selection for Architecture Decisions

## Knowledge Gaps
- **97 isolated node(s):** `Wiki Operation Log`, `Principle of Least Privilege`, `Blast Radius`, `XML Section Architecture (GSD Agents)`, `bypassPermissions + Worktree Combination` (+92 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `LangGraph & Observability Tooling`** (2 nodes): `LangGraph Framework`, `LangSmith Observability`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `LLM Wiki Setup Recipes`** (2 nodes): `Karpathy-Style LLM KB Pattern`, `LLM Wiki Setup Recipe`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Safety: Guardrails & Failure Modes`** (2 nodes): `Agent Failure Modes`, `Guardrails`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Self-Critique & Constitutional AI`** (2 nodes): `Self-Critique`, `Constitutional AI`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Security: OWASP & Review`** (2 nodes): `OWASP Top 10`, `Security Reviewer Agent Summary`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Code & Architecture Review Agents`** (2 nodes): `Architect Agent Summary`, `Code Reviewer Agent Summary`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Knowledge Graph & Raw Folder Workflow`** (2 nodes): `Karpathy Raw Folder Workflow`, `Graphify Skill Summary`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: eval_autogen`** (1 nodes): `AutoGen Framework`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: eval_crewai`** (1 nodes): `CrewAI Framework`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: recipe_claude_code_hooks`** (1 nodes): `Claude Code Hooks Recipe`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: recipe_agent_evaluation`** (1 nodes): `Agent Evaluation Harness Recipe`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: recipe_mcp_server`** (1 nodes): `MCP Server Recipe`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: concept_permission_modes`** (1 nodes): `Permission Modes`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: concept_benchmark_design`** (1 nodes): `Benchmark Design`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: concept_system_prompt_design`** (1 nodes): `System Prompt Design`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: concept_few_shot_prompting`** (1 nodes): `Few-Shot Prompting`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: entity_react_paradigm`** (1 nodes): `ReAct (Reason+Act) Paradigm`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: entity_llm_as_judge`** (1 nodes): `Anthropic TypeScript SDK`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: entity_mcp_protocol`** (1 nodes): `Model Context Protocol (MCP)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: entity_swe_bench`** (1 nodes): `SWE-bench`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: entity_bypassPermissions`** (1 nodes): `bypassPermissions Mode`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: rationale_gsd_wins_eval`** (1 nodes): `Rationale: GSD Wins Orchestration Eval`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: rationale_bypass_safeguards`** (1 nodes): `Rationale: bypassPermissions Mandatory Safeguards`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: rationale_compression_threshol`** (1 nodes): `Rationale: 75% Compression Trigger Threshold`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: rationale_haiku_for_leaf_tasks`** (1 nodes): `Rationale: Use Haiku for Leaf Tasks`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: rationale_atomic_tools_over_co`** (1 nodes): `Rationale: Prefer Atomic Tools Over Composed`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: rationale_specific_critique_pr`** (1 nodes): `Rationale: Specific Critique Prompts Over Generic`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: summary_gsd_codebase_mapper`** (1 nodes): `GSD Codebase Mapper Agent Summary`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: summary_multi_agent_patterns`** (1 nodes): `Multi-Agent Patterns Skill Summary`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: summary_gsd_debugger`** (1 nodes): `GSD Debugger Agent Summary`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: lint_2026_04_06`** (1 nodes): `Wiki Lint Report 2026-04-06`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: superpowers_framework`** (1 nodes): `Superpowers Framework`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: numbered_pipeline_architecture`** (1 nodes): `Numbered Pipeline Architecture (01-07)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: rationale_trajectory_vs_outcom`** (1 nodes): `Rationale: Trajectory vs Outcome-Only Evaluation`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: rationale_llm_judge_rubric`** (1 nodes): `Rationale: Rubric-Driven LLM Judge Design`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: rationale_hitl_async_pattern`** (1 nodes): `Rationale: Async HITL over Synchronous Checkpoints`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: rationale_write_and_return`** (1 nodes): `Rationale: Write-and-Return Pattern for Context Economy`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: rationale_context_isolation`** (1 nodes): `Rationale: Context Isolation as Primary Multi-Agent Benefit`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: rationale_deviation_rules`** (1 nodes): `Rationale: Deviation Rules for Autonomous Execution`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: rationale_goal_backward_verifi`** (1 nodes): `Rationale: Goal-Backward Verification Over Task Completion`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: rationale_cot_when_to_use`** (1 nodes): `Rationale: When CoT Helps vs Hurts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: rationale_wiki_vs_rag`** (1 nodes): `Rationale: LLM Wiki vs RAG Tradeoffs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: rationale_tdd_iron_laws`** (1 nodes): `Rationale: Iron Laws for High-Stakes Feature Development`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cluster: rationale_opus_for_architectur`** (1 nodes): `Rationale: Opus Model Selection for Architecture Decisions`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Hot Cache (wiki/hot.md)` connect `Memory Systems & Tool Safety Patterns` to `LLM Models & Third-Party Frameworks`, `Multi-Agent Patterns & Orchestration`, `Framework Philosophy & Design Decisions`, `GSD Execution Architecture`?**
  _High betweenness centrality (0.159) - this node is a cross-community bridge._
- **Why does `Model Tiering Strategy` connect `LLM Models & Third-Party Frameworks` to `Karpathy KB, MCP & Anthropic Ecosystem`, `Memory Systems & Tool Safety Patterns`, `GSD Execution Architecture`?**
  _High betweenness centrality (0.131) - this node is a cross-community bridge._
- **Why does `Jay West — Agent Stack` connect `Karpathy KB, MCP & Anthropic Ecosystem` to `LLM Models & Third-Party Frameworks`, `GSD/Superpowers/BMAD Operations`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `GSD — Get Shit Done` (e.g. with `LangGraph` and `CrewAI`) actually correct?**
  _`GSD — Get Shit Done` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Wiki Operation Log`, `Principle of Least Privilege`, `Blast Radius` to the rest of the system?**
  _97 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `LLM Models & Third-Party Frameworks` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
- **Should `GSD/Superpowers/BMAD Operations` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._