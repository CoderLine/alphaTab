import { Beat } from '@src/model/Beat';
import { Note } from '@src/model/Note';
import { BarRendererBase, NoteYPosition } from '@src/rendering/BarRendererBase';
import { TieGlyph } from '@src/rendering/glyphs/TieGlyph';
import { ScoreBarRenderer } from '@src/rendering/ScoreBarRenderer';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { BeatXPosition } from '../BeatXPosition';
import { Duration } from '@src/model/Duration';
import { GraceType } from '@src/model/GraceType';

export class ScoreTieGlyph extends TieGlyph {
    protected startNote: Note;
    protected endNote: Note;

    public constructor(startNote: Note, endNote: Note, forEnd: boolean = false) {
        super(!startNote ? null : startNote.beat, !endNote ? null : endNote.beat, forEnd);
        this.startNote = startNote;
        this.endNote = endNote;
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
            return (this.startNoteRenderer as ScoreBarRenderer).getScoreY(9, 0);
        }
        switch (this.tieDirection) {
            case BeamDirection.Up:
                // below lowest note
                return this.startNoteRenderer!.getNoteY(this.startBeat!.maxNote!, NoteYPosition.Top);
            default:
                return this.startNoteRenderer!.getNoteY(this.startBeat!.minNote!, NoteYPosition.Bottom);
        }
    }

    protected getEndY(): number {
        const endNoteScoreRenderer = this.endNoteRenderer as ScoreBarRenderer;
        if (this.endBeat!.isRest) {
            switch (this.tieDirection) {
                case BeamDirection.Up:
                    return endNoteScoreRenderer.getScoreY(9, 0);
                default:
                    return endNoteScoreRenderer.getScoreY(0, 0);
            }
        }

        const startBeamDirection = (this.startNoteRenderer as ScoreBarRenderer).getBeatDirection(this.startBeat!);
        const endBeamDirection = endNoteScoreRenderer.getBeatDirection(this.endBeat!);

        if (startBeamDirection !== endBeamDirection && this.startBeat!.graceType === GraceType.None) {
            if (endBeamDirection === this.tieDirection) {
                switch (this.tieDirection) {
                    case BeamDirection.Up:
                        // stem upper end
                        return endNoteScoreRenderer.getNoteY(this.endBeat!.maxNote!, NoteYPosition.TopWithStem);
                    default:
                        // stem lower end
                        return endNoteScoreRenderer.getNoteY(this.endBeat!.minNote!, NoteYPosition.BottomWithStem);
                }
            } else {
                switch (this.tieDirection) {
                    case BeamDirection.Up:
                        // stem upper end
                        return endNoteScoreRenderer.getNoteY(this.endBeat!.maxNote!, NoteYPosition.BottomWithStem);
                    default:
                        // stem lower end
                        return endNoteScoreRenderer.getNoteY(this.endBeat!.minNote!, NoteYPosition.TopWithStem);
                }
            }
        }

        switch (this.tieDirection) {
            case BeamDirection.Up:
                // below lowest note
                return endNoteScoreRenderer.getNoteY(this.endBeat!.maxNote!, NoteYPosition.Top);
            default:
                // above highest note
                return endNoteScoreRenderer.getNoteY(this.endBeat!.minNote!, NoteYPosition.Bottom);
        }
    }

    protected getStartX(): number {
        return this.startNoteRenderer!.getBeatX(this.startNote.beat, BeatXPosition.MiddleNotes);
    }

    protected getEndX(): number {
        const endBeamDirection = (this.endNoteRenderer as ScoreBarRenderer).getBeatDirection(this.endNote.beat);
        return this.endNoteRenderer!.getBeatX(
            this.endNote.beat,
            this.endNote.beat.duration > Duration.Whole &&
            endBeamDirection === this.tieDirection ? BeatXPosition.Stem : BeatXPosition.MiddleNotes
        );
    }
}
