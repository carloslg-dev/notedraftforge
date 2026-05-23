# Execution Record — functional-flows-baseline

> Versioned summary of task execution for this change.

---

## Task reference

functional-flows-baseline-2026-05-10

## Change reference

functional-flows-baseline

## Execution authorization

Status: approved
Source: human
Approved by: carlos
Reason: User requested the first functional-flow specification baseline for MVP1 flows as a QA automation baseline.

---

## Context used

| Source | Why needed | Confidence |
|---|---|---|
| `openspec/project.md` | Project orientation and spec index | High |
| `openspec/domain-model.md` | Domain invariants and structured model coverage | High |
| `openspec/decisions/decisions.md` | Current MVP decisions and deferred scope | High |
| `openspec/specs/*/spec.md` | Source of truth for MVP1 behavior | High |
| `docs/product/mvp-ux-scope.md` | User-facing MVP1 scope boundaries | High |
| `docs/product/ux-flow.md` | Primary UX flow mapping for E2E scenarios | High |
| `docs/ai/workflow.md` | Required PLAN to RETRO workflow | High |

---

## Files changed

- `openspec/flows/README.md`
- `openspec/flows/00_scope_guardrails.feature`
- `openspec/flows/01_work_list_and_create_work.feature`
- `openspec/flows/02_editor_modes_and_content.feature`
- `openspec/flows/03_annotations.feature`
- `openspec/flows/04_snapshot_and_layers.feature`
- `openspec/flows/05_backup_restore.feature`
- `openspec/flows/06_domain_and_architecture.feature`
- `openspec/changes/functional-flows-baseline/execution-record.md`

---

## Validation result

PASS

`./scripts/ai/validate.sh` passed documentation-only checks.

Manual checks counted 7 feature files and 81 scenarios, verified `Scenario Outline` examples, reviewed automation tags, and reviewed MVP1 guardrails for song, Markdown import/export, strikethrough, and needsReview resolution.

Wireframe prototype build validation was not run because dependencies are not installed in `wireframes/notedraftforge-ux-wireframe`.

---

## Decisions made

- Place functional-flow specifications under `openspec/flows/` so the location remains stable across MVP1, MVP2, and later releases.
- Split flows by MVP area: scope guardrails, Work List/create work, editor modes/content, annotations, snapshots/layers, backup/restore, and domain/architecture invariants.
- Tag scenarios by likely automation layer: `@e2e`, `@application`, `@domain`, `@a11y`, and `@guardrail`.
- Keep song as domain/data preparedness only; no MVP1 song UX flow was added.
- Keep Markdown import/export UX out of MVP1; JSON backup/restore is the MVP1 data-safety flow.
- Keep annotation update/delete scenarios at application level unless a later UX spec exposes direct UI flows.

---

## Retrospective summary

- No existing functional-flow convention or feature-file linter was available, so the suite uses a simple folder convention and manual syntax/coverage checks.
- The most useful sources were the feature specs, domain model, and product UX scope docs.
- Next automation should add feature-file linting plus tag and guardrail checks.
- The docs workflow should clarify how docs-only behavior-spec changes and RETRO execution records relate to `pre-edit.sh`.

## Task log range

Single task

---

## Date completed

2026-05-10
