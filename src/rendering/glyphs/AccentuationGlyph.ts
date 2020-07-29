import { AccentuationType } from '@src/model/AccentuationType';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/rendering/glyphs/MusicFontSymbol';

export class AccentuationGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number, accentuation: AccentuationType) {
        super(x, y, 1, AccentuationGlyph.getSymbol(accentuation));
    }

    private static getSymbol(accentuation: AccentuationType): MusicFontSymbol {
        switch (accentuation) {
            case AccentuationType.None:
                return MusicFontSymbol.None;
            case AccentuationType.Normal:
                return MusicFontSymbol.ArticAccentAbove;
            case AccentuationType.Heavy:
                return MusicFontSymbol.ArticMarcatoAbove;
            default:
                return MusicFontSymbol.None;
        }
    }

    public doLayout(): void {
        this.width = 9 * this.scale;
    }
}
