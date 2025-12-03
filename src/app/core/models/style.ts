export type StyleId =
  | 'pop'
  | 'rock'
  | 'rumba'
  | 'balada'
  | 'latin'
  | 'flamenco'
  | 'others';

export interface Style {
  id: StyleId;
  label: string;
}
