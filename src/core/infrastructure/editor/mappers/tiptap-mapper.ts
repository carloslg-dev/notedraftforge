import type { PieceContent, TextBlock, TextRun, TextMark, TextPieceContent, PoemPieceContent } from '../../../domain/types/';
import type { JSONContent } from '@tiptap/core';
import { randomUUID } from '../../../domain/uuid';

export function domainToTiptap(content: PieceContent): JSONContent {
  if (content.kind === 'song') {
    throw new Error('Song content is not supported for editing yet.');
  }

  const tiptapContent: JSONContent[] = content.blocks.map(blockToTiptap);

  return {
    type: 'doc',
    content: tiptapContent,
  };
}

function blockToTiptap(block: TextBlock): JSONContent {
  let type = 'paragraph';
  if (block.kind === 'heading') type = 'heading';
  else if (block.kind === 'quote') type = 'blockquote';

  return {
    type,
    attrs: {
      id: block.id,
      ...(block.kind === 'heading' ? { level: 1 } : {}), // Simplified for MVP
    },
    content: block.runs.map(runToTiptap),
  };
}

function runToTiptap(run: TextRun): JSONContent {
  const marks = run.marks?.map(mark => ({ type: mark }));

  return {
    type: 'text',
    text: run.text,
    ...(marks && marks.length > 0 ? { marks } : {}),
  };
}

export function tiptapToDomain(
  tiptapJson: JSONContent,
  originalKind: 'text' | 'poem'
): TextPieceContent | PoemPieceContent {
  if (tiptapJson.type !== 'doc' || !Array.isArray(tiptapJson.content)) {
    return {
      kind: originalKind,
      blocks: [],
    };
  }

  const blocks: TextBlock[] = tiptapJson.content.map(tiptapToBlock).filter((b): b is TextBlock => b !== null);

  return {
    kind: originalKind,
    blocks,
  };
}

function tiptapToBlock(node: JSONContent): TextBlock | null {
  let kind: TextBlock['kind'] = 'paragraph';
  if (node.type === 'heading') kind = 'heading';
  else if (node.type === 'blockquote') kind = 'quote';
  else if (node.type !== 'paragraph') {
    // Treat other block types as paragraphs for now or just map them to paragraph.
    // If it's something entirely else we might ignore or adapt.
    kind = 'paragraph';
  }

  const runs: TextRun[] = [];
  if (node.content && Array.isArray(node.content)) {
    for (const child of node.content) {
      if (child.type === 'text' && child.text) {
        const marks: TextMark[] = [];
        if (child.marks) {
          for (const m of child.marks) {
            if (m.type === 'bold' || m.type === 'italic' || m.type === 'underline') {
              marks.push(m.type as TextMark);
            }
          }
        }
        runs.push({
          id: randomUUID(),
          text: child.text,
          ...(marks.length > 0 ? { marks } : {}),
        });
      } else if (child.type === 'hardBreak') {
        runs.push({
          id: randomUUID(),
          text: '\n',
        });
      }
    }
  }

  let blockId = node.attrs?.id;
  if (typeof blockId === 'function') {
    blockId = (blockId as () => string)();
  }
  if (!blockId || typeof blockId !== 'string') {
    blockId = randomUUID();
  }

  return {
    id: blockId,
    kind,
    runs,
  };
}
