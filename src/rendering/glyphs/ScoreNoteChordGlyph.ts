import { Beat } from '@src/model/Beat';
import { Duration } from '@src/model/Duration';
import { Note } from '@src/model/Note';
import { ICanvas } from '@src/platform/ICanvas';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { ScoreNoteChordGlyphBase } from '@src/rendering/glyphs/ScoreNoteChordGlyphBase';
import { ScoreNoteGlyphInfo } from '@src/rendering/glyphs/ScoreNoteGlyphInfo';
import { TremoloPickingGlyph } from '@src/rendering/glyphs/TremoloPickingGlyph';
import { ScoreBarRenderer } from '@src/rendering/ScoreBarRenderer';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { BeamingHelper } from '@src/rendering/utils/BeamingHelper';
import { Bounds } from '@src/rendering/utils/Bounds';
import { NoteBounds } from '@src/rendering/utils/NoteBounds';
import { NoteHeadGlyph } from './NoteHeadGlyph';

export class ScoreNoteChordGlyph extends ScoreNoteChordGlyphBase {
    private _noteGlyphLookup: Map<number, EffectGlyph> = new Map();
    private _notes: Note[] = [];
    private _tremoloPicking: Glyph | null = null;

    public beatEffects: Map<string, Glyph> = new Map();
    public beat!: Beat;
    public beamingHelper!: BeamingHelper;

    public constructor() {
        super();
    }

    public get direction(): BeamDirection {
        return this.beamingHelper.direction;
    }

    public getNoteX(note: Note, onEnd: boolean = true): number {
        if (this._noteGlyphLookup.has(note.id)) {
            let n: EffectGlyph = this._noteGlyphLookup.get(note.id)!;
            let pos: number = this.x + n.x;
            if (onEnd) {
                pos += n.width;
            }
            return pos;
        }
        return 0;
    }

    public getNoteY(note: Note, aboveNote: boolean = false): number {
        if (this._noteGlyphLookup.has(note.id)) {
            return this.y + this._noteGlyphLookup.get(note.id)!.y + (aboveNote ? -(NoteHeadGlyph.NoteHeadHeight * this.scale) / 2 : 0);
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

    public doLayout(): void {
        super.doLayout();
        let direction: BeamDirection = this.direction;
        for (let kvp of this.beatEffects) {
            let effect: Glyph = kvp[1];
            effect.renderer = this.renderer;
            effect.doLayout();
        }
        if (this.beat.isTremolo) {
            let offset: number = 0;
            let baseNote: ScoreNoteGlyphInfo = direction === BeamDirection.Up ? this.minNote! : this.maxNote!;
            let tremoloX: number = direction === BeamDirection.Up ? this.displacedX : 0;
            let speed: Duration = this.beat.tremoloSpeed!;
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
            this._tremoloPicking = new TremoloPickingGlyph(tremoloX, baseNote.glyph.y + offset * this.scale, speed);
            this._tremoloPicking.renderer = this.renderer;
            this._tremoloPicking.doLayout();
        }
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        // TODO: this method seems to be quite heavy according to the profiler, why?
        let scoreRenderer: ScoreBarRenderer = this.renderer as ScoreBarRenderer;
        //
        // Note Effects only painted once
        //
        let effectY: number =
            this.beamingHelper.direction === BeamDirection.Up
                ? scoreRenderer.getScoreY(this.maxNote!.line, 1.5 * NoteHeadGlyph.NoteHeadHeight)
                : scoreRenderer.getScoreY(this.minNote!.line, -1.0 * NoteHeadGlyph.NoteHeadHeight);
        // TODO: take care of actual glyph height
        let effectSpacing: number =
            this.beamingHelper.direction === BeamDirection.Up ? 7 * this.scale : -7 * this.scale;
        for (let kvp of this.beatEffects) {
            let g: Glyph = kvp[1];
            g.y = effectY;
            g.x = this.width / 2;
            g.paint(cx + this.x, cy + this.y, canvas);
            effectY += effectSpacing;
        }
        if (this.renderer.settings.core.includeNoteBounds) {
            for (let note of this._notes) {
                if (this._noteGlyphLookup.has(note.id)) {
                    let glyph: EffectGlyph = this._noteGlyphLookup.get(note.id)!;
                    let noteBounds: NoteBounds = new NoteBounds();
                    noteBounds.note = note;
                    noteBounds.noteHeadBounds = (() => {
                        let _tmp = new Bounds();
                        _tmp.x = cx + this.x + glyph.x;
                        _tmp.y = cy + this.y + glyph.y;
                        _tmp.w = glyph.width;
                        _tmp.h = glyph.height;
                        return _tmp;
                    })();
                    this.renderer.scoreRenderer.boundsLookup!.addNote(noteBounds);
                }
            }
        }
        super.paint(cx, cy, canvas);
        if (this._tremoloPicking) {
            this._tremoloPicking.paint(cx, cy, canvas);
        }
    }
}
