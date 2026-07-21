import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DexieAnnotationRepository } from './annotation-repository';
import { db } from './db';
import type { Annotation } from '../../../domain/types/';

const mockToArray = vi.fn();
const mockEquals = vi.fn().mockReturnValue({ toArray: mockToArray });
const mockWhere = vi.fn().mockReturnValue({ equals: mockEquals });

vi.mock('./db', () => ({
  db: {
    annotations: {
      where: (...args: unknown[]) => mockWhere(...args),
      put: vi.fn(),
      delete: vi.fn(),
      bulkDelete: vi.fn(),
    }
  }
}));

describe('DexieAnnotationRepository', () => {
  let repo: DexieAnnotationRepository;

  beforeEach(() => {
    repo = new DexieAnnotationRepository();
    vi.clearAllMocks();
    mockToArray.mockClear();
    mockEquals.mockClear();
    mockWhere.mockClear();
  });

  it('gets by pieceId', async () => {
    const mockAnnotations = [{ id: 'a1', pieceId: 'p1' }] as Annotation[];
    mockToArray.mockResolvedValue(mockAnnotations);

    const result = await repo.getByPieceId('p1');

    expect(mockWhere).toHaveBeenCalledWith('pieceId');
    expect(mockEquals).toHaveBeenCalledWith('p1');
    expect(mockToArray).toHaveBeenCalled();
    expect(result).toEqual(mockAnnotations);
  });

  it('saves annotation', async () => {
    const mockAnnotation = { id: 'a1' } as Annotation;
    await repo.save(mockAnnotation);
    expect(db.annotations.put).toHaveBeenCalledWith(mockAnnotation);
  });

  it('deletes annotation', async () => {
    await repo.delete('a1');
    expect(db.annotations.delete).toHaveBeenCalledWith('a1');
  });

  it('deletes by pieceId', async () => {
    const mockAnnotations = [{ id: 'a1', pieceId: 'p1' }, { id: 'a2', pieceId: 'p1' }] as Annotation[];
    mockToArray.mockResolvedValue(mockAnnotations);

    await repo.deleteByPieceId('p1');

    expect(db.annotations.bulkDelete).toHaveBeenCalledWith(['a1', 'a2']);
  });
});
