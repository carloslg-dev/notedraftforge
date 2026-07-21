import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DexieSystemRestoreRepository } from './system-restore-repository';
import { db } from './db';
import type { Piece, Annotation, PieceSnapshot } from '../../../domain/types/';

vi.mock('./db', () => ({
  db: {
    transaction: vi.fn(),
    pieces: { clear: vi.fn(), bulkAdd: vi.fn() },
    annotations: { clear: vi.fn(), bulkAdd: vi.fn() },
    snapshots: { clear: vi.fn(), bulkAdd: vi.fn() },
  }
}));

describe('DexieSystemRestoreRepository', () => {
  let repo: DexieSystemRestoreRepository;

  beforeEach(() => {
    repo = new DexieSystemRestoreRepository();
    vi.clearAllMocks();
  });

  it('replaces all data inside a transaction', async () => {
    const mockPieces = [{ id: 'p1' }] as Piece[];
    const mockAnnotations = [{ id: 'a1' }] as Annotation[];
    const mockSnapshots = [{ pieceId: 'p1' }] as PieceSnapshot[];

    // Execute the transaction callback manually when called
    (db.transaction as import("vitest").Mock).mockImplementation(async (_mode: string, _t1: unknown, _t2: unknown, _t3: unknown, callback: () => Promise<void>) => {
      await callback();
    });

    await repo.replaceAllData(mockPieces, mockAnnotations, mockSnapshots);

    expect(db.transaction).toHaveBeenCalledWith('rw', db.pieces, db.annotations, db.snapshots, expect.any(Function));

    expect(db.pieces.clear).toHaveBeenCalled();
    expect(db.annotations.clear).toHaveBeenCalled();
    expect(db.snapshots.clear).toHaveBeenCalled();

    expect(db.pieces.bulkAdd).toHaveBeenCalledWith(mockPieces);
    expect(db.annotations.bulkAdd).toHaveBeenCalledWith(mockAnnotations);
    expect(db.snapshots.bulkAdd).toHaveBeenCalledWith(mockSnapshots);
  });
});
