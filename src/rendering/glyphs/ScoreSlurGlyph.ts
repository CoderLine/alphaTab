import { Note } from '@src/model/Note';
import { ScoreLegatoGlyph } from './ScoreLegatoGlyph';
import { ScoreBarRenderer } from '../ScoreBarRenderer';
import { NoteYPosition, NoteXPosition } from '../BarRendererBase';
import { BeamDirection } from '../utils/BeamDirection';
import { GraceType } from '@src/model/GraceType';
import { BeatXPosition } from '../BeatXPosition';

export class ScoreSlurGlyph extends ScoreLegatoGlyph {
    private _startNote: Note;
    private _endNote: Note;

    public constructor(startNote: Note, endNote: Note, forEnd: boolean = false) {
        super(startNote.beat, endNote.beat, forEnd);
        this._startNote = startNote;
        this._endNote = endNote;
    }

    protected getTieHeight(startX: number, startY: number, endX: number, endY: number): number {
        return Math.log2(endX - startX + 1) * this.renderer.settings.notation.slurHeight;
    }

    protected getStartY(): number {
        if (this.isStartCentered()) {
            switch (this.tieDirection) {
                case BeamDirection.Up:
                    // below lowest note
                    return this.startNoteRenderer!.getNoteY(this._startNote, NoteYPosition.Top);
                default:
                    return this.startNoteRenderer!.getNoteY(this._startNote, NoteYPosition.Bottom);
            }
        }

        return this.startNoteRenderer!.getNoteY(this._startNote, NoteYPosition.Center);
    }

    protected getEndY(): number {
        if (this.isEndCentered()) {
            if (this.isEndOnStem()) {
                switch (this.tieDirection) {
                    case BeamDirection.Up:
                        return this.endNoteRenderer!.getNoteY(this._endNote, NoteYPosition.TopWithStem);
                    default:
                        return this.endNoteRenderer!.getNoteY(this._endNote, NoteYPosition.BottomWithStem);
                }
            } else {
                switch (this.tieDirection) {
                    case BeamDirection.Up:
                        return this.endNoteRenderer!.getNoteY(this._endNote, NoteYPosition.Top);
                    default:
                        return this.endNoteRenderer!.getNoteY(this._endNote, NoteYPosition.Bottom);
                }
            }
        } else {
            return this.endNoteRenderer!.getNoteY(this._endNote, NoteYPosition.Center);
        }
    }

    private isStartCentered() {
        return (
            (this._startNote === this._startNote.beat.maxNote && this.tieDirection === BeamDirection.Up) ||
            (this._startNote === this._startNote.beat.minNote && this.tieDirection === BeamDirection.Down)
        );
    }
    private isEndCentered() {
        return this._startNote.beat.graceType === GraceType.None && (
            (this._endNote === this._endNote.beat.maxNote && this.tieDirection === BeamDirection.Up) ||
            (this._endNote === this._endNote.beat.minNote && this.tieDirection === BeamDirection.Down)
        );
    }

    private isEndOnStem() {
        const endNoteScoreRenderer = this.endNoteRenderer as ScoreBarRenderer;

        const startBeamDirection = (this.startNoteRenderer as ScoreBarRenderer).getBeatDirection(this.startBeat!);
        const endBeamDirection = endNoteScoreRenderer.getBeatDirection(this.endBeat!);

        return startBeamDirection !== endBeamDirection && this.startBeat!.graceType === GraceType.None;
    }

    protected getStartX(): number {
        return this.isStartCentered()
            ? this.startNoteRenderer!.getBeatX(this._startNote.beat, BeatXPosition.MiddleNotes)
            : this.startNoteRenderer!.getNoteX(this._startNote, NoteXPosition.Right);
    }

    protected getEndX(): number {
        if (this.isEndCentered()) {
            if (this.isEndOnStem()) {
                return this.endNoteRenderer!.getBeatX(this._endNote.beat, BeatXPosition.Stem);
            } else {
                return this.endNoteRenderer!.getNoteX(this._endNote, NoteXPosition.Center);
            }
        } else {
            return this.endNoteRenderer!.getBeatX(this._endNote.beat, BeatXPosition.PreNotes);
        }
    }
}
