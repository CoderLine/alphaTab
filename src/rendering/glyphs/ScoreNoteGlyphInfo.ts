import type { Glyph } from '@src/rendering/glyphs/Glyph';

export class ScoreNoteGlyphInfo {
    public glyph: Glyph;
    public steps: number = 0;

    public constructor(glyph: Glyph, line: number) {
        this.glyph = glyph;
        this.steps = line;
    }
}
