import { describe, it, expect } from 'vitest';
import { DexieSnapshotRepository } from './snapshot-repository';
import type { PieceSnapshot } from '../../../domain/types/';

describe('DexieSnapshotRepository stub', () => {
  it('throws Not implemented for getByPieceId', async () => {
    const repo = new DexieSnapshotRepository();
    await expect(repo.getByPieceId('some-piece-id')).rejects.toThrow('Not implemented');
  });

  it('throws Not implemented for save', async () => {
    const repo = new DexieSnapshotRepository();
    await expect(repo.save({} as unknown as PieceSnapshot)).rejects.toThrow('Not implemented');
  });

  it('throws Not implemented for deleteByPieceId', async () => {
    const repo = new DexieSnapshotRepository();
    await expect(repo.deleteByPieceId('some-piece-id')).rejects.toThrow('Not implemented');
  });
});
