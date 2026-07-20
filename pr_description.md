Closes #10

## Summary of changes
- Updated `MusicalRoot` type in `src/core/domain/types/piece.ts` to allow standard base notes (A-G) and base notes with optional accidentals (e.g. C#).
- Created `createChord` factory function in `src/core/domain/factories/chord.ts` for safe instantiations of `ChordContent`. It strictly validates standard roots (with and without optional accidentals) and validates modifiers, enforcing exclusivity for modifications (sharp/flat, minor/major) and their ordering as specified in domain terminology (alteration -> mode -> extension).
- Added `deriveChordDisplay` pure function within the chord factory to properly render unicode variants (e.g., `#` to `♯`, `b` to `♭`) for roots and correctly appends the modifiers to output standard display strings (e.g. `C♯m7`).
- Implemented unit tests for all domain rules surrounding validation and ordering of chord components.

## Checklist of Acceptance Criteria
- [x] Valid roots (A–G with accidentals) accepted: `createChord` correctly accepts `C`, `C#`, `Bb`, etc.
- [x] Invalid roots rejected with domain error: Inputs like `H` or `c` will explicitly throw a domain error.
- [x] Modifier ordering enforced: Modifiers are strictly stored in `[alteration, mode, extension]` order regardless of input.
- [x] `deriveChordDisplay()` returns correct display string: Function maps base logic and components correctly into display format with correct unicode rendering.
- [x] Respects domain invariants: Validation checks ensure mutual exclusivity (e.g., sharp and flat cannot exist on same chord).
- [x] Follows hexagonal architecture: Zero external dependencies in core domain logic.
- [x] No business logic inside adapters: All validation executed natively in factories/domain.
- [x] Pure function, zero side effects: Pure derivation of strings without relying on persistent external state.

## Ambiguities Found
none
