import type { PieceSnapshot } from '../../../domain/types/';
import type { SnapshotRepository } from '../../../ports';

export class DexieSnapshotRepository implements SnapshotRepository {
  async getByPieceId(pieceId: string): Promise<PieceSnapshot | null> {
    void pieceId;
    return Promise.reject(new Error('Not implemented'));
  }

  async save(snapshot: PieceSnapshot): Promise<void> {
    void snapshot;
    return Promise.reject(new Error('Not implemented'));
  }

  async deleteByPieceId(pieceId: string): Promise<void> {
    void pieceId;
    return Promise.reject(new Error('Not implemented'));
  }
}
