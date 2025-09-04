import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { VibratoGlyphBase } from '@src/rendering/glyphs/NoteVibratoGlyph';

export class BeatVibratoGlyph extends VibratoGlyphBase {
    protected override get slightVibratoGlyph(): MusicFontSymbol {
        return MusicFontSymbol.WiggleSawtoothNarrow;
    }

    protected override get wideVibratoGlyph(): MusicFontSymbol {
        return MusicFontSymbol.WiggleSawtooth;
    }
}
