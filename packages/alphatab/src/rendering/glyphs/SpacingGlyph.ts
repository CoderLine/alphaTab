import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';

/**
 * This simple glyph allows to put an empty region in to a BarRenderer.
 * @internal
 */
export class SpacingGlyph extends Glyph {
    public constructor(x: number, y: number, width: number) {
        super(x, y);
        this.width = width;
    }

    public override getBoundingBoxTop(): number {
        return Number.NaN;
    }

    public override getBoundingBoxBottom(): number {
        return Number.NaN;
    }
}
