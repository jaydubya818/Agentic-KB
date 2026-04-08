---
id: 01KNNVX2R1VATMDNHZZH1EC2QR
title: Pipeline
type: pattern
category: orchestration
problem: A task has sequential stages with validated handoffs between them
solution: Chain agents where each receives validated output from the previous stage
tradeoffs:
  - "Clear stage boundaries vs brittle handoffs if schemas change"
  - "Easy debugging (failure localized to one stage) vs no parallelism"
  - "Schema validation catches errors early vs validation adds latency"
tags: [orchestration, pipeline, sequential, validation, handoff]
confidence: high
sources:
  - "Anthropic: Building Effective Agents (2024)"
  - "ETL pipeline patterns"
created: 2026-04-04
updated: 2026-04-04
---

## Problem

A task has sequential, dependent stages where each stage needs the validated output of the previous one before it can proceed. Running these in a single agent context causes context bloat, makes failure attribution hard, and prevents independent optimization of each stage. But splitting them naively leads to unvalidated handoffs where a corrupt output from stage N propagates silently through N+1, N+2, etc.

---

## Solution

Chain agents in a pipeline: Stage 1 → validate → Stage 2 → validate → Stage 3. Each stage is a focused agent with its own system prompt and tools. Handoffs are schema-validated. On validation failure, the pipeline halts at the failing stage (not the final stage) and the error is specific and actionable.

```
Input → [Stage 1] → Schema Validate → [Stage 2] → Schema Validate → [Stage 3] → Output
          ↓ on fail                     ↓ on fail
         Halt + Error                  Halt + Error
```

---

## Implementation Sketch

```python
from pydantic import BaseModel, ValidationError
from typing import TypeVar, Type

T = TypeVar("T", bound=BaseModel)

@dataclass
class PipelineStage:
    name: str
    system_prompt: str
    tools: list[str]
    model: str
    input_schema: Type[BaseModel]
    output_schema: Type[BaseModel]
    timeout_seconds: int = 120

class Pipeline:
    def __init__(self, stages: list[PipelineStage]):
        self.stages = stages

    async def run(self, initial_input: BaseModel) -> BaseModel:
        current_input = initial_input

        for i, stage in enumerate(self.stages):
            # Validate input to this stage
            try:
                validated_input = stage.input_schema.model_validate(current_input.model_dump())
            except ValidationError as e:
                raise PipelineInputError(
                    stage=stage.name,
                    stage_index=i,
                    validation_error=e,
                    raw_input=current_input,
                )

            # Execute stage
            raw_output = await self.execute_stage(stage, validated_input)

            # Validate output from this stage
            try:
                validated_output = stage.output_schema.model_validate(raw_output)
            except ValidationError as e:
                raise PipelineOutputError(
                    stage=stage.name,
                    stage_index=i,
                    validation_error=e,
                    raw_output=raw_output,
                )

            # Log the validated handoff
            log_handoff(
                from_stage=stage.name,
                to_stage=self.stages[i+1].name if i+1 < len(self.stages) else "output",
                input_hash=hash_data(validated_input),
                output_hash=hash_data(validated_output),
            )

            current_input = validated_output

        return current_input

    async def execute_stage(self, stage: PipelineStage, input_data: BaseModel) -> dict:
        response = await llm.call(
            model=stage.model,
            system=stage.system_prompt,
            messages=[{
                "role": "user",
                "content": f"Input:\n{input_data.model_dump_json(indent=2)}\n\nProcess this input and return the result in the required format."
            }],
            tools=get_tools(stage.tools),
            response_format=stage.output_schema,
        )
        return parse_structured_output(response, stage.output_schema)
```

### Schema Example (document processing pipeline)

