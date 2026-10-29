import { type Beat, BeatSubElement } from '@coderline/alphatab/model/Beat';
import type { Note } from '@coderline/alphatab/model/Note';
import { type ICanvas, TextBaseline } from '@coderline/alphatab/platform/ICanvas';
import type { IBoundsLookupWriter } from '@coderline/alphatab/rendering/utils/IBoundsLookupWriter';
import type { RenderingResources } from '@coderline/alphatab/RenderingResources';
import { NoteXPosition, NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { DeadSlappedBeatGlyph } from '@coderline/alphatab/rendering/glyphs/DeadSlappedBeatGlyph';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import type { NoteNumberGlyph } from '@coderline/alphatab/rendering/glyphs/NoteNumberGlyph';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

/**
 * @internal
 */
export class TabNoteChordGlyph extends Glyph {
    private _notes: NoteNumberGlyph[] = [];
    private _deadSlapped: DeadSlappedBeatGlyph | null = null;
    private _isGrace: boolean;

    public beat!: Beat;
    public maxStringNote: Note | null = null;
    public minStringNote: Note | null = null;
    private _beatEffects: Map<string, Glyph> | null = null;
    public noteStringWidth: number = 0;

    /**
     * The note glyphs in the order they were added.
     */
    public get noteGlyphs(): NoteNumberGlyph[] {
        return this._notes;
    }

    /**
     * The glyph shown on the given string: the last added one if several notes share the string.
     */
    public getNoteGlyphForString(str: number): NoteNumberGlyph | null {
        const notes = this._notes;
        for (let i = notes.length - 1; i >= 0; i--) {
            if (notes[i].note.string === str) {
                return notes[i];
            }
        }
        return null;
    }

    public get beatEffects(): Map<string, Glyph> {
        let effects = this._beatEffects;
        if (!effects) {
            effects = new Map<string, Glyph>();
            this._beatEffects = effects;
        }
        return effects;
    }

    public constructor(x: number, y: number, isGrace: boolean) {
        super(x, y);
        this._isGrace = isGrace;
    }

    public buildBoundingsLookup(writer: IBoundsLookupWriter, cx: number, cy: number) {
        for (const note of this._notes) {
            note.buildBoundingsLookup(writer, cx + this.x, cy + this.y);
        }
    }

    public getNoteX(note: Note, requestedPosition: NoteXPosition): number {
        const n = this.getNoteGlyphForString(note.string);
        if (n) {
            let pos = this.x + n.x;
            switch (requestedPosition) {
                case NoteXPosition.Left:
                    break;
                case NoteXPosition.Center:
                    pos += n.noteStringWidth / 2;
                    break;
                case NoteXPosition.Right:
                    // fret numbers are painted centered in the column of the chord
                    pos += this.width;
                    break;
            }
            return pos;
        }
        return 0;
    }

    public getLowestNoteY(requestedPosition: NoteYPosition): number {
        return this.maxStringNote ? this.getNoteY(this.maxStringNote, requestedPosition) : 0;
    }

    public getHighestNoteY(requestedPosition: NoteYPosition): number {
        return this.minStringNote ? this.getNoteY(this.minStringNote, requestedPosition) : 0;
    }

    public getNoteY(note: Note, requestedPosition: NoteYPosition): number {
        const n = this.getNoteGlyphForString(note.string);
        if (n) {
            let pos = this.y + n.y;

            switch (requestedPosition) {
                case NoteYPosition.Top:
                    pos -= n.height / 2;
                    break;
                case NoteYPosition.StemUp:
                    pos = this.y + n.getBoundingBoxTop();
                    break;
                case NoteYPosition.Center:
                    break;
                case NoteYPosition.Bottom:
                    pos += n.height / 2;
                    break;
                case NoteYPosition.StemDown:
                    pos = this.y + n.getBoundingBoxBottom();
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
                if (g.width > w) {
                    w = g.width;
                }
                if (g.noteStringWidth > noteStringWidth) {
                    noteStringWidth = g.noteStringWidth;
                }
            }
            this.noteStringWidth = noteStringWidth;
            const tabHeight: number = this.renderer.resources.tablatureFont.size;

            let minEffectY = Number.NaN;
            let maxEffectY = Number.NaN;

            let effectY: number = this.getNoteY(this.minStringNote!, NoteYPosition.Center) + tabHeight / 2;
            const effectSpacing: number = this.renderer.smuflMetrics.onNoteEffectPadding;
            const beatEffects = this._beatEffects;
            if (beatEffects) {
                for (const g of beatEffects.values()) {
                    g.y += effectY;
                    g.x += this.width / 2;
                    g.renderer = this.renderer;

                    g.doLayout();
                    effectY += g.height + effectSpacing;

                    if (Number.isNaN(minEffectY) || minEffectY > effectY) {
                        minEffectY = effectY;
                    }
                    if (Number.isNaN(maxEffectY) || maxEffectY < effectY) {
                        maxEffectY = effectY;
                    }
                }
            }

            if (!Number.isNaN(minEffectY)) {
                this.renderer.registerBeatEffectOverflowsForBeat(this.beat, minEffectY, maxEffectY);
            }
        }

        this.width = w;
    }

    /**
     * Adds a note number that is already laid out.
     */
    public addNoteGlyph(noteGlyph: NoteNumberGlyph, note: Note): void {
        if (this._notes.length === 0) {
            this._notes = [noteGlyph];
        } else {
            this._notes.push(noteGlyph);
        }
        if (!this.minStringNote || note.string < this.minStringNote.string) {
            this.minStringNote = note;
        }
        if (!this.maxStringNote || note.string > this.maxStringNote.string) {
            this.maxStringNote = note;
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
            for (let i = 0, j = notes.length; i < j; i++) {
                const g = notes[i];
                g.renderer = this.renderer;
                g.paintCentered(cx, cy, canvas, w);
            }
            canvas.textBaseline = oldBaseLine;

            const beatEffects = this._beatEffects;
            if (beatEffects) {
                const previousColor = ElementStyleHelper.applyBeat(canvas, BeatSubElement.GuitarTabEffects, this.beat);
                try {
                    for (const g of beatEffects.values()) {
                        g.paint(cx, cy, canvas);
                    }
                } finally {
                    ElementStyleHelper.restore(canvas, previousColor);
                }
            }
        }
    }
}
