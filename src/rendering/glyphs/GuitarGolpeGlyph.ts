import { ICanvas } from '@src/platform/ICanvas';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';

export class GuitarGolpeGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number) {
        super(x, y, NoteHeadGlyph.GraceScale, MusicFontSymbol.GuitarGolpe);
    }

    public doLayout(): void {
        this.width = 9 * this.scale;
        this.height = 10 * this.scale;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        super.paint(cx, cy + this.height, canvas);
    }
}
