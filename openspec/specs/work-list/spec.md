# Spec: Work List

> References: `openspec/domain-model.md`, `openspec/specs/piece-management/spec.md`, `openspec/terminology.md`

## Purpose
Define list-level behavior for browsing Works (Pieces), filtering by structured tags, and navigating to a selected piece.

---

## Requirements

### WL-REQ-01 — List load and default order
When the Work List is opened, the system SHALL load all pieces via `PieceRepository.getAll()`.

Default sorting SHALL be `updatedAt` descending (most recently updated first).

### WL-REQ-02 — List item display
Each list item SHALL display:
- piece `title`
- type badge (resolved from `TagRef(kind="type")` or `Piece.type`)
- up to 2–3 user tags (`TagRef(kind="user")`) near/below title
- `updatedAt` information for recency context

Work List SHALL NOT display editor-internal payloads or Markdown source content.

### WL-REQ-03 — Type display semantics
Type semantics SHALL be consistent with structured tags:
- canonical type representation in tags is `TagRef(kind="type", value=<type>)`
- `Piece.type` remains valid typed metadata

If both are present, list presentation SHALL show the consistent type value.

### WL-REQ-04 — Structured filtering model
Filtering SHALL operate on `TagRef[]` structure, not plain string arrays.

Filter controls SHALL support:
- type tags (`kind="type"`)
- user tags (`kind="user"`)

Type and user filters SHALL NOT rely on mixed plain-string matching.

### WL-REQ-05 — User tag matching rules
User tag filter matching SHALL be case-insensitive on `TagRef.value`.

Type tags SHALL match by normalized type value (`text | poem | song`).

### WL-REQ-06 — Filter application behavior
Selected filters SHALL be applied client-side to loaded list data.

A piece SHALL match only when it satisfies all active filter criteria.

Clearing all filters SHALL restore full list visibility.

### WL-REQ-07 — Empty states
The system SHALL support two empty states:
1. **No pieces exist**
   - show empty-list message
   - show actions to create a work or restore a JSON backup
2. **No results after filtering**
   - show no-results message
   - preserve current filters until user clears/changes them

### WL-REQ-08 — Song type visibility in list
Song content is represented in the domain/data model for MVP2 readiness, but song UX is out of MVP.

If pieces of type `song` exist (for example from restored data or development fixtures), the Work List SHALL display them with a `song` badge and an explicit disabled/not-implemented state.

Song list items SHALL NOT navigate to song creation, editing, or viewing flows in MVP.

### WL-REQ-09 — Navigation behavior
Tapping a list item SHALL navigate to the piece flow entry defined by editor-mode specs.

List behavior SHALL remain independent from editor implementation internals.

### WL-REQ-10 — Type change scope in list
Work List SHALL NOT treat piece type changes as inline simple metadata edits.

Any type-change flow SHALL follow dedicated piece-management constraints (disabled or future migration flow).

### WL-REQ-11 — Tag search overlay for overflow tags
When the number of user tags exceeds the visible limit (desktop: 4 tags in the filter rail; mobile: 2 tags in the filter row), the Work List SHALL show a "···" chip.

Activating the "···" chip SHALL open a tag search overlay (desktop: popover anchored to the filter rail; mobile: bottom sheet).

The overlay SHALL:
- present a search input as the primary interface — no full tag list is rendered by default
- filter tags in real time as the user types (case-insensitive match against `TagRef.value`)
- show an empty-state hint ("Type to search your tags") when the search input is empty
- show a no-results state when the query returns no matches
- allow selecting a matching tag to apply it as the active filter and dismiss the overlay
- show the active overflow tag name inside the "···" chip when an overflow tag is selected, to indicate the active filter clearly

The overlay SHALL NOT render a flat unfiltered list of all tags — this design decision scales to 200+ tags.

---

## Scenarios

### WL-SCN-01 — Load and sort list
**GIVEN** multiple pieces with different `updatedAt` values
**WHEN** user opens Work List
**THEN** items appear ordered by `updatedAt` descending.

### WL-SCN-02 — Display tags and type
**GIVEN** a piece with `TagRef(kind="type", value="poem")` and several user tags
**WHEN** list item is rendered
**THEN** type badge shows `poem` and up to 2–3 user tags are displayed.

### WL-SCN-03 — Case-insensitive user tag filter
**GIVEN** piece tagged with `TagRef(kind="user", value="Rock")`
**WHEN** user filters by `rock`
**THEN** piece matches and remains visible.

### WL-SCN-04 — Combined type + user filter
**GIVEN** active filters `type=text` and user tag `draft`
**WHEN** list is filtered
**THEN** only pieces matching both criteria are shown.

### WL-SCN-05 — Empty list state
**GIVEN** repository has zero pieces
**WHEN** user opens Work List
**THEN** empty-list state is shown with create and restore-backup actions.

### WL-SCN-06 — Empty results after filter
**GIVEN** pieces exist but none match active filters
**WHEN** filters are applied
**THEN** no-results state is shown while filters remain active.

### WL-SCN-07 — Song entries disabled
**GIVEN** at least one piece of type `song`
**WHEN** Work List is displayed
**THEN** song pieces appear with a `song` type badge and disabled/not-implemented state, without navigation to song UX.

### WL-SCN-08 — Tag search overlay filters in real time
**GIVEN** the user opens the "···" tag overflow overlay and types "stage"
**WHEN** the search query matches tags with "stage" in their value
**THEN** only matching tags are shown as selectable chips; non-matching tags are hidden.

### WL-SCN-09 — Selected overflow tag shown in chip
**GIVEN** the user selects the overflow tag "quiet" through the search overlay
**WHEN** the overlay closes and the filter is active
**THEN** the "···" chip displays "quiet" to indicate the active overflow filter.

---

## Non-Goals (MVP)
- No list-level editing of structured `Piece.content`
- No inline type migration flow from list items
- No dependence on Markdown/source rendering in list
- No bulk operations (multi-delete, multi-export)
- No advanced search/ranking beyond defined filters and default sort
