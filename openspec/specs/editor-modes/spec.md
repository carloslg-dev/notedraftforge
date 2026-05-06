# Spec: Editor Modes

> References: `openspec/domain-model.md`, `openspec/architecture.md`, `openspec/specs/annotation-system/spec.md`

## Purpose
Define behavior for `editing` and `visualization` modes using structured `PieceContent`, infrastructure-driven snapshot rendering, and `AnnotationTarget`-based annotation interactions.

---

## Requirements

### EM-REQ-01 — Mode set (MVP)
The system SHALL provide exactly two modes in MVP:
- `visualization`
- `editing`

### EM-REQ-02 — Structured editing model
In `editing` mode, the system SHALL edit structured `PieceContent` (not raw Markdown strings).

User interaction SHALL be provided through an editor adapter (Tiptap).

Editor-native payloads (Tiptap/ProseMirror JSON) SHALL be treated as external data and mapped to domain structures before persistence.

Tiptap/ProseMirror JSON SHALL NOT be stored as domain state.

### EM-REQ-03 — Editing mode responsibilities
In `editing` mode, the system SHALL allow:
- full content editing
- inline formatting actions exposed by the editor adapter
- selection refinement before applying editor actions
- piece metadata updates through relevant specs

In `editing` mode, the system SHALL NOT expose:
- annotation create/update/delete/resolve actions in MVP
- direct visualization-only controls (for example, auto-scroll and layer panel toggles)

### EM-REQ-04 — Visualization mode responsibilities
In `visualization` mode, the system SHALL render `PieceSnapshot.html` as read-only base content.

`visualization` mode SHALL allow annotation overlay interactions (for example add/resolve) but SHALL NOT allow direct content editing.

No Angular or Markdown-editor assumptions SHALL be used in mode behavior.

### EM-REQ-05 — Selection toolbar
When the user makes a text selection in either mode, the system SHALL show a contextual **selection toolbar** positioned above the selection (or below if near the top of the viewport).

In `editing` mode, the toolbar SHALL expose:
- Inline format actions: Bold, Italic, Underline, Strikethrough
- A **Refine** action to open the Selection Refinement modal

In `visualization` mode, the toolbar SHALL expose:
- Annotation kind actions: Intent, Comment, Breath
- A **Refine** action to open the Selection Refinement modal

Tapping an annotation kind action in `visualization` mode SHALL open the annotation modal pre-configured for that kind.

The toolbar SHALL dismiss when the selection is cleared.

### EM-REQ-06 — Selection Refinement modal
The system SHALL provide a **Selection Refinement modal** accessible from the selection toolbar Refine action in both modes.

The modal SHALL:
- display a char-by-char view of the current selection boundary (8-character context window)
- provide nudge actions to move the start or end boundary left or right by one character
- confirm the adjusted selection back to the calling mode without committing an annotation

Selection refinement SHALL NOT persist any annotation. It adjusts only the in-memory selection before returning to the calling flow:
- visualization mode may continue into annotation creation
- editing mode may continue into editor actions only

This flow is designed primarily for mobile where fat-finger selection is imprecise.

### EM-REQ-07 — Selection to AnnotationTarget mapping
Selection-to-target mapping SHALL produce:
- `TextRangeTarget`, or
- `TextNodeTarget`

For `TextRangeTarget`, offsets SHALL be calculated against plain text formed by concatenating `TextRun.text` values of the target block.

Inline marks SHALL NOT affect offset calculations.

Selection mapping logic SHALL belong to infrastructure adapters (editor/renderer mapping), not domain.

### EM-REQ-08 — Visualization selection mapping
When selection happens over rendered snapshot content, renderer metadata SHALL expose enough information to resolve selections back to `AnnotationTarget` values.

### EM-REQ-09 — Snapshot dependency for annotation actions
Annotation actions in MVP visualization mode SHALL require a valid snapshot.

