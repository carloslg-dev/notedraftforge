To satisfy atomic replace-all, maybe we can add a `DatabaseTransactionPort` or just add a `replaceAll(pieces, annotations, snapshots)` port, but Hexagonal Architecture prefers fine-grained ports.
Another simpler way to achieve atomicity at the application level is to define a port `BackupRestorePort` with `replaceEntireState(backup: BackupData): Promise<void>`. Wait, the issue says "Atomic: either all data replaced or operation aborted on any error."
If we just add `replaceEntireState` to `PieceRepository`, that mixes concerns.
Instead, we can add a `TransactionManager` port. But that's over-engineering.
Let's see: if we just do:
```typescript
export interface DataRestorePort {
  replaceEntireData(pieces: Piece[], annotations: Annotation[], snapshots: PieceSnapshot[]): Promise<void>;
}
```
Is that over-engineering? No, it perfectly captures the atomic requirement for this specific use case without complicating all other use cases with transactions.

Or, maybe we just use `pieceRepository.save()` inside a `try/catch` and if it fails, we don't have atomicity across multiple tables without a transaction. In Dexie, we'd need a transaction. We can expose a `UnitOfWork` port or `transaction(() => Promise<void>)` port.
Let's look at `openspec/architecture.md`:
"Keep adapters replaceable (Dexie now, backend/API later)."
If we use a `UnitOfWork` port, it's very standard.
For simplicity, since we only need atomicity for this restore, let's create `src/core/ports/backup-repository.ts`:
```ts
export interface BackupRepository {
  replaceEntireData(data: BackupData): Promise<void>;
}
```
But wait, `BackupData` is an Application Layer DTO (defined in `export-backup.use-case.ts`). We can just rename it or move it to a shared place in application. No, Ports can depend on application types (like inputs to use cases), but usually ports use domain types.
We can pass `pieces`, `annotations`, `snapshots` to a new `SystemRepositoryPort` or `StoragePort`.
Let's define `src/core/ports/system-restore-port.ts`:
```ts
import type { Piece, Annotation, PieceSnapshot } from '../domain/types/';
export interface SystemRestorePort {
  replaceAllData(pieces: Piece[], annotations: Annotation[], snapshots: PieceSnapshot[]): Promise<void>;
}
```
This is clean and explicit.

Let's refine the plan:

1. **Validation Schema (`src/core/infrastructure/validation/backup-schema.ts`)**
   - Implement `backupSchema` using `zod`.
   - Ensure it validates all fields, checks `version === '1'`, and ensures `Piece.type` matches `content.kind` and the `kind: 'type'` tag.

2. **Zod Validator Adapter (`src/core/infrastructure/validation/zod-backup-validator.ts`)**
   - Implements a port (e.g., `BackupValidatorPort`) or just exports a mapping function. To be strictly hexagonal, application layer shouldn't import Zod. So we define `BackupValidatorPort` in `src/core/ports/backup-validator.port.ts` and implement it in `infrastructure/validation`.

3. **Application Use Case (`src/core/application/piece-management/restore-backup.use-case.ts`)**
   - Depends on `BackupValidatorPort` and `SystemRestorePort`.
   - `execute(jsonString: string)`:
     1. `const backup = this.validator.validate(jsonString);`
     2. Map `BackupData` to `Piece[]`, `Annotation[]`, `PieceSnapshot[]`.
     3. `await this.systemRestore.replaceAllData(pieces, annotations, snapshots);`

4. **Infrastructure Implementations (`src/core/infrastructure/adapters/dexie/system-restore-repository.ts`)**
   - Provide a skeleton for `DexieSystemRestoreRepository` implementing `SystemRestorePort`.

5. **UI Component (`src/ui/features/work-list/components/RestoreBackupModal.tsx`)**
   - A modal with a warning.
   - Textarea for pasting JSON.
   - File input for uploading JSON.
   - "Restore" button.

6. **UI Hook (`src/ui/features/work-list/use-restore-backup.ts`)**
   - Orchestrates the UI logic, calls the Use Case. Instantiates the adapters.

7. **Update `WorkListPage.tsx`**
   - Add the modal and hook it up to the existing "Restore Backup" buttons.
