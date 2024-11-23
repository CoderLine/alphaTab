import { Duration } from '@src/model/Duration';
import { ICanvas } from '@src/platform/ICanvas';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { NoteHeadGlyph } from './NoteHeadGlyph';
import { Glyph } from './Glyph';
import { BeamingHelper } from '../utils/BeamingHelper';
import { EffectGlyph } from './EffectGlyph';

export class SlashNoteHeadGlyph extends EffectGlyph {
    public static readonly NoteHeadHeight: number = 17;

    public static readonly QuarterNoteHeadWidth: number = 12;
    public static readonly HalfNoteHeadWidth: number = 25;
    public static readonly WholeNoteHeadWidth: number = 32;

    private _isGrace: boolean;
    private _duration: Duration;

    public beatEffects: Map<string, Glyph> = new Map();
    public beamingHelper!: BeamingHelper;
    private _symbol: MusicFontSymbol;

    public constructor(x: number, y: number, duration: Duration, isGrace: boolean) {
        super(x, y);
        this._isGrace = isGrace;
        this._duration = duration;
        this._symbol = SlashNoteHeadGlyph.getSymbol(duration)
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        let offset: number = this._isGrace ? 1 : 0;
        const glyphScale = this._isGrace ? NoteHeadGlyph.GraceScale : 1;
        canvas.fillMusicFontSymbol(cx + this.x, cy + this.y + offset, glyphScale, this._symbol, false);
        for (const g of this.beatEffects.values()) {
            g.paint(cx + this.x, cy + this.y, canvas);
        }
    }

    public override doLayout(): void {
        const scale: number = (this._isGrace ? NoteHeadGlyph.GraceScale : 1);
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

        let effectSpacing: number = 7;
        let effectY = SlashNoteHeadGlyph.NoteHeadHeight;
        for (const g of this.beatEffects.values()) {
            g.y += effectY;
            g.x += this.width / 2;
            g.renderer = this.renderer;
            effectY += effectSpacing;
            g.doLayout();
        }
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

    public updateBeamingHelper(cx: number) {
        if (this.beamingHelper) {
            this.beamingHelper.registerBeatLineX(
                'slash',
                this.beat!,
                cx + this.x + this.width,
                cx + this.x
            );
        }
    }

}
