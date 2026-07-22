import { ChordContent, MusicalModifier, MusicalRoot } from '../types/piece';

export function deriveChordDisplay(chord: { root: MusicalRoot; modifiers: MusicalModifier[] }): string {
  let display = chord.root;

  for (const mod of chord.modifiers) {
    switch (mod) {
      case 'sharp':
        display += '♯';
        break;
      case 'flat':
        display += '♭';
        break;
      case 'minor':
        display += 'm';
        break;
      case 'major':
        display += 'M';
        break;
      case 'seventh':
        display += '7';
        break;
    }
  }

  return display;
}

export function createChord(root: string, modifiers: string[] = []): ChordContent {
  const rootRegex = /^[A-G]([♭♯#b])?$/;
  if (!rootRegex.test(root)) {
    throw new Error(`Invalid root note: ${root}. Must be A-G with optional accidental.`);
  }

  const baseNote = root[0] as MusicalRoot;
  const accidental = root[1];
  const rootAlteration: MusicalModifier | null = accidental
    ? (accidental === '#' || accidental === '♯' ? 'sharp' : 'flat')
    : null;

  const inputAlterations = modifiers.filter(m => m === 'sharp' || m === 'flat') as MusicalModifier[];
  const allAlterations: MusicalModifier[] = [];
  if (rootAlteration) {
    allAlterations.push(rootAlteration);
  }
  allAlterations.push(...inputAlterations);

  if (allAlterations.length > 1) {
    throw new Error('A chord cannot have multiple alterations (sharp/flat are mutually exclusive).');
  }

  const modes = modifiers.filter(m => m === 'minor' || m === 'major') as MusicalModifier[];
  if (modes.length > 1) {
    throw new Error('A chord cannot have multiple modes (minor/major are mutually exclusive).');
  }

  const extensions = modifiers.filter(m => m === 'seventh') as MusicalModifier[];
  if (extensions.length > 1) {
    throw new Error('A chord cannot have multiple identical extensions.');
  }

  const allowedMods = ['sharp', 'flat', 'minor', 'major', 'seventh'];
  const invalidMods = modifiers.filter(m => !allowedMods.includes(m));
  if (invalidMods.length > 0) {
    throw new Error(`Invalid modifiers found: ${invalidMods.join(', ')}`);
  }

  const finalModifiers: MusicalModifier[] = [];
  if (allAlterations.length > 0) {
    finalModifiers.push(allAlterations[0]);
  }
  if (modes.length > 0) {
    finalModifiers.push(modes[0]);
  }
  if (extensions.length > 0) {
    finalModifiers.push(extensions[0]);
  }

  return {
    root: baseNote,
    modifiers: finalModifiers,
    display: deriveChordDisplay({ root: baseNote, modifiers: finalModifiers }),
  };
}

