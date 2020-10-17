import { Duration } from '@src/model/Duration';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';

export class DiamondNoteHeadGlyph extends MusicFontGlyph {
    private _isGrace: boolean;

    public constructor(x: number, y: number, duration: Duration, isGrace: boolean) {
        super(x, y, isGrace ? NoteHeadGlyph.GraceScale : 1, DiamondNoteHeadGlyph.getSymbol(duration));
        this._isGrace = isGrace;
    }

    private static getSymbol(duration: Duration): MusicFontSymbol {
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

    public doLayout(): void {
        this.width = 9 * (this._isGrace ? NoteHeadGlyph.GraceScale : 1) * this.scale;
        this.height = NoteHeadGlyph.NoteHeadHeight * this.scale;
    }
}
