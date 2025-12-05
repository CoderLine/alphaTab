import { Duration } from '@coderline/alphatab/model/Duration';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { NoteHeadGlyph } from '@coderline/alphatab/rendering/glyphs/NoteHeadGlyph';
import type { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import type { BeamingHelper } from '@coderline/alphatab/rendering/utils/BeamingHelper';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';
import { NoteSubElement } from '@coderline/alphatab/model/Note';
import { type Beat, BeatSubElement } from '@coderline/alphatab/model/Beat';
import { MusicFontGlyph } from '@coderline/alphatab/rendering/glyphs/MusicFontGlyph';

/**
 * @internal
 */
export class SlashNoteHeadGlyph extends MusicFontGlyph {
    public beatEffects: Map<string, Glyph> = new Map();
    public beamingHelper!: BeamingHelper;
    public noteHeadElement: NoteSubElement = NoteSubElement.SlashNoteHead;
    public effectElement: BeatSubElement = BeatSubElement.SlashEffects;
    private _symbol: MusicFontSymbol;

    public constructor(x: number, y: number, duration: Duration, isGrace: boolean, beat: Beat) {
        super(x, y, isGrace ? NoteHeadGlyph.GraceScale : 1, SlashNoteHeadGlyph.getSymbol(duration));
        this._symbol = SlashNoteHeadGlyph.getSymbol(duration);
        this.beat = beat;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        using _ =
            this.beat!.notes.length === 0
                ? undefined
                : ElementStyleHelper.note(canvas, this.noteHeadElement, this.beat!.notes[0]);
        super.paint(cx, cy, canvas);
        this._paintEffects(cx, cy, canvas);
    }
    private _paintEffects(cx: number, cy: number, canvas: ICanvas) {
        using _ = ElementStyleHelper.beat(canvas, this.effectElement, this.beat!);
        for (const g of this.beatEffects.values()) {
            g.paint(cx + this.x, cy + this.y, canvas);
        }
    }

    public override doLayout(): void {
        super.doLayout();

        const effectSpacing: number = this.renderer.smuflMetrics.onNoteEffectPadding;
        let effectY = this.renderer.smuflMetrics.glyphHeights.get(this._symbol)!;

        let minEffectY = Number.NaN;
        let maxEffectY = Number.NaN;

        for (const g of this.beatEffects.values()) {
            g.y += effectY;
            g.x += this.width / 2;
            g.renderer = this.renderer;
            effectY += g.height + effectSpacing;
            g.doLayout();

            if (Number.isNaN(minEffectY) || minEffectY > effectY) {
                minEffectY = effectY;
            }
            if (Number.isNaN(maxEffectY) || maxEffectY < effectY) {
                maxEffectY = effectY;
            }
        }

        if (!Number.isNaN(minEffectY)) {
            this.renderer.registerBeatEffectOverflows(minEffectY, maxEffectY);
        }
    }

    public static getSymbol(duration: Duration): MusicFontSymbol {
        switch (duration) {
            case Duration.QuadrupleWhole:
            case Duration.DoubleWhole:
            case Duration.Whole:
                return MusicFontSymbol.NoteheadSlashWhiteWhole;
            case Duration.Half:
                return MusicFontSymbol.NoteheadSlashWhiteHalf;
            default:
                return MusicFontSymbol.NoteheadSlashHorizontalEnds;
        }
    }

    public updateBeamingHelper(cx: number) {
        if (this.beamingHelper) {
            const symbol = this._symbol;
            const stemInfoUp = this.renderer.smuflMetrics.stemUp.has(symbol)
                ? this.renderer.smuflMetrics.stemUp.get(symbol)!.x
                : 0;
            const stemInfoDown = this.renderer.smuflMetrics.stemDown.has(symbol)
                ? this.renderer.smuflMetrics.stemDown.get(symbol)!.x
                : 0;

            this.beamingHelper.registerBeatLineX(
                'slash',
                this.beat!,
                cx + this.x + stemInfoUp,
                cx + this.x + stemInfoDown
            );
        }
    }
}
