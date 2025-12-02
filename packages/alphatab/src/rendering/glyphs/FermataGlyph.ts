import { FermataType } from '@coderline/alphatab/model/Fermata';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { MusicFontGlyph } from '@coderline/alphatab/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';

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

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        super.paint(cx - this.width / 2, cy + this.height, canvas);
    }
}
