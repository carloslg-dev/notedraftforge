# Context Strategy

This document defines how an agent must select and manage context when working on a task.

---

## Principle

Load the minimum context that is sufficient to implement correctly.

More context is not always better. Excessive context:
- Increases noise and risk of misinterpretation
- Slows down the agent
- Can introduce irrelevant constraints

---

## Progressive loading order

Load context in this order. Stop when you have enough to proceed.

```
1. openspec/project.md                   — project orientation and specs index
2. docs/ai/workflow.md                   — mandatory agent phases
3. openspec/specs/<feature>/spec.md      — feature spec for the current task
4. openspec/domain-model.md              — domain types, if directly relevant
5. openspec/architecture.md              — architecture rules, if directly relevant
6. Source files directly affected        — implementation target
7. Related tests                         — validate existing behavior
8. openspec/decisions/decisions.md       — only if a decision ID is referenced in the issue
```

---

## Justification requirement

Before implementing, document the context you selected in `.ai/current-task.md`:

```markdown
## Context selected

| Source | Why needed | Confidence |
|---|---|---|
| openspec/specs/foo/spec.md | Defines expected behavior for this task | High |
| src/domain/foo.ts | Main implementation target | High |
| src/tests/foo.spec.ts | Validates existing behavior | Medium |

## Context intentionally not loaded

- openspec/specs/bar/spec.md — unrelated to current task
```

---

## Missing context detection

Before implementing, answer these questions:

- Do we know the expected behavior? (spec + acceptance criteria)
- Do we know the affected module? (architecture + domain model)
- Do we know how to validate the change? (tests, lint, type check)
- Do we know the domain invariants and constraints?

If any answer is **critical and unknown**, stop and report before editing code.

---

## When to stop loading context

Stop when you can answer:

1. What change to make
2. Where to make it
3. How to validate it
4. What not to break

If adding more context would not change your plan, do not add it.
