import { Annotation, AnnotationContent, AnnotationTarget, BreathContent, NoteAnnotationContent } from '../types/annotation';
import { AnnotationKind, LayerKind } from '../types/layer';

export interface CreateAnnotationInput {
  pieceId: string;
  target: AnnotationTarget;
  kind: AnnotationKind;
  content: AnnotationContent;
}

function deriveLayerId(kind: AnnotationKind): LayerKind {
  switch (kind) {
    case 'breath':
      return 'breath';
    case 'intent':
      return 'intention';
    case 'comment':
      return 'comments';
    default:
      // Runtime fallback just in case
      throw new Error(`Unsupported annotation kind: ${kind as string}`);
  }
}

function validateAnnotationContent(kind: AnnotationKind, content: AnnotationContent): void {
  if (kind === 'breath') {
    const breathContent = content as BreathContent;
    if (breathContent.mark !== 'S' && breathContent.mark !== 'L') {
      throw new Error("Breath annotation mark must be 'S' or 'L'");
    }
  } else if (kind === 'intent' || kind === 'comment') {
    const noteContent = content as NoteAnnotationContent;
    if (!noteContent.shortNote || noteContent.shortNote.trim() === '') {
      throw new Error("shortNote must be a non-empty string");
    }
    if (noteContent.extendedNote !== undefined && noteContent.extendedNote.trim() === '') {
      throw new Error("extendedNote must be a non-empty string when present");
    }
  }
}

export function createAnnotation(input: CreateAnnotationInput): Annotation {
  if (!input.pieceId || input.pieceId.trim() === '') {
    throw new Error('pieceId cannot be empty');
  }

  if (!input.target) {
    throw new Error('target is required');
  }

  validateAnnotationContent(input.kind, input.content);

  const layerId = deriveLayerId(input.kind);

  return {
    id: crypto.randomUUID(),
    pieceId: input.pieceId,
    target: input.target,
    kind: input.kind,
    content: input.content,
    layerId,
    status: 'valid',
  };
}

export function markAnnotationNeedsReview(annotation: Annotation): Annotation {
  return {
    ...annotation,
    status: 'needsReview',
  };
}
