const fs = require('fs');
let code = fs.readFileSync('src/core/domain/factories/annotation.ts', 'utf8');

code = code.replace(
  "function validateAnnotationContent(kind: AnnotationKind, content: AnnotationContent): void {",
  "function validateAnnotationContent(kind: AnnotationKind, content: AnnotationContent): AnnotationContent {"
);

code = code.replace(
  "    if (breathContent.mark !== 'S' && breathContent.mark !== 'L') {\n      throw new Error(\"Breath annotation mark must be 'S' or 'L'\");\n    }\n  }",
  "    if (breathContent.mark !== 'S' && breathContent.mark !== 'L') {\n      throw new Error(\"Breath annotation mark must be 'S' or 'L'\");\n    }\n    return breathContent;\n  }"
);

code = code.replace(
  "    if (noteContent.extendedNote !== undefined && noteContent.extendedNote.trim() === '') {\n      throw new Error(\"extendedNote must be a non-empty string when present\");\n    }\n  }",
  "    if (noteContent.extendedNote !== undefined && noteContent.extendedNote.trim() === '') {\n      throw new Error(\"extendedNote must be a non-empty string when present\");\n    }\n    const sanitized: NoteAnnotationContent = {\n      shortNote: noteContent.shortNote.trim(),\n    };\n    if (noteContent.extendedNote !== undefined) {\n      sanitized.extendedNote = noteContent.extendedNote.trim();\n    }\n    return sanitized;\n  }"
);

code = code.replace(
  "    throw new Error('target is required');\n  }",
  "    throw new Error('target is required');\n  }\n\n  const validTargetKinds = ['text-range', 'text-node', 'song-cell', 'song-cell-range'];\n  if (!input.target.kind || !validTargetKinds.includes(input.target.kind)) {\n    throw new Error(`Invalid target kind. Must be one of: ${validTargetKinds.join(', ')}`);\n  }"
);

code = code.replace(
  "  validateAnnotationContent(input.kind, input.content);",
  "  const sanitizedContent = validateAnnotationContent(input.kind, input.content);"
);

code = code.replace(
  "    content: input.content,",
  "    content: sanitizedContent,"
);

fs.writeFileSync('src/core/domain/factories/annotation.ts', code);
