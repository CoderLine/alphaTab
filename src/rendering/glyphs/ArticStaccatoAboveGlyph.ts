import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/rendering/glyphs/MusicFontSymbol';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';

export class ArticStaccatoAboveGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number) {
        super(x, y, NoteHeadGlyph.GraceScale, MusicFontSymbol.ArticStaccatoAbove);
    }

    public doLayout(): void {
        this.width = 3 * this.scale;
        this.height = 3 * this.scale;
    }
}
