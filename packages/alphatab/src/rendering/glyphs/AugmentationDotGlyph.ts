import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';

/**
 * @internal
 */
export class AugmentationDotGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number) {
        super(x, y, 1, MusicFontSymbol.AugmentationDot);
    }

    public override doLayout(): void {
        super.doLayout();
        this.offsetX = this.width / 2;
        this.width *= 1.5;
    }
}
