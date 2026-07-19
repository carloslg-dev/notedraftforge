import { ChordContent, MusicalModifier, MusicalRoot } from '../types/piece';

export function deriveChordDisplay(chord: { root: MusicalRoot; modifiers: MusicalModifier[] }): string {
  // Replace ASCII # and b in the root with their correct unicode counterparts for display
  let display = chord.root.replace(/#/g, '♯').replace(/b/g, '♭');

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

  // Normalize accidentals
  const normalizedRoot = root.replace(/#/g, '♯').replace(/b/g, '♭');

  // Group modifiers for validation
  const validModifiers: MusicalModifier[] = [];

  const alterations = modifiers.filter(m => m === 'sharp' || m === 'flat');
  if (alterations.length > 1) {
    throw new Error('A chord cannot have multiple alterations (sharp/flat are mutually exclusive).');
  }

  const modes = modifiers.filter(m => m === 'minor' || m === 'major');
  if (modes.length > 1) {
    throw new Error('A chord cannot have multiple modes (minor/major are mutually exclusive).');
  }

  const extensions = modifiers.filter(m => m === 'seventh');
  if (extensions.length > 1) {
    throw new Error('A chord cannot have multiple identical extensions.');
  }

  // Ensure no invalid modifiers are passed
  const allowedMods = ['sharp', 'flat', 'minor', 'major', 'seventh'];
  const invalidMods = modifiers.filter(m => !allowedMods.includes(m));
  if (invalidMods.length > 0) {
    throw new Error(`Invalid modifiers found: ${invalidMods.join(', ')}`);
  }

  // Modifier order: alteration, mode, extension
  if (alterations.length > 0) validModifiers.push(alterations[0] as MusicalModifier);
  if (modes.length > 0) validModifiers.push(modes[0] as MusicalModifier);
  if (extensions.length > 0) validModifiers.push(extensions[0] as MusicalModifier);

  const typedRoot = normalizedRoot as MusicalRoot;

  return {
    root: typedRoot,
    modifiers: validModifiers,
    display: deriveChordDisplay({ root: typedRoot, modifiers: validModifiers }),
  };
}
