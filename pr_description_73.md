Closes #73

## Summary of changes
- Replaced the 'Not implemented' stubs in the Dexie infrastructure with full Dexie method implementations.
- Implemented `NotedraftDatabase` in `src/core/infrastructure/adapters/dexie/db.ts` to interact securely with the `notedraftforge` IndexedDB instance, defining `pieces`, `annotations`, and `snapshots` schemas.
- Modified tests for the Dexie persistence repositories from expecting 'Not implemented' errors to verifying mock database calls.
- Established rigorous runtime validation by defining canonical domain Zod schemas in `backup-schema.ts` and linking them directly via `ZodBackupValidator`.
- Installed dependencies `zod` and `dexie`.

## Checklist of Acceptance Criteria
- [x] `dexie` and `zod` are installed and included in `package.json`.
- [x] A singleton Dexie database instance is configured.
- [x] All 4 Dexie repository adapters implement their respective interface methods against the real database.
- [x] The `SystemRestorePort` successfully executes an atomic transaction to wipe and rewrite all tables.
- [x] A canonical set of Zod schemas validates domain integrity dynamically at system boundaries.
- [x] All tests pass without the `Not implemented` errors.

## Ambiguities Found
- None
