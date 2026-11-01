import type { Note } from '@coderline/alphatab/model/Note';
import { NoteTieGlyph } from '@coderline/alphatab/rendering/glyphs/TieGlyph';
import type { TabBarRenderer } from '@coderline/alphatab/rendering/TabBarRenderer';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';

/**
 * @internal
 */
export class TabTieGlyph extends NoteTieGlyph {
    protected override calculateTieDirection(): BeamDirection {
        if (this.isLeftHandTap) {
            return BeamDirection.Up;
        }
        return TabTieGlyph.getBeamDirectionForString(
            (this.renderer as TabBarRenderer).getDisplayString(this.startNote)
        );
    }

    /**
     * The side of ties and slurs of the note on its model string.
     */
    public static getBeamDirectionForNote(note: Note): BeamDirection {
        return TabTieGlyph.getBeamDirectionForString(note.string);
    }

    /**
     * The side of tab ties and slurs: above the upper three strings, below the lower ones.
     */
    public static getBeamDirectionForString(str: number): BeamDirection {
        return str > 3 ? BeamDirection.Up : BeamDirection.Down;
    }
}
