import { Duration } from '@coderline/alphatab/model/Duration';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { NoteHeadGlyphBase } from '@coderline/alphatab/rendering/glyphs/NoteHeadGlyph';

/**
 * @internal
 */
export class DiamondNoteHeadGlyph extends NoteHeadGlyphBase {
    public constructor(x: number, y: number, duration: Duration, isGrace: boolean) {
        super(x, y, isGrace, DiamondNoteHeadGlyph._getSymbol(duration));
    }

    private static _getSymbol(duration: Duration): MusicFontSymbol {
        switch (duration) {
            case Duration.QuadrupleWhole:
            case Duration.DoubleWhole:
            case Duration.Whole:
            case Duration.Half:
                return MusicFontSymbol.NoteheadDiamondWhiteWide;
            default:
                return MusicFontSymbol.NoteheadDiamondBlackWide;
        }
    }
}
