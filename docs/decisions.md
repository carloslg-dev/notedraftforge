# NoteDraftForge — Lightweight ADRs

## ADR-001: Standalone components and feature-first structure
- **Context**: Early-stage app with a small set of screens; Angular supports standalone components and feature folders.
- **Decision**: Use standalone components grouped by feature (`features/songs`, `features/snapshots`) plus `core` for shared services/models/i18n.
- **Consequences**: Less module boilerplate; simpler routing; easy to add lazy loading later; requires Angular 15+ (met).

## ADR-002: Angular Material as primary UI kit
- **Context**: Need fast UI scaffolding with responsive layouts and accessibility defaults.
- **Decision**: Build UI with Angular Material/CDK components for navigation, forms, lists, and buttons.
- **Consequences**: Faster delivery and consistent theming; some visual sameness unless customized; future design refresh may need custom theming.

## ADR-003: In-memory library before persistence
- **Context**: Features are still evolving; persistence contracts are undecided.
- **Decision**: Keep the library in a `BehaviorSubject` managed by `LibraryService`; reload resets state.
- **Consequences**: Rapid iteration and safe refactors; users lose changes on refresh; later persistence (local or backend) will need migration logic.

## ADR-004: Mock JSON as seed data
- **Context**: Need realistic sample data without backend dependencies.
- **Decision**: Store `songs/authors/singers/styles` under `assets/mock` and load them via `SongDataService`.
- **Consequences**: Deterministic startup and easy editing in-repo; does not scale to user-generated data; importing only replaces songs, not other entities.

## ADR-005: Simple translations table (translations.ts)
- **Context**: Bilingual UI (EN/ES) with few strings; full i18n frameworks would add overhead.
- **Decision**: Use a static `translations.ts` map with a custom `TranslatePipe` and `I18nService` for language state and persistence.
- **Consequences**: Minimal dependency surface and instant lookups; limited tooling (no extraction/plurals); adding many locales may require a more robust i18n solution later.
