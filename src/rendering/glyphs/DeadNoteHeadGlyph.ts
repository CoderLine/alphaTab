import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';

export class DeadNoteHeadGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number, isGrace: boolean) {
        super(x, y, isGrace ? NoteHeadGlyph.GraceScale : 1, MusicFontSymbol.NoteheadXOrnate);
    }
}
