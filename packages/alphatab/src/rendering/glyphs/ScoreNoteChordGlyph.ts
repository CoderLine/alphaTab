import { EngravingSettings } from '@coderline/alphatab/EngravingSettings';
import { type Beat, BeatSubElement } from '@coderline/alphatab/model/Beat';
import { Duration } from '@coderline/alphatab/model/Duration';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import type { Note } from '@coderline/alphatab/model/Note';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { NoteXPosition, NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { DeadSlappedBeatGlyph } from '@coderline/alphatab/rendering/glyphs/DeadSlappedBeatGlyph';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import type { NoteHeadGlyphBase } from '@coderline/alphatab/rendering/glyphs/NoteHeadGlyph';
import {
    ScoreChordNoteHeadInfo,
    ScoreNoteChordGlyphBase
} from '@coderline/alphatab/rendering/glyphs/ScoreNoteChordGlyphBase';
import { TremoloPickingGlyph } from '@coderline/alphatab/rendering/glyphs/TremoloPickingGlyph';
import type { ScoreBarRenderer } from '@coderline/alphatab/rendering/ScoreBarRenderer';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';
import type { IBoundsLookupWriter } from '@coderline/alphatab/rendering/utils/IBoundsLookupWriter';

/**
 * @internal
 */
export class ScoreNoteChordGlyph extends ScoreNoteChordGlyphBase {
    private _deadSlapped: DeadSlappedBeatGlyph | null = null;
    private _tremoloPicking: TremoloPickingGlyph | null = null;
    private _stemLengthExtension = 0;

    private _aboveBeatEffects: Map<string, EffectGlyph> | null = null;
    private _belowBeatEffects: Map<string, EffectGlyph> | null = null;
    public beat!: Beat;

    public get aboveBeatEffects(): Map<string, EffectGlyph> {
        let effects = this._aboveBeatEffects;
        if (!effects) {
            effects = new Map<string, EffectGlyph>();
            this._aboveBeatEffects = effects;
        }
        return effects;
    }

    public get belowBeatEffects(): Map<string, EffectGlyph> {
        let effects = this._belowBeatEffects;
        if (!effects) {
            effects = new Map<string, EffectGlyph>();
            this._belowBeatEffects = effects;
        }
        return effects;
    }

    public get direction(): BeamDirection {
        return (this.renderer as ScoreBarRenderer).getBeatDirection(this.beat);
    }

    public override get hasFlag(): boolean {
        return (this.renderer as ScoreBarRenderer).hasFlag(this.beat);
    }

    public override get hasStem(): boolean {
        return (this.renderer as ScoreBarRenderer).hasStem(this.beat);
    }

    public override get scale(): number {
        return this.beat.graceType !== GraceType.None ? EngravingSettings.GraceScale : 1;
    }

    protected override getScoreChordNoteHeadInfo(): ScoreChordNoteHeadInfo {
        // never share grace beats
        if (this.beat.graceType !== GraceType.None) {
            return new ScoreChordNoteHeadInfo(this.direction);
        }

        return (this.renderer as ScoreBarRenderer).getChordNoteHeadInfo(this.beat.displayStart, this.direction);
    }

    public getNoteX(note: Note, requestedPosition: NoteXPosition): number {
        const n = this.getNoteGlyph(note);
        if (n) {
            let pos = this.x + n.x;
            switch (requestedPosition) {
                case NoteXPosition.Left:
                    break;
                case NoteXPosition.Center:
                    pos += n.width / 2;
                    break;
                case NoteXPosition.Right:
                    pos += n.width;
                    break;
            }
            return pos;
        }
        return 0;
    }

    public getNoteY(note: Note, requestedPosition: NoteYPosition): number {
        const n = this.getNoteGlyph(note);
        if (n) {
            return this._internalGetNoteY(n, requestedPosition);
        }
        return 0;
    }

    public getLowestNoteY(requestedPosition: NoteYPosition): number {
        return this.maxStepsNote ? this._internalGetNoteY(this.maxStepsNote, requestedPosition) : 0;
    }

    public getHighestNoteY(requestedPosition: NoteYPosition): number {
        return this.minStepsNote ? this._internalGetNoteY(this.minStepsNote, requestedPosition) : 0;
    }

    private _internalGetNoteY(n: NoteHeadGlyphBase, requestedPosition: NoteYPosition): number {
        const sr = this.renderer as ScoreBarRenderer;
        const scale = this.scale;
        switch (requestedPosition) {
            case NoteYPosition.TopWithStem: {
                // stem start and size according to duration
                let pos = this.y + n.getNoteHeadY(sr.smuflMetrics, NoteYPosition.StemUp);
                pos -= sr.smuflMetrics.getStemLength(this.beat.duration, sr.hasFlag(this.beat)) * scale;
                pos -= this._stemLengthExtension;

                let topCenterY = sr.centerStaffStemY(this.direction);
                topCenterY -= this._stemLengthExtension;

                return Math.min(topCenterY, pos);
            }
            case NoteYPosition.BottomWithStem: {
                // stem start and size according to duration
                let pos = this.y + n.getNoteHeadY(sr.smuflMetrics, NoteYPosition.StemDown);
                pos += sr.smuflMetrics.getStemLength(this.beat.duration, sr.hasFlag(this.beat)) * scale;
                pos += this._stemLengthExtension;

                let bottomCenterY = sr.centerStaffStemY(this.direction);
                bottomCenterY += this._stemLengthExtension;

                return Math.max(bottomCenterY, pos);
            }
        }
        return this.y + n.getNoteHeadY(sr.smuflMetrics, requestedPosition);
    }

    public addMainNoteGlyph(noteGlyph: NoteHeadGlyphBase, note: Note, noteLine: number): void {
        super.add(noteGlyph, noteLine, note);
    }

    public addEffectNoteGlyph(noteGlyph: NoteHeadGlyphBase, noteLine: number): void {
        super.add(noteGlyph, noteLine, null);
    }

    public override doLayout(): void {
        super.doLayout();
        const scoreRenderer = this.renderer as ScoreBarRenderer;

        if (this.beat.deadSlapped) {
            this._deadSlapped = new DeadSlappedBeatGlyph();
            this._deadSlapped.renderer = this.renderer;
            this._deadSlapped.doLayout();
            this.width = this._deadSlapped.width;
            this.onTimeX = this.width / 2;
        }

        let aboveBeatEffectsY = 0;
        let belowBeatEffectsY = 0;
        const effectSpacing = this.renderer.smuflMetrics.onNoteEffectPadding;

        if (this.beat.deadSlapped) {
            belowBeatEffectsY = scoreRenderer.getScoreY(0);
            aboveBeatEffectsY = scoreRenderer.getScoreY(scoreRenderer.heightLineCount);
        } else {
            if (this.direction === BeamDirection.Up) {
                belowBeatEffectsY = this._internalGetNoteY(this.maxStepsNote!, NoteYPosition.Bottom) + effectSpacing;
                aboveBeatEffectsY =
                    this._internalGetNoteY(this.minStepsNote!, NoteYPosition.TopWithStem) - effectSpacing;
            } else {
                belowBeatEffectsY =
                    this._internalGetNoteY(this.maxStepsNote!, NoteYPosition.BottomWithStem) + effectSpacing;
                aboveBeatEffectsY = this._internalGetNoteY(this.minStepsNote!, NoteYPosition.Top) - effectSpacing;
            }
        }

        let minEffectY: number | null = null;
        let maxEffectY: number | null = null;

        const aboveBeatEffects = this._aboveBeatEffects;
        if (aboveBeatEffects) {
            for (const effect of aboveBeatEffects.values()) {
                effect.renderer = this.renderer;
                effect.doLayout();

                aboveBeatEffectsY -= effect.height;

                effect.y = aboveBeatEffectsY;
                if (minEffectY === null || minEffectY > aboveBeatEffectsY) {
                    minEffectY = aboveBeatEffectsY;
                }
                if (maxEffectY === null || maxEffectY < aboveBeatEffectsY) {
                    maxEffectY = aboveBeatEffectsY;
                }

                aboveBeatEffectsY -= effectSpacing;
            }
        }

        const belowBeatEffects = this._belowBeatEffects;
        if (belowBeatEffects) {
            for (const effect of belowBeatEffects.values()) {
                effect.renderer = this.renderer;
                effect.doLayout();

                effect.y = belowBeatEffectsY;

                if (minEffectY === null || minEffectY > belowBeatEffectsY) {
                    minEffectY = belowBeatEffectsY;
                }
                if (maxEffectY === null || maxEffectY < belowBeatEffectsY) {
                    maxEffectY = belowBeatEffectsY;
                }

                belowBeatEffectsY += effect.height + effectSpacing;
            }
        }

        if (minEffectY !== null) {
            scoreRenderer.registerBeatEffectOverflowsForBeat(this.beat, minEffectY, maxEffectY ?? 0);
        }

        if (this.beat.isTremolo && !this.beat.deadSlapped) {
            this._tremoloPicking = new TremoloPickingGlyph(0, 0, this.beat.tremoloPicking!);
            this._tremoloPicking.renderer = this.renderer;
            this._tremoloPicking.doLayout();

            this._alignTremoloPickingGlyph();
        }
    }

    private _alignTremoloPickingGlyph() {
        const g = this._tremoloPicking!;
        const direction = this.direction;
        if (direction === BeamDirection.Up) {
            g.alignTremoloPickingGlyph(
                direction,
                this.getHighestNoteY(NoteYPosition.TopWithStem),
                this.getHighestNoteY(NoteYPosition.Center),
                this.beat.duration
            );
        } else {
            g.alignTremoloPickingGlyph(
                direction,
                this.getLowestNoteY(NoteYPosition.BottomWithStem),
                this.getLowestNoteY(NoteYPosition.Center),
                this.beat.duration
            );
        }
        this._stemLengthExtension = g.stemExtensionHeight;

        let tremoloX: number = this.stemX;
        if (this.beat.duration < Duration.Half) {
            tremoloX = this.width / 2;
        }

        g.x = tremoloX;
    }

    public buildBoundingsLookup(writer: IBoundsLookupWriter, cx: number, cy: number) {
        const scale = this.renderer.settings.display.scale;
        // note bounds are listed in the note order of the beat
        for (const note of this.beat.notes) {
            const glyph = this.getNoteGlyph(note);
            if (glyph) {
                writer.addNote(
                    note,
                    (cx + this.x + glyph.x) * scale,
                    (cy + this.y + glyph.y - glyph.height / 2) * scale,
                    glyph.width * scale,
                    glyph.height * scale
                );
            }
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        this._paintEffects(cx, cy, canvas);

        super.paint(cx, cy, canvas);
    }

    private _paintEffects(cx: number, cy: number, canvas: ICanvas) {
        const previousColor = ElementStyleHelper.applyBeat(canvas, BeatSubElement.StandardNotationEffects, this.beat);
        try {
            const aboveBeatEffects = this._aboveBeatEffects;
            if (aboveBeatEffects) {
                for (const g of aboveBeatEffects.values()) {
                    g.paint(cx + this.x + this.width / 2, cy + this.y, canvas);
                }
            }
            const belowBeatEffects = this._belowBeatEffects;
            if (belowBeatEffects) {
                for (const g of belowBeatEffects.values()) {
                    g.paint(cx + this.x + this.width / 2, cy + this.y, canvas);
                }
            }
            if (this._tremoloPicking) {
                this._tremoloPicking.paint(cx, cy, canvas);
            }
            if (this._deadSlapped) {
                this._deadSlapped.paint(cx, cy, canvas);
            }
        } finally {
            ElementStyleHelper.restore(canvas, previousColor);
        }
    }
}
