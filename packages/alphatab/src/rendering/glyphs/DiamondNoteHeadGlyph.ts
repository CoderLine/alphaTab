import { Duration } from '@src/model/Duration';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';

/**
 * @internal
 */
export class DiamondNoteHeadGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number, duration: Duration, isGrace: boolean) {
        super(x, y, isGrace ? NoteHeadGlyph.GraceScale : 1, DiamondNoteHeadGlyph._getSymbol(duration));
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
