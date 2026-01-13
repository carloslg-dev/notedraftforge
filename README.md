# NoteDraftForge

NoteDraftForge is a lightweight, modular workspace for writing and arranging songs in blocks (sections, lines, chords, lyrics). It focuses on quick iteration, language flexibility, and safe experimentation before wiring a persistent backend.

The current Angular app ships with a song list, detail view, and in-memory CRUD. Mock data lives in JSON files under `assets/mock`, letting contributors evolve UX and data models without backend friction.

## Features (current)
- Song list with side navigation and detail view
- Block-based song rendering (sections, lines, chords/lyrics)
- In-memory create/update/delete with immediate UI updates (no persistence on reload)
- Import/Export songs as JSON (download/upload)
- Multi-language UI (EN/ES) via a lightweight translations table
- Snapshot builder prototype for selecting songs
- Angular Material-driven UI components

## Non-goals / limitations (for now)
- No persistent storage; data resets on reload
- No backend sync or auth flows (auth service is a dev stub)
- Song sections edited as raw JSON (no visual block editor yet)
- Snapshots are selection-only (no print/export)
- Mock catalogs for authors/singers/styles are static

## Tech stack
- Angular 21, TypeScript
- Angular Material and CDK
- RxJS
- Karma/Jasmine for tests

## Local setup
- Node: 18+ (LTS recommended)
- Install: `npm install`
- Run dev server: `npm start`
- Build: `npm run build`
- Test: `npm test`
- Lint: `npm run lint`

## Project structure (high level)
- `src/app/core` — models, services (song data, library store), i18n utilities
- `src/app/features` — feature modules (songs, snapshots)
- `src/app/shared` — shared UI/modules (future growth)
- `src/assets/mock` — seed JSON (songs, authors, singers, styles)

## Workflow
- Use feature branches per task; open PRs for review before merging
- Track work with GitHub issues linked to PRs when possible
- Keep changes scoped and atomic; prefer small, focused PRs

## Roadmap (short)
- Improve song detail editor UX (safer JSON editing, helpers)
- Persist library locally (LocalStorage/IndexedDB) before backend
- CRUD for authors/singers/styles via generic editors
- Better import/export validation and error surfacing
- Snapshot export/print templates and narrative workspace ordering
- Optional backend adapter (e.g., FastAPI/Java) with real auth
- Expand i18n coverage and add more locales
- Extend block model to narratives (chapters/paragraphs) and poetry (verses)
- Visual chord/tension cues (color-coded notes, secondary line for tensions)

---

## 💬 Contact

Ideas, feedback or collaboration proposals are welcome.
