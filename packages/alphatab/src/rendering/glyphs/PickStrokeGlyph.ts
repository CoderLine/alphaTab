import { PickStroke } from '@src/model/PickStroke';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';

export class PickStrokeGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number, pickStroke: PickStroke) {
        super(x, y, NoteHeadGlyph.GraceScale, PickStrokeGlyph.getSymbol(pickStroke));
        this.center = true;
    }

    public override doLayout(): void {
        super.doLayout();
        this.offsetY = this.height;
    }

    private static getSymbol(pickStroke: PickStroke): MusicFontSymbol {
        switch (pickStroke) {
            case PickStroke.Up:
                return MusicFontSymbol.StringsUpBow;
            case PickStroke.Down:
                return MusicFontSymbol.StringsDownBow;
            default:
                return MusicFontSymbol.None;
        }
    }
}
