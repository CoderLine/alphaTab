import { Beat } from '@src/model/Beat';
import { Glyph } from '@src/rendering/glyphs/Glyph';

/**
 * Effect-Glyphs implementing this public interface get notified
 * as they are expanded over multiple beats.
 */
export class EffectGlyph extends Glyph {
    /**
     * Gets or sets the beat where the glyph belongs to.
     */
    public beat!: Beat;

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


    public constructor(x: number = 0, y: number = 0) {
        super(x, y);
    }
}
