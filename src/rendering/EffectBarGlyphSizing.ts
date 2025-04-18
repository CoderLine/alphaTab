/**
 * Lists all sizing types of the effect bar glyphs
 */
export enum EffectBarGlyphSizing {
    /**
     * The effect glyph is placed above the pre-beat glyph which is before
     * the actual note in the area where also accidentals are renderered.
     */
    SinglePreBeat = 0,
    /**
     * The effect glyph is placed above the on-beat glyph which is where
     * the actual note head glyphs are placed.
     */
    SingleOnBeat = 1,
    /**
     * The effect glyph is placed above the on-beat glyph which is where
     * the actual note head glyphs are placed. The glyph will size to the end of
     * the applied beat.
     */
    SingleOnBeatToEnd = 2,
    /**
     * The effect glyph is placed above the on-beat glyph and expaded to the
     * on-beat position of the next beat.
     */
    GroupedOnBeat = 3,
    /**
     * The effect glyph is placed above the on-beat glyph and expaded to the
     * on-beat position of the next beat. The glyph will size to the end of
     * the applied beat.
     */
    GroupedOnBeatToEnd = 4,

    /**
     * The effect glyph is placed on the whole bar covering the whole width
     */
    FullBar = 5
}
