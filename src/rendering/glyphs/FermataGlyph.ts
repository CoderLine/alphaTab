import { FermataType } from '@src/model/Fermata';
import { ICanvas } from '@src/platform/ICanvas';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';

export class FermataGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number, fermata: FermataType) {
        super(x, y, 1, FermataGlyph.getSymbol(fermata));
    }

    private static getSymbol(accentuation: FermataType): MusicFontSymbol {
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

    public doLayout(): void {
        this.width = 23 * this.scale;
        this.height = 12 * this.scale;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        super.paint(cx - this.width / 2, cy + this.height, canvas);
    }
}
