import { MusicFontGlyph } from '@coderline/alphatab/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';

/**
 * @internal
 */
export class PictEdgeOfCymbalGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number) {
        super(x, y, 0.5, MusicFontSymbol.PictEdgeOfCymbal);
        this.center = true;
    }

    public override doLayout(): void {
        super.doLayout();
        this.offsetY = this.height;
    }
}
