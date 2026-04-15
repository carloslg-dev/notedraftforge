# Spec: Annotation System

> References: `openspec/domain-model.md`, `openspec/terminology.md`

## Purpose
Allow the user to attach structured annotations to text zones (AnchorMarks) within a Piece,
grouped by independent fixed layers, with automatic integrity maintenance when the Piece
content is edited.

---

## Use Cases

### UC-AS-01: Add Annotation
**Trigger:** User selects a text range and taps "add annotation" in the Contextual FAB
**Available in:** both visualization mode and editing mode

#### Step 1 — Kind selection (Contextual FAB)
The FAB shows the 5 annotation kinds as tappable options:
- `Chord`
- `Meter`
- `Breath`
- `Intention`
- `Comment`

The user selects a kind. This determines which modal form is shown.

#### Step 2 — Anchor resolution
Before opening the modal, the system checks the selected text range:

- **If the range exactly matches an existing AnchorMark:** reuse that anchor.
  No new anchor tag is inserted into `Piece.content`.
- **If no AnchorMark exists for that range:** create a new `AnchorMark`,
  insert `<!--{id}s-->` and `<!--{id}e-->` into `Piece.content` at the
  selected positions, persist via `AnchorRepository.save()`, and persist
  the updated `Piece` via `PieceRepository.save()` with `updatedAt` refreshed.
- **Empty range (start === end):** valid — creates a punctual anchor
  (e.g. for instrumental measures with no lyrics: `<!--a2s--><!--a2e-->`).

**Note on visualization mode:** inserting anchor tags modifies `Piece.content`
but this is a **system-level operation**, not a user text edit. The rule
"text cannot be modified in visualization mode" refers to direct user editing
of the text. System anchor insertion is permitted in both modes.
#### Step 3 — Annotation modal

**Layout rules:**
- Mobile: bottom sheet, leaves selected text visible above when possible
- Desktop: overlay so selected text remains visible below; pushes content down if near top
- Tapping/clicking outside does nothing (no accidental dismiss)
- Two explicit actions: **Save** and **Close**
- Closing without saving discards silently (user chose Close explicitly)

**Modal — Chord:**
- Root selector: tag buttons `A B C D E F G`, one at a time
- Modifier toggles:
  - Alteration (mutually exclusive): `#` (sharp) / `b` (flat)
  - Mode (mutually exclusive): `m` (minor) / `M` (major)
  - Extension: `7` (seventh)
- Live preview of composed chord (e.g. `C#m7`), updates as user taps
- Manual text fallback: if parseable into root + modifiers → stored as structured; if not → inline error
- Future (post-MVP): "Recent chords in this piece" quick-select section

**Modal — Meter:**
- Text input for rhythmic value (e.g. `4/4`, `3/4`, `2/4`), non-empty required

**Modal — Breath:**
- Two large tap targets: `S` (Short) / `L` (Long)
- Always user-chosen — no automatic suggestion

**Modal — Intention:**
- Multiline text input, non-empty required
- Note: "This is personal — only you can see and write here"

**Modal — Comment:**
- Multiline text input, non-empty required

**Layer assignment:**
The layer is fixed per kind — the modal shows no layer picker.
Kind → layer mapping is defined in domain-model.md.

#### Step 4 — Save
- Validate all inputs (see below)
- Generate UUID for annotation `id`
- Set `layerId` from kind (fixed mapping)
- Set `status` to `valid`
- If kind is `chord`: compute and store `display`
- Persist via `AnnotationRepository.save()`
- Mark `PieceSnapshot` as stale → trigger regeneration
- Close modal
- Render new annotation immediately in current view

**Validation:**
- `anchorId` must reference a valid `AnchorMark` in the same piece
- `chord`: `root` required, modifiers valid per domain rules
- `meter`: non-empty string
- `breath`: must be `S` or `L`
- `intent`: non-empty string
- `comment`: non-empty string

---

