import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DexiePieceRepository } from './piece-repository';
import { db } from './db';
import type { Piece } from '../../../domain/types/';

vi.mock('./db', () => ({
  db: {
    pieces: {
      toArray: vi.fn(),
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    }
  }
}));

describe('DexiePieceRepository', () => {
  let repo: DexiePieceRepository;

  beforeEach(() => {
    repo = new DexiePieceRepository();
    vi.clearAllMocks();
  });

  it('gets all pieces', async () => {
    const mockPieces = [{ id: 'p1' }] as Piece[];
    (db.pieces.toArray as import("vitest").Mock).mockResolvedValue(mockPieces);

    const result = await repo.getAll();
    expect(db.pieces.toArray).toHaveBeenCalled();
    expect(result).toEqual(mockPieces);
  });

  it('gets by id', async () => {
    const mockPiece = { id: 'p1' } as Piece;
    (db.pieces.get as import("vitest").Mock).mockResolvedValue(mockPiece);

    const result = await repo.getById('p1');
    expect(db.pieces.get).toHaveBeenCalledWith('p1');
    expect(result).toEqual(mockPiece);
  });

  it('saves piece', async () => {
    const mockPiece = { id: 'p1' } as Piece;
    await repo.save(mockPiece);
    expect(db.pieces.put).toHaveBeenCalledWith(mockPiece);
  });

  it('deletes piece', async () => {
    await repo.delete('p1');
    expect(db.pieces.delete).toHaveBeenCalledWith('p1');
  });
});
