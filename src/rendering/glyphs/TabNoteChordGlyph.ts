import { Beat } from '@src/model/Beat';
import { Note } from '@src/model/Note';
import { ICanvas, TextBaseline } from '@src/platform/ICanvas';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { NoteNumberGlyph } from '@src/rendering/glyphs/NoteNumberGlyph';
import { BeamingHelper } from '@src/rendering/utils/BeamingHelper';
import { RenderingResources } from '@src/RenderingResources';
import { NoteXPosition, NoteYPosition } from '../BarRendererBase';
import { BeatBounds } from '../utils/BeatBounds';

export class TabNoteChordGlyph extends Glyph {
    private _notes: NoteNumberGlyph[] = [];
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
            let n = this.notesPerString.get(note.string)!;

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
                    pos -= n.height / 2 + 2 * this.scale;
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

    public doLayout(): void {
        let w: number = 0;
        let noteStringWidth: number = 0;
        for (let i: number = 0, j: number = this._notes.length; i < j; i++) {
            let g: NoteNumberGlyph = this._notes[i];
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
        let tabHeight: number = this.renderer.resources.tablatureFont.size;
        let effectY: number = this.getNoteY(this.minStringNote!, NoteYPosition.Center) + tabHeight / 2;
        // TODO: take care of actual glyph height
        let effectSpacing: number = 7 * this.scale;
        for (const g of this.beatEffects.values()) {
            g.y += effectY;
            g.x += this.width / 2;
            g.renderer = this.renderer;
            effectY += effectSpacing;
            g.doLayout();
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

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        cx += this.x;
        cy += this.y;
        let res: RenderingResources = this.renderer.resources;
        let oldBaseLine: TextBaseline = canvas.textBaseline;
        canvas.textBaseline = TextBaseline.Middle;
        canvas.font = this._isGrace ? res.graceFont : res.tablatureFont;

        let notes: NoteNumberGlyph[] = this._notes;
        let w: number = this.width;
        for (let g of notes) {
            g.renderer = this.renderer;
            g.width = w;
            g.paint(cx, cy, canvas);
        }
        canvas.textBaseline = oldBaseLine;
        for(const g of this.beatEffects.values()) {
            g.paint(cx, cy, canvas);
        }
    }

    public updateBeamingHelper(cx: number): void {
        if (this.beamingHelper && this.beamingHelper.isPositionFrom('tab', this.beat)) {
            this.beamingHelper.registerBeatLineX('tab', this.beat,
                cx + this.x + this.width / 2,
                cx + this.x + this.width / 2
            );
        }
    }
}
