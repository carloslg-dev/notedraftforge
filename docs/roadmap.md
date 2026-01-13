# NoteDraftForge — Roadmap

This roadmap is a living document. It describes product milestones and the minimum quality gates required to call a version “done”.

## Versioning & Release Policy

- **Source of truth:** GitHub Releases / tags (recommended).
- **App version field (optional):** `package.json.version`.
- **Runtime display (optional):** expose `APP_VERSION` via `environment.ts` and render it in the UI footer/about screen.

### What “v1.0” means in this project

**v1.0 = stable + trustworthy for personal use.**  
Not “feature complete”, but “no fear of losing data” and “smooth day-to-day editing”.

To ship **v1.0**, the app must:
- Persist user data reliably (at least local persistence).
- Provide stable snapshot/export/print output.
- Offer a usable editor without forcing raw JSON editing (JSON can remain as an advanced mode).
- Pass CI + SonarCloud Quality Gate on `main`.
- Have basic accessibility + theming consistency.
- Include clear docs: setup, usage, data model, contribution guidelines.

---

## v0.5 — Technical Demo (target: this week)

**Goal:** public demo + technical credibility.

- Minimal CI pipeline (lint / test / build).
- SonarCloud integration + Quality Gate.
- GitHub Pages deployment.
- README updates (demo link, setup steps, contribution notes).
- Improve JSON validation feedback (clear errors, safe parsing, non-blocking UX).

**Definition of Done**
- `main` is always green (CI passing).
- Demo is reachable via Pages and matches `main`.
- SonarCloud reports are visible and enforced.

---

## v0.6 — Usable Demo (target: next 1–2 weeks)

**Goal:** smooth editing experience (in-memory is OK), minimal friction.

### Editor & UX
- Improve song detail editor UX:
  - guided fields for common data
  - safer JSON editing (advanced mode)
  - inline validation with actionable messages
- Strengthen import/export validation and error messaging.
- Persist language/user preferences reliably (prepare hooks for local persistence).

### Catalogs (in-memory CRUD)
- Generic entity editors for:
  - authors
  - singers
  - styles
  - tags (if not already covered)

### Visual Enhancements
- Visual chord cues:
  - color by root note
  - secondary line for tensions/extensions

**Definition of Done**
- A user can create/edit songs comfortably without fighting JSON.
- Import/export errors are understandable and never silently corrupt data.
- Language preference persists across reloads (even before full song persistence).

---

## v0.7 — Local Persistence + Output (target: next 1–2 months)

**Goal:** becomes a real personal tool.

- Local persistence for songs and catalogs:
  - LocalStorage (simple) or IndexedDB (scalable)
  - migrations for schema changes (basic)
- Snapshot export/print templates:
  - print-friendly HTML and/or PDF export
  - preserves selection state
- Accessibility and theming pass on Material components.
- Song editor ergonomics:
  - word grouping into chorded lines
  - richer block tooling

**Definition of Done**
- Data survives refresh/restart.
- Export/print is reliable and produces consistent results.

---

## v0.8 — Narrative & Poetry Model (target: 1–2 months, can overlap)

**Goal:** expand the block model beyond songs.

- Extend block model to:
  - narratives (chapters, paragraph blocks)
  - poetry (verses)
- “Workspaces” using snapshots:
  - reorder chapters/parts
  - experiment with story structures

---

## v0.9 — Optional Backend Adapter Contract (target: when needed)

**Goal:** prepare architecture for real sync without committing to full backend yet.

- Backend adapter contract (e.g., FastAPI or Java) + auth hook.
- Storage adapters:
  - memory / local / backend with a shared interface.
- Minimal sync prototype (optional) behind a feature flag.

---

## v1.0 — Stable Release

**Goal:** stable, reliable, and documented.

- Reliable persistence (at least local; backend/Drive can come later).
- Snapshots/versioning baseline (even linear history is acceptable).
- Usable editor with advanced JSON mode.
- CI + SonarCloud Quality Gate always enforced on `main`.
- Basic accessibility + theming consistency.
- Documentation:
  - user guide
  - data model reference
  - contribution workflow (issues/PRs/releases)

---

## Post v1.0 (Later)

- Full backend sync:
  - multi-user
  - conflict handling
  - versioning
- AI-assisted helpers:
  - chord suggestions
  - lyric variants
  - snapshot composition hints
- Collaborative workflows:
  - branching/merging UX
  - comments/reviews
- Offline-first and PWA support

---

## Notes / Open Questions

- Storage priority: Local-first vs Drive-first (Drive JSON sync may become the main persistence).
- Export priority: HTML print templates vs PDF generation (library choice, fidelity, maintenance).
- Data model evolution: how to migrate songs/blocks safely across versions.
