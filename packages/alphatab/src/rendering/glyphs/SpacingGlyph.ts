import { Glyph } from '@src/rendering/glyphs/Glyph';

/**
 * This simple glyph allows to put an empty region in to a BarRenderer.
 */
export class SpacingGlyph extends Glyph {
    public constructor(x: number, y: number, width: number) {
        super(x, y);
        this.width = width;
    }
}
