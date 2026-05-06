# NoteDraftForge — Epic and Issue Backlog

> This file is the ordered starting point for implementation.
> Each epic maps to one or more feature specs.
> Issues are created from this backlog using `openspec/templates/issue-template.md`.

---

## Implementation order

Build in this sequence. Each epic can start only when its dependencies are done.

```
E-01 Foundation
  └─ E-02 Domain model
       ├─ E-03 Piece Management + Work List
       ├─ E-04 Editor Modes
       ├─ E-05 Annotation System
       └─ E-06 Snapshot & Layer State
```

---

## E-01 — Foundation

**Depends on:** nothing
**Spec:** `openspec/architecture.md`

Establish the React project structure, module layout, and infrastructure contracts.
Nothing else can be built without this.

| Issue | Scope |
|---|---|
| React project bootstrap (Vite + React 18 + Tiptap) | Create app with routing, folder structure per architecture doc; Tailwind CSS + shadcn/ui setup (D-16, D-18) |
| Shared types and constants | Layer definitions (compile-time), PieceType enum, CSS class constants |
| Port interfaces | `PieceRepository`, `AnnotationRepository`, `SnapshotRepository` |
| IndexedDB adapter stubs (Dexie) | Implement all three ports with Dexie; basic CRUD, no business logic (D-21) |
| Zustand UI state setup | Global UI state store: modal state, selection state, active mode (D-19) |
| Error handling baseline | Toast/banner component; error policy per `openspec/non-functional.md` |
| Architecture lint rules | ESLint rules to enforce import boundaries (domain → nothing external) |

---

## E-02 — Domain model

**Depends on:** E-01
**Spec:** `openspec/domain-model.md`

Implement all domain entities, value objects, and domain rules as pure TypeScript.
No React, no IndexedDB, no side effects. Unit-testable in isolation.

| Issue | Scope |
|---|---|
| `Piece` entity | Type, rules, `revision` increment, `updatedAt`, tag/type invariants |
| `Annotation` entity | `AnnotationContent` union (`BreathContent`, `NoteAnnotationContent`), kind/layer assignment rule, status (D-23) |
| `ChordContent` rules | Root validation, modifier ordering, `display` derivation |
| Domain invariants | Unit tests for all 14 invariants in `domain-model.md` |

---

## E-03 — Piece Management + Work List

**Depends on:** E-01, E-02
**Specs:** `openspec/specs/piece-management/spec.md`, `openspec/specs/work-list/spec.md`

Piece CRUD, Markdown import/export adapters, JSON backup/restore, and the work list UI. No annotation interactions here.

| Issue | Scope |
|---|---|
| Create piece use case | Input validation, id generation, type-as-tag rule, persist via port; domain supports `song`, MVP UI offers `text`/`poem` only |
| Update piece metadata | Title, type, language, tags; update `updatedAt`; type-as-tag enforcement |
| Delete piece use case | Cascade delete annotations, snapshots, and other piece-scoped artifacts via ports |
| Export piece to Markdown | Map structured content to clean `.md`; no internal metadata (PM-REQ-10) |
| Import Markdown file | Parse text-oriented Markdown; degrade unsupported structures (D-05) |
| Work list component | List all pieces, sort by `updatedAt` desc |
| Filter by tags | Unified type/tag filter model (D-08); badge + tag display |
| Tag search overlay | "···" chip → real-time search overlay; empty state; no flat list (WL-REQ-11) |
| Navigation to work | Route from work list to work view |
| JSON backup export | Full JSON export of all pieces + annotations + layer visibility state; download as `.json` before version updates (PM-REQ-11, D-22) |
| JSON backup restore | Paste or upload JSON; Zod validation; replace-all with warning (PM-REQ-12, D-20, D-22) |

---

## E-04 — Editor Modes

**Depends on:** E-01, E-02, E-03
**Spec:** `openspec/specs/editor-modes/spec.md`

Mode system (visualization / editing), selection toolbar, refinement modal, transitions, and mode-based restrictions.
No annotation management or snapshot generation here — only the mode container, editor actions, and mode restrictions.

