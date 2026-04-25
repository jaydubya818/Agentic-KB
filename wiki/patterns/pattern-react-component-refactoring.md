---
id: 01KQ2YDG2KBPRSD9P6TPQBPDRY
title: "React Component Refactoring"
type: pattern
tags: [patterns, architecture, workflow]
created: 2026-04-25
updated: 2026-04-25
visibility: public
confidence: high
source: my-skills/component-refactoring-skill.md
---

# React Component Refactoring

A set of four core patterns for reducing complexity in large React components. Apply when a component is too large to reason about, mixes concerns, or has grown beyond a single responsibility.

## When to Use

- A component has 200+ lines of JSX or logic
- Multiple `useState`/`useEffect` hooks exist with interrelated state
- Business logic is entangled with rendering
- Conditional rendering creates deep nesting (> 3 levels)
- API/data-fetching code lives directly inside the component body

## Structure

Four discrete patterns, applied in order of impact:

### Pattern 1: Extract Custom Hooks

Move complex state management and business logic into a dedicated `use-<feature>.ts` hook. Place hooks in a `hooks/` subdirectory or alongside the component.

```typescript
// hooks/use-model-config.ts
export const useModelConfig = (appId: string) => {
  const [modelConfig, setModelConfig] = useState<ModelConfig>(...)
  const [completionParams, setCompletionParams] = useState<FormValue>({})
  // Related state management logic here
  return { modelConfig, setModelConfig, completionParams, setCompletionParams }
}

// Component becomes cleaner
const Configuration: FC = () => {
  const { modelConfig, setModelConfig } = useModelConfig(appId)
  return <div>...</div>
}
```

**Trigger**: Component has 3+ `useState` hooks or 2+ `useEffect` hooks with interdependencies.

---

### Pattern 2: Extract Sub-Components

Split a monolithic JSX tree into focused child components. The parent becomes an orchestration-only component.

```
app-info/
  ├── index.tsx           (orchestration only)
  ├── app-header.tsx      (header UI)
  ├── app-operations.tsx  (operations UI)
  └── app-modals.tsx      (modal management)
```

**Trigger**: Component contains multiple distinct UI sections, repeated patterns, or conditional rendering blocks exceeding ~50 lines each.

---

### Pattern 3: Simplify Conditional Logic

Replace deeply nested `if/else` or `switch` chains with lookup tables and early returns.

```typescript
const TEMPLATE_MAP = {
  [AppModeEnum.CHAT]: {
    [LanguagesSupported[1]]: TemplateChatZh,
    default: TemplateChatEn,
  },
}

const Template = useMemo(() => {
  const modeTemplates = TEMPLATE_MAP[appDetail?.mode]
  if (!modeTemplates) return null
  const TemplateComponent = modeTemplates[locale] || modeTemplates.default
  return <TemplateComponent appDetail={appDetail} />
}, [appDetail, locale])
```

**Trigger**: Nesting depth > 3 levels, or `switch` statements inside `useMemo`/render.

---

### Pattern 4: Extract API / Data Logic

Move API calls, data transformation, and async operations out of the component body into a dedicated service layer or custom hook.

**Trigger**: Component contains `fetch`, `axios`, or direct SDK calls, or performs non-trivial data transformation before rendering.

## Trade-offs

| Benefit | Cost |
|---|---|
| Each unit is easier to test in isolation | More files to navigate |
| Reduced cognitive load per component | Risk of prop-drilling if not using context |
| Reusable hooks can be shared across features | Over-extraction can obscure data flow |
| Conditional tables are easier to extend | Lookup tables require upfront mapping |

## Related Patterns

- [Context Management](../concepts/context-management.md) — relevant when extracted hooks share state that needs to be lifted
- [Agent Loops](../concepts/agent-loops.md) — the refactoring skill itself is invoked as part of an agentic workflow

## See Also

- [Cost Optimization](../concepts/cost-optimization.md) — reducing component complexity also reduces re-render cost
- [Architecture Agent Profile](../agents/orchestrators/architecture-agent/profile.md) — the agent that applies these patterns
