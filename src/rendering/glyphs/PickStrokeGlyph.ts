import { PickStroke } from '@src/model/PickStroke';
import type { ICanvas } from '@src/platform/ICanvas';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';

export class PickStrokeGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number, pickStroke: PickStroke) {
        super(x, y, NoteHeadGlyph.GraceScale, PickStrokeGlyph.getSymbol(pickStroke));
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        super.paint(cx, cy + this.height, canvas);
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
