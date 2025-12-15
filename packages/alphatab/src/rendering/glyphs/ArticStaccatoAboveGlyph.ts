import { EngravingSettings } from '@coderline/alphatab/EngravingSettings';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { MusicFontGlyph } from '@coderline/alphatab/rendering/glyphs/MusicFontGlyph';

/**
 * @internal
 */
export class ArticStaccatoAboveGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number) {
        super(x, y, EngravingSettings.GraceScale, MusicFontSymbol.ArticStaccatoAbove);
        this.center = true;
    }

    public override doLayout(): void {
        super.doLayout();
        this.offsetY = this.height;
    }
}
