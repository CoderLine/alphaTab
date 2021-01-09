import { Beat } from '@src/model/Beat';
import { Note } from '@src/model/Note';
import { BarRendererBase, NoteYPosition } from '@src/rendering/BarRendererBase';
import { TieGlyph } from '@src/rendering/glyphs/TieGlyph';
import { ScoreBarRenderer } from '@src/rendering/ScoreBarRenderer';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { BeatXPosition } from '../BeatXPosition';

export class ScoreTieGlyph extends TieGlyph {
    protected startNote: Note;
    protected endNote: Note;

    public constructor(startNote: Note, endNote: Note, forEnd: boolean = false) {
        super(!startNote ? null : startNote.beat, !endNote ? null : endNote.beat, forEnd);
        this.startNote = startNote;
        this.endNote = endNote;
    }

    protected shouldDrawBendSlur() {
        return this.renderer.settings.notation.extendBendArrowsOnTiedNotes && !!this.startNote.bendOrigin && this.startNote.isTieOrigin;
    }

    public doLayout(): void {
        super.doLayout();
    }

    protected getBeamDirection(beat: Beat, noteRenderer: BarRendererBase): BeamDirection {
        // invert direction (if stems go up, ties go down to not cross them)
        switch ((noteRenderer as ScoreBarRenderer).getBeatDirection(beat)) {
            case BeamDirection.Up:
                return BeamDirection.Down;
            default:
                return BeamDirection.Up;
        }
    }

    protected getStartY(): number {
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

    protected getEndY(): number {
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

    protected getStartX(): number {
        return this.startNoteRenderer!.getBeatX(this.startNote.beat, BeatXPosition.PostNotes);
    }

    protected getEndX(): number {
        return this.endNoteRenderer!.getBeatX(this.endNote.beat, BeatXPosition.PreNotes);
    }
}
