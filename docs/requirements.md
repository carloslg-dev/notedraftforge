# NoteDraftForge — Functional Requirements (current build)

## RQ-01 Library load from mock data
- **Description**: The app loads the initial library (songs, authors, singers, styles) from JSON files under `assets/mock` at startup.
- **Acceptance criteria**:
  - On first navigation, the app requests `songs.json`, `authors.json`, `singers.json`, `styles.json`.
  - Loaded data is available to song list, song detail, and snapshot views without manual refresh.
  - If files load successfully, the in-memory store is populated once per session.
- **Notes/assumptions**: No retry/backoff; errors are surfaced via console or Angular defaults.

## RQ-02 Songs list navigation
- **Description**: A side navigation lists all songs and routes to the selected song detail.
- **Acceptance criteria**:
  - List shows song title in the active UI language and the base key.
  - Clicking a song updates the detail outlet without reloading the whole page.
  - A placeholder message appears when no song is selected.
- **Notes/assumptions**: List order follows the loaded array; no sorting/filtering yet.

## RQ-03 Song detail rendering
- **Description**: The detail view renders a song’s sections, lines, and blocks with chords and lyrics.
- **Acceptance criteria**:
  - Sections render in sequence with their `name`.
  - Each line renders all blocks; chords show when present; lyrics show in the active language (fallback to first available).
  - Chord changes between adjacent blocks are visually marked.
- **Notes/assumptions**: Melody field exists in the model but is not displayed.

## RQ-04 In-memory CRUD with immediate UI updates
- **Description**: Users can create, edit, and delete songs; changes update the UI in the current session only.
- **Acceptance criteria**:
  - “New” navigates to a blank song prefilled with minimal defaults and enables edit mode.
  - “Edit” toggles form fields; “Save” validates required fields and updates the in-memory store.
  - “Delete” removes the song from the list and navigates back to the list.
  - After save/delete, the list and detail reflect changes without reload.
- **Notes/assumptions**: Data resets on page reload; IDs auto-generate if empty on create; validation is minimal (e.g., sections JSON must parse).

## RQ-05 Export/Import songs as JSON
- **Description**: Users can download all songs as JSON and import songs from a JSON file.
- **Acceptance criteria**:
  - Export produces a `songs.json` download reflecting current in-memory songs.
  - Import reads a chosen file; if it is a valid JSON array of songs, it replaces the in-memory list and updates the UI.
  - Import errors show a translated error message; original list remains unchanged on failure.
- **Notes/assumptions**: Shape validation is shallow (array check); import/export covers songs only (not authors/singers/styles).

## RQ-06 Multi-language UI selection
- **Description**: Users can switch between supported UI languages (EN/ES) via a toggle.
- **Acceptance criteria**:
  - Switching language updates visible labels and text immediately.
  - Selected language persists in `localStorage` and is restored on next load when available.
  - Missing translations fall back to the defined fallback language.
- **Notes/assumptions**: Only EN/ES are shipped; content fields fall back to the first available language if the selected one is missing.

## RQ-07 Snapshots selection
- **Description**: A snapshot builder lets users select songs for a future export/print flow.
- **Acceptance criteria**:
  - Snapshot page lists all songs with selectable options.
  - Users can toggle selections and clear all; selection count updates live.
  - Selections are kept in memory during the session.
- **Notes/assumptions**: No export/print is implemented yet; feature is a selection-only prototype.

## Planned extensions (not yet implemented)
- Narrative blocks: chapters composed of paragraph blocks; snapshots act as workspaces to reorder narrative parts and experiment with story flow.
- Poetry mode: stanzas with verse blocks, using the same block-based rendering.
- Enhanced song editing: friendlier block/line grouping, color-coded chords, and a tension line to surface extensions (7th/5th/sharp/flat/diminished) for performers.
