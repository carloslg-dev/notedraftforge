import { Piece, PieceContent, TagRef } from '../types/piece';
import { PieceType } from '../types';

export interface CreatePieceInput {
  title: string;
  type: PieceType;
  language: string;
  tags?: string[];
}

export function createPiece(input: CreatePieceInput): Piece {
  if (!input.title || input.title.trim() === '') {
    throw new Error('Piece title cannot be empty');
  }

  const now = new Date().toISOString();

  let content: PieceContent;
  switch (input.type) {
    case 'text':
      content = { kind: 'text', blocks: [] };
      break;
    case 'poem':
      content = { kind: 'poem', blocks: [] };
      break;
    case 'song':
      content = { kind: 'song', sections: [] };
      break;
    default:
      // Typescript should catch this, but runtime check for safety
      throw new Error(`Unsupported piece type: ${input.type as string}`);
  }

  const tags: TagRef[] = [
    { kind: 'type', value: input.type }
  ];

  if (input.tags) {
    for (const tagValue of input.tags) {
      if (tagValue.trim() !== '') {
        tags.push({ kind: 'user', value: tagValue.trim() });
      }
    }
  }

  return {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    type: input.type,
    content,
    language: input.language,
    tags,
    createdAt: now,
    updatedAt: now,
    revision: 0,
  };
}

export function updatePieceContent(piece: Piece, content: PieceContent): Piece {
  if (piece.type !== content.kind) {
    throw new Error(`Content kind '${content.kind}' does not match piece type '${piece.type}'`);
  }

  return {
    ...piece,
    content,
    updatedAt: new Date().toISOString(),
    revision: piece.revision + 1,
  };
}

export interface UpdatePieceMetadataInput {
  title?: string;
  language?: string;
  tags?: string[];
}

export function updatePieceMetadata(piece: Piece, input: UpdatePieceMetadataInput): Piece {
  const updates: Partial<Piece> = {
    updatedAt: new Date().toISOString(),
  };

  if (input.title !== undefined) {
    if (input.title.trim() === '') {
      throw new Error('Piece title cannot be empty');
    }
    updates.title = input.title.trim();
  }

  if (input.language !== undefined) {
    updates.language = input.language;
  }

  if (input.tags !== undefined) {
    const newTags: TagRef[] = [
      { kind: 'type', value: piece.type }
    ];
    for (const tagValue of input.tags) {
      if (tagValue.trim() !== '') {
        newTags.push({ kind: 'user', value: tagValue.trim() });
      }
    }
    updates.tags = newTags;
  }

  return {
    ...piece,
    ...updates,
  };
}
