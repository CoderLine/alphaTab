import { Duration } from '@src/model/Duration';
import { ICanvas } from '@src/platform/ICanvas';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { NoteHeadGlyph } from './NoteHeadGlyph';

export class SlashNoteHeadGlyph extends MusicFontGlyph {
    public static readonly NoteHeadHeight: number = 17;

    public static readonly QuarterNoteHeadWidth: number = 12;
    public static readonly HalfNoteHeadWidth: number = 25;
    public static readonly WholeNoteHeadWidth: number = 32;

    private _isGrace: boolean;
    private _duration: Duration;

    public constructor(x: number, y: number, duration: Duration, isGrace: boolean) {
        super(x, y, isGrace ? NoteHeadGlyph.GraceScale : 1, SlashNoteHeadGlyph.getSymbol(duration));
        this._isGrace = isGrace;
        this._duration = duration;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        let offset: number = this._isGrace ? this.scale : 0;
        canvas.fillMusicFontSymbol(cx + this.x, cy + this.y + offset, this.glyphScale * this.scale, this.symbol, false);
    }

    public override doLayout(): void {
        const scale: number = (this._isGrace ? NoteHeadGlyph.GraceScale : 1) * this.scale;
        switch (this._duration) {
            case Duration.QuadrupleWhole:
            case Duration.DoubleWhole:
            case Duration.Whole:
                this.width = SlashNoteHeadGlyph.WholeNoteHeadWidth * scale;
                break;
            case Duration.Half:
                this.width = SlashNoteHeadGlyph.HalfNoteHeadWidth * scale;
                break;
            default:
                this.width = SlashNoteHeadGlyph.QuarterNoteHeadWidth * scale;
                break;
        }
        this.height = SlashNoteHeadGlyph.NoteHeadHeight * scale;
    }

    private static getSymbol(duration: Duration): MusicFontSymbol {
        switch (duration) {
            case Duration.QuadrupleWhole:
            case Duration.DoubleWhole:
            case Duration.Whole:
                return MusicFontSymbol.NoteheadSlashWhiteWhole;
            case Duration.Half:
                return MusicFontSymbol.NoteheadSlashWhiteHalf;
            default:
                return MusicFontSymbol.NoteheadSlashVerticalEnds;
        }
    }
}
