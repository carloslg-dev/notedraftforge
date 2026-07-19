import { readFileSync, writeFileSync } from 'fs';

// 1. Update openspec/domain-model.md
let spec = readFileSync('openspec/domain-model.md', 'utf-8');
spec = spec.replace(
  "- `language` must be a valid ISO 639-1 two-letter code",
  "- `language` must be a valid ISO 639-1 two-letter code, stored strictly in lowercase"
);
writeFileSync('openspec/domain-model.md', spec);

// 2. Update piece.ts
let content = readFileSync('src/core/domain/factories/piece.ts', 'utf-8');

// Update createPiece
content = content.replace(
  "language: input.language,",
  "language: input.language.trim().toLowerCase(),"
);

// Update updatePieceMetadata
content = content.replace(
  "    if (piece.language !== input.language) {\n      updates.language = input.language;\n      hasChanges = true;\n    }",
  "    const normalizedLang = input.language.trim().toLowerCase();\n    if (piece.language !== normalizedLang) {\n      updates.language = normalizedLang;\n      hasChanges = true;\n    }"
);

writeFileSync('src/core/domain/factories/piece.ts', content);
