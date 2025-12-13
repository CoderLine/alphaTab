import { type Beat, BeatSubElement } from '@coderline/alphatab/model/Beat';
import { Duration } from '@coderline/alphatab/model/Duration';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { NoteSubElement } from '@coderline/alphatab/model/Note';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { BeamDirection } from '@coderline/alphatab/rendering/_barrel';
import type { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import { NoteHeadGlyphBase } from '@coderline/alphatab/rendering/glyphs/NoteHeadGlyph';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

/**
 * @internal
 */
export class SlashNoteHeadGlyph extends NoteHeadGlyphBase {
    public beatEffects: Map<string, Glyph> = new Map();
    public noteHeadElement: NoteSubElement = NoteSubElement.SlashNoteHead;
    public effectElement: BeatSubElement = BeatSubElement.SlashEffects;
    private _symbol: MusicFontSymbol;

    public upLineX: number = 0;
    public downLineX: number = 0;

    public constructor(x: number, y: number, duration: Duration, isGrace: boolean, beat: Beat) {
        super(x, y, isGrace, SlashNoteHeadGlyph.getSymbol(duration));
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

        const symbol = this._symbol;
        const stemInfoUp = this.renderer.smuflMetrics.stemUp.has(symbol)
            ? this.renderer.smuflMetrics.stemUp.get(symbol)!.x
            : 0;
        this.upLineX = stemInfoUp;

        const stemInfoDown = this.renderer.smuflMetrics.stemDown.has(symbol)
            ? this.renderer.smuflMetrics.stemDown.get(symbol)!.x
            : 0;
        this.downLineX = stemInfoDown;
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