| Issue | Scope |
|---|---|
| Mode state (Zustand) | Visualization / editing state, transitions, restrictions per mode |
| Work view component (shell) | Container that switches between visualization and editing sub-views |
| Editing mode — Tiptap editor | Tiptap OSS adapter, structured content mapping, autosave debounce 800ms (D-15) |
| Content autosave use case | Debounce, persist `Piece.content`, increment `revision`, `updatedAt` update |
| Selection toolbar component | Contextual toolbar above selection; edit mode (format actions only) / visualization mode (annotation kinds); frosted white theme (EM-REQ-05) |
| Selection Refinement modal | Char-by-char boundary adjuster, 8-char context window, nudge ←→, confirm (EM-REQ-06) |
| Language preference UI | ES / EN segmented control in app header; persisted in UI state |
| Settings placeholder | Settings button in app header; no-op in MVP; reserved space for future settings |
| Double-action protection | `isProcessing` flag or debounce on all action triggers |

---

## E-05 — Annotation System

**Depends on:** E-01, E-02, E-04
**Spec:** `openspec/specs/annotation-system/spec.md`

Creating, editing, deleting annotations and managing target integrity.

| Issue | Scope |
|---|---|
| Create annotation use case | Validate target, persist annotation, immediate visual feedback in viz mode (D-03, AS-REQ-07) |
| Annotation modal component | Type selector (breath/intent/comment) → mark selector or shortNote + extendedNote fields (D-23, AS-REQ-06) |
| Edit annotation use case | Update content, validate, persist (AS-REQ-08) |
| Delete annotation use case | Remove annotation, update piece revision (AS-REQ-09) |
| Target integrity pass | Run after content save; mark `needsReview` on unresolvable target (D-02, AS-REQ-10) |
| Resolve `needsReview` use case | User confirms, retargets, or deletes; explicit flow only (AS-REQ-11) |
| Annotation rendering in visualization | shortNote floating above text (Caveat font); extendedNote in sidebar on selection; `needsReview` always visible |
| Layer visibility in annotation rendering | CSS classes per layer kind; `ndf-needs-review` override |

---

## E-06 — Snapshot & Layer State

**Depends on:** E-01, E-02, E-04, E-05
**Spec:** `openspec/specs/snapshot-and-layer-state/spec.md`

Snapshot generation pipeline, stale detection, fallback behavior, and layer toggling.

| Issue | Scope |
|---|---|
| Piece renderer | Pure function: `Piece + Annotation[]` → HTML string; CSS classes per layer and status |
| Snapshot generation use case | Generate `PieceSnapshot`, set `sourceRevision`, persist via port |
| Snapshot invalidation service | Detect stale snapshots (`sourceRevision < revision`); trigger regeneration |
| Snapshot inactivity debounce | 5s debounce in editing mode; immediate generation on exit |
| Load snapshot in visualization | Load + inject HTML; stale → inject current + regenerate in background |
| No-snapshot fallback | Show base text (read-only), disable annotation actions, generate first snapshot (D-04) |
| Toggle layer visibility | Update `layerVisibility`, apply CSS class on container, persist; zero re-render |
| Recovery copies | Store up to 3 rendered copies per piece; prune oldest automatically (D-02) |

---

## Decision references

| Decision | Impacts |
|---|---|
| D-01 Editing persistence contract | E-04 (autosave), E-06 (snapshot debounce) |
| D-02 Anchor integrity strategy | E-05 (needsReview), E-06 (recovery copies) |
| D-03 Add annotation in viz mode | E-05 (immediate feedback), E-06 (background regen) |
| D-04 No-snapshot fallback | E-06 (fallback behavior) |
| D-05 Import policy | E-03 (import) |
| D-06 Error policy | E-01 (error handling baseline) |
| D-07 needsReview latency tolerance | E-05 (integrity pass) |
| D-08 Type/tag model | E-03 (work list filter) |
| D-09 Chord/meter renderer contract | E-06 (renderer) |
| D-10 Structured content model | E-02 (domain), E-03, E-05 |
| D-11 Dual annotation target system | E-02 (domain), E-05 |
| D-12 Anchor tags not source of truth | E-02, E-05 |
| D-13 Structured song model | E-02, E-06 (renderer) |
| D-14 Markdown as import/export format | E-03 (import/export), E-04 |
| D-15 Tiptap OSS editor adapter | E-04 (editor) |
| D-16 React frontend | E-01 (bootstrap) |
| D-17 Structured TagRef model | E-02, E-03 (work list filter) |
| D-18 Tailwind CSS + shadcn/ui | E-01 (setup) |
| D-19 Zustand for UI state | E-01 (setup), E-04 (mode state) |
| D-20 Zod for boundary validation | E-03 (restore import) |
| D-21 Dexie for IndexedDB | E-01 (adapter stubs) |
| D-22 JSON backup format | E-03 (export/restore issues) |
| D-23 shortNote/extendedNote content model | E-02 (domain), E-05 (annotation modal) |
