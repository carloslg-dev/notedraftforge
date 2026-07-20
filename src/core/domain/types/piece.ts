export interface Piece {
  id: string;             // UUID, generated on creation
  title: string;          // non-empty string
  type: PieceType;
  content: PieceContent;  // structured canonical content (not raw Markdown)
  language: string;       // ISO 639-1 code (e.g. 'en', 'es', 'ca')
  tags: TagRef[];         // structured tags; type semantics are explicit via tag kind
  createdAt: string;      // ISO 8601 datetime
  updatedAt: string;      // ISO 8601 datetime
  revision: number;       // monotonically increasing internal counter for snapshot freshness
}

export type PieceType = 'text' | 'poem' | 'song';

export type PieceContent = TextPieceContent | PoemPieceContent | SongPieceContent;

export interface TextPieceContent {
  kind: 'text';
  blocks: TextBlock[];
}

export interface PoemPieceContent {
  kind: 'poem';
  blocks: TextBlock[];
}

export interface SongPieceContent {
  kind: 'song';
  sections: SongSection[];
}

export interface TextBlock {
  id: string;
  kind: 'paragraph' | 'line' | 'heading' | 'quote';
  runs: TextRun[];
}

export interface TextRun {
  id: string;
  text: string;
  marks?: TextMark[];
}

export type TextMark = 'bold' | 'italic' | 'underline';

export interface SongSection {
  id: string;
  kind: 'intro' | 'verse' | 'pre-chorus' | 'chorus' | 'bridge' | 'outro' | 'custom';
  label?: string;       // required when kind = 'custom'
  cells: SongCell[];
}

export interface SongCell {
  id: string;
  text: string;
  chord?: ChordContent; // owned by the SongCell, not by Annotation
  meter?: MeterContent; // owned by the SongCell, not by Annotation
}

export interface ChordContent {
  root: MusicalRoot;
  modifiers: MusicalModifier[];   // ordered, may be empty
  display: string;                // derived and stored, e.g. "C#m7"
}

export type BaseNote = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
export type Accidental = '♭' | '♯' | '#' | 'b';
export type MusicalRoot = BaseNote | `${BaseNote}${Accidental}`;

// Modifier order is always: [alteration?, mode?, extension?]
// alteration: sharp | flat (mutually exclusive)
// mode: minor | major (mutually exclusive)
// extension: seventh
export type MusicalModifier = 'sharp' | 'flat' | 'minor' | 'major' | 'seventh';

// meter — free text, e.g. "4/4", "3/4", "2/4"
export type MeterContent = string;

export interface TagRef {
  kind: TagKind;
  value: string;
}

export type TagKind = 'type' | 'user';
