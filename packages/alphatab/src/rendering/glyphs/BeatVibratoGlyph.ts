import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { VibratoGlyphBase } from '@coderline/alphatab/rendering/glyphs/NoteVibratoGlyph';

/**
 * @internal
 */
export class BeatVibratoGlyph extends VibratoGlyphBase {
    protected override get slightVibratoGlyph(): MusicFontSymbol {
        return MusicFontSymbol.WiggleSawtoothNarrow;
    }

    protected override get wideVibratoGlyph(): MusicFontSymbol {
        return MusicFontSymbol.WiggleSawtooth;
    }
}
