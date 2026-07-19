import { Piece, PieceContent, TagRef } from '../types/piece';
import { PieceType } from '../types';

export interface CreatePieceInput {
  title: string;
  type: PieceType;
  language: string;
  tags?: string[];
}


function isValidLanguage(language: string): boolean {
  return typeof language === 'string' && language.length === 2 && /^[a-zA-Z]{2}$/.test(language);
}

export function createPiece(input: CreatePieceInput): Piece {
  if (!input.title || input.title.trim() === '') {
    throw new Error('Piece title cannot be empty');
  }
  if (!isValidLanguage(input.language)) {
    throw new Error('Language must be a valid ISO 639-1 two-letter code');
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
  const updates: Partial<Piece> = {};
  let hasChanges = false;

  if (input.title !== undefined) {
    if (input.title.trim() === '') {
      throw new Error('Piece title cannot be empty');
    }
    if (piece.title !== input.title.trim()) {
      updates.title = input.title.trim();
      hasChanges = true;
    }
  }

  if (input.language !== undefined) {
    if (!isValidLanguage(input.language)) {
      throw new Error('Language must be a valid ISO 639-1 two-letter code');
    }
    if (piece.language !== input.language) {
      updates.language = input.language;
      hasChanges = true;
    }
  }

  if (input.tags !== undefined) {
    const currentTags = piece.tags || [];
    const typeTag = currentTags.find(tag => tag.kind === 'type') || { kind: 'type', value: piece.type };
    const newTags: TagRef[] = [typeTag];
    for (const tagValue of input.tags) {
      if (tagValue.trim() !== '') {
        newTags.push({ kind: 'user', value: tagValue.trim() });
      }
    }

    // Check if tags changed
    const currentUserTags = currentTags.filter(t => t.kind === 'user').map(t => t.value).sort().join(',');
    const newUserTags = newTags.filter(t => t.kind === 'user').map(t => t.value).sort().join(',');

    if (currentUserTags !== newUserTags) {
      updates.tags = newTags;
      hasChanges = true;
    }
  }

  if (hasChanges) {
    updates.updatedAt = new Date().toISOString();
  }

  return {
    ...piece,
    ...updates,
  };
}
