# MVP UX Scope

## Purpose
Define the minimum UX scope for wireframes, strictly limited to current MVP behavior.

## In Scope (MVP)

### Core Screens
1. **Work List**
   - List pieces sorted by `updatedAt` desc
   - Type badge + user tags
   - Structured tag filters
   - Empty states (no pieces / no filter results)

2. **Piece View — Visualization mode (default)**
   - Read-only snapshot view
   - Layer visibility toggles
   - Add/resolve annotation interactions (only when snapshot exists)
   - Start/stop auto-scroll only if retained by final MVP decision

3. **Piece View — Editing mode**
   - Structured text/poem content editing via Tiptap adapter
   - Metadata editing (title/language/user tags)
   - Return to visualization mode
   - No annotation create/update/delete in MVP editing mode

4. **Backup / Restore**
   - Complete JSON backup export for all local works, annotations, and layer visibility state before version updates
   - Complete JSON restore from backup
   - Restore warning that current local data will be replaced
   - Zod-validated import boundary before applying restored data

### Piece Types in MVP UX
- MVP UX focuses on `text` and `poem` pieces.
- Song exists in the domain/data model only so MVP2 can add song UX without a core refactor.
- Song creation/editing/viewing UX is not in MVP.
- If `song` records appear in UI (for example from restored data or development fixtures), they must be explicitly disabled/not implemented and must not route into song creation/editing/viewing.

## Global UX Rules
- Two modes only: `visualization` and `editing`
- Visualization is default when opening a piece
- Annotation actions require an available snapshot
- Editing mode does not expose layer visibility controls
- Editing mode does not include annotation actions

## Explicitly Out of Scope (NOT MVP)
- Song UX (creation/edit/view) and advanced song tooling
- Chord/meter editing, song grid, pitch/notation, rehearsal/focus flows
- Markdown import/export UX flows
- Annotations while editing
- AI features
- Collaboration/multi-user flows
- Version history/timeline
- Advanced formatting toolbar
- Advanced search
- Workspace/grouping UX
