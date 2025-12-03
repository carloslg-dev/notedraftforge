import { MultilangText } from './lang';
import { StyleId } from './style';

export interface SongBlock {
  chord?: string;
  melody?: string;
  lyrics: MultilangText;
}

export interface SongLine {
  blocks: SongBlock[];
}

export interface SongSection {
  name: string;
  lines: SongLine[];
}

export interface Song {
  id: string;
  title: MultilangText;
  authorId: string;
  styleId: StyleId;
  rhythm?: string;
  baseKey: string;
  singers: string[];
  tags?: string[];
  song: {
    sections: SongSection[];
  };
}
