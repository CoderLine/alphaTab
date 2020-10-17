import { Duration } from '@src/model/Duration';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';

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
                return MusicFontSymbol.Tremolo3;
            case Duration.Sixteenth:
                return MusicFontSymbol.Tremolo2;
            case Duration.Eighth:
                return MusicFontSymbol.Tremolo1;
            default:
                return MusicFontSymbol.None;
        }
    }
}
