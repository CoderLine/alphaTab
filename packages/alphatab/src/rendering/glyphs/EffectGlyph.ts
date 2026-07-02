import type { Beat } from '@coderline/alphatab/model/Beat';
import type { EffectBand } from '@coderline/alphatab/rendering/EffectBand';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';

/**
 * Effect-Glyphs implementing this public interface get notified
 * as they are expanded over multiple beats.
 * @internal
 */
export class EffectGlyph extends Glyph {
    /**
     * Gets or sets the beat where the glyph belongs to.
     */
    public beat: Beat | null = null;

    /**
     * Gets or sets the next glyph of the same type in case
     * the effect glyph is expanded when using {@link EffectBarGlyphSizing.groupedOnBeat}.
     */
    public nextGlyph: EffectGlyph | null = null;

    /**
     * Gets or sets the previous glyph of the same type in case
     * the effect glyph is expanded when using {@link EffectBarGlyphSizing.groupedOnBeat}.
     */
    public previousGlyph: EffectGlyph | null = null;

    /**
     * Back-reference to the owning {@link EffectBand}, set when the band
     * creates the glyph.
     */
    public band: EffectBand | null = null;

    public constructor(x: number = 0, y: number = 0) {
        super(x, y);
    }
}
