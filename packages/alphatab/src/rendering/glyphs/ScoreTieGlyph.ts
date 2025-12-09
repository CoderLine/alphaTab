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

    protected override calculateStartX(): number {
        if (this.isLeftHandTap) {
            return this.calculateEndX() - this.renderer.smuflMetrics.leftHandTabTieWidth;
        }
        return this.renderer.x + this.renderer!.getBeatX(this.startNote.beat, BeatXPosition.PostNotes);
    }

    protected override calculateEndX(): number {
        const endNoteRenderer = this.lookupEndBeatRenderer();
        if (!endNoteRenderer) {
            return this.calculateStartX() + this.renderer.smuflMetrics.leftHandTabTieWidth;
        }
        if (this.isLeftHandTap) {
            return endNoteRenderer.x + endNoteRenderer.getNoteX(this.endNote, NoteXPosition.Left);
        }
        return endNoteRenderer.x + endNoteRenderer.getBeatX(this.endNote.beat, BeatXPosition.PreNotes);
    }
}
