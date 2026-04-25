     1|---
     2|id: 01KNNVX2QYZ13N5YEFATS7BW3D
     3|title: "Database Review Pattern"
     4|type: pattern
     5|tags: [agents, tools, patterns, workflow]
     6|created: 2025-01-01
     7|stale_after_days: 730
updated: 2025-01-01
     8|visibility: public
     9|confidence: high
    10|related: [pattern-code-generation-agent, pattern-architecture-first, concepts/agent-sandboxing]
    11|---
    12|
    13|# Database Review Pattern
    14|
    15|A structured review approach for database schemas, queries, indexes, and migrations — implemented as a specialist agent persona scoped to one or more database engines.
    16|
    17|## When to Use
    18|
    19|- Before merging schema migrations into production
    20|- When diagnosing slow queries or lock contention
    21|- During architecture reviews of new data models
    22|- When auditing index health on write-heavy tables
    23|- Before a large backfill or table-altering migration on production-size data
    24|
    25|## Structure
    26|
    27|The agent is given a focused scope (schema, query plan, migration script, or index audit) and returns a structured report covering:
    28|
    29|1. **Schema Issues** — normalization level, data type choices, missing constraints, JSONB vs. normalized column decisions
    30|2. **Query Performance** — EXPLAIN ANALYZE output interpretation, slow query identification via `pg_stat_statements`, sargability of WHERE clauses
    31|3. **Index Recommendations** — coverage of foreign keys, composite index column ordering (most selective first), partial indexes, identification of unused indexes
    32|4. **Migration Safety** — reversibility, safe NOT NULL column addition workflow, concurrent index creation, lock duration risks
    33|
    34|## Example
    35|
    36|Input: A pull request diff containing a new migration file and an ORM query.
    37|
    38|Output:
    39|```
    40|## Database Review: user_events migration + EventRepository.find_by_user
    41|
    42|### Schema Issues
    43|- `payload` column typed TEXT → use JSONB for Postgres querying and indexing capabilities
    44|- `user_id` FK has no index → add before merge
    45|
    46|### Query Performance
    47|| Query | Issue | Optimization |
    48||---|---|---|
    49|| WHERE YEAR(created_at) = 2024 | Non-sargable, disables index | WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01' |
    50|
    51|### Index Recommendations
    52|```sql
    53|CREATE INDEX CONCURRENTLY idx_user_events_user_id ON user_events(user_id);
    54|```
    55|
    56|### Migration Safety
    57|- Adding NOT NULL `status` column without default → add nullable first, backfill, then add constraint in separate migration
    58|
    59|### Overall Assessment
    60|NEEDS IMPROVEMENT
    61|```
    62|
    63|## Anti-Patterns This Pattern Catches
    64|
    65|| Anti-Pattern | Why It Hurts | Fix |
    66||---|---|---|
    67|| N+1 queries | Multiplicative DB round-trips | Fetch with JOINs or batch load |
    68|| `SELECT *` | Over-fetches columns, breaks on schema change | Enumerate columns explicitly |
    69|| Non-sargable WHERE | Index cannot be used | Rewrite to range or equality predicates |
    70|| Missing pagination | Full table scans at scale | Add `LIMIT/OFFSET` or cursor-based pagination |
    71|| Implicit type coercions | Prevents index use, silent correctness bugs | Ensure types match explicitly |
    72|| Wide transactions | Holds locks, increases contention | Minimize work inside transaction boundaries |
    73|| Immediate column drops | Breaks deployed code reading old schema | Deprecate → deploy → drop in next release |
    74|
    75|## Migration Safety Workflow
    76|
    77|For adding a NOT NULL column to a live table:
    78|
    79|```sql
    80|-- Step 1: Add nullable (no lock on large tables)
    81|ALTER TABLE orders ADD COLUMN status TEXT;
    82|
    83|-- Step 2: Backfill in batches
    84|UPDATE orders SET status = 'pending' WHERE status IS NULL;
    85|
    86|-- Step 3: Add constraint (may lock briefly; use NOT VALID + VALIDATE for Postgres)
    87|ALTER TABLE orders ALTER COLUMN status SET NOT NULL;
    88|```
    89|
    90|For large indexes:
    91|```sql
    92|-- Non-blocking in PostgreSQL
    93|CREATE INDEX CONCURRENTLY idx_orders_status ON orders(status);
    94|```
    95|
    96|## Trade-offs
    97|
    98|**Pros:**
    99|- Catches a class of expensive production incidents before they ship
   100|- Enforces consistent schema conventions across teams
   101|- Surfaces migration sequencing risks (lock escalation, backfill timing)
   102|
   103|**Cons:**
   104|- Requires access to schema and ideally EXPLAIN output — read-only DB access needed in CI or sandbox
   105|- Rules are engine-specific (Postgres JSONB, `CREATE INDEX CONCURRENTLY` not universal)
   106|- Can generate false positives on intentionally denormalized analytical tables
   107|
   108|## Related Patterns
   109|
   110|- [Architecture First Pattern](pattern-architecture-first.md) — review data model before implementation
   111|- [Code Generation Agent Pattern](pattern-code-generation-agent.md) — pair with query/migration generation
   112|- [Confirm Before Destructive Pattern](pattern-confirm-before-destructive.md) — gate destructive migrations behind human approval
   113|- [Adversarial Plan Review Pattern](pattern-adversarial-plan-review.md) — apply same structured critique approach to migration plans
   114|
   115|## See Also
   116|
   117|- [Tool Use](../concepts/tool-use.md) — agent may run `EXPLAIN ANALYZE` directly via DB tool
   118|- [Human in the Loop](../concepts/human-in-the-loop.md) — migration safety gates before production deployment
   119|- [Agent Sandboxing](../concepts/agent-sandboxing.md) — isolate DB review agent to read-only credentials
   120|