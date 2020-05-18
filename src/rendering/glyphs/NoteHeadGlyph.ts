import { Duration } from '@src/model/Duration';
import { ICanvas } from '@src/platform/ICanvas';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/rendering/glyphs/MusicFontSymbol';

export class NoteHeadGlyph extends MusicFontGlyph {
    public static readonly GraceScale: number = 0.75;
    public static readonly NoteHeadHeight: number = 9;
    public static readonly QuarterNoteHeadWidth: number = 10;
    private _isGrace: boolean;
    private _duration: Duration;

    public constructor(x: number, y: number, duration: Duration, isGrace: boolean) {
        super(x, y, isGrace ? NoteHeadGlyph.GraceScale : 1, NoteHeadGlyph.getSymbol(duration));
        this._isGrace = isGrace;
        this._duration = duration;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        let offset: number = this._isGrace ? this.scale : 0;
        canvas.fillMusicFontSymbol(cx + this.x, cy + this.y + offset, this.glyphScale * this.scale, this.symbol, false);
    }

    public doLayout(): void {
        let scale: number = (this._isGrace ? NoteHeadGlyph.GraceScale : 1) * this.scale;
        switch (this._duration) {
            case Duration.QuadrupleWhole:
                this.width = 14 * scale;
                break;
            case Duration.DoubleWhole:
                this.width = 14 * (this._isGrace ? NoteHeadGlyph.GraceScale : 1) * this.scale;
                break;
            case Duration.Whole:
                this.width = 14 * (this._isGrace ? NoteHeadGlyph.GraceScale : 1) * this.scale;
                break;
            default:
                this.width = 10 * (this._isGrace ? NoteHeadGlyph.GraceScale : 1) * this.scale;
                break;
        }
        this.height = NoteHeadGlyph.NoteHeadHeight * scale;
    }

    private static getSymbol(duration: Duration): MusicFontSymbol {
        switch (duration) {
            case Duration.QuadrupleWhole:
                return MusicFontSymbol.NoteQuadrupleWhole;
            case Duration.DoubleWhole:
                return MusicFontSymbol.NoteDoubleWhole;
            case Duration.Whole:
                return MusicFontSymbol.NoteWhole;
            case Duration.Half:
                return MusicFontSymbol.NoteHalf;
            default:
                return MusicFontSymbol.NoteQuarter;
        }
    }
}
