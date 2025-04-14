import type { Color } from '@src/model';
import { AccidentalType } from '@src/model/AccidentalType';
import type { Beat } from '@src/model/Beat';
import { Duration } from '@src/model/Duration';
import type { ICanvas } from '@src/platform/ICanvas';
import { AccidentalGlyph } from '@src/rendering/glyphs/AccidentalGlyph';
import { AccidentalGroupGlyph } from '@src/rendering/glyphs/AccidentalGroupGlyph';
import { GhostNoteContainerGlyph } from '@src/rendering/glyphs/GhostNoteContainerGlyph';
import type { Glyph } from '@src/rendering/glyphs/Glyph';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';
import { ScoreNoteChordGlyphBase } from '@src/rendering/glyphs/ScoreNoteChordGlyphBase';
import type { ScoreBarRenderer } from '@src/rendering/ScoreBarRenderer';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';

export class BendNoteHeadGroupGlyph extends ScoreNoteChordGlyphBase {
    private static readonly ElementPadding: number = 2;

    private _beat: Beat;
    private _showParenthesis: boolean = false;
    private _noteValueLookup: Map<number, Glyph> = new Map();
    private _accidentals: AccidentalGroupGlyph = new AccidentalGroupGlyph();
    private _preNoteParenthesis: GhostNoteContainerGlyph | null = null;
    private _postNoteParenthesis: GhostNoteContainerGlyph | null = null;
    public isEmpty: boolean = true;

    public get direction(): BeamDirection {
        return BeamDirection.Up;
    }

    public noteHeadOffset: number = 0;

    public constructor(beat: Beat, showParenthesis: boolean = false) {
        super();
        this._beat = beat;
        this._showParenthesis = showParenthesis;
        if (showParenthesis) {
            this._preNoteParenthesis = new GhostNoteContainerGlyph(true);
            this._postNoteParenthesis = new GhostNoteContainerGlyph(false);
        }
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

    public addGlyph(noteValue: number, quarterBend: boolean, color: Color | undefined): void {
        const sr: ScoreBarRenderer = this.renderer as ScoreBarRenderer;
        const noteHeadGlyph: NoteHeadGlyph = new NoteHeadGlyph(0, 0, Duration.Quarter, true);
        const accidental: AccidentalType = sr.accidentalHelper.applyAccidentalForValue(
            this._beat,
            noteValue,
            quarterBend,
            true
        );
        const line: number = sr.accidentalHelper.getNoteLineForValue(noteValue, false);
        noteHeadGlyph.y = sr.getScoreY(line);
        if (this._showParenthesis) {
            this._preNoteParenthesis!.renderer = this.renderer;
            this._postNoteParenthesis!.renderer = this.renderer;
            this._preNoteParenthesis!.addParenthesisOnLine(line, true);
            this._postNoteParenthesis!.addParenthesisOnLine(line, true);
        }
        if (accidental !== AccidentalType.None) {
            const g = new AccidentalGlyph(0, noteHeadGlyph.y, accidental, NoteHeadGlyph.GraceScale);
            g.renderer = this.renderer;
            this._accidentals.renderer = this.renderer;
            this._accidentals.addGlyph(g);
        }
        this._noteValueLookup.set(noteValue, noteHeadGlyph);
        this.add(noteHeadGlyph, line);
        this.isEmpty = false;
    }

    public override doLayout(): void {
        let x: number = 0;
        if (this._showParenthesis) {
            this._preNoteParenthesis!.x = x;
            this._preNoteParenthesis!.renderer = this.renderer;
            this._preNoteParenthesis!.doLayout();
            x += this._preNoteParenthesis!.width + BendNoteHeadGroupGlyph.ElementPadding;
        }
        if (!this._accidentals.isEmpty) {
            x += this._accidentals.width + BendNoteHeadGroupGlyph.ElementPadding;
            this._accidentals.x = x;
            this._accidentals.renderer = this.renderer;
            this._accidentals.doLayout();
            x += this._accidentals.width + BendNoteHeadGroupGlyph.ElementPadding;
        }
        this.noteStartX = x;
        super.doLayout();
        this.noteHeadOffset = this.noteStartX + (this.width - this.noteStartX) / 2;
        if (this._showParenthesis) {
            this._postNoteParenthesis!.x = this.width + BendNoteHeadGroupGlyph.ElementPadding;
            this._postNoteParenthesis!.renderer = this.renderer;
            this._postNoteParenthesis!.doLayout();
            this.width += this._postNoteParenthesis!.width + BendNoteHeadGroupGlyph.ElementPadding;
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        // canvas.Color = Color.Random();
        // canvas.FillRect(cx + X, cy + Y, Width, 10);
        // canvas.Color = Renderer.Resources.MainGlyphColor;
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
