import type { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';

/**
 * @internal
 */
export class ScoreNoteGlyphInfo {
    public glyph: MusicFontGlyph;
    public steps: number = 0;

    public constructor(glyph: MusicFontGlyph, line: number) {
        this.glyph = glyph;
        this.steps = line;
    }
}
