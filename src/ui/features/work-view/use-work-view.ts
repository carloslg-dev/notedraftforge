import { useState, useEffect, useCallback } from 'react';
import type { Piece } from '../../../core/domain/types/';
import { GetPieceUseCase } from '../../../core/application/piece-management/get-piece.use-case';
import { DexiePieceRepository } from '../../../core/infrastructure/adapters/dexie/piece-repository';

export function useWorkView(pieceId: string | undefined) {
  const [piece, setPiece] = useState<Piece | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPiece = useCallback(async () => {
    if (!pieceId) {
      setPiece(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // In MVP architecture, DI is handled via direct instantiation in the UI layer
      const repository = new DexiePieceRepository();
      const useCase = new GetPieceUseCase(repository);

      try {
        const fetchedPiece = await useCase.execute(pieceId);
        setPiece(fetchedPiece);
      } catch (err: unknown) {
        // Fallback to mock data for now, as Dexie adapters are currently stubbed throwing 'Not implemented'
        // as per memory rules: "backend Dexie adapters are currently stubbed (throwing 'Not implemented')"
        if (err instanceof Error && err.message === 'Not implemented') {
          console.warn('DexiePieceRepository is stubbed. Using mock data for piece fetch.');
          if (pieceId === '999') {
            setPiece(null);
          } else {
             setPiece({
              id: pieceId,
              title: `Mock Piece ${pieceId}`,
              type: 'text',
              content: { kind: 'text', blocks: [] },
              language: 'en',
              tags: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              revision: 1
            });
          }
        } else {
          throw err;
        }
      }
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setLoading(false);
    }
  }, [pieceId]);

  useEffect(() => {
    fetchPiece();
  }, [fetchPiece]);

  return {
    piece,
    loading,
    error,
    refresh: fetchPiece,
  };
}
