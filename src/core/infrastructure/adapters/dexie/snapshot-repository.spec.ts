import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DexieSnapshotRepository } from './snapshot-repository';
import { db } from './db';
import type { PieceSnapshot } from '../../../domain/types/';

vi.mock('./db', () => ({
  db: {
    snapshots: {
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    }
  }
}));

describe('DexieSnapshotRepository', () => {
  let repo: DexieSnapshotRepository;

  beforeEach(() => {
    repo = new DexieSnapshotRepository();
    vi.clearAllMocks();
  });

  it('gets by pieceId', async () => {
    const mockSnapshot = { pieceId: 'p1' } as PieceSnapshot;
    (db.snapshots.get as import("vitest").Mock).mockResolvedValue(mockSnapshot);

    const result = await repo.getByPieceId('p1');

    expect(db.snapshots.get).toHaveBeenCalledWith('p1');
    expect(result).toEqual(mockSnapshot);
  });

  it('saves snapshot', async () => {
    const mockSnapshot = { pieceId: 'p1' } as PieceSnapshot;
    await repo.save(mockSnapshot);
    expect(db.snapshots.put).toHaveBeenCalledWith(mockSnapshot);
  });

  it('deletes by pieceId', async () => {
    await repo.deleteByPieceId('p1');
    expect(db.snapshots.delete).toHaveBeenCalledWith('p1');
  });
});
