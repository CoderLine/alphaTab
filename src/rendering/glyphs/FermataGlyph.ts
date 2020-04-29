import { FermataType } from '@src/model/Fermata';
import { ICanvas } from '@src/platform/ICanvas';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/rendering/glyphs/MusicFontSymbol';

export class FermataGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number, fermata: FermataType) {
        super(x, y, 1, FermataGlyph.getSymbol(fermata));
    }

    private static getSymbol(accentuation: FermataType): MusicFontSymbol {
        switch (accentuation) {
            case FermataType.Short:
                return MusicFontSymbol.FermataShort;
            case FermataType.Medium:
                return MusicFontSymbol.FermataMedium;
            case FermataType.Long:
                return MusicFontSymbol.FermataLong;
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
