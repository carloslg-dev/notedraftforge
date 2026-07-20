import { useState, useEffect, useCallback } from 'react';
import { GetAllPiecesUseCase } from '../../../core/application/piece-management/get-all-pieces.use-case';
import { DexiePieceRepository } from '../../../core/infrastructure/adapters/dexie/piece-repository';
import type { Piece } from '../../../core/domain/types/';

export function useWorkList() {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPieces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Instantiate repository and use case (DI via instantiation here per MVP architecture)
      // Memoizing them outside the fetcher isn't strictly necessary but ensures they don't rebuild.
      // We keep it inline since they are lightweight.
      const repository = new DexiePieceRepository();
      const useCase = new GetAllPiecesUseCase(repository);
      const data = await useCase.execute();
      setPieces(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
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
