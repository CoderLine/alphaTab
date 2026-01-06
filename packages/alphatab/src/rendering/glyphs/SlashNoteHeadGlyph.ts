import { type Beat, BeatSubElement } from '@coderline/alphatab/model/Beat';
import { Duration } from '@coderline/alphatab/model/Duration';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { NoteSubElement } from '@coderline/alphatab/model/Note';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import type { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import { NoteHeadGlyphBase } from '@coderline/alphatab/rendering/glyphs/NoteHeadGlyph';
import type { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

/**
 * @internal
 */
export class SlashNoteHeadGlyph extends NoteHeadGlyphBase {
    public beatEffects: Map<string, Glyph> = new Map();
    public noteHeadElement: NoteSubElement = NoteSubElement.SlashNoteHead;
    public effectElement: BeatSubElement = BeatSubElement.SlashEffects;

    public stemX: number = 0;

    public constructor(x: number, y: number, beat: Beat) {
        super(x, y, beat.graceType !== GraceType.None, SlashNoteHeadGlyph.getSymbol(beat.duration));
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

        const lr = this.renderer as LineBarRenderer;
        const effectSpacing: number = lr.smuflMetrics.onNoteEffectPadding;
        let effectY = lr.smuflMetrics.glyphHeights.get(this.symbol)!;

        let minEffectY = Number.NaN;
        let maxEffectY = Number.NaN;

        for (const g of this.beatEffects.values()) {
            g.y += effectY;
            g.x += this.width / 2;
            g.renderer = lr;
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
            lr.registerBeatEffectOverflows(minEffectY, maxEffectY);
        }

        const direction = lr.getBeatDirection(this.beat!);
        const symbol = this.symbol;
        if (direction === BeamDirection.Up) {
            const stemInfoUp = lr.smuflMetrics.stemUp.has(symbol) ? lr.smuflMetrics.stemUp.get(symbol)!.x : 0;
            this.stemX = stemInfoUp;
        } else {
            const stemInfoDown = lr.smuflMetrics.stemDown.has(symbol) ? lr.smuflMetrics.stemDown.get(symbol)!.x : 0;
            this.stemX = stemInfoDown;
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
}
