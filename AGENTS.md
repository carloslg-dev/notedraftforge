# Agent Instructions — NoteDraftForge

Read this file before any work. It is the generic entry point for any AI agent working on this project.

---

## Project

Private-first structured editor for poems, songs, and structured text, with Markdown as import/export format only.
Annotations (breath, intention, comment) are attached to structured `AnnotationTarget` locations.
Chord and meter are song-cell properties prepared in the domain/data model for MVP2, not MVP annotation kinds.
Visualization uses pre-rendered snapshots with CSS-toggled layers.

Stack: React · Tiptap · Dexie/IndexedDB · Zod · Tailwind CSS · shadcn/ui · GitHub Pages.
Architecture: DDD + Hexagonal. No backend. No sync. No AI features in MVP.

---

## Before any task — read in this order

1. `openspec/project.md` — project orientation and specs index
2. `docs/ai/workflow.md` — mandatory agent phases and phase rules
3. `docs/ai/agent-rules.md` — behavior and safety constraints
4. `docs/ai/context-strategy.md` — how to select and justify context
5. `openspec/specs/<feature>/spec.md` — spec relevant to the current task

---

## Mandatory phase sequence

```
PLAN → CONTEXT → IMPLEMENT → VALIDATE → REVIEW → RETRO
```

No code changes before IMPLEMENT phase. No phase may be skipped.
Keep `.ai/current-task.md` updated at each phase transition.

---

## Scripts to run at each phase

| When | Script | Effect |
|---|---|---|
| Before PLAN | `./scripts/ai/pre-plan.sh` | Blocks if required docs are missing |
| Before editing | `./scripts/ai/pre-edit.sh` | Blocks if phase or authorization is wrong |
| After editing | `./scripts/ai/post-edit.sh` | Lists changes, reminds next steps (no block) |
| VALIDATE phase | `./scripts/ai/validate.sh` | Runs lint and tests |
| End of RETRO | `./scripts/ai/final-review.sh <change-name>` | Quality gate for task closure |

`<change-name>` is the folder name under `openspec/changes/` for the current task.
It must match the `Change reference` field in `.ai/current-task.md`.
In future CI runs it can be derived from the branch name or PR metadata.

### Script scope

| Script | Safe in CI | Purpose |
|---|---|---|
| `validate.sh` | Yes | Code validation only — no local state required |
| `final-review.sh` | No (requires `.ai/`) | Local/agent closure gate — reads live task state |
| `ci-review.sh` | Yes (future) | Will read only versioned artifacts in `openspec/changes/` |

> Scripts are V1 minimum guardrails. They enforce a structural baseline
> but do not replace agent judgment or human review.

---

## Hard constraints

- **SDD**: no implementation without a spec in `openspec/specs/<feature>/spec.md`
- **DDD + Hexagonal**: `core/domain/` must have zero dependencies on React, Tiptap, Dexie, Zod, IndexedDB, or any framework
- **No backend, no sync, no AI features** in MVP
- **Stack is fixed**: React · Tiptap · Dexie/IndexedDB · Zod · Tailwind CSS · shadcn/ui · GitHub Pages — no alternatives in MVP

---

## Task state

| File | Type | Purpose |
|---|---|---|
| `.ai/current-task.md` | Local, not versioned | Live state during execution |
| `openspec/changes/<change>/execution-record.md` | Versioned | Evidence summary committed at closure |

Templates:
- `docs/ai/current-task.template.md` → copy to `.ai/current-task.md` at start of task
- `docs/ai/execution-record.template.md` → copy to `openspec/changes/<change>/execution-record.md` at end of RETRO

---

## Definition of Done

See `docs/ai/done-definition.md`.
