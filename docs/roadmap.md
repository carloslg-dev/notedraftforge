# NoteDraftForge — Roadmap

## Now (next 1–2 weeks)
- Improve song detail editor UX (guided fields, safer JSON editing, validation)
- Add generic entity editors for authors/singers/styles (CRUD with in-memory store)
- Strengthen import/export validation and error messaging
- Persist language/user prefs reliably; prepare hooks for local persistence

## Next (1–2 months)
- Local persistence layer (LocalStorage/IndexedDB) for songs and catalogs
- Snapshot export/print templates (PDF/print-friendly HTML) with selection state
- Optional backend adapter contract (e.g., FastAPI/Java) and auth hookup
- Accessibility and theming pass on Material components

## Later
- Full backend sync (multi-user, conflict handling, versioning)
- AI-assisted helpers (chord suggestions, lyric variants, snapshot composition hints)
- Collaborative workflows (branching/merging UX, comments)
- Offline-first and PWA support
