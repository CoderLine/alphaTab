import { PickStroke } from '@src/model/PickStroke';
import { ICanvas } from '@src/platform/ICanvas';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/rendering/glyphs/MusicFontSymbol';
import { NoteHeadGlyph } from './NoteHeadGlyph';

export class PickStrokeGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number, pickStroke: PickStroke) {
        super(x, y, NoteHeadGlyph.GraceScale, PickStrokeGlyph.getSymbol(pickStroke));
    }

    public doLayout(): void {
        this.width = 9 * this.scale;
        this.height = 10 * this.scale;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        super.paint(cx, cy + this.height, canvas);
    }

    private static getSymbol(pickStroke: PickStroke): MusicFontSymbol {
        switch (pickStroke) {
            case PickStroke.Up:
                return MusicFontSymbol.PickStrokeUp;
            case PickStroke.Down:
                return MusicFontSymbol.PickStrokeDown;
            default:
                return MusicFontSymbol.None;
        }
    }
}
