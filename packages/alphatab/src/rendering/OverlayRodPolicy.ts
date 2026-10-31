/**
 * Describes how a glyph's width is split into left/right extents
 * when contributing an overlay rod for bar spacing.
 * @internal
 */
export enum OverlayRodPolicy {
    /**
     * The glyph's width is split half-half around the beat anchor.
     */
    Centered = 0,
    /**
     * The glyph extends to the right of the beat anchor (left-aligned text).
     */
    Left = 1,
    /**
     * The glyph extends to the left of the beat anchor (right-aligned text).
     */
    Right = 2
}
