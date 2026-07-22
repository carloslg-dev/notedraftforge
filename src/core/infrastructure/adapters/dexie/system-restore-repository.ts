import type { SystemRestorePort } from '../../../ports';
import type { Piece, Annotation, PieceSnapshot } from '../../../domain/types/';

export class DexieSystemRestoreRepository implements SystemRestorePort {
  async replaceAllData(
    pieces: Piece[],
    annotations: Annotation[],
    snapshots: PieceSnapshot[]
  ): Promise<void> {
    void pieces;
    void annotations;
    void snapshots;
    return Promise.reject(new Error('Not implemented'));
  }
}
