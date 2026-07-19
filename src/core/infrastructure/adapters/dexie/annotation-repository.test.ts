import { describe, it, expect } from 'vitest';
import { DexieAnnotationRepository } from './annotation-repository';
import type { Annotation } from '../../../domain/types/';

describe('DexieAnnotationRepository stub', () => {
  it('throws Not implemented for getByPieceId', async () => {
    const repo = new DexieAnnotationRepository();
    await expect(repo.getByPieceId('some-piece-id')).rejects.toThrow('Not implemented');
  });

  it('throws Not implemented for save', async () => {
    const repo = new DexieAnnotationRepository();
    await expect(repo.save({} as unknown as Annotation)).rejects.toThrow('Not implemented');
  });

  it('throws Not implemented for delete', async () => {
    const repo = new DexieAnnotationRepository();
    await expect(repo.delete('some-id')).rejects.toThrow('Not implemented');
  });

  it('throws Not implemented for deleteByPieceId', async () => {
    const repo = new DexieAnnotationRepository();
    await expect(repo.deleteByPieceId('some-piece-id')).rejects.toThrow('Not implemented');
  });
});
