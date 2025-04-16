import { type Beat, BeatSubElement } from '@src/model/Beat';
import { Duration } from '@src/model/Duration';
import type { Note } from '@src/model/Note';
import type { ICanvas } from '@src/platform/ICanvas';
import type { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import type { Glyph } from '@src/rendering/glyphs/Glyph';
import { ScoreNoteChordGlyphBase } from '@src/rendering/glyphs/ScoreNoteChordGlyphBase';
import type { ScoreNoteGlyphInfo } from '@src/rendering/glyphs/ScoreNoteGlyphInfo';
import { TremoloPickingGlyph } from '@src/rendering/glyphs/TremoloPickingGlyph';
import type { ScoreBarRenderer } from '@src/rendering/ScoreBarRenderer';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import type { BeamingHelper } from '@src/rendering/utils/BeamingHelper';
import { Bounds } from '@src/rendering/utils/Bounds';
import { NoteBounds } from '@src/rendering/utils/NoteBounds';
import { NoteXPosition, NoteYPosition } from '@src/rendering/BarRendererBase';
import type { BeatBounds } from '@src/rendering/utils/BeatBounds';
import { DeadSlappedBeatGlyph } from '@src/rendering/glyphs/DeadSlappedBeatGlyph';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';

export class ScoreNoteChordGlyph extends ScoreNoteChordGlyphBase {
    private _noteGlyphLookup: Map<number, EffectGlyph> = new Map();
    private _notes: Note[] = [];
    private _deadSlapped: DeadSlappedBeatGlyph | null = null;
    private _tremoloPicking: Glyph | null = null;

    public aboveBeatEffects: Map<string, EffectGlyph> = new Map();
    public belowBeatEffects: Map<string, EffectGlyph> = new Map();
    public beat!: Beat;
    public beamingHelper!: BeamingHelper;

    public get direction(): BeamDirection {
        return this.beamingHelper.direction;
    }

    public getNoteX(note: Note, requestedPosition: NoteXPosition): number {
        if (this._noteGlyphLookup.has(note.id)) {
            const n = this._noteGlyphLookup.get(note.id)!;

            let pos = this.x + n.x + this._noteHeadPadding;
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
            let pos = this.y + n.y;

            switch (requestedPosition) {
                case NoteYPosition.TopWithStem:
                    pos -= (this.renderer as ScoreBarRenderer).getStemSize(this.beamingHelper);
                    break;
                case NoteYPosition.Top:
                    pos -= n.height / 2;
                    break;
                case NoteYPosition.Center:
                    break;
                case NoteYPosition.Bottom:
                    pos += n.height / 2;
                    break;
                case NoteYPosition.BottomWithStem:
                    pos += (this.renderer as ScoreBarRenderer).getStemSize(this.beamingHelper);
                    break;
            }

            return pos;
        }
        return 0;
    }

    public addNoteGlyph(noteGlyph: EffectGlyph, note: Note, noteLine: number): void {
        super.add(noteGlyph, noteLine);
        this._noteGlyphLookup.set(note.id, noteGlyph);
        this._notes.push(note);
    }

    public updateBeamingHelper(cx: number): void {
        if (this.beamingHelper) {
            this.beamingHelper.registerBeatLineX(
                'score',
                this.beat,
                cx + this.x + this.upLineX,
                cx + this.x + this.downLineX
            );
        }
    }

    public override doLayout(): void {
        super.doLayout();
        const scoreRenderer: ScoreBarRenderer = this.renderer as ScoreBarRenderer;

        if (this.beat.deadSlapped) {
            this._deadSlapped = new DeadSlappedBeatGlyph();
            this._deadSlapped.renderer = this.renderer;
            this._deadSlapped.doLayout();
            this.width = this._deadSlapped.width;
        }

        const direction: BeamDirection = this.direction;
        let aboveBeatEffectsY = 0;
        let belowBeatEffectsY = 0;
        let belowEffectSpacing = 1;
        let aboveEffectSpacing = -belowEffectSpacing;

        let belowEffectSpacingShiftBefore = false;
        let aboveEffectSpacingShiftBefore = false;

        if (this.beat.deadSlapped) {
            belowBeatEffectsY = scoreRenderer.getScoreY(0);
            aboveBeatEffectsY = scoreRenderer.getScoreY(scoreRenderer.heightLineCount);
        } else {
            if (this.direction === BeamDirection.Up) {
                belowEffectSpacingShiftBefore = false;
                aboveEffectSpacingShiftBefore = true;
                belowBeatEffectsY = scoreRenderer.getScoreY(this.maxNote!.steps + 2);
                aboveBeatEffectsY =
                    scoreRenderer.getScoreY(this.minNote!.steps) - scoreRenderer.getStemSize(this.beamingHelper, true);
            } else {
                belowEffectSpacingShiftBefore = true;
                aboveEffectSpacingShiftBefore = false;
                belowBeatEffectsY = scoreRenderer.getScoreY(this.minNote!.steps - 1);
                belowEffectSpacing *= -1;
                aboveEffectSpacing *= -1;
                aboveBeatEffectsY =
                    scoreRenderer.getScoreY(this.maxNote!.steps) + scoreRenderer.getStemSize(this.beamingHelper, true);
            }
        }

        let minEffectY: number | null = null;
        let maxEffectY: number | null = null;

        for (const effect of this.aboveBeatEffects.values()) {
            effect.renderer = this.renderer;
            effect.doLayout();

            if (aboveEffectSpacingShiftBefore) {
                aboveBeatEffectsY += aboveEffectSpacing * effect.height;
            }

            effect.y = aboveBeatEffectsY;
            if (minEffectY === null || minEffectY > aboveBeatEffectsY) {
                minEffectY = aboveBeatEffectsY;
            }
            if (maxEffectY === null || maxEffectY < aboveBeatEffectsY) {
                maxEffectY = aboveBeatEffectsY;
            }

            if (!aboveEffectSpacingShiftBefore) {
                aboveBeatEffectsY += aboveEffectSpacing * effect.height;
            }
        }

        for (const effect of this.belowBeatEffects.values()) {
            effect.renderer = this.renderer;
            effect.doLayout();

            if (belowEffectSpacingShiftBefore) {
                belowBeatEffectsY += belowEffectSpacing * effect.height;
            }

            effect.y = belowBeatEffectsY;

            if (minEffectY === null || minEffectY > belowBeatEffectsY) {
                minEffectY = belowBeatEffectsY;
            }
            if (maxEffectY === null || maxEffectY < belowBeatEffectsY) {
                maxEffectY = belowBeatEffectsY;
            }

            if (!belowEffectSpacingShiftBefore) {
                belowBeatEffectsY += belowEffectSpacing * effect.height;
            }
        }

        if (minEffectY !== null) {
            scoreRenderer.registerBeatEffectOverflows(minEffectY, maxEffectY ?? 0);
        }

        if (this.beat.isTremolo && !this.beat.deadSlapped) {
            let offset: number = 0;
            const baseNote: ScoreNoteGlyphInfo = direction === BeamDirection.Up ? this.minNote! : this.maxNote!;
            let tremoloX: number = direction === BeamDirection.Up ? this.upLineX : this.downLineX;
            const speed: Duration = this.beat.tremoloSpeed!;
            switch (speed) {
                case Duration.ThirtySecond:
                    offset = direction === BeamDirection.Up ? -15 : 15;
                    break;
                case Duration.Sixteenth:
                    offset = direction === BeamDirection.Up ? -12 : 15;
                    break;
                case Duration.Eighth:
                    offset = direction === BeamDirection.Up ? -10 : 10;
                    break;
                default:
                    offset = direction === BeamDirection.Up ? -10 : 15;
                    break;
            }

            if (this.beat.duration < Duration.Half) {
                tremoloX = this.width / 2;
            }

            this._tremoloPicking = new TremoloPickingGlyph(tremoloX, baseNote.glyph.y + offset, speed);
            this._tremoloPicking.renderer = this.renderer;
            this._tremoloPicking.doLayout();
        }
    }

    public buildBoundingsLookup(beatBounds: BeatBounds, cx: number, cy: number) {
        for (const note of this._notes) {
            if (this._noteGlyphLookup.has(note.id)) {
                const glyph: EffectGlyph = this._noteGlyphLookup.get(note.id)!;
                const noteBounds: NoteBounds = new NoteBounds();
                noteBounds.note = note;
                noteBounds.noteHeadBounds = new Bounds();
                noteBounds.noteHeadBounds.x = cx + this.x + this._noteHeadPadding + glyph.x;
                noteBounds.noteHeadBounds.y = cy + this.y + glyph.y - glyph.height / 2;
                noteBounds.noteHeadBounds.w = glyph.width;
                noteBounds.noteHeadBounds.h = glyph.height;
                beatBounds.addNote(noteBounds);
            }
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        this.paintEffects(cx, cy, canvas);

        super.paint(cx, cy, canvas);
    }

    private paintEffects(cx: number, cy: number, canvas: ICanvas) {
        using _ = ElementStyleHelper.beat(canvas, BeatSubElement.StandardNotationEffects, this.beat);
        for (const g of this.aboveBeatEffects.values()) {
            g.paint(cx + this.x + 2, cy + this.y, canvas);
        }
        for (const g of this.belowBeatEffects.values()) {
            g.paint(cx + this.x + 2, cy + this.y, canvas);
        }
        if (this._tremoloPicking) {
            this._tremoloPicking.paint(cx, cy, canvas);
        }
        if (this._deadSlapped) {
            this._deadSlapped.paint(cx, cy, canvas);
        }
    }
}
