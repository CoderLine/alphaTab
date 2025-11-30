import { PickStroke } from '@coderline/alphatab/model/PickStroke';
import { MusicFontGlyph } from '@coderline/alphatab/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { NoteHeadGlyph } from '@coderline/alphatab/rendering/glyphs/NoteHeadGlyph';

/**
 * @internal
 */
export class PickStrokeGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number, pickStroke: PickStroke) {
        super(x, y, NoteHeadGlyph.GraceScale, PickStrokeGlyph._getSymbol(pickStroke));
        this.center = true;
    }

    public override doLayout(): void {
        super.doLayout();
        this.offsetY = this.height;
    }

    private static _getSymbol(pickStroke: PickStroke): MusicFontSymbol {
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
