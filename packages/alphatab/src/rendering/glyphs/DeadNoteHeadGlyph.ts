import { MusicFontGlyph } from '@coderline/alphatab/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { NoteHeadGlyph } from '@coderline/alphatab/rendering/glyphs/NoteHeadGlyph';

/**
 * @internal
 */
export class DeadNoteHeadGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number, isGrace: boolean) {
        super(x, y, isGrace ? NoteHeadGlyph.GraceScale : 1, MusicFontSymbol.NoteheadXOrnate);
    }
}
