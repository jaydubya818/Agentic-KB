---
id: 01KQ2Z5TP8R80Z3N85KSD2001X
title: "MySQL / InnoDB Best Practices"
type: concept
tags: [architecture, workflow, deployment, enterprise]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
source: my-skills/mysql-skill.md
---

# MySQL / InnoDB Best Practices

A reference for making safe, measurable changes to MySQL/InnoDB databases — covering schema design, indexing, partitioning, query optimization, and transactions.

---

## Definition

MySQL/InnoDB best practices are a set of opinionated, evidence-backed guidelines for designing schemas, writing queries, and operating MySQL databases in production OLTP environments. They prioritize correctness, measurability, and reversibility over premature optimization.

---

## Workflow

Every change should follow this sequence:

1. **Define workload and constraints** — read/write mix, latency target, data volume, MySQL version, hosting platform.
2. **Read only relevant reference material** for the specific area being changed.
3. **Propose the smallest change** that solves the problem, including trade-offs.
4. **Validate with evidence** — `EXPLAIN`, `EXPLAIN ANALYZE`, lock/connection metrics, production-safe rollout steps.
5. **For production changes** — include rollback plan and post-deploy verification steps.

---

## Schema Design

- Prefer **narrow, monotonic PKs** (`BIGINT UNSIGNED AUTO_INCREMENT`) for write-heavy OLTP tables.
- Avoid **random UUIDs as clustered PKs** — if external IDs are required, store the UUID in a secondary unique column.
- Always use **`utf8mb4` / `utf8mb4_0900_ai_ci`** for character encoding.
- Prefer `NOT NULL` and `DATETIME` over `TIMESTAMP`.
- Use **lookup tables over `ENUM`**. Normalize to 3NF; denormalize only for measured hot paths.

---

## Indexing

- **Composite index column order**: equality predicates first, then range/sort columns (leftmost prefix rule).
- Range predicates **stop index usage** for all subsequent columns.
- Secondary indexes include the PK implicitly — avoid redundant PK columns in composite indexes.
- Use **prefix indexes** for long string columns.
- **Audit unused indexes** via `performance_schema` — drop indexes with `count_read = 0`.

---

## Partitioning

- Partition time-series tables (>50M rows) or very large tables (>100M rows).
- **Plan partitioning early** — retrofitting requires a full table rebuild.
- Include the partition column in every unique constraint and PK.
- Always add a `MAXVALUE` catch-all partition.

---

## Query Optimization

- Use `EXPLAIN` to identify red flags: `type: ALL` (full table scan), `Using filesort`, `Using temporary`.
- Use **cursor pagination** instead of `OFFSET` for deep pagination.
- Avoid **functions on indexed columns** in `WHERE` clauses — they prevent index use.
- Use **batch inserts** of 500–5,000 rows.
- Prefer `UNION ALL` over `UNION` when deduplication is unnecessary.

---

## Transactions & Locking

- Default isolation: **`REPEATABLE READ`** (includes gap locks). Switch to `READ COMMITTED` under high contention.
- Access rows in a **consistent order** across transactions to prevent deadlocks.
- Retry on deadlock error **1213** with exponential backoff.
- Perform **I/O outside transactions** to minimize lock hold time.
- Use `SELECT ... FOR UPDATE` **sparingly**.

---

## Why It Matters

MySQL is widely used in OLTP production environments where schema changes, bad indexes, or inefficient queries can cause cascading failures — slow queries, lock contention, replication lag, or full outages. Applying these practices systematically reduces operational risk and makes performance problems diagnosable rather than mysterious.

---

## Example

A write-heavy orders table:

```sql
CREATE TABLE orders (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  uuid       CHAR(36) NOT NULL,
  user_id    BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_uuid (uuid),
  KEY idx_orders_user_created (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

- Monotonic `BIGINT` PK for clustered index write performance.
- UUID stored as a secondary unique column, not the PK.
- Composite index `(user_id, created_at)` supports equality on `user_id` + range on `created_at`.

---

## See Also

- [Agent Observability](../concepts/agent-observability.md) — for monitoring query metrics in agent-driven data pipelines
- [Cost Optimization](../concepts/cost-optimization.md) — database efficiency directly impacts infrastructure cost
- [Context Management](../concepts/context-management.md) — relevant when agents carry schema context across long sessions
