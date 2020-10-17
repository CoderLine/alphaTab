import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';
import { ICanvas } from '@src/platform/ICanvas';

export class ArticStaccatoAboveGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number) {
        super(x, y, NoteHeadGlyph.GraceScale, MusicFontSymbol.ArticStaccatoAbove);
    }

    public doLayout(): void {
        this.width = NoteHeadGlyph.QuarterNoteHeadWidth * this.scale;
        this.height = 7 * this.scale;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        super.paint(cx + 3 * this.scale, cy + 5 * this.scale, canvas);
    }
}
