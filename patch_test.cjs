const fs = require('fs');
let code = fs.readFileSync('src/core/domain/tests/annotation.test.ts', 'utf8');

code = code.replace(
  "    it('rejects empty extendedNote if provided', () => {",
  "    it('sanitizes shortNote and extendedNote by trimming whitespace', () => {\n      const annotation = createAnnotation({\n        pieceId,\n        target: mockTarget,\n        kind: 'intent',\n        content: { shortNote: '  needs trim  ', extendedNote: '   also trim   ' },\n      });\n\n      expect(annotation.content).toEqual({ shortNote: 'needs trim', extendedNote: 'also trim' });\n    });\n\n    it('rejects empty extendedNote if provided', () => {"
);

code = code.replace(
  "      expect(() => {\n        createAnnotation({\n          pieceId,\n          target: mockTarget,\n          kind: 'comment',\n          content: { shortNote: 'valid', extendedNote: '   ' },\n        });\n      }).toThrow(/extendedNote must be a non-empty string when present/);\n    });",
  "      expect(() => {\n        createAnnotation({\n          pieceId,\n          target: mockTarget,\n          kind: 'comment',\n          content: { shortNote: 'valid', extendedNote: '   ' },\n        });\n      }).toThrow(/extendedNote must be a non-empty string when present/);\n    });\n\n    it('rejects invalid target kind', () => {\n      expect(() => {\n        createAnnotation({\n          pieceId,\n          // @ts-expect-error Testing invalid runtime value\n          target: { kind: 'invalid-target' },\n          kind: 'breath',\n          content: { mark: 'S' },\n        });\n      }).toThrow(/Invalid target kind/);\n    });"
);

fs.writeFileSync('src/core/domain/tests/annotation.test.ts', code);
