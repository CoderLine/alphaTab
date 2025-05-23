import { type Beat, BeatSubElement } from '@src/model/Beat';
import type { Note } from '@src/model/Note';
import { type ICanvas, TextBaseline } from '@src/platform/ICanvas';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import type { NoteNumberGlyph } from '@src/rendering/glyphs/NoteNumberGlyph';
import type { BeamingHelper } from '@src/rendering/utils/BeamingHelper';
import type { RenderingResources } from '@src/RenderingResources';
import { NoteXPosition, NoteYPosition } from '@src/rendering/BarRendererBase';
import type { BeatBounds } from '@src/rendering/utils/BeatBounds';
import { DeadSlappedBeatGlyph } from '@src/rendering/glyphs/DeadSlappedBeatGlyph';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';

export class TabNoteChordGlyph extends Glyph {
    private _notes: NoteNumberGlyph[] = [];
    private _deadSlapped: DeadSlappedBeatGlyph | null = null;
    private _isGrace: boolean;

    public beat!: Beat;
    public beamingHelper!: BeamingHelper;
    public minStringNote: Note | null = null;
    public beatEffects: Map<string, Glyph> = new Map();
    public notesPerString: Map<number, NoteNumberGlyph> = new Map();
    public noteStringWidth: number = 0;

    public constructor(x: number, y: number, isGrace: boolean) {
        super(x, y);
        this._isGrace = isGrace;
    }

    public buildBoundingsLookup(beatBounds: BeatBounds, cx: number, cy: number) {
        for (const note of this._notes) {
            note.buildBoundingsLookup(beatBounds, cx + this.x, cy + this.y);
        }
    }

    public getNoteX(note: Note, requestedPosition: NoteXPosition): number {
        if (this.notesPerString.has(note.string)) {
            const n = this.notesPerString.get(note.string)!;

            let pos = this.x + n.x;
            switch (requestedPosition) {
                case NoteXPosition.Left:
                    break;
                case NoteXPosition.Center:
                    pos += n.noteStringWidth / 2;
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
        if (this.notesPerString.has(note.string)) {
            const n = this.notesPerString.get(note.string)!;
            let pos = this.y + n.y;

            switch (requestedPosition) {
                case NoteYPosition.Top:
                case NoteYPosition.TopWithStem:
                    pos -= n.height / 2 + 2;
                    break;
                case NoteYPosition.Center:
                    break;
                case NoteYPosition.Bottom:
                case NoteYPosition.BottomWithStem:
                    pos += n.height / 2;
                    break;
            }

            return pos;
        }
        return 0;
    }

    public override doLayout(): void {
        let w: number = 0;

        if (this.beat.deadSlapped) {
            this._deadSlapped = new DeadSlappedBeatGlyph();
            this._deadSlapped.renderer = this.renderer;
            this._deadSlapped.doLayout();
            w = this._deadSlapped.width;
            this.noteStringWidth = w;
        } else {
            let noteStringWidth: number = 0;
            for (let i: number = 0, j: number = this._notes.length; i < j; i++) {
                const g: NoteNumberGlyph = this._notes[i];
                g.renderer = this.renderer;
                g.doLayout();
                if (g.width > w) {
                    w = g.width;
                }
                if (g.noteStringWidth > noteStringWidth) {
                    noteStringWidth = g.noteStringWidth;
                }
            }
            this.noteStringWidth = noteStringWidth;
            const tabHeight: number = this.renderer.resources.tablatureFont.size;
            let effectY: number = this.getNoteY(this.minStringNote!, NoteYPosition.Center) + tabHeight / 2;
            // TODO: take care of actual glyph height
            const effectSpacing: number = 7;
            for (const g of this.beatEffects.values()) {
                g.y += effectY;
                g.x += this.width / 2;
                g.renderer = this.renderer;
                effectY += effectSpacing;
                g.doLayout();
            }
        }

        this.width = w;
    }

    public addNoteGlyph(noteGlyph: NoteNumberGlyph, note: Note): void {
        this._notes.push(noteGlyph);
        this.notesPerString.set(note.string, noteGlyph);
        if (!this.minStringNote || note.string < this.minStringNote.string) {
            this.minStringNote = note;
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        cx += this.x;
        cy += this.y;

        if (this.beat.deadSlapped) {
            this._deadSlapped?.paint(cx, cy, canvas);
        } else {
            const res: RenderingResources = this.renderer.resources;
            const oldBaseLine: TextBaseline = canvas.textBaseline;
            canvas.textBaseline = TextBaseline.Middle;
            canvas.font = this._isGrace ? res.graceFont : res.tablatureFont;

            const notes: NoteNumberGlyph[] = this._notes;
            const w: number = this.width;
            for (const g of notes) {
                g.renderer = this.renderer;
                g.width = w;
                g.paint(cx, cy, canvas);
            }
            canvas.textBaseline = oldBaseLine;

            using _ = ElementStyleHelper.beat(canvas, BeatSubElement.GuitarTabEffects, this.beat);
            for (const g of this.beatEffects.values()) {
                g.paint(cx, cy, canvas);
            }
        }
    }

    public updateBeamingHelper(cx: number): void {
        if (this.beamingHelper && this.beamingHelper.isPositionFrom('tab', this.beat)) {
            this.beamingHelper.registerBeatLineX(
                'tab',
                this.beat,
                cx + this.x + this.width / 2,
                cx + this.x + this.width / 2
            );
        }
    }
}
