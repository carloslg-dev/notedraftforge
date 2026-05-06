# Spec: Piece Management

> References: `openspec/domain-model.md`, `openspec/terminology.md`

## Purpose
Define the canonical behavior for creating, reading, updating, deleting, importing, and exporting `Piece` entities using the structured domain model (`PieceContent`, `TagRef`, revision tracking). This spec is behavior source of truth and is independent from UI implementation details.

---

## Requirements

### PM-REQ-01 — Create piece
The domain/application model SHALL allow creating a new `Piece` with:
- `title`
- `type` (`text | poem | song`)
- empty structured content matching `type`

MVP user-facing creation UI SHALL expose `text` and `poem` only. `song` remains supported by the domain/data model for MVP2 readiness and restored data compatibility.

The system SHALL initialize on creation:
- `id` (UUID)
- `createdAt` / `updatedAt` (ISO 8601 current datetime)
- `revision = 0`
- `tags` as `TagRef[]` including a system-managed type tag `TagRef(kind="type", value=<piece type>)`

The system SHALL create empty structured content by type:
- `text` → `TextPieceContent` with empty `blocks`
- `poem` → `PoemPieceContent` with empty `blocks`
- `song` → `SongPieceContent` with empty `sections`

### PM-REQ-02 — Persist structured content
The system SHALL persist `Piece.content` as structured domain data (`PieceContent`).

The system SHALL NOT persist raw Markdown as canonical `Piece.content`.

### PM-REQ-03 — Read piece list
When the user requests the work list, the system SHALL load pieces from `PieceRepository.getAll()` and expose piece metadata needed by application/UI layers.

### PM-REQ-04 — Update piece content
When piece content changes, the system SHALL:
- persist updated structured `Piece.content`
- update `updatedAt`
- increment `Piece.revision`

### PM-REQ-05 — Update piece metadata
For MVP, metadata-only updates apply to:
- `title`
- `language`
- user tags (`TagRef(kind="user", ...)`)

When metadata-only fields change, the system SHALL persist those changes without content migration.

For MVP, changing `Piece.type` SHALL NOT be treated as a simple metadata update because it may require migration between `PieceContent` variants.

`Piece.type` changes are either:
- disabled in MVP, or
- handled by a dedicated future migration flow defined in a separate spec/use case.

### PM-REQ-06 — Structured tags
The system SHALL store tags as `TagRef` objects.

`TagRef` SHALL include:
- `kind` (`type | user`)
- `value`

The system MUST keep exactly one system-managed type tag per piece and MUST allow user-defined tags as `kind="user"`.

### PM-REQ-07 — Revision tracking
The system SHALL increment `Piece.revision` when:
- content changes
- annotations change

Metadata-only changes (title/language/user tags) SHALL NOT increment `revision`.

### PM-REQ-08 — Delete piece
When a piece is deleted, the system SHALL delete the piece and all related persistence records through ports/adapters (annotations, snapshots, and any other piece-scoped artifacts).

### PM-REQ-09 — Markdown import
The system SHALL accept Markdown as an external import format.

The system SHALL convert imported Markdown into structured `PieceContent`.

Unsupported Markdown structures SHALL be ignored or simplified.

Import defaults SHALL be:
- `type = "text"`
- structured text content (`TextPieceContent`)
- system-managed type tag `TagRef(kind="type", value="text")`
- `revision = 0`

### PM-REQ-10 — Markdown export
The system SHALL export structured `Piece.content` into Markdown as an external format.

The export SHALL NOT include internal annotation metadata, system metadata, or adapter-specific/internal state.

The export operation SHALL be read-only and SHALL NOT mutate stored piece data.

### PM-REQ-11 — JSON backup export
The system SHALL allow the user to export a complete backup of all durable local data needed to protect work before app version updates.

The backup SHALL include:
- all pieces
- all annotations
- per-piece layer visibility state

Snapshot HTML is derived data and MAY be omitted from the backup as long as restored pieces can regenerate snapshots.

The exported JSON SHALL conform to the following top-level structure:
```
{
  version: string,         // schema version, currently "1"
  exportedAt: string,      // ISO 8601 datetime
  pieces: Array<Piece & {
    annotations: Annotation[],
    layerVisibility?: Record<LayerKind, boolean>
  }>
}
```

The export operation SHALL:
- include all pieces, their associated annotations, and their layer visibility state
- be read-only and SHALL NOT mutate any stored data
- use the filename pattern `notedraftforge-backup-<YYYY-MM-DD>.json`
- remain independent of any sync or backend; it is a local file download

### PM-REQ-12 — JSON backup import (restore)
The system SHALL allow the user to restore all data from a previously exported JSON backup file.

The restore flow SHALL:
- accept JSON via paste (textarea) or file upload
- validate the JSON structure against the backup schema (via Zod boundary validation, per D-20) before applying any changes
- warn the user with a clear, prominent message that the restore operation **replaces all current data** (pieces, annotations, and layer state) and cannot be undone
- require explicit user confirmation before applying
- apply restore atomically: either all data is replaced or the operation is aborted

The system SHALL reject any backup JSON that:
- does not parse as valid JSON
- fails schema validation
- has an unsupported `version` value

---

## Scenarios

### PM-SCN-01 — Create empty text piece
**GIVEN** the user creates a new piece
**WHEN** type is `"text"`
**THEN** the system creates a `Piece` with `TextPieceContent` and empty `blocks`.

### PM-SCN-02 — Create piece with type tag
**GIVEN** the user creates a new piece of type `"poem"`
**WHEN** creation is persisted
**THEN** the system assigns `TagRef(kind="type", value="poem")`.

### PM-SCN-03 — Persist structured content update
**GIVEN** an existing piece with structured content
**WHEN** content is edited
**THEN** the system persists updated `PieceContent` and increments `Piece.revision`.

### PM-SCN-04 — Import markdown into structured model
**GIVEN** the user imports a Markdown file
**WHEN** the file contains headings and paragraphs
**THEN** the system maps content into `TextBlock` and `TextRun` structures.

### PM-SCN-05 — Export markdown from structured model
**GIVEN** an existing piece with structured content and annotations
**WHEN** the user exports to Markdown
**THEN** the system outputs Markdown without internal annotation/system metadata.

### PM-SCN-06 — Revision on annotation change
**GIVEN** a piece with current `revision = N`
**WHEN** an annotation is created, updated, or deleted
**THEN** the system persists `revision = N + 1` for the piece.

### PM-SCN-07 — Export full JSON backup
**GIVEN** a user has two pieces with annotations
**WHEN** the user opens Backup and clicks "Download .json"
**THEN** the system generates a JSON file with `{ version: "1", exportedAt, pieces: [...] }` including all annotations and layer visibility state, and triggers a browser download with filename `notedraftforge-backup-<date>.json`.

### PM-SCN-08 — Restore backup replaces all data
**GIVEN** a user pastes valid backup JSON in the Restore tab
**WHEN** the user confirms restore after reading the warning banner
**THEN** the system validates the JSON, clears all existing data, and replaces it with the backup content.

### PM-SCN-09 — Restore rejects invalid JSON
**GIVEN** a user pastes malformed JSON or JSON that fails schema validation
**WHEN** the user clicks "Restore backup"
**THEN** the system shows a validation error and does not modify any stored data.

---

## Non-Goals (MVP)
- No version history or branching
- No sync/backend persistence
- No multi-piece export to individual Markdown files (batch Markdown export)
- No workspace/collection ownership in `Piece`
- No requirement to preserve all advanced Markdown constructs losslessly in MVP import
- No incremental/merge import (restore always replaces all data)
