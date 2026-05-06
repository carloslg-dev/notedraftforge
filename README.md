# NoteDraftForge

Private-first structured editor for poems, songs, and structured text.

## Current Status

This repository is currently definition-first.
The source of truth is under `openspec/` and `docs/`; app implementation will start after the MVP behavior is refined into issue-ready Gherkin scenarios.

The included wireframe is a React/Tiptap UX prototype only. It is not the production application.

## Project Goal

Build an offline-first editor focused on creative writing and interpretation layers:
- Write and edit structured poem/text content.
- Attach structured annotations (`breath`, `intention`, `comment`) to explicit `AnnotationTarget` locations.
- Manage per-piece layer visibility with fast snapshot rendering.
- Use Markdown only as an import/export format, not as the internal source of truth.

## Documentation Map

Start here:
- `openspec/project.md` - project context, goals, scope
- `openspec/domain-model.md` - canonical domain types and invariants
- `openspec/architecture.md` - DDD + hexagonal architecture rules
- `openspec/non-functional.md` - performance, offline, accessibility requirements
- `openspec/terminology.md` - naming conventions

Feature specs:
- `openspec/specs/piece-management/spec.md`
- `openspec/specs/annotation-system/spec.md`
- `openspec/specs/editor-modes/spec.md`
- `openspec/specs/work-list/spec.md`
- `openspec/specs/layer-visibility/spec.md`
- `openspec/specs/snapshot-and-layer-state/spec.md`

Process rules for agents:
- `openspec/workflow/workflow-rules.md`
- `docs/ai/workflow.md`
- `docs/ai/agent-rules.md`

Wireframe:
- `wireframes/notedraftforge-ux-wireframe/`

Decision log:
- `openspec/decisions/decisions.md`

Epic and issue backlog:
- `openspec/backlog.md`

## Workflow (SDD)

1. Open or link a GitHub issue with goal, scope, constraints, acceptance criteria, and non-goals.
2. Update or add the corresponding `openspec/specs/<feature>/spec.md`.
3. Implement only after spec is clear and accepted.
4. Keep docs in sync with changes.
5. Validate DoD: code + tests (when applicable) + docs + lint.