If snapshot is not yet available, annotation actions SHALL remain disabled until the first snapshot is generated.

Snapshot lifecycle SHALL be infrastructure-driven.

The system SHALL NOT include anchor regeneration logic.

### EM-REQ-10 — needsReview in mode flows
`needsReview` status SHALL be tied to target resolution failures (unresolvable target or invalid bounds), not anchor corruption.

The system SHALL NOT auto-repair `needsReview` in MVP.

Resolution actions SHALL be explicit user flows:
- confirm
- retarget
- delete

### EM-REQ-11 — Transition and persistence safety
Mode transitions SHALL preserve user changes.

Leaving `editing` mode SHALL persist pending changes via normal persistence/autosave flow before navigation completes.

Unsaved changes SHALL NOT be silently lost.

### EM-REQ-12 — Markdown scope
Markdown SHALL be treated only as external import/export format concern.

Markdown SHALL NOT be treated as internal editable source of truth in mode behavior.

---

## Scenarios

### EM-SCN-01 — Open piece in visualization mode
**GIVEN** a user opens a piece from the work list
**WHEN** the piece view loads
**THEN** the system enters `visualization` mode and renders `PieceSnapshot.html` as read-only content.

### EM-SCN-02 — Enter editing mode and persist structured content
**GIVEN** a piece in visualization mode
**WHEN** the user switches to `editing` mode and modifies content
**THEN** the editor adapter maps edits to structured `PieceContent` and persistence stores domain data (not editor JSON).

### EM-SCN-03 — Editing selection does not create annotation
**GIVEN** a piece in editing mode with a valid snapshot
**WHEN** the user selects text
**THEN** the selection toolbar exposes editor actions and Refine, but no annotation kind actions are available.

### EM-SCN-04 — Create annotation from visualization selection
**GIVEN** a piece in visualization mode with a valid snapshot
**WHEN** the user selects rendered text and adds an annotation
**THEN** renderer metadata enables mapping to `AnnotationTarget` and the annotation flow proceeds without direct content editing.

### EM-SCN-05 — Annotation actions blocked without snapshot
**GIVEN** a piece with no generated snapshot yet
**WHEN** user attempts annotation actions in visualization mode
**THEN** actions remain disabled until first snapshot generation completes.

### EM-SCN-06 — needsReview resolution flow
**GIVEN** an annotation that became unresolved after content changes
**WHEN** user opens review action
**THEN** user must explicitly confirm, retarget, or delete; no automatic repair is performed.

### EM-SCN-07 — Selection toolbar appears on text selection (visualization)
**GIVEN** a piece in visualization mode
**WHEN** the user selects text in the snapshot reading surface
**THEN** the selection toolbar appears with Intent, Comment, Breath, and Refine actions.

### EM-SCN-08 — Selection toolbar in editing mode shows format actions
**GIVEN** a piece in editing mode
**WHEN** the user selects text in the editor
**THEN** the selection toolbar appears with Bold, Italic, Underline, Strikethrough, and Refine actions.

### EM-SCN-09 — Refine opens Selection Refinement modal
**GIVEN** the selection toolbar is visible (either mode)
**WHEN** the user taps "Refine"
**THEN** the Selection Refinement modal opens showing the current selection boundary in an 8-character context window.

### EM-SCN-10 — Selection Refinement adjusts boundary without committing annotation
**GIVEN** the Selection Refinement modal is open
**WHEN** the user nudges the end boundary left by two characters and confirms
**THEN** the selection is adjusted in memory and the system returns to the calling mode with the updated selection; no annotation is persisted.

---

## Non-Goals (MVP)
- No analysis/rehearsal extra modes
- No split view (editing + visualization simultaneously)
- No collaborative co-editing mode behavior
- No annotation create/update/delete/resolve actions in editing mode
- No advanced multi-target annotation composition in mode workflows
- No requirement to expose editor-internal JSON structures to domain/application layers
- No automatic selection correction or AI-guided boundary suggestion
