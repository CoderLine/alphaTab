import { EngravingSettings } from '@coderline/alphatab/EngravingSettings';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { MusicFontGlyph } from '@coderline/alphatab/rendering/glyphs/MusicFontGlyph';

/**
 * @internal
 */
export class GuitarGolpeGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number, center: boolean = false) {
        super(x, y, EngravingSettings.GraceScale, MusicFontSymbol.GuitarGolpe);
        this.center = center;
    }

    public override doLayout(): void {
        super.doLayout();
        this.offsetY = this.height;
    }
}