### UC-AS-02: Edit Annotation
**Available in:** editing mode only
**What can be edited:** `content` only. `kind` is immutable after creation — if a different kind is needed, delete and create a new annotation.
**Behavior:**
- Open annotation modal pre-populated with existing content value
- Apply changes on Save
- Re-validate content per kind rules
- If kind is `chord` and root or modifiers changed: recompute and store `display`
- Update via `AnnotationRepository.save()`
- Mark `PieceSnapshot` as stale → trigger regeneration
- `needsReview` status is NOT reset by editing — must be resolved via UC-AS-04

---

### UC-AS-03: Delete Annotation
**Available in:** editing mode only
**Behavior:**
- Delete via `AnnotationRepository.delete(id)`
- If the deleted annotation was the last one referencing its `AnchorMark`:
  - Remove the anchor tags from `Piece.content`
  - Delete the `AnchorMark` via `AnchorRepository.delete(anchorId)`
- Mark `PieceSnapshot` as stale → trigger regeneration

---

### UC-AS-04: Resolve needsReview Annotation
**Trigger:** User taps a needsReview annotation
**Available in:** both visualization mode and editing mode

**Rationale:** users can add annotations from visualization mode, so resolving
system-invalidated annotations there is consistent — no mode switch required.

**Options:**
- **Confirm:** the current anchor position is acceptable → set `status` to `valid`
- **Re-anchor:** user selects a new text range → create or reuse an `AnchorMark`
  at the new range, update `anchorId`, set `status` to `valid`
- **Delete:** remove the annotation (and its anchor if no other annotations reference it)

**Rule:** No automatic resolution. The user must act explicitly.

---

### UC-AS-05: Toggle Layer Visibility
**Trigger:** User taps the toggle for a layer in the side panel
**Available in:** both modes
**Behavior:**
- Flip the layer's value in `PieceSnapshot.layerVisibility`
- Add or remove the corresponding CSS hide class on the piece container
- Persist updated `PieceSnapshot.layerVisibility` via `SnapshotRepository.save()`
- Zero HTML re-render — CSS only

**Rule:** Does NOT invalidate or regenerate the snapshot HTML.

---

### UC-AS-06: Maintain Anchor Integrity on Content Edit
**Trigger:** `Piece.content` changes in editing mode
**Behavior:** After each edit, the system scans the updated content for anchor integrity.

#### Integrity check
For each `AnchorMark` of the piece:
- Verify both `<!--{id}s-->` and `<!--{id}e-->` are present in `Piece.content`
- Verify start tag appears before end tag

If either tag is missing or out of order:
- Mark all annotations referencing that `anchorId` as `status: 'needsReview'`
- Do NOT automatically remove or repair the anchor tags

**Rule:** Integrity check runs in a single pass after each content change. Never lazy.

---

## needsReview Lifecycle

| State | How entered | How exited |
|---|---|---|
| `valid` | on creation | stays valid unless anchor is corrupted |
| `needsReview` | anchor tag corrupted by edit | user confirms, re-anchors (→ valid), or deletes |

**UI rule:** `needsReview` annotations must be visually distinct (warning indicator).
Never silently hidden. Visible in both modes.

---

## Double-Action Protection

All annotation actions (save, delete, resolve) must be protected against duplicate
execution from double-taps or rapid clicks.

**Rule:** Use an `isProcessing` flag or RxJS `exhaustMap` on all action triggers.
A second trigger while an action is in progress is silently ignored.
No duplicate modals, no duplicate persists.

---

## Non-Goals (MVP)
- Anchor tag offsets are calculated on raw Markdown source, not on rendered HTML — the rendered HTML is not the source of truth for text positions
- Exported `.md` files never contain annotations or anchor tags — only clean Markdown
- No overlapping annotation conflict detection
- No annotation history or versioning
- No custom layer creation
- No exportable annotations in structured format (JSON, XML, etc.)
- No `dynamics` kind (future)
- No AI-generated `intent` annotations (AI may only write `comment`, future)
- No automatic S/L suggestion for `breath` — always user-chosen
