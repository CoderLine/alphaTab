import { GraceType } from '@coderline/alphatab/model/GraceType';
import { NoteXPosition, NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import { ScoreTieGlyph } from '@coderline/alphatab/rendering/glyphs/ScoreTieGlyph';
import type { ScoreBarRenderer } from '@coderline/alphatab/rendering/ScoreBarRenderer';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';

/**
 * @internal
 */
export class ScoreSlurGlyph extends ScoreTieGlyph {
    protected override getTieHeight(startX: number, _startY: number, endX: number, _endY: number): number {
        return (Math.log2(endX - startX + 1) * this.renderer.settings.notation.slurHeight) / 2;
    }

    protected override getStartX(): number {
        return (
            this.renderer.x +
            (this._isStartCentered()
                ? this.renderer!.getBeatX(this.startNote.beat, BeatXPosition.MiddleNotes)
                : this.renderer!.getNoteX(this.startNote, NoteXPosition.Right))
        );
    }

    protected override getStartY(): number {
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

    protected override getEndX(): number {
        if (this._isEndCentered()) {
            if (this._isEndOnStem()) {
                return this.endNoteRenderer.x + this.endNoteRenderer!.getBeatX(this.endNote.beat, BeatXPosition.Stem);
            }
            return this.endNoteRenderer.x + this.endNoteRenderer!.getNoteX(this.endNote, NoteXPosition.Center);
        }
        return this.endNoteRenderer.x + this.endNoteRenderer!.getBeatX(this.endNote.beat, BeatXPosition.PreNotes);
    }

    protected override getEndY(): number {
        if (this._isEndCentered()) {
            if (this._isEndOnStem()) {
                switch (this.tieDirection) {
                    case BeamDirection.Up:
                        return (
                            this.endNoteRenderer.y +
                            this.endNoteRenderer!.getNoteY(this.endNote, NoteYPosition.TopWithStem)
                        );
                    default:
                        return (
                            this.endNoteRenderer.y +
                            this.endNoteRenderer!.getNoteY(this.endNote, NoteYPosition.BottomWithStem)
                        );
                }
            }
            switch (this.tieDirection) {
                case BeamDirection.Up:
                    return this.endNoteRenderer.y + this.endNoteRenderer!.getNoteY(this.endNote, NoteYPosition.Top);
                default:
                    return this.endNoteRenderer.y + this.endNoteRenderer!.getNoteY(this.endNote, NoteYPosition.Bottom);
            }
        }
        return this.endNoteRenderer.y + this.endNoteRenderer!.getNoteY(this.endNote, NoteYPosition.Center);
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
        const endNoteScoreRenderer = this.endNoteRenderer as ScoreBarRenderer;

        const startBeamDirection = this.renderer.getBeatDirection(this.startNote.beat);
        const endBeamDirection = endNoteScoreRenderer.getBeatDirection(this.endNote.beat);

        return startBeamDirection !== endBeamDirection && this.startNote.beat!.graceType === GraceType.None;
    }
}
