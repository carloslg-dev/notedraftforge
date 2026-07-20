import { marked, Token } from 'marked';
import type { TextBlock, TextRun, TextMark } from '../../domain/types/';
import type { MarkdownParserPort } from '../../ports/';

export class MarkedParserAdapter implements MarkdownParserPort {
  parse(markdown: string): TextBlock[] {
    const tokens = marked.lexer(markdown);
    const blocks: TextBlock[] = [];

    for (const token of tokens) {
      const block = this.mapBlock(token);
      if (block) {
        blocks.push(block);
      }
    }

    return blocks;
  }

  private mapBlock(token: Token): TextBlock | null {
    switch (token.type) {
      case 'heading':
        return {
          id: crypto.randomUUID(),
          kind: 'heading',
          runs: this.mapRuns(token.tokens || []),
        };
      case 'paragraph':
        return {
          id: crypto.randomUUID(),
          kind: 'paragraph',
          runs: this.mapRuns(token.tokens || []),
        };
      case 'blockquote': {
        // Blockquote can contain nested blocks (e.g., paragraphs)
        // For simplicity as per MVP and D-05, we just flatten inner text into one blockquote
        // or extract runs from inner paragraphs.
        const runs = token.tokens?.flatMap((child: Token) => {
          if (child.type === 'paragraph') {
            return this.mapRuns(child.tokens || []);
          }
          if (child.type === 'text') {
            return [this.createTextRun(child.raw)];
          }
          return [];
        }) || [this.createTextRun(token.text)];

        return {
          id: crypto.randomUUID(),
          kind: 'quote',
          runs: runs.length > 0 ? runs : [this.createTextRun(token.text)],
        };
      }
      default:
        // Ignore unsupported blocks (lists, tables, code, html, hr, etc.)
        return null;
    }
  }

  private mapRuns(tokens: Token[]): TextRun[] {
    const runs: TextRun[] = [];

    for (const token of tokens) {
      if (token.type === 'text') {
        runs.push(this.createTextRun(token.text));
      } else if (token.type === 'strong') {
        const strongRuns = this.mapRuns(token.tokens || [{ type: 'text', raw: token.text, text: token.text } as Token]);
        for (const run of strongRuns) {
          run.marks = [...(run.marks || []), 'bold'];
          runs.push(run);
        }
      } else if (token.type === 'em') {
        const emRuns = this.mapRuns(token.tokens || [{ type: 'text', raw: token.text, text: token.text } as Token]);
        for (const run of emRuns) {
          run.marks = [...(run.marks || []), 'italic'];
          runs.push(run);
        }
      } else if (token.type === 'del' || token.type === 'codespan' || token.type === 'link') {
        // For strikethrough, inline code, and links, we just extract text without specific marks
        // Note: marked tokens types might include 'del', 'codespan' and 'link'.
        // We'll treat them as plain text or map their children if they have any.
        if ('tokens' in token && token.tokens) {
          runs.push(...this.mapRuns(token.tokens));
        } else if ('text' in token && typeof token.text === 'string') {
          runs.push(this.createTextRun(token.text));
        } else {
          runs.push(this.createTextRun(token.raw));
        }
      } else if (token.type === 'escape' || token.type === 'br') {
        // Simple string extraction
        runs.push(this.createTextRun(token.raw));
      }
      // Image and other inline unsupported types are silently skipped
    }

    // Filter out empty runs just in case
    return runs.filter(run => run.text.length > 0);
  }

  private createTextRun(text: string, marks?: TextMark[]): TextRun {
    const run: TextRun = {
      id: crypto.randomUUID(),
      text,
    };
    if (marks && marks.length > 0) {
      run.marks = marks;
    }
    return run;
  }
}
