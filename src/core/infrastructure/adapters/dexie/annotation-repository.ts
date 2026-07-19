import type { Annotation } from '../../../domain/types/';
import type { AnnotationRepository } from '../../../ports';

export class DexieAnnotationRepository implements AnnotationRepository {
  async getByPieceId(pieceId: string): Promise<Annotation[]> {
    void pieceId;
    return Promise.reject(new Error('Not implemented'));
  }

  async save(annotation: Annotation): Promise<void> {
    void annotation;
    return Promise.reject(new Error('Not implemented'));
  }

  async delete(id: string): Promise<void> {
    void id;
    return Promise.reject(new Error('Not implemented'));
  }

  async deleteByPieceId(pieceId: string): Promise<void> {
    void pieceId;
    return Promise.reject(new Error('Not implemented'));
  }
}
