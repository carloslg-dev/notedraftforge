# Spec: Snapshot and Layer State

> References: `openspec/domain-model.md`, `openspec/architecture.md`

## Purpose
Define the contract for PieceSnapshot — the pre-rendered HTML cache used in
visualization mode — including generation, invalidation, layer visibility
persistence, and the CSS mechanism for zero-cost layer toggling.

This spec is the single source of truth for anything related to snapshot
lifecycle and layer state. If there is a conflict between this file and any
other spec, this file wins on these topics.

---

## What is a PieceSnapshot

A PieceSnapshot is a pre-rendered static HTML string of a Piece with all
annotations embedded. It is stored in IndexedDB and loaded directly into
the visualization view without any Angular rendering pipeline.

```ts
interface PieceSnapshot {
  pieceId: string;
  html: string;                              // static HTML, ALL annotations included
  layerVisibility: Record<LayerKind, boolean>; // per-piece layer state
  generatedAt: string;                       // ISO 8601
}

// LayerKind matches the suffix of LayerId — see domain-model.md Opción B
type LayerKind = 'chord' | 'meter' | 'breath' | 'intention' | 'comments';
```

Key properties:
- `html` always contains ALL annotations regardless of layer visibility
- `layerVisibility` stores which layers the user has toggled on/off for this piece
- Layer visibility is applied via CSS classes — it never modifies `html`

---

## Generation

### Trigger conditions (eager)
A new snapshot is generated when:
1. The user stops editing for **5 seconds** (debounced inactivity timer)
2. The user exits editing mode (immediate, no wait)

Both triggers run in the **background** — the user is never blocked.

### Fallback — no snapshot available on open
If the user opens a piece in visualization mode and no snapshot exists yet:
- Display `Piece.content` as plain text immediately (no annotations visible)
- Show a non-blocking message: "Annotations are being processed and will appear shortly"
- Generate the snapshot in the background
- Once ready, replace the plain text view with the rendered snapshot automatically

This is the only case where the user sees the piece without annotations.
It should only happen on the very first open of a newly created piece.

### What is generated
The renderer (`core/infrastructure/renderer/piece-renderer.ts`) receives:
- `Piece` (with anchor tags in content)
- `Annotation[]` for that piece

It returns an HTML string where:
- Anchor zones are replaced with rendered annotation elements
- Every annotation element carries CSS classes: `ndf-annotation ndf-layer-{kind}`
  where `{kind}` is the annotation's kind (e.g. `chord`, `meter`)
- Annotations with `status: 'needsReview'` also carry class `ndf-needs-review`
- The HTML is self-contained — no Angular components, no event listeners

### Generation does NOT happen when
- Layer visibility is toggled (CSS only, no re-render)
- Piece metadata changes (title, type, language, tags)
- The piece is opened in visualization mode (loads existing snapshot)

---

## Invalidation

A snapshot is marked stale and must be regenerated when:
- `Piece.content` changes (UC-PM-04)
- Any `Annotation` of that piece is created, updated, or deleted (UC-AS-01, UC-AS-02, UC-AS-03, UC-AS-04)
- Any `AnchorMark` of that piece is created or deleted (UC-AS-01, UC-AS-03)

Stale snapshots are regenerated eagerly per the generation rules above.
A stale snapshot is still served to the user until the new one is ready —
there is no blank screen while regenerating.

Snapshot is NOT invalidated by:
- Layer visibility toggle
- Piece metadata changes (title, type, language, tags)

---

## Layer Visibility — CSS Mechanism

### CSS class naming convention
Layer kinds map directly to CSS class names with no duplication:

| LayerKind | Annotation class | Container hide class |
|---|---|---|
| `chord` | `ndf-layer-chord` | `ndf-hide-chord` |
| `meter` | `ndf-layer-meter` | `ndf-hide-meter` |
| `breath` | `ndf-layer-breath` | `ndf-hide-breath` |
| `intention` | `ndf-layer-intention` | `ndf-hide-intention` |
| `comments` | `ndf-layer-comments` | `ndf-hide-comments` |

### HTML structure example
```html
<div class="ndf-piece ndf-hide-meter ndf-hide-breath">
  <span class="ndf-annotation ndf-layer-chord">Am</span>
  <span class="ndf-annotation ndf-layer-meter">2/4</span>
  <span class="ndf-annotation ndf-layer-chord ndf-needs-review">G</span>
</div>
```

### CSS rules
```css
/* Hide layer annotations only when NOT in needsReview state */
.ndf-piece.ndf-hide-chord      .ndf-annotation.ndf-layer-chord:not(.ndf-needs-review)      { display: none; }
.ndf-piece.ndf-hide-meter      .ndf-annotation.ndf-layer-meter:not(.ndf-needs-review)      { display: none; }
.ndf-piece.ndf-hide-breath     .ndf-annotation.ndf-layer-breath:not(.ndf-needs-review)     { display: none; }
.ndf-piece.ndf-hide-intention  .ndf-annotation.ndf-layer-intention:not(.ndf-needs-review)  { display: none; }
.ndf-piece.ndf-hide-comments   .ndf-annotation.ndf-layer-comments:not(.ndf-needs-review)   { display: none; }

/* needsReview annotations are ALWAYS visible regardless of layer toggle */
.ndf-annotation.ndf-needs-review { display: inline; }
```