```python
# Stage 1: Ingestion
class RawDocument(BaseModel):
    content: str
    source_url: str
    fetched_at: datetime

# Stage 2: Extraction (input = RawDocument, output = ExtractedData)
class ExtractedData(BaseModel):
    title: str
    summary: str
    key_facts: list[str]
    entities: list[str]
    sentiment: Literal["positive", "neutral", "negative"]

# Stage 3: Enrichment (input = ExtractedData, output = EnrichedData)
class EnrichedData(BaseModel):
    title: str
    summary: str
    key_facts: list[str]
    entities: list[str]
    sentiment: Literal["positive", "neutral", "negative"]
    related_documents: list[str]
    category: str
    confidence: float

# Pipeline definition
pipeline = Pipeline([
    PipelineStage(
        name="extract",
        system_prompt=EXTRACTOR_PROMPT,
        input_schema=RawDocument,
        output_schema=ExtractedData,
        model="claude-sonnet-4-6",
        tools=["read_url"],
    ),
    PipelineStage(
        name="enrich",
        system_prompt=ENRICHER_PROMPT,
        input_schema=ExtractedData,
        output_schema=EnrichedData,
        model="claude-sonnet-4-6",
        tools=["web_search", "read_file"],
    ),
])
```

### Rollback on Failure

For pipelines where stages have side effects (write to DB, call external APIs):

```python
class TransactionalPipeline(Pipeline):
    async def run(self, initial_input: BaseModel) -> BaseModel:
        completed_stages = []

        try:
            result = await super().run(initial_input)
            return result
        except PipelineError as e:
            # Roll back completed stages in reverse order
            for stage_name in reversed(completed_stages):
                await self.rollback_stage(stage_name)
            raise

    async def rollback_stage(self, stage_name: str):
        rollback_handler = self.rollback_handlers.get(stage_name)
        if rollback_handler:
            await rollback_handler()
        else:
            log_warning(f"No rollback handler for stage {stage_name}")
```

---

## Logging Between Stages

Every handoff should be logged with enough information to replay from any stage:

```python
def log_handoff(from_stage: str, to_stage: str, input_data: BaseModel, output_data: BaseModel):
    log({
        "event": "pipeline.handoff",
        "from_stage": from_stage,
        "to_stage": to_stage,
        "input_schema": type(input_data).__name__,
        "output_schema": type(output_data).__name__,
        "input_fields": list(input_data.model_fields.keys()),
        "output_fields": list(output_data.model_fields.keys()),
        "timestamp": utcnow(),
    })
    # Optionally checkpoint the output so the pipeline can resume from this stage
    save_stage_output(from_stage, output_data)
```

---

## Tradeoffs

| | Pros | Cons |
|---|------|------|
| Schema validation | Errors caught at stage boundary, not 3 stages later | Adds latency; over-strict schemas block valid outputs |
| Stage isolation | Easy to debug; each stage is independently testable | No parallelism; stages run sequentially |
| Clear interfaces | Easy to swap out a stage or upgrade its model | Schema changes require updating all adjacent stages |
| Rollback capability | Partial state can be recovered | Rollback logic is non-trivial for complex side effects |

---

## When To Use

- Task has clear sequential phases with unambiguous handoff data
- Stage outputs need to be validated before proceeding (don't trust unchecked LLM output)
- Stages have different capability requirements (different prompts, tools, models)
- You need to independently test or benchmark individual stages
- ETL-style workflows, document processing, code generation → review → deployment

## When NOT To Use

- Stages are truly independent (no sequential dependency) — use [[patterns/pattern-fan-out-worker]]
- The task has so few steps (≤ 2) that pipeline overhead exceeds benefit
- Schema design for handoffs is unclear — don't force structured handoffs when the data is naturally unstructured

---

## Real Examples

- **Code generation pipeline**: Spec → Architecture → Implementation → Review → Tests
- **Content pipeline**: Scrape → Extract → Classify → Enrich → Publish
- **Data validation pipeline**: Ingest → Schema validate → Business rule validate → Transform → Load

---

## Related Patterns

- [[patterns/pattern-fan-out-worker]] — when stages don't depend on each other
- [[patterns/pattern-supervisor-worker]] — when routing between stages is dynamic
- [[patterns/pattern-plan-execute-verify]] — when the first stage is always planning

---

## Sources

- Anthropic "Building Effective Agents" (2024)
- Pydantic validation documentation
