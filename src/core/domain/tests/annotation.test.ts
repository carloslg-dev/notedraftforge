import { describe, it, expect } from 'vitest';
import { createAnnotation, markAnnotationNeedsReview } from '../factories/annotation';
import { TextRangeTarget } from '../types/annotation';

describe('Annotation Factory', () => {
  const mockTarget: TextRangeTarget = {
    kind: 'text-range',
    blockId: 'block-1',
    startOffset: 0,
    endOffset: 5,
  };

  const pieceId = 'piece-123';

  describe('createAnnotation', () => {
    it('creates a valid breath annotation', () => {
      const annotation = createAnnotation({
        pieceId,
        target: mockTarget,
        kind: 'breath',
        content: { mark: 'S' },
      });

      expect(annotation.id).toBeDefined();
      expect(typeof annotation.id).toBe('string');
      expect(annotation.pieceId).toBe(pieceId);
      expect(annotation.target).toEqual(mockTarget);
      expect(annotation.kind).toBe('breath');
      expect(annotation.layerId).toBe('breath');
      expect(annotation.content).toEqual({ mark: 'S' });
      expect(annotation.status).toBe('valid');
    });

    it('creates a valid intent annotation', () => {
      const annotation = createAnnotation({
        pieceId,
        target: mockTarget,
        kind: 'intent',
        content: { shortNote: 'slow down', extendedNote: 'much slower here' },
      });

      expect(annotation.kind).toBe('intent');
      expect(annotation.layerId).toBe('intention');
      expect(annotation.content).toEqual({ shortNote: 'slow down', extendedNote: 'much slower here' });
    });

    it('creates a valid comment annotation', () => {
      const annotation = createAnnotation({
        pieceId,
        target: mockTarget,
        kind: 'comment',
        content: { shortNote: 'fix this' },
      });

      expect(annotation.kind).toBe('comment');
      expect(annotation.layerId).toBe('comments');
      expect(annotation.content).toEqual({ shortNote: 'fix this' });
    });

    it('rejects invalid breath mark', () => {
      expect(() => {
        createAnnotation({
          pieceId,
          target: mockTarget,
          kind: 'breath',
          // @ts-expect-error Testing invalid runtime value
          content: { mark: 'X' },
        });
      }).toThrow(/Breath annotation mark must be 'S' or 'L'/);
    });

    it('rejects empty shortNote for intent/comment', () => {
      expect(() => {
        createAnnotation({
          pieceId,
          target: mockTarget,
          kind: 'intent',
          content: { shortNote: '   ' },
        });
      }).toThrow(/shortNote must be a non-empty string/);
    });

    it('rejects empty extendedNote if provided', () => {
      expect(() => {
        createAnnotation({
          pieceId,
          target: mockTarget,
          kind: 'comment',
          content: { shortNote: 'valid', extendedNote: '   ' },
        });
      }).toThrow(/extendedNote must be a non-empty string when present/);
    });
  });

  describe('markAnnotationNeedsReview', () => {
    it('transitions status from valid to needsReview', () => {
      const annotation = createAnnotation({
        pieceId,
        target: mockTarget,
        kind: 'breath',
        content: { mark: 'S' },
      });

      expect(annotation.status).toBe('valid');

      const reviewed = markAnnotationNeedsReview(annotation);

      expect(reviewed.id).toBe(annotation.id);
      expect(reviewed.status).toBe('needsReview');
      // Original remains unchanged
      expect(annotation.status).toBe('valid');
    });
  });
});
