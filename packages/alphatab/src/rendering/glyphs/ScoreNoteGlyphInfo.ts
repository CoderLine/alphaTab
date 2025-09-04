import type { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';

export class ScoreNoteGlyphInfo {
    public glyph: MusicFontGlyph;
    public steps: number = 0;

    public constructor(glyph: MusicFontGlyph, line: number) {
        this.glyph = glyph;
        this.steps = line;
    }
}
