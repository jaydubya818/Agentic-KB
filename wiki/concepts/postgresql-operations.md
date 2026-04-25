---
id: 01KQ2Z73CHM4T7XS9G3YPW7W4C
title: "PostgreSQL Operations Reference"
type: concept
tags: [architecture, deployment, workflow]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
source: my-skills/postgres-skill.md
---

# PostgreSQL Operations Reference

A structured reference map for PostgreSQL best practices, covering schema design, indexing, query optimization, MVCC, WAL, replication, and operational architecture. Based on the PlanetScale Postgres skill definition.

## Definition

PostgreSQL is a powerful open-source relational database. Operating it well requires understanding several layered concerns: schema design, index strategy, query patterns, memory and process architecture, write-ahead logging (WAL), and replication.

## Why It Matters

Poor Postgres configuration or query patterns are a leading cause of application performance degradation. Understanding the internals — MVCC, vacuum, WAL checkpoints — allows engineers to diagnose and fix issues that surface monitoring alone cannot explain.

## Core Topic Areas

### Schema & Indexing
- **Schema Design**: Tables, primary keys, data types, foreign keys
- **Indexing**: Index types, composite indexes, performance implications
- **Index Optimization**: Unused/duplicate index queries, index audit procedures
- **Partitioning**: Large tables, time-series data, data retention strategies

### Query & Performance
- **Query Patterns**: SQL anti-patterns, JOINs, pagination, batch queries
- **Optimization Checklist**: Pre-optimization audit, cleanup, readiness checks
- **MVCC and VACUUM**: Dead tuples, long transactions, XID wraparound prevention

### Operations & Architecture
- **Process Architecture**: Multi-process model, connection pooling, auxiliary processes
- **Memory Architecture**: Shared/private memory layout, OS page cache, OOM prevention
- **MVCC Transactions**: Isolation levels, XID wraparound, serialization errors
- **WAL and Checkpoints**: WAL internals, checkpoint tuning, durability, crash recovery
- **Replication**: Streaming replication, slots, sync commit, failover

## Example

A common operational failure: a long-running transaction prevents VACUUM from reclaiming dead tuples, leading to table bloat and eventually XID wraparound — a hard limit that forces Postgres into read-only mode. Understanding MVCC and VACUUM prevents this class of outage.

## Common Pitfalls

- Over-indexing: too many indexes slow down writes without improving reads
- Missing `VACUUM` / `AUTOVACUUM` tuning on high-write tables
- Using `OFFSET` for pagination on large tables (use keyset pagination instead)
- Ignoring connection pooling — Postgres forks a process per connection
- Not monitoring replication lag on standbys

## See Also

- [Cost Optimization](../concepts/cost-optimization.md)
- [Agent Observability](../concepts/agent-observability.md)
