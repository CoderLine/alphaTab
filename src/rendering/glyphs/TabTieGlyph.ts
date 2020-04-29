import { Beat } from '@src/model/Beat';
import { Note } from '@src/model/Note';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { TieGlyph } from '@src/rendering/glyphs/TieGlyph';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';

export class TabTieGlyph extends TieGlyph {
    protected StartNote: Note;
    protected EndNote: Note;
    protected ForSlide: boolean;

    public constructor(startNote: Note, endNote: Note, forSlide: boolean, forEnd: boolean = false) {
        super(startNote.beat, endNote.beat, forEnd);
        this.StartNote = startNote;
        this.EndNote = endNote;
        this.ForSlide = forSlide;
    }

    private get offset(): number {
        return this.ForSlide ? 5 * this.scale : 0;
    }

    protected getBeamDirection(beat: Beat, noteRenderer: BarRendererBase): BeamDirection {
        return TabTieGlyph.getBeamDirection_Note(this.StartNote);
    }

    protected static getBeamDirection_Note(note: Note): BeamDirection {
        return note.string > 3 ? BeamDirection.Up : BeamDirection.Down;
    }

    protected getStartY(noteRenderer: BarRendererBase, direction: BeamDirection): number {
        return noteRenderer.getNoteY(this.StartNote, false) - this.offset;
    }

    protected getEndY(noteRenderer: BarRendererBase, direction: BeamDirection): number {
        return noteRenderer.getNoteY(this.EndNote, false) - this.offset;
    }

    protected getStartX(noteRenderer: BarRendererBase): number {
        return noteRenderer.getNoteX(this.StartNote, true);
    }

    protected getEndX(noteRenderer: BarRendererBase): number {
        return noteRenderer.getNoteX(this.EndNote, false);
    }
}
