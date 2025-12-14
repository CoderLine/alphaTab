import { EngravingSettings } from '@coderline/alphatab/EngravingSettings';
import { AccidentalType } from '@coderline/alphatab/model/AccidentalType';
import type { Beat } from '@coderline/alphatab/model/Beat';
import type { Color } from '@coderline/alphatab/model/Color';
import { Duration } from '@coderline/alphatab/model/Duration';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { AccidentalGlyph } from '@coderline/alphatab/rendering/glyphs/AccidentalGlyph';
import { AccidentalGroupGlyph } from '@coderline/alphatab/rendering/glyphs/AccidentalGroupGlyph';
import { GhostNoteContainerGlyph } from '@coderline/alphatab/rendering/glyphs/GhostNoteContainerGlyph';
import type { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import { NoteHeadGlyph } from '@coderline/alphatab/rendering/glyphs/NoteHeadGlyph';
import {
    ScoreChordNoteHeadInfo,
    ScoreNoteChordGlyphBase
} from '@coderline/alphatab/rendering/glyphs/ScoreNoteChordGlyphBase';
import type { ScoreBarRenderer } from '@coderline/alphatab/rendering/ScoreBarRenderer';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';

/**
 * @internal
 */
export class BendNoteHeadGroupGlyph extends ScoreNoteChordGlyphBase {
    private _beat: Beat;
    private _showParenthesis: boolean = false;
    private _noteValueLookup: Map<number, Glyph> = new Map();
    private _accidentals: AccidentalGroupGlyph = new AccidentalGroupGlyph();
    private _preNoteParenthesis: GhostNoteContainerGlyph | null = null;
    private _postNoteParenthesis: GhostNoteContainerGlyph | null = null;
    public isEmpty: boolean = true;
    private _groupId: string;

    public override get scale(): number {
        return EngravingSettings.GraceScale;
    }

    public get direction(): BeamDirection {
        return BeamDirection.Up;
    }

    public constructor(groupId: string, beat: Beat, showParenthesis: boolean = false) {
        super();
        this._beat = beat;
        this._groupId = groupId;
        this._showParenthesis = showParenthesis;
        if (showParenthesis) {
            this._preNoteParenthesis = new GhostNoteContainerGlyph(true);
            this._postNoteParenthesis = new GhostNoteContainerGlyph(false);
        }
    }

    protected override getScoreChordNoteHeadInfo(): ScoreChordNoteHeadInfo {
        // TODO: do we need to share this spacing across all staves&tracks?
        const staff = this._beat.voice.bar.staff;
        const key = `score.noteheads.${this._groupId}.${staff.track.index}.${staff.index}.${this._beat.absoluteDisplayStart}`;
        let existing = this.renderer.staff!.getSharedLayoutData<ScoreChordNoteHeadInfo | undefined>(key, undefined);
        if (!existing) {
            existing = new ScoreChordNoteHeadInfo(this.direction);
            this.renderer.staff!.setSharedLayoutData(key, existing);
        }
        return new ScoreChordNoteHeadInfo(this.direction);
    }

    public containsNoteValue(noteValue: number): boolean {
        return this._noteValueLookup.has(noteValue);
    }

    public getNoteValueY(noteValue: number): number {
        if (this._noteValueLookup.has(noteValue)) {
            return this.y + this._noteValueLookup.get(noteValue)!.y;
        }
        return 0;
    }

    public addGlyph(noteValue: number, quarterBend: boolean, _color: Color | undefined): void {
        const sr: ScoreBarRenderer = this.renderer as ScoreBarRenderer;
        const noteHeadGlyph: NoteHeadGlyph = new NoteHeadGlyph(0, 0, Duration.Quarter, true);
        const accidental: AccidentalType = sr.accidentalHelper.applyAccidentalForValue(
            this._beat,
            noteValue,
            quarterBend,
            true
        );
        const steps: number = sr.accidentalHelper.getNoteStepsForValue(noteValue, false);
        noteHeadGlyph.y = sr.getScoreY(steps);
        if (this._showParenthesis) {
            this._preNoteParenthesis!.renderer = this.renderer;
            this._postNoteParenthesis!.renderer = this.renderer;
            this._preNoteParenthesis!.addParenthesisOnSteps(steps, true);
            this._postNoteParenthesis!.addParenthesisOnSteps(steps, true);
        }
        if (accidental !== AccidentalType.None) {
            const g = new AccidentalGlyph(0, noteHeadGlyph.y, accidental, EngravingSettings.GraceScale);
            g.renderer = this.renderer;
            this._accidentals.renderer = this.renderer;
            this._accidentals.addGlyph(g);
        }
        this._noteValueLookup.set(noteValue, noteHeadGlyph);
        this.add(noteHeadGlyph, steps);
        this.isEmpty = false;
    }

    public override doLayout(): void {
        let x: number = 0;
        if (this._showParenthesis) {
            this._preNoteParenthesis!.x = x;
            this._preNoteParenthesis!.renderer = this.renderer;
            this._preNoteParenthesis!.doLayout();
            x += this._preNoteParenthesis!.width + this.renderer.smuflMetrics.bendNoteHeadElementPadding;
        }
        if (!this._accidentals.isEmpty) {
            x += this._accidentals.width + this.renderer.smuflMetrics.bendNoteHeadElementPadding;
            this._accidentals.x = x;
            this._accidentals.renderer = this.renderer;
            this._accidentals.doLayout();
            x += this._accidentals.width + this.renderer.smuflMetrics.bendNoteHeadElementPadding;
        }
        this.noteStartX = x;
        super.doLayout();
        if (this._showParenthesis) {
            this._postNoteParenthesis!.x = this.width + this.renderer.smuflMetrics.bendNoteHeadElementPadding;
            this._postNoteParenthesis!.renderer = this.renderer;
            this._postNoteParenthesis!.doLayout();
            this.width += this._postNoteParenthesis!.width + this.renderer.smuflMetrics.bendNoteHeadElementPadding;
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        if (!this._accidentals.isEmpty) {
            this._accidentals.paint(cx + this.x, cy + this.y, canvas);
        }
        if (this._showParenthesis) {
            this._preNoteParenthesis!.paint(cx + this.x, cy + this.y, canvas);
            this._postNoteParenthesis!.paint(cx + this.x, cy + this.y, canvas);
        }
        super.paint(cx, cy, canvas);
    }
}
