---
title: "My Project - Agentic Software Factory business"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p6759
captured_at: 2026-07-31T18:46:55.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: c1f87145c65b13f0d3d779d3cf6bcf420b6b6d35b18a60dd02ae00c857e53f5e
---

My Project - Agentic Software Factory business 


Most importnat - everyone will be responsible for managing a fleet of agents

Developers during busisss hours now plan, review implantation paln, review code changes and approve PR for merge, and agetn do the execution during the day and at night so the next morning the developer can review code changes and approve PR for merge, 



an operator can see what needs attention, make a governed decision, dispatch work, and inspect proof.


	- every developer will work on multiple epics at once
	- every developer will run long running tasks in the cloud and on their local using local llm inference and frontier lab models

	- show when to use fronteir lab models for planning and executions
		example: Fable for planning, composer for executing tasks, opus for reviewing coding tasks, local model for QA and autoamtion, and doc writing. And cloud agetns for long running tasks over the weekend or nights (using different model based on complexity) 

AI Software Factory - Agentic Software Development Harness Business 

Local model (open weights) & Foundational models 

RAG & Graphs 




Loop (Iteration): A single agent runs experiments within an executable harness (e.g., Karpathy’s autoresearch), using a "ratchet" mechanism to retain only metric-improving changes.
Swarm (Parallelism): Agents operate concurrently, using frameworks like Anthropic’s Dynamic Workflows to spawn parallel sub-agents for specialized tasks.
Graph (Persistence): Knowledge graphs and Directed Acyclic Graphs (DAGs) externalize shared memory, experiment lineage, and provenance, allowing systems to scale without relying solely on transcript context.


￼


￼
———

My Notes:

a developer who builds AI systems and automation pipelines that turn technology into real income.

https://x.com/Sprytixl/status/2078778799064584535?s=20

LLM knows words. Knowledge graph knows relationships. The most powerful AI systems appear when both work together.

Step 6  |  Store in graph database
        |  Neo4j, Amazon Neptune, PostgreSQL with graph extension

The graph doesn't just store facts. It stores how facts connect to each other. That's what makes complex reasoning possible.
The full Graph Engineering pipeline

Step 1  |  Collect raw documents
        |  PDFs, emails, reports, database exports

Step 2  |  Extract entities
        |  people, companies, products, events, concepts

Step 3  |  Extract relationships
        |  who did what to whom, when, why, how

Step 4  |  Build schema
        |  define entity types and relationship types

Step 5  |  Deduplicate and normalize
        |  "Microsoft Corp" and "MSFT" are the same entity

Step 6  |  Store in graph database
        |  Neo4j, Amazon Neptune, PostgreSQL with graph extension

Step 7  |  Build retrieval layer
        |  local search for specific entities
        |  global search for patterns across entire graph

Step 8  |  Connect model
        |  Claude queries graph via MCP or direct API

Step 9  |  Update continuously
        |  new documents expand the graph
        |  contradictions get flagged for review

——

The five prompts that run the entire pipeline
Graph Engineering doesn't eliminate prompts. It uses them at each specific stage of the graph pipeline.
Prompt 1 - Extraction

Extract all organizations, people, products and events.

For each entity return:
- canonical_name
- type
- description
- source

For each relationship return:
- source_entity
- relation_type
- target_entity
- evidence
- confidence_score
Prompt 2 - Normalization

Compare the following entities.
Determine whether they refer to:
- the same entity
- related but different entities
- unrelated entities

Return canonical name and explanation.
Do not merge entities without clear evidence.
Prompt 3 - Graph query

Translate the user question into a Cypher query.
Use only relationships present in the schema.
Do not invent labels or properties.
Return the query and a short explanation of the logic.
Prompt 4 - Grounded answer

Answer using only the retrieved graph paths.
For every conclusion:
- identify the supporting nodes
- identify the relationship path
- state uncertainty clearly
- do not infer causation from correlation
Prompt 5 - Graph maintenance

Compare new facts with the existing graph.
Classify each fact as:
- new
- duplicate
- contradiction
- update
- uncertain

Do not overwrite existing facts without evidence.
As Microsoft's GraphRAG documentation shows - prompts handle extraction, relationship identification, summarization and community report generation internally. Prompt engineering is the mechanism inside graph engineering, not its competitor.
———————————

ndividual agent loops to collaborative, graph-grounded multi-agent systems.Architectural Evolution

The transition is categorized into three key shifts:
Loop (Iteration): A single agent runs experiments within an executable harness (e.g., Karpathy’s autoresearch), using a "ratchet" mechanism to retain only metric-improving changes.
Swarm (Parallelism): Agents operate concurrently, using frameworks like Anthropic’s Dynamic Workflows to spawn parallel sub-agents for specialized tasks.
