import type { Piece } from '../../domain/types/';
import { createPiece } from '../../domain/factories';
import type { PieceRepository, MarkdownParserPort } from '../../ports/';

export interface ImportMarkdownCommand {
  title: string;
  markdown: string;
  language: string;
}

export class ImportMarkdownUseCase {
  constructor(
    private readonly pieces: PieceRepository,
    private readonly markdownParser: MarkdownParserPort
  ) {}

  async execute(input: ImportMarkdownCommand): Promise<Piece> {
    const blocks = this.markdownParser.parse(input.markdown);

    const piece = createPiece({
      title: input.title,
      type: 'text',
      language: input.language
    });

    // createPiece returns a text piece with empty blocks, revision 0.
    // We recreate it to add the parsed blocks while maintaining immutability
    // and keeping the revision as 0 as required by PM-REQ-09.
    const importedPiece: Piece = {
      ...piece,
      content: {
        kind: 'text',
        blocks
      }
    };

    await this.pieces.save(importedPiece);

    return importedPiece;
  }
}
