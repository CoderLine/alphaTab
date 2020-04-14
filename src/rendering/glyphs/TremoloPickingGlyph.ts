import { Duration } from '@src/model/Duration';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/rendering/glyphs/MusicFontSymbol';

export class TremoloPickingGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number, duration: Duration) {
        super(x, y, 1, TremoloPickingGlyph.getSymbol(duration));
    }

    public doLayout(): void {
        this.width = 12 * this.scale;
    }

    private static getSymbol(duration: Duration): MusicFontSymbol {
        switch (duration) {
            case Duration.ThirtySecond:
                return MusicFontSymbol.TremoloPickingThirtySecond;
            case Duration.Sixteenth:
                return MusicFontSymbol.TremoloPickingSixteenth;
            case Duration.Eighth:
                return MusicFontSymbol.TremoloPickingEighth;
            default:
                return MusicFontSymbol.None;
        }
    }
}
