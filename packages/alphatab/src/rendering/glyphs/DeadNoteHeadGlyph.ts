import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { NoteHeadGlyphBase } from '@coderline/alphatab/rendering/glyphs/NoteHeadGlyph';

/**
 * @internal
 */
export class DeadNoteHeadGlyph extends NoteHeadGlyphBase {
    public constructor(x: number, y: number, isGrace: boolean) {
        super(x, y, isGrace, MusicFontSymbol.NoteheadXOrnate);
    }
}
