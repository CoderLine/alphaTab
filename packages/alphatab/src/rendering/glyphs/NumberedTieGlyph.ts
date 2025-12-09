import { NoteTieGlyph } from '@coderline/alphatab/rendering/glyphs/TieGlyph';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';

/**
 * @internal
 */
export class NumberedTieGlyph extends NoteTieGlyph {
    protected override shouldDrawBendSlur() {
        return (
            this.renderer.settings.notation.extendBendArrowsOnTiedNotes &&
            !!this.startNote.bendOrigin &&
            this.startNote.isTieOrigin
        );
    }

    protected override calculateTieDirection(): BeamDirection {
        return BeamDirection.Up;
    }
}
