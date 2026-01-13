# NoteDraftForge — Architecture Overview

## High-level view
- **UI layer**: Standalone Angular components (songs list, song detail, snapshot builder, language selector) built with Angular Material.
- **Services layer**: `SongDataService` loads mock JSON via `HttpClient`; `LibraryService` holds an in-memory store (BehaviorSubject) and exposes queries/mutations; `I18nService` handles translation lookups and language state.
- **Data flow**: On app init, the songs feature triggers `LibraryService.init()`, which fetches mock data and stores it in memory. Components subscribe to `LibraryService` streams for reactive updates; CRUD operations mutate the in-memory state.

## Key services
- **SongDataService**: Fetches `songs.json`, `authors.json`, `singers.json`, `styles.json` from `assets/mock` using `forkJoin`.
- **LibraryService**: In-memory store for the library; provides getters (songs/authors/singers/styles), lookup by id, add/update/delete songs, import/export songs. Shares data via observables with `shareReplay` and guards initialization.
- **I18nService + TranslatePipe**: Maintains current `LangCode` (EN/ES), persists it to `localStorage` when available, and resolves translation keys from a simple `translations.ts` map with fallback language. `TranslatePipe` is impure to react to language changes.

## Data model summary
- **Song**: `id`, multi-language `title`, `authorId`, `styleId`, optional `rhythm`, `baseKey`, `singers` array, optional `tags`, and `song.sections` (sections -> lines -> blocks with chords/melody/lyrics).
- **Author**: `id`, `name`, optional `alias`.
- **Singer**: `id`, `name`.
- **Style**: `id` (typed union) and `label`.

## Rationale
- **In-memory first**: Speeds UX iteration and model evolution without backend contracts. Easier to demo and test feature ideas.
- **Mock JSON seed data**: Keeps content versioned in the repo, enables quick edits, and mirrors future import/export shapes.
- **Standalone components + feature folders**: Reduces module boilerplate and keeps features isolated for routing/lazy loading later.
- **Material UI**: Provides consistent theming and ready-made components to focus on flow rather than custom styling.
- **Simple translations file**: Lightweight alternative to full i18n libs, adequate for early-stage EN/ES toggling.

## Future integration options
- Persist locally via `localStorage` or IndexedDB as an intermediate step.
- Add a backend adapter layer (e.g., FastAPI or Java/Spring) for real persistence, auth, and collaboration flows.
- Extend translation loading to remote JSON bundles or a dedicated i18n library if scale requires.
- Extend the block model to additional domains:
  - Narratives: chapters containing paragraph blocks; snapshots act as workspaces to reorder chapters/sections for story experiments.
  - Poetry: verses as blocks within stanzas.
  - Music notation: chord rendering with color-coded notes and a secondary line for tensions/extensions (7th, 5th, sharp/flat, diminished) to aid performers.

## Testing approach
- **Current**: Unit tests via Karma/Jasmine (service specs present; components can be tested with Angular TestBed).
- **Planned**: Broader service coverage for library/i18n behavior; component tests for CRUD flows and error states; e2e/regression once routing and persistence stabilize.
