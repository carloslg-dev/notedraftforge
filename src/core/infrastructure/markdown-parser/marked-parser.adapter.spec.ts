import { describe, it, expect } from 'vitest';
import { MarkedParserAdapter } from './marked-parser.adapter';

describe('MarkedParserAdapter', () => {
  it('parses headings and paragraphs with runs', () => {
    const parser = new MarkedParserAdapter();
    const blocks = parser.parse('# Heading\n\nThis is a paragraph with **bold** and *italic*.');

    expect(blocks).toHaveLength(2);

    expect(blocks[0].kind).toBe('heading');
    expect(blocks[0].runs).toHaveLength(1);
    expect(blocks[0].runs[0].text).toBe('Heading');

    expect(blocks[1].kind).toBe('paragraph');
    expect(blocks[1].runs).toHaveLength(5);
    expect(blocks[1].runs[0].text).toBe('This is a paragraph with ');
    expect(blocks[1].runs[1].text).toBe('bold');
    expect(blocks[1].runs[1].marks).toContain('bold');
    expect(blocks[1].runs[2].text).toBe(' and ');
    expect(blocks[1].runs[3].text).toBe('italic');
    expect(blocks[1].runs[3].marks).toContain('italic');
    expect(blocks[1].runs[4].text).toBe('.');
  });

  it('silently ignores unsupported structures like tables and code blocks', () => {
    const parser = new MarkedParserAdapter();
    const blocks = parser.parse('# Heading\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n```\ncode\n```\n\nText');

    expect(blocks).toHaveLength(2);
    expect(blocks[0].kind).toBe('heading');
    expect(blocks[1].kind).toBe('paragraph');
    expect(blocks[1].runs[0].text).toBe('Text');
  });

  it('parses blockquotes', () => {
    const parser = new MarkedParserAdapter();
    const blocks = parser.parse('> This is a quote.');

    expect(blocks).toHaveLength(1);
    expect(blocks[0].kind).toBe('quote');
    expect(blocks[0].runs[0].text).toBe('This is a quote.');
  });
});
