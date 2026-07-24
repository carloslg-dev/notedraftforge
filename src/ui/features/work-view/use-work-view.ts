import { useState, useEffect, useCallback } from 'react';
import type { Piece } from '../../../core/domain/types/';
import { GetPieceUseCase } from '../../../core/application/piece-management/get-piece.use-case';
import { DexiePieceRepository } from '../../../core/infrastructure/adapters/dexie/piece-repository';

export function useWorkView(pieceId: string | undefined) {
  const [piece, setPiece] = useState<Piece | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPiece = useCallback(async (isSilent = false) => {
    if (!pieceId) {
      setPiece(null);
      setLoading(false);
      return;
    }

    try {
      if (!isSilent) {
        setLoading(true);
      }
      setError(null);

      const repository = new DexiePieceRepository();
      const useCase = new GetPieceUseCase(repository);
      const fetchedPiece = await useCase.execute(pieceId);
      setPiece(fetchedPiece);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setLoading(false);
    }
  }, [pieceId]);

  useEffect(() => {
    fetchPiece(false);
  }, [fetchPiece]);

  return {
    piece,
    loading,
    error,
    refresh: useCallback(() => fetchPiece(true), [fetchPiece]),
  };
}
