import type { Piece } from '../../../domain/types/';
import type { PieceRepository } from '../../../ports';

export class DexiePieceRepository implements PieceRepository {
  async getAll(): Promise<Piece[]> {
    return Promise.reject(new Error('Not implemented'));
  }

  async getById(id: string): Promise<Piece | null> {
    void id;
    return Promise.reject(new Error('Not implemented'));
  }

  async save(piece: Piece): Promise<void> {
    void piece;
    return Promise.reject(new Error('Not implemented'));
  }

  async delete(id: string): Promise<void> {
    void id;
    return Promise.reject(new Error('Not implemented'));
  }
}
