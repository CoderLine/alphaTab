import { NoteXPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { NoteTieGlyph } from '@coderline/alphatab/rendering/glyphs/TieGlyph';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';

/**
 * @internal
 */
export class SlashTieGlyph extends NoteTieGlyph {
    protected override getTieDirection(): BeamDirection {
        return BeamDirection.Down;
    }

    protected override getStartNotePosition() {
        return NoteXPosition.Right;
    }

    protected override getEndNotePosition(): NoteXPosition {
        return NoteXPosition.Left;
    }
}
