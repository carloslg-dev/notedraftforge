import { useState, useEffect, useCallback } from 'react';
// import { GetAllPiecesUseCase } from '../../../core/application/piece-management/get-all-pieces.use-case';
// import { DexiePieceRepository } from '../../../core/infrastructure/adapters/dexie/piece-repository';
import type { Piece } from '../../../core/domain/types/';

export function useWorkList() {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPieces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = [
        { id: '1', title: 'Draft Notes', type: 'text', content: { kind: 'text', blocks: [] }, language: 'en', tags: [{ kind: 'type', value: 'text' }, { kind: 'user', value: 'Draft' }], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), revision: 1 },
        { id: '2', title: 'Spring Poem', type: 'poem', content: { kind: 'text', blocks: [] }, language: 'en', tags: [{ kind: 'type', value: 'poem' }, { kind: 'user', value: 'love' }, { kind: 'user', value: 'nature' }, { kind: 'user', value: 'music' }, { kind: 'user', value: 'art' }, { kind: 'user', value: 'overflow' }], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), revision: 1 },
        { id: '3', title: 'Test 3', type: 'song', content: { kind: 'text', blocks: [] }, language: 'en', tags: [{ kind: 'type', value: 'song' }], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), revision: 1 },
        { id: '4', title: 'Ideas', type: 'text', content: { kind: 'text', blocks: [] }, language: 'en', tags: [{ kind: 'type', value: 'text' }, { kind: 'user', value: 'ideas' }], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), revision: 1 },
      ] as Piece[];

      setTimeout(() => {
        setPieces(data);
        setLoading(false);
      }, 300);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPieces();
  }, [fetchPieces]);

  return {
    pieces,
    loading,
    error,
    refresh: fetchPieces,
  };
}
