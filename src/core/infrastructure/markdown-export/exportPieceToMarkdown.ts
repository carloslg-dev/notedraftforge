import { Piece, TextBlock, TextRun, TextMark } from '../../domain/types/index';

export function exportPieceToMarkdown(piece: Piece): string {
  if (piece.type === 'song') {
    throw new Error('Song export not supported');
  }

  const content = piece.content;
  if (content.kind !== 'text' && content.kind !== 'poem') {
    throw new Error(`Unsupported piece kind: ${content.kind}`);
  }

  const blocksMd = content.blocks.map(block => blockToMarkdown(block));
  return blocksMd.join('\n\n');
}

function blockToMarkdown(block: TextBlock): string {
  const text = block.runs.map(run => runToMarkdown(run)).join('');

  switch (block.kind) {
    case 'heading':
      return `# ${text}`;
    case 'quote':
      return `> ${text}`;
    case 'paragraph':
    case 'line':
      return text;
    default:
      return text;
  }
}

function runToMarkdown(run: TextRun): string {
  if (!run.marks || run.marks.length === 0) {
    return run.text;
  }

  let result = run.text;
  // Apply marks. Order of wrapping doesn't matter much for Markdown, but we must be consistent.
  // We apply them in order: underline, italic, bold (so bold is outermost)
  const hasMark = (mark: TextMark) => run.marks?.includes(mark);

  if (hasMark('underline')) {
    result = `<u>${result}</u>`;
  }
  if (hasMark('italic')) {
    result = `*${result}*`;
  }
  if (hasMark('bold')) {
    result = `**${result}**`;
  }

  return result;
}
