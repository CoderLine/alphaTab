import { EngravingSettings } from '@coderline/alphatab/EngravingSettings';
import { type Beat, BeatSubElement } from '@coderline/alphatab/model/Beat';
import { Duration } from '@coderline/alphatab/model/Duration';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import type { Note } from '@coderline/alphatab/model/Note';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { NoteXPosition, NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { DeadSlappedBeatGlyph } from '@coderline/alphatab/rendering/glyphs/DeadSlappedBeatGlyph';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import type { MusicFontGlyph } from '@coderline/alphatab/rendering/glyphs/MusicFontGlyph';
import type { NoteHeadGlyphBase } from '@coderline/alphatab/rendering/glyphs/NoteHeadGlyph';
import {
    ScoreChordNoteHeadInfo,
    ScoreNoteChordGlyphBase
} from '@coderline/alphatab/rendering/glyphs/ScoreNoteChordGlyphBase';
import { TremoloPickingGlyph } from '@coderline/alphatab/rendering/glyphs/TremoloPickingGlyph';
import type { ScoreBarRenderer } from '@coderline/alphatab/rendering/ScoreBarRenderer';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';
import type { BeatBounds } from '@coderline/alphatab/rendering/utils/BeatBounds';
import { Bounds } from '@coderline/alphatab/rendering/utils/Bounds';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';
import { NoteBounds } from '@coderline/alphatab/rendering/utils/NoteBounds';

/**
 * @internal
 */
export class ScoreNoteChordGlyph extends ScoreNoteChordGlyphBase {
    private _noteGlyphLookup: Map<number, MusicFontGlyph> = new Map();
    private _notes: Note[] = [];
    private _deadSlapped: DeadSlappedBeatGlyph | null = null;
    private _tremoloPicking: TremoloPickingGlyph | null = null;
    private _stemLengthExtension = 0;

    public aboveBeatEffects: Map<string, EffectGlyph> = new Map();
    public belowBeatEffects: Map<string, EffectGlyph> = new Map();
    public beat!: Beat;

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

        const staff = this.beat.voice.bar.staff;
        const key = `score.noteheads.${staff.track.index}.${staff.index}.${this.beat.voice.bar.index}.${this.beat.absoluteDisplayStart}`;
        let existing = this.renderer.staff!.getSharedLayoutData<ScoreChordNoteHeadInfo | undefined>(key, undefined);
        if (!existing) {
            existing = new ScoreChordNoteHeadInfo(this.direction);
            this.renderer.staff!.setSharedLayoutData(key, existing);
        }
        return existing;
    }

    public getNoteX(note: Note, requestedPosition: NoteXPosition): number {
        if (this._noteGlyphLookup.has(note.id)) {
            const n = this._noteGlyphLookup.get(note.id)!;

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
        if (this._noteGlyphLookup.has(note.id)) {
            const n = this._noteGlyphLookup.get(note.id)!;
            return this._internalGetNoteY(n, requestedPosition);
        }
        return 0;
    }

    public getLowestNoteY(requestedPosition: NoteYPosition): number {
        return this.maxStepsNote ? this._internalGetNoteY(this.maxStepsNote.glyph, requestedPosition) : 0;
    }

    public getHighestNoteY(requestedPosition: NoteYPosition): number {
        return this.minStepsNote ? this._internalGetNoteY(this.minStepsNote.glyph, requestedPosition) : 0;
    }

    private _internalGetNoteY(n: MusicFontGlyph, requestedPosition: NoteYPosition): number {
        let pos = this.y + n.y;

        const sr = this.renderer as ScoreBarRenderer;
        const scale = this.beat.graceType !== GraceType.None ? EngravingSettings.GraceScale : 1;
        switch (requestedPosition) {
            case NoteYPosition.TopWithStem:
                // stem start
                pos -=
                    (sr.smuflMetrics.stemUp.has(n.symbol) ? sr.smuflMetrics.stemUp.get(n.symbol)!.bottomY : 0) * scale;

                // stem size according to duration
                pos -= sr.smuflMetrics.getStemLength(this.beat.duration, sr.hasFlag(this.beat)) * scale;
                pos -= this._stemLengthExtension;

                let topCenterY = sr.centerStaffStemY(this.direction);
                topCenterY -= this._stemLengthExtension;

                return Math.min(topCenterY, pos);

            case NoteYPosition.Top:
                pos -= n.height / 2;
                break;
            case NoteYPosition.Center:
                break;
            case NoteYPosition.Bottom:
                pos += n.height / 2;
                break;
            case NoteYPosition.BottomWithStem:
                pos -=
                    (this.renderer.smuflMetrics.stemDown.has(n.symbol)
                        ? this.renderer.smuflMetrics.stemDown.get(n.symbol)!.topY
                        : -this.renderer.smuflMetrics.glyphHeights.get(n.symbol)! / 2) * scale;

                // stem size according to duration
                pos += sr.smuflMetrics.getStemLength(this.beat.duration, sr.hasFlag(this.beat)) * scale;
                pos += this._stemLengthExtension;

                let bottomCenterY = sr.centerStaffStemY(this.direction);
                bottomCenterY += this._stemLengthExtension;

                return Math.max(bottomCenterY, pos);

            case NoteYPosition.StemUp:
                pos -=
                    (sr.smuflMetrics.stemUp.has(n.symbol) ? sr.smuflMetrics.stemUp.get(n.symbol)!.bottomY : 0) * scale;
                break;
            case NoteYPosition.StemDown:
                pos -=
                    (sr.smuflMetrics.stemDown.has(n.symbol)
                        ? sr.smuflMetrics.stemDown.get(n.symbol)!.topY
                        : -sr.smuflMetrics.glyphHeights.get(n.symbol)! / 2) * scale;
                break;
        }

        return pos;
    }

    public addMainNoteGlyph(noteGlyph: NoteHeadGlyphBase, note: Note, noteLine: number): void {
        super.add(noteGlyph, noteLine);
        this._noteGlyphLookup.set(note.id, noteGlyph);
        this._notes.push(note);
    }

    public addEffectNoteGlyph(noteGlyph: NoteHeadGlyphBase, noteLine: number): void {
        super.add(noteGlyph, noteLine);
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
                belowBeatEffectsY =
                    this._internalGetNoteY(this.maxStepsNote!.glyph, NoteYPosition.Bottom) + effectSpacing;
                aboveBeatEffectsY =
                    this._internalGetNoteY(this.minStepsNote!.glyph, NoteYPosition.TopWithStem) - effectSpacing;
            } else {
                belowBeatEffectsY =
                    this._internalGetNoteY(this.maxStepsNote!.glyph, NoteYPosition.BottomWithStem) + effectSpacing;
                aboveBeatEffectsY = this._internalGetNoteY(this.minStepsNote!.glyph, NoteYPosition.Top) - effectSpacing;
            }
        }

        let minEffectY: number | null = null;
        let maxEffectY: number | null = null;

        for (const effect of this.aboveBeatEffects.values()) {
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

        for (const effect of this.belowBeatEffects.values()) {
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

        if (minEffectY !== null) {
            scoreRenderer.registerBeatEffectOverflows(minEffectY, maxEffectY ?? 0);
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

    public buildBoundingsLookup(beatBounds: BeatBounds, cx: number, cy: number) {
        for (const note of this._notes) {
            if (this._noteGlyphLookup.has(note.id)) {
                const glyph: EffectGlyph = this._noteGlyphLookup.get(note.id)!;
                const noteBounds: NoteBounds = new NoteBounds();
                noteBounds.note = note;
                noteBounds.noteHeadBounds = new Bounds();
                noteBounds.noteHeadBounds.x = cx + this.x + glyph.x;
                noteBounds.noteHeadBounds.y = cy + this.y + glyph.y - glyph.height / 2;
                noteBounds.noteHeadBounds.w = glyph.width;
                noteBounds.noteHeadBounds.h = glyph.height;
                beatBounds.addNote(noteBounds);
            }
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        this._paintEffects(cx, cy, canvas);

        super.paint(cx, cy, canvas);
    }

    private _paintEffects(cx: number, cy: number, canvas: ICanvas) {
        using _ = ElementStyleHelper.beat(canvas, BeatSubElement.StandardNotationEffects, this.beat);
        for (const g of this.aboveBeatEffects.values()) {
            g.paint(cx + this.x + this.width / 2, cy + this.y, canvas);
        }
        for (const g of this.belowBeatEffects.values()) {
            g.paint(cx + this.x + this.width / 2, cy + this.y, canvas);
        }
        if (this._tremoloPicking) {
            this._tremoloPicking.paint(cx, cy, canvas);
        }
        if (this._deadSlapped) {
            this._deadSlapped.paint(cx, cy, canvas);
        }
    }
}
