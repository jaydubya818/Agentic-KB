---
title: Metadata Filtering
type: concept
tags: [rag-systems, memory, safety, multi-agent, context-management, agentic]
confidence: high
sources:
  - "[[summaries/siagian-agentic-engineer-roadmap-2026]]"
  - "[[summaries/langchain-deepagents-production]]"
created: 2026-05-16
updated: 2026-05-16
related:
  - "[[concepts/rag-systems]]"
  - "[[concepts/hybrid-retrieval]]"
  - "[[concepts/multi-tenancy]]"
  - "[[concepts/guardrails]]"
status: stable
reviewed: false
reviewed_date: ""
---

# Metadata Filtering

Filter retrieved documents by metadata — tenant, permission level, document type, date, language — in the retrieval layer, before documents enter the model context. Filtering post-retrieval is a security and correctness failure, not a valid alternative.

## Definition

Metadata filtering is the practice of applying structured predicate conditions to a vector store or search index query that restrict which documents are candidates for retrieval. The filter runs as part of the retrieval query — it is not a post-processing step.

## How It Works

Every chunk in the vector store has a metadata payload attached at index time:

```json
{
  "chunk_id": "doc_42_chunk_3",
  "content": "...",
  "metadata": {
    "tenant_id": "acme-corp",
    "permission_level": "internal",
    "doc_type": "policy",
    "language": "en",
    "created_date": "2025-11-01",
    "author_role": "legal"
  }
}
```

At query time, the retriever applies filter predicates before ANN search:

```python
# Weaviate example
results = collection.query.near_text(
    query=user_query,
    filters=wvc.query.Filter.by_property("tenant_id").equal(current_user.tenant_id)
    & wvc.query.Filter.by_property("permission_level").contains_any(
        user_permission_labels(current_user)
    ),
    limit=10
)

# Qdrant example
results = client.search(
    collection_name="docs",
    query_vector=embed(user_query),
    query_filter=models.Filter(
        must=[
            models.FieldCondition(key="tenant_id", match=models.MatchValue(value=tenant_id)),
            models.FieldCondition(key="permission_level", match=models.MatchAny(any=allowed_levels)),
        ]
    ),
    limit=10
)
```

The filter is applied as part of the HNSW/ANN index traversal — documents that don't match are never scored or returned. They do not enter the model context.

## The Security Requirement

**Trusting the model to ignore out-of-scope documents is unreliable.** This is not a theoretical concern — it is a documented failure mode. A model given documents tagged for another tenant and instructed "ignore anything not tagged for user X" will occasionally reference those documents, especially when the topic is relevant and the model's instruction-following is imperfect.

The failure mode is particularly dangerous in:
- Multi-tenant SaaS: documents from tenant A must never appear in tenant B's responses
- Permission-gated knowledge bases: confidential documents must not leak to users without appropriate clearance
- Regulated industries: HIPAA, SOC2, GDPR compliance may require provable data isolation at the retrieval layer

**The filter must run before documents reach the model context, always.** This is a hard architectural requirement, not a recommendation.

## Enterprise Requirements

**Multi-tenant RAG:** Filter by `tenant_id` at retrieval time. Every user's session carries a `tenant_id` claim (from JWT or session context) that is injected into every retrieval call. The filter is not optional and is not user-configurable.

```python
def retrieve(query: str, user: AuthenticatedUser, k: int = 10):
    # tenant_id comes from auth, not from the query
    return vector_store.search(
        query=query,
        filters={"tenant_id": user.tenant_id},
        k=k
    )
```

**Permission-based filtering:** Map user roles to allowed document permission levels. A standard tier is: `public` → `internal` → `confidential` → `restricted`. A user with `internal` clearance may retrieve `public` and `internal` documents; `confidential` requires explicit grant.

```python
PERMISSION_HIERARCHY = {
    "viewer": ["public"],
    "employee": ["public", "internal"],
    "manager": ["public", "internal", "confidential"],
    "admin": ["public", "internal", "confidential", "restricted"]
}

def allowed_levels(user: AuthenticatedUser) -> list[str]:
    return PERMISSION_HIERARCHY[user.role]
```

**Date-range filtering:** For time-sensitive knowledge bases (regulatory filings, policy documents), filter by `created_date` or `effective_date` to prevent outdated documents from being cited.

## Key Variants

**Pre-retrieval filtering (correct):** Filter predicates are part of the vector store query. Documents that don't match are never scored. This is the only acceptable approach for security-critical filtering.

**Post-retrieval filtering (wrong):** Retrieve k documents, then filter the result set for documents matching the predicate. Documents that don't match are discarded, but they were scored and temporarily available. In most implementations, they also consumed retrieval compute budget — reducing the effective k for valid documents.

**LLM-instructed filtering (wrong):** Pass out-of-scope documents to the model with an instruction to ignore them. The model is not a reliable filter. Do not use for any security or compliance-relevant scenario.

## Failure Modes

**Filtering post-retrieval:** The most common implementation error. Documents enter the retrieval candidate set and are scored — even if they're discarded before being returned, their presence may cause incorrect ANN traversal in approximate indexes. In streaming systems, they may briefly enter a processing buffer.

**Letting the model filter:** "Ignore any docs tagged X" is an instruction, not a filter. Models follow instructions imperfectly. This is never acceptable for multi-tenant isolation or permission enforcement.

**Not indexing metadata → can't filter:** If metadata fields are not indexed at write time, the vector store cannot apply predicates efficiently. Some stores fall back to full-scan filtering (slow) or reject the query (error). Index every metadata field you plan to filter on — at write time, not at query time.

**Over-filtering:** A filter that is too restrictive returns zero results, and the model generates from an empty context. Implement empty-result handling: return "No documents found matching your access level and query" rather than letting the model hallucinate from an empty context.

## Counter-arguments & Gaps

Metadata filtering adds operational burden: metadata must be defined, indexed, and maintained for every document. Schema changes require re-indexing (or dual-write during migration). For small, single-tenant knowledge bases, this overhead may be unjustified — a simpler permission check at the application layer (before the RAG call) may suffice.

Metadata filtering does not guarantee retrieval correctness — a document with the right metadata tags may still be irrelevant to the query. Filtering is a necessary condition for security, not a sufficient condition for relevance.

## Related Concepts

- [[concepts/rag-systems]] — RAG pipeline; metadata filtering is applied in the retrieval stage
- [[concepts/hybrid-retrieval]] — hybrid retrieval applies metadata filters before running BM25 and vector search
- [[concepts/multi-tenancy]] — tenant isolation is the primary enterprise driver for metadata filtering
- [[concepts/guardrails]] — metadata filtering as a retrieval-layer guardrail
