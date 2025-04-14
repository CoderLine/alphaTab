import type { Beat } from '@src/model/Beat';
import type { Note } from '@src/model/Note';
import { type BarRendererBase, NoteXPosition, NoteYPosition } from '@src/rendering/BarRendererBase';
import { TieGlyph } from '@src/rendering/glyphs/TieGlyph';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';

export class NumberedTieGlyph extends TieGlyph {
    protected startNote: Note;
    protected endNote: Note;

    public constructor(startNote: Note, endNote: Note, forEnd: boolean = false) {
        super(!startNote ? null : startNote.beat, !endNote ? null : endNote.beat, forEnd);
        this.startNote = startNote;
        this.endNote = endNote;
    }

    protected override shouldDrawBendSlur() {
        return (
            this.renderer.settings.notation.extendBendArrowsOnTiedNotes &&
            !!this.startNote.bendOrigin &&
            this.startNote.isTieOrigin
        );
    }

    public override doLayout(): void {
        super.doLayout();
    }

    protected override getBeamDirection(beat: Beat, noteRenderer: BarRendererBase): BeamDirection {
        return BeamDirection.Up;
    }

    protected override getStartY(): number {
        return this.startNoteRenderer!.getNoteY(this.startNote, NoteYPosition.Top);
    }

    protected override getEndY(): number {
        return this.getStartY();
    }

    protected override getStartX(): number {
        if (this.startNote === this.endNote) {
            return this.getEndX() - 20;
        }
        return this.startNoteRenderer!.getNoteX(this.startNote, NoteXPosition.Center);
    }

    protected override getEndX(): number {
        if (this.startNote === this.endNote) {
            return this.endNoteRenderer!.getNoteX(this.endNote, NoteXPosition.Left);
        }
        return this.endNoteRenderer!.getNoteX(this.endNote, NoteXPosition.Center);
    }
}
