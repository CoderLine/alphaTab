import type { Beat } from '@coderline/alphatab/model/Beat';
import type { Note } from '@coderline/alphatab/model/Note';
import { type BarRendererBase, NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import { TieGlyph } from '@coderline/alphatab/rendering/glyphs/TieGlyph';
import type { ScoreBarRenderer } from '@coderline/alphatab/rendering/ScoreBarRenderer';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';

/**
 * @internal
 */
export class ScoreTieGlyph extends TieGlyph {
    protected startNote: Note;
    protected endNote: Note;

    public constructor(startNote: Note, endNote: Note) {
        super(startNote.beat, endNote.beat);
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
        // invert direction (if stems go up, ties go down to not cross them)
        switch ((noteRenderer as ScoreBarRenderer).getBeatDirection(beat)) {
            case BeamDirection.Up:
                return BeamDirection.Down;
            default:
                return BeamDirection.Up;
        }
    }

    protected override getStartY(): number {
        if (this.startBeat!.isRest) {
            // below all lines
            return (this.startNoteRenderer as ScoreBarRenderer).getScoreY(9);
        }
        switch (this.tieDirection) {
            case BeamDirection.Up:
                // below lowest note
                return this.startNoteRenderer!.getNoteY(this.startNote, NoteYPosition.Top);
            default:
                return this.startNoteRenderer!.getNoteY(this.startNote, NoteYPosition.Bottom);
        }
    }

    protected override getEndY(): number {
        const endNoteScoreRenderer = this.endNoteRenderer as ScoreBarRenderer;
        if (this.endBeat!.isRest) {
            switch (this.tieDirection) {
                case BeamDirection.Up:
                    return endNoteScoreRenderer.getScoreY(9);
                default:
                    return endNoteScoreRenderer.getScoreY(0);
            }
        }

        switch (this.tieDirection) {
            case BeamDirection.Up:
                return endNoteScoreRenderer.getNoteY(this.endNote, NoteYPosition.Top);
            default:
                return endNoteScoreRenderer.getNoteY(this.endNote, NoteYPosition.Bottom);
        }
    }

    protected override getStartX(): number {
        return this.startNoteRenderer!.getBeatX(this.startNote.beat, BeatXPosition.PostNotes);
    }

    protected override getEndX(): number {
        return this.endNoteRenderer!.getBeatX(this.endNote.beat, BeatXPosition.PreNotes);
    }
}
