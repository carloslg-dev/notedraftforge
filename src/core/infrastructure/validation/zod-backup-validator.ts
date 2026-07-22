import { z } from 'zod';
import type { BackupValidatorPort } from '../../ports/backup-validator.port';
import type { BackupData } from '../../application/piece-management/export-backup.use-case';
import type { LayerKind, AnnotationKind } from '../../domain/types/';

const EXPOSED_LANGUAGES = /^[a-z]{2}$/;

const tagRefSchema = z.object({
  kind: z.enum(['type', 'user']),
  value: z.string().min(1, 'Tag value cannot be empty')
});

const textMarkSchema = z.enum(['bold', 'italic', 'underline']);

const textRunSchema = z.object({
  id: z.uuid(),
  text: z.string(),
  marks: z.array(textMarkSchema).optional()
});

const textBlockSchema = z.object({
  id: z.uuid(),
  kind: z.enum(['paragraph', 'line', 'heading', 'quote']),
  runs: z.array(textRunSchema)
});

const textPieceContentSchema = z.object({
  kind: z.literal('text'),
  blocks: z.array(textBlockSchema)
});

const poemPieceContentSchema = z.object({
  kind: z.literal('poem'),
  blocks: z.array(textBlockSchema)
});

const chordContentSchema = z.object({
  root: z.string().min(1),
  modifiers: z.array(z.string()),
  display: z.string()
});

const songCellSchema = z.object({
  id: z.uuid(),
  text: z.string(),
  chord: chordContentSchema.optional(),
  meter: z.string().optional()
});

const songSectionSchema = z.object({
  id: z.uuid(),
  kind: z.enum(['intro', 'verse', 'pre-chorus', 'chorus', 'bridge', 'outro', 'custom']),
  label: z.string().optional(),
  cells: z.array(songCellSchema)
}).refine(
  data => (data.kind !== 'custom' ? true : !!data.label && data.label.trim() !== ''),
  {
    message: "label is required and cannot be empty when kind is 'custom'",
    path: ['label']
  }
);

const songPieceContentSchema = z.object({
  kind: z.literal('song'),
  sections: z.array(songSectionSchema)
});

const pieceContentSchema = z.discriminatedUnion('kind', [
  textPieceContentSchema,
  poemPieceContentSchema,
  songPieceContentSchema
]);

const textRangeTargetSchema = z.object({
  kind: z.literal('text-range'),
  blockId: z.uuid(),
  startOffset: z.number().int().nonnegative(),
  endOffset: z.number().int().nonnegative()
}).refine(data => data.startOffset < data.endOffset, {
  message: 'startOffset must be strictly less than endOffset',
  path: ['startOffset']
});

const textNodeTargetSchema = z.object({
  kind: z.literal('text-node'),
  blockId: z.uuid(),
  runId: z.uuid().optional()
});

const songCellTargetSchema = z.object({
  kind: z.literal('song-cell'),
  sectionId: z.uuid(),
  cellId: z.uuid()
});

const songCellRangeTargetSchema = z.object({
  kind: z.literal('song-cell-range'),
  sectionId: z.uuid(),
  startCellId: z.uuid(),
  endCellId: z.uuid()
});

const annotationTargetSchema = z.discriminatedUnion('kind', [
  textRangeTargetSchema,
  textNodeTargetSchema,
  songCellTargetSchema,
  songCellRangeTargetSchema
]);

const breathContentSchema = z.object({
  mark: z.enum(['S', 'L'])
});

const noteAnnotationContentSchema = z.object({
  shortNote: z.string().min(1, 'shortNote cannot be empty'),
  extendedNote: z.string().min(1, 'extendedNote cannot be empty').optional()
});

const annotationContentSchema = z.union([
  breathContentSchema,
  noteAnnotationContentSchema
]);

const annotationSchema = z.object({
  id: z.uuid(),
  pieceId: z.uuid(),
  target: annotationTargetSchema,
  kind: z.enum(['breath', 'intent', 'comment']),
  content: annotationContentSchema,
  layerId: z.enum(['chord', 'meter', 'breath', 'intention', 'comments']),
  status: z.enum(['valid', 'needsReview'])
}).superRefine((data, ctx) => {
  if (data.kind === 'breath') {
    const breathResult = breathContentSchema.safeParse(data.content);
    if (!breathResult.success) {
      ctx.addIssue({
        code: 'custom',
        message: 'Breath content must contain only S or L mark',
        path: ['content']
      });
    }
  } else {
    const noteResult = noteAnnotationContentSchema.safeParse(data.content);
    if (!noteResult.success) {
      ctx.addIssue({
        code: 'custom',
        message: 'Note content must contain a valid shortNote',
        path: ['content']
      });
    }
  }

  const kindToLayer: Record<AnnotationKind, LayerKind> = {
    breath: 'breath',
    intent: 'intention',
    comment: 'comments'
  };

  if (kindToLayer[data.kind] !== data.layerId) {
    ctx.addIssue({
      code: 'custom',
      message: `Annotation kind '${data.kind}' does not match layerId '${data.layerId}'`,
      path: ['layerId']
    });
  }
});

const pieceSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1, 'Title cannot be empty'),
  type: z.enum(['text', 'poem', 'song']),
  content: pieceContentSchema,
  language: z.string().regex(EXPOSED_LANGUAGES, 'Language must be lowercase 2-letter ISO 639-1 code'),
  tags: z.array(tagRefSchema),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  revision: z.number().int().nonnegative()
}).superRefine((data, ctx) => {
  if (data.type !== data.content.kind) {
    ctx.addIssue({
      code: 'custom',
      message: `Piece type '${data.type}' does not match content kind '${data.content.kind}'`,
      path: ['content']
    });
  }

  const typeTags = data.tags.filter(t => t.kind === 'type');
  if (typeTags.length !== 1) {
    ctx.addIssue({
      code: 'custom',
      message: `Piece must have exactly one type tag, found ${typeTags.length}`,
      path: ['tags']
    });
  } else if (typeTags[0].value !== data.type) {
    ctx.addIssue({
      code: 'custom',
      message: `Type tag value '${typeTags[0].value}' does not match piece type '${data.type}'`,
      path: ['tags']
    });
  }
});

const backupPieceSchema = pieceSchema.extend({
  annotations: z.array(annotationSchema),
  layerVisibility: z.record(z.enum(['chord', 'meter', 'breath', 'intention', 'comments']), z.boolean())
}).superRefine((data, ctx) => {
  data.annotations.forEach((ann, index) => {
    if (ann.pieceId !== data.id) {
      ctx.addIssue({
        code: 'custom',
        message: `Annotation at index ${index} pieceId '${ann.pieceId}' does not match piece ID '${data.id}'`,
        path: ['annotations', index, 'pieceId']
      });
    }

    if (ann.target.kind === 'text-range' || ann.target.kind === 'text-node') {
      if (data.content.kind === 'song') {
        ctx.addIssue({
          code: 'custom',
          message: 'Text target used on song piece',
          path: ['annotations', index, 'target']
        });
      } else {
        const target = ann.target as { blockId?: string };
        const blockId = target.blockId;
        const blockExists = data.content.blocks.some(b => b.id === blockId);
        if (!blockExists) {
          ctx.addIssue({
            code: 'custom',
            message: `Target blockId '${blockId}' not found in piece content`,
            path: ['annotations', index, 'target', 'blockId']
          });
        }
      }
    } else if (ann.target.kind === 'song-cell' || ann.target.kind === 'song-cell-range') {
      if (data.content.kind !== 'song') {
        ctx.addIssue({
          code: 'custom',
          message: 'Song target used on non-song piece',
          path: ['annotations', index, 'target']
        });
      } else {
        const sectionId = ann.target.sectionId;
        const section = data.content.sections.find(s => s.id === sectionId);
        if (!section) {
          ctx.addIssue({
            code: 'custom',
            message: `Target sectionId '${sectionId}' not found in song content`,
            path: ['annotations', index, 'target', 'sectionId']
          });
        } else {
          if (ann.target.kind === 'song-cell') {
            const target = ann.target as { cellId?: string };
            const cellExists = section.cells.some(c => c.id === target.cellId);
            if (!cellExists) {
              ctx.addIssue({
                code: 'custom',
                message: `Target cellId '${target.cellId}' not found in section '${sectionId}'`,
                path: ['annotations', index, 'target', 'cellId']
              });
            }
          } else {
            const target = ann.target as { startCellId?: string; endCellId?: string };
            const startExists = section.cells.some(c => c.id === target.startCellId);
            const endExists = section.cells.some(c => c.id === target.endCellId);
            if (!startExists) {
              ctx.addIssue({
                code: 'custom',
                message: `Target startCellId '${target.startCellId}' not found in section '${sectionId}'`,
                path: ['annotations', index, 'target', 'startCellId']
              });
            }
            if (!endExists) {
              ctx.addIssue({
                code: 'custom',
                message: `Target endCellId '${target.endCellId}' not found in section '${sectionId}'`,
                path: ['annotations', index, 'target', 'endCellId']
              });
            }
          }
        }
      }
    }
  });
});

const backupDataSchema = z.object({
  version: z.string().refine(val => val === '1', {
    message: 'Unsupported backup version. Expected version "1"'
  }),
  exportedAt: z.iso.datetime(),
  pieces: z.array(backupPieceSchema)
});

export class ZodBackupValidator implements BackupValidatorPort {
  validate(jsonString: string): BackupData {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      throw new Error('Malformed JSON. Failed to parse.');
    }

    const result = backupDataSchema.safeParse(parsed);
    if (!result.success) {
      const formattedErrors = result.error.issues.map(err => {
        const path = err.path.join('.');
        return `${path ? `[${path}] ` : ''}${err.message}`;
      }).join('; ');
      
      throw new Error(`Backup schema validation failed: ${formattedErrors}`);
    }

    return result.data as BackupData;
  }
}
