import type { BackupData } from '../../application/piece-management/export-backup.use-case';
import type { BackupValidatorPort } from '../../ports/backup-validator.port';
import { backupSchema } from './backup-schema';

export class ZodBackupValidator implements BackupValidatorPort {
  validate(jsonString: string): BackupData {
    let parsedJson;
    try {
      parsedJson = JSON.parse(jsonString);
    } catch {
      throw new Error('Invalid JSON format');
    }

    const result = backupSchema.safeParse(parsedJson);
    if (!result.success) {
      throw new Error(`Schema validation failed: ${result.error.message}`);
    }

    return result.data as unknown as BackupData;
  }
}
