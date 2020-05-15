import { Beat } from '@src/model/Beat';
import { Note } from '@src/model/Note';
import { ICanvas, TextBaseline } from '@src/platform/ICanvas';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { NoteNumberGlyph } from '@src/rendering/glyphs/NoteNumberGlyph';
import { BeamingHelper } from '@src/rendering/utils/BeamingHelper';
import { RenderingResources } from '@src/RenderingResources';

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

    public getNoteX(note: Note, onEnd: boolean = true): number {
        if (this.notesPerString.has(note.string)) {
            let n: NoteNumberGlyph = this.notesPerString.get(note.string)!;
            let pos: number = this.x + n.x;
            if (onEnd) {
                pos += n.width;
            }
            return pos;
        }
        return 0;
    }

    public getNoteY(note: Note, aboveNote: boolean = false): number {
        if (this.notesPerString.has(note.string)) {
            return (
                this.y +
                this.notesPerString.get(note.string)!.y +
                (aboveNote ? (-this.notesPerString.get(note.string)!.height / 2 - 3 * this.scale) : 0)
            );
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
        let effectY: number = this.getNoteY(this.minStringNote!, false) + tabHeight / 2;
        // TODO: take care of actual glyph height
        let effectSpacing: number = 7 * this.scale;
        this.beatEffects.forEach(g => {
            g.y += effectY;
            g.x += this.width / 2;
            g.renderer = this.renderer;
            effectY += effectSpacing;
            g.doLayout();
        });
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
        this.beatEffects.forEach(g => {
            g.paint(cx, cy, canvas);
        });
    }

    public updateBeamingHelper(cx: number): void {
        if (this.beamingHelper && this.beamingHelper.isPositionFrom('tab', this.beat)) {
            this.beamingHelper.registerBeatLineX('tab', this.beat, cx + this.x + this.width, cx + this.x);
        }
    }
}
