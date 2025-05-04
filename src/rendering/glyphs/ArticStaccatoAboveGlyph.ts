import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';
import type { ICanvas } from '@src/platform/ICanvas';

export class ArticStaccatoAboveGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number) {
        super(x, y, NoteHeadGlyph.GraceScale, MusicFontSymbol.ArticStaccatoAbove);
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        super.paint(cx + 3, cy + 5, canvas);
    }
}
