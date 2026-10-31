import { SpacingGlyph } from '@coderline/alphatab/rendering/glyphs/SpacingGlyph';
import type { IHeaderRodSink } from '@coderline/alphatab/rendering/staves/HeaderProfile';

/**
 * The spacing between the start barline and the first bar header glyph (clef, key signature, time signature ...).
 * @internal
 */
export class StartSpacingGlyph extends SpacingGlyph {
    /**
     * The bar header column of the start spacing.
     */
    public static readonly HeaderRank: number = 100;

    public override registerHeaderRod(info: IHeaderRodSink): void {
        info.addHeaderRod(StartSpacingGlyph.HeaderRank, 0, this.width, this.width);
    }

    public override applyHeaderRod(info: IHeaderRodSink): void {
        this.x = info.getHeaderRodX(StartSpacingGlyph.HeaderRank, 0);
    }
}
