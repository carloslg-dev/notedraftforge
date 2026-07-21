import { z } from 'zod';

const tagSchema = z.object({
  kind: z.enum(['type', 'user']),
  value: z.string()
});

const textMarkSchema = z.enum(['bold', 'italic', 'underline']);

const textRunSchema = z.object({
  id: z.string(),
  text: z.string(),
  marks: z.array(textMarkSchema).optional()
});

const textBlockSchema = z.object({
  id: z.string(),
  kind: z.enum(['paragraph', 'line', 'heading', 'quote']),
  runs: z.array(textRunSchema)
});

const musicalRootSchema = z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'A♭', 'A♯', 'A#', 'Ab', 'B♭', 'B♯', 'B#', 'Bb', 'C♭', 'C♯', 'C#', 'Cb', 'D♭', 'D♯', 'D#', 'Db', 'E♭', 'E♯', 'E#', 'Eb', 'F♭', 'F♯', 'F#', 'Fb', 'G♭', 'G♯', 'G#', 'Gb']);
const musicalModifierSchema = z.enum(['sharp', 'flat', 'minor', 'major', 'seventh']);

const chordContentSchema = z.object({
  root: musicalRootSchema,
  modifiers: z.array(musicalModifierSchema),
  display: z.string()
});

const songCellSchema = z.object({
  id: z.string(),
  text: z.string(),
  chord: chordContentSchema.optional(),
  meter: z.string().optional()
});

const songSectionSchema = z.object({
  id: z.string(),
  kind: z.enum(['intro', 'verse', 'pre-chorus', 'chorus', 'bridge', 'outro', 'custom']),
  label: z.string().optional(),
  cells: z.array(songCellSchema)
});

const pieceContentSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('text'), blocks: z.array(textBlockSchema) }),
  z.object({ kind: z.literal('poem'), blocks: z.array(textBlockSchema) }),
  z.object({ kind: z.literal('song'), sections: z.array(songSectionSchema) })
]);

const annotationTargetSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('text-range'), blockId: z.string(), startOffset: z.number(), endOffset: z.number() }),
  z.object({ kind: z.literal('text-node'), blockId: z.string(), runId: z.string().optional() }),
  z.object({ kind: z.literal('song-cell'), sectionId: z.string(), cellId: z.string() }),
  z.object({ kind: z.literal('song-cell-range'), sectionId: z.string(), startCellId: z.string(), endCellId: z.string() })
]);

// AnnotationContent
const breathContentSchema = z.object({
  mark: z.enum(['S', 'L'])
});

const noteAnnotationContentSchema = z.object({
  shortNote: z.string().min(1),
  extendedNote: z.string().min(1).optional()
});

const annotationContentSchema = z.union([
  breathContentSchema,
  noteAnnotationContentSchema
]);

const annotationSchema = z.object({
  id: z.string(),
  pieceId: z.string(),
  target: annotationTargetSchema,
  kind: z.enum(['chord', 'meter', 'breath', 'intention', 'comments']),
  content: annotationContentSchema,
  layerId: z.enum(['chord', 'meter', 'breath', 'intention', 'comments']),
  status: z.enum(['valid', 'needsReview'])
});

const layerVisibilitySchema = z.object({
  chord: z.boolean(),
  meter: z.boolean(),
  breath: z.boolean(),
  intention: z.boolean(),
  comments: z.boolean()
});

const pieceSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  type: z.enum(['text', 'poem', 'song']),
  content: pieceContentSchema,
  language: z.string(),
  tags: z.array(tagSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
  revision: z.number(),
  annotations: z.array(annotationSchema),
  layerVisibility: layerVisibilitySchema
}).refine(piece => {
  const typeTag = piece.tags.find(t => t.kind === 'type');
  return piece.type === piece.content.kind && (!typeTag || typeTag.value === piece.type);
}, {
  message: "Inconsistent piece type metadata (Piece.type, Piece.content.kind, and type tag do not match)"
});

export const backupSchema = z.object({
  version: z.literal('1'),
  exportedAt: z.string(),
  pieces: z.array(pieceSchema)
});
