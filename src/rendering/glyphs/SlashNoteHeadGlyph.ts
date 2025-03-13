import { Duration } from '@src/model/Duration';
import { ICanvas } from '@src/platform/ICanvas';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { NoteHeadGlyph } from './NoteHeadGlyph';
import { Glyph } from './Glyph';
import { BeamingHelper } from '../utils/BeamingHelper';
import { EffectGlyph } from './EffectGlyph';
import { Beat, BeatSubElement, NoteSubElement } from '@src/model';
import { ElementStyleHelper } from '../utils/ElementStyleHelper';

export class SlashNoteHeadGlyph extends EffectGlyph {
    public static readonly NoteHeadHeight: number = 17;

    public static readonly QuarterNoteHeadWidth: number = 12;
    public static readonly HalfNoteHeadWidth: number = 25;
    public static readonly WholeNoteHeadWidth: number = 32;

    private _isGrace: boolean;
    private _duration: Duration;

    public beatEffects: Map<string, Glyph> = new Map();
    public beamingHelper!: BeamingHelper;
    public noteHeadElement: NoteSubElement = NoteSubElement.SlashNoteHead;
    public effectElement: BeatSubElement = BeatSubElement.SlashEffects;
    private _symbol: MusicFontSymbol;

    public constructor(x: number, y: number, duration: Duration, isGrace: boolean, beat: Beat) {
        super(x, y);
        this._isGrace = isGrace;
        this._duration = duration;
        this._symbol = SlashNoteHeadGlyph.getSymbol(duration);
        this.beat = beat;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        using _ =
            this.beat!.notes.length === 0
                ? undefined
                : ElementStyleHelper.note(canvas, this.noteHeadElement, this.beat!.notes[0]);
        let offset: number = this._isGrace ? 1 : 0;
        const glyphScale = this._isGrace ? NoteHeadGlyph.GraceScale : 1;
        canvas.fillMusicFontSymbol(cx + this.x, cy + this.y + offset, glyphScale, this._symbol, false);

        this.paintEffects(cx, cy, canvas);
    }
    private paintEffects(cx: number, cy: number, canvas: ICanvas) {
        using _ = ElementStyleHelper.beat(canvas, this.effectElement, this.beat!);
        for (const g of this.beatEffects.values()) {
            g.paint(cx + this.x, cy + this.y, canvas);
        }
    }

    public override doLayout(): void {
        const scale: number = this._isGrace ? NoteHeadGlyph.GraceScale : 1;
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
            this.beamingHelper.registerBeatLineX('slash', this.beat!, cx + this.x + this.width, cx + this.x);
        }
    }
}
