import { NoteXPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import { NoteTieGlyph } from '@coderline/alphatab/rendering/glyphs/TieGlyph';

/**
 * @internal
 */
export class ScoreTieGlyph extends NoteTieGlyph {
    protected override shouldDrawBendSlur() {
        return (
            this.renderer.settings.notation.extendBendArrowsOnTiedNotes &&
            !!this.startNote.bendOrigin &&
            this.startNote.isTieOrigin
        );
    }

    protected override getStartX(): number {
        if (this.isLeftHandTap) {
            return this.getEndX() - this.renderer.smuflMetrics.leftHandTabTieWidth;
        }
        return this.renderer.x + this.renderer!.getBeatX(this.startNote.beat, BeatXPosition.PostNotes);
    }

    protected override getEndX(): number {
        const endNoteRenderer = this.getEndBeatRenderer();
        if (this.isLeftHandTap) {
            return endNoteRenderer.x + endNoteRenderer.getNoteX(this.endNote, NoteXPosition.Left);
        }
        return endNoteRenderer.x + endNoteRenderer.getBeatX(this.endNote.beat, BeatXPosition.PreNotes);
    }
}
