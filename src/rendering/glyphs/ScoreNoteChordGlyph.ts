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
import { NoteXPosition, NoteYPosition } from '../BarRendererBase';
import { BeatBounds } from '../utils/BeatBounds';

export class ScoreNoteChordGlyph extends ScoreNoteChordGlyphBase {
    private _noteGlyphLookup: Map<number, EffectGlyph> = new Map();
    private _notes: Note[] = [];
    private _tremoloPicking: Glyph | null = null;

    public aboveBeatEffects: Map<string, EffectGlyph> = new Map();
    public belowBeatEffects: Map<string, EffectGlyph> = new Map();
    public beat!: Beat;
    public beamingHelper!: BeamingHelper;

    public constructor() {
        super();
    }

    public get direction(): BeamDirection {
        return this.beamingHelper.direction;
    }

    public getNoteX(note: Note, requestedPosition: NoteXPosition): number {
        if (this._noteGlyphLookup.has(note.id)) {
            let n = this._noteGlyphLookup.get(note.id)!;

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

    public doLayout(): void {
        super.doLayout();
        let direction: BeamDirection = this.direction;
        for (const effect of this.aboveBeatEffects.values()) {
            effect.renderer = this.renderer;
            effect.doLayout();
        }
        for (const effect of this.belowBeatEffects.values()) {
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


    public buildBoundingsLookup(beatBounds: BeatBounds, cx: number, cy: number) {
        for (let note of this._notes) {
            if (this._noteGlyphLookup.has(note.id)) {
                let glyph: EffectGlyph = this._noteGlyphLookup.get(note.id)!;
                let noteBounds: NoteBounds = new NoteBounds();
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

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        // TODO: this method seems to be quite heavy according to the profiler, why?
        let scoreRenderer: ScoreBarRenderer = this.renderer as ScoreBarRenderer;
        //
        // Note Effects only painted once
        //
        let aboveBeatEffectsY = 0;
        let belowBeatEffectsY = 0;
        let belowEffectSpacing = 1;
        let aboveEffectSpacing = -belowEffectSpacing;

        if (this.beamingHelper.direction === BeamDirection.Up) {
            belowBeatEffectsY = scoreRenderer.getScoreY(this.minNote!.line);
            aboveBeatEffectsY = scoreRenderer.getScoreY(this.maxNote!.line - 2);
        } else {
            belowBeatEffectsY = scoreRenderer.getScoreY(this.maxNote!.line - 1);
            aboveBeatEffectsY = scoreRenderer.getScoreY(this.minNote!.line + 1);
            aboveEffectSpacing *= -1;
            belowEffectSpacing *= -1;
        }

        for (const g of this.aboveBeatEffects.values()) {
            aboveBeatEffectsY += aboveEffectSpacing * g.height;
            g.paint(cx + this.x + 2 * this.scale, cy + this.y + aboveBeatEffectsY, canvas);
        }

        for (const g of this.belowBeatEffects.values()) {
            belowBeatEffectsY += belowEffectSpacing * g.height;
            g.paint(cx + this.x + 2 * this.scale, cy + this.y + belowBeatEffectsY, canvas);
        }
        super.paint(cx, cy, canvas);
        if (this._tremoloPicking) {
            this._tremoloPicking.paint(cx, cy, canvas);
        }
    }
}
