import { FermataType } from '@coderline/alphatab/model/Fermata';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { MusicFontGlyph } from '@coderline/alphatab/rendering/glyphs/MusicFontGlyph';

/**
 * @internal
 */
export class FermataGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number, fermata: FermataType) {
        super(x, y, 1, FermataGlyph._getSymbol(fermata));
    }

    private static _getSymbol(accentuation: FermataType): MusicFontSymbol {
        switch (accentuation) {
            case FermataType.Short:
                return MusicFontSymbol.FermataShortAbove;
            case FermataType.Medium:
                return MusicFontSymbol.FermataAbove;
            case FermataType.Long:
                return MusicFontSymbol.FermataLongAbove;
            default:
                return MusicFontSymbol.None;
        }
    }

    public override doLayout(): void {
        super.doLayout();
        this.center = true;
        this.offsetY = this.height;
    }
}
