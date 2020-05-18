import { Beat } from '@src/model/Beat';
import { Note } from '@src/model/Note';
import { BarRendererBase, NoteYPosition, NoteXPosition } from '@src/rendering/BarRendererBase';
import { TieGlyph } from '@src/rendering/glyphs/TieGlyph';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';

export class TabTieGlyph extends TieGlyph {
    protected startNote: Note;
    protected endNote: Note;

    public constructor(startNote: Note, endNote: Note, forEnd: boolean = false) {
        super(startNote.beat, endNote.beat, forEnd);
        this.startNote = startNote;
        this.endNote = endNote;
    }

    protected getBeamDirection(beat: Beat, noteRenderer: BarRendererBase): BeamDirection {
        return TabTieGlyph.getBeamDirectionForNote(this.startNote);
    }

    protected static getBeamDirectionForNote(note: Note): BeamDirection {
        return note.string > 3 ? BeamDirection.Up : BeamDirection.Down;
    }

    protected getStartY(): number {
        if(this.tieDirection === BeamDirection.Up) {
            return this.startNoteRenderer!.getNoteY(this.startNote, NoteYPosition.Top);
        }
        return this.startNoteRenderer!.getNoteY(this.startNote, NoteYPosition.Bottom);
    }

    protected getEndY(): number {
        return this.getStartY();
    }

    protected getStartX(): number {
        return this.startNoteRenderer!.getNoteX(this.startNote, NoteXPosition.Center);
    }

    protected getEndX(): number {
        return this.endNoteRenderer!.getNoteX(this.endNote, NoteXPosition.Center);
    }
}
