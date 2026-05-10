# Execution Record — mvp-spec-clarifications

> Versioned summary of task execution for this change.

---

## Task reference

Direct user clarification in chat, 2026-05-06.

## Change reference

mvp-spec-clarifications

## Execution authorization

Status: approved
Source: human
Approved by: carlos
Reason: User answered open MVP questions and asked to finish clear spec changes and summarize the recovery-copy requirement.

---

## Context used

| Source | Why needed | Confidence |
|---|---|---|
| `openspec/domain-model.md` | Canonical domain types, marks, type/tag invariants, snapshot model | High |
| `openspec/specs/piece-management/spec.md` | Piece type, language, backup/restore behavior | High |
| `openspec/specs/work-list/spec.md` | Song visibility and Work List navigation behavior | High |
| `openspec/specs/editor-modes/spec.md` | Selection toolbar and snapshot gate behavior | High |
| `openspec/specs/annotation-system/spec.md` | Annotation creation preconditions | High |
| `openspec/specs/snapshot-and-layer-state/spec.md` | Snapshot stale/current behavior | High |
| `openspec/specs/layer-visibility/spec.md` | Durable per-piece visual layer state | High |
| `openspec/backlog.md` | Issue slicing consistency | High |
| `openspec/decisions/decisions.md` | Cross-spec decision traceability | High |
| `wireframes/notedraftforge-ux-wireframe/src/components/Primitives.tsx` | Confirms ES/EN selector is UI language only | Medium |

---

## Files changed

- `openspec/domain-model.md`
- `openspec/specs/editor-modes/spec.md`
- `openspec/specs/piece-management/spec.md`
- `openspec/specs/work-list/spec.md`
- `openspec/specs/snapshot-and-layer-state/spec.md`
- `openspec/specs/layer-visibility/spec.md`
- `openspec/specs/annotation-system/spec.md`
- `openspec/backlog.md`
- `openspec/decisions/decisions.md`
- `openspec/changes/mvp-spec-clarifications/execution-record.md`

---

## Validation result

PASS

`./scripts/ai/validate.sh` passed documentation-only checks. It warned that the wireframe package dependencies are not installed, so the prototype build was not validated.

---

## Decisions made

- Added `underline` to MVP text marks and explicitly excluded `strikethrough` for legibility.
- Clarified `Piece.type` as a hard discriminator matching `Piece.content.kind` and the system-managed type tag.
- Clarified that app UI language preference does not infer or mutate `Piece.language`.
- Clarified that MVP1 user-facing Work List and creation flows expose `text` and `poem`, while `song` remains in the domain/data model for MVP2 readiness.
- Clarified that annotation actions require a current ready snapshot, not a missing or stale snapshot.
- Made backup `layerVisibility` required and durable because it is per-piece visual state that must survive export/restore.
- Marked rendered recovery-copy lifecycle transfer as pending because D-02/backlog mention it but the snapshot spec does not define it yet.

---

## Retrospective summary

- Context missing at start: exact intended behavior for recovery copies remains underspecified beyond D-02 and backlog.
- Most useful document: `openspec/domain-model.md`, because it exposed the hard type/content/tag invariants that needed to be made explicit.
- Ambiguous rule: whether restored future `song` data should be visible in MVP1. User clarified it must remain modeled but hidden from user-facing MVP1 flows.
- Validation to automate: a docs consistency check for decision IDs marked `Transferred` when the corresponding spec text is missing.
- Should move to `docs/ai/`: a small checklist for resolving spec inconsistency batches before Gherkin generation.

---

## Date completed

2026-05-06
