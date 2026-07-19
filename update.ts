import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/core/domain/factories/piece.ts', 'utf-8');

const validationFn = `
function isValidLanguage(language: string): boolean {
  return typeof language === 'string' && language.length === 2 && /^[a-zA-Z]{2}$/.test(language);
}
`;

content = content.replace('export function createPiece', validationFn + '\nexport function createPiece');

content = content.replace(
  "throw new Error('Piece title cannot be empty');\n  }",
  "throw new Error('Piece title cannot be empty');\n  }\n  if (!isValidLanguage(input.language)) {\n    throw new Error('Language must be a valid ISO 639-1 two-letter code');\n  }"
);

const newUpdatePieceMetadata = `export function updatePieceMetadata(piece: Piece, input: UpdatePieceMetadataInput): Piece {
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
}`;

const oldUpdatePieceMetadataMatch = content.match(/export function updatePieceMetadata[\s\S]*\}\n/);
if (oldUpdatePieceMetadataMatch) {
    content = content.replace(oldUpdatePieceMetadataMatch[0], newUpdatePieceMetadata + '\n');
}

writeFileSync('src/core/domain/factories/piece.ts', content);
