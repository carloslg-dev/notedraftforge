/**
 * Canonical Piece Types
 *
 * @see openspec/terminology.md
 */
export type PieceType = 'text' | 'poem' | 'song';

/**
 * Fixed domain layers (visual channels)
 *
 * @see openspec/domain-model.md
 */
export type LayerKind = 'chord' | 'meter' | 'breath' | 'intention' | 'comments';

/**
 * Annotation types allowed in the system
 *
 * @see openspec/terminology.md
 */
export type AnnotationKind = 'breath' | 'intent' | 'comment';

/**
 * Properties attached to a SongCell that drive layers
 *
 * @see openspec/domain-model.md
 */
export type SongCellPropertyKind = 'chord' | 'meter';

/**
 * Valid states for an Annotation
 *
 * @see openspec/domain-model.md
 */
export type AnnotationStatus = 'valid' | 'needsReview';
