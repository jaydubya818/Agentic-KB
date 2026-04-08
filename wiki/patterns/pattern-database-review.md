---
id: 01KNNVX2QYZ13N5YEFATS7BW3D
title: "Database Review Pattern"
type: pattern
tags: [agents, tools, patterns, workflow]
created: 2025-01-01
updated: 2025-01-01
visibility: public
confidence: high
related: [pattern-code-generation-agent, pattern-architecture-first, concepts/agent-sandboxing]
---

# Database Review Pattern

A structured review approach for database schemas, queries, indexes, and migrations — implemented as a specialist agent persona scoped to one or more database engines.

## When to Use

- Before merging schema migrations into production
- When diagnosing slow queries or lock contention
- During architecture reviews of new data models
- When auditing index health on write-heavy tables
- Before a large backfill or table-altering migration on production-size data

## Structure

The agent is given a focused scope (schema, query plan, migration script, or index audit) and returns a structured report covering:

1. **Schema Issues** — normalization level, data type choices, missing constraints, JSONB vs. normalized column decisions
2. **Query Performance** — EXPLAIN ANALYZE output interpretation, slow query identification via `pg_stat_statements`, sargability of WHERE clauses
3. **Index Recommendations** — coverage of foreign keys, composite index column ordering (most selective first), partial indexes, identification of unused indexes
4. **Migration Safety** — reversibility, safe NOT NULL column addition workflow, concurrent index creation, lock duration risks

## Example

Input: A pull request diff containing a new migration file and an ORM query.

Output:
```
## Database Review: user_events migration + EventRepository.find_by_user

### Schema Issues
- `payload` column typed TEXT → use JSONB for Postgres querying and indexing capabilities
- `user_id` FK has no index → add before merge

### Query Performance
| Query | Issue | Optimization |
|---|---|---|
| WHERE YEAR(created_at) = 2024 | Non-sargable, disables index | WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01' |

### Index Recommendations
```sql
CREATE INDEX CONCURRENTLY idx_user_events_user_id ON user_events(user_id);
```

### Migration Safety
- Adding NOT NULL `status` column without default → add nullable first, backfill, then add constraint in separate migration

### Overall Assessment
NEEDS IMPROVEMENT
```

## Anti-Patterns This Pattern Catches

| Anti-Pattern | Why It Hurts | Fix |
|---|---|---|
| N+1 queries | Multiplicative DB round-trips | Fetch with JOINs or batch load |
| `SELECT *` | Over-fetches columns, breaks on schema change | Enumerate columns explicitly |
| Non-sargable WHERE | Index cannot be used | Rewrite to range or equality predicates |
| Missing pagination | Full table scans at scale | Add `LIMIT/OFFSET` or cursor-based pagination |
| Implicit type coercions | Prevents index use, silent correctness bugs | Ensure types match explicitly |
| Wide transactions | Holds locks, increases contention | Minimize work inside transaction boundaries |
| Immediate column drops | Breaks deployed code reading old schema | Deprecate → deploy → drop in next release |

## Migration Safety Workflow

For adding a NOT NULL column to a live table:

```sql
-- Step 1: Add nullable (no lock on large tables)
ALTER TABLE orders ADD COLUMN status TEXT;

-- Step 2: Backfill in batches
UPDATE orders SET status = 'pending' WHERE status IS NULL;

-- Step 3: Add constraint (may lock briefly; use NOT VALID + VALIDATE for Postgres)
ALTER TABLE orders ALTER COLUMN status SET NOT NULL;
```

For large indexes:
```sql
-- Non-blocking in PostgreSQL
CREATE INDEX CONCURRENTLY idx_orders_status ON orders(status);
```

## Trade-offs

**Pros:**
- Catches a class of expensive production incidents before they ship
- Enforces consistent schema conventions across teams
- Surfaces migration sequencing risks (lock escalation, backfill timing)

**Cons:**
- Requires access to schema and ideally EXPLAIN output — read-only DB access needed in CI or sandbox
- Rules are engine-specific (Postgres JSONB, `CREATE INDEX CONCURRENTLY` not universal)
- Can generate false positives on intentionally denormalized analytical tables

## Related Patterns

- [Architecture First Pattern](pattern-architecture-first.md) — review data model before implementation
- [Code Generation Agent Pattern](pattern-code-generation-agent.md) — pair with query/migration generation
- [Confirm Before Destructive Pattern](pattern-confirm-before-destructive.md) — gate destructive migrations behind human approval
- [Adversarial Plan Review Pattern](pattern-adversarial-plan-review.md) — apply same structured critique approach to migration plans

## See Also

- [Tool Use](../concepts/tool-use.md) — agent may run `EXPLAIN ANALYZE` directly via DB tool
- [Human in the Loop](../concepts/human-in-the-loop.md) — migration safety gates before production deployment
- [Agent Sandboxing](../concepts/agent-sandboxing.md) — isolate DB review agent to read-only credentials
