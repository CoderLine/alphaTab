import type { Note } from '@coderline/alphatab/model/Note';
import { NoteTieGlyph } from '@coderline/alphatab/rendering/glyphs/TieGlyph';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';

/**
 * @internal
 */
export class TabTieGlyph extends NoteTieGlyph {
    protected override calculateTieDirection(): BeamDirection {
        if (this.isLeftHandTap) {
            return BeamDirection.Up;
        }
        return TabTieGlyph.getBeamDirectionForNote(this.startNote);
    }

    protected static getBeamDirectionForNote(note: Note): BeamDirection {
        return note.string > 3 ? BeamDirection.Up : BeamDirection.Down;
    }
}
