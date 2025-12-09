import { GraceType } from '@coderline/alphatab/model/GraceType';
import { NoteXPosition, NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import { ScoreTieGlyph } from '@coderline/alphatab/rendering/glyphs/ScoreTieGlyph';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';

/**
 * @internal
 */
export class ScoreSlurGlyph extends ScoreTieGlyph {
    public override getTieHeight(startX: number, _startY: number, endX: number, _endY: number): number {
        return (Math.log2(endX - startX + 1) * this.renderer.settings.notation.slurHeight) / 2;
    }

    protected override calculateStartX(): number {
        return (
            this.renderer.x +
            (this._isStartCentered()
                ? this.renderer!.getBeatX(this.startNote.beat, BeatXPosition.MiddleNotes)
                : this.renderer!.getNoteX(this.startNote, NoteXPosition.Right))
        );
    }

    protected override calculateStartY(): number {
        if (this._isStartCentered()) {
            switch (this.tieDirection) {
                case BeamDirection.Up:
                    return this.renderer.y + this.renderer!.getNoteY(this.startNote, NoteYPosition.Top);
                default:
                    return this.renderer.y + this.renderer!.getNoteY(this.startNote, NoteYPosition.Bottom);
            }
        }

        return this.renderer.y + this.renderer!.getNoteY(this.startNote, NoteYPosition.Center);
    }

    protected override calculateEndX(): number {
        const endNoteRenderer = this.lookupEndBeatRenderer();
        if (!endNoteRenderer) {
            return this.calculateStartX() + this.renderer.smuflMetrics.leftHandTabTieWidth;
        }

        if (this._isEndCentered()) {
            if (this._isEndOnStem()) {
                return endNoteRenderer.x + endNoteRenderer.getBeatX(this.endNote.beat, BeatXPosition.Stem);
            }
            return endNoteRenderer.x + endNoteRenderer.getNoteX(this.endNote, NoteXPosition.Center);
        }
        return endNoteRenderer.x + endNoteRenderer.getBeatX(this.endNote.beat, BeatXPosition.PreNotes);
    }

    protected override caclculateEndY(): number {
        const endNoteRenderer = this.lookupEndBeatRenderer();
        if (!endNoteRenderer) {
            return this.calculateStartY();
        }

        if (this._isEndCentered()) {
            if (this._isEndOnStem()) {
                switch (this.tieDirection) {
                    case BeamDirection.Up:
                        return endNoteRenderer.y + endNoteRenderer.getNoteY(this.endNote, NoteYPosition.TopWithStem);
                    default:
                        return endNoteRenderer.y + endNoteRenderer.getNoteY(this.endNote, NoteYPosition.BottomWithStem);
                }
            }
            switch (this.tieDirection) {
                case BeamDirection.Up:
                    return endNoteRenderer.y + endNoteRenderer.getNoteY(this.endNote, NoteYPosition.Top);
                default:
                    return endNoteRenderer.y + endNoteRenderer.getNoteY(this.endNote, NoteYPosition.Bottom);
            }
        }
        return endNoteRenderer.y + endNoteRenderer.getNoteY(this.endNote, NoteYPosition.Center);
    }

    private _isStartCentered() {
        return (
            (this.startNote === this.startNote.beat.maxNote && this.tieDirection === BeamDirection.Up) ||
            (this.startNote === this.startNote.beat.minNote && this.tieDirection === BeamDirection.Down)
        );
    }
    private _isEndCentered() {
        return (
            this.startNote.beat.graceType === GraceType.None &&
            ((this.endNote === this.endNote.beat.maxNote && this.tieDirection === BeamDirection.Up) ||
                (this.endNote === this.endNote.beat.minNote && this.tieDirection === BeamDirection.Down))
        );
    }

    private _isEndOnStem() {
        const startBeamDirection = this.lookupStartBeatRenderer().getBeatDirection(this.startNote.beat);
        const endBeatRenderer = this.lookupEndBeatRenderer();
        const endBeamDirection = endBeatRenderer
            ? endBeatRenderer.getBeatDirection(this.endNote.beat)
            : startBeamDirection;

        return startBeamDirection !== endBeamDirection && this.startNote.beat!.graceType === GraceType.None;
    }
}
