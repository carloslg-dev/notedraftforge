1. **Ports**: Create `BackupValidatorPort` (`src/core/ports/backup-validator.port.ts`) and `SystemRestorePort` (`src/core/ports/system-restore.port.ts`).
2. **Validation Adapter**: Create `ZodBackupValidator` (`src/core/infrastructure/validation/zod-backup-validator.ts`) implementing `BackupValidatorPort` with a Zod schema that enforces structural integrity, `version === '1'`, and invariant metadata consistency (`Piece.type` == `content.kind` == type tag value).
3. **Application Layer**: Create `RestoreBackupUseCase` (`src/core/application/piece-management/restore-backup.use-case.ts`) that calls the validator, extracts pieces, annotations, and snapshots, and passes them to `SystemRestorePort.replaceAllData()` for atomic persistence.
4. **Persistence Adapter**: Create a stub `DexieSystemRestoreRepository` (`src/core/infrastructure/adapters/dexie/system-restore-repository.ts`) that throws 'Not implemented' for now (following the pattern of existing Dexie adapters).
5. **UI Component**: Create `RestoreBackupModal` (`src/ui/features/work-list/components/RestoreBackupModal.tsx`) providing file upload / paste textarea, a prominent warning that this replaces ALL data and cannot be undone, and a confirmation flow.
6. **UI Hook & Wiring**: Create `useRestoreBackup` to connect the Use Case, and integrate the modal in `WorkListPage.tsx` on the 'Restore Backup' buttons.
7. **Tests**: Add unit tests for `RestoreBackupUseCase` and `ZodBackupValidator` checking invariants, success, and failure cases.
8. **Pre-commit**: Run pre-commit instructions to ensure everything passes.
