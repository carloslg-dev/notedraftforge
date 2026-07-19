import { describe, it, expect } from 'vitest';
import { DexiePieceRepository } from './piece-repository';
import type { Piece } from '../../../domain/types/';

describe('DexiePieceRepository stub', () => {
  it('throws Not implemented for getAll', async () => {
    const repo = new DexiePieceRepository();
    await expect(repo.getAll()).rejects.toThrow('Not implemented');
  });

  it('throws Not implemented for getById', async () => {
    const repo = new DexiePieceRepository();
    await expect(repo.getById('some-id')).rejects.toThrow('Not implemented');
  });

  it('throws Not implemented for save', async () => {
    const repo = new DexiePieceRepository();
    await expect(repo.save({} as unknown as Piece)).rejects.toThrow('Not implemented');
  });

  it('throws Not implemented for delete', async () => {
    const repo = new DexiePieceRepository();
    await expect(repo.delete('some-id')).rejects.toThrow('Not implemented');
  });
});