**Rule:** An annotation with `status: 'needsReview'` is always visible to the user,
even if its layer is toggled off. The warning indicator must never be hidden.

### Toggle flow
1. User taps layer toggle in side panel
2. Angular adds/removes `ndf-hide-{kind}` class on the container — **0ms re-render**
3. `PieceSnapshot.layerVisibility` is updated in memory
4. `SnapshotRepository.save()` persists the updated `layerVisibility` only

### Default layer visibility (new piece, no snapshot yet)
| LayerKind | Default |
|---|---|
| `chord` | true (visible) |
| `meter` | false (hidden) |
| `breath` | false (hidden) |
| `intention` | false (hidden) |
| `comments` | false (hidden) |

---

## Piece.updatedAt on anchor changes

When the annotation system inserts or removes anchor tags from `Piece.content`
(UC-AS-01, UC-AS-03), the piece must be persisted with an updated `updatedAt`.

**Rule:** `updatedAt` reflects the last time the user worked on the piece,
including annotation work. This ensures the work list sort (most recently
updated first) shows the piece the user was most recently annotating at the top.

**Implementation:** any use case that modifies `Piece.content` for anchor
reasons must call `PieceRepository.save()` with the updated `updatedAt`.
This is the responsibility of the use case, not the repository.

---

## Port

```ts
// core/ports/snapshot-repository.port.ts
interface SnapshotRepository {
  getByPieceId(pieceId: string): Promise<PieceSnapshot | null>;
  save(snapshot: PieceSnapshot): Promise<void>;
  deleteByPieceId(pieceId: string): Promise<void>;
}
```

Note: `LayerStateRepository` does not exist. Layer state is always accessed
through `SnapshotRepository` via `PieceSnapshot.layerVisibility`.

---

## Use Cases

### UC-SS-01: Generate Snapshot
**Trigger:** 5s inactivity timer fires, or user exits editing mode
**Behavior:**
- Load piece and all its annotations
- Call renderer: `renderPiece(piece, annotations) → html`
- Load existing snapshot to preserve current `layerVisibility` (or use defaults if none)
- Save new `PieceSnapshot` with updated `html` and `generatedAt`
- Persist via `SnapshotRepository.save()`
- Always runs in background — never blocks the UI

---

### UC-SS-02: Load Snapshot for Visualization
**Trigger:** User opens a piece in visualization mode
**Behavior:**
- Load `PieceSnapshot` via `SnapshotRepository.getByPieceId(pieceId)`
- If snapshot exists:
  - Inject `html` into the view container (no Angular rendering)
  - Apply CSS hide classes based on `layerVisibility`
- If no snapshot exists:
  - Display plain `Piece.content` immediately (no annotations)
  - Show non-blocking message: "Annotations are being processed and will appear shortly"
  - Trigger background snapshot generation (UC-SS-01)
  - When complete, replace plain text with rendered snapshot automatically

---

### UC-SS-03: Invalidate Snapshot on Change
**Trigger:** Any of the following:
- `Piece.content` changes (UC-PM-04)
- Any `Annotation` is created, updated, or deleted (UC-AS-01, UC-AS-02, UC-AS-03, UC-AS-04)
- Any `AnchorMark` is created or deleted (UC-AS-01, UC-AS-03)

**Behavior:**
- Mark snapshot as stale (set a flag or clear `generatedAt`)
- Start or reset the 5s inactivity debounce timer
- The user continues working — no interruption

---

### UC-SS-04: Delete Snapshot
**Trigger:** Piece is deleted (UC-PM-06)
**Behavior:**
- `SnapshotRepository.deleteByPieceId(pieceId)`

---

## Renderer Contract

```ts
// core/infrastructure/renderer/piece-renderer.ts
function renderPiece(piece: Piece, annotations: Annotation[]): string
```

Rules:
- Pure function — no side effects, no Angular, no IndexedDB
- Receives piece with anchor tags in content
- Replaces anchor zones with annotation HTML elements using CSS classes per the naming convention above
- All annotations always rendered (visibility handled by CSS, not renderer)
- Annotations with `status: 'needsReview'` receive class `ndf-needs-review`
- Can be unit tested in isolation

---

## Non-Goals (MVP)
- No snapshot versioning or diff
- No partial snapshot updates (always full regeneration)
- No background Web Worker for rendering (future optimisation if needed)
- No user-configurable generation timing (future: on-exit / 5s / 2s)
