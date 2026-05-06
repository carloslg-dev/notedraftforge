# CLAUDE.md — NoteDraftForge

## Start here

`AGENTS.md` is the common contract for all agents: workflow, scripts, hard constraints.
This file (`CLAUDE.md`) adds Claude Code-specific behavior on top of that contract.

Before any task, read in this order:
1. `AGENTS.md` — common agent contract (workflow, scripts, constraints)
2. `openspec/project.md` — project orientation and specs index
3. `docs/ai/workflow.md` — mandatory agent phases (PLAN → CONTEXT → IMPLEMENT → VALIDATE → REVIEW → RETRO)

---

## Project in one line

Private-first structured editor for poems, songs, and structured text.
Annotations (`breath`, `intention`, `comment`) are attached to structured `AnnotationTarget` locations.
Visualization uses pre-rendered snapshots with CSS-toggled layers.

---

## Key constraints

- **SDD: no code without a spec.** Every implementation must reference a `openspec/specs/<feature>/spec.md`.
- **DDD + Hexagonal Architecture.** `core/domain/` must have zero dependencies on React, Tiptap, Dexie, Zod, IndexedDB, or any framework.
- **No backend, no sync, no AI features in MVP.**
- **React + Tiptap + Dexie/IndexedDB + Zod + Tailwind CSS + shadcn/ui + GitHub Pages.** No other stack choices in MVP.

---

## Where to find things

| Need | File |
|---|---|
| Domain types (canonical) | `openspec/domain-model.md` |
| Architecture rules + folder structure | `openspec/architecture.md` |
| Feature specs | `openspec/specs/<feature>/spec.md` |
| Naming rules | `openspec/terminology.md` |
| Non-functional requirements | `openspec/non-functional.md` |
| Cross-spec decisions | `openspec/decisions/decisions.md` |
| Epics and issue backlog | `openspec/backlog.md` |
| SDD workflow and issue rules | `openspec/workflow/workflow-rules.md` |
| Issue template | `openspec/templates/issue-template.md` |
| Review checklist | `openspec/templates/checklist-review.md` |
| **Generic agent adapter** | `AGENTS.md` |
| **Agent workflow phases** | `docs/ai/workflow.md` |
| **Agent behavior rules** | `docs/ai/agent-rules.md` |
| **Context strategy** | `docs/ai/context-strategy.md` |
| **Definition of Done (agent)** | `docs/ai/done-definition.md` |
| **Current task template** | `docs/ai/current-task.template.md` |
| **Execution record template** | `docs/ai/execution-record.template.md` |
| **Current task state (local)** | `.ai/current-task.md` |
| **Execution checklist** | `docs/ai/templates/checklist-execution.md` |
| **AI prompt template** | `docs/ai/templates/ai-prompt.md` |

---

## Commit convention

Conventional Commits in English: `type(scope): message`

Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

Examples:
- `feat(annotation): add needsReview resolution flow`
- `fix(snapshot): prevent duplicate regeneration on toggle`
