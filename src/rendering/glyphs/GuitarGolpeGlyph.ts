import type { ICanvas } from '@src/platform/ICanvas';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';

export class GuitarGolpeGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number, center: boolean = false) {
        super(x, y, NoteHeadGlyph.GraceScale, MusicFontSymbol.GuitarGolpe);
        this.center = center;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        super.paint(cx, cy + this.height, canvas);
    }
}
