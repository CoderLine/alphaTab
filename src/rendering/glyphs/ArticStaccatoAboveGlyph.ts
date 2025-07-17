import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';

export class ArticStaccatoAboveGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number) {
        super(x, y, NoteHeadGlyph.GraceScale, MusicFontSymbol.ArticStaccatoAbove);
    }
}
