import type { Beat } from '@src/model/Beat';
import type { Note } from '@src/model/Note';
import { type BarRendererBase, NoteYPosition, NoteXPosition } from '@src/rendering/BarRendererBase';
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

    private get isLeftHandTap() {
        return this.startNote === this.endNote;
    }

    protected override getTieHeight(startX: number, startY: number, endX: number, endY: number): number {
        if (this.isLeftHandTap) {
            return this.startNoteRenderer!.smuflMetrics.tieHeight;
        }
        return super.getTieHeight(startX, startY, endX, endY);
    }

    protected override getBeamDirection(_beat: Beat, _noteRenderer: BarRendererBase): BeamDirection {
        if (this.isLeftHandTap) {
            return BeamDirection.Up;
        }
        return TabTieGlyph.getBeamDirectionForNote(this.startNote);
    }

    protected static getBeamDirectionForNote(note: Note): BeamDirection {
        return note.string > 3 ? BeamDirection.Up : BeamDirection.Down;
    }

    protected override getStartY(): number {
        if (this.isLeftHandTap) {
            return this.startNoteRenderer!.getNoteY(this.startNote, NoteYPosition.Center);
        }

        if (this.tieDirection === BeamDirection.Up) {
            return this.startNoteRenderer!.getNoteY(this.startNote, NoteYPosition.Top);
        }
        return this.startNoteRenderer!.getNoteY(this.startNote, NoteYPosition.Bottom);
    }

    protected override getEndY(): number {
        return this.getStartY();
    }

    protected override getStartX(): number {
        if (this.isLeftHandTap) {
            return this.getEndX() - this.renderer.smuflMetrics.leftHandTabTieWidth;
        }
        return this.startNoteRenderer!.getNoteX(this.startNote, NoteXPosition.Center);
    }

    protected override getEndX(): number {
        if (this.isLeftHandTap) {
            return this.endNoteRenderer!.getNoteX(this.endNote, NoteXPosition.Left);
        }
        return this.endNoteRenderer!.getNoteX(this.endNote, NoteXPosition.Center);
    }
}
