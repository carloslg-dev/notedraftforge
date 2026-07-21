1. **Zod Validation Schema (`src/core/infrastructure/validation/backup-schema.ts`)**
   - Create a Zod schema `backupSchema` representing `BackupData` from `export-backup.use-case.ts`.
   - Validate structure, `version === '1'`, and invariant "Piece type metadata consistent" (Piece.type == Piece.content.kind == Type Tag).
   - Export `validateBackupData(jsonString): BackupData`.

2. **Restore Use Case (`src/core/application/piece-management/restore-backup.use-case.ts`)**
   - Class `RestoreBackupUseCase` depending on `PieceRepository`, `AnnotationRepository`, `SnapshotRepository`.
   - Has a port or injection of the validation function (or just uses the validator directly to follow Hexagonal rules, but D-20 says "Zod validation at boundary before domain mutation"). The application layer doesn't depend on zod directly, but it can use an injected validator function or call a mapper that uses zod. Actually, Zod schema can be called inside an infrastructure service `BackupValidator`, and we pass `BackupValidator` port to the use case.
   - Let's create `src/core/ports/backup-validator.ts`
     ```ts
     import type { BackupData } from '../../application/piece-management/export-backup.use-case';
     export interface BackupValidator {
       validate(jsonString: string): BackupData;
     }
     ```
   - Actually, a port for BackupValidator is good, or a port `validateBackup`. Or just a simpler `validate(json: string): BackupData` function.
   - Use Case execution:
     - calls `validate(json)` - throws error if invalid
     - Atomic replace-all. Since Dexie has `clear()` we need to add `deleteAll()` to repositories, or get all and delete one by one. But a true atomic replace might be hard. Wait, Dexie adapter isn't fully implemented in the main branch anyway (all methods throw 'Not implemented' or we saw it empty). We just need to define `deleteAll` or iterate `getAll` and `delete` in the repository ports if we don't want to add `deleteAll` yet. Wait, we can just fetch all and delete them iteratively, or add a `replaceAll(pieces, annotations, snapshots)` to a unified port? Let's check how we can do atomic.
     - Wait, an atomic transaction across 3 repositories in Dexie requires a Dexie transaction. But the ports are separate. We can add a `transaction()` method or just do a generic `clearAll()` / iterative save, accepting that it's just basic for MVP. Let's add `deleteAll()` to all 3 repos? Let's stick to existing ports: `getAll` and `delete` if we don't want to add new port methods, OR add `deleteAll()` for efficiency. Better to add `transaction()` or just clear one by one?
     - For MVP, we can just do:
       ```ts
       // wipe all
       const pieces = await this.pieceRepo.getAll();
       for(const p of pieces) { await this.pieceRepo.delete(p.id); }
       // Wait, AnnotationRepo has `deleteByPieceId` and SnapshotRepo has `deleteByPieceId`.
       // restore
       for(const p of backupData.pieces) {
         await this.pieceRepo.save(p);
         for(const a of p.annotations) { await this.annotationRepo.save(a); }
         await this.snapshotRepo.save({ pieceId: p.id, html: '', layerVisibility: p.layerVisibility, sourceRevision: p.revision, generatedAt: new Date().toISOString() });
       }
       ```
     - Wait, is there a better way to do "atomic replace-all" using Dexie? The issue says "Atomic: either all data replaced or operation aborted on any error".

3. **UI: WorkListPage & Restore Backup Modal (`src/ui/features/work-list/`)**
   - Add a `RestoreBackupModal` component.
   - Triggered by "Restore Backup" button.
   - Warns: "This will REPLACE ALL DATA. Cannot be undone."
   - Accepts File Upload or Paste JSON.
   - On Confirm -> calls `useRestoreBackup()` hook.

4. **UI hook: `useRestoreBackup` (`src/ui/features/work-list/use-restore-backup.ts`)**
   - Orchestrates calling the Use Case.
   - `handleError` on failure, `triggerDownload` doesn't apply.
   - Uses `ZodBackupValidator` to pass to `RestoreBackupUseCase`.
