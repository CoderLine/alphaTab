import { Glyph } from '@src/rendering/glyphs/Glyph';

export class ScoreNoteGlyphInfo {
    public glyph: Glyph;
    public line: number = 0;

    public constructor(glyph: Glyph, line: number) {
        this.glyph = glyph;
        this.line = line;
    }
}
